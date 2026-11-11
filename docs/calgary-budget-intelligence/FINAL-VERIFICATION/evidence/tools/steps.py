"""Run the two build steps whose source files changed (site search index, master registry) offline, from a given
checkout, against the production data snapshot, and write their outputs to OUT."""
import sys, os, json, shutil
root, site, out = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, os.path.join(root, 'web')); sys.path.insert(0, root)
os.chdir(root)
import search_index, registry, methods
os.makedirs(out, exist_ok=True)
data = os.path.join(site, 'data')
s = search_index.build(site, data, methods.METHODS, 'city_actual')
json.dump(s, open(os.path.join(out, 'search.json'), 'w'), separators=(',', ':'))
tmp = os.path.join(out, 'regsite'); shutil.rmtree(tmp, ignore_errors=True); os.makedirs(os.path.join(tmp, 'data'))
for f in os.listdir(data):
    if f.endswith('.json') and f != 'registry.json': shutil.copy(os.path.join(data, f), os.path.join(tmp, 'data', f))
reg = registry.write(tmp, open(os.path.join(site, 'index.html'), encoding='utf-8').read())
shutil.copy(os.path.join(tmp, 'data', 'registry.json'), os.path.join(out, 'registry.json')); shutil.rmtree(tmp)
print(root.split('/')[-1], 'search rows', len(s['rows']), 'registry entries', len(reg))
