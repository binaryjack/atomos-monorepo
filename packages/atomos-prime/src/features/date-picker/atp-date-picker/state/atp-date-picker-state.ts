import { createDpDrawer } from '../../dp-drawer.js';
import { formatDate } from '../../date-utils.js';
import type { AtpDatePickerDOM } from '../ui/atp-date-picker-ui.js';
import type { DpDrawerResult } from '../../dp-drawer.js';

export interface AtpDatePickerHost extends HTMLElement {
    format: string;
    selectionMode: string;
    value: string;
    disabledState: boolean;
    placeholder: string;
    name: string;
    drawer: DpDrawerResult | null;
}

export const syncAttributes = (host: AtpDatePickerHost, dom: AtpDatePickerDOM) => {
    dom.input.placeholder = host.placeholder || host.format;
    dom.input.name = host.name;
    dom.input.disabled = host.disabledState;
    dom.btnIcon.disabled = host.disabledState;

    if (host.selectionMode === 'range') {
        const parts = host.value.split(' → ');
        if (parts.length === 2) {
            dom.input.value = host.value;
            dom.rangeLabel.textContent = host.value;
            dom.rangeLabel.classList.remove('hidden');
        } else {
            dom.input.value = host.value;
            dom.rangeLabel.classList.add('hidden');
        }
    } else {
        dom.input.value = host.value;
        dom.rangeLabel.classList.add('hidden');
    }

    if (host.value) {
        dom.btnClear.classList.remove('hidden');
    } else {
        dom.btnClear.classList.add('hidden');
    }
};

export const handleOpenPicker = (host: AtpDatePickerHost, dom: AtpDatePickerDOM) => {
    if (host.disabledState) return;

    if (!host.drawer) {
        // Init drawer lazily
        host.drawer = createDpDrawer({
            anchor: dom.btnIcon,
            selectionMode: host.selectionMode as any,
            format: host.format as any,
            disabled: host.disabledState,
            onSelect: (ts, date) => {
                const str = formatDate(date, host.format as any);
                host.value = str;
                dom.input.value = str;
                dom.btnClear.classList.remove('hidden');
                host.dispatchEvent(new CustomEvent('change', { detail: { value: str, date }, bubbles: true }));
            },
            onRangeSelect: (start, end) => {
                const s = formatDate(start, host.format as any);
                const e = formatDate(end, host.format as any);
                const combined = s + ' → ' + e;
                host.value = combined;
                dom.input.value = combined;
                dom.rangeLabel.textContent = combined;
                dom.rangeLabel.classList.remove('hidden');
                dom.btnClear.classList.remove('hidden');
                
                host.dispatchEvent(new CustomEvent('change', { detail: { value: combined, start, end }, bubbles: true }));
                host.dispatchEvent(new CustomEvent('range-change', { detail: { from: s, to: e, start, end }, bubbles: true }));
            }
        });
    }

    host.drawer.toggle();
};

export const handleClear = (host: AtpDatePickerHost, dom: AtpDatePickerDOM, e: Event) => {
    e.stopPropagation();
    host.value = '';
    dom.input.value = '';
    dom.btnClear.classList.add('hidden');
    dom.rangeLabel.textContent = '';
    dom.rangeLabel.classList.add('hidden');
    
    if (host.drawer) {
        host.drawer.close();
    }
    
    // dispatch a clear change
    host.dispatchEvent(new CustomEvent('change', { detail: { value: '', date: null }, bubbles: true }));
};

