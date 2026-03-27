export interface Command {
  readonly execute: () => void;
  readonly undo: () => void;
  readonly description: string;
}

export interface CommandBus {
  readonly dispatch: (command: Command) => void;
  readonly undo: () => boolean;
  readonly redo: () => boolean;
  readonly can_undo: () => boolean;
  readonly can_redo: () => boolean;
  readonly clear_history: () => void;
}