"""UI audit: every screen and every sub-view, at phone, tablet and desktop widths. Finds sideways page scroll, text
that spills out of its box (over its neighbours), overlapping text, and page errors.  python uiaudit.py OUT [URL]"""
import json, os, subprocess, sys, re
NEW = os.environ['NEW_UI']
def serve(url):
    path = re.sub(r'^https://calgaryinsight\.ca/', '', url).split('?')[0] or 'index.html'
    if path.startswith('data/'):
        alt = os.path.join(NEW, path)
        return alt if os.path.exists(alt) else None
    f = os.path.join(NEW, path)
    return f if os.path.isfile(f) else None

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
URL = sys.argv[2] if len(sys.argv) > 2 else 'https://calgaryinsight.ca/'
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright'], check=True)
    subprocess.run([sys.executable, '-m', 'playwright', 'install', '--with-deps', 'chromium'], check=True)
    from playwright.sync_api import sync_playwright

CHECK = r"""
() => {
  const view = document.querySelector('.view.is-on') || document.querySelector('.view.active') || document.body;
  const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || e.hidden || +cs.opacity === 0) return false;
      if (e !== el && e !== view && (cs.overflowX !== 'visible' || cs.overflowY !== 'visible')) {      // clipped away by a scrolling box
        const c = e.getBoundingClientRect();
        if (r.bottom <= c.top + 1 || r.top >= c.bottom - 1 || r.right <= c.left + 1 || r.left >= c.right - 1) return false; } }
    return true; };
  const scrollParent = el => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e); if (/(auto|scroll|hidden)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) return e; } return null; };
  const label = el => (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) + ' "' + (el.innerText || '').trim().slice(0, 50).replace(/\s+/g, ' ') + '"';
  const issues = [];
  // 1. text spilling out of its box
  const hiddenByDetails = el => { for (let d = el.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) { if (!d.open && !el.closest('summary')) return true; } return false; };
  const textEls = [...view.querySelectorAll('td,th,p,li,h1,h2,h3,h4,span,small,b,strong,button,label,a,div')].filter(el =>
    [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && vis(el) && !el.closest('.sr, .sr-only') && !hiddenByDetails(el));
  for (const el of textEls) {
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis') continue;
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && cs.display !== 'inline') {
      // spills: does the spilled text cover something else?
      const r = el.getBoundingClientRect();
      const tbl = el.closest('table');
      const fixed = tbl && getComputedStyle(tbl).tableLayout === 'fixed';
      if (fixed || !['TD', 'TH'].includes(el.tagName)) issues.push({ kind: 'spill', el: label(el), by: el.scrollWidth - el.clientWidth, w: Math.round(r.width) });
    }
  }
  // 2. overlapping text (leaf text boxes from different elements), within the visible page
  const clipBox = el => { let b = { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 };
    for (let e = el; e && e !== document.body && e !== view; e = e.parentElement) { const cs = getComputedStyle(e);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const c = e.getBoundingClientRect();
        b = { left: Math.max(b.left, c.left), top: Math.max(b.top, c.top), right: Math.min(b.right, c.right), bottom: Math.min(b.bottom, c.bottom) }; } }
    return b; };
  const rects = [];
  for (const el of textEls) {
    if (el.closest('.leaflet-container, canvas, svg, [aria-hidden="true"], .sr, .sr-only')) continue;
    const cb = clipBox(el);
    const range = document.createRange();
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      range.selectNodeContents(n);
      for (const q of range.getClientRects()) {
        const r = { left: Math.max(q.left, cb.left), top: Math.max(q.top, cb.top), right: Math.min(q.right, cb.right), bottom: Math.min(q.bottom, cb.bottom) };
        if (r.right - r.left > 2 && r.bottom - r.top > 2) rects.push({ el, r });
      }
    }
  }
  const seen = new Set();
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (x > 3 && y > 3) {
      // a sticky column over scrolled cells, or a scroll container hiding one of them, is not an overlap a reader sees
      const sp = [a.el, b.el].map(scrollParent);
      if (sp[0] || sp[1]) {
        const clip = e => { const p = scrollParent(e); if (!p) return true; const pr = p.getBoundingClientRect(), er = e.getBoundingClientRect();
          return er.left >= pr.left - 1 && er.right <= pr.right + 1; };
        if (!clip(a.el) || !clip(b.el)) continue;
        const st = e => getComputedStyle(e.closest('td,th') || e).position === 'sticky';
        if (st(a.el) || st(b.el)) continue;
      }
      const k = label(a.el) + ' | ' + label(b.el);
      if (!seen.has(k)) { seen.add(k); issues.push({ kind: 'overlap', el: k, x: Math.round(x), y: Math.round(y) }); }
    }
  }
  // 3. empty scroll: the page scrolls well past its last visible content
  const scroller = view.scrollHeight > view.clientHeight + 5 ? view : document.scrollingElement;
  let maxBottom = 0;
  for (const el of view.querySelectorAll('*')) {
    if (el.closest('.sr, .sr-only') || !vis(el) || hiddenByDetails(el)) continue;
    const r = el.getBoundingClientRect(), cb = clipBox(el.parentElement || el);
    const bottom = Math.min(r.bottom, cb.bottom);
    maxBottom = Math.max(maxBottom, bottom + scroller.scrollTop - (scroller === view ? view.getBoundingClientRect().top : 0));
  }
  const extra = Math.round(scroller.scrollHeight - maxBottom);
  if (extra > 250) issues.push({ kind: 'empty-scroll', el: `scrolls ${extra}px past the last content`, by: extra });
  const grouped = {};
  for (const i of issues) { const k = i.kind + ' ' + i.el.replace(/ "[^"]*"/g, ''); (grouped[k] = grouped[k] || { ...i, n: 0 }).n += 1; }
  return { hscroll: document.documentElement.scrollWidth - innerWidth, issues: Object.values(grouped).slice(0, 60) };
}
"""
report = []
with sync_playwright() as pw:
    b = pw.chromium.launch()
    for w, h in ((390, 844), (820, 1180), (1024, 768), (1440, 1000)):
        p = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        p.on('pageerror', lambda e: errs.append(str(e)[:200]))
        p.route(re.compile(r'https://calgaryinsight\.ca/([^?]*)'), lambda route: (lambda f: route.fulfill(path=f) if f else route.continue_())(serve(route.request.url))); p.goto(URL, wait_until='networkidle', timeout=180000); p.wait_for_timeout(5000)
        views = p.evaluate("[...document.querySelectorAll('section.view[id^=view-]')].map(s => s.id.slice(5))")
        for v in dict.fromkeys(views):
            try:
                p.evaluate(f"(() => {{ const t = document.querySelector('.tab[data-view=\"{v}\"]'); if (t) t.click(); else show('{v}'); }})()"); p.wait_for_timeout(3500)
            except Exception as e:
                report.append({'w': w, 'view': v, 'error': str(e)[:200]}); continue
            segs = p.evaluate(f"""[...document.querySelectorAll('#view-{v} .topbar [role=radiogroup] [role=radio], #view-{v} .topbar .seg button')].map((b, i) => i)""")
            subs = [None] + list(segs)
            for s in subs:
                if s is not None:
                    try:
                        p.evaluate(f"[...document.querySelectorAll('#view-{v} .topbar [role=radiogroup] [role=radio], #view-{v} .topbar .seg button')][{s}].click()")
                        p.wait_for_timeout(2500)
                    except Exception:
                        continue
                name = p.evaluate(f"(([...document.querySelectorAll('#view-{v} .topbar [role=radiogroup] [role=radio], #view-{v} .topbar .seg button')][{s if s is not None else -1}] || {{}}).innerText || '').trim()") if s is not None else ''
                r = p.evaluate(CHECK)
                if r['hscroll'] > 0 or r['issues']:
                    report.append({'w': w, 'view': v, 'sub': name, **r})
                    fn = f"{out}/{w}_{v}_{(name or 'main')[:20].replace(' ', '_').replace('/', '')}.jpg"
                    try:
                        p.screenshot(path=fn, quality=55, type='jpeg')
                    except Exception:
                        pass
        report.append({'w': w, 'errors': errs[:10]})
        p.close()
    b.close()
json.dump(report, open(f'{out}/audit.json', 'w'), indent=1)
n = sum(len(x.get('issues', [])) + (1 if x.get('hscroll', 0) > 0 else 0) for x in report)
print('AUDIT', n, 'findings')
for x in report:
    if x.get('issues') or x.get('hscroll', 0) > 0 or x.get('errors'):
        print(x['w'], x.get('view'), x.get('sub'), 'hscroll', x.get('hscroll'), (x.get('errors') or '') , [(i['kind'], i['el'][:120]) for i in x.get('issues', [])][:8])
