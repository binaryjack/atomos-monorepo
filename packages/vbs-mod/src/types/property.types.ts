export type PropertyType = 'number' | 'string' | 'boolean';
export type ComponentType = 'input' | 'select' | 'checkbox' | 'textarea';

export interface ValidationRule {
  readonly type: 'required' | 'min' | 'max' | 'pattern';
  readonly value?: string | number;
  readonly message: string;
}

export interface PropertyProps {
  readonly key: string;
  readonly value: unknown;
  readonly type: PropertyType;
  readonly componentType: ComponentType;
  readonly validation?: ValidationRule[];
}