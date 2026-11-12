#!/usr/bin/env python3
"""Build the Cartoon Channel demo end-to-end:  python3 build.py [timeline|render|mix|all]
1 copies the Kokoro voice lines, 2 makes lips.json + timeline.json, 3 renders scenes, 4 mixes voices+SFX+music, 5 assembles MP4."""
import os, sys, json, subprocess, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
NAR = os.path.join(ROOT, 'acquired/narration'); AUD = os.path.join(HERE, 'aud'); os.makedirs(AUD, exist_ok=True)
MAP = {'c0': 'chacha_0', 'z0': 'zoya_0', 'c1': 'chacha_1', 'c2': 'chacha_2', 'z1': 'zoya_1', 'c3': 'chacha_3'}
GAP = 0.35
step = sys.argv[1] if len(sys.argv) > 1 else 'all'

def sh(*a): print('+', ' '.join(a)); subprocess.run(a, check=True)

if step in ('timeline', 'all'):
    for k, src in MAP.items():  # voices: Zoya pitched up slightly for a 14-year-old; trim silences
        af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
        if k[0] == 'z': af = 'asetrate=24000*1.12,aresample=24000,atempo=0.95,' + af
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{NAR}/{src}.wav', '-af', af, '-ar', '44100', '-ac', '1', f'{AUD}/{k}.wav')
    sh('python3', os.path.join(ROOT, 'render/lipsync.py'), f'{HERE}/lips.json', *[f'{k}={AUD}/{k}.wav' for k in MAP])
    durs = json.load(open(f'{HERE}/lips.json'))['durs']
    shots = [{'id': 'open', 'dur': 3.2}, {'id': 'c0', 'dur': durs['c0'] + GAP, 'line': 'c0'}, {'id': 'z0', 'dur': durs['z0'] + GAP, 'line': 'z0'},
             {'id': 'c1', 'dur': durs['c1'] + 0.55, 'line': 'c1', 'launch': durs['c1'] + 0.1}, {'id': 'fall', 'dur': 2.1},
             {'id': 'c2', 'dur': durs['c2'] + 0.45, 'line': 'c2'}, {'id': 'z1', 'dur': durs['z1'] + 0.4, 'line': 'z1'},
             {'id': 'c3', 'dur': durs['c3'] + 1.3, 'line': 'c3'}, {'id': 'end', 'dur': 3.2}]
    t = 0
    for s in shots: s['start'] = round(t, 3); s['dur'] = round(s['dur'], 3); t += s['dur']
    json.dump({'shots': shots, 'total': round(t, 3)}, open(f'{HERE}/timeline.json', 'w'), indent=1); print('total', round(t, 2), 's')

if step in ('render', 'all'):
    sh('python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'full')

if step in ('mix', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json')); S = {s['id']: s for s in tl['shots']}; M = A.Mix(tl['total'])
    for s in tl['shots']:
        if 'line' in s: M.add_file(f'{AUD}/{s["line"]}.wav', s['start'] + 0.05, 1.0, voice=True)
    o = S['open']['start']
    for i in range(10): M.add(A.footstep('hard', i) * 0.25, o + 0.15 + i * 0.29)
    M.add(A.pop(), o + 0.4, 0.5); M.add(A.boing(), o + 0.45, 0.25)
    c1 = S['c1']; M.add(A.magic_sparkle(), c1['start'] + c1['launch'] - 0.8, 0.5); M.add(A.slide_whistle(0.6, True), c1['start'] + c1['launch'], 0.5); M.add(A.whoosh(0.5), c1['start'] + c1['launch'], 0.6)
    f = S['fall']['start']; M.add(A.slide_whistle(1.0, False), f, 0.45); M.add(A.bonk(), f + 1.05, 0.9); M.add(A.boing(), f + 1.12, 0.4); M.add(A.ding(2093), f + 1.3, 0.2)
    M.add(A.boing(0.5), S['c2']['start'] + 0.1, 0.15)
    M.add(A.chime_up(), S['c3']['start'] + S['c3']['dur'] - 1.0, 0.35); M.add(A.whoosh(0.7), S['end']['start'], 0.5); M.add(A.pop(), S['end']['start'] + 0.75, 0.6)
    M.music(A.music_cartoon(tl['total'] + 1), g=0.32, duck=0.3, fade_out=2.5); M.render(f'{HERE}/mix.wav')

if step in ('assemble', 'mix', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json'))
    open(f'{HERE}/list.txt', 'w').write(''.join(f"file 'scene_{s['id']}.mp4'\n" for s in tl['shots']))
    sh('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/list.txt', '-c', 'copy', f'{HERE}/silent.mp4')
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/silent.mp4', '-i', f'{HERE}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{HERE}/Cartoon_Channel_Demo_The_Trick.mp4')
