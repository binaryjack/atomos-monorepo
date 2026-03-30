import type { EntityShape } from '@vbs/vbs-mod';
import { createChevron } from './create-chevron.js';
import { createCircle } from './create-circle.js';
import { createDiamond } from './create-diamond.js';
import { createOval } from './create-oval.js';
import { createParallelogram } from './create-parallelogram.js';
import { createTrapeze } from './create-trapeze.js';

export const createSVGShape = (shape: EntityShape, width: number, height: number): SVGElement => {
  switch (shape) {
    case 'circle': return createCircle(width, height);
    case 'diamond': return createDiamond(width, height);
    case 'oval': return createOval(width, height);
    case 'parallelogram': return createParallelogram(width, height);
    case 'chevron': return createChevron(width, height);
    case 'trapeze': return createTrapeze(width, height);
    default:
      // Fallback
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', width.toString());
      rect.setAttribute('height', height.toString());
      rect.style.fill = 'white';
      rect.style.stroke = '#3b82f6';
      rect.style.strokeWidth = '2px';
      return rect;
  }
};
