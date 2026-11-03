"""How the app counts every figure, dataset by dataset.

One place for the method notes that Data Genie reads (get_method) and the Data sources tab shows ("How the app
counts it"), so a person or the assistant can explain or reproduce any dashboard number, for example in Excel.
"""

W5_CODES = ('CAS, CSC, CNS, FAL, HSD, MRT, RSN, SAD, SKR, TAR (residential: Castleridge, Cityscape, Cornerstone, '
            'Falconridge, Homestead, Martindale, Redstone, Saddle Ridge, Skyview Ranch, Taradale) and SRI, DBC, SGL, '
            'SKE, WES, PEG, CIA, ST2, ST3, ST4, 05D, 05E, 05F, 05G (business, industrial and airport areas, no homes)')

# The amenity level, step by step (dashboard.py uses these numbers: GAP_GROWTH_PCT 20, GAP_LEVEL 0.75,
# MIN_RATE_RESIDENTS 100; a test checks they match).
AMENITY_STEPS = [
    'Count every City asset of each kind in each community, from City of Calgary open data (the datasets are listed '
    'with each kind). Point assets go to the community whose outline holds them; parks and off-leash areas go to the '
    'community holding their middle; public trees use the City\'s own community code. Park space is in hectares.',
    'Divide each count by the community\'s residents and multiply by 1,000. Playgrounds are divided by children aged '
    '0 to 14 instead, since they are for children.',
    'Do the same for Calgary as a whole (every residential community added together).',
    'Divide the community\'s figure by Calgary\'s for each kind: 1.00 means the same as the city, 0.50 half, 2.00 '
    'double.',
    'Cap each kind at 2.00, so having far more of one thing (say benches) cannot hide having none of another.',
    'The amenity level is the plain average of those capped shares. For a community it uses the neighbourhood '
    'amenities only (the kinds Calgary has enough of for at least one in every two communities, plus park space and '
    'trees); park washrooms, drinking fountains, libraries, recreation facilities and community centres are too few to '
    'expect one in every community, so they are left out of community levels and counted in ward and city levels.',
    'A ward\'s level is worked out the same way from all its residential communities together, over every kind.',
    'A community is flagged "not kept up with growth" when it grew more than 20% since the 2021 Census '
    '(or did not exist then) and its level is below 0.75.',
    'Communities with fewer than 100 residents are left out: per-resident figures mean nothing there.',
    'Residents are counted the way chosen in Settings (growth model by default). The levels under all three counts are '
    'shown together. With "grown to the City\'s total" every community grows by the same factor, so its shares against the city '
    'are the same as with the 2021 Census; only the growth model changes them.',
]


