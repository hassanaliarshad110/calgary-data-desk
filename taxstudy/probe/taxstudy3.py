"""15% tax study, part 3: each home's assessed value in 2022-2025 (historical roll) and 2026 (current roll), by roll number."""
import json, os, sys, traceback, gzip, csv
ROOT = os.getcwd(); sys.path.insert(0, ROOT)
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
import calgary_data as cd
log = {}
def pages(ds, sel, where, order):
    rows, off = [], 0
    while True:
        p = cd.get_json(cd.soql_url(ds, sel, where, None, order, 50000, offset=off), timeout=600)
        rows += p; off += 50000
        if len(p) < 50000: return rows
try:
    log['years'] = cd.get_json(cd.soql_url('4ur7-wsgc', 'roll_year,assessment_class,count(*) as n', None, 'roll_year,assessment_class', 'roll_year', 500))
    log['sample_2021'] = cd.get_json(cd.soql_url('4ur7-wsgc', None, "roll_year='2021'", None, None, 3))
except Exception as e:
    log['years'] = 'FAIL ' + str(e)[:300]
H = "property_type='LI' AND starts_with(sub_property_use,'R')"
def save(name, rows, cols):
    with gzip.open(os.path.join(out, name), 'wt', newline='') as f:
        w = csv.writer(f); w.writerow(cols)
        for r in rows: w.writerow([r.get(c) for c in cols])
cols = ['roll_number', 'assessment_class', 'sub_property_use', 'comm_code', 're_assessed_value']
for y in (2022, 2023, 2024, 2025):
    try:
        rows = pages('4ur7-wsgc', ','.join(cols), H + f" AND roll_year='{y}'", 'roll_number')
        save(f'homes_{y}.csv.gz', rows, cols); log[f'homes_{y}'] = len(rows)
    except Exception as e:
        traceback.print_exc(); log[f'homes_{y}'] = 'FAIL ' + str(e)[:300]
try:
    rows = pages('4bsw-nn7w', ','.join(cols), H, 'roll_number')
    save('homes_2026.csv.gz', rows, cols); log['homes_2026'] = len(rows)
except Exception as e:
    traceback.print_exc(); log['homes_2026'] = 'FAIL ' + str(e)[:300]
json.dump(log, open(os.path.join(out, 'log.json'), 'w'), default=str); print(json.dumps(log, default=str)[:3000])
