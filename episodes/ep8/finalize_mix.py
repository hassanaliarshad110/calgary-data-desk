"""Ep 6 v2 final mix (Hassan, Nov 15: the old mix 'wheezed'). No noise beds, no SFX on lines (ep6_audio.py), and here:
voice: gentle 2.5:1 compression above -18 dBFS (smooth), bed (music+SFX, only in gaps) peak-capped, one static gain to -14 LUFS,
then a look-ahead peak control that only touches the rare overs (reported) so true peak <= -1 dBTP. No clipping, no hard limiter."""
import wave, numpy as np, subprocess, json, re
from scipy.signal import lfilter, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d
SR = 44100
def rd(f): w = wave.open(f); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
def wr(f, x): w = wave.open(f, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
def env(x, ms): k = 1 - np.exp(-1 / (SR * ms / 1000)); return lfilter([k], [1, -(1 - k)], x)
def lookahead(g, ms):   # gain curve that is always <= g, smooth (no clicks)
    w = int(SR * ms / 1000); return uniform_filter1d(minimum_filter1d(g, 2 * w + 1), w + 1)
def meas(x):
    wr('_t.wav', x); o = subprocess.run(['ffmpeg', '-hide_banner', '-i', '_t.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', o)[-1])
v = rd('stem_voice.wav'); b = rd('stem_bed.wav')
lvl = np.sqrt(np.maximum(env(v ** 2, 10), 0)) * 1.414 + 1e-9; th = 10 ** (-18 / 20)
gv = np.maximum(lvl / th, 1) ** (1 / 2.5 - 1); gv = lookahead(gv, 15); v2 = v * gv
bl = np.abs(b); cap = .4 * np.abs(v2).max(); gb = lookahead(np.minimum(1, cap / (bl + 1e-9)), 20); b2 = b * gb
mix = v2 + b2
I, P = meas(mix); mix *= 10 ** ((-14 - I) / 20)
up = resample_poly(mix, 4, 1); pk = np.abs(up).reshape(-1, 4).max(1)[:len(mix)]
lim = 10 ** (-1.3 / 20); gp = lookahead(np.minimum(1, lim / (pk + 1e-9)), 5); mix *= gp
I, P = meas(mix); red = -20 * np.log10(gp)
print('peak control: max %.1f dB, active (>0.5 dB) %.2f%% of the time' % (red.max(), 100 * (red > .5).mean()))
print('voice compression: max %.1f dB' % (-20 * np.log10(gv.min())))
wr('mix_norm.wav', mix); json.dump({'I': I, 'TP': P}, open('loudness.json', 'w')); print('I', I, 'TP', P)
# re-check every line on the FINAL processed stems (same rule as ep6_audio.py)
from scipy.signal import butter, sosfilt
TL = json.load(open('timeline.json')); band = butter(4, [300, 3400], btype='band', fs=SR, output='sos')
k = np.abs(mix).max() / max(np.abs(v2 + b2).max(), 1e-9)
vb = sosfilt(band, v2 * gp); bb = sosfilt(band, b2 * gp); db = lambda x: 10 * np.log10(np.mean(x ** 2) + 1e-12); res = {}
hf = butter(4, [4000, 10000], btype='band', fs=SR, output='sos'); bh = sosfilt(hf, b2 * gp)
for lid, l in TL['lines'].items():
    i0, i1 = int(l['abs'] * SR), int((l['abs'] + l['d']) * SR)
    res[lid] = {'voice_minus_bed_dB': round(float(db(vb[i0:i1]) - db(bb[i0:i1])), 1), 'bed_hiss_4_10k_dBFS': round(float(db(bh[i0:i1])), 1)}
json.dump({'rule': 'voice - (music+SFX) in 300-3400 Hz >= 10 dB; no SFX under any line; no noise beds', 'lines': res, 'loudness': {'I': I, 'TP': P}}, open('dialogue_check.json', 'w'), indent=1)
print('min voice-bed', min(r['voice_minus_bed_dB'] for r in res.values()), 'max hiss under lines', max(r['bed_hiss_4_10k_dBFS'] for r in res.values()))
