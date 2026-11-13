"""15% tax study, part 3: how residential assessments moved by home type and community, from the historical roll."""
import json, os, sys, traceback
ROOT = os.getcwd(); sys.path.insert(0, ROOT)
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
import calgary_data as cd
log = {}
m = cd.get_json('https://data.calgary.ca/api/views/4ur7-wsgc.json')
cols = [c['fieldName'] for c in m.get('columns', [])]
json.dump({'name': m.get('name'), 'description': m.get('description'), 'columns': [(c['fieldName'], c.get('description')) for c in m.get('columns', [])]},
          open(os.path.join(out, 'meta.json'), 'w'))
print(cols)
val = next((c for c in ('re_assessed_value', 'assessed_value') if c in cols), None)
where = "assessment_class='RE' AND property_type='LI' AND starts_with(sub_property_use,'R')"
tries = [
    ('by_year_type.json', f'roll_year,sub_property_use,count(*) as n,sum({val}) as v,avg({val}) as a', where, 'roll_year,sub_property_use'),
    ('by_year_comm_type.json', f'roll_year,comm_code,sub_property_use,count(*) as n,sum({val}) as v', where, 'roll_year,comm_code,sub_property_use'),
]
for name, sel, wh, grp in tries:
    try:
        rows, off = [], 0
        while True:
            p = cd.get_json(cd.soql_url('4ur7-wsgc', sel, wh, grp, grp, 50000, offset=off), timeout=600)
            rows += p; off += 50000
            if len(p) < 50000: break
        json.dump(rows, open(os.path.join(out, name), 'w')); log[name] = len(rows)
    except Exception as e:
        traceback.print_exc(); log[name] = 'FAIL ' + str(e)[:400]
# every home's value in each roll year for the paired change (same roll number, two years)
try:
    rn = next((c for c in ('roll_number', 'roll_no') if c in cols), None)
    for y in (2025, 2026):
        rows, off = [], 0
        while True:
            p = cd.get_json(cd.soql_url('4ur7-wsgc', f'{rn},sub_property_use,comm_code,{val}', where + f' AND roll_year={y}', None, rn, 50000, offset=off), timeout=600)
            rows += p; off += 50000
            if len(p) < 50000: break
        import gzip, csv
        with gzip.open(os.path.join(out, f'homes_{y}.csv.gz'), 'wt', newline='') as f:
            w = csv.writer(f); w.writerow([rn, 'sub_property_use', 'comm_code', val])
            for r in rows: w.writerow([r.get(rn), r.get('sub_property_use'), r.get('comm_code'), r.get(val)])
        log[f'homes_{y}'] = len(rows)
except Exception as e:
    traceback.print_exc(); log['paired'] = 'FAIL ' + str(e)[:400]
json.dump(log, open(os.path.join(out, 'log.json'), 'w')); print(log)
