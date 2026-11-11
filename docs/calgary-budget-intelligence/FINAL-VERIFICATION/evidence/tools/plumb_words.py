"""Third reading, step 1: every page's words with their positions (pdfplumber / pdfminer.six)."""
import sys, json, pdfplumber, time
pdf, out = sys.argv[1], sys.argv[2]
t = time.time(); pages = []
with pdfplumber.open(pdf) as doc:
    for i, p in enumerate(doc.pages):
        ws = p.extract_words(x_tolerance=1.5, y_tolerance=3, keep_blank_chars=False, use_text_flow=False)
        pages.append([[round(w['x0'], 1), round(w['x1'], 1), round(w['top'], 1), round(w['bottom'], 1), w['text']] for w in ws])
        if i % 200 == 0: print(i, round(time.time() - t), flush=True)
json.dump(pages, open(out, 'w'))
print('pages', len(pages), 'seconds', round(time.time() - t))
