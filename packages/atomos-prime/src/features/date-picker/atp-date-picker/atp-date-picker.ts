import { createAtpDatePickerTemplate, attachAtpDatePickerUI, type AtpDatePickerDOM } from './ui/atp-date-picker-ui.js';
import {
    syncAttributes,
    handleOpenPicker,
    handleClear,
    type AtpDatePickerHost
} from './state/atp-date-picker-state.js';
import { DateFormatsEnum } from '../date-utils.js';
import type { DpDrawerResult } from '../dp-drawer.js';

const template = createAtpDatePickerTemplate();

export class AtpDatePicker extends HTMLElement implements AtpDatePickerHost {
    private dom!: AtpDatePickerDOM;
    public drawer: DpDrawerResult | null = null;
    
    static get observedAttributes() {
        return ['format', 'selection-mode', 'value', 'disabled', 'placeholder', 'name'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        this.dom = attachAtpDatePickerUI(shadow, template);
        
        this._onOpenClick = this._onOpenClick.bind(this);
        this._onClearClick = this._onClearClick.bind(this);
    }

    connectedCallback() {
        this.dom.input.addEventListener('click', this._onOpenClick);
        this.dom.btnIcon.addEventListener('click', this._onOpenClick);
        this.dom.btnClear.addEventListener('click', this._onClearClick);

        setTimeout(() => {
            syncAttributes(this, this.dom);
        }, 0);
    }

    disconnectedCallback() {
        this.dom.input.removeEventListener('click', this._onOpenClick);
        this.dom.btnIcon.removeEventListener('click', this._onOpenClick);
        this.dom.btnClear.removeEventListener('click', this._onClearClick);
        
        if (this.drawer) {
            this.drawer.destroy();
            this.drawer = null;
        }
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue === newValue) return;
        syncAttributes(this, this.dom);
    }

    // --- Interaction Triggers ---
    private _onOpenClick() {
        handleOpenPicker(this, this.dom);
    }

    private _onClearClick(e: Event) {
        handleClear(this, this.dom, e);
    }

    // --- Attribute Reflection Getters/Setters ---

    get format(): string {
        return this.getAttribute('format') || DateFormatsEnum.DD_MM_YYYY;
    }
    set format(value: string) {
        this.setAttribute('format', value);
    }

    get selectionMode(): string {
        return this.getAttribute('selection-mode') || 'single';
    }
    set selectionMode(value: string) {
        this.setAttribute('selection-mode', value);
    }

    get value(): string {
        return this.getAttribute('value') || '';
    }
    set value(val: string) {
        this.setAttribute('value', val);
    }

    get disabledState(): boolean {
        return this.hasAttribute('disabled');
    }
    set disabledState(value: boolean) {
        if (value) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    get placeholder(): string {
        return this.getAttribute('placeholder') || '';
    }
    set placeholder(value: string) {
        this.setAttribute('placeholder', value);
    }

    get name(): string {
        return this.getAttribute('name') || '';
    }
    set name(value: string) {
        this.setAttribute('name', value);
    }
}

export const defineAtpDatePicker = () => {
    if (!customElements.get('atp-date-picker')) {
        customElements.define('atp-date-picker', AtpDatePicker);
    }
};

