"""Elections: who represents each ward and community in Calgary, and the latest official results.

Three levels, each from the body that runs the election:
  municipal  2025 general election (20 October 2025): mayor, councillors, public (CBE) and separate (CCSD) school
             trustees. Elections Calgary's official results file (corrected after the 27 October 2025 mayoral
             recount), the turnout on its results page, and the station-by-station results (City of Calgary open data,
             gqvk-p23x) for the mayor's election-day votes by ward.
  provincial 2023 general election (29 May 2023): Elections Alberta's Statement of Vote (every voting place, 87
             electoral divisions; Calgary's are 01 to 26 on the 2019 boundaries); by-elections since in Calgary
             divisions (Elections Alberta official results); the members sitting today (Legislative Assembly of
             Alberta); the 19 October 2026 referendum, question by question (Elections Alberta official results).
  federal    2025 general election (28 April 2025): Elections Canada's official voting results (candidates, electors,
             turnout for each electoral district); the members sitting today (House of Commons).

Ridings to communities: each community's share of area in each riding (community outlines, City of Calgary
surr-xmvs; provincial divisions, Government of Alberta, 2019 boundaries; federal districts, Elections Canada 2025),
sampled on a grid (geo.area_shares). A ward's share in a riding = its communities' residents x their shares.

Results are what the returning bodies published: nothing is ranked, scored or interpreted here. Worked out once a
week on the website build; the laptop reads the website's copy (data/elections.json).
"""
import csv
import datetime as dt
import html
import io
import json
import os
import re
import time
import urllib.parse
import urllib.request
import zipfile
import xml.etree.ElementTree as ET

import calgary_data as cd
import geo

VERSION = 1
KEEP_DAYS = 7
SITE = 'https://hassanaliarshad110.github.io/calgary-data-desk/'
UA = {'User-Agent': 'CalgaryDataDesk/1.0 (civic data dashboard)'}

CITY_JSON = 'https://elections-prd.calgary.ca/content/dam/elections/results/2025/2025GeneralElectionResults.json'
CITY_PAGE = 'https://elections-prd.calgary.ca/results/2025-results.html'
CITY_STATIONS = 'gqvk-p23x'
COMMUNITIES = 'surr-xmvs'
AB_SOV = 'https://www.elections.ab.ca/uploads/2023-Provincial-General-Election-Statement-of-Vote.xlsx'
AB_SOV_PAGE = 'https://www.elections.ab.ca/resources/reports/general-elections/'
AB_RESULTS = 'https://officialresults.elections.ab.ca/'
AB_EVENT_PAGE = AB_RESULTS + 'orResultsPGE.cfm?EventId={event}'
AB_REF_EXPORT = AB_RESULTS + 'orEDResultsReferendum2026.cfm?EventId={event}&MODE=exED'
AB_REF_PAGE = AB_RESULTS + 'orEDResultsReferendum2026.cfm?EventId={event}'
AB_MLAS = 'https://www.assembly.ab.ca/members/members-of-the-legislative-assembly'
AB_PED = ('https://geospatial.alberta.ca/titan/rest/services/boundary/goa_administrative_area_10tm_nad83_aep/'
          'MapServer/3/query')
AB_NEXT = 'https://www.elections.ab.ca/elections/albertas-next-election/'
EC_BASE = 'https://www.elections.ca/res/rep/off/ovrGE45/62/'
EC_T11 = EC_BASE + 'data_donnees/table_tableau11.csv'
EC_T12 = EC_BASE + 'data_donnees/table_tableau12.csv'
EC_POLL = EC_BASE + 'data_donnees/pollbypoll_bureauparbureau{code}.csv'
EC_FED = 'https://www.elections.ca/res/cir/mapsCorner/vector/FederalElectoralDistricts_2025_KMZ.zip'
HOC = 'https://www.ourcommons.ca/members/en/search/xml'

