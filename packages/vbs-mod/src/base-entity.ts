import type { BaseEntityProps } from './types/base-entity.types';

export const baseEntity = function(this: BaseEntityProps, props: BaseEntityProps) {
  Object.defineProperty(this, 'id', { 
    value: props.id, 
    enumerable: false, 
    writable: false 
  });
  
  Object.defineProperty(this, 'code', { 
    value: props.code, 
    enumerable: false, 
    writable: false 
  });
  
  Object.defineProperty(this, 'createdAt', { 
    value: props.createdAt, 
    enumerable: false, 
    writable: false 
  });
  
  Object.defineProperty(this, 'updatedAt', { 
    value: props.updatedAt, 
    enumerable: false, 
    writable: true 
  });
  
  return this;
};