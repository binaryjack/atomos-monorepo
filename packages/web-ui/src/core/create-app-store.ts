import type { Signal } from './types/signal.types.js';
import type { AppState } from './types/app-state.types.js';
import type { SchemaModel } from './types/schema-model.types.js';
import type { GlobalConfig } from './types/global-config.types.js';
import { registry } from './create-signal-registry.js';
import { APP_KEY, SCHEMAS_KEY } from './registry-keys.js';
import { DEFAULT_GLOBAL_CONFIG } from './types/global-config.types.js';
import { createLocalStoragePersistence, readLocalStorage } from './create-local-storage-persistence.js';
import { createSchemaStore } from './create-schema-store.js';
import { createGlobalStore } from './create-global-store.js';

const LS_SCHEMAS = 'vbe2:schemas';
const LS_APP     = 'vbe2:app';

// Module-level dedup: prevents double-subscribing across createAppStore() calls.
const _schemaSubs = new Map<string, () => void>(); // key: schemaId
let _appStoreInstance: AppStore | undefined; // Singleton instance

/** TESTING ONLY: Clear module-level caches */
export const __clearAppStoreCaches = (): void => {
  _schemaSubs.forEach(unsub => unsub());
  _schemaSubs.clear();
  if (_appStoreInstance) {
    _appStoreInstance.cleanup.destroy();
    _appStoreInstance = undefined;
  }
};

export interface AppStore {
  readonly appSignal: Signal<AppState>;
  readonly schemasSignal: Signal<SchemaModel[]>;
  readonly globalStore: ReturnType<typeof createGlobalStore>;
  readonly setActiveSchema: (schemaId: string) => void;
  readonly addSchema: (schema: SchemaModel) => void;
  readonly getSchemaStore: (schemaId: string) => ReturnType<typeof createSchemaStore> | undefined;
  readonly cleanup: { destroy: () => void };
}

const makeDefaultSchema = (): SchemaModel => ({
  id: 'schema-default',
  name: 'Default Schema',
  entities: [],
  links: [],
  canvasStates: [],
});

export const createAppStore = function(): AppStore {
  // Return singleton instance if already created
  if (_appStoreInstance) {
    console.log('[app-store] Returning existing singleton instance');
    return _appStoreInstance;
  }

  console.log('[app-store] Creating NEW singleton instance');
  
  // IMMEDIATE localStorage debug - this should ALWAYS show
  console.log('[CRITICAL-DEBUG] Raw localStorage check:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('vbe2:')) {
      console.log(`  ${key} = ${localStorage.getItem(key)?.substring(0, 100)}...`);
    }
  }
  
  const globalStore = createGlobalStore();

  // Debug localStorage contents
  console.log('[LOAD-DEBUG] localStorage contents:');
  console.log('  vbe2:schemas =', localStorage.getItem('vbe2:schemas'));
  console.log('  vbe2:app =', localStorage.getItem('vbe2:app'));
  console.log('  vbe2:global =', localStorage.getItem('vbe2:global'));

  const savedSchemas = readLocalStorage<SchemaModel[]>(LS_SCHEMAS) ?? [makeDefaultSchema()];
  const savedApp     = readLocalStorage<{ activeSchemaId?: string }>(LS_APP);

  console.log('[LOAD-DEBUG] Parsed localStorage data:');
  console.log('  savedSchemas =', savedSchemas);
  console.log('  savedApp =', savedApp);

  const schemasSignal = registry.getOrCreate<SchemaModel[]>(SCHEMAS_KEY, savedSchemas);
  console.log('[LOAD-DEBUG] Schemas signal value after creation:', schemasSignal.value);

  const initial: AppState = {
    activeSchemaId: savedApp?.activeSchemaId ?? savedSchemas[0]?.id,
    schemas: schemasSignal.value,
    global: globalStore.signal.value,
  };

  console.log('[LOAD-DEBUG] Initial app state:', initial);

  const appSignal = registry.getOrCreate<AppState>(APP_KEY, initial);

  // Subscribe a schema signal → schemasSignal (idempotent via _schemaSubs).
  const subscribeSchema = (s: SchemaModel): void => {
    if (_schemaSubs.has(s.id)) {
      console.log(`[app-store] SKIPPING schema ${s.id} - already subscribed`);
      return;
    }
    console.log(`[app-store] SUBSCRIBING schema ${s.id}, entities:`, s.entities.map(e => e.id));
    const store = createSchemaStore(s);
    const unsub = store.signal.subscribe((updated: SchemaModel) => {
      console.log(`[app-store] Schema ${updated.id} changed, syncing to schemasSignal`);
      schemasSignal.set(schemasSignal.value.map(sc => sc.id === updated.id ? updated : sc));
    });
    _schemaSubs.set(s.id, unsub);
  };

  // Hydrate schema stores and wire up subscriptions.
  savedSchemas.forEach(subscribeSchema);

  const sync = (): void => {
    appSignal.set({
      ...appSignal.value,
      schemas: schemasSignal.value,
      global: globalStore.signal.value,
    });
  };

  const unsubSchemas = schemasSignal.subscribe(sync);
  const unsubGlobal  = globalStore.signal.subscribe(sync);

  const schemasPersist = createLocalStoragePersistence(LS_SCHEMAS, schemasSignal);
  const appPersist     = createLocalStoragePersistence(LS_APP, appSignal);

  const setActiveSchema = (schemaId: string): void => {
    appSignal.set({ ...appSignal.value, activeSchemaId: schemaId });
  };

  const addSchema = (schema: SchemaModel): void => {
    subscribeSchema(schema);
    schemasSignal.set([...schemasSignal.value, schema]);
  };

  const getSchemaStore = (schemaId: string): ReturnType<typeof createSchemaStore> | undefined => {
    const schema = schemasSignal.value.find(s => s.id === schemaId);
    return schema ? createSchemaStore(schema) : undefined;
  };

  _appStoreInstance = {
    appSignal,
    schemasSignal,
    globalStore,
    setActiveSchema,
    addSchema,
    getSchemaStore,
    cleanup: {
      destroy: () => {
        unsubSchemas();
        unsubGlobal();
        schemasPersist.destroy();
        appPersist.destroy();
        globalStore.cleanup.destroy();
        
        // Clean up all schema store subscriptions
        _schemaSubs.forEach((unsub, schemaId) => {
          unsub();
          const schema = schemasSignal.value.find(s => s.id === schemaId);
          if (schema) {
            const schemaStore = createSchemaStore(schema);
            schemaStore.cleanup();
          }
        });
        _schemaSubs.clear();
        
        _appStoreInstance = undefined; // Clear singleton on cleanup
      }
    }
  };

  return _appStoreInstance;
};
