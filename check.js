const { chromium, devices } = require('playwright');
const B='https://calgaryinsight.ca/';
const t=async u=>{try{const r=await fetch(B+u+(u.includes('?')?'&':'?')+'t='+Date.now());return [r.status,await r.text()]}catch(e){return [0,String(e)]}};
(async()=>{
 const S='studies/what-calgarians-pay/';
 for(const u of ['', 'calculator.html','report.html','what-calgarians-pay.pdf','what-calgarians-pay-calculations.xlsx','what-calgarians-pay-figures.xlsx']){const [c,x]=await t(S+u);console.log('GET',S+u,c,x.length);}
 const [s,st]=await t(S); console.log('PAGE $369',st.includes('$369 a month'),'lowest',st.includes('lowest'),'$567',st.includes('$567 a month in 2030'),'16%',st.includes('Why the typical home sees about 16%'),'workbook link',st.includes('what-calgarians-pay-calculations.xlsx'),'old564',st.includes('$564'));
 const [i,it]=await t('studies/'); const a=it.indexOf('what-calgarians-pay/'),b=it.indexOf('calgary-police/'); console.log('STUDIES',i,'pay first',a>0&&(b<0||a<b));
 const [h,ht]=await t(''); console.log('HOME card lowest',ht.includes('the lowest of eight cities compared'),'$567',ht.includes('about $567 by 2030'),'budget-new',ht.includes('budget-new'));
 const [bj,bt]=await t('data/budget.json'); try{const J=JSON.parse(bt);console.log('BUDGET.JSON',bj,'plan_2027',!!J.plan_2027,'proposed',!!J.proposed,'years',J.years)}catch(e){console.log('BUDGET.JSON',bj,'parse fail')}
 const [pj,pt]=await t('data/pay_study.json'); console.log('PAY_STUDY.JSON',pj,pt.includes('$567'));
 const br=await chromium.launch();
 for(const [n,ctx] of [['desktop',{viewport:{width:1366,height:1000}}],['phone',devices['iPhone 13']]]){
  const x=await br.newContext(ctx),p=await x.newPage(),errs=[];p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(B+S+'calculator.html',{waitUntil:'networkidle'});await p.waitForTimeout(800);
  const ct=await p.evaluate(()=>document.body.innerText);console.log(n,'CALC',['$369','$422','$567'].map(k=>k+':'+ct.includes(k)).join(' '),'sideways',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await p.goto(B+'?view=budget',{waitUntil:'networkidle'});await p.waitForTimeout(3500);
  const plan=await p.evaluate(()=>{const e=document.querySelector('#bud-plan-card');return e?{vis:e.offsetParent!==null,t:e.innerText.slice(0,400)}:null});
  console.log(n,'PLAN',plan&&plan.vis,plan&&plan.t.includes('$53'),plan&&plan.t.includes('+15.0%'));
  const scope=await p.evaluate(()=>{const s=document.querySelector('#scope, select[aria-label*="cope"], .scope-select');return s?(s.value||s.textContent).slice(0,40):''});
  const has2032=await p.evaluate(()=>[...document.querySelectorAll('#bud-year option')].map(o=>o.value));
  console.log(n,'years',has2032.join(','),'scope',scope);
  if(has2032.includes('2032')){await p.selectOption('#bud-year','2032');await p.waitForTimeout(1500);}
  const r=await p.evaluate(()=>({sub:(document.querySelector('#bud-sub')||{}).innerText,title:(document.querySelector('#bud-ward-title')||{}).innerText,ward:(document.querySelector('#bud-ward')||{}).innerText}));
  console.log(n,'SUB',r.sub);console.log(n,'WARDTITLE',r.title,'perResident',/Per resident/.test(r.ward||''));
  console.log(n,'WARD',(r.ward||'').replace(/\n/g,' | ').slice(0,900));
  console.log(n,'sideways',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'errors',errs.slice(0,3));
  await x.close();}
 await br.close();})();
