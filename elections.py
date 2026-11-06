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

VERSION = 2          # 2: voting-station and poll-by-poll results, community demographics (Election Analytics)
KEEP_DAYS = 7
SITE = 'https://calgaryinsight.ca/'
UA = {'User-Agent': 'CalgaryInsight/1.0 (civic data dashboard)'}

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
AB_BYE_PAGE = AB_RESULTS + 'orResultsED2026BE.cfm?EventId={event}&ED={ed}'
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
# renamed since the 2019 boundaries were drawn (the Government of Alberta's outline layer keeps the 2019 name)
RENAMED = {'Calgary-McCall': 'Calgary-Bhullar-McCall'}


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


def councillor_stations(rows):
    """Station rows (Councillor) -> {ward: [{'station', 'type', 'total', 'leading', 'shares': {candidate: share}}]},
    largest first. Advance stations take votes from several wards; each ward's race is counted at each of them."""
    by = {}
    for r in rows:
        w = _wards_in(r.get('officetype'))
        if not w:
            continue
        key = (str(w[0]), (r.get('votingstation') or '').strip(), (r.get('votingstationtype') or '').strip())
        by.setdefault(key, {})
        name = person(r.get('candidatename'))
        by[key][name] = by[key].get(name, 0) + (_int(r.get('votes')) or 0)
    out = {}
    for (w, st, typ), c in by.items():
        tot = sum(c.values())
        if not tot:
            continue
        lead = max(c, key=c.get)
        out.setdefault(w, []).append({'station': st.title() if st.isupper() else st, 'type': typ, 'total': tot,
                                      'leading': lead, 'shares': {k: round(v / tot, 4) for k, v in c.items()}})
    for w in out:
        out[w].sort(key=lambda x: -x['total'])
    return out


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
    try:
        crows = cd.query(CITY_STATIONS, select='officetype,votingstation,votingstationtype,candidatename,sum(votes) as votes',
                         where="officecategory='Councillor'", group='officetype,votingstation,votingstationtype,candidatename',
                         limit=20000)
        out['councillor_stations'] = councillor_stations(crows)
    except Exception as e:                            # noqa: BLE001
        print('elections: councillor stations not read:', e)
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


def parse_sov_stations(rows):
    """Each voting location of a division's Statement of Vote sheet: name, type, voting areas, electors on the list,
    ballots, turnout and each party's votes (parties in the header's order)."""
    head = [str(c).strip() if c is not None else '' for c in rows[0]]
    try:
        a, b = head.index('Voting Areas Assigned') + 1, head.index('Names on List')
    except ValueError:
        return None
    cols = [(i, _cand_header(head[i])) for i in range(a, b) if head[i]]
    col = {h: i for i, h in enumerate(head)}
    out = []
    for r in rows[1:]:
        if not r or not r[0] or (isinstance(r[0], str) and r[0].startswith('Total')) or any(
                isinstance(c, str) and c.startswith('Total (All') for c in r[:3]):
            continue
        votes = [_int(r[i]) or 0 for i, _ in cols]
        el, bal = _int(r[col['Names on List']]), _int(r[col['Total Ballots Cast']])
        name = r[1] if len(r) > 1 and r[1] else ''
        out.append({'loc': str(r[0]).strip(), 'name': str(name).strip(), 'type': str(r[2] or '').strip(),
                    'areas': str(r[3] or '').strip(), 'electors': el, 'ballots': bal,
                    'turnout': round(bal / el, 4) if el and bal else None, 'votes': votes})
    return {'parties': [p or n for n, p in (c for _, c in cols)], 'names': [n for _, (n, _p) in cols], 'stations': out}


def ped_names():
    """{'01': 'Calgary-Acadia', ...} for the 2019 boundaries (Government of Alberta)."""
    q = AB_PED + '?' + urllib.parse.urlencode({'where': '1=1', 'outFields': 'EDNUMBER,EDNAME', 'returnGeometry': 'false',
                                                'f': 'json'})
    d = json.loads(_text(_get(q)))
    return {str(f['attributes']['EDNUMBER']).zfill(2): RENAMED.get(f['attributes']['EDNAME'], f['attributes']['EDNAME'])
            for f in d.get('features', [])}


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
        out[str(p.get('EDNUMBER')).zfill(2)] = {'name': RENAMED.get(p.get('EDNAME'), p.get('EDNAME')), 'geometry': g}
    return out


def parse_mlas(page_html):
    """The Assembly's member table -> {'Calgary-Acadia': {'name': 'Diana Batten', 'caucus': 'NDP'}} (sitting members
    only: a former member's row has no caucus)."""
    out = {}
    for row in re.findall(r'(?s)<tr>(.*?)</tr>', page_html):
        alt = re.search(r'alt="([^"]+)"', row)
        cells = [_strip(c) for c in re.findall(r'(?s)<td[^>]*>(.*?)</td>', row)]
        if not alt or len(cells) < 4:
            continue
        caucus, ed = cells[2], cells[3]
        href = re.search(r'href="([^"]*member-information[^"]*)"', row)
        if ed.startswith('Calgary') and caucus:
            out[ed] = {'name': html.unescape(alt.group(1)).strip(), 'caucus': {'UC': 'UCP'}.get(caucus, caucus),
                       'url': ('https://www.assembly.ab.ca' + html.unescape(href.group(1))) if href else None}
    return out


AB_SEATS = 87
COMMONS_SEATS = 343


