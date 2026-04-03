const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: none;
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    flex-direction: column;
    animation: fadeIn 0.2s ease-in-out;
  }

  :host([active]) {
    display: flex;
  }
</style>
<slot></slot>
`;

export class VbsTabPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'tabpanel');
  }

  get active(): boolean {
    return this.hasAttribute('active');
  }

  set active(val: boolean) {
    if (val) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }
}

customElements.define('vbs-tab-panel', VbsTabPanel);
