import { VbsModal } from './vbs-modal.js';
import { VbsModalHeader } from './vbs-modal-header.js';
import { VbsModalFooter } from './vbs-modal-footer.js';

// Idempotent registration — safe to import multiple times
if (!customElements.get('vbs-modal')) {
  customElements.define('vbs-modal', VbsModal);
}
if (!customElements.get('vbs-modal-header')) {
  customElements.define('vbs-modal-header', VbsModalHeader);
}
if (!customElements.get('vbs-modal-footer')) {
  customElements.define('vbs-modal-footer', VbsModalFooter);
}

export { VbsModal } from './vbs-modal.js';
export { VbsModalHeader } from './vbs-modal-header.js';
export { VbsModalFooter } from './vbs-modal-footer.js';

export type { ModalResult } from './types/modal-result.types.js';
export type { ModalOptions } from './types/modal-options.types.js';
export type { ModalStackEntry } from './types/modal-stack-entry.types.js';

// ─── Global type augmentation ─────────────────────────────────────────────
declare global {
  interface HTMLElementTagNameMap {
    'vbs-modal': VbsModal;
    'vbs-modal-header': VbsModalHeader;
    'vbs-modal-footer': VbsModalFooter;
  }

  interface HTMLElementEventMap {
    'vbs-modal-opened': CustomEvent<void>;
    'vbs-modal-closed': CustomEvent<import('./types/modal-result.types.js').ModalResult<unknown>>;
    'vbs-modal-close-request': CustomEvent<void>;
  }
}
