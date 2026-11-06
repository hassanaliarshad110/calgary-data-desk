"""Invest in Calgary: every business we can find in Calgary, grouped, by community.

Two open sources, kept apart so every figure can be traced:
  - the City of Calgary's business licences (open data vdjc-pybd): every business that needs a City licence, with its
    licence types, community, address, location and the date it was first licensed;
  - OpenStreetMap (Overpass): shops, restaurants, clinics, banks, gyms and other places mapped by volunteers, which
    covers kinds of business the City no longer licenses (most retail shops, clinics, offices).
Each business is put in one category. A mapped place that is the same business as a licence (same name within 80 m,
or an unnamed place of the same kind within 25 m) is counted once, as the licence (source 'B': in both); a community's
count adds the licences and the mapped places left. Home-based licences are in the list but not in the
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
                     'H' if home else 'L', None, None])
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
        nm = tags.get('name') or tags.get('brand') or ''
        addr = ' '.join(x for x in (tags.get('addr:housenumber'), tags.get('addr:street')) if x)
        rows.append([nm, cat, (tags.get('shop') or tags.get('amenity') or tags.get('leisure') or tags.get('healthcare') or tags.get('tourism') or '').replace('_', ' '),
                     c, addr, '', 'Mapped', round(lon, 5), round(lat, 5), 'O', tags.get('website') or tags.get('contact:website'),
                     tags.get('phone') or tags.get('contact:phone')])
    n_ov, ov_error = 0, None
    try:                            # Overture Maps: names, websites and phone numbers for many more places
        for p in fetch_overture():
            c = loc.find(p['lon'], p['lat'])
            if not c:
                continue
            n_ov += 1
            rows.append([p['name'], p['cat'], p['type'], c, p['addr'], '', 'Mapped', round(p['lon'], 5), round(p['lat'], 5), 'V', p['web'], p['phone']])
    except Exception as ex:         # noqa: BLE001 - the licences and OpenStreetMap still stand
        ov_error = str(ex)[:200]
    # the same business in both sources is counted once: the licence keeps it (source 'B'), the mapped copy goes
    rows, matched = dedupe(rows)
    for x in comm.values():
        x['lic'], x['osm'] = {}, {}
    for r in rows:
        c = comm.get(r[3])
        if c is None or r[9] == 'H':
            continue
        side = 'lic' if 'L' in r[9] else 'osm'
        c[side][r[1]] = c[side].get(r[1], 0) + 1
    for c, x in comm.items():
        x['count'] = {k: x['lic'].get(k, 0) + x['osm'].get(k, 0) for k in set(x['lic']) | set(x['osm'])}
    trend = sorted(months.items())[-60:]
    return {'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'today': today.isoformat(),
            'categories': [{'key': k, 'label': l, 'group': g, 'local': loc_} for k, l, g, loc_, _, _ in CATEGORIES],
            'communities': {c: x for c, x in comm.items() if x['lic'] or x['osm'] or x['home']},
            'centres': {c: x['centre'] for c, x in comm.items()},
            'names': names,
            'trend': [[m, v] for m, v in trend],
            'columns': ['name', 'category', 'type', 'community', 'address', 'first_licensed', 'status', 'lon', 'lat', 'source', 'website', 'phone'],
            'businesses': rows,
            'totals': {'licences': sum(1 for r in rows if 'L' in r[9] or r[9] == 'H'), 'home_based': sum(1 for r in rows if r[9] == 'H'),
                       'osm_places': n_osm, 'osm_named': sum(1 for r in rows if r[9] == 'O' and r[0]),
                       'overture_places': n_ov, 'overture_error': ov_error,
                       'in_both': sum(1 for r in rows if len(r[9]) > 1), 'matched': matched,
                       'unique': sum(1 for r in rows if r[9] != 'H')},
            'sources': [{'title': 'Business licences', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + LICENCES},
                        {'title': 'Shops, restaurants, clinics and other places', 'publisher': 'OpenStreetMap contributors (ODbL)', 'url': 'https://www.openstreetmap.org/copyright'},
                        {'title': 'Places (names, websites, phone numbers)', 'publisher': 'Overture Maps Foundation (CDLA Permissive 2.0)', 'url': 'https://docs.overturemaps.org/attribution/'},
                        {'title': 'Community boundaries', 'publisher': 'City of Calgary open data', 'url': 'https://data.calgary.ca/d/' + COMMUNITIES}]}


# ------------------------------------------------------------------ Overture Maps places (open data, CDLA Permissive 2.0)
# Overture's detailed category (taxonomy.primary) to ours; anything else (offices, real estate, parks, churches) is left out
OV_CAT = {}
for _key, _names in {
    'grocery': 'grocery_store supermarket specialty_foods_store health_food_store butcher_shop delicatessen farmers_market '
               'international_grocery_store asian_grocery_store fruit_and_vegetable_store meat_shop seafood_market '
               'warehouse_club_store food_and_beverage_store organic_grocery_store',
    'convenience': 'convenience_store',
    'restaurant': 'restaurant diner steakhouse cafe coffee_shop bubble_tea_shop smoothie_juice_bar ice_cream_shop '
                  'dessert_shop tea_room buffet_restaurant bistro food_court',
    'takeout': 'fast_food_restaurant sandwich_shop pizza_restaurant food_truck_stand chicken_wings_restaurant',
    'bakery': 'bakery chocolatier candy_store cupcake_shop donut_shop',
    'bar': 'bar pub sports_bar cocktail_bar lounge dance_club brewery gastropub wine_bar beer_bar',
    'liquor': 'liquor_store beer_wine_spirits_store wine_store',
    'pharmacy': 'pharmacy drugstore',
    'clinic': 'doctors_office family_practice walk_in_clinic medical_center outpatient_care_facility urgent_care_clinic '
              'pediatric_clinic primary_care_or_general_clinic dermatology',
    'dental': 'dental_clinic general_dentistry orthodontics pediatric_dentistry dentist cosmetic_dentistry endodontics',
    'therapy': 'massage_therapy physical_therapy chiropractic acupuncture naturopathic_medicine optometry audiology '
               'eyewear_store',
    'hair': 'hair_salon barber beauty_salon nail_salon spa day_spa medical_spa skin_care_and_makeup tanning_salon '
            'laser_hair_removal hair_removal tattoo_and_piercing eyelash_service',
    'fitness': 'gym yoga_studio pilates_studio martial_arts_club dance_studio sport_or_fitness_facility boxing_gym '
               'cycling_studio',
    'childcare': 'day_care_preschool child_care_and_day_care preschool',
    'laundry': 'laundromat dry_cleaning laundry_service',
    'pets': 'pet_store veterinarian pet_groomer pet_boarding animal_hospital',
    'bank': 'bank credit_union bank_or_credit_union money_transfer_service',
    'fuel': 'gas_station car_wash',
    'auto_repair': 'automotive_repair auto_body_shop tire_dealer_and_repair tire_shop oil_change_station auto_glass_service '
                   'auto_parts_store truck_repair automotive_service',
    'cannabis': 'cannabis_dispensary',
    'tobacco': 'smoke_and_vape_store tobacco_shop vape_shop',
    'hardware': 'hardware_store building_supply_store home_improvement_store nursery_and_gardening_store paint_store',
    'clothing': 'clothing_store womens_clothing_store mens_clothing_store childrens_clothing_store shoe_store jewelry_store '
                'fashion_boutique fashion_accessories_store bridal_shop lingerie_store second_hand_clothing_store '
                'sewing_and_alterations',
    'home': 'furniture_store electronics_store mobile_phone_store appliance_store home_goods_store home_decor_store '
            'mattress_store carpet_store lighting_store linen_store computer_store',
    'general_retail': 'discount_store department_store gift_shop flowers_and_gifts_store florist bookstore toy_store '
                      'sporting_goods_store arts_crafts_and_hobby_store hobby_shop second_hand_store beauty_supply_store '
                      'cosmetics_and_fragrance_store party_supply_store office_supply_store musical_instrument_store '
                      'bike_store outdoor_store video_game_store camera_and_photography_store vitamin_and_supplement_store '
                      'medical_supply_store antique_store music_and_dvd_store fabric_store',
    'car_sales': 'auto_dealer used_auto_dealer motorcycle_dealer recreational_vehicle_dealer',
    'entertainment': 'movie_theater theatre_venue bowling_alley arcade escape_room music_venue karaoke billiards',
    'lodging': 'hotel motel lodging bed_and_breakfast hostel inn',
    'school': 'tutoring_service driving_school language_school music_school art_school private_school specialty_school',
    'trades': 'contractor plumbing electrician hvac_service roofing painting landscaping carpenter masonry_concrete '
              'flooring_contractor home_cleaning cleaning_service janitorial_service handyman pest_control_service '
              'garage_door_service windows_installation countertop_installation',
    'industrial': 'manufacturer industrial_equipment_manufacturer metal_fabricator machine_shop wholesaler '
                  'food_beverage_distributor distribution_service supplier_or_distributor',
}.items():
    for _n in _names.split():
        OV_CAT[_n] = _key
OV_MIN_CONFIDENCE = 0.6


def ov_category(primary, hierarchy=None):
    if primary in OV_CAT:
        return OV_CAT[primary]
    if primary and primary.endswith('_restaurant'):
        return 'restaurant'
    for h in reversed(hierarchy or []):
        if h in OV_CAT:
            return OV_CAT[h]
    return None


def fetch_overture():
    """Overture Maps places in Calgary's box, open now and confident enough. Needs the overturemaps package."""
    import struct                                   # noqa: PLC0415
    from overturemaps import core                   # noqa: PLC0415 - the website build only
    s_, w_, n_, e_ = BBOX
    out = []
    for batch in core.record_batch_reader('place', (w_, s_, e_, n_)):
        for r in batch.to_pylist():
            if (r.get('confidence') or 0) < OV_MIN_CONFIDENCE or (r.get('operating_status') or 'open') != 'open':
                continue
            tx = r.get('taxonomy') or {}
            cat = ov_category(tx.get('primary'), tx.get('hierarchy'))
            g = r.get('geometry')
            if not cat or not isinstance(g, (bytes, bytearray)) or len(g) < 21:
                continue
            lon, lat = struct.unpack(('<' if g[0] == 1 else '>') + 'dd', g[5:21])
            ad = (r.get('addresses') or [{}])[0] or {}
            out.append({'name': (r.get('names') or {}).get('primary') or '', 'cat': cat, 'type': (tx.get('primary') or '').replace('_', ' '),
                        'lon': lon, 'lat': lat, 'addr': ad.get('freeform') or '', 'web': ((r.get('websites') or [None])[0] or '').split('?')[0][:120] or None,
                        'phone': (r.get('phones') or [None])[0]})
    return out


