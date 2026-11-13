# 15% tax study: reproduction package

Every figure in "Growth or Spending? Inside Calgary's Proposed 15% Tax Increase" (draft, November 13, 2026) comes from the files here.

## 1. Get the data (GitHub Actions, no local City access needed)
Push each branch to run its workflow; results land on the matching `-out` branch.

| Branch | Script | Output branch | What it saves |
|---|---|---|---|
| taxstudy-probe | probe/taxstudy.py | taxstudy-probe-out | `dashboard.build(ward=0)` under city_actual, model and census2021 (ward table, growth model, 311, amenities); `proptax` by community and ward; `budget.load` |
| taxstudy2-probe | probe/taxstudy2.py | taxstudy2-probe-out | every home on the 2026 roll (4bsw-nn7w, HOMES_WHERE); the 2027-2030 budget open data (nnnm-9sfh); dataset metadata |
| taxstudy3-probe | probe/taxstudy3.py | taxstudy3-probe-out | every home's assessed value by roll number: 2023-2025 (4ur7-wsgc historical) and 2026 (4bsw-nn7w) |

Clone the three `-out` branches into `p1/`, `p2/`, `p3/` next to these scripts.

## 2. Compute
```
export STUDY=$(pwd) REPO=/path/to/calgary-data-desk   # main checkout, for data/ and ui/budget-intel/
python3 analysis_budget.py   # sections 2, 4, 8 -> fig_budget.json
python3 analysis_assess.py   # section 5 (paired assessment changes) -> fig_assess.json
python3 analysis_wards.py    # sections 3, 5 (wards), 6 -> fig_wards.json (needs fig_budget.json)
```
Run in that order. The `fig_*.json` files committed here are the outputs used in the draft; your run should match them exactly if the probe outputs are the same (dates in `ran_at.txt`).

## 3. Hard-coded inputs (with sources)
- City population, April 2021-2030: Calgary and Region Economic Outlook, Spring 2026, Table 4.
- Calgary CMA inflation 2021-2030: Calgary and Region Economic Outlook, Fall 2026, Table 1.
- Tax path 15 / 10 / 7.7 / 6: City budget page (2027); news reports of Nov 10, 2026 (2028-2030).
- $25.6M per 1%: City of Calgary (as reported by LiveWire Calgary, in data/budget_2027.json).
- Typical home $706,000 -> $688,000; tax $229.32 -> $266: City 2027 Budget financial impact; 2026 budget adjustments.
- CREB benchmark year-over-year: July 2026 (detached -1.87, apartment -8.37, total -2.05), August 2026 (semi +1.0, row -5.0).
- Historical roll code map (RE0110 -> R110 etc.): checked by pairing roll numbers 2025 vs 2026 (see analysis_assess.py).
