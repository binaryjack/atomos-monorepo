import type { ButtonProps, ButtonResult } from './types/button.types';
export type { ButtonProps, ButtonResult };

export const createButton = function(props: ButtonProps): ButtonResult {
  const element = document.createElement('button');
  const listeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];
  const cleanupFunctions: Array<() => void> = [];
  
  if (props.id) element.id = props.id;
  
  // Build CSS classes
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };
  
  element.className = `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${props.className || ''}`;
  
  // Handle children (string or signal)
  if (typeof props.children === 'string') {
    element.textContent = props.children;
  } else {
    element.textContent = props.children.value;
    const unsubscribe = props.children.subscribe((newText) => {
      element.textContent = newText;
    });
    cleanupFunctions.push(unsubscribe);
  }
  
  // Handle disabled (boolean or signal)
  if (typeof props.disabled === 'boolean') {
    element.disabled = props.disabled;
  } else if (props.disabled) {
    element.disabled = props.disabled.value;
    const unsubscribe = props.disabled.subscribe((newDisabled) => {
      element.disabled = newDisabled;
    });
    cleanupFunctions.push(unsubscribe);
  }
  
  // Click handler
  if (props.onClick) {
    element.addEventListener('click', props.onClick);
    listeners.push({ target: element, type: 'click', listener: props.onClick });
  }
  
  return {
    element,
    cleanup: {
      destroy: () => {
        listeners.forEach(({ target, type, listener }) => {
          target.removeEventListener(type, listener);
        });
        cleanupFunctions.forEach(fn => fn());
        listeners.length = 0;
        cleanupFunctions.length = 0;
      }
    }
  };
};