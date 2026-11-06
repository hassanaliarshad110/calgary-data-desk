"""Crime and disorder by community and ward, from the Calgary Police Service.

The police publish the data behind their Community Safety Dashboard as one spreadsheet, linked from
  https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html
  sheet "Community Crime": category, community, ward, district, year, quarter, month, count (from 2020)
  sheet "Disorder":        disorder call type, district, ward, community, year, quarter, month name, count
The file is replaced every quarter with a new name, so the page is read at each refresh to find the current link.
The file (about 7 MB) is downloaded only when the link changes, and kept as a small summary.

Police notes: crime counts use the most serious violation per incident, unfounded cases excluded, domestic
violence excluded from violence; counts from 1 to 5 are shown as 2 for privacy; incidents without a location are
not in community figures. Disorder is public-generated calls for service, counted by event.
"""
import io
import json
import os
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

PAGE = 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html'
DASHBOARD = 'https://data.calgarypolice.ca/'
SOURCE = PAGE + '#dashdata'   # opens the police page at its "Dashboard data download" section, already expanded
HOW_TO_DOWNLOAD = ('On the Calgary Police page, section "Dashboard data download", click "Download Community Safety '
                   'Data". Sheet "Community Crime": filter Ward (or Community), Year and Month, and add up "Total Crime".')
ROUNDING_NOTE = ('The police file shows any count from 1 to 5 as 2, for privacy. The police Power BI dashboard shows '
                 'exact counts, so for a single community and month it can differ from the file (for example Martindale, '
                 'September 2026: 18 in the file, 22 on the dashboard). Every number in this app is from the file.')
HOST = 'https://www.calgarypolice.ca'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
          'November', 'December']
VIOLENT = {'Assault (Non-domestic)', 'Commercial Robbery', 'Street Robbery', "Violence 'Other' (Non-domestic)"}
LABELS = {'Assault (Non-domestic)': 'Assault', "Violence 'Other' (Non-domestic)": 'Other violence',
          'Street Robbery': 'Street robbery', 'Commercial Robbery': 'Robbery of a business',
          'Break & Enter - Dwelling': 'Break-ins: homes', 'Break & Enter - Commercial': 'Break-ins: businesses',
          'Break & Enter - Other Premises': 'Break-ins: garages, sheds', 'Theft FROM Vehicle': 'Theft from vehicles',
          'Theft OF Vehicle': 'Vehicle theft'}
FORMAT = 1               # bump when the saved summary's layout changes


class PoliceError(Exception):
    pass


def _http_get(url, timeout=120):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Ward5DataDesk/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise PoliceError(f'calgarypolice.ca answered {e.code}') from None
    except urllib.error.URLError as e:
        raise PoliceError(f'Could not reach calgarypolice.ca ({e.reason}).') from None


fetch = _http_get        # replaced in tests


def data_link(page_html):
    """The current spreadsheet link on the police page."""
    m = re.search(r'href="([^"]*Community-Safety-Data[^"]*\.xlsx)"', page_html, re.I) or \
        re.search(r'href="([^"]*/statistics/[^"]*\.xlsx)"', page_html, re.I)
    if not m:
        raise PoliceError('The police page no longer links to the community safety data file.')
    link = m.group(1).replace('&amp;', '&')
    return link if link.startswith('http') else HOST + link


def _sheets(data):
    """Every sheet of the workbook as rows of strings, by sheet name."""
    z = zipfile.ZipFile(io.BytesIO(data))
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).iter(NS + 'si'):
            shared.append(''.join(t.text or '' for t in si.iter(NS + 't')))
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    target = {r.get('Id'): r.get('Target') for r in rels}
    out = {}
    for s in wb.iter(NS + 'sheet'):
        rid = s.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        path = target.get(rid, '')
        path = 'xl/' + path.lstrip('/').replace('xl/', '', 1) if not path.startswith('xl/') else path
        if path not in z.namelist():
            continue
        rows = []
        for row in ET.fromstring(z.read(path)).iter(NS + 'row'):
            cells = {}
            for c in row.iter(NS + 'c'):
                ref = re.match(r'([A-Z]+)', c.get('r', '')).group(1)
                col = 0
                for ch in ref:
                    col = col * 26 + ord(ch) - 64
                v, t = c.find(NS + 'v'), c.get('t')
                if t == 's' and v is not None:
                    val = shared[int(v.text)]
                elif t == 'inlineStr':
                    val = ''.join(x.text or '' for x in c.iter(NS + 't'))
                else:
                    val = v.text if v is not None else ''
                cells[col - 1] = (val or '').strip()
            if cells:
                rows.append([cells.get(i, '') for i in range(max(cells) + 1)])
        out[s.get('name')] = rows
    return out


def _col(header, *names):
    h = [re.sub(r'[^a-z]', '', x.lower()) for x in header]
    for n in names:
        n = re.sub(r'[^a-z]', '', n.lower())
        if n in h:
            return h.index(n)
    return None


def _clean(s):
    return re.sub(r'\s+', ' ', (s or '').replace('&amp;', '&')).strip()


