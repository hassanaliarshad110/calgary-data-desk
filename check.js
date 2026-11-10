const { chromium, devices } = require('playwright');
const B='https://calgaryinsight.ca/';
const t=async u=>{try{const r=await fetch(B+u+(u.includes('?')?'&':'?')+'t='+Date.now());return [r.status,await r.text()]}catch(e){return [0,String(e)]}};
(async()=>{
 const [s,st]=await t('studies/calgary-police/');
 console.log('STUDY', s, ['moved to the City','Calls from the public','since 2015','In short'].map(k=>k+':'+st.includes(k)).join(' '));
 for(const u of ['studies/calgary-police/report.html','studies/calgary-police/calgary-police-performance-study.pdf','studies/calgary-police/calgary-police-performance-figures.xlsx','studies/calgary-police/calculator.html','studies/']){const [c]=await t(u);console.log('GET',u,c);}
 const [c,ct]=await t('crime/'); console.log('CRIME link', c, ct.includes('studies/calgary-police/'));
 const [m,mt]=await t('sitemap.xml'); console.log('SITEMAP', m, mt.includes(B+'studies/calgary-police/'));
 const b=await chromium.launch();
 for(const [n,ctx] of [['desktop',{viewport:{width:1366,height:900}}],['phone',devices['iPhone 13']]]){
  const x=await b.newContext(ctx),p=await x.newPage(),errs=[];p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(B+'studies/calgary-police/calculator.html',{waitUntil:'networkidle'});await p.waitForTimeout(1200);
  const txt=await p.evaluate(()=>document.body.innerText);
  console.log(n,'CALC', ['816.7','523','2,613','154.7'].map(k=>k+':'+txt.includes(k)).join(' '), 'sw', await p.evaluate(()=>document.documentElement.scrollWidth+'/'+innerWidth));
  await p.screenshot({path:`out/${n}-calc.png`});
  console.log(n,'errors',JSON.stringify(errs));
  await x.close();
 }
 await b.close();
})();
