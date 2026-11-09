import json, os, sys, urllib.request, urllib.parse, collections
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
B = 'https://data.calgary.ca'
def get(u): return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'CalgaryInsight-audit/1.0'}), timeout=300))
def q(ds, **p):
    try: return get(f'{B}/resource/{ds}.json?' + urllib.parse.urlencode(p))
    except Exception as e: return 'ERR ' + str(e) + ' ' + json.dumps(p)
R = {}
meta = get(f'{B}/api/views/xesp-3jc3.json')
R['description'] = meta.get('description'); R['attribution'] = meta.get('attribution'); R['metadata'] = meta.get('metadata', {}).get('custom_fields')
R['status'] = q('xesp-3jc3', **{'$select': 'status_ind,count(*) as n', '$group': 'status_ind'})
R['bldg'] = q('xesp-3jc3', **{'$select': 'bldg_type,count(*) as n', '$group': 'bldg_type', '$order': 'n DESC', '$limit': 30})
# past typical (older than 45 years -> installed before 1981) among the 'unknown' codes, by raw code
R['unknown_old'] = q('xesp-3jc3', **{'$select': 'material_type,count(*) as n', '$where': "installed_date < '1981-01-01' AND (material_type IS NULL OR material_type='OTHER' OR material_type='TP')", '$group': 'material_type'})
R['tp_years'] = q('xesp-3jc3', **{'$select': 'date_extract_y(installed_date) as y,count(*) as n', '$where': "material_type='TP'", '$group': 'y', '$order': 'n DESC', '$limit': 15})
R['other_years'] = q('xesp-3jc3', **{'$select': 'date_extract_y(installed_date) as y,count(*) as n', '$where': "material_type='OTHER'", '$group': 'y', '$order': 'n DESC', '$limit': 15})
R['cipp_old_sample'] = q('xesp-3jc3', **{'$select': 'installed_date,status_ind,address', '$where': "material_type='CIPP' AND installed_date < '2000-01-01'", '$limit': 10})
R['status_by_material_old'] = q('xesp-3jc3', **{'$select': 'status_ind,count(*) as n', '$where': "installed_date < '1981-01-01'", '$group': 'status_ind'})
R['clay_1972'] = q('xesp-3jc3', **{'$select': 'installed_date,material_type,pipe_length,pipe_diameter,status_ind', '$where': "material_type='TIL' AND installed_date between '1972-01-01T00:00:00' and '1972-12-31T23:59:59'", '$limit': 5})
json.dump(R, open(os.path.join(out, 'audit2.json'), 'w'), indent=1, default=str); print('ok')
