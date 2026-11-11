# Change summary

Development branch `budget-intelligence`, based on production `main` = `ff42583`. Prepared 2026-11-11. **Not published.**

## In one paragraph

One new screen was added, the Budget Intelligence & Accountability Centre, with its own script, stylesheet and two data files, and one new Python file so that Data Genie and the Data Scientist can read the same data. Six existing files gained 91 lines between them (two existing lines were edited) so the screen appears in the menu, in site search, in the assistants' tools and report topics, and in "How it is counted". No workflow, schedule, build step, data module or data file was changed.

## Existing files changed

| File | Lines added | Existing lines edited | What |
|---|---|---|---|
| `ui/index.html` | 19 | 0 | a stylesheet link; a tab "Budget Intelligence" under Money, after City budget; an empty section `view-budget-intelligence`; a script tag; one suggested question on the Data Genie screen |
| `registry.py` | 11 | 0 | one entry in `PAGES`: the screen, how the assistants read it, and its two data files |
| `web/search_index.py` | 4 | 0 | one entry in `SCREENS` so site search finds the screen and four of its sections |
| `agent.py` | 17 | 2 | the dashboard tool learns the section `budget_intelligence` and its parts (description, the two lists of allowed values, and the two places that answer it) |
| `analyst.py` | 14 | 0 | one Data Scientist topic: "The 2027 to 2030 budget requests: where the money would go" |
| `methods.py` | 26 | 0 | one "How it is counted" note, and where the method lives in the code |

The first review covered the first three rows (18, 9 and 4 lines). The rest was added afterwards at the owner's instruction that the assistants should know the new data. Every block is explained in `FINAL-VERIFICATION/4-CODE-AND-SECURITY.md`.

## New files

| File | What |
|---|---|
| `ui/budget-intel.js` | the screen (11 sections, the checks, the map, the explorer, the simulator) |
| `ui/budget-intel.css` | its styles, scoped to `.bi` |
| `ui/budget-intel/business-cases.json` | 384 business cases read from the City's PDF |
| `ui/budget-intel/crosswalk.json` | hand-kept name matches and topic links |
| `budget_intel.py` | the same data for Data Genie and the Data Scientist (reads only) |
| `tools/budget_intel_extract.py` | reads the City's PDF into the dataset (run by hand) |
| `tools/budget_intel_check.py` | the checks from the command line (run by hand) |
| `docs/calgary-budget-intelligence/` | this review package, with the second-stage verification in `FINAL-VERIFICATION/` |

## Calculations

None modified. New ones, each shown with its formula where it appears: sums of the business cases; capital by purpose; reconciliation with open data by year and by business unit; ward shares of the levy; the tax simulator.

## Data sources

One added: the City's "2027–2030 budget request business cases" (PDF). None removed or replaced. Existing refreshed data is read through the existing bridge calls only.

## Dependencies

None added, none removed.

## Design

No existing screen restyled. The new screen uses the site's fonts and colour tokens in the layout of the reference image supplied (section rail, figure tiles, map with layers, side panels, ranked bars, alerts).

## What a visitor would notice after publication

- One new item in the Money menu: "Budget Intelligence".
- Site search finds "Budget Intelligence", "Business cases", "Budget vs actual", "Tax simulator" and "Data checks".
- Data Genie can answer questions about the budget requests (totals, lists, one request by number, by department, priority, service area and ward), and the Data Scientist offers a report on them.
- "How it is counted" has a note for the screen.
- The script every visitor downloads grows by 103 KB (30 KB compressed).
- Everything else is the same.

## Found and not changed (each would need approval)

1. **Site search throws one script error if you type before its index has loaded** (exists on the live site today). Proposed fix in `ui/search.js`, function `load()`: prepare the rows before waiting for the news, or keep the list in a local variable until it is ready. One or two lines.
2. **The City budget screen and the centre use different City datasets for capital already approved after 2026.** Proposed: decide which one the City budget screen should show.
3. **The business-case document is not watched for changes.** Proposed: add a fingerprint check to the weekly hand check.
4. **No budget-versus-actual data.** Proposed: read the City's year-end financial reports into a hand-kept file.

## Audit trail

`DEVLOG.md` (what was done, in order), `FINAL-VERIFICATION/` (the second-stage audit and everything it changed), `TECHNICAL-REPORT.md` section E (register), `DAILY-DATA-REFRESH-INTEGRITY-REPORT.md` (refresh system before and after), `evidence/` (raw test results).
