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
     'For {area}, Calgary and each residential community: the share of homes within reach of playgrounds, parks, transit '
     'stops, community centres, recreation centres and libraries (get_dashboard section access), homes built since 2021 '
     'against older homes, the communities read as a measured gap or check inventory, and the crowding estimate at '
     'playgrounds and parks against Calgary\'s, with its limits; then the amenity scores (section access, scores): each '
     'community\'s local and district score with its range and label (consistent gap, depends on assumptions, no gap), '
     'and the communities near a playground or park whose score is under 0.80 (near, but crowded). Present what the '
     'data shows; no ranking of need and no recommendations.'),
    ('constituency', 'Know your constituency: {area}',
     'The electorate, how it voted, who lives here and what residents raise.', 'Elections',
     'For {area}: estimated electors and turnout in the 2025 municipal election against Calgary, the 2025 councillor and '
     'mayoral results there (the mayor\'s vote in the area against Calgary\'s, the councillor race station by station), '
     'the provincial electoral divisions and federal electoral districts it overlaps with their 2023 and 2025 results, '
     'turnout and closest margins, the 2026 referendum in its divisions, who lives here from the ward profile (households, '
     'housing, income, work, languages spoken at home and immigrants\' countries of birth), growth by community since '
     '2021 and the issues residents raise through 311 (get_dashboard section elections, profile, communities). Facts for '
     'any candidate or campaign alike: neutral between candidates and parties, no predictions.'),
    ('election_landscape', 'The election landscape in {area}',
     'Seats, margins and turnout at every level, and the closest races.', 'Elections',
     'For {area}: who holds every seat (council, MLAs, MPs) and by what margin, the closest races at each level, turnout '
     'at each level and how it varies across wards and divisions, the seats that changed since the general elections '
     '(by-elections), and the 2026 referendum against Alberta (get_dashboard section elections with full=true). Neutral '
     'between candidates and parties; no predictions.'),
    ('since_election', 'Since the 2025 election: {area}',
     'The first year of the council term: City services, growth and projects.', 'Elections',
     'For {area}: the first 12 months after the 20 October 2025 election against the 12 months before: 311 requests and how '
     'fast they were closed, infrastructure reports, traffic incidents, crime, new homes, building and development '
     'permits, and the major projects started, under way or finished, with Calgary\'s change for comparison. Say plainly '
     'that these describe the area and depend on many decisions and outside factors, not one person\'s record.'),
    ('child_care', 'Child care spaces for children in {area}',
     'Licensed spaces per child by community, and inspection results.', 'Families',
     'Licensed child care spaces in {area} against children aged 0 to 4 and 0 to 14 in each community, the trend since 2021, '
     'and inspections and orders in the last 12 months.'),
    ('schools', 'School enrolment pressure',
     'Which schools in {area} grew most, and the new schools coming.', 'Families',
     'Enrolment at each school in {area} over the last five school years, the biggest increases, against children in each '
     'community, and the schools being built or planned.'),
    ('tourism', 'Tourism: Calgary\'s potential, international and local',
     'Who visits Calgary and from where, against Canada\'s other gateways, what makes Calgary different, and how to grow.', 'Growth',
     'Tourism in Calgary as an opportunity (get_dashboard section tourism, every part, and section visiting). Local against '
     'international: Tourism Calgary\'s spending by origin; international overnight visitors entering by air at Calgary '
     'against Vancouver, Toronto, Montreal and Edmonton by year since 2015 and to date this year, the share from the United '
     'States and overseas, the priority countries and their growth, and the months (the summer peak and the slow months). '
     'The gateway question: airport passengers by sector, connecting travellers, Banff\'s visitors, and what share Calgary '
     'keeps for a night. Calgary as a hub for day trips (research around_calgary): what lies within one, two, three and four '
     'hours (Kananaskis, Banff, Canmore, Drumheller, Waterton, five UNESCO World Heritage Sites), visitors at each where '
     'published, Banff\'s cap on new hotels, and what a stay-in-Calgary, see-the-region offer would need (rooms, shuttles '
     'and tours, passes, rail). What makes Calgary different, from the research file. Lessons from Iceland, Singapore, Dubai, New '
     'York, Denver and airline stopovers, each with its result and what would or would not carry over. Then the options, '
     'with who would act, cost, the visitors and spending each could add under stated low, middle and high assumptions, '
     'and the trade-offs (crowding in Banff, housing and short-term rentals). Cite every figure\'s source.'),
    ('school_tax', 'School tax paid and school money received',
     'What Calgary pays the province for schools against what comes back, set beside Edmonton and the rest of Alberta.', 'Families',
     'The education property tax Calgary pays the province (the requisition) each year since 2020 and its share of Alberta\'s '
     'total, against Calgary\'s share of Alberta\'s students; tax per student for Calgary, Edmonton and the rest of Alberta; '
     'tax per resident beside tax per student and students per 100 residents (how much of the gap is fewer children per '
     'resident); business and industrial property and the municipalities that pay most per resident; operating funding, '
     'audited spending and funding-profile grants per student for the Calgary boards against Edmonton\'s and the provincial '
     'average; new schools approved per budget against student growth; the class size grant; and school projects being '
     'built (get_dashboard section school_tax, every part, including factors). Then inside {area}: education tax by '
     'community (section property_tax) against children aged 0 to 14, school enrolment and school sites still empty. '
     'Explain every difference by how the system works, show where Calgary is treated the same or better as plainly as '
     'where it is not, note the 2027 standard rate, and end with options for the province, the City and the school '
     'boards, each with its trade-off. No blame of a party or government.'),
    ('blue_line', 'The case for more Blue Line stations',
     'Residents beyond the planned 88 Avenue station, transit gaps and destinations coming.', 'Transit',
     'Residents today and at the 2021 Census in Cornerstone, Redstone, Cityscape, Skyview Ranch and Homestead; transit stops '
     'per 1,000 residents in each of those communities; transit and shift-work figures from the Ward 5 profile (2021 Census); schools and '
     'facilities being built. Make the evidence-based case for extending the Blue Line to Country Hills Boulevard.'),
    ('growth_forecast', 'Growth to 2030: who grows, and will amenities keep up?',
     'The City\'s new-community forecast for {area}, residents in 2030 and which communities get more crowded.', 'Growth',
     'Use get_dashboard section growth_forecast. Show the City\'s Suburban Residential Growth forecast (the five forecast years '
     'against the five years before, by sector and kind of home, with the City\'s low and high range), each new community '
     'in {area} with its forecast homes and people, residents today and in 2030, and crowding and amenity scores today and in '
     '2030 for playgrounds, parks, transit stops, community centres, recreation centres and libraries. Name the communities that '
     'become crowded or more crowded, those far from amenities today and growing, and the neighbours affected; list the '
     'water, sewer and road projects the growth needs in their area plans. State the limits (new communities only, today\'s '
     'amenities, the sector-to-community sharing). Present what the data shows; do not rank by need or recommend.'),
    ('council_votes', 'How City councillors vote: the record',
     'Every recorded council and committee vote by member, where council divides, and the promises on the record.', 'Accountability',
     'Use read_source key accountability: the City council and committee votes by member (how often each member voted, '
     'for, against, absent), the divided votes in full with how each member voted, the period they cover, and the promises '
     'tracker for the same members. For {area} name its councillor(s) first and set each against the others. Present the '
     'recorded votes as facts with their dates; never rate a member or recommend how to vote.'),
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



