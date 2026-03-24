import type { Signal } from '../../../core/types/signal.types';

export interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean | Signal<boolean>;
  disabled?: boolean | Signal<boolean>;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export interface CheckboxResult {
  element: HTMLDivElement;
  input: HTMLInputElement;
  cleanup: {
    destroy: () => void;
  };
}