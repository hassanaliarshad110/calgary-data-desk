const { chromium, devices } = require('playwright');
const B='https://calgaryinsight.ca/';
const t=async u=>{try{const r=await fetch(B+u+(u.includes('?')?'&':'?')+'t='+Date.now());return [r.status,await r.text()]}catch(e){return [0,String(e)]}};
(async()=>{
 const [s,st]=await t('studies/'); console.log('STUDIES', s, ['calgary-police/','calgary-sewers/','who-calgarys-311-hears/'].map(k=>k+':'+st.includes('href="'+k)).join(' '));
 for(const u of ['studies/calgary-police/','studies/calgary-sewers/','studies/who-calgarys-311-hears/','visit/explore/daytrips/daytrips.json','hit.js']){const [c]=await t(u);console.log('GET',u,c);}
 const [h,ht]=await t(''); console.log('HOME', h, 'strip', ht.includes('class="studies-strip"'), 'menu', ht.includes('href="studies/" title='), 'hit', ht.includes('/hit.js'));
 const [v,vt]=await t('visit/'); console.log('VISIT', v, 'trips', vt.includes('class="explore-cta trips-cta" href="explore/#beyond"'));
 const b=await chromium.launch();
 for(const [n,ctx] of [['desktop',{viewport:{width:1366,height:1000}}],['phone',devices['iPhone 13']]]){
  const x=await b.newContext(ctx),p=await x.newPage(),errs=[];p.on('pageerror',e=>errs.push(String(e)));
  const tiles=[];p.on('response',r=>{if(/tile\.openstreetmap|arcgisonline/.test(r.url()))tiles.push(r.status())});
  await p.goto(B+'visit/explore/#beyond',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
  await p.evaluate(()=>{try{localStorage.removeItem('ci-daytrips')}catch(e){}});
  await p.goto(B+'visit/explore/#beyond',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
  const r1=await p.evaluate(()=>({in:document.querySelectorAll('.dt-pt.in').length,sw:document.documentElement.scrollWidth,vw:innerWidth}));
  if(n==='phone') await p.screenshot({path:'out/phone-dial.png'});
  await p.click('.dt-pt.in >> nth=4',{force:true});await p.waitForTimeout(2500);
  const r2=await p.evaluate(()=>({sel:(document.querySelector('.dt-gbody h2')||{}).textContent,img:(document.querySelector('#dt-ph img')||{}).naturalWidth,route:document.querySelectorAll('#dt-rmap path.leaflet-interactive').length}));
  if(n==='phone') await p.screenshot({path:'out/phone-guide.png'});
  await p.goto(B+'visit/explore/#map',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
  console.log(n,JSON.stringify(r1),JSON.stringify(r2),'tiles',tiles.length,tiles.filter(s=>s!==200).length,'errors',JSON.stringify(errs));
  await x.close();
 }
 await b.close();
})();
