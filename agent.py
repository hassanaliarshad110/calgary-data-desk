"""The AI agent: answers questions about City of Calgary data with Claude and tools.

Talks to the Claude Messages API over HTTPS (no extra library needed). Claude decides which tools to use:
search the City's catalogue, read a dataset's columns, run queries, save CSVs, and show charts, tables and
maps in the app.
"""
import json
import os
import re

import calgary_data as cd
import census as census_mod
import methods as methods_mod
import context
import engines
import local_data
import methods
import police
import report
import weather

MODELS = {'fast': 'claude-haiku-5-5', 'smart': 'claude-sonnet-5-5', 'audit': 'claude-opus-5-5'}
MAX_STEPS = 30                 # tool rounds per question (an analysis report needs many)
MAX_OUTPUT = 16000
# Published prices, US dollars per million tokens (input, output): for the cost shown with each answer. An estimate:
# check the current price list. Cache reads cost a tenth of input, cache writes a quarter more than input.
PRICES = {'claude-sonnet-5-5': (2.00, 10.00), 'claude-haiku-5-5': (0.10, 0.50), 'claude-opus-5-5': (5.00, 25.00),
          # paid keys for the other services (a free-tier key is shown as free)
          'gemini-2.5-flash': (0.30, 2.50), 'gemini-2.5-pro': (1.25, 10.00), 'gemini-2.5-flash-lite': (0.10, 0.40),
          'gpt-5': (1.25, 10.00), 'gpt-5-mini': (0.25, 2.00), 'gpt-5-nano': (0.05, 0.40)}
HAIKU_LONG = (0.50, 2.50)          # Haiku 5.5 when one request is over 100,000 tokens


def call_cost(model, u):
    """Dollars for one request from its usage figures (None when the model's price is not known)."""
    if model not in PRICES and not model.startswith('claude'):
        return None
    total_in = u.get('input_tokens', 0) + u.get('cache_read_input_tokens', 0) + u.get('cache_creation_input_tokens', 0)
    p_in, p_out = PRICES.get(model, PRICES['claude-sonnet-5-5'])
    if model.startswith('claude-haiku') and total_in > 100_000:
        p_in, p_out = HAIKU_LONG
    return (u.get('input_tokens', 0) * p_in + u.get('cache_read_input_tokens', 0) * p_in * 0.1 +
            u.get('cache_creation_input_tokens', 0) * p_in * 1.25 + u.get('output_tokens', 0) * p_out) / 1e6


def with_cache_mark(messages):
    """A copy of the conversation with a cache mark on its last block, so the next step re-reads everything before
    it from cache (about a tenth of the price) instead of paying for it again."""
    if not messages:
        return messages
    msgs = list(messages)
    last = dict(msgs[-1])
    content = last['content']
    blocks = [{'type': 'text', 'text': content}] if isinstance(content, str) else [dict(b) for b in content]
    if blocks:
        blocks[-1] = {**blocks[-1], 'cache_control': {'type': 'ephemeral'}}
    last['content'] = blocks
    msgs[-1] = last
    return msgs             # tokens per reply: a report's content is long
REPORT_WORDS = re.compile(r'\b(report|analy[sz]e|analysis|action plan|recommendations?|briefing paper)\b', re.I)
MAX_RESULT_CHARS = 14000       # how much of a tool result Claude sees

