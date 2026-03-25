import type { Signal } from '../../../core/types/signal.types.js';
import type { WorkspaceManager } from '../../../core/types/workspace-manager.types.js';
import type { EntityInstance } from '../../../core/types/entity-instance.types.js';

export interface DemoEntityProps {
  readonly id: string;
  readonly title: string;
  readonly position: Signal<{ x: number; y: number }>;
  readonly dimensions: Signal<{ width: number; height: number }>;
  readonly workspace: WorkspaceManager;
}

export interface DemoEntityResult {
  readonly element: SVGGElement;
  readonly edgeElements: SVGGElement[];
  readonly instance: EntityInstance;
  readonly cleanup: () => void;
}
