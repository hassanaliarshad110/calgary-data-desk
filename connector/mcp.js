// A small, dependency-free MCP server for Cloudflare Workers: the Streamable HTTP transport, stateless and read-only.
// One POST /mcp carries a JSON-RPC message (or a batch); the answer comes back as JSON. No sessions, no sign-in.
// Each connector passes its own name, instructions and tools.

const VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
};
const MAX_TEXT = 60000;   // characters of one tool answer; longer ones are cut with a note, so no answer floods the chat

const json = (body, status = 200, extra = {}) =>
  new Response(body === null ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS, ...extra } });
const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

export class ToolError extends Error {}

// Turns a tool's answer into MCP content: JSON text the model reads, plus structuredContent when it is an object.
export function toContent(out) {
  let text = typeof out === 'string' ? out : JSON.stringify(out);
  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT) + '\n[... cut to fit. Ask for a narrower part, e.g. with find, area or limit.]';
  const res = { content: [{ type: 'text', text }] };
  if (out && typeof out === 'object' && !Array.isArray(out) && text.length < MAX_TEXT) res.structuredContent = out;
  return res;
}

export function createServer({ name, title, version, instructions, tools, home }) {
  const byName = Object.fromEntries(tools.map(t => [t.name, t]));
  const list = tools.map(({ name, title, description, inputSchema }) => ({
    name, title, description, inputSchema,
    annotations: { title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }));

  async function handle(msg, env, ctx) {
    if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return fail(msg && msg.id !== undefined ? msg.id : null, -32600, 'Invalid request');
    const { id, method, params = {} } = msg;
    const isNote = id === undefined || id === null;
    if (method.startsWith('notifications/')) return null;
    if (method === 'initialize') {
      const asked = params.protocolVersion;
      return ok(id, {
        protocolVersion: VERSIONS.includes(asked) ? asked : VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name, title, version },
        instructions,
      });
    }
    if (method === 'ping') return ok(id, {});
    if (method === 'tools/list') return ok(id, { tools: list });
    if (method === 'tools/call') {
      const t = byName[params.name];
      if (!t) return fail(id, -32602, `Unknown tool: ${params.name}`);
      try {
        const out = await t.run(params.arguments || {}, env, ctx);
        return ok(id, toContent(out));
      } catch (e) {
        const msgText = e instanceof ToolError ? e.message : 'Something went wrong reading the data: ' + (e && e.message || e);
        return ok(id, { content: [{ type: 'text', text: msgText }], isError: true });
      }
    }
    if (method === 'resources/list') return ok(id, { resources: [] });
    if (method === 'prompts/list') return ok(id, { prompts: [] });
    return isNote ? null : fail(id, -32601, `Method not found: ${method}`);
  }

  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (url.pathname === '/' || url.pathname === '') {
        return new Response(`${title}\n\nThis is an MCP connector. Add ${url.origin}/mcp as a custom connector in Claude or ChatGPT.\n${home ? 'More: ' + home + '\n' : ''}`,
          { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS } });
      }
      if (url.pathname !== '/mcp') return new Response('Not found', { status: 404, headers: CORS });
      if (request.method === 'GET') return new Response('Method not allowed: this connector answers POST requests only.', { status: 405, headers: { Allow: 'POST, OPTIONS', ...CORS } });
      if (request.method === 'DELETE') return new Response(null, { status: 405, headers: CORS });
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });
      let body;
      try { body = await request.json(); } catch (e) { return json(fail(null, -32700, 'Parse error')); }
      if (Array.isArray(body)) {
        if (!body.length) return json(fail(null, -32600, 'Empty batch'));
        const outs = (await Promise.all(body.map(m => handle(m, env, ctx)))).filter(Boolean);
        return outs.length ? json(outs) : new Response(null, { status: 202, headers: CORS });
      }
      const out = await handle(body, env, ctx);
      return out ? json(out) : new Response(null, { status: 202, headers: CORS });
    },
  };
}
