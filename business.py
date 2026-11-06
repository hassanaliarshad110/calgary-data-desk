"""Invest in Calgary: every business we can find in Calgary, grouped, by community.

Two open sources, kept apart so every figure can be traced:
  - the City of Calgary's business licences (open data vdjc-pybd): every business that needs a City licence, with its
    licence types, community, address, location and the date it was first licensed;
  - OpenStreetMap (Overpass): shops, restaurants, clinics, banks, gyms and other places mapped by volunteers, which
    covers kinds of business the City no longer licenses (most retail shops, clinics, offices).
Each business is put in one category. A community's count in a category is the larger of the two sources (they
overlap, so adding them would count the same shop twice). Home-based licences are in the list but not in the
storefront counts. The website build writes data/business.json; the page works out the underserved index from it with
the residents counted the way chosen in Settings.

    python business.py OUT.json
"""
import datetime as dt
import json
import os
import sys
import time
import urllib.parse
import urllib.request

import calgary_data as cd
import geo

LICENCES = 'vdjc-pybd'
COMMUNITIES = 'surr-xmvs'
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
BBOX = (50.84, -114.32, 51.22, -113.85)

# key, label, group, local (neighbourhood demand: in the underserved index), licence types (start of the text), OSM tags
CATEGORIES = [
    ('grocery', 'Grocery stores and supermarkets', 'Food and drink', True, [], ['shop=supermarket', 'shop=greengrocer', 'shop=butcher', 'shop=deli', 'shop=grocery', 'shop=international', 'shop=health_food', 'shop=frozen_food']),
    ('convenience', 'Convenience stores', 'Food and drink', True, [], ['shop=convenience', 'shop=kiosk']),
    ('restaurant', 'Restaurants and cafés (sit-down)', 'Food and drink', True, ['FOOD SERVICE - PREMISES (SEATING)', 'ALCOHOL BEVERAGE SALES (RESTAURANT)'], ['amenity=restaurant', 'amenity=cafe', 'amenity=ice_cream', 'amenity=food_court']),
    ('takeout', 'Take-out and fast food', 'Food and drink', True, ['FOOD SERVICE - PREMISES (NO SEATING)'], ['amenity=fast_food']),
    ('bakery', 'Bakeries and specialty food', 'Food and drink', True, [], ['shop=bakery', 'shop=pastry', 'shop=confectionery', 'shop=coffee', 'shop=tea', 'shop=cheese', 'shop=seafood', 'shop=spices', 'shop=chocolate']),
    ('bar', 'Bars, pubs and lounges', 'Food and drink', True, ['ALCOHOL BEVERAGE SALES (DRINKING', 'ALCOHOL BEVERAGE SALES (LOUNGE'], ['amenity=bar', 'amenity=pub', 'amenity=nightclub', 'amenity=biergarten']),
    ('liquor', 'Liquor stores', 'Food and drink', True, ['LIQUOR STORE'], ['shop=alcohol', 'shop=wine', 'shop=beverages']),
    ('pharmacy', 'Pharmacies', 'Health', True, [], ['amenity=pharmacy', 'shop=chemist', 'healthcare=pharmacy']),
    ('clinic', 'Medical clinics and doctors', 'Health', True, [], ['amenity=doctors', 'amenity=clinic', 'healthcare=doctor', 'healthcare=clinic', 'healthcare=centre']),
    ('dental', 'Dentists', 'Health', True, [], ['amenity=dentist', 'healthcare=dentist']),
    ('therapy', 'Physiotherapy, massage and wellness', 'Health', True, ['MASSAGE CENTRE'], ['healthcare=physiotherapist', 'shop=massage', 'healthcare=alternative', 'healthcare=optometrist', 'shop=optician', 'healthcare=psychotherapist']),
    ('hair', 'Hair, beauty, nails and barbers', 'Personal services', True, ['PERSONAL SERVICE (INDEPENDENT', 'PERSONAL SERVICE (MICROBLADING', 'PERSONAL SERVICE', 'PERSONAL SERVICE (TATTOO', 'PERSONAL SERVICE (PIERCING'], ['shop=hairdresser', 'shop=beauty', 'shop=cosmetics', 'shop=tattoo', 'shop=hairdresser_supply']),
    ('fitness', 'Gyms and fitness studios', 'Personal services', True, ['PERSONAL SERVICE (FITNESS'], ['leisure=fitness_centre', 'leisure=sports_centre', 'sport=yoga']),
    ('childcare', 'Child care and early learning', 'Personal services', True, [], ['amenity=childcare', 'amenity=kindergarten']),
    ('laundry', 'Laundromats and dry cleaners', 'Personal services', True, ['FABRIC CLEANING'], ['shop=laundry', 'shop=dry_cleaning']),
    ('pets', 'Pet stores, groomers and vets', 'Personal services', True, ['KENNEL SERVICE/PET DEALER'], ['shop=pet', 'shop=pet_grooming', 'amenity=veterinary', 'amenity=animal_boarding']),
    ('bank', 'Banks and credit unions', 'Finance', True, [], ['amenity=bank', 'amenity=bureau_de_change', 'amenity=money_transfer']),
    ('fuel', 'Gas stations and car washes', 'Automotive', True, ['FUEL SALES/STORAGE'], ['amenity=fuel', 'amenity=car_wash']),
    ('auto_repair', 'Auto repair and body shops', 'Automotive', False, ['MOTOR VEHICLE REPAIR', 'AUTO BODY SHOP'], ['shop=car_repair', 'shop=tyres', 'shop=car_parts']),
    ('cannabis', 'Cannabis stores', 'Retail', False, ['CANNABIS STORE'], ['shop=cannabis']),
    ('tobacco', 'Tobacco and vape shops', 'Retail', False, ['VAPE RETAILER', 'TOBACCO RETAILER'], ['shop=tobacco', 'shop=e-cigarette']),
    ('hardware', 'Hardware, garden and home improvement', 'Retail', True, [], ['shop=hardware', 'shop=doityourself', 'shop=garden_centre', 'shop=paint', 'shop=trade', 'shop=building_materials']),
    ('clothing', 'Clothing, shoes and accessories', 'Retail', False, [], ['shop=clothes', 'shop=shoes', 'shop=jewelry', 'shop=bag', 'shop=boutique', 'shop=fashion_accessories', 'shop=tailor']),
    ('home', 'Furniture, electronics and home goods', 'Retail', False, [], ['shop=furniture', 'shop=electronics', 'shop=mobile_phone', 'shop=computer', 'shop=appliance', 'shop=houseware', 'shop=interior_decoration', 'shop=bed', 'shop=kitchen', 'shop=lighting', 'shop=flooring', 'shop=carpet']),
    ('general_retail', 'Other shops', 'Retail', False, ['RETAIL DEALER - PREMISES', 'SECONDHAND DEALER', 'MARKET'], ['shop=*']),
    ('car_sales', 'Car and vehicle dealers', 'Automotive', False, ['MOTOR VEHICLE DEALER'], ['shop=car', 'shop=motorcycle']),
    ('entertainment', 'Entertainment and recreation', 'Leisure', False, ['ENTERTAINMENT ESTABLISHMENT', 'AMUSEMENT ARCADE'], ['amenity=cinema', 'amenity=theatre', 'leisure=bowling_alley', 'leisure=amusement_arcade', 'leisure=escape_game', 'amenity=casino']),
    ('lodging', 'Hotels and lodging', 'Leisure', False, ['HOTEL/MOTEL', 'LODGING HOUSE'], ['tourism=hotel', 'tourism=motel', 'tourism=guest_house', 'tourism=hostel']),
    ('school', 'Private schools and tutoring', 'Education', False, ['SCHOOL'], ['amenity=driving_school', 'amenity=language_school', 'amenity=music_school', 'amenity=prep_school']),
    ('trades', 'Contractors and trades', 'Business to business', False, ['CONTRACTOR', 'CLEANING SERVICE', 'ALARM AGENCY', 'SECURITY'], []),
    ('industrial', 'Manufacturing, wholesale and warehousing', 'Business to business', False, ['MANUFACTURER', 'WHOLESALER', 'WAREHOUSING', 'DISTRIBUTION MANAGER', 'ALCOHOL BEVERAGE MANUFACTURER', 'CANNABIS FACILITY', 'SALVAGE', 'CONTAINER DEPOT', 'FURNITURE REFINISHING'], []),
    ('rental', 'Apartment building operators', 'Property', False, ['APARTMENT BUILDING OPERATOR'], []),
    ('other', 'Other licensed businesses', 'Other', False, [], []),
]
CAT = {c[0]: c for c in CATEGORIES}
# licence types that are only extras on another licence (a patio on a restaurant)
SECONDARY = ('OUTDOOR PATIO', 'ALCOHOL BEVERAGE SALES (ACCESSORY)', 'FOOD SERVICE - PREMISES')