METHODS = [
    {'key': '311', 'name': '311 Service Requests', 'dataset': 'iahh-g8bj', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/iahh-g8bj', 'updated': 'Daily',
     'used_in': 'Status board, map, 311 charts, Open issues, community table, newsletter',
     'method': [
         f'Ward 5 = requests whose comm_code is one of the 24 Ward 5 communities: {W5_CODES}.',
         'Requests in a period: requested_date from the first day of the first month to the last day of the last month. '
         'Duplicates are left out: status_description "Duplicate (Open)" and "Duplicate (Closed)".',
         'Per 1,000 residents a year: requests in the 10 residential communities / Ward 5 growth model population at '
         'the middle of the period x 1,000 x (12 / months in the period). Business areas have no residents, so their '
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
         'short or recent period looks faster than it will end up). Calgary uses every request with a community.',
         'Made through the app: source = "App" as a share of the period\'s non-duplicate requests (Web and Other, '
         'mostly phone, are the rest).',
         'City service: the first part of service_name, before " - " (Roads, WATS = Water, WRS = Waste and '
         'Recycling, CT = Calgary Transit, Bylaw, Parks and so on).',
         'The 311 study ("our study"): requested_date 2024-10-01 to 2026-09-30, no duplicates, no blank community, '
         'nine Ward 5 communities (all residential codes except HSD): 56,473 requests.'],
     'excel': [
         'Filter comm_code to the Ward 5 codes above (or one community).',
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

    {'key': 'profile', 'name': 'Who lives in each ward (2021 Census by ward; the City\'s full Ward 5 profile)', 'dataset': 'Ward profile PDF',
     'publisher': 'City of Calgary (Statistics Canada 2021 Census, Community Data Program)',
     'page': 'https://www.calgary.ca/communities/profiles/wards.html',
     'updated': '2021 Census (published 2023, revised July 2025); next: 2026 Census results from early 2027',
     'used_in': 'Who lives in Ward 5 card, Data Genie reports',
     'method': ['Figures are copied from the City\'s Ward 5 profile, Ward 5 next to Calgary, and kept with the app '
                '(data/ward5_profile_2021.json). Nothing is estimated or grown: they describe May 2021.',
                'People in private households only; 2021 ward boundaries; income is for 2020; work questions refer to '
                'May 2021, during the pandemic.'],
     'excel': ['Open the Ward 5 profile from the City\'s ward profiles page; each figure is in the table named on the card.'],
     'cautions': ['Ward 5 has grown about 30% since 2021, mostly in new communities, so shares today may differ.',
                  'Statistics Canada rounds counts to the nearest 5.']},

    {'key': 'being_built', 'name': 'Being built (City projects, roads, large building permits)',
     'dataset': 'City project pages; sizs-hgef; c2es-76ed', 'publisher': 'City of Calgary',
     'page': 'https://www.calgary.ca/planning/parks-rec/northeast-athletic-complex.html',
     'updated': 'City projects: checked by hand (data/ward5_projects.json); roads and permits: at each refresh',
     'used_in': 'Growth and amenities (Being built, Amenities), the dashboard amenities card, map layer, Data Genie',
     'method': ['City projects under construction or approved that the City\'s open data lists of facilities do not have '
                'yet, each checked against the City\'s own project page (Northeast Athletic Complex, Saddle Ridge).',
                'Road projects: Road Construction Projects (sizs-hgef) in or near Ward 5.',
                'Large building permits: Building Permits (c2es-76ed) issued in the period in Ward 5 communities, '
                'estimated project cost over $1,000,000 and no housing units, largest first.'],
     'excel': ['Building permits: filter c2es-76ed to Ward 5 community codes, issueddate in the period, housingunits empty '
               'or 0, estprojectcost > 1000000; sort by estprojectcost.'],
     'cautions': ['Amenity counts include only facilities open now; a facility being built is listed separately until it opens.',
                  'Estimated project cost is what the applicant declared on the permit, not the final cost.']},

    {'key': 'population_choice', 'name': 'How residents are counted (Settings)', 'dataset': 'f9wk-wej9, 4bsw-nn7w, City population outlook',
     'publisher': 'City of Calgary', 'page': 'https://www.calgary.ca/cfod/finance/corporate-economics/economic-outlook-population-outlook.html',
     'updated': 'Census: 2021; property roll: through the year; City outlook: each spring',
     'used_in': 'Residents, every rate per 1,000, population charts, children estimates, newsletter, Data Genie',
     'method': [
         'Growth model (default): each community\'s 2021 Census count grown with the homes on the property roll (see '
         '"Ward 5 growth model" below).',
         '2021 Census, no growth: each community\'s 2021 Census count (total_pop_household, f9wk-wej9), unchanged. The '
         'City\'s own 311 ward dashboard counts this way (it divides by 2021 Census households).',
         'Grown to the City\'s total: all of Calgary adds up to the City\'s own population estimate for that month '
         '(Calgary and Region Economic Outlook 2026-2031: estimates 2021-2025, forecast from 2026, read between the April 1 '
         'figures). Communities built since 2021 have no 2021 count, so they keep their growth model count (19 '
         'communities, 29,547 people in November 2026). Every other community is its 2021 Census count x one factor = '
         '(the City\'s estimate - those new communities) / Calgary\'s 2021 Census count (1,288,995 people in private '
         'households). November 2026: (1,598,075 - 29,547) / 1,288,995 = 1.217, so each older community is 21.7% above '
         'its 2021 count. Ward 5: 106,185 x 1.217 = 129,212, plus Homestead (built since 2021) 2,326 = 131,538.',
         'The factor is more than growth: the City\'s estimate also counts people the 2021 Census count of private '
         'households leaves out (seniors\' homes, residences, shelters) and those it missed. On Census day the City\'s '
         'estimate was already 2.7% above the Census count (1,323,783 against 1,288,995); the City\'s own growth from '
         'May 2021 to November 2026 is 20.7%. So "growth since 2021" under this choice reads higher than real growth, '
         'and growth for amenity flags always uses the growth model.',
         'Rates per 1,000 residents = count / residents in the middle of the period x 1,000 x (12 / months).'],
     'excel': ['2021 Census: filter f9wk-wej9 to the Ward 5 community codes and add up total_pop_household (106,185).',
               'Grown to the City\'s total: subtract the growth model residents of communities with no 2021 count from the '
               'City\'s population for the date, divide by 1,288,995 (f9wk-wej9 total_pop_household added up over every '
               'residential community), and multiply each older community\'s 2021 count by the result.'],
     'cautions': ['The growth model follows homes built, so it can undercount established areas that grew by filling '
                  'existing homes and towers (more people per unit); "grown to the City\'s total" grows every community '
                  'at the same rate, so it undercounts communities where many homes were built (Ward 5: growth model '
                  '137,391, City\'s total 131,538).',
                  'No one has counted Ward 5\'s people since 2021; every choice is an estimate except the 2021 Census itself.']},

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
         'Where homes on Census day differ from 2021 Census households by more than 15% (Redstone, Skyview Ranch), new '
         'homes get the community\'s 2021 household size. Homestead had no 2021 count, so it uses the Calgary average '
         '(2.66 people per home).',
         '2021 Census: 2021 Federal Census Population by Community (f9wk-wej9, total_pop_household) and Households '
         '(msjx-5ygv, total_private_households). Ward 5: 106,185 people in 29,585 households.'],
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
         'fast-growing ones. The 2026 Census by community (expected 2027) will allow a direct check.']},

    {'key': 'children', 'name': 'Children (estimate)', 'dataset': 'f9wk-wej9 + growth model', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/f9wk-wej9', 'updated': 'Census 2021, grown monthly',
     'used_in': 'Families and schools, child care spaces per 100 children, children per playground',
     'method': [
         'Each community keeps its 2021 Census children (pop_age_0_to_4, pop_age_0_to_14) for the residents it had '
         'in 2021.',
         'Residents added since 2021 are given the share of children seen in 2021 in Ward 5\'s newest communities '
         '(Cityscape and Cornerstone): about 27.5% aged 0 to 14 and 12.8% under 5.'],
     'excel': ['Take each community\'s 2021 Census children, then add (residents today - 2021 residents) x 27.5% '
               '(0 to 14) or x 12.8% (under 5).'],
     'cautions': ['No public count of children by community exists after 2021.']},

    {'key': 'permits', 'name': 'Building Permits', 'dataset': 'c2es-76ed', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/c2es-76ed', 'updated': 'Daily',
     'used_in': 'Homes in building permits (status board, community table, newsletter)',
     'method': [
         'Homes in permits = the sum of housingunits on building permits in the 24 Ward 5 communities (communitycode).',
         '"Applied for": applieddate in the period. "Issued": issueddate in the period.'],
     'excel': ['Filter communitycode to the Ward 5 codes and issueddate (or applieddate) to the period; sum housingunits.'],
     'cautions': ['Planned homes, not finished ones: a home is lived in a year or more after its permit.']},

    {'key': 'dp', 'name': 'Development Permits', 'dataset': '6933-unw5', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/6933-unw5', 'updated': 'Daily',
     'used_in': 'Development permit card, Growth and amenities, newsletter',
     'method': [
         'Ward 5 = the permit\'s own ward field = "5". Applications = applieddate in the period.',
         'Types are grouped from category: New homes and apartment buildings; Secondary (basement) suites; Change of '
         'use; New commercial and industrial; Non-residential renovations; Home businesses; Signs; Relaxations (small '
         'exceptions to the rules); Home additions and renovations; Other.',
         'Larger developments = New homes and apartment buildings + Change of use + New commercial and industrial.',
         'Approved = statuscurrent "Released". In review also counts "Approved" (decided, not yet released while the '
         'appeal period runs), Hold and Pending Appeal. Also counted: refused, cancelled.'],
     'excel': ['Filter ward = 5 and applieddate to the period; count rows, or group by category.'],
     'cautions': ['"Change of use" includes new child care centres, schools, clinics and places of worship.']},

    {'key': 'traffic', 'name': 'Traffic Incidents', 'dataset': '35ra-9556', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/35ra-9556', 'updated': 'Continuously',
     'used_in': 'Traffic incidents (status board), map points',
     'method': ['Incidents with start_dt_utc in the period whose exact latitude and longitude fall inside the Ward 5 '
                'boundary (Ward Boundaries, tz8z-hyaz). The map shows the last 90 days of the period.'],
     'excel': ['Filter start_dt_utc to the period, then keep rows inside Ward 5 (quadrant NE and a map check; the app '
               'does the boundary test exactly).'],
     'cautions': ['The City stores times in UTC; the app converts them to Calgary time and counts months by Calgary dates. '
                  'These are incidents the City reports for traffic, not every collision.']},

    {'key': 'police', 'name': 'Community safety data (crime and disorder)', 'dataset': 'Community-Safety-Data xlsx',
     'publisher': 'Calgary Police Service',
     'page': 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata',
     'updated': 'Every quarter (monthly figures)',
     'used_in': 'Crime tiles, Crime in Ward 5, disorder card, newsletter, Data Genie',
     'method': [
         'The spreadsheet linked as "Download Community Safety Data" on the police page; the app finds the current '
         'link at each refresh and downloads it only when it changes.',
         'Ward 5 = rows whose Ward column is "Ward 5" (the police assign each community to a ward, including the airport '
         'and business areas).',
         'Crime categories: assault and other violence (not domestic), street and commercial robbery, break and enter '
         '(homes, businesses, other premises such as garages), theft from vehicles and vehicle theft.',
         'The period is the dashboard period moved back to the latest month the police have published, compared with '
         'the same months a year before.',
         'Per 1,000 residents a year: the ward\'s crimes / the ward\'s residents x 1,000 x (12 / months). Residents are '
         'counted at the middle month of the police period (for October to September, April), the way chosen in Settings. '
         'Calgary: all crimes in the file / every residential community\'s residents counted the same way, so the ward and '
         'Calgary are compared like with like. (Version 1 divided Calgary by the City\'s own population estimate; that '
         'estimate is about 9% higher than the growth model\'s total, because it also counts more people living in each '
         'home, so Calgary\'s rate read lower: 16.3 against 17.8 per 1,000 for Oct 2025 to Sep 2026.)',
         'Disorder: calls from the public about disorder (sheet "Disorder"), counted by event.',
         'A few incidents in the file have no ward, so the 14 wards add up to slightly less than Calgary (Oct 2025 to Sep '
         '2026: 25,857 crimes against 25,861).'],
     'excel': ['Download the spreadsheet: the "Police data file" button on the Crime in Ward 5 card, or "Download Community '
               'Safety Data" on the police page. Sheet "Community Crime": filter Ward = "Ward 5" (or a Community), Year '
               'and Month; sum "Total Crime".',
               'When someone asks for the source, open the police page at "Dashboard data download" (link above) and click '
               '"Download Community Safety Data": every crime number in the app can be found in that spreadsheet.'],
     'cautions': ['Totals in the app always match the police file.',
         'The police leave out unfounded reports and domestic violence, and '
         'leave out incidents with no location; they advise against comparing the file directly with their dashboard.',
         'Small communities swing a lot from year to year; compare with several years before quoting a change.',
         'The police changed what counts as disorder in 2025, so older disorder years are not directly comparable, and a '
                  'change against the year before can partly reflect the new definition.']},

    {'key': 'rents', 'name': 'Rental Market Survey (rents and vacancy)', 'dataset': 'CMHC Housing Market Information Portal',
     'publisher': 'CMHC', 'page': 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en/TableMapChart?id=0140&t=3',
     'updated': 'Yearly: surveyed each October, published in December or January',
     'used_in': 'Rents and vacancy near Ward 5, newsletter',
     'method': [
         'CMHC surveys purpose-built rental apartments (buildings of 3 or more rental units) every October.',
         'Read from the portal\'s Calgary tables: Average Rent, Vacancy Rate and Rental Universe, by bedroom count, '
         'for Calgary, the Northeast survey zone, and the neighbourhood that covers Ward 5: Falconridge/Castleridge/'
         'Coral Springs/Martindale/Skyview Ranch/Saddle Ridge/Taradale/Horizon/Sunridge/Westwinds.',
         'Average rent is what sitting tenants pay, not the asking rent for empty units. Vacancy = units empty and '
         'ready to rent on the survey date.'],
     'excel': ['On the CMHC portal, open Calgary > Primary Rental Market > Average Rent > Neighbourhoods, and choose '
               'Export to Spreadsheet (CSV).'],
     'cautions': ['Condos rented out, basement suites and houses are not in the survey (CMHC\'s secondary market).',
                  'The Ward 5 area also includes Coral Springs, Horizon and Sunridge; no figures exist by community.',
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
         'Programs are placed in Ward 5 by their address (matched to the City\'s parcel addresses, 9zvu-p8uz).',
         'Spaces = licensed capacity of programs located in Ward 5. Family day home agencies are listed but not '
         'counted, because the homes they oversee are spread across the city.',
         'Last 12 months: inspections (visits), non-compliance findings and enforcement actions (such as an order to remedy).'],
     'excel': ['Open the latest quarter\'s CSV, filter City = Calgary and the Ward 5 addresses or postal codes; sum Capacity '
               'once per program (the file has one row per inspection).'],
     'cautions': ['Capacity is how many children may attend at once, not how many are enrolled.']},

    {'key': 'schools', 'name': 'Student enrolment by school and Schools', 'dataset': 'open.alberta.ca ccbcf0fb + fd9t-tdn2',
     'publisher': 'Government of Alberta; City of Calgary',
     'page': 'https://open.alberta.ca/opendata/student-enrolment-by-school-authority-and-grade-level',
     'updated': 'Yearly', 'used_in': 'Schools cards, Families and schools, newsletter',
     'method': [
         'School locations from the City\'s Schools dataset (fd9t-tdn2): schools inside the Ward 5 boundary.',
         'Each one is matched by name to the Government of Alberta enrolment file for each school year; students = the '
         'school\'s total enrolment (kindergarten to grade 12), split into K to 9 and grades 10 to 12.'],
     'excel': ['Open the Alberta enrolment file for a school year and filter School Name to the Ward 5 schools; sum Total.'],
     'cautions': ['Students are counted where they go to school, not where they live: many travel in from other wards '
                  'and some Ward 5 children go to school elsewhere.']},

    {'key': 'amenities', 'name': 'Amenities: recreation facilities, transit stops, playgrounds, community services',
     'dataset': 'hxfu-6d96, muzh-c9qc, bdu9-amk8, x34e-bcjz', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/bdu9-amk8', 'updated': 'As the City updates them',
     'used_in': 'Amenities by community, map layers, Growth and amenities',
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
     'method': ['Projects whose location is inside Ward 5 or just outside it.'],
     'excel': ['Download the dataset and look for projects in northeast Calgary.'],
     'cautions': ['Only the City\'s larger road projects; repairs and utility work are not listed.']},

    {'key': 'cameras', 'name': 'Traffic Cameras', 'dataset': 'k7p9-kppz', 'publisher': 'City of Calgary',
     'page': 'https://data.calgary.ca/d/k7p9-kppz', 'updated': 'Images about once a minute', 'used_in': 'Traffic cameras, Briefing screen',
     'method': ['Cameras inside Ward 5 or within about 2 km of it. The app saves each new image and replays the last 30 minutes.'],
     'excel': [], 'cautions': ['The City keeps no recording; replays exist only while the app is open.']},

    {'key': 'city_disorder', 'name': 'Social Disorder Statistics (City open data)', 'dataset': '4evm-wx9a',
     'publisher': 'City of Calgary (Calgary Police Service)', 'page': 'https://data.calgary.ca/d/4evm-wx9a',
     'updated': 'Ended July 2025', 'used_in': 'Disorder card only when the police file is not available',
     'method': ['Events in Ward 5 community regions over the latest 12 months published.'], 'excel': [],
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
     'publisher': 'Calgary Data Desk', 'page': '', 'updated': 'At every refresh',
     'used_in': 'Dashboard tiles, community table and map, Compare wards',
     'method': [
         'Per 1,000 residents a year = count / residents x 1,000 x (12 / months in the period). For a 12-month period '
         'the last factor is 1.',
         'Residents for a period are counted at its middle month (for November to October: about May), the way chosen '
         'in Settings (growth model, 2021 Census, or 2021 Census grown to the City\'s total). Open requests per 1,000 use '
         'today\'s residents.',
         'A ward or city rate adds the counts of its residential communities and divides by their residents added '
         'together (not an average of community rates).',
         'Communities with fewer than 100 residents get no rates ("too few residents for a rate"): one request would '
         'read as 10 or more per 1,000. Their requests still count in ward and city totals.',
         'Growth since the 2021 Census = residents today / 2021 Census residents - 1. "Growing" marks communities that '
         'grew more than 30% (or did not exist in 2021). "New since 2021" means the 2021 Census counted nobody there.',
         'Change against the year before = this period\'s count / the same months a year before - 1; counts are scaled '
         'to a year first when the two periods have different lengths.'],
     'excel': ['Take the count from the dataset with the same filters, divide by the residents shown for that community '
               'or ward, multiply by 1,000.'],
     'cautions': ['Rates depend on how residents are counted; the 2021 Census undercounts fast-growing areas, so their '
                  'rates look higher than they are.']},

    {'key': 'compare', 'name': 'Compare wards: every measure', 'dataset': 'iahh-g8bj, 35ra-9556, c2es-76ed, 6933-unw5, police file',
     'publisher': 'Calgary Data Desk', 'page': '', 'updated': 'With the whole-city view (at most hourly)',
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
         'Requests made through the 311 app: share of the period\'s requests (not duplicates) with source = "App".',
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
         'Amenity level: see "Amenity level and the amenity gap".',
         'Rank "nth of 14": wards ordered best first where one direction is better (lower crime, faster closing, more '
         'amenities), otherwise highest first. Green or red: at least 10% better or worse than Calgary.'],
     'excel': ['Save the table with "Save this table"; every ward\'s figure can be rebuilt from the datasets listed, '
               'using the ward\'s communities (see "Wards and their communities").'],
     'cautions': ['311 rates measure how much residents report, not how many problems there are: wards with more newcomers '
                  'or fewer app users can report less for the same problems.']},

    {'key': 'amenity_gap', 'name': 'Amenity level and the amenity gap', 'dataset':
        'ikeb-n5bc, bdu9-amk8, da6k-wpxb, jjkg-kv4n, fwyk-8pth, enr4-crti, kami-qbfh, tfs4-3wwa, hxfu-6d96, x34e-bcjz, muzh-c9qc',
     'publisher': 'Calgary Data Desk (City of Calgary open data)', 'page': 'https://data.calgary.ca/browse',
     'updated': 'Assets counted again every week', 'used_in': 'Growth and amenities (Amenity gap), Compare wards, Data Genie',
     'method': AMENITY_STEPS,
     'excel': ['Download one asset dataset (for example Parks Seating, ikeb-n5bc, filtered to benches that are ACTIVE or '
               'INSTALLED) and count the rows inside one community; divide by its residents x 1,000; do the same for all '
               'of Calgary; divide the two.'],
     'cautions': ['Only City assets in open data: school, private and community association facilities are not counted.',
                  'Counts, not size or condition: a small playground counts the same as a large one.',
                  'Amenities near a community\'s edge serve its neighbours too; the level treats each community on its own.']},

    {'key': 'shading', 'name': 'Map shading, flags and colours', 'dataset': 'all', 'publisher': 'Calgary Data Desk',
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
     'updated': 'Census 2021; read again weekly', 'used_in': 'Who lives here (wards other than Ward 5), Data Genie',
     'method': [
         'Population and Dwellings by Ward (k4pr-cznc), Families and Households by Ward (jzfi-qvb4) and Employment by '
         'Ward (b5q8-82zn), against the same three tables for the whole city (fm6w-acnx, u75s-8rqc, 8w7b-2yqx).',
         'Shares: children 0 to 14 and seniors 65+ / people in private households; households of 5 or more and people '
         'living alone / private households; one-parent families / census families; in the labour force / people 15+; '
         'unemployed and self-employed / the labour force.',
         'Ward 5 also has the City\'s printed ward profile (languages, newcomers, housing costs, income), kept with the app.'],
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
                'By ward: the City does not publish its budget by ward. The ward table adds up only the published costs of '
                'City and partner projects and road projects listed in the app with a location in the ward (the largest '
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

    {'key': 'weather', 'name': 'Daily climate data, Calgary International Airport', 'dataset': 'Environment Canada climate',
     'publisher': 'Environment and Climate Change Canada', 'page': 'https://climate.weather.gc.ca/',
     'updated': 'Daily', 'used_in': 'Data Genie',
     'method': ['Daily temperature, rain, snow and snow on ground at the airport station (inside Ward 5), back to 1881; '
                'grouped by month or year on request.'], 'excel': [], 'cautions': []},
]


def find(topic=None):
    """Method notes for a topic (dataset id, key or a word in the name); all names when topic is empty."""
    if not topic:
        return {'topics': [{'key': m['key'], 'name': m['name'], 'dataset': m['dataset']} for m in METHODS]}
    t = str(topic).strip().lower()
    hits = [m for m in METHODS if t == m['key'] or t in m['dataset'].lower() or t in m['name'].lower()
            or any(t in x.lower() for x in m['used_in'].split(','))]
    return {'methods': hits} if hits else {'error': f'No method notes for "{topic}"', **find()}
