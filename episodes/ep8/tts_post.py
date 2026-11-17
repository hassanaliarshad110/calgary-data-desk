"""Episode 8: convert the Actions TTS output (/home/claude/ttsout) into aud/<id>.wav (44.1 kHz mono) with the fixed per-voice filters."""
import subprocess, sys, os, shutil
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ttsout'
TIGHT = 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.22,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
KID = 'asetrate=24000*1.28,aresample=24000,atempo=0.78125,highpass=f=120'
SAK = 'asetrate=24000*1.08,aresample=24000,atempo=0.926'
DADA = 'asetrate=24000*0.92,aresample=24000,atempo=1.087'
F = {'q3': KID, 'q4': KID, 'q5': KID, 'q6': KID, 'bs': KID, 'bs2': KID, 'k1': SAK, 'k2': SAK + ',vibrato=f=5:d=0.12', 'k3': SAK + ',vibrato=f=5:d=0.12',
     'dd': DADA, 'dm': DADA, 'dd2': DADA}
os.makedirs('aud', exist_ok=True)
for f in sorted(os.listdir(SRC)):
    i, ext = os.path.splitext(f)
    if ext not in ('.wav', '.mp3') or (len(sys.argv) > 2 and i not in sys.argv[2:]): continue
    af = (F[i] + ',' + TRIM) if i in F else TIGHT
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(SRC, f), '-af', af, '-ar', '44100', '-ac', '1', f'aud/{i}.wav'], check=True)
    print(i)
for i in ['n1', 'qh', 'qs', 'pf', 'jj', 'n2', 'qp', 'kt', 'kn', 'qs2', 'pf2']:   # recurring catchphrases reused from Ep 7 (same voices + text)
    shutil.copy(f'../ep7/aud/{i}.wav', f'aud/{i}.wav')
