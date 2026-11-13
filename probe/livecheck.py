import json, os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
B = 'https://calgaryinsight.ca/'
res = {}
for path, needle in [('studies/growth-or-spending/', 'Growth or Spending'), ('studies/growth-or-spending/growth-or-spending-15-percent-tax-study.pdf', None),
                     ('video/growth-or-spending.mp4', None), ('video/growth-or-spending.jpg', None), ('studies/', 'growth-or-spending'), ('', 'growth-or-spending')]:
    try:
        req = urllib.request.Request(B + path, headers={'User-Agent': 'Mozilla/5.0 calgaryinsight-check', 'Range': 'bytes=0-2000000'} if needle is None else {'User-Agent': 'Mozilla/5.0 calgaryinsight-check'})
        r = urllib.request.urlopen(req, timeout=60); body = r.read()
        res[path or '/'] = {'status': r.status, 'type': r.headers.get('Content-Type'), 'bytes': len(body),
                            'contains': (needle in body.decode('utf-8', 'ignore')) if needle else None}
    except Exception as e:
        res[path or '/'] = {'error': str(e)[:200]}
json.dump(res, open(os.path.join(out, 'livecheck.json'), 'w'), indent=1); print(json.dumps(res, indent=1))
