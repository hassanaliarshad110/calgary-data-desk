"""Site-wide accuracy audit, part 2: the Dashboard's figures worked out again from the City's open data, with code written
for this audit only (no code from the website). Run where data.calgary.ca can be reached.
usage: python independent_city.py <out-dir>"""
import json, os, sys, time, urllib.request, urllib.parse, datetime as dt, collections
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
API = 'https://data.calgary.ca/resource/'
LOG = []


def q(ds, **p):
    params = {('$' + k): v for k, v in p.items()}
    url = API + ds + '.json?' + urllib.parse.urlencode(params)
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'calgaryinsight-audit'}), timeout=300) as r:
                return json.load(r)
        except Exception as e:
            LOG.append(f'retry {i} {ds} {e}'); time.sleep(10 * (i + 1))
    raise RuntimeError('failed ' + url)


def qall(ds, page=50000, **p):
    out, off = [], 0
    while True:
        rows = q(ds, limit=page, offset=off, order=':id', **p)
        out += rows; off += page
        if len(rows) < page: return out


R = {'read_at': dt.datetime.utcnow().isoformat(timespec='seconds') + 'Z'}
S, E, CS, CE = '2025-11-01T00:00:00', '2026-11-01T00:00:00', '2024-11-01T00:00:00', '2025-11-01T00:00:00'
NOTDUP = "status_description NOT IN ('Duplicate (Open)','Duplicate (Closed)')"
SR = 'iahh-g8bj'

# ---------------------------------------------------------------- 311
def cnt(where):
    return int(q(SR, select='count(*) as n', where=where)[0]['n'])

r3 = R['311'] = {}
for lab, a, b in (('last12', S, E), ('prev12', CS, CE)):
    base = f"requested_date >= '{a}' AND requested_date < '{b}' AND {NOTDUP}"
    r3[lab] = {'all_requests': cnt(base), 'with_community': cnt(base + ' AND comm_code IS NOT NULL'),
               'by_status': q(SR, select='status_description,count(*) as n', where=f"requested_date >= '{a}' AND requested_date < '{b}'", group='status_description', limit=50),
               'by_source': q(SR, select='source,count(*) as n', where=base, group='source', limit=50),
               'by_service': q(SR, select='service_name,count(*) as n', where=base + ' AND comm_code IS NOT NULL', group='service_name', limit=5000),
               'by_month': q(SR, select="date_trunc_ym(requested_date) as m,count(*) as n", where=base, group='m', order='m', limit=100),
               'by_comm': q(SR, select='comm_code,count(*) as n', where=base, group='comm_code', limit=5000)}
r3['open_now'] = {'all': cnt("status_description = 'Open'"), 'with_community': cnt("status_description = 'Open' AND comm_code IS NOT NULL"),
                  'over_90_days_with_community': cnt(f"status_description = 'Open' AND comm_code IS NOT NULL AND requested_date < '{(dt.datetime.utcnow() - dt.timedelta(hours=6) - dt.timedelta(days=90)).strftime('%Y-%m-%dT%H:%M:%S')}'"),
                  'by_comm': q(SR, select='comm_code,count(*) as n', where="status_description = 'Open'", group='comm_code', limit=5000)}
# closed within 7 days: the rows themselves, the difference computed here
rows = qall(SR, select='comm_code,requested_date,closed_date', where=f"requested_date >= '{S}' AND requested_date < '{E}' AND status_description = 'Closed' AND comm_code IS NOT NULL")
P = lambda s: dt.datetime.fromisoformat(s[:19])
w7 = sum(1 for x in rows if x.get('closed_date') and (P(x['closed_date']) - P(x['requested_date'])).total_seconds() <= 7 * 86400)
w7d = sum(1 for x in rows if x.get('closed_date') and (P(x['closed_date']).date() - P(x['requested_date']).date()).days <= 7)
byc = collections.Counter(x['comm_code'] for x in rows)
byc7 = collections.Counter(x['comm_code'] for x in rows if x.get('closed_date') and (P(x['closed_date']) - P(x['requested_date'])).total_seconds() <= 7 * 86400)
r3['closed'] = {'closed': len(rows), 'within_7x24h': w7, 'within_7_calendar_days': w7d, 'no_closed_date': sum(1 for x in rows if not x.get('closed_date')),
                'by_comm': byc, 'by_comm_w7': byc7}
del rows

# ---------------------------------------------------------------- building permits, development permits
BP = 'c2es-76ed'
R['permits'] = {}
for lab, f in (('applied', 'applieddate'), ('issued', 'issueddate')):
    for per, a, b in (('last12', S, E), ('prev12', CS, CE)):
        R['permits'][f'{lab}_{per}'] = q(BP, select='communitycode,sum(housingunits) as units,count(*) as n', where=f"{f} >= '{a}' AND {f} < '{b}'", group='communitycode', limit=5000)
