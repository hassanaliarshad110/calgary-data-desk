# Time the lyrics of "Under One Sky" to the song: split off the vocals, then force-align each lyric line and also
# transcribe with word times (to check the alignment). Free: runs on GitHub Actions.
import json, os, re, subprocess, sys
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
here = os.path.dirname(__file__)
pip = lambda *a: subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', *a], check=True)
pip('torch', 'torchaudio', '--index-url', 'https://download.pytorch.org/whl/cpu')
pip('demucs', 'stable-ts', 'soundfile')
song = os.path.join(here, 'uos.mp3')
subprocess.run([sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', 'sep', song], check=True)
voc = 'sep/htdemucs/uos/vocals.wav'
lines, secs, cur = [], [], None
for ln in open(os.path.join(here, 'uos_lyrics.txt'), encoding='utf8'):
    ln = ln.strip()
    if not ln: continue
    if ln.startswith('['): cur = ln.strip('[]'); continue
    lines.append(ln); secs.append(cur)
import stable_whisper
m = stable_whisper.load_model('medium')
res = {}
try:
    a = m.align(voc, '\n'.join(lines), language='en', original_split=True)
    res['align'] = [{'t0': round(s.start, 2), 't1': round(s.end, 2), 'text': s.text.strip()} for s in a.segments]
except Exception as e:
    res['align_error'] = repr(e)
t = m.transcribe(voc, word_timestamps=True, vad=True)
res['transcript'] = [{'t0': round(s.start, 2), 't1': round(s.end, 2), 'text': s.text.strip(), 'lang': getattr(t, 'language', None)} for s in t.segments]
res['lines'] = lines; res['sections'] = secs
json.dump(res, open(os.path.join(out, 'uos_timing.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(res.get('align', [])[:12], ensure_ascii=False))
