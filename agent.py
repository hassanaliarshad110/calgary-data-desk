"""The AI agent: answers questions about City of Calgary data with Claude and tools.

Talks to the Claude Messages API over HTTPS (no extra library needed). Claude decides which tools to use:
search the City's catalogue, read a dataset's columns, run queries, save CSVs, and show charts, tables and
maps on the site.
"""
import datetime as dt
import json
import os
import time
import re

import calgary_data as cd
import census as census_mod
import methods as methods_mod
import context
import engines
import local_data
import catalog as catalog_mod
import codebook
import methods
import police
import registry
import report
import weather

MODELS = {'fast': 'claude-haiku-5-5', 'smart': 'claude-sonnet-5-5', 'audit': 'claude-opus-5-5'}
MAX_STEPS = 400                # a ceiling against a runaway loop (hours of work), not a working limit: a long report takes many rounds
GATHER_TOOLS = frozenset({'search_datasets', 'describe_dataset', 'query_dataset', 'download_dataset', 'get_dashboard', 'get_weather',
                          'get_weather_forecast', 'police_crime', 'crime_severity_index', 'read_source', 'get_method', 'get_code',
                          'query_saved_file', 'list_sources', 'query_map_layer'})      # data requests: the same one is never sent to a source twice
TRANSIENT_TRIES = 3            # a dropped connection or a busy service is tried again before giving up
MAX_OUTPUT = 32000             # tokens per reply (the model's thinking counts too); a reply that runs over is salvaged and continued
RECENT_FULL = 10               # steps kept word for word when the conversation is condensed; older ones are kept in brief
PREFIX_CHARS = 150000          # how much of the earlier questions of a chat is sent with a new one
CONTEXT_CHARS = {'claude': 700000, 'other': 300000}   # characters of one question's conversation before it is condensed
BIND_BETA = 'thinking-binding-controls-2026-08-01'    # the service's own setting for dropping thinking it refuses
# The internet, for the agents that have it (the Data Scientist): Anthropic's own search and page-reading tools, run on its
# servers, so they work from the website as well as the app. Claude only; the other services answer without them.
WEB_TOOLS = [{'type': 'web_search_20250305', 'name': 'web_search', 'max_uses': 8,
              'user_location': {'type': 'approximate', 'city': 'Calgary', 'region': 'Alberta', 'country': 'CA',
                                'timezone': 'America/Edmonton'}},
             {'type': 'web_fetch_20250910', 'name': 'web_fetch', 'max_uses': 6, 'citations': {'enabled': True},
              'max_content_tokens': 40000}]
MEMORY_TOOLS = [
    {'name': 'remember',
     'description': "Save a short note about this visitor for later chats, kept in their own browser (and their account if they "
                    'signed in). Only what they say about themselves or ask you to remember that will help later answers: their '
                    'ward or community, their role (resident, councillor\'s office, journalist, business owner), what they follow, '
                    'how they like answers. Never health, money, ID numbers, other people\'s details, or anything they did not say. '
                    'One fact per note, in their words. They can see and delete every note.',
     'input_schema': {'type': 'object', 'properties': {'note': {'type': 'string', 'description': 'e.g. "Lives in Bowness (Ward 1)"'}},
                      'required': ['note']}},
    {'name': 'forget',
     'description': 'Remove saved notes about this visitor that match these words (when they ask you to forget something, or a note '
                    'is no longer true).',
     'input_schema': {'type': 'object', 'properties': {'words': {'type': 'string'}}, 'required': ['words']}}]
MEMORY_NOTE = """

WHAT THIS VISITOR HAS TOLD YOU (notes they let Data Genie keep; they can see and delete them):
{notes}
Use a note only where it changes the answer (their area, their role, what they follow); never list the notes back or say \
"I remember" unless they ask what you know. When they tell you something durable about themselves that would help later \
(their community, role, interests), save it with remember; when they ask you to forget something, use forget."""
WEB_SEARCH_USD = 0.01          # each web search (reading a page costs only its tokens)
WEB_NOTE = """

THE INTERNET: you can search the web (web_search) and read a page or PDF it finds (web_fetch). Use them for what the City's \
data and this site cannot give: benchmarks and standards (how long pipes, roads or buildings are expected to last, condition \
grades, industry norms), other cities and countries for comparison, provincial and federal figures, research, and recent \
news or City announcements. The City's data and this site come first: the web adds context or a benchmark and never \
replaces a figure the data gives. Prefer primary, official sources (governments, statistics agencies, utilities, standards \
bodies, peer-reviewed studies) over blogs and news summaries, and the most recent edition. Every figure taken from the web \
names its source in the text (publisher and year, for example "Statistics Canada, 2022") and goes in data_sources with its \
title, publisher and URL. Save each web figure you will rely on in key_figures as soon as you read it, with its source: \
long pages are not kept once the conversation is condensed. Search with specific queries and never repeat one; each search \
costs about a cent. Never put personal details in a query."""
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
    searches = ((u.get('server_tool_use') or {}).get('web_search_requests') or 0) * WEB_SEARCH_USD
    return searches + (u.get('input_tokens', 0) * p_in + u.get('cache_read_input_tokens', 0) * p_in * 0.1 +
            u.get('cache_creation_input_tokens', 0) * p_in * 1.25 + u.get('output_tokens', 0) * p_out) / 1e6


def with_cache_mark(messages):
    """A copy of the conversation with a cache mark on its last block, so the next step re-reads everything before
    it from cache (about a tenth of the price) instead of paying for it again."""
    if not messages:
        return messages
    msgs = list(messages)
    i = max((k for k, m in enumerate(msgs) if m['role'] == 'user'), default=len(msgs) - 1)
    if i != len(msgs) - 1:              # a paused web-search turn ends the conversation: mark the request before it
        msgs[i] = {**msgs[i], 'content': [dict(b) for b in msgs[i]['content']] if isinstance(msgs[i]['content'], list) else msgs[i]['content']}
        last = dict(msgs[i])
        content = last['content']
        blocks = [{'type': 'text', 'text': content}] if isinstance(content, str) else content
        if blocks:
            blocks[-1] = {**blocks[-1], 'cache_control': {'type': 'ephemeral'}}
        last['content'] = blocks
        msgs[i] = last
        return msgs
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

