import json, sys, os, urllib.request
os.makedirs(sys.argv[1], exist_ok=True)
b = json.loads(urllib.request.urlopen(urllib.request.Request('https://www.parl.ca/legisinfo/en/bills/json?parlsession=45-1', headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read())
print('N', len(b)); print('KEYS', sorted(b[0].keys()))
print('SAMPLE', json.dumps({k: v for k, v in b[0].items() if 'ponsor' in k or 'Number' in k or 'Title' in k}))
for x in b:
    s = json.dumps({k: v for k, v in x.items() if 'ponsor' in k})
    if any(n in s for n in ('Rempel', 'Kmiec', 'Kusie', 'Hallan', 'Kelly', 'McLean', 'Majumdar', 'Hogan', 'Gill', 'McKenzie', 'Calgary')):
        print('HIT', x.get('NumberCode'), s[:300])
