"""Episode 12: convert the Actions TTS output into aud/<id>.wav (44.1 kHz mono) with the fixed per-voice filters.
Recurring catchphrases (qs pf jj n2 qp kt kn q6 q4) + Basim's x1 (recorded for the Ep 11 flash) are copied from ../ep11/aud.
Officer Gill: hi-IN-MadhurNeural returned no audio for most lines on Nov 26 (5 tries each), so all four Gill lines use the
fallback ur-PK-AsadNeural -6% -28Hz in Urdu script (proposed — Hassan to check)."""
import subprocess, sys, os, shutil
SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/ttsout'
TIGHT = 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.22,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
KID = 'asetrate=24000*1.28,aresample=24000,atempo=0.78125,highpass=f=120'
SAK = 'asetrate=24000*1.08,aresample=24000,atempo=0.926'
DADA = 'asetrate=24000*0.92,aresample=24000,atempo=1.087'
F = {'q1': KID, 'q3': KID, 'q5': KID, 'k2': SAK + ',vibrato=f=5:d=0.12', 'da1': DADA, 'da3': DADA}
for b in ['b1', 'b2', 'b3', 'b4', 'b5', 'b6']: F[b] = KID
os.makedirs('aud', exist_ok=True)
for f in sorted(os.listdir(SRC)):
    i, ext = os.path.splitext(f)
    if ext not in ('.wav', '.mp3') or '_alt' in i: continue
    af = (F[i] + ',' + TRIM) if i in F else TIGHT
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(SRC, f), '-af', af, '-ar', '44100', '-ac', '1', f'aud/{i}.wav'], check=True)
for i in ['qs', 'pf', 'jj', 'n2', 'qp', 'kt', 'kn', 'q6', 'q4', 'x1']:
    shutil.copy(f'../ep11/aud/{i}.wav', f'aud/{i}.wav')
