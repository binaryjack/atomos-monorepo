import type { EntityFrameProps, EntityFrameResult } from './types/entity-frame.types';
export type { EntityFrameProps, EntityFrameResult };
import { createSvgRectangle } from '../svg-rectangle/create-svg-rectangle';
import { createButton } from '../button/create-button';
import { createTypography } from '../typography/create-typography';

export const createEntityFrame = function(props: EntityFrameProps): EntityFrameResult {
  const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const listeners: Array<{ target: EventTarget; type: string; listener: EventListener }> = [];
  const cleanupFunctions: Array<() => void> = [];
  
  if (props.id) container.id = props.id;
  if (props.className) container.className.baseVal = props.className;
  
  const defaultWidth = props.width ?? 200;
  const defaultHeight = props.height ?? 32;
  const headerHeight = 32;
  
  // Get current values
  const getCurrentPosition = () => typeof props.position === 'object' && 'x' in props.position ? 
    props.position : props.position.value;
  const getCurrentTitle = () => typeof props.title === 'string' ? props.title : props.title.value;
  const getCurrentProperties = () => Array.isArray(props.properties) ? 
    props.properties : props.properties.value;
  
  let currentPosition = getCurrentPosition();
  
  // Create header rectangle
  const headerRect = createSvgRectangle({
    x: currentPosition.x,
    y: currentPosition.y,
    width: defaultWidth,
    height: headerHeight,
    fill: '#f3f4f6',
    stroke: '#d1d5db',
    className: 'entity-header cursor-move'
  });
  
  // Create title text
  const titleElement = createTypography({
    variant: 'span',
    children: getCurrentTitle(),
    className: 'font-semibold text-sm'
  });
  
  // Create collapse/expand button
  const collapseButton = createButton({
    variant: 'ghost',
    size: 'sm',
    children: props.collapsed.value ? '▶' : '▼',
    onClick: () => {
      const newCollapsed = !props.collapsed.value;
      props.collapsed.set(newCollapsed);
      props.onToggleCollapse?.(newCollapsed);
    }
  });
  
  // Embed title and button in header
  const headerContent = document.createElement('div');
  headerContent.style.display = 'flex';
  headerContent.style.justifyContent = 'space-between';
  headerContent.style.alignItems = 'center';
  headerContent.style.padding = '8px';
  headerContent.style.width = `${defaultWidth - 16}px`;
  headerContent.style.height = `${headerHeight - 16}px`;
  
  headerContent.appendChild(titleElement.element);
  headerContent.appendChild(collapseButton.element);
  
  cleanupFunctions.push(titleElement.cleanup.destroy);
  cleanupFunctions.push(collapseButton.cleanup.destroy);
  
  // Update header with embedded content
  const headerWithContent = createSvgRectangle({
    x: currentPosition.x,
    y: currentPosition.y,
    width: defaultWidth,
    height: headerHeight,
    fill: '#f3f4f6',
    stroke: '#d1d5db',
    embeddedHtml: headerContent
  });
  
  cleanupFunctions.push(headerWithContent.cleanup.destroy);
  
  // Create body (collapsible)
  const renderBody = () => {
    if (props.collapsed.value) return null;
    
    const properties = getCurrentProperties();
    const bodyHeight = properties.length * 24 + 16;
    
    const bodyRect = createSvgRectangle({
      x: currentPosition.x,
      y: currentPosition.y + headerHeight,
      width: defaultWidth,
      height: bodyHeight,
      fill: '#ffffff',
      stroke: '#d1d5db'
    });
    
    const bodyContent = document.createElement('div');
    bodyContent.style.padding = '8px';
    bodyContent.style.width = `${defaultWidth - 16}px`;
    
    properties.forEach((prop, index) => {
      const propElement = document.createElement('div');
      propElement.style.marginBottom = '4px';
      propElement.style.fontSize = '12px';
      propElement.innerHTML = `<strong>${prop.key}:</strong> <span class="text-gray-600">${prop.value}</span> <em class="text-xs text-gray-400">(${prop.type})</em>`;
      bodyContent.appendChild(propElement);
    });
    
    return createSvgRectangle({
      x: currentPosition.x,
      y: currentPosition.y + headerHeight,
      width: defaultWidth,
      height: bodyHeight,
      fill: '#ffffff',
      stroke: '#d1d5db',
      embeddedHtml: bodyContent
    });
  };
  
  let bodyElement = renderBody();
  
  // Subscribe to collapsed changes
  const collapseUnsubscribe = props.collapsed.subscribe((collapsed) => {
    collapseButton.element.textContent = collapsed ? '▶' : '▼';
    
    // Remove old body
    if (bodyElement) {
      bodyElement.cleanup.destroy();
      if (bodyElement.element.parentNode === container) {
        container.removeChild(bodyElement.element);
      }
    }
    
    // Add new body
    bodyElement = renderBody();
    if (bodyElement) {
      container.appendChild(bodyElement.element);
      cleanupFunctions.push(bodyElement.cleanup.destroy);
    }
  });
  cleanupFunctions.push(collapseUnsubscribe);
  
  // Add elements to container
  container.appendChild(headerWithContent.element);
  if (bodyElement) {
    container.appendChild(bodyElement.element);
    cleanupFunctions.push(bodyElement.cleanup.destroy);
  }
  
  // Drag functionality
  if (props.onDrag) {
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    
    const mousedown = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      mouseEvent.preventDefault();
      isDragging = true;
      dragStart = { x: mouseEvent.clientX, y: mouseEvent.clientY };
    };
    
    const mousemove = (e: Event) => {
      if (!isDragging) return;
      const mouseEvent = e as MouseEvent;
      const delta = {
        x: mouseEvent.clientX - dragStart.x,
        y: mouseEvent.clientY - dragStart.y
      };
      props.onDrag!(delta);
    };
    
    const mouseup = () => {
      isDragging = false;
    };
    
    container.addEventListener('mousedown', mousedown);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    
    listeners.push(
      { target: container, type: 'mousedown', listener: mousedown },
      { target: document, type: 'mousemove', listener: mousemove },
      { target: document, type: 'mouseup', listener: mouseup }
    );
  }
  
  return {
    element: container,
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