"""Third reading of the City's PDF: pdfplumber (pdfminer.six underneath). Saves each page's text and its words with positions."""
import sys, json, pdfplumber, time
pdf, out = sys.argv[1], sys.argv[2]
t=time.time(); pages=[]
with pdfplumber.open(pdf) as doc:
    for i, p in enumerate(doc.pages):
        txt = p.extract_text(x_tolerance=1.5, y_tolerance=3) or ''
        pages.append(txt)
        if i % 100 == 0: print(i, round(time.time()-t), flush=True)
json.dump(pages, open(out, 'w'))
print('pages', len(pages), 'seconds', round(time.time()-t))
