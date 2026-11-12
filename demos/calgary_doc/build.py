#!/usr/bin/env python3
"""Build the CalgaryInsight documentary demo:  python3 build.py [timeline|render|mix|all]"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
NAR = os.path.join(ROOT, 'acquired/narration'); AUD = os.path.join(HERE, 'aud'); os.makedirs(AUD, exist_ok=True)
step = sys.argv[1] if len(sys.argv) > 1 else 'all'
def sh(*a): print('+', ' '.join(a)); subprocess.run(a, check=True)
PLAN = [('d0', 0.8, 0.8), ('d1', 0.4, 0.9), ('d2', 0.4, 1.9), ('d3', 0.4, 0.9), ('d4', 0.6, 0.9), ('d5', 0.3, 1.2), ('d6', 0.7, 1.8)]  # id, voice offset, tail
if step in ('timeline', 'all'):
    durs = []
    for i in range(7):
        sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{NAR}/doc_{i}.wav', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', '-ar', '44100', '-ac', '1', f'{AUD}/v{i}.wav')
        durs.append(float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{AUD}/v{i}.wav'], capture_output=True, text=True).stdout))
    shots, t = [], 0
    for i, (sid, vo, tail) in enumerate(PLAN):
        d = round(vo + durs[i] + tail, 3); shots.append({'id': sid, 'start': round(t, 3), 'dur': d, 'vo': vo, 'line': i}); t += d
    json.dump({'shots': shots, 'durs': [round(x, 3) for x in durs], 'total': round(t, 3)}, open(f'{HERE}/timeline.json', 'w'), indent=1); print('total', round(t, 2))
if step in ('render', 'all'):
    sh('python3', os.path.join(ROOT, 'render/render.py'), f'{HERE}/index.html', 'full')
if step in ('mix', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json')); M = A.Mix(tl['total'])
    for s in tl['shots']: M.add_file(f'{AUD}/v{s["line"]}.wav', s['start'] + s['vo'], 1.0, voice=True)
    S = {s['id']: s for s in tl['shots']}
    M.add(A.riser(2.5) * 0.4, 0.0); M.add(A.whoosh(0.8), S['d1']['start'] - 0.2, 0.35); M.add(A.impact_boom(1.5), S['d2']['start'] + 0.4 + tl['durs'][2] * 0.55 + 1.5, 0.25)
    M.add(A.whoosh(0.8), S['d4']['start'] - 0.2, 0.35); M.add(A.amb_wind(12)[:int(A.SR * S['d5']['dur'])] * 0.25, S['d5']['start'], 1.0); M.add(A.chime_up(), S['d6']['start'] + 0.3, 0.3)
    M.music(A.music_documentary(tl['total'] + 2), g=0.34, duck=0.32, fade_out=3.0); M.render(f'{HERE}/mix.wav')
if step in ('mix', 'assemble', 'all'):
    tl = json.load(open(f'{HERE}/timeline.json'))
    open(f'{HERE}/list.txt', 'w').write(''.join(f"file 'scene_{s['id']}.mp4'\n" for s in tl['shots']))
    sh('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{HERE}/list.txt', '-c', 'copy', f'{HERE}/silent.mp4')
    sh('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{HERE}/silent.mp4', '-i', f'{HERE}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{HERE}/CalgaryInsight_Demo_City_Above_the_Street.mp4')