# ------------------------------------------------------------------ one business, counted once
_STOP = {'the', 'inc', 'ltd', 'ltee', 'corp', 'corporation', 'co', 'company', 'and', 'of', 'calgary', 'yyc', 'store',
         'shop', 'restaurant', 'cafe', 'ab', 'alberta', 'canada', 'limited', 'llp', 'lp', 'enterprises', 'services'}


def _tokens(name):
    import re                                       # noqa: PLC0415
    t = re.sub(r"[^a-z0-9 ]+", ' ', (name or '').lower().replace('&', ' and ').replace("'", ''))
    return {w for w in t.split() if w not in _STOP and not w.isdigit() and len(w) > 1}


def same_name(a, b):
    """Two names for the same business: most words shared, or one name's words all inside the other's."""
    ta, tb = _tokens(a), _tokens(b)
    if not ta or not tb:
        return False
    common = ta & tb
    if not common or max(len(w) for w in common) < 3:
        return False
    return len(common) / len(ta | tb) >= 0.5 or ta <= tb or tb <= ta


def _addr(a):
    import re                                       # noqa: PLC0415
    a = re.sub(r'[^a-z0-9 ]+', ' ', (a or '').lower())
    a = re.sub(r'\b(street|st)\b', 'st', a); a = re.sub(r'\b(avenue|ave|av)\b', 'av', a)
    a = re.sub(r'\b(road|rd)\b', 'rd', a); a = re.sub(r'\b(drive|dr)\b', 'dr', a)
    a = re.sub(r'\b(boulevard|blvd)\b', 'blvd', a); a = re.sub(r'\b(trail|tr)\b', 'tr', a)
    a = re.sub(r'\b(calgary|alberta|ab|canada)\b', ' ', a); a = re.sub(r'\bt\d[a-z]\s?\d[a-z]\d\b', ' ', a)
    return ' '.join(a.split()[:5])


