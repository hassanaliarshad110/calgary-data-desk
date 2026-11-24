"""Episode 11: convert the Actions TTS output into aud/<id>.wav (44.1 kHz mono) with the fixed per-voice filters.
Recurring catchphrases (qs pf jj n2 qp kt kn q6 q4) + Sakina's c1 (recorded for the Ep 10 flash) are copied from ../ep10/aud."""
import subprocess, sys, os, shutil
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ttsout'
TIGHT = 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.22,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
KID = 'asetrate=24000*1.28,aresample=24000,atempo=0.78125,highpass=f=120'
SAK = 'asetrate=24000*1.08,aresample=24000,atempo=0.926'
PARI = 'asetrate=24000*1.2,aresample=24000,atempo=0.8333,highpass=f=120'
F = {'q1': KID, 'q3': KID, 'q5': KID, 'x1': KID, 'k2': SAK + ',vibrato=f=5:d=0.12', 'p1': PARI, 'p2': PARI}
os.makedirs('aud', exist_ok=True)
for f in sorted(os.listdir(SRC)):
    i, ext = os.path.splitext(f)
    if ext not in ('.wav', '.mp3'): continue
    af = (F[i] + ',' + TRIM) if i in F else TIGHT
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(SRC, f), '-af', af, '-ar', '44100', '-ac', '1', f'aud/{i}.wav'], check=True)
for i in ['qs', 'pf', 'jj', 'n2', 'qp', 'kt', 'kn', 'q6', 'q4', 'c1']:
    shutil.copy(f'../ep10/aud/{i}.wav', f'aud/{i}.wav')
