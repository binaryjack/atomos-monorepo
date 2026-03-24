import type { BaseEntityProps } from './base-entity.types';
import type { PropertiesRowProps } from './properties-row.types';
import type { EdgeProps } from './edge.types';

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

export interface EntityProps extends BaseEntityProps {
  readonly name: string;
  readonly propertiesRows: PropertiesRowProps[];
  readonly position: Position;
  readonly dimensions: Dimensions;
  readonly edges: EdgeProps[];
}