SYSTEM = """You are the data assistant in Calgary Data Desk, used by the Mayor's office and councillors' offices \
in Calgary (it began as the Ward 5 Data Desk for Councillor Raj Dhaliwal's office, Ward 5, in northeast Calgary, so it \
holds extra Ward 5 detail). The people asking prepare for casework, constituent meetings, briefings and council business. You answer questions using City of Calgary Open Data \
(data.calgary.ca, about 1,000 public datasets) through your tools. Today's date is {today}.

How every number is counted
- get_method gives the app's method notes for any dataset: exact filters, codes, periods, formulas, how to \
reproduce a figure in Excel, and cautions. Call it before explaining, defending or reconciling any dashboard figure, \
and whenever a file or another source gives a different number: then count step by step with the same filters and \
show where the difference comes from. Never say you cannot explain a difference before doing that.

Use the data you already have first
1. get_ward5_dashboard (its sections: overview, communities, child_care, schools, development, amenities, crime) already holds the app's Ward 5 figures for the selected period. Try it first for any Ward 5 question.
2. Crime: police_crime reads the Calgary Police Service community safety data already on this computer (crime and disorder by category, community, ward and month since 2020). crime_severity_index gives Calgary against other cities by year. Weather: get_weather.
3. Files already saved: list_saved_files, then query_saved_file to filter, count, group and sum a saved CSV (for example the study's 311 file) instead of asking the City's website again.
4. When the data is not on this computer, get it from the City automatically, without asking: query_dataset for counts and groups, or, when the question needs the full rows (or the user wants a file), download_dataset and then work with the saved file through query_saved_file. Police crime data and the Crime Severity Index also download themselves the first time they are needed.
5. Never download the same data twice: call list_saved_files before download_dataset, and if a file with the same data is already saved, use it (say which file and when it was saved). Download again only if the user asks for fresher data. To give the user a table you have already worked out, use save_table instead of downloading.

How to work
- Never state a number you did not get from a tool in this conversation. If the data can't answer the question, say so \
and say what data would.
- Find data with search_datasets, check columns with describe_dataset, then query_dataset. Prefer asking the API for \
counts and sums ($select with count(*), sum(), avg(); $group) over pulling raw rows.
- Say which dataset (name and ID) and which dates every answer is based on, in one short line at the end.
- When a chart, table or map would help, call show_chart, show_table or show_map with the numbers you already have. \
Keep the written answer short: the finding first, with the key numbers, in plain words an office can reuse in a briefing.
- When the user asks to download or save data, call download_dataset with a clear file name. Never refuse a download for \
size; the file goes to this computer.
- If a query fails, read the error, fix the query and try again.
- Maps: for more than about 20 points, call show_map with source (the app fetches the points) rather than listing \
points. Traffic incidents in Ward 5: show_map with source.layer="ward5_traffic", or for other dates source.dataset_id \
"35ra-9556", lat_field "latitude", lon_field "longitude", label_field "incident_info", a where on start_dt_utc and \
inside_ward5=true. Never download a boundary or other dataset only to filter by location.
- "The study", "our study" or "the study period" means the 311 equity study shared with the office ("Who Calgary's 311 Hears"): \
311 requests made Oct 1, 2024 to Sep 30, 2026, without duplicates and without a blank community: \
requested_date >= '2024-10-01' AND requested_date < '2026-10-01' AND status_description not like 'Duplicate%' AND \
comm_code IS NOT NULL. Use these exact dates unless the user gives others, and state them in the answer.
- Ward 5 in the study means its nine study communities: comm_code in('CAS','CSC','CNS','FAL','MRT','RSN','SAD','SKR',\
'TAR'). Homestead (HSD, new since the 2021 Census) and the business and industrial areas were not in the study. For a \
study-period request about Ward 5, use the nine communities, say so, and offer a second file that adds Homestead and \
the business areas. The study's own Ward 5 file had 56,473 requests (downloaded Oct 31, 2026); a fresh download can \
differ by a few as the City closes or merges requests.
- Ward 5 outside the study means all the Ward 5 codes listed below (residential communities and business areas).
- For any download, first count the rows with query_dataset (select count(*) with the same where), then download. \
Downloads have no row limit. If a download request doesn't say where, ask nothing: save Ward 5 and offer all of \
Calgary as a second file (the whole city over the study period is about 970,000 rows).
- After a download, report the file name, the number of rows and the exact filter used, from the tool result, and \
check that the rows match the count.

SoQL (the API's query language) tips
- Text values are case-sensitive: use upper(field) = 'VALUE' or field like '%Pothole%'.
- Dates: requested_date >= '2025-01-01'; date_trunc_ym(date) groups by month; date_extract_y(date) gives the year.
- Lists: comm_code in('MRT','TAR'). Missing values: field IS NULL.
- Always set a sensible limit; group results instead of fetching thousands of rows.

Key datasets
- 311 Service Requests (iahh-g8bj): service_request_id, requested_date, updated_date, closed_date, status_description \
('Open', 'Closed', 'Duplicate (Open)', 'Duplicate (Closed)'), source ('App', 'Web', 'Other' = mostly phone), service_name \
(e.g. 'Roads - Pothole Maintenance'), agency_responsible, comm_code, comm_name (upper case), location_type, latitude, \
longitude. Most requests are recorded at the community's centre point, not the exact address. Exclude duplicates with \
status_description not like 'Duplicate%'.
- Traffic Incidents (35ra-9556): start_dt_utc, incident_info (location text), description, quadrant, latitude, longitude.
- Building Permits (c2es-76ed): applieddate, issueddate, permittype, permitclass, workclassgroup, housingunits, \
estprojectcost, communitycode, communityname.
- Social Disorder Statistics (4evm-wx9a): police-reported social disorder; public data ends July 2025.
- Crime by community and ward: use police_crime (Calgary Police Service, monthly since 2020, published each quarter). The City's own Community Crime Statistics open dataset (848s-4m4z) covers 2012-2019 only. \
When asked for the source or a link for police crime or disorder numbers, give the police page that holds the download: \
ward_crime.source (https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata), \
say it opens at "Dashboard data download" where "Download Community Safety Data" downloads the spreadsheet the app reads \
(name the file, ward_crime.file), and say how to check the number in it (ward_crime.how_to_download). Do not give the \
Power BI dashboard (data.calgarypolice.ca) as the source: the app's numbers come from the spreadsheet. If the user \
compares with the Power BI dashboard, explain ward_crime.rounding_note: the file shows counts from 1 to 5 as 2, the \
dashboard shows exact counts, so single communities and months can differ.
- 2021 Census by community: f9wk-wej9 (population, age), msjx-5ygv (households), isek-k4ja (employment).
- Boundaries: Ward Boundaries (tz8z-hyaz), Community District Boundaries (surr-xmvs).
- Development Permits (6933-unw5, has communitycode and ward), Land Use Redesignation Applications (33vi-ew4s), \
Traffic Cameras (k7p9-kppz), Current Traffic Incidents (4jah-h97u), Road Construction Projects (sizs-hgef), Water Main \
Breaks (dpcu-jr23), Recreation Facilities (hxfu-6d96), Calgary Transit Stops (muzh-c9qc).

Analysis reports (you are also the office's data analyst)
When the user asks for a trend, an analysis, a study, a model, a report, a briefing paper, or "something like our study",
produce a full analysis and finish with make_report, which prints it as a PDF the office can share. Work like this:
1. Plan: restate the question, the measures that answer it, the period (use complete months or years; compare like
   with like, e.g. the same months a year earlier), the area (which communities or wards) and the comparison
   (Ward 5 against Calgary, community against community, before against after).
2. Gather: use the data already in the app first (dashboard, police data, saved files), then the City's open data
   (query_dataset with counts and groups) and the other sources. Fetch only what the question needs, but enough to
   show a trend (at least 3 to 5 years where the data allows).
3. Check: note gaps, definition changes, partial months, records with
   no community, and anything that would change the reading. Normalise counts by residents (per 1,000) or homes when
   comparing areas of different size, and say which population count you used (the office's Settings choice, in the
   dashboard's population.method_label) and how the result moves under the other two (population.by_method).
4. Compute with calculate for every derived number (rates, % changes, shares, growth per year, trend slopes). Never do
   arithmetic in your head for a figure that goes in a report.
5. Report with make_report: a summary of 3 to 6 findings (each with its number), sections that each answer one part
   with a chart or table built from tool results, the method, every data source (name, dataset ID or link, publisher,
   period used), limits, recommendations that follow from the findings (each says which finding it rests on and a
   priority), and an action plan (action, who in the office or which City service, when, how success will be measured).
   Show the evidence: give each section the visuals that make it clear: a line or area chart for any trend over time,
   bars to compare communities or with Calgary, horizontal bars for rankings, stacked bars for parts of a total, a
   scatter for how two measures relate, a map of Ward 5 communities shaded by a rate (values by community) or with
   points (incidents, permits, facilities; use source to fetch many), and tables with the exact figures. If the user
   asks for a particular kind of visual, include it. Every visual must use numbers from your tool results.
   Recommendations are options for the office, phrased plainly, never presented as City policy; do not recommend
   anything the data does not support. The readers are the councillor and staff who know their ward, its projects and
   City processes well: leave out anything obvious to them or that is routine office work (checking a project's opening
   date with the City, "monitor the data", "engage residents", "contact 311", "keep an eye on trends"). Each
   recommendation must be specific (which community, which service, how much), rest on a finding from the data, and say
   something the office could not have known without this analysis. Fewer, sharper recommendations are better than a
   long list; if the data supports none, say so in one line instead of filling the section. Put tables the office may want in Excel in the sections; they are saved as CSV.
   The app adds an appendix listing every query you ran, so anyone can check the figures.
6. In the chat, after make_report, give the three most important findings in a few lines and say the PDF is in Files.
If the request is vague, pick a sensible scope, state it at the top of the report, and say what else could be added.

Beyond City data
- Weather and climate: the City does not publish weather records. Use get_weather (Environment Canada, Calgary \
International Airport station, which is inside Ward 5) for temperature, rain, snow and trends, by day, month or year, \
back to 1881.
- Before saying the City has no data on a topic, search the catalogue with at least two different wordings. If it \
truly isn't published, say so plainly and name the organisation that does publish it (for example Calgary Police \
Service for crime, Statistics Canada for detailed census tables, CMHC for housing starts and rents).

Ward 5
- Residential communities (comm_code): Castleridge CAS, Cityscape CSC, Cornerstone CNS, Falconridge FAL, Homestead HSD, \
Martindale MRT, Redstone RSN, Saddle Ridge SAD, Skyview Ranch SKR, Taradale TAR.
- Business and industrial areas also in Ward 5: SRI, DBC, SGL, SKE, WES, PEG, CIA, ST2, ST3, ST4, 05D, 05E, 05F, 05G.
- Missing persons: the police do not publish counts of missing persons by ward or community, so there are no \
statistics to give. The dashboard's "Missing persons: police appeals" card shows the Calgary Police appeals that are \
posted right now (read live from the police news releases, newsroom.calgary.ca/police-news-releases), with those \
naming a Ward 5 community first. Point people there and to the police non-emergency line, 403-266-1234 (911 if someone \
may be in danger). Do not compile, save or put names of missing people in reports or files: the police take an appeal \
down once the person is found.
- Upcoming and major projects (new facilities, schools, the Blue Line extension, the Northeast Athletic Complex, \
large private developments): get_ward5_dashboard section amenities, major_projects_being_built_or_planned, gives each \
project's status, cost, timing, what it includes and its sources; give those links and the checked date, and say \
when something (an opening date, a cost) is not published rather than guessing. For more detail, query the City's \
Development Permits (6933-unw5) and Building Permits (c2es-76ed) by address or community, and \
largest_building_permits_not_homes lists the period's biggest non-housing permits. You cannot read news websites: if \
asked for news newer than the checked date, say so and suggest the project page link.
- Who lives in Ward 5: get_ward5_dashboard section profile (the City's Ward 5 profile, 2021 Census, people in private \
households, 2021 ward boundaries). Use it for context in reports and briefings (for example language when planning \
outreach, household size when comparing per household and per person, crowding and renters for housing questions), \
always say it is the 2021 Census, and never use it as today's population.
- Population: the office chooses in Settings how residents are counted; get_ward5_dashboard section overview gives it \
as population.method / method_label, and population.by_method gives Ward 5 today under all three: 'model' (the Ward 5 \
growth model: homes on the City's property assessment roll x 2021 Census people per home, recalculated at every \
refresh), 'census2021' (2021 Census counts, no growth: the same base as the City's own 311 ward dashboard, which shows \
requests per 100 households using 2021 Census households, not per resident) and \
'city_pace' (grown to the City's total: communities built since 2021 keep their growth model count, every other \
community is its 2021 Census count x one factor, (the City's estimate for the month - the new communities) / Calgary's 2021 \
Census count of 1,288,995, so all of Calgary adds up to the City's own figure, 1,598,075 in November 2026; the factor also \
brings in people the Census count of private homes leaves out, so its "growth since 2021" reads higher than real growth, \
which the City puts at about 20.7% since May 2021). Every \
residents figure and rate per 1,000 in the dashboard uses the chosen method; always say which one, and when it matters \
show how the answer changes under the others (rates scale by the ratio of the populations). Ward 5 homes grew about \
30% since 2021 against 24% under the City's total, so the 2021 Census and the City's total undercount Ward 5, while \
the growth model can undercount established areas and towers that filled up without new homes. \
How the model counts homes (homes_now): accounts on the Current Year Property Assessments roll (4bsw-nn7w) with \
assessment_class='RE' AND property_type='LI' AND sub_property_use starting with 'R' (dwellings). That leaves out \
land-only lots (property_type 'LO'), non-residential and farmland, and residential accounts that are not homes: \
condo parking stalls (sub_property_use A004, addresses ending in V), storage units (A005, addresses ending in S) and \
other accessory or under-construction units (A000, A006, A007). A home counts as lived in one year after its \
year_of_construction, spread evenly through the year, so homes built this year and part of last year are not yet \
counted. A rental apartment building is one roll account; the model swaps it for its number of units. To reconcile \
the roll with homes_now, count the roll with those filters and by year_of_construction.
- get_ward5_dashboard returns the app's current Ward 5 figures; use it for quick Ward 5 questions.
- Families: get_ward5_dashboard also has licensed child care in Ward 5 by quarter and community (Government of \
Alberta Child Care Information, with each program's inspections and enforcement over the last 12 months) and \
students enrolled in each Ward 5 school by year (Government of Alberta student enrolment). Children 0-4 and 0-14 \
are the 2021 Census counts grown with the model. Family day home agencies are listed but their spaces are not \
counted, because the homes they oversee are spread across the city.
- Amenities and growth: get_ward5_dashboard section amenity_gap has the app's amenity level, its method step by \
step (method), the level under all three ways of counting residents (level_under_each_resident_count) and every \
dataset. Explain the level from method, never by working the formula out backwards. section wards has every ward's \
level under all three counts (amenity_level_by_method).

City budget
The City's budget is in Calgary Open Budget (fqax-i3nz): budget_department, level_2, business_unit, year, budget_status
(Approved or Actual), fund ('Capital' or 'Operating Expenditures Net of Recoveries') and budget in millions of dollars;
2026 is the latest operating year, capital runs to 2032. The City does not publish its budget by ward or community:
say so plainly, then give what can be placed in a ward. Property tax by ward is not published either; the app
estimates it (get_ward5_dashboard section property_tax: the assessment roll by community, public and institutional
property left out, scaled to the bylaw's taxable assessment, times the bylaw's rates; Calgary's total equals the
bylaw's levy). Always call it an estimate of tax billed, not collected, and give the method in one line. Other
revenue (user fees, franchise fees, grants) has no location (City and partner projects and road projects with a published
cost, from get_ward5_dashboard section amenities).

Questions about anything shown in the app
Every figure, list, chart and map in the app comes from data you can reach (get_ward5_dashboard and its sections,
get_method, the open data tools). Answer such questions from that data, with the number; never reply that you do not
know, cannot see the screen, or do not have the data, before looking in every relevant section.

When the data cannot answer the question exactly as asked
Questions such as "what is the number 1 issue in Redstone?" or "what do residents care about most?" have no single \
dataset that answers them. Never open with "I don't know", "I can't tell you" or "there is no data". Open with the \
best answer the data does give, said plainly and framed by what it measures, for example: "By 311 requests over \
the last 12 months, Redstone's most reported issue is ... (n requests, x% of the community's total), followed by ..." \
Then give one or two other readings if they differ (open requests, infrastructure reports, police calls, traffic \
incidents), and close with one short sentence on what the data cannot show (what residents think matters most is \
not measured; a survey or the office's own casework would show it). Stay courteous and confident: the councillor \
should be able to repeat your first sentence in a meeting.

Sources
End every answer that uses figures with a short "Sources:" list: each dataset or document by name, its ID and link \
(City open data: https://data.calgary.ca/d/<id>; police: the community safety data page; CMHC, Statistics Canada, \
Government of Alberta pages as given by the tools), the period or date it covers, and the way residents were counted \
when rates per resident are used. Name the source for every number, including figures from the dashboard.
"""

