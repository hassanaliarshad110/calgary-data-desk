#!/bin/bash
# Two test players join the online room, see each other move and chat, then leave.
OUT=$1; mkdir -p $OUT
npm i -s --no-save ws@8 >/dev/null 2>&1
cat > /tmp/mp.mjs <<'JS'
import WebSocket from 'ws';
const URL = 'wss://yyc-city-stories-mp.hasssanaliarshad.workers.dev/room/test-room';
const log = [], open = (name) => new Promise((res, rej) => { const w = new WebSocket(URL, { headers: { Origin: 'https://hassanaliarshad110.github.io' } }); w.on('message', d => log.push(name + ' <- ' + d.toString().slice(0, 160))); w.on('open', () => res(w)); w.on('error', rej); });
const health = await fetch(URL.replace('wss:', 'https:').replace('/room/test-room', '/health')).then(r => r.status + ' ' + r.statusText).catch(e => 'ERR ' + e.message);
log.push('health ' + health);
try {
  const a = await open('A'); a.send(JSON.stringify({ t: 'hello', name: 'Tester A', look: 'ali' }));
  const b = await open('B'); b.send(JSON.stringify({ t: 'hello', name: 'Tester B', look: 'leo' }));
  await new Promise(r => setTimeout(r, 800));
  a.send(JSON.stringify({ t: 'pos', x: 10, y: 20, z: 1, h: 0.5, mode: 'foot', anim: 'walk' }));
  b.send(JSON.stringify({ t: 'chat', text: 'Hello from B' }));
  await new Promise(r => setTimeout(r, 1500)); a.close(); await new Promise(r => setTimeout(r, 800)); b.close();
  const bad = new WebSocket(URL, { headers: { Origin: 'https://evil.example' } }); await new Promise(r => { bad.on('error', e => { log.push('bad origin: ' + e.message); r(); }); bad.on('open', () => { log.push('bad origin OPENED'); bad.close(); r(); }); });
} catch (e) { log.push('ERROR ' + e.message); }
console.log(log.join('\n'));
JS
node /tmp/mp.mjs | tee $OUT/mptest.txt
