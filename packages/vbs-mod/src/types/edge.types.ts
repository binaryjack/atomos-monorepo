import type { EdgePosition } from './anchor.types';
import type { AnchorProps } from './anchor.types';

export type EdgeThickness = 3 | 5;

export interface EdgeProps {
  readonly position: EdgePosition;
  readonly entityId: string;
  readonly thickness: EdgeThickness;
  readonly anchors: AnchorProps[];
  readonly isHighlighted: boolean;
}