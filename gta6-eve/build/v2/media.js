(() => {
  // media time follows the manual game clock (so on-screen lyrics stay in sync with the captured frames)
  const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime');
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    configurable: true,
    get() { const real = d.get.call(this); if (!window.__mediaClock || this.paused) return real;
      if (this.__b == null) { this.__b = real; this.__p = performance.now(); }
      return this.__b + (performance.now() - this.__p) / 1000; },
    set(v) { this.__b = null; if (window.__mediaClock) { this.__b = v; this.__p = performance.now(); } d.set.call(this, v); }
  });
  // long UI timers (chat bubbles 6 s, feed fade 12 s) run on game time instead of wall time
  const st = window.setTimeout.bind(window), ct = window.clearTimeout.bind(window);
  window.__timers = []; let tid = 900000;
  window.setTimeout = (fn, ms, ...a) => { if (window.__gameTimers && ms >= 1000) { const t = { id: ++tid, at: performance.now() + ms, fn, a }; window.__timers.push(t); return t.id; } return st(fn, ms, ...a); };
  window.clearTimeout = (id) => { if (id > 900000) { window.__timers = window.__timers.filter(t => t.id !== id); return; } ct(id); };
  window.__tickTimers = () => { const now = performance.now(); const due = window.__timers.filter(t => t.at <= now); window.__timers = window.__timers.filter(t => t.at > now); for (const t of due) { try { typeof t.fn === 'function' ? t.fn(...t.a) : 0; } catch (e) {} } };
  // multiplayer: the game's client talks to a local copy of its relay server
  if (window.__MP_LOCAL !== false) {
    const O = window.WebSocket;
    const W = function (u, p) { if (String(u).includes('workers.dev')) u = 'ws://localhost:8787/room/calgary'; return p ? new O(u, p) : new O(u); };
    W.prototype = O.prototype; W.CONNECTING = 0; W.OPEN = 1; W.CLOSING = 2; W.CLOSED = 3; window.WebSocket = W;
  }
})();
