import json, os, sys, subprocess, asyncio, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts', 'imageio-ffmpeg', 'faster-whisper'], check=True)
import edge_tts, imageio_ffmpeg
ff = imageio_ffmpeg.get_ffmpeg_exe()
J = json.load(open(os.path.join(os.path.dirname(__file__), 'sv_lines.json')))
info = {'durs': [], 'err': {}, 'asr': [], 'fonts': {}}
async def main():
    for i, t in enumerate(J['lines']):
        p = os.path.join(out, f'sv_{i}.mp3')
        for attempt in range(3):
            try:
                await edge_tts.Communicate(t, J['voice'], rate=J['rate'], pitch=J['pitch']).save(p); break
            except Exception as e:
                info['err'][i] = repr(e)
asyncio.run(main())
for i in range(len(J['lines'])):
    m, w = os.path.join(out, f'sv_{i}.mp3'), os.path.join(out, f'sv_{i}.wav')
    subprocess.run([ff, '-v', 'error', '-y', '-i', m, '-ac', '1', '-ar', '44100', w], check=False)
    try:
        sz = os.path.getsize(w) - 44
        info['durs'].append(round(sz / 2 / 44100, 3))
    except Exception as e:
        info['durs'].append(None)
fonts = {
 'NotoNastaliqUrdu.ttf': 'https://github.com/google/fonts/raw/main/ofl/notonastaliqurdu/NotoNastaliqUrdu%5Bwght%5D.ttf',
 'Amiri-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf',
 'Amiri-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Bold.ttf',
 'Cinzel.ttf': 'https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf',
}
os.makedirs(os.path.join(out, 'fonts'), exist_ok=True)
for n, u in fonts.items():
    try:
        urllib.request.urlretrieve(u, os.path.join(out, 'fonts', n)); info['fonts'][n] = os.path.getsize(os.path.join(out, 'fonts', n))
    except Exception as e:
        info['fonts'][n] = repr(e)
try:
    import numpy as np
    from faster_whisper import WhisperModel
    mdl = WhisperModel('small', device='cpu', compute_type='int8')
    for i in range(len(J['lines'])):
        raw = subprocess.run([ff, '-v', 'error', '-i', os.path.join(out, f'sv_{i}.mp3'), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
        segs, _ = mdl.transcribe(np.frombuffer(raw, np.float32), language='ur', beam_size=5)
        info['asr'].append(' '.join(s.text.strip() for s in segs))
except Exception as e:
    info['asr_err'] = repr(e)
json.dump(info, open(os.path.join(out, 'sv_info.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(info, ensure_ascii=False, indent=1))
