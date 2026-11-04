"""The app's own code, for answering "how exactly is this worked out?" from the code that produced the number.

Data Genie's get_code tool reads from here: a topic gives the functions and constants behind a figure, a name gives
one function or constant from any of the app's files, and a search finds lines in a file. Everything is read from the
.py files themselves (on the website too: the daily build ships them), so the answer is always the code that ran.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
FILES = ['dashboard.py', 'attention.py', 'osm.py', 'population.py', 'census.py', 'assets.py', 'families.py', 'police.py',
         'proptax.py', 'budget.py', 'rents.py', 'wards.py', 'geo.py', 'methods.py', 'calgary_data.py', 'auditor.py',
         'analyst.py', 'missing.py', 'profiles.py']
MAX_CHARS = 12000

# where each figure is worked out: (file, name). A name is a function (nested ones too) or a constant.
TOPICS = {
    'needs_attention': {'what': 'Needs attention: score, tiers and the catch-up list',
                        'code': [('attention.py', '*'), ('dashboard.py', 'with_other'), ('dashboard.py', 'with_attention')]},
    'other_amenities': {'what': 'Amenities that are not the City\'s (OpenStreetMap) and how City ones are taken out',
                        'code': [('osm.py', '*')]},
    'amenity_gap': {'what': 'Amenity level of a community, ward and Calgary; the "not kept up with growth" flag',
                    'code': [('dashboard.py', 'GAP_GROWTH_PCT'), ('dashboard.py', 'GAP_LEVEL'), ('dashboard.py', 'GAP_KINDS'),
                             ('dashboard.py', 'MIN_RATE_RESIDENTS'), ('dashboard.py', 'scope_level'),
                             ('dashboard.py', 'amenity_view')]},
    'assets': {'what': 'Counting City assets (benches, playgrounds, trees, park space...) in each community',
               'code': [('assets.py', '*')]},
    'population': {'what': 'Residents today under each way of counting: the City\'s total (default), the growth model, the 2021 Census',
                   'code': [('dashboard.py', 'CITY_POP_APRIL'), ('dashboard.py', 'CITY_POP_SOURCE'),
                            ('dashboard.py', 'DEFAULT_POP_METHOD'), ('dashboard.py', 'POP_METHODS'),
                            ('dashboard.py', 'city_population_at'), ('dashboard.py', 'new_people'),
                            ('dashboard.py', 'city_factor'), ('dashboard.py', 'pace_fix'), ('dashboard.py', 'estimate')]},
    'growth_model': {'what': 'The growth model: 2021 Census plus homes built since, from the assessment roll',
                     'code': [('population.py', '*')]},
    'children': {'what': 'Children aged 0 to 4 and 0 to 14 in each community (City forecast under the default count)',
                 'code': [('dashboard.py', 'CITY_KIDS_APRIL'), ('dashboard.py', 'city_children_at'),
                          ('dashboard.py', 'kids_at'), ('dashboard.py', 'kid_factors'), ('dashboard.py', 'kids_for')]},
    'rates': {'what': 'Rates per 1,000 residents, growth %, and the ward comparison measures',
              'code': [('dashboard.py', '_pct'), ('dashboard.py', 'GROWING_PCT'), ('dashboard.py', 'ward_summaries')]},
    'periods': {'what': 'The 12-month period and the year before it',
                'code': [('dashboard.py', 'periods'), ('dashboard.py', '_month_start')]},
    'property_tax': {'what': 'Property tax by ward and community (estimate)', 'code': [('proptax.py', '*')]},
    'budget': {'what': 'City budget and revenue', 'code': [('budget.py', '*')]},
    'crime': {'what': 'Crime and disorder by ward and community (Calgary Police Service file)', 'code': [('police.py', '*')]},
    'child_care': {'what': 'Licensed child care spaces and schools', 'code': [('families.py', '*')]},
    'rents': {'what': 'Rents and vacancy (CMHC)', 'code': [('rents.py', '*')]},
    'wards': {'what': 'Which ward each community belongs to', 'code': [('wards.py', '*')]},
    'census': {'what': 'Which Census the app uses and checking for a newer one', 'code': [('census.py', '*')]},
    'report_auditor': {'what': 'How the report auditor checks Data Scientist reports', 'code': [('auditor.py', '*')]},
}


def _text(file):
    name = os.path.basename(str(file or ''))
    if name not in FILES:
        raise KeyError(f'"{file}" is not one of the app\'s calculation files: {", ".join(FILES)}')
    path = os.path.join(HERE, name)
    if not os.path.exists(path):
        raise KeyError(f'{name} is not on this computer')
    with open(path, encoding='utf-8') as f:
        return f.read()


def block(file, name):
    """One function (nested ones too) or constant from a file, with its line number."""
    lines = _text(file).splitlines()
    n = re.escape(name)
    # a function first (nested ones too), then a top-level constant, then a variable inside a function
    pats = [re.compile(rf'^(\s*)def\s+{n}\s*\('), re.compile(rf'^()(?:{n})\s*=[^=]'), re.compile(rf'^(\s+)(?:{n})\s*=[^=]')]
    found = next(((i, p.match(line)) for p in pats for i, line in enumerate(lines) if p.match(line)), None)
    for i, m in [found] if found else []:
        indent = len(m.group(1))
        is_def = lines[i].lstrip().startswith('def ')
        j = i + 1
        while j < len(lines):
            s = lines[j]
            if s.strip() and (len(s) - len(s.lstrip())) <= indent and not s.lstrip().startswith((')', ']', '}')):
                if is_def or not lines[j - 1].rstrip().endswith((',', '(', '[', '{', '\\')):
                    break
            j += 1
        while j > i + 1 and not lines[j - 1].strip():
            j -= 1
        return {'file': os.path.basename(file), 'name': name, 'line': i + 1, 'code': '\n'.join(lines[i:j])}
    return None


def search(file, text, around=3, limit=25):
    """Lines of a file holding the text (or regular expression), with a few lines around each."""
    lines = _text(file).splitlines()
    try:
        pat = re.compile(text, re.I)
    except re.error:
        pat = re.compile(re.escape(text), re.I)
    hits, last = [], -1
    for i, line in enumerate(lines):
        if pat.search(line) and i > last:
            a, b = max(0, i - around), min(len(lines), i + around + 1)
            hits.append({'line': i + 1, 'code': '\n'.join(f'{n + 1}: {lines[n]}' for n in range(a, b))})
            last = b - 1
            if len(hits) >= limit:
                break
    return hits


def get(topic=None, name=None, file=None, text=None):
    """The code behind a figure. topic: a key of TOPICS; name: a function or constant (file optional);
    text + file: search a file. Nothing: the list of topics and files."""
    try:
        if text:
            if not file:
                return {'search': text, 'hits': {f: h for f in FILES if os.path.exists(os.path.join(HERE, f))
                                                 for h in [search(f, text, 2, 8)] if h}}
            return {'file': file, 'search': text, 'hits': search(file, text)}
        if name:
            for f in ([file] if file else FILES):
                if os.path.exists(os.path.join(HERE, os.path.basename(f))):
                    b = block(f, name)
                    if b:
                        return b
            return {'error': f'No function or constant called {name}', 'files': FILES}
        if topic:
            t = str(topic).strip().lower().replace(' ', '_')
            key = t if t in TOPICS else next((k for k, v in TOPICS.items() if t in k or t in v['what'].lower()), None)
            if not key:
                return {'error': f'No topic "{topic}"', 'topics': {k: v['what'] for k, v in TOPICS.items()}}
            parts, size = [], 0
            for f, n in TOPICS[key]['code']:
                b = {'file': f, 'name': '(whole file)', 'line': 1, 'code': _text(f)} if n == '*' else block(f, n)
                if not b:
                    continue
                if size + len(b['code']) > MAX_CHARS:
                    b = {**b, 'code': b['code'][:max(0, MAX_CHARS - size)] + '\n... (cut; ask for this name or search the file for the rest)'}
                parts.append(b)
                size += len(b['code'])
                if size >= MAX_CHARS:
                    break
            return {'topic': key, 'what': TOPICS[key]['what'], 'code': parts}
    except KeyError as e:
        return {'error': str(e).strip('"\''), 'files': FILES}
    return {'topics': {k: v['what'] for k, v in TOPICS.items()}, 'files': FILES,
            'how': 'Pass topic, or name (a function or constant, optionally with file), or text with a file to search.'}
