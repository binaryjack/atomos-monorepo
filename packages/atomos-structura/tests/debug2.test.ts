import { test } from 'vitest';
import { EventEmitter } from 'events';
import { VbsMcpServer } from '@atomos-web/structura-mcp';

let _id = 0;
const callMethod = async (server: any, method: string, params: unknown = {}) => {
  const id = `req-${++_id}`;
  const body = JSON.stringify({ method, params, id });
  const req = Object.assign(new EventEmitter(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  });
  let responseBody = '';
  const res = {
    setHeader: () => void 0,
    writeHead: () => void 0,
    end: (b: string) => { responseBody = b; },
    write: () => void 0,
  };
  const p = server.handleRequest(req as any, res as any);
  process.nextTick(() => { req.emit('data', body); req.emit('end'); });
  await p;
  return JSON.parse(responseBody);
};

const makeEntity = (id: string) => ({ id, name: id, properties: [], position: {x:0, y:0}, dimensions: {width:120, height:60}, edges: [] });

test('debug', async () => {
  const server = new VbsMcpServer();
  await callMethod(server, 'atomos-structura/create-schema', { id: 's1', name: 'A' });
  await callMethod(server, 'atomos-structura/update-settings', { settings: { x: 42 } });
  const res = await callMethod(server, 'atomos-structura/get-workspace', {});
  console.log("get-workspace res:", JSON.stringify(res, null, 2));

  console.log("---");
  await callMethod(server, 'atomos-structura/load-workspace', {
    workspace: {
      active_schema_id: 's-new',
      schemas: [{ id: 's-new', name: 'NewSchema', entities: [{ schema_id: 'schema-default', ...makeEntity('eX') }], links: [] }],
      settings: { loaded: true },
    },
  });
  const schema = await callMethod(server, 'atomos-structura/get-schema', {});
  console.log("load-workspace res:", JSON.stringify(schema, null, 2));
});
