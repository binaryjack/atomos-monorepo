import type { EventBus, StateHandler, StateEvent } from '../types/state.types.js';

export const createEventBus = function(): EventBus {
  const handlers = new Set<StateHandler>();

  const subscribe = function(handler: StateHandler): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  };

  const emit = function(event: StateEvent): void {
    console.log(`[EVENT-BUS] Emitting:`, event);
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (err) {
        console.error(`[EVENT-BUS] Handler failed for event ${event.type}:`, err);
      }
    });
  };

  return { subscribe, emit };
};