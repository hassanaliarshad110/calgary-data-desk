"""Population by community, estimated live with the growth model (built for Ward 5, run for every community).

The 2021 Census is the latest official count by community, but many communities have grown fast since.
The model estimates each community's population on any date from the homes people live in:

  1. Homes: every dwelling on the City's current property assessment roll (residential class, land with a
     building, residential use code), by year of construction. A home counts as lived in one year after its
     year of construction (homes added evenly through each year).
  2. Rental buildings are listed on the roll as one property each. Their units come from matching building
     permits (lived in 6 months after the permit is completed) or, where there is no match, are estimated from
     assessed value and scaled so homes on Census day do not exceed 2021 Census households by more than 5%.
     2.0 people per rental unit, or the community's 2021 household size if smaller.
  3. People per home is fixed at the 2021 Census: (2021 population - people in rental units) / other homes
     lived in on Census day (May 11, 2021).
  4. Population on a date = people per home x homes lived in + people per unit x rental units.
  5. Where homes counted on Census day differ from 2021 Census households by more than 15%, new homes since
     2021 get the community's 2021 household size instead. Communities with no 2021 count use the
     city-wide people per home.

The homes and the Census figures are fetched from the City's open data at every refresh; the rental-unit match
(data/rentals_all.json, every community; data/ward5_rentals.json is Ward 5's part) is the model's own input,
built on October 28, 2026.
"""
import datetime as dt
import json
import math
import os

LAG = 1.0            # years from year of construction to lived in
A = 2.0              # people per rental unit
CENSUS_DAY = dt.date(2021, 5, 11)
HERE = os.path.dirname(os.path.abspath(__file__))
RENTALS_FILE = os.path.join(HERE, 'data', 'rentals_all.json')
if not os.path.exists(RENTALS_FILE):
    RENTALS_FILE = os.path.join(HERE, 'data', 'ward5_rentals.json')

HOMES_DATASET = '4bsw-nn7w'       # Current Year Property Assessments (Parcel)
CENSUS_POP_DATASET = 'f9wk-wej9'  # 2021 Federal Census Population and Dwellings by Community
CENSUS_HH_DATASET = 'msjx-5ygv'   # 2021 Federal Census Families and Households by Community
HOMES_WHERE = "assessment_class='RE' AND property_type='LI' AND starts_with(sub_property_use,'R')"


def decimal_year(d):
    start = dt.date(d.year, 1, 1)
    days = (dt.date(d.year + 1, 1, 1) - start).days
    return d.year + (d - start).days / days


CENSUS_T = 2021 + (31 + 28 + 31 + 30 + 10) / 365      # May 11, 2021, as the model counts it
CENSUS_YEAR = 2021


def set_base(info):
    """Count from the Census the City has published most recently (census.py finds it): its tables and its day."""
    global CENSUS_DAY, CENSUS_T, CENSUS_POP_DATASET, CENSUS_HH_DATASET, CENSUS_YEAR
    if not info or not info.get('community_pop') or not info.get('community_hh') or not info.get('day'):
        return
    day = dt.date.fromisoformat(info['day'])
    CENSUS_DAY, CENSUS_YEAR = day, int(info.get('year') or day.year)
    CENSUS_T = decimal_year(day)
    CENSUS_POP_DATASET, CENSUS_HH_DATASET = info['community_pop'], info['community_hh']


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


