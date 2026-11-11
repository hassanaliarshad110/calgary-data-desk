# Final independent verification: Budget Intelligence (second stage)

Written November 11, 2026. Branch `budget-intelligence`, compared with main at `ff42583`. **Nothing was published, merged or deployed, and the daily refresh system was not modified.** main is where it was before development started; the live website is unchanged by this work.

## Result

| Section | PASS | FAIL | UNVERIFIED | Page |
|---|---:|---:|---:|---|
| 1. Financial reconciliation | 11 | 1 | 5 | [1-FINANCIAL-RECONCILIATION.md](1-FINANCIAL-RECONCILIATION.md) |
| 2. PDF extraction | 9 | 0 | 0 | [2-PDF-EXTRACTION.md](2-PDF-EXTRACTION.md) |
| 3. Daily refresh and backup | 9 | 0 | 5 | [3-REFRESH-AND-BACKUP.md](3-REFRESH-AND-BACKUP.md) |
| 4. Code and security | 10 | 1 | 0 | [4-CODE-AND-SECURITY.md](4-CODE-AND-SECURITY.md) |
| 5. User experience | 10 | 0 | 4 | [5-USER-EXPERIENCE.md](5-USER-EXPERIENCE.md) |
| **All 65 findings** | **49** | **2** | **14** | [findings.json](findings.json) |

PASS means checked and found right, with evidence that can be re-run. FAIL means checked and found wrong or not as required. UNVERIFIED means it could not be checked from here, or a reason is an inference that the City has not confirmed; each says what would verify it.

## The 2 FAIL findings

- **1.2d On the live site today: the City budget screen shows both sets of figures in different places.** Not caused by this branch and not changed by it. The live City budget screen draws its by-year chart from the older dataset (capital for 2027 to 2032: 2,499.8, 1,440.3, 976.8, 768.2, 450.7, 1,104.0) and its 2027 to 2030 table from the newer one (2,867.0, 2,569.6, 989.8, 522.8). A reader who adds 2031 and 2032 from the chart to 2027 to 2030 from the table would count about $957.5 million of Green Line money twice. The new centre no longer points readers to those later years and says why. A fix to the existing screen would be a separate change needing its own approval.
- **4.9b The branch's first commit still holds one sentence about paid ideas.** Commit 50acadc (the version the owner examined) contains, in two report files, one sentence listing kinds of paid service that were being considered and two mentions of "a product meant to earn revenue". No prices, no figures, no names. Later commits remove the text from the files but not from the history of this public branch. Two ways to close this, both the owner's decision: (a) at publication, merge the branch as a single squashed commit, so the sentence never enters main's history (recommended; nothing to do now); (b) rewrite the branch now as one commit and force-push it, which removes it from the branch as well. Not done without instruction, because rewriting history is not reversible.

## The 14 UNVERIFIED findings, in short

| | What is not verified | Why |
|---|---|---|
| 1.1b | Why the City says $21 billion | the City does not say which years its $21 billion covers |
| 1.2c | Why the two datasets differ | the City has published no reconciliation of its two datasets |
| 1.3b | What explains the six differences | the City has published no mapping of requests to business units |
| 1.6b | Is 855 the City's whole change in staff for 2027? | no City total was found to compare with; a request's text can mention staff outside its row |
| 1.10 | The City's twelve headline investments against the business cases | four of the twelve headline amounts are parts of larger programs that the tables do not itemize |
| 3.3c | Full workflow logs | full logs are on GitHub, not copied into a public repository |
| 3.5b | A full restore to a working public site | it would publish |
| 3.7a | The laptop archive (tools/archive.py, run by Windows Task Scheduler) | it runs on the owner's laptop |
| 3.7b | A full build of the branch with live data | the read-only job takes one to two hours and runs after this report is committed |
| 3.7d | Other things that could not be verified | outside what this review can reach or know in advance |
| 5.5b | PDF links: does the document open at the right page on every device? | depends on each phone's PDF viewer |
| 5.8b | Accessibility: a full audit with a screen reader | no screen reader was run |
| 5.9 | Real devices | no real device was available |
| 5.11b | A live conversation with Data Genie about the new data | needs the owner's access code and credits, on the published site |

## Where the instructions were not followed as written

The owner's instruction was to accept only what is right. These are the places where the request could not or should not be met as worded:

1. **Real-device results.** There are none. Every phone and tablet result is an emulated device and is labelled so; nothing was invented to fill the column. A ten-minute list for a real phone is in section 5.
2. **The laptop archive.** Not verified and not claimed. It runs on a machine this review cannot reach.
3. **"Explain" the $21 billion and the 2028 difference.** The arithmetic is given in full. The reasons are the City's to give and it has not published them, so they are marked as inferences, not explanations.
4. **Actual workflow logs.** Run numbers, results, step counts and addresses are supplied. The full log text is not copied into a public repository; it is on GitHub at those addresses.
5. **A complete Git diff as a file.** A file cannot contain the diff of itself. The exact command is given, the patch of the six existing files is saved, and every new file is listed with its checksum.
6. **Pictures of the City's pages.** Forty requests were checked by eye from pictures. The pictures are pages of the City's document, so they are not committed here; the list of what was checked is.
7. **The 31 additions.** Explained, and still present, but the count is now 91 because the owner's later instruction about Data Genie and this audit's fixes added lines. Section 4 explains each block.
8. **Rewriting the branch's history** to remove one sentence from its first commit (finding 4.9b) was not done without instruction, because it cannot be undone.

## What this audit changed

It was asked to verify, and it also found things worth fixing on the branch. All are listed in section 4 ("What changed on the branch since the version examined"). In short: 17 requests now carry the full one-time amount that the City states in a note; two checks on the screen explain more; one sentence that pointed readers to figures that do not add up was rewritten; four keyboard and screen-reader defects and one link-safety weakness were fixed. No existing figure in the dataset changed. All tests were run again on the final files: 89 of 89 user-experience checks, 15 of 15 security checks in a running copy, 23 of 23 checks of the assistants' tool, 54 of 54 screens, 40 of 40 interaction checks, and 8,048 of 8,048 comparisons with the third PDF reading.

## How to repeat any of it

The scripts are in [`evidence/tools/`](evidence/tools/). Each finding in the section pages ends with the command that reproduces it. The inputs are: this branch; the City's PDF (address and checksum in `evidence/financial/sources-read.json`); and the two open-data files saved in `evidence/financial/`.

## Files

| | |
|---|---|
| [1-FINANCIAL-RECONCILIATION.md](1-FINANCIAL-RECONCILIATION.md) | the $21 billion, the 2028 difference, the six business units, $13.05 billion and its purposes, 124 and 260, 855 positions, formulas |
| [2-PDF-EXTRACTION.md](2-PDF-EXTRACTION.md) | the four readings, completeness, duplicates and unusual cases, the sample read by eye |
| [3-REFRESH-AND-BACKUP.md](3-REFRESH-AND-BACKUP.md) | workflow files before and after, runs, the backup and its restore test, the seven scheduled tasks, what could not be verified |
| [4-CODE-AND-SECURITY.md](4-CODE-AND-SECURITY.md) | the inventory, every added line, the built files, the scans |
| [5-USER-EXPERIENCE.md](5-USER-EXPERIENCE.md) | the eleven sections, mobile, filters, exports, links, themes, keyboard, accessibility; emulated and real devices kept apart |
| [findings.json](findings.json) | every finding with its result, evidence and the command to repeat it |
| [evidence/](evidence/) | the evidence files and the scripts |

## Status

Calgary Insight development is ready for review. Nothing will be published without the owner's explicit approval.
