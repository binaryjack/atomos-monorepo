import type { Command, CommandBus } from '../types/command.types.js';

export const createCommandBus = function(): CommandBus {
  const history: Command[] = [];
  let position = -1;

  const dispatch = function(command: Command): void {
    console.log(`[COMMAND-BUS] Executing: ${command.description}`);
    
    try {
      command.execute();
      
      // Clear redo history when new command is executed
      history.splice(position + 1);
      history.push(command);
      position = history.length - 1;
      
      console.log(`[COMMAND-BUS] ✓ Command executed. History size: ${history.length}, position: ${position}`);
    } catch (err) {
      console.error(`[COMMAND-BUS] ✗ Command failed: ${command.description}:`, err);
    }
  };

  const undo = function(): boolean {
    if (position < 0) {
      console.log(`[COMMAND-BUS] Cannot undo - no commands in history`);
      return false;
    }
    
    const command = history[position];
    if (!command) {
      console.error(`[COMMAND-BUS] ✗ No command at position ${position}`);
      return false;
    }
    
    try {
      console.log(`[COMMAND-BUS] Undoing: ${command.description}`);
      command.undo();
      position--;
      console.log(`[COMMAND-BUS] ✓ Undo successful. Position: ${position}`);
      return true;
    } catch (err) {
      console.error(`[COMMAND-BUS] ✗ Undo failed:`, err);
      return false;
    }
  };

  const redo = function(): boolean {
    if (position >= history.length - 1) {
      console.log(`[COMMAND-BUS] Cannot redo - at latest command`);
      return false;
    }
    
    position++;
    const command = history[position];
    if (!command) {
      console.error(`[COMMAND-BUS] ✗ No command at position ${position}`);
      return false;
    }
    
    try {
      console.log(`[COMMAND-BUS] Redoing: ${command.description}`);
      command.execute();
      console.log(`[COMMAND-BUS] ✓ Redo successful. Position: ${position}`);
      return true;
    } catch (err) {
      console.error(`[COMMAND-BUS] ✗ Redo failed:`, err);
      return false;
    }
  };

  const can_undo = function(): boolean {
    return position >= 0;
  };

  const can_redo = function(): boolean {
    return position < history.length - 1;
  };

  const clear_history = function(): void {
    history.length = 0;
    position = -1;
    console.log(`[COMMAND-BUS] History cleared`);
  };

  return { dispatch, undo, redo, can_undo, can_redo, clear_history };
};