def parse_assembly(page_html):
    """The whole Legislative Assembly by caucus (sitting members; a seat with no sitting member is vacant)."""
    by = {}
    for row in re.findall(r'(?s)<tr>(.*?)</tr>', page_html):
        cells = [_strip(c) for c in re.findall(r'(?s)<td[^>]*>(.*?)</td>', row)]
        if len(cells) >= 4 and cells[2] and cells[3] and re.search(r'alt="', row):
            k = {'UC': 'UCP'}.get(cells[2], cells[2])
            by[k] = by.get(k, 0) + 1
    n = sum(by.values())
    return {'seats': AB_SEATS, 'by_caucus': by, 'vacant': max(AB_SEATS - n, 0)} if n else None


def _date(label):
    try:
        return dt.datetime.strptime(re.sub(r'^.*?([A-Z][a-z]+ \d{1,2}, \d{4}).*$', r'\1', label), '%B %d, %Y').date().isoformat()
    except ValueError:
        return None


def parse_bye(page_html):
    """A by-election division page (Elections Alberta) -> candidates, electors, ballots and turnout. The header row
    names the candidates ('Kyle Campbell NDP') between 'Number of Electors' and 'Valid Ballots Cast'; the row starting
    'Total Valid Vote' holds the totals (electors, then each candidate's 'votes share', valid ballots ... turnout)."""
    rows = [[_strip(c) for c in re.findall(r'(?s)<t[dh][^>]*>(.*?)</t[dh]>', r)]
            for r in re.findall(r'(?s)<tr[^>]*>(.*?)</tr>', page_html)]
    head = next((r for r in rows if 'Number of Electors' in r and 'Valid Ballots Cast' in r), None)
    total = next((r for r in rows if r and r[0].lower().startswith('total valid vote')), None)
    if not head or not total:
        return None
    a, b = head.index('Number of Electors') + 1, head.index('Valid Ballots Cast')
    cands = []
    for k, h in enumerate(head[a:b]):
        words = h.split()
        party = words[-1] if len(words) > 1 and words[-1].isupper() else None
        name = ' '.join(words[:-1]) if party else h
        cands.append({'name': name, 'party': party, 'votes': _int((total[2 + k] or '').split()[0]) or 0})
    race = _race(cands)
    rest = total[2 + len(cands):]
    electors, valid = _int(total[1]), _int(rest[0]) if rest else None
    # ballots cast = valid + declined + rejected (spoiled ballots are replaced, so not counted), as Elections Alberta
    ballots = (_int(rest[0]) or 0) + (_int(rest[2]) or 0) + (_int(rest[3]) or 0) if len(rest) >= 4 else None
    turn = re.match(r'([\d.]+)\s*%', rest[-1]) if rest else None
    race.update({'electors': electors, 'valid': valid, 'ballots': ballots,
                 'turnout': round(float(turn.group(1)) / 100, 4) if turn else None})
    return race


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
    by_ed = {}
    upper = {n.upper(): n for n in names.values()}
    for r in rows[hi + 1:]:
        if not r or not re.fullmatch(r'\d{1,2}', str(r[0] or '').strip()):
            continue
        name = upper.get(str(r[1] or '').strip().upper())
        if not name or not name.startswith('Calgary'):
            continue
        votes = [_int(r[i]) or 0 for i in opt_cols]
        tot = sum(votes)
        turn = r[t_col]
        by_ed[name] = {'electors': _int(r[e_col]), 'votes': votes,
                       'shares': [round(v / tot, 4) if tot else None for v in votes],
                       'turnout': round(float(turn) / 100, 4) if turn not in (None, '') else None}
    total = next((r for r in rows if str(r[0] or '').strip().lower().startswith('total')), None)
    alberta = None
    if total:
        votes = [_int(total[i]) or 0 for i in opt_cols]
        alberta = {'electors': _int(total[e_col]), 'votes': votes,
                   'shares': [round(v / sum(votes), 4) if sum(votes) else None for v in votes],
                   'turnout': round(float(total[t_col]) / 100, 4) if total[t_col] not in (None, '') else None}
    calg = [v for v in by_ed.values()]
    cv = [sum(v['votes'][i] for v in calg) for i in range(len(opt_cols))]
    ce = sum(v['electors'] or 0 for v in calg)
    calgary = {'electors': ce, 'votes': cv, 'shares': [round(v / sum(cv), 4) if sum(cv) else None for v in cv],
               'turnout': None, 'divisions': len(calg)}
    return {'question': question, 'options': options or [head[i] for i in opt_cols],
            'option_columns': [head[i] for i in opt_cols], 'by_ed': by_ed, 'calgary': calgary, 'alberta': alberta}


def provincial():
    import openpyxl                                   # noqa: PLC0415
    names = ped_names()
    wb = openpyxl.load_workbook(io.BytesIO(_get(AB_SOV, timeout=300)), read_only=True, data_only=True)
    eds = {}
    for num, name in sorted(names.items()):
        if not name.startswith('Calgary') or num not in wb.sheetnames:
            continue
        sheet = [list(r) for r in wb[num].iter_rows(values_only=True)]
        race = parse_sov_sheet(sheet)
        if race:
            race.update({'number': num, 'name': name})
            try:
                race['stations'] = parse_sov_stations(sheet)
            except Exception as e:                    # noqa: BLE001
                print('elections: stations not read for', name, e)
            eds[name] = race
    out = {'date': DATES['provincial'], 'boundaries': 2019, 'general': eds, 'byelections': [], 'members': {},
           'referendum': None, 'next_election': AB_NEXT_DAY,
           'sources': [{'name': 'Elections Alberta, 2023 Provincial General Election Statement of Vote', 'url': AB_SOV_PAGE},
                       {'name': 'Elections Alberta, official results', 'url': AB_RESULTS},
                       {'name': 'Legislative Assembly of Alberta, Members of the Legislative Assembly', 'url': AB_MLAS}]}
    try:
        page = _text(_get(AB_MLAS))
        out['members'] = {k: v for k, v in parse_mlas(page).items() if k in eds}
        out['chamber'] = parse_assembly(page)
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
                num = next((k for k, v in names.items() if v == ed), None)
                url = AB_BYE_PAGE.format(event=ev, ed=num)
                race = None
                try:
                    race = parse_bye(_text(_get(url)))
                except Exception as e:                # noqa: BLE001
                    print('elections: by-election results not read:', ed, e)
                out['byelections'].append({'event': ev, 'label': label, 'ed': ed, 'date': _date(label),
                                           'url': url, 'race': race})
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


