"""15% tax study, part 2: every home's 2026 assessed value and type, the 2027-2030 budget open data, dataset metadata."""
import json, os, sys, gzip, csv, traceback
ROOT = os.getcwd(); sys.path.insert(0, ROOT)
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
import calgary_data as cd
from population import HOMES_WHERE
log = {}
def step(name, fn):
    try:
        fn(); log[name] = 'ok'
    except Exception as e:
        traceback.print_exc(); log[name] = 'FAIL ' + str(e)[:400]
def page_all(ds, select, where=None, order=':id', n=50000):
    rows, off = [], 0
    while True:
        p = cd.get_json(cd.soql_url(ds, select, where, None, order, n, offset=off), timeout=300)
        rows += p; off += n
        if len(p) < n: return rows
def homes():
    rows = page_all('4bsw-nn7w', 'roll_year,comm_code,sub_property_use,re_assessed_value,year_of_construction,land_use_designation', HOMES_WHERE)
    with gzip.open(os.path.join(out, 'homes_2026.csv.gz'), 'wt', newline='') as f:
        wr = csv.writer(f); wr.writerow(['roll_year', 'comm_code', 'sub_property_use', 're_assessed_value', 'year_of_construction', 'land_use'])
        for r in rows:
            wr.writerow([r.get('roll_year'), r.get('comm_code'), r.get('sub_property_use'), r.get('re_assessed_value'), r.get('year_of_construction'), r.get('land_use_designation')])
    print('homes', len(rows))
step('homes', homes)
def budget():
    rows = page_all('nnnm-9sfh', None)
    json.dump(rows, open(os.path.join(out, 'budget_2027_2030_rows.json'), 'w'))
    print('budget rows', len(rows))
step('budget 2027-2030', budget)
def meta():
    import urllib.request
    m = {}
    for ds in ('nnnm-9sfh', '4bsw-nn7w'):
        try:
            m[ds] = cd.get_json(f'https://data.calgary.ca/api/views/{ds}.json')
        except Exception as e:
            m[ds] = str(e)
    m['search_budget'] = cd.search_datasets('operating budget 2023 2026', 10)
    m['search_population'] = cd.search_datasets('population estimate forecast', 10)
    m['search_assess_hist'] = cd.search_datasets('historical property assessments', 10)
    json.dump(m, open(os.path.join(out, 'meta.json'), 'w'), default=str)
step('meta', meta)
json.dump(log, open(os.path.join(out, 'log.json'), 'w')); print(log)
