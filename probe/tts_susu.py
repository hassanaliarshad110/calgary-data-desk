import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
for u,n in [('ofl/luckiestguy/LuckiestGuy-Regular.ttf','LuckiestGuy.ttf'),('ofl/bangers/Bangers-Regular.ttf','Bangers.ttf'),('ofl/baloo2/Baloo2%5Bwght%5D.ttf','Baloo2.ttf'),('ofl/permanentmarker/PermanentMarker-Regular.ttf','PermanentMarker.ttf')]:
    try: urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/'+u, os.path.join(out,n))
    except Exception as e: print('font fail',u,e)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
L = json.load(open(os.path.join(os.path.dirname(__file__), 'tts_susu_lines.json')))
durs = {}; errs = {}
for l in L:
    for v in l['voices']:
        key = l['id'] + '__' + v
        try:
            a, sr = k.create(l['text'], voice=v, speed=l.get('speed', 1.0), lang=l.get('lang', 'hi'))
            sf.write(os.path.join(out, key + '.wav'), a, sr)
            durs[key] = round(len(a) / sr, 3)
        except Exception as e:
            errs[key] = repr(e)
json.dump({'durs': durs, 'errs': errs}, open(os.path.join(out, 'durs.json'), 'w'), ensure_ascii=False, indent=1)
print(durs, errs)