def parse_ec_polls(raw):
    """A poll-by-poll file -> {'names': [...candidates in file order], 'polls': [[number, electors, votes cast, rejected,
    [votes...]], ...], 'groups': [...]} where groups are the advance, special-ballot and mail-in totals (no poll number)."""
    rows = list(csv.reader(io.StringIO(raw.decode('utf-8-sig', 'replace'))))
    head = rows[0]
    names = [h.strip() for h in head[4:] if h and '/' not in h]
    n = len(names)
    polls, groups = [], []
    for r in rows[1:]:
        if len(r) < 4 + n + 2:
            continue
        votes = [_int(x) or 0 for x in r[4:4 + n]]
        rej, tot = _int(r[4 + n]) or 0, _int(r[5 + n]) or 0
        el = _int(r[6 + n]) if len(r) > 6 + n else None
        num = (r[2] or '').strip()
        if num:
            polls.append([num, el, tot, rej, votes])
        else:
            groups.append([(r[3] or '').split('/')[0].strip(), el, tot, rej, votes])
    return {'names': names, 'polls': polls, 'groups': groups}


def parse_hoc(xml_bytes):
    """House of Commons members today -> {district name: {'name', 'caucus', 'since'}}."""
    root = ET.fromstring(xml_bytes)
    out = {}
    for m in root.iter('MemberOfParliament'):
        g = lambda tag: (m.findtext(tag) or '').strip()   # noqa: E731
        if g('ConstituencyProvinceTerritoryName') != 'Alberta':
            continue
        out[g('ConstituencyName')] = {'name': f"{g('PersonOfficialFirstName')} {g('PersonOfficialLastName')}".strip(),
                                      'caucus': g('CaucusShortName'), 'since': g('FromDateTime')[:10] or None,
                                      'url': f"https://www.ourcommons.ca/members/en/{g('PersonId')}" if g('PersonId') else None}
    return out


def parse_commons(xml_bytes):
    """The whole House of Commons by caucus."""
    by = {}
    for m in ET.fromstring(xml_bytes).iter('MemberOfParliament'):
        k = (m.findtext('CaucusShortName') or '').strip() or 'Unknown'
        by[k] = by.get(k, 0) + 1
    n = sum(by.values())
    return {'seats': COMMONS_SEATS, 'by_caucus': by, 'vacant': max(COMMONS_SEATS - n, 0)} if n else None


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
            raw = _get(EC_POLL.format(code=code))
            head = next(csv.reader(io.StringIO(raw.decode('utf-8-sig', 'replace'))))
        except Exception:                             # noqa: BLE001
            raw, head = None, []
        split_names(d, head)
        if raw:
            try:
                pp = parse_ec_polls(raw)
                party = {c.get('name'): c.get('party') for c in d['candidates']}
                pp['parties'] = [party.get(nm) or nm for nm in pp['names']]
                d['polls'] = pp
            except Exception as e:                    # noqa: BLE001
                print('elections: polls not read for', code, e)
        d.update(_race(d['candidates'], d.get('valid')))
    out = {'date': DATES['federal'], 'general': {d['name']: d for d in eds.values()}, 'members': {},
           'sources': [{'name': 'Elections Canada, 45th General Election official voting results', 'url': EC_BASE + 'table1E.html'},
                       {'name': 'House of Commons, current Members of Parliament', 'url': 'https://www.ourcommons.ca/members/en'}]}
    try:
        raw = _get(HOC)
        hoc = parse_hoc(raw)
        out['members'] = {n: hoc[k] for n in out['general'] for k in hoc if _norm(k) == _norm(n)}
        out['chamber'] = parse_commons(raw)
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


# ------------------------------------------------------------------------------------------------- who lives where
CENSUS_COMM = {'age': 'f9wk-wej9', 'households': 'msjx-5ygv', 'work': 'isek-k4ja'}
AGE_BANDS = ['0_to_4', '5_to_9', '10_to_14', '15_to_19', '20_to_24', '25_to_29', '30_to_34', '35_to_39', '40_to_44',
             '45_to_49', '50_to_54', '55_to_59', '60_to_64', '65_to_69', '70_to_74', '75_to_79', '80_to_84', '85_to_89',
             '90_to_94', '95_to_99', '100_and_over']
HH_KEEP = ('total_private_households', 'avg_household_size', 'house_size_1_person', 'house_size_5_plus_persons',
           'total_census_families', 'married_with_children', 'commonlaw_with_children', 'one_parent_families',
           'mstatus_total_over_15', 'mstatus_never_married', 'mstatus_married_commonlaw', 'mstatus_widowed')
WORK_KEEP = ('total_pop_over_15_household', 'in_labour_force', 'employed', 'self_employed', 'unemployed',
             'labour_participation_rate', 'unemployment_rate_per', 'top_1_industry', 'top_1_industry_per',
             'top_2_industry', 'top_2_industry_per', 'top_3_industry', 'top_3_industry_per', 'top_1_occupation',
             'top_1_occupation_per', 'top_2_occupation', 'top_2_occupation_per')