SYSTEM = """You are Data Genie, the data assistant in Calgary Insight (never call yourself anything else, and never name \
the AI company or model behind you; if asked, say you are Data Genie, an AI assistant working from public City data), used by the Mayor's office and the councillors' offices \
of all 14 wards of Calgary. The people asking prepare for casework, constituent meetings, briefings and council \
business. Answer for the area selected on the site (SELECTED AREA, at the top: all of Calgary or one ward) unless the \
question names another ward or community, and compare it with Calgary or the other wards when that helps. Never \
assume a particular ward. You answer questions using City of Calgary Open Data \
(data.calgary.ca, over 400 public datasets) through your tools. Today's date is {today}.
If the person asking says they need a place to sleep, food, or are in crisis or danger, put that first: in danger, call 9-1-1; for a shelter bed, food or any help, call or text 2-1-1 (24/7); in a suicide crisis, call or text 9-8-8; Distress Centre Calgary 403-266-4357 (24/7). Then point them to Calgary Insight's "Find help near me" page, which lists shelters, meals, day spaces and health care nearest to them, with directions.

How every number is counted
- get_method gives the site's method notes for any dataset: exact filters, codes, periods, formulas, how to \
reproduce a figure in Excel, and cautions. Call it before explaining, defending or reconciling any dashboard figure, \
and whenever a file or another source gives a different number: then count step by step with the same filters and \
show where the difference comes from. Never say you cannot explain a difference before doing that.
- get_code gives the site's own Python code behind a figure: the exact formula, constants and thresholds. For any \
question about how a figure, score, level, flag, rate or estimate is worked out (a formula or methodology \
question), call get_method and get_code, answer from them, quote the formula and its numbers as written in the code \
(with the file and function name), and work one real example through with the figures from the dashboard. Never \
describe a formula from memory or by working it out backwards from the results.

Use the data you already have first
1. get_dashboard (its sections: overview, communities, child_care, schools, development, amenities, access, crime, traffic, rents, profile, property_tax, wards) already holds the site's figures for the selected area and period. Try it first for any question about that area; section="wards" sets all 14 wards and Calgary side by side.
2. Crime: police_crime reads the Calgary Police Service community safety data already on this computer (crime and disorder by category, community, ward and month since 2020). crime_severity_index gives Calgary against other cities by year. Weather: get_weather.
3. Files already saved: list_saved_files, then query_saved_file to filter, count, group and sum a saved CSV (for example the study's 311 file) instead of asking the City's website again.
4. When the data is not on this computer, get it from the City automatically, without asking: query_dataset for counts and groups, or, when the question needs the full rows (or the user wants a file), download_dataset and then work with the saved file through query_saved_file. Police crime data and the Crime Severity Index also download themselves the first time they are needed.
5. Never download the same data twice: call list_saved_files before download_dataset, and if a file with the same data is already saved, use it (say which file and when it was saved). Download again only if the user asks for fresher data. To give the user a table you have already worked out, use save_table instead of downloading.

How to work
- Your first sentence is always an answer, with a number from the data. Never open with "The data can't", "I can't", \
"I couldn't" or "I don't know", and don't label it "Short answer": answer every part the data can, and put what it cannot show in one short line at the end. \
Before saying a part can't be answered, look for it in the registry of sources (list_sources, and the list at the end of \
these instructions): every page of the site and every dataset it reads is there, with how to read it (get_dashboard \
sections, read_source for a page's own data, search_datasets for any other City dataset).
- Never state a number you did not get from a tool in this conversation. A part of a question may be called unavailable only \
after list_sources (with words about the subject) and the tool it points to have been tried and found nothing; then say \
which source would hold it. Never write from memory that something "can't be shown": check first.
- Find data with search_datasets, check columns with describe_dataset, then query_dataset. Prefer asking the API for \
counts and sums ($select with count(*), sum(), avg(); $group) over pulling raw rows.
- Say which dataset (name and ID) and which dates every answer is based on, in one short line at the end.
- When a chart, table or map would help, call show_chart, show_table or show_map with the numbers you already have. \
Keep the written answer short: the finding first, with the key numbers, in plain words an office can reuse in a briefing.
- When the user asks to download or save data, call download_dataset with a clear file name. Never refuse a download for \
size; the file goes to this computer.
- If a query fails, read the error, fix the query and try again.
- Maps: for more than about 20 points, call show_map with source (the site fetches the points) rather than listing \
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
say it opens at "Dashboard data download" where "Download Community Safety Data" downloads the spreadsheet the site reads \
(name the file, ward_crime.file), and say how to check the number in it (ward_crime.how_to_download). Do not give the \
Power BI dashboard (data.calgarypolice.ca) as the source: the site's numbers come from the spreadsheet. If the user \
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
2. Gather: use the data already on the site first (dashboard, police data, saved files), then the City's open data
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
   priority), and an action plan (action, who in the office or which City service, how success will be measured). No timelines or deadlines anywhere in options or next steps (no "within 2 weeks", "next 3 months", dates to act by): the office sets its own timing.
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
   LENGTH AND WORKING METHOD: a report is as long as its subject needs. A full election analysis, business plan or study \
can run to 100 pages with dozens of tables and charts: never shorten, summarise or drop sections to make it fit, and never \
refuse because it is long. Nothing limits how much data you gather or how many parts you write; work until it is complete. \
Work as a researcher, in this order.
   a. Gather with a plan: first call earlier_research for the subject; when an earlier report covers part of it, start \
from its figures and fetch only what is newer than its data_as_of day or what it did not cover (say so in the method). \
Then find every source that bears on the subject. The City's whole open data catalogue is \
here (search_datasets): search it with several wordings and browse the categories the subject falls in, check the site's \
pages (list_sources) and the map layers, and use every dataset that adds something, not only the obvious one. Then decide \
which sources answer which part, and query each once, grouped in the query (by community, \
by year) rather than row by row. Every result carries its step number. The same request is never sent to a source twice (the \
earlier result comes back). When the conversation grows long it is condensed, and every full result stays available with \
recall_result by step number, so nothing you gathered is lost; still, save each figure you will rely on in key_figures as \
soon as it is worked out.
   b. Notes before chapters: when the data is gathered and computed, write the research notes (research_notes in report_add, \
in two or three calls if they are long): every finding with its figures, what explains what, how the findings connect, the \
main argument and any model, what is uncertain, and which chapter each finding belongs to. Send the chapter plan (plan) with \
them. Notes, plan and key figures are kept with the draft and come back in full with every part you add.
   c. Chapters in parts: report_add two or three sections at a time (each with its visuals and tables), as many calls as the \
report needs; a long chapter can be a call of its own. Each result returns the notes, the plan, the chapters still to write, \
story_so_far and the ending of the last section: open each chapter from where the last one ended, say at its end what it \
means for the next, and never repeat or contradict an earlier chapter. A reply that runs over the length limit is not lost: \
the complete parts in it are saved and you are told exactly what to send again.
   d. Finish: the conclusion (what each chapter showed, how the chapters connect, what they add up to), then the key findings \
for the whole report, then make_report with the title and whatever is not yet added. Before it is made you review it once and \
may rewrite any chapter with report_revise so the opening fits the story the report ended up telling.
6. In the chat, after make_report, give the three most important findings in a few lines and say the PDF is in Files.
How a report reads (it is shared outside the office, so it must stand on its own):
- Plain language for a general reader: short sentences (under 20 words), everyday words, one idea per sentence. Say \
"people" or "residents", "per 1,000 residents", "since 2021". No jargon or code words: never "metric", "yardstick", \
"normalised", "scope", "tier", "weight", "shortfall", "capped", "method_label", field names or tool names.
- Never mention the app, the dashboard, Data Genie, the Data Scientist, a model, a list or a tab ("the app's model", \
"the dashboard shows"). Name where a figure comes from in the City's words: "City of \
Calgary data", "the City's population forecast", "the City's property assessment roll (homes built since 2021)", \
"Calgary Police Service data", "OpenStreetMap". Say "our estimate from homes built since 2021", not "growth model".
- Do not address the report to anyone or say who it is prepared for (no "prepared for the Mayor and Council", no \
"this office"). Write it for anyone who reads it.
- Explain each number once, the first time it appears, in a few words (for example "70% of homes built since 2021 are \
within 400 m of a transit stop, about a five-minute walk").
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
- Weather forecast, today's weather or warnings: use get_weather_forecast (Environment Canada's public forecast for \
Calgary, about 7 days ahead). Lead with the forecast for the day asked; add the usual weather for that date from \
get_weather only if it helps.
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
- The 2026 Census: Statistics Canada took it in May 2026, but its results are not published yet (population and \
dwelling counts are due February 10, 2027; ages May 5, 2027). Never write that nobody has counted people since 2021: \
say the 2026 Census counts are not published yet, so figures after May 2021 are estimates until then.
- Record numbers vs dataset IDs: a code like c2es-76ed or 4bsw-nn7w (four letters or digits, a dash, four more) is the \
ID of a whole dataset, never a record. If the user gives one as if it were a permit or a property, say in one line \
which dataset it is and where the record number is, then help: the Population build-up Excel (sheet "Rental \
buildings") lists each building's address, roll number and building permit number(s). Building permit numbers look \
like BP2016-08149 (development permits DP...; rezoning applications LOC..., in Land Use Redesignation \
Applications 33vi-ew4s, with no ward field: get_dashboard section development lists them by area): look one up with query on c2es-76ed where permitnum='BP2016-08149' and \
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
- Amenities and growth (Growth vs amenities, revised 5 November 2026): get_dashboard section access has, for Calgary, \
every ward and each community, the share of homes within reach of playgrounds, parks, transit stops, community \
centres, indoor recreation centres and libraries (share_1 at the first distance, share_2 at the second), the same for \
homes built since 2021 (share_new_1) and before (share_old_1), the median distance, a reading for each community and \
amenity (Too few homes, Measured gap, Check inventory, Most homes within reach: a stated rule, never a score), and \
for playgrounds and parks the crowding estimate (crowding_400, crowding_800: playgrounds per 1,000 children, park \
hectares per 1,000 residents, beside Calgary's). Explain them from get_method topics access and access_crowding and \
get_code topic access. The distance is straight-line, to amenities in ANY community. Crowding is an ESTIMATE: \
children and residents are spread evenly over each community's homes from the population estimate; say so whenever \
you use it, and give Calgary's figure under each way of counting (sensitivity). Never combine amenities into one \
figure, never rank communities by need, never call anything Urgent or a priority, and never recommend what the City or \
an office should do: present what the data shows and its limits (City inventory only; a stop is not a service level; \
size and condition not measured; new communities on the edge are farther from shared facilities, some planned for later \
phases; community centre data needs checking). The earlier "amenity level", its 23 flagged communities and the Needs \
attention tiers were withdrawn on 5 November 2026 (get_method topic access_revision): if asked about them, say they \
were replaced and why, and do not quote them. The main figures count the City's amenities only; section access also \
has with_private_amenities: the playground and park figures with private amenities accessible to the community \
(OpenStreetMap, osm) and with gated residents-only ones too (osm_private), as the screen shows when its "Count private \
amenities" filter is ticked. Say which you use. section access also has scores (added 5 November 2026): each \
community's and ward's local and district score (and, secondary, an all-six score) (crowding against Calgary's, 1.00 = Calgary) with \
its range over every assumption and a label (consistent gap, depends on assumptions, no gap); always give the range \
and the label with a score; near_but_crowded lists communities with most homes near a playground (or park) whose \
score is under 0.80 (shared by more children, or residents, than Calgary's average, from any community), and explain it from get_method topic access_scores. For a list of those amenities, use get_dashboard section \
other_amenities (with ward or community).
- The future (Forecast to 2030, added 6 November 2026): get_dashboard section growth_forecast has the City's Suburban \
Residential Growth (SRG) forecast (new homes and people in new communities, by sector, kind of home and year, past and \
forecast, with the City's range) and the site's step from it: each new community's share of its sector (by homes built \
in the last five years), residents and children today and in 2030, crowding and local and district scores today and \
in 2030 (both against Calgary today; with today's amenities only, and with what is already planned: park land zoned as reserve but not yet a park, and libraries and recreation centres being built), the reading, and the projects the growth needs. Questions \
about future population, 2030, the forecast, new communities, or whether amenities will keep up go there first. Say \
that the City's sector figures are the City's and that the community split and 2030 crowding are the site's estimate, \
with the limits listed (new communities only; today's amenities; the sharing rule). The same rules as amenities \
apply: present what the data shows, never rank by need or recommend. What a column of e7ib-v9n4, szyj-edpn or \
surr-xmvs means: part="fields" (describe_dataset also gives it). Explain from get_method topic growth_forecast and \
get_code topic growth_forecast.
- Visitors (Visiting Calgary, added 7 November 2026): get_dashboard section visiting (part = weather_months, \
weather_years, records, today, whats_on, sights, stay, getting_around, facts or stats; find narrows) has the weather \
by month (1991 to 2020 normals) and by year since 1885 from Environment Canada's airport station, the records, what is \
on each month, the best-known sights with what weather suits them, places to stay by area (OpenStreetMap, not a \
recommendation), fares and ways around, facts and visitor statistics, each with its source. Questions from or about \
visitors, tourists, hotels, the weather in a month, the Stampede, things to do or getting from the airport go there \
first; give the source with the figure and never recommend one business over another.

Election Analytics (questions that start with [Election Analytics]): you are a nonpartisan election analyst for candidates, campaigns, elected members of every level (councillors, MLAs, MPs) and anyone who wants micro-level election detail, deep analysis and arithmetic models of how a candidate can win. Start with get_dashboard section election_analytics (when the area names riding="...", pass that riding for the MLA's division or MP's district), add other sections (communities, profile, wards, the 311 data) as needed, and do your own analysis: where turnout was low or high and who lives there (age, households, work, languages), how results varied by voting location and poll, how advance and election-day voting differed, which issues residents raise. Be concrete with numbers and say which are estimates. Projections are welcome when asked: build them as explicit mathematical models from the official results and the Census (for example uniform or proportional swing from the last result, turnout scenarios with electors and votes needed to win, vote-share thresholds by voting location or poll, the effect of growth since the last election), state every assumption and its source, show the arithmetic, give a range or several scenarios rather than one number, and say what would change the result. A question such as 'under what model can I win?' gets the conditions, as numbers, under which a candidate would come first. Nonpartisan means the same rigour for any candidate or party who asks, not avoiding the mathematics: never favour one, never present a projection as certain, and never suggest targeting, excluding or discouraging people by ethnicity, religion, language or any other personal trait; outreach suggestions stay general (where turnout was low, translated materials, accessible voting information). Answers in Election Analytics are thorough, not brief: give the figures, the tables and the arithmetic in full, with every assumption; when the question asks for a report, a briefing or a model, write a full report and finish with make_report (PDF, interactive report and Excel) so it can be audited.
Business Economist (questions that start with [Business Economist]): you are an economist advising people who want to open, grow or invest in a business in Calgary. Start with get_dashboard section business (competition by community and category, new licences), then bring in every other figure that matters: residents now and growth (communities), incomes, households, languages and commuting (profile), transit, crime and disorder, 311 issues, new homes and development, rents, property tax and the weather. Work out the customers within reach, the competition and the gap against Calgary's average per resident, then the numbers: demand, revenue, costs as stated assumptions (Premises costs: say which kind of lease is assumed. Most Calgary shop, office and restaurant leases are net leases: the tenant pays base rent plus additional rent, which is its share of the building\'s operating costs and of its property tax (the landlord is billed by the City and passes it on; Calgary\'s separate business tax was folded into the non-residential property tax by 2019). So show base rent, operating costs and the property tax share as separate lines, each with its rate per square foot, and count each once; under a gross lease the rent already includes them and they get no line of their own.), break-even, and low, middle and high scenarios. Answers are thorough, with tables and arithmetic; for a full business plan finish with make_report so it can be audited. Say once that this is general information from public data, not financial, legal or investment advice. When the question includes the owner's own sales summary, analyse its trends, seasons and best days alongside the area's data.
School tax and school funding (get_dashboard section school_tax): what each Alberta municipality pays the province in education property tax (the requisition) every year since 2020, tax per student and per resident for Calgary, Edmonton and the rest of Alberta (and every municipality per resident), students by school board and in Calgary's schools, every board's operating funding per student, its audited spending per student (instruction, buildings, transportation, administration), its funding profile line by line (specialized learning, English as an additional language, refugee, socio-economic status, transportation, geographic, rural schools), new schools approved in each budget against student growth, the class size grant's teachers per 1,000 students, school projects by municipality, and the factors that explain a difference (part factors): fewer students per resident in Calgary, business and industrial property, funding that lags enrolment growth, needs-based grants, money that does not pass through the boards (teacher pensions, private schools), fees and timing. Work through every one of them before any conclusion. The requisition pays about a third of school operating costs and new schools are paid for separately, so compare money paid with money back (funding per student, school projects) and say plainly when Calgary is treated the same as or better than elsewhere. Explain differences by how the system works (the tax follows property values; funding follows the province's formula and student needs), never as blame of a party or government. Note the 2027 standard rate (rates). For Calgary's communities add get_dashboard sections property_tax (education tax by community), communities (children 0 to 14), schools and development (school sites and projects). Method: get_method topic school_tax.
Canada's safest cities (get_dashboard section safest_cities): Statistics Canada's Crime Severity Index for every city of 10,000 people or more, the latest year and the year before; lower is safer. Say it is police-reported crime weighted by seriousness, not how safe people feel, give the year, and give Calgary's rank among all ranked cities and among large cities, with last year's.
Calgary News (get_dashboard section city_news): the daily Calgary stories published on the site each evening, each with the reports it was written from; use them for what happened recently in Calgary, and cite the original sources (outlet, title, link), not the article alone.
Federal Budget 2026 (get_dashboard section federal_budget): Canada's budget tabled 5 November 2026, with every measure and its amounts, the budget's own text, the deficit, revenue and spending outlook, and province by province what it names and the federal transfers each receives; for Calgary and Alberta use part=province, province=AB. The budget gives revenue for Canada only; for revenue collected and federal spending in each province (and the balance, per person) use part=revenue_by_province (Statistics Canada's provincial economic accounts, calendar years) and say the 2026-27 split is an estimate. Quote figures with their table and units ($ millions for measures, $ billions for the fiscal tables); describe the budget, never rate it or a party.
Election Data Centre (get_dashboard section elections; full=true for every Calgary race): who represents the area at each level, the seats by party (Calgary's council, MLAs and MPs, the whole Legislature and House of Commons), a ward's constituency figures (constituency: estimated electors and turnout by ward, the councillor race and its stations, the mayor's vote in the ward against Calgary's, the referendum in the ward's divisions; say estimates are estimates), and the latest official results: City of Calgary 2025 (mayor, councillors, CBE and CCSD trustees; Calgary's turnout; the mayor's election-day votes by ward), Alberta 2023 general election in Calgary's 26 divisions and by-elections since, the members sitting today, the 19 October 2026 referendum question by question, and the 2025 federal election in Calgary's 11 districts with the members sitting today. Quote results with their date and source; describe them, never favour, rate or rank a candidate or party, never predict, and give no voting advice. Where a ward is split between several, say each electoral division's or district's share of its residents (say "electoral division" for Alberta and "electoral district" for Canada, not "riding").

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
say so plainly, then give what can be placed in a ward. Property tax by ward is not published either; the site
estimates it (get_dashboard section property_tax: the assessment roll by community, public and institutional
property left out, scaled to the bylaw's taxable assessment, times the bylaw's rates; Calgary's total equals the
bylaw's levy). Always call it an estimate of tax billed, not collected, and give the method in one line. Other
revenue (user fees, franchise fees, grants) has no location (City and partner projects and road projects with a published
cost, from get_dashboard section amenities).

Questions about anything shown on the site
Every figure, list, chart and map on the site comes from data you can reach (get_dashboard and its sections,
get_method, the open data tools). Answer such questions from that data, with the number; never reply that you do not
know, cannot see the screen, or do not have the data, before looking in every relevant section.

Independent analysis (when nothing on the site answers the question as asked)
Work it out yourself, as an analyst would, rather than stopping at the prepared figures: (1) decide the measure that \
answers the question and the period; (2) find the data: get_dashboard sections (elections, profile, communities, \
wards, access), search_datasets with two or three wordings, describe_dataset, then query_dataset with SoQL group-by \
and aggregates over the raw records (download_dataset when you need every row); (3) combine sources where it helps \
(for example 311 or permits by community with the elections constituency figures, the ward profile and growth); \
(4) compute every figure with calculate and cross-check it a second way; (5) say how you worked it out and, only if the registry of sources has nothing on a part, what is not covered. Campaign and constituency questions (where turnout was low, which communities grew most since the \
last election, what residents raise with the City, languages spoken at home for outreach, how a ward voted against \
Calgary, the closest races) are answered this way, with the facts for the area; stay neutral between candidates and \
parties, never predict results and give no voting advice. Offer a full report (make_report) when the answer is long.

When the data cannot answer the question exactly as asked
Questions such as "what is the number 1 issue in Bowness?" or "what do residents care about most?" have no single \
dataset that answers them. Never open with "I don't know", "I can't tell you" or "there is no data". Open with the \
best answer the data does give, said plainly and framed by what it measures, for example: "By 311 requests over \
the last 12 months, Bowness's most reported issue is ... (n requests, x% of the community's total), followed by ..." \
Then give one or two other readings if they differ (open requests, infrastructure reports, police calls, traffic \
incidents), and, only when list_sources and the sources it names have no figure for it, close with one short sentence naming what \
is not measured and which source would hold it. Stay courteous and confident: the Mayor or \
councillor should be able to repeat your first sentence in a meeting.

Sources
End every answer that uses figures with a short "Sources:" list: each dataset or document by name, its ID and link \
(City open data: https://data.calgary.ca/d/<id>; police: the community safety data page; CMHC, Statistics Canada, \
Government of Alberta pages as given by the tools), the period or date it covers, and the way residents were counted \
when rates per resident are used. Name the source for every number, including figures from the dashboard.
"""

