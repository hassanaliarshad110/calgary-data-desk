# Calgary Budget Intelligence & Accountability Centre: full technical report

> **Second-stage update, November 11, 2026.** This page was written for the first review. Since then the branch gained the assistants' wiring (the owner's instruction), the commercial opportunity was removed (the owner's instruction), and a second-stage audit added one data field and fixed several defects. Where this page and `FINAL-VERIFICATION/` differ, `FINAL-VERIFICATION/` is the current state.

Prepared 2026-11-11. Production at the time: `main` = `ff42583`, published by Website run 42977312843. Development branch: `budget-intelligence` (local, not pushed to `main`, not deployed).

Contents: A. Executive summary · B. Platform audit · C. Backup verification · D. Architecture · E. File change register · F. Data source register · G. Financial validation · H. Functional tests · I. Visual review · J. Known limitations · K. Security review · L. Commercial opportunity (removed from the plan) · M. Deployment and rollback · N. Recommendation

---

## A. Executive summary

A new screen, the **Budget Intelligence & Accountability Centre** (`?view=budget-intelligence`, under Money, beside City budget), was built on an isolated branch. It adds to the site; it replaces nothing.

- It reads the budget, tax, performance and infrastructure data the site already refreshes every morning, through the same five bridge calls the existing screens use.
- It adds one new dataset: **all 384 business cases** from the City's 792-page "2027–2030 budget request business cases", read from the City's PDF with each case's amounts, positions, categories and page number. Every figure row was read twice with two different PDF readers (1,152 rows, no differences).
- The 260 capital cases add up to **$13,051.5 million**, and reconcile with the City's separately published open data to within **0.07% in every year** (a $4.7 million difference on $13.0 billion).
- Every figure is labelled approved, actual, proposed, reported, City estimate, calculated or hypothetical. Where the City publishes nothing, the screen says "not published" and computes nothing. The most important example: **budget against actual spending cannot be compared from the City's open data**, and the screen says so instead of inventing a variance.
- Existing code touched: 91 added lines in 6 files and two edited lines (31 lines in 3 files at the first review; the rest wires the assistants to the new data, see `FINAL-VERIFICATION/4-CODE-AND-SECURITY.md`). The published script bundle is byte-identical to production once the new screen's block is removed. All 26 existing screens were opened on desktop and phone before and after: no script errors, no differences.
- The daily refresh is unchanged: workflows byte-identical, schedules and scheduled tasks the same (`DAILY-DATA-REFRESH-INTEGRITY-REPORT.md`).

Nothing is published. Publication waits for explicit approval.

---

## B. Platform audit (state before development)

### B.1 Architecture

| Layer | What it is |
|---|---|
| Hosting | Static site on GitHub Pages, custom domain calgaryinsight.ca |
| Build | `.github/workflows/site.yml` runs `python web/build_site.py _site --cache .site-cache --pyodide pyodide` daily and on every push to `main`. 83 steps, about 75 minutes. Each step falls back to yesterday's copy if a source does not answer |
| Code | 68 Python files (26,021 lines): 55 data and app modules at the root, 10 in `web/` (site build and search-engine pages), 3 in `tools/` |
| Interface | `ui/index.html` (27 screens as `<section id="view-…">`) and 23 scripts in `ui/`; the same interface is a Windows desktop app (`app.py`, pywebview). On the web, `web/web.js` stands in for the desktop bridge and reads `data/*.json` |
| Assistants | Data Genie and Data Scientist run the app's own Python in the browser (Pyodide); the AI key sits behind a Cloudflare Worker (`gateway/`). `registry.py` lists every screen and data file they can read |
| Published output | 847 files, 344 MB: the app, `data/` (one file per ward for each of four ways of counting residents, plus about 30 topic files), pages for search engines (wards, communities, news, studies, visit), videos, the game |
| Branches | 66. `main` is production. `news` (daily editions), `content-studio`/`studio-*` (videos), `social-media` (media for posts), probe branches (fetching through Actions) |

### B.2 Module inventory

All registered screens and data files: `MODULE-INVENTORY.md` (53 entries). The ones this work relates to:

| Module | Screen / file | State found |
|---|---|---|
| City budget | `view-budget`, `budget.py`, `ui/budget.js`, `data/budget.json` | Working. Operating and capital by department and business unit 2023–2026 (open budget `fqax-i3nz`); proposed 2027–2030 (`nnnm-9sfh`); revenue by source (hand-kept from the budget book); the proposed-budget card; property tax by ward; City projects by ward |
| Property tax by ward | `proptax.py`, `data/tax.json` | Working. Estimated from the assessment roll and Bylaw 9M2026 rates |
| What Calgarians pay | `studies/what-calgarians-pay/`, `/bill` calculator | Published study with workbook |
| Growth vs amenities | `view-growth`, `access.py`, `srg.py` | Working |
| Infrastructure condition | `view-infra`, `infra.py`, `data/infra.json` | Working: water main breaks, mains age, sewer lines, paving plan, 311 by community |
| Open 311 | `view-issues`, dashboard | Working |
| Election Data Centre / Civic Accountability | `view-elections`, `accountability.py`, `ui/accountability/commitments.json` | Working; includes the City's performance measures (`4y62-crsf`) |
| Data Genie, Data Scientist, Report Auditor | `agent.py`, `analyst.py`, `auditor.py`, `registry.py` | Working behind access codes |
| City Stories game, 3D map, Video Explainers, Calgary News, Visiting Calgary | `ui/game`, `ui/city-stories`, `view-videos`, `news` branch, `visit.py` | Working; untouched |
| Refresh systems | see the refresh integrity report | Working |

### B.3 Dataset inventory

`DATA-SOURCE-REGISTER.md`: 36 live sources with dataset ID, publisher, when the publisher last changed it and when it last answered; the 22 datasets of the dashboard build; every published data file with its size and the module that writes it; the hand-kept files.

### B.4 Financial data availability (the finding that shaped the build)

| Question | What the City publishes | Consequence |
|---|---|---|
| Operating budget by department and business unit | Yes: `fqax-i3nz`, 2023–2026, all "Approved" | Shown |
| Operating actual spending | **Not as open data.** Only in the annual and year-end reports (PDF) | No operating variance is possible |
| Capital by department and business unit | Yes: "Actual" for 2023 and 2024; "Approved" for 2025 onward | Shown, each year labelled |
| The same year as both budget and actual | **Never.** Each year and fund has one figure | Budget vs actual is an honest "not published" state |
| Proposed 2027–2030 | Yes: `nnnm-9sfh`, 1,392 rows, 53 business units, Approved-earlier and Proposed | Shown |
| Business cases | Yes, as a 792-page PDF only | Read into a dataset in this work |
| Revenue by source | Budget book only (PDF) | Already hand-kept (2023–2026) |
| Capital project budget, spending to date, completion | **Not published** | Listed as a gap |
| Performance measures | Yes: `4y62-crsf` (2026 Q2), earlier editions exist | Shown as published |

### B.5 Duplicates, conflicts and hard-coded figures found

1. **Two City datasets disagree on capital already approved for 2027–2030.** Open budget `fqax-i3nz`: $2,499.8M, $1,440.3M, $976.8M, $768.2M. 2027–2030 Budget `nnnm-9sfh` (Approved rows): $2,867.0M, $2,569.6M, $989.8M, $522.8M. The existing City budget screen shows the first set in its year-by-year chart and the second set in its proposed-budget breakdown. Neither is wrong on its face; the City has published no reconciliation. The centre uses the newer dataset for those years and shows both in Data checks. No existing screen was changed.
2. **The City's headline "$21 billion capital, 2027–2030"** (in the hand-kept `budget_2027.json`) is higher than the open data's sum for those four years, $19,978.7M (approved earlier $6,949.3M + proposed $13,029.4M). The headline is not used in any calculation.
3. **Operating 2026 → 2027 is not comparable**: $4,617.8M (2023–2026 data) against $6,433.6M (2027–2030 data), counted differently by the City. The existing screen already says so; the centre repeats it and draws no line between them.
4. **Hard-coded (hand-kept) figures**, all labelled with their source in the files themselves: revenue 2023–2026 (budget book page 24); the proposed budget's 15% and the household $369 → $422; the 2028–2030 tax path 10%, 7.7%, 6% (from news reports, labelled as reported, not confirmed by the City's page); 2026 tax rates.
5. **Department names differ between City sources** (see D.3).
6. No duplicate dataset reads were found that produce conflicting figures on screen.

