"""Third reading, step 2: read every figure and category of all 384 business cases again from pdfplumber's words and
their positions, and compare with ui/budget-intel/business-cases.json. A number is put in a column by where it sits on
the page (the right edge of the number against the right edge of the column heading), not by counting characters
(reading 1, pdftotext -layout) or tokens (reading 2, pypdf). Nothing is corrected here: differences are only listed."""
import sys, json, re
words_file, cases_file, out_file = sys.argv[1], sys.argv[2], sys.argv[3]
PAGES = json.load(open(words_file)); BC = json.load(open(cases_file))
NUM = re.compile(r'^\(?\$?[\d,]*\.?\d+\)?%?$|^[-–—]$')

def val(t):
    if t in ('-', '–', '—'): return None
    neg = t.startswith('(') and t.endswith(')')
    v = float(t.strip('()%').replace(',', '').replace('$', ''))
    v = -v if neg else v
    return int(v) if v == int(v) and '.' not in t else v

def page_lines(page):
    out = []
    for w in sorted(page, key=lambda w: ((w[2] + w[3]) / 2, w[0])):
        mid = (w[2] + w[3]) / 2
        if out and abs(out[-1][0] - mid) <= 4: out[-1][1].append(w)
        else: out.append([mid, [w]])
    return [sorted(ws) for _, ws in out]

def text(line): return ' '.join(w[4] for w in line)
def norm(s): return re.sub(r'[^a-z0-9%$.+&/-]+', ' ', (s or '').lower().replace('’', "'").replace('–', '-')).strip()

def by_column(line, heads):
    """Each number of a table row under the column whose heading's right edge is nearest the number's right edge."""
    toks = [w for w in line if NUM.match(w[4]) and w[1] > heads[0] - 60]
    out = [None] * len(heads); used = set(); bad = []
    for w in toks:
        j = min(range(len(heads)), key=lambda i: abs(heads[i] - w[1]))
        if j in used or abs(heads[j] - w[1]) > 30: bad.append(w[4])
        used.add(j); out[j] = ('dash' if val(w[4]) is None else val(w[4]))
    return out, bad, len(toks)

