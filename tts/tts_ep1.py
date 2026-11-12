import json, os, sys, subprocess, urllib.request, asyncio
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile', 'edge-tts'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
J = json.load(open(os.path.join(os.path.dirname(__file__), 'ep1_lines.json')))
info = {'kokoro': {}, 'edge': {}}
try:
    from kokoro_onnx.tokenizer import Tokenizer
    tok = Tokenizer()
except Exception as e:
    tok = None; info['tok_err'] = repr(e)
for l in J['kokoro']:
    try:
        if l.get('phonemes'):
            a, sr = k.create(l['phonemes'], voice='hf_beta', speed=l.get('speed', 1.05), lang='hi', is_phonemes=True); ph = l['phonemes']
        else:
            a, sr = k.create(l['text'], voice='hf_beta', speed=l.get('speed', 1.05), lang='hi')
            ph = tok.phonemize(l['text'], 'hi') if tok else ''
        sf.write(os.path.join(out, l['id'] + '.wav'), a, sr)
        info['kokoro'][l['id']] = {'dur': round(len(a) / sr, 3), 'ph': ph}
    except Exception as e:
        info['kokoro'][l['id']] = repr(e)
import edge_tts
async def main():
    for l in J['edge']:
        try:
            c = edge_tts.Communicate(l['text'], l['voice'], rate=l.get('rate', '+0%'), pitch=l.get('pitch', '+0Hz'))
            await c.save(os.path.join(out, l['id'] + '.mp3')); info['edge'][l['id']] = 'ok'
        except Exception as e:
            info['edge'][l['id']] = repr(e)
asyncio.run(main())
json.dump(info, open(os.path.join(out, 'info.json'), 'w'), ensure_ascii=False, indent=1)
print(info)