### B.6 Data-quality notes on existing modules (observations only; nothing changed)

- **A defect in the live site's search box** (found during testing, reproduced on the unchanged production build, not fixed): typing before the search index has finished loading throws one script error; the search works from the next keystroke. Cause and proposed one-line fix: `FUNCTIONAL-TESTS.md` section 3a.
- Property tax by ward adds to 99.94% of the citywide levy; the remainder is property with no ward in the assessment data.
- Revenue lines add to the published totals within $1M of rounding.
- The Data Scientist screen picks its suggested topics at random on each load, so its text differs between two loads of the same build (this matters only for before/after comparison).

---

## C. Backup verification

Machine-readable: `backup-manifest.json`.

| Copy | Where | Verified |
|---|---|---|
| A. Actions artifact `backup-7`, run 42997418780 (all 66 branches as a bundle + the website as published), 1.03 GB, kept until 2027-02-09 | GitHub (durable) | The workflow's own restore step passed (clone of the bundle, file check) |
| B. Branch `backup/pre-budget-intelligence-20261111` at `ff42583` | GitHub (durable) | `git ls-remote`, before and after development |
| C. Independent bundle, sha256 `b11e9616…04e2cf`, 887 MB | development workspace (temporary) | `git bundle verify`: okay |
| D. Source archive of `main`, sha256 `3f31e034…0e22260` | development workspace (temporary) | all 330 files hash-identical to the commit |

