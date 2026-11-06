"""Calgary Transit, live: where every bus and CTrain is right now, with its route number.

Calgary Transit publishes three live feeds on the City's open data portal, refreshed about every 30 seconds, in the
GTFS Realtime format (Protocol Buffers):
  am7c-qe3u  vehicle positions  each vehicle's fleet number, the trip it is running, latitude, longitude, heading
  gs4m-mdc2  trip updates       each running trip and its route number
  jhgn-ynqj  service alerts     (not used here)
and the timetable (GTFS, dataset npk7-z3bj, a zip), whose trips.txt names the route and the destination of every trip.

HOW A VEHICLE GETS ITS ROUTE NUMBER
  1. The trip it is running, looked up in the timetable's trips.txt -> route number, route name and destination.
  2. If the trip is not in the timetable (an extra trip added on the day), the route number from the trip updates feed.
  3. Otherwise no route: shown as "Route not given" (usually a vehicle going to or from the garage).

Nothing is kept: positions are read again every 30 seconds while the map layer is on. The timetable lookup is kept for
a week (it changes with each service season).
"""
import csv
import io
import json
import os
import time
import urllib.request
import zipfile

PORTAL = 'https://data.calgary.ca'
VEHICLES = 'am7c-qe3u'
TRIP_UPDATES = 'gs4m-mdc2'
TIMETABLE = 'npk7-z3bj'
FEED_URL = PORTAL + '/download/{id}/application%2Foctet-stream'
TIMETABLE_URL = PORTAL + '/download/' + TIMETABLE + '/application%2Fzip'
PAGE = PORTAL + '/d/' + VEHICLES
LOOKUP_DAYS = 7
HEADERS = {'User-Agent': 'CalgaryDataDesk/2.0'}
KIND = {'0': 'ctrain', '1': 'ctrain', '2': 'ctrain', '3': 'bus'}       # GTFS route_type


# ---------------------------------------------------------------- Protocol Buffers, just what GTFS Realtime needs
def _varint(b, i):
    v = shift = 0
    while True:
        x = b[i]
        i += 1
        v |= (x & 0x7F) << shift
        if not x & 0x80:
            return v, i
        shift += 7


def fields(b, start=0, end=None):
    """Every field of one message as (number, value): varints as int, 32-bit as float, nested messages as bytes."""
    import struct
    end = len(b) if end is None else end
    out, i = [], start
    while i < end:
        key, i = _varint(b, i)
        num, wire = key >> 3, key & 7
        if wire == 0:
            v, i = _varint(b, i)
        elif wire == 2:
            n, i = _varint(b, i)
            v, i = b[i:i + n], i + n
        elif wire == 5:
            v, i = struct.unpack('<f', b[i:i + 4])[0], i + 4
        elif wire == 1:
            v, i = struct.unpack('<d', b[i:i + 8])[0], i + 8
        else:
            break
        out.append((num, v))
    return out


def _first(fs, num, default=None):
    for n, v in fs:
        if n == num:
            return v
    return default


def _text(v):
    return v.decode('utf-8', 'replace') if isinstance(v, (bytes, bytearray)) else v


def feed_time(b):
    """The time the feed was written (FeedHeader.timestamp, seconds since 1970)."""
    head = _first(fields(b), 1)
    return _first(fields(head), 3) if head else None


def vehicles(b):
    """FeedMessage -> [{vehicle, trip, lat, lon, bearing, time}] from VehiclePosition entities."""
    out = []
    for num, ent in fields(b):
        if num != 2:
            continue
        vp = _first(fields(ent), 4)
        if vp is None:
            continue
        f = fields(vp)
        trip = _first(f, 1)
        pos = _first(f, 2)
        veh = _first(f, 8)
        if pos is None:
            continue
        p = fields(pos)
        lat, lon = _first(p, 1), _first(p, 2)
        if lat is None or lon is None:
            continue
        vf = fields(veh) if veh is not None else []
        out.append({'vehicle': _text(_first(vf, 2) or _first(vf, 1) or ''),
                    'trip': _text(_first(fields(trip), 1)) if trip is not None else '',
                    'lat': round(lat, 5), 'lon': round(lon, 5),
                    'bearing': round(_first(p, 3)) if _first(p, 3) is not None else None,
                    'time': _first(f, 5)})
    return out


