# Headless API & MCP Integration

Atomos Structura supports powerful headless embedding and external control mechanisms. This allows host applications to bypass the built-in user interfaces and build entirely custom, agentic, or highly restricted environments using the Model Context Protocol (MCP) and Headless API.

## Headless Mode & Custom Menus

You can granularly control or completely disable the default toolbars using the `menu` property inside `WorkspaceConfig`.

```typescript
const config: WorkspaceConfig = {
  // Hides the zoom and export buttons from the UI
  menu: {
    zoom: { available: false },
    export: { available: false }
  }
}
```

To run completely headless (no settings panels, no internal overlays), simply pass `headless: true`.

## Responsive Compact Read-Only Mode

Atomos Structura is built using CSS Container Queries to be extremely resilient in embedded widget environments (like split panes). 

When the canvas container shrinks below **400px** in width, it automatically enters a **Compact Read-Only Mode**.
* All UI toolbars and burger menus are automatically hidden via CSS.
* Node dragging and linking interactions are disabled (`pointer-events: none`).
* Pan and Zoom gestures remain active so users can explore the graph.

### Hover Zones

To provide UX guidance when the widget shrinks to read-only mode, you can inject an invisible hover zone. When hovered, this zone reveals a tooltip to the user.

```typescript
const config: WorkspaceConfig = {
  hoverZoneMessage: {
    zone: 'bottom', // 'top' | 'bottom' | 'left' | 'right' | 'all'
    text: 'Enlarge the canvas to regain editability'
  }
}
```

## MCP External Control

The Atomos Structura MCP Server exposes standard schema manipulation tools:
* `atomos-structura/create-entity`
* `atomos-structura/create-link`
* `atomos-structura/delete-entity`

By combining the **Headless API** (to hide the default palette) and **MCP** (to manipulate the graph from the outside), you can build completely custom toolboxes or chat-driven entity generation interfaces that directly mutate the canvas state.
