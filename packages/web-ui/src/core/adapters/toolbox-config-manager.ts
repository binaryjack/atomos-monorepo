import type { ToolboxConfiguration } from '../../types/toolbox.types.js';
import { defaultToolboxConfig } from '../default-toolbox.config.js';

let currentConfig: ToolboxConfiguration = defaultToolboxConfig;

export const setToolboxConfig = function(config: ToolboxConfiguration): void {
  currentConfig = config;
};

export const getToolboxConfig = function(): ToolboxConfiguration {
  return currentConfig;
};
