"""The master registry of everything Data Genie and the Data Scientist can use.

Two kinds of source, one list:
  * every open dataset the site reads (the status list the build writes: name, dataset IDs, when it was read), and
    any other City dataset through search_datasets / query_dataset;
  * every page the site builds itself (each screen and each part of a screen): what it holds, how an assistant reads
    it, and the data file behind it.

A new tab registers itself: the registry reads the tabs of ui/index.html (at build time, and next to the code on the
desktop), so a screen added there is listed at once, with its title and description, and read through read_source as
soon as its data file is named in PAGES (tests/t_registry.py fails until it is).

Both assistants read their source list from here (agent.digest puts it in the instructions; list_sources and
read_source are their tools). Before either says something is not available, it looks here.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))


def page(key, title, what, read, files=(), view=None, section=None, scientist=None, keywords=''):
    """One entry. files: (name, where the build finds it relative to the site folder) for the data file(s) behind the
    page; section: the get_dashboard section that reads it, when there is one."""
    return {'key': key, 'view': view or key, 'title': title, 'what': what, 'read': read,
            'files': [list(f) if isinstance(f, (tuple, list)) else [f, 'data/' + f] for f in files],
            'section': section, 'scientist': scientist, 'keywords': keywords}


PAGES = [
    page('dashboard', 'Dashboard', 'Every ward and community at a glance: residents, 311 requests, open issues, traffic incidents, new homes, '
         'crime and rents, on a map.', 'get_dashboard (overview, communities, crime, traffic, rents, profile, child_care, schools, development, amenities)',
         section='overview', keywords='311 requests population residents crime rents traffic homes permits'),
    page('compare', 'Compare wards', 'All 14 wards side by side on every measure, with each ward\'s place on each measure.',
         'get_dashboard section=wards (fields, wards, ranks); section=ward_amenities for every asset', section='wards', keywords='wards ranking councillor'),
    page('issues', 'Open issues', 'Every open 311 request: how old, what kind, by community.',
         'get_dashboard section=overview or communities (open requests, over 90 days, closure speed)', section='communities', keywords='311 open backlog'),
    page('changes', 'What changed', 'The Growth vs amenities method before and after its revision of 5 November 2026.',
         'get_method topic=access_revision', keywords='revision method changelog'),
    page('growth', 'Growth vs amenities', 'How near homes are to playgrounds, parks, transit stops, libraries and recreation centres, how crowded they '
         'are, the forecast to 2030, assets, the population build-up, major projects being built, development and rezoning.',
         'get_dashboard sections access, growth_forecast, other_amenities, ward_amenities, population_recon, amenities, development',
         section='access', files=['srg_raw.json'], scientist='growth_forecast', keywords='amenities access distance crowding forecast 2030 parks playgrounds transit pathways bikeways projects being built'),
    page('families', 'Families and schools', 'Licensed child care spaces and inspections, schools and enrolment by community.',
         'get_dashboard sections child_care and schools', section='child_care', keywords='child care daycare schools enrolment'),
    page('infra', 'Infrastructure condition', 'Water main breaks, the age of the water network, the age and material of every public sewer '
         'connection (368,000 sanitary service lines) by community with the share past the low, typical and high benchmark service '
         'lives for its material, the coming wave of sewers passing their expected life, relining by year, the paving plan and '
         'the City\'s own condition figures, against 311 requests (sewer back-ups among them). Benchmark lives with their published '
         'sources are in service_life (also data:service_life).',
         'read_source key=infra (outline, then part or find: city.sanitary for the citywide sewer figures, by_comm for each '
         'community\'s sanitary, mains, breaks and req, service_life for the benchmarks); get_dashboard also has infrastructure 311 '
         'reports per 1,000', files=['infra.json'],
         keywords='water main breaks pipes paving roads sidewalks sewer sewage sanitary wastewater back-up age service life benchmark clay cast iron'),
    page('catalog', 'City open data catalogue', "Every dataset and data file the City of Calgary publishes (400+, with category, "
         'description, last update and every column, marked when a page of the site already uses it) and every data layer of its '
         'map server (capital works, roadwork permits, snow clearing, street sweeping, parking zones, flood hazard), rebuilt nightly.',
         'search_datasets (query and/or category; no arguments for the categories and map layers); describe_dataset and '
         'query_dataset for a dataset; query_map_layer for a map layer; read_source key=catalog for the whole list',
         files=['catalog.json'], keywords='catalogue catalog open data datasets all city data map layers gis every dataset'),
    page('safety', "Canada's safest cities", "Every city of 10,000 or more by Statistics Canada's Crime Severity Index, with Calgary's rank.",
         'get_dashboard section=safest_cities (find narrows by city); crime_severity_index', section='safest_cities', files=['safety_rank.json'], keywords='crime severity index ranking'),
    page('cameras', 'Traffic cameras', "The City's traffic cameras, shown live on the page.",
         'get_method topic=cameras (where the list comes from). The live pictures themselves cannot be read as data.', keywords='traffic cameras'),
    page('help', 'Find help near me', 'Shelters, meals, day spaces, health care and help lines, nearest first.',
         'read_source key=help (places by kind, address, hours, phone)', files=[['help.json', 'help/help.json']], keywords='shelter food bank help lines health'),
    page('budget', 'City budget', 'The 2026 budget by department and service, revenue, and property tax by ward and community.',
         'read_source key=budget (budget by department and service, revenue); get_dashboard section=property_tax for the tax by ward and community',
         files=['budget.json', 'tax.json'], section='property_tax', keywords='budget spending revenue property tax mill rate'),
    page('fedbudget', 'Federal Budget 2026', 'Headline numbers, every measure, province by province, Calgary and Alberta, tax changes and the fiscal tables.',
         'get_dashboard section=federal_budget (part summary, province, find, chapter, tables, tax, revenue_by_province)', section='federal_budget',
         files=[['budget2026.json', 'budget/budget2026.json']],
         keywords='federal budget deficit measures tax'),
    page('invest', 'Invest in Calgary', 'Every business in Calgary by kind and community, where each kind is underserved, growth.',
         'get_dashboard section=business (community, kind, find)', section='business', files=['business.json'], keywords='business licences underserved directory'),
    page('capmkt', 'Calgary Capital Markets', "Calgary's public companies, their industries and value, and Calgary's place in Canada's stock markets.",
         'read_source key=capmkt (outline, then part or find): the company directory (head office and source for each) and the totals', files=['capmkt.json', ['companies.json', 'capmkt/companies.json']], keywords='TSX TSXV stock market public companies market capitalization'),
    page('elections', 'Election Data Centre', 'Seats and leaders at every level, constituencies, every race and candidate, the latest official results.',
         'get_dashboard section=elections (full=true for every Calgary race and the referendum)', section='elections', files=['elections.json'], keywords='elections results turnout mayor councillor MLA MP'),
    page('election_analytics', 'Election Analytics', 'The micro-level picture of an area or seat for the 2027 elections: Census by community, every voting location and poll.',
         'get_dashboard section=election_analytics (riding for one seat)', view='elections', section='election_analytics',
         keywords='election analytics polls voting locations turnout constituency'),
    page('accountability', 'Civic Accountability', 'Eight pages in the Election Data Centre: Manifesto Tracker (party and candidate platforms), Promise vs Reality, '
         'Representative Performance, Legislative & Voting Records (every recorded City council and committee vote by member with the divided votes in full, '
         'and House of Commons votes by Calgary MPs), Government Commitments, Budget & Project Delivery, Accountability History, Methodology & Evidence. '
         'The Alberta Legislature does not publish members\' votes as open data.',
         'read_source key=accountability: outline first; part=accountability.json/council for votes by member and divided votes, part=accountability.json/hoc for Commons votes, '
         'part=commitments.json/commitments for promises and their status; find=a councillor, MP or word searches all of it; get_dashboard section=elections for who represents the area',
         files=['accountability.json', ['commitments.json', 'accountability/commitments.json']], view='elections', scientist='council_votes',
         keywords='votes voting record motions council committee councillor member promises commitments manifesto commons MP accountability performance representative'),
    page('citynews', 'Calgary News', "The day's Calgary stories, each with its sources.", 'get_dashboard section=city_news (find, days, topic, date)',
         section='city_news', keywords='news stories headlines'),
    page('game', 'YYC City Stories', 'A free learning game on the real map of Calgary, built from City open data: four residents and 18 missions '
         'that teach City services, from transit fares and Fair Entry to recycling carts and the snow-clearing bylaw.',
         'none: the game is introduced on this screen and opens at calgaryinsight.ca/city-stories/', keywords='game learn city services newcomers seniors students'),
    page('livemap', 'Live map', 'Calgary News stories placed where they happened, live traffic incidents, the newest 311 requests and '
         'crimes reported to police per 1,000 residents by community, on one map, with who to call.',
         'get_dashboard section=city_news for the stories; query_open_data 35ra-9556 (traffic incidents) and iahh-g8bj (311) for the live layers; '
         'get_dashboard section=crime for crime by community', section='city_news',
         keywords='live map news crime police traffic incidents accidents 311 safety where happening tonight'),
    page('visit', 'Visiting Calgary', 'What to see, where to stay, the weather by month and over the years, what is on each month, getting around.',
         'get_dashboard section=visiting (part: weather_months, weather_years, records, today, whats_on, sights, stay, getting_around, facts, stats); get_weather_forecast',
         files=['visit.json'], section='visiting', keywords='tourism visit hotels attractions weather things to do'),
    page('methods', "How it's counted", 'Every formula, filter and threshold, with its datasets and how to check it yourself.', 'get_method (topic, dataset ID or word); get_code',
         keywords='formula method definitions'),
    page('sources', 'Data sources', 'Every dataset the site reads, its publisher, when it was last updated, and the refresh schedule.',
         'list_sources (the datasets, with when each was read); search_datasets for any other City dataset', keywords='datasets refresh schedule'),
    page('ask', 'Data Genie', 'Ask anything about the data in plain words.', 'This assistant.', keywords='ask genie'),
    page('scientist', 'Data Scientist', 'Full analysis reports on the selected area.', 'This assistant\'s report mode (make_report).', keywords='report analysis'),
    page('videos', 'Video Explainers', 'Short narrated videos on what the data shows.', 'The videos are on the Video Explainers page; their facts come from the pages above.',
         keywords='videos explainers'),
    page('news', 'Newsletter', 'A newsletter for the selected ward, ready to send.', 'The newsletter is drawn from the Dashboard and Calgary News.', keywords='newsletter email'),
    page('settings', 'Settings', 'How residents are counted, the theme and the Data Genie service.', 'get_method topic=population_choice', keywords='settings theme population method'),
    page('files', 'Files', 'The tables and reports Data Genie has saved.', 'list_saved_files'),
]
BY_KEY = {p['key']: p for p in PAGES}


# What the hand-picked files that carry no note of their own hold (a file with a "note", "description" or "about" describes itself).
DESCRIBE = {
    'service_life.json': 'Benchmark service lives of sewer pipes by material (low, typical, high years) with the published source of each figure (Saanich 2023, Sydney Water and Halcrow 2007, Statistics Canada, DWA Germany, Canadian Infrastructure Council, ASCE 2025).',
    'budget_revenue.json': 'The City of Calgary budget: revenue lines by year, taken from the budget document by hand.',
    'rentals_all.json': 'Rental apartment buildings across Calgary (units, move-in, value per unit) used by the Population build-up.',
    'ward5_rentals.json': 'Rental apartment buildings in Ward 5 used by the Population build-up.',
    'tax_rates.json': 'The City\'s 2026 property tax rates by property class.',
    'ward5_profile_2021.json': 'The 2021 Census profile of Ward 5 (households, languages, income, commuting), by hand from Statistics Canada.',
    'tourism.json': 'Tourism (Statistics Canada): international overnight visitors entering by air at Calgary and Canada\'s other big gateways by year, month and country, and airport passengers by sector. Read with get_dashboard section tourism.',
    'explore_ctrain.json': 'CTrain stations from OpenStreetMap (one Overpass query, saved), used by the Explore Calgary trip planner to show the nearest station to each neighbourhood. Not a ridership or schedule source.',
    'police_study.json': 'The published study of Calgary Police performance, resources and the 2027 to 2030 budget request, with every table, chart, method, limit and source. Read with get_dashboard section police_study.',
    'tourism_research.json': 'Tourism research checked by hand: Tourism Calgary\'s 2025 figures, the airport, the stopover pilot, Banff, the Stampede, levies, rail, Indigenous tourism, what makes Calgary different, lessons from Iceland, Singapore, Dubai, New York, Denver and airline stopovers, with sources. Read with get_dashboard section tourism part=research.',
    'school_tax.json': 'School tax and school funding (Government of Alberta): every municipality\'s education property tax requisition each year since 2020, students by school board and in Calgary\'s schools, tax per student, every board\'s operating funding per student and school projects by municipality. Read with get_dashboard section school_tax.',
    'analyst_topics.json': 'The ready-made analysis topics of the Data Scientist tab.',
    'built.json': 'When the website was last built, how long each step took, and the Census year used.',
    'business_people.json': 'Residents by community under each way of counting, used by Invest in Calgary.',
    'live.json': 'The live connections the site checks (City open data, the City feeds, news) and when each last answered.',
    'settings.json': 'The ways of counting residents, the wards, the methods and the contact details the site uses.',
    'transit.json': 'The Calgary Transit timetable: routes, trips and the dates it is valid for.',
}
SKIP = {'registry.json', 'search.json', 'methods.json'}      # the registry itself, the site search and the method notes (get_method)
MAX_SHIP = 1500000                                          # bytes: a bigger file is not sent to the browser with the assistants


def _describe(name, d):
    if name in DESCRIBE:
        return DESCRIBE[name]
    if isinstance(d, dict):
        for k in ('note', 'description', 'about'):
            if isinstance(d.get(k), str) and d[k].strip():
                return d[k].strip()[:400]
        if isinstance(d.get('source'), str):
            return f"Data file {name} (source: {d['source'][:160]})."
        return f"Data file {name} with {', '.join(list(d)[:8])}."
    return f'Data file {name}.'


def auto_files(out=None):
    """An entry for every data file (hand-picked or built from an API) that no page entry claims, so a file added to data/,
    to the site folders or to the build's data is known to the assistants the day it exists: no one has to list it."""
    claimed = set()
    for p in PAGES:
        for name, src in p['files']:
            claimed.add(name)
            claimed.add(os.path.basename(src))
    found = {}
    roots = [(os.path.join(out, 'data') if out else None, 'data/'), (os.path.join(HERE, 'data'), 'data/')]
    for root, prefix in roots:
        if not root or not os.path.isdir(root):
            continue
        for f in sorted(os.listdir(root)):
            if f.endswith('.json') and f not in SKIP and f not in claimed and f not in found:
                found[f] = (os.path.join(root, f), prefix + f)
    ui = os.path.join(HERE, 'ui')
    for dp, dn, fn in os.walk(ui):
        if 'vendor' in dp or 'video' in dp:
            continue
        for f in fn:
            if f.endswith('.json') and f not in SKIP and f not in claimed and f not in found:
                found[f] = (os.path.join(dp, f), os.path.relpath(os.path.join(dp, f), ui))
    entries = []
    for f, (path, src) in sorted(found.items()):
        try:
            size = os.path.getsize(path)
            with open(path, encoding='utf-8') as fh:
                d = json.load(fh)
        except (OSError, ValueError):
            continue
        what = _describe(f, d)
        entries.append({'key': 'data:' + f[:-5], 'view': None, 'title': f[:-5].replace('_', ' ').capitalize() + ' (data file)', 'what': what,
                        'read': f'read_source key=data:{f[:-5]} (outline, then part or find)', 'files': [[f, src]], 'section': None,
                        'scientist': None, 'keywords': f[:-5].replace('_', ' '), 'registered': True, 'auto': True, 'bytes': size,
                        'described': f in DESCRIBE or (isinstance(d, dict) and any(isinstance(d.get(k), str) for k in ('note', 'description', 'about')))})
    return entries


