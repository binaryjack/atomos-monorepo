import type { IValidationResult, IFormular, IObjectShape } from '@binaryjack/formular.dev';

export class VbsValidationResult extends HTMLElement {
  #unobserve: (() => void) | null = null;
  #form: IFormular<IObjectShape> | null = null;
  #fieldName: string | null = null;
  #focused = false;
  #guideText: string | null = null;

  connectedCallback(): void {
    this.style.cssText = [
      'display:block',
      'min-height:16px',
      'font-size:12px',
      'line-height:1.5',
      'font-family:system-ui,sans-serif',
    ].join(';');
    this.#render();
  }

  disconnectedCallback(): void {
    this.#unobserve?.();
    this.#unobserve = null;
  }

  set form(f: IFormular<IObjectShape>) {
    this.#form = f;
    this.#subscribe();
  }

  set fieldName(name: string) {
    this.#fieldName = name;
    this.#subscribe();
  }

  set guideText(text: string | null) {
    this.#guideText = text;
    this.#render();
  }

  setFocused(focused: boolean): void {
    this.#focused = focused;
    this.#render();
  }

  refresh(): void {
    this.#render();
  }

  #subscribe(): void {
    if (!this.#form || !this.#fieldName) return;
    this.#unobserve?.();
    this.#unobserve = this.#form.observe(this.#fieldName, () => this.#render());
    this.#render();
  }

  #render(): void {
    if (!this.#form || !this.#fieldName) return;

    const extField = this.#form.getField(this.#fieldName);
    if (!extField) {
      this.style.display = 'none';
      return;
    }

    const inp = extField.input as unknown as {
      validationResults?: IValidationResult[];
    };
    const results: IValidationResult[] = inp.validationResults ?? [];
    const failed = results.filter(r => !r.state);

    this.innerHTML = '';

    if (this.#focused) {
      // Always show guide text on focus if provided
      if (this.#guideText) {
        this.style.display = 'block';
        this.style.color = '#38bdf8';
        const p = document.createElement('p');
        p.style.margin = '0';
        p.textContent = this.#guideText;
        this.appendChild(p);
      } else if (failed.length > 0) {
        // No explicit guide — show error hints in blue as fallback
        this.style.display = 'block';
        this.style.color = '#38bdf8';
        failed.forEach(r => {
          const p = document.createElement('p');
          p.style.margin = '0';
          p.textContent = r.guide ?? r.error ?? r.code;
          this.appendChild(p);
        });
      } else {
        this.style.display = 'none';
      }
      return;
    }

    if (failed.length === 0) {
      this.style.display = 'none';
      return;
    }

    this.style.display = 'block';
    this.style.color = '#f87171';
    failed.forEach(r => {
      const p = document.createElement('p');
      p.style.margin = '0';
      p.textContent = r.error ?? r.code;
      this.appendChild(p);
    });
  }
}

if (!customElements.get('vbs-validation-result')) {
  customElements.define('vbs-validation-result', VbsValidationResult);
}

declare global {
  interface HTMLElementTagNameMap {
    'vbs-validation-result': VbsValidationResult;
  }
}
