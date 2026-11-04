"""The population build-up as an Excel workbook anyone can check: homes on the City's property roll x people per home,
plus rental units in apartment buildings x people per unit, give the estimate from homes; the City's forecast top-up
takes it to the residents shown in the app. The sums are Excel formulas, so the workbook adds itself up.

Why rental units are listed apart: a rented-out apartment building is ONE account (one roll number) on the property
roll for the whole building, so counting accounts would count it as one home. Its flats are counted from the City's
building permits (housing units on the permit) or, without a permit, estimated from its assessed value. Condo flats
are different: each one is its own account on the roll, so they are counted as homes directly.
"""
import urllib.parse

import xlsx

WHY_RENTALS = ("A rented-out apartment building is one account (one roll number) on the City's property roll for the whole "
               "building, so it would count as one home. Its flats are counted instead: from the City's building permits "
               "(the housing units on the permit), or, where no permit was found, estimated from the building's assessed "
               "value. Condo flats are different: each is its own account on the roll, so they are counted as homes directly.")
SOURCE_WORDS = {'permit': "City building permit: the housing units on the permit(s) in the next column (from the City's Building "
                          "Permits dataset, matched to this building by address)",
                'yoc': "City building permit for the year it was built",
                'estimated': "Estimated from the building's assessed value on the City's property roll (no building permit found), "
                             "scaled so the community's homes on Census day match its 2021 Census households"}
HOW = {'people per home': 'People per home from the 2021 Census: 2021 residents (less people in rental units) / homes on Census day',
       'household size': '2021 Census count + the change in homes since 2021 x the 2021 household size (homes on the roll were '
                         'more than 15% off the Census household count)'}


def roll_link(roll):
    return f"https://data.calgary.ca/resource/4bsw-nn7w.json?roll_number={roll}"


def permit_link(num):
    return f"https://data.calgary.ca/resource/c2es-76ed.json?permitnum={num}"


def _permits(b):
    """Permit numbers with their units ("BP2016-08149 (6 units)"), and a link to the first permit's record."""
    ps = b.get('permits') or []
    words = '; '.join(f"{p['num']} ({p['units']} unit{'s' if p['units'] != 1 else ''})" for p in ps)
    return words, (permit_link(ps[0]['num']) if len(ps) == 1 else
                   'https://data.calgary.ca/resource/c2es-76ed.json?$where='
                   + urllib.parse.quote('permitnum in(' + ','.join(f"'{p['num']}'" for p in ps) + ')') if ps else '')


