import type { IncomingMessage, ServerResponse } from 'http';
import type { Entity, LinkProps } from '@atomos/structura-core';

export interface McpRequest {
  readonly method: string;
  readonly params: unknown;
  readonly id: string;
}

export interface McpResponse {
  readonly result?: unknown;
  readonly error?: {
    readonly code: number;
    readonly message: string;
  };
  readonly id: string;
}

/** Minimal schema record kept in the MCP server. */
interface McpSchema {
  id: string;
  name: string;
  entities: Entity[];
  links: LinkProps[];
}

/** Payload emitted via the `change` SSE event (entity/link mutation on active schema). */
export interface McpChangePayload {
  entities: Entity[];
  links: LinkProps[];
}

/** Payload emitted via the `workspace` SSE event (schema/settings mutations). */
export interface McpWorkspacePayload {
  type: 'settings-updated' | 'schema-created' | 'schema-renamed' | 'schema-deleted' | 'schema-activated' | 'state-loaded'
    | 'canvas-created' | 'canvas-renamed' | 'canvas-deleted' | 'canvas-activated';
  settings?: Record<string, unknown>;
  schema?: { id: string; name: string };
  id?: string;
  name?: string;
  state?: unknown;
}

export class VbsMcpServer {
  /** Active-schema entity/link cache (for backward-compat `get-schema` / existing tools). */
  private entities: Map<string, Entity> = new Map();
  private links: Map<string, LinkProps> = new Map();
  /** Full multi-schema store. */
  private schemas: Map<string, McpSchema> = new Map();
  private activeSchemaId = 'schema-default';
  private settings: Record<string, unknown> = {};
  private sseClients: Set<ServerResponse> = new Set();

  handleSSE(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.writeHead(200);
    res.write(':ok\n\n');
    this.sseClients.add(res);
    req.on('close', () => this.sseClients.delete(res));
  }

  private emit(data: McpChangePayload): void {
    const payload = `event: change\ndata: ${JSON.stringify(data)}\n\n`;
    this.sseClients.forEach(res => {
      try { res.write(payload); } catch { this.sseClients.delete(res); }
    });
  }

  private emitWorkspace(data: McpWorkspacePayload): void {
    const payload = `event: workspace\ndata: ${JSON.stringify(data)}\n\n`;
    this.sseClients.forEach(res => {
      try { res.write(payload); } catch { this.sseClients.delete(res); }
    });
  }
  
  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      if (req.method !== 'POST') {
        this.sendError(res, 405, 'Method not allowed', '');
        return;
      }
      
      const body = await this.readBody(req);
      const mcpRequest: McpRequest = JSON.parse(body);
      
