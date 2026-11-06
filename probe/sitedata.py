import sys, os, json, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'CalgaryInsight check'}
def get(url, name):
    try:
        b = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()
        os.makedirs(os.path.dirname(os.path.join(out, name)) or out, exist_ok=True)
        open(os.path.join(out, name), 'wb').write(b); print('OK', len(b), url)
    except Exception as e:
        print('FAIL', url, e)
S = 'https://calgaryinsight.ca/'
for f in ['data/built.json', 'data/settings.json', 'data/model/w0.json', 'data/model/w5.json', 'data/access_base.json', 'py/manifest.json', 'data/methods.json']:
    get(S + f, f)
get('https://data.calgary.ca/resource/surr-xmvs.json?$select=comm_code,name,class,class_code,comm_structure,sector,srg,multipolygon&$limit=1000', 'communities.json')
get('https://data.calgary.ca/resource/surr-xmvs.json?$limit=2', 'communities_sample.json')
