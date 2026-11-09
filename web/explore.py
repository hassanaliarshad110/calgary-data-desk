"""Explore Calgary (calgaryinsight.ca/visit/explore/): the data behind the trip planner, the experience map, the
collections, the neighbourhood explorer, what's on and Beyond Calgary, in one file per city
(visit/explore/data/calgary.json), so another city can be added with its own file.

Everything comes from what the site already checks:
  - the hand-checked sights (visit.TOP: what, where, website, the weather each suits), placed with OpenStreetMap
    positions when the daily build has them (data/visit.json);
  - the six photo guides (visit_content.py: what each place offers, tips, official links, the photo and its credit);
  - a few more places checked by hand here (EXTRA), positioned with OpenStreetMap (Nominatim, November 2026);
  - the districts (visit.AREAS), the events by month (visit.MONTHS), getting around (visit.GETTING_AROUND);
  - the places within a few hours (data/tourism_research.json around_calgary: OpenStreetMap drive times);
  - CTrain stations from OpenStreetMap (data/explore_ctrain.json).
What it adds is a profile for each place (EXPLORE): its categories, the interests it suits, whether it costs nothing to
get in (only where that is plainly so; otherwise 'paid' or 'varies', with the official page for prices), a suggested
time to spend (an estimate, labelled as one), and whether it suits evenings, families, photos and winter.
Nothing here is a price, an opening hour or a rating."""
import html
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
sys.path.insert(0, HERE)

import visit                    # noqa: E402
import visit_content as VC      # noqa: E402

CHECKED = 'November 2026'
CATEGORIES = [('attractions', 'Major attractions'), ('parks', 'Parks and green spaces'), ('views', 'Scenic viewpoints'),
              ('walks', 'Walking and cycling'), ('museums', 'Museums and galleries'), ('food', 'Food and markets'),
              ('shopping', 'Shopping'), ('night', 'Entertainment and nightlife'), ('family', 'Family'),
              ('history', 'Historic places'), ('culture', 'Culture'), ('winter', 'Winter'), ('photo', 'Photography')]
INTERESTS = ['nature', 'adventure', 'food', 'history', 'culture', 'architecture', 'nightlife', 'family', 'shopping', 'photography']

