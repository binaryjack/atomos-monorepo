import type { StateModel, StateEvent, StateListener, EventBus } from '../types/state.types.js';

export interface StateStore {
  readonly subscribe: (listener: StateListener) => () => void;
  readonly get_state: () => StateModel;
}

export const createStateStore = function(event_bus: EventBus): StateStore {
  let state: StateModel = {
    schemas: new Map(),
    active_schema_id: 'schema-default',
    canvas_viewport: { pan: { x: 0, y: 0 }, zoom: 1 }
  };

  const listeners = new Set<StateListener>();

  const notify = function(): void {
    console.log(`[STATE-STORE] State updated, notifying ${listeners.size} listeners`);
    listeners.forEach(listener => {
      try {
        listener(state);
      } catch (err) {
        console.error(`[STATE-STORE] Listener failed:`, err);
      }
    });
  };

  const handle_event = function(event: StateEvent): void {
    console.log(`[STATE-STORE] Handling event:`, event.type);
    
    switch (event.type) {
      case 'entity_moved': {
        const schema = state.schemas.get(event.schema_id);
        if (!schema) {
          console.warn(`[STATE-STORE] Schema ${event.schema_id} not found for entity_moved`);
          return;
        }
        
        const entities = schema.entities.map((e: any) =>
          e.id === event.entity_id
            ? { ...e, position: { x: event.x, y: event.y } }
            : e
        );
        
        const updated_schema = { ...schema, entities };
        const new_schemas = new Map(state.schemas);
        new_schemas.set(event.schema_id, updated_schema);
        
        state = { ...state, schemas: new_schemas };
        console.log(`[STATE-STORE] Entity ${event.entity_id} moved to (${event.x}, ${event.y})`);
        break;
      }
      
      case 'entity_resized': {
        const schema = state.schemas.get(event.schema_id);
        if (!schema) {
          console.warn(`[STATE-STORE] Schema ${event.schema_id} not found for entity_resized`);
          return;
        }
        
        const entities = schema.entities.map((e: any) =>
          e.id === event.entity_id
            ? { ...e, dimensions: { width: event.width, height: event.height } }
            : e
        );
        
        const updated_schema = { ...schema, entities };
        const new_schemas = new Map(state.schemas);
        new_schemas.set(event.schema_id, updated_schema);
        
        state = { ...state, schemas: new_schemas };
        console.log(`[STATE-STORE] Entity ${event.entity_id} resized to ${event.width}x${event.height}`);
        break;
      }
      
      case 'link_created': {
        const schema = state.schemas.get(event.schema_id);
        if (!schema) {
          console.warn(`[STATE-STORE] Schema ${event.schema_id} not found for link_created`);
          return;
        }
        
        const links = [...schema.links, {
          id: event.link_id,
          leftEntityId: event.from_id,
          rightEntityId: event.to_id,
          leftAnchorId: 'default',
          rightAnchorId: 'default',
          leftCardinality: '1',
          rightCardinality: '1',
          renderType: 'linear' as const
        }];
        
        const updated_schema = { ...schema, links };
        const new_schemas = new Map(state.schemas);
        new_schemas.set(event.schema_id, updated_schema);
        
        state = { ...state, schemas: new_schemas };
        console.log(`[STATE-STORE] Link ${event.link_id} created: ${event.from_id} -> ${event.to_id}`);
        break;
      }
      
      case 'link_removed': {
        const schema = state.schemas.get(event.schema_id);
        if (!schema) {
          console.warn(`[STATE-STORE] Schema ${event.schema_id} not found for link_removed`);
          return;
        }
        
        const links = schema.links.filter((link: any) => link.id !== event.link_id);
        const updated_schema = { ...schema, links };
        const new_schemas = new Map(state.schemas);
        new_schemas.set(event.schema_id, updated_schema);
        
        state = { ...state, schemas: new_schemas };
        console.log(`[STATE-STORE] Link ${event.link_id} removed`);
        break;
      }
      
      case 'entity_added': {
        const schema = state.schemas.get(event.schema_id);
        if (!schema) {
          console.warn(`[STATE-STORE] Schema ${event.schema_id} not found for entity_added`);
          return;
        }
        
        const entities = [...schema.entities, event.entity];
        const updated_schema = { ...schema, entities };
        const new_schemas = new Map(state.schemas);
        new_schemas.set(event.schema_id, updated_schema);
        
        state = { ...state, schemas: new_schemas };
        console.log(`[STATE-STORE] Entity ${event.entity.id} added to schema ${event.schema_id}`);
        break;
      }
      
      case 'entity_removed': {
        const schema = state.schemas.get(event.schema_id);
        if (!schema) {
          console.warn(`[STATE-STORE] Schema ${event.schema_id} not found for entity_removed`);
          return;
        }
        
        const entities = schema.entities.filter((e: any) => e.id !== event.entity_id);
        const links = schema.links.filter((l: any) => 
          l.leftEntityId !== event.entity_id && l.rightEntityId !== event.entity_id
        );
        
        const updated_schema = { ...schema, entities, links };
        const new_schemas = new Map(state.schemas);
        new_schemas.set(event.schema_id, updated_schema);
        
        state = { ...state, schemas: new_schemas };
        console.log(`[STATE-STORE] Entity ${event.entity_id} removed from schema ${event.schema_id}`);
        break;
      }
      
      case 'schema_activated': {
        state = { ...state, active_schema_id: event.schema_id };
        console.log(`[STATE-STORE] Schema ${event.schema_id} activated`);
        break;
      }
      
      case 'viewport_changed': {
        state = { ...state, canvas_viewport: event.viewport };
        console.log(`[STATE-STORE] Viewport changed: pan(${event.viewport.pan.x}, ${event.viewport.pan.y}) zoom(${event.viewport.zoom})`);
        break;
      }
      
      default:
        console.warn(`[STATE-STORE] Unknown event type:`, (event as any).type);
        return;
    }
    
    notify();
  };

  // Subscribe to events
  event_bus.subscribe(handle_event);

  const subscribe = function(listener: StateListener): () => void {
    listeners.add(listener);
    console.log(`[STATE-STORE] Listener added. Total: ${listeners.size}`);
    return () => {
      listeners.delete(listener);
      console.log(`[STATE-STORE] Listener removed. Total: ${listeners.size}`);
    };
  };

  const get_state = function(): StateModel {
    return state;
  };

  return { subscribe, get_state };
};