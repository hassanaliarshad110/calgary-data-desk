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

# --- one-off evidence pull for the Nov 14, 2026 fun fact (ECCC raw rows + latest CYYC observations) ---
try:
    import csv, io, re, time, urllib.request as U
    def g(u):
        for _ in range(3):
            try: return U.urlopen(U.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf-8-sig', 'replace')
            except Exception as e: err = str(e); time.sleep(2)
        return 'ERR ' + err
    B = 'https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID={s}&Year={y}&Month=11&Day=14&timeframe=2&submit=Download+Data'
    rows = []
    for y in range(1926, 2026):
        for s in ([2205] if y < 2012 else [2205, 50430] if y == 2012 else [50430]):
            txt = g(B.format(s=s, y=y))
            if txt.startswith('ERR'): rows.append({'year': y, 'station_id': s, 'error': txt}); continue
            for r in csv.DictReader(io.StringIO(txt)):
                if r.get('Date/Time', '').endswith('-11-14'):
                    rows.append({'year': y, 'station_id': s, 'station': r.get('Station Name'), 'climate_id': r.get('Climate ID'), 'date': r.get('Date/Time'), 'max_c': r.get('Max Temp (°C)'), 'max_flag': r.get('Max Temp Flag'), 'url': B.format(s=s, y=y)})
    json.dump(rows, open(os.path.join(out, 'eccc_nov14_1926_2025.json'), 'w'), indent=1, ensure_ascii=False)
    obs = {}
    base = 'https://dd.weather.gc.ca/today/observations/swob-ml/20261114/CYYC/'
    for f in sorted(set(re.findall(r'href="([^"]+\.xml)"', g(base)))):
        x = g(base + f); obs[f] = {k: v for k, v in re.findall(r'<element name="([^"]*air_temp[^"]*)"[^>]*value="([^"]*)"', x)}
    base2 = 'https://dd.weather.gc.ca/today/observations/swob-ml/20261115/CYYC/'
    for f in sorted(set(re.findall(r'href="([^"]+\.xml)"', g(base2)))):
        x = g(base2 + f); obs[f] = {k: v for k, v in re.findall(r'<element name="([^"]*air_temp[^"]*)"[^>]*value="([^"]*)"', x)}
    json.dump(obs, open(os.path.join(out, 'cyyc_swob_2026-11-14.json'), 'w'), indent=1)
except Exception as e:
    open(os.path.join(out, 'evidence_err.txt'), 'w').write(str(e))
