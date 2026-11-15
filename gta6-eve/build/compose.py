# Calgary Insight: GTA 6 eve video compositor (gameplay frames + overlays -> ffmpeg)
# usage: python3 compose.py spec.json out.mp4 [--stills t1,t2,...]
import json, sys, os, glob, math, subprocess, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FD = '/home/claude/studio/motion/engine/fonts/'
_fc = {}
def font(w, size):
    k = (w, size)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(FD + {'b': 'fira-sans-bold.woff', 's': 'fira-sans-semibold.woff', 'm': 'fira-sans-medium.woff', 'r': 'fira-sans-regular.woff'}[w], size)
    return _fc[k]
SYM = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
GOLD = (255, 196, 0); NAVY = (8, 21, 48); WHITE = (255, 255, 255); RED = (200, 16, 46)
LOGO = Image.open('/home/claude/gta6/logo.png').convert('RGBA')
_logo = {}
def logo(sz):
    if sz not in _logo: _logo[sz] = LOGO.resize((sz, sz), Image.LANCZOS)
    return _logo[sz]

def ease(k): k = max(0.0, min(1.0, k)); return k * k * (3 - 2 * k)
def back(k):
    k = max(0.0, min(1.0, k)); c1 = 1.70158; c3 = c1 + 1; return 1 + c3 * (k - 1) ** 3 + c1 * (k - 1) ** 2

# ------------------------------------------------------------------ clips
class Clips:
    def __init__(self, orient): self.o = orient; self.c = {}; self.cache = {}
    def frames(self, name):
        if name not in self.c: self.c[name] = sorted(glob.glob(f'/home/claude/cap/clips/{self.o}/{name}/f_*.jpg'))
        return self.c[name]
    def img(self, path):
        if path not in self.cache:
            if len(self.cache) > 90: self.cache.clear()
            self.cache[path] = Image.open(path).convert('RGB')
        return self.cache[path]
    def get(self, name, fpos):
        fr = self.frames(name); n = len(fr)
        if n == 0: raise SystemExit('no frames for ' + name)
        fpos = max(0.0, min(n - 1.0, fpos)); i = int(fpos); a = fpos - i
        im = self.img(fr[i])
        if a > 0.05 and i + 1 < n: im = Image.blend(im, self.img(fr[i + 1]), a)
        return im

def shot_frame(C, s, tl, W, H):
    # s: {clip, dur, start (s), speed, z0, z1, cx, cy}
    if 'a' in s:
        n = len(C.frames(s['clip'])); fpos = (s['a'] + (s.get('b', 1.0) - s['a']) * min(1.0, tl / max(0.001, s['dur']))) * (n - 1)
    else:
        sp = s.get('speed', 1.0); fpos = s.get('start', 0) * 30 + tl * 30 * sp
    im = C.get(s['clip'], fpos)
    k = tl / max(0.001, s['dur']); z = s.get('z0', 1.0) + (s.get('z1', s.get('z0', 1.0)) - s.get('z0', 1.0)) * ease(k)
    if z > 1.001:
        cx, cy = s.get('cx', 0.5), s.get('cy', 0.5)
        if 'cx1' in s: cx += (s['cx1'] - cx) * ease(k); cy += (s.get('cy1', cy) - cy) * ease(k)
        w, h = im.width / z, im.height / z
        x0 = min(max(0, cx * im.width - w / 2), im.width - w); y0 = min(max(0, cy * im.height - h / 2), im.height - h)
        im = im.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + w, y0 + h))
    elif im.size != (W, H): im = im.resize((W, H), Image.BICUBIC)
    return im

# ------------------------------------------------------------------ text helpers
def wrap(text, f, maxw, d):
    words = text.split(); lines = []; cur = ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def rrect(d, box, r, fill): d.rounded_rectangle(box, r, fill=fill)

def text_shadow(img, xy, text, f, fill=WHITE, anchor='la', shadow=6, salpha=170, stroke=0):
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    sd.text((xy[0] + 3, xy[1] + 4), text, font=f, fill=(0, 0, 0, salpha), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, salpha))
    sh = sh.filter(ImageFilter.GaussianBlur(shadow)); img.alpha_composite(sh)
    ImageDraw.Draw(img).text(xy, text, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))

SUBS = [(r'G T A six', 'GTA 6'), (r'G T A', 'GTA'), (r'Y Y C', 'YYC'), (r'three one one', '311'), (r'eight one one', '811'),
        (r'calgary insight dot c a slash game', 'calgaryinsight.ca/game'), (r'calgary insight dot c a', 'calgaryinsight.ca'), (r'PlayStation five', 'PlayStation 5')]
