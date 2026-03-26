import type { IFormular, IObjectShape } from '@binaryjack/formular.dev';

export interface FormularAtomProps {
  readonly fieldName: string;
  readonly form: IFormular<IObjectShape>;
  readonly label?: string;
  readonly guide?: string;
}

export interface FormularAtomResult {
  readonly element: HTMLElement;
  readonly refresh: () => void;
  readonly cleanup: { destroy: () => void };
}
