const B='https://calgaryinsight.ca/';
(async()=>{
 for(const u of ['data/built.json','data/city_actual/w0.json','data/city_actual/w5.json','data/city_pace/w0.json','311/','sw.js','service-worker.js']){
  try{const r=await fetch(B+u+'?t='+Date.now());const t=await r.text();
   if(u.endsWith('.json')){let d=JSON.parse(t);console.log(u,r.status,JSON.stringify({built_at:d.built_at,period:d.period,stale:d.stale,open_now:d.summary&&d.summary.open_now,lastmod:r.headers.get('last-modified')}));}
   else console.log(u,r.status,r.headers.get('last-modified'),(t.match(/as of[^<]{0,60}/gi)||[]).slice(0,4));
  }catch(e){console.log(u,'ERR',String(e))}
 }
})();
