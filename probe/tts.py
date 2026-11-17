import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)

# --- temporary moment-watch fetch block (2026-11-16 evening, part 2) ---
import re, concurrent.futures as cf
def _get(u, t=60):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=t)
        return r.read().decode('utf-8', 'replace')
    except Exception as e:
        return 'ERR ' + repr(e)
mw = os.path.join(out, 'moment'); os.makedirs(mw, exist_ok=True)
for name, u in [('api_swob_cyyc_nov16.json', 'https://api.weather.gc.ca/collections/swob-realtime/items?f=json&limit=500&msc_id-value=3031093&datetime=2026-11-16T00:00:00Z/2026-11-17T03:00:00Z'),
                ('api_swob_cyyc_nov16_b.json', 'https://api.weather.gc.ca/collections/swob-realtime/items?f=json&limit=500&bbox=-114.05,51.09,-113.98,51.14&datetime=2026-11-16T00:00:00Z/2026-11-17T03:00:00Z'),
                ('api_climate_hourly_nov16.json', 'https://api.weather.gc.ca/collections/climate-hourly/items?f=json&limit=100&CLIMATE_IDENTIFIER=3031092&LOCAL_DATE=2026-11-16'),
                ('dd_dated_index.txt', 'https://dd.weather.gc.ca/20261116/WXO-DD/observations/swob-ml/20261116/CYYC/')]:
    open(os.path.join(mw, name), 'w').write(_get(u, 120))
idx = open(os.path.join(mw, 'dd_dated_index.txt')).read()
files = sorted(set(re.findall(r'href="([^"]+\.xml)"', idx)))
base = 'https://dd.weather.gc.ca/20261116/WXO-DD/observations/swob-ml/20261116/CYYC/'
obs = {}
def one(f):
    x = _get(base + f); d = {}
    for m in re.finditer(r'<element name="([^"]+)"[^>]*?value="([^"]*)"', x): d[m.group(1)] = m.group(2)
    return f, d
with cf.ThreadPoolExecutor(16) as ex:
    for f, d in ex.map(one, files): obs[f] = d
json.dump(obs, open(os.path.join(mw, 'swob_20261116_dated.json'), 'w'), indent=0)
print('moment fetch 2 done'); sys.exit(0)
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