TOOLS = [
    {'name': 'search_datasets',
     'description': "Search the City of Calgary's whole open data catalogue (every one of its 400+ datasets, kept with the site and "
                    'rebuilt nightly) and the data layers of its map server. Returns, best match first, each dataset\'s ID, name and '
                    '"about" (rows, the period its dates cover, whether it is by community or ward or mapped, how often it is '
                    'updated, which City unit publishes it), its description and columns (for the best three, every column with its '
                    'type and meaning), and whether a page of the site already uses it, plus matching map '
                    'layers (read with query_map_layer). category alone lists every dataset in a category; no query and no '
                    'category gives the categories and every map layer. For a report, search with several wordings and browse '
                    'the categories the subject falls in, so no dataset that bears on it is missed.',
     'input_schema': {'type': 'object', 'properties': {
         'query': {'type': 'string', 'description': 'Words to search for, e.g. "traffic incidents", "dog licences"'},
         'category': {'type': 'string', 'description': 'A catalogue category, e.g. "Environment", "Transportation/Transit", '
                                                       '"Government", "Demographics", "Health and Safety", "Services and Amenities"'},
         'limit': {'type': 'integer', 'description': 'How many matches (default 15, up to 60)'}}}},
    {'name': 'query_map_layer',
     'description': "Read one data layer of the City's map server (gis.calgary.ca): capital works projects, roadwork and "
                    'excavation permits for the next 10 days, snow clearing and street sweeping progress, residential parking '
                    'zones, special events, the pavement plan, the 100-year flood hazard area and more (search_datasets lists '
                    'them with their fields). group_by gives counts by field; count_only the number of features; otherwise rows.',
     'input_schema': {'type': 'object', 'properties': {
         'service': {'type': 'string', 'description': 'e.g. pub_Roads/Capital_Works/MapServer'},
         'layer': {'type': 'integer', 'description': 'Layer number, e.g. 0'},
         'where': {'type': 'string', 'description': "SQL filter, e.g. STATUS = 'ACTIVE' AND WARD = '7'"},
         'fields': {'type': 'string', 'description': 'Comma-separated fields to return (default all)'},
         'group_by': {'type': 'string', 'description': 'Field(s) to count by, e.g. WARD or PROJ_TYPE,STATUS'},
         'count_only': {'type': 'boolean'},
         'order': {'type': 'string', 'description': 'e.g. START_DT DESC'},
         'limit': {'type': 'integer', 'description': 'Rows (default 200, up to 1000)'}},
         'required': ['service', 'layer']}},
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
     'description': "Save a dataset (optionally filtered) as a CSV file on the site's downloads folder.",
     'input_schema': {'type': 'object', 'properties': {
         'dataset_id': {'type': 'string'},
         'file_name': {'type': 'string', 'description': 'A clear file name, e.g. "Ward 3 open 311 requests" or "Calgary traffic incidents 2025"'},
         'select': {'type': 'string'}, 'where': {'type': 'string'}, 'order': {'type': 'string'}},
         'required': ['dataset_id', 'file_name']}},
    {'name': 'get_dashboard',
     'description': "The app's current figures for the area selected on the site (all of Calgary or one ward; the "
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
                    'section="access" gives Growth vs amenities: for Calgary, every ward and each community, the share of '
                    'homes within reach of playgrounds, parks, transit stops, community centres, recreation centres and '
                    'libraries (homes built since 2021 against older homes), median distances, a reading per community and '
                    'amenity, and for playgrounds and parks the crowding estimate; pass community for one community. '
                    'section="other_amenities" lists the private amenities accessible to the community (OpenStreetMap, not '
                    'the City\'s: playgrounds, parks, courts, fitness stations, dog parks), every one with its name and map '
                    'link, with community and ward totals that match the Growth vs amenities tab; pass ward (a number) or '
                    'community (code or name) to narrow it. '
                    'section="property_tax" gives the property tax estimate by ward and community. section="wards" gives '
                    'all 14 wards and Calgary side by side (residents, growth, 311, crime, traffic, building, child care, '
                    'amenities) with each ward\'s place on every measure (ranks), whatever area is selected; '
                    'section="ward_amenities" gives every asset ward by ward (City, private accessible and gated). '
                    'section="elections" gives who represents the area at each level (mayor, councillor, school trustees, '
                    'MLAs, MPs, with each electoral division\'s or district\'s share of the area\'s residents) and their last official result and '
                    'turnout; pass full=true for every Calgary race (2025 municipal, 2023 provincial and by-elections since, '
                    'the 2026 referendum question by question, 2025 federal). '
                    'section="federal_budget" gives the Government of Canada\'s Budget 2026 (tabled 5 November 2026): the '
                    'fiscal summary, deficit, revenue and spending, new measures by chapter, the national strategies, '
                    'defence spending and transfers to every province; part="province" with province for everything the '
                    'budget names there (major projects, community projects, defence, every passage) and its federal '
                    'transfers over ten years; part="find" with find for measures on any subject, with their amounts and '
                    'the budget\'s own text; part="chapter", "tables" or "tax" for the full tables. '
                    'section="election_analytics" gives the micro-level election picture of the selected area: 2021 '
                    'Census by community (age pyramid, households, work), every 2023 provincial voting location and '
                    'every 2025 federal poll in the divisions and districts covering it, estimated ward electors and '
                    'turnout; with riding (an electoral division or district name) the same picture for that MLA\'s '
                    'or MP\'s seat, with the arithmetic of its last result. '
                    'section="business" gives Invest in Calgary: every business in Calgary from City business licences '
                    'and OpenStreetMap, in categories, counted by community (with new licences in the last 12 months); '
                    'community narrows to one community, kind to one category (counts by community), find searches '
                    'business names and types. '
                    'section="school_tax" gives school tax and school funding, Calgary against Edmonton and the rest of '
                    'Alberta (Government of Alberta): every municipality\'s education property tax requisition each year '
                    'since 2020, tax per student and per resident, students by board, every board\'s operating funding, '
                    'audited spending and funding profile per student, new schools approved per budget against growth, the '
                    'class size grant, school projects, and the factors behind a difference; part="municipalities", '
                    '"residents", "boards", "spending", "grants", "approvals", "projects" or "factors" for the full lists (find narrows). '
                    'section="safest_cities" gives Canada\'s safest cities by Statistics Canada\'s Crime Severity Index '
                    '(the latest year and the year before): the 50 safest of every city of 10,000 people or more, '
                    'Calgary\'s rank this year and last, the large cities (100,000+) and the metropolitan areas; '
                    'find narrows to cities by name. '
                    'section="growth_forecast" gives the City\'s Suburban Residential Growth (SRG) forecast put through '
                    'the growth model and Growth vs amenities: new homes and people in new communities each year (the City\'s '
                    'figures for each of the seven suburban sectors, what happened since 2018 and the five forecast years, '
                    'by kind of home, with the City\'s low and high range), each new community\'s share of its sector\'s '
                    'forecast, residents and children today and in 2030, crowding at today\'s six amenities today and in '
                    '2030, local and district amenity scores today and in 2030 (against Calgary today), a reading '
                    '(becomes crowded, more crowded, far from amenities and growing...), the growth-related water, sewer '
                    'and road projects the City lists with the area plans they support, and the meaning of every field '
                    'of the City\'s datasets (fields). Narrow with community (code or name), sector (North, Northeast, '
                    'East, Southeast, South, West, Northwest) or part ("sectors", "communities", "infrastructure", '
                    '"planned" (park land already set aside and libraries and recreation centres being built, added for '
                    '2030 "with what is planned"), "fields"). Every ward\'s major projects (schools, fire stations, '
                    'recreation, transit, health, private) are in section amenities (major_projects_being_built_or_planned). '
                    'section="city_news" gives Calgary News, the daily Calgary articles (last 60 days) with their '
                    'sources; narrow with find (words), days, topic or date.',
     'input_schema': {'type': 'object', 'properties': {'section': {
         'type': 'string', 'enum': ['overview', 'communities', 'child_care', 'schools', 'development', 'amenities', 'access', 'other_amenities', 'ward_amenities', 'population_recon', 'crime', 'traffic', 'rents', 'profile', 'wards', 'property_tax', 'elections', 'election_analytics', 'federal_budget', 'city_news', 'safest_cities', 'school_tax', 'business', 'growth_forecast', 'visiting'],
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
         'full': {'type': 'boolean', 'description': 'section elections: also every Calgary race and the referendum'},
         'riding': {'type': 'string', 'description': 'section election_analytics: one provincial electoral division or federal '
                                                     'electoral district by name (Calgary-Elbow, Calgary Centre)'},
         'days': {'type': 'integer', 'description': 'section city_news: only the last N days'},
         'topic': {'type': 'string', 'description': 'section city_news: one topic, e.g. City Council, Transit, Water'},
         'date': {'type': 'string', 'description': 'section city_news: one day\'s edition, YYYY-MM-DD'},
         'part': {'type': 'string', 'enum': ['summary', 'municipalities', 'residents', 'boards', 'spending', 'grants', 'approvals', 'factors', 'projects', 'province', 'find', 'chapter', 'tables', 'tax', 'revenue_by_province', 'sectors', 'communities', 'infrastructure', 'planned', 'fields', 'weather_months', 'weather_years', 'records', 'today', 'whats_on', 'sights', 'stay', 'getting_around', 'facts', 'stats'],
                  'description': 'section federal_budget: summary (default), revenue_by_province (federal revenue collected '
                                 'and spending in every province, Statistics Canada, with a 2026-27 estimate), province, find (search the measures and their '
                                 'text with find), chapter (every line item of one chapter), tables (Annex 1), tax'},
         'province': {'type': 'string', 'description': 'section federal_budget, part province: a name or code (AB, ON...)'},
         'sector': {'type': 'string', 'description': 'section growth_forecast: one suburban planning sector (North, Northeast, East, Southeast, South, West, Northwest)'},
         'chapter': {'type': 'integer', 'description': 'section federal_budget, part chapter: 1 to 6'},
         'community': {'type': 'string', 'description': 'sections other_amenities and access: one community (code '
                                                         'or name); access then gives its figures for every amenity; '
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
    {'name': 'get_weather_forecast',
     'description': 'Environment Canada\'s current public forecast for Calgary: conditions now, the forecast for each '
                    'day and night about 7 days ahead (summary, high, low, chance of precipitation) and any weather '
                    'warnings in force. Use for any question about upcoming weather.',
     'input_schema': {'type': 'object', 'properties': {}}},
    {'name': 'police_crime',
     'description': 'Crime or disorder counts from the Calgary Police Service community safety data already on this '
                    'computer. Describe the period exactly as the result\'s period.say_it_as gives it (a "12 months" '
                    'period always covers 12 months; if the data ends earlier the tool moves the window back). '
                    'Details: '
                    '(by month since 2020; crime categories: assault, other violence, street and commercial '
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
    {'name': 'list_sources',
     'description': "The master registry of everything you can use: every page of the site (each screen and each part of one, with what it "
                    'holds and exactly how to read it) and every open dataset the site reads (with when it was read). find: words about '
                    'the subject (votes, councillor, promises, budget, weather, hotels...). Call this BEFORE telling anyone that '
                    'something is not available.',
     'input_schema': {'type': 'object', 'properties': {'find': {'type': 'string'}}}},
    {'name': 'read_source',
     'description': "A site page's own data (the pages whose entry in list_sources says read_source: Civic Accountability's council and "
                    'Commons votes and promises, Infrastructure condition, City budget, Calgary Capital Markets, Find help near me, Visiting '
                    'Calgary). key: the page key from list_sources. With nothing else it gives the outline; part: a key or a path such as '
                    'accountability.json/council/divided to read that section; find: words to search the whole file (a councillor or MP name, '
                    'a subject).',
     'input_schema': {'type': 'object', 'properties': {'key': {'type': 'string'}, 'part': {'type': 'string'}, 'find': {'type': 'string'}},
                      'required': ['key']}},
    {'name': 'get_method',
     'description': "How the app counts every figure, by dataset: filters, codes, formulas, Excel steps and cautions. "
                    'topic: a key (311, population_choice, population, children, homes, growth_checks, live_counter, '
                    'access, access_crowding, access_revision, other_amenities, rates, compare, permits, dp, traffic, police, csi, '
                    'rents, child_care, schools, amenities, roads, cameras, city_disorder, budget, property_tax, weather), '
                    'a dataset ID or a word; empty lists the topics.',
     'input_schema': {'type': 'object', 'properties': {'topic': {'type': 'string'}}}},
    {'name': 'get_code',
     'description': "The app's own Python code behind any figure: the exact formula, constants and thresholds that "
                    'produced it. topic (empty lists them): access, other_amenities, assets, '
                    'population, population_recon, homes, growth_checks, live_counter, growth_model, '
                    'children, rates, periods, property_tax, budget, crime, child_care, rents, wards, census, report_auditor. '
                    'Or name: one function or constant (e.g. city_factor, crowding, reading), optionally with file. '
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
     'description': 'Show a chart on the site. Use numbers you already have.',
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
     'description': 'Show a table on the site.',
     'input_schema': {'type': 'object', 'properties': {
         'title': {'type': 'string'},
         'columns': {'type': 'array', 'items': {'type': 'string'}},
         'rows': {'type': 'array', 'items': {'type': 'array', 'items': {}}}},
         'required': ['title', 'columns', 'rows']}},
    {'name': 'show_map',
     'description': 'Show points on a map of Calgary on the site. For more than about 20 points, do not list them: give '
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
         'conclusion': {'type': 'string', 'description': 'The closing chapter, written after every section: how the chapters connect and what they add up to, drawing on each one by name with its key figure. Paragraphs separated by a blank line.'},
         'method': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Steps: what was counted, filters, periods, formulas'},
         'data_sources': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'name': {'type': 'string'}, 'publisher': {'type': 'string'}, 'dataset_id': {'type': 'string'},
             'url': {'type': 'string'}, 'period': {'type': 'string'}, 'notes': {'type': 'string'}}, 'required': ['name']}},
         'limitations': {'type': 'array', 'items': {'type': 'string'}},
         'recommendations': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'title': {'type': 'string'}, 'detail': {'type': 'string', 'description': 'No timelines or deadlines'},
             'evidence': {'type': 'string', 'description': 'The finding it rests on'},
             'priority': {'type': 'string', 'enum': ['high', 'medium', 'low']}}, 'required': ['title', 'detail']}},
         'action_plan': {'type': 'array', 'items': {'type': 'object', 'properties': {
             'action': {'type': 'string', 'description': 'No timelines or deadlines (no "within 2 weeks", "next 3 months")'},
             'owner': {'type': 'string'},
             'measure': {'type': 'string', 'description': 'How the office will know it worked'}}, 'required': ['action']}},
         'file_name': {'type': 'string'}},
         'required': ['title']}},
]
_MR = next(t for t in TOOLS if t['name'] == 'make_report')
_MR['description'] += (' Finish with this call. Anything already saved with report_add is included, so a report of any length '
                       'is made by report_add (a few sections at a time) and then make_report with the title and what is left.')
TOOLS.insert(TOOLS.index(_MR), {
    'name': 'earlier_research',
    'description': ('The research behind earlier reports (their question, key figures, research notes, conclusion, sources and the '
                    'day their data was read), best match first. Call it at the start of every report: when an earlier report '
                    'covers part of the subject, start from its figures and fetch only data newer than its data_as_of day, or what '
                    'it did not cover, instead of gathering everything again.'),
    'input_schema': {'type': 'object', 'properties': {'find': {'type': 'string', 'description': 'words about the subject, e.g. "sewer age back-ups"'}}}})
TOOLS.insert(TOOLS.index(_MR), {
    'name': 'recall_result',
    'description': 'The full result of an earlier step of this question, by its step number (every result is marked [step N]; '
                   'the condensed conversation lists them). Use it for figures from data you already fetched instead of fetching again.',
    'input_schema': {'type': 'object', 'properties': {'step': {'type': 'integer'}}, 'required': ['step']}})
TOOLS.insert(TOOLS.index(_MR), {
    'name': 'report_add',
    'description': 'Add parts to the report being written, without finishing it. A report may be as long as its subject needs (a full '
                   'election analysis or business plan can run to 100 pages): never shorten it to fit. Write it in parts: research_notes '
                   'first (in two or three calls if long), then a few sections (each with its charts, maps and tables) per call, as many '
                   'calls as it takes; then call make_report. Sections are appended in order; summary, method, data_sources, limitations, '
                   'recommendations, action_plan and key_figures are appended too; title, subtitle, question, plan and file_name are set. '
                   'Every call returns the notes, plan, key figures and the story so far.',
    'input_schema': {'type': 'object', 'properties': {**{k: v for k, v in _MR['input_schema']['properties'].items()},
        'plan': {'type': 'array', 'items': {'type': 'string'}, 'description': 'The chapter plan, set in the first call: one line per chapter (heading, what it shows, how it leads to the next). Kept and returned with every call.'},
        'key_figures': {'type': 'array', 'items': {'type': 'string'}, 'description': 'Figures the report relies on, each with its unit, period and source, added as soon as they are worked out. Kept and returned with every call so every chapter and the conclusion use the same numbers.'},
        'research_notes': {'type': 'string', 'description': 'The analysis written before any chapter, as a researcher writes notes: every finding with its figures, what explains what, how the findings connect, the main argument and any model or method, what is uncertain, and where each finding goes in the plan. Required before the first section; can be added to later. Kept and returned in full with every call.'}}}})
TOOLS.insert(TOOLS.index(_MR), {
    'name': 'report_revise',
    'description': 'Rewrite, remove or insert a chapter of the report being written, by its number (1 = first chapter). Use it in the '
                   'review before the report is made, so the opening chapters fit the story the later ones told.',
    'input_schema': {'type': 'object', 'properties': {
        'number': {'type': 'integer', 'description': 'The chapter number, as listed in story_so_far'},
        'action': {'type': 'string', 'enum': ['replace', 'remove', 'insert_before'], 'description': 'replace (default) rewrites the chapter; insert_before adds a new chapter before it'},
        'section': _MR['input_schema']['properties']['sections']['items']}, 'required': ['number']}})
TOOLS[-1]['cache_control'] = {'type': 'ephemeral'}      # cache system prompt + tools between calls

