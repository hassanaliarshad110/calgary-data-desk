#!/usr/bin/env python3
"""Cricket Kahani #1 — Shoaib Akhtar 161.3 km/h (vertical 1080x1920).  python3 build.py [timeline|render|mix|all]"""
import os, sys, json, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
SRC = '/home/claude/ck/tts_out'; AUD = os.path.join(HERE, 'aud'); os.makedirs(AUD, exist_ok=True)
N = 9; step = sys.argv[1] if len(sys.argv) > 1 else 'all'
def sh(*a): print('+', ' '.join(a)); subprocess.run(a, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
if step in ('timeline', 'all'):
    for i in range(N):
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{SRC}/hi_{i}.wav', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', f'{AUD}/v{i}.wav')
    d = [round(dur(f'{AUD}/v{i}.wav'), 3) for i in range(N)]
    lead = [0.6] + [0.15] * (N - 1); tail = [0.35] * (N - 1) + [2.6]
    shots, t = [], 0
    for i in range(N):
        s = {'id': f's{i}', 'line': i, 'vo_at': lead[i], 'vo': d[i], 'dur': round(lead[i] + d[i] + tail[i], 3), 'start': round(t, 3)}
        t += s['dur']; shots.append(s)
    json.dump({'shots': shots, 'total': round(t, 3)}, open(f'{HERE}/timeline.json', 'w'), indent=1); print('total', round(t, 2), d)
if step in ('render', 'all'):
    env = dict(os.environ, W='1080', H='1920')
    subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'full'] + sys.argv[2:], check=True, env=env)
if step in ('mix', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json')); S = {s['id']: s for s in tl['shots']}; T = tl['total']; M = A.Mix(T + 0.5)
    SFX = 0.35; _add = M.add; M.add = lambda x, at, g=1.0, voice=False: _add(x, at, g if voice else g * SFX, voice)
    for s in tl['shots']: M.add_file(f'{AUD}/v{s["line"]}.wav', s['start'] + s['vo_at'], 1.0, voice=True)
    # crowd bed: band-passed noise with slow swells (synthesised)
    n = A.noise(T); sw = 0.55 + 0.45 * np.sin(np.linspace(0, T * 0.9, len(n))) ** 2
    crowd = A.norm(A.bpf(n, 300, 2500) * sw, 0.5)
    M.add(crowd, 0, 0.06)
    s0 = S['s0']['start']; M.add(A.whoosh(0.5), s0 + 0.25, 0.7); M.add(A.impact_boom(1.4), s0 + 0.55, 0.45)
    for k in range(10): M.add(A.ticker_blip(), s0 + 0.6 + k * 0.12, 0.15)
    M.add(A.swoosh_news(0.8), S['s1']['start'], 0.5)
    s2 = S['s2']['start']; [M.add(A.thud(), s2 + 0.3 + k * 0.32, 0.18) for k in range(int((S['s2']['dur'] - 0.6) / 0.32))]
    s3 = S['s3']['start']; d3 = S['s3']['dur']
    for k in range(6): M.add(A.ticker_blip(), s3 + 0.5 + k * (d3 * 0.62 / 6), 0.35)
    M.add(A.impact_boom(1.5), s3 + 0.5 + 5 * (d3 * 0.62 / 6), 0.45)
    cheer = A.norm(A.bpf(A.noise(3.0), 400, 3500) * np.concatenate([np.linspace(0, 1, int(A.SR * 0.4)), np.linspace(1, 0, int(A.SR * 2.6))]), 0.6)
    M.add(cheer, s3 + 0.5 + 5 * (d3 * 0.62 / 6), 0.35)
    s4 = S['s4']['start']; M.add(A.whoosh(0.7), s4 + 0.6, 0.6); M.add(A.thud(), s4 + 2.2, 0.35)
    s5 = S['s5']['start']; [M.add(A.heartbeat(), s5 + 0.3 + k * 1.0, 0.35) for k in range(int(S['s5']['dur']))]
    s6 = S['s6']['start']; M.add(A.camera_shutter(), s6 + S['s6']['dur'] * 0.45, 0.35)
    s7 = S['s7']['start']; M.add(A.whoosh(0.4), s7 + 0.55, 0.6); M.add(A.thud(), s7 + 0.95, 0.8); M.add(A.ding(1320), s7 + 3.2, 0.3); M.add(cheer, s7 + 1.0, 0.3)
    M.add(A.chime_up(), S['s8']['start'] + 0.3, 0.35); M.add(A.pop(), S['s8']['start'] + 1.2, 0.3)
    M.music(A.music_news(T + 1), g=0.14, duck=0.18, fade_out=2.0); M.render(f'{HERE}/mix.wav')
if step in ('mix', 'assemble', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json'))
    open(f'{HERE}/list.txt', 'w').write(''.join(f"file 'scene_{s['id']}.mp4'\n" for s in tl['shots']))
    sh('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/list.txt', '-c', 'copy', f'{HERE}/silent.mp4')
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/silent.mp4', '-i', f'{HERE}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{HERE}/CricketKahani_01_Shoaib_161.mp4')
