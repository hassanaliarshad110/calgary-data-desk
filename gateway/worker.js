// Calgary Insight AI gateway (Cloudflare Worker).
// The site's Claude key lives only here, never in a visitor's browser. A visitor signed in with Google (Firebase) whose
// email the owner approved can use Data Genie and the Data Scientist; each has a daily spending limit; the owner manages
// who has access from the site (Account → Manage access).
//
//   POST /session          Firebase ID token → a gateway session (12 hours), so long reports outlive the 1-hour token
//   GET  /me               who you are, whether you are approved, today's spend and limit
//   POST /v1/messages      the Anthropic Messages API, for approved people (streams through; the cost is counted)
//   GET  /admin/users      (owner) everyone approved, with today's spend
//   POST /admin/users      (owner) {email, limit_usd?, remove?}
//
// Settings (wrangler.toml [vars]): FIREBASE_PROJECT, OWNER_EMAILS, ALLOWED_ORIGINS, DEFAULT_LIMIT_USD.
// Secret: ANTHROPIC_API_KEY. KV namespace: ACCESS (approved people, daily spend).

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const ANTHROPIC = 'https://api.anthropic.com/v1/messages';
const SESSION_HOURS = 12;
// US dollars per million tokens (input, output); cache reads a tenth of input, cache writes a quarter more. Unknown
// models are charged at the most expensive known price, so a limit is never under-counted.
const PRICES = { 'claude-haiku-5-5': [0.10, 0.50], 'claude-sonnet-5-5': [2.00, 10.00], 'claude-opus-5-5': [5.00, 25.00] };
const DEAREST = [5.00, 25.00];
const SEARCH_USD = 0.01;
export const TOOLS = ['genie', 'election', 'business'];      // Data Genie and the Data Scientist; Election Analytics; the Business Economist

const enc = new TextEncoder();
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const json = (obj, status = 200, headers = {}) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...headers } });
const fail = (status, type, message, headers) => json({ type: 'error', error: { type, message } }, status, headers);

export function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function cost(model, usage) {
  const [pin, pout] = PRICES[model] || DEAREST;
  const u = usage || {};
  const input = (u.input_tokens || 0) * pin + (u.cache_read_input_tokens || 0) * pin * 0.1 + (u.cache_creation_input_tokens || 0) * pin * 1.25;
  return (input + (u.output_tokens || 0) * pout) / 1e6 + ((u.server_tool_use || {}).web_search_requests || 0) * SEARCH_USD;
}

// ---------------------------------------------------------------- who is asking
let jwks = { keys: null, until: 0 };
export function _resetKeys() { jwks = { keys: null, until: 0 }; }

async function googleKeys(fetcher) {
  if (jwks.keys && Date.now() < jwks.until) return jwks.keys;
  const r = await fetcher(JWKS_URL);
  if (!r.ok) throw new Error('Google sign-in keys could not be read');
  const age = Number((/max-age=(\d+)/.exec(r.headers.get('cache-control') || '') || [])[1] || 3600);
  jwks = { keys: (await r.json()).keys || [], until: Date.now() + age * 1000 };
  return jwks.keys;
}

