import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)

# --- temporary moment-watch traffic block (2026-11-16) ---
_mw=os.path.join(out,'moment'); os.makedirs(_mw, exist_ok=True)
for _n,_u in [('traffic_rows_365d.json','https://data.calgary.ca/resource/35ra-9556.json?$select=start_dt_utc,id&$where=start_dt_utc%3E%3D%272025-11-01T00:00:00%27&$order=start_dt_utc&$limit=60000'),
              ('traffic_latest.json','https://data.calgary.ca/resource/35ra-9556.json?$order=start_dt_utc%20DESC&$limit=120')]:
    try: _d=urllib.request.urlopen(urllib.request.Request(_u, headers={'User-Agent':'Mozilla/5.0'}), timeout=120).read()
    except Exception as _e: _d=('ERR '+repr(_e)).encode()
    open(os.path.join(_mw,_n),'wb').write(_d)
sys.exit(0)
# --- end block ---
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
L = json.load(open(os.path.join(os.path.dirname(__file__), 'tts_lines.json')))
cfg = L.pop('_cfg', {})  # optional {"voice": {key: voice}, "speed": {key: speed}}; default af_heart, 1.0
durs = {}
for name, lines in L.items():
    durs[name] = []
    for i, t in enumerate(lines):
        a, sr = k.create(t, voice=cfg.get('voice', {}).get(name, 'af_heart'), speed=cfg.get('speed', {}).get(name, 1.0), lang='en-us')
        sf.write(os.path.join(out, f'{name}_{i}.wav'), a, sr)
        durs[name].append(round(len(a) / sr, 3))
json.dump(durs, open(os.path.join(out, 'durs.json'), 'w'))
print(durs)
