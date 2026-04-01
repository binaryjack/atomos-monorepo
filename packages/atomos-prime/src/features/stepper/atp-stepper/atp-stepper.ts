import { createAtpStepperTemplate, attachAtpStepperUI, type AtpStepperDOM } from './ui/atp-stepper-ui.js';
import {
    syncSteps,
    updateActiveStep,
    updateFooterState,
    handleNavigation,
    handleTabClick,
    type AtpStepperHost
} from './state/atp-stepper-state.js';

const template = createAtpStepperTemplate();

export class AtpStepper extends HTMLElement implements AtpStepperHost {
    private dom!: AtpStepperDOM;

    static get observedAttributes() {
        return ['current-step-id', 'enable-footer'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        this.dom = attachAtpStepperUI(shadow, template);
        
        this._onBackClick = this._onBackClick.bind(this);
        this._onNextClick = this._onNextClick.bind(this);
        this._onTabClick = this._onTabClick.bind(this);
    }

    connectedCallback() {
        this.dom.btnBack.addEventListener('click', this._onBackClick);
        this.dom.btnNext.addEventListener('click', this._onNextClick);
        this.addEventListener('stepper-tab-click', this._onTabClick as EventListener);

        // Wait a tick for children (atp-step) to connect
        setTimeout(() => {
            syncSteps(this, this.dom);
        }, 0);
    }

    disconnectedCallback() {
        this.dom.btnBack.removeEventListener('click', this._onBackClick);
        this.dom.btnNext.removeEventListener('click', this._onNextClick);
        this.removeEventListener('stepper-tab-click', this._onTabClick as EventListener);
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return;

        if (name === 'current-step-id') {
            updateActiveStep(this, this.dom);
            updateFooterState(this, this.dom);

            this.dispatchEvent(new CustomEvent('stepper-navigation', {
                bubbles: true,
                composed: true,
                detail: { currentStepId: this.currentStepId }
            }));
        }
    }

    // --- Interaction Triggers ---
    private _onBackClick() {
        handleNavigation(this, this.dom, 'back');
    }

    private _onNextClick() {
        handleNavigation(this, this.dom, 'next');
    }

    private _onTabClick(e: Event) {
        handleTabClick(this, e as CustomEvent);
    }

    // --- Attribute Reflection Getters/Setters ---

    get currentStepId(): number {
        const id = this.getAttribute('current-step-id');
        return id ? parseInt(id, 10) : -1;
    }

    set currentStepId(value: number) {
        this.setAttribute('current-step-id', value.toString());
    }

    get enableFooter(): boolean {
        return this.hasAttribute('enable-footer');
    }

    set enableFooter(value: boolean) {
        if (value) {
            this.setAttribute('enable-footer', '');
        } else {
            this.removeAttribute('enable-footer');
        }
    }
}

export const defineAtpStepper = () => {
    if (!customElements.get('atp-stepper')) {
        customElements.define('atp-stepper', AtpStepper);
    }
};