def sheets(recon, ward_of=None, area='Calgary', method_label='', when=''):
    """[(sheet name, rows)] for xlsx.write. recon: dashboard population.recon."""
    ward_of = ward_of or {}
    T = recon.get('totals') or {}
    f = recon.get('factor_actual')
    rows = sorted(recon.get('rows') or [], key=lambda r: str(r.get('name')))
    head = ['Community', 'Ward', 'Homes today (houses, condos and other homes on the roll)', 'People per home',
            'People in homes (= homes x people per home)', 'Rental units today (in apartment buildings)', 'People per rental unit',
            'People in rental units (= units x people per unit)', 'Other (household-size communities, and rounding)',
            'Estimate from homes (= the three before)', '2021 Census residents', "City forecast top-up", 'Residents (shown in the app)',
            'How people per home was set']
    out = [head]
    for i, r in enumerate(rows, start=2):
        hs = r.get('method') == 'household size'
        e_ = None if hs else f'=C{i}*D{i}'
        h_ = None if hs else f'=F{i}*G{i}'
        # what homes x people per home does not give exactly: the household-size communities, and rounding
        other = (r.get('population') or 0) if hs else round((r.get('population') or 0) - (r.get('homes_now') or 0) * (
            r.get('people_per_home') or 0) - (r.get('units_now') or 0) * (r.get('people_per_unit') or 0), 2)
        how = HOW.get(r.get('method'), "Calgary's average people per home (built since 2021, or under 20 homes on Census day)")
        out.append([str(r.get('name') or '').title(), ward_of.get(r.get('code'), ''), r.get('homes_now'),
                    r.get('people_per_home'), e_ if e_ else 0, r.get('units_now'), r.get('people_per_unit'),
                    h_ if h_ else 0, other or 0, f'=E{i}+H{i}+I{i}', r.get('census2021') or 0,
                    (r.get('residents') or 0) - (r.get('population') or 0), f'=J{i}+L{i}', how])
    n = len(out)
    out.append(['Total (' + area + ')', '', f'=SUM(C2:C{n})', '', f'=SUM(E2:E{n})', f'=SUM(F2:F{n})', '', f'=SUM(H2:H{n})',
                f'=SUM(I2:I{n})', f'=SUM(J2:J{n})', f'=SUM(K2:K{n})', f'=SUM(L2:L{n})', f'=SUM(M2:M{n})',
                f"Should equal {T.get('residents'):,} residents" if T.get('residents') else ''])
    about = [['Population build-up', area], ['Way of counting', method_label], ['Data as of', when], [],
             ['How to read it', 'Each row: homes x people per home + rental units x people per unit = the estimate from homes. '
                                'The City forecast top-up then takes it to the residents shown in the app. Every sum is an '
                                'Excel formula, so the sheet adds itself up.'],
             ['Homes', "Residential property with a building and a residential use on the City's property roll (Current Year "
                       "Property Assessments, 4bsw-nn7w). Left out: commercial, vacant lots, parking stalls, storage lockers. "
                       "Each home counts from one year after its year of construction."],
             ['Why rental units are listed apart', WHY_RENTALS],
             ['People per rental unit', 'A fixed 2.0 people per rented apartment unit (or the community\'s 2021 household '
                                        'size, if that is smaller). It is the growth model\'s assumption, not a Census count.'],
             ['Units from assessed value', 'Where no building permit was found, units = the building\'s assessed value / the '
                                           'value per unit for its property code, rounded, at least 2. Value per unit = the '
                                           'median of assessed value / units over the buildings whose units are known from '
                                           'permits (kept: $80,000 to $900,000 a unit); a property code with fewer than 5 '
                                           'such buildings uses the median for all of Calgary. If a community\'s homes on '
                                           'Census day would then exceed its 2021 Census households by more than 5%, its '
                                           'estimated units are scaled down (the scale column; 1 = not scaled). The sheet '
                                           '"Value per unit" lists the medians.'],
             ['People per home', "From the 2021 Census: each community's 2021 residents (less people in rental units) / its "
                                 "homes on Census day, the same for every kind of home in that community."],
             ['City forecast top-up', (f"The City's population forecast for this month is shared by actual growth: every "
                                       f"community's 2021 Census count x {f - 1:.4f} is added (the factor f = {f:.4f}), for the "
                                       "people that new homes alone do not explain (more people per home, seniors' homes, "
                                       "residences, shelters, the Census undercount).") if f else
                                      'The step from the estimate from homes to the way of counting in use.'],
             ['Rental buildings', 'Every rented-out apartment building, its address, its units and where the number comes '
                                  'from, is on the sheet "Rental buildings": the building permit number(s) when the units come '
                                  'from a permit (BP2016-08149 is a permit number), with links to the permit and to the '
                                  'building\'s record on the City\'s property roll. Codes like c2es-76ed or 4bsw-nn7w are not '
                                  'permits: they are the IDs of the City\'s datasets (Building Permits; Property Assessments).'],
             ['Sources', "City of Calgary open data: Current Year Property Assessments (4bsw-nn7w); 2021 Census by Community "
                         "(f9wk-wej9) and households (msjx-5ygv); Building Permits (c2es-76ed). The City's population "
                         "forecast: Calgary and Region Economic Outlook 2026-2031, Table 4."]]
    rent = [['Roll number', 'Address', 'Community', 'Ward', 'Property code', 'Year built',
             "Assessed value (City's property roll)",
             'Value per unit (estimated: the median for its property code; permit: value / units, as a check)',
             'Value / value per unit (estimated buildings: units before rounding)', 'Units',
             "Community's scale for estimated units", 'Where the number of units comes from', 'Building permit number(s)',
             "The permit's record (City open data)", "The building's record on the City's property roll"]]
    scale = {r.get('code'): r.get('estimate_scale') for r in recon.get('rows') or []}
    names = {r.get('code'): str(r.get('name') or '').title() for r in rows}
    for b in sorted(recon.get('rentals') or [], key=lambda x: (names.get(x.get('comm'), ''), -(x.get('units') or 0))):
        pw, pl = _permits(b)
        i = len(rent) + 1                                  # this row's number in Excel
        est, val = b.get('source') == 'estimated', b.get('value')
        vpu = (b.get('value_per_unit') if est else (f'=G{i}/J{i}' if val and b.get('units') else None))
        rent.append([str(b.get('roll')), b.get('address') or '', names.get(b.get('comm'), b.get('comm')),
                     ward_of.get(b.get('comm'), ''), b.get('code'), b.get('year_of_construction'), val, vpu,
                     f'=G{i}/H{i}' if est and val and vpu else None, b.get('units'),
                     scale.get(b.get('comm')) if est else None,
                     SOURCE_WORDS.get(b.get('source'), b.get('source')), pw, pl, roll_link(b.get('roll'))])
    vp = recon.get('value_per_unit') or {}
    vtab = [['Property code', 'Median value per unit', 'Buildings with units from permits', 'Used for this code?']]
    for code, v in sorted((vp.get('by_code') or {}).items()):
        vtab.append([code, v.get('median'), v.get('buildings'),
                     'Yes' if v.get('used') else 'No: fewer than 5 buildings, so the Calgary median is used'])
    if vp.get('all_calgary'):
        vtab.append(['All of Calgary', vp['all_calgary'], sum((v.get('buildings') or 0) for v in (vp.get('by_code') or {}).values()),
                     'For property codes with fewer than 5 buildings'])
    return [('Read me', about, False), ('Communities', out), ('Rental buildings', rent)] + ([('Value per unit', vtab)] if len(vtab) > 1 else [])


def write(path, recon, ward_of=None, area='Calgary', method_label='', when=''):
    return xlsx.write(path, sheets(recon, ward_of, area, method_label, when))
