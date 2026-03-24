import type { Signal } from '../../../core/types/signal.types';

export interface ButtonProps {
  readonly variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  readonly size: 'sm' | 'md' | 'lg';
  readonly children: string | Signal<string>;
  readonly disabled?: boolean | Signal<boolean>;
  readonly loading?: boolean | Signal<boolean>;
  readonly className?: string;
  readonly id?: string;
  readonly onClick?: () => void;
}

export interface ButtonResult {
  readonly element: HTMLButtonElement;
  readonly cleanup: { destroy: () => void };
}