# Calgary Budget Intelligence & Accountability Centre: review package

Development branch `budget-intelligence`, based on production `main` = `ff42583`. **Not merged, not deployed.** Publication needs the owner's explicit approval.

| Read first | |
|---|---|
| `EXECUTIVE-REVIEW.md` | Two pages: what was built, the evidence, the decisions needed |
| `CHANGE-SUMMARY.md` | Exactly what changed in the site |
| `DAILY-DATA-REFRESH-INTEGRITY-REPORT.md` | The refresh system before and after |

| Detail | |
|---|---|
| `TECHNICAL-REPORT.md` | Sections A to N: audit, backup, architecture, change register, data sources, financial validation, tests, visual review, limitations, security, deployment and rollback, recommendation |
| `FUNCTIONAL-TESTS.md` | Every test and its result |
| `DATA-SOURCE-REGISTER.md` | Every source, dataset ID, freshness |
| `MODULE-INVENTORY.md` | Every screen and data file |
| `DEVLOG.md` | What was done, in order |
| `backup-manifest.json` | The backup, its checksums and the restore steps |
| `validation-report.json` | Output of `tools/budget_intel_check.py` |
| `evidence/` | Raw results: before and after, failure handling, interaction tests, production build log and file list, branches at backup |
| `screenshots/` | Every screen before and after; the new screen on desktop and phone, dark and light |

## To see it

The new screen is `ui/budget-intel.js` with `ui/budget-intel.css`, opened at `/?view=budget-intelligence`. To run it locally with real data: build the interface with the site's own step (`python -c "import sys; sys.path[:0]=['web','.']; import build_site; build_site.page('out')"`), copy the live site's `data/` folder into `out/data`, and serve `out`.

## To repeat the checks

```
python tools/budget_intel_extract.py <the City's PDF>      # rebuilds the dataset; stops if any case cannot be read
python tools/budget_intel_check.py --data <site data dir>   # 0 = no failures
```

## To publish (only after approval)

`TECHNICAL-REPORT.md` section M.
