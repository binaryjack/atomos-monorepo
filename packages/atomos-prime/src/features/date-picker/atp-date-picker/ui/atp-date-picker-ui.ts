import { datePickerStyle } from '../style/atp-date-picker-style.js';

export const createAtpDatePickerTemplate = (): HTMLTemplateElement => {
    const template = document.createElement('template');
    template.innerHTML = `
        <style>${datePickerStyle}</style>
        <div class="dp-wrapper" id="wrapper">
            <div class="dp-input-row" id="input-row">
                <input type="text" id="input" class="dp-input" readonly />
                <button type="button" id="btn-clear" class="dp-clear hidden" aria-label="Clear date">×</button>
                <button type="button" id="btn-icon" class="dp-icon" aria-label="Open calendar">📅</button>
            </div>
            <div id="range-label" class="dp-range-label hidden"></div>
        </div>
    `;
    return template;
};

export interface AtpDatePickerDOM {
    wrapper: HTMLDivElement;
    input: HTMLInputElement;
    btnClear: HTMLButtonElement;
    btnIcon: HTMLButtonElement;
    rangeLabel: HTMLDivElement;
}

export const attachAtpDatePickerUI = (shadow: ShadowRoot, template: HTMLTemplateElement): AtpDatePickerDOM => {
    shadow.appendChild(template.content.cloneNode(true));
    return {
        wrapper: shadow.getElementById('wrapper') as HTMLDivElement,
        input: shadow.getElementById('input') as HTMLInputElement,
        btnClear: shadow.getElementById('btn-clear') as HTMLButtonElement,
        btnIcon: shadow.getElementById('btn-icon') as HTMLButtonElement,
        rangeLabel: shadow.getElementById('range-label') as HTMLDivElement,
    };
};