DATES = {'municipal': '2025-10-20', 'provincial': '2023-05-29', 'federal': '2025-04-28', 'referendum': '2026-10-19'}
AB_PGE_EVENT = 101                    # Elections Alberta's event number for the 2023 general election
AB_REFERENDUM = [202600 + q for q in range(1, 11)]      # 2026 referendum, questions 1 to 10
AB_NEXT_DAY = '2027-10-18'            # the third Monday in October 2027 (Election Act, s. 38.1)

# Calgary's bounding box, a little wider than the city (for the riding outlines that touch it)
BOX = (-114.35, 50.84, -113.85, 51.22)


# ------------------------------------------------------------------------------------------------- fetching
def _get(url, timeout=180):
    req = urllib.request.Request(url, headers=UA)
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:                      # noqa: BLE001 - a second try, then give up
            last = e
            time.sleep(5 * (attempt + 1))
    raise last


def _text(b):
    return b.decode('utf-8', 'replace')


def _strip(t):
    t = re.sub(r'(?s)<(script|style).*?</\1>', ' ', t)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t))).strip()


def _int(v):
    if v is None or v == '':
        return None
    try:
        return int(round(float(str(v).replace(',', '').strip())))
    except ValueError:
        return None


# ------------------------------------------------------------------------------------------------- names
def _cap(word):
    """FORTUGNO -> Fortugno, D'SOUZA -> D'Souza, MCLEAN -> McLean, VECCHIO-ROMANO -> Vecchio-Romano."""
    def one(w):
        if not w:
            return w
        w = w[0].upper() + w[1:].lower()
        if w.startswith('Mc') and len(w) > 2:
            w = 'Mc' + w[2].upper() + w[3:]
        return re.sub(r"'([a-z])", lambda m: "'" + m.group(1).upper(), w)
    return '-'.join(one(p) for p in word.split('-'))


def person(name):
    """'DAVISON, Jeff' -> 'Jeff Davison'; 'ANDRE CHABOT' -> 'Andre Chabot'; mixed case is kept."""
    name = (name or '').strip()
    if ',' in name:
        last, first = [p.strip() for p in name.split(',', 1)]
        last = ' '.join(_cap(w) if w.isupper() else w for w in last.split())
        return f'{first} {last}'.strip()
    if name.isupper():
        return ' '.join(w if w.startswith('(') else _cap(w) for w in name.split())
    return name


def _race(candidates, total=None):
    """Shares, the winner and the margin for one race. candidates: [{'name', 'votes', ...}]."""
    cands = sorted(candidates, key=lambda c: -(c.get('votes') or 0))
    tot = total if total is not None else sum(c.get('votes') or 0 for c in cands)
    for c in cands:
        c['share'] = round(c['votes'] / tot, 4) if tot and c.get('votes') is not None else None
        c['elected'] = False
    acclaimed = len(cands) == 1 and not tot
    if cands:
        cands[0]['elected'] = True
    margin = (cands[0]['votes'] - cands[1]['votes']) if len(cands) > 1 else None
    return {'candidates': cands, 'total': tot, 'acclaimed': acclaimed, 'margin': margin,
            'margin_share': round(margin / tot, 4) if margin is not None and tot else None}


def _wards_in(title):
    """'Wards 1 and 2 plus Cochrane' -> [1, 2]; 'Councillor for Ward 5' -> [5]."""
    return [int(x) for x in re.findall(r'\b(\d{1,2})\b', title or '') if 1 <= int(x) <= 14]