**Restore test: passed.** Copy C was cloned into an empty folder: HEAD `ff42583`, tree `ba8f1f74…` identical to production, 330 files, clean. The offline build step run from the restored copy writes `site.20186e8330.js`, the same content-hash name as the bundle on the live site, so the restored code produces the production interface.

Baseline before development: every existing screen opened on a snapshot of the production data at desktop and phone size (52 checks): all shown, 0 script errors. Screenshots: `screenshots/baseline-desktop-all-screens.jpg`, `screenshots/baseline-mobile-all-screens.jpg`. There is no automated test suite on `main` (the `tests/` folder is kept outside the deployed tree), so this smoke test is the functional baseline.

Secrets were not copied anywhere; they remain in GitHub's settings and are referenced by name only.

---

## D. Architecture of the centre

### D.1 Principle

The centre is a reader. It composes, in the browser, data the site already builds, plus two static files of its own. It adds no build step, no scheduler, no API call from the build, and no change to any data module.

```
City open data ──(daily build, unchanged)──► data/budget.json, tax.json, infra.json,
                                              accountability.json, <method>/w0.json
                                                        │  existing bridge calls:
                                                        │  get_budget, get_property_tax, compare_wards,
                                                        │  get_accountability, get_infra
City PDF (792 pages) ──(by hand: tools/budget_intel_extract.py)──► ui/budget-intel/business-cases.json
hand-kept ───────────────────────────────────────────────────────► ui/budget-intel/crosswalk.json
                                                        ▼
                                  ui/budget-intel.js  (window.renderBudgetIntel)
                                  11 sections · in-browser validation engine
```

`ui/budget-intel.js` is self-contained (one closure). It hooks into navigation by wrapping `window.show`, so `ui/app.js` and every other existing script are unchanged. The Data checks section recomputes its checks in the visitor's browser from that morning's data, so a change in the City's open data shows up as a failed reconciliation without anyone re-running anything.

### D.2 Sections

