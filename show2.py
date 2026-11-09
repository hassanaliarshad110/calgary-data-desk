import json
d=json.load(open('t.json'))
print('CHK errors',d['errors'])
a=d.get('arrivals') or {}
print('CHK share',a.get('share_of_canada_pct'),'latest',a.get('latest_full_year'))
for p,v in (a.get('ports') or {}).items(): print('CHK port',p,{y:v['overnight_by_year'][y] for y in sorted(v['overnight_by_year'])[-7:]},'ytd',v.get('year_to_date'),'US',{y:v['us_by_year'][y] for y in sorted(v['us_by_year'])[-2:]},'OV',{y:v['overseas_by_year'][y] for y in sorted(v['overseas_by_year'])[-2:]})
print('CHK cal months',a['ports']['Calgary']['average_by_month'])
for p in ('Calgary','Vancouver','Toronto','Canada'): print('CHK countries',p,[(r['country'],r['overnight'],r['year_before']) for r in (a.get('by_country') or {}).get(p,[])][:12])
for c,x in (d.get('airports_annual') or {}).items(): print('CHK air',c,x['geo'],sorted(x['years'].items())[-1])
print('CHK monthly',{c:list(m.items())[-1] for c,m in (d.get('airports_monthly') or {}).items()})
