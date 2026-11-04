"""Data Scientist: ready-made analysis topics for the area selected in the app (all of Calgary or one ward). Each one is
a brief that Data Genie's engine turns into a full report (PDF plus an Excel workbook of the supporting tables), using
only the data the app can reach. {area} in a topic is filled with the selected area's name ("Calgary", "Ward 3").

The tab shows a few topics at a time and rotates them, so the office sees new ideas on each visit; any topic can also
be typed in freely.
"""
import random

# key, title, one-line description, area, brief
TOPICS = [
    ('311_per_resident', '311 requests per resident, community by community',
     'Which communities in {area} report the most and least to 311 for their size, and how that changed since 2021.', '311',
     '311 requests per 1,000 residents a year for each community in {area}, each year from 2021 to the latest complete year, '
     'compared with Calgary (or, for all of Calgary, ward against ward). Explain how growth since the 2021 Census changes the picture, and which communities stand out.'),
    ('infrastructure_trend', 'Roads, water and parks problems: the five-year trend',
     'Infrastructure reports per resident in each community since 2021, against Calgary.', '311',
     'Infrastructure 311 reports (the study\'s 21 types: roads, water and sewer, parks) per 1,000 residents a year, each '
     'community in {area} and Calgary, 2021 to the latest complete year. Show the trend, the biggest types and where reports '
     'are rising.'),
    ('oldest_open', 'The oldest open 311 requests',
     'What has been waiting longest, which City services own it, and where.', '311',
     'Every 311 request in {area} still open: how many are over 90 days and over a year, by City service, type and community, '
     'and the oldest examples. Separate general "Contact Us" messages. Recommend what the office could follow up first.'),
    ('response_speed', 'How fast the City closes requests in {area}',
     'Closure times by service in {area} against Calgary as a whole and the other wards.', '311',
     'For requests made in the last 12 complete months: share closed within 7 and 30 days and median days to close, by City '
     'service, {area} against Calgary (all of Calgary: ward by ward). Note requests still open.'),
    ('app_use', 'Who uses the 311 app, phone and web',
     'Reporting channels by community, and what that says about reaching residents.', '311',
     'Share of 311 requests made through the 311 app, the web and phone or other, each community in {area} and Calgary, for '
     'the last 12 complete months and the same months a year before. Use the 2021 Census profile of {area} (languages '
     'spoken at home) to discuss outreach.'),
    ('crime_trend', 'Crime in {area} since 2020',
     'Crime by type and community, per resident, against Calgary.', 'Safety',
     'Calgary Police community safety data: {area} crime by year since 2020 by category, crimes per 1,000 residents a year '
     'against Calgary, and each community\'s (or, for all of Calgary, each ward\'s) trend. Explain the police rounding of small counts.'),
    ('vehicle_crime', 'Vehicle thefts and break-ins: where and when',
     'Which communities and months see the most, and how it is changing.', 'Safety',
     'Theft from vehicles, theft of vehicles and break and enter (homes, garages and other premises, businesses) in {area}: '
     'by community and by month of the year, since 2020, per 1,000 residents, against Calgary.'),
    ('disorder', 'Calls to police about disorder',
     'What residents call police about, in which communities, and the trend.', 'Safety',
     'Calgary Police disorder calls in {area} by type and community since 2020, noting the 2025 definition change, against '
     'Calgary.'),
    ('traffic', 'Traffic incidents: hot spots and trend',
     'Where incidents cluster in {area} and how the count is changing.', 'Roads',
     'City traffic incidents inside {area}: count by year since 2021, by month, the locations that repeat most often, and '
     'the share on major roads. Against the years before.'),
    ('new_homes', 'New homes approved, community by community',
     'Building permits for new homes over five years, and where growth is heading.', 'Growth',
     'Building permits issued for new homes (housing units) in each community in {area}, each year for the last five complete '
     'years, with the growth model population, and which communities are still growing fastest.'),
    ('suites', 'Basement suites and changes of use',
     'Development applications that change neighbourhoods, and their outcomes.', 'Growth',
     'Development permit applications in {area} for secondary (basement) suites and changes of use, each year for five '
     'years, by community, with how many were approved, refused or cancelled. Connect to household size and crowding '
     'in the 2021 Census profile of {area}.'),
    ('growth_amenities', 'Growth against amenities',
     'Are playgrounds, transit stops and facilities keeping up with fast-growing communities?', 'Growth',
     'For each residential community in {area}: residents now and growth since 2021, children 0 to 14, playgrounds and children '
     'per playground, active transit stops per 1,000 residents, recreation facilities, and the projects being built. Rank '
     'the gaps.'),
    ('child_care', 'Child care spaces for children in {area}',
     'Licensed spaces per child by community, and inspection results.', 'Families',
     'Licensed child care spaces in {area} against children aged 0 to 4 and 0 to 14 in each community, the trend since 2021, '
     'and inspections and orders in the last 12 months.'),
    ('schools', 'School enrolment pressure',
     'Which schools in {area} grew most, and the new schools coming.', 'Families',
     'Enrolment at each school in {area} over the last five school years, the biggest increases, against children in each '
     'community, and the schools being built or planned.'),
    ('blue_line', 'The case for more Blue Line stations',
     'Residents beyond the planned 88 Avenue station, transit gaps and destinations coming.', 'Transit',
     'Residents today and at the 2021 Census in Cornerstone, Redstone, Cityscape, Skyview Ranch and Homestead; transit stops '
     'per 1,000 residents in each of those communities; transit and shift-work figures from the Ward 5 profile (2021 Census); schools and '
     'facilities being built. Make the evidence-based case for extending the Blue Line to Country Hills Boulevard.'),
    ('investment', 'Investment coming to {area}, and the gaps',
     'Every known project, its cost and stage, and what is still unfunded.', 'Growth',
     'All major projects being built or planned in {area} with cost, funding and timing, the largest building permits of '
     'the period, and what is not funded or not scheduled yet. Recommend what the office should press for.'),
    ('snow', 'Snow and ice: requests against snowfall',
     'Winter 311 requests in {area} against how much it actually snowed.', '311',
     'Snow and ice 311 requests in {area} each winter since 2021 (by month), against Environment Canada snowfall at the '
     'Calgary airport, per 1,000 residents, against Calgary.'),
    ('water_sewer', 'Water, sewer and flooding requests',
     'Water main, sewer back-up and drainage problems by community.', '311',
     'Water and sewer 311 requests (WATS types such as sewer back-ups, water main breaks, drainage) in {area} by community '
     'and year since 2021, per 1,000 residents, against Calgary.'),
    ('waste', 'Garbage, recycling and green cart problems',
     'Missed pickups and cart problems by community.', '311',
     'Waste and recycling 311 requests (WRS types) in {area} by type and community for the last 12 complete months and the '
     'year before, per 1,000 households where possible, against Calgary.'),
    ('bylaw', 'Bylaw complaints: parking, property and noise',
     'Which complaints are rising, and where.', '311',
     'Bylaw-related 311 requests in {area} (parking, property standards, noise, graffiti and similar) by type and community '
     'since 2021, per 1,000 residents, against Calgary.'),
    ('who_lives', 'Who lives in {area}, and what it means for services',
     'Languages, newcomers, households and work patterns, and the services they point to.', 'People',
     'Use the 2021 Census profile of {area} against Calgary (all of Calgary: ward by ward): household size, children and seniors, languages spoken '
     'at home, recent immigrants, renters and crowding, income and shift work. Draw out what it means for 311 outreach, '
     'communications, office hours and services, and how growth since 2021 may have changed it.'),
    ('population_methods', 'How many people live in {area}? Every way to count',
     'The City\'s total shared by actual growth (the default), the City\'s total at one rate, the growth model and the 2021 Census compared, and why it matters.', 'People',
     'Compare {area} and each community\'s (or ward\'s) residents under every way of counting the app offers '
     '(population.by_method on the dashboard), show how rates per 1,000 change with each, and explain which to use for funding and service '
     'arguments.'),
    ('csi', 'Calgary\'s crime severity against other cities',
     'Ten years of the Crime Severity Index for Calgary and large cities.', 'Safety',
     'Statistics Canada Crime Severity Index (overall, violent, non-violent) for Calgary against Edmonton, Vancouver, '
     'Toronto, Montreal, Winnipeg, Ottawa and Canada over the last ten years, and how {area}\'s own crime rate compares '
     'with Calgary.'),
    ('rents', 'Rents and vacancy in and near {area}',
     'What tenants pay, how many units are empty, and who rents.', 'Housing',
     'CMHC Rental Market Survey for the CMHC zone that covers {area} and for Calgary (rents by bedroom, vacancy, units), '
     'with the 2021 Census profile of {area} on renters, housing costs and crowding, and basement suite applications.'),
]

