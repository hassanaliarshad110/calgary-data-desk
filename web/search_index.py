"""The site search index (data/search.json), written at each website build: every screen and its parts, every
community and ward, every method note, dataset, electoral division and district, video and visitor place, with the words
that find them. search.js reads it the first time the search box is used; news headlines are added there from the
day's stories."""
import json
import os
import re

# view, name, what it holds (shown under the name), extra words that should find it, its parts (sub-views) as
# (label shown on the screen, what the part holds)
SCREENS = [
    ('dashboard', 'Dashboard', 'Every ward and community at a glance: residents, 311 requests, open issues, traffic, new homes, crime and rents, on a map',
     'home overview map 311 service requests population residents crime rents traffic incidents new homes building permits',
     [('Open per 1,000', 'Map: open 311 requests per 1,000 residents'), ('Requests per 1,000', 'Map: 311 requests per 1,000 residents'),
      ('Infrastructure per 1,000', 'Map: infrastructure requests per 1,000 residents'), ('Change in requests', 'Map: change in 311 requests'),
      ('Growth since 2021', 'Map: residents growth since the 2021 Census')]),
    ('compare', 'Compare wards', 'All 14 wards side by side on every measure', 'wards ranking table side by side councillor', []),
    ('issues', 'Open issues', 'Every open 311 request: how old, what kind, by community', '311 open requests backlog over 90 days graffiti potholes', []),
    ('changes', 'What changed', 'The Growth vs amenities method before and after its revision of 5 November 2026', 'revision method changelog', []),
    ('growth', 'Growth vs amenities', 'How near homes are to playgrounds, parks, transit, libraries and recreation centres, how crowded they are, and the forecast to 2030',
     'amenities access distance crowding parks playgrounds transit stops libraries recreation centres new homes growth forecast 2030 suburban residential growth SRG',
     [('Growth vs amenities', 'Distance from every home to the nearest amenity and how many people share it'),
      ('Forecast to 2030', "The City's suburban growth forecast and what it means for amenities by 2030"),
      ('Assets', 'Where the City\'s parks, playgrounds, stops and facilities are'), ('Population build-up', 'How the residents figure is built from homes'),
      ('Amenities', 'Amenities counted per community'), ('Being built', 'Major projects and City facilities being built in every ward'),
      ('Development and rezoning', 'Development permits and land use redesignations')]),
    ('families', 'Families and schools', 'Child care spaces, schools and enrolment by community', 'child care daycare schools students enrolment kids children',
     [('Child care', 'Licensed child care and spaces'), ('Schools', 'Schools and enrolment')]),
    ('infra', 'Infrastructure condition', "Water main breaks, the age of the water network, the paving plan and the City's own condition figures, against 311 requests",
     'water main breaks pipes roads paving potholes sidewalks lights sewer condition', []),
    ('safety', "Canada's safest cities", "Every city of 10,000 or more by Statistics Canada's Crime Severity Index, with Calgary's rank", 'crime severity index CSI ranking cities Canada violent crime', []),
    ('cameras', 'Traffic cameras', "The City's traffic cameras, live", 'traffic cameras roads live', []),
    ('help', 'Find help near me', 'A bed tonight, food, day spaces, health care and help lines, nearest to you first', 'shelter homeless food bank emergency help lines crisis health warming', []),
    ('budget', 'City budget', 'The 2026 budget by department and service, revenue, and property tax by ward and community', 'city budget spending revenue property tax mill rate assessment', []),
    ('budget-intelligence', 'Budget Intelligence', 'What is approved, what was spent and what is only proposed; every 2027 to 2030 budget request with its page in the City\'s document; checks on the figures',
     'budget intelligence accountability business cases budget requests proposed 2027 2030 capital operating positions FTE tax increase simulator Council priorities reconcile',
     [('Business cases', 'All 384 budget requests, searchable by department, ward and priority'), ('Budget vs actual', 'What the City publishes, and what it does not'),
      ('Tax simulator', 'A what-if for one home\'s municipal property tax'), ('Data checks', 'How the figures are checked against the City\'s open data')]),
    ('fedbudget', 'Federal Budget 2026', 'Headline numbers, every measure, province by province, Calgary and Alberta', 'federal budget Canada deficit measures tax changes',
     [(t, '') for t in ('Overview', 'Province by province', 'Calgary and Alberta', 'Every measure', 'Tax changes', 'Fiscal tables')]),
    ('invest', 'Invest in Calgary', 'Every business in Calgary, where each kind is underserved, growth, and the Business Economist', 'business licences businesses underserved index opportunities directory restaurants shops',
     [(t, '') for t in ('Opportunities', 'Underserved index', 'Business directory', 'Growth', 'Business Economist')]),
    ('capmkt', 'Calgary Capital Markets', "Calgary's public companies, their industries and value, and Calgary's place in Canada's stock markets", 'TSX TSXV stock market public companies market capitalization head office',
     [(t, '') for t in ('Overview', 'Company directory', 'Industries', 'Market activity', 'Company performance', "Calgary's footprint", 'History', 'Sources and method')]),
    ('elections', 'Election Data Centre', 'Seats, leaders, constituencies, Election Analytics, council and Commons votes, and the latest official results',
     'elections results votes mayor councillor MLA MP turnout referendum promises council votes accountability',
     [('Overview', ''), ('Know your leaders', 'Every elected member from Calgary'), ('Know your constituency', 'Your ward, electoral division and electoral district'),
      ('Election Analytics', 'Analysis for the 2027 elections'), ('Civic Accountability', 'Promises, council votes and Commons votes'), ('Full results', 'Every race, every candidate')]),
    ('citynews', 'Calgary News', "The day's Calgary stories, each with its sources", 'news stories headlines today', []),
    ('visit', 'Visiting Calgary', 'What to see, where to stay, the weather by month and what suits it, getting around, what is on each month', 'tourism tourist visit hotels attractions weather Stampede things to do getting around transit airport', []),
    ('ask', 'Data Genie', 'Ask anything about the data in plain words and get an answer with its sources', 'ask question genie chat answer', []),
    ('scientist', 'Data Scientist', 'Full analysis reports on the selected area', 'report analysis', []),
    ('videos', 'Video Explainers', 'Short narrated videos on what the data shows', 'videos explainers watch', []),
    ('news', 'Newsletter', 'A newsletter for your ward, ready to send', 'newsletter email', []),
    ('methods', "How it's counted", 'Every formula, filter and threshold, with its datasets and how to check it yourself', 'methods formula method how counted definitions', []),
    ('sources', 'Data sources', 'Every dataset the site reads, its publisher, when it was last updated, and the refresh schedule', 'sources datasets refresh schedule open data publisher', []),
    ('settings', 'Settings', 'How residents are counted, the theme and the Data Genie service', 'settings theme dark light population method', []),
]

