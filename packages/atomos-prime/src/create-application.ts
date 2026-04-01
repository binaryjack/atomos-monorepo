import { createEventBus } from './core/create-event-bus.js';
import { createCommandBus } from './core/create-command-bus.js';
import { createStateStore } from './stores/create-state-store.js';
import { createPersistenceService } from './services/create-persistence-service.js';
import { createMoveEntityCommand } from './commands/create-move-entity-command.js';
import { createLinkCommand } from './commands/create-link-command.js';

export interface Application {
  readonly event_bus: ReturnType<typeof createEventBus>;
  readonly command_bus: ReturnType<typeof createCommandBus>;
  readonly state_store: ReturnType<typeof createStateStore>;
  readonly persistence_service: ReturnType<typeof createPersistenceService>;
  readonly move_entity: (schema_id: string, entity_id: string, old_x: number, old_y: number, new_x: number, new_y: number) => void;
  readonly create_link: (schema_id: string, from_id: string, to_id: string) => void;
  readonly load_state: () => void;
}

export const createApplication = function(): Application {
  console.log('[APPLICATION] Initializing new architecture...');
  
  const event_bus = createEventBus();
  const command_bus = createCommandBus();
  const state_store = createStateStore(event_bus);
  const persistence_service = createPersistenceService(state_store);

  const move_entity = function(
    schema_id: string, 
    entity_id: string, 
    old_x: number, 
    old_y: number, 
    new_x: number, 
    new_y: number
  ): void {
    const command = createMoveEntityCommand(event_bus, schema_id, entity_id, old_x, old_y, new_x, new_y);
    command_bus.dispatch(command);
  };

  const create_link = function(schema_id: string, from_id: string, to_id: string): void {
    const command = createLinkCommand(event_bus, schema_id, from_id, to_id);
    command_bus.dispatch(command);
  };

  const load_state = function(): void {
    const saved_state = persistence_service.load();
    if (saved_state) {
      console.log('[APPLICATION] Loading saved state...');
      
      // Restore schemas by emitting events
      for (const [schema_id, schema] of saved_state.schemas) {
        // Add entities
        schema.entities?.forEach((entity: any) => {
          event_bus.emit({ 
            type: 'entity_added', 
            schema_id, 
            entity 
          });
        });
        
        // Add links  
        schema.links?.forEach((link: any) => {
          event_bus.emit({
            type: 'link_created',
            schema_id,
            from_id: link.leftEntityId,
            to_id: link.rightEntityId,
            link_id: link.id
          });
        });
      }
      
      // Restore active schema
      event_bus.emit({ 
        type: 'schema_activated', 
        schema_id: saved_state.active_schema_id 
      });
      
      // Restore viewport
      event_bus.emit({ 
        type: 'viewport_changed', 
        viewport: saved_state.canvas_viewport 
      });
      
      console.log('[APPLICATION] ✓ State restoration complete');
    } else {
      console.log('[APPLICATION] No saved state to restore - using defaults');
    }
  };

  console.log('[APPLICATION] ✓ New architecture initialized');

  return {
    event_bus,
    command_bus,
    state_store,
    persistence_service,
    move_entity,
    create_link,
    load_state
  };
};