# ------------------------------------------------------------------------------------------------- municipal
def parse_city(results, page_text=''):
    """Elections Calgary's results file -> mayor, councillors and trustees, with Calgary's turnout."""
    out = {'date': DATES['municipal'], 'reported_at': results.get('ReportedAt'), 'mayor': None, 'councillors': {},
           'public_trustees': [], 'separate_trustees': [], 'turnout': None}
    for j in results.get('Results') or []:
        jt = (j.get('JurisdictionTitle') or '').lower()
        for r in j.get('Races') or []:
            cands = [{'name': person(b.get('CandidateFullname')), 'votes': _int(b.get('NumberVotes')) or 0,
                      'party': None if (b.get('PartyName') or 'None') == 'None' else b.get('PartyName'),
                      'incumbent': bool(b.get('Incumbent'))} for b in r.get('BallotAccount') or []]
            race = _race(cands, _int(r.get('TotalVotes')))
            race.update({'title': r.get('RaceTitle'), 'reports': [_int(r.get('NumberOfReportsReceived')),
                                                                  _int(r.get('NumberOfReportsExpected'))]})
            if jt.startswith('mayor'):
                out['mayor'] = race
            elif jt.startswith('councillor'):
                w = _wards_in(r.get('RaceTitle'))
                if w:
                    out['councillors'][str(w[0])] = race
            elif 'public school' in jt:
                race['wards'] = _wards_in(r.get('RaceTitle'))
                out['public_trustees'].append(race)
            elif 'separate school' in jt:
                race['wards'] = _wards_in(r.get('RaceTitle'))
                out['separate_trustees'].append(race)
    m = re.search(r'([\d.]+)\s*%\s*Total voters\s*-\s*([\d,]+)\*?\s*Total enumerated electors\s*-\s*([\d,]+)', page_text or '')
    if m:
        out['turnout'] = {'share': round(float(m.group(1)) / 100, 4), 'voters': _int(m.group(2)),
                          'electors': _int(m.group(3)),
                          'note': 'Voters estimated by Elections Calgary as of 24 October 2025; electors from the '
                                  'City of Calgary Permanent Electors Register (Elections Alberta elector data, '
                                  '16 September 2025).'}
    return out


def mayor_by_ward(rows):
    """Station rows (gqvk-p23x, Mayor) -> {ward: {'candidates': [...], 'total'}} from election-day stations
    (advance votes were cast at stations open to any ward, so they are counted for Calgary only)."""
    by, adv = {}, {}
    for r in rows:
        if (r.get('officecategory') or '').lower() != 'mayor':
            continue
        v = _int(r.get('votes')) or 0
        name = person(r.get('candidatename'))
        w = str(_int(r.get('ward')) or 0)
        if w == '0':
            adv[name] = adv.get(name, 0) + v
        else:
            by.setdefault(w, {})
            by[w][name] = by[w].get(name, 0) + v
    out = {w: _race([{'name': n, 'votes': v} for n, v in c.items()]) for w, c in by.items()}
    for v in out.values():
        for c in v['candidates']:
            c['elected'] = False                      # the ward's leading candidate is not "elected" in a ward
        v['leading'] = v['candidates'][0]['name'] if v['candidates'] else None
    return {'by_ward': out, 'advance_total': sum(adv.values())}


def municipal():
    page = ''
    try:
        page = _strip(_text(_get(CITY_PAGE)))
    except Exception as e:                            # noqa: BLE001 - the turnout line only
        print('elections: City results page not read:', e)
    out = parse_city(json.loads(_text(_get(CITY_JSON))), page)
    rows = cd.query(CITY_STATIONS, select='ward,officecategory,candidatename,sum(votes) as votes',
                    where="officecategory='Mayor'", group='ward,officecategory,candidatename', limit=5000)
    out['mayor_by_ward'] = mayor_by_ward(rows)
    out['sources'] = [{'name': 'Elections Calgary, 2025 General Election official results', 'url': CITY_PAGE},
                      {'name': 'City of Calgary open data: Official Results General Election Result - 2025 (gqvk-p23x)',
                       'url': 'https://data.calgary.ca/d/gqvk-p23x'}]
    return out


# ------------------------------------------------------------------------------------------------- provincial
def _cand_header(h):
    """'Diana Batten\\nNDP' -> ('Diana Batten', 'NDP')."""
    parts = [p.strip() for p in str(h).split('\n') if p.strip()]
    return (parts[0], parts[1] if len(parts) > 1 else None)


