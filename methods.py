"""How the app counts every figure, dataset by dataset.

One place for the method notes that Data Genie reads (get_method) and the Data sources tab shows ("How the app
counts it"), so a person or the assistant can explain or reproduce any dashboard number, for example in Excel.
"""
import access

# Growth vs amenities, revised 5 November 2026 (access.py has the formulas; tests/t_access.py checks them)
ACCESS_STEPS = [
    'Homes: every residential record on the City\'s property assessment roll (Current Year Property Assessments, '
    '4bsw-nn7w, with assessment_class = RE, property_type = LI and a residential use code starting with R), each roll '
    'number once, placed at the mean of its parcel outline\'s corners. A purpose-built rental building is one record on '
    'the roll; it counts as its number of units (from a matching building permit, or estimated from assessed value).',
    'Amenities, from the City\'s own inventory: playgrounds (Playground Equipment, bdu9-amk8, multi-play complexes '
    'that are active or installed), public parks (Parks Sites, kami-qbfh, every site except non-park and parks depot), '
    'transit stops (Calgary Transit Stops, muzh-c9qc, active), community centres and public libraries (Community '
    'Services, x34e-bcjz) and indoor recreation centres (Recreation Facilities, hxfu-6d96: leisure centres, aquatic and '
    'fitness centres and fieldhouses).',
    'For every home and every kind: the straight-line distance in metres to the nearest one, in ANY community. Parks: '
    'to the nearest point of the park\'s edge (sampled every 20 m), 0 for a home inside a park.',
    'Distances: playgrounds, parks and transit stops 400 m and 800 m; community centres 800 m and 1.6 km; recreation '
    'centres and libraries 2 km and 5 km. The 400 m for transit is the coverage distance in Calgary Transit\'s Service '
    'Guidelines (May 2025); every other distance is a choice, published at two distances so the effect of the choice '
    'shows.',
    'For a community, a ward and Calgary, weighted by units: the share of homes within the first distance and within '
    'the second; the same for homes built since 2021 and homes built before 2021 (homes with no year are in neither); '
    'the median distance.',
    'Reading for a community and an amenity, a stated rule, not a score: Too few homes (under 100 units); Measured gap '
    '(under half of units within the first distance); Check inventory (a measured gap where 25% or more of units were '
    'built in the last five years, because developer-built amenities may not be in the City\'s inventory yet); Most '
    'homes within reach (otherwise). Readings are never combined across amenities and there is no overall score.',
]
CROWDING_STEPS = [
    'Crowding asks how many people share the playgrounds and parks within reach. It is an estimate.',
    'Children aged 0 to 14 and residents in each community come from the population model, counted the way chosen in '
    'Settings, and are spread evenly over the community\'s homes: children per unit = the community\'s children / its '
    'units.',
    'Playgrounds, at 400 m and again at 800 m. Step 1, for each playground: the children of every home within the '
    'distance; its share = 1 / those children (a playground with no children within reach is skipped). Step 2, for '
    'each home: reach = 1,000 x the sum of the shares of the playgrounds within the distance (0 when none is).',
    'A community, a ward or Calgary: the children-weighted average of reach over its homes, in playgrounds per 1,000 '
    'children.',
    'Parks: the same, with each park\'s area in hectares in place of 1 and residents in place of children: hectares per '
    '1,000 residents. A home is within reach of a park when it is within the distance of the park\'s edge.',
    'Calgary\'s figure is simply the playgrounds with children within reach x 1,000 / the children in homes: the measure '
    'moves people between communities, it adds no playgrounds. The tab shows Calgary\'s figure under every way of '
    'counting residents, so the effect of the estimate shows.',
    'No tier and no combining with distance: the crowding figure stands beside Calgary\'s, in its own column.',
]
SCORE_STEPS = [
    'Crowding (two-step catchment, as for playgrounds and parks) for all six amenities: playgrounds per 1,000 '
    'children; park hectares per 1,000 residents; transit stops per 1,000 residents; community centres, indoor '
    'recreation centres and libraries per 100,000 residents. Each facility counts as one; a park as its hectares.',
    'Amenity score = the community\'s crowding figure / Calgary\'s (1.00 = Calgary). Bands: under 0.50 well below; '
    '0.50 to 0.80 below; 0.80 to under 1.25 around; 1.25 or more above.',
    'Group scores, each amenity capped at 2.00 first: local = the mean of playground, park, transit stop and community '
    'centre (each within a walk); district = the mean of indoor recreation centre and library (each within a drive or '
    'a bus ride); all amenities = the mean of all six, with equal '
    'weights or with local amenities two thirds and district facilities one third. A group score needs every amenity '
    'in the group.',
    'Every assumption: amenity and group scores are worked out 4 ways (each amenity\'s shorter and longer distance x '
    'two counts of residents: the one chosen in Settings and the 2021 Census); the all-six score 8 ways (x the two '
    'weightings). The figure shown is the shorter distance with the count chosen in Settings (and equal weights), with '
    'the range from the lowest to the highest. Changing the count in Settings changes every score.',
    '"Near, but crowded" (playgrounds and parks, and any amenity in the table): most homes are within the first distance '
    '(the reading "Most homes within reach"), yet the amenity score is under 0.80: what is within reach is shared by '
    'more people than Calgary\'s average. Crowding counts everyone who can reach an amenity, from any community, so '
    'children from the next community who use the same playground share it too.',
    'The local and district scores are the main figures. The all-six score is shown in each community\'s details only: '
    'one average of six different amenities can hide a gap in one group.',
    'Labels: consistent gap = below 0.80 in every way with a figure; depends on assumptions = below 0.80 in some; no '
    'gap = never below. Communities with no 2021 Census count (built since) are scored fewer ways and marked.',
    'A ward\'s score: its people-weighted crowding against Calgary\'s, worked out the same way. Communities with fewer '
    'than 100 homes are not scored.',
]
OLD_METHOD = [
    'Counted City assets inside each community\'s boundary (benches, picnic tables, playgrounds, sports equipment, '
    'fitness equipment, bins, off-leash areas, neighbourhood park space, trees, transit stops) per 1,000 residents '
    '(playgrounds per 1,000 children).',
    'Divided each by Calgary\'s figure, capped each at 2.00 and averaged them into an "amenity level" (1.00 = the city).',
    'Flagged communities that grew more than 20% since 2021 (or were new) and sat below 0.75: 23 communities on '
    '5 November 2026.',
    'A "Needs attention" tab ranked communities Urgent, High or Watch with a growth weight (0.5 + growth % / 200) and '
    'listed what each would take to reach the Calgary level.',
]


