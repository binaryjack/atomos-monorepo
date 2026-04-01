export type ValidationMode = 'default' | 'field' | 'all' | 'step';

export type StepperNavigationRequest = 'back' | 'next' | 'goto' | 'unset';

export interface StepField {
    name: string;
    defaultValue?: unknown;
    isRequired?: boolean;
}

export interface StepItem {
    id: number;
    label: string;
    isActive: boolean;
    isValid?: boolean;
    isVisible: boolean;
    isLocked: boolean;
    isTouched: boolean;
    isDirty: boolean;
    fields?: StepField[];
    hasBeenValidated: boolean;
}

export interface StepperError {
    stepId: number;
    fieldName: string;
    error: Error;
}

export interface StepperSibling {
    previousStep?: StepItem;
    currentStep?: StepItem;
    nextStep?: StepItem;
    canGoBack: boolean;
    canGoNext: boolean;
    isLast: boolean;
    isFirst: boolean;
    direction: 'forward' | 'backward';
}

export interface StepperState {
    steps: StepItem[];
    errors: StepperError[];
    sibling?: StepperSibling;
    currentStepId: number;
    previousStepId?: number;
    navigationRequest: StepperNavigationRequest;
    isValid: boolean;
    submitRequest: boolean;
    ready: boolean;
}

export interface FormAdapter {
    getFormState: () => {
        errors: Record<string, unknown>;
        touchedFields: Record<string, unknown>;
        dirtyFields: Record<string, unknown>;
        isValidating: boolean;
        defaultValues?: Record<string, unknown>;
    };
    validateField: (name: string) => Promise<boolean>;
    validateForm: () => Promise<boolean>;
    getFieldValue: (name: string) => unknown;
    setFieldValue: (name: string, value: unknown) => void;
}
