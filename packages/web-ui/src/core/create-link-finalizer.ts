import type { Signal } from './types/signal.types.js';
import type { WorkspaceState } from './types/workspace-state.types.js';
import type { LinkManager } from './types/link-manager.types.js';
import type { EdgePosition } from '../features/edge/types/edge-position.types.js';

export interface LinkFinalizer {
  readonly finalizeLinkToAnchor: (
    dstAnchorId: string,
    dstAnchorPos: { x: number; y: number },
    dstEntityId: string,
    dstEdge: EdgePosition,
    srcAnchorId: string,
    srcEntityId: string,
    srcEdge: EdgePosition,
    srcPos: { x: number; y: number }
  ) => void;
  readonly cleanup: {
    readonly destroy: () => void;
  };
}

const computeAnchorWorldPos = (
  workspaceState: Signal<WorkspaceState>,
  entityId: string,
  edge: EdgePosition
): { x: number; y: number } => {
  const entity = workspaceState.value.entities.get(entityId);
  if (!entity) return { x: 0, y: 0 };
  const { x, y } = entity.position.value;
  const { width, height } = entity.dimensions.value;
  switch (edge) {
    case 'top':    return { x: x + width / 2, y };
    case 'bottom': return { x: x + width / 2, y: y + height };
    case 'left':   return { x,                y: y + height / 2 };
    case 'right':  return { x: x + width,     y: y + height / 2 };
  }
};

export { computeAnchorWorldPos };

export const createLinkFinalizer = function(
  linkManager: LinkManager,
  workspaceState: Signal<WorkspaceState>,
  contentRoot: SVGElement
): LinkFinalizer {
  const linkSubscriptions = new Map<string, Array<() => void>>();

  const finalizeLinkToAnchor = (
    dstAnchorId: string,
    dstAnchorPos: { x: number; y: number },
    dstEntityId: string,
    dstEdge: EdgePosition,
    srcAnchorId: string,
    srcEntityId: string,
    srcEdge: EdgePosition,
    srcPos: { x: number; y: number }
  ): void => {
    const linkId = `link-${srcAnchorId}-${dstAnchorId}-${Date.now()}`;
    const permanentLink = linkManager.createLink({
      id: linkId,
      sourceAnchorId: srcAnchorId,
      targetAnchorId: dstAnchorId,
      sourcePosition: srcPos,
      targetPosition: dstAnchorPos,
      sourceEdge: srcEdge,
      targetEdge: dstEdge,
      strokeColor: '#3b82f6',
      strokeWidth: 2
    });

    contentRoot.appendChild(permanentLink.element);

    const srcEntity = workspaceState.value.entities.get(srcEntityId);
    const dstEntity = workspaceState.value.entities.get(dstEntityId);
    if (srcEntity && dstEntity) {
      const recompute = () => {
        permanentLink.updatePath(
          computeAnchorWorldPos(workspaceState, srcEntityId, srcEdge),
          computeAnchorWorldPos(workspaceState, dstEntityId, dstEdge),
          srcEdge,
          dstEdge
        );
      };
      linkSubscriptions.set(linkId, [
        srcEntity.position.subscribe(recompute),
        srcEntity.dimensions.subscribe(recompute),
        dstEntity.position.subscribe(recompute),
        dstEntity.dimensions.subscribe(recompute),
      ]);
    }

    workspaceState.value.entities.get(srcEntityId)
      ?.notifyAnchorConnected?.(srcAnchorId, linkId);
    workspaceState.value.entities.get(dstEntityId)
      ?.notifyAnchorConnected?.(dstAnchorId, linkId);
  };

  return {
    finalizeLinkToAnchor,
    cleanup: {
      destroy: () => {
        linkSubscriptions.forEach(unsubs => unsubs.forEach(fn => fn()));
        linkSubscriptions.clear();
      }
    }
  };
};
