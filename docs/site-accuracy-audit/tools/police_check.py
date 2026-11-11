"""Crime and disorder from the Calgary Police file, added up independently. usage: police_check.py <xlsx> <live w0.json>"""
import sys, json, collections, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True); w = json.load(open(sys.argv[2]))
cr = w['crime']
MON = {m: i for i, m in enumerate(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], 1)}
def ym(y, m): return int(y) * 12 + (MON[m] if isinstance(m, str) else int(m)) - 1
end = 2026 * 12 + 9 - 1                     # Sep 2026, the latest month in the file the site reads
last = set(range(end - 11, end + 1)); prev = set(range(end - 23, end - 11))
rows = list(wb['Community Crime'].iter_rows(values_only=True))[1:]
maxm = max(ym(r[4], r[6]) for r in rows); print('latest month in the file', maxm // 12, maxm % 12 + 1)
cat = collections.Counter(); catp = collections.Counter(); ward = collections.Counter(); wardp = collections.Counter()
for c, comm, wd, dist, y, q, m, mn, n in rows:
    k = ym(y, m)
    if k in last: cat[c] += n; ward[wd] += n
    elif k in prev: catp[c] += n; wardp[wd] += n
tot, totp = sum(cat.values()), sum(catp.values())
VIOL = [x['category'] for x in cr['by_category'] if x['violent']]
v, vp = sum(cat[c] for c in VIOL), sum(catp[c] for c in VIOL)
print('crimes', tot, 'site', cr['crimes'], '| before', totp, 'site', cr['crimes_prev'])
print('violent', v, 'site', cr['violent'], '| before', vp, 'site', cr['violent_prev'], '| violent categories', VIOL)
print('categories in file not on the site', set(cat) - {x['category'] for x in cr['by_category']})
bad = [(x['category'], x['n'], cat[x['category']], x['prev'], catp[x['category']]) for x in cr['by_category'] if x['n'] != cat[x['category']] or x['prev'] != catp[x['category']]]
print('category mismatches', bad)
ws = {x['ward']: x for x in w['wards_summary']['wards']}
bad = [(k, ward.get(f'Ward {k}'), ws[k]['crimes'], wardp.get(f'Ward {k}'), ws[k]['crimes_prev']) for k in ws if ward.get(f'Ward {k}') != ws[k]['crimes'] or wardp.get(f'Ward {k}') != ws[k]['crimes_prev']]
print('ward mismatches', bad, '| rows with no ward', {k: n for k, n in ward.items() if not str(k).startswith('Ward ')})
mo = cr['monthly']; print('monthly series first/last', mo['months'][0], mo['months'][-1], len(mo['n']))
per = collections.Counter()
for c, comm, wd, dist, y, q, m, mn, n in rows: per[ym(y, m)] += n
mine = [per[k] for k in range(end - 23, end + 1)]
print('monthly matches', mine == mo['n'], [ (a, b) for a, b in zip(mine, mo['n']) if a != b][:5])
# disorder
d = list(wb['Disorder'].iter_rows(values_only=True))[1:]
dl = sum(r[7] for r in d if ym(r[4], r[6]) in last); dp_ = sum(r[7] for r in d if ym(r[4], r[6]) in prev)
print('disorder', dl, 'site', cr['disorder']['n'], '| before', dp_, 'site', cr['disorder']['prev'])
print('ward keys', {k: n for k, n in ward.items() if k not in [f'Ward {i}' for i in range(1, 15)]})
