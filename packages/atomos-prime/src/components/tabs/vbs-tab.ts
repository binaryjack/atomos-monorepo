const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: inline-block;
    padding: 12px 16px;
    color: var(--tab-text-color, #a1a1aa);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    user-select: none;
    white-space: nowrap;
    position: relative;
    outline: none;
  }

  :host(:hover) {
    color: var(--tab-active-text-color, #f4f4f5);
    background-color: rgba(255,255,255,0.02);
  }

  :host([selected]) {
    color: var(--tab-active-text-color, #f4f4f5);
    border-bottom-color: var(--tab-active-color, #3b82f6);
  }

  :host(:focus-visible) {
    background-color: rgba(255,255,255,0.05);
  }
  
  :host(:focus-visible)::after {
    content: '';
    position: absolute;
    inset: 4px;
    border: 2px solid var(--tab-active-color, #3b82f6);
    border-radius: var(--vbs-radius, 2px);
    pointer-events: none;
  }

  /* ── Canvas variant ──────────────────────────────────────────────────── */
  :host([variant="canvas"]) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 4px 14px;
    border-top: 2px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    font-weight: 400;
    transition: background 0.15s, border-color 0.15s;
  }

  :host([variant="canvas"]:hover) {
    background: rgba(255,255,255,0.05);
    color: var(--tab-active-text-color, #f4f4f5);
  }

  :host([variant="canvas"][selected]) {
    background: rgba(255,255,255,0.09);
    border-top-color: var(--tab-active-color, #3b82f6);
    border-left-color: var(--tab-border-color, #27272a);
    border-right-color: var(--tab-border-color, #27272a);
    color: var(--tab-active-text-color, #f4f4f5);
  }

  /* ── Close button ────────────────────────────────────────────────────── */
  .close-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 14px;
    height: 14px;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    color: var(--tab-text-color, #a1a1aa);
    border-radius: 2px;
    flex-shrink: 0;
  }

  :host([closeable]) .close-btn {
    display: flex;
  }

  .close-btn:hover {
    color: var(--vbs-danger, #ef4444);
  }
</style>
<slot></slot>
<button class="close-btn" type="button" aria-label="Close tab">×</button>
`;

export class VbsTab extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this._onClick = this._onClick.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  connectedCallback() {
    this.setAttribute('role', 'tab');
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
    this.addEventListener('click', this._onClick);
    const closeBtn = this.shadowRoot!.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', this._onClose);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._onClick);
    const closeBtn = this.shadowRoot!.querySelector('.close-btn');
    if (closeBtn) closeBtn.removeEventListener('click', this._onClose);
  }

  get selected(): boolean {
    return this.hasAttribute('selected');
  }

  set selected(val: boolean) {
    if (val) {
      this.setAttribute('selected', '');
      this.setAttribute('aria-selected', 'true');
    } else {
      this.removeAttribute('selected');
      this.setAttribute('aria-selected', 'false');
    }
  }

  get value(): string {
    return this.getAttribute('value') || '';
  }

  set value(val: string) {
    this.setAttribute('value', val);
  }

  private _onClick(e: Event) {
    // Ignore if the click originated from the close button
    const path = e.composedPath();
    const closeBtn = this.shadowRoot!.querySelector('.close-btn');
    if (closeBtn && path.includes(closeBtn)) return;
    this.dispatchEvent(new CustomEvent('vbs-tab-click', {
      bubbles: true,
      composed: true,
      detail: { value: this.value }
    }));
  }

  private _onClose(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('vbs-tab-close', {
      bubbles: true,
      composed: true,
      detail: { value: this.value }
    }));
  }
}

customElements.define('vbs-tab', VbsTab);
