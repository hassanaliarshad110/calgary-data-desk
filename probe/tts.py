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

# --- one-off evidence pull for the Nov 15, 2026 same-day moments check ---
try:
    import csv, io, re, time, datetime, urllib.request as U
    def g(u):
        err = ''
        for _ in range(3):
            try: return U.urlopen(U.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf-8-sig', 'replace')
            except Exception as e: err = str(e); time.sleep(2)
        return 'ERR ' + err
    # 1) SWOB hourly observations for CYYC, last 11 UTC days
    obs = {}
    for dd in range(0, 11):
        day = (datetime.date(2026, 11, 16) - datetime.timedelta(days=dd)).strftime('%Y%m%d')
        for base in ('https://dd.weather.gc.ca/today/observations/swob-ml/%s/CYYC/' % day,
                     'https://dd.weather.gc.ca/%s/WXO-DD/observations/swob-ml/%s/CYYC/' % (day, day)):
            idx = g(base)
            files = sorted(set(re.findall(r'href="([^"]+\.xml)"', idx)))
            if not files: continue
            for f in files:
                if 'minute' in f: continue
                x = g(base + f)
                obs[base + f] = {k: v for k, v in re.findall(r'<element name="([^"]+)"[^>]*value="([^"]*)"', x)}
            break
    json.dump(obs, open(os.path.join(out, 'cyyc_swob_last10d.json'), 'w'), indent=1)
    # 2) ECCC daily, Nov 15 for 1926-2025, plus 2026 daily (whole year file)
    B = 'https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID={s}&Year={y}&Month=11&Day=15&timeframe=2&submit=Download+Data'
    rows = []; y2026 = []
    for y in range(1926, 2027):
        for s in ([2205] if y < 2012 else [2205, 50430] if y == 2012 else [50430]):
            txt = g(B.format(s=s, y=y))
            if txt.startswith('ERR'): rows.append({'year': y, 'station_id': s, 'error': txt}); continue
            for r in csv.DictReader(io.StringIO(txt)):
                d = r.get('Date/Time', '')
                rec = {'year': y, 'station_id': s, 'station': r.get('Station Name'), 'climate_id': r.get('Climate ID'), 'date': d,
                       'max_c': r.get('Max Temp (°C)'), 'max_flag': r.get('Max Temp Flag'), 'min_c': r.get('Min Temp (°C)'), 'min_flag': r.get('Min Temp Flag'),
                       'snow_cm': r.get('Total Snow (cm)'), 'snow_flag': r.get('Total Snow Flag'), 'precip_mm': r.get('Total Precip (mm)'),
                       'snow_grnd_cm': r.get('Snow on Grnd (cm)'), 'gust_kmh': r.get('Spd of Max Gust (km/h)'), 'gust_flag': r.get('Spd of Max Gust Flag'), 'url': B.format(s=s, y=y)}
                if d.endswith('-11-15') and y < 2026: rows.append(rec)
                if y == 2026 or (y == 2025 and d >= '2025-08-01'): y2026.append(rec)
    json.dump(rows, open(os.path.join(out, 'eccc_nov15_1926_2025.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump(y2026, open(os.path.join(out, 'eccc_daily_2025aug_2026.json'), 'w'), indent=1, ensure_ascii=False)
    # 3) ECCC alerts
    a = g('https://api.weather.gc.ca/collections/weather-alerts/items?f=json&limit=2000&lang=en')
    try:
        J = json.loads(a); feats = [ft for ft in J.get('features', []) if 'calgary' in json.dumps(ft).lower()]
        json.dump({'n_all': len(J.get('features', [])), 'calgary': feats}, open(os.path.join(out, 'eccc_alerts.json'), 'w'), indent=1)
    except Exception as e:
        open(os.path.join(out, 'eccc_alerts.txt'), 'w').write(a[:200000])
    open(os.path.join(out, 'eccc_warnings_ab.html'), 'w').write(g('https://weather.gc.ca/warnings/index_e.html?prov=ab'))
    # 4) City of Calgary traffic incidents (Socrata 35ra-9556)
    T = 'https://data.calgary.ca/resource/35ra-9556.json'
    meta = g('https://data.calgary.ca/api/views/35ra-9556.json')
    open(os.path.join(out, 'traffic_meta.json'), 'w').write(meta[:300000])
    q = T + '?' + 'and'.join([])
    import urllib.parse as P
    daily = g(T + '?' + P.urlencode({'$select': 'date_trunc_ymd(start_dt) as d, count(*) as n', '$where': "start_dt >= '2024-11-01T00:00:00'", '$group': 'd', '$order': 'd', '$limit': '5000'}))
    open(os.path.join(out, 'traffic_daily.json'), 'w').write(daily)
    recent = g(T + '?' + P.urlencode({'$where': "start_dt >= '2026-11-13T00:00:00'", '$order': 'start_dt', '$limit': '5000'}))
    open(os.path.join(out, 'traffic_recent.json'), 'w').write(recent)
    # 5) AQHI Calgary latest
    open(os.path.join(out, 'aqhi.json'), 'w').write(g('https://api.weather.gc.ca/collections/aqhi-observations-realtime/items?f=json&location_name_en=Calgary&sortby=-observation_datetime&limit=24'))
except Exception as e:
    open(os.path.join(out, 'evidence_err.txt'), 'w').write(repr(e))
