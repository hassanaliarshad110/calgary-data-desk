import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)

# --- MOMENT fetch block (temporary) ---
import re as _re, ssl as _ssl
def _get(u, fn, t=60):
    try:
        req=urllib.request.Request(u, headers={'User-Agent':'Mozilla/5.0 CalgaryInsight'})
        d=urllib.request.urlopen(req, timeout=t).read()
        open(os.path.join(out, fn),'wb').write(d); return d
    except Exception as e:
        open(os.path.join(out, fn+'.err'),'w').write(repr(e)); return b''
_mf=os.path.join(out,'moment'); os.makedirs(_mf, exist_ok=True)
for day in ('20261114','20261115','20261116'):
    base_u='https://dd.weather.gc.ca/today/observations/swob-ml/%s/CYYC/'%day
    idx=_get(base_u, 'moment/swob_idx_%s.html'%day).decode('utf8','ignore')
    files=sorted(set(_re.findall(r'href="([^"]+\.xml)"', idx)))
    files=[f for f in files if 'minute' not in f]
    os.makedirs(os.path.join(_mf,day), exist_ok=True)
    for f in files: _get(base_u+f, 'moment/%s/%s'%(day,f.split('/')[-1]), 30)
_get('https://api.weather.gc.ca/collections/weather-alerts/items?f=json&lang=en&limit=500', 'moment/alerts_all.json')
_get('https://data.calgary.ca/resource/35ra-9556.json?$order=start_dt%20DESC&$limit=60', 'moment/traffic_latest.json')
_get('https://data.calgary.ca/resource/35ra-9556.json?$select=date_trunc_ymd(start_dt)%20as%20d,count(*)%20as%20n&$where=start_dt%3E%272025-11-01%27&$group=d&$order=d&$limit=5000', 'moment/traffic_daily.json')
_get('https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=50430&Year=2026&Month=11&Day=15&timeframe=1&submit=Download+Data', 'moment/eccc_hourly_2026_11.csv')
_get('https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=50430&Year=2026&Month=11&Day=15&timeframe=2&submit=Download+Data', 'moment/eccc_daily_2026.csv')
sys.exit(0)
# --- end fetch block ---

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
