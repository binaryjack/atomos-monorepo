import type { SettingsProps } from './types/settings.types';

export const settings = function(this: SettingsProps, props: SettingsProps) {
  Object.defineProperty(this, 'theme', { 
    value: props.theme, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'gridSize', { 
    value: props.gridSize, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'snapToGrid', { 
    value: props.snapToGrid, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'showGrid', { 
    value: props.showGrid, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'autoSave', { 
    value: props.autoSave, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'autoSaveInterval', { 
    value: props.autoSaveInterval, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'defaultEntityWidth', { 
    value: props.defaultEntityWidth, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'defaultEntityHeight', { 
    value: props.defaultEntityHeight, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'defaultLinkType', { 
    value: props.defaultLinkType, 
    enumerable: false, 
    writable: true 
  });
  
  return this;
};