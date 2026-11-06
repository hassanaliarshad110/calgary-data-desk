import sys, os, json, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight research)', 'Accept': 'application/json'}
for y in ['1', '']:
    try:
        b = urllib.request.urlopen(urllib.request.Request('https://majorprojects.alberta.ca/api/MajorProjects?years=' + y, headers=UA), timeout=300).read()
        open(f'{out}/mp_years{y or "all"}.json', 'wb').write(b); print('OK', y, len(b))
    except Exception as e:
        print('FAIL', y, e)