# id: (categories, interests, cost, suggested minutes, evening, family, winter)
EXPLORE = {
    'tower': (['attractions', 'views', 'photo', 'night'], ['photography', 'architecture', 'family'], 'paid', 60, True, True, True),
    'glenbow': (['museums', 'culture', 'history'], ['culture', 'history'], 'free', 120, False, True, True),
    'studiobell': (['museums', 'culture', 'attractions'], ['culture', 'architecture', 'family'], 'paid', 120, False, True, True),
    'library': (['culture', 'family', 'winter', 'photo'], ['architecture', 'culture', 'family'], 'free', 45, False, True, True),
    'stephen': (['walks', 'food', 'shopping', 'history', 'night'], ['food', 'history', 'architecture', 'shopping', 'nightlife'], 'free', 45, True, False, False),
    'plus15': (['walks', 'winter'], ['architecture'], 'free', 30, False, False, True),
    'princes': (['parks', 'walks', 'family'], ['nature', 'family'], 'free', 45, False, True, False),
    'peace': (['views', 'walks', 'photo'], ['architecture', 'photography'], 'free', 20, True, True, True),
    'confluence': (['history', 'museums', 'parks'], ['history', 'culture'], 'paid', 75, False, True, True),
    'chinatown': (['food', 'culture', 'shopping'], ['food', 'culture', 'shopping'], 'free', 60, True, False, True),
    'contemporary': (['museums', 'culture'], ['culture', 'architecture'], 'varies', 60, False, False, True),
    'devonian': (['parks', 'family', 'winter'], ['nature', 'family'], 'free', 30, False, True, True),
    'zoo': (['attractions', 'family'], ['family', 'nature'], 'paid', 180, False, True, True),
    'spark': (['attractions', 'family', 'winter'], ['family'], 'paid', 150, False, True, True),
    'inglewood': (['food', 'shopping', 'history', 'night'], ['food', 'shopping', 'history', 'nightlife'], 'free', 90, True, False, True),
    'kensington': (['food', 'shopping', 'walks'], ['food', 'shopping'], 'free', 75, True, False, True),
    'seventeenth': (['food', 'night', 'shopping'], ['food', 'nightlife', 'shopping'], 'free', 90, True, False, True),
    'stampede': (['attractions', 'history', 'culture'], ['history', 'culture', 'family'], 'varies', 120, True, True, False),
    'heritage': (['history', 'family', 'attractions'], ['history', 'family'], 'paid', 240, False, True, False),
    'glenmore': (['parks', 'walks', 'views'], ['nature', 'adventure', 'photography'], 'free', 90, False, True, False),
    'fishcreek': (['parks', 'walks', 'winter'], ['nature', 'adventure', 'family'], 'free', 120, False, True, True),
    'military': (['museums', 'history'], ['history'], 'paid', 120, False, True, True),
    'nosehill': (['parks', 'views', 'walks', 'photo'], ['nature', 'photography', 'adventure'], 'free', 90, False, True, True),
    'bowness': (['parks', 'family', 'winter'], ['nature', 'family'], 'free', 90, False, True, True),
    'winsport': (['attractions', 'winter', 'family'], ['adventure', 'family'], 'paid', 180, False, True, True),
    'oval': (['winter', 'attractions'], ['adventure', 'family'], 'paid', 60, False, True, True),
    'spruce': (['attractions', 'culture'], ['culture', 'family'], 'varies', 180, False, True, False),
    'calaway': (['attractions', 'family'], ['family', 'adventure'], 'paid', 300, False, True, False),
    'lougheed': (['history', 'museums'], ['history', 'architecture'], 'paid', 60, False, False, True),
    'farmers': (['food', 'shopping', 'family'], ['food', 'shopping', 'family'], 'free', 75, False, True, True),
    'pathways': (['walks', 'parks'], ['nature', 'adventure'], 'free', 120, False, True, False),
    # the places added here
    'olympicplaza': (['history', 'culture'], ['history'], 'free', 15, False, False, False),
    'stpatricks': (['parks', 'family', 'walks'], ['nature', 'family'], 'free', 45, False, True, False),
    'edworthy': (['parks', 'walks'], ['nature', 'adventure'], 'free', 120, False, True, False),
    'saddledome': (['night', 'attractions'], ['nightlife'], 'paid', 180, True, True, True),
    'mcmahon': (['night', 'attractions'], ['nightlife'], 'paid', 180, True, True, False),
    'werklund': (['night', 'culture'], ['culture', 'nightlife'], 'paid', 150, True, False, True),
    'birdsanctuary': (['parks', 'walks', 'photo'], ['nature', 'photography', 'family'], 'free', 75, False, True, True),
    'readerrock': (['parks', 'history', 'photo'], ['nature', 'history', 'photography'], 'free', 45, False, False, False),
    'crescentheights': (['views', 'photo', 'walks'], ['photography'], 'free', 20, True, False, True),
    'scotsmans': (['views', 'photo'], ['photography'], 'free', 20, True, False, True),
    'cityhall': (['history', 'culture'], ['history', 'architecture'], 'free', 15, False, False, True),
    'rileypark': (['parks', 'family'], ['nature', 'family'], 'free', 45, False, True, False),
    'memorialpark': (['parks', 'history'], ['history', 'nature'], 'free', 20, False, False, False),
}

