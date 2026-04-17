# Release Notes

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- **`schema-create-auto` intent action** — The schema tab bar now dispatches a lightweight `schema-create-auto` action instead of generating an ID and firing `schema-created` directly. In standalone mode the Redux reducer handles it. When an MCP server URL is configured the canvas page intercepts the action via a dispatch hook, forwards the request to the MCP server, and the SSE `schema-created` event closes the loop. This eliminates duplicate ID generation between the UI and the server. ([`create-schema-tabs.ts`](packages/atomos-structura/src/preview/create-schema-tabs.ts), [`create-redux-store.ts`](packages/atomos-structura/src/core/create-redux-store.ts), [`create-canvas-page.ts`](packages/atomos-structura/src/preview/create-canvas-page.ts))

- **`addDispatchHook` on `ReduxStore`** — A lightweight middleware hook that lets consumers intercept Redux actions before they reach the reducer. Returning `null` from a hook swallows the action; returning the action (or a replacement) forwards it. Used internally to route `schema-create-auto` to MCP. ([`redux-state.types.ts`](packages/atomos-structura/src/types/redux-state.types.ts), [`create-redux-store.ts`](packages/atomos-structura/src/core/create-redux-store.ts))

- **Canvas adapter registry** — `getCanvasAdapterFor(schemaId)` replaces the global singleton canvas adapter. Each schema ID maps to its own `CanvasAdapter` instance, preventing cross-schema state pollution when multiple panels are open simultaneously. The old `getCanvasAdapter()` is kept as deprecated. ([`canvas-adapter.ts`](packages/atomos-structura/src/core/adapters/canvas-adapter.ts))

- **Explicit `schema_id` in MCP entity/link tools** — `create-entity`, `update-entity`, `delete-entity`, `create-link` now require a `schema_id` parameter and return `400` when it is absent or `404` when the schema is not found. `get-entity` falls back to the active schema for backwards compatibility. The `change` SSE event payload now includes `schema_id`. ([`mcp-server.ts`](packages/atomos-structura-mcp/src/mcp-server.ts))

- **Template injection tokens** — `webview/template.html` now ships with `${mcpUrl}` and `${schemaId}` tokens instead of a commented-out placeholder. Consuming extensions call `.replaceAll('${mcpUrl}', url)` and `.replaceAll('${schemaId}', id)` inside `buildHtml`. Empty strings are treated as `undefined` by the webview init, preserving standalone-mode behaviour. ([`template.html`](packages/atomos-structura/webview/template.html), [`webview/index.ts`](packages/atomos-structura/src/webview/index.ts))

- **Single-file IIFE build** — `pnpm run build:webview-iife` (env `BUILD_TARGET=webview-iife`) produces `dist/webview/index.iife.js` — a self-contained bundle with no dynamic imports and the global name `StructuraWebview`. Recommended for VSIX-packaged extensions where ES module dynamic imports are unreliable. ([`vite.config.ts`](packages/atomos-structura/vite.config.ts), [`package.json`](packages/atomos-structura/package.json))

- **`__APP_VERSION__` build constant** — `vite.config.ts` injects `__APP_VERSION__` from `package.json` at build time. Used by the new About modal. ([`vite.config.ts`](packages/atomos-structura/vite.config.ts))

- **About modal** — New `createAboutModal()` utility renders the package name, version (from `__APP_VERSION__`), MIT licence notice, and links to documentation and the repository. Accessible via the toolbar burger menu ("About" button with info icon). ([`create-about-modal.ts`](packages/atomos-structura/src/features/modal/create-about-modal.ts), [`create-canvas-toolbar.ts`](packages/atomos-structura/src/preview/create-canvas-toolbar.ts))

- **`--atp-modal-padding` CSS custom property** — The `atp-modal` shadow DOM `.dialog` now accepts `--atp-modal-padding` (default `0 4px`) so consuming applications can adjust internal padding without replacing the entire style. ([`atp-modal.style.ts`](packages/atomos-prime/src/features/modal/atp-modal/style/atp-modal.style.ts))

### Changed

- **`create-mcp-sync.ts`** — `applyChange` now reads `schema_id` from the SSE payload and applies the update to that specific schema rather than always targeting the active schema. ([`create-mcp-sync.ts`](packages/atomos-structura/src/features/mcp-sync/create-mcp-sync.ts))

- **Entity settings modal button style** — Removed hardcoded `height: 24px; min-height: 24px` override on `addPropBtn`; size is now determined by padding alone, matching other toolbar buttons. ([`create-entity-settings-modal.ts`](packages/atomos-structura/src/features/modal/create-entity-settings-modal.ts))

### Documentation

- **`EXTENSION_GUIDE.md`** — Updated `buildHtml` sample to use token replacements; added "Instance Isolation" and "Single-bundle IIFE" sections. ([`EXTENSION_GUIDE.md`](packages/atomos-structura/EXTENSION_GUIDE.md))

- **`structura-mcp/README.md`** — Added "Targeting a specific schema" section with `schema_id` usage examples and SSE routing pattern. ([`README.md`](packages/atomos-structura-mcp/README.md))

- **`docs/IMPLEMENTATION_STATUS.md`** — Added architectural change note block documenting the v1.2.0 isolation improvements. ([`IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md))

---

## [1.1.5] — 2026-04-14

- Initial production release of `@atomos-web/structura`, `@atomos-web/structura-core`, `@atomos-web/structura-mcp`.
- 20+ MCP tools for AI-driven schema creation.
- Viewport control, session lifecycle, availability guards, menu configuration.
- Export/import (JSON workspace, SVG, PNG).
- Redux undo/redo with history skip for volatile actions.
- `@atomos-web/prime` web component library: `atp-modal`, `atp-dropdown`, design system tokens.
