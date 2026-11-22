"""Episode 10: convert the Actions TTS output into aud/<id>.wav (44.1 kHz mono) with the fixed per-voice filters; reuse the recurring catchphrase clips."""
import subprocess, sys, os, shutil
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ttsout'
ONLY = sys.argv[2:]
TIGHT = 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.22,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
KID = 'asetrate=24000*1.28,aresample=24000,atempo=0.78125,highpass=f=120'
SAK = 'asetrate=24000*1.08,aresample=24000,atempo=0.926'
NOOR = 'asetrate=24000*1.25,aresample=24000,atempo=0.8,highpass=f=120'
F = {'q1': KID, 'q3': KID, 'q7': KID, 'q8': KID, 'k2': SAK + ',vibrato=f=5:d=0.12', 'c1': SAK, 'o1': NOOR, 'o2': NOOR, 'o3': NOOR}
REN = {'m1b': 'm1', 'm2b': 'm2'}
SKIP = {'m1', 'm2', 'n3c'}          # superseded takes (khadda versions + n3 chosen)
os.makedirs('aud', exist_ok=True)
for f in sorted(os.listdir(SRC)):
    i, ext = os.path.splitext(f)
    if ext not in ('.wav', '.mp3') or i in SKIP or (ONLY and i not in ONLY): continue
    af = (F[i] + ',' + TRIM) if i in F else TIGHT
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(SRC, f), '-af', af, '-ar', '44100', '-ac', '1', f'aud/{REN.get(i, i)}.wav'], check=True)
    print(i, '->', REN.get(i, i))
for i in ['qs', 'pf', 'jj', 'n2', 'qp', 'kt', 'kn', 'q6', 'q4', 'bv']:   # recurring catchphrases reused from Ep 9 (same voices + text)
    shutil.copy(f'../ep9/aud/{i}.wav', f'aud/{i}.wav')
