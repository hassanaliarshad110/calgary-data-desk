import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
try: open(os.path.join(out, 'voices_available.json'), 'w').write(json.dumps(sorted(k.get_voices())))
except Exception: pass
L = json.load(open(os.path.join(os.path.dirname(__file__), 'demo_lines.json')))
durs = {}
for name, spec in L.items():
    durs[name] = []
    for i, t in enumerate(spec['lines']):
        a, sr = k.create(t, voice=spec['voice'], speed=spec['speed'], lang='en-us')
        sf.write(os.path.join(out, f'{name}_{i}.wav'), a, sr)
        durs[name].append(round(len(a) / sr, 3))
json.dump(durs, open(os.path.join(out, 'durs.json'), 'w'))
print(durs)
