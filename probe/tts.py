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

# --- temporary moment-watch fetch block (2026-11-15) ---
import re, csv, io, concurrent.futures as cf
def _get(u, t=60):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=t)
        return r.read().decode('utf-8', 'replace')
    except Exception as e:
        return 'ERR ' + repr(e)
mw = os.path.join(out, 'moment'); os.makedirs(mw, exist_ok=True)
res = {}
# SWOB: today and previous days (UTC folders)
for day in ['20261116','20261115','20261114','20261113']:
    for base in [f'https://dd.weather.gc.ca/today/observations/swob-ml/{day}/CYYC/', f'https://dd.weather.gc.ca/{day}/WXO-DD/observations/swob-ml/{day}/CYYC/']:
        idx = _get(base)
        if idx.startswith('ERR'): res[base] = idx; continue
        files = sorted(set(re.findall(r'href="([^"]+\.xml)"', idx)))
        res[base] = files
        obs = {}
        def one(f):
            x = _get(base + f)
            d = {}
            for m in re.finditer(r'<element name="([^"]+)"[^>]*?value="([^"]*)"', x):
                d[m.group(1)] = m.group(2)
            return f, d
        with cf.ThreadPoolExecutor(16) as ex:
            for f, d in ex.map(one, files): obs[f] = d
        json.dump(obs, open(os.path.join(mw, f'swob_{day}_{"today" if "today" in base else "wxo"}.json'), 'w'), indent=0)
json.dump(res, open(os.path.join(mw, 'swob_index.json'), 'w'), indent=1)
# ECCC daily bulk: every year 1926-2026 (full year CSV, keep Oct-Nov rows)
def yr(args):
    y, sid = args
    u = f'https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID={sid}&Year={y}&Month=11&Day=15&timeframe=2&submit=Download+Data'
    t = _get(u, 90)
    if t.startswith('ERR'): t = _get(u, 90)
    rows = []
    if not t.startswith('ERR'):
        for r in csv.DictReader(io.StringIO(t.lstrip('﻿'))):
            if r.get('Month') in ('9','10','11','09'): rows.append(r)
    return {'year': y, 'station_id': sid, 'url': u, 'err': t[:200] if t.startswith('ERR') else None, 'rows': rows}
jobs = [(y, 2205) for y in range(1926, 2013)] + [(y, 50430) for y in range(2012, 2027)]
with cf.ThreadPoolExecutor(8) as ex:
    daily = list(ex.map(yr, jobs))
json.dump(daily, open(os.path.join(mw, 'eccc_daily_sep_nov_1926_2026.json'), 'w'))
# ECCC hourly Nov 2026
u = 'https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=50430&Year=2026&Month=11&Day=15&timeframe=1&submit=Download+Data'
open(os.path.join(mw, 'eccc_hourly_2026_11.csv'), 'w').write(_get(u, 90))
# Alerts
for name, u in [('alerts_api', 'https://api.weather.gc.ca/collections/weather-alerts/items?f=json&bbox=-114.4,50.8,-113.8,51.25&limit=50'),
                ('warnings_calgary', 'https://weather.gc.ca/warnings/report_e.html?ab52'),
                ('city_page_calgary', 'https://weather.gc.ca/en/location/index.html?coords=51.046,-114.057'),
                ('aqhi_calgary', 'https://dd.weather.gc.ca/today/air_quality/aqhi/pnr/observation/realtime/xml/AQ_OBS_FCJCD_CURRENT.xml')]:
    open(os.path.join(mw, name + '.txt'), 'w').write(_get(u))
# Calgary traffic incidents (Socrata 35ra-9556)
open(os.path.join(mw, 'traffic_meta.json'), 'w').write(_get('https://data.calgary.ca/api/views/35ra-9556.json'))
open(os.path.join(mw, 'traffic_sample.json'), 'w').write(_get('https://data.calgary.ca/resource/35ra-9556.json?$limit=3&$order=:id%20DESC'))
for fld in ['start_dt', 'modified_dt']:
    q = f'https://data.calgary.ca/resource/35ra-9556.json?$select=date_trunc_ymd({fld})%20as%20d,count(*)%20as%20n&$where={fld}%3E%3D%272024-11-01T00:00:00%27&$group=d&$order=d&$limit=5000'
    open(os.path.join(mw, f'traffic_daily_{fld}.json'), 'w').write(_get(q))
open(os.path.join(mw, 'traffic_today.json'), 'w').write(_get("https://data.calgary.ca/resource/35ra-9556.json?$where=start_dt%3E%3D%272026-11-15T00:00:00%27&$limit=5000&$order=start_dt"))
print('moment fetch done')
