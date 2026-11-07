import json, os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for m in ('model', 'default'):
    try:
        d = json.load(urllib.request.urlopen(f'https://calgaryinsight.ca/data/{m}/w0.json', timeout=120))
    except Exception as e:
        print(m, 'ERR', e); continue
    print(m, 'srg' , type(d.get('srg')).__name__, 'keys', list(d)[:5])
    for s in d.get('status') or []:
        if not s.get('ok', True) or 'growth' in (s.get('name') or '').lower():
            print(m, json.dumps(s)[:600])
