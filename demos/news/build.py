#!/usr/bin/env python3
"""Build the News Channel demo:  python3 build.py [timeline|render|mix|all]"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
NAR = os.path.join(ROOT, 'acquired/narration'); AUD = os.path.join(HERE, 'aud'); os.makedirs(AUD, exist_ok=True)
step = sys.argv[1] if len(sys.argv) > 1 else 'all'
def sh(*a): print('+', ' '.join(a)); subprocess.run(a, check=True)
if step in ('timeline', 'all'):
    for i in range(6):
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{NAR}/anchor_{i}.wav', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', f'{AUD}/a{i}.wav')
    sh('python3', os.path.join(ROOT, 'render/lipsync.py'), f'{HERE}/lips.json', *[f'a{i}={AUD}/a{i}.wav' for i in range(6)])
    d = json.load(open(f'{HERE}/lips.json'))['durs']
    shots = [{'id': 'sting', 'dur': 2.3}, {'id': 'a0', 'dur': d['a0'] + 0.5, 'line': 0, 'vo_at': 0.1}, {'id': 'a1', 'dur': d['a1'] + 0.5, 'line': 1, 'vo_at': 0.25},
             {'id': 'a2', 'dur': d['a2'] + 1.6, 'line': 2, 'vo_at': 0.8}, {'id': 'a3', 'dur': d['a3'] + 1.4, 'line': 3, 'vo_at': 0.7},
             {'id': 'a4', 'dur': d['a4'] + 1.2, 'line': 4, 'vo_at': 0.8}, {'id': 'a5', 'dur': d['a5'] + 2.6, 'line': 5, 'vo_at': 0.1}]
    t = 0
    for s in shots: s['start'] = round(t, 3); s['dur'] = round(s['dur'], 3); t += s['dur']
    json.dump({'shots': shots, 'total': round(t, 3)}, open(f'{HERE}/timeline.json', 'w'), indent=1); print('total', round(t, 2))
if step in ('render', 'all'):
    sh('python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'full')
if step in ('mix', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json')); S = {s['id']: s for s in tl['shots']}; M = A.Mix(tl['total'])
    # mouths in index.html run from shot start (lip(i, t)); voices placed at shot start except where a transition plays first
    for s in tl['shots']:
        if 'line' in s: M.add_file(f'{AUD}/a{s["line"]}.wav', s['start'] + s['vo_at'], 1.0, voice=True)
    M.add(A.sting_news(), 0.0, 0.8)
    M.add(A.whoosh(0.6), S['a1']['start'] + 0.1, 0.5); M.add(A.impact_boom(1.2), S['a1']['start'] + 0.3, 0.35)
    for k in ('a2', 'a4'): M.add(A.swoosh_news(0.8), S[k]['start'], 0.6)
    M.add(A.whoosh(0.5), S['a3']['start'], 0.5)
    for i in range(5): M.add(A.ticker_blip(), S['a2']['start'] + 0.3 + i * 0.25, 0.25); M.add(A.pop(), S['a4']['start'] + 0.5 + i * 0.55, 0.35)
    for i in range(3): M.add(A.ding(880 + i * 220), S['a3']['start'] + 0.6 + i * 0.5, 0.2)
    M.add(A.sting_news(), S['a5']['start'] + S['a5']['dur'] - 2.3, 0.7)
    M.music(A.music_news(tl['total'] + 1), g=0.30, duck=0.28, fade_out=2.0); M.render(f'{HERE}/mix.wav')
if step in ('mix', 'assemble', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json'))
    open(f'{HERE}/list.txt', 'w').write(''.join(f"file 'scene_{s['id']}.mp4'\n" for s in tl['shots']))
    sh('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/list.txt', '-c', 'copy', f'{HERE}/silent.mp4')
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/silent.mp4', '-i', f'{HERE}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{HERE}/News_Channel_Demo_Breaking_Bulletin.mp4')
