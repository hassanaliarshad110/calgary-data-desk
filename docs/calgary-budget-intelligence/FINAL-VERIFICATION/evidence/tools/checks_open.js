// open every check on the Data checks section and print its full text; report script errors
const { chromium } = require('playwright');
(async () => {
  const base = process.argv[2] || 'http://localhost:8802';
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  await p.goto(base + '/?view=budget-intelligence&bi=checks', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.bi-check', { timeout: 20000 });
  const out = await p.evaluate(() => [...document.querySelectorAll('.bi-check')].map(d => { d.open = true; return d.innerText.replace(/\n{2,}/g, '\n'); }));
  out.forEach((t, i) => console.log(`--- ${i + 1}\n${t}`));
  console.log('checks', out.length, 'script errors', JSON.stringify(errs));
  await b.close();
})();
