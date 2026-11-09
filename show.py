import json
d=json.load(open('st.json'))
print('CHK errors',d['errors'])
r=d.get('residents') or {}; print('CHK residents',{k:v for k,v in r.items() if k not in ('municipalities','how')})
print('CHK top5000',[(m['name'],m['population'],m['per_resident'],m['non_residential_pct']) for m in (r.get('municipalities') or []) if (m['population'] or 0)>=5000][:12])
print('CHK approvals',{k:v for k,v in (d.get('approvals') or {}).items() if k!='how'})
print('CHK tps',{k:v for k,v in (d.get('tax_per_student') or {}).items() if k!='how'})
