// The AI gateway (gateway/worker.js), run in Node: Google sign-in tokens checked for real (RS256), sessions, approvals,
// the owner's access screen, daily limits, and the cost of a streamed reply counted as it passes.
//     node gateway/test.mjs
import * as gw from './worker.js';

const fails = [];
const check = (name, ok, detail = '') => { console.log((ok ? 'ok   ' : 'FAIL ') + name + (!ok && detail ? `  (${detail})` : '')); if (!ok) fails.push(name); };
const b64url = buf => Buffer.from(buf).toString('base64url');

const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const pub = { ...(await crypto.subtle.exportKey('jwk', pair.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
const now = Math.floor(Date.now() / 1000);
async function idToken(claims, key = pair.privateKey) {
  const h = b64url(JSON.stringify({ alg: 'RS256', kid: 'k1', typ: 'JWT' }));
  const p = b64url(JSON.stringify({ aud: 'calgary-insight', iss: 'https://securetoken.google.com/calgary-insight', sub: 'u1', iat: now - 10, exp: now + 3600, email_verified: true, ...claims }));
  const s = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(h + '.' + p));
  return `${h}.${p}.${b64url(s)}`;
}
const store = new Map();
const meta = new Map();
const KV = { get: async k => store.get(k) ?? null, put: async (k, v, o) => { store.set(k, v); if (o && o.metadata) meta.set(k, o.metadata); }, delete: async k => { store.delete(k); },
             list: async ({ prefix }) => ({ list_complete: true, keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name, metadata: meta.get(name) })) }) };
const env = { FIREBASE_PROJECT: 'calgary-insight', OWNER_EMAILS: 'owner@gmail.com', ALLOWED_ORIGINS: 'https://calgaryinsight.ca', DEFAULT_LIMIT_USD: '10',
              ANTHROPIC_API_KEY: 'sk-ant-test', ACCESS: KV };
const waits = [];
const ctx = { waitUntil: p => waits.push(p) };
const sent = [];
const sse = ['event: message_start', 'data: {"type":"message_start","message":{"usage":{"input_tokens":1000000,"output_tokens":1}}}', '',
             'event: content_block_delta', 'data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hi"}}', '',
             'event: message_delta', 'data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":100000}}', '', ''].join('\n');