def _num(v):
    try:
        return float(v) if '.' in str(v) else int(v)
    except (TypeError, ValueError):
        return v


def demographics():
    """2021 Census by community (City of Calgary open data): age in 5-year bands for men and women, households and
    families, and work. {community code: {...}}."""
    out = {}
    for r in cd.query(CENSUS_COMM['age'], limit=5000):
        c = r.get('community_code')
        if not c:
            continue
        out[c] = {'name': r.get('community_name'), 'pop': _num(r.get('total_pop_household')),
                  'men': [_num(r.get('pop_men_' + b)) or 0 for b in AGE_BANDS],
                  'women': [_num(r.get('pop_women_' + b)) or 0 for b in AGE_BANDS],
                  'all': [_num(r.get('pop_age_' + b)) or 0 for b in AGE_BANDS]}
    for key, keep in (('households', HH_KEEP), ('work', WORK_KEEP)):
        try:
            for r in cd.query(CENSUS_COMM[key], limit=5000):
                c = r.get('community_code')
                if c in out:
                    out[c][key] = {k: _num(r.get(k)) for k in keep if r.get(k) not in (None, '')}
        except Exception as e:                        # noqa: BLE001
            print('elections: census', key, 'not read:', e)
    return {'year': 2021, 'bands': AGE_BANDS, 'communities': out,
            'sources': [{'name': '2021 Federal Census by Community (City of Calgary open data)', 'ids': list(CENSUS_COMM.values())}]}


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
    try:
        out['demographics'] = demographics()
    except Exception as e:                            # noqa: BLE001
        out['errors']['demographics'] = repr(e)[:300]
        print('elections: census by community not read:', e)
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
           'margin_share': race.get('margin_share'), 'turnout': race.get('turnout'), 'total': race.get('total'),
           'acclaimed': bool(race.get('acclaimed'))}
    if member:
        out['member'] = member
        last = lambda n: _norm(n).split(' ')[-1] if n else ''   # noqa: E731 - 'Shuv' and 'Shuvaloy' are one person
        out['changed'] = bool(win) and last(member.get('name')) != last(win.get('name'))
    return out


def _electors_rate(general):
    """Federal electors per resident of each district (Elections Canada: electors on the list / the district's 2021
    Census population): the share of residents who are electors (adult citizens on the list)."""
    return {n: r['electors'] / r['population'] for n, r in (general or {}).items()
            if r.get('electors') and r.get('population')}


def _mix_value(mix, values):
    """A residents-weighted mean over the divisions or districts of a mix ({name: value})."""
    num = sum(x['share'] * values[x['riding']] for x in mix if values.get(x['riding']) is not None)
    den = sum(x['share'] for x in mix if values.get(x['riding']) is not None)
    return num / den if den else None


def constituency(base, ward, codes, pops, ward_of):
    """Figures for a ward's campaign view, all from published results (estimates are marked as such):
    estimated electors and municipal turnout, the councillor race, the mayor's vote in the ward against Calgary's, the
    turnout of the overlapping provincial and federal areas, and the 2026 referendum there."""
    m, p, f = base.get('municipal') or {}, base.get('provincial') or {}, base.get('federal') or {}
    out = {}
    rate = _electors_rate(f.get('general'))
    fsh = f.get('community_shares') or {}
    if rate and fsh and ward_of:
        def electors(cs):
            return sum(float(pops.get(c) or 0) * sum(s * rate.get(d, 0) for d, s in (fsh.get(c) or {}).items()) for c in cs)
        allc = [c for c in pops if ward_of.get(c)]
        calg = electors(allc)
        reg = (m.get('turnout') or {}).get('electors')
        scale = reg / calg if reg and calg else 1.0         # matched to the City's own electors register
        by_ward = {}
        for w in range(1, 15):
            cs = [c for c in allc if ward_of.get(c) == w]
            e = electors(cs) * scale
            race = (m.get('councillors') or {}).get(str(w)) or {}
            by_ward[str(w)] = {'electors_est': round(e), 'votes': race.get('total'),
                               'turnout_est': round(race['total'] / e, 4) if e and race.get('total') else None}
        out['wards'] = by_ward
        out['electors_note'] = ('Estimated: each community\'s residents x the share of residents on the federal electors '
                                'list in its electoral district (Elections Canada 2025), scaled so Calgary adds up to the '
                                'City\'s electors register (896,042). Turnout = votes cast in the ward\'s councillor race / '
                                'that estimate.')
    if ward:
        race = (m.get('councillors') or {}).get(str(ward))
        if race:
            c = race['candidates']
            inc = next((x for x in c if x.get('incumbent')), None)
            out['councillor_race'] = {
                'candidates': len(c), 'total': race.get('total'), 'winner_share': c[0].get('share') if c else None,
                'margin': race.get('margin'), 'margin_share': race.get('margin_share'),
                'incumbent': inc and {'name': inc['name'], 'elected': inc.get('elected'), 'share': inc.get('share')},
                'top2_share': round(sum(x.get('share') or 0 for x in c[:2]), 4)}
        mw = ((m.get('mayor_by_ward') or {}).get('by_ward') or {}).get(str(ward))
        city = {x['name']: x.get('share') for x in (m.get('mayor') or {}).get('candidates', [])}
        if mw:
            out['mayor_vs_city'] = [{'name': x['name'], 'ward': x['share'], 'calgary': city.get(x['name']),
                                     'diff': round(x['share'] - city[x['name']], 4) if city.get(x['name']) is not None else None}
                                    for x in mw['candidates'][:6]]
        out['stations'] = (m.get('councillor_stations') or {}).get(str(ward), [])[:40]
    for level, b in (('provincial', p), ('federal', f)):
        mix = _ward_mix(b.get('community_shares') or {}, codes, pops)
        if not mix:
            continue
        gen = b.get('general') or {}
        out[level + '_turnout'] = _mix_value(mix, {n: r.get('turnout') for n, r in gen.items()})
        out[level + '_closest'] = min(({'name': x['riding'], 'margin_share': (gen.get(x['riding']) or {}).get('margin_share')}
                                       for x in mix if (gen.get(x['riding']) or {}).get('margin_share') is not None),
                                      key=lambda y: y['margin_share'], default=None)
        if level == 'provincial' and (b.get('referendum') or {}).get('questions'):
            qs = []
            for q in b['referendum']['questions']:
                sh = [_mix_value(mix, {n: v['shares'][i] for n, v in q['by_ed'].items()}) for i in range(len(q['option_columns']))]
                qs.append({'number': q['number'], 'question': q.get('question'), 'options': q['option_columns'],
                           'area': [round(x, 4) if x is not None else None for x in sh],
                           'calgary': q['calgary']['shares'], 'alberta': (q.get('alberta') or {}).get('shares'),
                           'turnout': _mix_value(mix, {n: v.get('turnout') for n, v in q['by_ed'].items()})})
            out['referendum'] = qs
    return out