TOOLS = [
    {'name': 'search_datasets',
     'description': 'Search the City of Calgary open data catalogue (about 1,000 datasets). Returns IDs, names, '
                    'descriptions, last update and column names.',
     'input_schema': {'type': 'object', 'properties': {
         'query': {'type': 'string', 'description': 'Words to search for, e.g. "traffic incidents", "dog licences"'}},
         'required': ['query']}},
    {'name': 'describe_dataset',
     'description': 'Name, description, last update, every column (field name and type) and 3 sample rows of a dataset.',
     'input_schema': {'type': 'object', 'properties': {
         'dataset_id': {'type': 'string', 'description': 'Dataset ID like iahh-g8bj'}}, 'required': ['dataset_id']}},
    {'name': 'query_dataset',
     'description': 'Run a SoQL query on a dataset and return the rows. Use select/group for counts and sums.',
     'input_schema': {'type': 'object', 'properties': {
         'dataset_id': {'type': 'string'},
         'select': {'type': 'string', 'description': 'e.g. "comm_name, count(*) as n"'},
         'where': {'type': 'string', 'description': "e.g. \"requested_date >= '2025-01-01' AND comm_code='MRT'\""},
         'group': {'type': 'string', 'description': 'e.g. "comm_name"'},
         'order': {'type': 'string', 'description': 'e.g. "n DESC"'},
         'limit': {'type': 'integer', 'description': 'Maximum rows (default 200, at most 5000)'}},
         'required': ['dataset_id']}},
    {'name': 'download_dataset',
     'description': "Save a dataset (optionally filtered) as a CSV file in the user's Downloads\\Ward 5 Data Desk folder.",
     'input_schema': {'type': 'object', 'properties': {
         'dataset_id': {'type': 'string'},
         'file_name': {'type': 'string', 'description': 'A clear file name, e.g. "Ward 5 open 311 requests"'},
         'select': {'type': 'string'}, 'where': {'type': 'string'}, 'order': {'type': 'string'}},
         'required': ['dataset_id', 'file_name']}},
    {'name': 'get_ward5_dashboard',
     'description': "The app's current Ward 5 figures: population today (growth model) and at the 2021 Census, 311 "
                    'requests per community and per 1,000 residents (last 12 months vs the 12 before), requests by '
                    'City service area, open requests, closure speed, app use, traffic incidents, new homes, social '
                    'disorder, licensed child care spaces and inspections, school enrolment, infrastructure reports per 1,000 '
                    '(the study\'s 21 types), development permits, road construction, and amenities (recreation '
                    'facilities, libraries and community centres, playgrounds, transit stops) by community. Figures '
                    'are for the period selected on the dashboard (period_spec); rates are per 1,000 residents a year. '
                    'section="crime" gives Ward 5 crime and disorder by category and community from the Calgary Police '
                    'Service (monthly, published quarterly) and the Crime Severity Index for Calgary and other cities. '
                    'section="amenities" also lists City projects being built in Ward 5 (for example the Northeast Athletic '
                    'Complex), road projects and the largest non-housing building permits of the period. '
                    'section="profile" gives who lives in Ward 5 against Calgary from the City\'s Ward 5 profile (2021 '
                    'Census): household size, children and seniors, languages spoken at home, immigrants and recent '
                    'arrivals, renters, crowding, housing costs, income, low income, shift work and commuting. '
                    'section="amenity_gap" gives City assets (benches, picnic tables, playgrounds, sports equipment, park '
                    'washrooms, fountains, bins, off-leash areas, neighbourhood park space, trees, facilities, transit stops) '
                    'per 1,000 residents in each community against the city, an amenity level, and the communities flagged '
                    'because amenities have not kept up with growth. section="wards" gives all 14 wards and Calgary side by '
                    'side (residents, growth, 311, crime, traffic, building, child care, amenities). The figures are for '
                    'the area the office has selected in the app (scope: a ward, or all of Calgary).',
     'input_schema': {'type': 'object', 'properties': {'section': {
         'type': 'string', 'enum': ['overview', 'communities', 'child_care', 'schools', 'development', 'amenities', 'amenity_gap', 'crime', 'traffic', 'rents', 'profile', 'wards', 'property_tax'],
         'description': 'Which part of the dashboard; overview by default'}}}},
    {'name': 'get_weather',
     'description': 'Calgary weather history from Environment Canada (Calgary International Airport, in Ward 5): '
                    'mean, lowest and highest temperature, precipitation, rain, snowfall, snow on ground, hot and '
                    'very cold days. by="day" (up to 120 days), "month" or "year" (any length, back to 1881).',
     'input_schema': {'type': 'object', 'properties': {
         'start': {'type': 'string', 'description': 'First date, YYYY-MM-DD'},
         'end': {'type': 'string', 'description': 'Last date, YYYY-MM-DD'},
         'by': {'type': 'string', 'enum': ['day', 'month', 'year']}},
         'required': ['start', 'end', 'by']}},
    {'name': 'police_crime',
     'description': 'Crime or disorder counts from the Calgary Police Service community safety data already on this '
                    'computer (by month since 2020; crime categories: assault, other violence, street and commercial '
                    'robbery, break and enter of homes, businesses and other premises, theft from and of vehicles). '
                    'Filter by ward, community, category and months; group by category, community, ward, year or month.',
     'input_schema': {'type': 'object', 'properties': {
         'kind': {'type': 'string', 'enum': ['crime', 'disorder']},
         'wards': {'type': 'array', 'items': {'type': 'string'}, 'description': 'e.g. ["5"] or ["Ward 5"]; empty for all Calgary'},
         'communities': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Community names, e.g. ["MARTINDALE"]'},
         'categories': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Crime categories or disorder types, or a word in them, e.g. ["Vehicle"]'},
         'start': {'type': 'string', 'description': 'First month, YYYY-MM'},
         'end': {'type': 'string', 'description': 'Last month, YYYY-MM (inclusive)'},
         'group_by': {'type': 'array', 'items': {'type': 'string', 'enum': ['category', 'community', 'ward', 'year', 'month']}},
         'limit': {'type': 'integer'}}, 'required': ['kind']}},
    {'name': 'crime_severity_index',
     'description': "Statistics Canada's Crime Severity Index (overall, violent, non-violent) by year for Calgary, "
                    'Edmonton, Vancouver, Toronto, Montreal, Winnipeg, Ottawa and Canada, last 11 years.',
     'input_schema': {'type': 'object', 'properties': {}}},
    {'name': 'get_method',
     'description': "How the app counts every figure, by dataset: filters, codes, formulas, Excel steps and cautions. "
                    'topic: a key (311, population, children, permits, dp, traffic, police, csi, rents, child_care, schools, '
                    'amenities, roads, cameras, city_disorder, weather), a dataset ID or a word; empty lists the topics.',
     'input_schema': {'type': 'object', 'properties': {'topic': {'type': 'string'}}}},
    {'name': 'list_saved_files',
     'description': 'The CSV files already saved in the Files folder on this computer, with their columns and row counts.',
     'input_schema': {'type': 'object', 'properties': {}}},
    {'name': 'query_saved_file',
     'description': 'Filter, count, group and sum a CSV already saved in Files, without downloading anything. '
                    'Filters: [{column, op, value}] with op one of =, !=, contains, not contains, starts with, >, >=, <, '
                    '<=, in (dates compare as text, e.g. requested_date >= 2025-01-01). group_by columns can end in '
                    ':year or :month for dates. Without group_by it returns matching rows (up to limit).',
     'input_schema': {'type': 'object', 'properties': {
         'file_name': {'type': 'string'},
         'filters': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'column': {'type': 'string'}, 'op': {'type': 'string'}, 'value': {}}, 'required': ['column', 'op']}},
         'group_by': {'type': 'array', 'items': {'type': 'string'}},
         'sum_columns': {'type': 'array', 'items': {'type': 'string'}},
         'columns': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Columns to return when not grouping'},
         'limit': {'type': 'integer'}}, 'required': ['file_name']}},
    {'name': 'save_table',
     'description': 'Save a table you have already worked out (columns and rows) as a CSV in Files, for the user to open '
                    'in Excel. Use this instead of downloading again.',
     'input_schema': {'type': 'object', 'properties': {
         'file_name': {'type': 'string'},
         'columns': {'type': 'array', 'items': {'type': 'string'}},
         'rows': {'type': 'array', 'items': {'type': 'array', 'items': {}}}}, 'required': ['file_name', 'columns', 'rows']}},
    {'name': 'show_chart',
     'description': 'Show a chart in the app. Use numbers you already have.',
     'input_schema': {'type': 'object', 'properties': {
         'title': {'type': 'string'},
         'kind': {'type': 'string', 'enum': ['bar', 'line', 'horizontal_bar']},
         'labels': {'type': 'array', 'items': {'type': 'string'}},
         'series': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'name': {'type': 'string'}, 'values': {'type': 'array', 'items': {'type': 'number'}}},
             'required': ['name', 'values']}},
         'unit': {'type': 'string', 'description': 'e.g. "requests", "per 1,000 residents"'}},
         'required': ['title', 'kind', 'labels', 'series']}},
    {'name': 'show_table',
     'description': 'Show a table in the app.',
     'input_schema': {'type': 'object', 'properties': {
         'title': {'type': 'string'},
         'columns': {'type': 'array', 'items': {'type': 'string'}},
         'rows': {'type': 'array', 'items': {'type': 'array', 'items': {}}}},
         'required': ['title', 'columns', 'rows']}},
    {'name': 'show_map',
     'description': 'Show points on a map of Calgary in the app. For more than about 20 points, do not list them: give '
                    'source instead and the app fetches the points itself (up to 5,000). source.dataset_id with '
                    'lat_field, lon_field, label_field and a where filter; inside_ward5=true keeps only points inside the '
                    'Ward 5 boundary. source.layer="ward5_traffic" maps the dashboard\'s traffic incidents inside Ward 5 '
                    '(last 90 days of the selected period). Returns how many points were mapped.',
     'input_schema': {'type': 'object', 'properties': {
         'title': {'type': 'string'},
         'points': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'lat': {'type': 'number'}, 'lon': {'type': 'number'}, 'label': {'type': 'string'}},
             'required': ['lat', 'lon']}},
         'source': {'type': 'object', 'properties': {
             'layer': {'type': 'string', 'enum': ['ward5_traffic']},
             'dataset_id': {'type': 'string'}, 'lat_field': {'type': 'string'}, 'lon_field': {'type': 'string'},
             'label_field': {'type': 'string'}, 'where': {'type': 'string'}, 'inside_ward5': {'type': 'boolean'},
             'limit': {'type': 'integer'}}}},
         'required': ['title']}},
]
TOOLS += [
    {'name': 'calculate',
     'description': 'Work out numbers exactly instead of in your head: a list of named expressions, done in order; later '
                    'ones can use earlier names. Allowed: numbers, + - * / ** ( ), lists like [1, 2, 3], and functions '
                    'round, min, max, abs, sum, mean, sqrt, pct_change(new, old), cagr(first, last, years), share(part, '
                    'whole), per_1000(count, people, months=12), slope([values]) (least-squares change per step).',
     'input_schema': {'type': 'object', 'properties': {'calculations': {'type': 'array', 'items': {'type': 'object', 'properties': {
         'name': {'type': 'string'}, 'expression': {'type': 'string'}}, 'required': ['name', 'expression']}}},
         'required': ['calculations']}},
    {'name': 'make_report',
     'description': 'Save a finished analysis as a study-style report in Files: a PDF, an interactive web page (hoverable '
                    'charts, zoomable maps) and an Excel workbook with every table and the data behind every chart and '
                    'map, plus an appendix of every query run for this question. Use only numbers from tool results and '
                    'calculate. Each section can hold several visuals of any kind.',
     'input_schema': {'type': 'object', 'properties': {
         'title': {'type': 'string'}, 'subtitle': {'type': 'string'},
         'question': {'type': 'string', 'description': 'The question as the user asked it'},
         'summary': {'type': 'array', 'items': {'type': 'string'}, 'description': '3 to 6 key findings, each with its number'},
         'sections': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'heading': {'type': 'string'},
             'text': {'type': 'string', 'description': 'Paragraphs separated by a blank line; lines starting "- " become a list; **bold** allowed'},
             'visuals': {'type': 'array', 'description': 'Charts, maps and tables for this section, in order', 'items': {'type': 'object', 'properties': {
                 'type': {'type': 'string', 'enum': ['chart', 'map', 'table']},
                 'title': {'type': 'string'},
                 'kind': {'type': 'string', 'enum': ['bar', 'stacked_bar', 'horizontal_bar', 'line', 'area', 'scatter', 'donut'],
                          'description': 'chart: line/area for trends over time, bar for comparing a few groups, stacked_bar for parts of a total over time, horizontal_bar for rankings, scatter for the relation of two measures (e.g. growth against requests per resident), donut for shares of one total'},
                 'labels': {'type': 'array', 'items': {'type': 'string'}, 'description': 'chart: category or time labels'},
                 'series': {'type': 'array', 'items': {'type': 'object', 'properties': {
                     'name': {'type': 'string'}, 'values': {'type': 'array', 'items': {'type': ['number', 'null']}},
                     'points': {'type': 'array', 'description': 'scatter only', 'items': {'type': 'object', 'properties': {
                         'x': {'type': 'number'}, 'y': {'type': 'number'}, 'label': {'type': 'string'}}}}}}},
                 'x_label': {'type': 'string'}, 'y_label': {'type': 'string'}, 'unit': {'type': 'string'},
                 'values': {'type': 'object', 'description': 'map: Ward 5 communities shaded by value, keyed by community name or code, e.g. {"Martindale": 17.3}'},
                 'value_label': {'type': 'string', 'description': 'map: what the shading means, e.g. "crimes per 1,000 a year"'},
                 'points': {'type': 'array', 'description': 'map: points to place (lat, lon, label, optional value for size)', 'items': {'type': 'object', 'properties': {
                     'lat': {'type': 'number'}, 'lon': {'type': 'number'}, 'label': {'type': 'string'}, 'value': {'type': 'number'}}}},
                 'points_label': {'type': 'string'},
                 'source': {'type': 'object', 'description': 'map: instead of listing many points, let the app fetch them (same as show_map source)'},
                 'columns': {'type': 'array', 'items': {'type': 'string'}, 'description': 'table'},
                 'rows': {'type': 'array', 'items': {'type': 'array', 'items': {}}, 'description': 'table'},
                 'source_note': {'type': 'string'}}, 'required': ['type']}},
             'note': {'type': 'string'}}, 'required': ['heading']}},
         'method': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Steps: what was counted, filters, periods, formulas'},
         'data_sources': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'name': {'type': 'string'}, 'publisher': {'type': 'string'}, 'dataset_id': {'type': 'string'},
             'url': {'type': 'string'}, 'period': {'type': 'string'}, 'notes': {'type': 'string'}}, 'required': ['name']}},
         'limitations': {'type': 'array', 'items': {'type': 'string'}},
         'recommendations': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'title': {'type': 'string'}, 'detail': {'type': 'string'}, 'evidence': {'type': 'string', 'description': 'The finding it rests on'},
             'priority': {'type': 'string', 'enum': ['high', 'medium', 'low']}}, 'required': ['title', 'detail']}},
         'action_plan': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'action': {'type': 'string'}, 'owner': {'type': 'string'}, 'timeline': {'type': 'string'},
             'measure': {'type': 'string', 'description': 'How the office will know it worked'}}, 'required': ['action']}},
         'file_name': {'type': 'string'}},
         'required': ['title', 'summary', 'sections', 'method', 'data_sources']}},
]
TOOLS[-1]['cache_control'] = {'type': 'ephemeral'}      # cache system prompt + tools between calls

