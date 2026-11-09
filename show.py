import json
d=json.load(open('st.json'))
print('CHK errors',d['errors'])
r=d.get('residents') or {}; print('CHK residents',{k:v for k,v in r.items() if k not in ('municipalities','how')}); print('CHK top per resident',[(m['name'],m['population'],m['per_resident'],m['non_residential_pct']) for m in (r.get('municipalities') or [])[:8]])
sp=d.get('spending') or {}; print('CHK spending',{k:v for k,v in sp.items() if k not in ('boards','how')}); [print('CHK sp',b) for b in sp.get('boards',[])[:5]]
print('CHK unmatched spend',[b['board'] for b in sp.get('boards',[]) if not b['students']])
print('CHK approvals',d.get('approvals'))
cz=d.get('class_size_grant') or {}; print('CHK csr',len(cz.get('boards',[])),cz.get('boards',[])[:4])
g=d.get('grants') or {}; print('CHK grants',g.get('budget_year'),g.get('profiles_read')); print('CHK grants AB',g.get('per_student_alberta')); [print('CHK g',k,v) for k,v in (g.get('per_student_selected_boards') or {}).items()]