def parse_sov_sheet(rows):
    """One electoral division's sheet of the 2023 Statement of Vote -> candidates, electors, ballots, turnout."""
    head = [str(c).strip() if c is not None else '' for c in rows[0]]
    try:
        a = head.index('Voting Areas Assigned') + 1
        b = head.index('Names on List')
    except ValueError:
        return None
    cols = [(i, _cand_header(head[i])) for i in range(a, b) if head[i]]
    total = next((r for r in rows if any(isinstance(c, str) and c.startswith('Total (All') for c in r[:3])), None)
    if total is None:
        return None
    col = {h: i for i, h in enumerate(head)}
    cands = [{'name': n, 'party': p, 'votes': _int(total[i]) or 0} for i, (n, p) in cols]
    race = _race(cands)
    electors, ballots = _int(total[col['Names on List']]), _int(total[col['Total Ballots Cast']])
    race.update({'electors': electors, 'ballots': ballots, 'valid': _int(total[col['Valid Ballots Cast']]),
                 'turnout': round(ballots / electors, 4) if electors and ballots else None})
    return race


def ped_names():
    """{'01': 'Calgary-Acadia', ...} for the 2019 boundaries (Government of Alberta)."""
    q = AB_PED + '?' + urllib.parse.urlencode({'where': '1=1', 'outFields': 'EDNUMBER,EDNAME', 'returnGeometry': 'false',
                                                'f': 'json'})
    d = json.loads(_text(_get(q)))
    return {str(f['attributes']['EDNUMBER']).zfill(2): f['attributes']['EDNAME'] for f in d.get('features', [])}


def ped_shapes():
    """The 2019 provincial divisions touching Calgary, as GeoJSON in longitude and latitude."""
    q = AB_PED + '?' + urllib.parse.urlencode({
        'where': '1=1', 'outFields': 'EDNUMBER,EDNAME', 'returnGeometry': 'true', 'f': 'geojson', 'outSR': 4326,
        'geometry': ','.join(map(str, BOX)), 'geometryType': 'esriGeometryEnvelope', 'inSR': 4326,
        'spatialRel': 'esriSpatialRelIntersects'})
    d = json.loads(_text(_get(q, timeout=300)))
    out = {}
    for f in d.get('features', []):
        g, p = f.get('geometry') or {}, f.get('properties') or {}
        if g.get('type') == 'Polygon':
            g = {'type': 'MultiPolygon', 'coordinates': [g['coordinates']]}
        out[str(p.get('EDNUMBER')).zfill(2)] = {'name': p.get('EDNAME'), 'geometry': g}
    return out


def parse_mlas(page_text):
    """'..., Member Diana (NDP) Calgary-Acadia ...' -> {'Calgary-Acadia': {'name': 'Diana Batten', 'caucus': 'NDP'}}."""
    out = {}
    pat = re.compile(r"([A-Z][A-Za-z'.\- ]+?), ((?:[A-Z][A-Za-z.,]* )*?)([A-Z][A-Za-z'.\- ]+?) \(([A-Za-z]+)\) "
                     r"(Calgary-[A-Za-z'\-]+)")
    titles = {'Honourable', 'The', 'Member', 'Mr.', 'Mrs.', 'Ms', 'Ms.', 'Dr.', 'KC,', 'ECA,', 'Hon.'}
    for m in pat.finditer(page_text):
        last, first, caucus, ed = m.group(1).strip(), m.group(3).strip(), m.group(4), m.group(5)
        first = ' '.join(w for w in first.split() if w not in titles)
        out[ed] = {'name': f'{first} {last}'.strip(), 'caucus': {'UC': 'UCP'}.get(caucus, caucus)}
    return out


def parse_event_page(page_text, names):
    """An Elections Alberta event page (a by-election) -> the Calgary divisions it covered (names only)."""
    return sorted({n for n in names.values() if n.startswith('Calgary') and n.upper() in page_text.upper()})