STEP_TEXT = {
    'search_datasets': lambda a: (f"Searching the City's datasets for “{a['query']}”" if a.get('query') else
                                  f"Listing the City's {a['category']} datasets" if a.get('category') else "Reading the City's data catalogue"),
    'remember': lambda a: 'Noting that for later chats',
    'earlier_research': lambda a: 'Reading earlier reports on this' + (f" ({a['find']})" if a.get('find') else ''),
    'forget': lambda a: 'Removing a saved note',
    'query_map_layer': lambda a: f"Reading the City's map layer {str(a.get('service', '')).split('/')[1] if '/' in str(a.get('service', '')) else a.get('service', '')}",
    'describe_dataset': lambda a: f"Reading the columns of {a.get('dataset_id', '')}",
    'query_dataset': lambda a: f"Querying {a.get('dataset_id', '')}",
    'download_dataset': lambda a: f"Downloading “{a.get('file_name', '')}”",
    'get_dashboard': lambda a: 'Reading the dashboard' + ('' if (a.get('section') or 'overview') == 'overview' else f" ({a.get('section').replace('_', ' ')})"),
    'get_weather_forecast': lambda a: 'Getting Environment Canada\'s forecast for Calgary',
    'get_weather': lambda a: f"Getting Environment Canada weather, {a.get('start', '')} to {a.get('end', '')}",
    'police_crime': lambda a: f"Reading Calgary Police {a.get('kind', 'crime')} data saved on this computer",
    'crime_severity_index': lambda a: 'Reading the Crime Severity Index',
    'list_saved_files': lambda a: 'Checking the files already saved',
    'list_sources': lambda a: 'Checking the list of sources' + (' for ' + a['find'] if a.get('find') else ''),
    'read_source': lambda a: f"Reading {a.get('key', 'a page')}'s own data",
    'get_method': lambda a: f"Reading how the app counts {a.get('topic') or 'its figures'}",
    'get_code': lambda a: f"Reading the app's code for {a.get('topic') or a.get('name') or a.get('text') or 'its formulas'}",
    'query_saved_file': lambda a: f"Working with the saved file “{a.get('file_name', '')}”",
    'save_table': lambda a: f"Saving “{a.get('file_name', '')}”",
    'show_chart': lambda a: 'Drawing a chart',
    'show_table': lambda a: 'Building a table',
    'show_map': lambda a: 'Placing points on a map',
    'calculate': lambda a: f"Working out {len(a.get('calculations') or [])} figure{'s' if len(a.get('calculations') or []) != 1 else ''}",
    'report_revise': lambda a: f"Revising chapter {a.get('number', '')} to fit the whole report",
    'recall_result': lambda a: f"Re-reading the result of step {a.get('step', '')}",
    'report_add': lambda a: ('Writing the research notes' if a.get('research_notes') and not a.get('sections') else 'Writing the report, part by part') + (f" ({', '.join(str(x.get('heading', ''))[:40] for x in (a.get('sections') or [])[:2])})" if a.get('sections') else ''),
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


def _scores_out(sc, names, readings=None):
    readings = readings or {}
    """The amenity scores for Data Genie: every ward, and the communities by label (the default figure and range)."""
    if not sc:
        return None
    pick = lambda x: None if not x else {k: x.get(k) for k in ('score', 'low', 'high', 'band', 'consistency', 'scenarios',
                                                              'scenarios_possible')}
    comm = sc.get('communities') or {}
    near_crowded = {}                             # most homes within reach, but shared by more people than Calgary's average
    for k in ('playground', 'park'):
        near_crowded[k] = sorted([{'name': names.get(c, c), 'code': c, 'score': ((r.get('amenities') or {}).get(k) or {}).get('score'),
                                   'consistency': ((r.get('amenities') or {}).get(k) or {}).get('consistency')}
                                  for c, r in comm.items() if (readings.get(c) or {}).get(k) == 'no_gap'
                                  and isinstance(((r.get('amenities') or {}).get(k) or {}).get('score'), (int, float))
                                  and round(r['amenities'][k]['score'], 2) < 0.8], key=lambda x: x['score'])
    by = lambda g, lab: sorted([{'name': names.get(c, c), 'code': c, 'score': ((r.get('overall') if g == 'overall' else
                                (r.get('groups') or {}).get(g)) or {}).get('score')}
                                for c, r in comm.items() if ((r.get('overall') if g == 'overall' else (r.get('groups') or {}).get(g))
                                                            or {}).get('consistency') == lab],
                               key=lambda x: (x['score'] is None, x['score']))
    return {'added': sc.get('added'), 'units': sc.get('units'), 'scenarios': sc.get('scenarios'), 'rules': sc.get('rules'),
            'groups': sc.get('groups'), 'people': sc.get('people'), 'default_people': sc.get('default_people'),
            'wards': {w: {'local': pick((r.get('groups') or {}).get('local')), 'district': pick((r.get('groups') or {}).get('district')),
                          'all_amenities': pick(r.get('overall'))} for w, r in (sc.get('wards') or {}).items()},
            'consistent_gap': {g: by(g, 'consistent_gap') for g in ('local', 'district')},
            'depends': {g: len(by(g, 'depends')) for g in ('local', 'district')},
            'all_six_note': 'each community also has an all-six score (overall) in its details: one average of six '
                            'different amenities that can hide a gap in one group; lead with local and district.',
            'communities_scored': len(comm),
            'near_but_crowded': near_crowded,
            'how': 'score = the community\'s crowding / Calgary\'s (1.00 = Calgary); default way: shorter distance, the count '
                   'of residents chosen in Settings (default_people), equal weights; low/high: the range over every way (4, or 8 for all amenities); consistency: '
                   'consistent_gap (below 0.80 every way), depends (some ways), none. get_method topic access_scores. '
                   'Present them as what the data shows, never as a ranking of need or a recommendation.'}


def _access_out(a, community=None, withdrawn=False):
    """Growth vs amenities (revised 5 November 2026) for Data Genie: distance from every home and crowding."""
    if withdrawn:
        note = {'withdrawn': 'The amenity level, its 23 flagged communities and the Needs attention tiers were withdrawn '
                             'on 5 November 2026 and must not be quoted (get_method topic access_revision). These are the '
                             'figures that replaced them.'}
    else:
        note = {}
    if not a:
        return {**note, 'error': 'The Growth vs amenities figures are not in this refresh.'}
    kinds = a.get('kinds') or {}
    km = {k: {'label': v.get('label'), 'distances_m': v.get('thresholds_m'), 'basis': v.get('basis'),
              'limits': v.get('limits')} for k, v in kinds.items()}
    pick = ('share_1', 'share_2', 'share_new_1', 'share_old_1', 'median_m', 'crowding_400', 'crowding_800', 'reading')
    trim = lambda x: {f: x.get(f) for f in pick if x.get(f) is not None}
    rows = a.get('communities') or []
    if community:
        q = str(community).strip().upper()
        r = next((x for x in rows if x['code'] == q or str(x.get('name', '')).upper() == q), None)
        if not r:
            return {**note, 'error': f'{community} is not one of the communities shown (choose its ward or all of Calgary).'}
        sc_ = (a.get('scores') or {})
        return {**note, 'community': r['name'], 'code': r['code'], 'ward': r.get('ward'), 'units': r.get('units'),
                'scores': (sc_.get('communities') or {}).get(r['code']), 'crowding_all_amenities': (sc_.get('crowding') or {}).get(r['code']),
                'units_built_since_2021': r.get('units_new'), 'share_built_last_five_years': r.get('recent_share'),
                'residents': r.get('residents'), 'children_0_14': r.get('children'),
                'by_amenity': {k: trim(r.get(k) or {}) for k in kinds}, 'calgary': {k: trim((a.get('city') or {}).get(k) or {}) for k in kinds},
                'kinds': km, 'readings': a.get('readings'), 'limitations': a.get('limitations')}
    many = len(rows) > 40
    return {**note, 'revised': a.get('revision'), 'counted': a.get('counted'), 'kinds': km,
            'calgary': {k: trim((a.get('city') or {}).get(k) or {}) for k in kinds},
            'calgary_new_against_older_homes': a.get('findings'),
            'wards': [{'ward': w['ward'], **{k: trim(w.get(k) or {}) for k in kinds}} for w in a.get('wards') or []],
            'communities': [{'name': r['name'], 'code': r['code'], 'ward': r.get('ward'), 'units': r.get('units'),
                             **{k: trim(r.get(k) or {}) for k in (('playground', 'park', 'transit_stop') if many else kinds)}}
                            for r in rows][:250],
            'communities_note': ('the whole city: playgrounds, parks and transit only; call with community for one '
                                 'community\'s every amenity') if many else 'every community shown',
            'crowding_under_each_resident_count': a.get('sensitivity'), 'checks': a.get('checks'),
            'scores': _scores_out(a.get('scores'), {r['code']: r['name'] for r in rows},
                                  {r['code']: {k: (r.get(k) or {}).get('reading') for k in ('playground', 'park')} for r in rows}),
            'with_private_amenities': {v: {'label': x.get('label'), 'added': x.get('added'),
                                           'calgary': {k: trim(y) for k, y in (x.get('city') or {}).items()},
                                           'wards': [{'ward': w['ward'], **{k: trim(w.get(k) or {}) for k in ('playground', 'park')}}
                                                     for w in x.get('wards') or []],
                                           'crowding_groups': x.get('crowding_groups')}
                                       for v, x in (a.get('with_other') or {}).items()} or None,
            'readings': a.get('readings'), 'rules': a.get('rules'), 'limitations': a.get('limitations'),
            'how': 'share_1 / share_2 = share of homes (units) within the first / second distance of the nearest one, '
                   'in any community; share_new_1 / share_old_1 = the same for homes built since 2021 / before 2021; '
                   'crowding = playgrounds per 1,000 children (parks: hectares per 1,000 residents) within reach, an '
                   'estimate. Explain with get_method topics access and access_crowding.'}


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
                    '(amenity_counts_other). '
                    'gated_residents_only (OpenStreetMap access=private: homeowners\' association, condo) are counted only '
                    'when the screens\' "Also count gated, residents-only ones" box is ticked. Give the user the links: '
                    'each opens that feature on the OpenStreetMap map.'}


NEGATIVE_OPENING = re.compile(
    r"^\W*(short answer\W*)?(i\s+((can'?t|cannot)|cannot|could\s*n[o']t|do\s*n[o']t\s+know|am\s+not\s+able|'m\s+not\s+able|"
    r"have\s+no|don'?t\s+have|was\s+not\s+able|wasn'?t\s+able)|idk|unfortunately|sorry|"
    r"(the\s+)?(data|tools?|dataset|records?)\s+((can'?t|cannot)|cannot|does\s*n[o']t|do\s*n[o']t|is\s*n[o']t|are\s*n[o']t|"
    r"has\s+no|have\s+no)|there\s+(is|are)\s+no|no\s+(data|forecast|records?)|it'?s\s+not\s+possible|"
    r"it\s+is\s+not\s+possible)", re.I)
REWRITE_NOTE = ('Rewrite your answer. Its first sentence says what cannot be done; Data Genie never opens that way. '
                'Open with the answer the data does give, with its number (use more tools first if you have not yet '
                'looked: get_dashboard sections, get_weather_forecast, get_weather, police_crime, the open data). '
                'Put any limit in one short sentence at the end. Do not mention this note.')


def _first_sentence(text):
    t = re.sub(r'[*_#>`]', '', (text or '').replace('\u2019', "'")).strip()
    return re.split(r'(?<=[.!?])\s|\n', t, maxsplit=1)[0][:300]


def _traffic_months(by_day):
    out = {}
    for day, n in (by_day or {}).items():
        out[day[:7]] = out.get(day[:7], 0) + n
    return [{'month': m, 'incidents': out[m]} for m in sorted(out)]


def _traffic_weather(by_day):
    """Traffic incidents a day against that day's weather (Calgary airport): fresh snow and snow on the ground."""
    if not by_day:
        return None
    days = sorted(by_day)
    try:
        rows = weather.daily(dt.date.fromisoformat(days[0]), dt.date.fromisoformat(days[-1]))
    except Exception as ex:                       # noqa: BLE001 - the rest of the section still stands
        return {'error': f'Weather could not be read ({ex}).'}
    num = lambda v: float(v) if v not in (None, '') else None
    groups = {'no new snow, bare ground': [], 'no new snow, snow on the ground': [], 'light snow (0.2 to 4.9 cm)': [],
              'heavy snow (5 cm or more)': []}
    for r in rows:
        day = str(r.get('LOCAL_DATE') or '')[:10]
        snow, ground = num(r.get('TOTAL_SNOW')), num(r.get('SNOW_ON_GROUND'))
        if snow is None:
            continue
        key = ('heavy snow (5 cm or more)' if snow >= 5 else 'light snow (0.2 to 4.9 cm)' if snow >= 0.2 else
               'no new snow, snow on the ground' if (ground or 0) >= 1 else 'no new snow, bare ground')
        groups[key].append(by_day.get(day, 0))
    out = [{'days': k, 'number_of_days': len(v), 'incidents': sum(v),
            'incidents_per_day': round(sum(v) / len(v), 2) if v else None} for k, v in groups.items()]
    base = next((g['incidents_per_day'] for g in out if g['days'] == 'no new snow, bare ground'), None)
    for g in out:
        g['against_bare_ground_days'] = (f"{(g['incidents_per_day'] / base - 1) * 100:+.1f}%"
                                         if base and g['incidents_per_day'] is not None else None)
    worst = sorted(((by_day.get(str(r.get('LOCAL_DATE'))[:10], 0), str(r.get('LOCAL_DATE'))[:10], num(r.get('TOTAL_SNOW')))
                    for r in rows), reverse=True)[:5]
    return {'from': days[0], 'to': days[-1], 'by_snow': out,
            'busiest_days': [{'date': dd, 'incidents': n, 'snowfall_cm': sn} for n, dd, sn in worst],
            'source': weather.SOURCE}


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


def known_fields(desc):
    """Fill in what each column means where the City's portal leaves it blank and the app knows (srg.FIELDS)."""
    try:
        import srg                                      # noqa: PLC0415
        g = srg.FIELDS.get((desc or {}).get('id'))
    except Exception:                                   # noqa: BLE001
        g = None
    if not g:
        return desc
    for c in desc.get('columns') or []:
        if not c.get('about') and g.get(c.get('field')):
            c['about'] = g[c['field']]
    desc['in_the_app'] = ('Used by Growth vs amenities, Forecast to 2030: get_dashboard section growth_forecast gives the '
                          'forecast as the app shows it, shared to communities; get_method topic growth_forecast explains it.')
    return desc


def visiting_out(data_dir, part=None, find=None):
    """Visiting Calgary (visit.py: data/visit.json): the weather by month and by year, records, what is on each month,
    the best-known sights, places to stay by area, getting around, facts and visitor statistics, with sources."""
    import visit
    p = os.path.join(data_dir or '.', 'visit.json')
    web = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'visit.json')      # the website's copy (registry.py)
    if os.path.exists(web):
        p = web
    try:
        if os.path.exists(p) and (p == web or time.time() - os.path.getmtime(p) < 86400):
            with open(p, encoding='utf-8') as f:
                V = json.load(f)
        else:
            V = visit.build(data_dir)
            with open(p, 'w', encoding='utf-8') as f:
                json.dump(V, f)
    except Exception as e:                              # noqa: BLE001
        return {'error': f'Visiting Calgary is not available: {e}'}
    W = V.get('weather') or {}
    head = {'how': 'get_method topic visiting; the figures are from the sources listed', 'sources': V.get('sources'), 'checked': V.get('checked'),
            'parts': ['weather_months', 'weather_years', 'records', 'today', 'whats_on', 'sights', 'stay', 'getting_around', 'facts', 'stats']}
    q = (find or '').lower().strip()
    def hit(x):
        return not q or q in json.dumps(x).lower()
    if part == 'weather_months':
        return {**head, 'normals_period': W.get('normals_period'), 'months': W.get('normals'), 'last_12_months': W.get('last12')}
    if part == 'weather_years':
        return {**head, 'first_year': W.get('first_year'), 'years': W.get('years'), 'note': 'mean = mean temperature; days_25 and days_30 = days with a high of 25/30 °C or more; days_m20 = days with a low of −20 °C or colder; frost_free = days between the last spring and first fall frost'}
    if part == 'records':
        return {**head, 'records': W.get('records'), 'source': W.get('source')}
    if part == 'today':
        return {**head, 'today': W.get('today'), 'note': 'the forecast read when the site was built; get_weather_forecast gives the live one'}
    if part == 'whats_on':
        return {**head, 'months': [m for m in V.get('months') or [] if hit(m)]}
    if part == 'sights':
        return {**head, 'best_known': [p for p in V.get('top') or [] if hit(p)], 'mapped_in_openstreetmap': len(V.get('sights') or []),
                'more': [s for s in V.get('sights') or [] if q and hit(s)][:60], 'day_trips': V.get('day_trips'), 'areas': V.get('areas_about')}
    if part == 'stay':
        return {**head, 'by_area': V.get('areas'), 'places': [s for s in V.get('stays') or [] if hit(s)][:200],
                'note': 'as mapped in OpenStreetMap: not a recommendation and not a complete list; hotels add the 4% tourism levy and often a 6% destination marketing fee to GST'}
    if part == 'getting_around':
        return {**head, 'getting_around': V.get('getting_around')}
    if part == 'facts':
        return {**head, 'facts': V.get('facts')}
    if part == 'stats':
        return {**head, 'stats': V.get('stats')}
    return {**head, 'summary': {'normals': [{k: n.get(k) for k in ('name', 'high', 'low', 'rain_mm', 'snow_cm', 'days_20', 'days_m20')} for n in W.get('normals') or []],
                                'records': W.get('records'), 'stats': V.get('stats'), 'best_known_sights': [p['name'] for p in V.get('top') or []],
                                'places_to_stay_mapped': len(V.get('stays') or []), 'sights_mapped': len(V.get('sights') or []),
                                'this_month': (V.get('months') or [{}])[min(11, max(0, dt.date.today().month - 1))]}}


