export const applyCommonStyles = (element: SVGElement): void => {
  const style = `
    fill: #1e293b;
    stroke: #3b82f6;
    stroke-width: 2;
    transition: all 0.2s ease-in-out;
  `;
  element.setAttribute('style', style);
};