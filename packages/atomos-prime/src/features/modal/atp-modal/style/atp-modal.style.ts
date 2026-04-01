export const atpModalStyle = `
  :host { display: contents; }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.78);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* wrapper is pass-through: pointer-events: none → clicks outside dialog hit the backdrop */
  .wrapper {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    pointer-events: none;
  }

  .dialog {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.04);
    display: flex;
    flex-direction: column;
    width: var(--atp-modal-width, 480px);
    max-width: 100%;
    max-height: 85vh;
    overflow: hidden;
    pointer-events: all;
    will-change: transform, opacity;
  }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    color: #cbd5e1;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    scrollbar-width: thin;
    scrollbar-color: #334155 transparent;
  }
  .body::-webkit-scrollbar { width: 6px; }
  .body::-webkit-scrollbar-track { background: transparent; }
  .body::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
`;