METHODS = [
    {'key': '311', 'name': '311 Service Requests', 'dataset': 'iahh-g8bj', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/iahh-g8bj', 'updated': 'Daily',
     'used_in': 'Status board, map, 311 charts, Open issues, community table, newsletter',
     'method': [
         'How quickly departments close requests (Open issues): requests made in the period with status Open or Closed '
         '(duplicates and records marked for deletion left out), by agency_responsible and by service_name; days to '
         'close = closed_date minus requested_date, in bands (7 days or less, 8 to 30, 31 to 90, over 90) and on '
         'average over closed requests. Track a request: the record with that service_request_id, read live. Closed is '
         'the department closing the request in its system; the data does not say whether the problem was fixed, and '
         'has no notes on what was done or when the department took it on.',
         'A ward = requests whose comm_code is one of the ward\'s communities (the communities section of the dashboard '
         'lists them; a community belongs to the ward holding most of its area); Calgary = every request in the City\'s data, including those with no community (about 6% of a year\'s requests; they are in Calgary\'s totals but in no community or ward). Compare wards adds up the 14 wards, so its Calgary row counts only requests placed in a community.',
         'Requests in a period: requested_date from the first day of the first month to the last day of the last month. '
         'Duplicates are left out: status_description "Duplicate (Open)" and "Duplicate (Closed)".',
         'Per 1,000 residents a year: requests in the area\'s residential communities / its residents at the middle of '
         'the period, counted the way chosen in Settings (the City\'s total shared by actual growth by default), x 1,000 '
         'x (12 / months in the period). Business areas have no residents, so their '
         'requests are in the totals but not in the rates.',
         'Infrastructure reports: the 21 service types of the 311 study. Roads: Pothole Maintenance, Streetlight '
         'Maintenance, Traffic or Pedestrian Light Repair, Sidewalk - Curb and Gutter Repair, Roadway Maintenance, '
         'Backlane Maintenance, Debris on Street/Sidewalk/Boulevard, Signs - Missing - Damaged, Snow and Ice Control, '
         'Dead Animal Pick-Up, Pathway Concerns, Pathway Snow and Ice Concerns. Water (WATS): Catch Basin Concerns, '
         'Sewage Back-up, Sewer Maintenance, Water Main Break or Leak, Service and Main Valve Issues. Parks: Tree '
         'Concern - GIS, Garbage - GIS, Maintenance - GIS, Infrastructure - GIS.',
         'Open requests: status_description exactly "Open" at the last refresh, whatever date they were made. '
         'Open more than 90 days: also requested_date more than 90 days before the refresh.',
         'Closed within 7 days: requests made in the period with status "Closed" whose closed_date is within 7 days of '
         'requested_date, as a share of the period\'s requests closed so far (requests still open are not counted, so a '
         'short or recent period looks faster than it will end up). Calgary uses every request.',
         'Made on a phone (311 Calgary): source = "App" as a share of the period\'s non-duplicate requests (Web and Other, '
         'mostly phone, are the rest).',
         'City service: the first part of service_name, before " - " (Roads, WATS = Water, WRS = Waste and '
         'Recycling, CT = Calgary Transit, Bylaw, Parks and so on).',
         'The 311 study ("Who Calgary\'s 311 Hears"): requested_date 2024-10-01 to 2026-09-30, no duplicates, no blank '
         'community; it looked at nine northeast communities (56,473 requests).'],
     'excel': [
         'Filter comm_code to the area\'s community codes (see "Wards and their communities"), or to one community; '
         'for Calgary, no filter.',
         'Filter requested_date between the first and last day of the months you want (dates sort as text: 2025-11-01).',
         'Filter status_description: untick "Duplicate (Open)" and "Duplicate (Closed)". The row count is the number '
         'of requests.',
         'For open requests: status_description = "Open" only, and no date filter.'],
     'cautions': [
         'Most requests are published at the community\'s centre point, not the exact address, so maps show 311 by community.',
         'The City\'s own 311 ward dashboard counts by ward boundary from its internal system and is 1 to 3% higher; '
         'it also divides by 2021 Census households for every year, which favours large, fast-growing households.',
         '"Closed" means the City closed the request, not always that the problem was fixed; some open requests are '
         'years old and may already be dealt with.']},

    {'key': 'profile', 'name': 'The City\'s printed ward profile (2021 Census)', 'dataset': 'Ward profile PDF',
     'publisher': 'City of Calgary (Statistics Canada 2021 Census, Community Data Program)',
     'page': 'https://www.calgary.ca/communities/profiles/wards.html',
     'updated': '2021 Census (published 2023, revised July 2025); next: 2026 Census results from early 2027',
     'used_in': 'Who lives here card, Data Genie reports',
     'method': ['Figures are copied from the City\'s printed ward profile, the ward next to Calgary, and kept with '
                'Calgary Insight (data/ward5_profile_2021.json, so far for one ward; every other ward uses "Who lives in each ward" '
                'below). Nothing is estimated or grown: they describe May 2021.',
                'People in private households only; 2021 ward boundaries; income is for 2020; work questions refer to '
                'May 2021, during the pandemic.'],
     'excel': ['Open the ward\'s profile from the City\'s ward profiles page; each figure is in the table named on the card.'],
     'cautions': ['Calgary has about 14% more homes and about 21% more residents than in 2021 (much more in new '
                  'communities), so shares today may differ.',
                  'Statistics Canada rounds counts to the nearest 5.']},

    {'key': 'being_built', 'name': 'Being built (City projects, roads, large building permits)',
     'dataset': 'City project pages; sizs-hgef; c2es-76ed', 'publisher': 'City of Calgary',
     'page': '',
     'updated': 'City projects: checked by hand (data/ward_projects.json); roads and permits: at each refresh',
     'used_in': 'Growth vs amenities (Being built, Amenities), the dashboard amenities card, map layer, Data Genie',
     'method': ['City projects under construction or approved that the City\'s open data lists of facilities do not have '
                'yet, each checked against the City\'s own project page.',
                'Road projects: Road Construction Projects (sizs-hgef) in or near the area (all of Calgary for the city).',
                'Large building permits: Building Permits (c2es-76ed) issued in the period in the area\'s communities, '
                'estimated project cost over $1,000,000 and no housing units, largest first.'],
     'excel': ['Building permits: filter c2es-76ed to the area\'s community codes, issueddate in the period, housingunits empty '
               'or 0, estprojectcost > 1000000; sort by estprojectcost.'],
     'cautions': ['Amenity counts include only facilities open now; a facility being built is listed separately until it opens.',
                  'Estimated project cost is what the applicant declared on the permit, not the final cost.']},

    {'key': 'population_choice', 'name': 'How residents are counted (Settings)', 'dataset': 'f9wk-wej9, 4bsw-nn7w, City population outlook',
     'publisher': 'City of Calgary', 'page': 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf',
     'updated': 'Census: 2021; property roll: through the year; City outlook: each spring',
     'used_in': 'Residents, every rate per 1,000, population charts, children estimates, newsletter, Data Genie',
     'method': [
         'Four choices. The City\'s total, shared by actual growth, is the default (below). Growth model: each '
         'community\'s 2021 Census count grown with the homes on the property roll (see "Growth model" below).',
         '2021 Census, no growth: each community\'s 2021 Census count (total_pop_household, f9wk-wej9), unchanged. The '
         'City\'s own 311 ward dashboard counts this way (it divides by 2021 Census households).',
         'Grown to the City\'s total: all of Calgary adds up to the City\'s own population estimate for that month '
         '(Calgary and Region Economic Outlook 2026-2031, Spring 2026, Table 4 "City of Calgary Population Projection", page 19, '
         'Total Population as of April: estimates 2021-2025, forecast from 2026; November 2026 = 1,583,200 + 7/12 x '
         '(1,608,700 - 1,583,200) = 1,598,075). Communities built since 2021 have no 2021 count, so they keep their growth model count (19 '
         'communities, 29,547 people in November 2026). Every other community is its 2021 Census count x one factor = '
         '(the City\'s estimate - those new communities) / Calgary\'s 2021 Census count (1,288,995 people in private '
         'households). November 2026: (1,598,075 - 29,547) / 1,288,995 = 1.217, so each older community is 21.7% above '
         'its 2021 count. A ward is its communities added up.',
         'The factor is more than growth: the City\'s estimate also counts people the 2021 Census count of private '
         'households leaves out (seniors\' homes, residences, shelters) and those it missed. On Census day the City\'s '
         'estimate was already 2.7% above the Census count (1,323,783 against 1,288,995); the City\'s own growth from '
         'May 2021 to November 2026 is 20.7%. So "growth since 2021" under this choice reads higher than real growth, '
         'and growth for amenity flags always uses the growth model.',
         'City\'s total, shared by actual growth: all of Calgary still adds up to the City\'s own estimate for that '
         'month, but growth is placed where homes were built. Each community = its 2021 Census count x f + the growth '
         'the growth model measured there (growth model count - 2021 count; for a community built since 2021, all of '
         'it). f = 1 + (the City\'s estimate - Calgary\'s growth model total) / Calgary\'s 2021 Census count. November '
         '2026: 1 + (1,598,075 - 1,467,348) / 1,288,995 = 1.1014. So the City\'s growth the homes do not explain (more '
         'people per home since 2021, seniors\' homes, residences, shelters, the Census undercount: 130,727 people) is '
         'spread over every community as a share of its 2021 count, and the growth from homes built stays where they '
         'were built. f is not people per home: it multiplies each community\'s 2021 count (+10.14% for every community). '
         'Going from the growth model, which already holds the 2021 count once, only the extra is added: residents = '
         'growth model + 2021 count x (f - 1). Calgary as a whole: 1,288,995 x 1.1014 + (1,467,348 - 1,288,995) = '
         '1,598,075, the City\'s own estimate. A ward or community is worked out the same way from its own 2021 count '
         'and growth model count. Children: each community\'s 2021 children x one factor + the children the growth '
         'model adds for its new homes, the factor set so Calgary matches the City\'s forecast of children.',
         'The largest community takes the person or two that rounding leaves over, so Calgary matches the City\'s figure '
         'exactly under both City\'s-total choices.',
         'Every figure that uses residents (rates per 1,000, children, crowding at playgrounds and parks, Compare wards, '
         'property tax and budget per resident, the briefing screen) is worked out again under the choice; the website '
         'works all of them out under every choice each morning.',
         'Rates per 1,000 residents = count / residents in the middle of the period x 1,000 x (12 / months).'],
     'excel': ['2021 Census: filter f9wk-wej9 to the area\'s community codes and add up total_pop_household (all of '
               'Calgary\'s residential communities: 1,288,995).',
               'City\'s total, shared by actual growth: f = 1 + (City\'s estimate - the growth model total over every '
               'residential community) / 1,288,995; each community = 2021 count x f + (growth model count - 2021 count).',
               'Grown to the City\'s total: subtract the growth model residents of communities with no 2021 count from the '
               'City\'s population for the date, divide by 1,288,995 (f9wk-wej9 total_pop_household added up over every '
               'residential community), and multiply each older community\'s 2021 count by the result.'],
     'cautions': ['"Shared by actual growth" relies on the growth model\'s homes: where homes are missing from the '
                  'property roll (some new towers until they are assessed), that community\'s growth is understated and '
                  'every other community gets a little more of the factor.',
                  'The growth model follows homes built, so it can undercount established areas that grew by filling '
                  'existing homes and towers (more people per unit); "grown to the City\'s total" grows every community '
                  'at the same rate, so it undercounts communities where many homes were built.',
                  'The 2026 Census was taken in May 2026, but its counts are not published yet (population counts are due February 10, 2027); until then every choice is an estimate except the 2021 Census itself.']},

    {'key': 'population', 'name': 'Growth model (population today, every community)', 'dataset': '4bsw-nn7w, f9wk-wej9, msjx-5ygv',
     'publisher': 'City of Calgary', 'page': 'https://data.calgary.ca/d/4bsw-nn7w',
     'updated': 'Property roll: through the year; Census: 2021',
     'used_in': 'Residents today, every rate per 1,000, population charts, children estimates',
     'method': [
         'Homes: accounts on the Current Year Property Assessments roll (4bsw-nn7w) with assessment_class = "RE" '
         '(residential), property_type = "LI" (land with a building) and sub_property_use starting with "R" (a '
         'dwelling: R110 single detached, R120 and R201 semi-detached and rowhouse, R401/R402 condominium units and so on).',
         'Not homes, so left out: land-only lots (property_type "LO"), non-residential ("NR") and farmland ("FL") '
         'accounts, condo parking stalls (sub_property_use A004, addresses ending in V), storage units (A005, '
         'addresses ending in S) and other accessory or under-construction units (A000, A006, A007).',
         'A home counts as lived in one year after its year_of_construction, spread evenly through that year, so homes '
         'built this year and part of last year are not counted yet.',
         'A rental apartment building is one roll account; the model takes it out and adds its units instead '
         '(from matching building permits, data/rentals_all.json, every community in Calgary), at 2.0 people per unit or the community\'s 2021 '
         'household size if smaller.',
         'People per home = (2021 Census population - people in rental units) / homes lived in on Census day '
         '(May 11, 2021). Residents = people per home x homes lived in + people per unit x rental units.',
         'Where homes on Census day differ from 2021 Census households by more than 15% (24 communities across Calgary), new '
         'homes get the community\'s 2021 household size. Communities built since 2021 have no 2021 count, so they use '
         'the Calgary average (2.66 people per home).',
         '2021 Census: 2021 Federal Census Population by Community (f9wk-wej9, total_pop_household) and Households '
         '(msjx-5ygv, total_private_households). Calgary: 1,288,995 people in 500,990 households in its residential communities (the file also has 695 people and 405 households in business, industrial and park areas, which have no residents in the model).'],
     'excel': [
         'Download the roll for a community (4bsw-nn7w, comm_code = e.g. CNS).',
         'Filter assessment_class = RE, property_type = LI, sub_property_use begins with R: that is the number of homes '
         '(Cornerstone, Oct 2026: 4,987).',
         'Pivot year_of_construction against a count of roll_number to see homes by year built. The model then leaves '
         'out homes built in the last year or so and swaps rental buildings for their units (Cornerstone: 4,954).'],
     'cautions': [
         'An estimate, not a count: it holds 2021 people per home and does not count basement suites or more people '
         'moving into existing homes, nor people in seniors\' homes, residences and shelters, so the Calgary total from the same '
         'method is 8.2% below the City\'s estimate (1,467,348 against 1,598,075, November 2026).',
         'Tested against the City\'s 2016 and 2019 civic census: typical error about 3% by community, 6% for '
         'fast-growing ones. The 2026 Census by community (expected 2027) will allow a direct check.',
         'It follows homes, so it never shows a community shrinking: an older community whose households are getting smaller '
         'stays at its 2021 count until homes are added. No residential community is below its 2021 count in November 2026.',
         'The 2021 Census for the City of Calgary is 1,306,784 (Statistics Canada); the 223 residential communities add up to '
         '1,288,995. The 17,789 in between live in industrial, park and residual areas the City\'s community file places in no '
         'community, and are not in any community or ward figure.']},

    {'key': 'children', 'name': 'Children (estimate)', 'dataset': 'f9wk-wej9 + growth model', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/f9wk-wej9', 'updated': 'Census 2021, grown monthly',
     'used_in': 'Families and schools, child care spaces per 100 children, children per playground',
     'method': [
         'Each community keeps its 2021 Census children (pop_age_0_to_4, pop_age_0_to_14) for the residents it had '
         'in 2021.',
         'Residents added since 2021 are given the share of children seen in 2021 in the communities that were new at '
         'the Census, anywhere in Calgary: at least half of the homes lived in on Census day were first lived in during '
         'the five years before, and at least 500 residents. With the City\'s roll in November 2026 that is 12 communities, in every '
         'quadrant (Belmont, Carrington, Cityscape, Cornerstone, Greenwood/Greenbriar, Legacy, Livingston, Redstone, '
         'Seton, University District, Walden, Yorkville): about 24% aged 0 to 14 and 11% under 5. The list is worked '
         'out again at every update, so it can change; the current list and shares are in the dashboard data '
         '(population: new_share_communities, new_share_0_14, new_share_0_4). (Growth model.)',
         'City\'s total shared by actual growth (the default): each community\'s 2021 children x one factor + the children '
         'the growth model adds for the homes built there; the factor is set so Calgary matches the City\'s forecast of '
         'children (dashboard.kid_factors_actual, kid_added, kids_as).',
         'City\'s total, one rate for all: children follow the City\'s own forecast of children, from the same table as the '
         'population (Calgary and Region Economic Outlook 2026-2031, Table 4, page 19, Population by Cohort: 0-4, 5-9 and '
         '10-14, as of April, read on a straight line between Aprils). Communities built since 2021 keep the estimate '
         'above; every other community is its 2021 count of children x one factor, so all of Calgary adds up to the '
         'City\'s forecast. November 2026: aged 0 to 14 = 270,400 + 7/12 x (273,300 - 270,400) = 272,092; aged 0 to 4 '
         '= 86,542.'],
     'excel': ['Share for new residents: add up pop_age_0_to_14 (and pop_age_0_to_4) of the communities above in '
               'f9wk-wej9 and divide by their total_pop_household. Then each community\'s 2021 Census children + '
               '(residents today - 2021 residents) x that share.'],
     'cautions': ['No public count of children by community exists after 2021.',
                  'The City\'s forecast is for all of Calgary, so each community keeps its 2021 share of the city\'s '
                  'children under "grown to the City\'s total".']},

    {'key': 'permits', 'name': 'Building Permits', 'dataset': 'c2es-76ed', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/c2es-76ed', 'updated': 'Daily',
     'used_in': 'Homes in building permits (status board, community table, newsletter)',
     'method': [
         'Homes in permits = the sum of housingunits on building permits in the area\'s communities (communitycode).',
         '"Applied for": applieddate in the period. "Issued": issueddate in the period.'],
     'excel': ['Filter communitycode to the area\'s community codes and issueddate (or applieddate) to the period; sum housingunits.'],
     'cautions': ['Planned homes, not finished ones: a home is lived in a year or more after its permit.']},

    {'key': 'dp', 'name': 'Development Permits', 'dataset': '6933-unw5', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/6933-unw5', 'updated': 'Daily',
     'used_in': 'Development permit card, Growth vs amenities, newsletter',
     'method': [
         'A ward = the permit\'s own ward field (e.g. "1" for Ward 1); Calgary = every permit. Applications = applieddate in the period.',
         'Types are grouped from category: New homes and apartment buildings; Secondary (basement) suites; Change of '
         'use; New commercial and industrial; Non-residential renovations; Home businesses; Signs; Relaxations (small '
         'exceptions to the rules); Home additions and renovations; Other.',
         'Larger developments = New homes and apartment buildings + Change of use + New commercial and industrial.',
         'Approved = statuscurrent "Released". In review also counts "Approved" (decided, not yet released while the '
         'appeal period runs), Hold and Pending Appeal. Also counted: refused, cancelled.'],
     'excel': ['Filter ward to the ward\'s number (no filter for Calgary) and applieddate to the period; count rows, '
               'or group by category.'],
     'cautions': ['"Change of use" includes new child care centres, schools, clinics and places of worship.']},

    {'key': 'rezoning', 'name': 'Rezoning applications (land use redesignation, LOC numbers)', 'dataset': '33vi-ew4s',
     'publisher': 'City of Calgary', 'page': 'https://data.calgary.ca/d/33vi-ew4s', 'updated': 'Daily',
     'used_in': 'Growth vs amenities (Development and rezoning), map layer, Data Genie',
     'method': [
         'Land Use Redesignation Applications (33vi-ew4s): applications to change a property\'s land use district '
         '(rezoning), often with an outline plan or road closure; numbers start with LOC. Council decides them at a '
         'public hearing.',
         'The dataset has no ward or community, so each application is placed by its map point: inside the ward\'s '
         'boundary (Ward Boundaries, tz8z-hyaz) and in the community whose outline holds it.',
         'Listed: every application with applieddate in the period, plus every one still open (status New, Submitted, '
         'Under Review or Miscellaneous) made since 2020, because a rezoning can take a year or more. "Rezoning '
         'applications" counts those made in the period; "still open" counts the open ones whenever made.',
         'Proposed use = the current district (fromlud) to the proposed one (proposedlud), as the City writes them '
         '(for example R-CG to DC).'],
     'excel': ['Download 33vi-ew4s, filter applieddate to the period (or statuscurrent to the open ones) and keep the '
               'rows whose latitude and longitude fall in the area (a map check; Calgary Insight tests the boundary exactly).'],
     'cautions': ['Public hearing dates are on Council agendas, not in the open data.',
                  'A large application can list several districts at once, separated by commas, in the same order.']},

    {'key': 'traffic', 'name': 'Traffic Incidents', 'dataset': '35ra-9556', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/35ra-9556', 'updated': 'Continuously',
     'used_in': 'Traffic incidents (status board), map points',
     'method': ['Incidents with start_dt_utc in the period whose exact latitude and longitude fall inside the ward\'s '
                'boundary (Ward Boundaries, tz8z-hyaz), or anywhere in Calgary for the whole city. The map shows the last 90 days of the period.'],
     'excel': ['Filter start_dt_utc to the period, then keep rows inside the ward (a map check; Calgary Insight does the '
               'boundary test exactly).'],
     'cautions': ['The City stores times in UTC; Calgary Insight converts them to Calgary time and counts months by Calgary dates. '
                  'These are incidents the City reports for traffic, not every collision.']},

    {'key': 'police', 'name': 'Community safety data (crime and disorder)', 'dataset': 'Community-Safety-Data xlsx',
     'publisher': 'Calgary Police Service',
     'page': 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata',
     'updated': 'Every quarter (monthly figures)',
     'used_in': 'Crime tiles, Crime card, disorder card, Compare wards, newsletter, Data Genie',
     'method': [
         'The spreadsheet linked as "Download Community Safety Data" on the police page; Calgary Insight finds the current '
         'link at each refresh and downloads it only when it changes.',
         'A ward = rows whose Ward column is that ward, e.g. "Ward 1" (the police assign each community to a ward, '
         'including the airport and business areas); Calgary = every row.',
         'Crime categories: assault and other violence (not domestic), street and commercial robbery, break and enter '
         '(homes, businesses, other premises such as garages), theft from vehicles and vehicle theft.',
         'The period is the dashboard period moved back to the latest month the police have published, compared with '
         'the same months a year before.',
         'Per 1,000 residents a year: the ward\'s crimes / the ward\'s residents x 1,000 x (12 / months). Residents are '
         'counted at the middle month of the police period (for October to September, April), the way chosen in Settings. '
         'Calgary: all crimes in the file / every residential community\'s residents counted the same way, so the ward and '
         'Calgary are compared like with like. Under the default count (the City\'s total) Calgary\'s residents are the '
         'City\'s own estimate, so Calgary\'s rate is about 16.3 per 1,000 for Oct 2025 to Sep 2026; under the growth model, '
         'whose Calgary total is about 9% lower, it reads about 17.8.',
         'Disorder: calls from the public about disorder (sheet "Disorder"), counted by event.',
         'A few incidents in the file have no ward, so the 14 wards add up to slightly less than Calgary (Oct 2025 to Sep '
         '2026: 25,857 crimes against 25,861).'],
     'excel': ['Download the spreadsheet: the "Police data file" button on the Crime card, or "Download Community '
               'Safety Data" on the police page. Sheet "Community Crime": filter Ward (e.g. "Ward 1"), or a Community, '
               'or nothing for Calgary; Year '
               'and Month; sum "Total Crime".',
               'When someone asks for the source, open the police page at "Dashboard data download" (link above) and click '
               '"Download Community Safety Data": every crime number on Calgary Insight can be found in that spreadsheet.'],
     'cautions': ['Totals on Calgary Insight always match the police file.',
         'The police leave out unfounded reports and domestic violence, and '
         'leave out incidents with no location; they advise against comparing the file directly with their dashboard.',
         'Small communities swing a lot from year to year; compare with several years before quoting a change.',
         'The police changed what counts as disorder in 2025, so older disorder years are not directly comparable, and a '
                  'change against the year before can partly reflect the new definition.']},

    {'key': 'rents', 'name': 'Rental Market Survey (rents and vacancy)', 'dataset': 'CMHC Housing Market Information Portal',
     'publisher': 'CMHC', 'page': 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart?id=0140&t=3',
     'updated': 'Yearly: surveyed each October, published in December or January',
     'used_in': 'Rents and vacancy card, newsletter',
     'method': [
         'CMHC surveys purpose-built rental apartments (buildings of 3 or more rental units) every October.',
         'Read from the portal\'s Calgary tables: Average Rent, Vacancy Rate and Rental Universe, by bedroom count, '
         'for Calgary, each survey zone and each CMHC neighbourhood (see "Which CMHC rent area a ward gets").',
         'Average rent is what sitting tenants pay, not the asking rent for empty units. Vacancy = units empty and '
         'ready to rent on the survey date.'],
     'excel': ['On the CMHC portal, open Calgary > Primary Rental Market > Average Rent > Neighbourhoods, and choose '
               'Export to Spreadsheet (CSV).'],
     'cautions': ['Condos rented out, basement suites and houses are not in the survey (CMHC\'s secondary market).',
                  'CMHC neighbourhoods and zones do not follow community or ward lines; no figures exist by community.',
                  'Letters are CMHC\'s reliability grades (a excellent to d use with caution); ** means not published.']},

    {'key': 'csi', 'name': 'Crime Severity Index', 'dataset': 'Statistics Canada 35-10-0026-01', 'publisher': 'Statistics Canada',
     'page': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3510002601', 'updated': 'Yearly, each July',
     'used_in': 'Crime in Calgary compared with other cities, newsletter',
     'method': ['Overall, violent and non-violent index for the Calgary metropolitan area and other large cities, last '
                '11 years, from Statistics Canada\'s Web Data Service.'],
     'excel': ['Download the table from the Statistics Canada page and filter Geography to Calgary, Alberta.'],
     'cautions': ['City level only. The index weighs each crime by how serious it is (100 = Canada in 2006); it is not '
                  'a count and cannot be compared with the police ward counts.']},

    {'key': 'child_care', 'name': 'Child Care Information', 'dataset': 'open.alberta.ca e4ecb4fa',
     'publisher': 'Government of Alberta', 'page': 'https://open.alberta.ca/opendata/childcareinformation',
     'updated': 'Quarterly', 'used_in': 'Families and schools, child care cards, newsletter',
     'method': [
         'One file per quarter listing every licensed program, its type, licensed capacity and every inspection.',
         'Programs are placed in a ward by their address (matched to the City\'s parcel addresses, 9zvu-p8uz).',
         'Spaces = licensed capacity of programs located in the area. Family day home agencies are listed but not '
         'counted, because the homes they oversee are spread across the city.',
         'Last 12 months: inspections (visits), non-compliance findings and enforcement actions (such as an order to remedy).'],
     'excel': ['Open the latest quarter\'s CSV, filter City = Calgary and the area\'s addresses or postal codes; sum Capacity '
               'once per program (the file has one row per inspection).'],
     'cautions': ['Capacity is how many children may attend at once, not how many are enrolled.']},

    {'key': 'schools', 'name': 'Student enrolment by school and Schools', 'dataset': 'open.alberta.ca ccbcf0fb + fd9t-tdn2',
     'publisher': 'Government of Alberta; City of Calgary',
     'page': 'https://open.alberta.ca/opendata/student-enrolment-by-school-authority-and-grade-level',
     'updated': 'Yearly', 'used_in': 'Schools cards, Families and schools, newsletter',
     'method': [
         'School locations from the City\'s Schools dataset (fd9t-tdn2): schools inside the ward\'s boundary (every Calgary school for the whole city).',
         'Each one is matched by name to the Government of Alberta enrolment file for each school year; students = the '
         'school\'s total enrolment (kindergarten to grade 12), split into K to 9 and grades 10 to 12.'],
     'excel': ['Open the Alberta enrolment file for a school year and filter School Name to the area\'s schools; sum Total.'],
     'cautions': ['Students are counted where they go to school, not where they live: many travel in from other wards '
                  'and some of a ward\'s children go to school in another ward.']},

    {'key': 'amenities', 'name': 'Amenities: recreation facilities, transit stops, playgrounds, community services',
     'dataset': 'hxfu-6d96, muzh-c9qc, bdu9-amk8, x34e-bcjz', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/bdu9-amk8', 'updated': 'As the City updates them',
     'used_in': 'Amenities by community, map layers, Growth vs amenities',
     'method': [
         'Each item is placed in a community by its location inside the community boundary (surr-xmvs).',
         'Transit stops: status = ACTIVE. Playgrounds: playground equipment with life_cycle_status = ACTIVE and '
         'type_description = "MULTI PLAY COMPLEX" (one per play structure). Recreation facilities and community '
         'services (libraries, community centres) as listed.',
         'Per 1,000 residents and children per playground use today\'s estimated residents and children.'],
     'excel': ['Download the dataset, filter the conditions above and count by community.'],
     'cautions': ['School playgrounds and private play areas are not City equipment and are not counted.']},

    {'key': 'roads', 'name': 'Road Construction Projects', 'dataset': 'sizs-hgef', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/sizs-hgef', 'updated': 'As projects change', 'used_in': 'Road construction card',
     'method': ['Projects whose location is inside the ward or just outside it (all of Calgary for the whole city).'],
     'excel': ['Download the dataset and look for projects in or near the area.'],
     'cautions': ['Only the City\'s larger road projects; repairs and utility work are not listed.']},

    {'key': 'cameras', 'name': 'Traffic Cameras', 'dataset': 'k7p9-kppz', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/k7p9-kppz', 'updated': 'Images about once a minute', 'used_in': 'Traffic cameras, Briefing screen',
     'method': ['Cameras inside the ward or within about 2 km of it (every camera for the whole city). Each camera shows the City\'s latest image.'],
     'excel': [], 'cautions': ['The City keeps no recording.']},

    {'key': 'transit_live', 'name': 'Buses and CTrains, live (Calgary Transit)',
     'dataset': 'am7c-qe3u (vehicle positions), gs4m-mdc2 (trip updates), npk7-z3bj (timetable)',
     'publisher': 'City of Calgary (Calgary Transit)', 'page': 'https://data.calgary.ca/d/am7c-qe3u',
     'updated': 'Positions about every 30 seconds; timetable each service season',
     'used_in': 'Map layer "Buses and CTrains, live"',
     'method': ['Every 30 seconds while the layer is on, read Calgary Transit\'s vehicle positions feed (GTFS Realtime): '
                'each vehicle\'s fleet number, the trip it is running, where it is and which way it is heading.',
                'Route number, route name and destination come from the trip, looked up in Calgary Transit\'s timetable '
                '(trips.txt and routes.txt in the GTFS file). A trip that is not in the timetable (an extra trip added on '
                'the day) takes its route number from the trip updates feed.',
                'A vehicle with neither is shown grey as "Route not given": usually going to or from the garage.',
                'The time shown is when Calgary Transit wrote the feed. Nothing is saved: the positions are read again each time.'],
     'excel': [],
     'cautions': ['Positions are where each vehicle last reported, not a prediction of where it is now.',
                  'The website reads the feed through the City\'s portal, which can pass it on a few minutes late; the time '
                  'on the map says how old the positions are.',
                  'The feed covers vehicles in service with a working locator; a few may be missing at any time.']},

    {'key': 'city_disorder', 'name': 'Social Disorder Statistics (City open data)', 'dataset': '4evm-wx9a',
     'publisher': 'City of Calgary (Calgary Police Service)', 'page': 'https://data.calgary.ca/d/4evm-wx9a',
     'updated': 'Ended July 2025', 'used_in': 'Disorder card only when the police file is not available',
     'method': ['Events in the area\'s community regions over the latest 12 months published.'], 'excel': [],
     'cautions': ['No longer updated; the police community safety file replaces it.']},

    {'key': 'wards', 'name': 'Wards and their communities', 'dataset': 'tz8z-hyaz, surr-xmvs',
     'publisher': 'City of Calgary', 'page': 'https://data.calgary.ca/d/tz8z-hyaz',
     'updated': 'Outlines read again every week', 'used_in': 'Every ward view, Compare wards, City view',
     'method': [
         'Ward outlines: Ward Boundaries (tz8z-hyaz), with each ward\'s councillor. Community outlines: Community District '
         'Boundaries (surr-xmvs), with each community\'s class (Residential, Industrial, Major Park ...) and sector.',
         'Each community belongs to the one ward holding most of its area. The area is measured by laying a 24 x 24 grid '
         'of points over the community and counting how many fall in each ward; a sliver too thin for the grid goes to '
         'the ward holding its middle point.',
         'Residential communities (class "Residential") have residents and per-resident rates; the others (industrial '
         'and business areas, major parks, undeveloped land) are listed and counted in totals but have no rates.',
         'So every community is in exactly one ward and the 14 wards add up to Calgary.'],
     'excel': ['Open both datasets\' maps on data.calgary.ca and lay one over the other; a community split by a ward line '
               'goes to the side with most of its area.'],
     'cautions': ['A community split between two wards is counted whole in one of them, so a ward\'s figures can differ '
                  'slightly from figures the City or the police publish by exact ward line (the police assign each '
                  'community to one ward too).']},

    {'key': 'rates', 'name': 'Rates per 1,000 residents, growth, and the "Growing" flag', 'dataset': 'all',
     'publisher': 'Calgary Insight', 'page': '', 'updated': 'At every refresh',
     'used_in': 'Dashboard tiles, community table and map, Compare wards',
     'method': [
         'Per 1,000 residents a year = count / residents x 1,000 x (12 / months in the period). For a 12-month period '
         'the last factor is 1.',
         'Residents for a period are counted at its middle month (for November to October: about May), the way chosen '
         'in Settings (the City\'s total shared by actual growth, the default; the City\'s total at one rate for all; the '
         'growth model; or the 2021 Census). Open requests per 1,000 use '
         'today\'s residents.',
         'A ward or city rate adds the counts of its residential communities and divides by their residents added '
         'together (not an average of community rates).',
         'Communities with fewer than 500 residents get no rates ("too few residents for a rate"): a handful of requests '
         'would read as hundreds per 1,000, as it did for new communities with a few hundred people (raised from 100 on 7 November 2026). '
         'Their requests still count in ward and city totals.',
         'Growth since the 2021 Census = residents today / 2021 Census residents - 1. "Growing" marks communities that '
         'grew more than 30% (or did not exist in 2021). "New since 2021" means the 2021 Census counted nobody there.',
         'Change against the year before = this period\'s count / the same months a year before - 1; counts are scaled '
         'to a year first when the two periods have different lengths.'],
     'excel': ['Take the count from the dataset with the same filters, divide by the residents shown for that community '
               'or ward, multiply by 1,000.'],
     'cautions': ['Rates depend on how residents are counted; the 2021 Census undercounts fast-growing areas, so their '
                  'rates look higher than they are.']},

    {'key': 'compare', 'name': 'Compare wards: every measure', 'dataset': 'iahh-g8bj, 35ra-9556, c2es-76ed, 6933-unw5, police file',
     'publisher': 'Calgary Insight', 'page': '', 'updated': 'With the whole-city view (at most hourly)',
     'used_in': 'Compare wards, the city view\'s ward tables, Data Genie (section wards)',
     'method': [
         'Every ward is built from the same whole-city data for the same period, so the 14 wards and Calgary line up.',
         'Residents today, 2021 Census and children 0 to 14: added up over the ward\'s residential communities.',
         '311 requests per 1,000 a year and infrastructure reports per 1,000 a year: requests (not duplicates) in the '
         'ward\'s residential communities / their residents at the middle of the period x 1,000. Infrastructure '
         'reports are the 21 service types of the 311 study.',
         'Open requests per 1,000: requests still Open today in residential communities / residents today x 1,000.',
         'Requests closed within 7 days: requests made in the period and Closed, with closed_date - requested_date of 7 '
         'days or less, as a share of all closed ones.',
         'Requests made on a phone (311 Calgary): share of the period\'s requests (not duplicates) with source = "App".',
         'Crimes per 1,000 a year: the police count for the ward (the Ward column of the Community Safety Data file) / '
         'the ward\'s residents at the middle month of the police period x 1,000 x (12 / months). Calgary = all crimes '
         'in the file / every residential community\'s residents counted the same way, so ward and city rates compare '
         'like with like.',
         'Change in crime and violent crime: the same months a year before.',
         'Traffic incidents: each incident placed in a ward by its exact location (Traffic Incidents, 35ra-9556); per '
         '1,000 uses the ward\'s residents at the middle of the period.',
         'New homes: units in building permit applications for homes in the period (Building Permits, c2es-76ed); '
         'development permit applications: all types (6933-unw5).',
         'Child care spaces per 100 children: licensed spaces in the ward\'s communities (Government of Alberta, family '
         'day home agencies not counted) / children aged 0 to 14 x 100; daycare and preschool per 100 children under 5 '
         'likewise. Schools and students: schools located in the ward and their latest enrolment.',
         'Amenities: the share of homes within reach of each amenity and the crowding at playgrounds and parks '
         '(see "Growth vs amenities").',
         'Rank "nth of 14": wards ordered best first where one direction is better (lower crime, faster closing, more '
         'amenities), otherwise highest first. Green or red: at least 10% better or worse than Calgary.'],
     'excel': ['Save the table with "Save this table"; every ward\'s figure can be rebuilt from the datasets listed, '
               'using the ward\'s communities (see "Wards and their communities").'],
     'cautions': ['311 rates measure how much residents report, not how many problems there are: wards with more newcomers '
                  'or fewer people reporting by phone can report less for the same problems.']},

    {'key': 'access', 'name': 'Growth vs amenities: how near homes are to amenities (distance from every home)',
     'dataset': '4bsw-nn7w, bdu9-amk8, kami-qbfh, muzh-c9qc, x34e-bcjz, hxfu-6d96',
     'publisher': 'Calgary Insight (City of Calgary open data)', 'page': 'https://data.calgary.ca/d/4bsw-nn7w',
     'updated': 'Worked out again every week; the property roll every month',
     'used_in': 'Growth vs amenities, Compare wards, Data Genie',
     'method': ACCESS_STEPS,
     'excel': ['Take one community\'s homes from the property roll (4bsw-nn7w, the filters above) and the City\'s '
               'playgrounds (bdu9-amk8); for each home, the distance to the nearest playground = the smallest '
               'SQRT(((lon2 - lon1) x 69,880)^2 + ((lat2 - lat1) x 111,132)^2) metres; count the homes at 400 m or '
               'less and divide by all the homes.'],
     'cautions': access.LIMITATIONS[:4] + [access.LIMITATIONS[5], access.LIMITATIONS[7], access.LIMITATIONS[8]],
     'code': 'access.py (compute, summarise, reading, shares, distances_to_points, distances_to_polygons)'},

    {'key': 'access_crowding', 'name': 'Growth vs amenities: crowding at playgrounds and parks (two-step catchment, estimate)',
     'dataset': 'access (distance) + population model (children 0 to 14, residents)',
     'publisher': 'Calgary Insight (City of Calgary open data)', 'page': '',
     'updated': 'With every refresh (the population estimate changes monthly)',
     'used_in': 'Growth vs amenities, Data Genie',
     'method': CROWDING_STEPS,
     'excel': ['Two playgrounds: 100 children live within 400 m of the first, 400 of the second, and no home reaches '
               'both. Shares: 1/100 and 1/400. A home near the first: 1,000 x 1/100 = 10 playgrounds per 1,000 '
               'children; near the second: 2.5. Calgary: (100 x 10 + 400 x 2.5) / 500 = 4 = 2 playgrounds x 1,000 / '
               '500 children.'],
     'cautions': [access.LIMITATIONS[6], 'Each playground counts as one, whatever its size; a park counts as its area.', access.LIMITATIONS[4],
                  'Straight-line distance, the City\'s inventory only.'],
     'code': 'access.py (crowding, average, view)'},

    {'key': 'access_scores', 'name': 'Growth vs amenities: amenity scores under every assumption (added 5 November 2026)',
     'dataset': 'access (distance), access_crowding, population model (growth model and 2021 Census)',
     'publisher': 'Calgary Insight (City of Calgary open data)', 'page': '',
     'updated': 'With every refresh', 'used_in': 'Growth vs amenities (scores), Data Genie',
     'method': SCORE_STEPS,
     'excel': ['From the community details: score = crowding / Calgary\'s crowding; MIN(score, 2) for each amenity; '
               'local = AVERAGE of the three capped local scores; consistent gap when every one of the 4 (or 8) ways is '
               'below 0.80.'],
     'cautions': ['The comparison is with Calgary\'s own level, not a standard of adequate provision.',
                  'The 0.80 line and the bands are choices, applied the same way to every community.',
                  'Averaging unlike amenities (a transit stop, a library) is a choice too: the local and district scores '
                  'are shown apart, and every amenity\'s own score is in the details.',
                  'A transit stop per resident is not a service level: dense areas with frequent buses can score low.',
                  'Community centre data needs checking (association halls may be missing from the City\'s list), which '
                  'can lower district scores in newer communities.',
                  access.LIMITATIONS[6]],
     'code': 'scores.py; access.py (crowding_inputs, amenity_scores)'},

    {'key': 'growth_forecast', 'name': 'Growth vs amenities: Forecast to 2030 (the City\'s Suburban Residential Growth forecast, added 6 November 2026)',
     'dataset': 'e7ib-v9n4 (SRG Forecast), szyj-edpn (SRG Policy Infrastructure Lines), surr-xmvs (sector and SRG class), '
                'n4vp-3exq (the City\'s map of the forecast); 4bsw-nn7w (homes built in the last five years); access, population model',
     'publisher': 'City of Calgary (Growth Analytics, City and Regional Planning); Calgary Insight', 'page': 'https://data.calgary.ca/d/e7ib-v9n4',
     'updated': 'The City publishes the forecast once a year; read once a week', 'used_in': 'Growth vs amenities (Forecast to 2030), Population build-up, Data Genie, Data Scientist',
     'method': ['The City publishes, for each of its seven suburban planning sectors and each year, the new homes taken up '
                '("absorbed": built and lived in) in new communities, by kind of home (single and semi-detached, rows and '
                'townhouses, apartments), and the people in them. Past years are what happened; the last five are the City\'s '
                'forecast, with a low and a high yearly average for each kind of home. These are shown unchanged.',
                'Each sector\'s forecast homes and people are shared among its new communities (SRG class developing, future '
                'or complete in the City\'s community boundaries) in proportion to the homes built in each one in the last '
                'five years on the property roll. The shares add up to the City\'s sector figure exactly (allocation_check).',
                'Residents in 2030 = residents today (the count chosen in Settings) + the community\'s share of the forecast '
                'people. Children 0 to 14 in 2030 = children today + new residents x the community\'s share of children today '
                '(its sector\'s, under 500 residents today).',
                'Growth vs amenities is worked out again with the 2030 residents and children and today\'s amenities: the same '
                'two-step catchment crowding for all six amenities and the same amenity scores, at the shorter distance. Both '
                'today\'s and the 2030 scores are against Calgary TODAY, so a score falls only where crowding itself gets worse.',
                'Reading, from the local amenities score (playgrounds, parks, transit stops, community centres): becomes '
                'crowded (around Calgary or above today, below 0.80 in 2030); already crowded, more so (below 0.80 today, and '
                'a lower band or 10% lower in 2030); crowded today and in 2030; far from amenities and growing (under half of '
                'homes within reach of a playground, park or transit stop today, and 10% or more growth); keeps up.',
                'Communities the forecast adds no homes to are listed when they share amenities with growing ones enough to '
                'change a band (neighbours).',
                'Projects: the growth-related water, sanitary, storm and road projects the City lists, one row each with every '
                'area structure plan it supports; length from the line on the map.',
                'What is already planned (planned.py), added for "2030 with what is planned": (1) park land: in new '
                'communities, land the Land Use Bylaw zones S-SPR (school, park and community reserve), S-R (recreation) or '
                'S-UN (urban nature) that is not yet in the City\'s Parks Sites inventory (less than half of the parcel, by '
                'sample points, is a City park), counted as park hectares within reach like any park; (2) new libraries and '
                'indoor recreation centres that are under construction or funded and due by the end of the forecast, from '
                'the Government of Alberta Major Projects inventory and the City facilities checked by hand. Work on '
                'facilities that already exist (expansions, repairs) is not added. Planned playgrounds and transit stops '
                'are in no published list and are not added.'],
     'excel': ['Community share = homes built in the last 5 years / the sum for the sector\'s new communities; forecast homes '
               '= sector forecast x share; residents 2030 = residents today + sector forecast people x share; score = crowding / '
               'Calgary\'s crowding today.'],
     'cautions': ['The forecast covers new communities only; infill and redevelopment in established communities are not in it.',
                  'The City forecasts by sector: sharing it by recent building gives more to communities building fast now '
                  'and less to ones about to open up.',
                  'Amenities are today\'s: anything that opens by 2030 is not added, so 2030 crowding is a "nothing new opens" case.',
                  'New residents are spread over the community\'s homes like today\'s; homes on the growing edge are often farther '
                  'from amenities, so crowding there may be worse than shown.',
                  'The forecast\'s 2026 homes are added in full; some built early in 2026 may already be in today\'s count.'],
     'code': 'srg.py (sectors, allocate, future_people, view); access.py (crowding, crowding_inputs); scores.py'},

    {'key': 'major_projects', 'name': 'Being built: major projects in every ward (added 6 November 2026)',
     'dataset': 'Government of Alberta Major Projects inventory (majorprojects.alberta.ca); data/civic_projects.json and '
                'data/ward5_projects.json (checked by hand); surr-xmvs (community boundaries)',
     'publisher': 'Government of Alberta (Jobs, Economy and Trade); City of Calgary; Calgary Insight', 'page': 'https://majorprojects.alberta.ca/',
     'updated': 'The inventory is read every week; the hand-checked lists every Monday', 'used_in': 'Growth vs amenities (Being built), Forecast to 2030, Data Genie',
     'method': ['The Government of Alberta lists every project in Alberta worth $5 million or more, proposed or under '
                'construction, with its sector, type, cost, schedule, developer and map point. Calgary\'s projects (completed '
                'ones left out) are placed in a community by their map point, and so in a ward; a line project (a road, an '
                'LRT line) is listed in every ward its line passes through. A school or facility whose name gives a '
                'community but whose point lies elsewhere is placed in the community it names.',
                'City facilities the inventory misses (fire stations, libraries, recreation) and each ward\'s hand-checked '
                'list come first; a project listed twice is shown once.',
                'A project is marked open when the City lists a facility or school of that name (or within 400 m), or when '
                'it is marked by hand.'],
     'excel': ['Projects in a ward = the inventory rows whose map point (or named community) falls in one of the ward\'s communities, plus the hand-checked lists, with duplicates (3 of 4 words of the shorter name in common) shown once.'],
     'cautions': ['The inventory starts at $5 million; smaller projects are not in it.',
                  'Stages and dates are the inventory\'s; a proposed project may not go ahead.'],
     'code': 'majorprojects.py; dashboard.py (city_projects, project_states)'},

    {'key': 'visiting', 'name': 'Visiting Calgary: the weather by month and by year, what is on, what to see, where to stay, getting around (added 7 November 2026)',
     'dataset': 'Environment and Climate Change Canada daily climate data, Calgary International Airport (climate IDs 3031093 to 11 July 2012, 3031092 since); '
                'ECCC public forecast for Calgary (citypageweather ab-52); OpenStreetMap tourism features (Overpass API); surr-xmvs (community boundaries); '
                'Tourism Calgary 2025 annual report; Calgary Transit fares page; the organisers\' own pages',
     'publisher': 'Environment and Climate Change Canada; OpenStreetMap contributors; City of Calgary; Tourism Calgary; Calgary Transit; Calgary Insight (checked by hand)',
     'page': 'https://api.weather.gc.ca/collections/climate-daily',
     'updated': 'The weather every morning (the current year\'s daily records and the forecast); OpenStreetMap every week; the facts, events, fares and statistics every Monday',
     'used_in': 'Visiting Calgary, Data Genie',
     'method': ['The weather by month is the 1991 to 2020 average of each month\'s figures from the daily records: the mean of the daily highs and lows, rain and snow totals, '
                'days with a high of 20 °C or more, nights at or below 0 °C, days at or below −20 °C and days with 1 cm or more of snow on the ground.',
                'Every year since 1885 with at least 330 days of temperature: the mean temperature, days of 25 °C and 30 °C or more, days of −20 °C or colder, snowfall, '
                'precipitation and the frost-free season (days between the last spring and the first fall night at or below 0 °C). The ten-year line is the average of that year and the nine before it.',
                'Records are the highest and lowest values in the daily records (the hottest and coldest day, the most snow or rain in a day, the deepest snow on the ground), '
                'and the warmest and coldest full years.',
                'Sights and places to stay are OpenStreetMap features tagged tourism (attraction, museum, gallery, zoo, theme park, viewpoint, aquarium, artwork; hotel, motel, hostel, guest house, apartment, resort) '
                'whose point lies inside a City community boundary; each is placed in its community and area. The best-known sights are a hand-written list matched to OpenStreetMap by name for their position and website.',
                '"What suits the weather" tags each best-known sight with the weather it suits (warm: a sunny day above about 18 °C; cool: 5 to 18 °C; cold: below freezing; wet: rain or snow); '
                'the day\'s weather is taken from the forecast read when the site was built (wet if rain or snow is in the condition, otherwise by the day\'s high) and can be changed on the page.',
                'What is on, fares, ways around, facts and visitor statistics are written by hand from the organisers\' and publishers\' own pages, each with its link and the date checked.'],
     'excel': ['Download the daily records for a year from api.weather.gc.ca (collection climate-daily, CLIMATE_IDENTIFIER 3031092) as CSV; average MAX_TEMPERATURE for each month to get the daily high.',
               'Count the rows with MAX_TEMPERATURE >= 25 in a year to get the hot days.'],
     'cautions': ['The airport is 1,084 m up at the north edge of the city; downtown and the south are often a degree or two warmer by day.',
                  'OpenStreetMap lists what volunteers have mapped: a hotel or sight that is missing has not been mapped, and listing is not a recommendation.',
                  'Event dates are the organisers\' habit; the organiser\'s page has the year\'s dates. Fares change each January.'],
     'code': 'visit.py; weather.py; ui/visit.js'},

    {'key': 'elections', 'name': 'Elections: who represents each area, and the latest official results',
     'dataset': 'Elections Calgary results file; gqvk-p23x; Elections Alberta Statement of Vote 2023 and official results; '
                'Elections Canada official voting results (45th general election); Legislative Assembly of Alberta; '
                'House of Commons; surr-xmvs',
     'publisher': 'Elections Calgary (City of Calgary); Elections Alberta; Elections Canada; Legislative Assembly of '
                  'Alberta; House of Commons; Government of Alberta (provincial boundaries)',
     'page': 'https://elections-prd.calgary.ca/results/2025-results.html',
     'updated': 'Read once a week; results change only with a new election, a by-election or a recount',
     'used_in': 'Election Data Centre (Overview, Know your leaders, Know your constituency, Full results), Dashboard (Who represents this area), Data Genie',
     'method': [
         'Municipal, 20 October 2025: Elections Calgary\'s official results file (corrected after the 27 October 2025 '
         'mayoral recount): every candidate\'s votes for mayor, councillor in each ward, and public (CBE) and separate '
         '(CCSD) school trustee for each pair of wards. A share is a candidate\'s votes / the votes cast in that race. '
         'Calgary\'s turnout as Elections Calgary states it (voters / electors on the City of Calgary Permanent Electors '
         'Register). Elections Calgary does not publish turnout by ward. Three CCSD trustees were elected by acclamation.',
         'Mayor by ward: the station-by-station results (gqvk-p23x) added up by ward for election-day stations; advance '
         'votes were cast at stations open to any ward, so they count for Calgary only.',
         'Provincial, 29 May 2023: Elections Alberta\'s Statement of Vote, the "Total (All Voting Options)" row of each '
         'Calgary division (2019 boundaries, divisions 01 to 26): each candidate\'s votes, names on the list, ballots '
         'cast (valid + declined + rejected) and turnout (ballots / names on the list). By-elections since in Calgary '
         'divisions (Calgary-Shaw, 14 September 2026) from Elections Alberta\'s official results, read the same way. '
         'The member sitting today from the Legislative Assembly of Alberta\'s member list.',
         'Referendum, 19 October 2026: Elections Alberta\'s official results by electoral division for each of the 10 '
         'questions; Calgary = its 26 divisions added up.',
         'Federal, 28 April 2025: Elections Canada\'s official voting results, tables 11 (electors, ballots, turnout) '
         'and 12 (candidates and votes) for Calgary\'s 11 districts; the members sitting today from the House of Commons.',
         'Who represents a ward: a ward and a provincial electoral division or federal electoral district have different '
         'borders. Each community\'s area is split over the divisions and districts (a grid of points inside its outline; '
         'shares under 1% left out), and a ward\'s share in one = its '
         'communities\' residents x their shares / its residents (the count chosen in Settings). The councillor and '
         'school trustees follow the ward.',
         'Seats: Calgary City Council (the mayor and 14 councillors by local political party, independents together), '
         'Calgary\'s MLAs and MPs by the caucus of the member sitting today, and the whole Legislative Assembly (87 seats) '
         'and House of Commons (343 seats) from their member lists; a seat with no sitting member is vacant. Each party '
         'keeps one colour across the charts; they are not the parties\' own colours.',
         'Know your constituency (a ward): electors are estimated, as Elections Calgary does not publish electors by '
         'ward: each community\'s residents x the share of residents on the federal electors list in its electoral '
         'district (Elections Canada 2025: electors / 2021 Census population), scaled so Calgary adds up to the City\'s '
         'electors register (896,042). Estimated turnout = votes cast in the ward\'s councillor race / estimated electors. '
         'The ward\'s provincial and federal turnout and its referendum shares average its electoral divisions or '
         'districts by the share of its residents in each. The councillor race station by station is from the station '
         'results (gqvk-p23x). Who lives here: the City\'s ward profile (2021 Census); what residents raise: open 311 '
         'requests.',
         'Know your constituency also lists the languages spoken most often at home and where immigrants were born, from '
         'the City\'s ward profile (2021 Census), for outreach and translated materials.',
         'Know your constituency for every elected member: besides the councillor\'s ward, each MLA\'s provincial '
         'electoral division and each MP\'s federal electoral district. A community split by a boundary counts in each by '
         'the share of its area inside (2019 provincial and 2023 federal boundaries); its residents today (the count '
         'chosen in Settings) and its 2021 Census profile (age by 5-year band and sex, households, work, occupations, '
         'industries) are scaled by that share. Divisions or districts with fewer than 2,000 Calgary residents (boundary '
         'slivers) are left out. The last result is the official one (a by-election when there has been one), with its '
         'arithmetic: votes between first and second, the uniform swing that would tie it (half the margin), electors '
         'on the list who did not vote, and new votes the runner-up would need if every other vote stayed the same. '
         'Potential new electors since 2021 = residents added since the 2021 Census x electors per resident today; an '
         'estimate. Wards and the mayor\'s vote for a division or district are weighted by its residents in each ward. '
         'This is arithmetic on official results, not a forecast.',
         'Since the election: the dashboard\'s period (the 12 complete months since the 20 October 2025 election) against '
         'the 12 months before, for 311 requests, infrastructure reports, traffic incidents, crime, new homes, homes in '
         'building permits and development permit applications, with Calgary\'s change (all 14 wards added up); the '
         'major projects in the area and where each stands; large building permits issued since 20 October 2025. These '
         'describe the area: City services, funding from all three governments, growth and outside factors move them, so '
         'they are not a measure of one person\'s record.',
         'Nothing is ranked, scored or recommended: results are shown as published, candidates in order of votes. The '
         'insights are facts worked out the same way for every race, for any candidate or campaign alike.'],
     'excel': ['Municipal: the open data table gqvk-p23x; filter officecategory = Mayor and ward = the ward number to add up '
               'a ward\'s election-day votes.',
               'Provincial: the Statement of Vote workbook, sheet = the division number, row "Total (All Voting Options)".'],
     'cautions': ['Ward electors and turnout are estimates (see the method); the City\'s register and the federal list '
                  'differ, and people move.',
                  'Shares of a ward in each electoral division or district are by area within each community, not by '
                  'where each home is: a community split by a boundary is split by area.',
                  'Alberta\'s electoral boundaries are being redrawn for the general election on 18 October 2027; the '
                  'divisions here are those of the 2023 election.',
                  'Elections Calgary notes that its station-by-station results do not include special (mail-in) ballots.'],
     'code': 'elections.py; dashboard.py: elections_view'},
    {'key': 'citynews', 'name': 'Calgary News: how the daily stories are found, written and checked',
     'dataset': 'Published reports: City of Calgary, Government of Alberta, Government of Canada, Calgary news outlets',
     'publisher': 'Calgary Insight (each article cites its sources)', 'page': '',
     'updated': 'Every evening at about 6 p.m. Calgary time; at least three stories a day',
     'used_in': 'Calgary News, Data Genie, Data Scientist',
     'method': [
         'Each evening the web is searched for the day\'s Calgary stories: City of Calgary news and council, provincial and '
         'federal decisions that affect Calgary, public safety, transit, housing, business, weather and community. '
         'A story is written up only when it can be supported by published reports, preferably from more than one '
         'outlet or an official source; each article lists every report it draws on.',
         'Articles are written automatically in plain words from those reports and checked against them: every '
         'statement carries a marker [1], [2] for the source it comes from, a quotation is kept under 15 words, and '
         'the publish step stops an article that cites nothing, lists a source it never uses, or has a marker with no '
         'source. Stories already covered are updated only when something new has happened.',
         'Facts only: no opinion, no endorsement of a candidate, party, business or cause, and nothing recommended. '
         'Where reports disagree or a fact is unconfirmed, the article says so.',
         'The articles are published to the site\'s repository (branch news) and read directly by the website, the '
         'laptop version, Data Genie and the Data Scientist; the last 60 days are kept on the page and every day in the '
         'archive.'],
     'excel': ['news/latest.json in the repository\'s news branch holds the last 60 days; news/days/ holds each day.'],
     'cautions': ['An article is a summary of other reports; for anything that matters, read the original sources.',
                  'Reports published late in the day may appear the following evening.',
                  'Developing stories can change after publication; a later article notes what changed.'],
     'code': 'tools/news_publish.py; citynews.py; ui/citynews.js'},
    {'key': 'invest', 'name': 'Invest in Calgary: every business, the underserved index and growth',
     'dataset': 'Business licences (vdjc-pybd); OpenStreetMap shops and amenities (Overpass); Overture Maps places; community boundaries (surr-xmvs)',
     'publisher': 'City of Calgary open data; OpenStreetMap contributors (ODbL); Overture Maps Foundation (CDLA Permissive 2.0)',
     'page': 'https://data.calgary.ca/d/vdjc-pybd',
     'updated': 'Every morning with the website',
     'used_in': 'Invest in Calgary, the Business Economist',
     'method': [
         'Businesses: every City business licence that is not being closed, and every shop, restaurant, café, clinic, '
         'dentist, pharmacy, bank, gym, child care centre, hotel and similar place mapped on OpenStreetMap inside '
         'Calgary. The City licenses only some kinds of business (food service, personal services, contractors, vehicle '
         'repair, liquor and cannabis, apartment buildings and others); most shops and clinics need no City licence, so '
         'they come from OpenStreetMap, which volunteers map and is not complete.',
         'Categories: a licence goes in the category of its main licence type (the longest matching beginning, so '
         '"Personal service (fitness conditioning)" is a gym, not a salon; patios and alcohol sold on the side are '
         'extras). A mapped place goes by its shop, amenity, leisure, healthcare or tourism tag. Licences carry the '
         'community the City gives; mapped places are placed in the community whose boundary holds them.',
         'Overture Maps places (Overture Maps Foundation, CDLA Permissive 2.0): open place data with names, categories, '
         'addresses, websites and phone numbers; only places marked open with a confidence of 0.6 or more, in the '
         'everyday, retail, service and trade kinds this page uses (offices, real estate, parks and places of worship '
         'are left out).',
         'One business, counted once: City licences first, then OpenStreetMap, then Overture Maps. A place is the same '
         'business as one already kept when it has the same name within 80 m (names compared word by word, ignoring '
         'words such as Inc, Ltd and store numbers; the sources may file it under different kinds), nearly the same name '
         'word for word within 200 m (one copy per source, so two branches of a chain stay two), or the same name at the '
         'same street address; an unnamed place counts as the same when it is of the same kind within 25 m. A map source '
         'listing one place twice (nearly the same name within 30 m) counts it once. The business is kept once, with every '
         'source it was found in and any address, website, phone number or map point the first lacked. After this, the '
         'pairs still left with nearly the same name within 200 m are counted at every refresh as a check. The count by '
         'community and category adds the businesses left. Home-based licences are listed but are not storefronts.',
         'Everything is measured from every home on the City\'s property roll (weighted by its units, as Growth vs '
         'amenities does) to the businesses of each everyday kind around it, wherever they are, so a supermarket '
         'across the community line counts. Walking distance (400 m and 800 m, the default 800 m): share of homes '
         'with at least one within the distance; index = the community\'s share / Calgary\'s share x 100; a gap: '
         'index under 60 and at least 1,000 residents without one, for kinds that at least a quarter of Calgary\'s '
         'homes have that close. 1, 2 and 3 km: how many a typical home has within the distance (the middle home, a '
         'weighted median, so homes downtown do not set the bar); index = the community\'s typical home / Calgary\'s '
         'typical home x 100; a gap: index under 60, at least one business short, in a community of 1,000 or more, '
         'for kinds a typical Calgary home has within the distance. Every community is judged the same way, whatever '
         'its size. If the home list is not available, the page falls back to the community-centre method below.',
         'Underserved index: for each community, the people living within 1, 2 or 3 km of its centre (residents counted '
         'the way chosen in Settings, community centres to community centres) and the businesses of the category in '
         'those communities. At Calgary\'s rate = those people x (Calgary\'s businesses in the category / Calgary\'s '
         'residents). Index = businesses within reach / that figure x 100: 100 is Calgary\'s average, 50 is half. '
         'Missing = at Calgary\'s rate minus businesses within reach. The biggest gaps: index under 60, at least 15,000 '
         'people within reach and at least 1.5 missing, in categories that serve a neighbourhood. A community with fewer '
         'than 15,000 people within reach is not judged (too small a market to call anything missing), so a wider '
         'distance judges more communities and can find more gaps in number, while the share of judged places that are '
         'gaps falls; wider circles also overlap, so one short area can count for several neighbouring communities. '
         'Every gap is listed, with what it means, under the dashboard.',
         'Growth: the month each business still licensed today was first licensed. Closed businesses leave the list, so '
         'older months count only survivors.',
         'Your own data: a CSV file is read in the browser and never sent; the summary (monthly totals, days of the '
         'week, top items) goes to the Business Economist only when asked.'],
     'cautions': ['A gap is a lead, not a guarantee: a large store just past the radius, zoning, rents, parking and who '
                  'the customers are all matter.', 'OpenStreetMap is not complete: some areas are mapped better than others.'],
     'excel': ['Download the business directory or the underserved index as CSV from the page; the City\'s licences are '
               'at data.calgary.ca (vdjc-pybd).']},
    {'key': 'capmkt', 'name': 'Calgary Capital Markets: Calgary\'s public companies, their industries and value',
     'dataset': 'TMX Group\'s monthly file of TSX and TSXV listed issuers; TMX\'s TSX and TSXV company directories; US SEC '
                'company filings and financial data; a company list checked by hand (head office, group, industry)',
     'publisher': 'TMX Group; US Securities and Exchange Commission; each company\'s website and filings',
     'page': 'https://www.tsx.com/en/listings/current-market-statistics',
     'updated': 'Every website refresh; TMX\'s file is monthly; the company list is re-checked each quarter',
     'used_in': 'Calgary Capital Markets',
     'method': [
         'The company list: every company TMX lists with an Alberta head office, starting with the TSX, checked one by one '
         'for its head office city (from its own website or filings, or Wikipedia where the website blocks automated '
         'reading, marked as such). Groups kept apart: headquartered in Calgary; elsewhere with a Calgary office; in '
         'Alberta outside Calgary; listed in Alberta by TMX but with an address elsewhere; not yet confirmed. Funds and '
         'exchange-traded products are left out. Tickers are checked against TMX\'s directories at every refresh.',
         'Totals: counts and market capitalization (quoted shares at the month-end price) from TMX\'s monthly file, by '
         'exchange, industry, size and province. Only totals are published, because TMX does not allow its file to be '
         'redistributed; a total over fewer than three companies shows a count only.',
         'Size bands: large C$10 billion or more; mid C$2 to 10 billion; small C$300 million to 2 billion; micro under '
         'C$300 million.',
         'Financial results: revenue, net income and dividends per share by fiscal year from the annual reports '
         'companies file with the US SEC, for those that also file there.'],
     'limits': ['No share prices: no source is both open and licensed for publishing them; each company links to a '
                'delayed quote.', 'TMX gives the head office by province only; the city comes from the hand check.',
                'The Canadian Securities Exchange publishes no downloadable list; CSE companies are added by hand.',
                'Head office moves can only be counted from the first month read onward.'],
     'excel': ['Download the company list as CSV from the Company directory page.'],
     'cautions': ['Head office cities come from each company\'s own website or filings and are checked by hand; a company that moves its head office shows the old city until the next check.',
                  'Market capitalization uses the month-end price in TMX\'s file and can be weeks old; a company with no price that month is counted without a value.',
                  'Financial results are only for companies that also file with the US SEC; Canadian-only filers show totals and listing details only.']},
    {'key': 'civic', 'name': 'Civic Accountability: promises, official records and results for Calgary\'s governments and elected members',
     'dataset': 'Council and Committee Votes (ruq3-99hx); the City\'s Progress Report - Performance Measures (the newest '
                'quarter); House of Commons recorded divisions; LEGISinfo bills; party platforms, candidate platforms and '
                'government records for each commitment',
     'publisher': 'City of Calgary open data; House of Commons; Library of Parliament; the parties, candidates and '
                  'governments that made each commitment',
     'page': 'https://data.calgary.ca/d/ruq3-99hx',
     'updated': 'Official records every website refresh (daily); each commitment re-checked at least each quarter and '
                'when news breaks',
     'used_in': 'Election Data Centre: Civic Accountability',
     'method': [
         'Tracked: promises by the parties and candidates that won office (City council, the Alberta government, the '
         'Government of Canada) and formal government commitments that affect Calgary, each labelled as a party '
         'promise, a candidate promise or a government commitment. Promises of those who did not win office are '
         'listed, not rated.',
         'Every commitment carries its source document and date, the evidence for its status with links, the money '
         'promised, allocated and spent where published, and a history of every change of status.',
         'Statuses: Delivered; Delivered late; On track; In progress; Partly delivered; Stalled; Not started; Broken; '
         'Not yet assessed. Evidence is an official record first (a law and its Royal Assent, a council decision, a '
         'budget, a government or City report, a contract or a finished project); news reports only for the dates and '
         'figures they quote from those records; opinion never. A disputed rating links the other view.',
         'Council votes: every recorded vote by member; a vote is divided when at least one member voted for and one '
         'against. House of Commons: each Calgary MP\'s vote on every recorded division this Parliament (yea, nay or '
         'paired); recorded = the divisions with a vote recorded for that MP. Bills: those whose sponsor is a Calgary MP.',
         'City performance measures: the City\'s own values, targets and explanations, from its newest quarterly '
         'progress report.'],
     'limits': ['Coverage starts with the largest, best-documented commitments and grows.',
                'The Alberta Legislature publishes bills and Hansard but not members\' votes as open data, so MLA votes '
                'are not counted.',
                'Vote counts describe attendance and positions, not the quality of a member\'s work; most votes are '
                'unanimous, and committee and constituency work is not in them.',
                'A status describes a commitment, not a person, and the same rules apply to every party, person and '
                'government.'],
     'excel': ['The council votes are at data.calgary.ca (ruq3-99hx); the Commons votes at ourcommons.ca.'],
     'cautions': ['A status is a reading of the evidence found, not an official finding; a commitment can be read as delivered or stalled by different people.',
                  'Promises are tracked for the parties and candidates that won office; opposition promises are not tracked.',
                  'A council vote counts as divided when any member voted against; a vote lost by one member is listed the same as a vote lost by many.']},
    {'key': 'infra', 'name': 'Infrastructure condition: where roads and pipes are wearing out, against 311 requests',
     'dataset': 'Water main breaks (dpcu-jr23); public water mains (w6h9-w33i); 311 service requests (iahh-g8bj); the '
                'City\'s pavement rehabilitation plan (map service pub_Roads/PavementRehabPlan); community boundaries (surr-xmvs)',
     'publisher': 'City of Calgary open data and map services; City of Calgary reports for the condition figures',
     'page': 'https://data.calgary.ca/d/dpcu-jr23',
     'updated': 'Every website refresh (daily); the City\'s own condition figures when it publishes new ones',
     'used_in': 'Infrastructure condition',
     'method': [
         'The City does not publish a condition score for each road or pipe as open data. Its own figures (the Pavement '
         'Quality Index for the road network, the share of all its assets in poor or very poor condition, and the '
         'critical assets in poor condition) are shown as published, with their sources.',
         'Water main breaks: every recorded break, placed in the community whose boundary holds it; the last 12 months '
         'against the 12 before, and Calgary by year. Per 100 km: breaks in the last 12 months / km of water main in '
         'the community x 100.',
         'Water mains: each main placed in the community holding its middle point. Middle year laid: the year by which '
         'half the community\'s mains (by length) were in the ground. 50+ years old: length laid 50 or more years ago. '
         'Cast iron: mains recorded as cast iron (CI), the material that breaks most.',
         '311: requests about roads and potholes (pothole, roadway and back lane maintenance), sidewalks (sidewalk, curb '
         'and gutter repair; pathway concerns), streetlights and signals, water mains and valves, sewers and catch '
         'basins: the last 12 months against the 12 before, by community.',
         'Paving planned: road length in the City\'s pavement rehabilitation plan for this year, next year and the '
         'tentative five-year plan, by the community the City lists.',
         'Signals for water: breaks rising (3 or more, more than the year before); ageing mains (the middle year laid 50 '
         'or more years ago, or 40% or more of the length that old); much cast iron (25% or more); water requests to 311 '
         'up 15% or more (at least 5). Both, for water: a condition signal and water requests up. Signals for roads: '
         'road and pothole requests up 25% or more (at least 30); both, for roads: that, with no paving in this year\'s, '
         'next year\'s or the five-year plan. Sidewalk and streetlight requests up 25% or more (at least 10) are shown too.'],
     'limits': ['Breaks are recorded where the City repaired them; a few may sit just across a community line.',
                'More 311 requests can mean more people reporting (new residents, the 311 app) as well as worse condition.',
                'Pavement condition by road is not open data, so the roads are judged by the City\'s network figures, '
                'its paving plan and 311 requests, not a score for each street.',
                'The City\'s condition figures come from its reports, checked November 6, 2026.'],
     'excel': ['Download the table as CSV from the page; the breaks and mains are at data.calgary.ca (dpcu-jr23, w6h9-w33i).'],
     'cautions': ['Breaks and 311 requests are signals of condition, not a condition rating: a community with more pipes, more traffic or more people reporting shows more of both.',
                  'A water main is placed in the community that holds its middle point, so a main running along a boundary is counted on one side only.',
                  'The City\'s pavement plan is tentative beyond next year and changes with the budget.']},
    {'key': 'tourism', 'name': 'Tourism: international arrivals by gateway, airport passengers, and the research behind recommendations',
     'dataset': 'Statistics Canada 24-10-0055 (non-resident visitors entering Canada by port of entry, country, mode and '
                'traveller type, monthly), 23-10-0253 (air passengers by airport and sector, annual), 23-10-0312 (screened '
                'passengers, monthly); research file data/tourism_research.json (Tourism Calgary, Calgary Airport Authority, '
                'Parks Canada and other sources, each cited)',
     'publisher': 'Statistics Canada; the sources named in the research file',
     'page': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2410005501',
     'updated': 'Statistics Canada monthly (arrivals about seven weeks after the month); the research file checked by hand '
                '(its date is in the file)',
     'used_in': 'Data Genie and the Data Scientist (get_dashboard section tourism)',
     'method': [
         'Arrivals: non-resident visitors entering Canada by air at each port (Calgary = YYC, Toronto = Pearson, '
         'Vancouver, Montreal, Edmonton; Canada and Alberta = every airport), overnight tourists, by month for the last '
         'eleven years; a year is counted only when all twelve months are in, the current year is shown to date with '
         'the same months a year before. Shares compare each port with Canada\'s air arrivals.',
         'By country: the same count for each priority country. United States and all other countries are the '
         'table\'s own totals.',
         'Airports: passengers enplaned plus deplaned at each city\'s main international airport, by domestic, '
         'transborder (United States) and other international sectors.'],
     'cautions': ['A port of entry is where a visitor first enters Canada, not where they stay: visitors entering at '
                  'Calgary include many bound for Banff, and visitors entering at Vancouver or Toronto who fly on to '
                  'Calgary are counted there.',
                  'Canadians travelling in Canada are not in these tables; Tourism Calgary\'s figures (research file) cover '
                  'all visitors and are its own estimates.',
                  'Airport passengers include residents, and a connecting passenger is counted twice.'],
     'excel': ['Open table 24-10-0055, choose Geography = Calgary, Mode = Air, Arrival type = All arrivals, Traveller type '
               '= Tourists (overnight), and add the twelve months of a year.']},
    {'key': 'school_tax', 'name': 'School tax and school funding: Calgary against Edmonton and the rest of Alberta',
     'dataset': 'Education property tax requisition comparison report (each year since 2020); Projected operational '
                'funding for school authorities (Budget 2026); Student enrolment by school, authority and grade; Major '
                'Projects inventory',
     'publisher': 'Government of Alberta (Municipal Affairs; Education and Childcare)',
     'page': 'https://open.alberta.ca/publications/education-property-tax-requisition-comparison-report',
     'updated': 'The website reads them every day; the requisition report comes out each spring, funding with each '
                'provincial budget, enrolment each school year',
     'used_in': 'Data Genie and the Data Scientist (get_dashboard section school_tax)',
     'method': [
         'Requisition: the education property tax each municipality collects for the province, residential (with farm '
         'land) and non-residential, as the province\'s comparison report gives it for the year and the year before. '
         'Every report since 2021 is read, so the trend runs from 2020.',
         'Students: every school in the province\'s enrolment file for the latest school year. Calgary: every school '
         'inside the city (public, Catholic, francophone, charter and private), placed with the City\'s schools map. '
         'The file does not give other schools\' municipality, so Edmonton is counted by its two city boards (Edmonton '
         'Public and Edmonton Catholic) and Calgary is also shown the same way (CBE and Calgary Catholic), like with like.',
         'Tax per student: the latest requisition divided by the latest school year\'s students. Rest of Alberta: '
         'Alberta minus Calgary, for both. Calgary\'s share of the requisition is set beside its share of students.',
         'Funding per student: each board\'s operating funding for the school year in the enrolment file, divided by '
         'its students that year. The next year\'s budget is shown too, over the same students, for scale only.',
         'School projects: school projects of $5 million or more in the province\'s Major Projects inventory, not '
         'completed, counted by the municipalities each lists.',
         'Residents: Statistics Canada\'s population estimate for each municipality (census subdivision, July 1, table '
         '17-10-0155), the same count everywhere; tax per resident = requisition / residents. Students per 100 residents '
         'shows how much of a per-student gap comes from fewer children per resident.',
         'Audited spending: each board\'s expenses by program from Alberta Education\'s summary of the audited financial '
         'statements, divided by its students that school year (instruction = ECS plus grades 1 to 12; buildings = '
         'operations and maintenance).',
         'Grants: each board\'s funding profile for the coming year, line by line, divided by its students in the latest '
         'enrolment file. New schools: the projects each budget\'s approved school capital list gives for each city '
         '(Budget 2025 on), against the growth in its two city boards over the same number of years. Class size grant: '
         'teachers funded per 1,000 students.'],
     'cautions': ['The requisition pays about a third of school operating costs; general provincial revenue pays the '
                  'rest, and new schools are paid for separately. Tax per student alone is not money in against money '
                  'out: set it beside funding per student and school projects.',
                  'The tax follows property values: one provincial rate on higher-valued property means more tax, '
                  'whoever is in government. From 2027 the rate is the same in every municipality.',
                  'Funding follows the province\'s formula and student needs (English learners, specialized learning, '
                  'rural schools, transportation), so a difference per student is not by itself unfair.',
                  'Requisitions are calendar years and enrolment school years; board students include some who live '
                  'outside the city; the Major Projects inventory is not the whole school capital plan.',
                  'Some money reaches students without passing through the boards: teacher pensions paid by the province, '
                  'private schools and home education. Board figures understate it, most where private schools are many.',
                  'Until 2024/25 funding followed a weighted moving average of enrolment that pays fast-growing boards for '
                  'fewer students than they have; set funding beside growth.'],
     'excel': ['Open the requisition report PDF for the latest year and copy the City of Calgary, City of Edmonton and '
               'total rows; open the enrolment spreadsheet for the latest school year, filter School Authority Name, '
               'and add the Total column; divide.']},
    {'key': 'safest_cities', 'name': 'Canada\'s safest cities: the Crime Severity Index for every city of 10,000 or more',
     'dataset': 'Crime severity index and weighted clearance rates, police services (tables 35-10-0186 to 35-10-0190, '
                '35-10-0061, 35-10-0063, 35-10-0064); population: 35-10-0077; metropolitan areas: 35-10-0026',
     'publisher': 'Statistics Canada (Uniform Crime Reporting Survey; Police Administration Survey)',
     'page': 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3510019001',
     'updated': 'Statistics Canada publishes each July for the year before; the website checks every day and downloads '
                'again only after a new release',
     'used_in': 'Canada\'s safest cities, Data Genie',
     'method': [
         'The Crime Severity Index weighs every crime reported to police by how serious it is (from the sentences '
         'courts hand down), per resident, with Canada in 2006 set to 100. A lower index means less serious crime per '
         'resident. The violent index counts violent crime only.',
         'Cities: police services marked "municipal" (a city\'s own police or the RCMP under contract to the city), '
         'serving 10,000 people or more (the population the Police Administration Survey gives for the police '
         'service, the latest of the last three years; services the survey no longer lists on their own, such as many '
         'rural OPP and RCMP contracts, are left out). Regional police services (Halton, York, Peel and others) are '
         'ranked as Statistics Canada reports them, as one service. Rank 1 = the lowest index; ties go alphabetically.',
         'Last year\'s rank is the same ranking with last year\'s figures, so the number of cities can differ by a '
         'few. Cities of 100,000 or more are also ranked among themselves. Metropolitan areas: Statistics Canada\'s '
         'census metropolitan areas (the city with the towns around it).',
         'Limits: the index counts crime reported to and recorded by police where it happened; unreported crime, and '
         'how safe people feel, are not in it. Small cities move more from year to year because a few serious crimes '
         'shift their index.'],
     'cautions': ['A rank is a comparison, not a grade: cities close in the list differ by little, and a city can move '
                  'down while its own index falls, when others fall faster.',
                  'The index measures reported crime, not risk to any one person or how safe a neighbourhood feels.'],
     'excel': ['Open table 35-10-0190 (Alberta), choose Crime severity index and the latest year, and sort from the '
               'smallest; do the same for every province and keep the services marked municipal with 10,000 people or '
               'more (table 35-10-0077, Population).']},
    {'key': 'fedbudget', 'name': 'Federal Budget 2026: the numbers, every measure, and province by province',
     'dataset': 'Budget 2026 (budget.canada.ca/2026), all chapters and annexes; Finance Canada, Federal Support to '
                'Provinces and Territories',
     'publisher': 'Department of Finance Canada',
     'page': 'https://budget.canada.ca/2026/home-accueil-en.html',
     'updated': 'Read once, the day the budget was tabled (5 November 2026); transfers as Finance Canada publishes them',
     'used_in': 'Federal Budget 2026 (Overview, Province by province, Calgary and Alberta, Every measure, Tax changes, '
                'Fiscal tables), Data Genie',
     'method': [
         'Federal revenue and spending by province: the budget gives revenue for Canada only, so the split is Statistics '
         'Canada\'s provincial and territorial economic accounts (table 36-10-0450-01, federal general government), by '
         'calendar year: revenue collected from people and businesses in each province (personal and corporate income '
         'tax, GST, excise taxes and duties, EI premiums and the rest) and federal spending there (benefits to residents, '
         'transfers to its government, federal operations, an allocated share of debt interest). Per person: the '
         'population on 1 July (17-10-0009-01). The 2026-27 figure is an estimate: the budget\'s budgetary revenue for '
         '2026-27 (Table A1.8) times each province\'s share of federal revenue in the latest year.',
         'Headline numbers: Annex 1, Table A1.8 (summary statement of transactions), for 2026-27 unless stated. The '
         'deficit is the budgetary balance; spending is total expenses before net actuarial losses (gains); interest on '
         'the debt is public debt charges. Revenue and spending by source and program: Tables A1.9 and A1.10. Fiscal '
         'anchors: Table A1.6 (day-to-day operating balance) and Table A1.5 (capital investment). The comparison with '
         'the Spring Economic Update 2026: the overview\'s Table 1.',
         'New measures: the table at the end of each chapter, $ millions on an accrual basis, five years 2026-27 to '
         '2030-31; "Less" lines (funds from existing resources, projected revenue or savings) are shown under the '
         'measure they belong to. The net cost of all measures is the overview\'s "Subtotal - Budget 2026 measures", '
         'which matches the six chapter totals added up. The text under a measure is the budget\'s own paragraphs under '
         'the heading of the same name, or, failing that, the paragraphs in its chapter section that share most of its '
         'words; for the "Additional investments" lines it is the table\'s own description.',
         'Province by province: the budget\'s own lists (major projects referred to the Major Projects Office in the '
         'Budget in brief; Build Communities Strong Fund projects, Chapter 3; defence investments by region, Figure 5.1; '
         'festivals funded in 2026, Figure 4.1), and every paragraph that names the province or territory or one of '
         'its cities. A regional entry (Prairies, Atlantic Canada, North/Arctic) is listed for each province or '
         'territory in the region, and labelled as regional.',
         'Federal transfers: Finance Canada\'s Federal Support to Provinces and Territories (Canada Health Transfer, '
         'Canada Social Transfer, Equalization, offshore offsets and Territorial Formula Financing), $ millions, with its '
         'per-person allocation, 2017-18 to 2026-27.',
         'Nothing is rated or recommended: the figures are the government\'s own, including its projections.'],
     'excel': ['Every table on the tab is the budget\'s own table, with its title; the Fiscal tables section reproduces '
               'Annex 1 Tables A1.5, A1.6, A1.8, A1.9, A1.10 and A1.11.'],
     'cautions': ['Projections for 2026-27 onward are the government\'s forecasts and change with the economy.',
                  'Most national measures are not divided by province in the budget; the province pages list what the '
                  'budget names there, not each province\'s share of national programs.',
                  'Major transfers exclude other federal transfers (for example infrastructure or child care agreements).',
                  'A mention of a city or province is found by its name; a passage about a region in general terms may '
                  'not name it.'],
     'code': 'fedbudget.py; ui/fedbudget.js'},
    {'key': 'access_revision', 'name': 'What changed on 5 November 2026 (Growth vs amenities)',
     'dataset': 'access, access_crowding', 'publisher': 'Calgary Insight', 'page': '',
     'updated': 'Revised 5 November 2026', 'used_in': 'Growth vs amenities (What changed)',
     'method': ['The earlier method, removed: ' + ' '.join(OLD_METHOD),
                'Why: an audit on 5 November 2026 found that counting inside the boundary per resident misled. A '
                'playground across the street in the next community counted as zero: North Haven Upper had no '
                'playground inside its boundary, yet 96% of its homes are within 400 m of one. Across about 215 '
                'communities the rank agreement between the two measures was about 0.45.',
                'The method now: the distance from every home to the nearest amenity, in any community '
                '(see "Growth vs amenities: how near homes are to amenities"), and for playgrounds and parks how many '
                'children or residents share the ones within reach (see "crowding").',
                'Removed with it: the amenity level, the Needs attention tab and its Urgent, High and Watch tiers, the '
                'growth weight, the "what it would take" list and per-resident amenity counts as headline figures. The '
                'earlier list of 23 communities is replaced.'],
     'excel': [], 'cautions': [], 'code': 'access.py (REVISION, OLD_FLAGGED)'},

    {'key': 'homes', 'name': 'Homes: how they are counted (each ward, each community)',
     'dataset': '4bsw-nn7w (Current Year Property Assessments), msjx-5ygv (2021 Census households)',
     'publisher': 'City of Calgary', 'page': 'https://data.calgary.ca/d/4bsw-nn7w', 'updated': 'Property roll: through the year',
     'used_in': 'Compare wards (Homes), Growth vs amenities (growth checks), community details, the growth model',
     'method': ['Start from every account on the City\'s property assessment roll.',
                'Keep the residential class only (assessment_class RE): commercial and industrial property (NR) and '
                'farm land (FL) are left out.',
                'Keep land with a building only (property_type LI): vacant lots and land without a building (LO) are '
                'left out.',
                'Keep residential uses only (sub_property_use starting with R): detached houses (R110), semi-detached '
                'and duplex homes (R120, R121), condo apartments in low-rise (R201, R202) and high-rise buildings (R301, '
                'R302), townhouse and row units (R401, R402) and the other R codes. Condo parking stalls (A004, about '
                '59,000 accounts, e.g. "60V 9449 19 ST SW", $10,000), storage lockers (A005, e.g. "119S") and other '
                'non-home accounts (A codes) are separate accounts on the roll and are left out, so a condo with a stall '
                'and a locker counts once.',
                'Each home counts as lived in one year after its year of construction (homes added evenly through each '
                'year).',
                'Rental apartment buildings are one account for the whole building: the building is taken out and its '
                'units are added from matching building permits (lived in 6 months after the permit is completed) or, '
                'where there is none, estimated from its assessed value.',
                'Homes on Census day are checked against the households the 2021 Census counted: Calgary 494,282 homes '
                'against 500,990 households (1.3% fewer); each ward\'s check is on Growth vs amenities.',
                'A ward\'s homes are the homes of its communities (the ward holding most of each community\'s area). '
                'Residents per home = residents (the way chosen in Settings) / homes lived in today.'],
     'excel': ['Download 4bsw-nn7w filtered to assessment_class = RE, property_type = LI and sub_property_use starting '
               'with R, for the community codes of the ward; count the rows by year_of_construction.'],
     'cautions': ['Homes, not people: a home holds more people where households are larger, and secondary suites in '
                  'houses are not separate accounts, so a house with a basement suite counts as one home.',
                  'Residents per home is a check on the way of counting: Ward 10 shows 3.82 under "one rate for all" on '
                  'only 1.7% more homes since 2021, a sign that one rate for all overstates it.'],
     'code': 'population.py: HOMES_WHERE, homes, units, homes_lived_in, recon; dashboard.py: ward_summaries, population_recon. '
             'Growth vs amenities > Population build-up shows it community by community and lists every property'},

    {'key': 'growth_checks', 'name': 'Growth checks: is the population growth believable?',
     'dataset': '4bsw-nn7w (homes), City population outlook, Alberta student enrolment by school, fd9t-tdn2 (schools)',
     'publisher': 'City of Calgary; Government of Alberta', 'page': '', 'updated': 'With every refresh',
     'used_in': 'Growth vs amenities (top), Data Genie',
     'method': ['Homes alone: homes lived in on the property roll today / at the 2021 Census - 1, people per home as '
                'in 2021 (close to the growth model, which uses each community\'s own people per home).',
                'Homes plus more people per home: Calgary\'s people per home change = (the City\'s estimate now / at the '
                'Census) / (Calgary\'s homes now / at the Census) - 1, about +5.5% (20.7% more people on 14.4% more '
                'homes). The area: (1 + its homes growth) x (1 + that change) - 1 = real growth. For all of Calgary this '
                'gives the City\'s own growth: 1.144 x 1.055 = +20.7%. Read against the 2021 Census count, like the ways '
                'of counting that add up to the City\'s total, it is x 1.027 (the City\'s estimate on Census day / the '
                'Census count: people the Census count of private homes left out).',
                'School enrolment: students in the area\'s schools from 2021/2022 to the latest year, against every '
                'Calgary school; Calgary\'s growth x (the area\'s enrolment growth / Calgary\'s).',
                'The range runs from the lowest to the highest check; each way of counting is marked within it, within 1 point '
                'of it (rounding and the growth model\'s own people per home in each community), or above or below it.'],
     'excel': ['Homes: sum homes_now and homes_census over the area\'s communities (the dashboard\'s community table).'],
     'cautions': ['Each check assumes something: that homes filled up like Calgary\'s average, or that children moved '
                  'with the population. Schools take students from outside the area, and a new school pulls students in.',
                  'The 2026 Census (counted May 2026) settles it: population counts are released on February 10, 2027.'],
     'code': 'dashboard.py: growth_checks; families.py: city_school_totals'},

    {'key': 'live_counter', 'name': 'Live population counter (dashboard)', 'dataset': 'City population outlook + growth model',
     'publisher': 'Calgary Insight', 'page': '', 'updated': 'Every second in the browser; its two anchor figures every refresh',
     'used_in': 'Dashboard (Residents today tile)',
     'method': ['Work out the selected area\'s residents on the first day of this month and of next month, the way of '
                'counting chosen in Settings (the same calculation as every other figure).',
                'Join them with a straight line: residents now = this month\'s figure + (next month\'s - this month\'s) x '
                '(time since midnight on the 1st) / (time from the 1st to the 1st of next month), shown to 3 decimals.',
                'Under the City\'s total the monthly figures sit on the City\'s straight line between April figures, so the '
                'counter moves at the City\'s forecast pace: from April 2026 to April 2027, 1,583,200 to 1,608,700, about '
                '70 people a day for Calgary. A ward moves at its own pace under the chosen count.',
                'Each morning\'s refresh works the two figures out again and the counter carries on from there; at the end '
                'of the month the next line starts exactly where this one ends. Under the 2021 Census count it stands still.'],
     'excel': ['(Next month\'s figure - this month\'s) / days in the month = people a day; this month\'s figure + people a day '
               'x days since the 1st = today\'s live figure.'],
     'cautions': ['A forecast pace, not a count: nobody counts residents day by day.'],
     'code': 'dashboard.py: population_live, _local_midnight_ms (the browser draws the same straight line, ui/app.js livePop)'},

    {'key': 'other_amenities', 'name': 'Amenities that are not the City\'s (OpenStreetMap), without double counting',
     'dataset': 'OpenStreetMap: leisure=playground, fitness_station, pitch (sport=basketball), dog_park, park',
     'publisher': 'OpenStreetMap contributors (Open Database Licence)', 'page': 'https://www.openstreetmap.org/copyright',
     'updated': 'Read again every week with the City\'s assets', 'used_in': 'Growth vs amenities (the optional "Count private amenities" filter, playgrounds and parks), Assets list',
     'method': ['Ask OpenStreetMap (Overpass API) for every playground, fitness station, basketball court, dog park and '
                'park inside a box around Calgary.',
                'Take out every one the City already lists: a City playground (Playground Equipment) within 80 m of its '
                'middle or inside its outline; City fitness equipment or a basketball hoop (Parks Sport Equipment) within '
                '40 m or inside it; a dog park whose middle is inside a City off-leash area or within 100 m of one\'s '
                'middle; a park with 30% or more of its area inside City park sites (Parks Sites). Anything tagged as '
                'operated or owned by the City of Calgary is the City\'s too.',
                'Take out closed, customers-only, paid and indoor ones. Ones marked private (residents only: homeowners\' '
                'association, condo) are kept apart and count only when the "include private ones" filter is on (off by '
                'default); they still take part in the duplicate check. Also take out '
                'the same thing mapped twice (within 25 m or inside an outline already counted; parks 30% inside one already '
                'counted), and parks '
                'under 0.05 ha or over 20 ha.',
                'Place each one left in the community holding its middle and count it: playgrounds, fitness stations and '
                'dog parks 1 each; basketball courts their hoops tag (else 1); parks their area in hectares, added to '
                'neighbourhood park space.',
                'They are listed beside the City\'s counts in the Assets list. On Growth vs amenities they count only when '
                'the "Count private amenities accessible to the community" filter is on (off by default), and then only '
                'for playgrounds and parks: the distance to the nearest one and the crowding. An OpenStreetMap park is a '
                'circle of its own area around its middle. Gated, residents-only ones count only when "Also count gated" '
                'is ticked too.'],
     'excel': ['Open overpass-turbo.eu, run the query for one kind (for example leisure=playground) over a community, '
               'and compare each result with the City\'s Playground Equipment points (bdu9-amk8) on the same map.'],
     'cautions': ['Volunteer-edited: coverage is uneven; a missing feature means nobody has mapped it yet.',
                  'Matching is by distance: two separate playgrounds closer than 80 m count as one City one.',
                  'A fitness station may hold several pieces, the City counts each piece.'],
     'code': 'osm.py (fetch, build, MATCH_M, PARK_OVERLAP, SAME_M); assets.py builds both counts; dashboard.with_other'},

    {'key': 'shading', 'name': 'Map shading, flags and colours', 'dataset': 'all', 'publisher': 'Calgary Insight',
     'page': '', 'updated': '', 'used_in': 'Maps, Compare wards, tiles',
     'method': [
         'A ward map shades its communities in 5 equal steps from the lowest to the highest value.',
         'The whole-city map has about 200 communities, so it uses 5 equal-sized groups instead (each shade holds a fifth '
         'of the communities), so a few extreme values do not wash out the rest.',
         'Compare wards map: 5 equal steps between the lowest and highest ward; where one direction is better the darker '
         'shade is always the better one.',
         'Change chips are green or red only where a direction is clearly better (crime down is good); counts of 311 '
         'reports are shown neutral, because more reporting is not in itself good or bad.'],
     'excel': [], 'cautions': []},

    {'key': 'profile_wards', 'name': 'Who lives in each ward (2021 Census by ward)', 'dataset': 'k4pr-cznc, jzfi-qvb4, b5q8-82zn',
     'publisher': 'City of Calgary (Statistics Canada 2021 Census)', 'page': 'https://www.calgary.ca/communities/profiles/wards.html',
     'updated': 'Census 2021; read again weekly', 'used_in': 'Who lives here (every ward), Compare wards, Data Genie',
     'method': [
         'Population and Dwellings by Ward (k4pr-cznc), Families and Households by Ward (jzfi-qvb4) and Employment by '
         'Ward (b5q8-82zn), against the same three tables for the whole city (fm6w-acnx, u75s-8rqc, 8w7b-2yqx).',
         'Shares: children 0 to 14 and seniors 65+ / people in private households; households of 5 or more and people '
         'living alone / private households; one-parent families / census families; in the labour force / people 15+; '
         'unemployed and self-employed / the labour force.',
         'One ward also shows the City\'s printed ward profile (languages, newcomers, housing costs, income), kept with '
         'Calgary Insight (see "The City\'s printed ward profile").'],
     'excel': ['Download the three ward tables and divide the columns named above.'],
     'cautions': ['2021 Census on the wards as they were in 2021; the 2026 Census replaces it when the City publishes it.']},

    {'key': 'rents_area', 'name': 'Which CMHC rent area a ward gets', 'dataset': 'CMHC Rental Market Survey',
     'publisher': 'Canada Mortgage and Housing Corporation', 'page': 'https://www03.cmhc-schl.gc.ca/hmip-pimh/',
     'updated': 'Each October survey', 'used_in': 'Rents and vacancy, newsletter',
     'method': ['A CMHC neighbourhood is used when its name lists at least a quarter of the ward\'s residential '
                'communities (and at least two); otherwise the CMHC survey zone matching most of the ward\'s communities\' '
                'sectors (Northeast, Northwest ...) is shown and named as a zone. The city view shows Calgary only.'],
     'excel': [], 'cautions': ['CMHC areas do not follow ward lines.']},

    {'key': 'budget', 'name': 'City budget', 'dataset': 'fqax-i3nz', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/fqax-i3nz', 'updated': 'Each budget adjustment (November); read daily',
     'used_in': 'City budget, Data Genie',
     'method': ['Every line of Calgary Open Budget, added up by year, budget (operating or capital), department and '
                'business unit. Operating is "Operating Expenditures Net of Recoveries"; capital is "Capital". Amounts are '
                'in millions of dollars, as the City publishes them.',
                'Per resident = the budget / the City\'s population estimate for this month.',
                'Capital already approved for 2027 and later years (no budget has been set for them yet) comes from the '
                'City\'s 2027-2030 Budget open data (nnnm-9sfh, budget_status Approved), the same figures as the screen\'s '
                'table of the proposed budget. The open budget also lists those years but puts some projects (the Green Line '
                'above all) in different years, so its figures for them are not used and the two are never added together.',
                'By ward: the City does not publish its budget by ward. The ward table adds up only the published costs of '
                'City and partner projects and road projects listed on Calgary Insight with a location in the ward (the largest '
                'dollar amount named in each project\'s cost).'],
     'excel': ['Download fqax-i3nz, filter year and fund, and sum budget by budget_department.'],
     'cautions': ['Project costs are often spread over several years and shared with other governments, so they do not '
                  'add up to a year\'s capital budget.']},

    {'key': 'property_tax', 'name': 'Property tax by ward and community (estimate)', 'dataset': '4bsw-nn7w, 2026 Property Tax Bylaw 9M2026',
     'publisher': 'City of Calgary; Alberta Municipal Affairs (bylaw)',
     'page': 'https://municipalaffairs.gov.ab.ca/cfml/FinancialTaxRateSearch/pdf/tr_bylaws/2026_Bylaw_CALGARY_0046.pdf',
     'updated': 'Roll: through the year, read weekly; rates: each spring (bylaw)',
     'used_in': 'City budget (property tax by ward), Data Genie',
     'method': ['The City does not publish property tax by ward. Assessed values: the Current Year Property Assessments roll '
                '(4bsw-nn7w), added up by community and sub_property_use, for residential (re_assessed_value), '
                'non-residential (nr_assessed_value) and farm land (fl_assessed_value).',
                'Exempt property left out: non-residential property whose sub_property_use starts with S (public and '
                'institutional: hospitals, schools, universities, places of worship, utilities, police and fire, airport) '
                'or P (parks, reserves, libraries, arenas, pools, museums).',
                'Scaling: what is left is multiplied, class by class, so Calgary\'s total equals the taxable assessment in '
                'the bylaw (municipal: residential x 0.9765, non-residential x 0.7885). Exemptions the roll does not show '
                'are spread evenly.',
                'Tax billed = scaled assessment x the bylaw\'s rates. 2026 municipal (City) rates: residential 0.0038906, '
                'non-residential 0.0179986, farm land 0.0339557; education (Province): residential 0.0027593, '
                'non-residential 0.0041502, farm land 0.0027593.',
                'City share = the municipal tax; the rest of the bill is the Province\'s education tax, which the City '
                'collects and passes to the Government of Alberta. Paid on homes = residential tax / all tax billed.',
                'A ward is the sum of its communities (the City\'s community-to-ward table). Calgary\'s total equals the '
                'bylaw\'s levy: $3,756.6M ($2,520.9M City, $1,235.7M education).',
                'Against the budget: the 2026 budget book\'s "Property tax, including levies" ($2,551M) also holds local '
                'improvement and community revitalization levies and tax from properties added during the year, which '
                'cannot be placed by ward; the City share placed in wards is $2,521M.'],
     'excel': ['Download 4bsw-nn7w with comm_code, sub_property_use, re/nr/fl_assessed_value; drop rows with nr value and '
               'sub_property_use starting S or P; sum by community; multiply by the factors and rates above.'],
     'cautions': ['An estimate of tax billed (the levy), not tax collected: arrears, appeals and in-year changes are not '
                  'published by property.',
                  'Exempt business property the roll does not flag is spread evenly, so wards with much public or '
                  'institutional land (Ward 7 downtown, industrial wards 9 and 10) carry the most uncertainty.']},

    {'key': 'report_auditor', 'name': 'Report auditor (Data Scientist)', 'dataset': 'The report and the queries behind it',
     'publisher': 'Calgary Insight', 'page': 'https://calgaryinsight.ca/', 'updated': 'Each audit',
     'used_in': 'Data Scientist, Report auditor tab',
     'method': ['Step 1, audit by Chinook: reads the report and every query it ran, re-runs the queries with the same '
                'filters and periods, recomputes every total, rate, share and change with the calculator, and checks the '
                'sources, the method, the wording and the recommendations. It lists findings with its evidence and changes '
                'nothing.',
                'Step 2, review and fix by Bow: re-checks each finding itself, accepts, revises or rejects it with '
                'its own numbers and reasons, and makes the corrected report, changing only what the accepted and revised '
                'findings require.',
                'Step 3, final check by Rundle: checks only the step 1 findings: each accepted one fixed correctly in '
                'the corrected report, each rejected one rightly rejected.',
                'The audit page lists every finding with all three verdicts; the corrected report is saved like any report '
                '(title ending "(audited)").'],
     'excel': ['Each finding names the query or calculation re-run, so it can be repeated by hand.'],
     'cautions': ['The engines can still miss a problem; a finding the final check marks "not fixed" or "wrongly rejected" '
                  'needs a person to look at it.',
                  'Reports made before the auditor existed are checked from their text, without the list of queries behind them.']},

    {'key': 'weather', 'name': 'Daily climate data, Calgary International Airport', 'dataset': 'Environment Canada climate',
     'publisher': 'Environment and Climate Change Canada', 'page': 'https://climate.weather.gc.ca/',
     'updated': 'Daily', 'used_in': 'Data Genie',
     'method': ['Daily temperature, rain, snow and snow on ground at the Calgary International Airport station '
                '(northeast Calgary), back to 1881; grouped by month or year on request. The forecast is Environment '
                'Canada\'s public forecast for Calgary, about 7 days ahead.'],
     'excel': [], 'cautions': ['One station for the whole city: snow and temperature vary across Calgary.']},

    {'key': 'budget_intelligence', 'name': 'Budget Intelligence: the 2027-2030 budget requests',
     'dataset': 'City of Calgary, "2027-2030 budget request business cases" (PDF, 792 pages); checked against open data nnnm-9sfh',
     'publisher': 'City of Calgary', 'page': 'https://www.calgary.ca/content/dam/www/ca/city-manager/documents/2027-2030-budget/2027-2030-operating-capital-budget-requests.pdf',
     'updated': 'A snapshot of the City\'s document (last changed by the City on November 9, 2026), read by hand when the City publishes a new version; the open budget it is checked against is read daily',
     'used_in': 'Budget Intelligence, Data Genie, Data Scientist',
     'method': ['Every business case in the City\'s document is read from the PDF: its number, title, department, business unit, the reason the City gives, and its page. '
                'Operating requests: the City\'s table "Proposed funding amount" (one-time and ongoing, in millions of dollars, and full-time equivalents, 2027 to 2030). '
                'Capital requests: the rows "4-Year Capital Budget Consideration" and "10-Year Capital Infrastructure Needs" (thousands of dollars), the Budget ID, kind, ward(s), stage, funding source, service area and the City\'s split by purpose.',
                'Names and figures are kept exactly as the City prints them; a dash in the City\'s table is kept as a dash and counted as nothing in a sum. Thousands are divided by 1,000 to show millions; sums are made on the unrounded figures and rounded once for display.',
                'Checked when read: each title against the contents pages; each printed page number against the PDF\'s own; each capital total against the sum of its years (within $3,000); each split against 100%; and every figure row read a second time with a different PDF reader.',
                'Capital by purpose = each capital request\'s four-year amount x the City\'s percentage for that purpose, added up.',
                'Reconciliation, worked out again on each visit: the capital requests added by year, against the City\'s open data (nnnm-9sfh) rows with fund Capital and status Proposed; and the same by business unit, with the document\'s names matched to the open data\'s by a hand-kept list.',
                'Ongoing operating amounts are additions to the base budget in that year (the City itself adds a request\'s yearly figures to state its ongoing amount). No four-year cash cost is worked out.',
                'By ward: only requests that name a ward are counted for it; a request naming several wards is counted in each and its dollars are not divided. Nothing citywide is divided among wards, communities or residents.',
                'Tax simulator: assessed value x the 2026 municipal residential rate, then x (1 + the percentage chosen). A what-if, not a bill.'],
     'excel': ['On Budget Intelligence, Business cases, choose "Save this list". Add "Capital total ($000s)" for the capital rows and divide by 1,000: 13,051.5 million.',
               'Download nnnm-9sfh, filter fund = Capital and budget_status = Proposed, and add budget_millions by year: it should be within 0.1% of the same years added from the saved list.'],
     'cautions': ['Everything is proposed, not approved, until Council votes on the 2027-2030 budget.',
                  'The City\'s descriptions, benefits and risk statements are not copied; each request links to its page.',
                  'The City\'s open data gives either an approved budget or actual spending for a year, never both, so budget against actual is not worked out from it. The Budget vs actual tab takes it, with page numbers, from the City\'s Annual Financial Reports and year-end updates for 2023 to 2025.',
                  'About 92% of the proposed capital dollars are for all wards.',
                  'Two City datasets give different figures for capital already approved for 2027 to 2030; both are shown.',
                  'One-time totals add what each request\'s table shows, which is the part in the proposed budget. For some requests the City\'s note under the table says the full one-time request is larger; those are listed under Data checks.',
                  'Positions are the full-time equivalents in each request\'s own row. A request\'s text can mention other staff that are not in its row, so the totals are not the City\'s whole change in staff.']},
]


