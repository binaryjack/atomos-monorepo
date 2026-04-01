export interface SvgLineProps {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: string;
  readonly className?: string;
  readonly id?: string;
  readonly type: 'linear' | 'orthogonal' | 'spline';
  readonly embeddedHtml?: HTMLElement;
}

export interface SvgLineResult {
  readonly element: SVGElement;
  readonly cleanup: { destroy: () => void };
}