PREFIXES = sorted(((p, key) for key, _, _, _, lic, _ in CATEGORIES for p in lic), key=lambda x: -len(x[0]))


def lic_category(types):
    """The category of a licence: its main licence type matched to the longest listed beginning ("PERSONAL SERVICE
    (FITNESS" before "PERSONAL SERVICE"); patios and alcohol-on-the-side are extras, not the business."""
    ts = [t.strip() for t in (types or '').replace('\r', '').split(',\n') if t.strip()]
    main = [t for t in ts if t not in SECONDARY] or ts
    for t in main:
        for p, key in PREFIXES:
            if t.startswith(p):
                return key, ts
    if any(t.startswith('FOOD SERVICE') for t in ts):
        return ('restaurant' if any('SEATING' in t and 'NO SEATING' not in t for t in ts) else 'takeout'), ts
    return 'other', ts


def osm_category(tags):
    for key, _, _, _, _, osm in CATEGORIES:
        for kv in osm:
            k, v = kv.split('=')
            if v == '*' and k in tags:
                return key
            if tags.get(k) == v:
                return key
    return None


def fetch_licences():
    return cd.query(LICENCES, select='getbusid,tradename,homeoccind,address,comdistcd,comdistnm,licencetypes,'
                                     'first_iss_dt,exp_dt,jobstatusdesc,point', order='getbusid', limit=50000,
                    where="jobstatusdesc != 'Close in Progress'")


