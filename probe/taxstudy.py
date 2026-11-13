"""15% tax study: the whole-city build (ward table, growth model under every method), property tax by ward, budget."""
import json, os, sys, traceback
ROOT = os.getcwd(); sys.path.insert(0, ROOT)
out = sys.argv[1]; cache = sys.argv[2] if len(sys.argv) > 2 else '.site-cache'
os.makedirs(out, exist_ok=True); os.makedirs(cache, exist_ok=True)
log = {}
def w(name, obj):
    json.dump(obj, open(os.path.join(out, name), 'w'), default=str, separators=(',', ':'))
def step(name, fn):
    try:
        fn(); log[name] = 'ok'
    except Exception as e:
        traceback.print_exc(); log[name] = 'FAIL ' + str(e)[:400]
import census, dashboard, budget, proptax
def city(m):
    d = dashboard.build(cache_dir=cache, ward=0, pop_method=m)
    w(f'city_{m}.json', d)
for m in ('city_actual', 'model', 'census2021'):
    step('city ' + m, lambda m=m: city(m))
def tax():
    data = proptax.load(cache); table = dashboard.wardmap.load(cache)
    comms = table.get('communities') or {}
    w('tax.json', {**{k: v for k, v in data.items() if k != 'by_comm'},
                   'by_ward': {str(k): v for k, v in proptax.by_ward(data, table).items()},
                   'by_comm': {c: dict(e, name=(comms.get(c) or {}).get('name', c), ward=(comms.get(c) or {}).get('ward'))
                               for c, e in data['by_comm'].items()},
                   'wards': table.get('wards')})
step('tax', tax)
step('budget', lambda: w('budget.json', budget.load(cache)))
w('log.json', log); print(json.dumps(log, indent=1))
