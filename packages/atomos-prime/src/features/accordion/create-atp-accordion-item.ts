export const createAtpAccordionItem = () => {
    class AtpAccordionItem extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot!.innerHTML = `
                <style>
                    :host { display: block; }
                    .header { cursor: pointer; padding: 10px; background: #eee; border-top: 1px solid #ddd; }
                    .content { padding: 10px; display: none; }
                    :host([expanded]) .content { display: block; }
                </style>
                <div class="header" part="header"><slot name="header"></slot></div>
                <div class="content" part="content"><slot></slot></div>
            `;
        }

        connectedCallback() {
            this.shadowRoot!.querySelector('.header')!.addEventListener('click', () => {
                this.expanded = !this.expanded;
                this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true, detail: { expanded: this.expanded } }));
            });
        }

        get expanded() {
            return this.hasAttribute('expanded');
        }

        set expanded(val) {
            if (val) this.setAttribute('expanded', '');
            else this.removeAttribute('expanded');
        }
    }
    customElements.define('atp-accordion-item', AtpAccordionItem);
};