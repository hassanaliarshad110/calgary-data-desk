import json, os, sys, subprocess, asyncio
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts', 'faster-whisper'], check=True)
import edge_tts
J = json.load(open(os.path.join(os.path.dirname(__file__), 'fix_lines.json')))
async def gen():
    for l in J:
        c = edge_tts.Communicate(l['text'], l['voice'], rate=l.get('rate', '+0%'), pitch=l.get('pitch', '+0Hz'))
        await c.save(os.path.join(out, l['id'] + '.mp3'))
asyncio.run(gen())
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
res = {}
for l in J:
    p = os.path.join(out, l['id'] + '.mp3'); r = {}
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    aud = np.frombuffer(raw, np.float32)
    for lang in ('en', 'ur', 'hi'):
        try:
            segs, _ = m.transcribe(aud, language=lang, beam_size=5)
            r[lang] = ' '.join(s.text.strip() for s in segs)
        except Exception as e:
            r[lang] = 'ERR ' + repr(e)
    res[l['id']] = r
json.dump(res, open(os.path.join(out, 'asr.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
