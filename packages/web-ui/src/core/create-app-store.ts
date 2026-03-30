// DEPRECATED: This file is replaced by clean architecture
// All functions return safe fallbacks to prevent runtime errors

import { createSignal } from './create-signal.js';
import type { AppState } from './types/app-state.types.js';
import { DEFAULT_GLOBAL_CONFIG } from './types/global-config.types.js';
import type { SchemaModel } from './types/schema-model.types.js';
import type { Signal } from './types/signal.types.js';

// Safe fallback interfaces - prevent runtime errors
let _deprecatedAppStore: AppStore | undefined;

export interface AppStore {
  readonly appSignal: Signal<AppState>;
  readonly schemasSignal: Signal<SchemaModel[]>;
  readonly globalStore: any; // Deprecated
  readonly setActiveSchema: (schemaId: string) => void;
  readonly addSchema: (schema: SchemaModel) => void;
  readonly getSchemaStore: (schemaId: string) => any;
  readonly cleanup: { destroy: () => void };
}

// Deprecated function - returns safe fallbacks
export const createAppStore = function(): AppStore {
  console.warn('[DEPRECATED] createAppStore is replaced by clean architecture - returning safe fallbacks');
  
  if (_deprecatedAppStore) {
    return _deprecatedAppStore;
  }

  const appSignal = createSignal<AppState>({
    activeSchemaId: undefined,
    schemas: [],
    global: DEFAULT_GLOBAL_CONFIG
  });

  const schemasSignal = createSignal<SchemaModel[]>([]);

  _deprecatedAppStore = {
    appSignal,
    schemasSignal,
    globalStore: { signal: createSignal({}), cleanup: { destroy: () => {} } },
    setActiveSchema: () => console.warn('[DEPRECATED] setActiveSchema - use clean architecture'),
    addSchema: () => console.warn('[DEPRECATED] addSchema - use clean architecture'),
    getSchemaStore: () => null,
    cleanup: { destroy: () => {} }
  };

  return _deprecatedAppStore;
};

// Testing cleanup function
export const __clearAppStoreCaches = (): void => {
  console.warn('[DEPRECATED] __clearAppStoreCaches - clean architecture handles this');
  _deprecatedAppStore = undefined;
};
