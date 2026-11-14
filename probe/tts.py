import csv, io, json, os, sys, time, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def get(url):
    for i in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf-8-sig', 'replace')
        except Exception as e:
            err = str(e); time.sleep(2)
    return 'ERR ' + err
B = 'https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID={s}&Year={y}&Month=11&Day=14&timeframe={tf}&submit=Download+Data'
res = {}
for y in range(1926, 2027):
    for s in ([2205] if y < 2012 else [2205, 50430] if y == 2012 else [50430]):
        txt = get(B.format(s=s, y=y, tf=2))
        if txt.startswith('ERR'): res[f'{y}_{s}'] = txt; continue
        for r in csv.DictReader(io.StringIO(txt)):
            d = r.get('Date/Time', '')
            if d.endswith('-11-14') or d.endswith('-11-13') or d.endswith('-11-15'):
                res[f'{d}_{s}'] = {'max': r.get('Max Temp (°C)'), 'min': r.get('Min Temp (°C)'), 'flag': r.get('Max Temp Flag'), 'station': r.get('Station Name'), 'climate_id': r.get('Climate ID')}
for s in (50430, 27211):
    txt = get(B.format(s=s, y=2026, tf=1))
    rows = [ {k: r.get(k) for k in ('Date/Time (LST)', 'Temp (°C)', 'Station Name')} for r in csv.DictReader(io.StringIO(txt)) if '2026-11-14' in (r.get('Date/Time (LST)') or '')] if not txt.startswith('ERR') else txt
    res[f'hourly_2026-11-14_{s}'] = rows
json.dump(res, open(os.path.join(out, 'ec_nov14.json'), 'w'), indent=1, ensure_ascii=False)
print(len(res))
