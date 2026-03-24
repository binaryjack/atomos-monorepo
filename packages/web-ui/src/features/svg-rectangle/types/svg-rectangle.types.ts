export interface SvgRectangleProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly className?: string;
  readonly id?: string;
  readonly embeddedHtml?: HTMLElement;
}

export interface SvgRectangleResult {
  readonly element: SVGElement;
  readonly cleanup: { destroy: () => void };
}