def trip_routes(b):
    """FeedMessage of TripUpdates -> {trip_id: route number}."""
    out = {}
    for num, ent in fields(b):
        if num != 2:
            continue
        tu = _first(fields(ent), 3)
        if tu is None:
            continue
        td = _first(fields(tu), 1)
        if td is None:
            continue
        t = fields(td)
        trip, route = _text(_first(t, 1)), _text(_first(t, 5))
        if trip and route:
            out[trip] = route
    return out


# ---------------------------------------------------------------- the timetable: trip -> route, destination
def _rows(z, name):
    with z.open(name) as f:
        yield from csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig'))


def lookup_from_zip(data):
    """The timetable zip -> {'routes': [[number, name, kind]], 'to': [destination], 'trips': {trip: [route, to]},
    'valid': [first day, last day]} (indexes into routes and to, so the file stays small)."""
    z = zipfile.ZipFile(io.BytesIO(data))
    names = set(z.namelist())
    routes, rix = [], {}
    for r in _rows(z, 'routes.txt'):
        rix[r['route_id']] = len(routes)
        routes.append([(r.get('route_short_name') or r['route_id']).strip(), (r.get('route_long_name') or '').strip(),
                       KIND.get((r.get('route_type') or '3').strip(), 'bus')])
    to, tix, trips = [], {}, {}
    for t in _rows(z, 'trips.txt'):
        ri = rix.get(t['route_id'])
        if ri is None:
            continue
        h = (t.get('trip_headsign') or '').strip().title()
        if h not in tix:
            tix[h] = len(to)
            to.append(h)
        trips[t['trip_id'].strip()] = [ri, tix[h]]
    valid = None
    if 'calendar.txt' in names:
        days = [(c['start_date'], c['end_date']) for c in _rows(z, 'calendar.txt') if c.get('start_date')]
        if days:
            first, last = min(d[0] for d in days), max(d[1] for d in days)
            valid = [f'{first[:4]}-{first[4:6]}-{first[6:]}', f'{last[:4]}-{last[4:6]}-{last[6:]}']
    return {'routes': routes, 'to': to, 'trips': trips, 'valid': valid,
            'built': time.strftime('%Y-%m-%dT%H:%M:%S'), 'source': PORTAL + '/d/' + TIMETABLE}


def _get(url, timeout=60):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=timeout) as r:
        return r.read()


def lookup(cache_dir, force=False):
    """The timetable lookup, kept for a week in cache_dir/transit/lookup.json. A failed download keeps the old copy."""
    path = os.path.join(cache_dir, 'transit', 'lookup.json')
    fresh = os.path.exists(path) and time.time() - os.path.getmtime(path) < LOOKUP_DAYS * 86400
    if fresh and not force:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    try:
        data = lookup_from_zip(_get(TIMETABLE_URL, timeout=180))
    except Exception:
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                return json.load(f)
        raise
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path + '.tmp', 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    os.replace(path + '.tmp', path)
    return data


# ---------------------------------------------------------------- live
def join(vehicle_list, look, extra_routes=None):
    """Give each vehicle its route number, route name, destination and kind (bus or CTrain)."""
    routes, to, trips = look.get('routes') or [], look.get('to') or [], look.get('trips') or {}
    by_number = {r[0]: r for r in routes}
    extra_routes = extra_routes or {}
    out = []
    for v in vehicle_list:
        hit = trips.get(v['trip'])
        if hit:
            r = routes[hit[0]]
            route, name, kind, dest, how = r[0], r[1], r[2], to[hit[1]] if hit[1] < len(to) else '', 'timetable'
        elif v['trip'] in extra_routes:
            route = extra_routes[v['trip']]
            r = by_number.get(route)
            name, kind, dest, how = (r[1] if r else ''), (r[2] if r else 'bus'), '', 'trip updates'
        else:
            route, name, kind, dest, how = '', '', 'bus', '', ''
        out.append({**v, 'route': route, 'name': name, 'to': dest, 'kind': kind, 'how': how})
    out.sort(key=lambda v: (v['route'] == '', len(v['route']), v['route'], v['vehicle']))
    return out


def live(cache_dir):
    """Every vehicle now, read straight from the City's portal."""
    vb = _get(FEED_URL.format(id=VEHICLES), timeout=30)
    try:
        extra = trip_routes(_get(FEED_URL.format(id=TRIP_UPDATES), timeout=30))
    except Exception:
        extra = {}
    try:
        look = lookup(cache_dir)
    except Exception:
        look = {}
    vs = join(vehicles(vb), look, extra)
    return {'ok': True, 'feed_time': feed_time(vb), 'read_at': int(time.time()), 'vehicles': vs,
            'timetable_valid': look.get('valid'), 'page': PAGE}
