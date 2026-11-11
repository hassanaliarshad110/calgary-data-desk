# 1. Financial reconciliation

Part of the second-stage verification of the Budget Intelligence branch (`budget-intelligence`), written November 11, 2026. Nothing here was published, merged or deployed. Start with [README.md](README.md).

All amounts are in millions of dollars unless a line says otherwise. Every figure below is worked out by `evidence/tools/fin_audit.py` from four files: the business cases, the names crosswalk, and the City's two open datasets as downloaded on November 11, 2026 (copies in `evidence/financial/`, with their checksums in `sources-read.json`). No source figure is changed anywhere.

## The $21 billion headline and the $19.98 billion in the open data

| City open data `nnnm-9sfh`, fund = Capital | 2027 | 2028 | 2029 | 2030 | 2027 to 2030 | 2031 | 2032 | All years |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Approved in earlier budgets | 2,867.04 | 2,569.63 | 989.80 | 522.80 | **6,949.27** | 145.80 | 452.60 | 7,547.67 |
| Proposed (new) | 1,555.21 | 3,017.64 | 4,028.83 | 4,427.75 | **13,029.43** | 26.70 | 0.00 | 13,056.13 |
| Both | 4,422.25 | 5,587.27 | 5,018.63 | 4,950.55 | **19,978.70** | 172.50 | 452.60 | **20,603.80** |

- 2027 to 2030: $19.98 billion, which rounds to $20 billion.
- All years in the dataset (2027 to 2032): $20.60 billion, which rounds to $21 billion.
- The City's wording (its budget page and news release, read November 11): $21 billion of recommended capital over four years, of which $13 billion is new capital infrastructure. The pages do not say which rows the $21 billion covers.

So the arithmetic is settled (PASS) and the reason for the headline is not (UNVERIFIED): the only sum of published rows that gives 21 includes 2031 and 2032. The centre shows the open-data sums, shows the headline as the City's, and uses it in no calculation.

## 2028: $1,440 million or $2,570 million of capital already approved

Two City datasets hold "capital already approved" for 2027 onward. The older one (`fqax-i3nz`, the 2023 to 2026 budget; its rows were last updated 2026-01-14) and the newer one (`nnnm-9sfh`, the 2027 to 2030 budget; rows last updated 2026-11-10).

| Capital already approved | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | Six years |
|---|---:|---:|---:|---:|---:|---:|---:|
| Newer dataset (`nnnm-9sfh`) | 2,867.0 | 2,569.6 | 989.8 | 522.8 | 145.8 | 452.6 | 7,547.7 |
| Older dataset (`fqax-i3nz`) | 2,499.8 | 1,440.3 | 976.8 | 768.2 | 450.7 | 1,104.0 | 7,239.8 |
| Newer minus older | +367.3 | +1,129.3 | +13.0 | -245.4 | -304.9 | -651.4 | +307.8 |
| of which Green Line | +747.1 | +930.2 | -182.5 | -537.3 | -306.1 | -651.4 | 0.0 |
| of which everything else | -379.8 | +199.1 | +195.5 | +291.9 | +1.2 | 0.0 | +307.8 |

| Green Line | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | Six years |
|---|---:|---:|---:|---:|---:|---:|---:|
| Newer ("Green Line LRT - SE Project") | 1,222.1 | 1,460.2 | 517.5 | 223.9 | 144.6 | 452.6 | 4,020.9 |
| Older ("Green Line") | 475.0 | 530.0 | 700.0 | 761.2 | 450.7 | 1,104.0 | 4,020.9 |

The Green Line's six-year total is the same in both; the newer dataset puts $747.1 million more of it in 2027 and $930.2 million more in 2028, and less in every later year. For 2028 that is $930.2 million of the $1,129.3 million difference. The rest, by business unit (2028, newer minus older, differences of $5 million or more):

