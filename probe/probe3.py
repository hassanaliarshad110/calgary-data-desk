import io, json, os, re, sys, urllib.request, urllib.parse, zipfile
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'calgary-data-desk-probe'}
rep = {}
def get(url, timeout=240):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read(), r.headers.get('Content-Type'), r.geturl()
def note(key, f):
    try: rep[key] = f()
    except Exception as e: rep[key] = {'error': repr(e)[:300]}
def save(n, b): open(os.path.join(OUT, n), 'wb').write(b)
def text(b): return b.decode('utf-8', 'replace')
def city_json():
    b, ct, u = get('https://elections-prd.calgary.ca/content/dam/elections/results/2025/2025GeneralElectionResults.json'); save('city_2025.json', b)
    d = json.loads(b); 
    def shape(x, depth=0):
        if depth > 4: return '...'
        if isinstance(x, dict): return {k: shape(v, depth + 1) for k, v in list(x.items())[:12]}
        if isinstance(x, list): return [shape(x[0], depth + 1), f'len={len(x)}'] if x else []
        return x
    return shape(d)
note('city_json', city_json)
def ped():
    base = 'https://geospatial.alberta.ca/titan/rest/services/boundary/goa_administrative_area_10tm_nad83_aep/MapServer'
    m = json.loads(get(base + '?f=json')[0]); layers = [[l['id'], l['name']] for l in m.get('layers', [])]
    out = {'layers': layers}
    for lid, name in layers:
        if 'lectoral' in name:
            q = base + f'/{lid}/query?' + urllib.parse.urlencode({'where': "1=1", 'outFields': '*', 'returnGeometry': 'false', 'f': 'json', 'resultRecordCount': 3})
            out[f'{lid}_{name}'] = json.loads(get(q)[0]).get('features', [])[:3]
    return out
note('ped', ped)
def fed():
    b, ct, u = get('https://www.elections.ca/res/cir/mapsCorner/vector/FederalElectoralDistricts_2025_SHP.zip'); save('fed_2025_shp.zip', b)
    z = zipfile.ZipFile(io.BytesIO(b)); return {'bytes': len(b), 'files': z.namelist()}
note('fed', fed)
def events():
    b = text(get('https://officialresults.elections.ab.ca/orResultsPGE.cfm?EventId=100')[0])
    return {'options': re.findall(r'<option[^>]*value="([^"]*)"[^>]*>([^<]+)</option>', b)[:60], 'links': re.findall(r'href="(or[^"]+)"', b)[:40]}
note('events', events)
def ref_xlsx():
    b, ct, u = get('https://officialresults.elections.ab.ca/orEDResultsReferendum2026.cfm?EventId=202610&MODE=exED'); save('ref_exED.xlsx', b)
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(b), read_only=True)
    return {ws.title: [list(r) for r in ws.iter_rows(max_row=8, values_only=True)] for ws in wb.worksheets[:3]} | {'_sheets': wb.sheetnames}
note('ref_xlsx', ref_xlsx)
json.dump(rep, open(os.path.join(OUT, 'probe3.json'), 'w'), indent=1, default=str)
print(json.dumps({k: ('ERR ' + v['error'][:150]) if isinstance(v, dict) and 'error' in v else 'ok' for k, v in rep.items()}, indent=1))
