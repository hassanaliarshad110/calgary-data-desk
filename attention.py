"""Needs attention: which communities most need new public amenities, and exactly how they are ranked.

This file IS the method. The app, the website and Data Genie all use these functions and numbers, so the screen,
the code and any answer about the ranking can never disagree.

The inputs come from the amenity level (dashboard.amenity_view, method in methods.AMENITY_STEPS):
  level       a community's public amenities per resident as a share of Calgary's, averaged over the neighbourhood
              amenities (1.00 = the Calgary level, 0.50 = half, each kind capped at 2.00)
  growth_pct  growth in residents since the 2021 Census (the growth model: homes built since then)
  new         the community had no residents at the 2021 Census (all of it is growth)

AMENITY LEVEL, GROWTH COUNTED (the same scale as the amenity level: 1.00 = Calgary, lower = needs more)
  shortfall  = max(0, 1 - level)                       how far below Calgary: 0 at or above, 1 with nothing at all
  weight     = how much growth adds to the need: 0.50 with no growth since 2021, rising with growth to 1.00 for a
               community that doubled or did not exist in 2021 (all of it new):
               weight = 0.5 + growth_pct / 200, with growth_pct held between 0 and 100; 1.00 for a new community
  level, growth counted = 1 - shortfall x weight      (rounded to 2 decimals)

  So a gap counts in full where the population is new or doubled (the figure equals the amenity level), and at half
  where nobody new has arrived (the figure sits halfway between the level and 1.00): the same gap matters more where
  demand is growing on it. Worked examples: Homestead (new since 2021), level 0.46 -> 1 - 0.54 x 1.00 = 0.46; a
  community at level 0.43 that grew 20% -> 1 - 0.57 x 0.60 = 0.66; a community at 0.43 that did not grow ->
  1 - 0.57 x 0.50 = 0.72.

TWO COUNTS
  The tab ranks communities twice: with the City's amenities only (attention_city), and with the City's plus the
  ones that are not the City's, mapped in OpenStreetMap (attention, the default). Those come from osm.py: every
  OpenStreetMap playground, fitness station, basketball court, dog park and park that matches a City one is taken
  out first, so nothing is counted twice. Only the ones open to everyone count by default; private, residents-only ones
  (OpenStreetMap access=private: homeowners' association, condo) are added only when the "include private ones" filter
  is on (a third ranking, attention_private). Calgary's yardstick (per 1,000) stays the City's own in both, so an
  amenity that is not the City's can only lift a community's level, and how well other parts of the city happen to
  be mapped in OpenStreetMap cannot move it. The amenity kinds that count in a community's level are the same in both.

THE TIER (decides whether a community is listed at all)
  Urgent  level below 0.50 AND (new since 2021 OR grew more than 20%)
  High    level below 0.75 AND (new since 2021 OR grew more than 20%)   (the "not kept up with growth" flag)
  Watch   level below 0.75, slower growth
  Communities at 0.75 or above are not listed. Communities with fewer than 100 residents never get a level.
  Order: Urgent, then High, then Watch; within a tier, lowest "level, growth counted" first, then more residents first.

WHAT IT WOULD TAKE (the catch-up list)
  For each neighbourhood amenity the community has less than 0.75 of the Calgary level of, the number to add to reach
  the Calgary level:  need = Calgary per 1,000 x the community's residents / 1,000 - what it has now
  (playgrounds use children aged 0 to 14 instead of residents). Whole things round up; park space is in hectares to
  one decimal. Shown for the five kinds furthest behind.
"""
import math

URGENT_LEVEL = 0.50          # below half the Calgary level ...
LIST_LEVEL = 0.75            # ... below three quarters (the same line as the amenity gap flag)
GROWTH_PCT = 20              # grew more than this since 2021 (or new) counts as fast growth
GROWTH_CAP = 100             # growth above 100% weighs the same as 100%
NEW_WEIGHT = 1.0             # a community built since 2021: all of it is growth (the most a weight can be)
CATCH_UP_KINDS = 5           # how many amenities to list in "what it would take"
TIERS = ('Urgent', 'High', 'Watch')


