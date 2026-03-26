const DURATION_MS = 220;

/**
 * Animate a modal opening.
 * Sets initial state, forces reflow, then transitions to final state.
 * Resolves when the transition ends (or after a timeout fallback).
 */
export const animateOpen = (dialog: HTMLElement, backdrop: HTMLElement): Promise<void> => {
  return new Promise<void>(resolve => {
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      resolve();
    };

    // Initial state (invisible, scaled down)
    backdrop.style.opacity = '0';
    dialog.style.opacity = '0';
    dialog.style.transform = 'scale(0.95) translateY(-8px)';

    // Force reflow so browser paints the initial state before we set the transition
    void dialog.offsetHeight;

    // Enable transitions
    backdrop.style.transition = `opacity ${DURATION_MS}ms ease`;
    dialog.style.transition = [
      `opacity ${DURATION_MS}ms ease`,
      `transform ${DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    ].join(', ');

    // Fallback: resolve even if transitionend never fires (e.g. reduced-motion, hidden tab)
    setTimeout(finish, DURATION_MS + 60);
    dialog.addEventListener('transitionend', finish, { once: true });

    // Animate to final state
    backdrop.style.opacity = '1';
    dialog.style.opacity = '1';
    dialog.style.transform = 'scale(1) translateY(0)';
  });
};

/**
 * Animate a modal closing.
 * Transitions back to the scaled-down invisible state.
 * Resolves when the transition ends (or after a timeout fallback).
 */
export const animateClose = (dialog: HTMLElement, backdrop: HTMLElement): Promise<void> => {
  return new Promise<void>(resolve => {
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      resolve();
    };

    setTimeout(finish, DURATION_MS + 60);
    dialog.addEventListener('transitionend', finish, { once: true });

    // Animate to hidden state
    backdrop.style.opacity = '0';
    dialog.style.opacity = '0';
    dialog.style.transform = 'scale(0.95) translateY(-8px)';
  });
};
