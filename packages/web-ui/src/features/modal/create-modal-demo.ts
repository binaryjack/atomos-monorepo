import './index.js';
import type { VbsModal } from './vbs-modal.js';
import type { ModalResult } from './types/modal-result.types.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const btn = (
  label: string,
  variant: 'primary' | 'secondary' | 'danger' | 'ghost',
  onClick: () => void,
): HTMLButtonElement => {
  const styles: Record<typeof variant, string> = {
    primary:   'background:#3b82f6;color:#fff;border:none;',
    secondary: 'background:#475569;color:#e2e8f0;border:none;',
    danger:    'background:#ef4444;color:#fff;border:none;',
    ghost:     'background:none;color:#94a3b8;border:1px solid #334155;',
  };
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  el.style.cssText = [
    styles[variant],
    'padding:6px 16px',
    'border-radius:6px',
    'font-size:13px',
    'font-family:system-ui,sans-serif',
    'font-weight:500',
    'cursor:pointer',
    'transition:opacity 120ms',
  ].join(';');
  el.addEventListener('mouseenter', () => { el.style.opacity = '0.85'; });
  el.addEventListener('mouseleave', () => { el.style.opacity = '1'; });
  el.addEventListener('click', onClick);
  return el;
};

const appendModal = (modal: HTMLElement): void => {
  document.body.appendChild(modal);
};

const triggerBtn = (label: string, onClick: () => void): HTMLButtonElement =>
  btn(label, 'primary', onClick);

// ─── Alert modal ─────────────────────────────────────────────────────────────

const buildAlertModal = (): VbsModal => {
  const modal = document.createElement('vbs-modal') as VbsModal;

  const header = document.createElement('vbs-modal-header');
  header.textContent = 'Information';
  header.setAttribute('slot', 'header');

  const body = document.createElement('p');
  body.textContent = 'This is an agnostic alert modal. Click outside, press ESC, or click OK to close.';
  body.style.cssText = 'margin:0;color:#cbd5e1;';

  const footer = document.createElement('vbs-modal-footer');
  footer.setAttribute('slot', 'footer');
  footer.appendChild(btn('OK', 'primary', () => modal.close('ok')));

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  appendModal(modal);
  return modal;
};

// ─── Confirm modal ───────────────────────────────────────────────────────────

const buildConfirmModal = (): VbsModal => {
  const modal = document.createElement('vbs-modal') as VbsModal;

  const header = document.createElement('vbs-modal-header');
  header.textContent = 'Confirm Action';
  header.setAttribute('slot', 'header');

  const body = document.createElement('div');
  body.innerHTML = `
    <p style="margin:0 0 12px;color:#f1f5f9;font-weight:500;">Delete this entity?</p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">This action cannot be undone. All associated links will also be removed.</p>
  `;

  const footer = document.createElement('vbs-modal-footer');
  footer.setAttribute('slot', 'footer');
  footer.appendChild(btn('Cancel',  'ghost',  () => modal.close()));
  footer.appendChild(btn('Delete',  'danger',  () => modal.close('confirmed')));

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  appendModal(modal);
  return modal;
};

// ─── Form modal ──────────────────────────────────────────────────────────────

const buildFormModal = (): VbsModal => {
  const modal = document.createElement('vbs-modal') as VbsModal;
  modal.style.setProperty('--vbs-modal-width', '520px');

  const header = document.createElement('vbs-modal-header');
  header.textContent = 'Edit Entity';
  header.setAttribute('slot', 'header');

  // Body: a small form
  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.gap = '16px';

  const field = (labelText: string, placeholder: string): HTMLDivElement => {
    const wrap = document.createElement('div');
    const lbl = document.createElement('label');
    lbl.textContent = labelText;
    lbl.style.cssText = 'display:block;font-size:12px;font-weight:500;color:#94a3b8;margin-bottom:6px;';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.placeholder = placeholder;
    inp.style.cssText = [
      'width:100%',
      'box-sizing:border-box',
      'background:#0f172a',
      'border:1px solid #334155',
      'border-radius:6px',
      'padding:8px 12px',
      'color:#f1f5f9',
      'font-size:14px',
      'font-family:system-ui,sans-serif',
      'outline:none',
      'transition:border-color 150ms',
    ].join(';');
    inp.addEventListener('focus', () => { inp.style.borderColor = '#3b82f6'; });
    inp.addEventListener('blur',  () => { inp.style.borderColor = '#334155'; });

    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    return wrap;
  };

  body.appendChild(field('Entity Name', 'e.g. User'));
  body.appendChild(field('Code',        'e.g. USR'));
  body.appendChild(field('Description', 'Optional description…'));

  const footer = document.createElement('vbs-modal-footer');
  footer.setAttribute('slot', 'footer');
  footer.appendChild(btn('Cancel', 'ghost',   () => modal.close()));
  footer.appendChild(btn('Save',   'primary', () => modal.close({ saved: true })));

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  appendModal(modal);
  return modal;
};