def shortfall(level):
    """How far below the Calgary level: 0 at or above it, 1 with none of anything."""
    return max(0.0, 1.0 - level)


def weight(growth_pct, new):
    """Growth weight: 0.50 with no growth since 2021, 1.00 for a community that doubled or is new since 2021."""
    if new:
        return NEW_WEIGHT
    g = min(max(growth_pct or 0.0, 0.0), GROWTH_CAP)
    return 0.5 + g / 200.0


def level_growth(level, growth_pct, new, digits=2):
    """The amenity level with growth counted: 1 - shortfall x growth weight (1.00 = Calgary, lower = needs more)."""
    if level is None:
        return None
    v = 1 - shortfall(level) * weight(growth_pct, new)
    return round(v, digits) if digits is not None else v


def fast_growth(growth_pct, new):
    return bool(new or (growth_pct or 0) > GROWTH_PCT)


def tier(level, growth_pct, new):
    """Urgent, High, Watch, or None (not listed)."""
    if level is None or level >= LIST_LEVEL:
        return None
    if fast_growth(growth_pct, new):
        return 'Urgent' if level < URGENT_LEVEL else 'High'
    return 'Watch'


def catch_up(row, view):
    """For each neighbourhood amenity below 0.75 of the Calgary level: how many to add to reach the Calgary level."""
    kinds, city = view.get('kinds') or {}, view.get('city') or {}
    out = []
    for k, v in (row.get('vs_city') or {}).items():
        info = kinds.get(k) or {}
        if not info.get('local') or v is None or v >= LIST_LEVEL:
            continue
        rate = (city.get(k) or {}).get('per_1000')
        base = row.get('children_0_14') if info.get('per') == 'children' else row.get('residents')
        if not rate or not base:
            continue
        have = (row.get('n') or {}).get(k) or 0
        gap = rate * base / 1000 - have
        hectares = k.endswith('_ha')
        need = round(gap, 1) if hectares else math.ceil(gap - 1e-9)
        if need <= 0:
            continue
        out.append({'kind': k, 'label': info.get('label', k), 'have': have, 'need': need, 'vs_city': v,
                    'unit': 'ha' if hectares else '', 'per': info.get('per') or 'residents'})
    out.sort(key=lambda x: x['vs_city'])
    return out[:CATCH_UP_KINDS]


def rank(view, other=None, city_levels=None):
    """Every listed community of an amenity view (dashboard.amenity_view), most urgent first.
    other: {community: {kind: n}} amenities that are not the City's, already inside the view's counts (shown apart);
    city_levels: {community: level} the City-only levels, shown next to the level with the others."""
    rows = []
    other, city_levels = other or {}, city_levels or {}
    for r in (view or {}).get('by_comm') or []:
        t = tier(r.get('level'), r.get('growth_pct'), r.get('new'))
        if not t:
            continue
        rows.append({'code': r['code'], 'name': r['name'], 'residents': r.get('residents'),
                     'children_0_14': r.get('children_0_14'), 'growth_pct': r.get('growth_pct'), 'new': r.get('new'),
                     'level': r.get('level'), 'tier': t,
                     'shortfall': round(shortfall(r['level']), 2), 'weight': round(weight(r.get('growth_pct'), r.get('new')), 2),
                     'level_growth': level_growth(r['level'], r.get('growth_pct'), r.get('new')),
                     '_order': level_growth(r['level'], r.get('growth_pct'), r.get('new')),   # as shown; ties: more residents first
                     'catch_up': [dict(c, have_other=(other.get(r['code']) or {}).get(c['kind'], 0)) for c in catch_up(r, view)],
                     **({'other': other.get(r['code']), 'level_city': city_levels.get(r['code']),
                         # the same figure on the City's amenities alone, so the screen can show the change
                         'level_growth_city': level_growth(city_levels.get(r['code']), r.get('growth_pct'), r.get('new'))}
                        if other or city_levels else {})})
    rows.sort(key=lambda x: (TIERS.index(x['tier']), x['_order'], -(x['residents'] or 0)))
    for x in rows:
        x.pop('_order', None)
    counts = {t: sum(1 for x in rows if x['tier'] == t) for t in TIERS}
    people = {t: sum(x['residents'] or 0 for x in rows if x['tier'] == t) for t in TIERS}
    return {'rows': rows, 'counts': counts, 'residents': people,
            'checked': sum(1 for r in (view or {}).get('by_comm') or [] if r.get('level') is not None),
            'thresholds': {'urgent_level': URGENT_LEVEL, 'list_level': LIST_LEVEL, 'growth_pct': GROWTH_PCT,
                           'growth_cap': GROWTH_CAP, 'new_weight': NEW_WEIGHT},
            'with_other': bool(other), 'method': METHOD}


