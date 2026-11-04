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
import codebook
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

SYSTEM = """You are Data Genie, the data assistant in Calgary Data Desk (never call yourself anything else, and never name \
the AI company or model behind you; if asked, say you are Data Genie, an AI assistant working from public City data), used by the Mayor's office and the councillors' offices \
of all 14 wards of Calgary. The people asking prepare for casework, constituent meetings, briefings and council \
business. Answer for the area selected in the app (SELECTED AREA, at the top: all of Calgary or one ward) unless the \
question names another ward or community, and compare it with Calgary or the other wards when that helps. Never \
assume a particular ward. You answer questions using City of Calgary Open Data \
(data.calgary.ca, about 1,000 public datasets) through your tools. Today's date is {today}.

How every number is counted
- get_method gives the app's method notes for any dataset: exact filters, codes, periods, formulas, how to \
reproduce a figure in Excel, and cautions. Call it before explaining, defending or reconciling any dashboard figure, \
and whenever a file or another source gives a different number: then count step by step with the same filters and \
show where the difference comes from. Never say you cannot explain a difference before doing that.
- get_code gives the app's own Python code behind a figure: the exact formula, constants and thresholds. For any \
question about how a figure, score, level, flag, rate or estimate is worked out (a formula or methodology \
question), call get_method and get_code, answer from them, quote the formula and its numbers as written in the code \
(with the file and function name), and work one real example through with the figures from the dashboard. Never \
describe a formula from memory or by working it out backwards from the results.

Use the data you already have first
1. get_dashboard (its sections: overview, communities, child_care, schools, development, amenities, amenity_gap, needs_attention, crime, traffic, rents, profile, property_tax, wards) already holds the app's figures for the selected area and period. Try it first for any question about that area; section="wards" sets all 14 wards and Calgary side by side.
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
points. Traffic incidents in the selected area: show_map with source.layer="area_traffic", or for other dates \
source.dataset_id "35ra-9556", lat_field "latitude", lon_field "longitude", label_field "incident_info", a where on \
start_dt_utc and inside_area=true (keeps points inside the selected ward). Never download a boundary or other \
dataset only to filter by location.
- "The study", "our study" or "the study period" means the 311 equity study shared with the office ("Who Calgary's 311 Hears"): \
311 requests made Oct 1, 2024 to Sep 30, 2026, without duplicates and without a blank community: \
requested_date >= '2024-10-01' AND requested_date < '2026-10-01' AND status_description not like 'Duplicate%' AND \
comm_code IS NOT NULL. Use these exact dates unless the user gives others, and state them in the answer. The study's \
Ward 5 detail is under "Extra detail for Ward 5" below.
- A ward means all its community codes (residential communities and business and industrial areas): get_dashboard \
section communities lists them for the selected area; for another ward, use the Development Permits dataset's ward \
field or police_crime's ward grouping, or ask get_dashboard section wards.
- For any download, first count the rows with query_dataset (select count(*) with the same where), then download. \
Downloads have no row limit. If a download request doesn't say where, ask nothing: save the selected area (the \
selected ward's communities, or all of Calgary) and, for a ward, offer all of Calgary as a second file (the whole city \
over the study period is about 970,000 rows).
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
   (the selected area against Calgary, ward against ward, community against community, before against after).
2. Gather: use the data already in the app first (dashboard, police data, saved files), then the City's open data
   (query_dataset with counts and groups) and the other sources. Fetch only what the question needs, but enough to
   show a trend (at least 3 to 5 years where the data allows).
3. Check: note gaps, definition changes, partial months, records with
   no community, and anything that would change the reading. Normalise counts by residents (per 1,000) or homes when
   comparing areas of different size, and say which population count you used (the office's Settings choice, in the
   dashboard's population.method_label) and how the result moves under the other three (population.by_method).
4. Compute with calculate for every derived number (rates, % changes, shares, growth per year, trend slopes). Never do
   arithmetic in your head for a figure that goes in a report.
5. Report with make_report: a summary of 3 to 6 findings (each with its number), sections that each answer one part
   with a chart or table built from tool results, the method, every data source (name, dataset ID or link, publisher,
   period used), limits, recommendations that follow from the findings (each says which finding it rests on and a
   priority), and an action plan (action, who in the office or which City service, when, how success will be measured).
   Show the evidence: give each section the visuals that make it clear: a line or area chart for any trend over time,
   bars to compare communities or with Calgary, horizontal bars for rankings, stacked bars for parts of a total, a
   scatter for how two measures relate, a map of the area's communities shaded by a rate (values by community) or with
   points (incidents, permits, facilities; use source to fetch many), and tables with the exact figures. If the user
   asks for a particular kind of visual, include it. Every visual must use numbers from your tool results.
   Recommendations are options for the office, phrased plainly, never presented as City policy; do not recommend
   anything the data does not support. The readers are the Mayor, councillors and their staff, who know their area, its projects and
   City processes well: leave out anything obvious to them or that is routine office work (checking a project's opening
   date with the City, "monitor the data", "engage residents", "contact 311", "keep an eye on trends"). Each
   recommendation must be specific (which community, which service, how big the gap), rest on a finding from the data, and say
   something the office could not have known without this analysis. Fewer, sharper recommendations are better than a
   long list; if the data supports none, say so in one line instead of filling the section. Put tables the office may want in Excel in the sections; they are saved as CSV.
   An appendix listing every query you ran is added for you, so anyone can check the figures.
6. In the chat, after make_report, give the three most important findings in a few lines and say the PDF is in Files.
How a report reads (it is shared outside the office, so it must stand on its own):
- Plain language for a general reader: short sentences (under 20 words), everyday words, one idea per sentence. Say \
"people" or "residents", "per 1,000 residents", "since 2021". No jargon or code words: never "metric", "yardstick", \
"normalised", "scope", "tier", "weight", "shortfall", "capped", "method_label", field names or tool names.
- Never mention the app, the dashboard, Data Genie, the Data Scientist, a model, a list or a tab ("the app's model", \
"the Needs attention list", "the dashboard shows"). Name where a figure comes from in the City's words: "City of \
Calgary data", "the City's population forecast", "the City's property assessment roll (homes built since 2021)", \
"Calgary Police Service data", "OpenStreetMap". Say "our estimate from homes built since 2021", not "growth model"; \
"communities furthest below the Calgary level of amenities", not "the Needs attention list".
- Do not address the report to anyone or say who it is prepared for (no "prepared for the Mayor and Council", no \
"this office"). Write it for anyone who reads it.
- Explain each number once, the first time it appears, in a few words (for example "amenity level 0.46: just under \
half of Calgary's level of parks, playgrounds and other public amenities per resident").
- Keep tables narrow (5 or 6 columns at most) so they fit a phone; split a wide table in two.
- Growth from a small 2021 base: when a community grew more than 100% since 2021 (it was only partly built at the \
2021 Census), do not lead with the percentage. Say it plainly: "about 6,400 people now, up from 800 at the 2021 Census: \
most of it built since 2021 (homes on the property roll went from 357 to 2,216)". Use one growth figure per community \
throughout (the growth since 2021 that goes with the residents figure you show) and say which it is.
If the request is vague, pick a sensible scope, state it at the top of the report, and say what else could be added.

Beyond City data
- Weather and climate: the City does not publish weather records. Use get_weather (Environment Canada, Calgary \
International Airport station, northeast Calgary) for temperature, rain, snow and trends, by day, month or year, \
back to 1881.
- Before saying the City has no data on a topic, search the catalogue with at least two different wordings. If it \
truly isn't published, say so plainly and name the organisation that does publish it (for example Calgary Police \
Service for crime, Statistics Canada for detailed census tables, CMHC for housing starts and rents).

The selected area (all of Calgary or one ward)
- Missing persons: the police do not publish counts of missing persons by ward or community, so there are no \
statistics to give. The dashboard's "Missing persons: police appeals" card shows the Calgary Police appeals that are \
posted right now (read live from the police news releases, newsroom.calgary.ca/police-news-releases), with those \
naming a community in the selected area first. Point people there and to the police non-emergency line, 403-266-1234 (911 if someone \
may be in danger). Do not compile, save or put names of missing people in reports or files: the police take an appeal \
down once the person is found.
- Upcoming and major projects (new facilities, schools, LRT extensions such as the Green and Blue Lines, recreation centres, \
large private developments): get_dashboard section amenities, major_projects_being_built_or_planned, gives each \
project's status, cost, timing, what it includes and its sources; give those links and the checked date, and say \
when something (an opening date, a cost) is not published rather than guessing. For more detail, query the City's \
Development Permits (6933-unw5) and Building Permits (c2es-76ed) by address or community, and \
largest_building_permits_not_homes lists the period's biggest non-housing permits. You cannot read news websites: if \
asked for news newer than the checked date, say so and suggest the project page link.
- Who lives in the area: get_dashboard section profile (the 2021 Census profile of the selected ward; for all of \
Calgary selected, pass ward=N for any ward's profile, and each item also holds Calgary's figure; read it before \
searching older Census datasets; people in private \
households, 2021 ward boundaries). Use it for context in reports and briefings (for example language when planning \
outreach, household size when comparing per household and per person, crowding and renters for housing questions), \
always say it is the 2021 Census, and never use it as today's population.
- Population: the office chooses in Settings how residents are counted; get_dashboard section overview gives it \
as population.method / method_label (the default is 'city_actual', the City's own total shared by actual growth; 'city_pace' is the City's total at one rate for all), and population.by_method gives the area today under every way of counting: 'model' (the \
growth model: homes on the City's property assessment roll x 2021 Census people per home, recalculated at every \
refresh), 'census2021' (2021 Census counts, no growth: the same base as the City's own 311 ward dashboard, which shows \
requests per 100 households using 2021 Census households, not per resident) and \
'city_pace' (grown to the City's total: communities built since 2021 keep their growth model count, every other \
community is its 2021 Census count x one factor, (the City's estimate for the month - the new communities) / Calgary's 2021 \
Census count of 1,288,995, so all of Calgary adds up to the City's own figure, 1,598,075 in November 2026; the factor also \
brings in people the Census count of private homes leaves out, so its "growth since 2021" reads higher than real growth, \
which the City puts at about 20.7% since May 2021) and \
'city_actual' (the City's total, shared by actual growth: each community = its 2021 Census count x f + the growth the \
growth model measured there from homes built; f = 1 + (the City's estimate - Calgary's growth model total) / 1,288,995, \
1.1014 in November 2026 (population.actual_factor), so Calgary still adds up to the City's figure but growth lands where \
homes were built. f is not people per home: it multiplies every community's 2021 count (+10.14%); from the growth \
model, which already holds the 2021 count once, residents = growth model + 2021 count x (f - 1), e.g. Martindale \
14,770 + 14,540 x 0.1014 = 16,245 (get_code name actual_factor has the worked example); children likewise: 2021 children x one factor + the growth model's children for new homes, matching \
the City's forecast of children). Every figure that uses residents is worked out again under the chosen way of \
counting. Exact code: get_code topic population (counts, actual_factor, total_fix) and children. The dashboard also \
shows a live population counter: the figure from the last refresh plus the City's forecast pace since then (get_code \
topic live_counter); each morning's refresh resets it. The City's population figure comes from the City of Calgary's \
Calgary and Region Economic Outlook 2026-2031 (Spring 2026), Table 4 "City of Calgary Population Projection", page 19, \
Total Population as of April (2021-2025 estimates, 2026 onward forecast): https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf \
(overview page: https://www.calgary.ca/cfod/finance/corporate-economics/economic-outlook-population-outlook.html). \
A month's figure is read on a straight line between April figures: November 2026 = 1,583,200 + 7/12 x (1,608,700 - \
1,583,200) = 1,598,075. Cite this exact document and table whenever you quote the City's population. Under 'city_pace', children (per 1,000 \
children measures, child care spaces per 100 children) follow the same table's Population by Cohort (0-4, 5-9, 10-14; \
Calgary aged 0 to 14 in November 2026: about 272,100; the exact figure for today is in the dashboard), shared by each community's 2021 count of children. Every \
residents figure and rate per 1,000 in the dashboard uses the chosen method; always say which one, and when it matters \
show how the answer changes under the others (rates scale by the ratio of the populations). Where many homes were \
built since 2021 (the new suburbs, much of the northeast) the 2021 Census and a single city-wide growth factor \
undercount residents, while the growth model can undercount established areas and towers that filled up without new \
homes; compare population.by_method for the selected area before choosing. \
How the model counts homes (homes_now): accounts on the Current Year Property Assessments roll (4bsw-nn7w) with \
assessment_class='RE' AND property_type='LI' AND sub_property_use starting with 'R' (dwellings). That leaves out \
land-only lots (property_type 'LO'), non-residential and farmland, and residential accounts that are not homes: \
condo parking stalls (sub_property_use A004, addresses ending in V), storage units (A005, addresses ending in S) and \
other accessory or under-construction units (A000, A006, A007). A home counts as lived in one year after its \
year_of_construction, spread evenly through the year, so homes built this year and part of last year are not yet \
counted. A rental apartment building is one roll account; the model swaps it for its number of units. To reconcile \
the roll with homes_now, count the roll with those filters and by year_of_construction.
- Record numbers vs dataset IDs: a code like c2es-76ed or 4bsw-nn7w (four letters or digits, a dash, four more) is the \
ID of a whole dataset, never a record. If the user gives one as if it were a permit or a property, say in one line \
which dataset it is and where the record number is, then help: the Population build-up Excel (sheet "Rental \
buildings") lists each building's address, roll number and building permit number(s). Building permit numbers look \
like BP2016-08149 (development permits DP...): look one up with query on c2es-76ed where permitnum='BP2016-08149' and \
say what it is (address, community, permit type and class, description, housing units, status, applied, issued and \
completed dates). A roll number (9 digits) is a property: look it up in 4bsw-nn7w by roll_number (try it with and \
without the leading zero). For a rental building's units and the permits behind them, use get_dashboard section \
population_recon with find (permit number, roll number or address).
- Families: get_dashboard also has licensed child care in the selected area by quarter and community (Government of \
Alberta Child Care Information, with each program's inspections and enforcement over the last 12 months) and \
students enrolled in each school in the area by year (Government of Alberta student enrolment). Children 0-4 and 0-14 \
follow the way of counting residents: by default each community's 2021 children x one factor + the growth model's \
children for its new homes, so Calgary matches the City's forecast of children (get_code topic children). Family day home agencies are listed but their spaces are not \
counted, because the homes they oversee are spread across the city.
- Name the area of every figure, in the same sentence as the figure ("Ward 5's violent crime rose 13.7%"; never a bare \
"violent crime rose"). When you put an area next to Calgary, keep them apart and say how they compare in plain words, \
especially when they move in opposite directions: "Ward 5's violent crime rose 13.7%, while Calgary's as a whole fell \
7.6%". Never put a Calgary figure inside a line or bullet that is about a ward or community without its own label.
- Ranking wards: whenever an answer says a ward is highest, lowest, second, "the most" or "of 14", take the place from \
get_dashboard section wards, ranks[measure][ward] (1 = highest), never by reading the rows; and use the wards \
section's ward figures (they count every community, so they add up to Calgary) instead of re-querying a dataset and \
assigning wards yourself.
- Amenities and growth: get_dashboard section amenity_gap has the app's amenity level, its method step by \
step (method), the level under all four ways of counting residents (level_under_each_resident_count) and every \
dataset. Explain the level from method, never by working the formula out backwards. section wards has every ward's \
level under all four counts (amenity_level_by_method), and with amenities that are not the City's too \
(amenity_level_all, amenity_level_all_by_method: only the ones open to everyone), and with private, residents-only ones too (amenity_level_all_private, amenity_level_all_private_by_method: OpenStreetMap access=private, homeowners' association and condo parks and playgrounds; on screen only when the "include private ones" filter is on, off by default).
- Needs attention: get_dashboard section needs_attention has the communities that most need public \
amenities (tier Urgent, High or Watch; the amenity level and the amenity level with growth counted, both on one \
scale where 1.00 = Calgary and lower = needs more; the shortfall and growth weight; and what it would \
take to reach the Calgary level). It counts the City's amenities plus the ones that are not the City's from \
OpenStreetMap that are open to everyone (developer, school), with City ones taken out so nothing counts twice (get_code \
topic other_amenities); each row also has the City-only level. Private, residents-only ones (access=private: homeowners' \
association, condo) are left out by default and counted only when the screen's "include private ones" filter is on \
(needs_attention_with_private). For a list of these amenities, their counts or their links, use get_dashboard section \
other_amenities (with ward or community): every feature is saved there with its name and OpenStreetMap link, and its \
totals count every community in the ward (business and industrial areas too), the same as the Growth vs amenities tab. \
Never build those totals from the Needs attention rows, which hold only the communities ranked there. When asked \
for all of them, or for a list longer than about 40, call it with save_csv=true and show_on_map=true: give the totals \
by kind (and ward), show the first rows with their links, and say the whole list, every row with its link, is saved \
in Files and shown on the map. Narrow with ward, community, kind or gated when the question does. Never call these \
figures a score: say "amenity level 0.30 (30% of Calgary's level)". The ranking is worked out in attention.py (get_code topic \
needs_attention). Always \
(in answers, reports and their recommendations) present it as priorities for review from open data, never as a \
spending recommendation or a list of things to buy: the data has no costs, misses school, private and community association facilities and amenities just across a boundary, and new \
communities often have developer-built parks still to come.

Extra detail for Ward 5 (use only when the question is about Ward 5)
- Residential communities (comm_code): Castleridge CAS, Cityscape CSC, Cornerstone CNS, Falconridge FAL, Homestead HSD, \
Martindale MRT, Redstone RSN, Saddle Ridge SAD, Skyview Ranch SKR, Taradale TAR. Business and industrial areas: SRI, \
DBC, SGL, SKE, WES, PEG, CIA, ST2, ST3, ST4, 05D, 05E, 05F, 05G.
- The 311 study's Ward 5 means its nine study communities: comm_code in('CAS','CSC','CNS','FAL','MRT','RSN','SAD','SKR',\
'TAR'). Homestead (HSD, new since the 2021 Census) and the business and industrial areas were not in the study. For a \
study-period request about Ward 5, use the nine communities, say so, and offer a second file that adds Homestead and \
the business areas. The study's own Ward 5 file had 56,473 requests (downloaded Oct 31, 2026); a fresh download can \
differ by a few as the City closes or merges requests.
- For Ward 5 the profile section also holds the City's full Ward 5 profile (more tables than the other wards have).

City budget
The City's budget is in Calgary Open Budget (fqax-i3nz): budget_department, level_2, business_unit, year, budget_status
(Approved or Actual), fund ('Capital' or 'Operating Expenditures Net of Recoveries') and budget in millions of dollars;
2026 is the latest operating year, capital runs to 2032. The City does not publish its budget by ward or community:
say so plainly, then give what can be placed in a ward. Property tax by ward is not published either; the app
estimates it (get_dashboard section property_tax: the assessment roll by community, public and institutional
property left out, scaled to the bylaw's taxable assessment, times the bylaw's rates; Calgary's total equals the
bylaw's levy). Always call it an estimate of tax billed, not collected, and give the method in one line. Other
revenue (user fees, franchise fees, grants) has no location (City and partner projects and road projects with a published
cost, from get_dashboard section amenities).

Questions about anything shown in the app
Every figure, list, chart and map in the app comes from data you can reach (get_dashboard and its sections,
get_method, the open data tools). Answer such questions from that data, with the number; never reply that you do not
know, cannot see the screen, or do not have the data, before looking in every relevant section.

When the data cannot answer the question exactly as asked
Questions such as "what is the number 1 issue in Bowness?" or "what do residents care about most?" have no single \
dataset that answers them. Never open with "I don't know", "I can't tell you" or "there is no data". Open with the \
best answer the data does give, said plainly and framed by what it measures, for example: "By 311 requests over \
the last 12 months, Bowness's most reported issue is ... (n requests, x% of the community's total), followed by ..." \
Then give one or two other readings if they differ (open requests, infrastructure reports, police calls, traffic \
incidents), and close with one short sentence on what the data cannot show (what residents think matters most is \
not measured; a survey or the office's own casework would show it). Stay courteous and confident: the Mayor or \
councillor should be able to repeat your first sentence in a meeting.

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
     'description': "Save a dataset (optionally filtered) as a CSV file in the app's downloads folder.",
     'input_schema': {'type': 'object', 'properties': {
         'dataset_id': {'type': 'string'},
         'file_name': {'type': 'string', 'description': 'A clear file name, e.g. "Ward 3 open 311 requests" or "Calgary traffic incidents 2025"'},
         'select': {'type': 'string'}, 'where': {'type': 'string'}, 'order': {'type': 'string'}},
         'required': ['dataset_id', 'file_name']}},
    {'name': 'get_dashboard',
     'description': "The app's current figures for the area selected in the app (all of Calgary or one ward; the "
                    'scope field says which): population today and at the 2021 Census (under the way of counting chosen '
                    'in Settings, and every other way in population.by_method), 311 requests per community and per 1,000 '
                    'residents (last 12 months vs the 12 before), requests by City service area, open requests, closure '
                    'speed, app use, traffic incidents, new homes, social disorder, licensed child care spaces and '
                    'inspections, school enrolment, infrastructure reports per 1,000 (the study\'s 21 types), development '
                    'permits, road construction, and amenities (recreation facilities, libraries and community centres, '
                    'playgrounds, transit stops) by community. Figures are for the period selected on the dashboard '
                    '(period_spec); rates are per 1,000 residents a year. section="crime" gives the area\'s crime and '
                    'disorder by category and community from the Calgary Police Service (monthly, published quarterly) '
                    'and the Crime Severity Index for Calgary and other cities. section="amenities" also lists City and '
                    'other major projects being built or planned in the area, road projects and the largest non-housing '
                    'building permits of the period. section="profile" (with ward=N for any ward, also when all of Calgary is '
                    'selected; Ward 5 has the full printed profile incl. immigrants and languages) gives who lives in the area against Calgary (2021 '
                    'Census): household size, children and seniors, languages spoken at home, immigrants and recent '
                    'arrivals, renters, crowding, housing costs, income, low income, shift work and commuting. '
                    'section="amenity_gap" gives City assets (benches, picnic tables, playgrounds, sports equipment, park '
                    'washrooms, fountains, bins, off-leash areas, neighbourhood park space, trees, facilities, transit stops) '
                    'per 1,000 residents in each community against the city, an amenity level, and the communities flagged '
                    'because amenities have not kept up with growth. section="needs_attention" ranks the communities that '
                    'most need public amenities (tier, amenity level with growth counted, what each would take to reach the Calgary level). '
                    'section="other_amenities" lists the private amenities accessible to the community (OpenStreetMap, not '
                    'the City\'s: playgrounds, parks, courts, fitness stations, dog parks), every one with its name and map '
                    'link, with community and ward totals that match the Growth vs amenities tab; pass ward (a number) or '
                    'community (code or name) to narrow it. '
                    'section="property_tax" gives the property tax estimate by ward and community. section="wards" gives '
                    'all 14 wards and Calgary side by side (residents, growth, 311, crime, traffic, building, child care, '
                    'amenities) with each ward\'s place on every measure (ranks), whatever area is selected; '
                    'section="ward_amenities" gives every asset ward by ward (City, private accessible and gated).',
     'input_schema': {'type': 'object', 'properties': {'section': {
         'type': 'string', 'enum': ['overview', 'communities', 'child_care', 'schools', 'development', 'amenities', 'amenity_gap', 'needs_attention', 'other_amenities', 'ward_amenities', 'population_recon', 'crime', 'traffic', 'rents', 'profile', 'wards', 'property_tax'],
         'description': 'Which part of the dashboard; overview by default'},
         'ward': {'type': 'integer', 'description': 'sections other_amenities and profile: one ward (with all of '
                                                    'Calgary selected, profile needs a ward)'},
         'kind': {'type': 'string', 'description': 'section other_amenities: playground, park, basketball court, '
                                                   'fitness station or dog park'},
         'gated': {'type': 'boolean', 'description': 'section other_amenities: true = only gated, residents-only ones; '
                                                     'false = only the ones accessible to the community; leave out for both'},
         'save_csv': {'type': 'boolean', 'description': 'section other_amenities: also save the whole list, every row '
                                                        'with its map link, as a CSV in Files (use for "all" or long lists)'},
         'show_on_map': {'type': 'boolean', 'description': 'section other_amenities: also show every one on the map'},
         'community': {'type': 'string', 'description': 'sections other_amenities and amenity_gap: one community (code '
                                                         'or name); amenity_gap then gives its whole amenity-level working; '
                                                         'population_recon: that community\'s rental buildings (code)'},
         'find': {'type': 'string', 'description': 'section population_recon: find a rental apartment building of the '
                                                   'Population build-up by building permit number (BP2016-08149), roll '
                                                   'number or address, with its units and permits'}}}},
    {'name': 'get_weather',
     'description': 'Calgary weather history from Environment Canada (Calgary International Airport, northeast Calgary): '
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
         'wards': {'type': 'array', 'items': {'type': 'string'}, 'description': 'e.g. ["3"] or ["Ward 3"]; empty for all Calgary'},
         'communities': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Community names in capitals, e.g. ["BOWNESS"]'},
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
                    'topic: a key (311, population_choice, population, children, homes, growth_checks, live_counter, '
                    'needs_attention, other_amenities, amenity_gap, rates, compare, permits, dp, traffic, police, csi, '
                    'rents, child_care, schools, amenities, roads, cameras, city_disorder, budget, property_tax, weather), '
                    'a dataset ID or a word; empty lists the topics.',
     'input_schema': {'type': 'object', 'properties': {'topic': {'type': 'string'}}}},
    {'name': 'get_code',
     'description': "The app's own Python code behind any figure: the exact formula, constants and thresholds that "
                    'produced it. topic (empty lists them): needs_attention, other_amenities, amenity_gap, assets, '
                    'population, population_recon, homes, growth_checks, live_counter, growth_model, '
                    'children, rates, periods, property_tax, budget, crime, child_care, rents, wards, census, report_auditor. '
                    'Or name: one function or constant (e.g. city_factor, scope_level, GAP_LEVEL), optionally with file. '
                    'Or text with file: search a file (e.g. text "1,598", file "dashboard.py").',
     'input_schema': {'type': 'object', 'properties': {
         'topic': {'type': 'string'}, 'name': {'type': 'string'}, 'file': {'type': 'string'}, 'text': {'type': 'string'}}}},
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
                    'lat_field, lon_field, label_field and a where filter; inside_area=true keeps only points inside the '
                    'selected ward\'s boundary. source.layer="area_traffic" maps the dashboard\'s traffic incidents in the '
                    'selected area (last 90 days of the selected period). Returns how many points were mapped.',
     'input_schema': {'type': 'object', 'properties': {
         'title': {'type': 'string'},
         'points': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'lat': {'type': 'number'}, 'lon': {'type': 'number'}, 'label': {'type': 'string'}},
             'required': ['lat', 'lon']}},
         'source': {'type': 'object', 'properties': {
             'layer': {'type': 'string', 'enum': ['area_traffic']},
             'dataset_id': {'type': 'string'}, 'lat_field': {'type': 'string'}, 'lon_field': {'type': 'string'},
             'label_field': {'type': 'string'}, 'where': {'type': 'string'}, 'inside_area': {'type': 'boolean'},
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
                 'values': {'type': 'object', 'description': 'map: communities of the selected area shaded by value, keyed by community name or code, e.g. {"Bowness": 17.3}'},
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
    'get_dashboard': lambda a: 'Reading the dashboard' + ('' if (a.get('section') or 'overview') == 'overview' else f" ({a.get('section').replace('_', ' ')})"),
    'get_weather': lambda a: f"Getting Environment Canada weather, {a.get('start', '')} to {a.get('end', '')}",
    'police_crime': lambda a: f"Reading Calgary Police {a.get('kind', 'crime')} data saved on this computer",
    'crime_severity_index': lambda a: 'Reading the Crime Severity Index',
    'list_saved_files': lambda a: 'Checking the files already saved',
    'get_method': lambda a: f"Reading how the app counts {a.get('topic') or 'its figures'}",
    'get_code': lambda a: f"Reading the app's code for {a.get('topic') or a.get('name') or a.get('text') or 'its formulas'}",
    'query_saved_file': lambda a: f"Working with the saved file “{a.get('file_name', '')}”",
    'save_table': lambda a: f"Saving “{a.get('file_name', '')}”",
    'show_chart': lambda a: 'Drawing a chart',
    'show_table': lambda a: 'Building a table',
    'show_map': lambda a: 'Placing points on a map',
    'calculate': lambda a: f"Working out {len(a.get('calculations') or [])} figure{'s' if len(a.get('calculations') or []) != 1 else ''}",
    'make_report': lambda a: f"Writing the report “{a.get('title', '')}”: PDF, interactive version and Excel workbook",
}


def _fit(obj, cap):
    """Make a tool result fit: shorten its longest list again and again (saying so in the result) until it fits."""
    import copy
    o = copy.deepcopy(obj)
    notes = []

    def compact(x):                                   # {code: {field: value}} with many codes -> one table, same data
        if isinstance(x, dict):
            for k, v in list(x.items()):
                if isinstance(v, dict) and len(v) > 40 and all(isinstance(e, dict) for e in v.values()):
                    fields = sorted({f for e in v.values() for f in e})
                    x[k] = {'fields': ['key'] + fields, 'rows': [[kk] + [e.get(f) for f in fields] for kk, e in v.items()]}
                else:
                    compact(v)
        elif isinstance(x, list):
            for v in x:
                compact(v)
    compact(o)

    def longest(x):
        best = (0, None, None)
        if isinstance(x, dict):
            for k, v in x.items():
                if isinstance(v, list) and len(v) > 5:
                    n = len(json.dumps(v, default=str))
                    if n > best[0]:
                        best = (n, x, k)
                if isinstance(v, (dict, list)):
                    sub = longest(v)
                    if sub[0] > best[0]:
                        best = sub
        elif isinstance(x, list):
            for v in x:
                if isinstance(v, (dict, list)):
                    sub = longest(v)
                    if sub[0] > best[0]:
                        best = sub
        return best
    for _ in range(40):
        if len(json.dumps(o, default=str)) <= cap - 400:
            break
        n, parent, key = longest(o)
        if not parent:
            break
        was = len(parent[key])
        parent[key] = parent[key][:max(5, was // 2)]
        notes.append(f'{key}: first {len(parent[key])} of {was}')
    if notes and isinstance(o, dict):
        o['_shortened'] = ('Lists shortened to fit: ' + '; '.join(notes) + '. Ask for one ward or community, or query the '
                           'dataset, for the rest.')
    return o


def _attention_out(a, ward_of, short=False):
    """The Needs attention ranking for the agent. short: the counts and the ten most urgent names (for amenity_gap);
    otherwise every Urgent and High community and the Watch ones, most urgent first, with what each would take."""
    if not a:
        return None
    rows = a.get('rows') or []
    base = {'counts': a.get('counts'), 'residents': a.get('residents'), 'communities_checked': a.get('checked'),
            'counts_amenities': "the City's and OpenStreetMap's (not the City's, City ones taken out)" if a.get('with_other')
            else "the City's only"}
    if short:
        return {**base, 'most_urgent': [f"{r['name']} ({r['tier']}, amenity level {r['level']}, growth counted {r['level_growth']})" for r in rows[:10]],
                'more': 'get_dashboard section needs_attention has every listed community, its figures and what each would take',
                'caution': 'Priorities for review from open data, never a spending recommendation.'}
    top = [r for r in rows if r['tier'] != 'Watch']
    watch = [r for r in rows if r['tier'] == 'Watch']
    keep = top + watch[:max(0, 45 - len(top))]
    return {**base, 'thresholds': a.get('thresholds'), 'method': a.get('method'),
            'formula': 'level_growth (amenity level, growth counted) = 1 - shortfall * weight; shortfall = max(0, 1 - level); '
                       'weight = 1.0 if new since 2021 else 0.5 + min(max(growth_pct, 0), 100) / 200 (attention.py). '
                       'Same scale as the amenity level: 1.00 = Calgary, lower = needs more. There is no score: never '
                       'call either figure a score or a mark out of 100.',
            'shown': 'every listed community' if len(keep) == len(rows) else
                     f'every Urgent and High community and the {len(keep) - len(top)} lowest Watch ones of {len(watch)}',
            'growth_note': 'growth_since_2021_pct is the growth model\'s (homes built), whatever way residents are counted',
            'rows': [{**{k: r.get(k) for k in ('name', 'tier', 'level', 'level_growth', 'shortfall', 'weight', 'residents')},
                      'growth_since_2021_pct': r.get('growth_pct'),
                      **({'new_since_2021': True} if r.get('new') else {}), 'ward': ward_of.get(r.get('code')),
                      **({'level_city_only': r.get('level_city')} if r.get('level_city') is not None else {}),
                      **({'not_city_openstreetmap': r.get('other')} if r.get('other') else {}),
                      'to_reach_calgary_level': '; '.join(f"{c['label']} +{c['need']}{' ha' if c['unit'] == 'ha' else ''} (has {c['have']})"
                                                          for c in r.get('catch_up') or [])}
                     for r in keep]}


OSM_KIND_WORD = {'playgrounds': 'playground', 'fitness': 'fitness station', 'basketball': 'basketball court',
                 'off_leash': 'dog park', 'local_park_ha': 'park'}


def _other_amenities_out(d, ward=None, community=None, kind=None, gated=None, save=None, show=None):
    """Private amenities accessible to the community (OpenStreetMap, not the City's): every community's counts, the
    ward and area totals (the same figures as Growth vs amenities > Assets) and every feature with its map link.
    ward: a ward number to narrow the city view to; community: a community code or name."""
    g = d.get('amenity_gap') or {}
    o = g.get('other') or {}
    if not o:
        return {'error': 'The OpenStreetMap amenities are not in this refresh (OpenStreetMap could not be reached).'}
    cs = {c['code']: c for c in d.get('communities') or []}
    want = None
    if community:
        q = str(community).strip().upper()
        want = {c for c, v in cs.items() if c == q or str(v.get('name', '')).upper() == q}
    try:
        w = int(ward) if ward not in (None, '', 0, '0') else None
    except (TypeError, ValueError):
        w = None
    keep = lambda c: (want is None or c in want) and (w is None or (cs.get(c) or {}).get('ward') == w)
    feats = [f for f in o.get('features') or [] if keep(f.get('comm'))]
    if kind:                                      # playground, park, basketball court, fitness station, dog park
        kw = str(kind).lower().rstrip('s')
        feats = [f for f in feats if kw in OSM_KIND_WORD.get(f.get('kind'), '') or kw in str(f.get('kind'))]
    if gated is not None:                         # True: only gated, residents-only; False: only accessible ones
        feats = [f for f in feats if bool(f.get('private')) == bool(gated)]
    kinds = list(OSM_KIND_WORD)

    def tot(by):
        return {k: round(sum((v or {}).get(k, 0) for c, v in by.items() if keep(c)), 2) for k in kinds}
    rows = []
    for c in sorted({f.get('comm') for f in feats}, key=lambda c: str((cs.get(c) or {}).get('name', c))):
        rows.append({'community': (cs.get(c) or {}).get('name', c), 'code': c, 'ward': (cs.get(c) or {}).get('ward'),
                     'residential': (cs.get(c) or {}).get('residential'),
                     'accessible': (o.get('by_comm') or {}).get(c) or {},
                     'gated_residents_only': (o.get('by_comm_private') or {}).get(c) or {}})
    out_f = [{'kind': OSM_KIND_WORD.get(f.get('kind'), f.get('kind')), 'name': f.get('name') or '(no name mapped)',
              'community': (cs.get(f.get('comm')) or {}).get('name', f.get('comm')), 'ward': (cs.get(f.get('comm')) or {}).get('ward'),
              **({'hectares': f['ha']} if f.get('ha') is not None else {}),
              'gated_residents_only': bool(f.get('private')),
              'link': f"https://www.openstreetmap.org/{f.get('osm')}"} for f in feats]
    saved = None
    if save and out_f and save:                   # the whole list as a CSV in Files, every row with its map link
        cols = ['kind', 'name', 'community', 'ward', 'hectares', 'gated_residents_only', 'link']
        saved = save('private amenities accessible to the community' + (f' ward {w}' if w else ''), cols,
                     [[f.get(c, '') for c in cols] for f in out_f])
    if show and feats:                            # every one on the map, labelled, with its link
        show([{'lat': f['lat'], 'lon': f['lon'],
               'label': f"{OSM_KIND_WORD.get(f.get('kind'), f.get('kind'))}{' (gated)' if f.get('private') else ''}"
                        f"{' · ' + f['name'] if f.get('name') else ''} · {(cs.get(f.get('comm')) or {}).get('name', f.get('comm'))}"
                        f" · https://www.openstreetmap.org/{f.get('osm')}"} for f in feats if f.get('lat') is not None])
    limit = 40 if saved else 80                   # what fits in one answer; the CSV holds the rest
    return {**({'saved_csv': saved} if saved else {}), **({'shown_on_map': len(feats)} if show and feats else {}),
            'area': (f'Ward {w}' if w else 'the area on screen') + (f', {community}' if community else ''),
            'totals_accessible': tot(o.get('by_comm') or {}),
            'totals_gated_residents_only': tot(o.get('by_comm_private') or {}),
            'by_community': {'fields': ['community', 'code', 'ward', 'residential', 'accessible', 'gated_residents_only'],
                             'rows': [[r_[k] for k in ('community', 'code', 'ward', 'residential', 'accessible',
                                                       'gated_residents_only')] for r_ in rows]},
            'features': out_f[:limit], 'features_count': len(out_f),
            **({'features_cut': f'Only the first {limit} of {len(out_f)} are listed here' +
                                ('; the whole list is in the saved CSV.' if saved else
                                 ': call again with save_csv=true for the whole list with links, or narrow it.')}
               if len(out_f) > limit else {}),
            'counted': o.get('counted'), 'source': '© OpenStreetMap contributors (Open Database Licence)',
            'note': 'Private amenities accessible to the community: playgrounds, fitness stations, basketball courts, dog '
                    'parks and parks mapped in OpenStreetMap that are not the City\'s (every one matching a City amenity is '
                    'taken out; get_code topic other_amenities). Totals count every community in the area, business and '
                    'industrial areas too, so they match Growth vs amenities > Assets and the wards section '
                    '(amenity_counts_other); the Needs attention cards list only the communities ranked there. '
                    'gated_residents_only (OpenStreetMap access=private: homeowners\' association, condo) are counted only '
                    'when the screens\' "Also count gated, residents-only ones" box is ticked. Give the user the links: '
                    'each opens that feature on the OpenStreetMap map.'}


def find_rental_buildings(text, comm=None, limit=60):
    """Rental apartment buildings the population build-up counts (data/rentals_all.json, every community): find by
    building permit number (BP2016-08149), roll number (with or without the leading zero), address or community code.
    Each: roll, address, community, property code, year built, units, where the units come from, and its permits."""
    import population
    try:
        with open(population.RENTALS_FILE, encoding='utf-8') as f:
            props = json.load(f).get('properties') or []
    except (OSError, ValueError):
        return {'error': 'The rental buildings list could not be read.'}
    t = str(text or '').strip().upper()
    key = t.lstrip('0')
    def hit(p):
        if comm and str(p.get('comm', '')).upper() != str(comm).upper():
            return False
        if not t:
            return True
        return (any(q.get('num', '').upper() == t for q in p.get('permits') or [])
                or (key and str(p.get('roll', '')).lstrip('0') == key)
                or t in str(p.get('address', '')).upper() or t == str(p.get('comm', '')).upper())
    found = [p for p in props if hit(p)]
    words = {'permit': 'building permit(s): the housing units on the permit', 'estimated':
             "estimated from the building's assessed value (no permit found)", 'yoc': 'building permit for the year built'}
    return {'found': len(found), 'shown': min(len(found), limit),
            'buildings': [{'roll': p.get('roll'), 'address': p.get('address'), 'community': p.get('comm'),
                           'property_code': p.get('code'), 'year_built': p.get('year_of_construction'), 'units': p.get('units'),
                           'units_from': words.get(p.get('source'), p.get('source')),
                           'permits': [{'permit_number': q['num'], 'units': q['units'], 'completed': q.get('done'),
                                        'record': f"https://data.calgary.ca/resource/c2es-76ed.json?permitnum={q['num']}"}
                                       for q in p.get('permits') or []],
                           'property_roll_record': f"https://data.calgary.ca/resource/4bsw-nn7w.json?roll_number={p.get('roll')}"}
                          for p in found[:limit]],
            'note': "These are the rental apartment buildings in the Population build-up (sheet \"Rental buildings\" of its "
                    "Excel). A rented-out building is one account on the property roll, so its flats are counted from its "
                    "building permit(s), or estimated from its assessed value when no permit was found. Permit numbers look "
                    "like BP2016-08149; c2es-76ed (Building Permits) and 4bsw-nn7w (Property Assessments) are dataset IDs, "
                    "not records."}


def dashboard_section(d, section='overview', wards=None, extra=None):
    """The dashboard's figures for the selected area (all of Calgary or one ward), one part at a time so each answer
    fits. wards: () -> the summary of every ward (built from the whole-city dashboard), for section="wards"."""
    fam = d.get('families') or {}
    cc, sc = fam.get('child_care') or {}, fam.get('schools') or {}
    dv, am = d.get('development') or {}, d.get('amenities') or {}
    if section == 'communities':
        cs = d['communities']
        if len(cs) > 40:                          # the whole city: the main figures only, so every community fits
            keys = ('code', 'name', 'ward', 'residents', 'growth_pct', 'requests_per_1000', 'infra_per_1000', 'open_per_1000',
                    'new_homes12')
            return {'period': d.get('period'), 'prev_period': d.get('prev_period'), 'fields': keys,
                    'communities': [[c.get(k) for k in keys] for c in cs if c.get('residential')],
                    # every community code, business and industrial areas too, so a query by community adds up by ward
                    'ward_of_every_community': {c['code']: c.get('ward') for c in cs if c.get('code')}}
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
                'note': 'For a map of all the points use show_map with source layer area_traffic.'}
    if section == 'rents':
        return {'rents': d.get('rents')}
    if section == 'profile':
        return {'ward_profile_2021_census': d.get('profile')}
    if section == 'crime':
        return {'ward_crime': d.get('crime'), 'crime_severity_index': d.get('safety')}
    if section == 'population_recon' and ((extra or {}).get('find') or (extra or {}).get('community')):
        return find_rental_buildings((extra or {}).get('find'), (extra or {}).get('community'))
    if section == 'population_recon':
        rc = (d.get('population') or {}).get('recon') or {}
        keys = ('code', 'name', 'census2021', 'households_2021', 'homes_census', 'homes_now', 'people_per_home',
                'people_in_homes', 'units_now', 'people_per_unit', 'people_in_units', 'method', 'population', 'residents')
        return {**{k: rc.get(k) for k in ('t', 'lag', 'roll_year', 'method', 'factor_actual', 'factor_pace', 'homes_where',
                                          'totals')},
                'fields': keys, 'rows': [[r.get(k) for k in keys] for r in rc.get('rows') or []],
                'step_example': next((r.get('step') for r in rc.get('rows') or [] if r.get('step')), None),
                'rental_buildings': len(rc.get('rentals') or []),
                'note': 'Each row: homes x people per home + rental units x people per unit = the growth model (population), '
                        'then the step to the way of counting in use (residents). method "household size" rows use the 2021 '
                        'household size for the change in homes only. The screen Growth vs amenities > Population build-up '
                        'lists every property. Code: get_code topic population_recon. For the rental buildings (with their '
                        'addresses, units and building permit numbers) pass find (a permit number, roll number or address) '
                        'or community.'}
    if section == 'other_amenities':
        return _other_amenities_out(d, wards)
    if section == 'needs_attention':
        g = d.get('amenity_gap') or {}
        ward_of = {c['code']: c.get('ward') for c in d.get('communities') or []}
        return {'needs_attention': _attention_out(g.get('attention'), ward_of),
                **({'needs_attention_with_private': _attention_out(g.get('attention_private'), ward_of, short=True),
                    'private_note': 'needs_attention (the default) leaves out private, residents-only amenities '
                                    '(OpenStreetMap access=private: homeowners\' association, condo); '
                                    'needs_attention_with_private adds them, as the screen does when its "include '
                                    'private ones" filter is on.'} if g.get('attention_private') else {}),
                'caution': 'Priorities for review from open data, not a spending recommendation: no costs; school, private '
                           'and community association amenities and those across a boundary are not counted; new '
                           'communities often have developer-built parks still to come.'} if g.get('attention') else \
            {'error': 'The amenity data is not available in this refresh.'}
    if section == 'amenity_gap':
        community = (extra or {}).get('community')
        g = d.get('amenity_gap') or {}
        rows = g.get('by_comm') or []
        many = len(rows) > 40                     # the whole city: the flagged and the 40 lowest, without the detail
        keys = ('code', 'name', 'residents', 'growth_pct', 'new', 'level', 'flag', 'short') if many else \
            ('code', 'name', 'residents', 'growth_pct', 'new', 'children_0_14', 'level', 'flag', 'short', 'vs_city', 'n')
        pick = [r for r in rows if r.get('flag')] + [r for r in rows if not r.get('flag')][:40 if many else len(rows)]
        ward_of = {c['code']: c.get('ward') for c in d.get('communities') or []}
        bm = {k: {'label': v.get('label'), 'level': v.get('level'), 'residents': v.get('residents'),
                  'flagged_count': len(v.get('flagged') or [])} for k, v in (g.get('by_method') or {}).items()}
        if community:                            # one community's whole working, kind by kind
            q = str(community).strip().upper()
            r = next((x for x in rows if x['code'] == q or str(x.get('name', '')).upper() == q), None)
            if not r:
                return {'error': f'{community} has no amenity level (fewer than 100 residents, or not a lived-in community).'}
            kinds_ = g.get('kinds') or {}
            local = [k for k, v in kinds_.items() if v.get('local')]
            work = []
            for k, v in (r.get('vs_city') or {}).items():
                per_ch = (kinds_.get(k) or {}).get('per') == 'children'
                work.append({'kind': (kinds_.get(k) or {}).get('label', k), 'count': (r.get('n') or {}).get(k),
                             'divided_by': ('children 0 to 14: ' if per_ch else 'residents: ') +
                                           str(r.get('children_0_14') if per_ch else r.get('residents')),
                             'per_1000': (r.get('per_1000') or {}).get(k),
                             'calgary_per_1000': ((g.get('city') or {}).get(k) or {}).get('per_1000'),
                             'share_of_calgary': v, 'capped_at_2': min(v, 2.0),
                             'in_the_level': k in local})
            used = [w['capped_at_2'] for w in work if w['in_the_level']]
            return {'community': r.get('name'), 'code': r['code'], 'residents': r.get('residents'),
                    'children_0_14': r.get('children_0_14'), 'level': r.get('level'),
                    'level_check': round(sum(used) / len(used), 2) if used else None,
                    'working': work,
                    'how': 'per_1000 = count / residents (playgrounds: / children 0 to 14) x 1,000; share = per_1000 / '
                           'Calgary per_1000; each share capped at 2.00; the level = the average of the capped shares '
                           'of the kinds in_the_level (neighbourhood amenities). level_check repeats that average.',
                    'calgary_left_out': {k: {x: v.get(x) for x in ('n', 'left_out_no_residents', 'left_out_where',
                                                                 'not_placed', 'not_neighbourhood_parks') if v.get(x)}
                                         for k, v in (g.get('city') or {}).items()},
                    'method': g.get('method')}
        return {**{k: g.get(k) for k in ('city', 'scope', 'level', 'growth_pct_threshold', 'level_threshold', 'counted',
                                         'note', 'method')},
                'left_out_note': 'city[kind].n is Calgary\'s count used for the yardstick: every community where people '
                                 'live. left_out_no_residents (with left_out_where) is what sits in communities with no '
                                 'residents and is left out; not_placed is what the City lists with no location or outside '
                                 'every community; not_neighbourhood_parks is park land that is not a neighbourhood park. '
                                 'Mention these whenever you explain Calgary\'s figure or the yardstick. For one '
                                 'community\'s full working, call this section with community.',
                'level_under_each_resident_count': bm,
                'datasets': {k: f"https://data.calgary.ca/d/{v.get('dataset')}" for k, v in (g.get('kinds') or {}).items()
                             if v.get('dataset')},
                'kinds': {k: v.get('label') + (' (per 1,000 children 0 to 14)' if v.get('per') == 'children' else '')
                          for k, v in (g.get('kinds') or {}).items()},
                'needs_attention': _attention_out(g.get('attention'), ward_of, short=True),
                'communities_counted': len(rows), 'flagged_count': len(g.get('flagged') or []),
                'by_comm': [dict({k: r.get(k) for k in keys}, ward=ward_of.get(r['code'])) for r in pick],
                'shown': 'flagged communities and the 40 lowest of the rest' if many else 'every community'}
    if section in ('wards', 'ward_amenities'):
        ws = d.get('wards_summary') or (wards() if wards else None)
        if not ws:
            return {'error': 'The comparison of every ward is not available right now.'}
        keep = ('ward', 'councillor', 'communities', 'residents', 'census2021', 'growth_pct', 'children_0_14',
                'requests12', 'requests_per_1000', 'requests_change_pct', 'infra_per_1000', 'open', 'open_per_1000',
                'open_over_90_days', 'closed_7_days_pct', 'app_share_pct', 'crimes', 'crime_per_1000', 'crime_change_pct',
                'violent', 'violent_change_pct', 'traffic12', 'traffic_per_1000', 'traffic_change_pct', 'new_homes12',
                'new_homes_prev', 'new_homes_change_pct', 'issued_homes12', 'dev_permits12', 'growth_pct_by_method',
                'amenity_level_all_private', 'amenity_counts_other', 'amenity_counts_private', 'child_care_spaces', 'child_care_per_100_kids', 'daycare_per_100_0_4', 'schools',
                'students', 'facilities', 'playgrounds', 'stops', 'amenity_level', 'amenity_level_by_method',
                'amenity_flagged', 'amenities_vs_city', 'amenity_counts', 'amenity_level_all', 'amenity_level_all_by_method',
                'homes_now', 'homes_census', 'households_2021', 'homes_growth_pct', 'people_per_home')
        detail = ('amenity_counts', 'amenities_vs_city', 'amenity_counts_other', 'amenity_counts_private')
        rows_ = ws.get('wards') or []
        if section == 'ward_amenities':          # each asset, ward by ward (kept out of "wards" so that one fits)
            return {'wards': [{'ward': r['ward'], **{k: r.get(k) for k in detail if r.get(k) is not None}} for r in rows_],
                    'calgary': {'amenity_counts': ws.get('amenity_counts_city'),
                                'amenity_counts_other': ws.get('amenity_counts_other_city'),
                                'amenity_counts_private': ws.get('amenity_counts_private_city')},
                    'kinds': {k: v.get('label') for k, v in (ws.get('amenity_kinds') or {}).items()},
                    'note': 'amenity_counts: how many of each City asset the ward has (every community in it); '
                            'amenities_vs_city: per 1,000 residents (playgrounds per 1,000 children) against Calgary, '
                            '1.00 = the Calgary level; amenity_counts_other: private amenities accessible to the '
                            'community (OpenStreetMap); amenity_counts_private: gated, residents-only ones.'}
        keep = tuple(k for k in keep if k not in detail)
        fields = [k for k in keep if any(r.get(k) is not None for r in rows_)]
        # every ward's place on each measure (1 = the highest of the 14), worked out here so no answer ranks by eye
        ranks = {}
        for k in keep:
            vals = [(r.get(k), r['ward']) for r in rows_ if isinstance(r.get(k), (int, float)) and not isinstance(r.get(k), bool)]
            if k != 'ward' and len(vals) > 1:
                order = sorted(vals, key=lambda x: -x[0])
                ranks[k] = {w: 1 + sum(1 for v2, _ in order if v2 > v) for v, w in order}
        cw = ws.get('city') or {}
        return {'fields': fields, 'wards': [[r.get(k) for k in fields] for r in rows_],
                'calgary': {k: cw.get(k) for k in fields if cw.get(k) is not None},
                'ranks': ranks,
                'rows_note': 'wards: one row per ward, values in the order of fields. Each asset ward by ward '
                             '(amenity_counts, amenities_vs_city, non-City counts): section ward_amenities.',
                'ranks_note': 'ranks[measure][ward] = the ward\'s place of 14, 1 = the highest value (ties share a place). '
                              'Use it for "highest", "lowest", "second" and so on; never rank wards by reading the rows. '
                              'Whether high is good depends on the measure (more 311 reports is not worse service). '
                              'issued_homes12 = homes in building permits issued (the dashboard tile); new_homes12 = homes '
                              'in permits applied for. Ward figures count every community in the ward, business and '
                              'industrial areas too, so they add up to Calgary: use them rather than re-querying a dataset '
                              'and assigning wards yourself.',
                'crime_period': ws.get('crime_period'), 'how': ws.get('note'),
                'note': 'One row per ward and one for Calgary, for the same period as the dashboard. amenity_level: '
                        '1.00 = the city level. playgrounds: City playgrounds in the ward.'}
    out = {k: d.get(k) for k in ('period', 'prev_period', 'period_spec', 'scope', 'ward', 'summary', 'disorder', 'roadwork')}
    # population without the community-by-community build-up (section population_recon has it)
    out['population'] = {k: v for k, v in (d.get('population') or {}).items() if k not in ('recon',)}
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
    out['more'] = ('Call again with section = communities, child_care, schools, development, amenities, amenity_gap, '
                   'needs_attention, population_recon, crime, traffic, rents, profile, property_tax or wards (every ward side by side) for detail.')
    return out


ward5_section = dashboard_section      # the old name, for anything saved before the rename
TOOL_ALIASES = {'get_ward5_dashboard': 'get_dashboard'}   # tool names in older saved conversations and reports
STEP_TEXT.update({old_: STEP_TEXT[new_] for old_, new_ in TOOL_ALIASES.items()})


def scope_note(d):
    """The area selected in the app, put at the top of the instructions for every conversation."""
    sc = (d or {}).get('scope') or {}
    if sc.get('kind') == 'city':
        return ('SELECTED AREA: all of Calgary (the Mayor\'s and Council\'s view). get_dashboard returns figures for '
                'the whole city (every community) and section="wards" compares the 14 wards. Answer for Calgary unless '
                'the question names a ward or community, and say which wards stand out when that helps.\n\n')
    if sc.get('kind') == 'ward' and sc.get('name'):
        who = f" (Councillor {sc['councillor']})" if sc.get('councillor') else ''
        return (f"SELECTED AREA: {sc['name']}{who}. get_dashboard returns {sc['name']}'s figures and communities, "
                f"with Calgary for comparison; section=\"wards\" compares every ward. Answer for {sc['name']} unless the "
                'question names another area.\n\n')
    return ('SELECTED AREA: not known yet (the dashboard has not loaded). Ask get_dashboard, whose scope field says '
            'which area is selected, before answering for an area.\n\n')


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
        self.who = 'Data Genie'                   # how errors name it (the Data Scientist and the auditor set their own)
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
        name = TOOL_ALIASES.get(name, name)
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
        if name == 'get_dashboard':
            d = self.dashboard_provider()
            if not d:
                return {'error': 'The dashboard has not loaded yet.'}
            if (args.get('section') or '') == 'property_tax':
                t = self.tax_provider() if self.tax_provider else None
                return {'property_tax': t, 'how': methods_mod.find('property_tax'),
                        'words': 'municipal = the City\'s share of the bill (the City levy); education = the Province\'s '
                                 'school tax the City collects; total = the whole bill. Say which one every figure is, '
                                 'and never compare or add a municipal figure with a whole-bill figure in one '
                                 'sentence.'} if t else {'error': 'The property tax estimate is not available right now.'}
            if (args.get('section') or '') == 'profile' and args.get('ward'):
                import dashboard as dash_mod
                try:
                    prof = dash_mod.ward_profile(int(args['ward']), self.data_dir, (d or {}).get('census'))
                except Exception as e_:           # noqa: BLE001
                    return {'error': f'The Ward {args["ward"]} profile could not be read ({e_}).'}
                return {'ward_profile_2021_census': prof,
                        'note': 'Ward 5 has the City\'s full printed profile (languages, newcomers, housing costs, '
                                'income); the other wards have the City\'s open Census tables (ages, households, '
                                'families, work). A figure missing here is not published for that ward.'} if prof else \
                    {'error': f'No 2021 Census profile was found for Ward {args["ward"]}.'}
            if (args.get('section') or '') == 'other_amenities':
                def save_(name, cols, rows):
                    res = local_data.save_table(self.downloads_dir, name, cols, rows)
                    self.emit({'type': 'download', 'path': res['saved_to'], 'rows': res['rows'], 'bytes': res['bytes'],
                               'dataset': 'table'})
                    return res
                return _other_amenities_out(
                    d, args.get('ward'), args.get('community'), args.get('kind'), args.get('gated'),
                    save_ if args.get('save_csv') else None,
                    (lambda pts: self.emit({'type': 'map', 'title': 'Private amenities accessible to the community '
                                                                    '(OpenStreetMap)', 'points': pts}))
                    if args.get('show_on_map') else None)
            return dashboard_section(d, args.get('section') or 'overview', self.wards_provider,
                                     {'community': args.get('community'), 'ward': args.get('ward'), 'find': args.get('find')})
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
        if name == 'get_code':
            return codebook.get(args.get('topic'), args.get('name'), args.get('file'), args.get('text'))
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
                    'built': f"City of Calgary data as of {str(d.get('built_at', ''))[:10]}" if d.get('built_at') else '',
                    'area': 'Calgary' if (d.get('scope') or {}).get('kind') == 'city' else (d.get('scope') or {}).get('name'),
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
                     'interactive': res['interactive'], 'xlsx': res['xlsx'], 'print': res.get('print'), 'made': _calgary_now().strftime('%Y-%m-%d %H:%M'),
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
        elif name in ('get_dashboard', 'get_ward5_dashboard'):
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
        area = (d.get('scope') or {}).get('name') or 'the selected area'
        if src.get('layer') in ('area_traffic', 'ward5_traffic'):
            pts = [{'lat': p['lat'], 'lon': p['lon'], 'label': f"{p.get('date', '')}: {p.get('where', '')}"}
                   for p in d.get('traffic_points') or []]
            return pts, f"Traffic incidents in {area} in the last 90 days of {d.get('period', 'the period')}"
        ds = src.get('dataset_id')
        lat, lon = src.get('lat_field') or 'latitude', src.get('lon_field') or 'longitude'
        if not ds:
            raise ValueError('source needs dataset_id or layer')
        fields = [lat, lon] + ([src['label_field']] if src.get('label_field') else [])
        where = ' AND '.join(x for x in (src.get('where'), f'{lat} IS NOT NULL') if x)
        limit = max(1, min(int(src.get('limit') or 5000), 5000))
        rows = cd.query(ds, select=','.join(fields), where=where, limit=limit)
        ward = (d.get('geo') or {}).get('ward') if (d.get('scope') or {}).get('kind') != 'city' else None
        inside = src.get('inside_area') or src.get('inside_ward5')
        pts = []
        for r in rows:
            try:
                y, x = float(r[lat]), float(r[lon])
            except (KeyError, TypeError, ValueError):
                continue
            if inside and ward and not cd.point_in_multipolygon(x, y, ward):
                continue
            pts.append({'lat': round(y, 5), 'lon': round(x, 5), 'label': str(r.get(src.get('label_field') or '', ''))[:120]})
        return pts, f'{len(rows)} rows fetched from {ds}' + (f', kept those inside {area}' if inside and ward else '')

    # ----- one question -----------------------------------------------------------------------------------------
    def ask(self, question, model_choice='fast', today=''):
        chain = engines.ready(self.get_settings(), os.environ.get('ANTHROPIC_API_KEY', ''))
        if not chain:
            raise AgentError('Add an AI service key (Anthropic, Google Gemini or OpenAI) in Settings first.')
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
                skipped.append({'service': engines.label(e), 'model': e[tier], 'why': str(err), 'kind': err.kind})
                pos += 1
                if pos >= len(chain):
                    # what the user reads: Data Genie, never the AI company or model; the detail goes to the log
                    print('Data Genie: ' + '; '.join(f"{x['service']} ({x['model']}): {x['why']}" for x in skipped))
                    kinds_ = {x['kind'] for x in skipped}
                    who = getattr(self, 'who', 'Data Genie')
                    if kinds_ <= {'key'}:
                        msg = f'{who} could not answer: the AI key was not accepted. Check it in Settings.'
                    elif kinds_ <= {'credit', 'daily'}:
                        msg = f'{who} could not answer: the AI key has run out of credit or reached its daily limit.'
                    elif kinds_ <= {'network'}:
                        msg = (f'{who} could not reach the AI service. On a phone this happens when the screen turns off or '
                               'you switch apps while it is working: keep this page open and on screen until it finishes '
                               '(a report takes a few minutes), then try again.')
                    elif kinds_ <= {'rate', 'busy', 'network'}:
                        msg = f'{who} could not answer just now: the AI service is busy. Try again in a minute.'
                    else:
                        msg = f'{who} could not answer this. Try again, or start a New chat if it keeps happening.'
                    raise AgentError(msg) from None
                self.emit({'type': 'step', 'text': f"The AI service was not available ({engines.WORDS.get(err.kind, err.kind)}). "
                                                   'Carrying on with the backup service'})

    def _loop(self, chain, tier, today):
        dash = self.dashboard_provider()
        system = census_mod.relabel((self.system_text or SYSTEM).format(today=today),
                                    int(((dash or {}).get('census') or {}).get('year') or 2021))
        system = scope_note(dash) + system
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
                    cap = 30000 if name in ('get_dashboard', 'get_ward5_dashboard') else MAX_RESULT_CHARS
                    if len(out) > cap:
                        out = json.dumps(_fit(result, cap), default=str)
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
        hist = self.history if len(starts) <= keep_turns else self.history[starts[-keep_turns]:]
        # thinking from earlier questions is not needed again, and once old questions are dropped the service refuses it
        # (it is bound to the conversation it was written in), so only the current question's thinking is sent
        cur = max([i for i, m in enumerate(hist) if m['role'] == 'user' and isinstance(m['content'], str)] or [0])
        out = []
        for i, m in enumerate(hist):
            if i < cur and m['role'] == 'assistant' and isinstance(m['content'], list) and any(
                    b.get('type') in ('thinking', 'redacted_thinking') for b in m['content']):
                kept = [b for b in m['content'] if b.get('type') not in ('thinking', 'redacted_thinking')]
                m = {**m, 'content': kept or [{'type': 'text', 'text': '(thought)'}]}
            out.append(m)
        return out
