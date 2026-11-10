"""An original documentary score for the 'What Calgarians pay' video, timed to the narration.

Writes out/score.mid, renders it with FluidSynth (GeneralUser GS if present, FluidR3 GM otherwise) and writes
out/timing.json. Every note is generated here: no samples or recordings from anyone else.
"""
import glob, json, os, shutil, subprocess, sys
import mido

OUT = sys.argv[1]
BPM = 96
BEAT = 60 / BPM
TPB = 480
LEAD, GAP, TAIL = 0.8, 0.4, 3.0

d = json.load(open(os.path.join(OUT, 'durs.json')))['v'] if os.path.exists(os.path.join(OUT, 'durs.json')) \
    else json.load(open('durs.json'))['v']
n = len(d)
starts = [0.0] + [LEAD + sum(d[:i]) + GAP * i for i in range(1, n)]
T = LEAD + sum(d) + GAP * (n - 1) + TAIL
scene = [starts[i + 1] - starts[i] for i in range(n - 1)] + [T - starts[-1]]
speech = list(d)
json.dump({'scene': scene, 'speech': speech, 'starts': starts, 'total': T}, open(os.path.join(OUT, 'timing.json'), 'w'))

CH = {'Dm9': (2, [0, 3, 7, 14]), 'Dm': (2, [0, 3, 7]), 'Bbmaj7': (10, [0, 4, 7, 11]), 'Bb': (10, [0, 4, 7]),
      'F': (5, [0, 4, 7]), 'Fadd9': (5, [0, 4, 7, 14]), 'C': (0, [0, 4, 7]), 'Csus': (0, [0, 5, 7]),
      'Gm': (7, [0, 3, 7]), 'Gm7': (7, [0, 3, 7, 10]), 'A': (9, [0, 4, 7]), 'Asus': (9, [0, 5, 7])}
STYLE = ['intro', 'compare', 'rise', 'rise', 'rise', 'reveal', 'reveal', 'reveal', 'turn', 'sparse', 'finale']
PROG = {'intro': ['Dm9', 'Bbmaj7', 'F', 'Csus'], 'compare': ['Dm9', 'Bbmaj7', 'F', 'C'],
        'rise': ['Dm', 'Bb', 'Gm', 'A'], 'reveal': ['F', 'C', 'Dm', 'Bb'], 'turn': ['Bbmaj7', 'F', 'Gm7', 'C'],
        'sparse': ['Dm9', 'Bbmaj7'], 'finale': ['Bb', 'C', 'Dm', 'Fadd9']}
# channel: (program, volume, reverb, chorus)
INST = {0: (0, 92, 80, 0),      # piano
        1: (49, 84, 100, 40),   # slow strings
        2: (45, 70, 70, 0),     # pizzicato
        3: (42, 80, 80, 0),     # cello
        4: (60, 84, 100, 20),   # French horn
        5: (8, 66, 110, 0),     # celesta
        6: (89, 52, 100, 60),   # warm pad
        7: (47, 76, 90, 0),     # timpani
        8: (119, 60, 100, 0),   # reverse cymbal
        9: (0, 70, 60, 0)}      # drums

ev = []  # (time_s, order, msg)


def note(ch, t, dur, p, v):
    if t >= T or v <= 0:
        return
    dur = min(dur, T + 4 - t)
    ev.append((t, 1, mido.Message('note_on', channel=ch, note=int(p), velocity=int(max(1, min(127, v))))))
    ev.append((t + dur, 0, mido.Message('note_off', channel=ch, note=int(p), velocity=0)))


def place(pc, lo, hi):
    p = lo + ((pc - lo) % 12)
    return p if p <= hi else p - 12


def voicing(name, lo, hi):
    r, iv = CH[name]
    return sorted({place(r + i, lo, hi) for i in iv})


def arp_tones(name):
    r, iv = CH[name]
    base = place(r, 50, 61)
    tones = sorted({base + i for i in iv} | {base + 12, base + 7 + 12 if 7 in iv else base + 12})
    return [x for x in tones if 50 <= x <= 86]


for ch, (pg, vol, rv, chs) in INST.items():
    ev.append((0, -1, mido.Message('program_change', channel=ch, program=pg)))
    for cc, val in ((7, vol), (91, rv), (93, chs), (11, 127)):
        ev.append((0, -1, mido.Message('control_change', channel=ch, control=cc, value=val)))

beat_of = lambda t: round(t / BEAT)
bounds = [beat_of(s) for s in starts] + [int(T / BEAT) + 1]
FINAL_T = T - 5.0                       # the last chord lands as the end card holds

