import type { Command } from '../types/command.types.js';
import type { EventBus } from '../types/state.types.js';

export const createLinkCommand = function(
  event_bus: EventBus,
  schema_id: string,
  from_id: string,
  to_id: string
): Command {
  
  const link_id = `link-${from_id}-${to_id}-${Date.now()}`;

  const execute = function(): void {
    event_bus.emit({
      type: 'link_created',
      schema_id,
      from_id,
      to_id,
      link_id
    });
  };

  const undo = function(): void {
    event_bus.emit({
      type: 'link_removed',
      schema_id,
      link_id
    });
  };

  return { 
    execute, 
    undo, 
    description: `Create link ${from_id} -> ${to_id}` 
  };
};