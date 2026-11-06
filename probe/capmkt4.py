import json, os, sys, time, urllib.request, urllib.parse, re
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
cos = json.load(open(os.path.join(here, 'ab_issuers_internal.json')))
def get(u, ua, t=90):
    with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': ua, 'Accept-Encoding': 'identity'}), timeout=t) as r:
        return r.read()
# Wikidata: every company on TSX/TSXV with its ticker, HQ, website, official name
q = '''SELECT ?c ?cLabel ?ex ?ticker ?hqLabel ?site ?end WHERE {
  ?c p:P414 ?st . ?st ps:P414 ?ex . VALUES ?ex { wd:Q818723 wd:Q1513233 }
  ?st pq:P249 ?ticker . OPTIONAL { ?st pq:P582 ?end }
  OPTIONAL { ?c wdt:P159 ?hq } OPTIONAL { ?c wdt:P856 ?site }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }'''
wd = json.loads(get('https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(q), 'CalgaryDataDesk/1.0 (https://hassanaliarshad110.github.io/calgary-data-desk/)'))['results']['bindings']
W = {}
for x in wd:
    if 'end' in x: continue
    t = x['ticker']['value'].upper().split('.')[0]
    W.setdefault(t, []).append({'name': x['cLabel']['value'], 'hq': x.get('hqLabel', {}).get('value'), 'site': x.get('site', {}).get('value'), 'qid': x['c']['value'].rsplit('/', 1)[1]})
print('wikidata tickers', len(W))
# SEC
sec_ua = None
for ua in ['CalgaryDataDesk hassanaliarshad110@users.noreply.github.com', 'Calgary Data Desk hassanaliarshad110@users.noreply.github.com',
           'CalgaryDataDesk/1.0 (hassanaliarshad110@users.noreply.github.com)']:
    try:
        tick = json.loads(get('https://www.sec.gov/files/company_tickers_exchange.json', ua)); sec_ua = ua; print('SEC UA OK:', ua); break
    except Exception as e:
        print('SEC UA fail:', ua, e)
norm = lambda s: re.sub(r'[^a-z0-9 ]', '', re.sub(r'\b(inc|ltd|limited|corp|corporation|co|company|the|trust|plc)\b\.?', '', s.lower())).split()
S = {}
if sec_ua:
    rows = tick['data']; f = tick['fields']
    byname = {}
    for r in rows:
        d = dict(zip(f, r)); byname.setdefault(' '.join(norm(d['name'])), d)
    for ex, t, name, sec in cos:
        k = ' '.join(norm(name))
        if k in byname:
            d = byname[k]
            try:
                sub = json.loads(get(f"https://data.sec.gov/submissions/CIK{int(d['cik']):010d}.json", sec_ua))
                a = sub.get('addresses', {}).get('business', {})
                forms = sub['filings']['recent']
                last = next(((forms['form'][i], forms['filingDate'][i]) for i in range(len(forms['form'])) if forms['form'][i] in ('40-F', '10-K', '20-F', '10-Q', '6-K')), None)
                S[t] = {'cik': d['cik'], 'sec_name': sub.get('name'), 'us_ticker': d.get('ticker'), 'us_exchange': d.get('exchange'), 'city': a.get('city'), 'state': a.get('stateOrCountry'),
                        'website': sub.get('website'), 'fy_end': sub.get('fiscalYearEnd'), 'last_filing': last,
                        'annual_form': next((forms['form'][i] for i in range(len(forms['form'])) if forms['form'][i] in ('40-F', '10-K', '20-F')), None)}
            except Exception as e:
                S[t] = {'cik': d['cik'], 'error': str(e)[:100]}
            time.sleep(0.15)
print('sec matched', len(S))
res = []
for ex, t, name, sec in cos:
    res.append({'exchange': ex, 'ticker': t, 'name': name, 'wikidata': W.get(t.upper()), 'sec': S.get(t)})
json.dump(res, open(os.path.join(out, 'ab_identity.json'), 'w'), indent=1)
print('done', len(res), 'with wikidata', sum(1 for r in res if r['wikidata']), 'with sec', sum(1 for r in res if r['sec']))
