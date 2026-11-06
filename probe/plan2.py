import sys, os, json, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'CalgaryInsight research'}
def q(ds, name, **kw):
    url = f'https://data.calgary.ca/resource/{ds}.json?' + urllib.parse.urlencode({('$' + k): v for k, v in kw.items()})
    try:
        b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()
        open(os.path.join(out, name + '.json'), 'wb').write(b); print('OK', name, len(b))
    except Exception as e:
        print('FAIL', name, e, url)
q('kami-qbfh', 'parks_status', select='life_cycle_status,planning_category,count(*) as n', group='life_cycle_status,planning_category', limit=500)
q('vd9i-m9ze', 'elements_status', select='life_cycle_status,asset_class,count(*) as n', group='life_cycle_status,asset_class', limit=500)
q('vd9i-m9ze', 'elements_sample', where="life_cycle_status not in('ACTIVE')", limit=50)
q('bdu9-amk8', 'play_status', select='life_cycle_status,type_description,count(*) as n', group='life_cycle_status,type_description', limit=500)
q('da6k-wpxb', 'sport_status', select='life_cycle_status,count(*) as n', group='life_cycle_status', limit=50)
q('qe6k-p9nh', 'lu_codes', select='lu_code,major,count(*) as n', group='lu_code,major', order='n DESC', limit=500)
q('yi6d-a7q5', 'policy_plans', select='name,doc_name,plan_type,app_date,status', limit=2000)
q('cqsb-2hhg', 'fire', select='stn_num,name,address,community,modified_dt', limit=200)
q('4y6b-yvdc', 'greenline', select='name,construction_stage,station_type,location', limit=200)
q('hxfu-6d96', 'rec_fac_cols', limit=3)
q('svbi-k49z', 'lud_codes', limit=500)
