"""Calgary weather history from Environment and Climate Change Canada (api.weather.gc.ca).

The City of Calgary does not publish weather records, so weather questions use the federal climate data for
the Calgary International Airport station, which is inside Ward 5:
  CALGARY INTL A    (climate ID 3031092) from July 12, 2012
  CALGARY INT'L A   (climate ID 3031093) from 1881 to July 11, 2012
No account or key is needed.
"""
import datetime as dt
import json
import urllib.error
import urllib.parse
import urllib.request

BASE = 'https://api.weather.gc.ca/collections/climate-daily/items'
NEW_STATION, OLD_STATION = '3031092', '3031093'
SWITCH = dt.date(2012, 7, 12)
FIELDS = ['LOCAL_DATE', 'MEAN_TEMPERATURE', 'MIN_TEMPERATURE', 'MAX_TEMPERATURE', 'TOTAL_PRECIPITATION',
          'TOTAL_RAIN', 'TOTAL_SNOW', 'SNOW_ON_GROUND', 'SPEED_MAX_GUST']
SOURCE = ('Environment and Climate Change Canada, daily climate data, Calgary International Airport '
          '(climate IDs 3031092 and 3031093), api.weather.gc.ca')
PAGE = 10000
MAX_DAILY_ROWS = 120


class WeatherError(Exception):
    pass


