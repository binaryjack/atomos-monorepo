import type { EntityProps, LinkProps, SettingsProps } from '@vbs/vbs-mod';

export interface SchemaBuilderState {
  readonly entities: Map<string, EntityProps>;
  readonly links: Map<string, LinkProps>;
  readonly selectedEntityId: string | undefined;
  readonly settings: SettingsProps;
}

export const createSchemaBuilderState = function(): SchemaBuilderState {
  return {
    entities: new Map<string, EntityProps>(),
    links: new Map<string, LinkProps>(),
    selectedEntityId: undefined,
    settings: {
      theme: 'light',
      gridSize: 16,
      snapToGrid: true,
      showGrid: true,
      autoSave: true,
      autoSaveInterval: 30000,
      defaultEntityWidth: 200,
      defaultEntityHeight: 100,
      defaultLinkType: 'orthogonal'
    }
  };
};