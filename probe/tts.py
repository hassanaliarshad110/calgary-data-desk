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

# --- one-off evidence pull: City of Calgary traffic incidents, Nov 15, 2026 moments check ---
try:
    import time, urllib.request as U, urllib.parse as P
    def g(u):
        err = ''
        for _ in range(3):
            try: return U.urlopen(U.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf-8-sig', 'replace')
            except Exception as e: err = str(e); time.sleep(2)
        return 'ERR ' + err
    T = 'https://data.calgary.ca/resource/35ra-9556.json'
    open(os.path.join(out, 'traffic_daily_utc.json'), 'w').write(g(T + '?' + P.urlencode({'$select': 'date_trunc_ymd(start_dt_utc) as d, count(*) as n', '$where': "start_dt_utc >= '2024-11-01T00:00:00'", '$group': 'd', '$order': 'd', '$limit': '5000'})))
    open(os.path.join(out, 'traffic_recent.json'), 'w').write(g(T + '?' + P.urlencode({'$where': "start_dt_utc >= '2025-11-01T00:00:00'", '$select': 'start_dt_utc,id,incident_info,description', '$order': 'start_dt_utc', '$limit': '50000'})))
except Exception as e:
    open(os.path.join(out, 'evidence_err.txt'), 'w').write(repr(e))
