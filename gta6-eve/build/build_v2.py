# v2 (Nov 15, 2026): adds "Take the stage" and "Play together" to the already-built GTA 6 eve videos.
# The approved v1 video is kept frame for frame; new segments are composed with the same compositor (compose.py) and
# spliced in at line boundaries; the whole soundtrack is re-mixed (voice + "Under One Sky", -14 LUFS) on the new timeline.
# usage: python3 build_v2.py specs            -> writes seg_*.json + spec_*_v2.json
#        python3 build_v2.py render <out>     -> renders the segments, splices, mixes for output <out>
import json, sys, math, subprocess, os
sys.path.insert(0, '/home/claude/gta6')
import compose
from compose import chunks, font, ease, back, wrap, GOLD, WHITE
from PIL import Image, ImageDraw
D = json.load(open('/home/claude/gta6/tts_out/durs.json'))
L = json.load(open('/home/claude/gta6/lines.json'))
OLD = '/home/claude/sm/gta6-eve'
FPS = 30
STAMP = 'Stampede Park is re-created in the game · not affiliated with the Calgary Stampede'
STAMP_V = 'Re-created in the game · not affiliated with the Calgary Stampede'

def S(clip, dur, **kw):
    d = {'clip': clip, 'dur': dur, 'a': 0.0, 'b': 1.0}; d.update(kw); return d

def layout(keys, lead, gap, breathers=None):
    breathers = breathers or {}; t = lead; out = []
    for j, (k, i) in enumerate(keys):
        d = D[k][i]; out.append((k, i, t, t + d)); t += d + gap + breathers.get(j, 0)
    return out

def caps_for(lay, maxc):
    caps = []
    for k, i, t0, t1 in lay:
        cs = chunks(L[k][i], maxc); tot = sum(len(c) for c in cs); t = t0
        for c in cs:
            d = (t1 - t0) * len(c) / tot; caps.append({'t0': round(t, 3), 't1': round(t + d, 3), 'text': c}); t += d
        caps[-1]['t1'] = round(t1 + 0.3, 3)
    return caps

def fill(shots, total):
    s = sum(x['dur'] for x in shots[:-1]); shots[-1]['dur'] = round(total - s, 4); assert shots[-1]['dur'] > 0.3, (total, s); return shots

def frames(t): return int(round(t * FPS))

# ------------------------------------------------------------------ the new segments (local time 0 = the splice point)
def seg_stage(P, lead, tail, tag):
    lay = layout([('s', 0)], lead, 0)
    k, i, t0, t1 = lay[0]; dur = frames(t1 + tail) / FPS
    shots = fill([S('stagewalk', lead + 3.25, a=0.05, b=1.0), S('stageclose', 3.2, a=0.0, b=1.0), S('stagecrowd', 2.9, a=0.0, b=1.0), S('stagescreen', 1.0)], dur)
    lab = [{'t0': lead + 0.15, 'dur': 5.2, 'k': 'Take the stage', 'title': 'Grab the mic · lyrics on the big screen'}]
    notes = [{'t0': 0.0, 't1': dur, 'text': STAMP_V if P else STAMP}]
    return dict(name=tag, dur=dur, shots=shots, caps=caps_for(lay, 26 if P else 44), labels=lab, notes=notes, voice=[(k, i, round(t0, 3))])

def seg_play(P, lead, gap, tail, tag, title_dur=None):
    lay = layout([('n', j) for j in range(5)], lead, gap)
    st = [(t0, t1) for (_, _, t0, t1) in lay]; dur = frames(st[-1][1] + tail) / FPS
    nxt = lambda j: st[j + 1][0] if j + 1 < 5 else dur
    plan = [
        [S('mpheli', 1.0, a=0.0, b=0.3)],
        [S('mpgroup', 4.0, a=0.0, b=0.42), S('mpheli', 1.0, a=0.3, b=0.55)],
        [S('mpcar', 4.0, a=0.08, b=1.0), S('mpheliboard', 1.0, a=0.35, b=1.0)],
        [S('mpgroup', 1.0, a=0.42, b=1.0)],
        [S('mpheli', 1.0, a=0.55, b=1.0)],
    ]
    shots = []
    for j in range(5):
        t0 = 0 if j == 0 else st[j][0]
        shots += fill([dict(x) for x in plan[j]], nxt(j) - t0)
    lab = [{'t0': st[1][0] + 0.1, 'dur': min(6.0, st[1][1] - st[1][0] + 0.4), 'k': 'Play together online', 'title': 'Up to forty players in one city'},
           {'t0': st[2][0] + 0.1, 'dur': min(6.0, st[2][1] - st[2][0] + 0.4), 'k': 'Ride along', 'title': "A friend's car or helicopter"},
           {'t0': st[3][0] + 0.1, 'dur': min(5.0, st[3][1] - st[3][0] + 0.4), 'k': 'Text and voice chat', 'title': 'Talk to players near you'}]
    titles = [{'t0': 0.0, 't1': st[0][1] + 0.35, 'parts': [(0.0, 'PLAY TOGETHER', ['TOGETHER'], 112 if P else 120), (0.45, 'online · free · in your browser', [], 54 if P else 50)]}]
    caps = [c for c in caps_for(lay, 26 if P else 44)]
    return dict(name=tag, dur=dur, shots=shots, caps=caps, labels=lab, notes=[], titles=titles, voice=[(k, i, round(t0, 3)) for (k, i, t0, t1) in lay])

