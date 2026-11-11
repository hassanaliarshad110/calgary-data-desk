# Calgary Insight: site-wide accuracy audit

Written 11 November 2026 for Hassan Ali. Every screen of calgaryinsight.ca was checked in three ways: (1) every published figure was checked against the other figures it should agree with (totals, shares, rates, changes); (2) the main figures were worked out again from the original sources (City of Calgary open data, the Calgary Police file, Statistics Canada, Elections Calgary/Alberta/Canada, the Government of Alberta, Environment Canada, TMX), with code written for this audit only, none of it taken from the website; (3) each screen's visible text was read against its data. **Nothing on the website was changed by this audit.**

## Result

| | Count |
|---|---:|
| Groups of figures recalculated from the original source and matching | 52 |
| Internal checks (totals, shares, rates, changes) passing | 96 (the others differ only by rounding of $0.002 million or $5, or are listed below) |
| Problems that change a figure a visitor reads (FAIL) | 6 |
| Smaller problems (wording, rounding, display) | 10 |
| Not verifiable from here (UNVERIFIED) | 6 |

The arithmetic itself is sound everywhere it was tested: no rate, share, total or percentage change was found computed wrongly. The problems are about **what is counted** (which requests, schools, child care centres, pipes) and **what the label says**.

## The 6 problems that change a figure

| # | Screen | What is wrong | Size | Evidence |
|---|---|---|---|---|
| 1 | Dashboard, Compare wards, Open issues | "311 requests" for Calgary leave out requests with no community attached. The method note says "Calgary = every request"; Compare wards says "every request in the city". | 453,536 shown; the City's data has 484,814 (31,278 or 6.5% left out). Open: 75,723 shown; 79,254 in the data (3,470 left out). Rates per 1,000 are not affected (they use residential communities by design). | City open data iahh-g8bj, counted 11 Nov 16:47 UTC (branch fetched-26) |
| 2 | Families and schools, Compare wards | Three province-wide home-education and online programs are counted as Calgary schools, placed at their office address. | The Gilbertine Academy 6,218 (WISDOM home schooling; Inglewood, Ward 9), Vista Virtual School 2,011 (online, mostly Grade 12; Manchester Industrial, Ward 9), BCS@Home 1,213 (02K). Calgary's 239,252 students include 9,442 of them (3.9%); Ward 9's 24,550 include 8,229 (a third). The school-enrolment growth cross-check barely moves (16.0% vs 16.2%). The school-tax study's "per student, all city schools" ($5,222) uses the same count. | Government of Alberta, school enrolment 2025/26 (fetched-27) |
| 3 | Families and schools, Compare wards, Dashboard | 37 licensed child care centres with Calgary street addresses are missing entirely (their address was not matched to a parcel). Not disclosed. | About 2,850 licensed spaces (~4%) missing from Calgary's 66,911, e.g. Big Steps Academy 240, Barlow Crossing ELCC 180, Wee Wild Ones Currie 170, Brightpath Sage Hill 130, University Child Care Centre 122. Ward figures and spaces per 100 children are low by the same amount where these centres are. | Government of Alberta, child care open data, Sep 2026 quarter (fetched-27) |
| 4 | Infrastructure condition | The figures labelled "Calgary" add up residential communities only. | Water main breaks, 12 months: 105 shown; 117 in the City's data. Water mains: 4,883 km shown; 5,415 km. Cast iron: 696 km; 743 km. 311 roads, sidewalks, lights and water are counted the same way. | City open data dpcu-jr23 (fetched-27); the site's own infra.json says 117 and 5,414.9 |
| 5 | Infrastructure condition | The City's water main break records currently end on 23 August 2026, but "the last 12 months" runs to 11 November. The 12 months compared against are complete. Not disclosed. | The −32% change is partly the reporting delay: September to November 2026 have no breaks recorded yet (the same months of 2025 had 30). | dpcu-jr23 by month (fetched-27) |
| 6 | City budget | Opened directly (a search result, a shared link, a bookmark), the screen shows "–" for operating and capital per resident and "(– people)". The figures appear only if the Dashboard was opened first. | Missing figure, not a wrong one. | Reproduced on the production build; script below |

## Smaller problems

| Screen | What |
|---|---|
| Property tax by ward | Community 09K has no ward, so the 14 wards add up to $1.9 million (0.05%) less than Calgary's levy. |
| Dashboard: development permits | 6,599 applications shown; 6,616 in the City data (17 with no community). "Cancelled" (1,127) groups several City statuses; the City's "Cancelled" alone is 1,085. |
| Dashboard: 2021 Census | 1,288,995 is residential communities only; the City's dataset adds to 1,289,690 (695 people in non-residential areas). Growth shown +24.0% would be +23.9%. |
| Dashboard: 311 chart and department table | Add to 453,549, the headline says 453,536: 13 requests carry a community code not on the list. |
| Families | The note reads "programs whose address is in **Ward 0**" for Calgary. |
| Families | Program names show "Children'**S**", "Child'**S**" (57 rows). |
| City budget | Green Line operating shows "-0.0". The water table's "Change" column is the change in the monthly bill, but sits next to the per-m³ rates (the water rate itself rises 14.3%, wastewater 27.5%). |
| Growth vs amenities | Transit stop within 400 m: 70% vs 97% is shown as −28 pts (the unrounded difference); a reader computes −27. |
| Compare wards | Amenity rates count items in residential communities; the counts shown beside them include parks and industrial areas, so the two cannot be divided by a reader. |
| Video Explainers | The population video (5 Nov) ends with "Calgary Data Desk, by Hassan Ali" in its narration and transcript: the old name and a personal credit, against the site's rule. |

