const { chromium, devices } = require('playwright');
const B='https://calgaryinsight.ca/';
const j=async u=>{try{const r=await fetch(B+u+'?t='+Date.now());return r.ok?await r.json():'HTTP '+r.status}catch(e){return String(e)}};
const t=async u=>{try{const r=await fetch(B+u+'?t='+Date.now());return [r.status,await r.text()]}catch(e){return [0,String(e)]}};
(async()=>{
 const c=await j('visit/explore/data/calgary.json');
 console.log('EXPLORE DATA', typeof c==='object'?JSON.stringify({places:c.places.length,offers:'offers' in c,closed:c.places.filter(p=>p.closed).map(p=>p.id),cols:c.collections.map(x=>x.id+':'+x.places.length),hoods:c.neighbourhoods.length,beyond:c.beyond.length}):c);
 const s=await j('data/school_tax.json');
 try{console.log('SCHOOL', JSON.stringify({year:s.requisition.year,perres:s.residents.calgary.per_resident,appr:s.approvals.calgary_total,boards:s.spending.boards_matched,profiles:s.grants.profiles_read,errors:s.errors||s.stale_parts}))}catch(e){console.log('SCHOOL ERR',e,String(JSON.stringify(s)).slice(0,300))}
 const tr=await j('data/tourism.json');
 try{console.log('TOURISM', tr.arrivals.ports.Calgary.overnight_by_year['2025'], !!tr.airports_annual.Calgary)}catch(e){console.log('TOURISM ERR',e)}
 const [ps]=await t('py/data/tourism_research.json'); console.log('py research', ps);
 const [sm,smt]=await t('sitemap.xml'); console.log('SITEMAP', sm, smt.includes(B+'visit/explore/'), smt.includes(B+'tourism-intelligence/'));
 const [g,gt]=await t('visit/'); console.log('VISIT banner', g, gt.includes('class="explore-cta"'), /New · free/.test(gt));
 const [ti,tit]=await t('tourism-intelligence/'); console.log('TI', ti, (tit.match(/<h2[^>]*>[^<]*/g)||[]).length, 'h2s', /1,065,396/.test(tit));
 const [ui,uit]=await t('visit.js'); console.log('APP card', ui, uit.includes('visit/explore/'));
 const b=await chromium.launch();
 for(const [n,ctx] of [['desktop',{viewport:{width:1366,height:900}}],['phone',devices['iPhone 13']]]){
  const x=await b.newContext(ctx),p=await x.newPage(),errs=[];p.on('pageerror',e=>errs.push(String(e)));
  for(const h of ['plan','map','collections','collections/no-charge','neighbourhoods','whatson','beyond','offers']){
   await p.goto(B+'visit/explore/#'+h,{waitUntil:'networkidle'}).catch(e=>errs.push(String(e)));await p.waitForTimeout(800);
   const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,vw:innerWidth,tabs:[...document.querySelectorAll('#tabs a')].map(a=>a.textContent).join('|'),cur:(document.querySelector('#tabs a[aria-current]')||{}).textContent,free:/\bfree\b/i.test(document.body.innerText),loading:!!document.querySelector('.loading'),markers:document.querySelectorAll('.leaflet-marker-icon').length,cards:document.querySelectorAll('.card').length}));
   console.log(n,h,JSON.stringify(r));
  }
  // plan
  await p.goto(B+'visit/explore/#plan',{waitUntil:'networkidle'});await p.waitForTimeout(500);
  const btn=await p.$('text=Plan my days'); if(btn){await btn.click();await p.waitForTimeout(800);console.log(n,'plan days',await p.$$eval('.day',d=>d.length),'stops',await p.$$eval('.stop',d=>d.length));} else console.log(n,'no plan button');
  await p.screenshot({path:`out/${n}-plan.png`,fullPage:false});
  await p.goto(B+'visit/explore/#map',{waitUntil:'networkidle'});await p.waitForTimeout(1500);await p.screenshot({path:`out/${n}-map.png`});
  const gp=await x.newPage();await gp.goto(B+'visit/history/',{waitUntil:'domcontentloaded'}).catch(()=>{});console.log(n,'guide Plan&map link',await gp.evaluate(()=>!![...document.querySelectorAll('a')].find(a=>a.getAttribute('href')==='../explore/')));
  console.log(n,'errors',JSON.stringify(errs));
  await x.close();
 }
 await b.close();
})();
