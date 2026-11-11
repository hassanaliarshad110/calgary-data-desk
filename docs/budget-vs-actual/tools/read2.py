"""Reading 2 (pdfplumber/pdfminer, a different engine): the same tables from the PDF, and the arithmetic checks.
usage: read2.py <afr.pdf> <r1.json>"""
import json, re, sys, pdfplumber
pdf, r1 = sys.argv[1], json.load(open(sys.argv[2]))
def num(t):
    t = t.replace('$', '').replace(',', '').strip()
    if t in ('–', '-'): return 0
    return -int(t.strip('()')) if t.startswith('(') else int(t)
out = {'agree': 0, 'differ': [], 'printed_pages': {}}
with pdfplumber.open(pdf) as P:
    for part in ('revenues', 'expenses'):
        pg = P.pages[r1[part]['pdf_page'] - 1]
        text = pg.extract_text() or ''
        pn = re.findall(r'(?:Annual Financial Report\s+(\d{1,3})\b)|(?:^(\d{1,3})\s+The City of Calgary)', text, re.M)
        out['printed_pages'][part] = [a or b for a, b in pn]
        lines = text.splitlines()
        for row in r1[part]['rows']:
            lab = row['label']
            cand = [l for l in lines if l.startswith(lab[:60])] if lab != 'Total' else [l for l in lines if re.match(r'^\$?\s*[\d,]{7,}', l.strip())]
            if not cand: out['differ'].append([part, lab, 'line not found']); continue
            l = cand[0][len(lab):] if lab != 'Total' else cand[0]
            toks = [t for t in re.findall(r'\(\s*[\d,]+\s*\)|[\d,]+%?|–', l) if not t.endswith('%')]
            vals = [num(t) for t in toks][:3]
            if vals == row['values']: out['agree'] += 3
            else: out['differ'].append([part, lab, row['values'], vals])
# arithmetic: revenues favourable = actual - budget; expenses favourable = budget - actual; rows add to totals
ar = []
for r in r1['revenues']['rows']:
    b, a, v = r['values']; ar.append(['revenues', r['label'], a - b == v])
for r in r1['expenses']['rows']:
    b, a, v = r['values']; ar.append(['expenses', r['label'], b - a == v])
R = {r['label']: r['values'] for r in r1['revenues']['rows']}
tot = [k for k in R if k.startswith('Total revenues')][0]
ops = [k for k in R if k not in (tot,) and not k.startswith('Total') and k not in ('Developer contributions', 'Government transfers related to capital', 'Developer contributions-in-kind related to capital')]
ar.append(['revenues', 'operating lines add to the total', all(sum(R[k][i] for k in ops) == R[tot][i] for i in range(3))])
cap = ['Developer contributions', 'Government transfers related to capital', 'Developer contributions-in-kind related to capital']
ar.append(['revenues', 'capital lines add to the total', all(sum(R[k][i] for k in cap) == R['Total external transfers for infrastructure'][i] for i in range(3))])
E = r1['expenses']['rows']
ar.append(['expenses', 'functions add to the total', all(sum(r['values'][i] for r in E[:-1]) == E[-1]['values'][i] for i in range(3))])
out['arithmetic'] = ar; out['arithmetic_failures'] = [x for x in ar if not x[2]]
print(json.dumps(out, indent=1))
