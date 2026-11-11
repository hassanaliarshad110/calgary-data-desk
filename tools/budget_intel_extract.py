"""Budget Intelligence: read every business case out of the City of Calgary's "2027-2030 budget request business
cases" (792 pages) into ui/budget-intel/business-cases.json.

Facts only: each case's number, title, department and business unit, the amounts and staff the City proposes, the
categories the City assigns, and the page of the City's document where the case starts. Names are kept exactly as the
City prints them (the crosswalk in ui/budget-intel/crosswalk.json matches them to the City's open budget data).
The City's descriptions, benefits and risk statements are not copied: every case links to its page in the
City's document.

Run by hand when the City publishes a new version of the document (it is not part of the daily refresh):

    python tools/budget_intel_extract.py path/to/2027-2030-operating-capital-budget-requests.pdf

Needs pdftotext (poppler-utils). The script stops without writing anything if a case cannot be read in full.
"""
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'ui', 'budget-intel', 'business-cases.json')
URL = 'https://www.calgary.ca/content/dam/www/ca/city-manager/documents/2027-2030-budget/2027-2030-operating-capital-budget-requests.pdf'
THEMES = ['Reliable and sustainable infrastructure', 'Safe city', 'Functional transportation network',
          'Community livability and well-being', 'Balanced growth and evolving neighbourhoods',
          'Trusted and collaborative government']
YEARS = ['2027', '2028', '2029', '2030']
NUMTOK = r'\(?-?[\d,]+(?:\.\d+)?\)?|[-–—]'
RATINGS = ('Low', 'Slight', 'Medium', 'High', 'Extensive')


