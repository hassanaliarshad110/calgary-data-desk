"""School tax and school funding: what Calgary pays the province in education property tax, against its students, the
operating money each school board receives, and the new schools being built, Calgary against Edmonton and the rest of
Alberta. Read once a day by the website build (data/school_tax.json) for Data Genie and the Data Scientist.

Sources, all Government of Alberta:
  Education property tax requisition comparison report (Municipal Affairs, open.alberta.ca package
      74aa70ca-c77e-46c0-8fd8-ee79b8c8b42a): one PDF a year with every municipality's requisition, residential and farm
      land, non-residential and total, for that year and the year before. Every published year is read, for the trend.
  Projected operational funding for school authorities (Alberta Education and Childcare, Budget 2026): every school
      board's operating funding for the current and the coming school year.
  Student enrolment by school, authority and grade (open.alberta.ca, already read by alberta.py): students in every
      school, so students by board, in all of Alberta, and in the schools inside Calgary (families.city_school_totals).
  Major Projects inventory (majorprojects.alberta.ca): school projects of $5 million or more, proposed or being built,
      by municipality.

What it can and cannot say:
  - The requisition is a calendar-year figure; enrolment is a school year (September). Tax per student divides the
    latest requisition by the latest school year's students, and says so.
  - Calgary's students are those in every school inside the city (public, Catholic, francophone, charter, private).
    For other cities the enrolment file does not give the municipality, so Edmonton is counted by its two city boards
    (Edmonton public and Edmonton Catholic), and Calgary is shown the same way beside it, so the two compare like with
    like. Board students include some who live outside the city.
  - The requisition pays about a third of school operating costs; the rest comes from general provincial revenue, and
    new schools are paid for separately. So the fair comparison of money back is operating funding per student by
    board, and school projects against students, not the tax alone.

    python schooltax.py OUT.json CACHE_DIR      (the website build writes data/school_tax.json)
"""
import io
import json
import os
import re
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REQ_PKG = '74aa70ca-c77e-46c0-8fd8-ee79b8c8b42a'
REQ_PAGE = 'https://open.alberta.ca/publications/education-property-tax-requisition-comparison-report'
FUNDING_PDF = 'https://www.alberta.ca/system/files/ecc-projected-operational-funding-school-authorities.pdf'
FUNDING_PAGE = 'https://www.alberta.ca/education-projected-operational-funding'
EPT_PAGE = 'https://www.alberta.ca/education-property-tax'
MAJOR_API = 'https://majorprojects.alberta.ca/api/MajorProjects?years=1'
# the reports as the catalogue listed them in November 2026, for a day the catalogue itself is down
KNOWN_REPORTS = [
    ('2c02aaa4-8b49-49db-854f-f394aba9b666', 'ma-education-property-tax-requisition-comparison-report-2026.pdf', '2026-02-26T22:26:26.624407'),
    ('3706ad4a-e6a3-4cc9-a866-011523bd39e6', 'ma-education-property-tax-requisition-comparison-report-2025.pdf', '2025-02-27T22:48:33.316468'),
    ('07a82809-7ca2-4436-bc15-0117f57801de', 'ma-education-property-tax-requisition-comparison-report-2024.pdf', '2024-04-16T17:44:26.376734'),
    ('d9101832-4c4b-4bc5-89cc-a9554f43dc51', 'ma-education-property-tax-requisition-comparison-report-2023.pdf', '2023-02-28T22:56:32.196171'),
    ('6484f3e4-051a-4335-a8f7-d76bb071bcd8', 'ma-education-property-tax-requisition-comparison-report-2022.pdf', '2022-02-24T23:02:16.343058'),
    ('bcabca2f-ff9b-405a-85ca-0a63b487affd', 'ma-education-property-tax-requisition-comparison-report-2021.pdf', '2022-02-24T23:01:33.472800')]
SITE_COPY = 'https://calgaryinsight.ca/data/school_tax.json'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; CalgaryInsight/1.0; civic data)'}
CATEGORIES = ('City', 'Specialized Municipality', 'Municipal District', 'Town', 'Village', 'Summer Village',
              'Improvement District', 'Metis Settlement', 'Métis Settlement', 'Special Area', 'Special Areas', 'Townsite')
NOT_NAME = re.compile(r'Requisition|% Change|^Municipality$|Classification|Equalized|subject to revision|^\d{4} \d{4}')
MONEY = r'\(?-?\$?\s?[\d,]+\)?|-'
CITY_BOARDS = {'Calgary': ('CALGARY SCHOOL DIVISION', 'CALGARY ROMAN CATHOLIC SEPARATE SCHOOL DIVISION'),
               'Edmonton': ('EDMONTON SCHOOL DIVISION', 'EDMONTON CATHOLIC SEPARATE SCHOOL DIVISION')}


def _get(url, timeout=180, tries=3):
    last = None
    for t in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read()
        except Exception as e:                 # noqa: BLE001 - open.alberta.ca answers 500 now and then
            last = e
            time.sleep(4 * (t + 1))
    raise RuntimeError(f'{url.rsplit("/", 1)[-1]}: {last}')


def _num(s):
    s = (s or '').strip()
    if s in ('', '-'):
        return 0
    neg = s.startswith('(') or s.startswith('-')
    v = int(re.sub(r'[^\d]', '', s) or 0)
    return -v if neg else v


def _pdf_lines(data):
    from pypdf import PdfReader                # noqa: PLC0415 - only the website build reads the PDFs
    r = PdfReader(io.BytesIO(data))
    return [ln.strip() for p in r.pages for ln in (p.extract_text() or '').splitlines()]