ICONS = {'screen': 'i-dashboard', 'part': 'i-next', 'community': 'i-pin', 'ward': 'i-users', 'method': 'i-sigma', 'dataset': 'i-database',
         'district': 'i-ballot', 'video': 'i-film', 'news': 'i-paper', 'place': 'i-compass', 'page': 'i-info'}


def _read(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def build(out, data_dir, methods_list, default_method='model'):
    rows = []
    for view, name, about, words, parts in SCREENS:
        rows.append({'k': 'screen', 't': name, 's': about, 'v': view, 'w': words})
        for label, what in parts:
            rows.append({'k': 'part', 't': label, 's': what or f'{name}: {label}', 'v': view, 'p': label, 'w': name})
    rows.append({'k': 'page', 't': 'About Calgary Insight', 's': 'Why the site exists and who built it', 'u': 'about/', 'w': 'about hassan ali purpose facebook instagram'})
    w0 = _read(os.path.join(data_dir, default_method, 'w0.json')) or {}
    wards = ((w0.get('scope') or {}).get('wards') or {})
    for w in range(1, 15):
        c = (wards.get(str(w)) or wards.get(w) or {}).get('councillor') or ''
        rows.append({'k': 'ward', 't': f'Ward {w}', 's': f'Councillor {c}' if c else 'Ward overview', 'ward': w, 'w': c})
    for c in w0.get('communities') or []:
        if not c.get('code'):
            continue
        res = c.get('residents')
        rows.append({'k': 'community', 't': c.get('name') or c['code'], 's': f"Ward {c.get('ward')}" + (f' · {res:,} residents' if isinstance(res, (int, float)) and res else ''),
                     'code': c['code'], 'ward': c.get('ward'), 'w': c['code']})
    for m in methods_list or []:
        rows.append({'k': 'method', 't': m.get('name', ''), 's': (m.get('used_in') or m.get('publisher') or '')[:120], 'v': 'methods', 'key': m.get('key'),
                     'w': ' '.join(str(x) for x in (m.get('dataset') or []) if x)[:120] if isinstance(m.get('dataset'), list) else str(m.get('dataset') or '')})
    for s in w0.get('status') or []:
        rows.append({'k': 'dataset', 't': s.get('name', ''), 's': 'Dataset ' + ', '.join(s.get('ids') or []) if s.get('ids') else 'Data source', 'v': 'sources', 'w': ' '.join(s.get('ids') or [])})
    el = _read(os.path.join(data_dir, 'elections.json')) or {}
    for level, label in (('provincial', 'Provincial electoral division'), ('federal', 'Federal electoral district')):
        g = ((el.get(level) or {}).get('general') or {})
        members = (el.get(level) or {}).get('members') or {}
        for ed in (g.keys() if isinstance(g, dict) else []):
            who = members.get(ed) if isinstance(members, dict) else None
            who = (who.get('name') if isinstance(who, dict) else who) or ''
            rows.append({'k': 'district', 't': ed, 's': label + (f' · {who}' if who else ''), 'v': 'elections', 'p': 'Know your constituency', 'ec': ('p:' if level == 'provincial' else 'f:') + ed, 'w': who})
    idx = os.path.join(out, 'index.html')
    try:
        html = open(idx, encoding='utf-8').read()
        for m in re.finditer(r'<section class="card vid-card"[^>]*data-cat="([^"]*)"[^>]*>.*?<h2>(.*?)</h2>', html, re.S):
            title = re.sub(r'<[^>]+>', '', m.group(2)).strip()
            rows.append({'k': 'video', 't': title, 's': 'Video explainer · ' + m.group(1), 'v': 'videos', 'q': title, 'w': m.group(1)})
    except OSError:
        pass
    vis = _read(os.path.join(data_dir, 'visit.json')) or {}
    for p in vis.get('places') or []:
        rows.append({'k': 'place', 't': p.get('name', ''), 's': 'Visiting Calgary · ' + (p.get('kind') or ''), 'v': 'visit', 'place': p.get('id') or p.get('name'), 'w': p.get('area') or ''})
    for ev in vis.get('months') or []:
        for e in ev.get('events') or []:
            rows.append({'k': 'place', 't': e.get('name', ''), 's': 'Visiting Calgary · ' + ev.get('name', '') + ' · ' + (e.get('what') or ''), 'v': 'visit', 'month': ev.get('n'), 'w': ev.get('name', '')})
    return {'built': True, 'icons': ICONS, 'rows': rows}
