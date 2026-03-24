import type { EdgeProps } from './types/edge.types';

export const edge = function(this: EdgeProps, props: EdgeProps) {
  Object.defineProperty(this, 'position', { 
    value: props.position, 
    enumerable: false, 
    writable: false 
  });
  
  Object.defineProperty(this, 'entityId', { 
    value: props.entityId, 
    enumerable: false, 
    writable: false 
  });
  
  Object.defineProperty(this, 'thickness', { 
    value: props.thickness, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'anchors', { 
    value: props.anchors, 
    enumerable: false, 
    writable: true 
  });
  
  Object.defineProperty(this, 'isHighlighted', { 
    value: props.isHighlighted, 
    enumerable: false, 
    writable: true 
  });
  
  return this;
};