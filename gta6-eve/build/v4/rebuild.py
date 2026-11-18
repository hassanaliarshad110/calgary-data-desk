# New v3 soundtrack = original v3 hook audio (first 1.8 s) + corrected body mix, same gain as v3; video stream copied untouched.
import json, subprocess, re, sys, numpy as np
SR = 48000; G = '/home/claude/calgary-data-desk/gta6-eve'
def load(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2).copy()
def lufs(a):
    p = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=a.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr.decode())[-1])
for name, tl in [('teaser', 'teaser'), ('part1', 'part1'), ('part3', 'part3'), ('full', 'full_land')]:
    subprocess.run(['python3', '/home/claude/gta6/audio.py', f'timeline_{tl}.json', f'body_{name}.wav'], check=True, capture_output=True)
    meta = json.load(open(f'{G}/build/v3/gta6-eve-{name}-v3.mp4.json')); src = f'{G}/gta6-eve-{name}-v3.mp4'
    old = load(src); body = load(f'body_{name}.wav'); g = 10 ** (meta['gain_db'] / 20)
    nh = int(round(meta['hook_s'] * SR)); xf = int(0.4 * SR)
    new = np.zeros((nh + len(body), 2), np.float32); new[:nh] = old[:nh]
    r = np.linspace(0, 1, xf)[:, None]
    new[nh:nh + xf] = old[nh:nh + xf] * (1 - r) + body[:xf] * g * r
    new[nh + xf:] = body[xf:] * g
    L = lufs(new); new *= min(10 ** ((-14.0 - L) / 20), 1.0) if np.abs(new).max() * 10 ** ((-14.0 - L) / 20) > 0.89 else 10 ** ((-14.0 - L) / 20)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s24le', f'mix_{name}.wav'], input=new.tobytes(), check=True)
    out = f'/home/claude/gta6/fix/gta6-eve-{name}-v4.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', f'mix_{name}.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    print(name, json.dumps(dict(old_len=round(len(old) / SR, 3), new_len=round(len(new) / SR, 3), lufs=round(lufs(new), 1), peak=round(float(20 * np.log10(np.abs(new).max())), 2))))
