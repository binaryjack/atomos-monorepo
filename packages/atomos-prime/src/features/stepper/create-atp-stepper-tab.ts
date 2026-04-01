const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            user-select: none;
            padding: 0;
            border: 0;
            flex: 1;
            position: relative;
        }

        .stepper-tab-top {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-direction: row;
            width: 100%;
            height: 35px;
            margin-bottom: 8px;
        }

        .stepper-icon {
            height: 24px;
            width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            padding: 4px;
            margin-right: 12px;
            background: var(--bg-gray-100, #f3f4f6);
            color: var(--text-gray-500, #6b7280);
            font-size: 12px;
            font-weight: bold;
            border: 2px solid transparent;
            transition: all 0.2s ease-in-out;
        }

        .stepper-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-gray-500, #6b7280);
            transition: color 0.2s ease-in-out;
        }

        .stepper-underline {
            width: 100%;
            height: 2px;
            background: var(--bg-gray-200, #e5e7eb);
            transition: background 0.2s ease-in-out;
        }

        /* Active State */
        :host([is-active]) .stepper-icon {
            background: var(--bg-primary, #3b82f6);
            color: #ffffff;
            border-color: var(--bg-primary, #3b82f6);
        }

        :host([is-active]) .stepper-label {
            color: var(--text-primary, #1d4ed8);
            font-weight: 600;
        }

        :host([is-active]) .stepper-underline {
            background: var(--bg-primary, #3b82f6);
        }

        /* Valid State */
        :host([is-valid]) .stepper-icon {
            background: transparent;
            border-color: var(--color-success, #10b981);
            color: var(--color-success, #10b981);
        }

    </style>
    <div class="stepper-tab-top">
        <div class="stepper-icon part-icon">1</div>
        <div class="stepper-label part-label">Step</div>
    </div>
    <div class="stepper-underline part-underline"></div>
`;

export const createAtpStepperTab = () => {
    if (customElements.get('atp-stepper-tab')) return;

    class AtpStepperTab extends HTMLElement {
        private iconPart: HTMLDivElement;
        private labelPart: HTMLDivElement;

        static get observedAttributes() {
            return ['step-id', 'label', 'is-active', 'is-valid', 'step-index'];
        }

        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.appendChild(template.content.cloneNode(true));

            this.iconPart = shadow.querySelector('.part-icon') as HTMLDivElement;
            this.labelPart = shadow.querySelector('.part-label') as HTMLDivElement;

            this.handleClick = this.handleClick.bind(this);
        }

        connectedCallback() {
            this.addEventListener('click', this.handleClick);
        }

        disconnectedCallback() {
            this.removeEventListener('click', this.handleClick);
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            if (oldValue === newValue) return;

            if (name === 'label') {
                this.labelPart.textContent = newValue || '';
            } else if (name === 'step-index') {
                // If a visual number index is provided (e.g. 1, 2, 3)
                this.iconPart.textContent = newValue || '';
            }
        }

        private handleClick() {
            this.dispatchEvent(new CustomEvent('stepper-tab-click', {
                bubbles: true,
                composed: true,
                detail: { stepId: this.stepId }
            }));
        }

        // --- attribute reflection getters & setters ---

        get stepId(): number {
            const id = this.getAttribute('step-id');
            return id ? parseInt(id, 10) : -1;
        }

        set stepId(value: number) {
            this.setAttribute('step-id', value.toString());
        }

        get stepIndex(): string {
            return this.getAttribute('step-index') || '';
        }

        set stepIndex(value: string) {
            this.setAttribute('step-index', value);
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
    }

    customElements.define('atp-stepper-tab', AtpStepperTab);
};
