export * from './core/neura-store.js';
export * from './renderer/webgl-engine.js';
export * from './renderer/culling-system.js';
export * from './create-neura-instance.js';

// Worker would typically be instantiated differently depending on the bundler (Vite, Webpack),
// but we export the path or a factory function here for convenience.
export function createNeuraPhysicsWorker(): Worker {
  return new Worker(new URL('./physics/worker.ts', import.meta.url), { type: 'module' });
}
