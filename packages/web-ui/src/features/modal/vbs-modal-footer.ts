/**
 * <vbs-modal-footer>
 *   <button>Cancel</button>
 *   <button>Save</button>
 * </vbs-modal-footer>
 *
 * Pure layout component — right-aligns action buttons.
 * No logic; place any content (typically buttons) as children.
 *
 * Usage:
 *   <vbs-modal-footer slot="footer">
 *     <button>Cancel</button>
 *     <button>Confirm</button>
 *   </vbs-modal-footer>
 */
export class VbsModalFooter extends HTMLElement {
  #initialized = false;

  connectedCallback(): void {
    if (this.#initialized) return;
    this.#initialized = true;

    this.style.cssText = [
      'display:flex',
      'align-items:center',
      'justify-content:flex-end',
      'gap:8px',
      'padding:12px 20px',
      'border-top:1px solid #334155',
      'flex-shrink:0',
    ].join(';');
  }

  disconnectedCallback(): void {
    this.#initialized = false;
  }
}
