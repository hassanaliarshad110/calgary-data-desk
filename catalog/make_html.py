#!/usr/bin/env python3
"""catalog.json -> catalog.html: one self-contained page (thumbnails embedded) with search, channel and
category filters, licence badges and copyable usage. Also writes channels/<ch>/package.json."""
import json, os, base64, html, collections
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
D = json.load(open(os.path.join(ROOT, 'catalog/catalog.json'))); A = D['assets']
def b64(p):
    f = os.path.join(ROOT, p) if p else ''
    return 'data:image/jpeg;base64,' + base64.b64encode(open(f, 'rb').read()).decode() if p and os.path.exists(f) else ''
rows = []
for a in A:
    rows.append(dict(id=a['id'], n=a['name'], th=b64(a.get('thumbnail')), p=a['path'], f=a['format'], c=a['category'], an=a['animation'], t=', '.join(a['tools']) if isinstance(a['tools'], list) else a['tools'],
                     l=a['licence'], cm=a['commercial'], md=a['modify'], at=a['attribution'], s=a.get('source', ''), ch=a['channels'], u=a.get('usage', ''), tg=' '.join(map(str, a.get('tags', [])))))
cats = collections.Counter(a['category'].split('/')[0] for a in A)
page = '''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio Asset Catalogue</title>
<style>
:root{--bg:#0b1f3a;--card:#13305a;--ink:#fff;--sub:#b8c4d6;--gold:#f2b705;--red:#c8102e;--teal:#2a9d8f}
*{box-sizing:border-box}body{margin:0;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink)}
header{position:sticky;top:0;z-index:5;background:#081830ee;padding:14px 18px;border-bottom:1px solid #24406b}
h1{margin:0 0 4px;font-size:22px}h1 span{color:var(--gold)}.sub{color:var(--sub);font-size:13px}
.bar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}input,select{background:#0f2747;color:#fff;border:1px solid #2b4f8a;border-radius:8px;padding:8px 10px;font-size:14px}input{flex:1;min-width:180px}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.chip{border:1px solid #2b4f8a;border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer;color:var(--sub)}.chip.on{background:var(--gold);color:#0b1f3a;border-color:var(--gold);font-weight:700}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;padding:16px}
.card{background:var(--card);border-radius:12px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column}.card img{width:100%;aspect-ratio:16/9;object-fit:cover;background:#0f2747;display:block}
.card .b{padding:8px 10px}.id{font:600 11px ui-monospace,monospace;color:var(--gold)}.nm{font-weight:650;font-size:14px;margin:2px 0}.meta{font-size:12px;color:var(--sub)}
.tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}.tag{font-size:10px;padding:2px 6px;border-radius:6px;background:#0f2747;color:var(--sub)}.tag.ok{background:#1d5c55;color:#d6fff8}.tag.att{background:#6b4f12;color:#ffe9b0}.tag.no{background:#6b1222;color:#ffd6dc}.tag.rig{background:var(--red);color:#fff}
dialog{max-width:820px;width:94%;background:#0f2747;color:#fff;border:1px solid #2b4f8a;border-radius:14px;padding:0}dialog img{width:100%;display:block}dialog .b{padding:14px 18px}dialog table{width:100%;border-collapse:collapse;font-size:13px}dialog td{padding:5px 6px;border-top:1px solid #24406b;vertical-align:top}dialog td:first-child{color:var(--sub);width:130px}
code{font:12px ui-monospace,monospace;background:#081830;padding:2px 5px;border-radius:5px;word-break:break-all}button{background:var(--gold);border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer}
.count{color:var(--gold);font-weight:700}
</style></head><body>
<header><h1>Studio <span>Asset Catalogue</span></h1><div class="sub">CalgaryInsight · Cartoon Channel · News Channel — <span class="count" id="cnt"></span> of TOTAL assets shown · every asset lists source, licence, format, animation capability and usage</div>
<div class="bar"><input id="q" placeholder="Search: storm, walk, lower third, Calgary, CC0, rigged…"><select id="cat"><option value="">All categories</option>CATOPTS</select>
<select id="lic"><option value="">Any licence</option><option value="free">Commercial use, no credit needed</option><option value="att">Needs attribution</option></select></div>
<div class="chips" id="chs"><span class="chip on" data-c="">All channels</span><span class="chip" data-c="calgaryinsight">CalgaryInsight</span><span class="chip" data-c="cartoon">Cartoon</span><span class="chip" data-c="news">News</span><span class="chip" data-r="1">Rigged / animated characters</span></div></header>
<main id="grid"></main>
<dialog id="dlg"><img id="dimg" alt=""><div class="b"><div class="id" id="did"></div><h2 id="dnm" style="margin:4px 0 10px;font-size:20px"></h2><table id="dt"></table><p style="text-align:right"><button onclick="dlg.close()">Close</button></p></div></dialog>
<script>
const D = DATA; let ch = '', rig = false; const g = document.getElementById('grid'), q = document.getElementById('q'), cat = document.getElementById('cat'), lic = document.getElementById('lic');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function draw() { const s = q.value.toLowerCase().trim(); let n = 0; g.innerHTML = '';
  const frag = document.createDocumentFragment();
  D.forEach((a, i) => { if (ch && !a.ch.includes(ch)) return; if (cat.value && !a.c.startsWith(cat.value)) return; if (lic.value === 'free' && (a.at || a.cm === false)) return; if (lic.value === 'att' && !a.at) return;
    if (rig && !/RIGGED/.test(a.an)) return; if (s && !(a.id + ' ' + a.n + ' ' + a.c + ' ' + a.tg + ' ' + a.l + ' ' + a.an + ' ' + a.f).toLowerCase().includes(s)) return; n++;
    const el = document.createElement('div'); el.className = 'card'; el.onclick = () => show(i);
    el.innerHTML = `${a.th ? `<img loading="lazy" src="${a.th}" alt="">` : `<img alt="">`}<div class="b"><div class="id">${esc(a.id)}</div><div class="nm">${esc(a.n)}</div><div class="meta">${esc(a.c)} · ${esc(a.f)}</div>
    <div class="tags">${/RIGGED/.test(a.an) ? '<span class="tag rig">RIGGED</span>' : ''}${a.cm === false ? '<span class="tag no">no commercial</span>' : a.at ? '<span class="tag att">credit required</span>' : '<span class="tag ok">free to use</span>'}${a.ch.map(c => `<span class="tag">${c}</span>`).join('')}</div></div>`; frag.appendChild(el); });
  g.appendChild(frag); document.getElementById('cnt').textContent = n; }
function show(i) { const a = D[i]; dimg.src = a.th || ''; did.textContent = a.id; dnm.textContent = a.n;
  dt.innerHTML = [['Path', `<code>${esc(a.p)}</code>`], ['Format', esc(a.f)], ['Category', esc(a.c)], ['Animation', esc(a.an)], ['Compatible tools', esc(a.t)], ['Licence', esc(a.l)], ['Commercial use', a.cm === null ? 'check' : a.cm ? 'yes' : 'no'], ['Modification', a.md ? 'yes' : 'no'], ['Attribution', a.at ? 'required' : 'not required'], ['Source', esc(a.s)], ['Channels', esc(a.ch.join(', '))], ['Usage', `<code>${esc(a.u)}</code>`]].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join(''); dlg.showModal(); }
document.querySelectorAll('.chip').forEach(c => c.onclick = () => { if (c.dataset.r) { rig = !rig; c.classList.toggle('on', rig); } else { document.querySelectorAll('.chip[data-c]').forEach(x => x.classList.remove('on')); c.classList.add('on'); ch = c.dataset.c; } draw(); });
[q, cat, lic].forEach(e => e.oninput = draw); draw();
</script></body></html>'''
page = page.replace('DATA', json.dumps(rows, separators=(',', ':'))).replace('TOTAL', str(len(A))).replace('CATOPTS', ''.join(f'<option value="{c}">{c} ({n})</option>' for c, n in sorted(cats.items())))
open(os.path.join(ROOT, 'catalog/catalog.html'), 'w').write(page); print('catalog.html', round(len(page) / 2**20, 1), 'MB', len(A), 'assets')