def ward_splits(base, pops, ward_of):
    """Every ward's residents split over provincial electoral divisions and federal electoral districts."""
    out = {}
    for w in range(1, 15):
        cs = [c for c in pops if ward_of.get(c) == w]
        out[str(w)] = {lvl: [{k: x[k] for k in ('riding', 'share', 'residents')}
                             for x in _ward_mix((base.get(lvl) or {}).get('community_shares') or {}, cs, pops)]
                       for lvl in ('provincial', 'federal')}
    return out


def view(base, ward, codes, pops, ward_of=None, method=None):
    """Who represents a ward (or Calgary, ward 0) at each level, with the last results, for the Dashboard card and the
    Election Data Centre. codes: the communities of the ward (every lived-in one for Calgary); pops: {community:
    residents} for every community (the count chosen in Settings); ward_of: {community: ward}."""
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
        byes = {e['ed']: e for e in sorted(b.get('byelections') or [], key=lambda e: e.get('date') or '') if e.get('race')}
        for x in mix:
            bye = byes.get(x['riding'])            # a by-election since the general election is the latest result
            race = bye['race'] if bye else (b.get('general') or {}).get(x['riding'])
            r = _rep(race, (b.get('members') or {}).get(x['riding']))
            reps.append(dict(x, **(r or {}), last_election=(bye or {}).get('date') or b.get('date'),
                             by_election=bool(bye)))
        out[level] = {'date': b.get('date'), 'ridings': reps, 'next_election': b.get('next_election'),
                      'chamber': b.get('chamber')}
        if level == 'provincial':
            out[level]['byelections'] = [e for e in b.get('byelections') or [] if e['ed'] in {x['riding'] for x in mix}]
    if ward_of:
        out['ward_splits'] = ward_splits(base, pops, ward_of)
    out['constituency'] = constituency(base, ward, codes, pops, ward_of)
    try:
        out['micro'] = micro(base, ward, codes, pops, method)
    except Exception as e:                            # noqa: BLE001 - analytics never take the rest down
        out['micro'] = {'error': repr(e)[:200]}
    try:
        out['areas'] = areas(base, ward, codes, pops, ward_of, method)
    except Exception as e:                            # noqa: BLE001
        out['areas'] = {'error': repr(e)[:200]}
    return out


# ------------------------------------------------------------------------------------------------- Election Analytics
def _pct(a, b):
    return round(a / b, 4) if a and b else (0.0 if b else None)


def _lead(parties, votes):
    tot = sum(votes)
    if not tot:
        return None, None, None, None
    order = sorted(range(len(votes)), key=lambda i: -votes[i])
    a = order[0]
    b = order[1] if len(order) > 1 else None
    return parties[a], round(votes[a] / tot, 4), parties[b] if b is not None else None, \
        round((votes[a] - (votes[b] if b is not None else 0)) / tot, 4)


def _median(xs):
    xs = sorted(x for x in xs if x is not None)
    if not xs:
        return None
    m = len(xs) // 2
    return xs[m] if len(xs) % 2 else round((xs[m - 1] + xs[m]) / 2, 4)


def _bands(xs, edges=(0.2, 0.3, 0.4, 0.5, 0.6, 0.7)):
    labels = [f'under {int(edges[0] * 100)}%'] + [f'{int(a * 100)}-{int(b * 100)}%' for a, b in zip(edges, edges[1:])] + [f'{int(edges[-1] * 100)}%+']
    counts = [0] * len(labels)
    for x in xs:
        if x is None:
            continue
        i = sum(1 for e in edges if x >= e)
        counts[i] += 1
    return {'labels': labels, 'counts': counts}


