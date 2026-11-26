"""Read only. Follows every pointer the Data Genie and the Data Scientist are given (source keys, dashboard sections and
parts, method topics, dataset IDs, the page registry) against the live site's Genie files with the new code on top.
usage: genie_audit.py <app dir> <code dir> <out.txt>"""
import glob, io, json, os, re, sys, traceback, urllib.request
APP, CODE, OUT = sys.argv[1:4]
sys.path.insert(0, APP); os.chdir(APP)
lines, bad = [], []
def log(*a): lines.append(' '.join(str(x) for x in a))
def flag(kind, what, detail): bad.append((kind, what, str(detail)[:300])); log('FAIL', kind, what, '|', str(detail)[:300])

import agent, registry, methods, analyst                     # noqa: E402
dash = json.load(open(os.path.join(APP, '_dash.json'), encoding='utf-8'))
tax = json.load(open(os.path.join(APP, '_tax.json'), encoding='utf-8')) if os.path.exists(os.path.join(APP, '_tax.json')) else None
pick = ['wards_summary', 'period', 'prev_period', 'period_spec', 'built_at', 'scope', 'population', 'stale']
wards = {k: dash.get(k) for k in pick}['wards_summary']
A = agent.Agent(lambda: {'api_key': '', 'models': {}}, lambda ev: None, os.path.join(APP, '_down'), lambda: dash, os.path.join(APP, '_appdata'), lambda: wards)
os.makedirs(os.path.join(APP, '_down'), exist_ok=True)
A.tax_provider = lambda: tax
def call(name, args):
    try:
        r = A.run_tool(name, args)
    except Exception as e:                                   # noqa: BLE001
        return {'__exception__': f'{type(e).__name__}: {e}', 'tb': traceback.format_exc()[-600:]}
    return r
def err_of(r):
    if isinstance(r, dict):
        if '__exception__' in r: return r['__exception__'] + ' ' + r.get('tb', '')
        if r.get('error'): return r['error']
    if r in (None, {}, []): return 'empty result'
    if isinstance(r, str) and re.search(r'not available|could not|error', r, re.I) and len(r) < 400: return r
    return None

# 1. every registered page and its data files
reg = registry.load(None)
log('registry pages', len(reg))
for p in reg:
    if p.get('files'):
        r = registry.read(p['key'], os.path.join(APP, '_appdata'))
        e = err_of(r)
        if e: flag('page file', p['key'], f"{e} files={[f[0] for f in p['files']]}")
    if p.get('section'):
        pass
    if p.get('scientist') and p['scientist'] not in analyst.BY_KEY:
        flag('scientist topic', p['key'], f"scientist={p['scientist']} is not a Data Scientist topic")

# 2. text the assistants read: tool descriptions, system prompts, analyst topics, registry read lines, module notes
texts = {'agent.TOOLS': json.dumps(agent.TOOLS), 'agent.SYSTEM': agent.SYSTEM,
         'analyst.TOPICS': json.dumps(analyst.TOPICS, default=str), 'registry.read': json.dumps([p.get('read') for p in reg])}
for f in sorted(glob.glob(os.path.join(CODE, '*.py'))):
    texts['src:' + os.path.basename(f)] = open(f, encoding='utf-8').read()
ENUM = next(t for t in agent.TOOLS if t['name'] == 'get_dashboard')['input_schema']['properties']['section']['enum']
keys = {p['key'] for p in reg} | {p.get('view') for p in reg}
topics = {m['key'] for m in methods.METHODS}
seen = set()
for src, t in texts.items():
    for m in re.finditer(r'read_source[^.;)]{0,20}?key\s*=\s*\\?["\']?([\w\-]+(?::[\w\-]+)?)', t):
        k = m.group(1)
        if (src, 'rs', k) in seen: continue
        seen.add((src, 'rs', k))
        if k not in keys and k not in ('X', 'K') and not k.endswith(':'):
            flag('read_source key', k, f'named in {src} but not in the registry ({t[max(0, m.start()-80):m.end()+40]!r})')
    for m in re.finditer(r'get_method[^.;)]{0,12}?topic\s*[= ]\s*\\?["\']?([\w\-]+)', t):
        k = m.group(1)
        if k in ('a', 'X', 'key') or (src, 'gm', k) in seen: continue
        seen.add((src, 'gm', k))
        r = methods.find(k)
        if r.get('error'): flag('get_method topic', k, f'named in {src}: {r["error"]}')
    for m in re.finditer(r'(?<![\w.])section\s?=\s?\\?["\']?([a-z_0-9]+)', t):
        k = m.group(1)
        if (src, 'sec', k) in seen: continue
        seen.add((src, 'sec', k))
        if k not in ENUM and k not in ('X', 'section', 'none'):
            flag('dashboard section', k, f'named in {src} but get_dashboard has no such section ({t[max(0, m.start()-60):m.end()+40]!r})')

