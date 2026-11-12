#!/usr/bin/env python3
"""Automatic asset selection: turn a video brief into an asset plan from the catalogue.

  python3 catalog/select_assets.py brief.json            -> prints plan, writes brief.plan.json
  python3 catalog/select_assets.py --text "news: storm map over Calgary with presenter"

brief.json: {"channel": "news|cartoon|calgaryinsight", "title": "...", "script": "...", "keywords": [...],
             "format": "16x9|9x16", "characters": 2, "mood": "urgent|calm|comic|suspense"}
Scoring = channel fit + keyword/synonym overlap with each asset's name/tags/category + channel defaults,
licence filter (commercial-use only by default; attribution-required assets flagged), one pick list per slot."""
import json, os, re, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CAT = json.load(open(os.path.join(ROOT, 'catalog/catalog.json')))['assets']
SYN = {  # brief words -> catalogue vocabulary
    'storm': ['snow', 'rain', 'lightning', 'weather', 'wind', 'map', 'route', 'provinces'], 'weather': ['snow', 'rain', 'sun', 'weather', 'map'], 'winter': ['snow', 'wind'], 'snowfall': ['snow', 'bars'],
    'budget': ['bars', 'donut', 'counter', 'money', 'bill', 'coins', 'document', 'stat'], 'tax': ['money', 'bill', 'coins', 'document', 'bars'], 'cost': ['money', 'counter', 'bars'], 'spending': ['money', 'donut', 'bars'], 'finance': ['money', 'line', 'bars'],
    'infrastructure': ['construction', 'crane', 'excavator', 'cone', 'barrier', '3d', 'city', 'bridge'], 'bridge': ['bridge', 'plus15', 'peacebridge'], 'road': ['street', 'car', 'cone', 'barrier'], 'transit': ['lrt', 'bus', 'city', 'street'], 'housing': ['living', 'room', 'city', 'street'],
    'calgary': ['calgary', 'skyline', '3d', 'downtown', 'plus15'], 'downtown': ['downtown', 'city', '3d', 'office'], 'history': ['historical', 'fort', 'timeline', 'sepia'], 'future': ['futuristic'], 'police': ['officer', 'police'], 'health': ['hospital', 'heartmonitor'], 'school': ['school', 'schooldesk'],
    'funny': ['laugh', 'boing', 'bonk', 'impactstar', 'cartoon'], 'comedy': ['laugh', 'boing', 'bonk', 'slide', 'cartoon'], 'magic': ['wand', 'magic', 'sparkle', 'poof', 'stars'], 'fight': ['punch', 'kick', 'fightstance', 'impactstar', 'punch'], 'dance': ['dance', 'celebrate', 'confetti'], 'sad': ['cry', 'sad'], 'angry': ['shout', 'angry'],
    'breaking': ['breakingbanner', 'sting', 'headline', 'swoosh'], 'presenter': ['daniel', 'amara', 'anchor', 'newsroom', 'lowerthird'], 'interview': ['lowerthird', 'talk', 'listen', 'office'], 'map': ['map', 'pin', 'route', 'geo', 'provinces'], 'chart': ['bars', 'line', 'donut', 'counter'], 'data': ['bars', 'line', 'counter', 'stat', 'timeline'],
    'family': ['living', 'dadi', 'dadaabu', 'basim', 'sakina'], 'kids': ['basim', 'school', 'park'], 'food': ['food', 'restaurant', 'chai', 'samosa', 'biryani'], 'shop': ['shop', 'till'], 'fire': ['fire', 'smoke'], 'explosion': ['explosion', 'debris', 'shockwave'], 'rain': ['rain', 'umbrella'], 'night': ['night', 'calgary_night'],
}
DEFAULTS = {
    'news': ['present', 'talk', 'newsroom', 'daniel', 'amara', 'lowerthird', 'breakingbanner', 'ticker', 'livebug', 'clockbug', 'sting', 'newsswoosh', 'news_bed', 'swoosh_news', 'map', 'bars', 'headline'],
    'cartoon': ['living_room', 'park', 'dadaabu', 'sakina', 'basim', 'talk', 'listen', 'laugh', 'impactstar', 'boing', 'bonk', 'cartoon_bouncy', 'irisout', 'speechbubble', 'pop', 'whoosh'],
    'calgaryinsight': ['talk', 'point', 'walk', '3d', 'calgary', 'skyline', 'titlecard', 'timeline', 'counter', 'stat', 'callout', 'documentary_calm', 'dissolve', 'kenburns', 'zahra', 'ammar', 'endcard', 'sourceline'],
}
SLOTS = [('characters', lambda a: a['id'].startswith(('CHR', 'R3D')), 3), ('motions', lambda a: a['id'].startswith('MOV'), 6), ('environments', lambda a: a['id'].startswith(('ENV', '3DS', 'HDR')), 3),
         ('props', lambda a: a['id'].startswith(('PRP', 'M3D')), 6), ('vfx', lambda a: a['id'].startswith('VFX'), 4), ('graphics', lambda a: a['id'].startswith(('GFX', 'LOT', 'SVG', 'TXT')), 8),
         ('maps_data', lambda a: a['id'].startswith('GEO'), 3), ('camera', lambda a: a['id'].startswith('CAM'), 3), ('transitions', lambda a: a['id'].startswith('TRN'), 3),
         ('music', lambda a: a['id'].startswith(('MUS', 'ACM')), 2), ('sfx', lambda a: a['id'].startswith(('SFX', 'AMB')), 6), ('fonts', lambda a: a['id'].startswith('FNT'), 2)]