def parse_referendum(xlsx_bytes, names):
    """One question's division results (Elections Alberta export) -> question, options and each Calgary division."""
    import openpyxl                                   # noqa: PLC0415 - only the website build reads Excel files
    ws = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), read_only=True, data_only=True).worksheets[0]
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    text_rows = [str(r[0]).strip() for r in rows if r and r[0] and isinstance(r[0], str)]
    question = next((t for t in text_rows if t.lower().startswith('question')), None)
    options = [t for t in text_rows if re.match(r'(Option \d|Yes|No)\b', t)]
    hi = next((i for i, r in enumerate(rows) if r and str(r[0] or '').upper().startswith('ELECTORAL DIVISION')), None)
    if hi is None:
        return None
    head = [str(c or '').replace('\n', ' ').strip() for c in rows[hi]]
    try:
        e_col = next(i for i, h in enumerate(head) if h.lower().startswith('number of electors'))
        t_col = next(i for i, h in enumerate(head) if h.lower().startswith('voter turnout'))
    except StopIteration:
        return None
    opt_cols = list(range(e_col + 1, t_col))
    by_ed, current = {}, None
    upper = {n.upper(): n for n in names.values()}
    for r in rows[hi + 1:]:
        c0 = str(r[0] or '').strip()
        if c0:
            nm = re.sub(r'^\d+\s*-\s*', '', c0).strip().upper()
            current = upper.get(nm, current if not nm else None)
        label = str(r[2] or '').strip() if len(r) > 2 else ''
        if not current or not current.startswith('Calgary') or not label.lower().startswith('total'):
            continue
        votes = [_int(r[i]) or 0 for i in opt_cols]
        tot = sum(votes)
        by_ed[current] = {'electors': _int(r[e_col]), 'votes': votes,
                          'shares': [round(v / tot, 4) if tot else None for v in votes],
                          'turnout': (round(float(r[t_col]) / (100 if float(r[t_col]) > 1 else 1), 4)
                                      if r[t_col] not in (None, '') else None)}
    return {'question': question, 'options': options or [head[i] for i in opt_cols],
            'option_columns': [head[i] for i in opt_cols], 'by_ed': by_ed}


def provincial():
    import openpyxl                                   # noqa: PLC0415
    names = ped_names()
    wb = openpyxl.load_workbook(io.BytesIO(_get(AB_SOV, timeout=300)), read_only=True, data_only=True)
    eds = {}
    for num, name in sorted(names.items()):
        if not name.startswith('Calgary') or num not in wb.sheetnames:
            continue
        race = parse_sov_sheet([list(r) for r in wb[num].iter_rows(values_only=True)])
        if race:
            race.update({'number': num, 'name': name})
            eds[name] = race
    out = {'date': DATES['provincial'], 'boundaries': 2019, 'general': eds, 'byelections': [], 'members': {},
           'referendum': None, 'next_election': AB_NEXT_DAY,
           'sources': [{'name': 'Elections Alberta, 2023 Provincial General Election Statement of Vote', 'url': AB_SOV_PAGE},
                       {'name': 'Elections Alberta, official results', 'url': AB_RESULTS},
                       {'name': 'Legislative Assembly of Alberta, Members of the Legislative Assembly', 'url': AB_MLAS}]}
    try:
        out['members'] = {k: v for k, v in parse_mlas(_strip(_text(_get(AB_MLAS)))).items() if k in eds}
    except Exception as e:                            # noqa: BLE001
        print('elections: MLA list not read:', e)
    try:                                              # by-elections since the general election, Calgary divisions
        page = _text(_get(AB_EVENT_PAGE.format(event=AB_PGE_EVENT)))
        events = [(int(v), lab.strip()) for v, lab in re.findall(r'<OPTION VALUE="(\d+)"[^>]*>\s*(By-Election[^<]+)', page, re.I)]
        for ev, label in events:
            if ev <= AB_PGE_EVENT:
                continue
            ev_text = _strip(_text(_get(AB_EVENT_PAGE.format(event=ev))))
            for ed in parse_event_page(ev_text, names):
                out['byelections'].append({'event': ev, 'label': label, 'ed': ed,
                                           'url': AB_EVENT_PAGE.format(event=ev)})
    except Exception as e:                            # noqa: BLE001
        print('elections: by-elections not read:', e)
    qs = []
    for ev in AB_REFERENDUM:
        try:
            q = parse_referendum(_get(AB_REF_EXPORT.format(event=ev)), names)
            if q:
                q.update({'number': ev - 202600, 'url': AB_REF_PAGE.format(event=ev)})
                qs.append(q)
        except Exception as e:                        # noqa: BLE001
            print('elections: referendum question', ev - 202600, 'not read:', e)
    if qs:
        out['referendum'] = {'date': DATES['referendum'], 'questions': qs}
    return out


