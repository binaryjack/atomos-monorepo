import type { DropdownProps, DropdownResult, DropdownOption } from './types/dropdown.types';
export type { DropdownProps, DropdownResult, DropdownOption };

export const createDropdown = function(props: DropdownProps): DropdownResult {
  const container = document.createElement('div');
  const select = document.createElement('select');
  const listeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];
  const cleanupFunctions: Array<() => void> = [];
  
  if (props.id) select.id = props.id;
  if (props.name) select.name = props.name;
  
  // Build CSS classes
  const baseClasses = 'w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';
  select.className = baseClasses;
  container.className = `relative ${props.className || ''}`;
  
  // Render options
  const renderOptions = (options: DropdownOption[]) => {
    select.innerHTML = '';
    
    // Add placeholder if provided
    if (props.placeholder) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = typeof props.placeholder === 'string' 
        ? props.placeholder 
        : props.placeholder.value;
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      select.appendChild(placeholderOption);
    }
    
    // Add options
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      optionElement.disabled = option.disabled || false;
      select.appendChild(optionElement);
    });
  };
  
  // Handle options (array or signal)
  if (Array.isArray(props.options)) {
    renderOptions(props.options);
  } else {
    renderOptions(props.options.value);
    const unsubscribe = props.options.subscribe(renderOptions);
    cleanupFunctions.push(unsubscribe);
  }
  
  // Handle placeholder signal updates
  if (typeof props.placeholder !== 'string' && props.placeholder) {
    const unsubscribe = props.placeholder.subscribe((newPlaceholder) => {
      const placeholderOption = select.querySelector('option[value=""]') as HTMLOptionElement;
      if (placeholderOption) {
        placeholderOption.textContent = newPlaceholder;
      }
    });
    cleanupFunctions.push(unsubscribe);
  }
  
  // Handle value (string or signal)
  if (typeof props.value === 'string') {
    select.value = props.value;
  } else if (props.value) {
    select.value = props.value.value;
    const unsubscribe = props.value.subscribe((newValue) => {
      if (select.value !== newValue) {
        select.value = newValue;
      }
    });
    cleanupFunctions.push(unsubscribe);
  }
  
  // Handle disabled (boolean or signal)
  if (typeof props.disabled === 'boolean') {
    select.disabled = props.disabled;
  } else if (props.disabled) {
    select.disabled = props.disabled.value;
    const unsubscribe = props.disabled.subscribe((newDisabled) => {
      select.disabled = newDisabled;
    });
    cleanupFunctions.push(unsubscribe);
  }
  
  // Change handler
  if (props.onChange) {
    const changeHandler = () => props.onChange!(select.value);
    select.addEventListener('change', changeHandler);
    listeners.push({ target: select, type: 'change', listener: changeHandler });
  }
  
  container.appendChild(select);
  
  return {
    element: container,
    select,
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