export async function verifyFirebase(token, env, fetcher = fetch, nowS = Math.floor(Date.now() / 1000)) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('not a sign-in token');
  const header = JSON.parse(new TextDecoder().decode(unb64url(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(unb64url(parts[1])));
  if (header.alg !== 'RS256') throw new Error('unexpected token type');
  const jwk = (await googleKeys(fetcher)).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('unknown signing key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64url(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('bad signature');
  const project = env.FIREBASE_PROJECT;
  if (claims.aud !== project || claims.iss !== `https://securetoken.google.com/${project}`) throw new Error('token is for another site');
  if (!(claims.exp > nowS) || claims.iat > nowS + 300 || !claims.sub) throw new Error('sign-in has expired: sign in again');
  if (!claims.email || claims.email_verified !== true) throw new Error('this Google account has no verified email');
  return { email: String(claims.email).toLowerCase(), name: claims.name || '' };
}

async function sessionKey(env) {
  const seed = await crypto.subtle.digest('SHA-256', enc.encode('calgary-insight-session-v1:' + env.ANTHROPIC_API_KEY));
  return crypto.subtle.importKey('raw', seed, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function makeSession(email, env, nowS = Math.floor(Date.now() / 1000)) {
  const body = b64url(enc.encode(JSON.stringify({ email, exp: nowS + SESSION_HOURS * 3600 })));
  const sig = b64url(await crypto.subtle.sign('HMAC', await sessionKey(env), enc.encode(body)));
  return `cis.${body}.${sig}`;
}

export async function readSession(token, env, nowS = Math.floor(Date.now() / 1000)) {
  const [tag, body, sig] = String(token || '').split('.');
  if (tag !== 'cis' || !body || !sig) throw new Error('not a session');
  const ok = await crypto.subtle.verify('HMAC', await sessionKey(env), unb64url(sig), enc.encode(body));
  if (!ok) throw new Error('bad session');
  const s = JSON.parse(new TextDecoder().decode(unb64url(body)));
  if (!(s.exp > nowS)) throw new Error('session has expired: sign in again');
  return { email: String(s.email).toLowerCase() };
}

async function who(req, env, fetcher) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!t) throw new Error('sign in with Google first');
  return t.startsWith('cis.') ? readSession(t, env) : verifyFirebase(t, env, fetcher);
}

// ---------------------------------------------------------------- who may, and how much
const owners = env => String(env.OWNER_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

export async function access(email, env) {
  const owner = owners(env).includes(email);
  const rec = owner ? {} : JSON.parse((await env.ACCESS.get('user:' + email)) || 'null');
  const spent = Number((await env.ACCESS.get(`spend:${today()}:${email}`)) || 0);
  const limit = owner ? null : (rec && rec.limit_usd != null ? Number(rec.limit_usd) : Number(env.DEFAULT_LIMIT_USD || 10));
  const tools = owner ? TOOLS : (rec ? (Array.isArray(rec.tools) && rec.tools.length ? rec.tools.filter(t => TOOLS.includes(t)) : ['genie']) : []);
  return { email, owner, allowed: owner || !!rec, tools, limit_usd: limit, spent_usd: Math.round(spent * 10000) / 10000, day: today() };
}

async function addSpend(email, usd, env) {
  if (!(usd > 0)) return;
  const k = `spend:${today()}:${email}`;
  const was = Number((await env.ACCESS.get(k)) || 0);
  await env.ACCESS.put(k, String(was + usd), { expirationTtl: 3 * 86400 });
}

// ---------------------------------------------------------------- counting a streamed reply's cost as it passes
export function meter(model, onDone) {
  const usage = {};
  let buf = '';
  const dec = new TextDecoder();
  const take = line => {
    if (!line.startsWith('data:')) return;
    let ev;
    try { ev = JSON.parse(line.slice(5)); } catch (e) { return; }
    const u = ev.type === 'message_start' ? (ev.message || {}).usage : ev.type === 'message_delta' ? ev.usage : null;
    if (u) for (const [k, v] of Object.entries(u)) if (v != null) usage[k] = v;     // the later figure replaces the earlier
  };
  return new TransformStream({
    transform(chunk, ctl) {
      ctl.enqueue(chunk);
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      lines.forEach(take);
    },
    flush() { if (buf) take(buf); onDone(cost(model, usage), usage); },
  });
}

// ---------------------------------------------------------------- the requests
function cors(req, env) {
  const origin = req.headers.get('origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!allowed.includes(origin)) return {};
  return { 'access-control-allow-origin': origin, vary: 'origin', 'access-control-allow-headers': 'authorization, content-type, anthropic-version, anthropic-beta',
           'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-max-age': '86400' };
}

export async function handle(req, env, ctx, fetcher = fetch) {
  const url = new URL(req.url);
  const h = cors(req, env);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  let me;
  try { me = await who(req, env, fetcher); } catch (e) { return fail(401, 'authentication_error', String(e.message || e), h); }

  if (url.pathname === '/session' && req.method === 'POST') {
    const a = await access(me.email, env);
    if (!a.allowed) return fail(403, 'permission_error', `${me.email} is not approved for the AI tools yet. Ask the site's owner to add it.`, h);
    return json({ session: await makeSession(me.email, env), hours: SESSION_HOURS, ...a }, 200, h);
  }
  if (url.pathname === '/me' && req.method === 'GET') return json(await access(me.email, env), 200, h);

  if (url.pathname.startsWith('/admin/')) {
    if (!owners(env).includes(me.email)) return fail(403, 'permission_error', 'Only the site owner can manage access.', h);
    if (url.pathname === '/admin/users' && req.method === 'GET') {
      const list = await env.ACCESS.list({ prefix: 'user:' });
      const users = await Promise.all(list.keys.map(async k => {
        const email = k.name.slice(5);
        const rec = JSON.parse((await env.ACCESS.get(k.name)) || '{}');
        return { email, limit_usd: rec.limit_usd ?? null, tools: rec.tools || ['genie'], added: rec.added, spent_usd: (await access(email, env)).spent_usd };
      }));
      return json({ owners: owners(env), default_limit_usd: Number(env.DEFAULT_LIMIT_USD || 10), users }, 200, h);
    }
    if (url.pathname === '/admin/users' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch (e) { return fail(400, 'invalid_request_error', 'Send JSON.', h); }
      const email = String(b.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, 'invalid_request_error', 'That is not an email address.', h);
      if (b.remove) { await env.ACCESS.delete('user:' + email); return json({ ok: true, removed: email }, 200, h); }
      const limit = b.limit_usd === null || b.limit_usd === '' || b.limit_usd === undefined ? null : Number(b.limit_usd);
      if (limit !== null && !(limit >= 0 && limit <= 1000)) return fail(400, 'invalid_request_error', 'The daily limit must be between $0 and $1,000.', h);
      const tools = Array.isArray(b.tools) ? b.tools.filter(t => TOOLS.includes(t)) : ['genie'];
      if (!tools.length) return fail(400, 'invalid_request_error', 'Choose at least one AI tool, or remove the person.', h);
      await env.ACCESS.put('user:' + email, JSON.stringify({ limit_usd: limit, tools, added: new Date().toISOString(), by: me.email }));
      return json({ ok: true, email, limit_usd: limit, tools }, 200, h);
    }
    return fail(404, 'not_found_error', 'No such admin request.', h);
  }

  if (url.pathname === '/v1/messages' && req.method === 'POST') {
    const a = await access(me.email, env);
    if (!a.allowed) return fail(403, 'permission_error', `${me.email} is not approved for the AI tools. Ask the site's owner to add it.`, h);
    if (a.limit_usd !== null && a.spent_usd >= a.limit_usd) {
      return fail(429, 'rate_limit_error', `The daily limit for ${me.email} ($${a.limit_usd}) is used up for today. It resets at midnight Calgary time.`, h);
    }
    let body;
    try { body = await req.json(); } catch (e) { return fail(400, 'invalid_request_error', 'Send JSON.', h); }
    const model = String(body.model || '');
    if (!model.startsWith('claude-')) return fail(400, 'invalid_request_error', 'Only Claude models are offered here.', h);
    if (body.max_tokens > 128000) body.max_tokens = 128000;
    const headers = { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': req.headers.get('anthropic-version') || '2023-06-01', 'content-type': 'application/json' };
    const beta = req.headers.get('anthropic-beta');
    if (beta) headers['anthropic-beta'] = beta;
    const up = await fetcher(ANTHROPIC, { method: 'POST', headers, body: JSON.stringify(body) });
    const out = { ...h, 'content-type': up.headers.get('content-type') || 'application/json' };
    if (!up.ok || !body.stream || !up.body) {
      const text = await up.text();
      if (up.ok) { try { const usd = cost(model, JSON.parse(text).usage); ctx.waitUntil(addSpend(me.email, usd, env)); } catch (e) { /* not JSON */ } }
      return new Response(text, { status: up.status, headers: out });
    }
    const m = meter(model, usd => ctx.waitUntil(addSpend(me.email, usd, env)));
    return new Response(up.body.pipeThrough(m), { status: up.status, headers: out });
  }
  return fail(404, 'not_found_error', 'No such request.', h);
}

export default { fetch: (req, env, ctx) => handle(req, env, ctx) };
