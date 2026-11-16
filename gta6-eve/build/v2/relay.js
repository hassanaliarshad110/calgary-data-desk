// Local copy of the game's multiplayer relay (server/src/worker.js, the Room Durable Object), same protocol and rules,
// on ws://localhost:8787/room/<name>. Used only to film the online mode (the live server isn't reachable from the sandbox).
const { WebSocketServer } = require('/opt/npm-tools/node_modules/ws');
const crypto = require('crypto');
const MAX = 40;
const ORIGINS = ['https://calgaryinsight.ca', 'https://www.calgaryinsight.ca', 'https://hassanaliarshad110.github.io', 'http://localhost:8765'];
const rooms = new Map();
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f<>]/g, '').slice(0, n);
const wss = new WebSocketServer({ port: 8787, verifyClient: (info, cb) => {
  const m = info.req.url.match(/^\/room\/([a-z0-9-]{1,32})$/); const origin = info.req.headers.origin || '';
  if (!m) return cb(false, 404); if (origin && !ORIGINS.includes(origin)) return cb(false, 403);
  const r = rooms.get(m[1]) || new Set(); if (r.size >= MAX) return cb(false, 503, 'room full'); cb(true);
} });
wss.on('connection', (ws, req) => {
  const name = req.url.split('/').pop(); if (!rooms.has(name)) rooms.set(name, new Set()); const room = rooms.get(name);
  ws.att = { id: crypto.randomUUID().slice(0, 8), name: 'Player', look: 'ali', p: null }; room.add(ws);
  ws.send(JSON.stringify({ t: 'welcome', id: ws.att.id, players: [...room].filter(w => w !== ws).map(w => w.att).filter(a => a.p) }));
  const broadcast = (msg) => { const s = JSON.stringify(msg); for (const w of room) if (w !== ws) { try { w.send(s); } catch (e) { } } };
  console.log('join', ws.att.id, room.size);
  ws.on('message', (buf) => {
    const data = buf.toString(); if (data.length > 8000) return;
    let m; try { m = JSON.parse(data); } catch (e) { return; }
    const a = ws.att;
    if (m.t === 'hello') { a.name = clean(m.name, 20) || 'Player'; a.look = clean(m.look, 12); broadcast({ t: 'join', id: a.id, name: a.name, look: a.look }); console.log('hello', a.name, a.look); }
    else if (m.t === 'pos') {
      const n = v => (typeof v === 'number' && isFinite(v) ? Math.round(v * 100) / 100 : 0);
      a.p = [n(m.x), n(m.y), n(m.z), n(m.h), clean(m.mode, 6), clean(m.anim, 10), Math.max(0, Math.min(99999, Math.round(+m.sc || 0))), Math.max(0, Math.min(100, Math.round(+m.hp || 0))), m.tm === 'r' || m.tm === 'b' || m.tm === 'p' ? m.tm : '', clean(m.ride, 12)];
      broadcast({ t: 'pos', id: a.id, name: a.name, look: a.look, p: a.p });
    }
    else if (m.t === 'chat') { const text = clean(m.text, 200); if (text) broadcast({ t: 'chat', id: a.id, name: a.name, text }); }
    else if (m.t === 'g' && m.d && typeof m.d === 'object') {
      const d = JSON.stringify(m.d); if (d.length > 2000) return;
      if (m.to) { for (const w of room) if (w.att.id === m.to) { try { w.send(JSON.stringify({ t: 'g', id: a.id, name: a.name, d: m.d })); } catch (e) { } break; } }
      else broadcast({ t: 'g', id: a.id, name: a.name, d: m.d });
    }
    else if (m.t === 'rtc' && m.to) { for (const w of room) if (w.att.id === m.to) { try { w.send(JSON.stringify({ t: 'rtc', from: a.id, d: m.d })); } catch (e) { } break; } }
  });
  ws.on('close', () => { room.delete(ws); broadcast({ t: 'leave', id: ws.att.id }); console.log('leave', ws.att.id); });
});
console.log('relay on 8787');
