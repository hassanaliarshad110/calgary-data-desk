import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
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

# --- temporary moment-watch fetch block 2 (2026-11-15) ---
import re
def _get(u, t=90):
    try:
        return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=t).read().decode('utf-8', 'replace')
    except Exception as e:
        return 'ERR ' + repr(e)
mw = os.path.join(out, 'moment'); os.makedirs(mw, exist_ok=True)
q = 'https://data.calgary.ca/resource/35ra-9556.json?$select=date_trunc_ymd(start_dt_utc)%20as%20d,count(*)%20as%20n&$where=start_dt_utc%3E%3D%272024-11-01T00:00:00%27&$group=d&$order=d&$limit=5000'
open(os.path.join(mw, 'traffic_daily_utc.json'), 'w').write(_get(q))
open(os.path.join(mw, 'traffic_recent.json'), 'w').write(_get('https://data.calgary.ca/resource/35ra-9556.json?$where=start_dt_utc%3E%3D%272025-11-01T00:00:00%27&$select=start_dt_utc&$limit=50000'))
base = 'https://dd.weather.gc.ca/today/observations/swob-ml/20261115/CYYC/'
idx = _get(base); files = sorted(set(re.findall(r'href="([^"]+\.xml)"', idx)))[-4:]
obs = {}
for f in files:
    x = _get(base + f); obs[f] = {m.group(1): m.group(2) for m in re.finditer(r'<element name="([^"]+)"[^>]*?value="([^"]*)"', x)}
json.dump(obs, open(os.path.join(mw, 'swob_latest.json'), 'w'), indent=0)
