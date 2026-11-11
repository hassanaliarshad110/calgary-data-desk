# Budget vs actual: how the figures were read

Every figure on the Budget Intelligence screen's "Budget vs actual" section comes from the City of Calgary's own reports,
read on 11 November 2026:

| What | Report | Page (printed / PDF) |
|---|---|---|
| Spending against budget by area, 2023 | 2023 Annual Financial Report (audited) | 20 / 22 |
| Revenue against budget, 2023 | 2023 Annual Financial Report | 18 / 20 |
| Spending against budget by area, 2024 | 2024 Annual Financial Report | 20 / 22 |
| Revenue against budget, 2024 | 2024 Annual Financial Report | 18 / 20 |
| Spending against budget by area, 2025 | 2025 Annual Financial Report | 16 / 18 |
| Revenue against budget, 2025 | 2025 Annual Financial Report | 14 / 16 |
| Tax-supported operating surplus, 2023 and 2025 | 2025 Annual Financial Report (2023 also in the 2023 report, page 119) | 118 / 120 |
| Tax-supported operating surplus and budget by department, 2024 | Financial and Economic Update, 2024 Year-End (EC2025-0414) | 1 / 1 |
| Capital budget and spending by department, 2024 | the same update | 4 / 4 |
| Capital budget and spending by service category, 2023 | 2023 Progress Update Report (EC2024-0291) | 21 / 21 |

Two readings: `tools/read1.py` reads the text made by pdftotext (poppler); `tools/read2.py` reads the PDF again with
pdfplumber (pdfminer), a different engine, and compares every figure. The annual reports: 57 of 57 figures agree for
each year, and 22 of 22 arithmetic checks pass for each year (each difference equals budget minus actual, or actual
minus budget for revenue; lines add to their totals). The 2024 year-end tables and the 2023 capital chart were read with
both engines too and agree; the City's own rounding leaves three 2024 operating lines $1,000 off their printed
difference and the capital budget lines $1,000 off their total. The City's 2025 capital results by department are only in
its year-end report on the Council records site, which could not be downloaded here, so the screen links to it.
`r2-YYYY.json` are the comparison results. `tools/make_bva.py` writes `ui/budget-intel/budget-vs-actual.json` from them.