      const response = await this.processRequest(mcpRequest);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(response));
      
    } catch (error) {
      this.sendError(res, 500, error instanceof Error ? error.message : 'Internal error', '');
    }
  }
  
  private async processRequest(request: McpRequest): Promise<McpResponse> {
    switch (request.method) {
      // ── Entity / Link (active schema) ────────────────────────────────────
      case 'atomos-structura/create-entity':
        return this.createEntity(request);
      case 'atomos-structura/get-entity':
        return this.getEntity(request);
      case 'atomos-structura/update-entity':
        return this.updateEntity(request);
      case 'atomos-structura/delete-entity':
        return this.deleteEntity(request);
      case 'atomos-structura/create-link':
        return this.createLink(request);
      case 'atomos-structura/get-schema':
        return this.getSchema(request);
      case 'atomos-structura/sync-state':
        return this.syncState(request);
      // ── Settings ─────────────────────────────────────────────────────────
      case 'atomos-structura/get-settings':
        return this.getSettings(request);
      case 'atomos-structura/update-settings':
        return this.updateSettings(request);
      // ── Multi-schema ──────────────────────────────────────────────────────
      case 'atomos-structura/list-schemas':
        return this.listSchemas(request);
      case 'atomos-structura/create-schema':
        return this.createSchemaTab(request);
      case 'atomos-structura/rename-schema':
        return this.renameSchema(request);
      case 'atomos-structura/delete-schema':
        return this.deleteSchemaTab(request);
      case 'atomos-structura/activate-schema':
        return this.activateSchema(request);
      // ── Workspace persistence ─────────────────────────────────────────────
      case 'atomos-structura/get-workspace':
        return this.getWorkspace(request);
      case 'atomos-structura/load-workspace':
        return this.loadWorkspace(request);
      default:
        return {
          error: { code: -32601, message: 'Method not found' },
          id: request.id
        };
    }
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private ensureActiveSchema(): McpSchema {
    let schema = this.schemas.get(this.activeSchemaId);
    if (!schema) {
      schema = { id: this.activeSchemaId, name: 'Default', entities: [], links: [] };
      this.schemas.set(this.activeSchemaId, schema);
    }
    return schema;
  }

  private flushActiveSchemaCache(): void {
    const schema = this.ensureActiveSchema();
    schema.entities = Array.from(this.entities.values());
    schema.links = Array.from(this.links.values());
  }

  private loadActiveSchemaCache(): void {
    const schema = this.schemas.get(this.activeSchemaId);
    this.entities.clear();
    this.links.clear();
    schema?.entities.forEach(e => this.entities.set(e.id, e));
    schema?.links.forEach(l => this.links.set(l.id, l));
  }

  private emitActiveChange(): void {
    this.flushActiveSchemaCache();
    this.emit({ entities: Array.from(this.entities.values()), links: Array.from(this.links.values()) });
  }

  // ── Entity / Link ─────────────────────────────────────────────────────────

  private createEntity(request: McpRequest): McpResponse {
    const entity = request.params as Entity;
    this.entities.set(entity.id, entity);
    this.emitActiveChange();
    return { result: { success: true, entity }, id: request.id };
  }

  private getEntity(request: McpRequest): McpResponse {
    const { entityId } = request.params as { entityId: string };
    const entity = this.entities.get(entityId);
    if (!entity) return { error: { code: 404, message: 'Entity not found' }, id: request.id };
    return { result: { entity }, id: request.id };
  }

  private updateEntity(request: McpRequest): McpResponse {
    const entity = request.params as Entity;
    if (!this.entities.has(entity.id)) return { error: { code: 404, message: 'Entity not found' }, id: request.id };
    this.entities.set(entity.id, entity);
    this.emitActiveChange();
    return { result: { success: true, entity }, id: request.id };
  }

  private deleteEntity(request: McpRequest): McpResponse {
    const { entityId } = request.params as { entityId: string };
    if (!this.entities.has(entityId)) return { error: { code: 404, message: 'Entity not found' }, id: request.id };
    this.entities.delete(entityId);
    // cascade: remove links referencing this entity
    this.links.forEach((_l, id) => {
      const l = this.links.get(id);
      if (l && (l.leftEntityId === entityId || l.rightEntityId === entityId)) this.links.delete(id);
    });
    this.emitActiveChange();
    return { result: { success: true }, id: request.id };
  }

  private createLink(request: McpRequest): McpResponse {
    const link = request.params as LinkProps;
    this.links.set(link.id, link);
    this.emitActiveChange();
    return { result: { success: true, link }, id: request.id };
  }

  private getSchema(request: McpRequest): McpResponse {
    const { schemaId } = ((request.params ?? {}) as { schemaId?: string });
    if (schemaId && schemaId !== this.activeSchemaId) {
      const schema = this.schemas.get(schemaId);
      if (!schema) return { error: { code: 404, message: 'Schema not found' }, id: request.id };
      return { result: { schema: { ...schema, metadata: { version: '1.0.0' } } }, id: request.id };
    }
    return {
      result: {
        schema: {
          id: this.activeSchemaId,
          entities: Array.from(this.entities.values()),
          links: Array.from(this.links.values()),
          metadata: { createdAt: Date.now(), version: '1.0.0' }
        }
      },
      id: request.id
    };
  }

  private syncState(request: McpRequest): McpResponse {
    const { entities = [], links = [], settings } = request.params as {
      entities?: Entity[];
      links?: LinkProps[];
      settings?: Record<string, unknown>;
    };
    this.entities.clear();
    this.links.clear();
    entities.forEach(e => this.entities.set(e.id, e));
    links.forEach(l => this.links.set(l.id, l));
    this.flushActiveSchemaCache();
    if (settings) this.settings = settings;
    // sync-state does NOT emit SSE — it comes from the browser, avoid loop
    return { result: { success: true }, id: request.id };
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  private getSettings(request: McpRequest): McpResponse {
    return { result: { settings: this.settings }, id: request.id };
  }

  private updateSettings(request: McpRequest): McpResponse {
    const { settings } = request.params as { settings: Record<string, unknown> };
    this.settings = { ...this.settings, ...settings };
    this.emitWorkspace({ type: 'settings-updated', settings: this.settings });
    return { result: { success: true, settings: this.settings }, id: request.id };
  }

  // ── Multi-schema ──────────────────────────────────────────────────────────

  private listSchemas(request: McpRequest): McpResponse {
    const list = Array.from(this.schemas.values()).map(s => ({
      id: s.id,
      name: s.name,
      entityCount: s.entities.length,
      linkCount: s.links.length,
      active: s.id === this.activeSchemaId,
    }));
    return { result: { schemas: list, active_schema_id: this.activeSchemaId }, id: request.id };
  }

  private createSchemaTab(request: McpRequest): McpResponse {
    const { id, name } = request.params as { id?: string; name: string };
    const schemaId = id ?? `schema-${Date.now()}`;
    if (this.schemas.has(schemaId)) return { error: { code: 409, message: 'Schema id already exists' }, id: request.id };
    this.schemas.set(schemaId, { id: schemaId, name, entities: [], links: [] });
    this.emitWorkspace({ type: 'schema-created', id: schemaId, name });
    return { result: { success: true, id: schemaId, name }, id: request.id };
  }

  private renameSchema(request: McpRequest): McpResponse {
    const { id, name } = request.params as { id: string; name: string };
    const schema = this.schemas.get(id);
    if (!schema) return { error: { code: 404, message: 'Schema not found' }, id: request.id };
    schema.name = name;
    this.emitWorkspace({ type: 'schema-renamed', id, name });
    return { result: { success: true }, id: request.id };
  }

  private deleteSchemaTab(request: McpRequest): McpResponse {
    const { id } = request.params as { id: string };
    if (!this.schemas.has(id)) return { error: { code: 404, message: 'Schema not found' }, id: request.id };
    if (id === this.activeSchemaId) return { error: { code: 400, message: 'Cannot delete the active schema' }, id: request.id };
    this.schemas.delete(id);
    this.emitWorkspace({ type: 'schema-deleted', id });
    return { result: { success: true }, id: request.id };
  }

  private activateSchema(request: McpRequest): McpResponse {
    const { id } = request.params as { id: string };
    if (!this.schemas.has(id)) return { error: { code: 404, message: 'Schema not found' }, id: request.id };
    this.flushActiveSchemaCache();
    this.activeSchemaId = id;
    this.loadActiveSchemaCache();
    this.emitWorkspace({ type: 'schema-activated', id });
    return { result: { success: true, id }, id: request.id };
  }

  // ── Workspace persistence ─────────────────────────────────────────────────

  private getWorkspace(request: McpRequest): McpResponse {
    this.flushActiveSchemaCache();
    return {
      result: {
        workspace: {
          active_schema_id: this.activeSchemaId,
          schemas: Array.from(this.schemas.values()),
          settings: this.settings,
        },
      },
      id: request.id,
    };
  }

  private loadWorkspace(request: McpRequest): McpResponse {
    const { workspace } = request.params as {
      workspace: {
        active_schema_id?: string;
        schemas?: McpSchema[];
        settings?: Record<string, unknown>;
      };
    };
    this.schemas.clear();
    (workspace.schemas ?? []).forEach(s => this.schemas.set(s.id, { ...s }));
    this.activeSchemaId = workspace.active_schema_id ?? 'schema-default';
    if (workspace.settings) this.settings = workspace.settings;
    this.loadActiveSchemaCache();
    // Emit a state-loaded event with proper Redux WorkspaceState shape
    const schemasRecord: Record<string, object> = {};
    this.schemas.forEach((s, id) => { schemasRecord[id] = { ...s }; });
    this.emitWorkspace({
      type: 'state-loaded',
      state: {
        workspace: {
          name: 'Untitled Workspace',
          version: '1',
          last_modified: new Date().toISOString(),
          settings: this.settings,
          canvases: {
            'canvas-default': {
              id: 'canvas-default',
              name: 'Canvas 1',
              schemas: schemasRecord,
              active_schema_id: this.activeSchemaId,
              viewport: { pan: { x: 0, y: 0 }, zoom: 1 },
            },
          },
          active_canvas_id: 'canvas-default',
        },
      },
    });
    return { result: { success: true }, id: request.id };
  }

  // ── HTTP helpers ──────────────────────────────────────────────────────────

  private async readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  private sendError(res: ServerResponse, code: number, message: string, id: string): void {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(code);
    res.end(JSON.stringify({ error: { code, message }, id }));
  }
}