for si in range(n):
    style = STYLE[si] if si < len(STYLE) else 'finale'
    b0, b1 = bounds[si], bounds[si + 1]
    prog = PROG[style]
    lift = {2: 0, 3: 4, 4: 9}.get(si, 0)                 # the costs build through the rise
    for bar, bb in enumerate(range(b0, b1, 4)):
        name = prog[bar % len(prog)]
        t0 = bb * BEAT
        if style == 'finale' and t0 >= FINAL_T - 0.01:
            break
        bar_len = min(4, b1 - bb) * BEAT
        if style == 'finale':
            bar_len = min(bar_len, FINAL_T - t0)
        r, iv = CH[name]
        # strings pad and warm synth pad, voice-led in the middle register
        pv = {'intro': 40, 'compare': 46, 'rise': 50 + lift, 'reveal': 56, 'turn': 48, 'sparse': 34, 'finale': 60}[style]
        for p in voicing(name, 55, 72):
            note(1, t0, bar_len + 0.05, p, pv)
        if style in ('intro', 'compare', 'sparse', 'turn'):
            for p in voicing(name, 48, 64):
                note(6, t0, bar_len + 0.05, p, pv - 8)
        # bass: cello holds the root
        if style != 'intro' or bar > 0:
            note(3, t0, bar_len, place(r, 36, 47), pv + 4)
        # piano arpeggio
        tones = arp_tones(name)
        pat = [0, 2, 1, 3, 2, 4, 3, 2] if len(tones) >= 5 else [0, 2, 1, 3, 2, 1, 3, 2]
        step = 1.0 if style == 'sparse' else 0.5
        pvel = {'intro': 44, 'compare': 46, 'rise': 50 + lift, 'reveal': 52, 'turn': 46, 'sparse': 40, 'finale': 54}[style]
        k = 0
        while k * step < bar_len / BEAT - 1e-6:
            p = tones[pat[k % len(pat)] % len(tones)]
            acc = 6 if (k * step) % 2 == 0 else 0
            note(0, t0 + k * step * BEAT, step * BEAT * 1.6, p, pvel + acc - (k % 2) * 3)
            k += 1
        # pizzicato pulse through the costs
        if style == 'rise':
            for k in range(int(bar_len / BEAT * 2)):
                note(2, t0 + k * BEAT / 2, BEAT / 2, place(r, 43, 54) + (12 if k % 4 == 2 else 0), 46 + lift + (8 if k % 2 == 0 else 0))
            note(7, t0, BEAT * 2, place(r, 40, 51), 46 + lift)          # timpani on the bar
        # the comparison: a light pulse and the horn
        if style in ('reveal', 'finale'):
            for k in range(int(bar_len / BEAT)):
                if k % 2 == 0:
                    note(9, t0 + k * BEAT, 0.2, 36, 54)                      # soft kick
                note(9, t0 + k * BEAT + BEAT / 2, 0.1, 70, 22)               # maracas
            mel = {'reveal': [(0, 69, 2), (2, 72, 2), (4, 67, 3), (7, 69, 1), (8, 65, 2), (10, 69, 2), (12, 70, 3), (15, 69, 1)],
                   'finale': [(0, 74, 2), (2, 72, 2), (4, 72, 2), (6, 67, 2), (8, 69, 3), (11, 72, 1), (12, 72, 4)]}[style]
            cyc = bar % 4
            for (b, p, du) in mel:
                if cyc * 4 <= b < cyc * 4 + 4:
                    tt = t0 + (b - cyc * 4) * BEAT
                    if tt < t0 + bar_len:
                        note(4, tt, du * BEAT * 0.98, p, 58 if style == 'reveal' else 66)
        if style == 'turn' and bar % 2 == 0:
            note(5, t0, BEAT * 2, place(r, 72, 84) + 12, 30)
    # a sparkle as each part opens
    if style in ('intro', 'reveal'):
        for j, p in enumerate([81, 86, 89, 93]):
            note(5, b0 * BEAT + j * BEAT / 2, BEAT * 2, p, 34)

# swells into the budget, the comparison and the close
for si in (2, 5, 10):
    if si < n:
        tb = bounds[si] * BEAT
        note(8, max(0, tb - 2.0), 2.2, 60, 64)
        for k in range(8):                                           # timpani roll, growing
            note(7, tb - 1.0 + k * 0.125, 0.12, 38 if si != 5 else 41, 30 + k * 6)

# the last chord: F with the ninth, everything resolving, a celesta to finish
for p in voicing('Fadd9', 53, 77):
    note(1, FINAL_T, 6.5, p, 66)
for p in voicing('Fadd9', 48, 65):
    note(6, FINAL_T, 6.5, p, 50)
note(3, FINAL_T, 6.5, 41, 64)
note(7, FINAL_T, 2.0, 41, 70)
note(9, FINAL_T, 2.0, 49, 40)                                         # soft crash
for j, p in enumerate([65, 69, 72, 77, 81]):
    note(0, FINAL_T + j * 0.18, 4.5, p, 56 - j * 2)
for j, p in enumerate([84, 89, 93]):
    note(5, FINAL_T + 0.6 + j * 0.3, 3.0, p, 34)

ev.sort(key=lambda x: (x[0], x[1]))
mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM)))
last = 0
for t, _, m in ev:
    tick = int(round(t / BEAT * TPB))
    tr.append(m.copy(time=max(0, tick - last)))
    last = max(last, tick)
mp = os.path.join(OUT, 'score.mid')
mid.save(mp)
print('total', round(T, 2), 'events', len(ev))

fonts = sorted(glob.glob('gugs/**/*.sf2', recursive=True)) + ['/usr/share/sounds/sf2/FluidR3_GM.sf2']
for f in fonts:
    if not os.path.exists(f):
        continue
    tag = 'gugs' if 'gugs' in f else 'fluid'
    wav = os.path.join(OUT, f'score_{tag}.wav')
    if os.path.exists(wav):
        continue
    r = subprocess.run(['fluidsynth', '-ni', '-g', '0.45', '-r', '44100', '-R', '1', '-C', '1',
                        '-o', 'synth.reverb.room-size=0.82', '-o', 'synth.reverb.width=1.0', '-o', 'synth.reverb.level=0.75',
                        '-o', 'synth.reverb.damp=0.35', '-F', wav, f, mp], capture_output=True, text=True)
    print(tag, f, r.returncode, r.stderr[-400:])
    if os.path.exists(wav) and shutil.which('ffmpeg'):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, wav.replace('.wav', '.flac')])
        os.remove(wav)