def growth_forecast_out(S, community=None, sector=None, part=None):
    """The City's Suburban Residential Growth forecast as the app shows it (srg.py), narrowed for one answer."""
    if not S:
        return {'error': 'The City\'s Suburban Residential Growth forecast is not in this refresh of the dashboard.'}
    head = {k: S.get(k) for k in ('edition', 'first_year', 'first_forecast_year', 'last_year', 'method', 'datasets', 'limits',
                                  'readings', 'types', 'scope', 'counts', 'calgary_crowding', 'allocation_check')}
    head['how'] = 'get_method topic growth_forecast; get_code topic growth_forecast'
    secs = S.get('sectors') or []
    if sector:
        t = str(sector).strip().upper().replace(' ', '')
        secs = [x for x in secs if x['sector'].replace(' ', '') == t or x['name'].upper() == t]
    rows = S.get('communities') or []
    if community:
        t = str(community).strip().lower()
        rows = [r for r in rows if r['code'].lower() == t or r['name'].lower() == t or t in r['name'].lower()]
        if not rows:
            return {**head, 'error': f'"{community}" is not among the communities the forecast changes in the area selected '
                                     '(the forecast adds homes to new communities only; established ones are listed when '
                                     'growing neighbours change their amenity reading). Choose all of Calgary to see every one.'}
    if sector:
        rows = [r for r in rows if (r.get('sector') or '').upper() in {x['sector'] for x in secs}]
    if part == 'fields':
        return {'fields': S.get('fields'), 'types': S.get('types'), 'readings': S.get('readings'), 'datasets': S.get('datasets')}
    if part == 'infrastructure':
        return {'infrastructure': S.get('infrastructure'), 'datasets': S.get('datasets'),
                'field_meaning': (S.get('fields') or {}).get('szyj-edpn')}
    if part == 'sectors':
        return {**head, 'calgary': S.get('city'), 'sectors': secs, 'field_meaning': (S.get('fields') or {}).get('e7ib-v9n4')}
    if part == 'planned':
        return {**head, 'planned': S.get('planned'),
                'communities': [{k: r.get(k) for k in ('code', 'name', 'ward', 'planned_park_ha', 'planned_park_by_zone',
                                                       'planned_facilities', 'scores')} for r in rows]}
    if part == 'communities' or community:
        return {**head, 'communities': rows}
    return {**head, 'calgary': {k: v for k, v in (S.get('city') or {}).items() if k != 'series'},
            'calgary_by_year': (S.get('city') or {}).get('series'),
            'sectors': [{k: v for k, v in x.items() if k != 'series'} for x in secs],
            'communities': [{k: r.get(k) for k in ('code', 'name', 'ward', 'sector', 'srg', 'reading', 'forecast_homes',
                                                   'forecast_people', 'residents_now', 'residents_2030', 'growth_pct',
                                                   'scores', 'falls_below', 'far_from', 'in_forecast')} for r in rows],
            'infrastructure_projects': len(((S.get('infrastructure') or {}).get('projects')) or []),
            'more': 'part="communities" for every field of each community (crowding of all six amenities, children, '
                    'ranges); part="infrastructure" for the projects; part="fields" for what every column means.'}


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
                            for p in dv.get('list', []) if not p.get('rezoning')][:100],
                'rezonings': [{k: p.get(k) for k in ('id', 'address', 'what', 'use', 'status', 'applied', 'applicant', 'comm',
                                                    'open')} for p in dv.get('list', []) if p.get('rezoning')][:150]}
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
        return {'period': d.get('period'), 'prev_period': d.get('prev_period'),
                'traffic12': (d.get('summary') or {}).get('traffic12'),
                'traffic_prev': (d.get('summary') or {}).get('traffic_prev'),
                'hotspots': d.get('traffic_places'),
                'by_month': _traffic_months(d.get('traffic_by_day')),
                'weather': _traffic_weather(d.get('traffic_by_day')),
                'points_last_90_days': len(d.get('traffic_points') or []),
                'newest_50_points': sorted(d.get('traffic_points') or [], key=lambda p: str(p.get('date', '')) + str(p.get('time', '')),
                                           reverse=True)[:50],
                'note': 'Everything here is inside the selected area\'s exact boundary (the whole city, or one ward): '
                        'hotspots = the places (the City\'s incident_info, usually a junction) with the most traffic '
                        'incidents in the period, with the year before; by_month = incidents each month over both '
                        'periods; weather = average incidents a day by the day\'s snowfall and snow on the ground '
                        '(Environment Canada, Calgary airport). Use these to answer hotspot and weather questions '
                        'directly. For a map of the last 90 days use show_map with source layer area_traffic.'}
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
    if section == 'business':
        import business                                 # noqa: PLC0415
        return business.summary(business.load((extra or {}).get('data_dir'), can_build=True), (extra or {}).get('community'),
                                (extra or {}).get('kind'), (extra or {}).get('find'))
    if section == 'school_tax':
        import schooltax                                # noqa: PLC0415
        return schooltax.summary(schooltax.load((extra or {}).get('data_dir'), can_build=True), (extra or {}).get('part'),
                                 (extra or {}).get('find'))
    if section == 'safest_cities':
        import safety_rank                              # noqa: PLC0415
        return safety_rank.summary(safety_rank.load((extra or {}).get('data_dir'), can_build=True), (extra or {}).get('find'))
    if section == 'election_analytics':
        el = d.get('elections') or {}
        ar = el.get('areas') or {}
        rid = str((extra or {}).get('riding') or '').strip()
        if rid:
            low = rid.lower().replace('–', '-')
            for lvl in ('provincial', 'federal'):
                for n, a in (ar.get(lvl) or {}).items():
                    if n.lower().replace('–', '-') == low:
                        return {'riding': a, 'note': ar.get('note'),
                                'how': 'One provincial electoral division (MLA) or federal electoral district (MP): its member, '
                                       'the last result with its arithmetic (math: votes between first and second, the '
                                       'uniform swing that would tie it, electors who did not vote), who lives there '
                                       '(each community\'s 2021 Census profile scaled to today\'s residents and to the share '
                                       'of the community inside it), every 2023 voting location or the 2025 poll-by-poll '
                                       'summary, the wards it overlaps, the mayor\'s vote and the 2026 referendum there. '
                                       'Analyse for any candidate or campaign alike; projections are mathematical models '
                                       'with stated assumptions and ranges.'}
            names = sorted(list(ar.get('provincial') or {}) + list(ar.get('federal') or {}))
            return {'error': f'{rid!r} is not covered by the area selected', 'available': names,
                    'how': 'With all of Calgary selected every division and district is available.'}
        return {'micro': el.get('micro'), 'constituency': el.get('constituency'),
                'provincial': el.get('provincial'), 'federal': el.get('federal'), 'municipal': el.get('municipal'),
                'ward_profile_2021_census': d.get('profile'),
                'divisions_and_districts': {lvl: [{'name': a['name'], 'member': (a.get('member') or {}).get('name'),
                                                   'residents': a.get('residents'), 'turnout': (a.get('last') or {}).get('turnout'),
                                                   'margin_share': (a.get('last') or {}).get('margin_share'),
                                                   'math': (a.get('last') or {}).get('math')}
                                                  for a in (ar.get(lvl) or {}).values()] for lvl in ('provincial', 'federal')},
                'communities': [{k: c.get(k) for k in ('code', 'name', 'residents', 'growth_pct', 'requests_per_1000',
                                                       'open', 'open_top')} for c in d.get('communities') or []],
                'how': 'Election Analytics. who: each community\'s 2021 Census profile (age in 5-year bands, households, '
                       'work) scaled to its residents today, counted the way chosen in Settings (who.method), summed for '
                       'the area, with a row per community; rates are the Census\'s. provincial: each electoral division covering the '
                       'area (share of its residents), with every 2023 voting location (electors, ballots, turnout, '
                       'leading party, margin). federal: each electoral district with the 2025 poll-by-poll results '
                       '(turnout spread, polls led, the lowest-turnout and closest polls, votes on election day, at '
                       'advance polls and by special ballot). constituency: estimated ward electors and turnout, the '
                       'council race station by station. Polls and voting locations serve their whole division or '
                       'district, not only this ward. Analyse for any candidate or campaign alike; projections '
                       'are mathematical models with stated assumptions and ranges, never certainties; never favour one '
                       'or suggest targeting or discouraging any group.'}
    if section == 'elections':
        out = {'area': d.get('elections'), 'how': 'Official results as published (Elections Calgary, Elections Alberta, '
               'Elections Canada); members today from the Legislative Assembly of Alberta and the House of Commons. '
               'State results as facts with their source and date; never favour or rate a candidate or party, and '
               'give no voting advice. get_method topic elections.'}
        if (extra or {}).get('full'):
            try:
                import elections                        # noqa: PLC0415
                out['all_calgary'] = elections.load((extra or {}).get('data_dir') or '.', can_build=False)
            except Exception as e:                      # noqa: BLE001
                out['all_calgary_error'] = str(e)
        return out
    if section in ('access', 'amenity_gap', 'needs_attention'):
        return _access_out(d.get('access'), (extra or {}).get('community'),
                           withdrawn=section != 'access')
    if section in ('wards', 'ward_amenities'):
        ws = d.get('wards_summary') or (wards() if wards else None)
        if not ws:
            return {'error': 'The comparison of every ward is not available right now.'}
        keep = ('ward', 'councillor', 'communities', 'residents', 'census2021', 'growth_pct', 'children_0_14',
                'requests12', 'requests_per_1000', 'requests_change_pct', 'infra_per_1000', 'open', 'open_per_1000',
                'open_over_90_days', 'closed_7_days_pct', 'app_share_pct', 'crimes', 'crime_per_1000', 'crime_change_pct',
                'violent', 'violent_change_pct', 'traffic12', 'traffic_per_1000', 'traffic_change_pct', 'new_homes12',
                'new_homes_prev', 'new_homes_change_pct', 'issued_homes12', 'dev_permits12', 'growth_pct_by_method',
                'amenity_counts_other', 'amenity_counts_private', 'child_care_spaces', 'child_care_per_100_kids', 'daycare_per_100_0_4', 'schools',
                'students', 'facilities', 'playgrounds', 'stops', 'amenity_counts', 'homes_now', 'homes_census', 'households_2021', 'homes_growth_pct', 'people_per_home')
        detail = ('amenity_counts', 'amenity_counts_other', 'amenity_counts_private')
        rows_ = ws.get('wards') or []
        if section == 'ward_amenities':          # each asset, ward by ward (kept out of "wards" so that one fits)
            return {'wards': [{'ward': r['ward'], **{k: r.get(k) for k in detail if r.get(k) is not None}} for r in rows_],
                    'calgary': {'amenity_counts': ws.get('amenity_counts_city'),
                                'amenity_counts_other': ws.get('amenity_counts_other_city'),
                                'amenity_counts_private': ws.get('amenity_counts_private_city')},
                    'kinds': {k: v.get('label') for k, v in (ws.get('amenity_kinds') or {}).items()},
                    'note': 'amenity_counts: how many of each City asset the ward has (every community in it); '
                            'amenity_counts_other: private amenities accessible to the community (OpenStreetMap); '
                            'amenity_counts_private: gated, residents-only ones. How near homes are to amenities, ward by '
                            'ward: section access.'}
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
                             '(amenity_counts, non-City counts): section ward_amenities. How near homes are to amenities, '
                             'ward by ward: section access.',
                'ranks_note': 'ranks[measure][ward] = the ward\'s place of 14, 1 = the highest value (ties share a place). '
                              'Use it for "highest", "lowest", "second" and so on; never rank wards by reading the rows. '
                              'Whether high is good depends on the measure (more 311 reports is not worse service). '
                              'issued_homes12 = homes in building permits issued (the dashboard tile); new_homes12 = homes '
                              'in permits applied for. Ward figures count every community in the ward, business and '
                              'industrial areas too, so they add up to Calgary: use them rather than re-querying a dataset '
                              'and assigning wards yourself.',
                'crime_period': ws.get('crime_period'), 'how': ws.get('note'),
                'note': 'One row per ward and one for Calgary, for the same period as the dashboard. playgrounds: '
                        'City playgrounds in the ward.'}
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
    out['more'] = ('Call again with section = communities, child_care, schools, development, amenities, access, '
                   'population_recon, crime, traffic, rents, profile, property_tax or wards (every ward side by side) for detail.')
    return out


ward5_section = dashboard_section      # the old name, for anything saved before the rename
TOOL_ALIASES = {'get_ward5_dashboard': 'get_dashboard'}   # tool names in older saved conversations and reports
STEP_TEXT.update({old_: STEP_TEXT[new_] for old_, new_ in TOOL_ALIASES.items()})


