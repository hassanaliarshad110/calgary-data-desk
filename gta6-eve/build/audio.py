# voice + "Under One Sky" bed (from the chorus, looped), ducked under the voice, mixed to -14 LUFS
# usage: python3 audio.py spec.json out.wav
import json, sys, subprocess, re, numpy as np
SR = 48000
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def save(path, a):
    p = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s24le', path], input=a.astype(np.float32).tobytes(), check=True)
def lufs(a, extra=''):
    p = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=a.astype(np.float32).tobytes(), capture_output=True)
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr.decode()); return float(m[-1]) if m else -70.0
CHORUS = 61.8
def music_bed(total):
    song = load('/home/claude/gta6/under-one-sky.mp3'); s0 = int(CHORUS * SR)
    seg = song[s0:]; xf = int(3.0 * SR); out = seg.copy()
    while len(out) < total * SR + SR:
        nxt = seg; ramp = np.linspace(0, 1, xf)[:, None]
        tail = out[-xf:] * (1 - ramp) + nxt[:xf] * ramp
        out = np.concatenate([out[:-xf], tail, nxt[xf:]])
    return out[:int(total * SR)]
def smooth(env, sec):
    n = max(1, int(sec * SR / 64)); e = env[::64]
    k = np.ones(n) / n; e2 = np.convolve(np.pad(e, (n, n), mode='edge'), k, mode='same')[n:-n]
    return np.interp(np.arange(len(env)), np.arange(len(e2)) * 64, e2)
if __name__ == '__main__':
    spec = json.load(open(sys.argv[1])); out = sys.argv[2]; T = spec['dur']; N = int(T * SR)
    voice = np.zeros((N, 2), np.float32); act = np.zeros(N, np.float32)
    for k, i, t0 in spec['voice']:
        v = load(f'/home/claude/gta6/tts_out/{k}_{i}.wav'); a = int(t0 * SR); b = min(N, a + len(v))
        voice[a:b] += v[:b - a]; act[max(0, a - int(0.15 * SR)):min(N, b + int(0.25 * SR))] = 1
    m = music_bed(T)
    lv = lufs(voice[act > 0]); lm = lufs(m)
    under = float(spec.get('under_db', 16)); lift = float(spec.get('lift_db', 7))
    g_under = 10 ** ((lv - under - lm) / 20); g_gap = g_under * 10 ** (lift / 20)
    env = np.where(act > 0, g_under, g_gap).astype(np.float32); env = smooth(env, 0.35)
    # hook: music starts strong for the very first beat, then ducks
    fin = np.clip(np.arange(N) / (0.15 * SR), 0, 1); fout = np.clip((N - np.arange(N)) / (2.0 * SR), 0, 1)
    env = env * fin * fout
    mix = voice + m * env[:, None]
    lmix = lufs(mix); g = 10 ** ((-14.0 - lmix) / 20); mix *= g
    # true-peak safe: a fast limiter at -1.5 dBFS, then a final trim back to -14 LUFS
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-af', 'alimiter=limit=0.80:attack=3:release=60:level=disabled', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], input=mix.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    mix = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N].copy()
    g2 = 10 ** ((-14.0 - lufs(mix)) / 20); mix *= min(g2, 1.06); g *= min(g2, 1.06)
    save(out, mix)
    # report: voice vs music under voice, music between lines
    vs, ms = voice * g, m * env[:, None] * g
    rep = {'mix_lufs': round(lufs(mix), 1), 'voice_lufs_speech': round(lufs(vs[act > 0]), 1), 'music_under_voice_lufs': round(lufs(ms[act > 0]), 1),
           'music_between_lines_lufs': round(lufs(ms[(act == 0) & (env > 0.5 * g_gap)]) if ((act == 0) & (env > 0.5 * g_gap)).sum() > SR else -70, 1), 'peak_dbfs': round(float(20 * np.log10(np.abs(mix).max())), 2)}
    rep['voice_minus_music_db'] = round(rep['voice_lufs_speech'] - rep['music_under_voice_lufs'], 1)
    print(json.dumps(rep)); json.dump(rep, open(out + '.json', 'w'))
