import { CanvasState, StoreAction, Store } from '../types/store.types.js';

export const createStore = function(): Store {
  const initialState: CanvasState = {
    entities: {},
    links: {},
    viewport: { zoom: 1, panX: 0, panY: 0 },
    selectedEntityId: null
  };

  let state = initialState;
  const listeners: Array<(state: CanvasState) => void> = [];

  const reducer = function(currentState: CanvasState, action: StoreAction): CanvasState {
    console.log('Store reducer:', action.type, 'payload' in action ? action.payload : 'no payload');

    switch (action.type) {
      case 'entity/add': {
        return {
          ...currentState,
          entities: {
            ...currentState.entities,
            [action.payload.id]: action.payload
          }
        };
      }

      case 'entity/update': {
        const existingEntity = currentState.entities[action.payload.id];
        if (!existingEntity) return currentState;

        return {
          ...currentState,
          entities: {
            ...currentState.entities,
            [action.payload.id]: {
              ...existingEntity,
              ...action.payload.changes
            }
          }
        };
      }

      case 'entity/remove': {
        const { [action.payload.id]: removed, ...remainingEntities } = currentState.entities;
        const remainingLinks = Object.fromEntries(
          Object.entries(currentState.links).filter(
            ([, link]) => link.sourceId !== action.payload.id && link.targetId !== action.payload.id
          )
        );

        return {
          ...currentState,
          entities: remainingEntities,
          links: remainingLinks,
          selectedEntityId: currentState.selectedEntityId === action.payload.id ? null : currentState.selectedEntityId
        };
      }

      case 'entity/select': {
        return {
          ...currentState,
          selectedEntityId: action.payload.id
        };
      }

      case 'link/add': {
        return {
          ...currentState,
          links: {
            ...currentState.links,
            [action.payload.id]: action.payload
          }
        };
      }

      case 'link/remove': {
        const { [action.payload.id]: removed, ...remainingLinks } = currentState.links;
        return {
          ...currentState,
          links: remainingLinks
        };
      }

      case 'viewport/update': {
        return {
          ...currentState,
          viewport: {
            ...currentState.viewport,
            ...action.payload
          }
        };
      }

      case 'canvas/load': {
        console.log('Loading canvas state:', action.payload);
        return action.payload;
      }

      case 'canvas/clear': {
        return initialState;
      }

      default: {
        return currentState;
      }
    }
  };

  const getState = function() {
    return state;
  };

  const dispatch = function(action: StoreAction) {
    const previousState = state;
    state = reducer(state, action);
    
    if (state !== previousState) {
      console.log('State changed:', { previous: previousState, current: state });
      listeners.forEach(listener => listener(state));
    }
  };

  const subscribe = function(listener: (state: CanvasState) => void) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return {
    getState,
    dispatch,
    subscribe
  };
};