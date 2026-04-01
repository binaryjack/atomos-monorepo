import type { InputDataTypes } from '@binaryjack/formular.dev';
import { newEvent, EventsEnum } from '@binaryjack/formular.dev';
import { createTextarea } from '../../textarea/create-textarea.js';
import '../vbs-field-set.js';
import '../vbs-validation-result.js';
import type { VbsValidationResult } from '../vbs-validation-result.js';
import type { FormularAtomProps, FormularAtomResult } from '../types/formular-atom.types.js';

export interface FormularTextareaProps extends FormularAtomProps {
  readonly placeholder?: string;
  readonly rows?: number;
}

export const createFormularTextarea = function(props: FormularTextareaProps): FormularAtomResult {
  const { fieldName, form, label, guide, placeholder, rows } = props;
  const cleanups: Array<() => void> = [];

  let validation!: VbsValidationResult;

  const taResult = createTextarea({
    ...(placeholder !== undefined ? { placeholder } : {}),
    ...(rows !== undefined ? { rows } : {}),
    onInput: (value) => form.updateField(fieldName, value as InputDataTypes),
  });
  taResult.element.slot = 'input';
  taResult.element.style.cssText = [
    'width:100%',
    'box-sizing:border-box',
    'padding:8px 12px',
    'background:#1e293b',
    'border:1px solid #334155',
    'border-radius:6px',
    'color:#f1f5f9',
    'font-size:14px',
    'outline:none',
    'resize:vertical',
  ].join(';');
  cleanups.push(() => taResult.cleanup.destroy());

  const focusHandler = () => validation.setFocused(true);
  const blurHandler = () => {
    const fld = form.getField(fieldName);
    const afterValidate = () => validation.setFocused(false);
    if (fld) {
      (fld.input as unknown as { handleValidationAsync: (e: unknown) => Promise<unknown[]> })
        .handleValidationAsync(newEvent(fieldName, 'vbs', EventsEnum.onBlur, 'blur', fieldName, fld))
        .then(afterValidate)
        .catch(afterValidate);
    } else {
      afterValidate();
    }
  };
  taResult.element.addEventListener('focus', focusHandler);
  taResult.element.addEventListener('blur', blurHandler);
  cleanups.push(() => {
    taResult.element.removeEventListener('focus', focusHandler);
    taResult.element.removeEventListener('blur', blurHandler);
  });

  const fieldObj = form.getField(fieldName);
  if (fieldObj) {
    const val = (fieldObj.input as unknown as { value: InputDataTypes }).value;
    if (val != null) taResult.element.value = String(val);
  }

  validation = document.createElement('vbs-validation-result') as VbsValidationResult;
  validation.slot = 'validation';
  validation.form = form;
  validation.fieldName = fieldName;
  if (guide) validation.guideText = guide;

  const fieldSet = document.createElement('vbs-field-set');
  if (label) {
    const labelEl = document.createElement('label');
    labelEl.slot = 'label';
    labelEl.htmlFor = fieldName;
    labelEl.textContent = label;
    fieldSet.appendChild(labelEl);
  }
  fieldSet.appendChild(taResult.element);
  fieldSet.appendChild(validation);

  return {
    element: fieldSet,
    refresh: () => validation.refresh(),
    cleanup: { destroy: () => cleanups.forEach(fn => fn()) },
  };
};
