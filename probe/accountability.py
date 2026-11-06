"""Civic Accountability: the official records behind promises and performance, for Calgary's elected members.

Read at every website refresh, from official sources only:
  - City council and committee votes (open data ruq3-99hx): every recorded vote, by member;
  - the City's own progress report performance measures (the newest "Progress Report - Performance Measures" dataset):
    each measure's values by year and its target;
  - House of Commons recorded divisions this Parliament (ourcommons.ca): how each Calgary MP voted, and how often a
    vote was recorded for them;
  - bills before Parliament (LEGISinfo): those sponsored by Calgary MPs.
The commitments themselves (manifestos, promises, government commitments and their evidence) are researched by hand
and kept in ui/accountability/commitments.json, with a source for every entry.

    python accountability.py OUT.json
"""
import datetime as dt
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

import calgary_data as cd

VOTES = 'ruq3-99hx'
HOC = 'https://www.ourcommons.ca/members/en/votes'
LEGISINFO = 'https://www.parl.ca/legisinfo/en/bills/json?parlsession={ps}'
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryDataDesk civic data dashboard)'}


def _raw(url, timeout=120):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception:                       # noqa: BLE001 - try again, then give up
            if i == 2:
                raise
            time.sleep(5)


def council_votes():
    """Every recorded council and committee vote: by member, and the divided votes in full."""
    rows = []
    off = 0
    while True:
        page = cd.get_json(cd.soql_url(VOTES, select='meetingtype,meetingdate,resolution,voter,vote,result',
                                       order='meetingdate DESC,:id', limit=50000, offset=off), timeout=300)
        rows += page
        if len(page) < 50000:
            break
        off += 50000
    members, motions = {}, {}
    for r in rows:
        v = (r.get('vote') or '').strip()
        who = (r.get('voter') or '').strip()
        m = members.setdefault(who, {'votes': 0, 'for': 0, 'against': 0, 'absent': 0, 'other': 0})
        m['votes'] += 1
        key = {'for': 'for', 'yes': 'for', 'in favour': 'for', 'against': 'against', 'no': 'against', 'absent': 'absent'}.get(v.lower(), 'other')
        m[key] += 1
        k = (r.get('meetingdate', '')[:10], r.get('meetingtype'), (r.get('resolution') or '')[:4000])
        mo = motions.setdefault(k, {'date': k[0], 'meeting': k[1], 'text': k[2], 'result': r.get('result'), 'votes': {}})
        mo['votes'][who] = v
    divided = []
    for mo in motions.values():
        vals = [x.lower() for x in mo['votes'].values()]
        f, a = sum(x in ('for', 'yes', 'in favour') for x in vals), sum(x in ('against', 'no') for x in vals)
        if f and a:
            divided.append({**mo, 'for': f, 'against': a, 'text': mo['text'][:600]})
    divided.sort(key=lambda m: m['date'], reverse=True)
    dates = sorted(m['date'] for m in motions.values() if m['date'])
    return {'members': members, 'motions': len(motions), 'divided': divided[:150], 'divided_n': len(divided),
            'from': dates[0] if dates else None, 'to': dates[-1] if dates else None,
            'values': sorted({(r.get('vote') or '').strip() for r in rows})}


def city_measures():
    """The City's newest progress report performance measures (values by year, the target, the City's own story)."""
    cat = json.loads(_raw('https://data.calgary.ca/api/catalog/v1?' + urllib.parse.urlencode(
        {'q': 'Progress Report - Performance Measures', 'only': 'dataset', 'limit': 40, 'domains': 'data.calgary.ca'})))
    sets = [x['resource'] for x in cat.get('results', []) if 'Performance Measures' in x['resource']['name']]

    def rank(r):                                # the newest report by its name: year, then quarter
        import re                               # noqa: PLC0415
        m = re.search(r'(20\d\d)\s+(Q[1-4]|Mid-Year|Year-End)', r['name'])
        if not m:
            return 0
        return int(m.group(1)) * 10 + {'Q1': 1, 'Mid-Year': 2, 'Q2': 2, 'Q3': 3, 'Year-End': 4, 'Q4': 4}[m.group(2)]
    sets.sort(key=rank, reverse=True)
    if not sets:
        return None
    s = sets[0]
    rows = cd.query(s['id'], limit=2000)
    return {'dataset': s['id'], 'name': s['name'], 'updated': s.get('data_updated_at') or s.get('updatedAt'), 'rows': rows}