def norm(s):
    """A school board or municipality name without 'The', 'No. 12', punctuation and case, for matching."""
    s = (s or '').upper().replace('&', 'AND').replace('É', 'E').replace('È', 'E')
    s = re.sub(r'\bNO\.?\s*\d+\b', ' ', s)
    s = re.sub(r'[^A-Z0-9 ]', ' ', s)
    s = re.sub(r'^\s*THE\s+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


# ------------------------------------------------------------------ the requisition reports

def parse_requisitions(lines):
    """One comparison report's lines -> (year, prev_year, rows). Each row: municipality, category, then
    residential (incl. farm land), non-residential and total, for the year before and the year."""
    year = prev = None
    for ln in lines[:40]:
        m = re.search(r'(\d{4}) Education Property Tax Requisition Comparison', ln)
        if m and not year:
            year = int(m.group(1))
        m = re.match(r'^(\d{4}) (\d{4}) % Change', ln)
        if m and not prev:
            prev = int(m.group(1))
    rows, cat, pending = [], None, ''
    pat = re.compile(r'^(.*?)\s*((?:(?:' + MONEY + r')\s+(?:' + MONEY + r')\s+(?:-?\d+%|n/a|N/A|-|)\s*){3})$')
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if s in CATEGORIES:
            cat, pending = s, ''
            continue
        m = pat.match(s)
        vals = [v for v in re.findall(MONEY, re.sub(r'-?\d+%|n/a|N/A', ' ', m.group(2))) if v.strip()] if m else []
        if not m or len(vals) != 6:
            # a name the PDF wraps onto two lines ("... No." / "124 $...", "Jasper National" / "Park) $...")
            pending = '' if NOT_NAME.search(s) or '$' in s else (pending + ' ' + s).strip()
            continue
        name = m.group(1).strip()
        if pending and (not re.search(r'[A-Za-z]', name) or not re.match(r'^[A-Z]', name) or len(name.split()) <= 2
                        or not re.search(r'\b(of|County|District|Board|Society)\b', name)):
            name = (pending + ' ' + name).strip()
        pending = ''
        if not re.search(r'[A-Za-z]', name):
            continue
        a = [_num(v) for v in vals]
        rows.append({'name': name, 'category': cat if not re.match(r'(?i)^(grand )?total', name) else 'Total',
                     'res_prev': a[0], 'res': a[1], 'nonres_prev': a[2], 'nonres': a[3], 'total_prev': a[4], 'total': a[5]})
    return year, prev or (year - 1 if year else None), rows


def requisitions(cache_dir):
    """Every published report, newest first: [{year, prev_year, rows, url}]. A report the catalogue can't hand over
    today is skipped (the reports before it still give its year, as their 'year before')."""
    import alberta                                    # noqa: PLC0415
    rdir = os.path.join(cache_dir, 'alberta')
    out = []
    try:
        listed = alberta.resources(REQ_PKG, rdir)
    except Exception:                                 # noqa: BLE001 - the catalogue answers 500 now and then
        listed = [{'url': f'https://open.alberta.ca/dataset/{REQ_PKG}/resource/{rid}/download/{f}', 'modified': m}
                  for rid, f, m in KNOWN_REPORTS]
    for r in listed:
        if not r['url'].lower().endswith('.pdf'):
            continue
        try:
            path = os.path.join(rdir, re.sub(r'[^\w.\-]', '_', r['url'].rsplit('/', 1)[-1]))
            stamp = path + '.modified'
            if os.path.exists(path) and os.path.exists(stamp) and open(stamp, encoding='utf-8').read() == r['modified']:
                data = open(path, 'rb').read()
            else:
                data = _get(r['url'])
                os.makedirs(rdir, exist_ok=True)
                open(path, 'wb').write(data)
                open(stamp, 'w', encoding='utf-8').write(r['modified'] or '')
            y, p, rows = parse_requisitions(_pdf_lines(data))
            if y and rows:
                out.append({'year': y, 'prev_year': p, 'rows': rows, 'url': r['url']})
        except Exception as e:                        # noqa: BLE001
            print('  requisition report skipped:', r['url'].rsplit('/', 1)[-1], str(e)[:100])
    out.sort(key=lambda x: -x['year'])
    return out


def _find(rows, name):
    n = norm(name)
    return next((r for r in rows if norm(r['name']) == n), None)


def _province(rows, key):
    t = next((r for r in rows if r['category'] == 'Total'), None)
    if t:
        return t[key]
    return sum(r[key] for r in rows if r['category'] != 'Total')


def requisition_summary(reports):
    if not reports:
        return None
    latest = reports[0]
    rows = latest['rows']
    cities = [r for r in rows if r['category'] == 'City']
    prov, prov_prev = _province(rows, 'total'), _province(rows, 'total_prev')
    hist = {}                                    # year -> {Calgary, Edmonton, Alberta}
    for rep in sorted(reports, key=lambda x: x['year']):
        for key, yr in (('total_prev', rep['prev_year']), ('total', rep['year'])):
            h = hist.setdefault(yr, {})
            for nm in ('City of Calgary', 'City of Edmonton'):
                r = _find(rep['rows'], nm)
                if r:
                    h[nm.replace('City of ', '')] = r[key]
            h['Alberta'] = _province(rep['rows'], key)
    trend = [{'year': y, **v, 'calgary_share_pct': round(v['Calgary'] / v['Alberta'] * 100, 1) if v.get('Calgary') and v.get('Alberta') else None}
             for y, v in sorted(hist.items())]
    keep = ('name', 'category', 'res_prev', 'res', 'nonres_prev', 'nonres', 'total_prev', 'total')
    return {'year': latest['year'], 'prev_year': latest['prev_year'], 'source_url': latest['url'],
            'alberta_total': prov, 'alberta_total_prev': prov_prev,
            'calgary': {k: v for k, v in (_find(rows, 'City of Calgary') or {}).items() if k in keep},
            'edmonton': {k: v for k, v in (_find(rows, 'City of Edmonton') or {}).items() if k in keep},
            'cities': [{k: r[k] for k in keep} | {'change_pct': round((r['total'] / r['total_prev'] - 1) * 100, 1) if r['total_prev'] else None}
                       for r in sorted(cities, key=lambda r: -r['total'])],
            'municipalities': [[r['name'], r['category'], r['res'], r['nonres'], r['total'], r['total_prev']]
                               for r in rows if r['category'] != 'Total'],
            'municipalities_columns': ['name', 'category', 'residential_and_farm', 'non_residential', 'total', 'total_year_before'],
            'trend': trend}


# ------------------------------------------------------------------ operating funding by school board

def parse_funding(lines):
    """The funding PDF's lines -> (years, rows [{name, prev, current}])."""
    text = ' '.join(lines)
    yrs = re.findall(r'(\d{4}/\d{2}) Operational Funding', text)
    rows = []
    for ln in lines:
        s = re.sub(r'^.*Operational Funding\d?\s+(?=\S)', '', ln) if 'Operational Funding' in ln else ln
        m = re.match(r'^(.*?[A-Za-z\.\)])\s+\$([\d,]+)\s+\$([\d,]+)\s*$', s)
        if m:
            rows.append({'name': m.group(1).strip(), 'prev': _num(m.group(2)), 'current': _num(m.group(3))})
    return (yrs[:2] if len(yrs) >= 2 else [None, None]), rows


def funding():
    yrs, rows = parse_funding(_pdf_lines(_get(FUNDING_PDF)))
    return {'years': yrs, 'rows': rows, 'url': FUNDING_PDF}


# ------------------------------------------------------------------ students

def enrolment(cache_dir):
    """Students by school board for the two latest school years, and Alberta's total."""
    import alberta                                    # noqa: PLC0415
    years = alberta.enrolment_years(os.path.join(cache_dir, 'alberta'))
    if not years:
        raise RuntimeError('No enrolment files could be read.')
    out = []
    for y, d in years[-6:]:
        boards = {}
        for s in d.values():
            b = boards.setdefault(norm(s['authority']), {'name': s['authority'], 'category': s.get('category'), 'students': 0, 'schools': 0})
            b['students'] += s['total']
            b['schools'] += 1
        out.append({'year': y, 'alberta': sum(s['total'] for s in d.values()), 'boards': boards})
    return out


def _match(name, boards):
    n = norm(name)
    if n in boards:
        return boards[n]
    words = set(n.split()) - {'SCHOOL', 'DIVISION', 'DISTRICT', 'SEPARATE', 'REGIONAL', 'AUTHORITY', 'SOCIETY'}
    best, score = None, 0
    for k, b in boards.items():
        w = set(k.split()) - {'SCHOOL', 'DIVISION', 'DISTRICT', 'SEPARATE', 'REGIONAL', 'AUTHORITY', 'SOCIETY'}
        if not w or not words:
            continue
        sc = len(w & words) / len(w | words)
        if sc > score:
            best, score = b, sc
    return best if score >= .75 else None


# ------------------------------------------------------------------ school projects

def school_projects():
    """School projects in the province's Major Projects inventory (proposed or being built), by municipality."""
    d = json.loads(_get(MAJOR_API, 300).decode('utf-8'))
    out = []
    for f in (d if isinstance(d, list) else d.get('features') or []):
        p = f.get('properties') or {}
        if p.get('type') != 'School' or (p.get('stage') or '').lower().startswith('complete'):
            continue
        out.append({'name': (p.get('name') or '').strip(), 'municipalities': p.get('municipalities') or [],
                    'stage': p.get('stage'), 'cost_m': p.get('cost'), 'start': p.get('schedule'), 'end': p.get('scheduleEnd'),
                    'developer': p.get('developer')})
    return out


# ------------------------------------------------------------------ the rest of the money back, and the factors behind it
#   residents: Statistics Canada's population estimates by census subdivision (table 17-10-0155), the same count for
#       every municipality, so tax per resident sits beside tax per student (the province's own population list still
#       carries Calgary at its 2021 census count).
#   spending: every board's audited revenues and expenses by program (Alberta Education's summary of the audited
#       financial statements, each school year): what was actually spent per student on instruction, buildings
#       (operations and maintenance), transportation and administration.
#   approvals: the school projects each provincial budget approves (the approved school capital list, 2024 on).
#   class size grant: the teachers the Class Size Reduction Grant pays for in each board (2026/27).
#   grants: each board's funding profile, line by line (base instruction, specialized learning, English as an
#       additional language, refugee students, socio-economic status, transportation, geographic, operations and
#       maintenance, system administration...), the reasons funding per student differs between boards.

POP_TABLE = 17100155
WDS = 'https://www150.statcan.gc.ca/t1/wds/rest/'
CKAN_SEARCH = 'https://open.alberta.ca/api/3/action/package_search?rows=40&q='
CAPITAL_LISTS = [(2026, 'https://www.alberta.ca/system/files/ecc-approved-school-capital-list-2026.pdf'),
                 (2025, 'https://www.alberta.ca/system/files/educ-approved-school-capital-list-2025.pdf'),
                 (2024, 'https://www.alberta.ca/system/files/educ-approved-school-capital-list-2024.pdf')]
CSR_PDF = 'https://www.alberta.ca/system/files/ecc-class-size-reduction-grant-2026-27-school-year-allocations.pdf'
FACTORS = [
    {'factor': 'Fewer students per resident in Calgary',
     'what': 'Calgary has fewer school-age children per resident than the rest of Alberta, so the same tax per resident '
             'is more per student. Compare tax per resident (residents) with tax per student before calling a gap unfair.'},
    {'factor': 'Business and industrial property',
     'what': 'The requisition includes non-residential property. Calgary\'s offices and shops pay part of it; in many rural '
             'municipalities oil, gas and pipeline property pays most of it, so some rural places pay far more per '
             'resident than Calgary (municipalities_per_resident).'},
    {'factor': 'Funding lags enrolment growth',
     'what': 'Until 2024/25 the province funded boards on a weighted moving average of enrolment (20% the year before, '
             '30% this year, 50% next year\'s projection), which pays fast-growing boards such as Calgary\'s for fewer '
             'students than they have; from 2025/26 it is 30% last year and 70% the projection, a smaller lag. A '
             'supplemental growth grant pays part of the gap. Set funding per student beside each board\'s growth.'},
    {'factor': 'Needs-based grants',
     'what': 'Funding per student differs by need, not by city: rural boards get transportation, geographic and small-school '
             'money; boards with many newcomers get English as an additional language and refugee grants; specialized '
             'learning, First Nations, Métis and Inuit, and socio-economic status grants follow students (grants).'},
    {'factor': 'Buildings: new schools and maintenance',
     'what': 'New schools are approved in each budget (approvals) and built over several years; maintenance and renewal '
             'money (IMR and CMR) is separate from operating funding. Operations and maintenance spending per student is in '
             'spending.'},
    {'factor': 'Money that does not pass through the boards',
     'what': 'The province pays teachers\' pension costs directly, and funds private schools (about 70% of a public '
             'student\'s base) and home education outside these board figures; Calgary has many private-school students, '
             'so the board figures understate the money that reaches Calgary\'s students.'},
    {'factor': 'Fees parents pay',
     'what': 'Boards charge fees (transportation, lunch supervision, materials) that differ by board; they are in the '
             'audited revenues, not in provincial funding.'},
    {'factor': 'Timing and counting',
     'what': 'Requisitions are calendar years, enrolment and funding school years; board students include some living '
             'outside the city; the 2027 standard rate changes the rate but not the fact that more valuable property pays more.'}]


def _cached_get(cache_dir, url, modified=None, keep_days=None):
    """A file downloaded once and kept under cache_dir/alberta (again when the catalogue's date changes, or after keep_days)."""
    rdir = os.path.join(cache_dir, 'alberta')
    path = os.path.join(rdir, re.sub(r'[^\w.\-]', '_', url.rsplit('/', 1)[-1])[:150])
    stamp = path + '.modified'
    if os.path.exists(path):
        fresh = (modified and os.path.exists(stamp) and open(stamp, encoding='utf-8').read() == modified) or \
                (not modified and keep_days and time.time() - os.path.getmtime(path) < keep_days * 86400)
        if fresh:
            return open(path, 'rb').read()
    try:
        data = _get(url)
    except Exception:
        if os.path.exists(path):                      # the province's site is down: the last copy
            return open(path, 'rb').read()
        raise
    os.makedirs(rdir, exist_ok=True)
    open(path, 'wb').write(data)
    open(stamp, 'w', encoding='utf-8').write(modified or '')
    return data


def _ckan(query):
    return json.loads(_get(CKAN_SEARCH + urllib.request.quote(query)).decode('utf-8'))['result']['results']


def residents(cache_dir):
    """{year, alberta, places: {name (Statistics Canada's census subdivision, e.g. 'Calgary (CY)'): population}}."""
    import csv                                         # noqa: PLC0415
    import zipfile                                     # noqa: PLC0415
    url = json.loads(_get(f'{WDS}getFullTableDownloadCSV/{POP_TABLE}/en').decode('utf-8'))['object']
    z = zipfile.ZipFile(io.BytesIO(_cached_get(cache_dir, url, keep_days=20)))
    name = next(n for n in z.namelist() if n.endswith('.csv') and 'MetaData' not in n)
    rows = {}
    with z.open(name) as f:
        for r in csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig')):
            g = r['GEO']
            if g == 'Alberta' or g.endswith(', Alberta'):
                try:
                    rows.setdefault(r['REF_DATE'][:4], {})[g.replace(', Alberta', '')] = int(float(r['VALUE']))
                except (ValueError, TypeError):
                    pass
    year = max(y for y in rows if 'Alberta' in rows[y])
    places = rows[year]
    return {'year': int(year), 'alberta': places.pop('Alberta'), 'places': places}


def _key(name):
    """'County of Barrhead No. 11' and 'Barrhead County No. 11 (MD)' -> the same words."""
    s = re.sub(r'\((CY|T|VL|SV|MD|SM|ID|SA|IRI|S-E|SNO|NO|MS|SC)\)', ' ', name or '')
    s = norm(s)
    s = re.sub(r'\b(CITY|TOWN|VILLAGE|SUMMER|OF|COUNTY|MUNICIPAL|DISTRICT|SPECIALIZED|MUNICIPALITY|REGIONAL|BOARD)\b', ' ', s)
    return ' '.join(sorted(s.split()))


def per_resident(req, pop):
    """Every municipality's requisition per resident (where its name can be matched), with the non-residential share."""
    if not req or not pop:
        return None
    keys = {}
    for g, v in pop['places'].items():
        keys.setdefault(_key(g), []).append((g, v))
    rows, matched = [], 0
    for name, cat, res, nonres, total, prev in req['municipalities']:
        hit = keys.get(_key(name))
        popn = hit[0][1] if hit and len(hit) == 1 else None
        matched += 1 if popn else 0
        rows.append({'name': name, 'category': cat, 'requisition': total, 'population': popn,
                     'per_resident': _per(total, popn), 'non_residential_pct': round(nonres / total * 100) if total else None})
    cal, edm = pop['places'].get('Calgary (CY)'), pop['places'].get('Edmonton (CY)')
    ct, et, at = req['calgary'].get('total'), req['edmonton'].get('total'), req['alberta_total']
    return {'population_year': pop['year'], 'requisition_year': req['year'],
            'calgary': {'population': cal, 'per_resident': _per(ct, cal)},
            'edmonton': {'population': edm, 'per_resident': _per(et, edm)},
            'alberta': {'population': pop['alberta'], 'per_resident': _per(at, pop['alberta'])},
            'rest_of_alberta': {'population': pop['alberta'] - cal if cal else None,
                                'per_resident': _per(at - ct, pop['alberta'] - cal) if cal else None},
            'calgary_share_of_population_pct': round(cal / pop['alberta'] * 100, 1) if cal else None,
            'municipalities_matched': matched, 'municipalities': sorted(rows, key=lambda r: -(r['per_resident'] or 0)),
            'how': 'Requisition divided by Statistics Canada\'s population estimate for the municipality (July 1, census '
                   'subdivision). Names are matched between the two lists; a municipality whose name could not be matched '
                   'has no population here.'}


def parse_afs(lines):
    """Alberta Education's summary of audited revenues or expenses by program -> [{code, board, ecs, grades, om,
    transport, admin, external, total, total_prev}]."""
    out = []
    for ln in lines:
        m = re.match(r'^\s*(\d{4})\s+(.*?)\s+(?=(?:-|\d[\d,]*)\s*\$?\s)', ln)
        if not m:
            continue
        rest = ln[m.end():]
        vals = re.findall(r'(?<![\w,.])(-|\d[\d,]*)(?![\w])', rest)
        if len(vals) != 8:
            continue
        name = re.sub(r'(\w{3,}) (\w)(?=\s|$)', r'\1\2', m.group(2)).strip()
        a = [_num(v) for v in vals]
        out.append({'code': m.group(1), 'board': name, 'ecs': a[0], 'grades': a[1], 'om': a[2], 'transport': a[3],
                    'admin': a[4], 'external': a[5], 'total': a[6], 'total_prev': a[7]})
    return out


def spending(cache_dir):
    """The newest audited year: {year, expenses: [...], revenues: [...]}."""
    pk = [p for p in _ckan('school authorities audited financial statements summary reports')
          if re.match(r'^\d{4}-\d{4}-school-authorities-audited-financial-statements-summary-reports$', p['name'])]
    pk.sort(key=lambda p: p['name'], reverse=True)
    for p in pk[:2]:
        res = {r.get('name', '').lower(): r for r in p.get('resources') or []}
        ex = next((r for n, r in res.items() if 'expenses' in n), None)
        rv = next((r for n, r in res.items() if 'revenues' in n), None)
        if not ex:
            continue
        e = parse_afs(_pdf_lines(_cached_get(cache_dir, ex['url'], ex.get('last_modified') or ex.get('created'))))
        r = parse_afs(_pdf_lines(_cached_get(cache_dir, rv['url'], rv.get('last_modified') or rv.get('created')))) if rv else []
        if len(e) >= 40:
            y = p['name'][:9]
            return {'year': y.replace('-', '/'), 'expenses': e, 'revenues': r, 'url': ex['url']}
    raise RuntimeError('no audited summary could be read')


def parse_capital(lines, year):
    text = '\n'.join(lines)
    m = re.search(r'total of (\d+) (?:new )?school projects', text)
    out = {'year': year, 'total': int(m.group(1)) if m else None}
    for city in ('Calgary', 'Edmonton'):
        n = None
        for ln in lines:
            mm = re.match(rf'^{city} \((\d+)\)', ln.strip())
            if mm:
                n = int(mm.group(1))
                break
        if n is None:
            n = sum(1 for ln in lines if re.match(rf'^{city} ', ln.strip()) and
                    re.search(r'\b(new|modernization|replacement|addition|consolidation)\b', ln, re.I)) or None
        out[city.lower()] = n
    return out


def approvals(cache_dir):
    out = []
    for y, u in CAPITAL_LISTS:
        try:
            out.append(parse_capital(_pdf_lines(_cached_get(cache_dir, u, keep_days=30)), y))
        except Exception as e:                        # noqa: BLE001
            print('  capital list skipped:', y, str(e)[:80])
    return out


def class_size(cache_dir):
    rows = []
    for ln in _pdf_lines(_cached_get(cache_dir, CSR_PDF, keep_days=30)):
        m = re.match(r'^(The .+?)\s+(\d+)\s+([\d,]+)\s*$', ln.strip())
        if m:
            rows.append({'board': m.group(1), 'teachers': int(m.group(2)), 'dollars': _num(m.group(3))})
    return {'year': '2026/27', 'boards': rows, 'url': CSR_PDF}


def parse_profile(lines):
    out = {}
    for ln in lines:
        m = re.match(r'^(?:[A-F](?: = [A-Z +/-]+)?\s+)?(.+?)\s+(-?\$[\d,]+)\s*$', ln.strip())
        if m:
            k = re.sub(r'\s*[\d²¹]+$', '', m.group(1)).strip()
            out[k] = _num(m.group(2).replace('$', ''))
    return out


def grants(cache_dir):
    """Every board's funding profile for the newest budget: {year, boards: {name: {line: dollars}}}."""
    from concurrent.futures import ThreadPoolExecutor  # noqa: PLC0415
    pk = [p for p in _ckan('projected operational funding school year by jurisdiction')
          if re.match(r'^projected-operational-funding-\d{4}-\d{4}-school-year-by-jurisdiction$', p['name'])]
    if not pk:
        raise RuntimeError('no funding profiles listed')
    p = max(pk, key=lambda p: p['name'])

    def one(r):
        try:
            return r.get('name', '').strip(), parse_profile(_pdf_lines(_cached_get(cache_dir, r['url'], r.get('last_modified') or r.get('created'))))
        except Exception:                             # noqa: BLE001
            return r.get('name', '').strip(), None
    with ThreadPoolExecutor(max_workers=6) as pool:
        got = dict(x for x in pool.map(one, [r for r in p.get('resources') or [] if r['url'].lower().endswith('.pdf')]) if x[1])
    return {'year': re.search(r'(\d{4}-\d{4})', p['name']).group(1).replace('-', '/'), 'boards': got, 'listed': len(p.get('resources') or [])}


GRANT_LINES = ['Specialized Learning Support', 'English as an Additional Language', 'Refugee Student', 'Socio-Economic Status',
               'First Nations, Métis, and Inuit Education', 'Transportation', 'Geographic', 'Rural Small Schools',
               'Operations & Maintenance Grant', 'System Administration', 'Classroom complexity']


# ------------------------------------------------------------------ checks before new figures are accepted
# A PDF whose layout changes can be read without an error but into the wrong columns. New figures are kept only when
# they pass these; otherwise the build keeps the last good copy, marked as not refreshed, and the log says why.

def check_report(rep):
    """Problems with one parsed requisition report ([] when it looks right)."""
    rows = [r for r in rep['rows'] if r['category'] != 'Total']
    bad = []
    if len(rows) < 250:
        bad.append(f'{rep["year"]}: only {len(rows)} municipalities read (about 330 expected)')
    for nm in ('City of Calgary', 'City of Edmonton'):
        if not _find(rows, nm):
            bad.append(f'{rep["year"]}: {nm} not found')
    tot, prev = sum(r['total'] for r in rows), sum(r['total_prev'] for r in rows)
    if not 1.5e9 <= tot <= 8e9:
        bad.append(f'{rep["year"]}: Alberta total ${tot:,} is outside $1.5 to $8 billion')
    if prev and not .7 <= tot / prev <= 1.4:
        bad.append(f'{rep["year"]}: total moved {tot / prev - 1:+.0%} from the year before')
    off = [r['name'] for r in rows if abs(r['res'] + r['nonres'] - r['total']) > max(5, r['total'] * .001)]
    if len(off) > 3:
        bad.append(f'{rep["year"]}: residential plus non-residential does not add to the total for {len(off)} municipalities')
    cal = _find(rows, 'City of Calgary')
    if cal and tot and not .2 <= cal['total'] / tot <= .5:
        bad.append(f'{rep["year"]}: Calgary\'s share {cal["total"] / tot:.0%} is outside 20 to 50%')
    return bad


def check_funding(f):
    rows = [r for r in f['rows'] if not re.match(r'(?i).*\btotal\b', r['name'])]
    bad = []
    if len(rows) < 50:
        bad.append(f'only {len(rows)} school boards read (about 90 expected)')
    names = ' '.join(norm(r['name']) for r in rows)
    for b in CITY_BOARDS['Calgary'] + CITY_BOARDS['Edmonton']:
        if b not in names:
            bad.append(f'{b.title()} not found')
    tot = sum(r['prev'] for r in rows)
    if not 4e9 <= tot <= 20e9:
        bad.append(f'operating funding total ${tot:,} is outside $4 to $20 billion')
    if not all(f.get('years') or [None]):
        bad.append('the school years in the heading were not found')
    return bad


# ------------------------------------------------------------------ putting it together

def _per(a, b):
    return round(a / b) if a and b else None


def build(cache_dir, calgary_students=None):
    """The whole file. calgary_students: {'years': [{year, students}], 'schools': n} from families.city_school_totals."""
    errors, out = [], {'built': time.strftime('%Y-%m-%d'), 'sources': [
        {'name': 'Education property tax requisition comparison report', 'publisher': 'Government of Alberta, Municipal Affairs', 'url': REQ_PAGE},
        {'name': 'Projected operational funding for school authorities (Budget 2026)', 'publisher': 'Government of Alberta, Education and Childcare', 'url': FUNDING_PAGE},
        {'name': 'Student enrolment by school, authority and grade level', 'publisher': 'Government of Alberta', 'url': 'https://open.alberta.ca/opendata/student-enrolment-by-school-authority-and-grade-level'},
        {'name': 'Major Projects inventory', 'publisher': 'Government of Alberta', 'url': 'https://majorprojects.alberta.ca/'},
        {'name': 'Education property tax (rates, 2027 standard rate)', 'publisher': 'Government of Alberta', 'url': EPT_PAGE}]}
    req = enr = fund = proj = None
    try:
        reps = requisitions(cache_dir)
        good = []
        for rep in reps:
            bad = check_report(rep)
            if bad:
                errors.append('Requisition report not used: ' + '; '.join(bad))
            else:
                good.append(rep)
        if reps and reps[0] not in good:
            raise RuntimeError('the newest report did not pass the checks, so yesterday\'s figures are kept')
        req = requisition_summary(good)
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Requisitions: {e}')
    try:
        enr = enrolment(cache_dir)
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Enrolment: {e}')
    try:
        fund = funding()
        bad = check_funding(fund)
        if bad:
            fund = None
            raise RuntimeError('the funding table did not pass the checks (' + '; '.join(bad) + '), so yesterday\'s figures are kept')
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Funding: {e}')
    try:
        proj = school_projects()
    except Exception as e:                            # noqa: BLE001
        errors.append(f'School projects: {e}')
    out['requisition'] = req
    latest = enr[-1] if enr else None
    # students
    if latest:
        boards = latest['boards']
        prev = enr[-2]['boards'] if len(enr) > 1 else {}
        first = enr[0]
        city = {}
        for c, names in CITY_BOARDS.items():
            got = [_match(n, boards) for n in names]
            city[c] = {'boards': [b['name'] for b in got if b], 'students': sum(b['students'] for b in got if b),
                       'students_prev': sum((_match(n, prev) or {}).get('students', 0) for n in names),
                       'students_first': sum((_match(n, first['boards']) or {}).get('students', 0) for n in names)}
        cs = None
        if calgary_students and calgary_students.get('years'):
            ys = {y['year']: y['students'] for y in calgary_students['years']}
            cs = {'year': latest['year'], 'students': ys.get(latest['year']), 'schools': calgary_students.get('schools'),
                  'years': calgary_students['years']}
        out['students'] = {'year': latest['year'], 'alberta': latest['alberta'], 'first_year': first['year'],
                           'alberta_first': first['alberta'], 'calgary_city_schools': cs, 'by_city_boards': city,
                           'trend': [{'year': e['year'], 'alberta': e['alberta'],
                                      **{c: sum((_match(n, e['boards']) or {}).get('students', 0) for n in names) for c, names in CITY_BOARDS.items()}}
                                     for e in enr]}
    # tax per student: Calgary against Edmonton, the rest of Alberta and Alberta
    if req and latest:
        cal, edm = req['calgary'].get('total'), req['edmonton'].get('total')
        cal_st = ((out['students'].get('calgary_city_schools') or {}).get('students')) or None
        cb, eb = out['students']['by_city_boards']['Calgary']['students'], out['students']['by_city_boards']['Edmonton']['students']
        ab, ab_st = req['alberta_total'], latest['alberta']
        rest_st = ab_st - cal_st if cal_st else None
        out['tax_per_student'] = {
            'requisition_year': req['year'], 'school_year': latest['year'],
            'calgary_all_city_schools': _per(cal, cal_st), 'calgary_city_boards': _per(cal, cb), 'edmonton_city_boards': _per(edm, eb),
            'rest_of_alberta': _per(ab - cal, rest_st) if rest_st else None, 'alberta': _per(ab, ab_st),
            'calgary_share_of_requisition_pct': round(cal / ab * 100, 1) if cal and ab else None,
            'calgary_share_of_students_pct': round(cal_st / ab_st * 100, 1) if cal_st and ab_st else None,
            'calgary_board_share_of_students_pct': round(cb / ab_st * 100, 1) if cb and ab_st else None,
            'edmonton_share_of_requisition_pct': round(edm / ab * 100, 1) if edm and ab else None,
            'edmonton_board_share_of_students_pct': round(eb / ab_st * 100, 1) if eb and ab_st else None,
            'how': 'The latest requisition (a calendar year) divided by students in the latest school year. "All city schools" '
                   'counts every school inside Calgary; "city boards" counts the public and Catholic boards only (Calgary: CBE '
                   'and Calgary Catholic; Edmonton: Edmonton Public and Edmonton Catholic), the only way Edmonton can be '
                   'counted from the enrolment file. Rest of Alberta: Alberta minus Calgary, both tax and students.'}
    # operating funding per student, every board
    if fund and latest:
        boards, rows = latest['boards'], []
        for r in fund['rows']:
            if re.match(r'(?i).*\btotal\b', r['name']):
                continue
            b = _match(r['name'], boards)
            st = b['students'] if b else None
            rows.append({'board': r['name'], 'funding_prev': r['prev'], 'funding': r['current'], 'students': st,
                         'category': b.get('category') if b else None,
                         'per_student_prev': _per(r['prev'], st), 'per_student': _per(r['current'], st)})
        tot_prev = sum(r['funding_prev'] for r in rows if r['students'])
        tot_st = sum(r['students'] for r in rows if r['students'])
        out['funding'] = {'years': fund['years'], 'enrolment_year': latest['year'], 'source_url': fund['url'],
                          'boards': sorted(rows, key=lambda r: -(r['funding'] or 0)),
                          'boards_matched': sum(1 for r in rows if r['students']), 'boards_listed': len(rows),
                          'alberta_per_student_prev': _per(tot_prev, tot_st),
                          'how': f'Each board\'s {fund["years"][0]} operating funding divided by its students in the {latest["year"]} '
                                 f'enrolment file (the same school year); {fund["years"][1]} is the budget for the coming year, '
                                 'divided by the same students for scale only. Funding follows the province\'s formula '
                                 '(enrolment, plus grants for needs such as English learners, specialized learning, rural '
                                 'schools and transportation), so a lower figure per student is not by itself unfair.'}
    # school projects by municipality
    if proj is not None:
        by = {}
        for p in proj:
            for m in p['municipalities'] or ['(not given)']:
                b = by.setdefault(m, {'municipality': m, 'projects': 0, 'cost_m': 0.0, 'being_built': 0})
                b['projects'] += 1
                b['cost_m'] += float(p['cost_m'] or 0)
                b['being_built'] += 1 if re.search(r'construction', p['stage'] or '', re.I) else 0
        out['school_projects'] = {'by_municipality': sorted(by.values(), key=lambda b: -b['projects']),
                                  'calgary': [p for p in proj if 'Calgary' in (p['municipalities'] or [])],
                                  'edmonton': [p for p in proj if 'Edmonton' in (p['municipalities'] or [])],
                                  'total': len(proj),
                                  'how': 'School projects of $5 million or more in the province\'s Major Projects inventory that '
                                         'are proposed, planned or under construction (completed ones left out). The inventory '
                                         'is not the province\'s full school capital plan: check announcements for the latest.'}
    # residents: tax per resident beside tax per student
    try:
        pop = residents(cache_dir)
        if not 3_000_000 <= pop['alberta'] <= 8_000_000 or not pop['places'].get('Calgary (CY)'):
            raise RuntimeError(f'population figures look wrong (Alberta {pop["alberta"]:,})')
        out['residents'] = per_resident(req, pop)
        if out['residents'] and out.get('tax_per_student') and out['students'].get('calgary_city_schools'):
            cs_ = out['students']['calgary_city_schools'].get('students')
            cal_pop = out['residents']['calgary']['population']
            rest_pop = out['residents']['rest_of_alberta']['population']
            out['residents']['students_per_100_residents'] = {
                'calgary': round(cs_ / cal_pop * 100, 1) if cs_ and cal_pop else None,
                'rest_of_alberta': round((latest['alberta'] - cs_) / rest_pop * 100, 1) if cs_ and rest_pop else None,
                'alberta': round(latest['alberta'] / pop['alberta'] * 100, 1)}
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Residents: {e}')
    # what boards actually spent (audited), per student
    try:
        sp = spending(cache_dir)
        ey = next((x for x in (enr or []) if x['year'] == sp['year']), None)
        if len(sp['expenses']) < 50 or not any('Calgary School' in r['board'] for r in sp['expenses']):
            raise RuntimeError(f'only {len(sp["expenses"])} boards read from the audited summary')
        rows = []
        for r in sp['expenses']:
            b = _match(r['board'], ey['boards']) if ey else None
            n = b['students'] if b else None
            rev = next((x for x in sp['revenues'] if x['code'] == r['code']), None)
            rows.append({'board': r['board'], 'students': n, 'spent': r['total'], 'spent_prev_year': r['total_prev'],
                         'revenue': rev['total'] if rev else None, 'per_student': _per(r['total'], n),
                         'instruction_per_student': _per(r['ecs'] + r['grades'], n), 'buildings_per_student': _per(r['om'], n),
                         'transportation_per_student': _per(r['transport'], n), 'administration_per_student': _per(r['admin'], n)})
        ok = [r for r in rows if r['students']]
        tot = lambda k: sum(r[k] for r in ok)
        out['spending'] = {'school_year': sp['year'], 'enrolment_year': ey['year'] if ey else None, 'source_url': sp['url'],
                           'boards': sorted(rows, key=lambda r: -r['spent']), 'boards_matched': len(ok),
                           'alberta_per_student': _per(tot('spent'), tot('students')),
                           'how': 'Each board\'s audited expenses for the school year (all sources of money, not only the province\'s), '
                                  'divided by its students that year. Instruction is ECS plus grades 1 to 12; buildings is '
                                  'operations and maintenance. Capital (new schools) is not an operating expense.'}
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Audited spending: {e}')
    # new schools approved in each budget, against student growth
    try:
        ap = [a for a in approvals(cache_dir) if a.get('total')]
        if ap:
            st_tr = (out.get('students') or {}).get('trend') or []
            grow = lambda c: (st_tr[-1][c] - st_tr[-4][c]) if len(st_tr) >= 4 else None
            cal_n, edm_n = sum(a.get('calgary') or 0 for a in ap), sum(a.get('edmonton') or 0 for a in ap)
            gc, ge = grow('Calgary'), grow('Edmonton')
            out['approvals'] = {'budgets': ap, 'calgary_total': cal_n, 'edmonton_total': edm_n, 'alberta_total': sum(a['total'] for a in ap),
                                'calgary_board_growth_3yr': gc, 'edmonton_board_growth_3yr': ge,
                                'calgary_per_1000_new_students': round(cal_n / gc * 1000, 1) if gc else None,
                                'edmonton_per_1000_new_students': round(edm_n / ge * 1000, 1) if ge else None,
                                'calgary_share_pct': round(cal_n / sum(a['total'] for a in ap) * 100, 1),
                                'how': 'School projects each provincial budget approves (new, replacement, modernization, addition, '
                                       'charter), from the approved school capital lists online (2024 on), counted by the community '
                                       'the list gives. Most are approved for planning or design first, so an approval is not yet a '
                                       'building. Growth: students in the two city boards over the last three school years.'}
    except Exception as e:                            # noqa: BLE001
        errors.append(f'School approvals: {e}')
    # class size reduction grant: teachers per 1,000 students
    try:
        cz = class_size(cache_dir)
        if len(cz['boards']) < 30:
            raise RuntimeError(f'only {len(cz["boards"])} boards read')
        for r in cz['boards']:
            b = _match(r['board'], latest['boards']) if latest else None
            r['students'] = b['students'] if b else None
            r['teachers_per_1000_students'] = round(r['teachers'] / r['students'] * 1000, 2) if r['students'] else None
        out['class_size_grant'] = cz
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Class size grant: {e}')
    # each board's grants, line by line
    try:
        gr = grants(cache_dir)
        if len(gr['boards']) < 40:
            raise RuntimeError(f'only {len(gr["boards"])} of {gr["listed"]} funding profiles read')
        sel, tot_st, tot = {}, 0, {}
        for name, lines in gr['boards'].items():
            b = _match(name, latest['boards']) if latest else None
            n = b['students'] if b else None
            if not n:
                continue
            tot_st += n
            for k in GRANT_LINES:
                tot[k] = tot.get(k, 0) + lines.get(k, 0)
            if any(w in name for w in ('Calgary School Division', 'Calgary Roman Catholic', 'Edmonton School Division', 'Edmonton Catholic',
                                       'Rocky View', 'Lethbridge School', 'Red Deer School', 'Northland', 'Fort Vermilion')):
                sel[name] = {'students': n, **{k: _per(lines.get(k, 0), n) for k in GRANT_LINES}}
        out['grants'] = {'budget_year': gr['year'], 'enrolment_year': latest['year'] if latest else None, 'profiles_read': len(gr['boards']),
                         'per_student_selected_boards': sel, 'per_student_alberta': {k: _per(v, tot_st) for k, v in tot.items()},
                         'all_boards': gr['boards'],
                         'how': 'Each board\'s funding profile for the coming school year, line by line, divided by its students in '
                                'the latest enrolment file (for scale: the profile counts projected students).'}
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Funding profiles: {e}')
    out['factors'] = FACTORS
    out['sources'] += [
        {'name': 'Population estimates, July 1, by census subdivision (17-10-0155)', 'publisher': 'Statistics Canada',
         'url': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710015501'},
        {'name': 'School authorities audited financial statements: summary reports', 'publisher': 'Government of Alberta',
         'url': 'https://open.alberta.ca/dataset/2024-2025-school-authorities-audited-financial-statements-summary-reports'},
        {'name': 'Approved school capital lists (Budgets 2024 to 2026)', 'publisher': 'Government of Alberta',
         'url': 'https://www.alberta.ca/planning-and-building-schools'},
        {'name': 'Class Size Reduction Grant, 2026/27 allocations', 'publisher': 'Government of Alberta', 'url': CSR_PDF},
        {'name': 'Projected operational funding by school jurisdiction (funding profiles)', 'publisher': 'Government of Alberta',
         'url': 'https://open.alberta.ca/dataset/projected-operational-funding-2026-2027-school-year-by-jurisdiction'}]
    out['rates'] = {'2026_residential_per_1000': 2.84, '2026_non_residential_per_1000': 4.17,
                    'calgary_2026_residential_per_1000': 2.7593,
                    '2027_standard_residential_per_1000': 2.65, '2027_standard_non_residential_per_1000': 3.98,
                    'note': 'From 2027 one education tax rate applies in every municipality, frozen for three years (announced '
                            '30 October 2026), with a one-time transition credit where the new rate is higher than the old local '
                            'rate. Until 2026 each municipality had its own rate, set from its equalized assessment.'}
    out['errors'] = errors
    return out


def load(data_dir=None, can_build=True):
    """The website's copy next to this file (data/school_tax.json); on the desktop, the published copy."""
    for p in (os.path.join(HERE, 'data', 'school_tax.json'), os.path.join(data_dir, 'school_tax.json') if data_dir else None):
        if p and os.path.exists(p) and (p.startswith(HERE) or time.time() - os.path.getmtime(p) < 7 * 86400):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    if can_build and data_dir:
        try:
            d = json.loads(_get(SITE_COPY, 60, 1).decode('utf-8'))
            os.makedirs(data_dir, exist_ok=True)
            with open(os.path.join(data_dir, 'school_tax.json'), 'w', encoding='utf-8') as f:
                json.dump(d, f)
            return d
        except Exception:                             # noqa: BLE001
            return None
    return None


def summary(d, part=None, find=None):
    """For the analyst. part: summary (default), municipalities (every municipality's requisition), boards (every
    board's funding per student), projects (every school project). find narrows municipalities, boards or projects."""
    if not d:
        return {'error': 'The school tax figures are not available right now.'}
    part = (part or 'summary').lower()
    head = {k: d.get(k) for k in ('built', 'sources', 'rates', 'errors')}
    req = d.get('requisition') or {}
    if part.startswith('muni'):
        rows = [dict(zip(req.get('municipalities_columns') or [], r)) for r in req.get('municipalities') or []]
        if find:
            rows = [r for r in rows if find.lower() in r['name'].lower()]
        return {**head, 'year': req.get('year'), 'prev_year': req.get('prev_year'), 'municipalities': rows,
                'alberta_total': req.get('alberta_total')}
    if part.startswith('board'):
        f = d.get('funding') or {}
        rows = f.get('boards') or []
        if find:
            rows = [r for r in rows if find.lower() in r['board'].lower()]
        return {**head, **{k: v for k, v in f.items() if k != 'boards'}, 'boards': rows}
    if part.startswith('proj'):
        p = d.get('school_projects') or {}
        rows = p.get('calgary', []) + [x for x in p.get('edmonton', []) if 'Calgary' not in x['municipalities']]
        return {**head, **p, 'found': [x for x in rows if find.lower() in x['name'].lower()] if find else None}
    if part.startswith('res'):
        r = d.get('residents') or {}
        rows = r.get('municipalities') or []
        if find:
            rows = [x for x in rows if find.lower() in x['name'].lower()]
        return {**head, **{k: v for k, v in r.items() if k != 'municipalities'}, 'municipalities': rows}
    if part.startswith('spend'):
        sp = d.get('spending') or {}
        rows = sp.get('boards') or []
        if find:
            rows = [x for x in rows if find.lower() in x['board'].lower()]
        return {**head, **{k: v for k, v in sp.items() if k != 'boards'}, 'boards': rows}
    if part.startswith('grant'):
        g = d.get('grants') or {}
        allb = g.get('all_boards') or {}
        return {**head, **{k: v for k, v in g.items() if k != 'all_boards'},
                'found': {k: v for k, v in allb.items() if find.lower() in k.lower()} if find else None}
    if part.startswith('appro') or part.startswith('capit') or part.startswith('class'):
        return {**head, 'approvals': d.get('approvals'), 'class_size_grant': d.get('class_size_grant')}
    if part.startswith('fact'):
        return {**head, 'factors': d.get('factors')}
    f = d.get('funding') or {}
    pick = [r for r in f.get('boards') or [] if any(w in r['board'] for w in ('Calgary', 'Edmonton', 'Rocky View', 'Foothills', 'Red Deer', 'Lethbridge', 'Elk Island', 'Golden Hills'))]
    return {**head, 'requisition': {k: v for k, v in req.items() if k not in ('municipalities', 'municipalities_columns')},
            'students': d.get('students'), 'tax_per_student': d.get('tax_per_student'),
            'funding': {k: v for k, v in f.items() if k != 'boards'} | {'selected_boards': pick},
            'school_projects': {k: v for k, v in (d.get('school_projects') or {}).items() if k in ('total', 'how')}
                               | {'top_municipalities': ((d.get('school_projects') or {}).get('by_municipality') or [])[:15],
                                  'calgary': (d.get('school_projects') or {}).get('calgary')},
            'residents': {k: v for k, v in (d.get('residents') or {}).items() if k != 'municipalities'}
                         | {'highest_per_resident': ((d.get('residents') or {}).get('municipalities') or [])[:10]},
            'spending': {k: v for k, v in (d.get('spending') or {}).items() if k != 'boards'}
                        | {'selected_boards': [r for r in (d.get('spending') or {}).get('boards') or []
                                               if any(w in r['board'] for w in ('Calgary', 'Edmonton', 'Rocky View', 'Red Deer', 'Lethbridge'))]},
            'approvals': d.get('approvals'),
            'class_size_grant': {'year': (d.get('class_size_grant') or {}).get('year'),
                                 'boards': ((d.get('class_size_grant') or {}).get('boards') or [])[:8]},
            'grants': {k: v for k, v in (d.get('grants') or {}).items() if k != 'all_boards'},
            'factors': d.get('factors'),
            'more': 'part=municipalities (every municipality\'s requisition), residents (tax per resident, every municipality), '
                    'boards (operating funding per student), spending (audited spending per student, every board), grants '
                    '(funding profile lines; find a board for its whole profile), approvals (new schools by budget and the class '
                    'size grant), projects (Major Projects), factors (what else explains a difference); find narrows. '
                    'Method: get_method topic school_tax.'}


if __name__ == '__main__':
    cache = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '.cache')
    cs = None
    try:
        import families                               # noqa: PLC0415
        cs = families.city_school_totals(cache)
    except Exception as e:                            # noqa: BLE001
        print('Calgary schools not counted:', e)
    d = build(cache, cs)
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    print(json.dumps({k: d.get(k) for k in ('tax_per_student', 'errors')}, indent=1)[:3000])
