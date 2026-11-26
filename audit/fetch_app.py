"""Read only: the live site's Genie files (py/manifest.json), its saved source copies, and the dashboard the page sends."""
import json, os, urllib.request
S = 'https://calgaryinsight.ca'
m = json.load(open('app/_manifest.json'))
miss = []
def get(url, dest):
    os.makedirs(os.path.dirname(dest) or '.', exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=120) as r:
        open(dest, 'wb').write(r.read())
for f in m['files']:
    try:
        get(f'{S}/py/{f}', os.path.join('app', f))
    except Exception as e:                                   # noqa: BLE001
        miss.append((f, str(e)))
for f in m.get('cache') or []:
    try:
        get(f'{S}/data/cache/{f}', os.path.join('app/_appdata', f))
    except Exception as e:                                   # noqa: BLE001
        miss.append((f, str(e)))
get(f'{S}/data/city_actual/w0.json', 'app/_dash.json')
get(f'{S}/data/tax.json', 'app/_tax.json')
print('manifest files', len(m['files']), 'missing', miss)
open('out/manifest.txt', 'w').write(json.dumps({'files': m['files'], 'cache': m.get('cache'), 'missing': miss}, indent=1))
