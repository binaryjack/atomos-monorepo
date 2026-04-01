import type { InputDataTypes } from '@binaryjack/formular.dev';
import { newEvent, EventsEnum } from '@binaryjack/formular.dev';
import { createDropdown } from '../../dropdown/create-dropdown.js';
import '../vbs-field-set.js';
import '../vbs-validation-result.js';
import type { VbsValidationResult } from '../vbs-validation-result.js';
import type { FormularAtomProps, FormularAtomResult } from '../types/formular-atom.types.js';

export interface FormularDropdownOption {
  readonly value: string;
  readonly label: string;
}

export interface FormularDropdownProps extends FormularAtomProps {
  readonly options: FormularDropdownOption[];
  readonly placeholder?: string;
}

export const createFormularDropdown = function(props: FormularDropdownProps): FormularAtomResult {
  const { fieldName, form, label, guide, options, placeholder } = props;
  const cleanups: Array<() => void> = [];

  let validation!: VbsValidationResult;

  const dropResult = createDropdown({
    options,
    ...(placeholder !== undefined ? { placeholder } : {}),
    onChange: (value) => form.updateField(fieldName, value as InputDataTypes),
  });
  dropResult.select.slot = 'input';
  dropResult.select.style.cssText = [
    'width:100%',
    'box-sizing:border-box',
    'padding:8px 12px',
    'background:#1e293b',
    'border:1px solid #334155',
    'border-radius:6px',
    'color:#f1f5f9',
    'font-size:14px',
    'outline:none',
  ].join(';');
  cleanups.push(() => dropResult.cleanup.destroy());

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
  dropResult.select.addEventListener('focus', focusHandler);
  dropResult.select.addEventListener('blur', blurHandler);
  cleanups.push(() => {
    dropResult.select.removeEventListener('focus', focusHandler);
    dropResult.select.removeEventListener('blur', blurHandler);
  });

  const fieldObj = form.getField(fieldName);
  if (fieldObj) {
    const val = (fieldObj.input as unknown as { value: InputDataTypes }).value;
    if (val != null) dropResult.select.value = String(val);
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
  fieldSet.appendChild(dropResult.select);
  fieldSet.appendChild(validation);

  return {
    element: fieldSet,
    refresh: () => validation.refresh(),
    cleanup: { destroy: () => cleanups.forEach(fn => fn()) },
  };
};
