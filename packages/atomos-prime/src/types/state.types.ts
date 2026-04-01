import type { ViewportState } from './viewport-state.types.js';

// Temporary inline types to avoid import issues
export interface SchemaModel {
  readonly id: string;
  readonly name: string;
  readonly entities: any[];
  readonly links: any[];
  readonly canvasStates?: any[];
}

export interface StateModel {
  readonly schemas: Map<string, SchemaModel>;
  readonly active_schema_id: string;
  readonly canvas_viewport: ViewportState;
}

export type StateEvent = 
  | { type: 'entity_moved'; schema_id: string; entity_id: string; x: number; y: number }
  | { type: 'entity_resized'; schema_id: string; entity_id: string; width: number; height: number }
  | { type: 'link_created'; schema_id: string; from_id: string; to_id: string; link_id: string }
  | { type: 'link_removed'; schema_id: string; link_id: string }
  | { type: 'entity_added'; schema_id: string; entity: any }
  | { type: 'entity_removed'; schema_id: string; entity_id: string }
  | { type: 'schema_activated'; schema_id: string }
  | { type: 'viewport_changed'; viewport: ViewportState };

export type StateHandler = (event: StateEvent) => void;
export type StateListener = (state: StateModel) => void;

export interface EventBus {
  readonly subscribe: (handler: StateHandler) => () => void;
  readonly emit: (event: StateEvent) => void;
}