def registry_topics():
    """A topic for every page in the master registry that has no hand-written one, so a tab added to the site appears
    here, and in the analysis the assistants can do, without anyone editing this list."""
    import registry
    have = {t[0] for t in TOPICS} | {p['scientist'] for p in registry.load() if p.get('scientist')}
    out = []
    for p in registry.load():
        if p['key'] in have or p.get('scientist') or not p.get('files'):
            continue
        out.append((f"page_{p['key']}", f"{p['title']}: what the data shows for {{area}}", p['what'], 'Pages',
                    f"Use the page {p['title']} ({p['read']}) to show what its data says for {{area}} against Calgary, "
                    f"with the figures, how they changed, and the sources."))
    return out


TOPICS += registry_topics()
BY_KEY = {t[0]: t for t in TOPICS}
# topics that only make sense for some areas (0 = all of Calgary): the Blue Line north extension is a northeast question
ONLY = {'blue_line': (5,)}            # its brief rests on the Ward 5 profile
DEFAULT_AREA = 'the selected area'


LENGTH_RULE = (' Length: the report is as long as the subject needs, up to 100 pages; never shorten it, drop sections or summarise to make it '
               'fit. Write it in parts with report_add (two or three sections at a time, each with its tables and charts) and '
               'finish with make_report, so a long report is always delivered.')