def parse(data):
    """Compact rows: crime [category, community, ward, year, month, n] and disorder [type, community, ward, year, month, n]."""
    sheets = _sheets(data)
    crime_rows = next((v for k, v in sheets.items() if 'crime' in k.lower()), None)
    dis_rows = next((v for k, v in sheets.items() if 'disorder' in k.lower()), None)
    if not crime_rows:
        raise PoliceError('The police file has no community crime sheet.')
    out = {'crime': [], 'disorder': []}
    h = crime_rows[0]
    c = {k: _col(h, *n) for k, n in {'cat': ('Category',), 'comm': ('Community',), 'ward': ('Ward',),
                                       'year': ('Year',), 'month': ('Month',), 'n': ('Total Crime', 'Count')}.items()}
    if None in c.values():
        raise PoliceError('The police crime sheet has changed its columns.')
    for r in crime_rows[1:]:
        try:
            out['crime'].append([_clean(r[c['cat']]), _clean(r[c['comm']]).upper(), _clean(r[c['ward']]),
                                 int(float(r[c['year']])), int(float(r[c['month']])), int(float(r[c['n']] or 0))])
        except (ValueError, IndexError):
            continue
    if dis_rows:
        h = dis_rows[0]
        d = {k: _col(h, *n) for k, n in {'type': ('Disorder',), 'comm': ('Community_Name_Grouped', 'Community'),
                                           'ward': ('Ward',), 'year': ('Year',), 'month': ('Month_Name', 'Month'),
                                           'n': ('Event_Count', 'Count')}.items()}
        if None not in d.values():
            for r in dis_rows[1:]:
                try:
                    m = r[d['month']]
                    month = MONTHS.index(m) + 1 if m in MONTHS else int(float(m))
                    out['disorder'].append([_clean(r[d['type']]), _clean(r[d['comm']]).upper(), _clean(r[d['ward']]),
                                            int(float(r[d['year']])), month, int(float(r[d['n']] or 0))])
                except (ValueError, IndexError):
                    continue
    return out


def load(cache_dir, check=True):
    """The parsed police data, downloading the spreadsheet only when the police publish a new one.
    check=False uses the copy already on this computer without looking for a newer file."""
    folder = os.path.join(cache_dir, 'police')
    os.makedirs(folder, exist_ok=True)
    saved = os.path.join(folder, 'community_safety.json')
    old = None
    if os.path.exists(saved):
        try:
            with open(saved, encoding='utf-8') as f:
                old = json.load(f)
        except (OSError, ValueError):
            old = None
    if old and not check and old.get('format') == FORMAT:
        return old
    try:
        link = data_link(fetch(PAGE, 60).decode('utf-8', 'replace'))
        if old and old.get('link') == link and old.get('format') == FORMAT:
            return {**old, 'checked_utc': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())}   # same file: nothing new
        rows = parse(fetch(link, 300))
    except Exception:                       # noqa: BLE001 - offline, a timeout, or a file that won't read
        if old:
            return old                      # keep showing the last copy
        raise
    data = {'format': FORMAT, 'link': link, 'file': link.rsplit('/', 1)[-1], **rows,
            'downloaded_utc': time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())}
    tmp = saved + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f)
    os.replace(tmp, saved)
    return data


def _ym(y, m):
    return y * 12 + m - 1


def _label(k):
    return f'{MONTHS[k % 12][:3]} {k // 12}'


