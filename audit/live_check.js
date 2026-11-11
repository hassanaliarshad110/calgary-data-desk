// Live check of calgaryinsight.ca after publishing: the fixed figures as visitors see them.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const S = 'https://calgaryinsight.ca';
(async () => {
  const b = await chromium.launch(); const out = [];
  const log = (...a) => { const s = a.join(' '); out.push(s); console.log(s); };
  for (const [name, opts] of [['desktop', { viewport: { width: 1280, height: 900 } }], ['phone', { ...devices['Pixel 7'] }]]) {
    const p = await b.newPage(opts); const errs = []; p.on('pageerror', e => errs.push(e.message));
    const t = async (v, wait = 9000) => { await p.goto(`${S}/?view=${v}`, { waitUntil: 'load' }); await p.waitForTimeout(wait); return p.evaluate(() => document.body.innerText); };
    let x = await t('budget-intelligence&bi=actual');
    log(name, 'BvA', ['$236.4 million', '$276.3 million', '$259.3 million', '52.5%', '92.4%'].map(k => k + ':' + x.includes(k)).join(' '));
    log(name, 'BvA internal wording', /proposed, not built|What would close the gap|no screen of their own/.test(x));
    log(name, 'BvA overflow', await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
    x = await t('budget', 20000);
    log(name, 'budget direct per resident', /operating per resident \([\d,]+ people/.test(x), (x.match(/2,570|2,867/g) || []).join(','));
    x = await t('dashboard', 15000);
    log(name, 'dashboard', ['484,827', 'with no community', '76.3%'].map(k => k + ':' + x.includes(k)).join(' '), (x.match(/[\d,]{6,7}(?= requests| 311)/g) || []).slice(0, 3).join(','));
    x = await t('infra', 15000);
    log(name, 'infra', /12 MONTHS TO 23 AUG 2026/i.test(x), (x.match(/5,41\d/g) || []).slice(0, 2).join(','));
    x = await t('families', 15000);
    log(name, 'families', ['227,762', '1,957 spaces', "Children'S"].map(k => k + ':' + x.includes(k)).join(' '));
    log(name, 'js errors', JSON.stringify(errs.slice(0, 5)));
    await p.close();
  }
  const q = await b.newPage(); const e2 = []; q.on('pageerror', e => e2.push(e.message));
  await q.goto(S + '/', { waitUntil: 'domcontentloaded' });
  await q.click('#ss-q').catch(() => {}); await q.type('#ss-q', 'mart', { delay: 40 }); await q.waitForTimeout(1500); await q.type('#ss-q', 'i', { delay: 30 }); await q.waitForTimeout(6000);
  log('search rows', await q.evaluate(() => document.querySelectorAll('#ss-results .ss-row').length), 'errors', JSON.stringify(e2));
  fs.writeFileSync(process.argv[2], out.join('\n')); await b.close();
})();