SOURCES_RULE = (' Sources: the master registry (list_sources, and the list in your instructions) names every page of the '
              'site and every dataset; before you say anything is not available, search it with list_sources and read the page '
              'with read_source or its get_dashboard section; only then, and only for what the registry lacks, say what is not covered.')


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
            'and list every source. Write in plain, everyday language for a general reader; never mention the app, '
            'a dashboard, a model or a list, and say where figures come from in the City\'s own words (City of Calgary data, '
            'the City\'s population forecast, the property assessment roll); do not say who the report is prepared for.' + SOURCES_RULE + LENGTH_RULE)


def election_brief(text, area=None):
    """The request for a full Election Analytics report (an electoral division, district, ward or all of Calgary)."""
    ask = (text or '').strip() or f'A complete election analysis of {area or DEFAULT_AREA}'
    return ('[Election Analytics] Full report request: produce a comprehensive, auditable election analysis report and '
            'finish with make_report (the reader will download the PDF, the interactive report and the Excel workbook). '
            f'Area: {area or DEFAULT_AREA}. Question: {ask.rstrip(" .")}. '
            'Start with get_dashboard section election_analytics (with riding="..." when the area is an electoral '
            'division or district), then add every other figure that helps (communities, profile, growth, 311, the '
            'referendum, the other levels\' results). The report must cover: who lives there (age by band, households, '
            'languages and countries of birth, work, growth since the last election); the last results and how they '
            'varied by voting location or poll, by way of voting and by turnout; the arithmetic of the last result (votes '
            'between first and second, the uniform swing that ties it, electors who did not vote, new electors since); '
            'and explicit mathematical models of the next race: at least three scenarios (for example uniform swing, '
            'differential turnout by area, growth of the electorate) with every assumption and its source, the formula, '
            'the votes needed to win in each, a range, and what would change the result. Compute every figure with '
            'calculate, show the arithmetic in tables a reader can check in Excel, and list every source. Nonpartisan: '
            'the same rigour for any candidate or party; never present a projection as certain; outreach suggestions stay '
            'general (where turnout was low, translated materials, accessible voting information) and never target, '
            'exclude or discourage anyone by ethnicity, religion, language or any other personal trait. Write in plain '
            'language; never mention the app, a dashboard or a model of AI.' + SOURCES_RULE + LENGTH_RULE)


def business_brief(text, area=None):
    """The request for a full Business Economist plan."""
    ask = (text or '').strip() or 'Which kinds of business Calgary is short of, where, and a business plan for the strongest one'
    return ('[Business Economist] Full business plan request: produce a comprehensive, auditable business plan and finish '
            'with make_report (the reader will download the PDF, the interactive report and the Excel workbook). '
            f'Area selected: {area or DEFAULT_AREA}. Request: {ask.rstrip(" .")}. '
            'Start with get_dashboard section business (the businesses in each category by community, the newest licences, '
            'and matching businesses), then use every other figure that helps: residents now and growth since 2021 '
            '(communities), the ward profile (incomes, households, languages, renters, commuting), transit stops and '
            'routes, crime and disorder, 311 issues, development and new homes, rents, property tax, and Environment '
            'Canada weather through the year. Cover: the opportunity and the customers within reach (people, '
            'households, incomes, growth); the competition by community with names where useful; the best location '
            'and why; a demand estimate and revenue model with every assumption stated and sourced; start-up and running '
            'costs as stated assumptions (say they must be confirmed with quotes); ' + "Premises costs: say which kind of lease is assumed. Most Calgary shop, office and restaurant leases are net leases: the tenant pays base rent plus additional rent, which is its share of the building's operating costs and of its property tax (the landlord is billed by the City and passes it on; Calgary's separate business tax was folded into the non-residential property tax by 2019). So show base rent, operating costs and the property tax share as separate lines, each with its rate per square foot, and count each once; under a gross lease the rent already includes them and they get no line of their own. " + 'break-even arithmetic; three scenarios '
            '(low, middle, high); risks; and next steps (licences and permits the City requires). Compute every figure with '
            'calculate, put the arithmetic in tables a reader can check in Excel, and list every source. This is general '
            'information from public data, not financial, legal or investment advice; say so once. Write in plain '
            'language; never mention the app, a dashboard or a model of AI.' + SOURCES_RULE + LENGTH_RULE)
