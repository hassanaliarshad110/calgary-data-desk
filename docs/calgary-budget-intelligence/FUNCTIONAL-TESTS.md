# Functional test report

Run 2026-11-11 with Playwright (Chromium) against two local servers:

- **Before:** the production build's own files (snapshot of Website run 42977312843: the published HTML, scripts, styles and `data/`).
- **After:** the development branch built with the site's own offline build step (`build_site.page`), on the same production data snapshot.

The snapshot leaves out videos, game images and the visitor guides' pictures, so both servers return 404 for those media files. That is the snapshot, not the site, and it is the same before and after.

## 1. Every screen, desktop (1440×900) and phone (iPhone 13)

"Shown" means the screen's section became the visible one after opening `/?view=<screen>`; "errors" are uncaught script exceptions.

| Screen | Before: desktop | Before: phone | After: desktop | After: phone |
|---|---|---|---|---|
| dashboard | shown, 0 errors | shown, 0 errors | shown, 0 errors | shown, 0 errors |
| issues | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| families | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| changes | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| growth | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| compare | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| elections | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| livemap | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| citynews | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| fedbudget | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| invest | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| help | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| capmkt | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| infra | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| game | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| visit | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| safety | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| **budget (City budget)** | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| videos | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| methods | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| sources | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| cameras | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| scientist | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| ask | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| files | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| settings | shown, 0 | shown, 0 | shown, 0 | shown, 0 |
| **budget-intelligence (new)** | n/a | n/a | shown, 0 | shown, 0 |

Totals: before 52 of 52 shown, 0 errors; after 54 of 54 shown, 0 errors.

The amount of text on each existing screen was the same before and after (within 2%), except the Data Scientist screen, which picks its suggested topics at random on every load; two loads of the unchanged production build differ in the same way.

Raw results: `evidence/functional-before.json`, `evidence/functional-after.json`. Screenshots of every screen: `screenshots/baseline-*.jpg`, `screenshots/after-*.jpg`.

## 2. Existing functionality checklist

| Item | How it was checked | Result |
|---|---|---|
| City budget screen still present, with its year selector, charts, revenue, tax by ward, projects by ward and export | Section, script and controls present in the built page; screen opens with the same content | pass |
| Navigation: all 26 existing tabs present and in the same groups | Built `index.html` compared with production's: only additions | pass |
| Shareable addresses (`/?view=…`) | Every screen opened by address | pass |
| Site search | Search index source has every earlier screen plus one new entry | pass |
| Data Genie and Data Scientist sources | Registry: 43 earlier entries unchanged, 2 added | pass |
| Scripts | The published bundle equals production's exactly when the new screen's block is removed | pass |
| Styles | `styles.css` and `web.css` byte-identical; the new styles are in their own file and scoped to `.bi` | pass |
| Studies, bill calculator, wards, communities, news, visit pages | Not touched by the change; their generators are byte-identical | pass (by identity) |
| Game, 3D map, videos | Files byte-identical | pass (by identity) |

## 3. The new screen

40 scripted interaction tests, each checked against a figure worked out independently from the dataset (`evidence/interaction-tests.json`): **40 pass**. During the site-search test one script error was raised by a defect that already exists on the live site (section 3a); it does not come from the new screen.