# places the guides and collections need that the checked list does not have, positioned with OpenStreetMap (Nominatim)
EXTRA = [
    {'id': 'olympicplaza', 'osm': 'way/127943987', 'name': 'Olympic Plaza', 'kind': 'Public square', 'area': 'Downtown', 'lat': 51.04593, 'lon': -114.05909, 'indoor': False,
     'what': 'The square where 1988 Winter Olympics medals were presented, beside City Hall; being rebuilt (check the City\'s page for progress).',
     'url': None, 'fit': ['warm', 'cool'], 'closed_until': 'rebuilding'},
    {'id': 'stpatricks', 'osm': 'way/541442153', 'name': "St. Patrick's Island Park", 'kind': 'Park', 'area': 'Inglewood, Ramsay and Bridgeland', 'lat': 51.04695, 'lon': -114.03953, 'indoor': False,
     'what': 'An island park in the Bow beside East Village, reached by a footbridge: a hill with skyline views, a pebble beach and play areas.',
     'url': None, 'fit': ['warm', 'cool']},
    {'id': 'edworthy', 'osm': 'way/10584822', 'name': 'Edworthy Park and the Douglas Fir Trail', 'kind': 'Park', 'area': 'West and northwest', 'lat': 51.05926, 'lon': -114.16056, 'indoor': False,
     'what': 'A river valley park on the Bow in the west; the Douglas Fir Trail climbs through an old Douglas fir forest on the escarpment.',
     'url': None, 'fit': ['warm', 'cool']},
    {'id': 'saddledome', 'osm': 'way/4397328', 'name': 'Scotiabank Saddledome', 'kind': 'Arena', 'area': 'Beltline and Stampede Park', 'lat': 51.03741, 'lon': -114.05196, 'indoor': True,
     'what': 'Home of the NHL\'s Calgary Flames and of big concerts until Scotia Place opens next door (fall 2027).',
     'url': None, 'fit': ['cold', 'wet', 'cool', 'warm']},
    {'id': 'mcmahon', 'osm': 'way/427304042', 'name': 'McMahon Stadium', 'kind': 'Stadium', 'area': 'University and Motel Village', 'lat': 51.07042, 'lon': -114.12149, 'indoor': False,
     'what': 'Home of the CFL\'s Calgary Stampeders (June to November), beside Banff Trail CTrain station.',
     'url': 'https://www.stampeders.com/', 'fit': ['warm', 'cool']},
    {'id': 'werklund', 'osm': 'way/218779998', 'name': 'Werklund Centre', 'kind': 'Performing arts', 'area': 'Downtown', 'lat': 51.04496, 'lon': -114.05949, 'indoor': True,
     'what': 'Calgary\'s performing arts centre beside City Hall (formerly Arts Commons): the Calgary Philharmonic, theatre companies and touring shows.',
     'url': None, 'fit': ['cold', 'wet', 'cool', 'warm']},
    {'id': 'birdsanctuary', 'osm': 'way/52466592', 'name': 'Inglewood Bird Sanctuary', 'kind': 'Nature area', 'area': 'Inglewood, Ramsay and Bridgeland', 'lat': 51.0279, 'lon': -114.00696, 'indoor': False,
     'what': 'A federal migratory bird sanctuary on the Bow with flat trails through riverside forest and a nature centre.',
     'url': None, 'fit': ['warm', 'cool', 'cold']},
    {'id': 'readerrock', 'osm': 'way/496765923', 'name': 'Reader Rock Garden', 'kind': 'Historic garden', 'area': 'Beltline and Stampede Park', 'lat': 51.03007, 'lon': -114.05647, 'indoor': False,
     'what': 'The restored hillside garden of William Reader, the city\'s parks superintendent from 1913 to 1942, a Provincial Historic Resource.',
     'url': None, 'fit': ['warm', 'cool']},
    {'id': 'crescentheights', 'osm': 'way/23647361', 'name': 'Crescent Heights lookout', 'kind': 'Viewpoint', 'area': 'Kensington and Hillhurst', 'lat': 51.06175, 'lon': -114.06874, 'indoor': False,
     'what': 'The escarpment park above the Bow north of downtown, with one of the city\'s classic views of the skyline and the river.',
     'url': None, 'fit': ['warm', 'cool', 'cold']},
    {'id': 'scotsmans', 'osm': 'node/4365625291', 'name': "Scotsman's Hill", 'kind': 'Viewpoint', 'area': 'Inglewood, Ramsay and Bridgeland', 'lat': 51.0365, 'lon': -114.04762, 'indoor': False,
     'what': 'The hillside in Ramsay that looks over Stampede Park to the downtown towers; a popular spot during Stampede fireworks.',
     'url': None, 'fit': ['warm', 'cool', 'cold']},
    {'id': 'cityhall', 'osm': 'way/37829977', 'name': 'Historic City Hall', 'kind': 'Historic building', 'area': 'Downtown', 'lat': 51.04607, 'lon': -114.05736, 'indoor': False,
     'what': 'The sandstone City Hall of 1911, a National Historic Site, beside the 1985 municipal building on Macleod Trail.',
     'url': None, 'fit': ['warm', 'cool', 'cold']},
    {'id': 'rileypark', 'osm': 'way/23647318', 'name': 'Riley Park', 'kind': 'Park', 'area': 'Kensington and Hillhurst', 'lat': 51.05954, 'lon': -114.08656, 'indoor': False,
     'what': 'A Hillhurst park with a wading pool in summer, a cricket pitch and gardens, a short walk from Kensington.',
     'url': None, 'fit': ['warm', 'cool']},
    {'id': 'memorialpark', 'osm': 'way/170774007', 'name': 'Central Memorial Park', 'kind': 'Park', 'area': 'Beltline and Stampede Park', 'lat': 51.04112, 'lon': -114.0699, 'indoor': False,
     'what': 'A Beltline park with formal gardens, war memorials and the 1912 Memorial Park Library, the city\'s first public library building.',
     'url': None, 'fit': ['warm', 'cool']},
]

