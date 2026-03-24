import type { EdgePosition } from './anchor.types.js';
import type { AnchorProps } from './anchor.types.js';
export type EdgeThickness = 3 | 5;
export interface EdgeProps {
    readonly position: EdgePosition;
    readonly entityId: string;
    readonly thickness: EdgeThickness;
    readonly anchors: AnchorProps[];
    readonly isHighlighted: boolean;
}
//# sourceMappingURL=edge.types.d.ts.map