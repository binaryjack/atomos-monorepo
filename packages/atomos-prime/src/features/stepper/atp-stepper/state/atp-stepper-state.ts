import type { StepperNavigationRequest } from '../../types/stepper.types';
import type { AtpStepperDOM } from '../ui/atp-stepper-ui';

export interface AtpStepperHost extends HTMLElement {
    currentStepId: number;
    enableFooter: boolean;
}

export const syncSteps = (host: AtpStepperHost, dom: AtpStepperDOM) => {
    // Check if current-step-id is set, otherwise default to first step
    if (!host.hasAttribute('current-step-id')) {
        const steps = getSteps(host);
        if (steps.length > 0) {
            host.currentStepId = steps[0].stepId;
        }
    } else {
        updateActiveStep(host, dom);
        updateFooterState(host, dom);
    }
    renderTabs(host, dom);
};

export const updateActiveStep = (host: AtpStepperHost, dom: AtpStepperDOM) => {
    const steps = getSteps(host);
    const currentId = host.currentStepId;

    steps.forEach(step => {
        step.isActive = step.stepId === currentId;
    });

    // Update matching tabs
    const tabs = Array.from(dom.breadcrumbContainer.querySelectorAll('atp-stepper-tab')) as any[];
    tabs.forEach(tab => {
        tab.isActive = tab.stepId === currentId;
    });
};

export const updateFooterState = (host: AtpStepperHost, dom: AtpStepperDOM) => {
    const steps = getSteps(host);
    const currentIndex = steps.findIndex(step => step.stepId === host.currentStepId);

    if (currentIndex <= 0) {
        dom.btnBack.setAttribute('disabled', 'true');
    } else {
        dom.btnBack.removeAttribute('disabled');
    }

    if (currentIndex === steps.length - 1) {
        dom.btnNext.textContent = 'Submit';
        dom.btnNext.classList.add('btn-submit');
    } else {
        dom.btnNext.textContent = 'Next';
        dom.btnNext.classList.remove('btn-submit');
    }
};

export const renderTabs = (host: AtpStepperHost, dom: AtpStepperDOM) => {
    const steps = getSteps(host);
    dom.breadcrumbContainer.innerHTML = '';

    steps.forEach((step, index) => {
        const tab = document.createElement('atp-stepper-tab') as any;
        tab.stepId = step.stepId;
        tab.label = step.label;
        tab.stepIndex = (index + 1).toString();

        if (step.stepId === host.currentStepId) {
            tab.isActive = true;
        }
        if (step.isValid) {
            tab.isValid = true;
        }

        dom.breadcrumbContainer.appendChild(tab);
    });
};

export const handleNavigation = (host: AtpStepperHost, dom: AtpStepperDOM, direction: StepperNavigationRequest) => {
    const steps = getSteps(host);
    const currentIndex = steps.findIndex(step => step.stepId === host.currentStepId);

    if (direction === 'next') {
        if (currentIndex < steps.length - 1) {
            host.dispatchEvent(new CustomEvent('stepper-intent-next', {
                bubbles: true,
                composed: true,
                detail: {
                    currentStepId: host.currentStepId,
                    nextStepId: (steps[currentIndex + 1] as any).stepId
                }
            }));
            host.currentStepId = (steps[currentIndex + 1] as any).stepId;
        } else if (currentIndex === steps.length - 1) {
            host.dispatchEvent(new CustomEvent('stepper-submit', {
                bubbles: true,
                composed: true
            }));
        }
    } else if (direction === 'back') {
        if (currentIndex > 0) {
            host.currentStepId = (steps[currentIndex - 1] as any).stepId;
        }
    }
};

export const handleTabClick = (host: AtpStepperHost, e: CustomEvent) => {
    const requestedStepId = e.detail.stepId;

    host.dispatchEvent(new CustomEvent('stepper-intent-goto', {
        bubbles: true,
        composed: true,
        detail: {
            currentStepId: host.currentStepId,
            requestedStepId: requestedStepId
        }
    }));
    host.currentStepId = requestedStepId;
};

// Utils
export const getSteps = (host: HTMLElement): any[] => {
    return Array.from(host.querySelectorAll('atp-step'));
};
