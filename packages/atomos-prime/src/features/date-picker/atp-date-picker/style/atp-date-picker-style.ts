export const datePickerStyle = `
  :host {
    display: inline-block;
  }
  .dp-wrapper { 
    position: relative; 
    display: inline-flex; 
    flex-direction: column; 
  }
  .dp-input-row { 
    display: flex; 
    align-items: center; 
    gap: 0.25rem; 
  }
  .dp-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background-color: white;
    cursor: pointer;
  }
  .dp-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #60a5fa;
  }
  .dp-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .dp-clear, .dp-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.25rem;
  }
  .dp-clear {
    width: 1.5rem;
    height: 1.5rem;
    color: #9ca3af;
    font-size: 1rem;
  }
  .dp-clear:hover {
    color: #4b5563;
    background-color: #f3f4f6;
  }
  .dp-icon {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }
  .dp-icon:hover {
    background-color: #f3f4f6;
  }
  .dp-icon:focus {
    outline: none;
    box-shadow: 0 0 0 2px #60a5fa;
  }
  .dp-range-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
    display: none;
  }
  .hidden {
    display: none !important;
  }
`;
