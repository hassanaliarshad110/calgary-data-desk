# Change summary

Development branch `budget-intelligence`, based on production `main` = `ff42583`. Prepared 2026-11-11. **Not published.**

## In one paragraph

One new screen was added, the Budget Intelligence & Accountability Centre, with its own script, stylesheet and two data files. Three existing files gained 31 lines between them so the screen appears in the menu, in site search and in the assistants' list of sources. No existing line was removed or edited. No workflow, schedule, build script, data module or data file was touched.

## Existing files changed

| File | Lines added | Lines removed | What |
|---|---|---|---|
| `ui/index.html` | 18 | 0 | a stylesheet link; a tab "Budget Intelligence" under Money, after City budget; an empty section `view-budget-intelligence`; a script tag |
| `registry.py` | 9 | 0 | one entry in `PAGES` so Data Genie and the Data Scientist can read the business cases |
| `web/search_index.py` | 4 | 0 | one entry in `SCREENS` so site search finds the screen and four of its sections |

## New files

| File | What |
|---|---|
| `ui/budget-intel.js` | the screen (11 sections, the checks, the map, the explorer, the simulator) |
| `ui/budget-intel.css` | its styles, scoped to `.bi` |
| `ui/budget-intel/business-cases.json` | 384 business cases read from the City's PDF |
| `ui/budget-intel/crosswalk.json` | hand-kept name matches and topic links |
| `tools/budget_intel_extract.py` | reads the City's PDF into the dataset (run by hand) |
| `tools/budget_intel_check.py` | the checks from the command line (run by hand) |
| `docs/calgary-budget-intelligence/` | this review package |

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
- Data Genie can answer questions about individual budget requests.
- The script every visitor downloads grows by 95 KB (28 KB compressed).
- Everything else is the same.

## Found and not changed (each would need approval)

1. **Site search throws one script error if you type before its index has loaded** (exists on the live site today). Proposed fix in `ui/search.js`, function `load()`: prepare the rows before waiting for the news, or keep the list in a local variable until it is ready. One or two lines.
2. **The City budget screen and the centre use different City datasets for capital already approved after 2026.** Proposed: decide which one the City budget screen should show.
3. **The business-case document is not watched for changes.** Proposed: add a fingerprint check to the weekly hand check.
4. **No budget-versus-actual data.** Proposed: read the City's year-end financial reports into a hand-kept file.

## Audit trail

`DEVLOG.md` (what was done, in order), `TECHNICAL-REPORT.md` section E (register), `DAILY-DATA-REFRESH-INTEGRITY-REPORT.md` (refresh system before and after), `evidence/` (raw test results).
