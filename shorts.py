"""Awazzzz Shorts — FULL-SCREEN VERTICAL (README: "SHORTS ARE FULL-SCREEN VERTICAL", Hassan Nov 15 2026).

Self-contained: builds picture AND sound for each Short from the episode's own files (no pre-voiced source needed).
  * Picture: full-bleed 1080x1920. Each scene is re-drawn natively in portrait (episode scenes_v.js: DRAWV.<scene>,
    same rig / characters / 2.5D layers, recomposed for 9:16). Fallback per scene (no DRAWV entry): the 16:9 timeline
    rendered at 3840x2160 and a 1215x2160 window (-> 1080x1920) that pans to follow the action ("focus" keyframes in
    shorts_cfg.json, default a slow pan — never a static centre crop).
  * Overlays (kit-root shorts_v.js): logo watermark top-left (84 px), captions y 1250-1450 (Baloo 2, 2 lines, 60% box),
    PART n/4 chip 0-2.5 s, the opening hook as one line (<= 80 px) 0-2 s, compact 2 s end card.
  * Sound: spoken opening hook (aud/h{k}o.wav) + the segment's narration + spoken closing hook (aud/h{k}e.wav), all
    female voices from the episode, over the same energetic score as the full video (score_mix.py: bed ~0.42,
    ducked to ~50% under the voice), SFX on the cuts, loudnorm -14 LUFS.

shorts_cfg.json (episode dir):
  {"shorts": {"1": {"lines": [["n15","n16"], ["n18","n19"]],      # one or more ranges of main-timeline lines
                    "hook": "hook1", "end": "end1",              # DRAWV scenes for the spoken opening / closing hook
                    "line": "ON-SCREEN HOOK LINE"}},
   "focus": {"scene": [[t, x1920], ...]}}                         # optional, only for fallback-crop scenes
usage: python3 shorts.py [1 2 ...] [--preview]      (run inside the episode dir; needs timeline.json, aud/, aud_info.json,
       scenes.js, scenes_v.js, score_mix.py; kit files rig.js / shorts_v.js / fonts / logo.jpg in the dir or the kit root)
writes shorts/short{k}_fs.mp4, shorts/cover{k}_fs.jpg, shorts/sheet{k}_fs.jpg (5-frame contact sheet)
"""
import json, os, sys, base64, subprocess
from playwright.sync_api import sync_playwright

HERE = os.getcwd()
KIT = next(d for d in (HERE, os.path.dirname(os.path.abspath(__file__)), os.path.join(HERE, '..', '..')) if os.path.exists(os.path.join(d, 'rig.js')) and os.path.exists(os.path.join(d, 'shorts_v.js')))
KIT = os.path.abspath(KIT); os.makedirs('shorts', exist_ok=True)
FPS = 30
CFG = json.load(open('shorts_cfg.json')); SHORTS = CFG['shorts']; FOCUS = CFG.get('focus', {})
TL = json.load(open('timeline.json')); INFO = json.load(open('aud_info.json'))
SCORE = next(p for p in (os.path.join(HERE, 'score_mix.py'), os.path.join(KIT, 'score_mix.py')) if os.path.exists(p))

def sh(*a): return subprocess.run(a, check=True, capture_output=True, text=True)
def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).decode())

def build_js():
    open('timeline_v.js', 'w').write('const SCENES=' + json.dumps(TL['scenes']) + ';\nconst LINES=' + json.dumps(TL['lines'], ensure_ascii=False) + ';\nconst AMP={};\nconst TOTAL=' + str(round(TL['total'], 3)) + ';\n')
    rig = open(os.path.join(KIT, 'rig.js')).read()
    open('rig_v.js', 'w').write(rig.replace('const W = 1920, H = 1080;', 'const W = 1080, H = 1920;', 1))
    f = os.path.relpath(os.path.join(KIT, 'fonts'), HERE); lg = os.path.relpath(os.path.join(KIT, 'logo.jpg'), HERE)
    head = (f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>@font-face{{font-family:Oswald;src:url({f}/Oswald.ttf);font-weight:200 700}}'
            f'@font-face{{font-family:Kalam;src:url({f}/Kalam-Bold.ttf);font-weight:700}}@font-face{{font-family:Inter;src:url({f}/Inter.ttf);font-weight:100 900}}'
            f'@font-face{{font-family:Baloo2;src:url({f}/Baloo2.ttf);font-weight:400 800}}body{{margin:0;background:#000}}canvas{{display:block}}</style></head><body>'
            f'<img id="logo" src="{lg}" style="display:none">')
    open('portrait.html', 'w').write(head + '<canvas id="c" width="1080" height="1920"></canvas>'
        f'<script src="timeline_v.js"></script><script src="rig_v.js"></script><script src="scenes.js"></script><script src="{os.path.relpath(os.path.join(KIT, "shorts_v.js"), HERE)}"></script>'
        + ('<script src="scenes_v.js"></script>' if os.path.exists('scenes_v.js') else '') +
        '<script>ctx=document.getElementById("c").getContext("2d");'
        'function useFallback(ids){for(const id of ids)DRAWV[id]=()=>{ctx.drawImage(window.__img,window.__sx,0,1215,2160,0,0,W,H);};}'
        'function grabFB(o,src,sx){return new Promise(r=>{const im=new Image();im.onload=()=>{window.__img=im;window.__sx=sx;r(grabV(o));};im.src="data:image/jpeg;base64,"+src;});}'
        '</script></body></html>')
    rig16 = os.path.relpath(os.path.join(KIT, 'rig.js'), HERE)
    open('wide2x.html', 'w').write(head + '<canvas id="c" width="3840" height="2160"></canvas>'
        f'<script src="timeline_v.js"></script><script src="{rig16}"></script><script src="scenes.js"></script>'
        '<script>ctx=document.getElementById("c").getContext("2d");'
        'function clean(T){GT=T;ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);const s=SCENES.find(s=>T>=s.start&&T<s.start+s.dur);'
        'ctx.save();DRAW[s.id](T-s.start,s.dur,T);ctx.restore();return document.getElementById("c").toDataURL("image/jpeg",0.9).split(",")[1];}</script></body></html>')