def discover_tabs(html=None):
    """(view, title, tooltip) for every tab in ui/index.html, so a new screen is known the day it is added."""
    if html is None:
        try:
            with open(os.path.join(HERE, 'ui', 'index.html'), encoding='utf-8') as f:
                html = f.read()
        except OSError:
            return []
    out, seen = [], set()
    for tag in re.finditer(r'<(?:a|button)\b[^>]*\bdata-view="([a-z0-9_-]+)"[^>]*>(.*?)</(?:a|button)>', html, re.S):
        view = tag.group(1)
        if view in seen:
            continue
        seen.add(view)
        title = re.search(r'title="([^"]*)"', tag.group(0))
        label = re.search(r'<span[^>]*>(.*?)</span>', tag.group(2), re.S)
        out.append((view, re.sub(r'<[^>]+>', '', label.group(1)).strip() if label else view, title.group(1) if title else ''))
    return out


def pages(html=None, stored=None, build_dir=None):
    """Every registered page, plus a plain entry for any tab in the site that has none yet (flagged registered=False)."""
    out = [dict(p, registered=True) for p in PAGES]
    have = {p['view'] for p in out}
    tabs = discover_tabs(html)
    if not tabs and stored:
        tabs = [(p['view'], p['title'], p.get('what', '')) for p in stored if not p.get('registered', True)]
    for view, title, tip in tabs:
        if view not in have:
            out.append({'key': view, 'view': view, 'title': title or view, 'what': tip or title or view,
                        'read': 'No reading instructions are registered for this page yet: use get_dashboard sections, read_source or search_datasets '
                                'for the subject, and say plainly that this page exists.',
                        'files': [], 'section': None, 'scientist': None, 'keywords': '', 'registered': False})
            have.add(view)
    out += auto_files(build_dir)
    return out


