import copy, json, os, sys, time, subprocess
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'overturemaps'], check=False)
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bz'))
import business as new, business_old as old
captured = {}
orig = new.dedupe
def spy(rows, *a, **k):
    captured['rows'] = copy.deepcopy(rows); return orig(rows, *a, **k)
new.dedupe = spy
t = time.time(); d = new.build(); print('build s', round(time.time() - t), 'totals', json.dumps(d.get('totals'))[:600])
raw = captured['rows']
from collections import Counter
print('raw by source', Counter(r[9] for r in raw))
o_rows, o_m = old.dedupe(copy.deepcopy(raw)); n_rows, n_m = new.dedupe.__wrapped__(copy.deepcopy(raw)) if hasattr(new.dedupe, '__wrapped__') else orig(copy.deepcopy(raw))
print('OLD kept', len(o_rows), 'matched', o_m, Counter(r[9] for r in o_rows))
print('NEW kept', len(n_rows), 'matched', n_m, Counter(r[9] for r in n_rows))
oa, na = new.audit_duplicates(o_rows), new.audit_duplicates(n_rows)
print('possible duplicates left (same name within 200 m): OLD', len(oa), 'NEW', len(na))
print('NEW sample', na[:40])
print('NEW cross-source sample', [p for p in na if p[1] != p[3]][:30])
json.dump(d, open(os.path.join(out, 'business.json'), 'w'), separators=(',', ':'))