def page(p, html, w, h):
    b = p.chromium.launch(args=['--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': w, 'height': h}); msgs = []
    pg.on('console', lambda m: msgs.append(m.text)); pg.on('pageerror', lambda e: msgs.append('ERR ' + str(e)))
    pg.goto('file://' + os.path.join(HERE, html)); pg.wait_for_function("document.getElementById('logo').complete")
    pg.evaluate("Promise.all(['700 50px Oswald','700 50px Kalam','800 50px Baloo2','600 20px Inter'].map(f=>document.fonts.load(f)))"); pg.wait_for_timeout(300)
    return b, pg, msgs

def plan(k):
    """layout of Short k: opening hook, main ranges, closing hook (seconds) + audio timeline."""
    S = SHORTS[k]; L = TL['lines']
    ho, he = INFO[f'h{k}o']['dur'], INFO[f'h{k}e']['dur']
    fo = round((0.25 + ho + 0.35) * FPS)
    ranges = [(round(L[a]['start'] - 0.1, 3), round(L[b]['start'] + L[b]['dur'] + 0.3, 3)) for a, b in S['lines']]
    fms = [round((b - a) * FPS) for a, b in ranges]
    fe = max(round((0.2 + he + 0.5) * FPS), round(2.6 * FPS))
    # audio timeline (seconds in the Short)
    lines = {f'h{k}o': dict(start=0.25, dur=ho)}; T = fo / FPS; sfx = [[0.02, 'boom', 0.6], [T - 0.3, 'whoosh', 0.5], [T, 'boom', 0.55]]
    for (a, b), fm in zip(ranges, fms):
        for id_, l in L.items():
            if l['start'] >= a - 1e-3 and l['start'] + l['dur'] <= b + 1e-3: lines[id_] = dict(start=round(T + l['start'] - a, 3), dur=l['dur'])
        for s in TL['scenes']:
            if a < s['start'] < b and s['id'] == 'twist': sfx += [[T + s['start'] - a - 1.7, 'riser', 0.8], [T + s['start'] - a + 0.05, 'boom', 0.9]]
        if T > fo / FPS: sfx += [[T - 0.25, 'whoosh', 0.5]]
        T += fm / FPS
    lines[f'h{k}e'] = dict(start=round(T + 0.2, 3), dur=he); sfx += [[T, 'ding', 0.5], [T + fe / FPS - 2.0, 'boom', 0.5]]
    total = T + fe / FPS
    atl = dict(total=total, lines=lines, sfx=sfx, scenes=[dict(id='hook', start=0), dict(id='seg', start=fo / FPS), dict(id='close', start=T)])
    return fo, ranges, fms, fe, atl

def frames(k, fo, ranges, fms, fe):
    S = SHORTS[k]; total = (fo + sum(fms) + fe) / FPS; out = []
    ho, he = INFO[f'h{k}o'], INFO[f'h{k}e']
    for i in range(fo):
        out.append(dict(T=i / FPS, total=total, part=int(k), hookLine=S['line'], kind='hook', scene=S['hook'], t=i / FPS, d=fo / FPS, capText=ho['roman'], vstart=0.25, vdur=ho['dur']))
    for (a, b), fm in zip(ranges, fms):
        for j in range(fm):
            T = len(out) / FPS; out.append(dict(T=T, total=total, part=int(k), hookLine=None, kind='main', t=j / FPS, GT=a + j / FPS))
    for j in range(fe):
        T = len(out) / FPS; out.append(dict(T=T, total=total, part=int(k), hookLine=None, kind='end', scene=S['end'], t=j / FPS, d=fe / FPS, capText=he['roman'], vstart=0.2, vdur=he['dur']))
    return out

