import sys, os, json, time, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'numpy', 'scipy'], check=True)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'code'))
import access, majorprojects, planned, srg
UA = {'User-Agent': 'CalgaryInsight check'}
def site(f):
    return json.loads(urllib.request.urlopen(urllib.request.Request('https://calgaryinsight.ca/' + f, headers=UA), timeout=300).read())
cache = os.path.join(out, 'cache'); os.makedirs(os.path.join(cache, 'access'), exist_ok=True)
t = time.time()
proj = access.Projection()
homes, hstats = access.read_homes(proj)
json.dump({'stats': hstats, 'homes': [[h[0], h[1], h[2], round(h[3], 2), round(h[4], 2), h[5], h[6]] for h in homes]}, open(os.path.join(cache, 'access', 'homes.json'), 'w'))
print('homes', len(homes), round(time.time() - t))
D0 = site('data/model/w0.json')
ward_of = {c['code']: c['ward'] for c in D0['communities'] if c.get('ward')}
raw_mp = majorprojects.fetch()
hand = {5: json.load(open(os.path.join(HERE, 'code', 'data', 'ward5_projects.json')))['projects']}
lists = majorprojects.for_wards(raw_mp, ward_of, hand)
json.dump({str(k): v for k, v in lists.items()}, open(os.path.join(out, 'ward_lists.json'), 'w'))
raw = srg.fetch()
t = time.time()
pl = planned.build(cache, lists[0], 2030)
print('planned', round(time.time() - t), len(pl['parks']), sum(p['ha'] for p in pl['parks']), pl['facilities'])
json.dump(pl, open(os.path.join(out, 'planned.json'), 'w'))
base = site('data/access_base.json')
A = D0['access']
pops = {c['code']: c['residents'] for c in A['communities'] if c.get('residents')}
kids = {c['code']: c['children'] for c in A['communities'] if c.get('children') is not None}
names = {c['code']: c['name'] for c in A['communities']}
v = srg.view(raw, base, pops, kids, list(base['comm']), ward_of, names, 'Growth model', planned=pl)
json.dump(v, open(os.path.join(out, 'srg_view_w0.json'), 'w'))
json.dump(raw, open(os.path.join(out, 'srg_raw.json'), 'w'))
print('counts', v['counts'], v.get('planned', {}).get('park_ha'))
import shutil; shutil.rmtree(cache)
