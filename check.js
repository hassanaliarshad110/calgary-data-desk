const { chromium } = require('playwright');
const B='https://calgaryinsight.ca/';
const t=async u=>{try{const r=await fetch(B+u+(u.includes('?')?'&':'?')+'t='+Date.now());return [r.status,await r.text()]}catch(e){return [0,String(e)]}};
(async()=>{
 const S='studies/what-calgarians-pay/';
 const [s,st]=await t(S); console.log('PAGE',s,'182.53',st.includes('182.53'),'$567',st.includes('$567'));
 const [r,rt]=await t(S+'report.html'); console.log('REPORT',r,'522.52',rt.includes('522.52'),'182.53',rt.includes('182.53'));
 const [x]=await t(S+'what-calgarians-pay-calculations.xlsx'); console.log('XLSX',x);
 const [p,pt]=await t('py/data/pay_study.json'); console.log('PAY_STUDY',p,'522.52',pt.includes('522.52'));
 const b=await chromium.launch();const pg=await b.newPage();await pg.goto(B+S+'calculator.html',{waitUntil:'networkidle'});await pg.waitForTimeout(800);
 const ct=await pg.evaluate(()=>document.body.innerText);console.log('CALC $567',ct.includes('$567'),'$523',ct.includes('$523'));await b.close();})();
