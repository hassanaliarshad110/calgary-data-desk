import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
import infra
t = time.time()
d = infra.build()
json.dump(d, open(os.path.join(out, 'infra.json'), 'w'), separators=(',', ':'))
print('seconds', round(time.time() - t), 'communities', len(d['by_comm']), 'errors', d['errors'])
print(json.dumps(d['city'])[:2000]); print(len(d['projects']))
