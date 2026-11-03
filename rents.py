"""Rents and vacancy from CMHC's Rental Market Survey (Housing Market Information Portal).

The survey counts purpose-built rental apartments every October. CMHC publishes it for Calgary by survey zone
(Ward 5 is in the Northeast zone) and by neighbourhood; the neighbourhood that covers most of Ward 5 is
"Falconridge/Castleridge/Coral Springs/Martindale/Skyview Ranch/Saddle Ridge/Taradale/Horizon/Sunridge/Westwinds".
The portal's own table pages are read (no key needed) and kept for a week: the survey changes once a year.

Reliability codes from CMHC: a excellent, b very good, c good, d use with caution; ** = suppressed (too few units
or not reliable enough to publish).
"""
import html
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

PORTAL = 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart/TableMatchingCriteria'
PAGE = 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart?id=0140&t=3'
CALGARY_CMA = '0140'
ROW_ZONES, ROW_NEIGHBOURHOODS = 25, 24
MEASURES = {'rent': 'Average Rent ($)', 'vacancy': 'Vacancy Rate (%)', 'units': 'Rental Universe'}
WARD5_HOOD = 'Martindale'            # the CMHC neighbourhood whose name lists Martindale covers most of Ward 5 (reference)
ZONE = 'Northeast'
BEDROOMS = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom +', 'Total']
KEEP_DAYS = 7


class RentsError(Exception):
    pass


def _http_get(url, timeout=60):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Ward5DataDesk/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        raise RentsError(f'CMHC answered {e.code}') from None
    except urllib.error.URLError as e:
        raise RentsError(f'Could not reach CMHC ({e.reason}).') from None


fetch = _http_get        # replaced in tests


def table_url(measure, row_field):
    q = {'GeographyType': 'MetropolitanMajorArea', 'GeographyId': CALGARY_CMA, 'CategoryLevel1': 'Primary Rental Market',
         'CategoryLevel2': MEASURES[measure], 'ColumnField': '2', 'RowField': str(row_field)}
    return PORTAL + '?' + urllib.parse.urlencode(q, quote_via=urllib.parse.quote)


def _text(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()


def _num(v):
    v = (v or '').replace(',', '').replace('$', '').strip()
    try:
        return float(v)
    except ValueError:
        return None


def parse_table(page):
    """{row name: {bedroom: (value, quality)}} and the survey date shown on the page."""
    m = re.search(r'<table class="CawdDataTable">(.*?)</table>', page, re.S)
    if not m:
        raise RentsError('CMHC changed its table page.')
    rows = {}
    for tr in re.findall(r'<tr>(.*?)</tr>', m.group(1), re.S):
        th = re.search(r'<th scope="row"[^>]*>(.*?)</th>', tr, re.S)
        if not th:
            continue
        tds = [_text(x) for x in re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)]
        if len(tds) == 2 * len(BEDROOMS):
            vals = [(_num(tds[i]), tds[i + 1].strip() or None) for i in range(0, len(tds), 2)]
        else:
            vals = [(_num(x), None) for x in tds[:len(BEDROOMS)]]
        rows[_text(th.group(1))] = dict(zip(BEDROOMS, vals))
    when = re.search(r'id="timePeriodLink"[^>]*>\s*([^<]+?)\s*<', page)
    return rows, (when.group(1) if when else None)


def build():
    """Every survey zone and neighbourhood in Calgary, plus Calgary itself."""
    out = {'survey': None, 'zones': {}, 'hoods': {}, 'areas': {}, 'page': PAGE}
    for measure in MEASURES:
        for row_field in (ROW_ZONES, ROW_NEIGHBOURHOODS):
            rows, when = parse_table(fetch(table_url(measure, row_field)))
            out['survey'] = out['survey'] or when
            for name, vals in rows.items():
                if name == 'Calgary':
                    a = out.setdefault('calgary', {'name': 'Calgary'})
                else:
                    a = out['zones' if row_field == ROW_ZONES else 'hoods'].setdefault(name, {'name': name})
                a[measure] = {b: {'value': v, 'quality': q} for b, (v, q) in vals.items()}
    if 'rent' not in (out.get('calgary') or {}):
        raise RentsError('Calgary was not found in the CMHC tables.')
    return out


def _words(s):
    return {w for w in re.split(r'[^A-Za-z]+', (s or '').upper()) if len(w) > 2}


def for_ward(data, names, sectors=None):
    """The CMHC areas for a ward: the neighbourhood whose name lists most of the ward's communities, the survey
    zone matching most of its communities' sectors (Northeast, Northwest ...) and Calgary.
    names: the ward's residential community names; sectors: their City sectors (NORTHEAST ...)."""
    if not data:
        return data
    out = {k: v for k, v in data.items() if k not in ('zones', 'hoods')}
    areas = {}
    cal = data.get('calgary') or (data.get('areas') or {}).get('calgary')
    if cal:
        areas['calgary'] = cal
    hoods = data.get('hoods') or {}
    best, score = None, 0
    for hname, h in hoods.items():
        listed = {p.strip().upper() for p in re.split(r'[/,]', hname)}
        n = sum(1 for nm in names if (nm or '').strip().upper() in listed)
        if n > score:
            best, score = hname, n
    if best and score >= max(2, len(names) / 4):     # one shared community is not enough to call it the ward's area
        areas['ward'] = dict(hoods[best], matched=score, of=len(names))
    zones = data.get('zones') or {}
    if sectors and zones:
        tally = {}
        for sec in sectors:
            for zname in zones:
                if _words(zname) & _words(sec):
                    tally[zname] = tally.get(zname, 0) + 1
        if tally:
            z = max(tally.items(), key=lambda kv: kv[1])[0]
            areas['zone'] = zones[z]
    if not data.get('hoods') and data.get('areas') and any((n or '').upper() == 'MARTINDALE' for n in names):
        # a copy saved by an earlier version, which held Ward 5's areas only
        old = data['areas']
        areas.setdefault('ward', old.get('ward5'))
        areas.setdefault('zone', old.get('northeast'))
    areas = {k: v for k, v in areas.items() if v}
    # older screens read these names
    if 'ward' in areas:
        areas['ward5'] = areas['ward']
    if 'zone' in areas:
        areas['northeast'] = areas['zone']
    out['areas'] = areas
    return out


def load(cache_dir, force=False):
    """The CMHC tables, kept for a week (force: read CMHC's portal now)."""
    path = os.path.join(cache_dir, 'cmhc_rents.json')
    if not force and os.path.exists(path) and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        try:
            with open(path, encoding='utf-8') as f:
                saved = json.load(f)
            if 'hoods' in saved:                # copies from before every ward was covered are read again
                return saved
        except (OSError, ValueError):
            pass
    try:
        data = build()
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    data['fetched'] = time.strftime('%Y-%m-%d')
    data['fetched_utc'] = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime())
    os.makedirs(cache_dir, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f)
    return data