METHOD = [
    'Start from each community\'s amenity level: its public amenities per resident as a share of Calgary\'s, averaged '
    'over the neighbourhood amenities (1.00 = the Calgary level). See "Amenity level and the amenity gap".',
    'Shortfall = 1 - amenity level (0 at or above the Calgary level; 1 with nothing at all).',
    f'Growth weight = 0.5 + growth since 2021 / 200, with growth held between 0% and {GROWTH_CAP}% (so between 0.50 '
    f'and 1.00); a community with no residents in 2021 gets {NEW_WEIGHT:.2f}. A gap counts in full where the population '
    'is new or doubled and at half where nobody new has arrived. Growth is the growth model\'s (homes built).',
    'Amenity level, growth counted = 1 - shortfall x growth weight, on the same scale as the amenity level (1.00 = '
    'Calgary, lower = needs more). Examples: Homestead (new), level 0.46: 1 - 0.54 x 1.00 = 0.46. A community at level '
    '0.43 that grew 20%: 1 - 0.57 x 0.60 = 0.66. One at 0.43 that did not grow: 1 - 0.57 x 0.50 = 0.72. (Levels move '
    'with the way of counting residents and with the non-City amenities; the dashboard has each community\'s own.)',
    f'Urgent: level below {URGENT_LEVEL:.2f} and new since 2021 or grew more than {GROWTH_PCT}%. High: level below '
    f'{LIST_LEVEL:.2f} and the same growth. Watch: level below {LIST_LEVEL:.2f} with slower growth. Communities at '
    f'{LIST_LEVEL:.2f} or above are not listed.',
    'Order: Urgent, High, Watch; within each, the lowest "level, growth counted" first, then most residents.',
    f'What it would take: for each neighbourhood amenity below {LIST_LEVEL:.2f} of the Calgary level, Calgary per '
    '1,000 x the community\'s residents / 1,000 minus what it has (playgrounds per children aged 0 to 14), rounded '
    f'up; park space in hectares. The {CATCH_UP_KINDS} furthest behind are shown.',
    'Residents are counted the way chosen in Settings, so the figures follow that choice.',
    'Amenities that are not the City\'s (developer and school playgrounds, parks, courts, fitness stations and dog '
    'parks open to everyone) come from OpenStreetMap; private, residents-only ones (homeowners\' association, condo) '
    'are left out unless the "include private ones" filter is on. They come from OpenStreetMap with every one that matches a City amenity '
    'taken out so nothing counts twice (osm.py: a City playground within 80 m, fitness equipment or a hoop within '
    '40 m, inside a City off-leash area, or 30% or more of a park inside a City park site). Calgary\'s yardstick '
    'stays the City\'s own per 1,000, so these can only lift a community, and how well other areas happen to be '
    'mapped does not move it. The tab can also rank on the City\'s amenities alone. '
    'OpenStreetMap is edited by volunteers: a missing feature means nobody has mapped it yet.',
    'The code that does this is attention.py; Data Genie can show it (get_code topic "needs_attention").',
]
