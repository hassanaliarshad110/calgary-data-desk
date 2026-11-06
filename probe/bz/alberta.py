"""Government of Alberta open data used by the Ward 5 dashboard (open.alberta.ca).

  Child Care Information [2021 to current]            package e4ecb4fa-28b5-4abb-8c32-b2a76d2a6ee0
      one CSV per quarter: every licensed child care program, its address, type, licensed capacity and
      inspection record. One row per inspection.
  Student enrolment by school, authority and grade    package ccbcf0fb-615e-44a0-b7ec-681e2ea4e1e7
      one spreadsheet per school year: students in each school, by grade.

The file lists are read from the open data catalogue at every refresh, so new quarters and school years appear
on their own. Files are kept in a local folder once downloaded (only the Calgary rows of the child care files),
because published files do not change.
"""
import csv
import io
import json
import os
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from concurrent.futures import ThreadPoolExecutor

CKAN = 'https://open.alberta.ca/api/3/action/package_show?id='
CHILD_CARE_PKG = 'e4ecb4fa-28b5-4abb-8c32-b2a76d2a6ee0'
ENROLMENT_PKG = 'ccbcf0fb-615e-44a0-b7ec-681e2ea4e1e7'
CHILD_CARE_PAGE = 'https://open.alberta.ca/opendata/childcareinformation'
ENROLMENT_PAGE = 'https://open.alberta.ca/opendata/student-enrolment-by-school-authority-and-grade-level'
MONTHS = {'03': 'Mar', '06': 'Jun', '09': 'Sep', '12': 'Dec'}


class AlbertaError(Exception):
    pass


