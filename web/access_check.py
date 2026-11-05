"""Work out the access base figures from the City's live data and compare Calgary's with canada-insight's build.

    python web/access_check.py OUT_DIR [--cache DIR]
Writes OUT_DIR/access_base.json and OUT_DIR/access_check.json (the reconciliation).
"""
import argparse
import json
import os
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

import access                   # noqa: E402
import calgary_data as cd       # noqa: E402
import wards as wardmap         # noqa: E402

REF = 'https://raw.githubusercontent.com/hassanaliarshad110/canada-insight/data/latest/calgary/access.json'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--cache', default=os.path.join(ROOT, '.site-cache'))
    a = ap.parse_args()
    cd.RETRIES, cd.RETRY_WAIT = 3, 10
    os.makedirs(a.out, exist_ok=True)
    t0 = time.time()
    table = wardmap.load(a.cache)
    ward_of = {c: v.get('ward') for c, v in (table.get('communities') or {}).items()}
    import assets
    try:
        feats = ((assets.load(a.cache) or {}).get('other') or {}).get('features')
    except Exception as e:      # noqa: BLE001
        print('OpenStreetMap amenities not read:', e)
        feats = None
    base = access.build(a.cache, ward_of, features=feats)
    with open(os.path.join(a.out, 'access_base.json'), 'w', encoding='utf-8') as f:
        json.dump(base, f, separators=(',', ':'))
    rep = {'seconds': round(time.time() - t0, 1), 'homes': base['homes'], 'amenities': base['amenities'], 'kinds': {}}
    try:
        with urllib.request.urlopen(REF, timeout=120) as r:
            ref = json.loads(r.read().decode('utf-8'))
    except Exception as e:      # noqa: BLE001
        ref = None
        rep['ref_error'] = str(e)
    for k, spec in access.KINDS.items():
        mine = access.shares(base['city']['access'][k], spec['thresholds_m'])
        theirs = (ref or {}).get('city_access', {}).get(k, {})
        rep['kinds'][k] = {'this_build': {f: mine[f] for f in ('units', 'records', 'share_1', 'share_2', 'share_records_1',
                                                              'share_new_1', 'share_old_1', 'median_m')},
                           'canada_insight': {f: theirs.get(f) for f in ('units', 'records', 'share_primary', 'share_secondary',
                                                                         'share_primary_records', 'share_new_primary',
                                                                         'share_old_primary', 'median_m')},
                           'ref_built_at': (ref or {}).get('built_at')}
        if ref:   # community by community: how many differ by more than half a point
            diffs = []
            for c, v in base['comm'].items():
                rv = ((ref.get('areas') or {}).get(c) or {}).get('access', {}).get(k)
                if not rv or rv.get('share_primary') is None:
                    continue
                s = access.shares(v['access'][k], spec['thresholds_m'])['share_1']
                if s is not None and abs(s - rv['share_primary']) > 0.005:
                    diffs.append([c, s, rv['share_primary'], v['units'], rv.get('units')])
            rep['kinds'][k]['communities_differing_over_half_a_point'] = sorted(diffs, key=lambda d: -abs(d[1] - d[2]))[:15]
            rep['kinds'][k]['communities_differing_count'] = len(diffs)
    with open(os.path.join(a.out, 'access_check.json'), 'w', encoding='utf-8') as f:
        json.dump(rep, f, indent=1)
    print(json.dumps({k: v['this_build'] | {'ref': v['canada_insight']} for k, v in rep['kinds'].items()}, indent=1))
    print('seconds', rep['seconds'])


if __name__ == '__main__':
    main()