def disp(t):
    for a, b in SUBS: t = re.sub(a, b, t, flags=re.I)
    return t

def chunks(text, maxc):
    words = disp(text).split(); out = []; cur = []
    for w in words:
        if cur and (len(' '.join(cur + [w])) > maxc): out.append(' '.join(cur)); cur = [w]
        else: cur.append(w)
        if cur and re.search(r'[.?!:]$', w) and len(' '.join(cur)) > maxc * 0.45: out.append(' '.join(cur)); cur = []
    if cur: out.append(' '.join(cur))
    return out

# ------------------------------------------------------------------ overlay pieces
class Ov:
    def __init__(self, W, H, spec): self.W, self.H, self.s = W, H, spec; self.P = H > W
    def header(self, img, t, a=1.0):
        W, H = self.W, self.H
        if a <= 0: return
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        if self.P:
            f = font('s', 44); tw = d.textlength('Calgary Insight', font=f); L = 76; x0 = int((W - (L + 18 + tw)) / 2); y = 132
            rrect(d, (x0 - 22, y - 12, x0 + L + 18 + tw + 26, y + L + 12), 26, (8, 21, 48, 200))
            layer.alpha_composite(logo(L), (x0, y)); d.text((x0 + L + 18, y + L / 2), 'Calgary Insight', font=f, fill=WHITE, anchor='lm')
        else:
            L = 62; x, y = 44, 36
            f = font('b', 30); t1 = 'CALGARY INSIGHT'; t2 = '  ·  GAMEPLAY'
            w1 = d.textlength(t1, font=f); w2 = d.textlength(t2, font=f)
            rrect(d, (x - 14, y - 10, x + L + 18 + w1 + w2 + 22, y + L + 10), 22, (8, 21, 48, 190))
            layer.alpha_composite(logo(L), (x, y)); d.text((x + L + 18, y + L / 2), t1, font=f, fill=WHITE, anchor='lm')
            d.text((x + L + 18 + w1, y + L / 2), t2, font=f, fill=GOLD, anchor='lm')
        if a < 1: layer.putalpha(layer.getchannel('A').point(lambda v: int(v * a)))
        img.alpha_composite(layer)
    def chip(self, img, text, x, y, size=26, fill=(8, 21, 48, 185), col=WHITE, anchor='l', a=1.0):
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer); f = font('s', size)
        tw = d.textlength(text, font=f); px = size * 0.7; h = size * 1.75
        if anchor == 'c': x = x - (tw + 2 * px) / 2
        if anchor == 'r': x = x - (tw + 2 * px)
        rrect(d, (x, y, x + tw + 2 * px, y + h), h / 2, fill); d.text((x + px, y + h / 2), text, font=f, fill=col, anchor='lm')
        if a < 1: layer.putalpha(layer.getchannel('A').point(lambda v: int(v * a)))
        img.alpha_composite(layer)
    def gameplay_tag(self, img):
        if self.P: self.chip(img, 'Gameplay: YYC City Stories', 60, 1150, 30)
        else: self.chip(img, 'Gameplay: YYC City Stories', 44, 112 + 16, 24)
    def label(self, img, kicker, title, tl, dur):
        # slides in from the left, holds, fades out
        a = min(1, tl / 0.35, max(0, (dur - tl) / 0.4));
        if a <= 0: return
        off = (1 - ease(min(1, tl / 0.45))) * -80
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        if self.P:
            x, y, maxw = 60 + off, 330, self.W - 60 - 150; fk, ft = font('b', 40), font('b', 76)
        else:
            x, y, maxw = 44 + off, 196, 1000; fk, ft = font('b', 28), font('b', 54)
        lines = wrap(title, ft, maxw, d); lh = ft.size * 1.08
        bw = max([d.textlength(kicker, font=fk)] + [d.textlength(l, font=ft) for l in lines]) + 56
        bh = fk.size * 1.5 + lh * len(lines) + 34
        rrect(d, (x - 4, y, x + bw, y + bh), 24, (8, 21, 48, 205))
        d.rectangle((x - 4, y + 18, x + 6, y + bh - 18), fill=GOLD + (255,))
        d.text((x + 28, y + 16), kicker.upper(), font=fk, fill=GOLD)
        for i, l in enumerate(lines): d.text((x + 28, y + 16 + fk.size * 1.45 + i * lh), l, font=ft, fill=WHITE)
        layer.putalpha(layer.getchannel('A').point(lambda v: int(v * a))); img.alpha_composite(layer)
    def caption(self, img, text):
        if not text: return
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        if self.P: f = font('b', 58); maxw = self.W - 120 - 150; cy = 1300; cx = 60 + maxw / 2
        else: f = font('b', 50); maxw = 1500; cy = self.H - 120; cx = self.W / 2
        lines = wrap(text, f, maxw, d); lh = f.size * 1.2
        tw = max(d.textlength(l, font=f) for l in lines); bh = lh * len(lines) + 26
        y0 = cy - bh / 2
        rrect(d, (cx - tw / 2 - 26, y0, cx + tw / 2 + 26, y0 + bh), 18, (0, 0, 0, 165))
        for i, l in enumerate(lines): d.text((cx, y0 + 13 + i * lh + lh / 2), l, font=f, fill=WHITE, anchor='mm')
        img.alpha_composite(layer)
    def follow_pill(self, img, tl, dur):
        a = min(1, tl / 0.3, max(0, (dur - tl) / 0.3)); s = 0.85 + 0.15 * back(min(1, tl / 0.4))
        if a <= 0: return
        txt = 'Follow @calgaryinsight for more Calgary stories'
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        f = font('b', int((40 if self.P else 34) * s)); tw = d.textlength(txt, font=f); h = f.size * 1.9; bell = h * 0.8
        cx = (60 + (self.W - 210) / 2) if self.P else self.W / 2; y = 250 if self.P else 132
        x0 = cx - (tw + bell + 70) / 2
        rrect(d, (x0, y, x0 + tw + bell + 70, y + h), h / 2, (200, 16, 46, 235))
        self.bell(d, x0 + 22 + bell / 2, y + h / 2, bell * 0.8, tl)
        d.text((x0 + 40 + bell, y + h / 2), txt, font=f, fill=WHITE, anchor='lm')
        layer.putalpha(layer.getchannel('A').point(lambda v: int(v * a))); img.alpha_composite(layer)
    def bell(self, d, cx, cy, s, t):
        ang = math.sin(t * 14) * 0.35 * max(0, 1 - t / 1.5)
        pts = []
        for i in range(21):
            u = i / 20; x = (u - 0.5) * s * 0.8; yb = -s * 0.42 + (1 - (2 * u - 1) ** 2) * -s * 0.05
            pts.append((x, yb if 0 else -s * 0.42 * math.sin(math.pi * u) ** 0.6))
        body = [(-s * 0.36, s * 0.22), (-s * 0.3, -s * 0.1)] + [((u - 0.5) * s * 0.6, -s * 0.1 - s * 0.32 * math.sin(math.pi * u)) for u in [i / 12 for i in range(13)]] + [(s * 0.3, -s * 0.1), (s * 0.36, s * 0.22)]
        rot = lambda p: (cx + p[0] * math.cos(ang) - p[1] * math.sin(ang), cy + p[0] * math.sin(ang) + p[1] * math.cos(ang))
        d.polygon([rot(p) for p in body], fill=WHITE)
        d.ellipse((cx - s * 0.09, cy + s * 0.22, cx + s * 0.09, cy + s * 0.38), fill=WHITE)

    # ---- hook: big kinetic text over fast cuts
    def hook(self, img, t, parts):
        # parts: [(t0, text, gold_words, size)]
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        # darken top for legibility
        grad = Image.new('L', (1, 256)); [grad.putpixel((0, i), int(150 * (1 - i / 255) ** 1.4)) for i in range(256)]
        g = grad.resize((self.W, int(self.H * (0.62 if self.P else 0.7))))
        dark = Image.new('RGBA', g.size, (0, 0, 0, 255)); dark.putalpha(g); layer.alpha_composite(dark, (0, 360 if self.P else 0))
        y = 420 if self.P else 110
        for (t0, text, golds, size) in parts:
            if t < t0: break
            k = min(1, (t - t0) / 0.22); sc = 0.7 + 0.3 * back(k)
            f = font('b', int(size * sc))
            maxw = self.W - 120 - (150 if self.P else 240)
            for ln in wrap(text, font('b', size), maxw, d):
                words = ln.split(); tw = d.textlength(ln, font=f); x = (60 + maxw / 2 if self.P else self.W / 2) - tw / 2
                for w in words:
                    col = GOLD if w.strip('.,?!…').upper() in golds else WHITE
                    sh = (0, 0, 0, 200)
                    d.text((x + 4, y + 5), w, font=f, fill=sh)
                    d.text((x, y), w, font=f, fill=col + (int(255 * k),), stroke_width=3, stroke_fill=(0, 0, 0, int(200 * k)))
                    x += d.textlength(w + ' ', font=f)
                y += size * 1.12
            y += size * 0.25
        img.alpha_composite(layer)
        small = 'Not affiliated with Rockstar Games.'
        if self.P: self.chip(img, small, 60, 1340, 26, fill=(0, 0, 0, 150))
        else: self.chip(img, small, self.W - 44, self.H - 76, 22, fill=(0, 0, 0, 150), anchor='r')

    def cta(self, img, tl, big, small_top=None):
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        a = min(1, tl / 0.3); sc = 0.85 + 0.15 * back(min(1, tl / 0.35))
        cx = (60 + (self.W - 210) / 2) if self.P else self.W / 2; cy = 760 if self.P else self.H * 0.42
        f1 = font('b', int((56 if self.P else 54) * sc)); f2 = font('b', int((84 if self.P else 96) * sc))
        maxw = self.W - 120 - (150 if self.P else 300)
        lines = wrap(big, f2, maxw, d); h = (f1.size * 1.6 if small_top else 0) + f2.size * 1.15 * len(lines) + 70
        tw = max([d.textlength(l, font=f2) for l in lines] + ([d.textlength(small_top, font=f1)] if small_top else []))
        rrect(d, (cx - tw / 2 - 50, cy - h / 2, cx + tw / 2 + 50, cy + h / 2), 34, (8, 21, 48, int(225 * a)))
        y = cy - h / 2 + 35
        if small_top: d.text((cx, y), small_top, font=f1, fill=GOLD + (int(255 * a),), anchor='ma'); y += f1.size * 1.6
        for l in lines: d.text((cx, y), l, font=f2, fill=WHITE + (int(255 * a),), anchor='ma'); y += f2.size * 1.15
        img.alpha_composite(layer)

    def endcard(self, img, tl, title):
        W, H, P = self.W, self.H, self.P
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
        d.rectangle((0, 0, W, H), fill=(8, 21, 48, int(min(1, tl / 0.4) * 215)))
        cx = (60 + (W - 210) / 2) if P else W / 2
        L = int((330 if P else 260) * back(min(1, tl / 0.6)))
        if L > 4: layer.alpha_composite(logo(L), (int(cx - L / 2), (330 if P else 70) + ((330 if P else 260) - L) // 2))
        y = 700 if P else 350
        def tx(s, f, col, yy, k0):
            a = max(0, min(1, (tl - k0) / 0.3))
            if a > 0: d.text((cx, yy), s, font=f, fill=col + (int(255 * a),), anchor='ma')
        tx(title, font('b', 64 if P else 66), WHITE, y, 0.3)
        tx('Play free: calgaryinsight.ca/game', font('b', 52 if P else 52), GOLD, y + (95 if P else 90), 0.5)
        tx('Comment below: which spot should we add next?', font('s', 38 if P else 36), WHITE, y + (175 if P else 165), 0.7)
        # subscribe button + follow
        by = y + (270 if P else 245); a = max(0, min(1, (tl - 0.9) / 0.3))
        if a > 0:
            fb = font('b', 44 if P else 40); bw = d.textlength('SUBSCRIBE', font=fb) + 120; bh = 92 if P else 84
            pressed = 1.5 < tl < 1.75
            sh = 4 if pressed else 0
            bx = cx - bw / 2 if P else cx - bw - 30
            rrect(d, (bx, by + sh, bx + bw, by + bh + sh), 16, (204, 0, 0, int(255 * a)) if not (tl > 1.75) else (110, 110, 110, int(255 * a)))
            d.text((bx + 34 + 24, by + bh / 2 + sh), 'SUBSCRIBED' if tl > 1.75 else 'SUBSCRIBE', font=fb if tl <= 1.75 else font('b', (44 if P else 40) - 6), fill=WHITE + (int(255 * a),), anchor='lm')
            self.bell(d, bx + 34, by + bh / 2 + sh, 40, max(0, tl - 1.75) if tl > 1.75 else 0)
            fx = cx - (d.textlength('Follow @calgaryinsight', font=fb) + 60) / 2 if P else cx + 30
            fy = by + bh + 30 if P else by
            fw = d.textlength('Follow @calgaryinsight', font=fb) + 60
            rrect(d, (fx, fy, fx + fw, fy + bh), bh / 2, (255, 255, 255, int(235 * a)))
            d.text((fx + fw / 2, fy + bh / 2), 'Follow @calgaryinsight', font=fb, fill=NAVY + (int(255 * a),), anchor='mm')
            # hand cursor tapping the button (a small circle pulse)
            if 1.2 < tl < 2.2:
                r = 18 + 30 * ((tl - 1.2) % 0.5); al = int(200 * (1 - ((tl - 1.2) % 0.5) / 0.5))
                d.ellipse((bx + bw * 0.7 - r, by + bh / 2 - r, bx + bw * 0.7 + r, by + bh / 2 + r), outline=(255, 255, 255, al), width=5)
        tx('Facebook · Instagram · YouTube', font('m', 32 if P else 30), (200, 210, 225), (by + (92 + 30 + 92 + 40) if P else by + 84 + 40), 1.1)
        tx('More at calgaryinsight.ca', font('s', 38 if P else 36), WHITE, (by + 330 if P else by + 84 + 95), 1.2)
        tx('Not affiliated with Rockstar Games or the City of Calgary.', font('r', 26 if P else 24), (170, 180, 195), (1400 if P else H - 60), 1.2)
        img.alpha_composite(layer)

# ------------------------------------------------------------------ main
def build(spec, out, stills=None):
    W, H = spec['W'], spec['H']; C = Clips(spec['orient']); O = Ov(W, H, spec)
    shots = spec['shots']; T = spec['dur']; fps = 30
    t = 0
    for s in shots: s['t0'] = t; t += s['dur']
    if abs(t - T) > 0.05: print('warning: shots', t, 'vs dur', T)
    def at(tt):
        for s in shots:
            if s['t0'] <= tt < s['t0'] + s['dur']: return s
        return shots[-1]
    def render(tt):
        s = at(tt); tl = tt - s['t0']
        img = shot_frame(C, s, tl, W, H).convert('RGBA')
        # cross-dissolve into this shot (first 8 frames) when asked
        if s.get('fade_in') and tl < s['fade_in']:
            i = shots.index(s)
            if i > 0:
                p = shots[i - 1]; prev = shot_frame(C, p, p['dur'] + tl, W, H).convert('RGBA')
                img = Image.blend(prev, img, ease(tl / s['fade_in']))
        hook = [h for h in spec.get('hook', []) if h['t0'] <= tt < h['t1']]
        end = [e for e in spec.get('end', []) if e['t0'] <= tt]
        if end and spec.get('endcard'):
            O.endcard(img, tt - end[0]['t0'], spec['endcard'])
            return img.convert('RGB')
        if not hook and tt >= spec.get('header_from', 3.0):
            O.header(img, tt, min(1, (tt - spec.get('header_from', 3.0)) / 0.4)); O.gameplay_tag(img)
        for h in hook: O.hook(img, tt - h['t0'], h['parts'])
        for lb in spec.get('labels', []):
            if lb['t0'] <= tt < lb['t0'] + lb['dur']: O.label(img, lb['k'], lb['title'], tt - lb['t0'], lb['dur'])
        for n in spec.get('notes', []):
            if n['t0'] <= tt < n['t1']:
                a = min(1, (tt - n['t0']) / 0.3, (n['t1'] - tt) / 0.3)
                if O.P: O.chip(img, n['text'], 60, 1210 if not n.get('y') else n['y'], 26, fill=(0, 0, 0, 160), a=a)
                else: O.chip(img, n['text'], W - 44, H - 222, 22, fill=(0, 0, 0, 150), anchor='r', a=a)
        for c in spec.get('ctas', []):
            if c['t0'] <= tt < c['t1']: O.cta(img, tt - c['t0'], c['big'], c.get('top'))
        for pf in spec.get('pills', []):
            if pf['t0'] <= tt < pf['t0'] + pf['dur']: O.follow_pill(img, tt - pf['t0'], pf['dur'])
        if not hook:
            cap = [c for c in spec['caps'] if c['t0'] <= tt < c['t1']]
            if cap: O.caption(img, cap[0]['text'])
        return img.convert('RGB')
    if stills:
        for tt in stills:
            render(tt).save(f"{out}_{tt:.1f}.jpg", quality=88)
        return
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                          '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out + '.tmp.mp4'], stdin=subprocess.PIPE)
    N = int(round(T * fps))
    for i in range(N):
        p.stdin.write(render(i / fps).tobytes())
        if i % 300 == 0: print(out, i, '/', N, flush=True)
    p.stdin.close(); p.wait()
    if p.returncode == 0: os.replace(out + '.tmp.mp4', out)

if __name__ == '__main__':
    spec = json.load(open(sys.argv[1])); out = sys.argv[2]
    st = None
    if '--stills' in sys.argv: st = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1].split(',')]
    build(spec, out, st)
