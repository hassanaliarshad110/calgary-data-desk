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
SITE_COPY = 'https://calgaryinsight.ca/data/school_tax.json'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; CalgaryInsight/1.0; civic data)'}
CATEGORIES = ('City', 'Specialized Municipality', 'Municipal District', 'Town', 'Village', 'Summer Village',
              'Improvement District', 'Metis Settlement', 'Métis Settlement', 'Special Area', 'Special Areas')
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
        if m:
            year = int(m.group(1))
        m = re.match(r'^(\d{4}) (\d{4}) % Change', ln)
        if m and not prev:
            prev = int(m.group(1))
    rows, cat = [], None
    pat = re.compile(r'^(.*?[A-Za-z\.\)])\s+((?:(?:' + MONEY + r')\s+(?:' + MONEY + r')\s+(?:-?\d+%|n/a|N/A|-|)\s*){3})$')
    for ln in lines:
        s = ln.strip()
        if s in CATEGORIES:
            cat = s
            continue
        m = pat.match(s)
        if not m:
            continue
        vals = re.findall(MONEY, re.sub(r'-?\d+%|n/a|N/A', ' ', m.group(2)))
        vals = [v for v in vals if v.strip()]
        if len(vals) != 6:
            continue
        a = [_num(v) for v in vals]
        name = m.group(1).strip()
        rows.append({'name': name, 'category': cat if not re.match(r'(?i)^(grand )?total', name) else 'Total',
                     'res_prev': a[0], 'res': a[1], 'nonres_prev': a[2], 'nonres': a[3], 'total_prev': a[4], 'total': a[5]})
    return year, prev or (year - 1 if year else None), rows


def requisitions(cache_dir):
    """Every published report, newest first: [{year, prev_year, rows, url}]. A report the catalogue can't hand over
    today is skipped (the reports before it still give its year, as their 'year before')."""
    import alberta                                    # noqa: PLC0415
    rdir = os.path.join(cache_dir, 'alberta')
    out = []
    for r in alberta.resources(REQ_PKG, rdir):
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
        req = requisition_summary(requisitions(cache_dir))
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Requisitions: {e}')
    try:
        enr = enrolment(cache_dir)
    except Exception as e:                            # noqa: BLE001
        errors.append(f'Enrolment: {e}')
    try:
        fund = funding()
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
    f = d.get('funding') or {}
    pick = [r for r in f.get('boards') or [] if any(w in r['board'] for w in ('Calgary', 'Edmonton', 'Rocky View', 'Foothills', 'Red Deer', 'Lethbridge', 'Elk Island', 'Golden Hills'))]
    return {**head, 'requisition': {k: v for k, v in req.items() if k not in ('municipalities', 'municipalities_columns')},
            'students': d.get('students'), 'tax_per_student': d.get('tax_per_student'),
            'funding': {k: v for k, v in f.items() if k != 'boards'} | {'selected_boards': pick},
            'school_projects': {k: v for k, v in (d.get('school_projects') or {}).items() if k in ('total', 'how')}
                               | {'top_municipalities': ((d.get('school_projects') or {}).get('by_municipality') or [])[:15],
                                  'calgary': (d.get('school_projects') or {}).get('calgary')},
            'more': 'part=municipalities (every municipality\'s requisition, find narrows), part=boards (every school board\'s '
                    'funding per student), part=projects (school projects). Method: get_method topic school_tax.'}


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