def hoc_votes(parl='45-1'):
    """House of Commons recorded divisions this Parliament: how each Calgary MP voted."""
    root = ET.fromstring(_raw(f'{HOC}/xml?parlSession={parl}'))
    divs = []
    for v in root:
        g = lambda t: (v.find(t).text if v.find(t) is not None else None)  # noqa: E731
        divs.append({'n': int(g('DecisionDivisionNumber')), 'date': (g('DecisionEventDateTime') or '')[:10], 'subject': g('DecisionDivisionSubject'),
                     'result': g('DecisionResultName'), 'yeas': int(g('DecisionDivisionNumberOfYeas') or 0), 'nays': int(g('DecisionDivisionNumberOfNays') or 0),
                     'bill': g('BillNumberCode')})
    p, s = parl.split('-')
    mps = {}
    for d in divs:
        try:
            x = ET.fromstring(_raw(f'{HOC}/{p}/{s}/{d["n"]}/xml', timeout=60))
        except Exception:                       # noqa: BLE001 - one division unread leaves the rest
            continue
        for vp in x:
            g = lambda t: (vp.find(t).text if vp.find(t) is not None else '')  # noqa: E731
            riding = g('ConstituencyName')
            if not riding.startswith('Calgary'):
                continue
            name = f"{g('PersonOfficialFirstName')} {g('PersonOfficialLastName')}".strip()
            m = mps.setdefault(riding, {'name': name, 'caucus': g('CaucusShortName'), 'yea': 0, 'nay': 0, 'paired': 0, 'recorded': 0, 'votes': {}})
            m['name'], m['caucus'] = name, g('CaucusShortName')
            val = 'Paired' if g('IsVotePaired') == 'true' else g('VoteValueName')
            m['recorded'] += 1
            m['yea' if val == 'Yea' else 'nay' if val == 'Nay' else 'paired'] += 1
            m['votes'][d['n']] = val
        time.sleep(0.2)
    return {'parliament': parl, 'divisions': divs, 'mps': mps}


def calgary_bills(parl='45-1', mps=None):
    """Bills before Parliament sponsored by Calgary MPs (matched by the sponsor's riding, or name)."""
    bills = json.loads(_raw(LEGISINFO.format(ps=parl)))
    names = {(m.get('name') or '').lower(): r for r, m in (mps or {}).items()}
    out = []
    for b in bills:
        riding = b.get('SponsorConstituencyNameEn') or b.get('SponsorConstituencyName') or ''
        nm = (b.get('SponsorPersonName') or '').lower()
        if not riding.startswith('Calgary'):
            riding = next((r for n, r in names.items() if n and (n == nm or n.split()[-1] in nm and n.split()[0][:3] in nm)), '')
        if not riding:
            continue
        out.append({'bill': b.get('NumberCode'), 'title': b.get('ShortTitleEn') or b.get('LongTitleEn'), 'sponsor': b.get('SponsorPersonName'),
                    'riding': riding, 'government': b.get('IsGovernmentBill'), 'stage': b.get('LatestCompletedMajorStageNameWithChamberSuffix'),
                    'status': b.get('StatusNameEn'), 'assent': (b.get('ReceivedRoyalAssentDateTime') or '')[:10] or None,
                    'url': f"https://www.parl.ca/legisinfo/en/bill/{parl}/{(b.get('NumberCode') or '').lower()}"})
    return {'parliament': parl, 'total': len(bills), 'calgary': out}


def build(today=None):
    today = today or dt.date.today()
    out, errors = {'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'today': today.isoformat()}, {}
    for key, fn in (('council', council_votes), ('city_measures', city_measures), ('hoc', hoc_votes),
                    ('bills', lambda: calgary_bills(mps=(out.get('hoc') or {}).get('mps')))):
        try:
            out[key] = fn()
        except Exception as e:                  # noqa: BLE001 - one source down leaves the others standing
            errors[key] = str(e)[:200]
            out[key] = None
    out['errors'] = errors
    out['sources'] = [
        {'title': 'Council and Committee Votes', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + VOTES},
        {'title': 'Progress Report - Performance Measures', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/browse?q=Progress%20Report'},
        {'title': 'Votes (recorded divisions)', 'publisher': 'House of Commons', 'url': 'https://www.ourcommons.ca/members/en/votes'},
        {'title': 'LEGISinfo: bills before Parliament', 'publisher': 'Library of Parliament', 'url': 'https://www.parl.ca/legisinfo/'}]
    return out


def load(data_dir=None):
    for p in [os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'accountability.json'),
              os.path.join(data_dir, 'accountability.json') if data_dir else None]:
        if p and os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    return None


if __name__ == '__main__':
    d = build()
    with open(sys.argv[1] if len(sys.argv) > 1 else 'accountability.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    print('errors', d['errors'], 'council members', len((d.get('council') or {}).get('members') or {}),
          'mps', len((d.get('hoc') or {}).get('mps') or {}), 'bills', len((d.get('bills') or {}).get('calgary') or []))
