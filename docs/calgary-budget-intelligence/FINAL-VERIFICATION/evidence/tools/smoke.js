// Smoke test: open every screen of the site at BASE, record JS exceptions and take screenshots.
// usage: node smoke.js <base-url> <out-dir> [extra views comma separated]
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2], OUT = process.argv[3];
const EXTRA = (process.argv[4] || '').split(',').filter(Boolean);
const VIEWS = ['dashboard','issues','families','changes','growth','compare','elections','livemap','citynews','fedbudget','invest','help','capmkt','infra','game','visit','safety','budget','videos','methods','sources','cameras','scientist','ask','files','settings'].concat(EXTRA);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  for (const [label, ctxOpts] of [['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }], ['mobile', { ...devices['iPhone 13'] }]]) {
    const ctx = await browser.newContext(ctxOpts);
    for (const v of VIEWS) {
      const page = await ctx.newPage();
      const errs = [], fails = [];
      page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
      page.on('requestfailed', r => { const u = r.url(); if (u.startsWith(BASE)) fails.push(u.replace(BASE, '')); });
      page.on('response', r => { const u = r.url(); if (u.startsWith(BASE) && r.status() >= 400) fails.push(r.status() + ' ' + u.replace(BASE, '')); });
      let shown = false, textLen = 0, title = '';
      try {
        await page.goto(BASE + '/?view=' + v, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(v === 'dashboard' ? 6000 : 4500);
        const info = await page.evaluate(v => { const el = document.getElementById('view-' + v); return el ? { on: el.classList.contains('is-on'), len: el.innerText.trim().length, h: (el.querySelector('h1') || {}).innerText || '' } : null; }, v);
        if (info) { shown = info.on; textLen = info.len; title = info.h; }
        await page.screenshot({ path: path.join(OUT, `${label}-${v}.jpg`), type: 'jpeg', quality: 70, fullPage: false });
      } catch (e) { errs.push('NAV: ' + String(e.message || e).slice(0, 200)); }
      results.push({ device: label, view: v, exists: shown !== false || textLen > 0, shown, title, textLen, jsErrors: errs, localFailures: [...new Set(fails)].slice(0, 12) });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  for (const r of results) console.log(r.device.padEnd(8), r.view.padEnd(20), r.shown ? 'shown' : 'NOT-SHOWN', String(r.textLen).padStart(6), 'err:' + r.jsErrors.length, 'fail:' + r.localFailures.length, r.jsErrors[0] || '', r.localFailures.slice(0,3).join(' | '));
})();