| Section | Built from | Status labels used |
|---|---|---|
| Overview | budget.json, business cases, tax.json, ward outlines | approved, proposed, City estimate, calculated |
| Operating | budget.json (2023–2026 approved; 2027–2030 proposed), operating cases | approved, proposed, calculated |
| Capital | budget.json, capital cases | actual, approved, proposed, City estimate |
| Revenue and tax | budget.json revenue and plan, tax.json | budget book, proposed, reported (news), calculated |
| Budget vs actual | budget.json | every cell labelled; "not published" where empty |
| Business cases | business-cases.json, crosswalk.json | proposed |
| Capital projects | capital cases of kind Project; stage of every capital case | proposed; gaps listed |
| Performance | accountability.json (`4y62-crsf`), the measure named in each operating case | reported by the City, proposed |
| Tax simulator | tax.json (2026 rate and levy), plan | hypothetical, with formula and what is left out |
| Connected data | capital cases by the City's service area, infra.json | proposed, City figure, counted, calculated |
| Data checks | all of the above | pass, to know, check, missing |

### D.3 Shared identifiers and how records are joined

| Entity | Identifier | Source | Notes |
|---|---|---|---|
| Financial period | calendar year `YYYY`; capital also has "2031 and later" | all | Never mixed across datasets without a label |
| Dataset | Socrata 4x4 ID (`fqax-i3nz`, `nnnm-9sfh`, `4bsw-nn7w`, `4y62-crsf`) | data.calgary.ca | Shown with every figure |
| Budget department | the 9 `budget_department` names | `nnnm-9sfh` | "Corporate Services" contains 5 departments |
| Department | the 13 `department` names | `nnnm-9sfh` | The document uses the same names except three: "Calgary Police Services" (extra s), "Law, Legislative Services, & Security" (extra comma), and "People, Innovation & Collaboration Services", which the open data calls "People & Corporate Services". The last is **an inference**, made because all five business units match; it is recorded as such |
| Business unit | the 53 `bu` names | `nnnm-9sfh` | 45 names appear in the document; 5 are spelling variants matched by hand; 1 ("Chief Operating Officer") cannot be matched and is left unmatched |
| Business case | the City's number, 1–384 | the document | Stable within this edition of the document only |
| Capital Budget ID | e.g. `P258_000` | the document | **Not unique**: 247 distinct IDs across 260 cases; 16 IDs are shared (one by 8 cases). It appears in no open dataset, so it cannot join a request to delivery |
| Council priority | 6 names | the document's contents; each capital case repeats it | Checked: every capital case's stated priority equals its section of the contents |
| Major service area | 15 names (capital cases only) | the document | Used for topic links to other screens |
| Ward | 1–14, or "all wards" | capital cases only | 226 of 260 capital cases are all-wards ($11,980M of $13,051M). 34 name wards; 19 name exactly one |
| Community | the City's 3-letter code | used across the site | **No business case carries a community.** Nothing is allocated to communities |
| Capital project (in delivery) | none shared between City sources | | Gap, stated on screen |
| Infrastructure asset | none shared | | Infrastructure figures are citywide or by community and are shown beside the budget, not joined to it |

Rules enforced in code: a request that names several wards is counted in each and its dollars are never divided; nothing citywide is divided by residents, wards or communities; 311 figures are always described as residents' reports; where two sources disagree both are shown.

### D.4 The business-case dataset

`ui/budget-intel/business-cases.json` (235 KB; 32 KB compressed): `source` (title, publisher, URL, pages, sha256, date the City last changed the file, date read), `status`, `units`, `themes`, `counts`, `totals`, and `cases`. Names are kept exactly as printed. A dash in the City's tables is stored as `null` and shown as a dash.

Each case: `n`, `title`, `theme`, `page`, `pages`, `type`, `dept`, `bu`, `rationale`; operating cases add `one_time_m`, `ongoing_m`, `ftes` (four years each), `footnotes`, `metric`, `plan`, `risk`; capital cases add `cap_k` (total, four years, 2031 and later), `needs_k`, `budget_id`, `kind`, `wards`, `stage`, `new`, `funding`, `service_area`, `priority`, `corp_risk`, `op_risk`, `split`, `required`.

Requested, recommended, approved: the City's document prints **one** set of amounts per case, the amounts in the proposed budget. Its opening page says a description may cover more than is funded. Where the full request is larger, the City says so in a note under the table (20 operating cases carry such notes; for example case 14 states a full request of $302.9 million of which the budget includes $113.3 million). The dataset flags those cases and sends the reader to the page; it does not restate the notes. Nothing is approved until Council votes.