def _strong(a, b):
    """The same name, nearly word for word."""
    ta, tb = _tokens(a), _tokens(b)
    return bool(ta and tb) and len(ta & tb) / len(ta | tb) >= 0.8


def dedupe(rows, near_m=80.0, unnamed_m=25.0, strong_m=200.0, self_m=30.0):
    """Count each business once across the sources: City licences (L) first, then OpenStreetMap (O), then Overture
    Maps (V). A place is the same business as one already kept when:
      - it has the same name within near_m metres (any kind: the sources classify the same shop differently);
      - it has nearly the same name word for word within strong_m metres (a mall's map point can sit far from the
        licence's parcel point);
      - it has the same name and the same street address, wherever the points are (or a licence has no point);
      - it is unnamed, within unnamed_m metres and of the same kind;
      - for the two map sources, the same source lists it twice: nearly the same name within self_m metres.
    The kept row takes the other source's letter (source 'LO', 'LV', 'LOV', 'OV'), and any address, website or phone
    number it lacked; the copy is dropped. rows: [name, category, type, community, address, first, status, lon, lat,
    source, website, phone]. Returns (rows, matched)."""
    import math                                     # noqa: PLC0415
    kx, ky = 111_132.0 * math.cos(math.radians(51.05)), 111_132.0
    cell = strong_m
    grid, by_addr = {}, {}
    for r in rows:
        while len(r) < 12:
            r.append(None)

    def put(i):
        r = rows[i]
        if r[7] is not None and r[8] is not None:
            grid.setdefault((int(r[7] * kx // cell), int(r[8] * ky // cell)), []).append(i)
        a = _addr(r[4])
        if a and r[0]:
            by_addr.setdefault(a, []).append(i)

    out_idx = [i for i, r in enumerate(rows) if r[9] in ('L', 'H')]
    for i in out_idx:
        if rows[i][9] == 'L':
            put(i)
    matched, used = 0, set()
    for letter in ('O', 'V'):
        for k, r in enumerate(rows):
            if r[9] != letter:
                continue
            best = None
            if r[7] is not None and r[8] is not None:
                x, y = r[7] * kx, r[8] * ky
                gx, gy = int(x // cell), int(y // cell)
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        for i in grid.get((gx + dx, gy + dy), []):
                            K = rows[i]
                            d = math.hypot(K[7] * kx - x, K[8] * ky - y)
                            if letter in K[9]:      # the same source twice: only a near-identical name very close
                                ok = bool(r[0]) and d <= self_m and _strong(r[0], K[0])
                            elif r[0]:
                                ok = (d <= near_m and same_name(r[0], K[0])) or (d <= strong_m and _strong(r[0], K[0]) and (i, letter) not in used)
                                # beyond near_m, one copy per source only: two branches of a chain stay two
                            else:
                                ok = d <= unnamed_m and K[1] == r[1] and (i, letter) not in used
                            if ok and (best is None or d < best[0]):
                                best = (d, i)
            if best is None and r[0]:
                for i in by_addr.get(_addr(r[4]), []) if _addr(r[4]) else []:
                    if letter not in rows[i][9] and same_name(r[0], rows[i][0]):
                        best = (0, i)
                        break
            if best is None:
                if r[7] is None or r[8] is None:
                    continue                        # a map place with no point cannot be shown or placed
                out_idx.append(k)
                put(k)
                continue
            matched += 1
            K = rows[best[1]]
            used.add((best[1], letter))
            K[9] = ''.join(ch for ch in 'LOV' if ch in K[9] + letter)
            for f in (4, 10, 11):
                if not K[f] and r[f]:
                    K[f] = r[f]
            if K[7] is None and r[7] is not None:
                K[7], K[8] = r[7], r[8]
            if K[1] in ('other', 'general_retail') and r[1] not in ('other', 'general_retail'):
                K[1] = r[1]                          # the map's kind is more exact than a general licence
    return [rows[i] for i in sorted(set(out_idx))], matched


def audit_duplicates(rows, within_m=200.0):
    """Pairs left after dedupe that may still be one business: nearly the same name within within_m metres."""
    import math                                     # noqa: PLC0415
    kx, ky = 111_132.0 * math.cos(math.radians(51.05)), 111_132.0
    grid, pairs = {}, []
    for i, r in enumerate(rows):
        if r[0] and r[7] is not None and r[8] is not None:
            grid.setdefault((int(r[7] * kx // within_m), int(r[8] * ky // within_m)), []).append(i)
    for (gx, gy), idx in grid.items():
        near = [j for dx in (-1, 0, 1) for dy in (-1, 0, 1) for j in grid.get((gx + dx, gy + dy), [])]
        for i in idx:
            for j in near:
                if j <= i:
                    continue
                a, b = rows[i], rows[j]
                if math.hypot((a[7] - b[7]) * kx, (a[8] - b[8]) * ky) <= within_m and _strong(a[0], b[0]):
                    pairs.append((a[0], a[9], b[0], b[9], round(math.hypot((a[7] - b[7]) * kx, (a[8] - b[8]) * ky))))
    return pairs


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


# ------------------------------------------------------------------ distance from every home (Growth vs amenities way)
HOME_SHARE_M = (400, 800, 1000, 2000, 3000)      # share of homes with at least one within this distance
HOME_TYP_M = (1000, 2000, 3000)                  # how many a typical home (the middle one) has within this distance


def home_access(b, homes, share_m=HOME_SHARE_M, typ_m=HOME_TYP_M):
    """For every everyday local kind of business, measured from every home (weighted by dwelling units, as Growth vs
    amenities does), wherever the business is, so a supermarket across the community line counts:
      - the share of homes with at least one within each of share_m metres;
      - how many a typical home has within each of typ_m metres: the middle home (weighted median), so a few homes
        downtown with hundreds of restaurants nearby do not set the bar for everyone (the choice around a home).
    homes: rows [roll, community, year, x, y, units, source] from access.py (metres, its projection).
    Returns {'share_m', 'typ_m', 'city': {cat: [shares (%)..., typical counts...]}, 'by_comm': {code: {'u': units, cat: [...]}}}."""
    import access                                   # noqa: PLC0415 - numpy and scipy, the website build only
    np, KD = access._np()
    proj = access.Projection()
    cols = b['columns']
    ic, ix, iy, isrc = cols.index('category'), cols.index('lon'), cols.index('lat'), cols.index('source')
    pts = {}
    for r in b['businesses']:
        if r[ix] is None or r[iy] is None or r[isrc] == 'H':
            continue
        pts.setdefault(r[ic], []).append(proj.xy(float(r[ix]), float(r[iy])))
    H = np.asarray([[h[3], h[4]] for h in homes], dtype=float)
    U = np.asarray([float(h[5] or 1) for h in homes])
    comm = np.asarray([str(h[1] or '') for h in homes])
    codes = sorted(set(comm.tolist()) - {''})
    idx = {c: np.where(comm == c)[0] for c in codes}
    tot_u = float(U.sum()) or 1.0
    def wmedian(v, w):
        if not len(v):
            return 0.0
        o = np.argsort(v, kind='stable')
        c = np.cumsum(w[o])
        return float(v[o][np.searchsorted(c, c[-1] / 2.0)])

    out = {'share_m': list(share_m), 'typ_m': list(typ_m), 'city': {}, 'homes': len(homes),
           'by_comm': {c: {'u': round(float(U[idx[c]].sum()))} for c in codes}}
    for cat in [c['key'] for c in b['categories'] if c.get('local')]:
        P = pts.get(cat, [])
        d = access.distances_to_points(H, P, max(share_m) + 1)
        within = [(d <= t) for t in share_m]
        if P:
            tree = KD(np.asarray(P, dtype=float))
            counts = [np.asarray(tree.query_ball_point(H, r, return_length=True), dtype=float) for r in typ_m]
        else:
            counts = [np.zeros(len(H)) for _ in typ_m]
        out['city'][cat] = [round(float(U[w].sum()) / tot_u * 100, 1) for w in within] + \
                           [round(wmedian(n, U), 1) for n in counts]
        for c in codes:
            i = idx[c]
            uc = float(U[i].sum())
            if uc <= 0:
                continue
            out['by_comm'][c][cat] = [round(float(U[i][w[i]].sum()) / uc * 100, 1) for w in within] + \
                                     [round(wmedian(n[i], U[i]), 1) for n in counts]
    return out