const fetcher = async (url, init) => {
  if (String(url).includes('googleapis')) return new Response(JSON.stringify({ keys: [pub] }), { headers: { 'cache-control': 'max-age=600' } });
  sent.push({ url, init });
  const body = JSON.parse(init.body);
  if (body.stream) {
    const bytes = new TextEncoder().encode(sse);
    return new Response(new ReadableStream({ start(c) { c.enqueue(bytes.slice(0, 50)); c.enqueue(bytes.slice(50)); c.close(); } }), { headers: { 'content-type': 'text/event-stream' } });
  }
  return new Response(JSON.stringify({ content: [], usage: { input_tokens: 1000, output_tokens: 1000 } }), { headers: { 'content-type': 'application/json' } });
};
const call = (path, { token, method = 'GET', body, origin = 'https://calgaryinsight.ca' } = {}) => gw.handle(new Request('https://gw.test' + path, {
  method, headers: { ...(token ? { authorization: 'Bearer ' + token } : {}), origin, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
  body: body ? JSON.stringify(body) : undefined }), env, ctx, fetcher);

// sign-in tokens
const ownerTok = await idToken({ email: 'Owner@gmail.com' });
check('a real Google sign-in is accepted', (await gw.verifyFirebase(ownerTok, env, fetcher, now)).email === 'owner@gmail.com');
const other = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const forged = await idToken({ email: 'owner@gmail.com' }, other.privateKey);
let r = await call('/me', { token: forged });
check('a forged token is refused', r.status === 401);
r = await call('/me', { token: await idToken({ email: 'x@gmail.com', aud: 'other-project', iss: 'https://securetoken.google.com/other-project' }) });
check('a token for another site is refused', r.status === 401);
r = await call('/me', { token: await idToken({ email: 'x@gmail.com', exp: now - 5 }) });
check('an expired token is refused', r.status === 401);
r = await call('/me', { token: await idToken({ email: 'x@gmail.com', email_verified: false }) });
check('an unverified email is refused', r.status === 401);
r = await call('/me');
check('no sign-in, no entry', r.status === 401 && (await r.json()).error.message.includes('sign in'));

// approvals
const guestTok = await idToken({ email: 'guest@gmail.com', sub: 'u2' });
r = await call('/session', { token: guestTok, method: 'POST' });
check('someone not approved gets no session', r.status === 403 && (await r.json()).error.message.includes('not approved'));
await Promise.all(waits);
check('a sign-in is kept for the owner even when not approved', !!meta.get('seen:guest@gmail.com') && meta.get('seen:guest@gmail.com').days === 1);
r = await call('/session', { token: guestTok, method: 'POST' }); await Promise.all(waits);
check('a second sign-in within the hour writes nothing new', meta.get('seen:guest@gmail.com').days === 1);
const later = await gw.seen({ email: 'guest@gmail.com', name: 'Guest' }, env, new Date(Date.now() + 2 * 86400e3));
check('a sign-in on another day counts a new day', later.days === 2 && later.first < later.last);
r = await call('/admin/seen', { token: guestTok });
check('only the owner sees who signed in', r.status === 403);
r = await call('/v1/messages', { token: guestTok, method: 'POST', body: { model: 'claude-sonnet-5-5', max_tokens: 10, messages: [] } });
check('nor any answer', r.status === 403 && sent.length === 0);
r = await call('/admin/users', { token: guestTok, method: 'POST', body: { email: 'guest@gmail.com' } });
check('only the owner manages access', r.status === 403);
r = await call('/admin/users', { token: ownerTok, method: 'POST', body: { email: 'Guest@Gmail.com', limit_usd: 2 } });
check('the owner approves someone with a limit', r.status === 200 && JSON.parse(store.get('user:guest@gmail.com')).limit_usd === 2);
r = await call('/me', { token: guestTok });
let me = await r.json();
check('they see they are approved, with their limit', me.allowed && me.limit_usd === 2 && me.spent_usd === 0 && !me.owner, JSON.stringify(me));
check('by default only Data Genie and the Data Scientist', JSON.stringify(me.tools) === '["genie"]');
await call('/admin/users', { token: ownerTok, method: 'POST', body: { email: 'guest@gmail.com', limit_usd: 2, tools: ['genie', 'election', 'nonsense'] } });
me = await (await call('/me', { token: guestTok })).json();
check('the owner chooses which tools each person gets', JSON.stringify(me.tools) === '["genie","election"]', JSON.stringify(me.tools));
check('no tools at all is refused', (await call('/admin/users', { token: ownerTok, method: 'POST', body: { email: 'x@gmail.com', tools: [] } })).status === 400);
check('the site gets the CORS header', r.headers.get('access-control-allow-origin') === 'https://calgaryinsight.ca');
r = await call('/me', { token: guestTok, origin: 'https://evil.example' });
check('other sites do not', !r.headers.get('access-control-allow-origin'));

// sessions and answers
r = await call('/session', { token: guestTok, method: 'POST' });
const sess = (await r.json()).session;
check('an approved person gets a 12-hour session', r.status === 200 && sess.startsWith('cis.'));
const tampered = sess.slice(0, -3) + (sess.endsWith('A') ? 'BBB' : 'AAA');
check('a changed session is refused', (await call('/me', { token: tampered })).status === 401);
r = await call('/v1/messages', { token: sess, method: 'POST', body: { model: 'claude-sonnet-5-5', max_tokens: 999999, stream: true, messages: [{ role: 'user', content: 'hi' }] } });
const text = await r.text();
await Promise.all(waits);
const up = sent[sent.length - 1];
check('the answer streams through unchanged', r.status === 200 && text === sse);
check('the key is added here, never by the browser', up.init.headers['x-api-key'] === 'sk-ant-test');
check('an oversized reply length is capped', JSON.parse(up.init.body).max_tokens === 128000);
me = await (await call('/me', { token: sess })).json();
check('its cost is counted ($2 in + $1 out at Sonnet prices)', Math.abs(me.spent_usd - 3) < 1e-6, JSON.stringify(me));
r = await call('/v1/messages', { token: sess, method: 'POST', body: { model: 'claude-sonnet-5-5', max_tokens: 10, stream: true, messages: [] } });
const lim = await r.json();
check('over the daily limit: stopped, with a plain reason', r.status === 429 && /daily limit/.test(lim.error.message));
r = await call('/v1/messages', { token: ownerTok, method: 'POST', body: { model: 'gpt-5', max_tokens: 10, messages: [] } });
check('only Claude models', r.status === 400);
r = await call('/v1/messages', { token: ownerTok, method: 'POST', body: { model: 'claude-opus-5-5', max_tokens: 10, messages: [] } });
await Promise.all(waits);
me = await (await call('/me', { token: ownerTok })).json();
check('the owner has every tool', me.tools.length === 3);
check('the owner has no limit, and a plain reply is counted too', r.status === 200 && me.owner && me.limit_usd === null && Math.abs(me.spent_usd - 0.03) < 1e-6, JSON.stringify(me));
const list = await (await call('/admin/users', { token: ownerTok })).json();
check('the owner sees everyone approved with today\'s spend', list.users.length === 1 && list.users[0].email === 'guest@gmail.com' && Math.abs(list.users[0].spent_usd - 3) < 1e-6);
await call('/admin/users', { token: ownerTok, method: 'POST', body: { email: 'guest@gmail.com', remove: true } });
check('removing someone stops their session at once', (await call('/v1/messages', { token: sess, method: 'POST', body: { model: 'claude-sonnet-5-5', max_tokens: 10, messages: [] } })).status === 403);
check('web searches are priced', Math.abs(gw.cost('claude-haiku-5-5', { server_tool_use: { web_search_requests: 3 } }) - 0.03) < 1e-9);
check('an unknown model is priced at the dearest', gw.cost('claude-new', { output_tokens: 1e6 }) === 25);
check('the day is Calgary\'s', gw.today(new Date('2026-11-08T05:30:00Z')) === '2026-11-07');

r = await call('/admin/seen', { token: ownerTok });
const ppl = (await r.json()).people || [];
check('the owner gets the list, with who is approved', r.status === 200 && ppl.some(p => p.email === 'guest@gmail.com' && p.days === 2));
// visits counted anonymously
const dstore = new Map();
const DS = { get: async k => dstore.get(k), put: async (k, v) => { dstore.set(k, structuredClone(v)); }, delete: async ks => { [].concat(ks).forEach(k => dstore.delete(k)); },
             list: async ({ prefix, reverse, limit }) => { let ks = [...dstore.keys()].filter(k => k.startsWith(prefix)).sort(); if (reverse) ks.reverse(); return new Map(ks.slice(0, limit || 1e9).map(k => [k, dstore.get(k)])); } };
const tobj = new gw.Traffic({ storage: DS });
env.TRAFFIC = { idFromName: n => n, get: () => ({ fetch: (u, init) => tobj.fetch(new Request(u, init)) }) };
const hit = (p, ip, extra = {}) => gw.handle(new Request('https://gw/hit', { method: 'POST', headers: { origin: extra.origin || 'https://calgaryinsight.ca', 'cf-connecting-ip': ip, 'user-agent': extra.ua || 'Mozilla/5.0 Firefox' }, body: JSON.stringify({ p, r: extra.r || '' }) }), env, undefined, fetch);
r = await hit('/', '1.1.1.1', { r: 'www.google.com' });
await hit('/visit/explore/?x=1', '1.1.1.1');
await hit('/', '2.2.2.2', { r: 'calgaryinsight.ca' });
await hit('/', '3.3.3.3', { origin: 'https://elsewhere.example' });
await hit('/', '4.4.4.4', { ua: 'Googlebot/2.1' });
check('a page view needs no sign-in', r.status === 204);
r = await call('/admin/traffic', { token: ownerTok });
const tr = await r.json();
check('views and visitors are counted, other sites and robots are not', r.status === 200 && tr.today.views === 3 && tr.today.visitors === 2 && tr.last7.views === 3 && tr.yesterday.views === 0, JSON.stringify(tr.today));
check('pages without their query, sources without the site itself', tr.pages[0].name === '/' && tr.pages[0].count === 2 && tr.pages.some(x => x.name === '/visit/explore/') && tr.sources.some(x => x.name === 'google.com') && !tr.sources.some(x => /calgaryinsight/.test(x.name)), JSON.stringify([tr.pages, tr.sources]));
check('no address is kept', ![...dstore.entries()].some(([k, v]) => /1\.1\.1\.1/.test(k + JSON.stringify(v))));
await tobj.hit({ p: '/', ip: '1.1.1.1', ua: 'x' }, new Date(Date.now() + 2 * 864e5));
check('earlier days\' visitor marks are deleted', [...dstore.keys()].filter(k => k.startsWith('v:')).length === 1 && [...dstore.keys()].filter(k => k.startsWith('salt:')).length === 1);
check('only the owner sees the traffic', (await call('/admin/traffic', { token: await idToken({ email: 'guest@gmail.com' }) })).status === 403);
// reports kept with the person's account
KV.getWithMetadata = async (k, o) => store.has(k) ? { value: store.get(k), metadata: meta.get(k) } : { value: null, metadata: null };
const raw = (path, { token, method = 'GET', body, type } = {}) => gw.handle(new Request('https://gw.test' + path, {
  method, headers: { authorization: 'Bearer ' + token, origin: 'https://calgaryinsight.ca', ...(type ? { 'content-type': type } : {}) }, body }), env, ctx, fetcher);
const pdfBytes = new TextEncoder().encode('%PDF-1.7 a report');
r = await raw('/reports/r1/pdf?name=Ward%205%20report.pdf', { token: ownerTok, method: 'PUT', body: pdfBytes });
check('a report file is kept', r.status === 200 && store.get('repf:owner@gmail.com:r1:pdf').byteLength === pdfBytes.byteLength);
r = await raw('/reports/r1/interactive?name=Ward%205%20report%20(interactive).html', { token: ownerTok, method: 'PUT', body: '<html>hi</html>' });
r = await call('/reports/r1', { token: ownerTok, method: 'PUT', body: { title: 'Ward 5 report', question: 'q', made: '2026-11-11 20:10', files: { pdf: {}, interactive: {}, xlsx: {} } } });
check('a record naming a file not sent is refused', r.status === 400);
r = await call('/reports/r1', { token: ownerTok, method: 'PUT', body: { title: 'Ward 5 report', question: 'q', made: '2026-11-11 20:10', files: { pdf: {}, interactive: {} } } });
check('the record is kept with its files', r.status === 200 && (await r.json()).report.files.pdf.name === 'Ward 5 report.pdf');
r = await call('/reports', { token: ownerTok });
let lst = (await r.json()).reports;
check('the person sees their reports', r.status === 200 && lst.length === 1 && lst[0].title === 'Ward 5 report');
r = await raw('/reports/r1/pdf', { token: ownerTok });
check('a report file comes back as it was sent', r.status === 200 && r.headers.get('content-type') === 'application/pdf' && (await r.text()) === '%PDF-1.7 a report'
      && decodeURIComponent(r.headers.get('x-report-name')) === 'Ward 5 report.pdf');
r = await raw('/reports/r1/interactive', { token: ownerTok });
check('an interactive page comes back as a web page', r.headers.get('content-type').startsWith('text/html'));
const guest2 = await idToken({ email: 'guest@gmail.com' });
r = await call('/reports', { token: guest2 });
check('someone else sees none of them', r.status === 200 && (await r.json()).reports.length === 0);
check('nor can they open one', (await raw('/reports/r1/pdf', { token: guest2 })).status === 404);
const stranger = await idToken({ email: 'stranger@gmail.com' });
check('someone not approved cannot store files', (await raw('/reports/x1/pdf?name=a.pdf', { token: stranger, method: 'PUT', body: pdfBytes })).status === 403);
check('a bad report name is refused', (await raw('/reports/..%2Fx/pdf', { token: ownerTok, method: 'PUT', body: pdfBytes })).status === 400
      && (await raw('/reports/r1/exe', { token: ownerTok, method: 'PUT', body: pdfBytes })).status === 400);
check('an empty file is refused', (await raw('/reports/r2/pdf?name=a.pdf', { token: ownerTok, method: 'PUT', body: new Uint8Array(0) })).status === 400);
check('PUT and DELETE are allowed from the website', ((await call('/reports', { token: ownerTok, method: 'OPTIONS' })).headers.get('access-control-allow-methods') || '').includes('PUT'));
r = await call('/reports/r1', { token: ownerTok, method: 'DELETE' });
check('a report can be removed, files and all', r.status === 200 && !store.has('rep:owner@gmail.com:r1') && !store.has('repf:owner@gmail.com:r1:pdf'));
for (let i = 0; i < 102; i++) {
  await raw(`/reports/k${i}/pdf?name=r${i}.pdf`, { token: ownerTok, method: 'PUT', body: pdfBytes });
  await call(`/reports/k${i}`, { token: ownerTok, method: 'PUT', body: { title: 'R' + i, made: `2026-11-${String(10 + Math.floor(i / 10)).padStart(2, '0')} 0${i % 10}:00`, files: { pdf: {} } } });
}
lst = (await (await call('/reports', { token: ownerTok })).json()).reports;
check('the newest 100 are kept, the oldest removed with their files', lst.length === 100 && !lst.some(x => x.id === 'k0' || x.id === 'k1') && !store.has('repf:owner@gmail.com:k0:pdf'), String(lst.length));
console.log('\n' + (fails.length ? `${fails.length} FAILED: ${fails.join(', ')}` : 'All checks passed.'));
process.exit(fails.length ? 1 : 0);
