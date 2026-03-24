import type { PropertyProps } from './property.types';

export interface PropertiesRowProps {
  readonly id: string;
  readonly properties: PropertyProps[];
  readonly order: number;
}