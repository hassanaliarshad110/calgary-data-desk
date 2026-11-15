(() => {
  window.__lerp = (a, b, k) => a + (b - a) * k;
  window.__ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
  window.__cam = (px, py, ph, tx, ty, th, abs) => {
    const gp = abs ? 0 : (game.groundAt(px, py) || 0), gt = abs ? 0 : (game.groundAt(tx, ty) || 0);
    game.cineCam = { p: [px, gp + ph, -py], t: [tx, gt + th, -ty], snap: true };
  };
  window.__hidePlayer = () => { try { game.player.person.visible = false; if (game.player.hum) game.player.hum.visible = false; } catch (e) {} };
  window.__auto = { next: false, goal: false, board: false, stopAtCard: false, stopAtQuiz: false };
  window.__autopilot = () => {
    const A = window.__auto, vis = s => { const e = document.querySelector(s); return e && !e.hidden; };
    if (A.next && vis('#dialog')) document.querySelector('#dialog .next').click();
    if (A.next && vis('#card') && !A.stopAtCard) document.querySelector('#card .next').click();
    if (A.goal && game.missions.goal && game.player.mode !== 'ride') { const g = game.missions.goal; game.teleport(g.x + 1, g.y + 1); }
    if (A.board && game.missions.boardWait) game.missions.boardWait();
  };
})();
window.__noRender = false;
window.__wrapRender = () => { const r = game.renderer; if (r.__w) return; const o = r.render.bind(r); r.render = (s, c) => { if (!window.__noRender) o(s, c); }; r.__w = true; };
