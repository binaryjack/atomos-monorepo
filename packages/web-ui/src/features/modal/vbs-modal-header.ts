/**
 * <vbs-modal-header>My Title</vbs-modal-header>
 *
 * Renders the title text and a close (✕) button.
 * The close button dispatches `vbs-modal-close-request` (bubbles, composed)
 * which VbsModal catches to call close().
 *
 * Usage:
 *   <vbs-modal-header slot="header">Settings</vbs-modal-header>
 */
export class VbsModalHeader extends HTMLElement {
  #initialized = false;
  #closeBtn: HTMLButtonElement | null = null;

  connectedCallback(): void {
    if (this.#initialized) return;
    this.#initialized = true;

    this.style.cssText = [
      'display:flex',
      'align-items:center',
      'justify-content:space-between',
      'gap:8px',
      'padding:16px 20px',
      'border-bottom:1px solid #334155',
      'flex-shrink:0',
      'min-height:52px',
    ].join(';');

    // Wrap existing child nodes in a styled title span
    const titleSpan = document.createElement('span');
    titleSpan.style.cssText = [
      'font-size:16px',
      'font-weight:600',
      'color:#f1f5f9',
      'font-family:system-ui,sans-serif',
      'line-height:1.3',
      'white-space:nowrap',
      'overflow:hidden',
      'text-overflow:ellipsis',
      'flex:1',
    ].join(';');
    Array.from(this.childNodes).forEach(n => titleSpan.appendChild(n));
    this.appendChild(titleSpan);

    // ✕ close button
    this.#closeBtn = document.createElement('button');
    this.#closeBtn.type = 'button';
    this.#closeBtn.setAttribute('aria-label', 'Close');
    this.#closeBtn.style.cssText = [
      'flex-shrink:0',
      'background:none',
      'border:none',
      'cursor:pointer',
      'padding:4px',
      'color:#94a3b8',
      'display:flex',
      'align-items:center',
      'border-radius:4px',
      'transition:color 150ms,background 150ms',
    ].join(';');
    this.#closeBtn.innerHTML = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">`
      + `<path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>`
      + `</svg>`;

    const onEnter = (): void => {
      if (!this.#closeBtn) return;
      this.#closeBtn.style.color = '#f1f5f9';
      this.#closeBtn.style.background = '#334155';
    };
    const onLeave = (): void => {
      if (!this.#closeBtn) return;
      this.#closeBtn.style.color = '#94a3b8';
      this.#closeBtn.style.background = 'none';
    };
    const onClick = (): void => {
      this.dispatchEvent(
        new CustomEvent('vbs-modal-close-request', { bubbles: true, composed: true })
      );
    };

    this.#closeBtn.addEventListener('mouseenter', onEnter);
    this.#closeBtn.addEventListener('mouseleave', onLeave);
    this.#closeBtn.addEventListener('click', onClick);
    this.appendChild(this.#closeBtn);
  }

  disconnectedCallback(): void {
    this.#closeBtn = null;
    this.#initialized = false;
  }
}