**What is deliberately not in the dataset:** the City's written descriptions, benefits and risk statements. They are the City's prose, they run to hundreds of pages, and re-publishing the City's prose is a copyright question the owner should decide. Every case links to its exact page in the City's PDF instead. See J.2.

### D.5 Preparing the three flagship investigations (architecture only; no conclusions are published)

| Investigation | What the centre now holds | What is still missing |
|---|---|---|
| Infrastructure maintenance | The City's own split of every capital request: $5,529.5M maintenance or replacement, $4,520.7M growth, $2,644.0M service enhancement, $357.3M transformative. The "10-Year Capital Infrastructure Needs" row of every request. Condition figures already on the site | Asset-level condition and a published maintenance backlog by asset class; how the needs row relates to the amounts proposed |
| Growth vs amenities | Growth share of capital by service area; the existing access model and the growth forecast | Location: 92% of proposed capital dollars are "all wards" |
| What Calgarians receive for their taxes | Operating by business unit, the performance measures, the household bill study | Actual spending; service outputs per dollar |

---

## E. File change register

Counts are against `main` at `ff42583`.

### Existing files changed (at the first review: 3 files, 31 lines added, 0 removed; now 6 files, 91 lines added, 2 edited: see `CHANGE-SUMMARY.md`)

| File | Change | Why |
|---|---|---|
| `ui/index.html` | +18 lines: one `<link>` to the new stylesheet; one tab under Money; one empty `<section id="view-budget-intelligence">`; one `<script>` tag | The screen has to exist in the page |
| `registry.py` | +9 lines: one entry in `PAGES` | So Data Genie and the Data Scientist can read the business cases (`read_source key=budget-intelligence`) |
| `web/search_index.py` | +4 lines: one entry in `SCREENS` | So site search finds the screen and four of its sections |

### New files

| File | Size | Purpose |
|---|---|---|
| `ui/budget-intel.js` | 96 KB (28 KB compressed) | The screen: 11 sections and the validation engine |
| `ui/budget-intel.css` | 21 KB | Styles, all scoped to `.bi`, on the site's own colour tokens (light and dark) |
| `ui/budget-intel/business-cases.json` | 235 KB | The 384 business cases |
| `ui/budget-intel/crosswalk.json` | 6 KB | Name matches and topic links |
| `tools/budget_intel_extract.py` | 13 KB | Reads the City's PDF into the dataset; stops without writing if any case cannot be read in full |
| `tools/budget_intel_check.py` | 12 KB | The same checks as the screen, from the command line, with a non-zero exit on failure |
| `docs/calgary-budget-intelligence/*` | | This review package |

### Not changed

Every workflow, `web/build_site.py`, every data module, `data/`, `ui/app.js`, `ui/budget.js`, `ui/styles.css` and all other existing scripts and styles, `web/web.js`, `gateway/`, the studies, the game, the videos.

### Calculations

