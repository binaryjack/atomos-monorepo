export type RenderType = 'linear' | 'bezier' | 'orthogonal';
export type Cardinality = '1' | '*' | '0..1' | '1..*';
export interface LinkProps {
    readonly id: string;
    readonly leftEntityId: string;
    readonly rightEntityId: string;
    readonly leftCardinality: Cardinality;
    readonly rightCardinality: Cardinality;
    readonly renderType: RenderType;
    readonly leftAnchorId: string;
    readonly rightAnchorId: string;
}
//# sourceMappingURL=link.types.d.ts.map