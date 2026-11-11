# Development log

2026-11-11, from about 09:40 to 11:00 UTC, in the order below. Production stayed at `main` = `ff42583` throughout. Nothing was pushed to `main`; no Website build was started, cancelled or changed.

## Phase A: audit, backup, baseline

| Step | Result |
|---|---|
| Recorded production: commit, tree, file count, the run that published it | `ff42583`, tree `ba8f1f74`, 330 files, run 42977312843 |
| Inventory of workflows, schedules, scheduled tasks and their last runs | 4 workflows on `main`, 7 scheduled tasks; all healthy |
| Backup through the repository's own Backup workflow (manual run) | run 42997418780 succeeded; artifact `backup-7`, kept to 2027-02-09 |
| Backup branch on GitHub | `backup/pre-budget-intelligence-20261111` = `ff42583` |
| Independent bundle and source archive, with checksums | verified |
| **Restore test**: clone from the bundle, compare with production | identical commit, tree and files |
| Snapshot of the production build and the City's source files, fetched through a read-only Actions probe (`site-check-21` → `fetched-21`) | 847-file manifest; production data; the 792-page PDF; open-data metadata |
| Baseline smoke test: 26 screens × desktop and phone | 52 of 52 shown, 0 script errors |
| Financial data availability | no year has both budget and actual; no operating actuals as open data |
| **Gate:** backup restorable, baseline recorded | passed; development allowed to start on an isolated branch |

## Phase B: the business-case dataset

| Step | Result |
|---|---|
| Parsed the contents (pages 2–10) | 384 cases, 6 sections; 3 lines without dot leaders handled |
| Parsed both layouts | 124 operating, 260 capital |
| First run found 42 unread rows (starred labels on tables with City notes) | fixed; 0 problems |
| Performance-measure text was read wrongly when it ran over several lines (the City centres it on the label) | fixed and re-checked on 8 cases |
| Strict checks built into the tool (titles, page numbers, totals, priorities, splits) | all pass |
| Second reading with pypdf | 1,152 of 1,152 rows agree |
| Two pages rendered and compared by eye | match |
| Reconciliation with open data | within 0.07% each year |

## Phase C: the screen

| Step | Result |
|---|---|
| Section, tab, script and stylesheet wired in; registry and search entries | 31 lines in 3 existing files |
| 11 sections, map, explorer, simulator, in-browser checks | built |
| Decision: hook navigation by wrapping `window.show` in the new script | `ui/app.js` left untouched |
| Decision: do not copy the City's descriptions, benefits and risk text | link to each page instead; flagged for the owner |
| Decision: use the 2027–2030 dataset for 2027–2030 capital, and show the disagreement with the older dataset | recorded in Data checks |

## Phase D: review and fixes

| Found | Fixed |
|---|---|
| Case figures table overflowed into the facts column | wrapped and constrained |
| Explorer scrolled sideways on a phone | rebuilt as a reflowing list |
| Figure labels squeezed on narrow screens | label wraps above the status |
| "$0.0M" shown for nil amounts | shown as a dash |
| "1 positions" | singular handled |
| Wording on "ongoing" amounts said the document did not define them | re-read the City's own notes (cases 124 and 293 add the yearly figures); wording corrected |
| File date shown in raw form | stored as a date |
| Section rail was not reachable from site search | given the same role the site's other switchers use |

## Phase E: validation and regression

| Step | Result |
|---|---|
| `tools/budget_intel_check.py` on production data | 15 pass, 4 notes, 1 gap, 0 failures |
| Smoke test, all screens, after | 54 of 54 shown, 0 errors; existing screens unchanged |
| Failure handling, 7 scenarios | 0 errors; clear messages; no invented figures |
| 40 interaction tests | 40 pass |
| Offline build step, `main` against development | 233 of 235 files identical; bundle equals production plus the new block |
| The two changed build steps run offline on both branches | production reproduced; additions only |
| Found a defect in the live site's search box | documented, not changed |

## Phase F: refresh integrity and package

| Step | Result |
|---|---|
| Workflows on the development branch against `main` | byte-identical |
| Scheduled tasks listed again | the same 7, same schedules |
| `main` on GitHub | still `ff42583` |
| Review package written | this folder |
| **Approval gate** | stopped; waiting for the owner |

## Second stage (November 11, from about 11:10 UTC; this entry written about 16:25 UTC): the owner's two instructions and the independent verification

| Step | Result |
|---|---|
| Data Genie and the Data Scientist made aware of the new data (owner's instruction) | `budget_intel.py`; the dashboard tool's section `budget_intelligence`; a report topic; a method note; a suggested question. Tried in the layout the website ships to the browser: 23 of 23 checks |
| Commercial opportunity removed from the plan (owner's instruction) | removed from the reports and from the review page kept outside the repository |
| Evidence gathered by read-only runs on separate branches (`site-check-22`) | backup downloaded, checksummed and restored on a fresh machine; run records; the City's PDF and both open datasets downloaded again |
| Financial reconciliation worked out again from the raw sources | `FINAL-VERIFICATION/1-FINANCIAL-RECONCILIATION.md` |
| Every case read a third time (pdfplumber, by position on the page) | 8,048 comparisons, 0 differences; 21 planted errors all reported |
| Forty requests read by eye from pictures of the City's pages | all agree; found a City note worded differently (request 124) |
| New field: the full one-time amount stated in the City's note | 17 requests; no existing value changed |
| Two checks on the screen made more informative; one sentence corrected | worked out from the day's data |
| User-experience audit (89 checks) | first run: 5 failed (keyboard focus lost; slider without a label). Fixed; 89 of 89 |
| Security checks (static and in a running copy) | one weakness closed (links are only made to http or https addresses); 15 of 15 |
| Regression on the final files | 54 of 54 screens open without error; 40 of 40 interaction checks; 7 failure scenarios without a script error |
| The morning refresh during this work | Website run 43011014041, started by the scheduled backup-refresh task at 11:19 UTC, finished successfully at 12:40 UTC from `main` at `ff42583`; not started or touched by this work |
| Full build of the branch as a read-only job (no publishing step, no secrets, no cache saved) | runs after this commit on the separate branch `site-check-23`; result to be added to finding 3.7b |
| `main` on GitHub | still `ff42583`; nothing merged, nothing deployed |
| **Approval gate** | stopped; waiting for the owner |