def fetch_osm():
    s, w, n, e = BBOX
    q = (f'[out:json][timeout:240];(nwr["shop"]({s},{w},{n},{e});'
         f'nwr["amenity"~"^(restaurant|cafe|fast_food|ice_cream|food_court|bar|pub|nightclub|biergarten|pharmacy|doctors|clinic|'
         f'dentist|childcare|kindergarten|veterinary|animal_boarding|bank|bureau_de_change|money_transfer|fuel|car_wash|cinema|'
         f'theatre|casino|driving_school|language_school|music_school|prep_school)$"]({s},{w},{n},{e});'
         f'nwr["leisure"~"^(fitness_centre|sports_centre|bowling_alley|amusement_arcade|escape_game)$"]({s},{w},{n},{e});'
         f'nwr["healthcare"]({s},{w},{n},{e});nwr["tourism"~"^(hotel|motel|guest_house|hostel)$"]({s},{w},{n},{e}););out center tags;')
    last = None
    for url in OVERPASS:
        for _ in range(2):
            try:
                req = urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(),
                                             headers={'User-Agent': 'CalgaryDataDesk/1.0 (civic data dashboard)'})
                with urllib.request.urlopen(req, timeout=300) as r:
                    return json.loads(r.read().decode('utf-8')).get('elements') or []
            except Exception as ex:                      # noqa: BLE001
                last = ex
                time.sleep(20)
    raise RuntimeError(f'OpenStreetMap could not be read: {last}')