# 3. every section, and every part its description names
desc = next(t for t in agent.TOOLS if t['name'] == 'get_dashboard')['description']
seg = {}
for m in re.finditer(r'section="([a-z_0-9]+)"', desc):
    nxt = re.search(r'section="', desc[m.end():])
    seg.setdefault(m.group(1), '')
    seg[m.group(1)] += desc[m.end(): m.end() + (nxt.start() if nxt else len(desc))]
for p in reg:                                                  # registry read lines: "section=x (part a, b ...)"
    for m in re.finditer(r'section=([a-z_0-9]+)\s*\(([^)]*)\)', p.get('read') or ''):
        seg.setdefault(m.group(1), ''); seg[m.group(1)] += ' ' + m.group(2)
extra = {}                                                     # parts named anywhere: "section X ... part Y"
for src, t in texts.items():
    last, pos = None, -1
    for m in re.finditer(r'(?<![\w.])(section|part)\s?[= ]\s?\\?["\']?([a-z_0-9]+)', t):
        if m.group(1) == 'section':
            last, pos = m.group(2), m.end()
        elif last in ENUM and m.start() - pos < 300:
            extra.setdefault(last, set()).add(m.group(2))
ok_sections = 0
for s in ENUM:
    r = call('get_dashboard', {'section': s, 'ward': 5} if s == 'profile' else {'section': s})
    e = err_of(r)
    if e: flag('section', s, e)
    else: ok_sections += 1
    cand = set(re.findall(r'part\s*=\s*"?([a-z_0-9]+)"?', seg.get(s, '')))
    for m in re.finditer(r'part\s*=?\s*"?[a-z_0-9]+"?((?:\s*(?:,|or)\s*"[a-z_0-9]+")+)', seg.get(s, '')):
        cand |= set(re.findall(r'"([a-z_0-9]+)"', m.group(1)))
    m = re.search(r'\bpart ([a-z_0-9, ]+?)(?:\)|;|$)', seg.get(s, ''))
    for m in re.finditer(r'\(part ([^)]*)\)', seg.get(s, '')):
        cand |= {w.split()[0] for w in m.group(1).split(',') if w.strip()}
    cand |= set(re.findall(r'"([a-z_0-9]+)"', seg.get(s, '')))
    cand |= extra.get(s, set())
    for part in sorted(cand):
        args = {'section': s, 'part': part}
        if part in ('case',): args['find'] = '1'
        if part in ('province',): args['province'] = 'AB'
        if part in ('chapter',): args['chapter'] = 1
        r = call('get_dashboard', args)
        e = err_of(r)
        log('part', s, part, 'FAIL' if e else 'ok', (e or '')[:160])
        if e: flag('section part', f'{s}/{part}', e)
log('sections ok', ok_sections, 'of', len(ENUM))

# 4. the tools that need no AI: list_sources, read_source on each page, methods index
for k in sorted(keys - {None}):
    pass
r = call('list_sources', {})
if err_of(r): flag('list_sources', '', err_of(r))
r = call('get_method', {})
if err_of(r): flag('get_method', '(index)', err_of(r))

# 5. budget against actual (the fix)
r = call('get_dashboard', {'section': 'budget_intelligence', 'part': 'actual'})
log('actual surplus', [(x['year'], x['operating_surplus_m']) for x in r.get('operating_surplus', [])] if isinstance(r, dict) else r)
log('actual where', len(r.get('where_the_surplus_goes', [])) if isinstance(r, dict) else r)
r = registry.read('budget-intelligence', os.path.join(APP, '_appdata'), None, 'surplus')
log('read_source budget-intelligence find surplus matches', r.get('matches'), r.get('error'))

# 6. City dataset IDs the assistants are told about
ids = {}
for src, t in texts.items():
    for m in re.finditer(r'(?<![\w/-])([a-z0-9]{4}-[a-z0-9]{4})(?![\w-])', t):
        i = m.group(1)
        if re.search(r'[a-z]', i) and re.search(r'\d', i):
            ids.setdefault(i, set()).add(src)
log('dataset ids named', len(ids))
for i in sorted(ids):
    st = None
    for host in ('data.calgary.ca', 'data.edmonton.ca', 'data.winnipeg.ca', 'data.cityofnewyork.us'):
        try:
            with urllib.request.urlopen(urllib.request.Request(f'https://{host}/api/views/{i}.json', headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as rr:
                d = json.loads(rr.read()); st = f"{host} ok: {d.get('name')}"
                break
        except Exception as e:                               # noqa: BLE001
            st = f'{host} {getattr(e, "code", e)}'
    log('dataset', i, st, sorted(ids[i])[:4])
    if ' ok:' not in st: flag('dataset id', i, f'{st}; named in {sorted(ids[i])[:4]}')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(f'FAILURES {len(bad)}\n')
    for b in bad: f.write(' | '.join(b) + '\n')
    f.write('\n==== log\n' + '\n'.join(lines))
print('failures', len(bad))
