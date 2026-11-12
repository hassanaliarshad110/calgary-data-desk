#!/usr/bin/env python3
"""Render the engine reels (working examples of every preset) into assets/reels/Engine_Reel.mp4."""
import os, sys, subprocess, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); OUT = os.path.join(ROOT, 'assets/reels'); os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(ROOT, 'render')); import audio as A
env = dict(os.environ, OUT=OUT)
if 'mix' not in sys.argv:
    subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), os.path.join(ROOT, 'tools/reels.html'), 'full'], env=env, check=True)
    subprocess.run(['python3', os.path.join(ROOT, 'render/render.py'), os.path.join(ROOT, 'tools/rig3d_reel.html'), 'full'], env=env, check=True)
order = ['moves', 'camera', 'transitions', 'text', 'parallax', 'fx', 'broadcast', 'rig3d']
open(f'{OUT}/list.txt', 'w').write(''.join(f"file 'scene_{s}.mp4'\n" for s in order))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', f'{OUT}/list.txt', '-c', 'copy', f'{OUT}/silent.mp4'], check=True)
D = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{OUT}/silent.mp4'], capture_output=True, text=True).stdout)
M = A.Mix(D); M.music(A.music_cartoon(D + 1), g=0.5, duck=1, fade_out=2); M.render(f'{OUT}/mix.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{OUT}/silent.mp4', '-i', f'{OUT}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', f'{OUT}/Engine_Reel.mp4'], check=True)
print('Engine_Reel.mp4', round(D, 1), 's')