| Test | Expected | Result |
|---|---|---|
| All 11 sections render with production data | | pass, 0 errors |
| Explorer lists every case | 384 requests; $13.05 billion capital (260); $385.6 million one-time (124); 855 positions in 2027 | pass |
| Filter: capital / operating | 260 / 124 | pass |
| Filter: names ward 7 / all-wards requests | 16 / 226 | pass |
| Filter: Council priority "Safe city" | 63 | pass |
| Filter: department Infrastructure Services | 76 | pass |
| Filter: marked "Required" / with a City note | 66 / 20 | pass |
| Filter: Stage 4 / risk rating Extensive / funding source Grants / reason "Explicit Direction from Council" (with the two cut-short entries grouped) | 96 / 37 / 71 / 52 | pass |
| Search "pavement"; search by Budget ID `P258_000`; a search with no match | case 55; case 28; an empty-state message | pass |
| Sort: largest amount first; most positions first | Wastewater Treatment Plants Program first | pass |
| Paging | page 2 starts at case 26 | pass |
| Open and close a case; its link | detail shown; link ends `…budget-requests.pdf#page=12` for case 2 | pass |
| Export | a CSV with a header and 384 rows; case 55 carries 420196 | pass |
| Map | 14 wards drawn; four layers switch; a 14-row table alternative | pass |
| A ranked bar opens its case in the explorer | case 31 | pass |
| Address | carries the section; leaving the screen removes the centre's parameters | pass |
| City budget screen after visiting the centre | still shows "$4.62 billion operating budget" | pass |
| Simulator arithmetic | $500,000 at 10%: $1,945, then $2,140, +$195 | pass |
| Site search | "budget intelligence" lists the screen; choosing "Tax simulator" opens the centre on that section | pass |
| Phone (iPhone 13): no section scrolls sideways | all 11 | pass |
| Light and dark themes | both render | pass (by eye, see screenshots) |
| Script errors during all of the above | 0 from the new screen | pass |

### 3a. A defect that already exists on the live site (found, not fixed)

Typing in the site search box before its index has finished loading throws one script error (`Cannot read properties of undefined (reading 'startsWith')` in `ui/search.js`, function `score`). Cause: `load()` stores the list of rows before it has prepared them, then waits for the day's news; a second keystroke during that wait gets the unprepared list. The search recovers on the next keystroke. **It is reproduced on the unchanged production build**, so it is not caused by this work. It was left alone, because fixing it would change an existing script; a one-line fix is proposed in the change summary and waits for approval.

## 4. Failure handling

One source at a time was made to return "not found", and all 11 sections were opened each time.

| Source hidden | Script errors | What the screen does |
|---|---|---|
| none | 0 | normal |
| `data/budget.json` | 0 | banner at the top; Operating, Capital, Revenue and Budget vs actual each say the budget could not be loaded; business cases still work |
| `data/tax.json` | 0 | Revenue shows the ward table as unavailable; the simulator is switched off with the reason |
| `budget-intel/business-cases.json` | 0 | banner; every section that needs the cases says so; budget figures still work |
| `budget-intel/crosswalk.json` | 0 | banner; names fall back to the document's own; everything else works |
| `data/infra.json` and `data/accountability.json` | 0 | Performance says the measures could not be loaded; Connected data shows the budget side and marks the missing figures |
| the citywide ward file | 0 | the map is replaced by a notice |

In no case did "NaN", "undefined" or a zero standing in for a missing figure appear. Raw results: `evidence/failure-handling.json`.

## 5. Build and tools

| Test | Result |
|---|---|
| `python -m compileall` on the development branch | pass |
| Offline build step on `main` | writes `site.20186e8330.js`, the bundle name on the live site |
| Offline build step on the development branch | 233 of 235 files identical to `main`'s; `index.html` +18 lines; bundle = production + the new block; 4 new files |
| `tools/budget_intel_extract.py` on the City's PDF | 384 cases, 0 problems |
| Second reading with a different PDF reader | 1,152 of 1,152 rows agree |
| `tools/budget_intel_check.py --data <production data>` | 15 pass, 4 notes, 1 gap, 0 failures; exit 0 |
| The two build steps whose source files changed, run offline against the production data snapshot from `main` and from the development branch | **Site search index:** `main` reproduces production's file exactly (556 rows); the development branch gives the same 556 plus 5 (the screen and four sections), none removed. **Registry:** every production entry identical on both; the development branch adds 2 (`budget-intelligence`, `data:crosswalk`), changes none |

## 6. Not tested

- The full network build on the development branch (it publishes; see the refresh integrity report).
- The Windows desktop app.
- Real phones, other browsers than Chromium, and screen readers.
