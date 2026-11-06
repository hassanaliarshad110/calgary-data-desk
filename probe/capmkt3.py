import json, os, sys, urllib.request, urllib.parse
os.makedirs(sys.argv[1], exist_ok=True)
q = '''SELECT ?c ?cLabel ?exLabel ?ticker ?hqLabel WHERE {
  ?c p:P414 ?st . ?st ps:P414 ?ex . OPTIONAL { ?st pq:P249 ?ticker }
  VALUES ?ex { wd:Q818723 wd:Q1513233 wd:Q5029929 }
  ?c wdt:P159 ?hq . ?hq wdt:P131* wd:Q36312 .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }'''
u = 'https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(q)
try:
    r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryDataDesk/1.0 (hassanaliarshad110@users.noreply.github.com)'}), timeout=120).read())
    rows = r['results']['bindings']
    print('WIKIDATA rows', len(rows), 'companies', len({x['c']['value'] for x in rows}))
    for x in rows[:60]: print('  ', x['cLabel']['value'], '|', x['exLabel']['value'], '|', x.get('ticker', {}).get('value'), '|', x['hqLabel']['value'])
except Exception as e:
    print('WDERR', e)
for ua in ['Hassan Ali hassanaliarshad110@users.noreply.github.com', 'CalgaryDataDesk admin@calgarydatadesk.ca']:
    try:
        b = urllib.request.urlopen(urllib.request.Request('https://data.sec.gov/submissions/CIK0001164727.json', headers={'User-Agent': ua, 'Accept-Encoding': 'identity', 'Host': 'data.sec.gov'}), timeout=60).read()
        print('SEC OK', ua, len(b))
    except Exception as e:
        print('SEC ERR', ua, e)