STEP_TEXT = {
    'search_datasets': lambda a: f"Searching the City's datasets for “{a.get('query', '')}”",
    'describe_dataset': lambda a: f"Reading the columns of {a.get('dataset_id', '')}",
    'query_dataset': lambda a: f"Querying {a.get('dataset_id', '')}",
    'download_dataset': lambda a: f"Downloading “{a.get('file_name', '')}”",
    'get_ward5_dashboard': lambda a: 'Reading the Ward 5 dashboard' + ('' if (a.get('section') or 'overview') == 'overview' else f" ({a.get('section').replace('_', ' ')})"),
    'get_weather': lambda a: f"Getting Environment Canada weather, {a.get('start', '')} to {a.get('end', '')}",
    'police_crime': lambda a: f"Reading Calgary Police {a.get('kind', 'crime')} data saved on this computer",
    'crime_severity_index': lambda a: 'Reading the Crime Severity Index',
    'list_saved_files': lambda a: 'Checking the files already saved',
    'get_method': lambda a: f"Reading how the app counts {a.get('topic') or 'its figures'}",
    'query_saved_file': lambda a: f"Working with the saved file “{a.get('file_name', '')}”",
    'save_table': lambda a: f"Saving “{a.get('file_name', '')}”",
    'show_chart': lambda a: 'Drawing a chart',
    'show_table': lambda a: 'Building a table',
    'show_map': lambda a: 'Placing points on a map',
    'calculate': lambda a: f"Working out {len(a.get('calculations') or [])} figure{'s' if len(a.get('calculations') or []) != 1 else ''}",
    'make_report': lambda a: f"Writing the report “{a.get('title', '')}”: PDF, interactive version and Excel workbook",
}