| Business unit, as each dataset names it | Newer | Older | Difference |
|---|---:|---:|---:|
| Green Line LRT - SE Project | 1,460.2 | 0.0 | +1,460.2 |
| Green Line | 0.0 | 530.0 | -530.0 |
| Public Spaces Delivery | 388.5 | 294.7 | +93.8 |
| Chief Housing Office | 68.2 | 23.2 | +45.0 |
| Calgary Transit | 114.2 | 81.0 | +33.2 |
| Real Estate & Development Services | 21.4 | 0.0 | +21.4 |
| Parks & Open Spaces | 0.0 | 20.7 | -20.7 |
| Calgary Fire | 7.0 | 0.0 | +7.0 |
| Civic Partners | 5.7 | 0.2 | +5.5 |
| Project Development | 12.1 | 7.1 | +5.0 |

That money was moved between years, and that the two datasets are ten months apart, is read from the figures; the City has not published a reconciliation (UNVERIFIED as to the reason). The centre uses the newer dataset for 2027 to 2030, shows both figures under Data checks, and now shows this unit-by-unit table there, worked out from the day's data.

## The six business units that do not match

Proposed (new) capital for 2027 to 2030, the 260 business cases against the open data's "Proposed" rows, business unit by business unit. 27 of 33 units match within $1 million in total and in every year. The six that do not:

| Business unit | | 2027 | 2028 | 2029 | 2030 | 2027 to 2030 |
|---|---|---:|---:|---:|---:|---:|
| **City & Regional Planning** | business cases | 1.2 | 7.6 | 7.7 | 7.8 | 24.2 |
| | open data | 0.0 | 7.6 | 7.6 | 7.8 | 23.0 |
| | difference | +1.2 | 0.0 | +0.1 | 0.0 | **+1.2** |
| **Downtown Strategy** | business cases | 3.0 | 14.6 | 16.9 | 9.4 | 43.9 |
| | open data | 0.0 | 4.1 | 5.2 | 3.1 | 12.4 |
| | difference | +3.0 | +10.5 | +11.7 | +6.3 | **+31.5** |
| **Mobility** | business cases | 118.2 | 231.0 | 320.0 | 289.7 | 958.9 |
| | open data | 113.3 | 220.8 | 306.7 | 274.1 | 914.9 |
| | difference | +4.9 | +10.2 | +13.3 | +15.6 | **+44.0** |
| **Project Development** | business cases | 47.8 | 254.5 | 178.5 | 133.9 | 614.6 |
| | open data | 47.9 | 247.1 | 164.8 | 123.7 | 583.5 |
| | difference | -0.1 | +7.4 | +13.7 | +10.2 | **+31.1** |
| **Public Spaces Delivery** | business cases | 70.0 | 284.4 | 364.2 | 516.6 | 1,235.2 |
| | open data | 88.2 | 346.9 | 467.0 | 726.6 | 1,628.7 |
| | difference | -18.2 | -62.5 | -102.8 | -210.0 | **-393.5** |
| **Recreation & Social Programs** | business cases | 9.1 | 69.6 | 75.4 | 182.2 | 336.3 |
| | open data | 0.5 | 35.6 | 11.7 | 4.6 | 52.4 |
| | difference | +8.6 | +34.0 | +63.7 | +177.6 | **+283.9** |

They net to -1.8 over the four years. All 33 units together differ by -1.16 / -1.37 / -1.30 / -0.88 in 2027 / 2028 / 2029 / 2030 (the open data rounds each line to $0.1 million).

What the differences equal:

