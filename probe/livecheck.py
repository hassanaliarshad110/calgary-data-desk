import json, os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
B = 'https://calgaryinsight.ca/'
res = {}
checks = [('studies/growth-or-spending/', 'What pace would the plan require?', None),
          ('studies/growth-or-spending/', 'The proposal, broken down: the capital plan', None),
          ('studies/growth-or-spending/growth-or-spending-15-percent-tax-study.pdf', None, 659539),
          ('video/growth-or-spending.mp4', None, 9998689),
          ('', '3 min 33 s', None), ('', 'seventy-three percent fewer City recreation sites per resident', None)]
for k, (path, needle, size) in enumerate(checks):
    try:
        h = {'User-Agent': 'Mozilla/5.0 calgaryinsight-check'}
        if size: h['Range'] = 'bytes=0-1023'
        r = urllib.request.urlopen(urllib.request.Request(B + path + ('?v=15' if not size else ''), headers=h), timeout=60); body = r.read()
        total = (r.headers.get('Content-Range') or '').split('/')[-1]
        res[f'{k}:{path or "/"}'] = {'status': r.status, 'contains': (needle in body.decode('utf-8', 'ignore')) if needle else None,
                                     'size_ok': (str(size) == total) if size else None, 'total': total}
    except Exception as e:
        res[f'{k}:{path or "/"}'] = {'error': str(e)[:200]}
json.dump(res, open(os.path.join(out, 'livecheck.json'), 'w'), indent=1); print(json.dumps(res, indent=1))