# ---------------- channel packages
THEMES = {'calgaryinsight': {'theme': 'THEME.ci', 'colours': {'navy': '#0b1f3a', 'gold': '#f2b705', 'cyan': '#4cc9f0'}, 'fonts': ['Fira Sans (house)', 'Playfair Display (doc titles)', 'Inter'], 'logo': 'channels/calgaryinsight/logo.svg', 'voice': 'Kokoro af_heart (am_michael alt) via GitHub Actions', 'music': 'MUS documentary_calm_72bpm', 'rules': ['credit calgaryinsight.ca, never a person', 'every figure sourced on screen', 'spoken numbers written as words in the script', 'end card + spoken close']},
          'cartoon': {'theme': 'THEME.cartoon', 'colours': {'cream': '#fff3d6', 'red': '#e63946', 'blue': '#118ab2', 'yellow': '#ffd166'}, 'fonts': ['Bangers (titles)', 'Baloo 2 (subtitles)', 'Luckiest Guy', 'Fredoka'], 'voice': 'Kokoro (en voices; hf_*/hm_* for Hindi) + edge-tts Urdu via Actions', 'music': 'MUS cartoon_bouncy_128bpm', 'rules': ['no copyrighted characters', 'kids content: no comment CTAs', 'Susuman assets stay with the Susuman series']},
          'news': {'theme': 'THEME.news', 'colours': {'navy': '#06132b', 'red': '#c8102e', 'white': '#ffffff'}, 'fonts': ['Fira Sans', 'Oswald', 'Bebas Neue', 'Inter'], 'voice': 'Kokoro am_michael (anchor), af_bella/bf_emma (co-anchor)', 'music': 'MUS news_bed_120bpm + SFX news_sting', 'rules': ['label demos/sample data on screen', 'never present invented events as real news', 'cite data sources']}}
for chn, meta in THEMES.items():
    pk = [a for a in A if chn in a['channels']]; by = collections.defaultdict(list)
    for a in pk: by[a['category'].split('/')[0]].append({'id': a['id'], 'name': a['name'], 'path': a['path']})
    os.makedirs(os.path.join(ROOT, 'channels', chn), exist_ok=True)
    json.dump({'channel': chn, **meta, 'asset_count': len(pk), 'shared_with_all_channels': sum(1 for a in pk if set(a['channels']) >= {'calgaryinsight', 'cartoon', 'news'}), 'assets_by_category': by,
               'demo': {'calgaryinsight': 'demos/calgary_doc', 'cartoon': 'demos/cartoon', 'news': 'demos/news'}[chn]}, open(os.path.join(ROOT, 'channels', chn, 'package.json'), 'w'), indent=1)
shared = [a for a in A if set(a['channels']) >= {'calgaryinsight', 'cartoon', 'news'}]
json.dump({'channel': 'shared', 'asset_count': len(shared), 'assets': [{'id': a['id'], 'name': a['name'], 'path': a['path']} for a in shared]}, open(os.path.join(ROOT, 'channels/shared/package.json'), 'w'), indent=1)
print({c: sum(1 for a in A if c in a['channels']) for c in THEMES}, 'shared', len(shared))