## Recalculated from the original source and matching (PASS)

- **311** (City data): requests with a community, last 12 months and the 12 before; each month; each of the 313 communities; each of the 14 wards, using a community-to-ward map drawn independently from exact boundary areas (every community lands in the same ward as on the site); infrastructure reports (21 types); closed within 7 days, Calgary and every ward; share made on a phone.
- **Building permits** (City data): homes applied for and issued, both periods, Calgary and every ward.
- **Traffic incidents** (City data): Calgary and every ward (exact boundaries), and every day of two years.
- **Crime and disorder** (Calgary Police file): crimes, violent crimes, every category, every ward, every month, disorder events, both periods. The 4 crimes without a ward ("Ward NA") are disclosed.
- **Crime Severity Index** (Statistics Canada): Calgary's index, violent index and last year's; all 40 metropolitan areas; Canada; the index values of 134 of the 203 ranked cities found in the downloaded tables (all identical).
- **Elections**: Calgary 2025, every race (mayor, 14 councillors, 7 CBE and 7 CCSD trustee races) from the City's station-by-station data; Alberta 2023, all 26 Calgary divisions from Elections Alberta's Statement of Vote; Canada 2025, all 11 Calgary ridings from Elections Canada (votes, winners, electors, turnout). Video claims checked: 13 of 26 divisions under 5 points (counting the Calgary-Shaw by-election), about 350,000 electors who did not vote, 36% turnout and 591 votes in Calgary-Shaw, referendum gaps of 7 to 8 points and 82% vs 75%.
- **City budget**: every year, fund and department of 2023-2032 (fqax-i3nz) and 2027-2030 (nnnm-9sfh); 2026 changes (+1.3%, +36.6%); the household table ($369 to $422, $636 a year); the four-year tax path (+44%); water bill lines.
- **Property tax**: the bylaw's rates and levies (Bylaw 9M2026); the roll's residential and non-residential totals; the scaling factors (0.9762, 0.7846) reproduced from the roll and the bylaw; each community's tax = assessed x factor x rate.
- **Water main breaks**: every year since 1956.
- **Business licences**: 23,232 licences not being closed.
- **Capital markets**: Canada's 2,292 operating companies and C$6.13 trillion; Alberta's 250 and C$1.07 trillion (TMX September 2026 file).
- **Tourism**: 648 airport passenger figures for 9 airports (Statistics Canada 23-10-0253).
- **Weather**: the 1991-2020 monthly normals (highs, lows, snow, precipitation) from Environment Canada's daily records (two values differ by 0.1 °C from rounding).
- **Federal Budget 2026**: revenue, spending, deficit, debt charges, 5-year measures ($142.1B) from the budget's own tables; federal revenue and spending in every province, 2022-2025 (Statistics Canada 36-10-0450).

## Not verifiable here (UNVERIFIED)

| What | Why |
|---|---|
| The safest-cities **rank** (Calgary 85th of 203) | The index values are right; the rank depends on which police services are included (municipal services, RCMP contracts, regional services, the population floor). A simple independent rule from another Statistics Canada table places Calgary 79th of 199. Needs a decision on the rule, not a correction. |
| Tourism arrivals by port and country | Statistics Canada 24-10-0055 is too large to download in one piece here; the airport figures, from a different table, all match. |
| The 109 Calgary-headquartered companies | Each was checked by hand by the site; the market totals they come from match TMX. |
| Calgary News articles | Each article cites its own sources; not re-checked one by one. |
| The growth model and crowding figures | Internally consistent; they are a model, so there is no independent "true" figure to compare with. |
| Real phones | As before, only emulated devices were used. |

## How to repeat

The scripts are in this folder (`tools/`). The raw sources downloaded for the audit are on the branches `fetched-26`, `fetched-27` and `fetched-28` of the repository; the read-only jobs that fetched them are on `site-check-26`, `site-check-27` and `site-check-28`.

| Check | Command |
|---|---|
| Internal consistency of every data file | `python3 tools/consistency.py <site data folder> out.json` and `tools/consistency2.py` |
| Dashboard figures against the City data | `python3 tools/independent_city.py out` (needs data.calgary.ca), then `python3 tools/compare_city.py out result.json` |
| Police file | `python3 tools/police_check.py Community-Safety-Data-2020-Q3-2026.xlsx w0.json` |
| Crime Severity Index | `python3 tools/csi_check.py <statcan folder> safety_rank.json` |
| Municipal election | `python3 tools/elections_check.py gqvk-p23x.json elections.json` |
| City budget | `python3 tools/budget_check.py fqax-i3nz.json nnnm-9sfh.json budget.json` |
| City budget "–" per resident | `node tools/budget_pr.js` against a copy of the site |