def _who(demo, codes, pops, method=None, weights=None):
    """Census 2021 by community for the area: age by 5-year band (men, women), households and work, and a row per
    community."""
    comms = (demo or {}).get('communities') or {}
    bands = (demo or {}).get('bands') or AGE_BANDS
    n = len(bands)
    men, women, allp = [0] * n, [0] * n, [0] * n
    hh, wk, rows = {}, {}, []
    tot_now = sum(float(pops.get(c) or 0) for c in codes)
    occ, ind = {}, {}
    p21_tot, not_counted = 0, 0
    for c in codes:
        d = comms.get(c)
        now = float(pops.get(c) or 0)
        if not d or not sum(d['all']):
            not_counted += now                       # built since 2021: no Census profile yet
            continue
        # each community's 2021 profile scaled to its residents today, counted the way chosen in Settings: the mix of
        # ages, households and work is the Census's, the numbers follow today's count
        f = now / sum(d['all']) if sum(d['all']) else 0
        p21_tot += sum(d['all']) * ((weights or {}).get(c, 1.0))
        for i in range(n):
            men[i] += (d['men'][i] if i < len(d['men']) else 0) * f
            women[i] += (d['women'][i] if i < len(d['women']) else 0) * f
            allp[i] += (d['all'][i] if i < len(d['all']) else 0) * f
        for k, v in (d.get('households') or {}).items():
            if isinstance(v, (int, float)) and k != 'avg_household_size':
                hh[k] = hh.get(k, 0) + v * f
        w = d.get('work') or {}
        for k in ('total_pop_over_15_household', 'in_labour_force', 'employed', 'self_employed', 'unemployed'):
            if isinstance(w.get(k), (int, float)):
                wk[k] = wk.get(k, 0) + w[k] * f
        for j in (1, 2, 3):
            nm, pc = w.get(f'top_{j}_occupation'), w.get(f'top_{j}_occupation_per')
            if nm and isinstance(pc, (int, float)) and isinstance(w.get('employed'), (int, float)):
                occ[nm] = occ.get(nm, 0) + pc / 100 * w['employed'] * f
            nm, pc = w.get(f'top_{j}_industry'), w.get(f'top_{j}_industry_per')
            if nm and isinstance(pc, (int, float)) and isinstance(w.get('employed'), (int, float)):
                ind[nm] = ind.get(nm, 0) + pc / 100 * w['employed'] * f
        a = d['all']
        p = sum(a) or d.get('pop') or 0
        h = d.get('households') or {}
        fam = h.get('total_census_families') or 0
        rows.append({'code': c, 'name': d.get('name'), 'census2021': d.get('pop'),
                     'residents': round(float(pops.get(c) or 0)), 'share': _pct(float(pops.get(c) or 0), tot_now),
                     'under20': _pct(sum(a[:4]), p), 'age20_64': _pct(sum(a[4:13]), p), 'age65': _pct(sum(a[13:]), p),
                     'avg_hh': h.get('avg_household_size'),
                     'families_kids': _pct((h.get('married_with_children') or 0) + (h.get('commonlaw_with_children') or 0)
                                           + (h.get('one_parent_families') or 0), fam),
                     'one_parent': _pct(h.get('one_parent_families') or 0, fam),
                     'participation': (w.get('labour_participation_rate')), 'unemployment': w.get('unemployment_rate_per'),
                     'top_occupation': w.get('top_1_occupation')})
    pop = sum(allp)
    fam = hh.get('total_census_families') or 0
    return {'year': 2021, 'method': method, 'population_now': round(tot_now), 'population_2021': round(p21_tot),
            'not_in_census': round(not_counted), 'scaled_to_today': True, 'bands': [b.replace('_to_', '-').replace('_and_over', '+') for b in bands],
            'men': [round(x) for x in men], 'women': [round(x) for x in women], 'all': [round(x) for x in allp],
            'population': round(pop),
            'under20': _pct(sum(allp[:4]), pop), 'age20_64': _pct(sum(allp[4:13]), pop), 'age65': _pct(sum(allp[13:]), pop),
            'adults20': round(sum(allp[4:])),
            'households': round(hh['total_private_households']) if hh.get('total_private_households') else None,
            'avg_hh': round(pop / hh['total_private_households'], 2) if hh.get('total_private_households') else None,
            'one_person_hh': _pct(hh.get('house_size_1_person') or 0, hh.get('total_private_households')),
            'big_hh': _pct(hh.get('house_size_5_plus_persons') or 0, hh.get('total_private_households')),
            'families_kids': _pct((hh.get('married_with_children') or 0) + (hh.get('commonlaw_with_children') or 0)
                                  + (hh.get('one_parent_families') or 0), fam),
            'one_parent': _pct(hh.get('one_parent_families') or 0, fam),
            'never_married': _pct(hh.get('mstatus_never_married') or 0, hh.get('mstatus_total_over_15')),
            'participation': _pct(wk.get('in_labour_force') or 0, wk.get('total_pop_over_15_household')),
            'unemployment': _pct(wk.get('unemployed') or 0, wk.get('in_labour_force')),
            'self_employed': _pct(wk.get('self_employed') or 0, wk.get('employed')),
            'top_occupations': [[k, round(v)] for k, v in sorted(occ.items(), key=lambda x: -x[1])[:5]],
            'top_industries': [[k, round(v)] for k, v in sorted(ind.items(), key=lambda x: -x[1])[:5]],
            'communities': sorted(rows, key=lambda r: -(r['residents'] or 0))}