def scope_note(d):
    """The area selected on the site, put at the top of the instructions for every conversation."""
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
        self.web = False                          # the internet (web search and reading pages): the Data Scientist has it
        self.memory = False                       # notes the visitor lets it keep (Data Genie on the website)
        self.user_notes = ''                      # those notes, sent with each question
        self.earlier = []                         # earlier reports' research, sent by the page (the website keeps it per visitor)
        self.downloads_dir = downloads_dir
        self.dashboard_provider = dashboard_provider
        self.wards_provider = wards_provider      # () -> every ward side by side (or None)
        self.tax_provider = None                  # () -> property tax estimate by ward (set by the app)
        self.history = []
        self.usage = {'input': 0, 'output': 0, 'cache_read': 0}
        self.provenance = []                      # every data request for the current question (report appendix)
        self._report_pdf = None
        self._draft = {}                           # the report being written in parts (report_add)
        self.last_cost = {}
        self._checkpoint = None                    # a report that stopped part-way: what it had done, so the same request carries on
        self._fresh()
        self.tools = TOOLS                        # the auditor gives its agents their own set
        self.system_text = None                   # ... and its own instructions
        self.handlers = {}                        # extra tools: name -> function(args) -> result
        self.last_report = None                   # the entry of the last report made (with its spec file)

    def reset(self):
        self.history = []                          # (a stopped report's checkpoint is kept so the same request can carry on)

    def restore(self, turns):
        """A saved chat reopened: its questions and written answers become the conversation again (charts and steps are
        not kept, only the words)."""
        self.reset()
        for t in (turns or [])[-30:]:
            q, a = str((t or {}).get('q') or '').strip(), str((t or {}).get('a') or '').strip()
            if q and a:
                self.history += [{'role': 'user', 'content': q}, {'role': 'assistant', 'content': [{'type': 'text', 'text': a[:12000]}]}]

    def _fresh(self):
        """The working state of one question."""
        self._q_start = len(self.history)          # where this question starts in the conversation
        self._question = ''
        self._prefix = []                          # the earlier questions as sent with this one (fixed for the whole question)
        self._results = {}                         # step number -> the full text of that tool result (recall_result, condensing)
        self._log = []                             # what happened since the conversation was last condensed, in order
        self._paused = False                       # the last reply was a web search the service paused (continued next)
        self._recent = []                          # the steps the condensed conversation carries in full
        self._ledger = []                          # the condensed conversation's lines for older steps
        self._ledger_items = []                    # the steps those lines stand for (to shorten the lines again if needed)
        self._step_no = 0
        self._cache = {}                           # a data request -> (step, result): the same request is never sent to a source twice
        self._compactions = 0
        self._nudged = False
        self._cut_text = ''                        # a written answer that ran over the length limit, continued in the next reply
        self._strip_all = False                    # send no earlier thinking (after the service refused it)
        self._bind_drop = False                    # ask the service to drop thinking it refuses (its own recovery setting)
        self._budget = None                        # characters of this question's conversation before it is condensed (after
                                                   # a service found it too long; otherwise CONTEXT_CHARS for the service)
        self._budget_now = None                    # the budget in force at the last request
        self._out_cap = None                       # a smaller reply limit, when a service refuses MAX_OUTPUT
        self._tries = 0

    def _save_checkpoint(self, question, start):
        """Keep what a stopped request had done (the data it read, the sections written) so asking again does not start over."""
        msgs = list(self.history[start:])
        if msgs and msgs[-1]['role'] == 'assistant':                 # a tool call that never got its answer
            ids = [b.get('id') for b in msgs[-1]['content'] if isinstance(b, dict) and b.get('type') == 'tool_use']
            if ids:
                msgs.append({'role': 'user', 'content': [{'type': 'tool_result', 'tool_use_id': i, 'is_error': True,
                                                          'content': 'Error: interrupted before this finished; call it again if it is still needed.'} for i in ids]})
            else:
                msgs.pop()
        if len(msgs) < 3 and not self._draft and not self._results:
            return
        self._checkpoint = {'question': question, 'messages': msgs, 'draft': dict(self._draft), 'provenance': list(self.provenance),
                            'results': dict(self._results), 'log': list(self._log), 'recent': list(self._recent),
                            'ledger': list(self._ledger), 'ledger_items': list(self._ledger_items), 'step_no': self._step_no, 'cache': dict(self._cache),
                            'compactions': self._compactions}

    # ----- tools ---------------------------------------------------------------------------------------------
    def run_tool(self, name, args):
        name = TOOL_ALIASES.get(name, name)
        if name in self.handlers:
            return self.handlers[name](args)
        if name == 'search_datasets':
            cat = catalog_mod.load(self.data_dir)
            q, category = (args.get('query') or '').strip(), (args.get('category') or '').strip()
            if cat is None:                       # the catalogue is not here yet: the City's own search
                return cd.search_datasets(q or category or 'calgary', limit=min(int(args.get('limit') or 8), 20))
            if not q:
                return catalog_mod.browse(cat, category or None)
            return catalog_mod.search(cat, q, category or None, max(1, min(int(args.get('limit') or 15), 60)))
        if name == 'earlier_research':
            return self._earlier(args.get('find'))
        if name in ('remember', 'forget') and self.memory:
            text = str(args.get('note') if name == 'remember' else args.get('words') or '').strip()[:300]
            if not text:
                return {'error': 'Nothing to ' + name + '.'}
            self.emit({'type': 'memory', 'op': 'add' if name == 'remember' else 'remove', 'text': text})
            return {'ok': True, 'note': ('Saved for later chats.' if name == 'remember' else 'Notes matching it were removed.')}
        if name == 'query_map_layer':
            return catalog_mod.map_query(args.get('service'), args.get('layer') or 0, args.get('where'), args.get('fields'),
                                         args.get('group_by'), bool(args.get('count_only')), args.get('order'), args.get('limit') or 200)
        if name == 'describe_dataset':
            return known_fields(cd.describe_dataset(args['dataset_id']))
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
        if name == 'get_dashboard' and (args.get('section') or '') == 'city_news':
            import citynews                             # noqa: PLC0415
            return citynews.find(args.get('find'), args.get('days'), args.get('topic'), args.get('date'))
        if name == 'get_dashboard' and (args.get('section') or '') == 'federal_budget':
            import fedbudget                            # noqa: PLC0415
            out = fedbudget.answer(args.get('part'), args.get('province'), args.get('find'), args.get('chapter'))
            if isinstance(out, dict):
                out['how'] = ('Budget 2026 as published (budget.canada.ca, tabled 5 November 2026) and Finance Canada\'s '
                              'transfer tables. Projections are the government\'s own. Describe, never rate the budget, '
                              'a party or a minister. get_method topic fedbudget.')
            return out
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
            if (args.get('section') or '') == 'growth_forecast':
                return growth_forecast_out(d.get('srg'), args.get('community'), args.get('sector'), args.get('part'))
            if (args.get('section') or '') == 'visiting':
                return visiting_out(self.data_dir, args.get('part'), args.get('find'))
            if (args.get('section') or '') == 'school_tax':
                import schooltax                       # noqa: PLC0415
                return schooltax.summary(schooltax.load(self.data_dir, can_build=True), args.get('part'), args.get('find'))
            return dashboard_section(d, args.get('section') or 'overview', self.wards_provider,
                                     {'community': args.get('community'), 'ward': args.get('ward'), 'find': args.get('find'), 'kind': args.get('kind'),
                                      'full': args.get('full'), 'riding': args.get('riding'), 'data_dir': self.data_dir})
        if name == 'get_weather_forecast':
            return weather.forecast()
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
        if name == 'list_sources':
            reg = registry.load(self.data_dir)
            dash = self.dashboard_provider() or {}
            hits = registry.find(reg, args.get('find'))
            return {'pages': [{k: p.get(k) for k in ('key', 'title', 'what', 'read', 'registered')} for p in hits],
                    'datasets': registry.datasets(dash.get('status')),
                    'note': 'Everything listed is available. Datasets not listed: search_datasets finds any City of Calgary open dataset.'
                            + ('' if hits else ' No page matches those words: try one or two other words, then search_datasets.')}
        if name == 'read_source':
            return registry.read(args.get('key'), self.data_dir, args.get('part'), args.get('find'))
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
        if name == 'report_add':
            return self._report_add(args)
        if name == 'report_revise':
            return self._report_revise(args)
        if name == 'recall_result':
            n = int(args.get('step') or 0)
            if n not in self._results:
                raise cd.DataError(f'There is no step {n} with a result in this question (steps so far: 1 to {self._step_no}).')
            return self._results[n]
        if name == 'make_report':
            args = self._merge_draft(args)
            self._draft = dict(args)          # kept, so a make_report sent back for its conclusion or review needs only what changes
            miss = [k for k in ('summary', 'sections', 'data_sources') if not args.get(k)]
            if miss:
                raise cd.DataError('The report is not complete: add ' + ', '.join(miss) + ' with report_add (or in this call), then call make_report again.')
            self._check_whole(args)
            self._review(args)
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
            args = {k: v for k, v in args.items() if not k.startswith('_')}
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
            self._draft = {}
            self.emit({'type': 'report', **entry, 'name': res['name'], 'warning': res['warning'], 'path': res['path']})
            self._keep_research(args, meta)
            return {'saved_to': res['path'], 'interactive_version': res['interactive'], 'excel_workbook': res['xlsx'],
                    'visuals_drawn': res['visuals'], 'map_points': notes, 'warning': res['warning']}
        raise cd.DataError(f'Unknown tool {name}')

    # ----- earlier research: a new report starts from what earlier ones found, and asks only for what is newer ------------
    def _keep_research(self, args, meta):
        """The research behind a finished report, kept for the next one: its question, key figures, notes, sources and the
        day its data was read. On the website the page keeps it in the visitor's memory; here also in data/research."""
        def plain(v):
            return [x if isinstance(x, str) else json.dumps(x, default=str) for x in (v or [])] if isinstance(v, list) else ([v] if v else [])
        rec = {'id': f"{meta.get('day')}-{re.sub(r'[^a-z0-9]+', '-', str(args.get('title', '')).lower()).strip('-')[:60]}",
               'title': args.get('title', ''), 'question': self._short(self._question or args.get('question', ''), 600),
               'made': meta.get('day'), 'data_as_of': meta.get('built') or meta.get('day'), 'area': meta.get('area'),
               'key_figures': plain(args.get('key_figures'))[:60], 'summary': plain(args.get('summary'))[:12],
               'notes': self._short(args.get('research_notes') or '', 8000),
               'conclusion': self._short(args.get('conclusion') or '', 2000),
               'sources': [{k: s.get(k) for k in ('name', 'dataset_id', 'publisher', 'period', 'url') if s.get(k)} if isinstance(s, dict) else {'name': str(s)}
                           for s in (args.get('data_sources') or [])][:40],
               'chapters': [x.get('heading') for x in args.get('sections') or [] if isinstance(x, dict)][:80]}
        self.emit({'type': 'research', 'record': rec})
        if self.data_dir:
            try:
                d = os.path.join(self.data_dir, 'research')
                os.makedirs(d, exist_ok=True)
                with open(os.path.join(d, rec['id'] + '.json'), 'w', encoding='utf-8') as f:
                    json.dump(rec, f, default=str)
            except OSError:
                pass
        return rec

    def _earlier(self, find=None):
        """Earlier reports' research (sent by the page, and kept on this computer), best match first."""
        recs = {r.get('id') or r.get('title'): r for r in (self.earlier or []) if isinstance(r, dict)}
        d = os.path.join(self.data_dir or '', 'research')
        if self.data_dir and os.path.isdir(d):
            for f in sorted(os.listdir(d))[-60:]:
                try:
                    with open(os.path.join(d, f), encoding='utf-8') as fh:
                        r = json.load(fh)
                    recs.setdefault(r.get('id') or f, r)
                except (OSError, ValueError):
                    pass
        words = [w for w in re.findall(r'[a-z0-9]+', str(find or '').lower()) if len(w) > 2]
        def score(r):
            text = json.dumps({k: r.get(k) for k in ('title', 'question', 'chapters', 'key_figures', 'sources')}, default=str).lower()
            return sum(text.count(w) for w in words)
        ranked = sorted(recs.values(), key=lambda r: (score(r), str(r.get('made') or '')), reverse=True)   # best, then newest
        if words:
            ranked = [r for r in ranked if score(r)]
        if not ranked:
            return {'found': 0, 'note': 'No earlier report covers this. Gather the data in full.'}
        top = ranked[:3]
        return {'found': len(ranked), 'reports': top + [{'title': r.get('title'), 'made': r.get('made')} for r in ranked[3:10]],
                'note': ('Start from these: reuse their figures for periods that ended before the day their data was read '
                         '(data_as_of), and query only what is newer (for example requested_date after that day) or what they did '
                         'not cover. Say in the method which figures were carried over from which earlier report and when.')}

    LIST_PARTS = ('summary', 'sections', 'method', 'data_sources', 'limitations', 'recommendations', 'action_plan', 'key_figures')

    @staticmethod
    def _gist(text, n=260):
        """The opening and the close of a section: enough for the next chapter to pick up the thread."""
        t = ' '.join(str(text or '').split())
        return t if len(t) <= 2 * n else t[:n] + ' ... ' + t[-n:]

    def _report_add(self, args):
        """Keep one more part of the report being written. The report is made by make_report, however many parts there are."""
        dr = self._draft
        args = dict(args or {})
        if args.get('research_notes'):
            dr['research_notes'] = (str(dr.get('research_notes') or '') + '\n\n' + str(args.pop('research_notes'))).strip()
        if args.get('sections') and not dr.get('research_notes'):
            raise cd.DataError('Write the research notes first (research_notes in report_add, with no sections in that call; in two '
                               'or three calls if they are long): every finding with its figures, what explains what, how the findings '
                               'connect, the main argument and any model, what is uncertain, and which chapter each finding belongs '
                               'to. Then write the chapters from them.')
        for k, v in args.items():
            if k in self.LIST_PARTS:
                dr.setdefault(k, []).extend(v if isinstance(v, list) else [v])
            elif v:
                dr[k] = v
        secs = dr.get('sections') or []
        words = sum(len(str(x.get('text') or '').split()) for x in secs)
        left = [p for p in dr.get('plan') or [] if not any(self._words(str(x.get('heading'))) & self._words(p) for x in secs)]
        return {'saved': True, 'research_notes': str(dr.get('research_notes') or '')[:16000], 'plan': dr.get('plan') or 'No chapter plan saved yet: send plan in this or the next report_add.',
                'chapters_still_to_write': left, 'key_figures': dr.get('key_figures') or [],
                'how_to_continue': 'Write the next chapter from the research notes and the plan, opening from the ending below; use the key figures exactly as listed. '
                                   'When every chapter is written, write the conclusion (it must draw on every chapter) and then the summary.',
                'story_so_far': [{'heading': str(x.get('heading'))[:70], 'gist': self._gist(x.get('text'))} for x in secs],
                'last_section_ending': str((secs[-1].get('text') if secs else '') or '')[-700:],
                'sections_so_far': len(secs), 'words_so_far': words, 'headings': [str(x.get('heading'))[:70] for x in secs],
                'visuals_so_far': sum(len(x.get('visuals') or []) for x in secs),
                'still_needed_for_make_report': [k for k in ('title', 'summary', 'sections', 'data_sources') if not dr.get(k)],
                'next': 'Add more sections with report_add, or finish with make_report (it includes everything saved).'}

    STOP = frozenset('the and for with from that this what how why its are was were has have into over under than then their there '
                     'about across between each per more less most least part chapter section calgary ward'.split())

    @classmethod
    def _words(cls, text):
        return {w[:6] for w in re.findall(r'[a-z]{4,}', str(text or '').lower()) if w not in cls.STOP}

    def _check_whole(self, spec):
        """Before a long report is made: it needs a conclusion written after every chapter, and the conclusion and key findings
        must draw on every chapter. Asked for at most twice, so a report is never held back for long."""
        secs = [x for x in spec.get('sections') or [] if isinstance(x, dict)]
        if len(secs) < 3 or self._draft.get('_checks', 0) >= 2:
            return
        self._draft['_checks'] = self._draft.get('_checks', 0) + 1
        story = [f"{i}. {str(x.get('heading'))[:80]}: {self._gist(x.get('text'), 200)}" for i, x in enumerate(secs, 1)]
        figs = spec.get('key_figures') or []
        if not str(spec.get('conclusion') or '').strip():
            raise cd.DataError('Not made yet: the report needs its conclusion. Write it now with every chapter in view (below): say what '
                               'each chapter showed, with its key figure, how the chapters connect, and what they add up to. Check the '
                               'key findings cover the whole report too. Then call make_report again (send conclusion, and summary if it '
                               'changes). Chapters:\n' + '\n'.join(story) + ('\nKey figures:\n' + '\n'.join(map(str, figs)) if figs else ''))
        said = self._words(spec.get('conclusion')) | self._words(' '.join(map(str, spec.get('summary') or [])))
        missed = [f'{i}. {x.get("heading")}' for i, x in enumerate(secs, 1)
                  if not (self._words(x.get('heading')) & said)]
        if len(missed) > max(1, len(secs) // 5):
            raise cd.DataError('Not made yet: the conclusion and key findings do not draw on these chapters: ' + '; '.join(missed)
                               + '. Rewrite the conclusion so it ties every chapter together (name each one and what it showed), then '
                               'call make_report again. Chapters:\n' + '\n'.join(story))

    def _report_revise(self, args):
        secs = self._draft.setdefault('sections', [])
        n, act, sec = int(args.get('number') or 0), args.get('action') or 'replace', args.get('section')
        if not 1 <= n <= len(secs) + (act == 'insert_before'):
            raise cd.DataError(f'There is no chapter {n}: the report has {len(secs)}.')
        if act == 'remove':
            secs.pop(n - 1)
        elif not isinstance(sec, dict) or not sec.get('heading'):
            raise cd.DataError('Send the chapter as section (heading, text and its visuals).')
        elif act == 'insert_before':
            secs.insert(n - 1, sec)
        else:
            secs[n - 1] = sec
        return {'saved': True, 'chapters': [f"{i}. {str(x.get('heading'))[:70]}" for i, x in enumerate(secs, 1)]}

    def _review(self, spec):
        """Once, before a long report is made: read the whole thing as a researcher does at the end, and revise any chapter
        (above all the opening ones) that no longer fits the story the report ended up telling."""
        secs = [x for x in spec.get('sections') or [] if isinstance(x, dict)]
        if len(secs) < 3 or self._draft.get('_reviewed'):
            return
        self._draft['_reviewed'] = True
        story = [f"{i}. {str(x.get('heading'))[:80]}: {self._gist(x.get('text'), 220)}" for i, x in enumerate(secs, 1)]
        raise cd.DataError('Not made yet: one review first. Read the whole report below with the conclusion and the research notes. '
                           'Does every chapter fit the story the report ends up telling, in the same terms and figures, and does each '
                           'one lead to the next? Rewrite any chapter that does not (above all the opening ones and the introduction) '
                           'with report_revise by its number, and update the summary if needed. Then call make_report again with '
                           'nothing new to send if all is well.\nConclusion: ' + self._gist(spec.get('conclusion'), 600)
                           + '\nChapters:\n' + '\n'.join(story))

    def _merge_draft(self, args):
        """make_report's own arguments after the parts already saved: lists go after the saved ones, single values win."""
        out = dict(self._draft)
        for k, v in (args or {}).items():
            if k in self.LIST_PARTS:
                seen = {json.dumps(x, sort_keys=True, default=str) for x in out.get(k) or []}
                out[k] = list(out.get(k) or []) + [x for x in (v if isinstance(v, list) else [v])
                                                   if json.dumps(x, sort_keys=True, default=str) not in seen]   # a resend adds nothing twice
            elif v:
                out[k] = v
        return out

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
            what = 'Calgary Insight dashboard'
            detail = f"section {a.get('section') or 'overview'}; period {d.get('period', '')} against {d.get('prev_period', '')}; residents: {pop}"
            got = f"built {d.get('built_at', '')} Calgary time"
        elif name == 'police_crime':
            parts = [f"{k} {', '.join(map(str, a[k])) if isinstance(a[k], list) else a[k]}" for k in ('kind', 'wards', 'communities', 'categories', 'start', 'end', 'group_by') if a.get(k)]
            what, detail, got = 'Calgary Police community safety data', '; '.join(parts), f"total {r.get('total', '?')} (latest month {r.get('latest_month', '?')})"
        elif name == 'crime_severity_index':
            what, detail, got = 'Statistics Canada table 35-10-0026-01', 'Crime Severity Index by city', f"latest year {r.get('latest_year', '?')}"
        elif name == 'get_weather_forecast':
            what, detail, got = 'Environment Canada public forecast for Calgary', 'conditions now and about 7 days ahead', f"issued {r.get('issued_utc', '')} UTC"
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
        self._report_pdf = None
        cp, self._checkpoint = self._checkpoint, None
        self._fresh()
        self._question = question
        if cp and cp['question'] == question and cp['messages']:      # the same request again: carry on where it stopped
            # the earlier run's thinking was bound to that run's conversation, so it is left out (the service allows that)
            self.history.extend(self._without_thinking(cp['messages']))
            self._draft, self.provenance = cp['draft'], cp['provenance']
            self._results, self._log, self._recent = cp['results'], cp['log'], cp['recent']
            self._ledger, self._step_no, self._cache, self._compactions = cp['ledger'], cp['step_no'], cp['cache'], cp['compactions']
            self._ledger_items = cp.get('ledger_items', [])
            self.emit({'type': 'step', 'text': f"Carrying on from where it stopped ({len(self._draft.get('sections') or [])} sections already written, "
                                               f"{self._step_no} steps of work kept)"})
        else:
            self.history.append({'role': 'user', 'content': question})
            self._draft = {}
        self._prefix = self._reduce_previous(self.history[:start])
        try:
            res = self._loop(chain, tier, today)
        except Exception as err:
            self._save_checkpoint(question, start)
            del self.history[start:]          # leave the conversation in a clean state for the next question
            if self._checkpoint and isinstance(err, AgentError):
                raise AgentError(str(err) + ' Your work so far is kept: start the same report again and it carries on from where it stopped.') from None
            raise
        if self._report_pdf:
            self._set_report_cost(self._report_pdf, res['tokens'].get('cost_usd'))
            res['report'] = self._report_pdf
        return res

    # ----- what is sent to the service ---------------------------------------------------------------------------
    # The service checks that nothing before a thinking block has changed since the block was written (its prefix check), so
    # the conversation sent is append-only within a question: earlier questions are fixed when the question starts, and when
    # the conversation grows too long it is condensed into one new message (dropping all thinking, which the service allows)
    # rather than edited in place.
    @staticmethod
    def _without_thinking(msgs):
        out = []
        for m in msgs:
            if m['role'] == 'assistant' and isinstance(m['content'], list) and any(
                    b.get('type') in ('thinking', 'redacted_thinking') for b in m['content']):
                kept = [b for b in m['content'] if b.get('type') not in ('thinking', 'redacted_thinking')]
                m = {**m, 'content': kept or [{'type': 'text', 'text': '(thought)'}]}
            out.append(m)
        return out

    def _reduce_previous(self, hist, keep_turns=8):
        """The earlier questions of this chat as they are sent with a new one: the last few, each word for word when short,
        otherwise just its question and written answer. Fixed for the whole of the new question."""
        starts = [i for i, m in enumerate(hist) if m['role'] == 'user' and isinstance(m['content'], str)]
        turns = [hist[a:b] for a, b in zip(starts, starts[1:] + [len(hist)])][-keep_turns:]
        reduced = []
        for t in turns:
            t = self._without_thinking(t)
            while t and t[-1]['role'] != 'assistant':                      # a turn ends with the assistant's answer
                t = t[:-1]
            if not t:
                continue
            if len(json.dumps(t, default=str)) > 40000:
                answer = next(('\n\n'.join(b.get('text', '') for b in m['content'] if b.get('type') == 'text').strip()
                               for m in reversed(t) if m['role'] == 'assistant' and isinstance(m['content'], list)
                               and any(b.get('type') == 'text' and b.get('text') for b in m['content'])), '')
                calls = sum(1 for m in t if m['role'] == 'assistant' and isinstance(m['content'], list)
                            for b in m['content'] if b.get('type') == 'tool_use')
                note = f'(worked out with {calls} tool calls, not repeated here)'
                t = [t[0], {'role': 'assistant', 'content': [{'type': 'text', 'text': (answer + '\n\n' + note).strip()}]}]
            reduced.append(t)
        while reduced and sum(len(json.dumps(t, default=str)) for t in reduced) > PREFIX_CHARS:
            reduced.pop(0)
        return [m for t in reduced for m in t]

    def _messages_to_send(self):
        cur = self.history[self._q_start:]
        if self._strip_all:
            cur = self._without_thinking(cur)
        return self._prefix + cur

    def _size(self):
        return len(json.dumps(self.history[self._q_start:], default=str))

    def _options(self, e):
        """Extra request fields for Claude: the service's own setting for dropping thinking its prefix check refuses."""
        if e['provider'] == 'claude' and self._bind_drop:
            return {'thinking': {'type': 'adaptive', 'block_binding': {'prefix_mismatch_behavior': 'drop_block'}},
                    '_betas': [BIND_BETA]}
        return None

    # ----- condensing a long conversation ------------------------------------------------------------------------
    @staticmethod
    def _short(text, n):
        t = str(text or '')
        return t if len(t) <= n else t[:n] + ' …'

    def _digest(self, x, tight=False):
        """One line of the condensed conversation for one step (tight: as short as it can be)."""
        n = 0.3 if tight else 1
        if 'text' in x:
            return 'You wrote: ' + self._short(' '.join(str(x['text']).split()), int(1500 * n))
        if 'note' in x:
            return 'Note: ' + self._short(' '.join(str(x['note']).split()), int(700 * n))
        head = f"step {x['step']} · {x['name']} {self._short(json.dumps(x.get('args') or {}, default=str), int(300 * n))}"
        r = str(x.get('result') or '')
        if x['name'] == 'report_add':
            return head + ' → saved to the report draft (see the draft below)'
        if x['name'] == 'recall_result':
            return head + ' → the result of that step again'
        if x.get('error'):
            return head + ' → ' + self._short(r, int(400 * n))
        if x['name'] == 'calculate' or len(r) <= 700 * n:
            return head + ' → ' + r
        return head + ' → ' + r[:int(600 * n)] + f' … [{len(r):,} characters; the whole result: recall_result step={x["step"]}]'

    def _draft_outline(self):
        dr = self._draft
        if not dr:
            return 'Nothing saved to the report draft yet.'
        lines = []
        if dr.get('title'):
            lines.append('Title: ' + str(dr['title']))
        if dr.get('research_notes'):
            lines.append('Research notes:\n' + str(dr['research_notes'])[:40000])
        if dr.get('plan'):
            lines.append('Chapter plan:\n' + '\n'.join(f'- {p}' for p in dr['plan']))
        if dr.get('key_figures'):
            lines.append('Key figures:\n' + '\n'.join(f'- {k}' for k in dr['key_figures']))
        secs = dr.get('sections') or []
        if secs:
            lines.append('Chapters written:\n' + '\n'.join(f"{i}. {str(x.get('heading'))[:80]}: {self._gist(x.get('text'), 200)}"
                                                           for i, x in enumerate(secs, 1)))
        other = [f'{k} ({len(dr[k])} items)' for k in ('summary', 'method', 'data_sources', 'limitations', 'recommendations', 'action_plan') if dr.get(k)]
        if dr.get('conclusion'):
            other.append('conclusion')
        if other:
            lines.append('Also saved: ' + ', '.join(other))
        return '\n'.join(lines)

    def _compact(self, why=''):
        """Condense this question's conversation into one message (the shape the service recommends): the request, every
        step so far in brief, the last few steps in full, and the report draft. Thinking is dropped with the old messages,
        which the service allows; every full result stays available with recall_result."""
        budget = self._budget or self._budget_now or CONTEXT_CHARS['other']
        items = self._recent + self._log
        keep, tight = RECENT_FULL, False
        while True:
            recent, older = items[len(items) - keep:] if keep else [], items[:len(items) - keep] if keep else items
            ledger = ([self._digest(x, True) for x in self._ledger_items] if tight else self._ledger) + [self._digest(x, tight) for x in older]
            full = [(f"step {x['step']} · {x['name']} {json.dumps(x.get('args') or {}, default=str)}\n→ {x.get('result') or ''}"
                     if 'step' in x else self._digest(x)) for x in recent]
            text = ('[Condensed conversation: you are part-way through this request. Everything below is your own earlier work, '
                    'condensed to save space. Carry on from the end; do not start over.]\n\n'
                    'THE REQUEST\n' + self._question + '\n\n'
                    f'WORK SO FAR ({self._step_no} steps; the whole result of any step: recall_result with its step number)\n'
                    + ('\n'.join(ledger) if ledger else '(nothing before the steps below)') + '\n\n'
                    'THE LAST STEPS IN FULL\n' + ('\n\n'.join(full) if full else '(none: every step is listed above)') + '\n\n'
                    'THE REPORT DRAFT (kept with the draft; every report_add returns it)\n' + self._draft_outline() + '\n\n'
                    'NEXT\nContinue from the last step above. Nothing needs to be fetched again: recall_result returns any '
                    'earlier result in full. Keep saving the figures you rely on in key_figures.')
            if len(text) <= budget * 0.7 or tight:
                break
            if keep:
                keep = {RECENT_FULL: 4, 4: 1}.get(keep, 0)      # fewer steps in full, then none
            else:
                tight = True                                    # then every line as short as it can be
        self._recent, self._log, self._ledger = recent, [], ledger
        self._ledger_items += older
        self.history[self._q_start:] = [{'role': 'user', 'content': text}]
        self._compactions += 1
        self._nudged = False
        self.emit({'type': 'step', 'text': f'Condensing the conversation so far ({self._step_no} steps; every result stays available)'
                                           + (f': {why}' if why else '')})

    # ----- one request to the service ----------------------------------------------------------------------------
    def _step(self, chain, pos, tier, system, skipped):
        """One request, to the first service in the chain (from pos) that answers. Returns (reply, pos)."""
        squeezes = 0
        while True:
            e = chain[pos]
            budget = self._budget or CONTEXT_CHARS['claude' if e['provider'] == 'claude' else 'other']
            self._budget_now = budget
            if self._size() > budget:
                self._compact()
            try:
                tools = self.tools + (MEMORY_TOOLS if self.memory else [])
                tools = tools + WEB_TOOLS if self.web and e['provider'] == 'claude' else tools
                r = engines.call(e, e[tier], system, tools, self._messages_to_send(), self._out_cap or MAX_OUTPUT,
                                 anthropic_post=post_messages, chat_post=post_chat, cache_mark=with_cache_mark,
                                 options=self._options(e))
                self._tries = 0
                return r, pos
            except (engines.EngineError, AgentError) as err:
                if not isinstance(err, engines.EngineError):
                    err = engines.EngineError('request', str(err))
                low = str(err).lower()
                if 'signature' in low and 'thinking' in low:
                    # the service's prefix check refused earlier thinking: first its own remedy (drop such blocks), then none at all
                    if e['provider'] == 'claude' and not self._bind_drop and not self._strip_all:
                        self._bind_drop = True
                        self.emit({'type': 'step', 'text': 'The AI service refused part of its earlier reasoning; asking it to drop that part'})
                        continue
                    if not self._strip_all:
                        self._bind_drop, self._strip_all = False, True
                        self.emit({'type': 'step', 'text': 'Carrying on without the earlier reasoning'})
                        continue
                elif self._bind_drop and err.kind == 'request' and re.search(r'block_binding|beta|thinking', low):
                    self._bind_drop, self._strip_all = False, True      # the remedy itself was refused: send no thinking
                    continue
                if err.kind == 'request' and re.search(r'too long|too many tokens|context (length|window)|maximum context|'
                                                       r'exceeds? the (model|context|maximum)|input (length|is too)', low):
                    size = self._size()
                    if size > 30000 and squeezes < 4:                        # condense harder, then try again
                        squeezes += 1
                        self._budget = max(int(size * 0.5), 30000)
                        self._compact('the service found the conversation too long')
                        continue
                if err.kind == 'request' and re.search(r'max_tokens|max_completion_tokens|output tokens|completion tokens', low) \
                        and (self._out_cap or MAX_OUTPUT) > 8000:
                    self._out_cap = (self._out_cap or MAX_OUTPUT) // 2    # this service allows a shorter reply
                    continue
                transient = err.kind in ('network', 'busy') or re.search(r'cut off|not readable|connection', low)
                if transient and self._tries + 1 < TRANSIENT_TRIES:
                    self._tries += 1                                        # a dropped phone connection or a busy moment
                    self.emit({'type': 'step', 'text': 'The connection to the AI service dropped; trying that step again'})
                    time.sleep(2 * self._tries)
                    continue
                self._tries = 0
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
                        why_ = re.sub(r'(?i)\b(anthropic|claude|gemini|openai|gpt[-\w.]*|sonnet[-\w.]*|opus[-\w.]*|haiku[-\w.]*)\b', 'the AI service',
                                      str(skipped[-1].get('why') or ''))[:160]
                        msg = (f'{who} could not answer this. Try again, or start a New chat if it keeps happening.'
                               + (f' (Reason given: {why_})' if why_ else ''))
                    raise AgentError(msg) from None
                self.emit({'type': 'step', 'text': f"The AI service was not available ({engines.WORDS.get(err.kind, err.kind)}). "
                                                   'Carrying on with the backup service'})

    # ----- a reply that ran over the length limit ----------------------------------------------------------------
    @staticmethod
    def _lenient(raw):
        """As much of a cut-off JSON text as is complete. Returns (value, partial): partial is the path of the value the
        cut fell in ('' when none), with partial strings kept as far as they go."""
        dec = json.JSONDecoder()
        partial = []

        def ws(i):
            while i < len(raw) and raw[i] in ' \t\r\n':
                i += 1
            return i

        def value(i, path):
            i = ws(i)
            if i >= len(raw):
                raise EOFError
            c = raw[i]
            if c == '{':
                obj, i = {}, i + 1
                while True:
                    i = ws(i)
                    if i >= len(raw):
                        partial.append(path); return obj, i
                    if raw[i] == '}':
                        return obj, i + 1
                    if raw[i] == ',':
                        i += 1; continue
                    try:
                        key, i = dec.raw_decode(raw, i)
                    except ValueError:
                        partial.append(path); return obj, len(raw)
                    i = ws(i)
                    if i >= len(raw) or raw[i] != ':':
                        partial.append(path); return obj, len(raw)
                    try:
                        v, i = value(i + 1, path + '/' + str(key))
                    except EOFError:
                        partial.append(path); return obj, len(raw)
                    obj[key] = v
                    if i >= len(raw):                   # the text ends inside this object (innermost first)
                        partial.append(path) if not partial else None
                        return obj, i
            if c == '[':
                arr, i = [], i + 1
                while True:
                    i = ws(i)
                    if i >= len(raw):
                        partial.append(path); return arr, i
                    if raw[i] == ']':
                        return arr, i + 1
                    if raw[i] == ',':
                        i += 1; continue
                    try:
                        v, i = value(i, path + '/' + str(len(arr)))
                    except EOFError:
                        partial.append(path); return arr, len(raw)
                    arr.append(v)
                    if i >= len(raw):                   # the text ends inside this list (innermost first)
                        partial.append(path) if not partial else None
                        return arr, i
            if c == '"':
                try:
                    return dec.raw_decode(raw, i)
                except ValueError:
                    partial.append(path)
                    body = raw[i + 1:]
                    body = re.sub(r'\\(?:u[0-9a-fA-F]{0,3})?$', '', body)       # a cut escape sequence
                    try:
                        return json.loads('"' + body + '"'), len(raw)
                    except ValueError:
                        return body.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\'), len(raw)
            try:
                return dec.raw_decode(raw, i)
            except ValueError:
                raise EOFError

        try:
            v, _ = value(0, '')
        except EOFError:
            return {}, ''
        return v, (partial[0] if partial else '')

    def _salvage(self, name, raw):
        """What a cut-off tool call still gives. For report_add (or make_report), every complete part is saved to the draft
        and the model is told exactly what to send again. Returns the note for the model."""
        v, cut = self._lenient(raw)
        if name not in ('report_add', 'make_report') or not isinstance(v, dict):
            return (f'Your call to {name} ran over the reply length limit and was not run. Send it again in smaller pieces '
                    '(fewer rows, points or expressions per call).')

        def whole(k, items):
            return [x for i, x in enumerate(items) if not (cut == f'/{k}/{i}' or cut.startswith(f'/{k}/{i}/'))]

        parts, saved, redo = {}, [], []
        for k, val in v.items():
            if k == 'sections' and isinstance(val, list):
                done = [x for x in whole(k, val) if isinstance(x, dict) and x.get('heading')]
                if done:
                    parts['sections'] = done
                    saved.append(f"section{'s' if len(done) > 1 else ''} " + ', '.join(f"'{str(x.get('heading'))[:60]}'" for x in done))
                for x in val:
                    if isinstance(x, dict) and not any(x is d for d in done):
                        redo.append(f"section '{str(x.get('heading') or '(no heading yet)')[:60]}' (cut off part-way: send it again, whole)")
            elif isinstance(val, list):
                keep = whole(k, val)
                if keep:
                    parts[k] = keep
                    saved.append(f'{k} ({len(keep)})')
                if cut.startswith(f'/{k}'):
                    redo.append(f'the rest of {k}')
            elif isinstance(val, str):
                if not val.strip():
                    continue
                if cut != f'/{k}':
                    parts[k] = val
                    if k == 'research_notes':
                        saved.append('research notes')
                elif k == 'research_notes':
                    parts[k] = val
                    saved.append(f'research notes up to "…{" ".join(val.split())[-160:]}"')
                    redo.append('the rest of the research notes, continuing from exactly that point (do not repeat what is saved)')
                else:
                    redo.append(f'{k} (cut off)')
            elif val is not None:
                parts[k] = val
        if parts:
            try:
                self._report_add(parts)
            except cd.DataError as err:
                secs = parts.pop('sections', None)
                if secs and parts:
                    self._report_add(parts)
                    saved = [x for x in saved if not x.startswith('section')]
                    redo.insert(0, 'the research notes (they come before any section), then the sections')
                else:
                    return (f'Your reply ran over the length limit. Nothing from it could be saved: {err} '
                            'Send the research notes first, in two or three calls if they are long, then the sections, two or three per call.')
        return ('Your reply ran over the length limit ({:,} tokens). '.format(self._out_cap or MAX_OUTPUT)
                + (f"Saved from it: {'; '.join(saved)}. " if saved else 'Nothing in it was complete enough to save. ')
                + (f"Send again: {'; '.join(redo)}. " if redo else '')
                + 'Then carry on. Keep each call to two or three sections, or one long chapter; the notes may come in several calls.')

    # ----- the loop of one question -------------------------------------------------------------------------------
    def _loop(self, chain, tier, today):
        dash = self.dashboard_provider()
        system = census_mod.relabel((self.system_text or SYSTEM).format(today=today),
                                    int(((dash or {}).get('census') or {}).get('year') or 2021))
        try:
            system = system + '\n\n' + registry.digest(registry.load(self.data_dir), (dash or {}).get('status'))
        except Exception as e:                           # noqa: BLE001
            print('registry digest not added:', repr(e))
        system = scope_note(dash) + system
        if self.web:
            system += WEB_NOTE
        if self.memory:
            system += MEMORY_NOTE.format(notes=self._short(self.user_notes, 4000) if (self.user_notes or '').strip() else '(none yet)')
        used = {'input': 0, 'output': 0, 'cache_read': 0, 'cost_usd': 0.0}
        self.last_cost = used
        pos, skipped, services = 0, [], []
        rewritten = None
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
                content = self._over_length(content)
                if content is None:
                    continue
            content = [b for b in content if not (b.get('type') == 'text' and not b.get('text'))] or \
                [{'type': 'text', 'text': '(No answer.)'}]
            self._log_web(content)
            if self.history and self.history[-1]['role'] == 'assistant' and self._paused:
                self.history[-1] = {'role': 'assistant', 'content': self.history[-1]['content'] + content}  # the paused turn, continued
            else:
                self.history.append({'role': 'assistant', 'content': content})
            self._paused = resp.get('stop_reason') == 'pause_turn'
            if self._paused:                      # a long web search: the service continues the same turn when it is sent back
                continue
            content = self.history[-1]['content']
            done = {'model': model, 'tier': tier, 'tokens': used, 'free': all(f for _, _, f in services),
                    'engine': ' then '.join(f'{n} ({m})' for n, m, _ in services), 'skipped': skipped}
            if resp.get('stop_reason') != 'tool_use':
                text = '\n\n'.join(b.get('text', '') for b in content if b.get('type') == 'text').strip()
                if self._cut_text:
                    text = (self._cut_text + text).strip()
                if rewritten is None and NEGATIVE_OPENING.search(_first_sentence(text)):
                    rewritten = len(self.history) - 1     # led with what can't be done: one rewrite, answer first
                    self.history.append({'role': 'user', 'content': [{'type': 'text', 'text': REWRITE_NOTE}]})
                    continue
                if rewritten is not None and rewritten + 1 < len(self.history) and \
                        self.history[rewritten + 1].get('content') == [{'type': 'text', 'text': REWRITE_NOTE}]:
                    del self.history[rewritten:rewritten + 2]     # keep only the rewritten answer in the conversation
                return {'text': text or '(No answer.)', **done}
            for b in content:
                if b.get('type') == 'text' and b.get('text'):
                    self._log.append({'text': b['text']})
            self.history.append({'role': 'user', 'content': self._run_calls(content)})
        return {'text': 'I stopped after many steps without a final answer. Try a narrower question.', **done}

    def _over_length(self, content):
        """A reply that hit the length limit. Complete tool calls in it are run; a cut-off one is salvaged (report parts are
        saved) and the model is told what to send again; cut-off text is kept and continued. Returns the content to keep as
        the assistant's turn, or None when the exchange was recorded here."""
        texts = [b for b in content if b.get('type') == 'text' and b.get('text')]
        calls = [b for b in content if b.get('type') == 'tool_use']
        whole = [b for b in calls if b.get('_partial') is None]
        cut = [b for b in calls if b.get('_partial') is not None]
        notes = [self._salvage(b['name'], b['_partial']) for b in cut]
        if not calls:                                        # a written answer too long for one reply: continue it
            self._cut_text += '\n\n'.join(b['text'] for b in texts)       # continued from exactly where it stopped
            self.history.append({'role': 'assistant', 'content': texts or [{'type': 'text', 'text': '(cut off)'}]})
            self.history.append({'role': 'user', 'content': [{'type': 'text', 'text':
                ('Your reply ran over the length limit. Continue it from exactly where it stopped, without repeating what you '
                 'already wrote. If it is a report, write it in parts with report_add instead.') if texts else
                ('Your reply ran over the length limit before any answer or tool call was written. Reply now with the tool '
                 'call or the answer, and keep the reasoning before it short.')}]})
            self.emit({'type': 'step', 'text': 'The reply ran over the length limit; continuing it'})
            return None
        self.emit({'type': 'step', 'text': 'The reply ran over the length limit; keeping what was complete and continuing'})
        # the assistant turn is kept without its thinking (removing the last turn's thinking is allowed) and without the cut call
        self.history.append({'role': 'assistant', 'content': texts + whole or [{'type': 'text', 'text': '(cut off)'}]})
        results = self._run_calls(whole) if whole else []
        results.append({'type': 'text', 'text': ' '.join(notes) or 'Your reply ran over the length limit. Send the rest in smaller parts.'})
        for n in notes:
            self._log.append({'note': n})
        self.history.append({'role': 'user', 'content': results})
        return None

    def _log_web(self, content):
        """Web searches and pages read inside one reply (the service runs them itself): numbered like the other steps and
        kept in brief (titles, links, the passages quoted), so they survive when the conversation is condensed."""
        asked = {b.get('id'): b for b in content if b.get('type') == 'server_tool_use'}
        quoted = {}
        for b in content:
            for c in b.get('citations') or []:
                if isinstance(c, dict) and c.get('url') and c.get('cited_text'):
                    quoted.setdefault(c['url'], []).append(c['cited_text'])
        for b in content:
            kind = b.get('type')
            if kind not in ('web_search_tool_result', 'web_fetch_tool_result'):
                continue
            call = asked.get(b.get('tool_use_id')) or {}
            args = call.get('input') or {}
            body = b.get('content')
            if kind == 'web_search_tool_result':
                name = 'web_search'
                if isinstance(body, list):
                    out = f'Web search "{args.get("query", "")}": ' + ('; '.join(
                        f"{r.get('title', '')} ({r.get('url', '')}{', ' + r['page_age'] if r.get('page_age') else ''})"
                        for r in body if isinstance(r, dict)) or 'no results')
                else:
                    out = f'Web search "{args.get("query", "")}" failed: {(body or {}).get("error_code", "error")}'
                self.emit({'type': 'step', 'text': f'Searching the web: {args.get("query", "")}'[:120]})
            else:
                name = 'web_fetch'
                body = body if isinstance(body, dict) else {}
                doc = body.get('content') or {}
                src = doc.get('source') or {}
                url = body.get('url') or args.get('url', '')
                if body.get('type') == 'web_fetch_result':
                    text = src.get('data', '') if src.get('type') == 'text' else '(a PDF)'
                    out = f"Read {doc.get('title') or url} ({url}, read {str(body.get('retrieved_at', ''))[:10]}): " + \
                        self._short(' '.join(str(text).split()), 1500)
                else:
                    out = f"Could not read {url}: {body.get('error_code', 'error')}"
                self.emit({'type': 'step', 'text': f'Reading {url}'[:120]})
            if quoted:
                out += ' | Quoted: ' + ' / '.join(f'"{self._short(t, 200)}" ({u})' for u, ts in quoted.items() for t in ts[:3])[:3000]
                quoted = {}
            self._step_no += 1
            self._results[self._step_no] = out
            self._log.append({'step': self._step_no, 'name': name, 'args': args, 'result': out})
            if isinstance(getattr(self, 'provenance', None), list):          # the report appendix lists it with the queries
                self.provenance.append({'what': 'Web search' if name == 'web_search' else 'Web page',
                                        'detail': str(args.get('query') or args.get('url') or '')[:600],
                                        'result': self._short(out, 300), 'at': _calgary_now().strftime('%H:%M')})

    def _run_calls(self, content):
        """Run the tool calls of one assistant turn and return their results (tool_result blocks, in order)."""
        results = []
        for block in content:
            if block.get('type') != 'tool_use':
                continue
            name, args = block['name'], block.get('input') or {}
            self._step_no += 1
            n = self._step_no
            self.emit({'type': 'step', 'text': STEP_TEXT.get(name, lambda a: name)(args)})
            key = name + json.dumps(args, sort_keys=True, default=str) if name in GATHER_TOOLS else None
            try:
                hit = self._cache.get(key) if key else None
                if hit:
                    out = f'[Same request as step {hit[0]}; its result again] ' + hit[1]
                else:
                    result = self.run_tool(name, args)
                    try:
                        self._record(name, args, result)
                    except Exception:             # noqa: BLE001 - the appendix must never stop an answer
                        pass
                    out = result if isinstance(result, str) else json.dumps(result, default=str)
                    cap = 30000 if name in ('get_dashboard', 'get_ward5_dashboard') else MAX_RESULT_CHARS
                    if len(out) > cap:
                        out = json.dumps(_fit(result, cap), default=str)
                        if len(out) > cap:
                            out = out[:cap] + '... [cut: ask for fewer rows or group the data]'
                    if key:
                        self._cache[key] = (n, out)
                self._results[n] = out
                results.append({'type': 'tool_result', 'tool_use_id': block['id'], 'content': f'[step {n}] ' + out + self._nudge()})
                self._log.append({'step': n, 'name': name, 'args': args, 'result': out})
            except Exception as e_:               # noqa: BLE001 - any tool failure goes back to the model to fix
                results.append({'type': 'tool_result', 'tool_use_id': block['id'], 'content': f'Error: {e_}',
                                'is_error': True})
                self._log.append({'step': n, 'name': name, 'args': args, 'result': f'Error: {e_}', 'error': True})
        return results

    def _nudge(self):
        """Once per stretch, as the conversation nears the point where it is condensed: a reminder to save the figures."""
        if self._nudged or self._size() < (self._budget_now or CONTEXT_CHARS['other']) * 0.6:
            return ''
        self._nudged = True
        return (' [The conversation is getting long and will soon be condensed; every full result stays available with '
                'recall_result. Before requesting more data, save the figures and findings you rely on so far with '
                'report_add (key_figures, research_notes) if you have not already.]')
