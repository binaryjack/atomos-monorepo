import type { LinkManager } from './types/link-manager.types.js';
import type { InteractiveBehaviorManager } from './types/interactive-behavior-manager.types.js';
import type { EdgePosition } from '../features/edge/types/edge-position.types.js';

export interface LinkDrawController {
  readonly startLinkFromAnchor: (
    anchorId: string,
    anchorPos: { x: number; y: number },
    entityId: string,
    srcEdge: EdgePosition,
    event: MouseEvent
  ) => void;
  readonly clearTempLink: () => void;
  readonly updateTempLink: (svgCoords: { x: number; y: number }) => void;
  readonly isDrawing: () => boolean;
  readonly getActiveTempLinkId: () => string | undefined;
  readonly getActiveTempLinkSourcePos: () => { x: number; y: number } | undefined;
  readonly getActiveTempSrcAnchorId: () => string | undefined;
  readonly getActiveTempSrcEntityId: () => string | undefined;
  readonly getActiveTempSrcEdge: () => EdgePosition | undefined;
}

export const createLinkDrawController = function(
  linkManager: LinkManager,
  behaviorManager: InteractiveBehaviorManager,
  contentRoot: SVGElement
): LinkDrawController {
  let activeTempLinkId: string | undefined;
  let activeTempLinkSourcePos: { x: number; y: number } | undefined;
  let activeTempSrcAnchorId: string | undefined;
  let activeTempSrcEntityId: string | undefined;
  let activeTempSrcEdge: EdgePosition | undefined;

  const clearTempLink = (): void => {
    if (activeTempLinkId !== undefined) {
      linkManager.removeLink(activeTempLinkId);
      activeTempLinkId = undefined;
      activeTempLinkSourcePos = undefined;
      activeTempSrcAnchorId = undefined;
      activeTempSrcEntityId = undefined;
      activeTempSrcEdge = undefined;
    }
  };

  const startLinkFromAnchor = (
    anchorId: string,
    anchorPos: { x: number; y: number },
    entityId: string,
    srcEdge: EdgePosition,
    event: MouseEvent
  ): void => {
    clearTempLink();
    behaviorManager.startLinkCreation({ entityId, anchorId, position: anchorPos, event });

    const tempId = `temp-${Date.now()}`;
    const tempLink = linkManager.createLink({
      id: tempId,
      sourceAnchorId: anchorId,
      sourcePosition: anchorPos,
      targetPosition: anchorPos,
      sourceEdge: srcEdge,
      temporary: true,
      animated: true,
      strokeColor: '#3b82f6'
    });

    contentRoot.appendChild(tempLink.element);
    activeTempLinkId = tempId;
    activeTempLinkSourcePos = anchorPos;
    activeTempSrcAnchorId = anchorId;
    activeTempSrcEntityId = entityId;
    activeTempSrcEdge = srcEdge;
  };

  const updateTempLink = (svgCoords: { x: number; y: number }): void => {
    if (!activeTempLinkId || !activeTempLinkSourcePos) return;
    const tempLink = linkManager.getLink(activeTempLinkId);
    if (tempLink) tempLink.updatePath(activeTempLinkSourcePos, svgCoords, activeTempSrcEdge);
  };

  const isDrawing = (): boolean =>
    behaviorManager.behaviorState.value.linkCreation === 'drawing';

  return {
    startLinkFromAnchor,
    clearTempLink,
    updateTempLink,
    isDrawing,
    getActiveTempLinkId: () => activeTempLinkId,
    getActiveTempLinkSourcePos: () => activeTempLinkSourcePos,
    getActiveTempSrcAnchorId: () => activeTempSrcAnchorId,
    getActiveTempSrcEntityId: () => activeTempSrcEntityId,
    getActiveTempSrcEdge: () => activeTempSrcEdge,
  };
};