# guide place name -> explore id (its photo, what it offers and its tips join the place)
GUIDE_MATCH = {'Calgary Tower': 'tower', 'Stephen Avenue': 'stephen', 'Central Library': 'library', 'Studio Bell, National Music Centre': 'studiobell',
               'Devonian Gardens': 'devonian', 'Chinatown': 'chinatown', 'Olympic Plaza (rebuilding)': 'olympicplaza', 'Stampede Park all year': 'stampede',
               'Peace Bridge': 'peace', 'Prince’s Island Park': 'princes', 'St. Patrick’s Island': 'stpatricks', 'Bow River pathway': 'pathways',
               'Edworthy Park and the Douglas Fir Trail': 'edworthy', 'Fish Creek Provincial Park': 'fishcreek', 'Nose Hill Park': 'nosehill',
               'Calgary Farmers’ Market': 'farmers', 'Kensington': 'kensington', 'Inglewood': 'inglewood', '17 Avenue SW': 'seventeenth',
               'Flames at the Saddledome': 'saddledome', 'Stampeders at McMahon Stadium': 'mcmahon', 'Werklund Centre': 'werklund'}

COLLECTIONS = [
    {'id': '24-hours', 'title': 'Calgary in 24 hours', 'blurb': 'The Tower and Stephen Avenue in the morning, East Village\'s library and music centre, the river and the Peace Bridge, then Kensington or 17 Avenue for dinner.',
     'places': ['tower', 'stephen', 'library', 'studiobell', 'princes', 'peace', 'kensington', 'seventeenth'], 'tip': 'CTrain rides on 7 Avenue downtown cost nothing, and everything here is within a 45-minute walk of the Tower.'},
    {'id': 'no-charge', 'title': 'The best things to do at no charge', 'blurb': 'Places that cost nothing to get into: parks, viewpoints, the library and the indoor garden.',
     'places': ['library', 'devonian', 'plus15', 'stephen', 'peace', 'princes', 'stpatricks', 'crescentheights', 'nosehill', 'fishcreek', 'birdsanctuary', 'bowness', 'chinatown', 'cityhall'],
     'tip': 'Entry costs nothing; activities inside some of them (rentals, programs) are not.'},
    {'id': 'first-visit', 'title': 'Calgary for first-time visitors', 'blurb': 'The landmarks most visitors want to see, across two or three days.',
     'places': ['tower', 'stephen', 'studiobell', 'zoo', 'heritage', 'peace', 'kensington', 'inglewood', 'stampede'], 'beyond': ['Banff (town)'],
     'tip': 'Add a day in Banff or Kananaskis: see Beyond Calgary.'},
    {'id': 'after-dark', 'title': 'Calgary after dark', 'blurb': 'Patios and restaurants, a game or a show, and the skyline at night.',
     'places': ['seventeenth', 'stephen', 'inglewood', 'kensington', 'tower', 'werklund', 'saddledome', 'mcmahon', 'crescentheights'],
     'tip': 'The Flames play October to April and the Stampeders June to November: check the teams\' schedules.'},
    {'id': 'family', 'title': 'A family weekend', 'blurb': 'Animals, science, a steam train and room to run.',
     'places': ['zoo', 'spark', 'heritage', 'calaway', 'bowness', 'devonian', 'library', 'winsport', 'stpatricks', 'farmers'],
     'tip': 'Children 12 and under ride Calgary Transit at no charge.'},
    {'id': 'scenic', 'title': 'Calgary\'s best views', 'blurb': 'Where locals go for the skyline, the river and the mountains on the horizon.',
     'places': ['tower', 'crescentheights', 'scotsmans', 'nosehill', 'peace', 'stpatricks', 'edworthy', 'glenmore'],
     'tip': 'The mountains show best on a clear morning; the skyline at blue hour, just after sunset.'},
    {'id': 'winter', 'title': 'Winter in Calgary', 'blurb': 'Skiing and skating inside the city, warm places to wander, and the walkways that let you skip the cold.',
     'places': ['winsport', 'oval', 'bowness', 'fishcreek', 'plus15', 'devonian', 'zoo', 'library', 'studiobell', 'spark', 'farmers', 'military'],
     'tip': 'Chinook winds can lift a January day above 10 °C; check the forecast and plan outdoor days around them.'},
    {'id': 'food', 'title': 'Food and coffee', 'blurb': 'The streets and markets where Calgary eats.',
     'places': ['farmers', 'kensington', 'inglewood', 'seventeenth', 'stephen', 'chinatown'],
     'tip': 'The Barley Belt\'s breweries are in Manchester and Inglewood: see the Eat guide.', 'guide': 'eat'},
    {'id': 'architecture', 'title': 'Architecture and the city', 'blurb': 'Sandstone from the 1890s to the library over the train.',
     'places': ['library', 'studiobell', 'peace', 'stephen', 'cityhall', 'plus15', 'tower', 'lougheed', 'contemporary'],
     'tip': 'Stephen Avenue\'s sandstone buildings date from after the 1886 fire, when the city rebuilt in stone.'},
    {'id': 'western', 'title': 'Western heritage', 'blurb': 'Where the city began, the Stampede, and the history beyond the city limits.',
     'places': ['stampede', 'heritage', 'confluence', 'lougheed', 'inglewood', 'spruce'], 'beyond': ['Blackfoot Crossing Historical Park', 'Head-Smashed-In Buffalo Jump', 'Cochrane'],
     'tip': 'The Stampede runs ten days each July; Stampede Park has events all year.'},
    {'id': 'indigenous', 'title': 'Indigenous culture', 'blurb': 'Treaty 7 land: places to learn from the Blackfoot Confederacy, the Tsuut\'ina and the Stoney Nakoda.',
     'places': ['confluence', 'stampede', 'glenbow'], 'beyond': ['Blackfoot Crossing Historical Park', 'Head-Smashed-In Buffalo Jump', 'Writing-on-Stone Provincial Park (Áísínai\'pi)'],
     'tip': 'Elbow River Camp at the Stampede is open during Stampede; Glenbow\'s Blackfoot Gallery opens with the museum.'},
    {'id': 'budget', 'title': 'Calgary on a budget', 'blurb': 'Places that cost nothing to enter, CTrain rides downtown at no charge, and markets for an inexpensive lunch.',
     'places': ['library', 'stephen', 'princes', 'peace', 'nosehill', 'fishcreek', 'bowness', 'farmers', 'kensington', 'chinatown'],
     'tip': 'A Calgary Transit day pass is $12.65 in 2026; CTrain rides on the 7 Avenue stretch downtown cost nothing.'},
]

