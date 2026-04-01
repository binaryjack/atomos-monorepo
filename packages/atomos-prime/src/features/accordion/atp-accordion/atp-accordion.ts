import { getAccordionStyles } from './style/atp-accordion.style.js';
import { handleAccordionToggle, type AtpAccordionHost } from './state/atp-accordion-state.js';

export class AtpAccordion extends HTMLElement implements AtpAccordionHost {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${getAccordionStyles()}</style>
            <slot></slot>
        `;
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.addEventListener('toggle', (e) => {
            const item = e.target as HTMLElement;
            if (item.hasAttribute('expanded')) {
                handleAccordionToggle(this, item);
            }
        });
    }

    get multiple() {
        return this.hasAttribute('multiple');
    }

    set multiple(val: boolean) {
        if (val) this.setAttribute('multiple', '');
        else this.removeAttribute('multiple');
    }
}

export const defineAtpAccordion = () => {
    if (!customElements.get('atp-accordion')) {
        customElements.define('atp-accordion', AtpAccordion);
    }
}