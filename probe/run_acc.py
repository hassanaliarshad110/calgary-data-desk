import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
import accountability
t = time.time(); d = accountability.build()
json.dump(d, open(os.path.join(out, 'accountability.json'), 'w'), separators=(',', ':'))
print('seconds', round(time.time() - t), d['errors'])