# ------------------------------------------------------------------------------------------------- federal
def parse_ec_tables(t11, t12):
    """Elections Canada tables 11 (electors, turnout) and 12 (candidates) -> Calgary's districts."""
    def rows(b):
        return list(csv.reader(io.StringIO(b.decode('utf-8-sig', 'replace'))))
    out = {}
    for r in rows(t11)[1:]:
        if len(r) > 12 and r[0].startswith('Alberta'):
            out[r[2]] = {'code': r[2], 'name': r[1].split('/')[0].strip(), 'population': _int(r[3]),
                         'electors': _int(r[4]), 'ballots': _int(r[10]), 'valid': _int(r[6]),
                         'turnout': round(float(r[11]) / 100, 4) if r[11] else None, 'candidates': []}
    for r in rows(t12)[1:]:
        if len(r) > 7 and r[2] in out:
            raw = r[3]
            inc = '**' in raw
            raw = raw.replace('**', ' ')
            eng = raw.split('/')[0].strip() if '/' in raw else raw.strip()
            out[r[2]]['candidates'].append({'raw': re.sub(r'\s+', ' ', eng), 'votes': _int(r[6]) or 0,
                                            'incumbent': inc})
    return out


def split_names(district, header):
    """Candidate names from a poll-by-poll file's header split the 'Name Party' strings of table 12."""
    names = [h.strip() for h in header[4:] if h and '/' not in h]
    for c in district['candidates']:
        nm = next((n for n in sorted(names, key=len, reverse=True) if c['raw'].startswith(n)), None)
        if nm:
            c['name'], c['party'] = nm, c['raw'][len(nm):].strip() or None
        else:
            c['name'], c['party'] = c['raw'], None
        c.pop('raw', None)


def parse_hoc(xml_bytes):
    """House of Commons members today -> {district name: {'name', 'caucus', 'since'}}."""
    root = ET.fromstring(xml_bytes)
    out = {}
    for m in root.iter('MemberOfParliament'):
        g = lambda tag: (m.findtext(tag) or '').strip()   # noqa: E731
        if g('ConstituencyProvinceTerritoryName') != 'Alberta':
            continue
        out[g('ConstituencyName')] = {'name': f"{g('PersonOfficialFirstName')} {g('PersonOfficialLastName')}".strip(),
                                      'caucus': g('CaucusShortName'), 'since': g('FromDateTime')[:10] or None}
    return out


def _norm(s):
    return re.sub(r'[\s–—-]+', ' ', (s or '').lower()).strip()