DP = '6933-unw5'
R['dp'] = {}
for per, a, b in (('last12', S, E), ('prev12', CS, CE)):
    R['dp'][per] = {'total': int(q(DP, select='count(*) as n', where=f"applieddate >= '{a}' AND applieddate < '{b}'")[0]['n']),
                    'by_status': q(DP, select='statuscurrent,count(*) as n', where=f"applieddate >= '{a}' AND applieddate < '{b}'", group='statuscurrent', limit=100),
                    'by_category': q(DP, select='category,count(*) as n', where=f"applieddate >= '{a}' AND applieddate < '{b}'", group='category', limit=200),
                    'by_ward': q(DP, select='ward,count(*) as n', where=f"applieddate >= '{a}' AND applieddate < '{b}'", group='ward', limit=100)}

# ---------------------------------------------------------------- traffic incidents (UTC in the data; Calgary dates here)
TR = '35ra-9556'
rows = qall(TR, select='start_dt_utc,latitude,longitude', where="start_dt_utc >= '2024-10-31T00:00:00' AND start_dt_utc < '2026-11-02T00:00:00'")
def local(s):  # America/Edmonton: MDT (UTC-6) from the second Sunday of March 2:00 to the first Sunday of November 2:00, else UTC-7
    t = dt.datetime.fromisoformat(s[:19]); y = t.year
    mar = dt.datetime(y, 3, 8); mar += dt.timedelta(days=(6 - mar.weekday()) % 7); dst_on = mar.replace(hour=9)   # 2:00 MST = 9:00 UTC
    nov = dt.datetime(y, 11, 1); nov += dt.timedelta(days=(6 - nov.weekday()) % 7); dst_off = nov.replace(hour=8)  # 2:00 MDT = 8:00 UTC
    return t - dt.timedelta(hours=6 if dst_on <= t < dst_off else 7)
pts = [(local(x['start_dt_utc']), float(x['latitude']), float(x['longitude'])) for x in rows if x.get('latitude') and x.get('longitude')]
R['traffic'] = {'rows': len(rows), 'no_location': len(rows) - len(pts)}

# ---------------------------------------------------------------- boundaries: city, wards, communities (shapely, exact areas)
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from shapely.prepared import prep
def geo(ds, sel):
    return q(ds, select=sel, limit=5000)
wards = {int(x['ward_num']): shape(x['multipolygon']) for x in geo('tz8z-hyaz', 'ward_num,multipolygon')}
city = unary_union(list(wards.values()))
comms = geo('surr-xmvs', 'comm_code,name,class,multipolygon')
ward_of, shares = {}, {}
for c in comms:
    g = shape(c['multipolygon'])
    a = {w: g.intersection(wg).area for w, wg in wards.items()}
    tot = sum(a.values()) or 1
    best = max(a, key=a.get)
    ward_of[c['comm_code']] = best
    shares[c['comm_code']] = round(a[best] / tot, 4)
R['geo'] = {'ward_of': ward_of, 'majority_share': shares, 'class': {c['comm_code']: c.get('class') for c in comms}, 'name': {c['comm_code']: c.get('name') for c in comms}}
pw = {w: prep(g) for w, g in wards.items()}; pc = prep(city)
def tw(per0, per1):
    n, byw = 0, collections.Counter()
    for t, la, lo in pts:
        if per0 <= t < per1:
            p = Point(lo, la)
            if pc.contains(p):
                n += 1
                for w, g in pw.items():
                    if g.contains(p): byw[w] += 1; break
    return n, byw
n12, w12 = tw(dt.datetime(2025, 11, 1), dt.datetime(2026, 11, 1)); np_, wp = tw(dt.datetime(2024, 11, 1), dt.datetime(2025, 11, 1))
alln12 = sum(1 for t, la, lo in pts if dt.datetime(2025, 11, 1) <= t < dt.datetime(2026, 11, 1))
days = collections.Counter(t.date().isoformat() for t, la, lo in pts if dt.datetime(2024, 11, 1) <= t < dt.datetime(2026, 11, 1))
R['traffic'].update({'in_city_last12': n12, 'in_city_prev12': np_, 'anywhere_last12': alln12, 'by_ward_last12': w12, 'by_ward_prev12': wp, 'by_day': days})
del pts, rows

# ---------------------------------------------------------------- 2021 Census by community, ward populations
R['census'] = {'community_pop': q('f9wk-wej9', select='sum(total_pop_household) as n')[0], 'households': q('msjx-5ygv', select='sum(total_private_households) as n')[0]}
try: R['census']['ward_pop_rows'] = q('k4pr-cznc', limit=50)
except Exception as e: R['census']['ward_pop_rows'] = str(e)

# ---------------------------------------------------------------- City budget (open budget 2023-2026, 2027-2030)
try:
    R['budget_fqax'] = q('fqax-i3nz', select='*', limit=1)
    R['budget_nnnm'] = q('nnnm-9sfh', select='*', limit=1)
except Exception as e: R['budget_err'] = str(e)

# ---------------------------------------------------------------- water main breaks
try:
    R['wmb_sample'] = q('dpcu-jr23', select='*', limit=2)
except Exception as e: R['wmb_err'] = str(e)

R['log'] = LOG
json.dump(R, open(os.path.join(OUT, 'independent-city.json'), 'w'), default=lambda o: dict(o) if isinstance(o, collections.Counter) else str(o))
print('done', {k: (len(json.dumps(v, default=str))) for k, v in R.items()})