def _http_get(url, timeout=120):
    req = urllib.request.Request(url, headers={'User-Agent': 'CalgaryInsight/1.0', 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise WeatherError(f'Environment Canada answered {e.code}.') from None
    except urllib.error.URLError as e:
        raise WeatherError(f'Could not reach api.weather.gc.ca ({e.reason}). Check the internet connection.') from None


fetch = _http_get        # replaced in tests


def _url(station, start, end, offset=0):
    return BASE + '?' + urllib.parse.urlencode({
        'f': 'json', 'CLIMATE_IDENTIFIER': station, 'datetime': f'{start.isoformat()}/{end.isoformat()}',
        'sortby': 'LOCAL_DATE', 'limit': PAGE, 'offset': offset, 'properties': ','.join(FIELDS)})


def _days(station, start, end):
    out, offset = [], 0
    while True:
        page = json.loads(fetch(_url(station, start, end, offset)).decode('utf-8'))
        feats = page.get('features', [])
        out += [f['properties'] for f in feats]
        if len(feats) < PAGE:
            return out
        offset += PAGE


def daily(start, end):
    """Daily records between two dates (inclusive), joining the two airport stations."""
    rows = []
    if start < SWITCH:
        rows += _days(OLD_STATION, start, min(end, SWITCH - dt.timedelta(days=1)))
    if end >= SWITCH:
        rows += _days(NEW_STATION, max(start, SWITCH), end)
    return rows


def _num(v):
    return None if v is None else float(v)


def summarize(rows, by):
    """Group daily records by 'month' or 'year'."""
    groups = {}
    for r in rows:
        d = r['LOCAL_DATE'][:10]
        groups.setdefault(d[:7] if by == 'month' else d[:4], []).append(r)
    out = []
    for key in sorted(groups):
        g = groups[key]
        vals = lambda f: [_num(x.get(f)) for x in g if x.get(f) is not None]
        mean, lo, hi = vals('MEAN_TEMPERATURE'), vals('MIN_TEMPERATURE'), vals('MAX_TEMPERATURE')
        pr, rain, snow, sog = vals('TOTAL_PRECIPITATION'), vals('TOTAL_RAIN'), vals('TOTAL_SNOW'), vals('SNOW_ON_GROUND')
        out.append({
            by: key, 'days_with_data': len(mean),
            'mean_temp_c': round(sum(mean) / len(mean), 1) if mean else None,
            'lowest_c': min(lo) if lo else None, 'highest_c': max(hi) if hi else None,
            'precipitation_mm': round(sum(pr), 1) if pr else None,
            'rain_mm': round(sum(rain), 1) if rain else None,
            'snowfall_cm': round(sum(snow), 1) if snow else None,
            'days_with_snowfall': sum(1 for v in snow if v >= 0.2) if snow else None,
            'deepest_snow_on_ground_cm': max(sog) if sog else None,
            'days_30c_or_hotter': sum(1 for v in hi if v >= 30),
            'days_minus20c_or_colder': sum(1 for v in lo if v <= -20),
        })
    return out


def history(start, end, by='month'):
    """Weather between two ISO dates, by 'day', 'month' or 'year'."""
    try:
        s, e = dt.date.fromisoformat(start), dt.date.fromisoformat(end)
    except ValueError:
        raise WeatherError('Dates must look like 2025-01-31.') from None
    e = min(e, dt.date.today())
    if s > e:
        raise WeatherError('The start date is after the end date.')
    if by == 'day' and (e - s).days >= MAX_DAILY_ROWS:
        raise WeatherError(f'Daily records are limited to {MAX_DAILY_ROWS} days at a time; use by="month" or "year" '
                           'for longer periods.')
    rows = daily(s, e)
    if by == 'day':
        data = [{'date': r['LOCAL_DATE'][:10], 'mean_temp_c': r.get('MEAN_TEMPERATURE'),
                 'lowest_c': r.get('MIN_TEMPERATURE'), 'highest_c': r.get('MAX_TEMPERATURE'),
                 'precipitation_mm': r.get('TOTAL_PRECIPITATION'), 'snowfall_cm': r.get('TOTAL_SNOW'),
                 'snow_on_ground_cm': r.get('SNOW_ON_GROUND'), 'max_gust_kmh': r.get('SPEED_MAX_GUST')} for r in rows]
    else:
        data = summarize(rows, 'month' if by == 'month' else 'year')
    return {'source': SOURCE, 'from': s.isoformat(), 'to': e.isoformat(), 'by': by, 'rows': data,
            'note': 'Blank values are days the station did not report. Recent days can be missing for a few days.'}


FORECAST_URL = 'https://api.weather.gc.ca/collections/citypageweather-realtime/items/ab-52?f=json&lang=en'
FORECAST_SOURCE = ('Environment and Climate Change Canada, public forecast for Calgary (weather.gc.ca, '
                   'citypageweather ab-52), api.weather.gc.ca')


def _en(v):
    return v.get('en') if isinstance(v, dict) and 'en' in v else v


def forecast():
    """Today's conditions, Environment Canada's 7-day forecast for Calgary and any weather warnings."""
    p = json.loads(fetch(FORECAST_URL).decode('utf-8')).get('properties') or {}
    cc = p.get('currentConditions') or {}
    now = {'observed_at_utc': _en(cc.get('timestamp')), 'condition': _en(cc.get('condition')),
           'temperature_c': _en((cc.get('temperature') or {}).get('value')),
           'wind_chill': _en((cc.get('windChill') or {}).get('value')),
           'humidity_pct': _en((cc.get('relativeHumidity') or {}).get('value')),
           'wind_kmh': _en(((cc.get('wind') or {}).get('speed') or {}).get('value')),
           'wind_direction': _en(((cc.get('wind') or {}).get('direction') or {}).get('value'))}
    fg = p.get('forecastGroup') or {}
    try:                                       # Calgary time: UTC-7 in winter, UTC-6 in summer (close enough for the date)
        issued = dt.datetime.fromisoformat(str(_en(fg.get('timestamp'))).replace('Z', '+00:00'))
        d0 = (issued - dt.timedelta(hours=7)).date()
    except ValueError:
        d0 = dt.date.today()
    names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    days = []
    for f in fg.get('forecasts') or []:
        per = f.get('period') or {}
        temps = {_en(t.get('class')): _en(t.get('value')) for t in (f.get('temperatures') or {}).get('temperature') or []}
        pop = _en(((f.get('abbreviatedForecast') or {}).get('pop') or {}).get('value'))
        wd = str(_en(per.get('value')) or '').lower().replace(' night', '').strip()
        date = next((d0 + dt.timedelta(days=i) for i in range(8) if wd in names and (d0 + dt.timedelta(days=i)).weekday()
                     == names.index(wd)), None)
        days.append({'period': _en(per.get('textForecastName')), 'date': date.isoformat() if date else None,
                     'summary': _en(f.get('textSummary')), 'high_c': temps.get('high'), 'low_c': temps.get('low'),
                     'chance_of_precipitation_pct': pop or None})
    warn = [{'type': _en(w.get('type')), 'description': _en(w.get('description')),
             'expires_utc': _en(w.get('expiryTime'))} for w in (p.get('warnings') or []) if isinstance(w, dict)]
    return {'place': 'Calgary', 'issued_utc': _en(fg.get('timestamp')), 'now': now, 'forecast': days,
            'normals': _en((fg.get('regionalNormals') or {}).get('textSummary')), 'warnings': warn,
            'page': 'https://weather.gc.ca/en/location/index.html?coords=51.05,-114.07', 'source': FORECAST_SOURCE,
            'note': 'Environment Canada forecasts reach about 6 to 7 days ahead. For a date further out, give what '
                    'the forecast covers and the usual weather for that date from get_weather history.'}

