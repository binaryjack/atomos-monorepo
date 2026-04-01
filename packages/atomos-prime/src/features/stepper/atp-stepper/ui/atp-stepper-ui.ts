import { atpStepperStyle } from '../style/atp-stepper-style';

export const createAtpStepperTemplate = (): HTMLTemplateElement => {
    const template = document.createElement('template');
    template.innerHTML = `
        <style>${atpStepperStyle}</style>

        <header class="stepper-header">
            <slot name="header">
               <!-- Default Breadcrumb Tabs will generate here -->
               <div id="breadcrumb-container" style="display: flex; gap: 1rem;"></div>
            </slot>
        </header>

        <div class="stepper-content">
            <!-- Content Steps go here -->
            <slot></slot>
        </div>

        <footer class="stepper-footer">
            <slot name="footer">
                <button id="btn-back" class="btn btn-back" disabled>Back</button>
                <button id="btn-next" class="btn btn-next">Next</button>
            </slot>
        </footer>
    `;
    return template;
};

export interface AtpStepperDOM {
    btnBack: HTMLButtonElement;
    btnNext: HTMLButtonElement;
    breadcrumbContainer: HTMLDivElement;
}

export const attachAtpStepperUI = (shadow: ShadowRoot, template: HTMLTemplateElement): AtpStepperDOM => {
    shadow.appendChild(template.content.cloneNode(true));

    return {
        btnBack: shadow.getElementById('btn-back') as HTMLButtonElement,
        btnNext: shadow.getElementById('btn-next') as HTMLButtonElement,
        breadcrumbContainer: shadow.getElementById('breadcrumb-container') as HTMLDivElement
    };
};
