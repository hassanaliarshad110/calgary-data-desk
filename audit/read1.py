"""Reading 1 (pdftotext -layout text): the budget-to-actual tables of the City's Annual Financial Reports.
usage: read1.py <afr-YYYY.txt> <year>  -> JSON on stdout. Every figure is in $ thousands as printed."""
import json, re, sys
txt, Y = open(sys.argv[1], encoding='utf-8', errors='replace').read(), sys.argv[2]
pages = txt.split('\f')
NUM = re.compile(r'\(?\$?\s*[\d,]+\)?|–')
def num(t):
    t = t.replace('$', '').replace(',', '').strip()
    if t in ('–', '-'): return 0
    neg = t.startswith('(')
    v = int(t.strip('()'))
    return -v if neg else v
def rows_after(title, stop_words, ncols):
    for pi, p in enumerate(pages):
        m = re.search(title, p, re.I)
        if not m: continue
        out, printed = [], re.findall(r'Annual Financial Report\s+(\d+)\s*$', p, re.M) or re.findall(r'^\s*(\d+)\s+The City of Calgary', p, re.M)
        for line in p[m.end():].splitlines():
            if any(w in line for w in stop_words) and out: break
            toks = re.findall(r'\(?\$?\s*[\d,]{2,}\)?|\s–\s|\s–$|\(\d+%\)|\d+%', line)
            label = re.split(r'\s{2,}|\$', line.strip())[0].strip()
            nums = [t for t in re.findall(r'\(?[\d,]+\)?(?!%)|(?<=\s)–(?=\s|$)', line.split(label, 1)[1] if label else line) if not re.fullmatch(r'\(?\d{1,3}\)?', t) or t in ('–',)]
            pct = re.findall(r'\(?\d+%\)?|(?<=\s)–\s*$', line)
            vals = re.findall(r'\(\s*[\d,]+\s*\)|[\d,]{1,}(?=\s|$)|(?<=\s)–(?=\s|$)', line[len(line) - len(line.lstrip()) + len(label):])
            if label and len(vals) >= ncols and not label.lower().startswith(('budget', 'for the year', '2025', '2024', '2023')):
                out.append({'label': label, 'cells': vals})
            elif not label and len(vals) >= ncols:
                out.append({'label': 'Total', 'cells': vals})
        return {'pdf_page': pi + 1, 'printed_page': printed[0] if printed else None, 'rows': out}
    return None
rev = rows_after(r'Revenues\s*[–-]\s*Budget to actual comparison', ['Net taxes available for municipal purposes were', 'The City’s consolidated revenues'], 3)
exp = rows_after(r'Expenses\s*[–-]\s*Budget to actual comparison', ['In order to comply', 'Due to ambiguity'], 5)
def clean(block, n):
    for r in block['rows']:
        c = [x for x in r['cells'] if not re.fullmatch(r'\(?\d{1,3}\)?', x.replace(',', '')) or x == '–' or len(x.replace(',', '').strip('()')) > 3]
        r['values'] = [num(x) for x in c[:n]]
        del r['cells']
    return block
print(json.dumps({'year': Y, 'revenues': clean(rev, 3), 'expenses': clean(exp, 3) if exp else None}, indent=1))