def build(today=None):
    today = today or dt.date.today()
    shapes = cd.query(COMMUNITIES, select='comm_code,name,class,multipolygon', limit=5000)
    polys = {r['comm_code']: r['multipolygon'] for r in shapes if r.get('comm_code') and r.get('multipolygon')}
    names = {r['comm_code']: (r.get('name') or '').title() for r in shapes if r.get('comm_code')}
    loc = geo.Locator(polys)
    comm = {c: {'name': names.get(c), 'centre': [round(x, 5) for x in geo.centre(p)], 'lic': {}, 'osm': {}, 'home': 0,
                'new12': 0, 'new_prev': 0} for c, p in polys.items()}
    y12 = (today - dt.timedelta(days=365)).isoformat()
    y24 = (today - dt.timedelta(days=730)).isoformat()
    rows = []
    months = {}
    for r in fetch_licences():
        cat, ts = lic_category(r.get('licencetypes'))
        c = r.get('comdistcd')
        pt = (r.get('point') or {}).get('coordinates') or [None, None]
        first = (r.get('first_iss_dt') or '')[:10]
        home = r.get('homeoccind') == 'Y'
        rows.append([(r.get('tradename') or '').strip(), cat, '; '.join(t.title() for t in ts)[:120], c, (r.get('address') or '').strip(),
                     first[:7], r.get('jobstatusdesc'), round(pt[0], 5) if pt[0] else None, round(pt[1], 5) if pt[1] else None,
                     'H' if home else 'L'])
        if first[:7]:
            months.setdefault(first[:7], {}).setdefault(CAT[cat][2], 0)
            months[first[:7]][CAT[cat][2]] += 1
        if c in comm:
            if home:
                comm[c]['home'] += 1
            else:
                comm[c]['lic'][cat] = comm[c]['lic'].get(cat, 0) + 1
            if first >= y12:
                comm[c]['new12'] += 1
            elif first >= y24:
                comm[c]['new_prev'] += 1
    n_osm = 0
    for el in fetch_osm():
        tags = el.get('tags') or {}
        cat = osm_category(tags)
        if not cat:
            continue
        lat, lon = (el.get('lat'), el.get('lon')) if el.get('type') == 'node' else ((el.get('center') or {}).get('lat'), (el.get('center') or {}).get('lon'))
        c = loc.find(lon, lat)
        if not c:
            continue
        n_osm += 1
        comm[c]['osm'][cat] = comm[c]['osm'].get(cat, 0) + 1
        nm = tags.get('name') or tags.get('brand')
        if nm:
            addr = ' '.join(x for x in (tags.get('addr:housenumber'), tags.get('addr:street')) if x)
            rows.append([nm, cat, (tags.get('shop') or tags.get('amenity') or tags.get('leisure') or tags.get('healthcare') or tags.get('tourism') or '').replace('_', ' '),
                         c, addr, '', 'Mapped', round(lon, 5), round(lat, 5), 'O'])
    for c, x in comm.items():
        x['count'] = {k: max(x['lic'].get(k, 0), x['osm'].get(k, 0)) for k in set(x['lic']) | set(x['osm'])}
    trend = sorted(months.items())[-60:]
    return {'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'today': today.isoformat(),
            'categories': [{'key': k, 'label': l, 'group': g, 'local': loc_} for k, l, g, loc_, _, _ in CATEGORIES],
            'communities': {c: x for c, x in comm.items() if x['lic'] or x['osm'] or x['home']},
            'centres': {c: x['centre'] for c, x in comm.items()},
            'names': names,
            'trend': [[m, v] for m, v in trend],
            'columns': ['name', 'category', 'type', 'community', 'address', 'first_licensed', 'status', 'lon', 'lat', 'source'],
            'businesses': rows,
            'totals': {'licences': sum(1 for r in rows if r[9] in ('L', 'H')), 'home_based': sum(1 for r in rows if r[9] == 'H'),
                       'osm_places': n_osm, 'osm_named': sum(1 for r in rows if r[9] == 'O')},
            'sources': [{'title': 'Business licences', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + LICENCES},
                        {'title': 'Shops, restaurants, clinics and other places', 'publisher': 'OpenStreetMap contributors (ODbL)', 'url': 'https://www.openstreetmap.org/copyright'},
                        {'title': 'Community boundaries', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + COMMUNITIES}]}


def load(data_dir=None, can_build=False):
    """The website's copy (data/business.json next to this file) or the desktop app's in data_dir (built when a week old)."""
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'business.json')
    mine = os.path.join(data_dir, 'business.json') if data_dir else None
    for p in [here, mine]:
        if p and os.path.exists(p) and (p == here or not can_build or time.time() - os.path.getmtime(p) < 7 * 86400):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    if not (can_build and data_dir):
        return None
    d = build()
    with open(mine, 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    return d


def summary(d, community=None, category=None, find=None, limit=40):
    """For the Business Economist: categories by community, the newest licences and matching businesses."""
    if not d:
        return {'error': 'The business list is not on this computer yet.'}
    cats = {c['key']: c for c in d['categories']}
    out = {'categories': d['categories'], 'totals': d['totals'], 'built_at': d['built_at'], 'sources': d['sources'],
           'how': 'count = the larger of City licences and OpenStreetMap places in the category (they overlap); home-based '
                  'licences are not storefronts. Underserved: compare businesses per 10,000 residents within reach with '
                  'Calgary\'s rate (the page works it out with residents from Settings).'}
    if community:
        w = community.strip().lower()
        code = next((c for c, n in d['names'].items() if c.lower() == w or (n or '').lower() == w), None)
        if code and code in d['communities']:
            out['community'] = dict(d['communities'][code], code=code, name=d['names'].get(code))
    if category:
        k = next((c for c in cats if c == category or cats[c]['label'].lower().startswith(category.lower())), None)
        if k:
            out['by_community'] = sorted([[d['names'].get(c), x['count'].get(k, 0)] for c, x in d['communities'].items()],
                                         key=lambda r: -r[1])[:80]
    if find:
        w = find.lower()
        out['matches'] = [r for r in d['businesses'] if w in (r[0] or '').lower() or w in (r[2] or '').lower()][:limit]
    return out


if __name__ == '__main__':
    d = build()
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    print(d['totals'], len(d['communities']), 'communities', os.path.getsize(sys.argv[1]) // 1000, 'KB')