def clean(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def num(tok):
    """A figure as the City prints it: a dash is nil (kept as null), (1,234) is negative."""
    tok = tok.strip()
    if tok in ('-', '–', '—'):
        return None
    neg = tok.startswith('(') and tok.endswith(')')
    v = float(tok.strip('()').replace(',', '').replace('$', ''))
    v = -v if neg else v
    return int(v) if v == int(v) and '.' not in tok else v


def read_toc(pages, problems):
    """The table of contents (pages 2 to 10): theme, case number, title and starting page."""
    toc, theme, buf = [], None, ''
    for pi in range(1, 10):
        for ln in pages[pi].split('\n'):
            s = ln.strip()
            if not s or s == 'TABLE OF CONTENTS' or s.startswith('ISC:') or re.fullmatch(r'\d+', s):
                continue
            if s in THEMES and not buf:
                theme = s
                continue
            m0 = re.match(r'^(\d+)\s', s)
            if buf and m0 and int(m0.group(1)) == len(toc) + 2:      # a line with no dot leaders: title runs into the page number
                m = re.match(r'^(\d+)\s+(.*?)\s*(\d{2,3})$', buf)
                if m and int(m.group(1)) == len(toc) + 1:
                    toc.append({'theme': theme, 'n': int(m.group(1)), 'page': int(m.group(3))})
                    buf = ''
            buf = (buf + ' ' + s).strip()
            m = re.match(r'^(\d+)\s+(.*?)\s*\.{2,}\s*(\d+)$', buf)
            if m:
                toc.append({'theme': theme, 'n': int(m.group(1)), 'title': clean(m.group(2)), 'page': int(m.group(3))})
                buf = ''
    if buf:
        problems.append('contents: text left over: ' + buf[:80])
    if [e['n'] for e in toc] != list(range(1, len(toc) + 1)):
        problems.append('contents: the case numbers are not 1, 2, 3 ... without a gap')
    if any(a['page'] > b['page'] for a, b in zip(toc, toc[1:])):
        problems.append('contents: the page numbers do not rise')
    return toc


def heading(page_text, n):
    """The case's title as printed at the top of its first page."""
    h = []
    for ln in page_text.split('\n'):
        if re.match(r'^\s*(Budget proposal rationale:|Department\b)', ln):
            break
        if ln.strip():
            h.append(ln.strip())
    s = ''
    for ln in h:
        s = (s + ln) if s.endswith('-') and not s.endswith(' -') else (s + ' ' + ln).strip()
    return re.sub(r'^%d\s+' % n, '', s).strip()


def row(label_re, body, n, what, case, problems):
    m = re.search(r'^[ \t]*' + label_re + r'[ \t]+((?:(?:' + NUMTOK + r')[ \t]*)+)$', body, re.M)
    if not m:
        problems.append(f'case {case}: row not found: {what}')
        return None
    toks = re.findall(NUMTOK, m.group(1))
    if len(toks) != n:
        problems.append(f'case {case}: {what}: expected {n} figures, found {len(toks)}')
        return None
    return [num(x) for x in toks]


def after(label, body, stop=None):
    m = re.search(re.escape(label) + r'[ \t]*(.*)', body)
    if not m:
        return None
    out = [m.group(1)]
    for ln in body[m.end():].split('\n')[1:]:
        if not ln.strip() or (stop and re.search(stop, ln)):
            break
        out.append(ln)
    return clean(' '.join(out)) or None


def metric(body):
    """The performance metric: when it runs over several lines the City centres them on the label, so the value
    is the indented lines directly above the label, the rest of the label's line, and the indented lines below."""
    L = body.split('\n')
    for k, ln in enumerate(L):
        m = re.match(r'^Performance metric:[ \t]*(.*)$', ln)
        if not m:
            continue
        ind = lambda s: bool(s.strip()) and len(s) - len(s.lstrip()) >= 20
        up, j = [], k - 1
        while j >= 0 and ind(L[j]):
            up.insert(0, L[j]); j -= 1
        down, j = [], k + 1
        while j < len(L) and ind(L[j]):
            down.append(L[j]); j += 1
        return clean(' '.join(up + [m.group(1)] + down)) or None
    return None


def columns(block_lines, cuts):
    """Text set in columns: cut every line at the header's column starts."""
    cuts = list(cuts) + [None]
    return [clean(' '.join(l[a:b] for l in block_lines)) for a, b in zip([0] + cuts[:-1], cuts)]


def wards(text):
    if not text:
        return None
    if re.fullmatch(r'All Wards', text.strip(), re.I):
        return 'all'
    ws = [int(x) for x in re.findall(r'Ward\s+(\d+)', text)]
    return ws or None


def parse(pdf):
    raw = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, check=True).stdout.decode('utf-8')
    pages = raw.split('\f')
    while pages and not pages[-1].strip():
        pages.pop()
    problems = []
    toc = read_toc(pages, problems)
    cases = []
    for i, e in enumerate(toc):
        n, a = e['n'], e['page']
        b = toc[i + 1]['page'] if i + 1 < len(toc) else len(pages) + 1
        b = max(b, a + 1)
        body = '\n'.join('\n'.join(ln for ln in pages[p - 1].split('\n') if not re.match(r'^\s*ISC: UNRESTRICTED', ln)) for p in range(a, b))
        title = heading(pages[a - 1], n)
        key = lambda s: re.sub(r'[^a-z0-9]', '', (s or '').lower())
        if 'title' in e and key(e['title']) != key(title):
            problems.append(f'case {n}: the title on page {a} is not the title in the contents')
        # the printed page number at the foot of the page must be the PDF's own page number (so #page=N opens the case)
        foot = re.search(r'ISC: UNRESTRICTED.*?(\d+)\s*$', pages[a - 1], re.M)
        if not foot or int(foot.group(1)) != a:
            problems.append(f'case {n}: printed page number is not {a}')
        c = {'n': n, 'title': title, 'theme': e['theme'], 'page': a, 'pages': b - a}
        if 'Capital Funding Consideration' in body:
            c['type'] = 'capital'
            m = re.search(r'^(Department[ \t]+)Business Unit[ \t]*\n(.+?)\n\s*\n', body, re.M | re.S)
            if m:
                c['dept'], c['bu'] = columns(m.group(2).split('\n'), [len(m.group(1))])
            else:
                problems.append(f'case {n}: department and business unit not found')
            c['required'] = bool(re.search(r'This investment has been identified as\s+Required', body))
            r4 = row(r'4-Year Capital Budget Consideration', body, 6, '4-year capital budget consideration', n, problems)
            r10 = row(r'10-Year Capital Infrastructure Needs', body, 5, '10-year capital infrastructure needs', n, problems)
            if r4:
                c['cap_k'] = r4                      # $000s: total, 2027, 2028, 2029, 2030, 2031 and later
                if abs((r4[0] or 0) - sum(v or 0 for v in r4[1:])) > 3:
                    problems.append(f'case {n}: the capital total is not the sum of its years')
            if r10:
                c['needs_k'] = r10                   # $000s: 2027, 2028, 2029, 2030, 2031 and later
            m = re.search(r'^(Budget ID[ \t]+)(Opportunity Type[ \t]+)Ward\(s\)[ \t]*\n(.+?)\n\s*\n', body, re.M | re.S)
            if m:
                c['budget_id'], c['kind'], wt = columns(m.group(3).split('\n'), [len(m.group(1)), len(m.group(1)) + len(m.group(2))])
                c['wards'] = wards(wt)
                if c['wards'] is None:
                    problems.append(f'case {n}: ward(s) not read: {wt[:40]}')
            else:
                problems.append(f'case {n}: Budget ID, Opportunity Type and Ward(s) not found')
            m = re.search(r'^(Investment Stage[ \t]+)(New or Existing Investment[ \t]+)Budget Proposal Rationale[ \t]*\n(.+?)\n\s*\n', body, re.M | re.S)
            if m:
                c['stage'], ne, c['rationale'] = columns(m.group(3).split('\n'), [len(m.group(1)), len(m.group(1)) + len(m.group(2))])
                c['new'] = ne.startswith('New')
                if ne not in ('New Opportunity', 'Existing Opportunity'):
                    problems.append(f'case {n}: new or existing not recognised: {ne[:40]}')
            else:
                problems.append(f'case {n}: Investment Stage block not found')
            c['funding'] = after('Funding Source:', body)
            c['service_area'] = after('Major Service Area:', body, r'Council Strategic Priority:')
            c['priority'] = after('Council Strategic Priority:', body, r'Community Outcome:')
            c['corp_risk'] = after('Primary Alignment to Principal Corporate Risk:', body)
            c['op_risk'] = after('Primary Corporate Operating Risk:', body)
            m = re.search(r'Maintenance/Replacement[ \t]+Growth[ \t]+Service Enhancement[ \t]+Transformative[ \t]*\n[ \t]*(\d+)%[ \t]+(\d+)%[ \t]+(\d+)%[ \t]+(\d+)%', body)
            if m:
                c['split'] = [int(m.group(k)) for k in (1, 2, 3, 4)]      # % maintenance or replacement, growth, service enhancement, transformative
                if sum(c['split']) not in (99, 100, 101):
                    problems.append(f'case {n}: the four purposes add to {sum(c["split"])}%')
            else:
                problems.append(f'case {n}: maintenance, growth, enhancement, transformative split not found')
            for k in ('funding', 'service_area', 'priority', 'op_risk'):
                if not c.get(k):
                    problems.append(f'case {n}: {k} not found')
            if key(c.get('priority', '').replace('&', 'and')) != key(e['theme']):
                problems.append(f'case {n}: Council priority "{c.get("priority")}" is not its section of the contents "{e["theme"]}"')
        elif 'Proposed funding amount' in body:
            c['type'] = 'operating'
            c['rationale'] = after('Budget proposal rationale:', body, r'^Department:')
            m = re.search(r'^(Department:[ \t]+)(.*?)(Business unit:[ \t]+)(.*)$', body, re.M)
            if m:
                d0 = len(m.group(1)); ul = d0 + len(m.group(2)); u0 = ul + len(m.group(3))
                d, u = [m.group(2)], [m.group(4)]
                for ln in body[m.end():].split('\n')[1:]:
                    if not ln.strip():
                        break
                    d.append(ln[d0:ul]); u.append(ln[u0:])
                c['dept'], c['bu'] = clean(' '.join(d)), clean(' '.join(u))
            else:
                problems.append(f'case {n}: department and business unit not found')
            ot = row(r'One-time \(\$M\)\**', body, 4, 'one-time funding', n, problems)
            og = row(r'Ongoing \(\$M\)\**', body, 4, 'ongoing funding', n, problems)
            ft = row(r'FTEs\*+', body, 4, 'FTEs', n, problems)
            if ot: c['one_time_m'] = ot              # $ millions: 2027, 2028, 2029, 2030
            if og: c['ongoing_m'] = og
            if ft: c['ftes'] = ft
            # a starred amount row (or a second star on the FTE row) means the City added a note under the table
            c['footnotes'] = bool(re.search(r'^[ \t]*(One-time \(\$M\)\*|Ongoing \(\$M\)\*|FTEs\*\*)', body, re.M))
            # some of those notes say the full one-time request is larger than the part the 2027-2030 budget includes
            m = re.search(r'total\s+one-time\s+funding\s+(?:request\s+for\s+this\s+initiative|requirement)\s+is\s+\$([\d,.]+)\s+million', body)
            if m:
                c['full_one_time_m'] = num(m.group(1).rstrip('.'))     # $ millions over four years, as the City's note states it
                if not c['footnotes']:
                    problems.append(f'case {n}: a note about the full request, but no starred row')
            c['metric'] = metric(body)
            c['plan'] = after('Alignment to long-term plan:', body)
            c['risk'] = None
            m = re.search(r'^(Primary risk that this proposal is managing/mitigating[ \t]+)Primary risk rating[ \t]*\n((?:.*\n){1,14})', body, re.M)
            if m:
                blk = []
                for l in m.group(2).split('\n'):
                    if l.startswith('Risks associated'):
                        break
                    blk.append(l[len(m.group(1)):])
                right = clean(' '.join(blk))
                if right in RATINGS:
                    c['risk'] = right
                elif right:
                    problems.append(f'case {n}: risk rating not recognised: {right[:40]}')
        else:
            problems.append(f'case {n}: neither the operating nor the capital layout')
        if not c.get('dept') or not c.get('bu'):
            problems.append(f'case {n}: department or business unit empty')
        cases.append(c)
    return pages, toc, cases, problems


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pdf = sys.argv[1]
    pages, toc, cases, problems = parse(pdf)
    if problems:
        print(f'{len(problems)} problem(s); nothing written:')
        for p in problems[:80]:
            print('  ', p)
        sys.exit(1)
    info = subprocess.run(['pdfinfo', '-isodates', pdf], capture_output=True).stdout.decode('utf-8', 'ignore')
    mod = re.search(r'ModDate:\s*(.+)', info)
    with open(pdf, 'rb') as f:
        sha = hashlib.sha256(f.read()).hexdigest()
    cap = [c for c in cases if c['type'] == 'capital']
    op = [c for c in cases if c['type'] == 'operating']
    out = {
        'note': 'Every business case in the City of Calgary\'s "2027-2030 budget request business cases": number, title, department, '
                'business unit, the amounts and staff proposed, the City\'s own categories, and the page of the City\'s document. '
                'Proposed to Council on November 10, 2026; not approved. Read by tools/budget_intel_extract.py; names are as the City prints them.',
        'source': {'title': '2027–2030 budget request business cases', 'publisher': 'The City of Calgary', 'url': URL,
                   'pages': len(pages), 'sha256': sha, 'modified': clean(mod.group(1))[:10] if mod else None,
                   'read': datetime.date.today().isoformat()},
        'status': 'Proposed by Administration; before Council. Nothing here is approved until Council votes on the 2027–2030 budget.',
        'units': {'cap_k': 'thousands of dollars: total, 2027, 2028, 2029, 2030, 2031 and later (the City\'s "4-Year Capital Budget Consideration")',
                  'needs_k': 'thousands of dollars: 2027, 2028, 2029, 2030, 2031 and later (the City\'s "10-Year Capital Infrastructure Needs")',
                  'one_time_m': 'millions of dollars, one-time: 2027, 2028, 2029, 2030', 'ongoing_m': 'millions of dollars, ongoing: 2027, 2028, 2029, 2030',
                  'ftes': 'full-time equivalents: 2027, 2028, 2029, 2030', 'split': 'per cent: maintenance or replacement, growth, service enhancement, transformative',
                  'full_one_time_m': 'millions of dollars: the full one-time request over four years, only where the City\'s note under the table says the budget includes part of it',
                  'null': 'a dash in the City\'s table (nil)'},
        'themes': THEMES,
        'counts': {'cases': len(cases), 'operating': len(op), 'capital': len(cap)},
        'totals': {
            'capital_k': [sum(c['cap_k'][i] or 0 for c in cap) for i in range(6)],
            'one_time_m': [round(sum(c['one_time_m'][i] or 0 for c in op), 1) for i in range(4)],
            'ongoing_m': [round(sum(c['ongoing_m'][i] or 0 for c in op), 1) for i in range(4)],
            'ftes': [round(sum(c['ftes'][i] or 0 for c in op), 1) for i in range(4)],
        },
        'cases': cases,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{len(cases)} cases ({len(op)} operating, {len(cap)} capital) from {len(pages)} pages -> {os.path.relpath(OUT)} ({os.path.getsize(OUT):,} bytes)')
    print('totals:', json.dumps(out['totals']))


if __name__ == '__main__':
    main()
