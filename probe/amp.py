import sys, os, json, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'openpyxl', 'pandas'], check=True)
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight research)'}
def get(url, t=180):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=t).read()
for pid in ['inventory-of-major-alberta-projects', 'major-projects-by-municipality']:
    try:
        d = json.loads(get(f'https://open.alberta.ca/api/3/action/package_show?id={pid}'))['result']
        res = sorted(d['resources'], key=lambda r: r.get('created') or '', reverse=True)
        json.dump([{k: r.get(k) for k in ('name', 'format', 'url', 'created', 'last_modified')} for r in res], open(f'{out}/{pid}_resources.json', 'w'), indent=1)
        print(pid, len(res), [(r['name'], r['format'], r.get('created')) for r in res[:6]])
    except Exception as e:
        print('FAIL', pid, e)
# the majorprojects.alberta.ca site: try its own data endpoints
for u in ['https://majorprojects.alberta.ca/api/projects', 'https://majorprojects.alberta.ca/Projects/Export', 'https://majorprojects.alberta.ca/',
          'https://majorprojects.alberta.ca/details/New-High-School-in-Cornerstone/11436']:
    try:
        b = get(u, 60); open(f'{out}/mp_' + u.split('/')[-1][:30].replace('?', '_') + '.html', 'wb').write(b[:400000]); print('OK', u, len(b))
    except Exception as e:
        print('FAIL', u, e)
# newest xlsx/csv of the inventory: download and filter Calgary
try:
    res = json.load(open(f'{out}/inventory-of-major-alberta-projects_resources.json'))
    pick = next(r for r in res if (r.get('format') or '').lower() in ('xlsx', 'csv', 'xls'))
    b = get(pick['url'], 300); fn = f'{out}/amp.' + pick['format'].lower(); open(fn, 'wb').write(b)
    import pandas as pd
    df = pd.read_excel(fn, sheet_name=None) if fn.endswith(('xlsx', 'xls')) else {'csv': pd.read_csv(fn)}
    for k, v in df.items():
        print('sheet', k, v.shape, list(v.columns)[:30])
        cal = v[v.astype(str).apply(lambda r: r.str.contains('Calgary', case=False)).any(axis=1)]
        cal.to_csv(f'{out}/amp_calgary_{k[:20].replace(" ", "_")}.csv', index=False)
        print('calgary rows', len(cal))
    os.remove(fn)
except Exception as e:
    print('FAIL inventory', e)
