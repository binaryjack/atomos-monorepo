import type { ModalStackEntry } from './types/modal-stack-entry.types.js';

const Z_BASE = 1000;
const Z_STEP = 10;

interface ClosableElement extends HTMLElement {
  close(value?: unknown): void;
}

const stack: ModalStackEntry[] = [];
let escHandler: ((e: KeyboardEvent) => void) | null = null;

const installEsc = (): void => {
  escHandler = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    const top = stack[stack.length - 1];
    if (!top) return;
    (top.element as ClosableElement).close();
  };
  document.addEventListener('keydown', escHandler);
};

const removeEsc = (): void => {
  if (!escHandler) return;
  document.removeEventListener('keydown', escHandler);
  escHandler = null;
};

const push = (element: HTMLElement): number => {
  const zIndex = Z_BASE + (stack.length + 1) * Z_STEP;
  stack.push({ element, zIndex });
  if (stack.length === 1) installEsc();
  return zIndex;
};

const pop = (): ModalStackEntry | undefined => {
  const entry = stack.pop();
  if (stack.length === 0) removeEsc();
  return entry;
};

const peek = (): ModalStackEntry | undefined => stack[stack.length - 1];

const size = (): number => stack.length;

/** True when the given element is the top-most modal on the stack. */
const isTop = (element: HTMLElement): boolean => peek()?.element === element;

export const modalStack = { push, pop, peek, size, isTop };
