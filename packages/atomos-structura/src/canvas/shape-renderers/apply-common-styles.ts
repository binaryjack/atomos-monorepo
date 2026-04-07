export const applyCommonStyles = (element: SVGElement, color?: string | undefined): void => {
  const finalColor = color || 'var(--vbs-bg-panel, #09090b)';
  // Inline style wins over any CSS class — do NOT setAttribute('class') here as
  // it would stomp existing classes and break downstream shape-specific selectors.
  element.style.fill = finalColor;
  element.style.stroke = 'var(--vbs-primary, #3b82f6)';
  element.style.transition = 'all 0.2s ease-in-out';
  element.setAttribute('stroke-width', '1');
};