def _http_get(url, timeout=180):
    req = urllib.request.Request(url, headers={'User-Agent': 'Ward5DataDesk/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise AlbertaError(f'open.alberta.ca answered {e.code} for {url.rsplit("/", 1)[-1]}') from None
    except urllib.error.URLError as e:
        raise AlbertaError(f'Could not reach open.alberta.ca ({e.reason}).') from None


fetch = _http_get        # replaced in tests


def resources(package_id, cache_dir=None):
    """The files in one catalogue entry: name, url and last-modified date. The list is kept under cache_dir so the
    files already downloaded can still be used when the catalogue can't be reached."""
    saved = os.path.join(cache_dir, f'catalogue_{package_id}.json') if cache_dir else None
    try:
        data = json.loads(fetch(CKAN + package_id).decode('utf-8'))
    except Exception:                        # noqa: BLE001 - offline or the catalogue is down
        if saved and os.path.exists(saved):
            with open(saved, encoding='utf-8') as f:
                return json.load(f)
        raise
    out = []
    for r in data.get('result', {}).get('resources', []):
        out.append({'name': r.get('name', ''), 'url': r.get('url', ''), 'modified': (r.get('last_modified') or '')[:19]})
    if saved and out:
        try:
            os.makedirs(cache_dir, exist_ok=True)
            with open(saved, 'w', encoding='utf-8') as f:
                json.dump(out, f)
        except OSError:
            pass
    return out


def _cached(cache_dir, url, modified, transform=None):
    """Download a file once; keep it (optionally transformed) under cache_dir."""
    name = re.sub(r'[^\w.\-]', '_', url.rsplit('/', 1)[-1])
    path = os.path.join(cache_dir, name + ('.calgary.csv' if transform else ''))
    stamp = path + '.modified'
    if os.path.exists(path) and os.path.exists(stamp) and open(stamp, encoding='utf-8').read() == modified:
        with open(path, 'rb') as f:
            return f.read()
    data = fetch(url)
    if transform:
        data = transform(data)
    os.makedirs(cache_dir, exist_ok=True)
    with open(path, 'wb') as f:
        f.write(data)
    with open(stamp, 'w', encoding='utf-8') as f:
        f.write(modified)
    return data


# ------------------------------------------------------------------------------------------------ child care
def _calgary_rows(data):
    """Keep the header and the rows for programs in Calgary (the files cover all of Alberta)."""
    text = data.decode('utf-8-sig', 'replace')
    lines = text.splitlines()
    if not lines:
        return b''
    keep = [lines[0]] + [l for l in lines[1:] if ',CALGARY,' in l.upper()]
    return ('\n'.join(keep) + '\n').encode('utf-8')


def _col(header, *names):
    norm = [re.sub(r'[^a-z0-9]', '', h.lower()) for h in header]
    for n in names:
        n = re.sub(r'[^a-z0-9]', '', n.lower())
        if n in norm:
            return norm.index(n)
    # a few published headers are misspelt (for example "Program me"): fall back to a prefix match
    for n in names:
        n = re.sub(r'[^a-z0-9]', '', n.lower())
        if re.search(r'\d', n):
            continue                  # grade columns must match exactly
        for i, h in enumerate(norm):
            if h and (n.startswith(h) or h.startswith(n[:7])):
                return i
    return None


GROUP_FAMILY_MAX = 12      # from September 2026 the file says only "Home Based": a home of up to this many children is a
                           # group family child care program; a larger one is a family day home agency (its capacity is
                           # spread over day homes across the city, so it is not counted)


def _yes(v):
    """Y/N columns until 2026, TRUE/FALSE from September 2026."""
    return str(v or '').strip().upper() in ('Y', 'YES', 'TRUE', '1')


def _day(v):
    """An inspection or remedy date as YYYY-MM-DD: ISO dates until 2026, Excel day numbers (45804) from September 2026."""
    v = str(v or '').strip()
    if re.fullmatch(r'\d{5}(\.0+)?', v):
        import datetime as _dt
        return (_dt.date(1899, 12, 30) + _dt.timedelta(days=int(float(v)))).isoformat()
    return v[:10]


def _program_type(t, cap):
    """The program type in the older words, whichever file layout (September 2026 renamed and merged them)."""
    t = (t or '').strip().upper()
    if t == 'FACILITY BASED':
        return 'FACILITY-BASED PROGRAM'
    if t == 'HOME BASED':
        return 'GROUP FAMILY CHILD CARE PROGRAM' if 0 < cap <= GROUP_FAMILY_MAX else 'FAMILY DAY HOME'
    return t


def program_key(p):
    """The same program in every file: its name and address (the Program ID changed form in September 2026)."""
    return re.sub(r'[^A-Z0-9]', '', p['name'].upper()) + '|' + re.sub(r'[^A-Z0-9]', '', p['address'].upper())


def parse_child_care(data):
    """Programs (one per Program ID) and inspection rows from one quarterly file."""
    rows = list(csv.reader(io.StringIO(data.decode('utf-8-sig', 'replace'))))
    if not rows or len(rows[0]) < 10:
        return None                   # the September 2021 file is published broken
    h = rows[0]
    c = {k: _col(h, *v) for k, v in {
        'id': ('Program ID', 'Program_ID_hash'), 'name': ('Program Name',), 'address': ('Program Address',), 'city': ('Program City',),
        'postal': ('Postal Code',), 'phone': ('Phone Number',), 'type': ('Type of Program',),
        'daycare': ('Day Care Y/N',), 'osc': ('Out of School Care Y/N',), 'preschool': ('Preschool Y/N',),
        'capacity': ('Capacity',), 'date': ('Inspection Date',), 'reason': ('Inspection Reason',),
        'noncompliance': ('Non Compliance',), 'action': ('Enforcement Action',), 'remedy': ('Remedy Date',)}.items()}
    get = lambda r, k: (r[c[k]].strip() if c[k] is not None and c[k] < len(r) else '')
    programs, inspections = {}, []
    for r in rows[1:]:
        if len(r) < 8 or get(r, 'city').upper() != 'CALGARY':
            continue
        pid = get(r, 'id')
        if pid not in programs:
            try:
                cap = int(float(get(r, 'capacity') or 0))
            except ValueError:
                cap = 0
            programs[pid] = {'id': pid, 'name': get(r, 'name'), 'address': get(r, 'address'), 'postal': get(r, 'postal').replace(' ', '').upper(),
                             'phone': get(r, 'phone'), 'type': _program_type(get(r, 'type'), cap), 'capacity': cap,
                             'daycare': _yes(get(r, 'daycare')), 'osc': _yes(get(r, 'osc')),
                             'preschool': _yes(get(r, 'preschool'))}
        d = get(r, 'date')
        if d and d.upper() != 'NULL':
            act = get(r, 'action')
            rem = get(r, 'remedy')
            inspections.append({'id': pid, 'date': _day(d), 'reason': get(r, 'reason'),
                                'noncompliance': get(r, 'noncompliance'),
                                'action': '' if act.upper() == 'NULL' else act,
                                'remedy': _day(rem) if rem and rem not in ('-',) and rem.upper() != 'NULL' else rem})
    return {'programs': list(programs.values()), 'inspections': inspections}


def kind(p):
    """How a program's capacity is counted."""
    t = p['type']
    if 'AGENCY' in t or t == 'FAMILY DAY HOME':
        return 'Family day home agency'        # capacity is spread over homes across the city
    if p['daycare']:
        return 'Daycare'
    if p['osc']:
        return 'Out-of-school care'
    if p['preschool']:
        return 'Preschool'
    if 'GROUP FAMILY' in t:
        return 'Group family child care'
    if 'INNOVATIVE' in t:
        return 'Innovative child care'
    return 'Other licensed care'


def child_care_quarters(cache_dir, quarters=None):
    """[(label 'Dec 2025', 'YYYY-MM', parsed file)] oldest first; quarters limits how many recent ones."""
    files = []
    for r in resources(CHILD_CARE_PKG, cache_dir):
        m = re.search(r'child-care-open-data-(\d{4})(\d{2})\.csv$', r['url'])
        if m:
            files.append((m.group(1) + '-' + m.group(2), r))
    files.sort()
    if quarters:
        files = files[-quarters:]

    def one(item):
        ym, r = item
        try:
            parsed = parse_child_care(_cached(cache_dir, r['url'], r['modified'], _calgary_rows))
        except AlbertaError:
            parsed = None
        return (f"{MONTHS.get(ym[5:], ym[5:])} {ym[:4]}", ym, parsed)
    with ThreadPoolExecutor(max_workers=4) as pool:
        return [x for x in pool.map(one, files) if x[2]]


# ------------------------------------------------------------------------------------------------ addresses
STREET_TYPES = {
    'AVENUE': 'AV', 'AVE': 'AV', 'AV': 'AV', 'STREET': 'ST', 'ST': 'ST', 'DRIVE': 'DR', 'DR': 'DR', 'ROAD': 'RD', 'RD': 'RD',
    'BOULEVARD': 'BV', 'BLVD': 'BV', 'BV': 'BV', 'CRESCENT': 'CR', 'CRESENT': 'CR', 'CRES': 'CR', 'CR': 'CR', 'COURT': 'CO',
    'CT': 'CO', 'CO': 'CO', 'WAY': 'WY', 'WY': 'WY', 'PLACE': 'PL', 'PL': 'PL', 'TRAIL': 'TR', 'TR': 'TR', 'GATE': 'GA',
    'GA': 'GA', 'CIRCLE': 'CI', 'CIR': 'CI', 'CI': 'CI', 'CLOSE': 'CL', 'CL': 'CL', 'LANE': 'LN', 'LN': 'LN', 'PARK': 'PA',
    'RISE': 'RI', 'HEIGHTS': 'HT', 'HT': 'HT', 'TERRACE': 'TC', 'LINK': 'LI', 'VIEW': 'VW', 'MEWS': 'ME', 'GROVE': 'GV',
    'SQUARE': 'SQ', 'GARDENS': 'GD', 'POINT': 'PT', 'MANOR': 'MR', 'BAY': 'BA', 'HILL': 'HL', 'COMMON': 'CM', 'COMMONS': 'CM',
    'PARKWAY': 'PY', 'ROW': 'RO', 'GREEN': 'GR', 'LANDING': 'LD', 'GROVE': 'GV', 'CRESCENT,': 'CR', 'HEATH': 'HE',
    'PLAZA': 'PZ', 'PATH': 'PH', 'WALK': 'WK', 'VILLAS': 'VI', 'VILLAGE': 'VL', 'CENTRE': 'CE', 'CAPE': 'CA', 'COVE': 'CV',
    'MOUNT': 'MT', 'GLEN': 'GL', 'HIGHWAY': 'HY', 'GROUNDS': 'GO', 'ISLAND': 'IS', 'CROSSING': 'CX',
    'AVENE': 'AV', 'AVNUE': 'AV', 'STEET': 'ST', 'GDNS': 'GD', 'GDN': 'GD', 'PK': 'PA', 'PKWY': 'PY', 'HTS': 'HT', 'TERR': 'TC',
    'CRT': 'CO', 'CMN': 'CM', 'MNR': 'MR', 'GRV': 'GV', 'LNDG': 'LD', 'LDG': 'LD', 'PLZ': 'PZ', 'SQR': 'SQ', 'BV.': 'BV'}
QUADS = {'NE', 'NW', 'SE', 'SW', 'N', 'S', 'E', 'W'}
QUAD_WORDS = {'NORTHEAST': 'NE', 'NORTHWEST': 'NW', 'SOUTHEAST': 'SE', 'SOUTHWEST': 'SW', 'NORTH': 'N', 'SOUTH': 'S',
              'EAST': 'E', 'WEST': 'W'}


def parse_address(text):
    """'1209 - 4715 88TH AVENUE NE' -> ('4715', '88', 'NE'); None when it cannot be read."""
    a = (text or '').upper().strip()
    if not a or 'NOT AVAILABLE' in a:
        return None
    a = re.sub(r'\s+(SUITE|UNIT|BAY)\s+\S+$', '', a)              # "6815 8TH ST NE SUITE 290"
    a = re.sub(r',\s*(NE|NW|SE|SW)\b', r' \1', a)               # "CORNERSTONE BLVD, NE"
    a = re.sub(r'^(UNITS?|SUITE|BAY|#)\s*[\w&\s]*?,', '', a)     # "UNIT 1040, 4231 109 AVE NE"
    if ',' in a:
        a = a.rsplit(',', 1)[1]                                 # "4, 2611 - 37 AVENUE NE"
    a = re.sub(r'^(UNITS?|SUITE|BAY)\s+', '', a.strip())
    a = re.sub(r'#\S+\s*', '', a)
    a = re.sub(r'(\d)\s*-\s*(\d)', r'\1 \2', a)                  # "2105-30", "950 - 6"
    a = re.sub(r'\b(\d+[A-Z]?)(ST|AV|AVE|STREET|AVENUE)\b', r'\1 \2', a)   # "6ST"
    a = re.sub(r'[.]', '', a)
    tok = [t for t in re.split(r'\s+', a) if t]
    if len(tok) < 2:
        return None
    if tok[-1] in QUAD_WORDS:
        tok[-1] = QUAD_WORDS[tok[-1]]
    quad = tok.pop() if tok[-1] in QUADS else None
    if tok and tok[-1] in STREET_TYPES:
        tok.pop()
    if len(tok) < 2:
        return None
    # the street name is the run of words at the end; a numbered street keeps only its last number
    i = len(tok)
    while i > 0 and not re.match(r'^\d', tok[i - 1]):
        i -= 1
    if i == len(tok):                                           # numbered street: "950 6", "4715 88TH"
        name, house = tok[-1], tok[-2] if len(tok) >= 2 else None
    else:
        name, house = ' '.join(tok[i:]), tok[i - 1] if i >= 1 else None
    name = re.sub(r'^(\d+)(ST|ND|RD|TH)$', r'\1', name)
    if not house or not re.match(r'^\d+[A-Z]?$', house):
        return None
    return house, name, quad


def street_type(text):
    """The street type code of an address ('AV', 'ST', 'DR' ...), or None."""
    a = re.sub(r'[.,]', ' ', (text or '').upper())
    tok = [t for t in a.split() if t]
    while tok and (tok[-1] in QUADS or tok[-1] in QUAD_WORDS or tok[-1] in ('SUITE', 'UNIT', 'BAY') or re.match(r'^\d+$', tok[-1])):
        tok.pop()
    return STREET_TYPES.get(tok[-1]) if tok else None


def address_key(text):
    p = parse_address(text)
    return '|'.join(x or '' for x in p) if p else None


# ------------------------------------------------------------------------------------------------ enrolment
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'


def read_xlsx(data):
    """The first sheet of a spreadsheet as a list of rows (lists of strings), without extra libraries."""
    z = zipfile.ZipFile(io.BytesIO(data))
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).iter(NS + 'si'):
            shared.append(''.join(t.text or '' for t in si.iter(NS + 't')))
    sheets = sorted(n for n in z.namelist() if re.match(r'xl/worksheets/sheet\d+\.xml$', n))
    root = ET.fromstring(z.read(sheets[0]))
    out = []
    for row in root.iter(NS + 'row'):
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
            out.append([cells.get(i, '') for i in range(max(cells) + 1)])
    return out


GRADES = ['ECS'] + [f'Grade {i}' for i in range(1, 13)]


def parse_enrolment(data):
    """{school code: {name, authority, grades{...}, total}} from one school-level enrolment file."""
    rows = read_xlsx(data)
    if not rows:
        return {}
    h = rows[0]
    c = {'cat': _col(h, 'School Authority Category'), 'auth': _col(h, 'School Authority Name'),
         'name': _col(h, 'School Name'), 'code': _col(h, 'School Code'), 'total': _col(h, 'Total', 'Grand Total')}
    gcols = {g: _col(h, g) for g in GRADES}
    gcols = {g: i for g, i in gcols.items() if i is not None and re.sub(r'[^a-z0-9]', '', h[i].lower()) == re.sub(r'[^a-z0-9]', '', g.lower())}
    ung = next((i for i, x in enumerate(h) if 'ungraded' in x.lower()), None)
    num = lambda v: int(float(v)) if re.match(r'^-?\d+(\.\d+)?$', v or '') else 0
    out = {}
    for r in rows[1:]:
        g = lambda i: r[i] if i is not None and i < len(r) else ''
        code = g(c['code']).lstrip('0')
        if not code:
            continue
        grades = {k: num(g(i)) for k, i in gcols.items()}
        total = num(g(c['total'])) if c['total'] is not None else 0
        if not total:
            total = sum(grades.values()) + (num(g(ung)) if ung is not None else 0)
        out[code] = {'name': g(c['name']), 'authority': g(c['auth']), 'category': g(c['cat']), 'grades': grades,
                     'total': total}
    return out


def enrolment_years(cache_dir):
    """[('2025/2026', {code: school})] oldest first."""
    files = []
    for r in resources(ENROLMENT_PKG, cache_dir):
        m = re.search(r'school-enrolment-data-(\d{4})-(\d{4})\.xlsx$', r['url'])
        if m:
            files.append((f'{m.group(1)}/{m.group(2)}', r))
    files.sort()

    def one(item):
        year, r = item
        try:
            return year, parse_enrolment(_cached(cache_dir, r['url'], r['modified']))
        except (AlbertaError, zipfile.BadZipFile, ET.ParseError):
            return year, None
    with ThreadPoolExecutor(max_workers=4) as pool:
        return [x for x in pool.map(one, files) if x[1]]


def norm_name(s):
    s = (s or '').upper().replace('&', 'AND')
    s = re.sub(r'[ÉÈ]', 'E', s)
    s = re.sub(r"[^A-Z0-9 ]", ' ', s)
    s = re.sub(r'\b(THE|SCHOOL|ELEMENTARY|JUNIOR|SENIOR|HIGH|CAMPUS|ACADEMY|OF|CALGARY)\b', ' ', s)
    s = re.sub(r'\bSAINT\b', 'ST', s)
    return re.sub(r'\s+', ' ', s).strip()
