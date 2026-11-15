(() => {
  const rp = performance.now.bind(performance), rd = Date.now; let manual = false, vt = 0, off = 0;
  performance.now = () => manual ? vt : rp();
  Date.now = () => manual ? off + vt : rd();
  const q = []; const oraf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => { if (manual) { q.push(cb); return q.length; } return oraf(t => cb(manual ? vt : t)); };
  window.__manual = () => { vt = rp(); off = rd() - vt; manual = true; };
  window.__step = (n = 1, ms = 1000 / 30) => { for (let i = 0; i < n; i++) { vt += ms; const a = q.splice(0); for (const cb of a) { try { cb(vt); } catch (e) { console.error(e); } } } return q.length; };
  try { localStorage.setItem('yyc-lang', 'en'); localStorage.setItem('yyc-mp-name', 'Visitor'); } catch (e) {}
})();
