import { animateClose, animateOpen } from '../create-modal-animations.js';
import { modalStack } from '../create-modal-stack.js';
import type { ModalOptions } from '../types/modal-options.types.js';
import type { ModalResult } from '../types/modal-result.types.js';
import { createAtpModalTemplate, attachAtpModalUI, type AtpModalDOM } from './ui/atp-modal-ui.js';

const template = createAtpModalTemplate();

export class AtpModal extends HTMLElement {
    static readonly observedAttributes = ['open'] as const;

    readonly #dom: AtpModalDOM;

    #isOpen = false;
    #isAnimating = false;
    #resolve: ((r: ModalResult<unknown>) => void) | null = null;
    #previouslyFocused: HTMLElement | null = null;
    #focusTrapHandler: (e: KeyboardEvent) => void;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        this.#dom = attachAtpModalUI(shadow, template);

        this.#focusTrapHandler = this.#trapFocus.bind(this);

        this.#setVisible(false);

        this.#dom.backdrop.addEventListener('click', () => {
            if (modalStack.isTop(this)) this.close();
        });
    }

    connectedCallback(): void {
        this.addEventListener('atp-modal-close-request', () => this.close());

        if (this.hasAttribute('open') && !this.#isOpen) {
            this.#isOpen = true;
            void this.#doOpen();
        }
    }

    disconnectedCallback(): void {
        if (this.#isOpen) {
            this.#isOpen = false;
            modalStack.pop();
            this.#resolve?.({ value: undefined, cancelled: true });
            this.#resolve = null;
        }
    }

    get isOpen() {
        return this.hasAttribute('open');
    }

    set isOpen(value: boolean) {
        if (value) {
            if (!this.hasAttribute('open')) this.setAttribute('open', '');
        } else {
            if (this.hasAttribute('open')) this.removeAttribute('open');
        }
    }

    attributeChangedCallback(
        name: string,
        _old: string | null,
        next: string | null,
    ): void {
        if (name !== 'open') return;
        if (next !== null && !this.#isOpen) {
            this.#isOpen = true;
            void this.#doOpen();
        }
    }

    open<T = void>(options: ModalOptions<T> = {}): Promise<ModalResult<T>> {
        return new Promise<ModalResult<T>>(resolve => {
            this.#resolve = (r: ModalResult<unknown>) => {
                options.onResult?.(r as ModalResult<T>);
                resolve(r as ModalResult<T>);
            };
            if (!this.#isOpen) {
                this.#isOpen = true;
                this.setAttribute('open', '');
                void this.#doOpen();
            }
        });
    }

    close(value?: unknown): void {
        if (!this.#isOpen || this.#isAnimating) return;
        this.#isOpen = false;
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        void this.#doClose({ value, cancelled: value === undefined });
    }

    #setVisible(visible: boolean): void {
        const d = visible ? 'block' : 'none';
        const f = visible ? 'flex' : 'none';
        this.#dom.backdrop.style.display = d;
        this.#dom.wrapper.style.display = f;
    }

    #trapFocus(e: KeyboardEvent): void {
        if (e.key !== 'Tab') return;

        const focusableElements = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
        const elements = Array.from(this.querySelectorAll(focusableElements)) as HTMLElement[];

        if (elements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement || document.activeElement === this) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    async #doOpen(): Promise<void> {
        if (this.#isAnimating) return;
        this.#isAnimating = true;

        if (document.activeElement instanceof HTMLElement) {
            this.#previouslyFocused = document.activeElement;
        }

        const zIndex = modalStack.push(this);
        this.#dom.backdrop.style.zIndex = String(zIndex - 1);
        this.#dom.wrapper.style.zIndex = String(zIndex);

        this.#setVisible(true);
        this.removeAttribute('aria-hidden');

        this.addEventListener('keydown', this.#focusTrapHandler);

        await animateOpen(this.#dom.dialog, this.#dom.backdrop);
        this.#isAnimating = false;

        const focusable = this.querySelector('input, button, [tabindex]:not([tabindex="-1"])') as HTMLElement;
        if (focusable) {
            focusable.focus();
        } else {
            this.setAttribute('tabindex', '-1');
            this.focus();
        }

        this.dispatchEvent(new CustomEvent('atp-modal-opened', { bubbles: false }));
    }

    async #doClose(result: ModalResult<unknown>): Promise<void> {
        this.#isAnimating = true;

        this.removeEventListener('keydown', this.#focusTrapHandler);

        await animateClose(this.#dom.dialog, this.#dom.backdrop);

        this.#setVisible(false);
        this.removeAttribute('open');
        this.setAttribute('aria-hidden', 'true');
        this.#isAnimating = false;

        modalStack.pop();

        const resolve = this.#resolve;
        this.#resolve = null;
        resolve?.(result);

        if (this.#previouslyFocused) {
            this.#previouslyFocused.focus();
            this.#previouslyFocused = null;
        }

        this.dispatchEvent(
            new CustomEvent('atp-modal-closed', { bubbles: false, detail: result })
        );
    }
}

export const defineAtpModal = () => {
    if (!customElements.get('atp-modal')) {
        customElements.define('atp-modal', AtpModal);
    }
};