def _prov_stations(race):
    st = (race or {}).get('stations') or {}
    parties = st.get('parties') or []
    out = []
    for x in st.get('stations') or []:
        lead, share, second, margin = _lead(parties, x.get('votes') or [])
        out.append({'loc': x['loc'], 'name': x['name'], 'type': x['type'], 'areas': x.get('areas'),
                    'electors': x.get('electors'), 'ballots': x.get('ballots'), 'turnout': x.get('turnout'),
                    'lead': lead, 'lead_share': share, 'second': second, 'margin': margin})
    day = [x for x in out if x['type'].lower().startswith('election day') and x['turnout'] is not None]
    other = [x for x in out if not x['type'].lower().startswith('election day')]
    tot_b = sum(x['ballots'] or 0 for x in out)
    by_type = {}
    for x in out:
        by_type[x['type'] or 'Other'] = by_type.get(x['type'] or 'Other', 0) + (x['ballots'] or 0)
    return {'parties': parties, 'stations': out,
            'summary': {'election_day_stations': len(day), 'turnout_median': _median([x['turnout'] for x in day]),
                        'turnout_low': min((x['turnout'] for x in day), default=None),
                        'turnout_high': max((x['turnout'] for x in day), default=None),
                        'ballots_by_type': {k: [v, _pct(v, tot_b)] for k, v in by_type.items()},
                        'stations_led': {p: sum(1 for x in day if x['lead'] == p) for p in parties if any(x['lead'] == p for x in day)},
                        'bands': _bands([x['turnout'] for x in day]), 'other_locations': len(other)}}


def _fed_polls(race):
    pp = (race or {}).get('polls') or {}
    parties = pp.get('parties') or pp.get('names') or []
    rows = []
    for num, el, tot, rej, votes in pp.get('polls') or []:
        lead, share, second, margin = _lead(parties, votes)
        rows.append({'poll': num, 'electors': el, 'ballots': tot, 'turnout': _pct(tot, el) if el else None,
                     'lead': lead, 'lead_share': share, 'margin': margin, 'votes': votes})
    # polls with electors and at least one vote (a poll merged with another or not held shows 0); a poll can pass 100%
    # when people register at the poll on election day
    with_el = [r for r in rows if r['turnout'] is not None and r['electors'] and r['ballots']]
    # Elections Canada numbers advance polls in the 600s, with no electors of their own
    adv = [r for r in rows if not r['electors'] and re.match(r'^6\d\d', str(r['poll']).strip())]
    day = [r for r in rows if r not in adv]
    day_votes = [sum(r['votes'][i] for r in day) for i in range(len(parties))]
    adv_votes = [sum(r['votes'][i] for r in adv) for i in range(len(parties))]
    grp_votes = [sum(g[4][i] for g in pp.get('groups') or []) for i in range(len(parties))]
    tot_day, tot_adv, tot_grp = sum(day_votes), sum(adv_votes), sum(grp_votes)
    allv = tot_day + tot_adv + tot_grp
    low = sorted(with_el, key=lambda r: r['turnout'])[:10]
    close = sorted([r for r in day if r['margin'] is not None and (r['ballots'] or 0) >= 50], key=lambda r: r['margin'])[:10]
    return {'parties': parties,
            'summary': {'polls': len(rows), 'polls_with_electors': len(with_el),
                        'turnout_median': _median([r['turnout'] for r in with_el]),
                        'turnout_low': low[0]['turnout'] if low else None,
                        'turnout_high': max((r['turnout'] for r in with_el), default=None),
                        'bands': _bands([r['turnout'] for r in with_el]),
                        'polls_led': {p: sum(1 for r in rows if r['lead'] == p) for p in parties if any(r['lead'] == p for r in rows)},
                        'advance_polls': len(adv),
                        'votes_by_way': {'election_day': tot_day, 'advance_polls': tot_adv, 'special_and_mail': tot_grp},
                        'part_by_way': {'election_day': _pct(tot_day, allv), 'advance_polls': _pct(tot_adv, allv),
                                        'special_and_mail': _pct(tot_grp, allv)},
                        'party_share_by_way': {p: {'election_day': _pct(day_votes[i], tot_day),
                                                   'advance_polls': _pct(adv_votes[i], tot_adv),
                                                   'special_and_mail': _pct(grp_votes[i], tot_grp)} for i, p in enumerate(parties)}},
            'lowest_turnout': [{k: r[k] for k in ('poll', 'electors', 'ballots', 'turnout', 'lead')} for r in low],
            'closest': [{k: r[k] for k in ('poll', 'ballots', 'lead', 'lead_share', 'margin')} for r in close],
            'polls': [[r['poll'], r['electors'], r['ballots'], r['turnout'], r['lead'], r['lead_share']] for r in rows]}


def _race_out(race):
    if not race:
        return None
    c = race.get('candidates') or []
    out = {k: race.get(k) for k in ('total', 'electors', 'ballots', 'turnout', 'margin', 'margin_share', 'acclaimed')}
    out['candidates'] = [{k: x.get(k) for k in ('name', 'party', 'votes', 'share', 'elected', 'incumbent')} for x in c[:8]]
    if len(c) >= 2 and race.get('electors'):
        b = race.get('ballots') or race.get('total') or 0
        out['math'] = {'gap_votes': (c[0].get('votes') or 0) - (c[1].get('votes') or 0),
                       'swing_to_flip': round((race.get('margin_share') or 0) / 2, 4),   # uniform swing from 1st to 2nd
                       'did_not_vote': race['electors'] - b,
                       'second_needs_from_new_voters': (c[0].get('votes') or 0) - (c[1].get('votes') or 0) + 1}
    return out


