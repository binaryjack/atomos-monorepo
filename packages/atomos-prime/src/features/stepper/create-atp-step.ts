const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: none;
            width: 100%;
            flex-direction: column;
        }

        :host([is-active]) {
            display: flex;
        }
        
        .step-content {
            display: flex;
            width: inherit;
        }

        /* Slid animations (reference from atomos.dev step.css) */
        @keyframes slideFromRight {
            from { right: -100%; }
            to { right: 0; }
        }
        
        .slide-from-right {
            animation: slideFromRight 0.5s forwards ease-in-out;
        }
    </style>
    <div class="step-content part-content">
        <slot></slot>
    </div>
`;

export const createAtpStep = () => {
    if (customElements.get('atp-step')) return;

    class AtpStep extends HTMLElement {
        private contentPart: HTMLDivElement;

        static get observedAttributes() {
            return ['step-id', 'label', 'is-active', 'is-valid', 'is-visible'];
        }

        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.appendChild(template.content.cloneNode(true));
            this.contentPart = shadow.querySelector('.part-content') as HTMLDivElement;
        }

        connectedCallback() {
            if (!this.hasAttribute('is-visible')) {
                this.setAttribute('is-visible', '');
            }
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            if (oldValue === newValue) return;

            if (name === 'is-active') {
                if (newValue !== null) {
                    this.contentPart.classList.add('slide-from-right');
                } else {
                    this.contentPart.classList.remove('slide-from-right');
                }
                this.dispatchEvent(new CustomEvent('step-active-changed', {
                    bubbles: true,
                    composed: true,
                    detail: { stepId: this.stepId, isActive: newValue !== null }
                }));
            }
        }

        // --- attribute reflection getters & setters ---

        get stepId(): number {
            const stepId = this.getAttribute('step-id');
            return stepId ? parseInt(stepId, 10) : -1;
        }

        set stepId(value: number) {
            this.setAttribute('step-id', value.toString());
        }

        get label(): string {
            return this.getAttribute('label') || '';
        }

        set label(value: string) {
            this.setAttribute('label', value);
        }

        get isActive(): boolean {
            return this.hasAttribute('is-active');
        }

        set isActive(value: boolean) {
            if (value) {
                this.setAttribute('is-active', '');
            } else {
                this.removeAttribute('is-active');
            }
        }

        get isValid(): boolean {
            return this.hasAttribute('is-valid');
        }

        set isValid(value: boolean) {
            if (value) {
                this.setAttribute('is-valid', '');
            } else {
                this.removeAttribute('is-valid');
            }
        }

        get isVisible(): boolean {
            return this.hasAttribute('is-visible');
        }

        set isVisible(value: boolean) {
            if (value) {
                this.setAttribute('is-visible', '');
            } else {
                this.removeAttribute('is-visible');
            }
        }
    }

    customElements.define('atp-step', AtpStep);
};