No existing calculation was modified. New calculations (all shown with formula and inputs on the Data checks screen or beside the figure): sums of business cases by year, department, service area, stage and kind; capital by purpose (amount × the City's percentage); reconciliations; ward shares of the municipal levy; the simulator.

### Dependencies

None added and none removed. The screen uses Leaflet and Chart.js, which the site already ships.

### Design

No existing screen was restyled. The new screen follows the reference layout that was supplied (a rail of sections, a row of figures, a map with layers and a legend, side panels, a bottom row of ranked bars and alerts), using the site's own fonts and colours so it reads as part of Calgary Insight in both themes.

---

## F. Data source register

`DATA-SOURCE-REGISTER.md`. New sources: the City's business-case PDF (sha256 `b4deb3927d24afb142426127662c8be76751b6a041d6bb85a3358869da85c3d0`, 792 pages, last changed by the City 2026-11-09, read 2026-11-11) and the hand-kept crosswalk. No existing source was replaced.

---

## G. Financial validation report

Machine-readable: `validation-report.json` (from `tools/budget_intel_check.py`: 15 pass, 5 notes, 1 gap, 0 failures; the fifth note, added by the second-stage audit, lists the 17 one-time requests that are only partly in the proposed budget). The same checks run in the browser on the Data checks section.

### G.1 Extraction of the business cases

| Check | Result |
|---|---|
| Cases in the City's contents (pages 2–10) | 384, numbered 1 to 384 with no gap; 6 sections |
| Title at the top of each case's page equals its title in the contents | 384 of 384 |
| Printed page number equals the PDF's own page number (so links open the right page) | 384 of 384 |
| Layout recognised | 124 operating, 260 capital, 0 unknown |
| Each capital case's stated Council priority equals its section of the contents | 260 of 260 |
| Each capital total equals the sum of its years (within $3,000 of rounding) | 260 of 260 |
| Each capital case's four purposes add to 100% | 260 of 260 |
| **Second, independent reading** of every figure row with a different PDF reader (pypdf against pdftotext): 520 capital rows, 372 operating rows, 260 purpose splits | **1,152 of 1,152 agree** |
| Visual check of two rendered pages against the dataset (case 14, page 35; case 28, page 66) | Every figure, name and category matches |
| Negative amounts | none |
| Extraction problems reported by the tool | 0 |

### G.2 Totals

| | 2027 | 2028 | 2029 | 2030 | 2031 and later | Total |
|---|---|---|---|---|---|---|
| Capital, 260 cases ($000s) | 1,554,053 | 3,016,271 | 4,027,534 | 4,426,874 | 26,741 | 13,051,480 (stated totals); 13,051,473 (sum of years) |
| Operating one-time, 124 cases ($M) | 78.6 | 213.8 | 52.1 | 41.1 | | 385.6 |
| Operating ongoing additions ($M) | 276.1 | 168.0 | 88.6 | 62.9 | | shown by year |
| Positions (FTEs) | 855 | 445 | 279 | 347 | | 1,926 when added |

### G.3 Reconciliation with the City's open data

| Proposed capital ($M) | 2027 | 2028 | 2029 | 2030 | 2027–2030 |
|---|---|---|---|---|---|
| Sum of the 260 business cases | 1,554.1 | 3,016.3 | 4,027.5 | 4,426.9 | 13,024.7 |
| Open data `nnnm-9sfh`, Capital, Proposed | 1,555.2 | 3,017.6 | 4,028.8 | 4,427.8 | 13,029.4 |
| Difference | −1.2 | −1.4 | −1.3 | −0.9 | −4.7 (0.04%) |

Largest yearly difference 0.07%. The cause of the remaining $4.7M is not identified in either source (the open data is rounded to $0.1M per row). The case with money in "2031 and later" (case 28, $26.7M) matches the single Proposed row the open data carries for 2031.

By business unit: 27 of 33 match within $1M. Six differ (cases minus open data, $M): Public Spaces Delivery −393.5, Recreation & Social Programs +283.9, Mobility +44.0, Downtown Strategy +31.5, Project Development +31.1, City & Regional Planning +1.2. They net to −1.8, which suggests the two sources file some of the same projects under different business units. That is an inference from the numbers, labelled as such on screen.

Five of the City's own headline investments match a single business case to the rounded million: pavement ($420M; case 55, $420.196M), buses for RouteAhead ($300M; case 178, $300.000M), GamePLAN ($284M; case 82, $283.845M), the 194 Avenue and Macleod Trail interchange ($142M; case 209, $141.858M), the Blue Line extension ($71M; case 180, $71.361M).

### G.4 Existing data re-checked

| Check | Result |
|---|---|
| Open budget: departments add to each year's total, 2023–2032, both funds | pass |
| Revenue sources add to the published totals, 2023–2026 | pass (within $1M) |
| Property tax by ward adds to the citywide levy | pass (99.94%) |
| Capital already approved for 2027–2030, two City datasets | **differ** (B.5 item 1); both shown, neither changed |
| City headline against open data | **differ** (B.5 item 2); shown |
| Budget against actual | **cannot be done** (B.4) |
| Operating cases against a published total | **no total is published**; stated |

### G.5 Reproducibility

Every check carries its formula, inputs, source and limits (on screen and in the JSON). To repeat: `python tools/budget_intel_extract.py <the City's PDF>` then `python tools/budget_intel_check.py --data <a copy of the site's data folder>`.

How "ongoing" is treated: the City's yearly ongoing figures are additions to the base budget (its own notes add them to state a request's ongoing amount, for example on cases 124 and 293, and the positions follow the same pattern). The centre adds them the same way when it gives one ongoing amount for a request. It does not compute a four-year cash cost, because the document does not state one.

