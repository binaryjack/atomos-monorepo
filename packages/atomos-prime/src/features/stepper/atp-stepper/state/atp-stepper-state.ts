import type { StepperNavigationRequest } from '../../types/stepper.types.js';
import type { AtpStepperDOM } from '../ui/atp-stepper-ui.js';

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

    steps.forEach((step: any) => {
        const stepIdAttr = step.getAttribute('step-id');
        const resolvedStepId = stepIdAttr ? parseInt(stepIdAttr, 10) : step.stepId;
        const isMatch = resolvedStepId === currentId;
        
        if (isMatch) {
            step.setAttribute('is-active', '');
            if ('isActive' in step) step.isActive = true;
        } else {
            step.removeAttribute('is-active');
            if ('isActive' in step) step.isActive = false;
        }
    });

    // Update matching tabs
    const tabs = Array.from(dom.breadcrumbContainer.querySelectorAll('atp-stepper-tab')) as any[];
    tabs.forEach(tab => {
        const tabIdAttr = tab.getAttribute('step-id');
        const resolvedTabId = tabIdAttr ? parseInt(tabIdAttr, 10) : tab.stepId;
        const isMatch = resolvedTabId === currentId;

        if (isMatch) {
            tab.setAttribute('is-active', '');
            if ('isActive' in tab) tab.isActive = true;
        } else {
            tab.removeAttribute('is-active');
            if ('isActive' in tab) tab.isActive = false;
        }
    });
};

export const updateFooterState = (host: AtpStepperHost, dom: AtpStepperDOM) => {
    const steps = getSteps(host);
    const currentIndex = steps.findIndex((step: any) => {
        const stepIdAttr = step.getAttribute('step-id');
        const resolvedStepId = stepIdAttr ? parseInt(stepIdAttr, 10) : step.stepId;
        return resolvedStepId === host.currentStepId;
    });

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
    const steps = getSteps(host) as any[];
    const currentIndex = steps.findIndex((step: any) => {
        const stepIdAttr = step.getAttribute('step-id');
        const resolvedStepId = stepIdAttr ? parseInt(stepIdAttr, 10) : step.stepId;
        return resolvedStepId === host.currentStepId;
    });

    const getResolvedId = (step: any) => {
        const attr = step.getAttribute('step-id');
        return attr ? parseInt(attr, 10) : step.stepId;
    };

    if (direction === 'next') {
        if (currentIndex < steps.length - 1) {
            host.dispatchEvent(new CustomEvent('stepper-intent-next', {
                bubbles: true,
                composed: true,
                detail: {
                    currentStepId: host.currentStepId,
                    nextStepId: getResolvedId(steps[currentIndex + 1])
                }
            }));
            host.currentStepId = getResolvedId(steps[currentIndex + 1]);
        } else if (currentIndex === steps.length - 1) {
            host.dispatchEvent(new CustomEvent('stepper-submit', {
                bubbles: true,
                composed: true
            }));
        }
    } else if (direction === 'back') {
        if (currentIndex > 0) {
            host.currentStepId = getResolvedId(steps[currentIndex - 1]);
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
