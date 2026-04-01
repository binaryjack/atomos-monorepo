import type { StateStore } from '../stores/create-state-store.js';
import type { StateModel } from '../types/state.types.js';

export interface PersistenceService {
  readonly persist: (state: StateModel) => void;
  readonly load: () => StateModel | null;
}

export const createPersistenceService = function(state_store: StateStore): PersistenceService {
  const persist = function(state: StateModel): void {
    try {
      const data = {
        schemas: Array.from(state.schemas.entries()),
        active_schema_id: state.active_schema_id,
        canvas_viewport: state.canvas_viewport
      };
      
      const json = JSON.stringify(data);
      localStorage.setItem('vbe2:new-state', json);
      console.log(`[PERSISTENCE] ✓ State saved (${json.length} chars)`);
    } catch (err) {
      console.error(`[PERSISTENCE] ✗ Failed to save state:`, err);
    }
  };

  const load = function(): StateModel | null {
    try {
      const raw = localStorage.getItem('vbe2:new-state');
      if (!raw) {
        console.log(`[PERSISTENCE] No saved state found`);
        return null;
      }
      
      const data = JSON.parse(raw);
      const state: StateModel = {
        schemas: new Map(data.schemas),
        active_schema_id: data.active_schema_id,
        canvas_viewport: data.canvas_viewport
      };
      
      console.log(`[PERSISTENCE] ✓ State loaded: ${data.schemas.length} schemas, active: ${data.active_schema_id}`);
      return state;
    } catch (err) {
      console.error(`[PERSISTENCE] ✗ Failed to load state:`, err);
      return null;
    }
  };

  // Auto-persist on state changes
  state_store.subscribe(persist);
  console.log(`[PERSISTENCE] Auto-persistence enabled`);

  return { persist, load };
};