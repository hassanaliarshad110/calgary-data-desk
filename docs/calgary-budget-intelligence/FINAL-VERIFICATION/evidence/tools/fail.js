// failure handling: hide one source at a time and open every section of the centre
const { chromium } = require('playwright');
(async () => {
  const base = 'http://localhost:8802';
  const b = await chromium.launch(); const out = [];
  const cases = [['none', []], ['budget.json', ['**/data/budget.json']], ['tax.json', ['**/data/tax.json']], ['business-cases.json', ['**/budget-intel/business-cases.json']], ['crosswalk.json', ['**/budget-intel/crosswalk.json']], ['infra.json + accountability.json', ['**/data/infra.json', '**/data/accountability.json']], ['ward file (map)', ['**/data/*/w0.json']]];
  for (const [name, pats] of cases) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
    for (const pat of pats) await p.route(pat, r => r.fulfill({ status: 404, body: 'not found' }));
    const errs = []; p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
    const secs = {};
    for (const s of ['overview', 'operating', 'capital', 'revenue', 'actual', 'cases', 'projects', 'performance', 'simulator', 'links', 'checks']) {
      await p.goto(base + '/?view=budget-intelligence&bi=' + s, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(name.startsWith('ward') ? 4500 : 3200);
      secs[s] = await p.evaluate(() => { const m = document.querySelector('#bi-main'); return { len: m.innerText.length, empty: m.querySelectorAll('.bi-empty').length, nan: /NaN|undefined|\$–|Infinity/.test(m.innerText), banner: !document.querySelector('#bi-error').hidden }; });
    }
    out.push({ hidden: name, jsErrors: errs, sections: secs });
    console.log(name.padEnd(34), 'js errors:', errs.length, errs[0] || '', '| banner:', Object.values(secs).some(x => x.banner), '| empty-state boxes:', Object.entries(secs).filter(([, v]) => v.empty).map(([k, v]) => k + ':' + v.empty).join(' ') || 'none', '| NaN/undefined text:', Object.entries(secs).filter(([, v]) => v.nan).map(([k]) => k).join(' ') || 'none');
    await ctx.close();
  }
  require('fs').writeFileSync('fail-results.json', JSON.stringify(out, null, 1));
  await b.close();
})();
