import json
d=json.load(open('t.json'))
print('CHK errors',d['errors'])
a=d.get('arrivals') or {}
print('CHK share',a.get('share_of_canada_pct'),'latest',a.get('latest_full_year'))
for p,v in (a.get('ports') or {}).items(): print('CHK port',p,{y:v['overnight_by_year'][y] for y in sorted(v['overnight_by_year'])[-6:]},'ytd',v.get('year_to_date'))
print('CHK cal months',a['ports']['Calgary']['average_by_month'] if a.get('ports') else None)
print('CHK cal countries',[(r['country'],r['overnight'],r['year_before'],r['five_years_before']) for r in (a.get('by_country') or {}).get('Calgary',[])][:14])
print('CHK sameday',{p:{y:v[y] for y in sorted(v)[-2:]} for p,v in (a.get('all_visitors_incl_same_day_by_year') or {}).items()})
for c,x in (d.get('airports_annual') or {}).items(): print('CHK air',c,x['geo'],sorted(x['years'].items())[-2:])
print('CHK monthly',{c:list(m.items())[-1] for c,m in (d.get('airports_monthly') or {}).items()})