def fed_shapes():
    """The 2025 federal districts touching Calgary (Elections Canada KMZ) -> {code: {'name', 'geometry'}}."""
    z = zipfile.ZipFile(io.BytesIO(_get(EC_FED, timeout=600)))
    kmz = next(n for n in z.namelist() if n.lower().endswith(('.kmz', '.kml')))
    data = z.read(kmz)
    if kmz.lower().endswith('.kmz'):
        inner = zipfile.ZipFile(io.BytesIO(data))
        data = inner.read(next(n for n in inner.namelist() if n.lower().endswith('.kml')))
    out = {}
    for _, el in ET.iterparse(io.BytesIO(data)):
        if not el.tag.endswith('Placemark'):
            continue
        props = {}
        for sd in el.iter():
            if sd.tag.endswith('SimpleData') or sd.tag.endswith('Data'):
                key = sd.get('name') or ''
                val = sd.text if sd.tag.endswith('SimpleData') else (sd.findtext('{*}value') or '')
                props[key.upper()] = (val or '').strip()
        name = next((c.text for c in el if c.tag.endswith('name')), '') or ''
        code = props.get('FEDNUM') or props.get('FED_NUM') or props.get('FEDUID') or ''
        polys = []
        for poly in el.iter():
            if not poly.tag.endswith('Polygon'):
                continue
            rings = []
            for ring in poly.iter():
                if ring.tag.endswith('coordinates') and ring.text:
                    pts = [tuple(map(float, p.split(',')[:2])) for p in ring.text.split()]
                    rings.append([list(p) for p in pts])
            if rings:
                polys.append(rings)
        el.clear()
        if not polys:
            continue
        xs = [p[0] for poly in polys for p in poly[0]]
        ys = [p[1] for poly in polys for p in poly[0]]
        if max(xs) < BOX[0] or min(xs) > BOX[2] or max(ys) < BOX[1] or min(ys) > BOX[3]:
            continue
        out[str(code)[:5] or name] = {'name': props.get('ED_NAMEE') or props.get('FEDENAME') or name,
                                     'geometry': {'type': 'MultiPolygon', 'coordinates': polys}}
    return out


def federal():
    eds = parse_ec_tables(_get(EC_T11), _get(EC_T12))
    eds = {k: v for k, v in eds.items() if v['name'].startswith('Calgary')}
    for code, d in eds.items():
        try:
            head = next(csv.reader(io.StringIO(_get(EC_POLL.format(code=code)).decode('utf-8-sig', 'replace'))))
        except Exception:                             # noqa: BLE001
            head = []
        split_names(d, head)
        d.update(_race(d['candidates'], d.get('valid')))
    out = {'date': DATES['federal'], 'general': {d['name']: d for d in eds.values()}, 'members': {},
           'sources': [{'name': 'Elections Canada, 45th General Election official voting results', 'url': EC_BASE + 'table1E.html'},
                       {'name': 'House of Commons, current Members of Parliament', 'url': 'https://www.ourcommons.ca/members/en'}]}
    try:
        hoc = parse_hoc(_get(HOC))
        out['members'] = {n: hoc[k] for n in out['general'] for k in hoc if _norm(k) == _norm(n)}
    except Exception as e:                            # noqa: BLE001
        print('elections: House of Commons list not read:', e)
    return out


# ------------------------------------------------------------------------------------------------- ridings and communities
def riding_shares(comm_shapes, ridings):
    """{community: {riding name: share of its area}} (shares under 1% dropped, the rest scaled to add up to 1)."""
    shapes = {r['name']: geo.Shape(r['geometry'], r['name']) for r in ridings.values() if r.get('geometry')}
    out = {}
    for code, g in comm_shapes.items():
        s = geo.area_shares(geo.Shape(g), shapes, samples=30)
        s = {k: v for k, v in s.items() if v >= 0.01}
        tot = sum(s.values())
        if tot:
            out[code] = {k: round(v / tot, 3) for k, v in s.items()}
    return out


def communities():
    rows = cd.query(COMMUNITIES, select='comm_code,multipolygon', limit=5000)
    return {r['comm_code']: r['multipolygon'] for r in rows if r.get('comm_code') and r.get('multipolygon')}


# ------------------------------------------------------------------------------------------------- build / load
def build(cache_dir=None):
    started = time.time()
    out = {'version': VERSION, 'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
           'dates': DATES, 'errors': {}}
    for key, f in (('municipal', municipal), ('provincial', provincial), ('federal', federal)):
        try:
            out[key] = f()
        except Exception as e:                        # noqa: BLE001 - one level missing never stops the others
            out[key] = None
            out['errors'][key] = repr(e)[:300]
            print('elections:', key, 'not read:', e)
    try:
        comms = communities()
        if out.get('provincial'):
            out['provincial']['community_shares'] = riding_shares(comms, ped_shapes())
        if out.get('federal'):
            out['federal']['community_shares'] = riding_shares(comms, fed_shapes())
    except Exception as e:                            # noqa: BLE001
        out['errors']['ridings'] = repr(e)[:300]
        print('elections: riding outlines not read:', e)
    out['seconds'] = round(time.time() - started, 1)
    return out


