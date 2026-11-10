import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile', 'faster-whisper'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
from faster_whisper import WhisperModel
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
m = WhisperModel('small.en', compute_type='int8')
variants = json.load(open(os.path.join(os.path.dirname(__file__), 'tts_variants.json')))
res = []
for i, t in enumerate(variants):
    a, sr = k.create(t, voice='af_heart', speed=1.0, lang='en-us')
    p = os.path.join(out, f't_{i}.wav'); sf.write(p, a, sr)
    import numpy as np
    n = int(len(a) * 16000 / sr); a16 = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype('float32')
    segs, _ = m.transcribe(a16, language='en')
    res.append({'text': t, 'heard': ' '.join(s.text.strip() for s in segs), 'secs': round(len(a)/sr, 2)})
json.dump(res, open(os.path.join(out, 'test.json'), 'w'), indent=1)
print(json.dumps(res, indent=1))