// ─── Stacked second modal ─────────────────────────────────────────────────────

const buildStackedModal = (): VbsModal => {
  const inner = document.createElement('vbs-modal') as VbsModal;

  const header = document.createElement('vbs-modal-header');
  header.textContent = 'Inner Modal (stacked)';
  header.setAttribute('slot', 'header');

  const body = document.createElement('p');
  body.textContent = 'I am a second modal stacked on top. Press ESC or click outside — only I close.';
  body.style.cssText = 'margin:0;color:#cbd5e1;';

  const footer = document.createElement('vbs-modal-footer');
  footer.setAttribute('slot', 'footer');
  footer.appendChild(btn('Close inner', 'secondary', () => inner.close('inner-closed')));

  inner.appendChild(header);
  inner.appendChild(body);
  inner.appendChild(footer);
  appendModal(inner);
  return inner;
};

const buildStackingModal = (innerModal: VbsModal): VbsModal => {
  const outer = document.createElement('vbs-modal') as VbsModal;

  const header = document.createElement('vbs-modal-header');
  header.textContent = 'Outer Modal';
  header.setAttribute('slot', 'header');

  const body = document.createElement('div');
  body.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

  const info = document.createElement('p');
  info.textContent = 'I am the outer modal. Click the button below to open a second modal on top of me.';
  info.style.cssText = 'margin:0;color:#cbd5e1;';

  const openInnerBtn = btn('Open inner modal', 'secondary', async () => {
    const result = await innerModal.open<string>();
    const msg = document.getElementById('stacked-result');
    if (msg) msg.textContent = `Inner closed → ${JSON.stringify(result)}`;
  });

  const resultMsg = document.createElement('p');
  resultMsg.id = 'stacked-result';
  resultMsg.style.cssText = 'margin:0;font-size:12px;color:#94a3b8;min-height:18px;';

  body.appendChild(info);
  body.appendChild(openInnerBtn);
  body.appendChild(resultMsg);

  const footer = document.createElement('vbs-modal-footer');
  footer.setAttribute('slot', 'footer');
  footer.appendChild(btn('Close outer', 'ghost', () => outer.close()));

  outer.appendChild(header);
  outer.appendChild(body);
  outer.appendChild(footer);
  appendModal(outer);
  return outer;
};

// ─── Public factory ───────────────────────────────────────────────────────────

export interface ModalDemoResult {
  readonly element: HTMLElement;
  readonly cleanup: { destroy: () => void };
}

export const createModalDemo = function(): ModalDemoResult {
  const alertModal   = buildAlertModal();
  const confirmModal = buildConfirmModal();
  const formModal    = buildFormModal();
  const innerModal   = buildStackedModal();
  const outerModal   = buildStackingModal(innerModal);

  const resultLog = document.createElement('p');
  resultLog.style.cssText = 'margin:12px 0 0;font-size:12px;color:#94a3b8;min-height:18px;font-family:system-ui,sans-serif;';

  const logResult = (label: string, r: ModalResult<unknown>): void => {
    resultLog.textContent = `${label} → ${JSON.stringify(r)}`;
  };

  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

  const row = document.createElement('div');
  row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

  row.appendChild(
    triggerBtn('Alert modal', async () => {
      logResult('alert', await alertModal.open());
    })
  );
  row.appendChild(
    triggerBtn('Confirm modal', async () => {
      logResult('confirm', await confirmModal.open());
    })
  );
  row.appendChild(
    triggerBtn('Form modal', async () => {
      logResult('form', await formModal.open());
    })
  );
  row.appendChild(
    triggerBtn('Stacked modals', async () => {
      logResult('outer', await outerModal.open());
    })
  );

  container.appendChild(row);
  container.appendChild(resultLog);

  return {
    element: container,
    cleanup: {
      destroy: () => {
        [alertModal, confirmModal, formModal, innerModal, outerModal].forEach(m => {
          if (m.parentNode) m.parentNode.removeChild(m);
        });
      },
    },
  };
};