def _write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    os.replace(tmp, path)


def load(cache_dir, force=False, can_build=None):
    """This week's copy: worked out here on the website build (it reads Excel files, so openpyxl is needed), or else
    the copy the website published. None when neither can be had."""
    path = os.path.join(cache_dir or '.', 'elections', 'base.json')
    if os.path.exists(path) and not force and time.time() - os.path.getmtime(path) < KEEP_DAYS * 86400:
        with open(path, encoding='utf-8') as f:
            kept = json.load(f)
        if kept.get('version') == VERSION:
            return kept
    if can_build is None:
        try:
            import openpyxl  # noqa: F401, PLC0415
            can_build = True
        except ImportError:
            can_build = False
    try:
        base = build(cache_dir) if can_build else json.loads(_text(_get(SITE + 'data/elections.json')))
        if base.get('version') == VERSION:
            _write(path, base)
        return base
    except Exception:                                 # noqa: BLE001
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        return None


# ------------------------------------------------------------------------------------------------- the view
def _ward_mix(shares, codes, pops):
    """Residents of the given communities split over ridings: [{'riding', 'share', 'residents'}], largest first."""
    tot, by = 0.0, {}
    for c in codes:
        p = float(pops.get(c) or 0)
        if not p:
            continue
        for r, s in (shares.get(c) or {}).items():
            by[r] = by.get(r, 0) + p * s
        tot += p
    return sorted([{'riding': r, 'share': round(v / tot, 3), 'residents': round(v)} for r, v in by.items()
                   if tot and v / tot >= 0.005], key=lambda x: -x['share'])


def _rep(race, member):
    """The person elected at the last general election and the person sitting today (they can differ)."""
    if not race:
        return None
    win = next((c for c in race.get('candidates', []) if c.get('elected')), None)
    out = {'elected': win and {k: win.get(k) for k in ('name', 'party', 'votes', 'share')},
           'margin_share': race.get('margin_share'), 'turnout': race.get('turnout'), 'total': race.get('total')}
    if member:
        out['member'] = member
        out['changed'] = bool(win) and _norm(member.get('name')) != _norm(win.get('name'))
    return out


def view(base, ward, codes, pops):
    """Who represents a ward (or Calgary, ward 0) at each level, with the last results, for the dashboard tile and the
    Elections tab. codes: the communities of the ward; pops: {community: residents} (the count chosen in Settings)."""
    if not base:
        return None
    out = {'version': base.get('version'), 'built_at': base.get('built_at'), 'dates': base.get('dates'),
           'errors': base.get('errors') or {}}
    m = base.get('municipal')
    if m:
        out['municipal'] = {'mayor': _rep(m.get('mayor'), None), 'turnout': m.get('turnout'), 'date': m.get('date')}
        if ward:
            out['municipal']['councillor'] = _rep((m.get('councillors') or {}).get(str(ward)), None)
            for key in ('public_trustees', 'separate_trustees'):
                race = next((r for r in m.get(key) or [] if ward in (r.get('wards') or [])), None)
                out['municipal'][key[:-1]] = race and dict(_rep(race, None), title=race.get('title'))
            out['municipal']['mayor_in_ward'] = ((m.get('mayor_by_ward') or {}).get('by_ward') or {}).get(str(ward))
    for level in ('provincial', 'federal'):
        b = base.get(level)
        if not b:
            continue
        mix = _ward_mix(b.get('community_shares') or {}, codes, pops)
        reps = []
        for x in mix:
            race = (b.get('general') or {}).get(x['riding'])
            r = _rep(race, (b.get('members') or {}).get(x['riding']))
            reps.append(dict(x, **(r or {})))
        out[level] = {'date': b.get('date'), 'ridings': reps, 'next_election': b.get('next_election')}
        if level == 'provincial':
            out[level]['byelections'] = [e for e in b.get('byelections') or [] if e['ed'] in {x['riding'] for x in mix}]
    return out