FONT_PREF = {'news': ['oswald', 'inter', 'bebas'], 'cartoon': ['luckiest', 'fredoka', 'bangers', 'baloo'], 'calgaryinsight': ['firasans', 'playfair', 'inter']}


STOP = set('the and for from with his her its their this that over into onto our your has have was were are will what when then than they them about after before while very more most much many some just'.split())
def words(s): return set(w for w in re.split(r'[^a-z0-9]+', s.lower()) if len(w) > 2 and w not in STOP)
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())


def plan(brief):
    ch = brief.get('channel', 'calgaryinsight'); text = ' '.join([brief.get('title', ''), brief.get('script', ''), ' '.join(brief.get('keywords', []))])
    q = words(text); exp = set(q)
    for w in q:
        for k, v in SYN.items():
            if w == k or (len(w) >= 4 and (w.startswith(k) or k.startswith(w))): exp |= set(v)
    defaults = set(DEFAULTS.get(ch, []))
    out = {'brief': brief, 'channel': ch, 'matched_terms': sorted(exp), 'slots': {}, 'licence_notes': []}
    for slot, pred, n in SLOTS:
        scored = []
        for a in CAT:
            if not pred(a): continue
            if a.get('commercial') is False: continue
            hay = norm(a['name'] + ' ' + ' '.join(map(str, a.get('tags', []))) + ' ' + a.get('category', '') + ' ' + a.get('path', ''))
            s = 0.0
            s += 3.0 if ch in a.get('channels', []) else (-4.0 if a.get('channels') and ch not in a['channels'] else 0)
            s += sum(2.0 for w in exp if len(w) > 2 and norm(w) in hay)
            s += sum(1.5 for d in defaults if norm(d) in hay)
            if slot == 'fonts': s += sum(3 for f in FONT_PREF.get(ch, []) if f in hay)
            if slot == 'characters' and brief.get('style') != '3d' and a['id'].startswith('R3D'): s -= 2
            if a.get('attribution'): s -= 0.5
            if s > 3.0: scored.append((round(s, 2), a))  # channel fit alone (3.0) is not enough
        scored.sort(key=lambda x: -x[0]); k = brief.get('characters', n) if slot == 'characters' else n
        out['slots'][slot] = [{'id': a['id'], 'name': a['name'], 'score': s, 'path': a['path'], 'usage': a.get('usage', ''), 'attribution': a.get('attribution')} for s, a in scored[:k]]
        for s, a in scored[:k]:
            if a.get('attribution'): out['licence_notes'].append(f"{a['id']} {a['name']}: {a['licence']}")
    return out


if __name__ == '__main__':
    if sys.argv[1] == '--text':
        t = sys.argv[2]; ch = next((c for c in ('news', 'cartoon', 'calgaryinsight') if t.lower().startswith(c)), 'calgaryinsight'); brief = {'channel': ch, 'script': t}; out_path = None
    else:
        brief = json.load(open(sys.argv[1])); out_path = sys.argv[1].replace('.json', '.plan.json')
    p = plan(brief)
    if out_path: json.dump(p, open(out_path, 'w'), indent=1)
    print(f"ASSET PLAN · channel={p['channel']} · terms: {', '.join(p['matched_terms'][:18])}")
    for slot, items in p['slots'].items():
        print(f"  {slot:13s} " + ' | '.join(f"{i['id']} {i['name'][:38]}" for i in items))
    for n in p['licence_notes']: print('  ⚠ credit:', n)
