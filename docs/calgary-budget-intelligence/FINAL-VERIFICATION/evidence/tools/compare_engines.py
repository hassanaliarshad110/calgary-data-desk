"""How the three text readings of the PDF differ, page by page (words only; the order of words on a page is ignored here).
usage: python3 compare_engines.py <pdf> <plumber-pages.json> <out.json>"""
import sys, json, subprocess, re, collections
from pypdf import PdfReader
pdf, plumb, out = sys.argv[1:4]
A = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, check=True).stdout.decode('utf-8').split('\f')[:792]
B = [p.extract_text() or '' for p in PdfReader(pdf).pages]
C = json.load(open(plumb))
words = lambda t: collections.Counter(re.findall(r'\S+', t))
res = {'pages': len(A), 'pairs': {}}
names = {'pdftotext -layout (poppler 24.02.0)': A, 'pypdf 6.17.0': B, 'pdfplumber 0.11.10 (pdfminer.six)': C}
keys = list(names)
for i in range(3):
    for j in range(i + 1, 3):
        x, y = names[keys[i]], names[keys[j]]; same = 0; diff_tokens = collections.Counter(); worst = []
        for p in range(len(A)):
            wx, wy = words(x[p]), words(y[p])
            if wx == wy: same += 1
            else:
                d = (wx - wy) + (wy - wx); diff_tokens.update(d); worst.append((sum(d.values()), p + 1))
        res['pairs'][f'{keys[i]} | {keys[j]}'] = {'pages_with_exactly_the_same_words': same, 'pages_that_differ': len(A) - same, 'words_that_differ_in_all': sum(diff_tokens.values()),
            'most_common_differing_words': [[w, n] for w, n in diff_tokens.most_common(14)], 'pages_with_most_differences': [p for _, p in sorted(worst, reverse=True)[:6]]}
# digits only: does every number token appear the same number of times on every page in all three?
numtok = lambda t: collections.Counter(re.findall(r'(?<![\w.,])\(?\$?\d[\d,]*\.?\d*\)?%?(?![\w])', t))
same_nums = sum(1 for p in range(len(A)) if numtok(A[p]) == numtok(B[p]) == numtok(C[p]))
res['pages_where_all_three_give_the_same_numbers'] = same_nums
res['pages_where_numbers_differ'] = [p + 1 for p in range(len(A)) if not (numtok(A[p]) == numtok(B[p]) == numtok(C[p]))][:40]
json.dump(res, open(out, 'w'), indent=1, ensure_ascii=False)
for k, v in res['pairs'].items(): print(k, '| same', v['pages_with_exactly_the_same_words'], '| differ', v['pages_that_differ'], '| words', v['words_that_differ_in_all'], '|', v['most_common_differing_words'][:8])
print('pages where all three give the same numbers:', same_nums, 'of', len(A), '| differ on:', res['pages_where_numbers_differ'][:20])