def ward5_section(d, section='overview', wards=None):
    """wards: () -> the summary of every ward (built from the whole-city dashboard), for section="wards"."""
    """The dashboard's figures for the assistant, one part at a time so each answer fits."""
    fam = d.get('families') or {}
    cc, sc = fam.get('child_care') or {}, fam.get('schools') or {}
    dv, am = d.get('development') or {}, d.get('amenities') or {}
    if section == 'communities':
        cs = d['communities']
        if len(cs) > 40:                          # the whole city: the main figures only, so every community fits
            keys = ('code', 'name', 'ward', 'residents', 'growth_pct', 'requests_per_1000', 'infra_per_1000', 'open_per_1000',
                    'new_homes12')
            return {'period': d.get('period'), 'prev_period': d.get('prev_period'), 'fields': keys,
                    'communities': [[c.get(k) for k in keys] for c in cs if c.get('residential')]}
        return {'period': d.get('period'), 'prev_period': d.get('prev_period'),
                'communities': [{k: v for k, v in c.items() if k != 'open_top'} for c in cs]}
    if section == 'child_care':
        return {**{k: cc.get(k) for k in ('as_of', 'spaces', 'programs_counted', 'spaces_first', 'first_quarter',
                                          'children_0_14', 'children_0_4', 'per_100_0_14', 'daycare_per_100_0_4',
                                          'quarters', 'by_comm', 'note', 'page')},
                'programs': [{k: p.get(k) for k in ('name', 'kind', 'capacity', 'counted', 'address', 'comm', 'since',
                                                    'visits_12m', 'last_visit', 'noncompliance_12m', 'actions_12m',
                                                    'last_action')} for p in cc.get('programs', [])]}
    if section == 'schools':
        return {'latest_year': sc.get('latest_year'), 'students': sc.get('students'), 'totals': sc.get('totals'),
                'note': sc.get('note'),
                'schools': [{k: x.get(k) for k in ('name', 'board', 'comm', 'grades', 'latest', 'base_year', 'base',
                                                    'change_pct', 'enrolment')} for x in sc.get('schools', [])]}
    if section == 'development':
        return {**{k: v for k, v in dv.items() if k != 'list'},
                'permits': [{k: p.get(k) for k in ('id', 'address', 'category', 'status', 'applied', 'decision', 'comm')}
                            for p in dv.get('list', [])[:100]]}
    if section == 'amenities':
        return {'by_comm': am.get('by_comm'), 'facilities': am.get('facilities'),
                'playgrounds_total': am.get('playgrounds_total'), 'stops_total': am.get('stops_total'),
                'major_projects_being_built_or_planned': d.get('projects'), 'road_projects': d.get('roadwork'),
                'largest_building_permits_not_homes': d.get('big_permits'),
                'note': 'facilities are those open now (City open data); major_projects_being_built_or_planned are City, school, '
                        'airport and private projects (state: building, planned or completed, set automatically when the City lists it '
                        'as open; overdue_note when it is past its expected date but not listed yet; each with status, cost, timing '
                        'and the sources it was checked against, as of its checked date); largest_building_permits are '
                        'building permits issued in the period for non-housing work over $1 million.'}
    if section == 'traffic':
        return {'period': d.get('period'), 'traffic12': (d.get('summary') or {}).get('traffic12'),
                'traffic_prev': (d.get('summary') or {}).get('traffic_prev'),
                'points_last_90_days': len(d.get('traffic_points') or []),
                'newest_50_points': sorted(d.get('traffic_points') or [], key=lambda p: str(p.get('date', '')) + str(p.get('time', '')),
                                           reverse=True)[:50],
                'note': 'For a map of all the points use show_map with source layer ward5_traffic.'}
    if section == 'rents':
        return {'rents': d.get('rents')}
    if section == 'profile':
        return {'ward_profile_2021_census': d.get('profile')}
    if section == 'crime':
        return {'ward_crime': d.get('crime'), 'crime_severity_index': d.get('safety')}
    if section == 'amenity_gap':
        g = d.get('amenity_gap') or {}
        rows = g.get('by_comm') or []
        many = len(rows) > 40                     # the whole city: the flagged and the 40 lowest, without the detail
        keys = ('code', 'name', 'residents', 'growth_pct', 'new', 'level', 'flag', 'short') if many else \
            ('code', 'name', 'residents', 'growth_pct', 'new', 'children_0_14', 'level', 'flag', 'short', 'vs_city', 'n')
        pick = [r for r in rows if r.get('flag')] + [r for r in rows if not r.get('flag')][:40 if many else len(rows)]
        ward_of = {c['code']: c.get('ward') for c in d.get('communities') or []}
        bm = {k: {'label': v.get('label'), 'level': v.get('level'), 'residents': v.get('residents'),
                  'flagged_count': len(v.get('flagged') or [])} for k, v in (g.get('by_method') or {}).items()}
        return {**{k: g.get(k) for k in ('city', 'scope', 'level', 'growth_pct_threshold', 'level_threshold', 'counted',
                                         'note', 'method')},
                'level_under_each_resident_count': bm,
                'datasets': {k: f"https://data.calgary.ca/d/{v.get('dataset')}" for k, v in (g.get('kinds') or {}).items()
                             if v.get('dataset')},
                'kinds': {k: v.get('label') + (' (per 1,000 children 0 to 14)' if v.get('per') == 'children' else '')
                          for k, v in (g.get('kinds') or {}).items()},
                'communities_counted': len(rows), 'flagged_count': len(g.get('flagged') or []),
                'by_comm': [dict({k: r.get(k) for k in keys}, ward=ward_of.get(r['code'])) for r in pick],
                'shown': 'flagged communities and the 40 lowest of the rest' if many else 'every community'}
    if section == 'wards':
        ws = d.get('wards_summary') or (wards() if wards else None)
        if not ws:
            return {'error': 'The comparison of every ward is not available right now.'}
        keep = ('ward', 'councillor', 'communities', 'residents', 'census2021', 'growth_pct', 'children_0_14',
                'requests12', 'requests_per_1000', 'requests_change_pct', 'infra_per_1000', 'open', 'open_per_1000',
                'open_over_90_days', 'closed_7_days_pct', 'app_share_pct', 'crimes', 'crime_per_1000', 'crime_change_pct',
                'violent', 'violent_change_pct', 'traffic12', 'traffic_per_1000', 'traffic_change_pct', 'new_homes12',
                'dev_permits12', 'child_care_spaces', 'child_care_per_100_kids', 'daycare_per_100_0_4', 'schools',
                'students', 'facilities', 'playgrounds', 'stops', 'amenity_level', 'amenity_level_by_method',
                'amenity_flagged', 'amenities_vs_city')
        slim = lambda r: {k: r.get(k) for k in keep if r.get(k) is not None}
        return {'wards': [slim(r) for r in ws.get('wards') or []], 'calgary': slim(ws.get('city') or {}),
                'crime_period': ws.get('crime_period'), 'how': ws.get('note'),
                'note': 'One row per ward and one for Calgary, for the same period as the dashboard. amenity_level and '
                        'amenities_vs_city: 1.00 = the city level.'}
    out = {k: d.get(k) for k in ('period', 'prev_period', 'period_spec', 'scope', 'ward', 'population', 'summary', 'disorder',
                                 'roadwork')}
    out['open_by_type'] = (d.get('open_by_type') or [])[:8]
    out['service_areas'] = (d.get('service_areas') or [])[:10]
    res = [c for c in d['communities'] if c.get('residential')]
    if len(res) > 40:                             # the whole city: the wards instead of 200-odd communities
        out['communities'] = f'{len(res)} residential communities: call section="communities" for them, "wards" to compare wards'
    else:
        out['communities'] = [{k: c.get(k) for k in ('code', 'name', 'residents', 'census2021', 'growth_pct', 'requests12',
                                                      'requests_per_1000', 'infra_per_1000', 'open', 'new_homes12',
                                                      'dev_permits12')} for c in res]
    if dv:
        out['development'] = {k: dv.get(k) for k in ('applied', 'applied_prev', 'change_pct', 'released', 'in_review',
                                                      'refused', 'cancelled')}
    if am:
        out['amenities'] = {'facilities_total': am.get('facilities_total'), 'playgrounds_total': am.get('playgrounds_total'),
                            'stops_total': am.get('stops_total')}
    if cc:
        out['child_care'] = {k: cc.get(k) for k in ('as_of', 'spaces', 'programs_counted', 'per_100_0_14',
                                                    'daycare_per_100_0_4', 'children_0_14')}
    if sc:
        out['schools'] = {'latest_year': sc.get('latest_year'), 'students': sc.get('students'),
                          'schools_counted': len([x for x in sc.get('schools', []) if x.get('latest')])}
    out['more'] = ('Call again with section = communities, child_care, schools, development, amenities, amenity_gap, crime '
                   'or wards (every ward side by side) for detail.')
    return out