---

## H. Functional test report

Details: `FUNCTIONAL-TESTS.md`.

| Test | Before | After |
|---|---|---|
| Every existing screen opens, desktop 1440×900 and phone (iPhone 13), on the production data snapshot | 52 of 52 shown, 0 script errors | 52 of 52 shown, 0 script errors, same content |
| The new screen opens on both | n/a | shown, 0 errors |
| Each of the 11 sections renders | n/a | 11 of 11, 0 errors |
| Failure handling: one source hidden at a time (budget, tax, business cases, crosswalk, infrastructure and performance, ward file) | n/a | 0 script errors in every case; each affected section states what is missing; no "NaN" or "undefined" text |
| Offline build step | main: bundle `site.20186e8330.js` (equals production) | 233 of 235 files identical; differences as listed in E |
| Registry | 43 entries | the same 43 unchanged + 2 |
| The two changed build steps (search index, registry) run offline on the production data snapshot | reproduce production's files | the same rows and entries, plus 5 search rows and 2 registry entries; none removed or changed |
| 40 scripted interaction tests of the new screen (filters, search, sort, paging, export, map layers, links, simulator arithmetic, site search, phone layout) | n/a | 40 pass. One script error seen during them comes from a defect that already exists in the live site's search box (`FUNCTIONAL-TESTS.md` 3a) |
| Python compiles | pass | pass |
| Validation tool | n/a | 15 pass, 4 notes, 1 gap, 0 failures |

Not tested: the Windows desktop app (the bridge methods the screen uses exist there with the same shapes, but the app was not run); the full network build on the development branch (it publishes); real phones and assistive technology (emulation only).

---

## I. Visual review

`screenshots/`: every screen before and after (four contact sheets); the centre's overview in dark and light, capital, data checks, the business-case explorer on desktop and phone, the overview on a phone. The preview page shared with this report shows the same.

What was looked at and fixed during review: a case's figures table overflowing into the facts column (fixed); the explorer scrolling sideways on a phone (rebuilt as a list that reflows); figure labels squeezed by their status label on narrow screens (label now wraps); double border in the light theme (fixed).

Accessibility: every status is text, not colour alone; the map has a table alternative; charts carry text labels and the same numbers appear in tables; filters are native controls with labels; results count is announced to screen readers; focus styles are the site's own. Known gaps: the section rail is reached by Tab, not arrow keys; the two bar charts have no table directly beside them (their numbers are in the Budget vs actual table).

---

## J. Known limitations

1. **The business cases are a snapshot** of a document the City last changed on 2026-11-09. After Council's decisions the City may publish a new version; the reconciliation checks will then fail visibly, which is the cue to re-read it by hand.
2. **Descriptions, benefits and risks are linked, not copied** (D.4). This is a choice for the owner: (a) keep links only, (b) add them after confirming the City's terms allow republication, or (c) add short neutral summaries written and checked case by case.
3. **No budget-versus-actual comparison**, because the City does not publish the pairs as open data.
4. **Operating requests cannot be reconciled to a published total.**
5. **No four-year cash cost for ongoing operating requests.**
6. **Ward detail is thin**: 34 of 260 capital cases name wards. The map's default layer is therefore property tax levied, with capital requests as one optional layer.
7. **One department match is an inference** (People, Innovation & Collaboration Services ↔ People & Corporate Services).
8. **Six business units differ** between the document and the open data (G.3).
9. **The existing City budget screen** still shows the older dataset's figures for capital approved for 2027–2032. Unchanged by this work; a proposal to align the two screens is in M.4.
10. **The 2028–2030 tax path is from news reports**, as the existing data file already states.
11. **The simulator is a simplification** and says so; at 15% it gives $263 a month for the City's typical home where the City estimates $266.
12. **The preview was built on a data snapshot** of the 2026-11-11 morning build, with the citywide ward file only. The centre uses only that file.
13. **Not tested on the desktop app or on real devices.**
14. **Weight**: the script bundle grows by 95 KB (28 KB compressed) for every visitor; the 235 KB dataset loads only when the centre is opened.