def seg_teaser():
    lay = layout([('q', 0)], 0.0, 0)
    k, i, t0, t1 = lay[0]; dur = frames(t1 + 0.6) / FPS
    shots = fill([S('stageclose', 2.55, a=0.1, b=0.9), S('mpgroup', 2.0, a=0.2, b=0.6), S('mpcar', 1.0, a=0.45, b=1.0)], dur)
    lab = [{'t0': 2.6, 'dur': dur - 2.6 + 0.01, 'k': 'Play together online', 'title': 'Explore the city with other Calgarians'}]
    notes = [{'t0': 0.0, 't1': 2.55, 'text': STAMP_V}]
    return dict(name='teaser', dur=dur, shots=shots, caps=caps_for(lay, 26), labels=lab, notes=notes, voice=[(k, i, round(t0, 3))])

# where each new segment goes in each output (old-video time of the splice) and the segment builders
def plan_outputs():
    full = json.load(open('/home/claude/gta6/spec_full_land.json')); lt = {i: (a, b) for i, a, b in full['lines_t']}
    sp = lambda o: json.load(open(f'/home/claude/gta6/spec_{o}.json'))
    vstart = lambda s, key: [v[2] for v in s['voice'] if (v[0], v[1]) == key][0]
    return {
        'full_land': dict(W=1920, H=1080, orient='land', old=f'{OLD}/gta6-eve-full.mp4', spec=full,
                          ins=[(lt[9][0], seg_stage(False, 0.35, 0.9 + 1.6, 'full_stage')), (lt[20][0], seg_play(False, 0.35, 0.9, 0.9 + 1.4, 'full_play'))]),
        'teaser': dict(W=1080, H=1920, orient='port', old=f'{OLD}/gta6-eve-teaser.mp4', spec=sp('teaser'),
                       ins=[(vstart(sp('teaser'), ('t', 4)), seg_teaser())]),
        'part1': dict(W=1080, H=1920, orient='port', old=f'{OLD}/gta6-eve-part1.mp4', spec=sp('part1'),
                      ins=[(vstart(sp('part1'), ('p', 1)), seg_stage(True, 0.0, 0.6 + 0.4, 'part1_stage'))]),
        'part3': dict(W=1080, H=1920, orient='port', old=f'{OLD}/gta6-eve-part3.mp4', spec=sp('part3'),
                      ins=[(vstart(sp('part3'), ('p', 5)), seg_play(True, 0.0, 0.6, 0.6, 'part3_play'))]),
    }

# ------------------------------------------------------------------ overlay: a big section title (like the hook, lighter)
def title_overlay(O, img, t, parts):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    hh = int(O.H * 0.62); grad = Image.new('L', (1, hh))
    for i in range(hh):
        u = i / hh; grad.putpixel((0, i), int(130 * (1.0 if u < 0.5 else max(0.0, 1 - (u - 0.5) / 0.5) ** 1.5)))
    dark = Image.new('RGBA', (O.W, hh), (0, 0, 0, 255)); dark.putalpha(grad.resize((O.W, hh))); layer.alpha_composite(dark, (0, 0))
    y = 470 if O.P else 250
    for (t0, text, golds, size) in parts:
        if t < t0: break
        k = min(1, (t - t0) / 0.22); sc = 0.7 + 0.3 * back(k); f = font('b', int(size * sc))
        maxw = O.W - 120 - (150 if O.P else 240)
        for ln in wrap(text, font('b', size), maxw, d):
            tw = d.textlength(ln, font=f); x = (60 + maxw / 2 if O.P else O.W / 2) - tw / 2
            for w in ln.split():
                col = GOLD if w.strip('.,?!…').upper() in golds else WHITE
                d.text((x + 4, y + 5), w, font=f, fill=(0, 0, 0, 200))
                d.text((x, y), w, font=f, fill=col + (int(255 * k),), stroke_width=3, stroke_fill=(0, 0, 0, int(200 * k)))
                x += d.textlength(w + ' ', font=f)
            y += size * 1.12
        y += size * 0.3
    img.alpha_composite(layer)

# shots filmed with the game's HUD on: zoom in a little so the game's own top bar, objective box and minimap sit outside the frame
# (and clear of the Calgary Insight header), keeping the chat feed and the online buttons
CROP = {'land': {'stagewalk': (1.2, 0.5, 0.6), 'mpheli': (1.2, 0.42, 0.583), 'mpgroup': (1.15, 0.435, 0.42)},
        'port': {'stagewalk': (1.15, 0.5, 0.55), 'mpgroup': (1.08, 0.463, 0.0)}}