def areas(base, ward, codes, pops, ward_of=None, method=None):
    """Know your constituency for every elected member from Calgary, not only councillors: each provincial electoral
    division (MLA) and federal electoral district (MP) covering the view (every one for all of Calgary), with its
    member, the last result and its arithmetic, who lives there (each community's 2021 Census profile scaled to today's
    residents, split by the share of the community inside it), voting locations or polls, the wards it overlaps,
    the mayor's vote and the 2026 referendum there."""
    demo = base.get('demographics')
    m = base.get('municipal') or {}
    mbw = (m.get('mayor_by_ward') or {}).get('by_ward') or {}
    city_mayor = {x['name']: x.get('share') for x in (m.get('mayor') or {}).get('candidates', [])}
    prov = base.get('provincial') or {}
    out = {}
    for level in ('provincial', 'federal'):
        b = base.get(level) or {}
        sh = b.get('community_shares') or {}
        gen = b.get('general') or {}
        if ward:
            names = [x['riding'] for x in _ward_mix(sh, codes, pops) if x['share'] >= 0.03]
        else:
            names = sorted({r for c in pops for r in (sh.get(c) or {}) if float(pops.get(c) or 0) > 0})
        byes = {e['ed']: e for e in sorted(b.get('byelections') or [], key=lambda e: e.get('date') or '') if e.get('race')}
        items = {}
        for n in names:
            cw = {c: s[n] for c, s in sh.items() if n in s and float(pops.get(c) or 0) > 0}
            ap = {c: float(pops.get(c) or 0) * s for c, s in cw.items()}
            res = sum(ap.values())
            if res < 2000:                              # a sliver of a boundary, not a Calgary seat
                continue
            who = _who(demo, list(cw), ap, method, weights=cw) if demo else None
            if who:
                for r in who['communities']:
                    r['inside'] = round(cw.get(r['code'], 0), 3)
            bye = byes.get(n)
            a = {'name': n, 'level': level, 'residents': round(res), 'member': (b.get('members') or {}).get(n),
                 'last': _race_out(bye['race'] if bye else gen.get(n)), 'last_date': (bye or {}).get('date') or b.get('date'),
                 'by_election': bool(bye), 'general': _race_out(gen.get(n)) if bye else None, 'general_date': b.get('date'),
                 'who': who}
            if level == 'provincial':
                st = _prov_stations(gen.get(n))
                st['stations'] = [{k: x[k] for k in ('name', 'type', 'electors', 'ballots', 'turnout', 'lead', 'lead_share', 'margin')}
                                  for x in st['stations'] if x['type'].lower().startswith('election day')]
                a['stations'] = st
            else:
                fp = _fed_polls(gen.get(n))
                fp.pop('polls', None)
                a['polls'] = fp
            if ward_of:
                bw = {}
                for c, v in ap.items():
                    if ward_of.get(c):
                        bw[ward_of[c]] = bw.get(ward_of[c], 0) + v
                a['wards'] = sorted([{'ward': w_, 'residents': round(v), 'share': round(v / res, 3)} for w_, v in bw.items()
                                     if v / res >= 0.005], key=lambda x: -x['share'])
                tot_w = sum(x['share'] for x in a['wards'])
                if mbw and tot_w:
                    mv = {}
                    for x in a['wards']:
                        for cnd in (mbw.get(str(x['ward'])) or {}).get('candidates', []):
                            mv[cnd['name']] = mv.get(cnd['name'], 0) + x['share'] / tot_w * (cnd.get('share') or 0)
                    a['mayor'] = [{'name': k, 'area': round(v, 4), 'calgary': city_mayor.get(k)}
                                  for k, v in sorted(mv.items(), key=lambda y: -y[1])[:5]]
            ref = (prov.get('referendum') or {}).get('questions') or []
            if ref:
                pmix = [{'riding': n, 'share': 1.0}] if level == 'provincial' else _ward_mix(prov.get('community_shares') or {}, list(ap), ap)
                a['referendum'] = [{'number': q['number'], 'question': q.get('question'), 'options': q['option_columns'],
                                    'area': [(lambda v: round(v, 4) if v is not None else None)(_mix_value(pmix, {k: v['shares'][i] for k, v in q['by_ed'].items()}))
                                             for i in range(len(q['option_columns']))],
                                    'calgary': q['calgary']['shares'], 'alberta': (q.get('alberta') or {}).get('shares')}
                                   for q in ref]
            items[n] = a
        out[level] = items
    out['note'] = ('Residents and who lives here: each community\'s residents today (the count chosen in Settings) times the '
                   'share of the community inside the division or district, with its 2021 Census mix. Wards, mayor and '
                   'referendum figures for a district are residents-weighted estimates. Swing to flip: the uniform '
                   'swing from the winner to the runner-up that would tie the last result (half the margin).')
    return out


def micro(base, ward, codes, pops, method=None):
    """Election Analytics for a ward (or Calgary, ward 0): who lives there (2021 Census by community), and the last
    provincial (voting location) and federal (poll by poll) results in the divisions and districts that cover it."""
    out = {'who': _who(base.get('demographics'), codes, pops, method)}
    for level, fn in (('provincial', _prov_stations), ('federal', _fed_polls)):
        b = base.get(level) or {}
        mix = _ward_mix(b.get('community_shares') or {}, codes, pops)
        items = []
        for x in mix:
            if not ward and len(items) >= 30:
                break
            if ward and x['share'] < 0.03:
                continue
            race = (b.get('general') or {}).get(x['riding'])
            d = fn(race)
            if not ward:                                # all of Calgary: summaries only
                d.pop('stations', None)
                d.pop('polls', None)
            items.append(dict(x, date=b.get('date'), turnout=(race or {}).get('turnout'), **d))
        out[level] = items
    out['notes'] = ('Provincial results are by voting location (2023, 2019 boundaries); a location serves voting areas '
                    'that may extend beyond the ward. Federal results are by poll (2025); poll numbers are Elections '
                    'Canada\'s and polls cover the whole district, so they are not all inside the ward. Advance, mail-in '
                    'and special ballots are counted by district, not by poll. Who lives here: each community\'s 2021 Census '
                    'profile (ages, households, work) scaled to its residents today, counted the way chosen in Settings; '
                    'communities built since 2021 have no Census profile yet.')
    return out