| Business unit | Difference | Request or requests with the same amounts | How close |
|---|---:|---|---|
| Recreation & Social Programs | +283.9 | 82. GamePLAN - Wave 1 Projects (283.8) | one request, every year; largest yearly gap $0.04 million |
| Mobility | +44.0 | 57. Major Road Reconstruction (44.3) | one request, every year; largest yearly gap $0.14 million |
| Downtown Strategy | +31.5 | 219. Downtown Streetscape and Public Realm Program (31.4) | one request, every year; largest yearly gap $0.04 million |
| Project Development | +31.1 | 200. Build Back Better - Pathways & Repaving (14.6) + 201. Calgary Pathway Program (13.2) + 263. Local Area Investment Fund (3.7) | a combination of 3 requests (weaker evidence); largest yearly gap $0.22 million |
| City & Regional Planning | +1.2 | the 2027 amount of request 193, Mobility Network Gaps (1.165): the open data has nothing for this unit in 2027 | exact for 2027; the other years match |
| Public Spaces Delivery | -393.5 | the other five differences together (391.7) | leaves 1.8, the net of the six |

Reading: the open data appears to file these requests under Public Spaces Delivery, and the business cases under the unit that asks for them. Three of the matches are a single request that equals the difference in every year, which is strong; the Project Development match is a combination of three requests, which is weaker. The City has published no mapping, so the explanation is an inference (UNVERIFIED); the amounts themselves are checked (PASS). The screen's check now names the single-request matches, worked out from the day's data.

## New capital: $13.05 billion and its four purposes

