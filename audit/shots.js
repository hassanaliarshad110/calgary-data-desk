// Screenshots of the LIVE site for a presentation (read only). usage: node shots.js <out-dir>
const { chromium } = require('playwright'); const fs = require('fs');
const OUT = process.argv[2]; const BASE = 'https://calgaryinsight.ca';
const SHOTS = [
  { n: '01-dashboard', u: '/?view=dashboard', w: 10000 },
  { n: '02-compare', u: '/?view=compare', w: 8000 },
  { n: '03-livemap', u: '/?view=livemap', w: 9000, act: async p => { try { await p.getByText('Buses and CTrains, live', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {} await p.waitForTimeout(12000); } },
  { n: '04-growth', u: '/?view=growth', w: 10000 },
  { n: '05-budget-intel', u: '/?view=budget-intelligence', w: 9000 },
  { n: '06-elections', u: '/?view=elections', w: 9000 },
  { n: '07-election-analytics', u: '/?view=elections', w: 7000, act: async p => { try { await p.locator('#view-elections').getByRole('button', { name: 'Election Analytics' }).first().click({ timeout: 6000 }); } catch (e) { try { await p.getByText('Election Analytics', { exact: true }).first().click({ timeout: 4000 }); } catch (e2) {} } await p.waitForTimeout(9000); } },
  { n: '08-studies', u: '/studies/', w: 5000 },
  { n: '09-ask', u: '/?view=ask', w: 6000 },
  { n: '10-infra', u: '/?view=infra', w: 8000 },
  { n: '11-issues', u: '/?view=issues', w: 8000 },
  { n: '12-city-stories', u: '/city-stories/', w: 6000 },
  { n: '13-game', u: '/game/', w: 25000, act: async p => { await p.mouse.click(720, 450).catch(() => {}); await p.waitForTimeout(8000); } },
  { n: '14-invest', u: '/?view=invest', w: 9000 },
  { n: '15-help', u: '/?view=help', w: 7000 },
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(() => { try { localStorage.setItem('cdd-scope', '5'); } catch (e) {} });
  for (const s of SHOTS) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    try {
      await p.goto(BASE + s.u, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(s.w);
      if (s.act) await s.act(p);
      await p.screenshot({ path: `${OUT}/${s.n}.png` });
      await p.screenshot({ path: `${OUT}/${s.n}-full.png`, fullPage: true }).catch(() => {});
      const t = await p.evaluate(() => document.body.innerText.slice(0, 4000)); fs.writeFileSync(`${OUT}/${s.n}.txt`, t);
      console.log(s.n, 'ok', errs.join(' | '));
    } catch (e) { console.log(s.n, 'FAIL', String(e).slice(0, 200)); }
    await p.close();
  }
  await b.close();
})();