def scope_note(d):
    """Added to the instructions when the app shows something other than Ward 5: the area selected in the app."""
    sc = (d or {}).get('scope') or {}
    if not sc or (sc.get('kind') == 'ward' and sc.get('ward') == 5):
        return ''
    if sc.get('kind') == 'city':
        return ('\n\nSELECTED AREA: the office has chosen all of Calgary in the app. get_ward5_dashboard now returns '
                'figures for the whole city (every community), and section="wards" compares the 14 wards. Answer for '
                'Calgary unless the question names a ward or community; the Ward 5 notes above apply only to Ward 5 '
                'questions.')
    return (f"\n\nSELECTED AREA: the office has chosen {sc.get('name')} (Councillor {sc.get('councillor') or 'unknown'}) "
            f"in the app. get_ward5_dashboard now returns {sc.get('name')}'s figures and communities, despite its name. "
            f"Answer for {sc.get('name')} unless the question names another area; the Ward 5 study notes and community "
            'codes above apply only to Ward 5 questions. section="wards" compares every ward.')


class AgentError(Exception):
    pass


def post_messages(api_key, body, timeout=180):
    """One call to the Claude Messages API. Replaced in tests."""
    return engines.post_anthropic(api_key, body, timeout)


def post_chat(url, api_key, body, timeout=180):
    """One call to an OpenAI-style chat service (Gemini, ChatGPT and others). Replaced in tests."""
    return engines.post_chat(url, api_key, body, timeout)


def _calgary_now():
    import dashboard                              # here, not at the top: dashboard is large and the agent works without it
    return dashboard.calgary_now()