# where each method lives in the code (Data Genie's get_code reads it; the "How it's counted" screen names it)
CODE_WHERE = {
    'amenity_assets': 'dashboard.py: amenity_view, inventory; assets.py (counting)',
    'amenities': 'dashboard.py: amenity_view; assets.py',
    'population_choice': 'dashboard.py: POP_METHODS, DEFAULT_POP_METHOD, counts, _raw, actual_factor, city_factor, new_people, total_fix, estimate',
    'population': 'population.py (growth model); dashboard.py: estimate',
    'children': 'dashboard.py: CITY_KIDS_APRIL, city_children_at, kids_at, kid_factors, kid_added, kid_factors_actual, kids_as',
    'rates': 'dashboard.py: _pct, GROWING_PCT, ward_summaries',
    'compare': 'dashboard.py: ward_summaries',
    'police': 'police.py',
    'property_tax': 'proptax.py',
    'budget': 'budget.py',
    'budget_intelligence': 'tools/budget_intel_extract.py (reading the PDF); budget_intel.py (Data Genie); ui/budget-intel.js (the screen and its checks); tools/budget_intel_check.py',
    'child_care': 'families.py',
    'schools': 'families.py',
    'rents': 'rents.py',
    'wards': 'wards.py, geo.py',
    'report_auditor': 'auditor.py',
}
for _m in METHODS:
    _m.setdefault('code', CODE_WHERE.get(_m['key'], ''))


def find(topic=None):
    """Method notes for a topic (dataset id, key or a word in the name); all names when topic is empty."""
    if not topic:
        return {'topics': [{'key': m['key'], 'name': m['name'], 'dataset': m['dataset']} for m in METHODS]}
    t = str(topic).strip().lower()
    hits = [m for m in METHODS if t == m['key'] or t in m['dataset'].lower() or t in m['name'].lower()
            or any(t in x.lower() for x in m['used_in'].split(','))]
    return {'methods': hits} if hits else {'error': f'No method notes for "{topic}"', **find()}
