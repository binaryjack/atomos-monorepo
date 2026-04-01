import type { Command } from '../types/command.types.js';
import type { EventBus } from '../types/state.types.js';

export const createMoveEntityCommand = function(
  event_bus: EventBus,
  schema_id: string,
  entity_id: string,
  old_x: number,
  old_y: number,
  new_x: number,
  new_y: number
): Command {
  
  const execute = function(): void {
    event_bus.emit({
      type: 'entity_moved',
      schema_id,
      entity_id,
      x: new_x,
      y: new_y
    });
  };

  const undo = function(): void {
    event_bus.emit({
      type: 'entity_moved',
      schema_id,
      entity_id,
      x: old_x,
      y: old_y
    });
  };

  return { 
    execute, 
    undo, 
    description: `Move entity ${entity_id} to (${new_x}, ${new_y})` 
  };
};