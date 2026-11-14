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

# --- one-off: latest CYYC observations, Nov 14, 2026 ---
try:
    import re, urllib.request as U
    def g(u):
        try: return U.urlopen(U.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf-8', 'replace')
        except Exception as e: return 'ERR ' + str(e)
    obs = {}
    for d in ('20261114', '20261115'):
        base = f'https://dd.weather.gc.ca/today/observations/swob-ml/{d}/CYYC/'
        for f in sorted(set(re.findall(r'href="([^"]+\.xml)"', g(base)))):
            if f >= '2026-11-14-2100':
                obs[f] = {k: v for k, v in re.findall(r'<element name="([^"]*air_temp[^"]*)"[^>]*value="([^"]*)"', g(base + f))}
    json.dump(obs, open(os.path.join(out, 'cyyc_latest.json'), 'w'), indent=1)
except Exception as e:
    open(os.path.join(out, 'latest_err.txt'), 'w').write(str(e))
