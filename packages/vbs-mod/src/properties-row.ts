import type { PropertiesRowProps } from './types/properties-row.types';

export const propertiesRow = function(this: PropertiesRowProps, props: PropertiesRowProps) {
  Object.defineProperty(this, 'id', { 
    value: props.id, 
    enumerable: false, 
    writable: false 
  });
  
  Object.defineProperty(this, 'properties', { 
    value: props.properties, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'order', { 
    value: props.order, 
    enumerable: false, 
    writable: true 
  });
  
  return this;
};