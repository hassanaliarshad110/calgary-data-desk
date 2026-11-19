"""Episode 9: convert the Actions TTS output into aud/<id>.wav (44.1 kHz mono) with the fixed per-voice filters; reuse the recurring catchphrase clips."""
import subprocess, sys, os, shutil
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ttsout'
TIGHT = 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.22,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
KID = 'asetrate=24000*1.28,aresample=24000,atempo=0.78125,highpass=f=120'
SAK = 'asetrate=24000*1.08,aresample=24000,atempo=0.926'
F = {'q1': KID, 'q3': KID, 'q4': KID, 'q5': KID, 'qe': KID, 'b1': KID, 'b2': KID, 'bv': KID, 'k2': SAK + ',vibrato=f=5:d=0.12', 'v1': 'anull', 'v2': 'anull'}
REN = {'d2b': 'd2'}
os.makedirs('aud', exist_ok=True)
for f in sorted(os.listdir(SRC)):
    i, ext = os.path.splitext(f)
    if ext not in ('.wav', '.mp3') or (len(sys.argv) > 2 and i not in sys.argv[2:]): continue
    af = (F[i] + ',' + TRIM) if i in F else TIGHT
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(SRC, f), '-af', af, '-ar', '44100', '-ac', '1', f'aud/{REN.get(i, i)}.wav'], check=True)
    print(i)
for i in ['qs', 'pf', 'jj', 'n2', 'qp', 'kt', 'kn', 'q6']:   # recurring catchphrases reused from Ep 8 (same voices + text)
    shutil.copy(f'../ep8/aud/{i}.wav', f'aud/{i}.wav')