---

## K. Security review

| Area | Finding |
|---|---|
| Secrets | None read, printed, copied or added. New files contain no key, token or personal data |
| New network calls | None from the build. In the browser: two same-origin JSON files. Links to calgary.ca open in a new tab with `rel="noopener"` |
| Input handling | Search and filter text is never written to the page as HTML; every string from data passes through the site's `esc()` before display |
| Dependencies | None added |
| Data | Public City documents and open data only |
| Tracking, cookies, storage | None added |
| Access | Public, like the City budget screen. No paywall, sign-in or payment code |
| Supply chain | The extraction tool runs by hand on a downloaded PDF with `pdftotext`; it is not part of the automated build |
| Workflow permissions | Unchanged |

---

## L. Commercial opportunity (removed from the plan)

Removed from the plan for now at the owner's instruction of November 11, 2026. No commercial proposal, pricing, payment, sign-in or paywall is part of this work, and none is in this repository or on the review page. The centre is a public screen like every other screen of the site.

---

## M. Deployment and rollback plan

### M.1 What publication is

Publication is a push to `main`. That starts the Website workflow, which rebuilds and republishes the whole site in 1 to 1.5 hours. There is no separate staging site.

### M.2 Exact procedure (only after explicit approval)

1. Confirm `main` is still `ff42583` (`git ls-remote origin main`). If other work has landed (the weekly hand check, the daily follow-up, or other sessions push to `main`), rebase the three small additions onto the new `main`; they are insertions into `ui/index.html`, `registry.py` and `web/search_index.py` and should apply cleanly.
2. Re-run `python tools/budget_intel_check.py --data <fresh copy of calgaryinsight.ca/data>`; it must exit 0.
3. Commit on `budget-intelligence` as Hassan Ali; open it as a branch on GitHub.
4. Fast-forward `main` to it and push.
5. Watch the Website run to success. Then open `calgaryinsight.ca/?view=budget-intelligence` and the City budget, Dashboard and Infrastructure screens on desktop and phone.
6. Confirm the next morning's scheduled refresh succeeds.

### M.3 Rollback

- **Fast:** `git revert` the publication commit on `main` and push. The site returns to its previous state after one build. The revert removes the added lines from six files and the new files; nothing else depends on them.
- **Exact:** `git push --force-with-lease origin backup/pre-budget-intelligence-20261111:main`, only if nothing else has been pushed since.
- **Total loss:** restore from artifact `backup-7` (steps in `backup-manifest.json`).

The new screen cannot damage refreshed data: it writes nothing.

### M.4 Proposed follow-ups (each needs its own approval)

1. Record Council's decision on each business case in December (approved, amended, not approved), with the source, turning "proposed" into a tracked outcome.
2. Add the fingerprint check of the City's PDF to the weekly hand check.
3. Read the City's year-end financial reports to enable budget against actual.
4. Decide which dataset the City budget screen should show for capital approved after 2026, so both screens agree.
5. The owner's decision on J.2.

---

## N. Final recommendation

**Recommend publishing**, on the evidence that: the change to existing code is 91 added lines in six files, all of them entries for the new screen; the existing interface is byte-identical apart from those; all existing screens behave the same; the refresh system is untouched; and the new dataset reconciles with the City's own figures to 0.04%.

The second-stage audit (`FINAL-VERIFICATION/README.md`) re-checked all of this and lists what is still unverified: real devices, a screen reader, the laptop archive, and a full build of the branch with live data.

Two things to decide first: whether links to the City's pages are enough for descriptions and risks (J.2), and whether the screen's name and its place under Money are right.

Publication requires explicit approval. Until then `main` stays at `ff42583`.
