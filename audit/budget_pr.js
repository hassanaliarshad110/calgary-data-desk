const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const get = async p => (await p.evaluate(() => document.getElementById('view-budget').innerText)).match(/.{0,40}per resident.{0,60}/g);
  let p = await ctx.newPage(); await p.goto('' + (process.env.SITE || 'http://127.0.0.1:8801') + '/?view=budget'); await p.waitForTimeout(20000);
  console.log('direct, after 20 s:', await get(p));
  p = await ctx.newPage(); await p.goto('' + (process.env.SITE || 'http://127.0.0.1:8801') + '/?view=dashboard'); await p.waitForTimeout(10000);
  await p.evaluate(() => show('budget')); await p.waitForTimeout(3000);
  console.log('after the dashboard:', await get(p));
  await b.close();
})();