def write(out_dir, html=None):
    """The build's copy (data/registry.json), for Data Genie in the browser."""
    reg = pages(html, build_dir=out_dir)
    path = os.path.join(out_dir, 'data', 'registry.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'pages': reg}, f, separators=(',', ':'))
    return reg


def load(data_dir=None):
    """The registry as the assistants see it: the build's copy next to this code or in data_dir, else read from the code."""
    for base in (os.path.join(HERE, 'data'), data_dir):
        p = os.path.join(base or '', 'registry.json')
        if base and os.path.exists(p):
            try:
                with open(p, encoding='utf-8') as f:
                    return json.load(f).get('pages') or []
            except (OSError, ValueError):
                pass
    return pages()


def datasets(status):
    """The open datasets the site reads, from the build's status list (name, IDs, when each was read, whether it worked)."""
    out = []
    for s in status or []:
        ids = s.get('ids') or []
        out.append({'name': s.get('name'), 'ids': ids, 'read': s.get('fetched'), 'city_updated': s.get('city_updated'),
                    'ok': s.get('ok', True), 'link': s.get('page') or (f'https://data.calgary.ca/d/{ids[0]}' if ids else None)})
    return out


def digest(reg=None, status=None):
    """The registry in a few lines for the assistants' instructions."""
    reg = reg or load()
    lines = ['EVERY SOURCE YOU CAN USE (the master registry: list_sources searches it, read_source reads a page\'s own data). '
             'Before you say anything is not available, check here and with list_sources; a page listed below IS available.']
    for p in reg:
        lines.append(f"- {p['title']} [{p['key']}]: {p['what']} Read it with: {p['read']}")
    ds = datasets(status)
    if ds:
        lines.append(f'Open datasets the site reads ({len(ds)}): ' + '; '.join(f"{d['name']} ({', '.join(d['ids'])})" for d in ds if d['name'])[:2500])
    lines.append('Any other City of Calgary open dataset: search_datasets, describe_dataset, query_dataset.')
    return '\n'.join(lines)


STOP = set('a an and are as at be been by did do does for from how in is it me of on or our show tell the their there this to was we what when where which who why will with about any all can could has have my should than that them they us your i'.split())


def _stem(w):
    for suf in ('ing', 'ed', 'es', 's'):
        if len(w) > len(suf) + 2 and w.endswith(suf):
            return w[:-len(suf)]
    return w


def _tokens(text):
    return {_stem(w) for w in re.split(r'\W+', str(text).lower()) if len(w) > 1 and w not in STOP}


def find(reg, q):
    """Registry entries that match some words (title, what it holds, keywords, how to read it), best first. Words are
    matched by stem, so "voted" finds "votes"."""
    words = _tokens(q)
    if not words:
        return reg
    def score(p):
        return sum(3 * (w in _tokens(p.get('title'))) + 3 * (w in _tokens(p.get('keywords'))) + (w in _tokens(p.get('what')))
                   + (w in _tokens(p.get('read'))) for w in words)
    hits = sorted(((score(p), p) for p in reg), key=lambda x: -x[0])
    return [p for s, p in hits if s]


def _locate(entry, data_dir):
    out = {}
    for name, src in entry.get('files') or []:
        for base in (os.path.join(HERE, 'data'), data_dir, os.path.join(HERE, 'ui')):
            for cand in (os.path.join(base or '', name), os.path.join(base or '', src)):
                if base and os.path.isfile(cand):
                    out[name] = cand
                    break
            if name in out:
                break
    return out


def _brief(v, depth=0):
    if isinstance(v, dict):
        return {k: _brief(x, depth + 1) if depth < 1 else _kind(x) for k, x in list(v.items())[:60]}
    return _kind(v)


def _kind(v):
    if isinstance(v, dict):
        return f'object with {len(v)} keys: ' + ', '.join(list(v)[:12])
    if isinstance(v, list):
        first = v[0] if v else None
        return f'list of {len(v)}' + (f' ({", ".join(list(first)[:10])})' if isinstance(first, dict) else f' ({type(first).__name__})' if v else '')
    return v if not isinstance(v, str) or len(v) < 160 else v[:157] + '...'


def _trim(x):
    return x if len(json.dumps(x, default=str)) < 2500 else _brief(x)


def _walk(v, q, path='', hits=None, cap=40, ctx=None):
    """Items whose key or text has the words: a key that matches gives its whole entry (a member's votes), a record whose
    values match gives the record."""
    hits = [] if hits is None else hits
    if len(hits) >= cap:
        return hits
    if isinstance(v, dict):
        here = {k: (str(x)[:160]) for k, x in list(v.items())[:8] if not isinstance(x, (dict, list))}
        ctx = here if any(k in v for k in ('text', 'date', 'title', 'name')) else ctx
        scalar = any(not isinstance(x, (dict, list)) and q in str(x).lower() for x in v.values())
        child = False
        for k, x in v.items():
            if q in str(k).lower():
                hits.append({'path': f'{path}/{k}' if path else str(k), 'item': _trim(x), **({'in': ctx} if ctx and not isinstance(x, (dict, list)) else {})})
                child = True
            elif isinstance(x, (dict, list)) and q in json.dumps(x, default=str).lower():
                child = True
                _walk(x, q, f'{path}/{k}' if path else str(k), hits, cap, ctx)
            if len(hits) >= cap:
                return hits
        if scalar and not child:
            hits.append({'path': path, 'item': _trim(v)})
    elif isinstance(v, list):
        for i, x in enumerate(v):
            if q in json.dumps(x, default=str).lower():
                _walk(x, q, f'{path}/{i}', hits, cap, ctx)
            if len(hits) >= cap:
                break
    elif isinstance(v, str) and q in v.lower():
        hits.append({'path': path, 'item': v[:600]})
    return hits


def read(key, data_dir=None, part=None, find_text=None, reg=None, limit=24000):
    """A page's own data: its outline; one part of it (a key, or a/b/c); or the items that mention some words."""
    reg = reg or load(data_dir)
    entry = next((p for p in reg if p['key'] == key), None) or next((p for p in reg if p['view'] == key), None)
    if not entry:
        return {'error': f'No source "{key}" in the registry.', 'keys': [p['key'] for p in reg]}
    if not entry.get('files'):
        return {'page': entry['title'], 'read': entry['read'],
                'note': 'This page has no data file of its own to read here; the way to read it is above.'}
    found = _locate(entry, data_dir)
    if not found:
        return {'page': entry['title'], 'error': 'This page\'s data file is not on this computer right now; the page itself shows it.',
                'files': [f[0] for f in entry['files']]}
    data = {}
    for name, path in found.items():
        try:
            with open(path, encoding='utf-8') as f:
                data[name] = json.load(f)
        except (OSError, ValueError) as e:
            data[name] = {'error': str(e)}
    root = next(iter(data.values())) if len(data) == 1 else data
    head = {'page': entry['title'], 'what': entry['what']}
    if find_text:
        hits = _walk(root, str(find_text).lower().strip())
        return {**head, 'find': find_text, 'matches': len(hits), 'items': hits,
                'note': 'up to 40 matches, each with its path in the file; read_source part=<path start> for the whole section'}
    if part:
        v = root
        for seg in [x for x in str(part).replace('[', '/').replace(']', '').split('/') if x]:
            if isinstance(v, dict) and seg in v:
                v = v[seg]
            elif isinstance(v, list) and seg.isdigit() and int(seg) < len(v):
                v = v[int(seg)]
            else:
                return {**head, 'error': f'"{part}" is not in this page\'s data.', 'outline': _brief(root)}
        text = json.dumps(v, default=str, separators=(',', ':'))
        if len(text) > limit:
            if isinstance(v, list):
                return {**head, 'part': part, 'items_total': len(v), 'items': v[:max(1, int(len(v) * limit / len(text)))],
                        'note': f'{len(v)} items, the first ones shown; use find to search them'}
            return {**head, 'part': part, 'outline': _brief(v), 'note': 'too large to show whole: read one of its keys with part=<this>/<key>'}
        return {**head, 'part': part, 'data': v}
    return {**head, 'outline': _brief(root), 'next': 'read_source with part=<key> for a section, or find=<words> to search it'}
