// Every screen's visible text, as a visitor sees it (desktop window), for the display audit.
// usage: node screen_text.js <base> <out-dir> [views]
const { chromium } = require('playwright'); const fs = require('fs');
const BASE = process.argv[2], OUT = process.argv[3];
const VIEWS = (process.argv[4] || 'dashboard,issues,families,changes,growth,compare,elections,livemap,citynews,fedbudget,invest,help,capmkt,infra,game,visit,safety,budget,videos,methods,sources,news,cameras,scientist,ask,files,settings').split(',');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  for (const v of VIEWS) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
    await p.goto(BASE + '/?view=' + v, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(v === 'dashboard' ? 9000 : 6000);
    // open every <details> so hidden notes are read too
    await p.evaluate(v => document.querySelectorAll('#view-' + v + ' details').forEach(d => d.open = true), v);
    await p.waitForTimeout(400);
    const t = await p.evaluate(v => { const el = document.getElementById('view-' + v); return el ? el.innerText : ''; }, v);
    fs.writeFileSync(`${OUT}/${v}.txt`, t); console.log(v, t.length, 'chars', errs.length ? 'errors ' + errs.join(' | ') : '');
    await p.close();
  }
  await b.close();
})();
