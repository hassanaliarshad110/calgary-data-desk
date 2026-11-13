import json, os, sys, subprocess, asyncio, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts', 'imageio-ffmpeg', 'faster-whisper'], check=True)
import edge_tts, imageio_ffmpeg
ff = imageio_ffmpeg.get_ffmpeg_exe()
ALL = json.load(open(os.path.join(os.path.dirname(__file__), 'sv_lines.json')))
INFO = {}
for LANG, J in ALL.items():
  pre = LANG + '_'
  info = INFO.setdefault(LANG, {'durs': [], 'err': {}, 'asr': [], 'fonts': {}})
  async def main():
    for i, t in enumerate(J['lines']):
        p = os.path.join(out, f'{pre}{i}.mp3')
        for attempt in range(3):
            try:
                await edge_tts.Communicate(t, J['voice'], rate=J['rate'], pitch=J['pitch']).save(p); break
            except Exception as e:
                info['err'][i] = repr(e)
  asyncio.run(main())
  for i in range(len(J['lines'])):
    m, w = os.path.join(out, f'{pre}{i}.mp3'), os.path.join(out, f'{pre}{i}.wav')
    subprocess.run([ff, '-v', 'error', '-y', '-i', m, '-ac', '1', '-ar', '44100', w], check=False)
    try:
        sz = os.path.getsize(w) - 44
        info['durs'].append(round(sz / 2 / 44100, 3))
    except Exception as e:
        info['durs'].append(None)
try:
    import numpy as np
    from faster_whisper import WhisperModel
    mdl = WhisperModel('medium', device='cpu', compute_type='int8')
    for LANG, J in ALL.items():
        for i in range(len(J['lines'])):
            raw = subprocess.run([ff, '-v', 'error', '-i', os.path.join(out, f'{LANG}_{i}.mp3'), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
            segs, _ = mdl.transcribe(np.frombuffer(raw, np.float32), language=LANG, beam_size=5)
            INFO[LANG]['asr'].append(' '.join(x.text.strip() for x in segs))
except Exception as e:
    INFO['asr_err'] = repr(e)
json.dump(INFO, open(os.path.join(out, 'sv_info.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(INFO, ensure_ascii=False, indent=1))