def focus_x(sid, t, d):
    kf = FOCUS.get(sid) or [[0, 1920 * 0.40], [d, 1920 * 0.60]]
    x = kf[0][1] if t <= kf[0][0] else kf[-1][1]
    for (t0, x0), (t1, x1) in zip(kf, kf[1:]):
        if t0 <= t <= t1: u = (t - t0) / max(1e-6, t1 - t0); u = u * u * (3 - 2 * u); x = x0 + (x1 - x0) * u; break
    return int(max(0, min(3840 - 1215, x * 2 - 1215 / 2)))

def audio(k, atl):
    tj = f'shorts/atl{k}.json'; json.dump(atl, open(tj, 'w'))
    raw = f'shorts/a{k}_raw.wav'; print(sh('python3', SCORE, tj, raw).stdout.strip(), flush=True)
    out = f'shorts/a{k}.wav'; sh('ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', out); os.remove(raw)
    return out

def render(k, preview=False):
    fo, ranges, fms, fe, atl = plan(k); F = frames(k, fo, ranges, fms, fe)
    print(k, 'frames hook/seg/end', fo, fms, fe, 'total', round(len(F) / FPS, 2), 's', flush=True)
    tl = TL['scenes']; vout = f'shorts/v{k}.tmp.mp4'
    with sync_playwright() as p:
        b, pg, msgs = page(p, 'portrait.html', 1080, 1920)
        native = set(pg.evaluate('Object.keys(DRAWV)'))
        need = {s['id'] for s in tl for a, b_ in ranges if s['start'] < b_ - 0.01 and s['start'] + s['dur'] > a + 0.01}
        fb = sorted(need - native); print(k, 'native portrait', sorted(need & native), 'fallback crop', fb, flush=True)
        fbx = [S for S in (SHORTS[k]['hook'], SHORTS[k]['end']) if S not in native]
        if fb or fbx: pg.evaluate('ids=>useFallback(ids)', fb + fbx); b2, pw, _ = page(p, 'wide2x.html', 1920, 1080)
        sel = [(i, F[i]) for i in ([int(x * (len(F) - 1)) for x in (0.02, 0.25, 0.5, 0.75, 0.97)] if preview else range(len(F)))]
        ff = None if preview else subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
              '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', vout], stdin=subprocess.PIPE)
        shots = []
        for i, o in sel:
            s = next((s for s in tl if o['kind'] == 'main' and s['start'] <= o['GT'] + 1e-4 < s['start'] + s['dur']), None)
            if o['kind'] != 'main' and o['scene'] in fbx:
                g = ranges[0][0] + 0.6 if o['kind'] == 'hook' else ranges[-1][1] - 0.4; s0 = next(s for s in tl if s['start'] <= g < s['start'] + s['dur'])
                img = pw.evaluate(f"clean({g})"); data = pg.evaluate('([o,src,sx])=>grabFB(o,src,sx)', [o, img, focus_x(s0['id'], o['t'] / o['d'] * s0['dur'], s0['dur'])])
            elif s and s['id'] in fb:
                img = pw.evaluate(f"clean({o['GT']})"); data = pg.evaluate('([o,src,sx])=>grabFB(o,src,sx)', [o, img, focus_x(s['id'], o['GT'] - s['start'], s['dur'])])
            else: data = pg.evaluate('o=>grabV(o)', o)
            raw = base64.b64decode(data)
            if ff: ff.stdin.write(raw)
            else: pth = f'shorts/prev{k}_{i:04d}.jpg'; open(pth, 'wb').write(raw); shots.append(pth)
        if ff: ff.stdin.close(); ff.wait()
        if msgs: print('\n'.join(msgs[:20]))
        b.close()
    if preview: return shots
    a = audio(k, atl); out = f'shorts/short{k}_fs.mp4'
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', vout, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out)
    os.remove(vout)
    sh('ffmpeg', '-y', '-loglevel', 'error', '-ss', str(fo / FPS + 1.0), '-i', out, '-frames:v', '1', '-q:v', '2', f'shorts/cover{k}_fs.jpg')
    sheet(k, out)
    print(k, 'done', round(dur(out), 2), 's', flush=True)
    return out

def sheet(k, out):
    """5-frame contact sheet (check: picture fills every frame, no cut faces/labels, captions readable)."""
    D = dur(out); ts = [0.5, D * 0.25, D * 0.5, D * 0.75, D - 0.6]; parts = []
    for j, t in enumerate(ts):
        pth = f'shorts/sh{k}_{j}.jpg'; sh('ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{t:.2f}', '-i', out, '-frames:v', '1', '-vf', 'scale=432:768', pth); parts.append(pth)
    args = ['ffmpeg', '-y', '-loglevel', 'error']
    for pth in parts: args += ['-i', pth]
    sh(*args, '-filter_complex', ''.join(f'[{j}:v]' for j in range(5)) + 'hstack=inputs=5', f'shorts/sheet{k}_fs.jpg')
    for pth in parts: os.remove(pth)

if __name__ == '__main__':
    build_js()
    ks = [a for a in sys.argv[1:] if not a.startswith('-')] or list(SHORTS)
    for k in ks:
        r = render(k, preview='--preview' in sys.argv)
        if isinstance(r, list): print('preview', r)
