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

## Publication (November 11, 2026)

| Step | Result |
|---|---|
| Owner's approval | given in the chat at 16:32 UTC on November 11, 2026, in answer to the question "Do you approve publishing these changes to the live website?" |
| `main` before the merge | `ff42583`, where it was before development started |
| The repository's own checks, run on the live site's data just before the merge (read 16:34 UTC) | 15 pass, 5 to know, 1 gap, 0 failed; the live site at that moment was the build of 05:39 Calgary time (83 steps, 0 failed) |
| Merge | the development branch (`27db3be`) as one commit on `main`; the four workflow files are unchanged |
| Website build | run 43059929407, 16:36 to 17:33 UTC: success; live from 17:32 UTC (script bundle `site.0c52be4945.js`) |
| The live site checked (read-only job, branch `fetched-25`) | the four new files are byte-for-byte the repository's; 83 of 83 build steps; 54 of 54 screens on desktop and an emulated phone with no script error or failed request; 89 of 89 user-experience checks; 40 of 40 interaction checks; data checks on the live data 15 pass, 5 to know, 1 gap, 0 failed; the assistants' tool on the live files 23 of 23 |
| Full build of the branch before the merge (finding 3.7b) | 83 of 83 steps, the same steps as the live build; now PASS |
| The sentence about paid ideas (finding 4.9b) | the branch was merged as one squashed commit, so it is not in `main`'s history; it remains only on the development branch |

## 2026-11-11: department bridge, question coverage, Fable as the final auditor (branch `audit-fable-final`, not merged)

Why: an outside review of the Data Scientist report "Where Calgary's proposed 2027-2030 budget could cost less" found that it
answered an easier question than the one asked (timing and funding changes in place of unnecessary spending) without saying
so, and called the $579.4M Corporate Programs rise "one line with no published breakdown" although five business cases
(6, 14, 274, 295, 305) sit in that business unit. The report auditor could not have caught either: it checked figures only.

| Change | Where |
|---|---|
| `department_bridge` part: each operating business unit's 2027-2030 change in open data, the requests behind it and the part no request explains | `budget_intel.py`, described in `agent.py`, `registry.py`, `methods.py` |
| Data Scientist brief: split the question into parts and end with "Does this answer the question?"; trace changes of a tenth or more of a total; never claim "no breakdown" before checking | `analyst.py` |
| Auditor step 1: finding kinds `question_not_answered` and `missed_evidence`; sees the question; can read the registry | `auditor.py` |
| Auditor step 3 (Rundle) is now the final auditor on Claude Fable (`claude-fable-5-2`, tier `final`); runs on every report; checks the fixes, question coverage, missed evidence and key figures; its coverage table and new findings are on the audit page | `auditor.py`, `agent.py`, `ui/audit.js`, `ui/index.html`, `app.py`, `web/webapp.py` |
| Cost of a Claude model with no listed price (Fable) counted at the dearest listed Claude price, as the gateway does | `agent.py` |

Tests run here (no live data or API key in this workspace): `tools/budget_intel_check.py` 11 pass, 3 note, 0 FAIL; the bridge on a
fixture with the report's Corporate Programs figures gives requests $52.3M (ongoing added 2028-2030 $75.1M, one-time 2030 less
2027 -$22.8M) and $527.1M not explained by any request, matching a hand calculation; the three audit stages with stub agents,
with and without step-1 findings (step 3 runs in both, on tier `final`, with the question); the `final` tier resolves to
`claude-fable-5-2` on Claude and the strong model elsewhere. UNVERIFIED: a real call to Claude Fable through the app and the
gateway; the bridge on the live open-data file.