| | $ thousands | $ millions |
|---|---:|---:|
| Sum of the 260 stated totals ("4-Year Capital Budget Consideration") | 13,051,480 | 13,051.5 |
| 2027 | 1,554,053 | 1,554.1 |
| 2028 | 3,016,271 | 3,016.3 |
| 2029 | 4,027,534 | 4,027.5 |
| 2030 | 4,426,874 | 4,426.9 |
| 2031 and later | 26,741 | 26.7 |
| Sum of the five year columns | 13,051,473 | 13,051.5 |
| Stated totals minus year columns (the City's rounding inside 77 requests) | 7 | |

| Purpose (the City's own percentage for each request, times the request's total) | $ millions | Share |
|---|---:|---:|
| Maintenance or replacement | 5,529.5 | 42.4% |
| Growth | 4,520.7 | 34.6% |
| Service enhancement | 2,644.0 | 20.3% |
| Transformative | 357.3 | 2.7% |
| All four | 13,051.5 | 100% |

116 requests have one purpose only; 144 are split by the City between two or more. The dollar amounts by purpose are a calculation and are labelled "Calculated" on the screen; the City publishes the percentages, not the dollars.

## Positions: 855 in 2027

| | 2027 | 2028 | 2029 | 2030 | Four years |
|---|---:|---:|---:|---:|---:|
| Full-time equivalents in the FTE rows of the 124 operating requests | 855 | 445 | 279 | 347 | 1,926 |

2027 by department, as the document prints the names: Operational Services 395; Community Services 287; Law, Legislative Services & Security 60; People, Innovation & Collaboration Services 43; Corporate Planning & Financial Services 32; Calgary Police Service 17; Planning & Development Services 11; Chief Operating Office 10. 50 of the 124 requests have a figure for 2027.

- Period: each column is what the requests add in that year. The columns are not running totals.
- Calculation: a plain sum of the cells; a dash counts as nothing; no request is counted twice.
- Limit: these are the positions in the requests' own rows. Request 104 (Calgary Police) shows 17 for 2027 and its text also refers to 275 officers and 191 civilian positions for the present level of service that are not in its row. So 855 is not a figure for the City's whole change in staff, and no City total was found to compare it with.

## One-time requests that are only partly in the proposed budget (found by this audit)

| Request | In the table | Full amount in the City's note |
|---|---:|---:|
| 14. Renew The City’s digital infrastructure supporting finance, supply chain, and human resour | 113.3 | 302.9 |
| 15. Risk Assessment Data, Tools and Management Plans | 1.6 | 2.6 |
| 124. Implement the cross-corporate strategies of the Safer Together plan to coordinate communit | 14.8 | 23.9 |
| 125. Safe & Resilient Homes and Communities | 2.8 | 4.1 |
| 175. Calgary Moves | 1.8 | 2.0 |
| 253. Downtown Office Conversion Program | 67.5 | 202.5 |
| 255. Industrial Development Incentive Program | 20.0 | 40.0 |
| 256. Overhead to Underground Power Program | 6.0 | 12.0 |
| 257. Three Phase Power Growth Program | 2.0 | 4.0 |
| 294. Customer to Cash program software licensing, implementation costs and sustainment support | 2.5 | 4.2 |
| 295. Zero-Based Review - Full Program | 1.1 | 8.4 |
| 306. Community Collaboration, Outreach, Engagement and Communications | 0.4 | 0.8 |
| 315. Risk Disclosure and Verification Standards | 0.4 | 0.7 |
| 316. Clean Energy Improvement Program (CEIP) | 0.0 | 2.1 |
| 317. Finance digital transformation support | 0.6 | 1.3 |
| 318. Leveraging Partnerships | 0.7 | 1.5 |
| 319. Sustainable Building Resources for Industry and Developers | 0.3 | 0.4 |
| **17 requests** | **235.8** | **613.4** |

The centre's one-time total ($385.6 million over four years) adds the tables. Where a note's own wording of the included amount differs from the table by $0.1 million (for example request 175: table 1.8, note 1.7) that is the City's rounding; nothing is adjusted.

## Formulas, source fields, units and rounding

| Figure | Formula | Source fields | Units | Rounding |
|---|---|---|---|---|
| A capital request's amount | as printed | `cap_k[0]` (row "4-Year Capital Budget Consideration", column Total) | $ thousands in the file; divided by 1,000 to show $ millions | shown to one decimal ($ millions) or two ($ billions) |
| New capital, total | sum over the 260 capital requests | `cap_k[0]` | $ thousands, then / 1,000 or / 1,000,000 | sum first, round once |
| New capital by year | sum by column | `cap_k[1]` to `cap_k[4]` (2027 to 2030), `cap_k[5]` (2031 and later) | as above | as above |
| Capital by purpose | sum of amount x percentage / 100 | `cap_k[0]`, `split[0..3]` | as above | as above |
| One-time operating | sum of the cells | `one_time_m[0..3]` (row "One-time ($M)") | $ millions as printed (one decimal) | sum, then one decimal |
| Ongoing added in a year | sum of the cells for that year | `ongoing_m[i]` (row "Ongoing ($M)") | $ millions as printed | sum, then one decimal |
| One request's ongoing amount | sum of its four yearly cells, as the City does in its own notes | `ongoing_m[0..3]` | $ millions | one decimal |
| Positions | sum of the cells | `ftes[i]` (row "FTEs") | full-time equivalents, whole numbers | none needed |
| Full one-time amount | as stated in the City's note | `full_one_time_m` | $ millions | as printed |
| Open data, proposed capital | sum of rows where `fund` = Capital and `budget_status` = Proposed, by `year` | `budget_millions` (dataset `nnnm-9sfh`) | $ millions, one decimal per row | sum, then compare |
| Reconciliation by year | (sum of `cap_k[year]` / 1,000) minus open data; passes if within 0.5% | both | $ millions | none before comparing |
| Reconciliation by business unit | the same, grouped by business unit; listed if the difference is over $1 million | `bu` (document) matched to `bu` (open data) through `crosswalk.json` for five spellings | $ millions | none before comparing |
| Capital already approved | sum of rows where `fund` = Capital and `budget_status` = Approved | `budget_millions` (`nnnm-9sfh`); `budget` (`fqax-i3nz`) | $ millions | one decimal for display |
| Requests naming a ward | count of capital requests whose ward list includes the ward | `wards` | requests | none; dollars are never divided between wards |
| Share for all wards | sum of amounts where `wards` = all, divided by the total | `cap_k[0]`, `wards` | per cent | 91.8%, shown as "about 92%" |
| Tax simulator | assessed value x 2026 municipal residential rate x (1 + chosen %) | `tax.json` rate; the visitor's inputs | dollars | nearest dollar |

Rules that apply everywhere: a dash in a City table is kept as a dash and counts as nothing in a sum; nothing is rounded before it is added; names are kept exactly as printed and matched, never rewritten; where two City sources disagree both are shown; "ongoing" amounts are additions to the base budget in that year and no four-year cash cost is worked out.

## Findings

### 1.1a The open data adds to $19.98 billion of capital for 2027 to 2030

**PASS.** City open data nnnm-9sfh, fund = Capital, years 2027 to 2030: already approved $6,949.27 million + proposed $13,029.43 million = $19,978.70 million.

- Evidence: evidence/financial/financial-audit.json (headline_21_billion)
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.1b Why the City says $21 billion

**UNVERIFIED.** The City's budget page and news release give $21 billion over four years and do not say which rows that covers. The 2027 to 2030 rows round to $20 billion. With the same dataset's rows for 2031 ($172.5 million) and 2032 ($452.6 million) the sum is $20,603.80 million, which rounds to $21 billion. That is the only sum of published rows that gives 21; it is an inference, not the City's statement. The centre shows the open-data sums, shows the headline as the City states it, and uses the headline in no calculation.

- Evidence: evidence/financial/financial-audit.json; evidence/financial/sources-read.json (the two City pages, read 2026-11-11)
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json; then read the two City pages named in sources-read.json`

### 1.2a Capital already approved for 2028: $1,440 million in one City dataset, $2,570 million in the other

**PASS.** Older dataset fqax-i3nz (rows last updated 2026-01-14): $1,440.3 million. Newer dataset nnnm-9sfh (rows last updated 2026-11-10): $2,569.6 million. Difference $1,129.3 million. Of that, $930.2 million is the Green Line ($530.0 million under "Green Line" in the older, $1,460.2 million under "Green Line LRT - SE Project" in the newer). The other $199.1 million is spread over other business units (the largest: Public Spaces Delivery +93.8; Chief Housing Office +45.0; Calgary Transit +33.2; Real Estate & Development Services +21.4; Parks & Open Spaces -20.7; Calgary Fire +7.0; Civic Partners +5.5; Project Development +5.0; Parks and Open).

- Evidence: evidence/financial/financial-audit.json (approved_capital_two_datasets)
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.2b The Green Line total is the same in both datasets; only the years differ

**PASS.** 2027 to 2032 added up: $4,020.9 million in the newer dataset and $4,020.9 million in the older. By year (newer, then older): 2027 1,222.1 / 475.0, 2028 1,460.2 / 530.0, 2029 517.5 / 700.0, 2030 223.9 / 761.2, 2031 144.6 / 450.7, 2032 452.6 / 1,104.0. The newer dataset puts more of it in 2027 and 2028 and less afterwards.

- Evidence: evidence/financial/financial-audit.json
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.2c Why the two datasets differ

**UNVERIFIED.** The figures show money moved between years (same Green Line total) and newer approvals in other units; the two datasets were last updated ten months apart. The City has published no reconciliation, so the reason is an inference from the figures. Neither figure is changed anywhere; the centre shows both and now shows, unit by unit, where the largest yearly difference is.

- Evidence: evidence/financial/financial-audit.json; the "Data checks" section of the screen
- To repeat: Open the screen at ?view=budget-intelligence&bi=checks and open the check "Two City datasets give different figures for capital already approved"

### 1.2d On the live site today: the City budget screen shows both sets of figures in different places

**FAIL.** Not caused by this branch and not changed by it. The live City budget screen draws its by-year chart from the older dataset (capital for 2027 to 2032: 2,499.8, 1,440.3, 976.8, 768.2, 450.7, 1,104.0) and its 2027 to 2030 table from the newer one (2,867.0, 2,569.6, 989.8, 522.8). A reader who adds 2031 and 2032 from the chart to 2027 to 2030 from the table would count about $957.5 million of Green Line money twice. The new centre no longer points readers to those later years and says why. A fix to the existing screen would be a separate change needing its own approval.

- Evidence: evidence/financial/financial-audit.json; ui/budget.js on main (lines 72 to 73 and 127 to 129)
- To repeat: Open calgaryinsight.ca/?view=budget and compare the chart's 2028 capital bar with the table row "Capital, approved in earlier budgets"

### 1.3a Six business units where the business cases and the open data differ by more than $1 million

**PASS.** 33 business units compared for 2027 to 2030; 27 match within $1 million. The six: City & Regional Planning +1.2; Downtown Strategy +31.5; Mobility +44.0; Project Development +31.1; Public Spaces Delivery -393.5; Recreation & Social Programs +283.9 ($ millions, business cases minus open data). They net to -1.8. The full table with every year is in section 1 of this report.

- Evidence: evidence/financial/financial-audit.json (proposed_capital_by_business_unit)
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.3b What explains the six differences

**UNVERIFIED.** The differences equal specific requests, which is what would be seen if the open data files those requests under Public Spaces Delivery (the unit that builds) while the business cases list them under the unit that asks. Recreation & Social Programs: request 82 (GamePLAN - Wave 1 Projects), largest yearly gap $0.04 million; Downtown Strategy: request 219 (Downtown Streetscape and Public Realm Program), largest yearly gap $0.04 million; Mobility: request 57 (Major Road Reconstruction), largest yearly gap $0.14 million; Project Development: request 200 (Build Back Better - Pathways & Repaving) + request 201 (Calgary Pathway Program) + request 263 (Local Area Investment Fund), largest yearly gap $0.22 million. City & Regional Planning: the open data has nothing for 2027 and the cases have $1.165 million, the 2027 amount of request 193. The five differences add to $391.7 million against the $393.5 million shortfall under Public Spaces Delivery. The Project Development match is a combination of three requests, so it is weaker evidence. The City has published no mapping: this is an inference from matching amounts.

- Evidence: evidence/financial/financial-audit.json
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.4a New capital of $13.05 billion

**PASS.** The "4-Year Capital Budget Consideration" totals of the 260 capital requests add to 13,051,480 thousand dollars ($13.051 billion). Their year columns add to 13,051,473; the 7 thousand difference is the City's own rounding inside individual requests (183 requests exact, 41 one thousand over, 34 one thousand under, 1 two over, 1 two under). Against the open data's proposed capital: $13,056.13 million including 2031, a difference of -4.65 million (0.04%). The City's own statement is $13 billion.

- Evidence: evidence/financial/financial-audit.json (new_capital_13_05_billion); evidence/pdf/third-reading.json
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.4b The four purposes of new capital

**PASS.** Maintenance or replacement $5,529.5 million, growth $4,520.7 million, service enhancement $2,644.0 million, transformative $357.3 million; they add to $13,051.5 million. Each is a calculation (the screen labels it so): each request's total times the City's own percentage for the purpose. The four percentages of all 260 requests were read again with a third PDF reader: all agree and each set adds to 100. 116 requests have a single purpose; 144 are split by the City between purposes. The City publishes no dollar total by purpose to compare with.

- Evidence: evidence/financial/financial-audit.json; evidence/pdf/third-reading.json (purpose split)
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.5 124 operating and 260 capital requests

**PASS.** Counted three ways that agree: the dataset (124 and 260); the pages of the PDF that carry the heading of each layout (124 carry "Budget proposal rationale:", 260 carry "Capital Funding Consideration ($000s)", 0 carry both); and case by case, each request's own pages carry exactly one of the two headings. No request is ambiguous between the two kinds.

- Evidence: evidence/pdf/pdf-checks.json (classification)
- To repeat: `python3 evidence/tools/pdf_checks.py (see section 2 for the full command)`

### 1.6a 855 positions (full-time equivalents) in 2027

**PASS.** The sum of the 2027 cell of the row "FTEs" in the table "Proposed funding amount" over the 124 operating requests; 50 of them have a figure for 2027; a dash counts as nothing. By year: 2027 855, 2028 445, 2029 279, 2030 347 (1,926 over the four years). Each year's figure is what the requests add in that year; the years are not running totals. Largest in 2027: request 122 (100); request 220 (77); request 166 (70); request 124 (65); request 168 (50). All 124 FTE rows were read again with a third PDF reader and agree.

- Evidence: evidence/financial/financial-audit.json (positions); evidence/pdf/third-reading.json (ftes)
- To repeat: `python3 evidence/tools/fin_audit.py ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json evidence/financial/open-data-nnnm-9sfh-2026-11-11.json evidence/financial/open-data-fqax-i3nz-2026-11-11.json out.json`

### 1.6b Is 855 the City's whole change in staff for 2027?

**UNVERIFIED.** No City total was found in the sources read to compare it with. The figure covers only the FTE rows of the business cases. A request's text can describe other staff that are not in its row: request 104 (Calgary Police) shows 17 positions for 2027 in its row, and its description also refers to 275 officers and 191 civilian positions needed to keep the present level of service, which are not in the row. The screen, the method note and the assistants now say this.

- Evidence: ui/budget-intel/business-cases.json (request 104); page 224 of the City's document
- To repeat: Open the City's PDF at page 224

### 1.7 Formulas, source fields, units and rounding

**PASS.** Set out in the table in section 1 of this report (1-FINANCIAL-RECONCILIATION.md). Sums are made on unrounded figures and rounded once for display; thousands are divided by 1,000 to show millions; a dash in a City table is kept as a dash and counts as nothing in a sum.

- Evidence: 1-FINANCIAL-RECONCILIATION.md; methods.py (key budget_intelligence)
- To repeat: Read the table; each row names the fields to add

### 1.8 No source figure was changed

**PASS.** The dataset was written again by the reader after this audit's additions and compared with the version the owner examined: no existing value differs; one field was added to 17 requests (see 1.9). The open-data copies in the evidence folder are the City's rows as downloaded. Where two City sources disagree, both figures are shown.

- Evidence: evidence/code/dataset-before-after.json
- To repeat: `git diff 50acadc -- ui/budget-intel/business-cases.json, or the script in evidence/tools/dataset_diff.py`

### 1.9 Found by this audit: 17 one-time requests are only partly in the proposed budget

**PASS.** For 17 operating requests the City's note under the table states a larger full one-time amount than the table and says the rest may or will be considered in later budget adjustments: $235.8 million in the tables, $613.4 million stated as the full amounts. The centre's one-time total ($385.6 million over four years) adds the tables, which is what the proposed budget includes. Before this audit the screen only pointed to the City's note. The stated full amount is now kept for each of the 17, shown on the request, listed under Data checks, included in the export and known to the assistants. No existing figure changed.

- Evidence: evidence/pdf/pdf-checks.json; the check "Some one-time requests are only partly in the proposed budget" on the screen
- To repeat: Open ?view=budget-intelligence&bi=checks; or filter the explorer to "With a City note on the figures"

### 1.10 The City's twelve headline investments against the business cases

**UNVERIFIED.** Eight of the twelve amounts in the City's news release equal a business case, or the sum for a department, to the nearest million: pavement $420 million (request 55, 420.2), GamePLAN $284 million (82, 283.8), police $192 million (the four police capital requests, 191.9), fire stations $102 million (128, 102.4), mobility safety $94 million (154, 93.6), buses $300 million (178, 300.0), the 194 Avenue interchange $142 million (209, 141.9) and the Blue Line extension $71 million (180, 71.4). The other four (the two wastewater plants, the feedermains, arenas and pools, Village Square and Forest Lawn Civic Centre) are parts of larger programs whose tables do not itemize them, so they cannot be checked from the tables.

- Evidence: ui/budget-intel/business-cases.json; the news release named in evidence/financial/sources-read.json
- To repeat: Search the explorer for each title
