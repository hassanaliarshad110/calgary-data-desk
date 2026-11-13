import json, os, sys, subprocess, asyncio, difflib, re
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts', 'imageio-ffmpeg', 'faster-whisper'], check=True)
import edge_tts, imageio_ffmpeg, numpy as np
from faster_whisper import WhisperModel
ff = imageio_ffmpeg.get_ffmpeg_exe()
T = json.load(open(os.path.join(os.path.dirname(__file__), 'lex_terms.json')))
DIA = re.compile('[ً-ٰٟ۪-ۭؐ-ؚ]')
def plain(s): return re.sub(r'[^\w ]', '', DIA.sub('', s)).replace('ي', 'ی').replace('ك', 'ک').replace('ه', 'ہ').replace('ۃ', 'ہ').strip()
jobs = []
for lang, block in T.items():
    for key, cfg in block['terms'].items():
        for vi, v in enumerate(cfg['variants']):
            for voice in cfg.get('voices', [block['voice']]):
                jobs.append((lang, key, vi, v, voice, cfg.get('carrier', '{}')))
async def main():
    for n, (lang, key, vi, v, voice, car) in enumerate(jobs):
        p = os.path.join(out, f'j{n}.mp3')
        for _ in range(3):
            try: await edge_tts.Communicate(car.format(v), voice, rate='-6%', pitch='-2Hz').save(p); break
            except Exception as e: pass
asyncio.run(main())
mdl = WhisperModel('medium', device='cpu', compute_type='int8')
res = []
for n, (lang, key, vi, v, voice, car) in enumerate(jobs):
    raw = subprocess.run([ff, '-v', 'error', '-i', os.path.join(out, f'j{n}.mp3'), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    segs, _ = mdl.transcribe(np.frombuffer(raw, np.float32), language=lang, beam_size=5)
    txt = ' '.join(s.text.strip() for s in segs)
    target = plain(T[lang]['terms'][key]['target'])
    sim = difflib.SequenceMatcher(None, plain(txt), plain(car.format(target))).ratio()
    res.append(dict(lang=lang, key=key, vi=vi, variant=v, voice=voice, asr=txt, sim=round(sim, 3), file=f'j{n}.mp3'))
    print(lang, key, vi, voice, round(sim, 2), txt, flush=True)
json.dump(res, open(os.path.join(out, 'lex_results.json'), 'w'), ensure_ascii=False, indent=1)
