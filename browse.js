const { chromium } = require('playwright'); const fs = require('fs');
const pages = {
  van_flat: 'https://vancouver.ca/home-property-development/flat-rates.aspx',
  van_metered: 'https://vancouver.ca/home-property-development/metered-rates.aspx',
  van_garbage: 'https://vancouver.ca/home-property-development/garbage-and-green-bin-utility-fees.aspx',
  van_taxrates: 'https://vancouver.ca/home-property-development/property-tax-rates-and-levies.aspx',
  van_0pct: 'https://vancouver.ca/news-calendar/council-approves-0-property-tax-nov-2025.aspx',
  ott_taxrates: 'https://ottawa.ca/en/living-ottawa/taxes/property-taxes/tax-rates',
  ott_tax: 'https://ottawa.ca/en/living-ottawa/taxes/property-taxes',
  ott_budget: 'https://ottawa.ca/en/city-hall/budget/budget-2026',
  ott_water: 'https://ottawa.ca/en/living-ottawa/water-utility-bills/rates-and-fees/water-utility-rates',
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', locale: 'en-CA' });
  const p = await ctx.newPage(); const extra = {};
  for (const [k, u] of Object.entries(pages)) {
    try { const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(3000);
      const t = await p.evaluate(() => document.body.innerText); fs.writeFileSync(`out/${k}.txt`, t);
      const links = await p.evaluate(() => [...document.querySelectorAll('a')].map(a => [a.innerText.trim(), a.href]).filter(([t, h]) => /2026|water|sewer|garbage|green bin|rate|tax|budget/i.test(t + h)).slice(0, 80));
      fs.writeFileSync(`out/${k}.links.json`, JSON.stringify(links, null, 1));
      console.log(r && r.status(), k, t.length);
      for (const [lt, lh] of links) if (/annual rates|water and sewer rates|garbage and green bin rates|2026.*(rates|fees)/i.test(lt) && lh.startsWith('https://vancouver.ca') && !extra[lh]) extra[lh] = 'x_' + Object.keys(extra).length;
    } catch (e) { console.log('ERR', k, String(e).slice(0, 200)); }
  }
  for (const [u, k] of Object.entries(extra)) {
    try { const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(2500);
      fs.writeFileSync(`out/${k}.txt`, u + '\n' + await p.evaluate(() => document.body.innerText)); console.log(r && r.status(), k, u); } catch (e) { console.log('ERR', u); }
  }
  await b.close();
})();