def summary(data, ward_label, name_to_code, residents, city_population, want_start, want_end):
    """Ward figures (or the whole city when ward_label is None) for the months asked for (want_start/want_end: date, end exclusive), moved back to the latest
    month the police have published if needed, compared with the same months a year earlier.
    residents: {community code: residents}, or a function of the month (year*12 + month-1) giving that dict;
    city_population: a number, or a function of the month. Functions are read at the middle month of the period."""
    crime = data.get('crime') or []
    if not crime:
        return None
    latest = max(_ym(r[3], r[4]) for r in crime)
    a, b = _ym(want_start.year, want_start.month), _ym(want_end.year, want_end.month) - 1     # inclusive months
    n = b - a + 1
    if b > latest:
        b = latest
        a = b - n + 1
    pa, pb = a - 12, b - 12
    if pa < min(_ym(r[3], r[4]) for r in crime):
        return None
    cur = lambda r: a <= _ym(r[3], r[4]) <= b
    prev = lambda r: pa <= _ym(r[3], r[4]) <= pb
    ward = crime if ward_label is None else [r for r in crime if r[2] == ward_label]
    yr = 12 / n
    mid = int((a + b) / 2 + 0.5)                 # e.g. Oct 2025 to Sep 2026 -> April 2026
    if callable(residents):
        residents = residents(mid)
    if callable(city_population):
        city_population = city_population(mid)

    def tot(rows, f):
        return sum(r[5] for r in rows if f(r))

    def pct(x, y):
        return round((x - y) / y * 100, 1) if y else None
    n_cur, n_prev = tot(ward, cur), tot(ward, prev)
    city_cur, city_prev = tot(crime, cur), tot(crime, prev)
    res_total = sum(residents.values()) or None
    cats = {}
    for r in ward:
        k = cats.setdefault(r[0], [0, 0])
        if cur(r):
            k[0] += r[5]
        elif prev(r):
            k[1] += r[5]
    by_cat = sorted(({'category': k, 'label': LABELS.get(k, k), 'n': v[0], 'prev': v[1], 'change_pct': pct(v[0], v[1]), 'violent': k in VIOLENT}
                     for k, v in cats.items()), key=lambda x: -x['n'])
    comms = {}
    for r in ward:
        k = comms.setdefault(r[1], [0, 0])
        if cur(r):
            k[0] += r[5]
        elif prev(r):
            k[1] += r[5]
    by_comm = []
    for name, (x, y) in comms.items():
        code = name_to_code.get(name)
        pop = residents.get(code) if code else None
        by_comm.append({'name': name.title(), 'code': code, 'n': x, 'prev': y, 'change_pct': pct(x, y),
                        'per_1000': round(x * yr / pop * 1000, 1) if pop else None, 'residents': pop})
    by_comm.sort(key=lambda x: -x['n'])
    months = list(range(max(a - 12, min(_ym(r[3], r[4]) for r in crime)), b + 1))
    monthly = {k: 0 for k in months}
    for r in ward:
        k = _ym(r[3], r[4])
        if k in monthly:
            monthly[k] += r[5]
    viol = lambda rows, f: sum(r[5] for r in rows if f(r) and r[0] in VIOLENT)
    dis = (data.get('disorder') or []) if ward_label is None else [r for r in (data.get('disorder') or []) if r[2] == ward_label]
    dlatest = max((_ym(r[3], r[4]) for r in data.get('disorder') or []), default=None)
    dtypes = {}
    for r in dis:
        k = dtypes.setdefault(r[0], [0, 0])
        if cur(r):
            k[0] += r[5]
        elif prev(r):
            k[1] += r[5]
    return {
        'period': f'{_label(a)} to {_label(b)}' if n > 1 else _label(a), 'prev_period': f'{_label(pa)} to {_label(pb)}' if n > 1 else _label(pa),
        'months': n, 'latest': _label(latest), 'moved': b != _ym(want_end.year, want_end.month) - 1,
        'crimes': n_cur, 'crimes_prev': n_prev, 'change_pct': pct(n_cur, n_prev),
        'violent': viol(ward, cur), 'violent_prev': viol(ward, prev), 'violent_change_pct': pct(viol(ward, cur), viol(ward, prev)),
        'per_1000': round(n_cur * yr / res_total * 1000, 1) if res_total else None,
        'city_crimes': city_cur, 'city_prev': city_prev, 'city_change_pct': pct(city_cur, city_prev),
        'city_per_1000': round(city_cur * yr / city_population * 1000, 1) if city_population else None,
        'share_of_city_pct': round(n_cur / city_cur * 100, 1) if city_cur else None,
        'residents': res_total, 'city_population': city_population, 'population_month': _label(mid),
        'residents_share_pct': round(res_total / city_population * 100, 1) if res_total and city_population else None,
        'by_category': by_cat, 'by_comm': by_comm,
        'monthly': {'months': [_label(k) for k in months], 'n': [monthly[k] for k in months]},
        'disorder': {'n': sum(v[0] for v in dtypes.values()), 'prev': sum(v[1] for v in dtypes.values()),
                     'change_pct': pct(sum(v[0] for v in dtypes.values()), sum(v[1] for v in dtypes.values())),
                     'by_type': sorted(({'type': k, 'n': v[0], 'prev': v[1]} for k, v in dtypes.items() if v[0]),
                                       key=lambda x: -x['n'])[:8],
                     'latest': _label(dlatest) if dlatest is not None else None} if dis else None,
        'file': data.get('file'), 'link': data.get('link'), 'page': PAGE, 'source': SOURCE, 'dashboard': DASHBOARD,
        'how_to_download': HOW_TO_DOWNLOAD, 'rounding_note': ROUNDING_NOTE,
    }


def by_ward(data, want_start, want_end):
    """Crimes in each ward for the same months summary() uses: {'Ward 5': {'n', 'prev', 'violent', 'violent_prev'}},
    and the months used ('period')."""
    crime = data.get('crime') or []
    if not crime:
        return None
    latest = max(_ym(r[3], r[4]) for r in crime)
    a, b = _ym(want_start.year, want_start.month), _ym(want_end.year, want_end.month) - 1
    n = b - a + 1
    if b > latest:
        b = latest
        a = b - n + 1
    out = {}
    for r in crime:
        k = _ym(r[3], r[4])
        w = out.setdefault(r[2], {'n': 0, 'prev': 0, 'violent': 0, 'violent_prev': 0})
        if a <= k <= b:
            w['n'] += r[5]
            w['violent'] += r[5] if r[0] in VIOLENT else 0
        elif a - 12 <= k <= b - 12:
            w['prev'] += r[5]
            w['violent_prev'] += r[5] if r[0] in VIOLENT else 0
    return {'period': f'{_label(a)} to {_label(b)}', 'months': n, 'wards': out, 'mid_ym': int((a + b) / 2 + 0.5)}