BY_KEY = {t[0]: t for t in TOPICS}
# topics that only make sense for some areas (0 = all of Calgary): the Blue Line north extension is a northeast question
ONLY = {'blue_line': (5,)}            # its brief rests on the Ward 5 profile
DEFAULT_AREA = 'the selected area'


def fill(text, area=None):
    """A topic's text for an area: {area} becomes its name."""
    return str(text).replace('{area}', area or DEFAULT_AREA)


def fits(key, ward=None):
    """Whether a topic suits the selected area (ward 0 or None: all of Calgary)."""
    return key not in ONLY or ward is None or int(ward or 0) in ONLY[key]


def topics(n=6, seed=None, area=None, ward=None):
    """n topics for the selected area (area: its name; ward: its number, 0 for Calgary), a different mix each time
    (no more than two from one subject)."""
    rng = random.Random(seed)
    pool = [t for t in TOPICS if fits(t[0], ward)]
    rng.shuffle(pool)
    out, per_area = [], {}
    for t in pool:
        if per_area.get(t[3], 0) >= 2:
            continue
        out.append(t)
        per_area[t[3]] = per_area.get(t[3], 0) + 1
        if len(out) == n:
            break
    return [{'key': k, 'title': fill(title, area), 'about': fill(about, area), 'area': subject}
            for k, title, about, subject, _ in out]


def brief(key=None, text=None, area=None):
    """The request sent to the analysis engine for a topic (or for the office's own words), for the selected area."""
    if key and key in BY_KEY:
        _, title, _, _, b = BY_KEY[key]
        ask = fill(f'Topic: {title}. {b}', area)
    else:
        ask = f'Topic: {(text or "").strip()}'
    ask = ask.rstrip(' .') + '.'
    where = (f' The area is {area} (the area selected in the app) unless the topic names another.' if area else
             ' The area is the one selected in the app (see SELECTED AREA) unless the topic names another.')
    return ('Data Scientist request: produce a full analysis report and finish with make_report (the office will download '
            'the PDF and the Excel workbook). ' + ask + where + ' Choose a sensible period (complete months or years) and state it. '
            'Use the data in the app first, then City open data and the other sources; compute every figure with calculate; '
            'include tables the office can reuse in Excel; give recommendations and an action plan that follow from the '
            'findings (only specific, data-backed ones the office would not already know; no routine or obvious steps), '
            'and list every source.')
