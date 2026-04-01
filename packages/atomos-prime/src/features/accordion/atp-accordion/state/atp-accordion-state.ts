export interface AtpAccordionHost extends HTMLElement {
    multiple: boolean;
}

export function handleAccordionToggle(host: AtpAccordionHost, item: HTMLElement) {
    if (!host.multiple) {
        const items = host.querySelectorAll('atp-accordion-item');
        items.forEach((child) => {
            if (child !== item && child.hasAttribute('expanded')) {
                child.removeAttribute('expanded');
            }
        });
    }
}