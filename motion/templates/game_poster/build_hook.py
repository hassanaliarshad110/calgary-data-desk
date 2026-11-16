# Prepend the 1.8 s game-poster hook to a finished Calgary Insight video:
#  - hook video re-encoded alone with the original's x264 settings (same size/fps/codec/timescale), then concat -c copy
#  - soundtrack rebuilt once: "Under One Sky" (the bars just before the video's own chorus start) under the poster,
#    synthesised slams/whoosh (motion/engine/sfx.py), then the original mix untouched; whole file trimmed to -14 LUFS.
# usage: python3 build_hook.py FRAMES_DIR ORIGINAL.mp4 OUT.mp4 CRF
import sys, subprocess, json, re, os, numpy as np
sys.path.insert(0, '/home/claude/studio/motion/engine'); import sfx
SR = 48000; FPS = 30
SONG = '/home/claude/calgary-data-desk/web/visit/chorus.mp3'   # "Calgary - Under One Sky (chorus)", the game's title song
SONG_AT = 6.499   # the original videos' music starts at this point of the file (cross-correlated)
fr, orig, out, crf = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
tmp = os.path.abspath(out + '.work'); os.makedirs(tmp, exist_ok=True)
def run(*a): subprocess.run(a, check=True)
def load(p, ss=0, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', p] + (['-t', str(t)] if t else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
def lufs(a):
    p = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=a.astype(np.float32).tobytes(), capture_output=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr.decode())[-1])
anim = json.load(open(f'{fr}/anim.json')); N = len([f for f in os.listdir(fr) if f.endswith('.jpg')]); HD = N / FPS
# 1) hook video, same encoder settings as the originals (x264 medium, High, yuv420p, 30 fps, timescale 15360)
v = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', orig], capture_output=True, text=True).stdout.strip()
run('ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i', f'{fr}/f%04d.jpg', '-vf', f'scale={v.replace(",", ":")}:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p,setsar=0',
    '-color_primaries', 'unknown', '-color_trc', 'unknown', '-colorspace', 'unknown', '-color_range', 'unknown', '-chroma_sample_location', 'unspecified',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-video_track_timescale', '15360', '-an', f'{tmp}/hook.mp4')
run('ffmpeg', '-v', 'error', '-y', '-i', orig, '-map', '0:v', '-c', 'copy', f'{tmp}/body.mp4')
open(f'{tmp}/list.txt', 'w').write(f"file '{tmp}/hook.mp4'\nfile '{tmp}/body.mp4'\n")
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', f'{tmp}/video.mp4')
# 2) soundtrack
body = load(orig); nh = int(round(HD * SR)); tail = int(0.40 * SR)
song = load(SONG); s0 = int((SONG_AT - HD) * SR); mus = song[s0:s0 + nh + tail].copy()
lm = lufs(mus[:nh]); mus *= 10 ** ((-17.0 - lm) / 20)                      # music under the poster at about -17 LUFS
# keep the song going under the whip and the video's own (quiet) first 0.35 s, out by the time the voice comes in
idx = np.arange(len(mus)); fade = np.interp(idx, [nh - int(0.15 * SR), nh, nh + int(0.38 * SR)], [1.0, 0.45, 0.0]); mus *= fade[:, None]
hook = np.zeros((nh + tail, 2), np.float32); hook += mus
def add(name, t, g_db, dur=None):
    x = sfx.fx(name, dur) if dur else sfx.fx(name); x = x if x.ndim == 1 else x.mean(1)
    a = int(max(0, t) * SR); b = min(len(hook), a + len(x)); hook[a:b] += (x[:b - a] * 10 ** (g_db / 20))[:, None]
for h in anim['hits']:
    if h >= 0: add('stamp' if 'stamp' in dir(sfx) else 'impact', h, -20)
add('impact', anim['wm'], -9); add('pop', anim['tag'], -18); add('whoosh', anim['whip'] - 0.05, -10, 0.45)
vd = float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=duration', '-of', 'csv=p=0', orig], capture_output=True, text=True).stdout)
mix = np.zeros((nh + max(len(body), int(round(vd * SR))), 2), np.float32)
mix[nh:nh + len(body)] += body; mix[:nh + tail] += hook   # mix never shorter than the picture
lm = lufs(mix); g = 10 ** ((-14.0 - lm) / 20)
mix *= g
if np.abs(mix).max() > 0.89:   # true-peak safety: fast limiter (as audio.py), then trim back to -14 LUFS
    r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'alimiter=limit=0.84:attack=3:release=60:level=disabled', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], input=mix.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    mix = np.frombuffer(r, np.float32).reshape(-1, 2)[:len(mix)].copy(); g2 = min(10 ** ((-14.0 - lufs(mix)) / 20), 1.04); mix *= g2; g *= g2
raw = mix.astype(np.float32).tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s24le', f'{tmp}/mix.wav'], input=raw, check=True)
run('ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/video.mp4', '-i', f'{tmp}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out)
rep = dict(hook_s=round(HD, 3), gain_db=round(float(20 * np.log10(g)), 2), mix_lufs=round(lufs(mix), 1), peak_dbfs=round(float(20 * np.log10(np.abs(mix).max())), 2))
print(json.dumps(rep)); json.dump(rep, open(out + '.json', 'w'))
