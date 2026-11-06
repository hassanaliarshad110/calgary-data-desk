import json, os, sys, re, urllib.request, urllib.parse, xml.etree.ElementTree as ET
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryDataDesk civic data)'}
def raw(u, t=120):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
        return r.read().decode('utf-8', 'replace')
res = {}
# 1 House of Commons votes, 45th Parliament 1st session
try:
    x = raw('https://www.ourcommons.ca/members/en/votes/xml?parlSession=45-1')
    res['hoc_votes_head'] = x[:1500]
    root = ET.fromstring(x)
    res['hoc_votes_n'] = len(list(root))
    res['hoc_vote_first'] = ET.tostring(list(root)[0], encoding='unicode')[:1500] if len(root) else None
    n = list(root)[0].find('DecisionDivisionNumber').text if len(root) else None
    if n:
        d = raw(f'https://www.ourcommons.ca/members/en/votes/45/1/{n}/xml')
        res['hoc_vote_detail'] = d[:2500]
except Exception as e:
    res['hoc_err'] = str(e)[:300]
# 2 LEGISinfo bills
try:
    j = json.loads(raw('https://www.parl.ca/legisinfo/en/bills/json?parlsession=45-1'))
    res['bills_n'] = len(j); res['bill_first'] = j[0] if j else None
except Exception as e:
    res['bills_err'] = str(e)[:300]
# 3 Alberta bills
for u in ['https://www.assembly.ab.ca/assembly-business/bills/bills-by-legislature', 'https://www.assembly.ab.ca/assembly-business/bills/bill-status-report']:
    try:
        h = raw(u); res[u] = h[:200] + ' ... ' + str(len(h)) + ' | ' + ' '.join(re.findall(r'Bill \d+[^<]{0,90}', h)[:15])
        links = re.findall(r'href="([^"]+)"', h); res[u + ' links'] = [l for l in links if 'bill' in l.lower()][:40]
    except Exception as e:
        res[u] = 'ERR ' + str(e)[:200]
# 4 Calgary catalogue
try:
    found = []
    for q in ['council vote', 'council', 'motion', 'voting record', 'council decisions', 'agenda']:
        d = json.loads(raw('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode({'q': q, 'only': 'dataset', 'limit': 20, 'domains': 'data.calgary.ca'})))
        found += [(x['resource']['id'], x['resource']['name']) for x in d.get('results', [])]
    res['cgy'] = sorted(set(found))
except Exception as e:
    res['cgy_err'] = str(e)[:200]
json.dump(res, open(os.path.join(out, 'records.json'), 'w'), indent=1)
print(json.dumps({k: (v if isinstance(v, (int, str)) and len(str(v)) < 300 else str(v)[:300]) for k, v in res.items()}, indent=1))
