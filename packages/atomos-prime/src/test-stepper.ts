import { defineAtpStepper } from './features/stepper/atp-stepper/atp-stepper.js';
import { createAtpStep } from './features/stepper/create-atp-step.js';
import { createAtpStepperTab } from './features/stepper/create-atp-stepper-tab.js';

// Auto-register components required for the stepper
defineAtpStepper();
createAtpStep();
createAtpStepperTab();

// Find stepper and add event listeners purely for console verification
const stepper = document.querySelector('atp-stepper') as any;

if (stepper) {
    stepper.addEventListener('stepper-navigation', (e: any) => {
        console.log('[Stepper] Navigation occurred, current step:', e.detail.currentStepId);
    });

    stepper.addEventListener('stepper-intent-next', (e: any) => {
        console.log('[Stepper] Intent Next:', e.detail);
        // Usually an adapter validates here before manually jumping the step.
        // For the pure component, we'll auto-advance in the demo:
        stepper.currentStepId = e.detail.nextStepId;
    });

    stepper.addEventListener('stepper-intent-goto', (e: any) => {
        console.log('[Stepper] Intent Goto:', e.detail);
        stepper.currentStepId = e.detail.requestedStepId;
    });
    
    stepper.addEventListener('stepper-submit', () => {
        console.log('[Stepper] Submit Triggered!');
        alert('Form Submitted successfully!');
    });
}
