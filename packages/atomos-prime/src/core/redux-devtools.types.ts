// Redux DevTools Extension integration types
export interface ReduxDevToolsExtension {
  connect(options?: any): {
    send: (action: any, state: any) => void;
    init: (state: any) => void;
  };
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension;
  }
}