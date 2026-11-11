# Module inventory

Every screen and data file the site registers for its assistants (data/registry.json of the production build, 53 entries), plus the pages built outside the app.

| Key | Screen | Registered | Data files | What it holds |
|---|---|---|---|---|
| dashboard | dashboard | yes | none | Every ward and community at a glance: residents, 311 requests, open issues, traffic incidents, new homes, crime and rents, on a map. |
| compare | compare | yes | none | All 14 wards side by side on every measure, with each ward's place on each measure. |
| issues | issues | yes | none | Every open 311 request: how old, what kind, by community. |
| changes | changes | yes | none | The Growth vs amenities method before and after its revision of 5 November 2026. |
| growth | growth | yes | srg_raw.json | How near homes are to playgrounds, parks, transit stops, libraries and recreation centres, how crowded they are, the forecast to 2030, assets, the population build-up, ma |
| families | families | yes | none | Licensed child care spaces and inspections, schools and enrolment by community. |
| infra | infra | yes | infra.json | Water main breaks, the age of the water network, the age and material of every public sewer connection (368,000 sanitary service lines) by community with the share past t |
| catalog | catalog | yes | catalog.json | Every dataset and data file the City of Calgary publishes (400+, with category, description, last update and every column, marked when a page of the site already uses it) |
| safety | safety | yes | safety_rank.json | Every city of 10,000 or more by Statistics Canada's Crime Severity Index, with Calgary's rank. |
| cameras | cameras | yes | none | The City's traffic cameras, shown live on the page. |
| help | help | yes | help.json | Shelters, meals, day spaces, health care and help lines, nearest first. |
| budget | budget | yes | budget.json, tax.json | The 2026 budget by department and service, revenue, and property tax by ward and community. |
| fedbudget | fedbudget | yes | budget2026.json | Headline numbers, every measure, province by province, Calgary and Alberta, tax changes and the fiscal tables. |
| invest | invest | yes | business.json | Every business in Calgary by kind and community, where each kind is underserved, growth. |
| capmkt | capmkt | yes | capmkt.json, companies.json | Calgary's public companies, their industries and value, and Calgary's place in Canada's stock markets. |
| elections | elections | yes | elections.json | Seats and leaders at every level, constituencies, every race and candidate, the latest official results. |
| election_analytics | elections | yes | none | The micro-level picture of an area or seat for the 2027 elections: Census by community, every voting location and poll. |
| accountability | elections | yes | accountability.json, commitments.json | Eight pages in the Election Data Centre: Manifesto Tracker (party and candidate platforms), Promise vs Reality, Representative Performance, Legislative & Voting Records ( |
| citynews | citynews | yes | none | The day's Calgary stories, each with its sources. |
| game | game | yes | none | A free learning game on the real map of Calgary, built from City open data: four residents and 18 missions that teach City services, from transit fares and Fair Entry to  |
| livemap | livemap | yes | none | Calgary News stories placed where they happened, live traffic incidents, the newest 311 requests and crimes reported to police per 1,000 residents by community, on one ma |
| visit | visit | yes | visit.json | What to see, where to stay, the weather by month and over the years, what is on each month, getting around. |
| methods | methods | yes | none | Every formula, filter and threshold, with its datasets and how to check it yourself. |
| sources | sources | yes | none | Every dataset the site reads, its publisher, when it was last updated, and the refresh schedule. |
| ask | ask | yes | none | Ask anything about the data in plain words. |
| scientist | scientist | yes | none | Full analysis reports on the selected area. |
| videos | videos | yes | none | Short narrated videos on what the data shows. |
| news | news | yes | none | A newsletter for the selected ward, ready to send. |
| settings | settings | yes | none | How residents are counted, the theme and the Data Genie service. |
| files | files | yes | none | The tables and reports Data Genie has saved. |
| data:access_base | data file | yes | access_base.json | Data file access_base.json with version, built_at, counted, growth_year, recent_from_year, rules, kinds, homes. |
| data:analyst_topics | data file | yes | analyst_topics.json | The ready-made analysis topics of the Data Scientist tab. |
| data:budget_2027 | data file | yes | budget_2027.json | The City's proposed 2027-2030 budget as presented on Nov 10, 2026 (not yet approved): the monthly cost for a typical home, the property tax path, 2027 water rates, invest |
| data:budget_revenue | data file | yes | budget_revenue.json | The City of Calgary budget: revenue lines by year, taken from the budget document by hand. |
| data:business_people | data file | yes | business_people.json | Residents by community under each way of counting, used by Invest in Calgary. |
| data:civic_projects | data file | yes | civic_projects.json | City facilities and pathways being built or planned that the Government of Alberta's Major Projects inventory does not list (it covers $5 million and up, and misses some  |
| data:explore_ctrain | data file | yes | explore_ctrain.json | CTrain stations from OpenStreetMap (one Overpass query, saved), used by the Explore Calgary trip planner to show the nearest station to each neighbourhood. Not a ridershi |
| data:live | data file | yes | live.json | The live connections the site checks (City open data, the City feeds, news) and when each last answered. |
| data:majorprojects | data file | yes | majorprojects.json | Data file majorprojects.json (source: https://majorprojects.alberta.ca/). |
| data:pay_study | data file | yes | pay_study.json | The published study What Calgarians pay: the proposed 2027-2030 budget for a typical Calgary home and City tax and utility bills in eight Canadian cities, with every tabl |
| data:planned | data file | yes | planned.json | Data file planned.json with version, built_at, last_year, zones, parks, parks_by_comm, facilities, rules. |
| data:police_study | data file | yes | police_study.json | The published study of Calgary Police performance, resources and the 2027 to 2030 budget request, with every table, chart, method, limit and source. Read with get_dashboa |
| data:rentals_all | data file | yes | rentals_all.json | Rental apartment buildings across Calgary (units, move-in, value per unit) used by the Population build-up. |
| data:school_tax | data file | yes | school_tax.json | School tax and school funding (Government of Alberta): every municipality's education property tax requisition each year since 2020, students by school board and in Calga |
| data:service_life | data file | yes | service_life.json | Benchmark service lives of sewer pipes by material (low, typical, high years) with the published source of each figure (Saanich 2023, Sydney Water and Halcrow 2007, Stati |
| data:settings | data file | yes | settings.json | The ways of counting residents, the wards, the methods and the contact details the site uses. |
| data:tax_rates | data file | yes | tax_rates.json | The City's 2026 property tax rates by property class. |
| data:tourism | data file | yes | tourism.json | Tourism (Statistics Canada): international overnight visitors entering by air at Calgary and Canada's other big gateways by year, month and country, and airport passenger |
| data:tourism_research | data file | yes | tourism_research.json | Tourism research checked by hand: Tourism Calgary's 2025 figures, the airport, the stopover pilot, Banff, the Stampede, levies, rail, Indigenous tourism, what makes Calga |
| data:transit | data file | yes | transit.json | The Calgary Transit timetable: routes, trips and the dates it is valid for. |
| data:ward5_profile_2021 | data file | yes | ward5_profile_2021.json | The 2021 Census profile of Ward 5 (households, languages, income, commuting), by hand from Statistics Canada. |
| data:ward5_projects | data file | yes | ward5_projects.json | Major projects being built or planned in Ward 5 that the City's open data lists of facilities do not have yet. Each entry is checked against the owner's page or a news re |
| data:ward5_rentals | data file | yes | ward5_rentals.json | Rental apartment buildings in Ward 5 used by the Population build-up. |

Outside the app (built by web/seo_pages.py, web/news_pages.py, web/visit_pages.py, web/explore.py, web/tourism_page.py): wards/, communities/, news/, studies/ (4 studies with PDF, interactive report, workbooks, calculators), visit/ and visit/explore/, tourism-intelligence/, about/, 311/, crime/, growth/, budget/, bill/ (redirect), ask/, data-scientist/, reports/, the game (ui/game, ui/city-stories) and 3D map assets, video/ (Video Explainers).
