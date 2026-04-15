/**
 * Battle tests — webview API
 *
 * Tests run in Node (no DOM). The webview module depends on:
 *   - document.getElementById (for container lookup)
 *   - createCanvasPage (dom-heavy, mocked at module level)
 *   - createMcpSync via createMcpClient (EventSource, mocked)
 *
 * Strategy:
 *   - Mock createCanvasPage so we never touch real DOM
 *   - Mock EventSource so createMcpSync/createMcpClient run without a browser
 *   - Stub document.getElementById with a minimal element stand-in
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── EventSource mock ────────────────────────────────────────────────────────
class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  closed = false
  onerror: (() => void) | null = null
  private handlers: Record<string, ((e: { data: string }) => void)[]> = {}

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }
  addEventListener(type: string, fn: (e: { data: string }) => void) {
    (this.handlers[type] ??= []).push(fn)
  }
  emit(type: string, data: unknown) {
    this.handlers[type]?.forEach(fn => fn({ data: JSON.stringify(data) }))
  }
  close() { this.closed = true }
}

vi.stubGlobal('EventSource', MockEventSource)

// ── localStorage mock ───────────────────────────────────────────────────────
const makeLocalStorage = () => {
  const _store: Record<string, string> = {}
  return {
    getItem: (k: string) => _store[k] ?? null,
    setItem: (k: string, v: string) => { _store[k] = v },
    removeItem: (k: string) => { delete _store[k] },
    clear: () => { Object.keys(_store).forEach(k => delete _store[k]) },
    get length() { return Object.keys(_store).length },
    key: (i: number) => Object.keys(_store)[i] ?? null,
  }
}
vi.stubGlobal('localStorage', makeLocalStorage())

// ── DOM stub ────────────────────────────────────────────────────────────────
const makeElement = (id = 'app') => ({
  id,
  children: [] as unknown[],
  style: {} as CSSStyleDeclaration,
  appendChild(child: unknown) { this.children.push(child) },
})

// ── Mock createCanvasPage ───────────────────────────────────────────────────
// We test createCanvasPage deeply elsewhere (schema-builder-lifecycle, workspace-api).
// Here we only need to verify that webview/index.ts calls it correctly.
const mockDestroy = vi.fn()
const mockElement = makeElement('canvas-root')

vi.mock('../src/preview/create-canvas-page.js', () => ({
  createCanvasPage: vi.fn((_config?: unknown, _mcpUrl?: string) => ({
    element: mockElement,
    cleanup: { destroy: mockDestroy },
  })),
}))

// Import AFTER mocks are registered
import { initializeStructuraWebview } from '../src/webview/index.js'
import { createMcpClient } from '../src/webview/mcp-client.js'
import { createCanvasPage } from '../src/preview/create-canvas-page.js'

// ───────────────────────────────────────────────────────────────────────────
describe('initializeStructuraWebview', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    MockEventSource.instances = []
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Container resolution ──────────────────────────────────────────────────

  it('throws when the container element is not found', async () => {
    vi.stubGlobal('document', { getElementById: () => null })

    await expect(
      initializeStructuraWebview({ containerId: 'missing' })
    ).rejects.toThrow('[Structura Webview] Container element #missing not found')
  })

  it('uses #app as the default containerId', async () => {
    const container = makeElement('app')
    vi.stubGlobal('document', { getElementById: (id: string) => id === 'app' ? container : null })

    await initializeStructuraWebview()

    expect(container.children).toContain(mockElement)
  })

  it('accepts a custom containerId', async () => {
    const container = makeElement('custom')
    vi.stubGlobal('document', { getElementById: (id: string) => id === 'custom' ? container : null })

    await initializeStructuraWebview({ containerId: 'custom' })

    expect(container.children).toContain(mockElement)
  })

  // ── createCanvasPage forwarding ───────────────────────────────────────────

  it('calls createCanvasPage with workspaceConfig and mcpServerUrl', async () => {
    const container = makeElement('app')
    vi.stubGlobal('document', { getElementById: () => container })

    const workspaceConfig = { headless: true } as never
    await initializeStructuraWebview({
      mcpServerUrl: 'http://localhost:9743',
      workspaceConfig,
    })

    expect(createCanvasPage).toHaveBeenCalledWith(workspaceConfig, 'http://localhost:9743')
  })

  it('calls createCanvasPage with undefined mcpServerUrl when not provided', async () => {
    const container = makeElement('app')
    vi.stubGlobal('document', { getElementById: () => container })

    await initializeStructuraWebview()

    expect(createCanvasPage).toHaveBeenCalledWith(undefined, undefined)
  })

  it('mounts the canvas element into the container', async () => {
    const container = makeElement('app')
    vi.stubGlobal('document', { getElementById: () => container })

    const app = await initializeStructuraWebview()

    expect(app.element).toBe(mockElement)
    expect(container.children).toContain(mockElement)
  })

  // ── WebviewApp.disconnect ─────────────────────────────────────────────────

  it('disconnect() calls page.cleanup.destroy()', async () => {
    const container = makeElement('app')
    vi.stubGlobal('document', { getElementById: () => container })

    const app = await initializeStructuraWebview()
    await app.disconnect()

    expect(mockDestroy).toHaveBeenCalledOnce()
  })

  it('disconnect() is safe to call multiple times', async () => {
    const container = makeElement('app')
    vi.stubGlobal('document', { getElementById: () => container })

    const app = await initializeStructuraWebview()
    await app.disconnect()
    await app.disconnect()

    expect(mockDestroy).toHaveBeenCalledTimes(2)
  })
})

// ───────────────────────────────────────────────────────────────────────────
describe('createMcpClient', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    MockEventSource.instances = []
  })

  const makeStore = () => {
    let state = {
      workspace: {
        active_canvas_id: 'c1',
        canvases: { c1: { active_schema_id: 's1', schemas: { s1: { entities: [], links: [] } }, viewport: { pan: { x: 0, y: 0 }, zoom: 1 } } }
      }
    }
    const listeners: Array<(s: typeof state) => void> = []
    return {
      get_state: () => state,
      dispatch: vi.fn(),
      subscribe: (fn: (s: typeof state) => void) => { listeners.push(fn); return () => {} },
      undo: vi.fn(),
      redo: vi.fn(),
      _state: state,
    }
  }

  it('connected getter returns true immediately after construction', () => {
    const store = makeStore()
    const client = createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    expect(client.connected).toBe(true)
  })

  it('opens an EventSource to /events', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    expect(MockEventSource.instances).toHaveLength(1)
    expect(MockEventSource.instances[0].url).toBe('http://localhost:9743/events')
  })

  it('disconnect() sets connected to false', () => {
    const store = makeStore()
    const client = createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    client.disconnect()
    expect(client.connected).toBe(false)
  })

  it('disconnect() closes the EventSource', () => {
    const store = makeStore()
    const client = createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    client.disconnect()
    expect(MockEventSource.instances[0].closed).toBe(true)
  })

  it('disconnect() is idempotent — does not throw on second call', () => {
    const store = makeStore()
    const client = createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    expect(() => { client.disconnect(); client.disconnect() }).not.toThrow()
  })

  // ── SSE change events ─────────────────────────────────────────────────────

  it('dispatches entity-added when a new entity arrives via SSE change event', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    const sse = MockEventSource.instances[0]
    sse.emit('change', {
      entities: [{ id: 'e1', name: 'User', properties: [], position: { x: 0, y: 0 }, dimensions: { width: 120, height: 60 }, edges: [] }],
      links: [],
    })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'entity-added', schema_id: 's1' })
    )
  })

  it('dispatches entity-updated when an existing entity arrives via SSE', () => {
    const store = makeStore()
    // Pre-populate store with entity e1
    store._state.workspace.canvases['c1'].schemas['s1'].entities = [
      { id: 'e1', name: 'Old', properties: [], position: { x: 0, y: 0 }, dimensions: { width: 120, height: 60 }, edges: [] }
    ] as never

    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    const sse = MockEventSource.instances[0]
    sse.emit('change', {
      entities: [{ id: 'e1', name: 'Updated', properties: [], position: { x: 0, y: 0 }, dimensions: { width: 120, height: 60 }, edges: [] }],
      links: [],
    })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'entity-updated', schema_id: 's1' })
    )
  })

  it('dispatches entity-removed for entities missing from SSE payload', () => {
    const store = makeStore()
    store._state.workspace.canvases['c1'].schemas['s1'].entities = [
      { id: 'e1', name: 'Gone', properties: [], position: { x: 0, y: 0 }, dimensions: { width: 120, height: 60 }, edges: [] }
    ] as never

    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })
    const sse = MockEventSource.instances[0]
    // Send change with empty entities — e1 should be removed
    sse.emit('change', { entities: [], links: [] })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'entity-removed', entity_id: 'e1' })
    )
  })

  it('dispatches link-created for new links in SSE payload', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    const sse = MockEventSource.instances[0]
    sse.emit('change', {
      entities: [],
      links: [{ id: 'l1', leftEntityId: 'e1', rightEntityId: 'e2', leftAnchorId: 'a1', rightAnchorId: 'a2', leftCardinality: '1', rightCardinality: 'N' }],
    })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'link-created', link_id: 'l1' })
    )
  })

  it('ignores malformed SSE change events without throwing', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    const sse = MockEventSource.instances[0]
    // Emit raw non-JSON — createMcpSync catches parse errors silently
    sse.emit('change', 'NOT_JSON' as never)

    expect(store.dispatch).not.toHaveBeenCalled()
  })

  // ── SSE workspace events ──────────────────────────────────────────────────

  it('dispatches settings-updated on workspace SSE event', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    const sse = MockEventSource.instances[0]
    const settings = { toolbox: { sections: [] }, shapes: [], general: { gridSize: 20, enableSnapping: true } }
    sse.emit('workspace', { type: 'settings-updated', settings })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'settings-updated', settings })
    )
  })

  it('dispatches schema-created on workspace SSE event', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    MockEventSource.instances[0].emit('workspace', { type: 'schema-created', id: 's2', name: 'Orders' })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'schema-created', id: 's2', name: 'Orders' })
    )
  })

  it('dispatches schema-deleted on workspace SSE event', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    MockEventSource.instances[0].emit('workspace', { type: 'schema-deleted', id: 's1' })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'schema-deleted', id: 's1' })
    )
  })

  it('dispatches canvas-created on workspace SSE event', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    MockEventSource.instances[0].emit('workspace', { type: 'canvas-created', id: 'c2', name: 'V2' })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'canvas-created', id: 'c2', name: 'V2' })
    )
  })

  it('dispatches state-loaded on workspace SSE event', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    const fullState = { workspace: { active_canvas_id: 'c1', canvases: {} } }
    MockEventSource.instances[0].emit('workspace', { type: 'state-loaded', state: fullState })

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'state-loaded', state: fullState })
    )
  })

  it('ignores malformed SSE workspace events without throwing', () => {
    const store = makeStore()
    createMcpClient({ mcpServerUrl: 'http://localhost:9743', store: store as never })

    expect(() => {
      MockEventSource.instances[0].emit('workspace', 'BAD' as never)
    }).not.toThrow()
  })
})
