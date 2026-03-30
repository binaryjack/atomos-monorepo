# Redux DevTools Integration

## Overview

The VBS application now includes **Redux DevTools Extension** integration for real-time debugging and state inspection. This provides professional-grade debugging capabilities for both Canvas and Schema operations.

## Setup

### 1. Install Redux DevTools Extension

Download and install the Redux DevTools browser extension:
- **Chrome**: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- **Firefox**: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
- **Edge**: [Redux DevTools](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei)

### 2. Open Development Tools

1. Open your browser's Developer Tools (F12)
2. Look for the **"Redux"** tab
3. If not visible, click the ">>" arrow to find it in the overflow menu

## Connected Stores

The application connects **two separate store instances** to Redux DevTools:

### 1. VBS Canvas Store
- **Purpose**: Canvas-level operations (entities, links, viewport)
- **Actions**: `entity/add`, `entity/update`, `entity/move`, `link/add`, `viewport/update`, etc.
- **State**: Canvas entities, links, viewport zoom/pan, selected entities

### 2. VBS Schema Store  
- **Purpose**: Schema-level operations (entity properties, validation, persistence)
- **Actions**: `SCHEMA/ENTITY_ADDED`, `SCHEMA/ENTITY_UPDATED`, `SCHEMA/ENTITY_PROPERTY_UPDATED`
- **State**: Schema entities, properties, validation rules, canvas positions

## Features

### 🔍 **State Inspection**
- View complete store state in real-time
- Drill down into nested objects and arrays
- See state differences between actions

### 📊 **Action Monitoring**
- Track every dispatched action with timestamp
- View action payloads and metadata
- Filter actions by type or search

### ⏪ **Time Travel Debugging**
- Jump to any previous state
- Replay actions step by step
- Compare states at different points in time

### 📈 **Performance Monitoring**
- Track action dispatch timing
- Monitor state update performance
- Identify slow operations

## Test Page

Visit `test-redux-devtools.html` to see the integration in action:

```bash
# Start the server
pnpm demo

# Navigate to
http://localhost:3001/web-ui/test-redux-devtools.html
```

### Available Test Operations

#### Canvas Store Operations
- **Add Canvas Entity**: Creates moveable entities on the canvas
- **Move Random Entity**: Demonstrates position updates
- **Create Link**: Links entities together
- **Clear Canvas**: Resets canvas state

#### Schema Store Operations
- **Create Schema Entity**: Creates entities with properties
- **Add Property**: Adds new properties to entities
- **Update Property (Modal Simulation)**: Simulates property modal updates
- **Update Validation**: Demonstrates validation rule changes

#### Complex Workflows
- **Simulate Complex Workflow**: Runs a multi-step operation sequence
- **Show Store States**: Logs current state to console

## Key Benefits

### 🐛 **Debugging Property Modal Issues**
The Redux DevTools integration was specifically implemented to debug the property modal persistence issues. You can now:

1. **Track Property Updates**: See exactly when and how properties change
2. **Monitor Redux Actions**: Verify that property changes trigger `entity-updated` actions
3. **Inspect State Persistence**: Watch localStorage updates happen in real-time
4. **Debug the Full Chain**: From modal → entity store → schema store → Redux → localStorage

### 🔧 **Development Workflow**
- **Real-time State Monitoring**: See state changes as you interact with the UI
- **Action History**: Track the sequence of operations that led to any state
- **State Comparison**: Compare states before and after problematic operations
- **Performance Profiling**: Identify bottlenecks in state updates

### 📝 **Property Modal Debugging Example**

1. Open Redux DevTools
2. Create an entity with properties
3. Open property modal and make changes  
4. Watch the following action sequence:
   ```
   SCHEMA/ENTITY_PROPERTY_UPDATED (source: 'property-modal')
   ↓
   entity-updated (Redux persistence)
   ↓
   localStorage update
   ```

## Implementation Details

### Canvas Store Integration
```typescript
// In create-store.ts
const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: 'VBS Canvas Store',
  trace: true,
  traceLimit: 25
});

// On every dispatch
if (devTools) {
  devTools.send(action, state);
}
```

### Schema Store Integration
```typescript
// In create-schema-store.ts
const schemaDevTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: 'VBS Schema Store', 
  trace: true,
  traceLimit: 25
});

// On property updates
schemaDevTools.send({
  type: 'SCHEMA/ENTITY_PROPERTY_UPDATED',
  payload: { 
    entityId, 
    properties,
    source: 'property-modal' 
  }
}, { schema: updatedSchema });
```

## Troubleshooting

### DevTools Not Appearing
1. Ensure Redux DevTools extension is installed and enabled
2. Refresh the page after installing the extension
3. Check browser console for connection messages:
   - `🔧 Redux DevTools connected to Canvas Store`  
   - `🔧 Redux DevTools connected to Schema Store`

### Actions Not Showing
- Verify you're interacting with connected components
- Check that actions are being dispatched (console logs)
- Ensure you're looking at the correct store instance

### State Not Updating
- Confirm state changes are triggering re-renders
- Check for state mutations (should be immutable updates)
- Verify subscription callbacks are firing

## Future Enhancements

- **Custom Action Creators**: More descriptive action metadata
- **State Snapshots**: Save/load specific application states  
- **Performance Metrics**: Built-in timing and memory usage tracking
- **Action Middleware**: Custom action processing and logging