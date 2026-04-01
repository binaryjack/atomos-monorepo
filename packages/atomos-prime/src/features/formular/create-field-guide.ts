import type { IFieldError, IFieldGuide } from '@binaryjack/formular.dev';
import type { FieldGuideProps, FieldGuideResult } from './types/field-guide.types.js';

export const createFieldGuide = function(props: FieldGuideProps): FieldGuideResult {
  const { fieldName, form, getIsFocused } = props;

  const element = document.createElement('div');
  element.className = 'vbs-field-guide';
  element.style.cssText = 'min-height:18px;margin-top:4px;font-size:12px;line-height:1.5;';
  element.style.display = 'none';

  const render = () => {
    const field = form.getField(fieldName);
    if (!field) {
      element.style.display = 'none';
      return;
    }

    const inp = field.input as unknown as {
      isFocus: boolean;
      isValid: boolean;
      errors: IFieldError[];
      guides: IFieldGuide[];
    };

    const focused = getIsFocused();
    const errors: IFieldError[] = inp.errors ?? [];
    const guides: IFieldGuide[] = inp.guides ?? [];

    element.innerHTML = '';

    if (focused && errors.length > 0 && guides.length > 0) {
      element.style.display = 'block';
      element.style.color = '#38bdf8';
      guides.forEach(g => {
        const p = document.createElement('p');
        p.style.cssText = 'margin:0;';
        p.textContent = g.message ?? g.code;
        element.appendChild(p);
      });
      return;
    }

    if (errors.length > 0) {
      element.style.display = 'block';
      element.style.color = '#f87171';
      errors.forEach(e => {
        const p = document.createElement('p');
        p.style.cssText = 'margin:0;';
        p.textContent = e.message ?? e.code;
        element.appendChild(p);
      });
      return;
    }

    element.style.display = 'none';
  };

  const unobserve = form.observe(fieldName, render);

  return {
    element,
    refresh: render,
    cleanup: {
      destroy: () => { unobserve(); },
    },
  };
};