def render_segment(seg, W, H, orient, out, stills=None):
    shots = [dict(s) for s in seg['shots']]
    for sh in shots:
        c = CROP[orient].get(sh['clip'])
        if c: sh.update(z0=c[0], z1=c[0], cx=c[1], cy=c[2])
    spec = dict(W=W, H=H, orient=orient, dur=seg['dur'], shots=shots, caps=seg['caps'], labels=seg['labels'],
                notes=seg['notes'], ctas=[], pills=[], hook=[], header_from=-5.0, end=[])
    titles = seg.get('titles', [])
    # the section title is drawn right after the header (Ov.header gets the frame time; labels and captions go on top)
    orig_header = compose.Ov.header
    def header(self, img, tt, a=1.0):
        orig_header(self, img, tt, a)
        for ti in titles:
            if ti['t0'] <= tt < ti['t1']: title_overlay(self, img, tt - ti['t0'], ti['parts'])
    compose.Ov.header = header
    try: compose.build(spec, out, stills)
    finally: compose.Ov.header = orig_header

def run(cmd): r = subprocess.run(cmd, capture_output=True, text=True); assert r.returncode == 0, (r.returncode, r.stderr[-2000:], cmd[-40:]); return r

def nframes(path):
    return int(run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', path]).stdout.strip())

def build_output(name, stills=None):
    O = plan_outputs()[name]; W, H, orient = O['W'], O['H'], O['orient']
    work = f'/home/claude/gta6/v2/{name}'; os.makedirs(work, exist_ok=True)
    segs = []
    for T, seg in O['ins']:
        p = f"{work}/{seg['name']}.mp4"
        if stills: render_segment(seg, W, H, orient, f"{work}/{seg['name']}", stills); continue
        if not os.path.exists(p): render_segment(seg, W, H, orient, p)
        F = math.ceil(T * FPS - 1e-6); nf = nframes(p); assert nf == frames(seg['dur']), (nf, seg['dur'])
        segs.append((F, p, nf, seg))
    if stills: return
    # splice: old[0:F1] + seg1 + old[F1:F2] + seg2 + old[F2:]
    # each piece of the old video is its own input (no frame buffering between pieces)
    old_n = nframes(O['old']); k_old = len(segs) + 1; inputs = []; fc = []; order = []; prev = 0
    for j in range(k_old): inputs += ['-i', O['old']]
    for j, (F, p, nf, seg) in enumerate(segs): inputs += ['-i', p]
    for j, (F, p, nf, seg) in enumerate(segs):
        fc.append(f"[{j}:v]trim=start_frame={prev}:end_frame={F},setpts=PTS-STARTPTS[o{j}]"); order += [f'[o{j}]', f'[{k_old + j}:v]']; prev = F
    fc.append(f"[{len(segs)}:v]trim=start_frame={prev},setpts=PTS-STARTPTS[o{len(segs)}]"); order.append(f'[o{len(segs)}]')
    fc.append(''.join(order) + f"concat=n={len(order)}:v=1:a=0,fps=30[v]")
    total_frames = old_n + sum(s[2] for s in segs); dur = total_frames / FPS
    # voice on the new timeline
    voice = []; shift = 0.0; k = 0
    cuts = [(F / FPS, nf / FPS, seg) for (F, p, nf, seg) in segs]
    for (kk, i, t0) in O['spec']['voice']:
        sh = sum(d for (Tc, d, _) in cuts if t0 >= Tc - 1e-6)
        voice.append([kk, i, round(t0 + sh, 3)])
    for (Tc, d, seg) in cuts:
        before = sum(dd for (T2, dd, _) in cuts if T2 < Tc - 1e-6)
        for (kk, i, t0) in seg['voice']: voice.append([kk, i, round(Tc + before + t0, 3)])
    voice.sort(key=lambda v: v[2])
    aspec = {'dur': round(dur, 3), 'voice': voice}
    json.dump(dict(aspec, cuts=[[round(c[0], 3), round(c[1], 3), c[2]['name']] for c in cuts], frames=total_frames), open(f'{work}/timeline.json', 'w'), indent=1)
    run(['python3', '/home/claude/gta6/audio.py', f'{work}/timeline.json', f'{work}/mix.wav'])
    out = f'/home/claude/gta6/v2/gta6-eve-{name.replace("_land", "")}-v2.mp4'
    run(['ffmpeg', '-y', '-v', 'error', *inputs, '-i', f'{work}/mix.wav', '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', f'{k_old + len(segs)}:a',
         '-c:v', 'libx264', '-crf', os.environ.get('CRF', '19'), '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
         '-shortest', '-movflags', '+faststart', out + '.tmp.mp4'])
    os.replace(out + '.tmp.mp4', out)
    print(name, 'done', out, round(dur, 2), 's', open(f'{work}/mix.wav.json').read())

if __name__ == '__main__':
    if sys.argv[1] == 'specs':
        P = plan_outputs()
        for k, v in P.items():
            for T, seg in v['ins']: print(k, 'insert at', round(T, 3), seg['name'], seg['dur'], [(s['clip'], round(s['dur'], 2)) for s in seg['shots']])
    elif sys.argv[1] == 'stills':
        build_output(sys.argv[2], [float(x) for x in sys.argv[3].split(',')])
    else:
        build_output(sys.argv[2])
