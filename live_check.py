"""Live check (not part of the app): builds the whole city and a few wards straight from the City's APIs, into the
v2 test folder's own saved data, and writes what it got to _live_check.txt."""
import json, os, sys, time, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
CACHE = os.environ.get('CDD_DATA_DIR') or os.path.join(HERE, '_appdata')
os.makedirs(CACHE, exist_ok=True)
LOG = open(os.path.join(HERE, '_live_check.txt'), 'w', encoding='utf-8')


def p(*a):
    print(*a)
    print(*a, file=LOG)
    LOG.flush()


import dashboard  # noqa: E402
import livecheck  # noqa: E402
p('Live connections:')
for k, *_ in livecheck.SOURCES:
    r = livecheck.test(k)
    p(f"   {'LIVE ' if r['ok'] else 'FAIL '} {r['name']}: {r.get('ms')} ms, updated {r.get('updated') or '-'}; {r.get('detail')}")
for w in [int(x) for x in sys.argv[1:] if x.isdigit()] or [0, 5, 10]:
    t = time.time()
    try:
        d = dashboard.load(os.path.join(CACHE, 'dashboard_cache.json'), max_age_hours=0, force=True, ward=w)
        s, sc = d.get('summary') or {}, d.get('scope') or {}
        p(f"{sc.get('name')} ok in {time.time() - t:.0f} s: {d['ward'].get('residents'):,} residents, "
          f"{len([c for c in d['communities'] if c['residential']])} communities, {s.get('requests12'):,} requests, "
          f"{s.get('open_now'):,} open, crime {(d.get('crime') or {}).get('crimes')}")
        g = d.get('amenity_gap') or {}
        p(f"   amenity gap: {len(g.get('by_comm') or [])} communities, flagged {[r['name'] for r in g.get('by_comm') or [] if r.get('flag')][:12]}")
        cc = ((d.get('families') or {}).get('child_care') or {})
        p(f"   child care spaces {cc.get('spaces')}, schools {len(((d.get('families') or {}).get('schools') or {}).get('schools') or [])}")
        if d.get('wards_summary'):
            for r in d['wards_summary']['wards']:
                p(f"   Ward {r['ward']:>2}: {r.get('residents'):>8,} residents, amenity level {r.get('amenity_level')}, "
                  f"crime/1000 {r.get('crime_per_1000')}, open/1000 {r.get('open_per_1000')}")
        bad = [f"{x['name']}: {x.get('error')}" for x in d.get('status') or [] if not x.get('ok')]
        p('   problems:', bad or 'none')
    except Exception:
        p(f'Ward {w} FAILED after {time.time() - t:.0f} s')
        p(traceback.format_exc())
p('DONE')
