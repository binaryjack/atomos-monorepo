import { createSignal } from '../../core/create-signal.js';
import { createDemoEntity } from './create-demo-entity.js';
import type { WorkspaceManager } from '../../core/types/workspace-manager.types.js';
import type { EntityInstance } from '../../core/types/entity-instance.types.js';
import type { EntitySpawnFactory } from '../../core/types/entity-spawn-factory.types.js';
import { ENTITY_DEFAULT_WIDTH, ENTITY_DEFAULT_HEIGHT } from '../../core/entity-defaults.js';

interface DemoConfig {
  readonly id: string;
  readonly title: string;
  readonly x: number;
  readonly y: number;
}

const spawnDemoEntity = (
  id: string,
  position: { x: number; y: number },
  workspace: WorkspaceManager,
  title = 'New Entity'
): EntityInstance => {
  const posSignal  = createSignal(position);
  const dimsSignal = createSignal({ width: ENTITY_DEFAULT_WIDTH, height: ENTITY_DEFAULT_HEIGHT });
  const entity = createDemoEntity({ id, title, position: posSignal, dimensions: dimsSignal, workspace });
  entity.edgeElements.forEach(el => workspace.appendToCanvas(el));
  return entity.instance;
};

export const createInteractiveEntityDemo = function(workspace: WorkspaceManager) {
  // Register the spawn factory so workspace can auto-create entities on link-drop
  const factory: EntitySpawnFactory = (id, pos, ws) => spawnDemoEntity(id, pos, ws);
  workspace.setEntitySpawnFactory(factory);

  const configs: DemoConfig[] = [
    { id: 'entity-a', title: 'Data Source', x: 120,  y: 180 },
    { id: 'entity-b', title: 'Processor',   x: 520,  y: 180 },
    { id: 'entity-c', title: 'Output',      x: 320,  y: 420 },
  ];

  configs.forEach(cfg => {
    const posSignal  = createSignal({ x: cfg.x, y: cfg.y });
    const dimsSignal = createSignal({ width: ENTITY_DEFAULT_WIDTH, height: ENTITY_DEFAULT_HEIGHT });
    const entity = createDemoEntity({
      id:         cfg.id,
      title:      cfg.title,
      position:   posSignal,
      dimensions: dimsSignal,
      workspace,
    });
    workspace.registerEntity(entity.instance);
    entity.edgeElements.forEach(el => workspace.appendToCanvas(el));
  });
};
