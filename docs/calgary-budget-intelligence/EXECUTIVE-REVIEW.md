# Budget Intelligence & Accountability Centre: executive review

> **Second-stage update, November 11, 2026.** This page was written for the first review. Since then the branch gained the assistants' wiring (the owner's instruction), the commercial opportunity was removed (the owner's instruction), and a second-stage audit added one data field and fixed several defects. Where this page and `FINAL-VERIFICATION/` differ, `FINAL-VERIFICATION/` is the current state.

2026-11-11 · For Hassan Ali · **Status: built on an isolated branch, not published.** The live site is unchanged (`main` = `ff42583`).

## What was built

One new screen under Money, beside City budget: `calgaryinsight.ca/?view=budget-intelligence`. It answers three questions a resident can read in half a minute: what is approved, what was actually spent, and what is only proposed. Every figure carries one of those labels.

Eleven sections: Overview (figure tiles, a ward map with four layers, capital by purpose, largest requests, live checks) · Operating · Capital · Revenue and tax · Budget vs actual · Business cases · Capital projects · Performance · Tax simulator · Connected data · Data checks.

## The new asset

All **384 business cases** behind the proposed 2027–2030 budget, read out of the City's 792-page PDF into a searchable dataset: 124 operating and 260 capital requests, each with its amounts by year, positions, department, Council priority, ward, stage, funding source and the page of the City's document.

## Why the numbers can be trusted

| Check | Result |
|---|---|
| Every figure row read twice, with two different PDF readers | 1,152 of 1,152 agree |
| The 260 capital requests against the City's separately published open data | $13,024.7M against $13,029.4M for 2027–2030: within 0.07% in every year |
| Every title against the City's contents; every page number against the PDF | 384 of 384 |
| Five of the City's headline investments against single requests | match to the rounded million |
| Existing figures re-checked (department totals, revenue, tax by ward) | all add up |

## What the data cannot do, stated on the screen

- **Budget against actual spending cannot be compared.** The City's open data gives one figure per year: approved or actual, never both. The screen shows "not published" and works out no variance.
- **Project-level tracking is not possible**: no spending to date, no completion dates, no shared project number.
- **92% of proposed capital dollars are "all wards"**, so nothing is divided among wards or communities.
- Two City datasets disagree on capital already approved for 2027–2030; both are shown.

## What changed in the existing site

91 lines added across 6 files, and two existing lines edited (the first review covered 31 lines in 3 files; the rest lets Data Genie and the Data Scientist read the new data). The published script is byte-identical to production once the new screen's block is taken out. All 26 existing screens were opened on desktop and phone before and after: no errors; the only screens whose content differs are the three that gained an entry (How it is counted, Data Scientist, Data Genie). No dependency added.

## The daily refresh

Untouched. Workflows byte-identical, same schedules, same seven scheduled tasks, last refresh healthy (83 steps, 0 failed; 36 of 36 sources answered). The new screen only reads refreshed data and writes nothing. Full evidence: `DAILY-DATA-REFRESH-INTEGRITY-REPORT.md`.

## Backup

Taken and restore-tested before any change: Actions artifact `backup-7` (run 42997418780, kept to February 2027) and branch `backup/pre-budget-intelligence-20261111`. Rollback after publication is one `git revert`.

## Decisions for you

1. **Descriptions, benefits and risks.** The City's written text for each request is linked (to the exact page), not copied, because republishing the City's prose is a copyright question. Keep links, add the text after checking the City's terms, or have short neutral summaries written case by case?
2. **Name and place.** "Budget Intelligence" under Money, after City budget.
3. **A defect found on the live site** (site search throws an error if you type before it has loaded). Fix it as a separate small change?

## Known limits

The business cases are a snapshot of the City's document as of 9 November; not tested on the Windows desktop app or real phones; the full network build was not run on the branch because running it publishes. Full list: `TECHNICAL-REPORT.md` section J.

## Recommendation

Publish. The risk to the existing site is low and measured, and the new dataset is the first of its kind for Calgary's budget.

**Calgary Insight development is ready for review. Do you approve publishing these changes to the live website?**
