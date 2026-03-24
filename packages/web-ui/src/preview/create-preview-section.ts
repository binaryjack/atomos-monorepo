import type { PreviewSectionProps, PreviewSectionResult } from './types/preview.types.js';
import { createTypography } from '../features/typography/create-typography.js';

export const createPreviewSection = function(props: PreviewSectionProps): PreviewSectionResult {
  const section = document.createElement('section');
  const cleanupFunctions: Array<() => void> = [];
  
  section.className = `mb-12 ${props.className || ''}`;
  
  // Section title
  const title = createTypography({
    variant: 'h2',
    children: props.title,
    className: 'text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100'
  });
  section.appendChild(title.element);
  cleanupFunctions.push(title.cleanup.destroy);
  
  // Grid container for components
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  
  // Add children
  props.children.forEach(child => {
    const wrapper = document.createElement('div');
    wrapper.className = 'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm';
    wrapper.appendChild(child);
    grid.appendChild(wrapper);
  });
  
  section.appendChild(grid);
  
  return {
    element: section,
    cleanup: {
      destroy: () => {
        cleanupFunctions.forEach(fn => fn());
        cleanupFunctions.length = 0;
      }
    }
  };
};