class Agent:
    def __init__(self, get_settings, emit, downloads_dir, dashboard_provider, data_dir=None, wards_provider=None):
        self.get_settings = get_settings          # () -> {'api_key':..., 'model':...}
        self.data_dir = data_dir or os.path.join(os.path.expanduser('~'), '.ward5datadesk')
        self.emit = emit                          # (event dict) -> None, sends to the app window
        self.downloads_dir = downloads_dir
        self.dashboard_provider = dashboard_provider
        self.wards_provider = wards_provider      # () -> every ward side by side (or None)
        self.tax_provider = None                  # () -> property tax estimate by ward (set by the app)
        self.history = []
        self.usage = {'input': 0, 'output': 0, 'cache_read': 0}
        self.provenance = []                      # every data request for the current question (report appendix)
        self._report_pdf = None
        self.last_cost = {}
        self.tools = TOOLS                        # the auditor gives its agents their own set
        self.system_text = None                   # ... and its own instructions
        self.handlers = {}                        # extra tools: name -> function(args) -> result
        self.last_report = None                   # the entry of the last report made (with its spec file)

    def reset(self):
        self.history = []

    # ----- tools ---------------------------------------------------------------------------------------------
    def run_tool(self, name, args):
        if name in self.handlers:
            return self.handlers[name](args)
        if name == 'search_datasets':
            return cd.search_datasets(args['query'])
        if name == 'describe_dataset':
            return cd.describe_dataset(args['dataset_id'])
        if name == 'query_dataset':
            limit = max(1, min(int(args.get('limit') or 200), cd.MAX_QUERY_ROWS))
            rows = cd.query(args['dataset_id'], args.get('select'), args.get('where'), args.get('group'),
                            args.get('order'), limit)
            for r in rows:
                for k, v in list(r.items()):
                    if isinstance(v, (dict, list)):
                        r[k] = '(map shape)'
            return {'row_count': len(rows), 'rows': rows}
        if name == 'download_dataset':
            res = cd.download_csv(args['dataset_id'], self.downloads_dir, args['file_name'],
                                  args.get('select'), args.get('where'), args.get('order'))
            self.emit({'type': 'download', 'path': res['path'], 'rows': res['rows'], 'bytes': res['bytes'],
                       'dataset': args['dataset_id']})
            return {'saved_to': res['path'], 'rows': res['rows']}
        if name == 'get_ward5_dashboard':
            d = self.dashboard_provider()
            if not d:
                return {'error': 'The dashboard has not loaded yet.'}
            if (args.get('section') or '') == 'property_tax':
                t = self.tax_provider() if self.tax_provider else None
                return {'property_tax': t, 'how': methods_mod.find('property_tax')} if t else {'error': 'The property tax estimate is not available right now.'}
            return ward5_section(d, args.get('section') or 'overview', self.wards_provider)
        if name == 'get_weather':
            return weather.history(args['start'], args['end'], args.get('by', 'month'))
        if name == 'police_crime':
            return local_data.police_query(police.load(self.data_dir, check=False), args.get('kind') or 'crime', args.get('wards'),
                                           args.get('communities'), args.get('categories'), args.get('start'),
                                           args.get('end'), args.get('group_by'), args.get('limit') or 300)
        if name == 'crime_severity_index':
            d = context.csi(self.data_dir)
            return {k: d.get(k) for k in ('table', 'page', 'years', 'latest_year', 'series', 'ranking', 'calgary',
                                          'calgary_change_pct', 'calgary_10yr_pct', 'canada')}
        if name == 'list_saved_files':
            return local_data.list_files(self.downloads_dir)
        if name == 'get_method':
            return methods.find(args.get('topic'))
        if name == 'query_saved_file':
            return local_data.query_file(self.downloads_dir, args.get('file_name'), args.get('filters'),
                                         args.get('group_by'), args.get('sum_columns'), args.get('columns'),
                                         args.get('limit') or 200)
        if name == 'save_table':
            res = local_data.save_table(self.downloads_dir, args['file_name'], args['columns'], args['rows'])
            self.emit({'type': 'download', 'path': res['saved_to'], 'rows': res['rows'], 'bytes': res['bytes'],
                       'dataset': 'table'})
            return res
        if name == 'show_map' and args.get('source'):
            pts, note = self._map_points(args['source'])
            self.emit({'type': 'map', 'title': args.get('title', ''), 'points': pts})
            return {'shown': True, 'points_mapped': len(pts), 'note': note}
        if name in ('show_chart', 'show_table', 'show_map'):
            self.emit({'type': name.replace('show_', ''), **args})
            return {'shown': True}
        if name == 'calculate':
            return report.calculate(args.get('calculations'))
        if name == 'make_report':
            d = self.dashboard_provider() or {}
            pop = d.get('population') or {}
            meta = {'councillor': (d.get('ward') or {}).get('councillor') if (d.get('scope') or {}).get('kind') != 'city' else None,
                    'built': f"dashboard data of {d.get('built_at', '')} Calgary time" if d.get('built_at') else '',
                    'population': (f"{pop.get('method_label')}: {pop.get('method_about')}" if pop.get('method_label') else None),
                    'date': _calgary_now().strftime('%B %d, %Y').replace(' 0', ' '),
                    'day': _calgary_now().date().isoformat()}
            meta['geo'] = d.get('geo')
            meta['name_to_code'] = {' '.join((c.get('name') or '').upper().split()): c.get('code') for c in d.get('communities') or []}
            # maps given a source: fetch the points here, as show_map does
            notes = []
            for sec in args.get('sections') or []:
                for v in (sec.get('visuals') or []) + [sec.get('map')] + list(sec.get('maps') or []):
                    if isinstance(v, dict) and (v.get('type') in (None, 'map')) and isinstance(v.get('source'), dict) and not v.get('points'):
                        pts, note = self._map_points(v['source'])
                        v['points'] = [{'lat': p['lat'], 'lon': p['lon'], 'label': p.get('label')} for p in pts]
                        notes.append(note)
            res = report.make(args, self.provenance, self.downloads_dir, meta)
            entry = {'title': args.get('title', ''), 'question': args.get('question', ''), 'pdf': res['path'],
                     'interactive': res['interactive'], 'xlsx': res['xlsx'], 'made': _calgary_now().strftime('%Y-%m-%d %H:%M'),
                     'visuals': res['visuals']}
            # the report as written (its content and every query behind it), so the auditor can check it later
            spec_path = res['interactive'].replace(' (interactive).html', '') + '.report.json'
            try:
                with open(spec_path, 'w', encoding='utf-8') as f:
                    json.dump({'spec': args, 'provenance': self.provenance,
                               'meta': {k: meta.get(k) for k in ('councillor', 'built', 'population', 'date', 'day')}}, f, default=str)
                entry['spec'] = spec_path
            except OSError:
                pass
            self.last_report = entry
            self._index(entry)
            self._report_pdf = entry['pdf']
            self.emit({'type': 'report', **entry, 'name': res['name'], 'warning': res['warning'], 'path': res['path']})
            return {'saved_to': res['path'], 'interactive_version': res['interactive'], 'excel_workbook': res['xlsx'],
                    'visuals_drawn': res['visuals'], 'map_points': notes, 'warning': res['warning']}
        raise cd.DataError(f'Unknown tool {name}')

    def _index(self, entry):
        """Keep a list of reports made (newest first) for the Data Scientist tab."""
        if not self.data_dir:
            return
        path = os.path.join(self.data_dir, 'reports.json')
        try:
            with open(path, encoding='utf-8') as f:
                items = json.load(f)
        except (OSError, ValueError):
            items = []
        items = [entry] + [x for x in items if x.get('pdf') != entry.get('pdf')]
        try:
            os.makedirs(self.data_dir, exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(items[:200], f)
        except OSError:
            pass

    def _set_report_cost(self, pdf, cost):
        path = os.path.join(self.data_dir or '', 'reports.json')
        try:
            with open(path, encoding='utf-8') as f:
                items = json.load(f)
            for x in items:
                if x.get('pdf') == pdf:
                    x['cost_usd'] = cost
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(items, f)
        except (OSError, ValueError):
            pass

    def _record(self, name, args, result):
        """Keep a line for the report appendix: what was asked of which source, and what came back."""
        a = args or {}
        r = result if isinstance(result, dict) else {}
        if name == 'query_dataset':
            parts = [f"{k} {a[k]}" for k in ('select', 'where', 'group', 'order') if a.get(k)]
            what, detail, got = f"City open data {a.get('dataset_id')}", '; '.join(parts) or 'all rows', f"{r.get('row_count', '?')} row{'' if r.get('row_count') == 1 else 's'}"
        elif name == 'download_dataset':
            what, detail, got = f"Download of {a.get('dataset_id')}", (f"where {a['where']}" if a.get('where') else 'all rows'), \
                f"{r.get('rows', '?')} rows saved as {os.path.basename(str(r.get('saved_to', '')))}"
        elif name == 'describe_dataset':
            what, detail, got = f"Dataset record {a.get('dataset_id')}", r.get('name') or '', f"last updated {r.get('last_updated', '?')}"
        elif name == 'get_ward5_dashboard':
            d = self.dashboard_provider() or {}
            pop = (d.get('population') or {}).get('method_label') or ''
            what = 'Calgary Data Desk dashboard'
            detail = f"section {a.get('section') or 'overview'}; period {d.get('period', '')} against {d.get('prev_period', '')}; residents: {pop}"
            got = f"built {d.get('built_at', '')} Calgary time"
        elif name == 'police_crime':
            parts = [f"{k} {', '.join(map(str, a[k])) if isinstance(a[k], list) else a[k]}" for k in ('kind', 'wards', 'communities', 'categories', 'start', 'end', 'group_by') if a.get(k)]
            what, detail, got = 'Calgary Police community safety data', '; '.join(parts), f"total {r.get('total', '?')} (latest month {r.get('latest_month', '?')})"
        elif name == 'crime_severity_index':
            what, detail, got = 'Statistics Canada table 35-10-0026-01', 'Crime Severity Index by city', f"latest year {r.get('latest_year', '?')}"
        elif name == 'get_weather':
            what, detail, got = 'Environment Canada daily climate, Calgary airport', f"{a.get('start')} to {a.get('end')} by {a.get('by')}", ''
        elif name == 'query_saved_file':
            parts = [f"{k} {a[k]}" for k in ('filters', 'group_by', 'sum_columns') if a.get(k)]
            what, detail, got = f"Saved file {a.get('file_name')}", '; '.join(parts) or 'all rows', f"{r.get('matched_rows', '?')} matching rows"
        else:
            return
        self.provenance.append({'what': what, 'detail': str(detail)[:600], 'result': got,
                                'at': _calgary_now().strftime('%H:%M')})

    def _map_points(self, src):
        """Points for a map, fetched here so Claude does not have to list them."""
        d = self.dashboard_provider() or {}
        if src.get('layer') == 'ward5_traffic':
            pts = [{'lat': p['lat'], 'lon': p['lon'], 'label': f"{p.get('date', '')}: {p.get('where', '')}"}
                   for p in d.get('traffic_points') or []]
            return pts, f"Traffic incidents inside Ward 5 in the last 90 days of {d.get('period', 'the period')}"
        ds = src.get('dataset_id')
        lat, lon = src.get('lat_field') or 'latitude', src.get('lon_field') or 'longitude'
        if not ds:
            raise ValueError('source needs dataset_id or layer')
        fields = [lat, lon] + ([src['label_field']] if src.get('label_field') else [])
        where = ' AND '.join(x for x in (src.get('where'), f'{lat} IS NOT NULL') if x)
        limit = max(1, min(int(src.get('limit') or 5000), 5000))
        rows = cd.query(ds, select=','.join(fields), where=where, limit=limit)
        ward = (d.get('geo') or {}).get('ward')
        pts = []
        for r in rows:
            try:
                y, x = float(r[lat]), float(r[lon])
            except (KeyError, TypeError, ValueError):
                continue
            if src.get('inside_ward5') and ward and not cd.point_in_multipolygon(x, y, ward):
                continue
            pts.append({'lat': round(y, 5), 'lon': round(x, 5), 'label': str(r.get(src.get('label_field') or '', ''))[:120]})
        return pts, f'{len(rows)} rows fetched from {ds}' + (', kept those inside Ward 5' if src.get('inside_ward5') else '')

    # ----- one question -----------------------------------------------------------------------------------------
    def ask(self, question, model_choice='fast', today=''):
        chain = engines.ready(self.get_settings(), os.environ.get('ANTHROPIC_API_KEY', ''))
        if not chain:
            raise AgentError('Add a key for Claude, Gemini or ChatGPT in Settings first.')
        if model_choice == 'fast' and REPORT_WORDS.search(question or ''):
            model_choice = 'smart'                # a full analysis report always uses the thorough model
        tier = model_choice if model_choice in ('smart', 'audit') else 'fast'
        models = {**MODELS, **(self.get_settings().get('models') or {})}
        for e in chain:                           # the auditor's model: Opus on Claude, the strong model elsewhere
            e['audit'] = models['audit'] if e['provider'] == 'claude' else e['smart']
        start = len(self.history)
        self.provenance = []
        self.history.append({'role': 'user', 'content': question})
        self._report_pdf = None
        try:
            res = self._loop(chain, tier, today)
        except Exception:
            del self.history[start:]          # leave the conversation in a clean state for the next question
            raise
        if self._report_pdf:
            self._set_report_cost(self._report_pdf, res['tokens'].get('cost_usd'))
            res['report'] = self._report_pdf
        return res

    def _step(self, chain, pos, tier, system, skipped):
        """One request, to the first service in the chain (from pos) that answers. Returns (reply, pos)."""
        while True:
            e = chain[pos]
            try:
                return engines.call(e, e[tier], system, self.tools, self._trimmed_history(), MAX_OUTPUT,
                                    anthropic_post=post_messages, chat_post=post_chat,
                                    cache_mark=with_cache_mark), pos
            except (engines.EngineError, AgentError) as err:
                if not isinstance(err, engines.EngineError):
                    err = engines.EngineError('request', str(err))
                engines.rest(e, err)
                skipped.append({'service': engines.label(e), 'model': e[tier], 'why': str(err)})
                pos += 1
                if pos >= len(chain) and len(skipped) == 1:
                    raise AgentError(f"{skipped[0]['service']} could not answer: {skipped[0]['why']}. "
                                     'Check the key in Settings, or add a second service there.') from None
                if pos >= len(chain):
                    raise AgentError('None of the AI services in Settings could answer: ' + '; '.join(
                        f"{x['service']} ({x['model']}): {x['why']}" for x in skipped)) from None
                self.emit({'type': 'step', 'text': f"{engines.label(e)}: {engines.WORDS.get(err.kind, err.kind)}. "
                                                   f"Carrying on with {engines.label(chain[pos])}"})

    def _loop(self, chain, tier, today):
        dash = self.dashboard_provider()
        system = census_mod.relabel((self.system_text or SYSTEM).format(today=today),
                                    int(((dash or {}).get('census') or {}).get('year') or 2021)) + scope_note(dash)
        used = {'input': 0, 'output': 0, 'cache_read': 0, 'cost_usd': 0.0}
        self.last_cost = used
        pos, skipped, services = 0, [], []
        done = {'model': chain[0][tier], 'tier': tier, 'tokens': used, 'free': False, 'engine': '', 'skipped': skipped}
        for _ in range(MAX_STEPS):
            resp, pos = self._step(chain, pos, tier, system, skipped)
            e = chain[pos]
            model = e[tier]
            if (engines.label(e), model, e.get('free')) not in services:
                services.append((engines.label(e), model, e.get('free')))
            u = resp.get('usage', {})
            used['input'] += u.get('input_tokens', 0) + u.get('cache_read_input_tokens', 0) + \
                u.get('cache_creation_input_tokens', 0)
            used['cache_read'] += u.get('cache_read_input_tokens', 0)
            used['output'] += u.get('output_tokens', 0)
            c = 0.0 if e.get('free') else call_cost(model, u)
            used['cost_usd'] = None if c is None or used['cost_usd'] is None else round(used['cost_usd'] + c, 4)
            content = resp.get('content', [])
            if resp.get('stop_reason') == 'max_tokens':
                # the reply was cut off (often a tool call with too much data); ask for a shorter one
                self.history.append({'role': 'assistant', 'content': [b for b in content if b.get('type') == 'text'
                                                                      and b.get('text')]
                                     or [{'type': 'text', 'text': '(cut off)'}]})
                self.history.append({'role': 'user', 'content': 'Your last reply was cut off because it was too long. '
                                     'Try again more briefly: for maps use show_map with source instead of listing '
                                     'points, and group data instead of listing rows.'})
                continue
            content = [b for b in content if not (b.get('type') == 'text' and not b.get('text'))] or \
                [{'type': 'text', 'text': '(No answer.)'}]
            self.history.append({'role': 'assistant', 'content': content})
            done = {'model': model, 'tier': tier, 'tokens': used, 'free': all(f for _, _, f in services),
                    'engine': ' then '.join(f'{n} ({m})' for n, m, _ in services), 'skipped': skipped}
            if resp.get('stop_reason') != 'tool_use':
                text = '\n\n'.join(b.get('text', '') for b in content if b.get('type') == 'text').strip()
                return {'text': text or '(No answer.)', **done}
            results = []
            for block in content:
                if block.get('type') != 'tool_use':
                    continue
                name, args = block['name'], block.get('input') or {}
                self.emit({'type': 'step', 'text': STEP_TEXT.get(name, lambda a: name)(args)})
                try:
                    result = self.run_tool(name, args)
                    try:
                        self._record(name, args, result)
                    except Exception:             # noqa: BLE001 - the appendix must never stop an answer
                        pass
                    out = json.dumps(result, default=str)
                    cap = 30000 if name == 'get_ward5_dashboard' else MAX_RESULT_CHARS
                    if len(out) > cap:
                        out = out[:cap] + '... [cut: ask for fewer rows or group the data]'
                    results.append({'type': 'tool_result', 'tool_use_id': block['id'], 'content': out})
                except Exception as e_:               # noqa: BLE001 - any tool failure goes back to the model to fix
                    results.append({'type': 'tool_result', 'tool_use_id': block['id'], 'content': f'Error: {e_}',
                                    'is_error': True})
            self.history.append({'role': 'user', 'content': results})
        return {'text': 'I stopped after many steps without a final answer. Try a narrower question.', **done}

    def _trimmed_history(self, keep_turns=8):
        """Keep the most recent questions so long chats stay affordable; never split a tool exchange."""
        starts = [i for i, m in enumerate(self.history) if m['role'] == 'user' and isinstance(m['content'], str)]
        if len(starts) <= keep_turns:
            return self.history
        return self.history[starts[-keep_turns]:]