class GrowthModel:
    def __init__(self, homes_rows, census_rows, household_rows, rentals=None, roll_year=None):
        rentals = rentals if rentals is not None else json.load(open(RENTALS_FILE, encoding='utf-8'))
        self.kcity = rentals.get('city_people_per_home', 2.66)
        # homes by community and year of construction
        years = {}
        for r in homes_rows:
            y, n, c = _num(r.get('year_of_construction')), _num(r.get('count')), r.get('comm_code')
            if c and y is not None and n:
                years.setdefault(c, {})
                years[c][int(y)] = years[c].get(int(y), 0) + n
        top = max((y for d in years.values() for y in d), default=dt.date.today().year)
        self.R = min(roll_year or top, top)
        # rental properties coded as homes (R...) are already counted once on the roll: take them out
        for p in rentals.get('properties', []):
            y = p.get('year_of_construction')
            if y is not None and y <= self.R and str(p.get('code', '')).startswith('R') and p['comm'] in years:
                years[p['comm']][y] = years[p['comm']].get(y, 0) - 1
        self.Yo = years
        self.end = {}
        for c, d in years.items():
            run, cum = 0, {}
            for y in range(min(min(d, default=self.R), 1900), self.R + 1):
                run += d.get(y, 0)
                cum[y] = run
            self.end[c] = cum
        self.events = {}
        for e in rentals.get('move_in', []):
            self.events.setdefault(e['comm'], []).append(e)
        self.pop21 = {r.get('community_code'): _num(r.get('total_pop_household')) for r in census_rows}
        self.hh21 = {r.get('community_code'): _num(r.get('total_private_households')) for r in household_rows}
        self.hhsize = {r.get('community_code'): _num(r.get('avg_household_size')) for r in household_rows}
        self.scale = {}
        for c in self.events:
            ue, hh = self._units(c, CENSUS_T, LAG, ('estimated',)), self.hh21.get(c)
            if ue > 0 and hh:
                room = hh * 1.05 - self.homes(c, CENSUS_T - LAG) - self._units(c, CENSUS_T, LAG, ('permit', 'yoc'))
                self.scale[c] = min(1.0, max(room, 0) / ue)

    # homes other than rental buildings, lived in at decimal year t
    def homes(self, c, t):
        if c not in self.end:
            return 0.0
        y, f = int(math.floor(t)), t - math.floor(t)
        M, E = self.Yo[c], self.end[c]
        if y >= self.R:
            return E[self.R - 1] + M.get(self.R - 1, 0) * (t - self.R)
        return E.get(y - 1, 0) + M.get(y, 0) * f

    def _units(self, c, t, lag, kinds):
        u = 0.0
        for e in self.events.get(c, []):
            if e['kind'] not in kinds:
                continue
            if e['kind'] == 'permit':
                u += e['units'] if e['t'] <= t else 0
            else:
                u += e['units'] * min(max(t - (e['t'] + lag), 0), 1)
        return u

    def units(self, c, t):
        return self._units(c, t, LAG, ('permit', 'yoc')) + self.scale.get(c, 1.0) * self._units(c, t, LAG, ('estimated',))

    def population(self, c, t):
        """Estimated residents of community c at decimal year t, and how it was estimated."""
        p0 = self.pop21.get(c) or 0
        ho0 = self.homes(c, CENSUS_T - LAG)
        if p0 > 0 and ho0 >= 20:
            hh, size = self.hh21.get(c), self.hhsize.get(c)
            a = min(A, size) if size else A
            k = max((p0 - a * self.units(c, CENSUS_T)) / ho0, 1.0)
            hc21 = ho0 + self.units(c, CENSUS_T)
            ratio = hc21 / hh if hh else None
            if ratio is not None and abs(ratio - 1) > 0.15:
                hs = size or 2.6
                now = self.homes(c, t - LAG) + self.units(c, t)
                return max(p0 + hs * (now - hc21), p0), 'household size'
            return k * self.homes(c, t - LAG) + a * self.units(c, t), 'people per home'
        ho = self.homes(c, t - LAG)
        return max(p0, self.kcity * ho + A * self.units(c, t)), 'city average'

    def homes_lived_in(self, c, t):
        return self.homes(c, t - LAG) + self.units(c, t)


def queries(codes):
    """The three open data queries behind the model (dataset, select, where, group)."""
    inn = ','.join("'" + c + "'" for c in codes)
    return {
        'homes': (HOMES_DATASET, 'comm_code,year_of_construction,count(*) as count',
                  f'{HOMES_WHERE} AND comm_code in({inn})', 'comm_code,year_of_construction'),
        'census': (CENSUS_POP_DATASET, 'community_code,total_pop_household,pop_age_0_to_4,pop_age_0_to_14',
                   f'community_code in({inn})', None),
        'households': (CENSUS_HH_DATASET, 'community_code,total_private_households,avg_household_size',
                       f'community_code in({inn})', None),
    }


def estimate(model, codes, when=None):
    """Population today (or on `when`) against the 2021 Census, for each community."""
    t = decimal_year(when or dt.date.today())
    out = {}
    for c in codes:
        pop, how = model.population(c, t)
        p21 = model.pop21.get(c) or 0
        out[c] = {'model': int(round(pop)), 'census2021': int(round(p21)),
                  'growth_pct': round((pop / p21 - 1) * 100, 1) if p21 else None,
                  'homes_now': int(round(model.homes_lived_in(c, t))),
                  'homes_census': int(round(model.homes_lived_in(c, CENSUS_T))),
                  'method': how}
    return out
