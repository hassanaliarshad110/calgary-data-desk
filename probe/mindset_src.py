import os, sys, urllib.request, json
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = {'prince_marriott_pg1232.txt': 'https://www.gutenberg.org/cache/epub/1232/pg1232.txt',
     'prince_marriott_pg1232.html': 'https://www.gutenberg.org/files/1232/1232-h/1232-h.htm'}
res = {}
for n, u in U.items():
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        open(os.path.join(out, n), 'wb').write(urllib.request.urlopen(req, timeout=60).read()); res[n] = 'ok'
    except Exception as e: res[n] = repr(e)
json.dump(res, open(os.path.join(out, 'res.json'), 'w'), indent=1); print(res)
