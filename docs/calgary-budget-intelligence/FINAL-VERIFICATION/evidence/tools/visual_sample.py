"""Pictures of the City's own tables for a sample of cases, each with the dataset's values printed under it, for a check by eye.
usage: python3 visual_sample.py <pdf> <plumber-words.json> <business-cases.json> <visual-sample.json> <out-dir>"""
import sys, json, subprocess, os
from PIL import Image, ImageDraw, ImageFont
pdf, wf, bcf, sf, out = sys.argv[1:6]
W = json.load(open(wf)); C = {c['n']: c for c in json.load(open(bcf))['cases']}; S = json.load(open(sf))
DPI = 110; K = DPI / 72
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13); bold = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
except OSError: font = bold = ImageFont.load_default()
def lines(page):
    o = []
    for w in sorted(page, key=lambda w: ((w[2] + w[3]) / 2, w[0])):
        mid = (w[2] + w[3]) / 2
        if o and abs(o[-1][0] - mid) <= 4: o[-1][1].append(w)
        else: o.append([mid, [w]])
    return [sorted(ws) for _, ws in o]
def find(L, start, frm=0):
    return next((i for i in range(frm, len(L)) if ' '.join(w[4] for w in L[i]).startswith(start)), None)
crops = []
for n in sorted(map(int, S)):
    c = C[n]
    for pg in range(c['page'], c['page'] + c['pages']):
        L = lines(W[pg - 1])
        if c['type'] == 'capital':
            a, b = find(L, 'Capital Funding Consideration'), find(L, 'Funding Source:')
            p = next((i for i, l in enumerate(L) if l[0][4] == 'Maintenance/Replacement'), None)
            if a is None: continue
            if b is None: b = min(a + 7, len(L) - 1)
            boxes = [(min(w[2] for w in L[a]) - 3, max(w[3] for w in L[b]) + 3)] + ([(min(w[2] for w in L[p]) - 3, max(w[3] for w in L[p + 1]) + 3)] if p is not None else [])
            txt = [f"total and years ($000s): {c['cap_k']}   needs: {c['needs_k']}", f"id {c['budget_id']} | {c['kind']} | wards {c['wards']} | {c['stage']} | {'new' if c['new'] else 'existing'} | {c['rationale']}",
                   f"funding: {c['funding']} | purposes %: {c['split']}"]
        else:
            a = find(L, 'Proposed funding')
            if a is None: continue
            b = find(L, 'Performance metric', a) or find(L, 'Benefits of budget proposal', a) or a + 6
            b = min(b, a + 14)
            boxes = [(min(w[2] for w in L[a]) - 3, min(w[2] for w in L[b]) - 2)]
            txt = [f"one-time {c['one_time_m']}   ongoing {c['ongoing_m']}   FTEs {c['ftes']}" + (f"   full one-time amount in the note: {c['full_one_time_m']}" if 'full_one_time_m' in c else '')]
        png = os.path.join(out, f'p{pg}.png')
        if not os.path.exists(png):
            subprocess.run(['pdftoppm', '-r', str(DPI), '-f', str(pg), '-l', str(pg), '-png', '-singlefile', pdf, png[:-4]], check=True)
        im = Image.open(png).convert('RGB')
        parts = [im.crop((20, int(t * K), im.width - 20, int(bt * K))) for t, bt in boxes]
        crops.append((f"Request {n} ({c['type']}), page {pg} of the City's document. {S[str(n)]}", parts, txt)); break
sheet, y, k, per = None, 0, 0, []
def flush(items, idx):
    h = sum(26 + sum(p.height + 4 for p in parts) + 18 * len(txt) + 14 for _, parts, txt in items); w = max(p.width for _, parts, _ in items for p in parts) + 20
    im = Image.new('RGB', (w, h), 'white'); d = ImageDraw.Draw(im); y = 4
    for label, parts, txt in items:
        d.text((8, y), label, fill=(0, 60, 140), font=bold); y += 24
        for p in parts: im.paste(p, (10, y)); y += p.height + 4
        for t in txt: d.text((8, y), 'dataset: ' + t, fill=(150, 0, 0), font=font); y += 18
        d.line((0, y + 6, w, y + 6), fill=(180, 180, 180)); y += 14
    im.save(os.path.join(out, f'sheet-{idx:02d}.jpg'), quality=72)
    return im.size
i = 0; idx = 1
while i < len(crops):
    items = crops[i:i + 5]; print(idx, [x[0][:13] for x in items], flush(items, idx)); i += 5; idx += 1
print('crops', len(crops))