res = []
for c in BC['cases']:
    first = c['page'] - 1; k = c['pages']
    lines = [ln for p in PAGES[first:first + k] for ln in page_lines(p)]
    T = [text(ln) for ln in lines]
    r = {'n': c['n'], 'type': c['type'], 'page': c['page'], 'checks': {}, 'notes': []}
    def chk(name, got, want):
        ok = got == want
        r['checks'][name] = ok
        if not ok: r['notes'].append(f'{name}: third reading {got!r} | dataset {want!r}')
    def idx(start, frm=0):
        return next((i for i in range(frm, len(T)) if T[i].startswith(start)), None)
    # heading: the number, and the title (which can run over several lines)
    m = re.match(r'^(\d+)\s+(.*)$', T[0]); stop = idx('Budget proposal rationale:') if c['type'] == 'operating' else idx('Department')
    title = ' '.join([m.group(2) if m else ''] + T[1:stop or 1])
    chk('number', int(m.group(1)) if m else None, c['n'])
    chk('title', norm(title).replace('- ', '-'), norm(c['title']).replace('- ', '-'))
    if c['type'] == 'capital':
        d = idx('Department')                                             # two columns: Department | Business Unit
        if d is not None:
            bx = next((w[0] for w in lines[d] if w[4] == 'Business'), 316)
            a, b = [], []
            for ln in lines[d + 1: idx('Investment Description') or d + 2]:
                for w in ln: (a if w[0] < bx - 3 else b).append(w[4])
            chk('department', norm(' '.join(a)), norm(c['dept'])); chk('business unit', norm(' '.join(b)), norm(c['bu']))
        i = idx('Financial Details')
        if i is None: r['notes'].append('no "Financial Details" heading'); res.append(r); continue
        hd = {w[4]: w[1] for w in lines[i]}
        heads = [hd.get(x) for x in ('Total', '2027', '2028', '2029', '2030', '2031+')]
        if None in heads: r['notes'].append('column headings not all found: ' + T[i]); res.append(r); continue
        j, j2 = idx('4-Year Capital Budget Consideration'), idx('10-Year Capital Infrastructure Needs')
        row, bad, ntok = by_column(lines[j], heads) if j is not None else ([None] * 6, ['row missing'], 0)
        chk('capital row has six figures', ntok, 6)
        chk('capital by year ($000s)', [0 if v == 'dash' else v for v in row], [0 if v is None else v for v in c['cap_k']])
        row2, bad2, ntok2 = by_column(lines[j2], heads) if j2 is not None else ([None] * 6, ['row missing'], 0)
        chk('needs row has five figures, none under Total', [ntok2, row2[0]], [5, None])
        chk('10-year needs ($000s)', [0 if v == 'dash' else v for v in row2[1:]], [0 if v is None else v for v in c['needs_k']])
        if bad or bad2: r['notes'].append(f'a figure could not be placed under one heading: {bad + bad2}')
        s = next((q for q, t in enumerate(T) if t.startswith('Maintenance/Replacement') and 'Transformative' in t), None)
        if s is None: r['notes'].append('purpose headings not found')
        else:
            L = lines[s]
            cx = lambda a, b=None: (next(w[0] for w in L if w[4] == a) + next(w[1] for w in L if w[4] == (b or a))) / 2
            hx = [cx('Maintenance/Replacement'), cx('Growth'), cx('Service', 'Enhancement'), cx('Transformative')]
            pw = [w for w in lines[s + 1] if w[4].endswith('%')]
            pct = [None] * 4
            for w in pw:
                jj = min(range(4), key=lambda q: abs(hx[q] - (w[0] + w[1]) / 2)); pct[jj] = val(w[4])
            chk('purpose row has four percentages', len(pw), 4)
            chk('purpose split (%)', pct, c['split'])
            chk('purpose split adds to 100', sum(v for v in pct if isinstance(v, (int, float))), 100)
        def field(label):
            q = idx(label)
            if q is None: return None
            v = T[q][len(label):].strip(); q += 1
            while q < len(T) and not re.match(r'^(Strategic Alignment|Major Service Area|Council Strategic Priority|Community Outcome|Community Indicator|Primary Alignment|Funding Source|Maintenance/Replacement|ISC:)', T[q]):
                v += ' ' + T[q]; q += 1
            return v
        chk('funding source', norm(field('Funding Source:')), norm(c['funding']))
        chk('major service area', norm(field('Major Service Area:')), norm(c['service_area']))
        chk('council priority', norm(field('Council Strategic Priority:')), norm(c['priority']))
        chk('principal corporate risk', norm(field('Primary Alignment to Principal Corporate Risk:')), norm(c['corp_risk']))
        q = idx('Primary Corporate Operating Risk:')
        chk('operating risk', norm(T[q].split(':', 1)[1]) if q is not None else None, norm(c['op_risk']))
        b, st = idx('Budget ID'), idx('Investment Stage')
        def cols(h, end):                                                   # three columns under the headings of line h
            x2 = next(w[0] for w in lines[h] if w[4] in ('Opportunity', 'New')); x3 = next(w[0] for w in lines[h] if w[4] in ('Ward(s)', 'Budget') and w[0] > x2)
            o = [[], [], []]
            for ln in lines[h + 1:end]:
                for w in ln: o[0 if w[0] < x2 - 3 else 1 if w[0] < x3 - 3 else 2].append(w[4])
            return [' '.join(x) for x in o]
        if b is not None and st is not None:
            bid, kind, wd = cols(b, st)
            chk('budget id', norm(bid), norm(c['budget_id'])); chk('opportunity type', norm(kind), norm(c['kind']))
            chk('wards', 'all' if norm(wd) == 'all wards' else sorted(int(x) for x in re.findall(r'\d+', wd)), c['wards'] if c['wards'] == 'all' else sorted(c['wards']))
            stage, newx, rat = cols(st, idx('Funding Source:') or st + 2)
            chk('stage', norm(stage), norm(c['stage']))
            chk('new or existing', norm(newx).startswith('new'), bool(c['new']))
            chk('rationale', norm(rat), norm(c['rationale']))
        chk('"Required" statement', any('identified as Required' in t for t in T), bool(c.get('required')))
    else:
        i = next((q for q, ln in enumerate(lines) if [w[4] for w in ln] == ['2027', '2028', '2029', '2030']), None)
        if i is None: r['notes'].append('no year headings'); res.append(r); continue
        heads = [w[1] for w in lines[i]]
        for key, lab in (('one_time_m', 'One-time ($M)'), ('ongoing_m', 'Ongoing ($M)'), ('ftes', 'FTEs')):
            j = idx(lab, i)
            row, bad, ntok = by_column(lines[j], heads) if j is not None else ([None] * 4, ['row missing'], 0)
            chk(f'{key}: row has four cells', ntok, 4)
            chk(key, [None if v == 'dash' else v for v in row], c[key])
            if bad: r['notes'].append(f'{key}: a figure could not be placed under one heading: {bad}')
        q = idx('Budget proposal rationale:')
        chk('rationale', norm(T[q].split(':', 1)[1]) if q is not None else None, norm(c['rationale']))
        d = idx('Department:')
        if d is not None:
            x1 = next(w[0] for w in lines[d] if w[4] == 'Business'); x2 = next(w[1] for w in lines[d] if w[4] == 'unit:')
            a, b = [], []
            for ln in lines[d: idx('Budget proposal description') or d + 1]:
                for w in ln:
                    if w[4] in ('Department:',) or (x1 - 1 <= w[0] <= x2 and w[4] in ('Business', 'unit:')): continue
                    (a if w[0] < x1 - 3 else b).append(w[4])
            chk('department', norm(' '.join(a)), norm(c['dept'])); chk('business unit', norm(' '.join(b)), norm(c['bu']))
        rk = next((q for q, t in enumerate(T) if 'Primary risk rating' in t), None)
        if rk is not None:
            hx = next(w[0] for w in lines[rk] if w[4] == 'Primary' and w[0] > 250)     # the rating sits under the right-hand heading
            end = next((q for q in range(rk + 1, len(T)) if T[q].startswith('Risks associated')), rk + 8)
            cand = [w[4] for ln in lines[rk + 1:end] for w in ln if w[0] >= hx - 3]
            got = next((x for x in cand if x in ('Low', 'Slight', 'Medium', 'High', 'Extensive')), None)
            chk('risk rating', got, c['risk'])
        whole = re.sub(r'\s+', ' ', ' '.join(T))                      # the City's note about the full one-time request, where there is one
        mf = re.search(r'total one-time funding (?:request for this initiative|requirement) is \$([\d,.]+?)\.? million', whole)
        chk('full one-time request stated in the note', val(mf.group(1)) if mf else None, c.get('full_one_time_m'))
        chk('City note under the table (a starred amount row, or a second star on the FTE row)', bool(re.search(r'One-time \(\$M\)\*|Ongoing \(\$M\)\*|FTEs\*\*', whole)), bool(c.get('footnotes')))
        lp = idx('Alignment to long-term plan:')
        if lp is not None or c.get('plan'):
            got = T[lp].split(':', 1)[1].strip() if lp is not None else ''
            q2 = (lp or 0) + 1
            while lp is not None and q2 < len(T) and not re.match(r'^(Risks|Primary risk|ISC:|Strategic alignment|Corporate strategic)', T[q2]) and len(norm(got)) < len(norm(c.get('plan') or '')):
                got += ' ' + T[q2]; q2 += 1
            chk('long-term plan', norm(got), norm(c.get('plan') or ''))
        sp = next((q for q, t in enumerate(T) if t.startswith('Primary Council strategic priority')), None)
        if sp is not None:                                   # the priority printed on the case against the contents section it sits in
            first_col = ' '.join(w[4] for ln in lines[sp + 1: sp + 4] for w in ln if w[0] < next((x[0] for x in lines[sp] if x[4] == 'Primary' and x[0] > 150), 238) - 3)
            key = lambda t: norm(t).replace('&', 'and').replace(' and ', ' ')
            chk('Council priority printed on the case = its contents section', key(first_col).startswith(key(c['theme'])) or key(c['theme']).startswith(key(first_col)) and len(key(first_col)) > 8, True)
        pm = idx('Performance metric:')
        if pm is not None and c.get('metric'):
            near = norm(' '.join(T[max(0, pm - 3): pm + 4]))
            chk('performance metric words all present', all(wd in near for wd in norm(c['metric']).split()), True)
    res.append(r)

tot = sum(len(r['checks']) for r in res); bad = [(r['n'], k) for r in res for k, v in r['checks'].items() if not v]
print('cases', len(res), '| comparisons', tot, '| agree', tot - len(bad), '| differ', len(bad), '| cases with any difference', len({n for n, _ in bad}))
json.dump({'engine': 'pdfplumber 0.11.10 / pdfminer.six 20260107', 'method': __doc__, 'comparisons': tot, 'agree': tot - len(bad), 'differ': len(bad), 'cases': res}, open(out_file, 'w'), indent=0)
for r in res:
    for nt in r['notes']: print(r['n'], r['type'], '|', nt[:260])