BEYOND_SEASON = {  # what is plainly so about the season, from Parks Canada and the operators' own pages
    'Moraine Lake': 'Summer and early fall only: the road is closed to private vehicles; reach it by Parks Canada shuttle or a licensed bus.',
    'Lake Louise (lake)': 'All year: hiking and canoeing in summer, skating and skiing nearby in winter.',
    'Banff (town)': 'All year: a Parks Canada pass is needed to stop in the park.',
    'Kananaskis Village': 'All year: a Kananaskis Conservation Pass is needed to park.',
    'Forget-Me-Not Pond (Kananaskis)': 'Summer to fall: the Elbow valley road closes in winter beyond Elbow Falls (check Alberta Parks).',
    'Royal Tyrrell Museum (Drumheller)': 'All year (check the museum\'s hours).',
    'Waterton Lakes National Park (townsite)': 'Summer and fall for most services; the townsite is quiet in winter.',
}


def _hav(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    return 2 * 6371 * math.asin(math.sqrt(math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2))


def _guide_places():
    out = {}
    for g in VC.PAGES:
        for photo, name, where, offers, good, links in g['places']:
            pid = GUIDE_MATCH.get(name)
            if pid:
                out[pid] = {'guide': g['slug'], 'guide_title': g['title'], 'photo': photo, 'address': where, 'offers': offers,
                            'tips': good, 'links': [{'text': t, 'url': u} for t, u in links]}
    return out


def places(visit_data=None):
    """Every place in the city, with its profile."""
    vd = visit_data or {}
    top = {p['id']: p for p in (vd.get('top') or [])}
    gp = _guide_places()
    out = []
    for p in list(visit.TOP) + EXTRA:
        q = dict(p, **{k: v for k, v in (top.get(p['id']) or {}).items() if k in ('lat', 'lon', 'community', 'osm')})
        prof = EXPLORE.get(p['id'])
        if not prof or p.get('closed_until'):    # closed or being rebuilt: left out until the weekly check marks it open
            continue
        cats, ints, cost, mins, eve, fam, win = prof
        g = gp.get(p['id']) or {}
        out.append({'id': p['id'], 'name': p['name'], 'kind': p.get('kind'), 'area': p.get('area'), 'community': q.get('community'),
                    'lat': q['lat'], 'lon': q['lon'], 'what': p.get('what'), 'url': p.get('url'), 'fit': p.get('fit') or [],
                    'indoor': bool(p.get('indoor')), 'closed': p.get('closed_until'), 'categories': cats, 'interests': ints,
                    'cost': cost, 'minutes': mins, 'evening': eve, 'family': fam, 'winter': win,
                    'address': g.get('address'), 'offers': g.get('offers'), 'tips': g.get('tips') or [], 'links': g.get('links') or [],
                    'photo': g.get('photo'), 'guide': g.get('guide'), 'guide_title': g.get('guide_title'),
                    'osm': q.get('osm') or p.get('osm'), 'source': 'Calgary Insight, checked by hand' + (f' ({visit_data.get("checked") or CHECKED})' if visit_data else f' ({CHECKED})')})
    return out


def stations(path):
    try:
        with open(path, encoding='utf-8') as f:
            d = json.load(f)
    except (OSError, ValueError):
        return []
    seen, out = set(), []
    for e in d.get('elements') or []:
        n = ((e.get('tags') or {}).get('name') or '').strip()
        if n and n not in seen:
            seen.add(n)
            out.append({'name': n, 'lat': round(e['lat'], 5), 'lon': round(e['lon'], 5)})
    return out


def neighbourhoods(pl, st):
    out = []
    for label, about, _ in visit.AREAS:
        ps = [p for p in pl if p['area'] == label]
        if not ps:
            continue
        near = sorted({s['name'] for s in st for p in ps if _hav((p['lat'], p['lon']), (s['lat'], s['lon'])) <= 0.8})
        # time to give the district: its places' suggested times, leaving out game and show venues (an evening of their own)
        mins = sum(p['minutes'] for p in ps if not p['closed'] and p['kind'] not in ('Arena', 'Stadium', 'Performing arts', 'Sports venue'))
        out.append({'area': label, 'about': about, 'places': [p['id'] for p in ps], 'ctrain': near,
                    'centre': [round(sum(p['lat'] for p in ps) / len(ps), 5), round(sum(p['lon'] for p in ps) / len(ps), 5)],
                    'time': 'Half a day' if mins <= 240 else 'A full day' if mins <= 540 else 'A day or two',
                    'free': sum(1 for p in ps if p['cost'] == 'free'), 'evening': sum(1 for p in ps if p['evening'])})
    return out


def beyond(research):
    a = (research or {}).get('around_calgary') or {}
    coords = {}
    for t in visit.DAY_TRIPS:
        coords[t['name']] = t
    out = []
    for p in a.get('places') or []:
        out.append({**p, 'season': BEYOND_SEASON.get(p['place']), 'outside_calgary': True})
    return {'places': out, 'rings': a.get('rings'), 'unesco': a.get('unesco'), 'route_source': a.get('route_source'),
            'about': a.get('about'), 'banff_note': ((a.get('banff_cannot_grow_beds') or {}).get('what')),
            'day_trips': [{'name': t['name'], 'km': t['km'], 'what': t['what'], 'url': t['url']} for t in visit.DAY_TRIPS]}


# coordinates of the places beyond the city (the drive times' end points, OpenStreetMap)
BEYOND_LL = {'Cochrane': (51.1890, -114.4670), 'Big Hill Springs Provincial Park': (51.2490, -114.3860), 'Bragg Creek': (50.9476, -114.5705),
             'Okotoks Big Rock erratic': (50.7040, -114.1490), 'Forget-Me-Not Pond (Kananaskis)': (50.7962, -114.8063), 'Kananaskis Village': (50.9300, -115.1530),
             'Canmore': (51.0884, -115.3479), 'Horseshoe Canyon (Drumheller)': (51.4200, -112.8700), 'Blackfoot Crossing Historical Park': (50.7680, -112.8880),
             'Banff (town)': (51.1784, -115.5708), 'Peter Lougheed Provincial Park': (50.6900, -115.1200), 'Royal Tyrrell Museum (Drumheller)': (51.4790, -112.7900),
             'Head-Smashed-In Buffalo Jump': (49.7484, -113.6255), 'Lake Louise (lake)': (51.4167, -116.2156), 'Moraine Lake': (51.3217, -116.1860),
             'Yoho National Park (Field, BC)': (51.3955, -116.4910), 'Waterton Lakes National Park (townsite)': (49.0517, -113.9136),
             'Dinosaur Provincial Park': (50.7540, -111.5070), 'Glacier National Park, Montana (St. Mary)': (48.7470, -113.4400),
             'Kootenay National Park (Radium gate, BC)': (50.6205, -116.0710), 'Columbia Icefield Centre': (52.2196, -117.2235),
             'Writing-on-Stone Provincial Park (Áísínai\'pi)': (49.0830, -111.6230), 'Jasper (town)': (52.8737, -118.0814)}


def build(out_dir, visit_data=None, research=None):
    """Write visit/explore/data/calgary.json. Returns the file's path."""
    if research is None:
        try:
            with open(os.path.join(ROOT, 'data', 'tourism_research.json'), encoding='utf-8') as f:
                research = json.load(f)
        except (OSError, ValueError):
            research = {}
    pl = places(visit_data)
    st = stations(os.path.join(ROOT, 'data', 'explore_ctrain.json'))
    by = beyond(research)
    for p in by['places']:
        ll = BEYOND_LL.get(p['place'])
        if ll:
            p['lat'], p['lon'] = ll
    ids = {p['id'] for p in pl}
    cols = []
    for c in COLLECTIONS:
        bad = [i for i in c['places'] if i not in EXPLORE]
        if bad:
            raise ValueError(f'collection {c["id"]} names unknown places {bad}')
        cols.append(dict(c, places=[i for i in c['places'] if i in ids]))     # a closed place drops out
    vd = visit_data or {}
    months = vd.get('months') or [{'n': n, 'name': name, 'about': about, 'events': [{'name': a, 'what': b, 'url': c} for a, b, c in evs]}
                                  for n, name, about, evs in visit.MONTHS]
    credits = {}
    try:
        with open(os.path.join(HERE, 'visit', 'img', 'credits.json'), encoding='utf-8') as f:
            credits = json.load(f)
    except (OSError, ValueError):
        pass
    d = {'city': {'id': 'calgary', 'name': 'Calgary', 'province': 'Alberta', 'centre': [51.0447, -114.0719], 'zoom': 12,
                  'timezone': 'America/Edmonton'},
         'checked': (vd.get('checked') or CHECKED), 'built': vd.get('built_at'),
         'categories': [{'id': a, 'label': b} for a, b in CATEGORIES], 'interests': INTERESTS,
         'places': pl, 'collections': cols, 'neighbourhoods': neighbourhoods(pl, st), 'stations': st,
         'months': months, 'beyond': by, 'getting_around': [{'title': a, 'what': b, 'url': c} for a, b, c in visit.GETTING_AROUND],
         'photo_credits': {k: v for k, v in credits.items() if any(p.get('photo') == k for p in pl)},
         'sources': [{'name': 'Places checked by hand by Calgary Insight', 'what': 'descriptions, official links, the weather each suits'},
                     {'name': 'OpenStreetMap contributors (ODbL)', 'what': 'positions of places and CTrain stations; drive times (OSRM)', 'url': 'https://www.openstreetmap.org/copyright'},
                     {'name': 'Wikimedia Commons', 'what': 'photos, each with its credit and licence'},
                     {'name': 'Events', 'what': 'annual events by the month they are usually held, with the organisers\' pages; dates are the organisers\' to confirm'}],
         'disclaimer': 'Explore Calgary is an independent Calgary Insight product. It is not operated, endorsed or sponsored by Tourism Calgary, the City of Calgary or any business listed. Opening hours, prices and dates change: check the official page before you go.'}
    path = os.path.join(out_dir, 'data', 'calgary.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    return path


if __name__ == '__main__':
    vd = None
    if len(sys.argv) > 2:
        with open(sys.argv[2], encoding='utf-8') as f:
            vd = json.load(f)
    print(build(sys.argv[1], vd))
