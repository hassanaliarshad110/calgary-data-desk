# 2. PDF extraction

Part of the second-stage verification of the Budget Intelligence branch (`budget-intelligence`), written November 11, 2026. Nothing here was published, merged or deployed. Start with [README.md](README.md).

The source is the City of Calgary's "2027-2030 budget request business cases": 792 pages, 9,132,758 bytes, sha256 `b4deb3927d24afb142426127662c8be76751b6a041d6bb85a3358869da85c3d0`, last changed by the City on November 9, 2026. It was downloaded again on November 11 for this audit and is the same file.

The complete list of the 384 cases is in [`evidence/pdf/all-384-cases.md`](evidence/pdf/all-384-cases.md) (number, title, kind, page, department, business unit, funding) and [`evidence/pdf/all-384-cases.csv`](evidence/pdf/all-384-cases.csv) (43 columns: every amount by year, the purposes, wards, stage, funding source, Budget ID, and the result of the third reading for each case).

## The four readings and how they differ

| Reading | Tool | How it finds a figure | What it covers | Result |
|---|---|---|---|---|
| 1 | pdftotext 24.02.0 with page layout (the reader that makes the dataset, `tools/budget_intel_extract.py`) | finds the row by its label and cuts columns by character position; stops and writes nothing if any row has the wrong number of figures | every field of all 384 cases | 384 cases, no problem reported |
| 2 | pypdf 6.17.0 | finds the row label and takes the numbers that follow it, in order | the five kinds of figure row and the purpose percentages of all 384 cases | 1,152 rows agree, 0 differ |
| 3 | pdfplumber 0.11.10 (pdfminer.six), added for this audit | takes each word with its position on the page and puts a number under the column heading whose right edge it lines up with | 35 kinds of comparison on all 384 cases: every figure and every category | 8,048 of 8,048 agree, 0 differ |
| 4 | pictures of the pages (pdftoppm), read by eye | a person-style reading of the City's own table next to the dataset's values | 40 requests across all 20 combinations of department and kind | all agree; one omission found (below) |

How the text readers differ from each other: pdftotext and pdfplumber give exactly the same words on 736 of 792 pages; pypdf agrees with pdftotext word for word on 424. Where they differ it is in sentences: one reader keeps "long-term" as one word and another splits it, and a special hyphen is kept or dropped. All three give the same numbers on 787 of 792 pages; the other five are three contents pages (a page number joined to or split from a dot leader) and two sentences of prose (pages 70 and 574). None is in a funding table.

What each reading is weak at, and why more than one was used:

- Reading 1 depends on the columns lining up as characters. It is strict: a row with the wrong number of figures stops it. It cannot notice a figure that sits in the wrong column but still lines up.
- Reading 2 would be fooled by an empty cell (the next number would slide left). The document never leaves a cell empty (it prints a dash), which the strict count in reading 1 confirms.
- Reading 3 does not depend on spacing or on order, only on where the number sits on the page, so it catches what the first two could miss. It was itself tested by planting 21 wrong values (finding 2.5b).
- Reading 4 is the only one that does not depend on any text extraction. It found what the three machine readings could not: a note worded differently from the rest.

Fields that no machine reading covers: none of the figures; of the text fields, the performance measure is checked only for the presence of its words (it wraps across lines in the document). The City's descriptions, benefits and risk statements are deliberately not in the dataset.

## Completeness

| Check | Result |
|---|---|
| Pages in the PDF | 792 (10 front pages: cover and contents) |
| Pages from the first case (11) to the last (792) that belong to no case | 0 |
| Pages claimed by more than one case | 0 |
| Numbers 1 to 384, none missing or repeated | yes |
| Cases in page order follow the numbering | yes |
| Start pages whose first line begins with the case's number | 384 of 384 |
| Other pages that begin like a case heading | 0 |
| Pages per case | 6 cases of 1 page, 369 cases of 2 pages, 7 cases of 3 pages, 1 case of 4 pages, 1 case of 13 pages |

## Duplicates, and cases that are unusual or could be read two ways

| What | Which | How it is handled |
|---|---|---|
| A title used twice | "Technology Improvements": 156 (Mobility) and 204 (Fleet & Inventory) | two different requests; both kept; the screen shows the business unit under each title |
| Budget IDs shared by several requests | 16 IDs; the most shared is A446562 (requests 338 to 345) | the Budget ID is shown and searchable but is not used as a key |
| Requests with more than one Budget ID | 9 | all IDs kept as printed |
| A department printed in more than one way | "Calgary Police Services"; "Law, Legislative Services, & Security"; "People, Innovation & Collaboration Services" | kept as printed; grouped through `crosswalk.json`; the match is listed under Data checks |
| A business unit spelled differently from the open data | "Calgary Police Services"; "Calgary Fire Department"; "GM - Planning and Development"; "Marketing & Communications"; "Parks & Open Spaces" | the same |
| A business unit that is not in the open data | "Chief Operating Officer" (request 292, operating) | recorded as not matched |
| Reason printed in short form | 44 "Explicit", 145 "Explicit", 219 "Implicit" | kept as printed; grouped with the full wording for filtering |
| Funding table not on the first page of the request | capital requests 26, 27, 28, 30, 31, 32, 33 | read from the second page; the page link goes to the first page of the request |
| Long requests | 26 (3 pages), 27 (3 pages), 28 (3 pages), 30 (3 pages), 31 (3 pages), 32 (4 pages), 33 (3 pages), 65 (3 pages), 104 (13 pages) | one table each; nothing else is taken from the extra pages |
| No amount above zero in the table | operating requests 298, 316 | shown as printed (0.0 or a dash); 316 carries a City note with its full amount |
| No risk rating printed | operating requests 1, 6, 273, 278 | shown as "not stated" |
| No performance measure printed | 12 operating requests | shown as "no measure stated" |
| Money in 2031 or later | request 28 (26,741 thousand) | shown in its own column; counted in the total, not in 2027 to 2030 |
| A City note under the table | 20 operating requests; 17 of them state a larger full one-time amount | flagged on the request; the full amount is now kept (finding 1.9) |
| Text that mentions a larger request than the table | capital requests 179 and 272 (in the risk text) | prose: linked, not copied; no figure taken from it |
| Operating or capital? | none ambiguous: each request carries exactly one of the two layouts | |
| Which Council priority? | none ambiguous: the priority printed on each request equals the contents section it sits in, for all 384 | |

## The sample read by eye

Chosen so that every combination of department and kind in the document is covered (20 of them): the largest request of each, one drawn at random of each (fixed seed 20261111, so the draw can be repeated), and the unusual ones.

| No. | Kind | Page | Department | Why chosen |
|---:|---|---:|---|---|
| 1 | operating | 11 | Corporate Planning & Financial Services | first case, one page |
| 4 | operating | 16 | Corporate Planning & Financial Services | drawn at random in Corporate Planning & Financial Services (operating) |
| 9 | operating | 25 | Operational Services | drawn at random in Operational Services (operating) |
| 14 | operating | 35 | Corporate Programs | City note: only part of the amount is in the budget (the largest such case) |
| 18 | capital | 43 | Operational Services | names one ward |
| 26 | capital | 59 | Infrastructure Services | drawn at random in Infrastructure Services (capital) |
| 28 | capital | 65 | Infrastructure Services | the only request with money in 2031 or later |
| 31 | capital | 73 | Infrastructure Services | largest in Infrastructure Services (capital) |
| 32 | capital | 76 | Infrastructure Services | 4-page request, table on its second page |
| 55 | capital | 125 | Operational Services | largest in Operational Services (capital) |
| 78 | capital | 172 | Operational Services | drawn at random in Operational Services (capital) |
| 82 | capital | 180 | Community Services | largest in Community Services (capital) |
| 104 | operating | 224 | Calgary Police Service | largest in Calgary Police Service (operating) |
| 124 | operating | 275 | Community Services | largest in Community Services (operating); its City note uses different words |
| 130 | capital | 287 | Calgary Police Services | drawn at random in Calgary Police Services (capital) |
| 131 | capital | 289 | Calgary Police Services | largest in Calgary Police Services (capital) |
| 148 | capital | 323 | Community Services | drawn at random in Community Services (capital) |
| 152 | capital | 331 | Law, Legislative Services, & Security | largest in Law, Legislative Services, & Security (capital) |
| 173 | operating | 373 | Operational Services | largest in Operational Services (operating) |
| 174 | operating | 375 | Planning & Development Services | drawn at random in Planning & Development Services (operating) |
| 219 | capital | 465 | Planning & Development Services | largest in Planning & Development Services (capital) |
| 231 | operating | 489 | Community Services | drawn at random in Community Services (operating) |
| 240 | capital | 507 | Civic Partners | largest in Civic Partners (capital) |
| 241 | capital | 509 | Civic Partners | drawn at random in Civic Partners (capital) |
| 253 | operating | 533 | Planning & Development Services | largest in Planning & Development Services (operating) |
| 267 | capital | 561 | Planning & Development Services | drawn at random in Planning & Development Services (capital) |
| 275 | operating | 576 | Council | largest in Council (operating) |
| 276 | operating | 578 | People, Innovation & Collaboration Services | largest in People, Innovation & Collaboration Services (operating) |
| 286 | operating | 598 | People, Innovation & Collaboration Services | drawn at random in People, Innovation & Collaboration Services (operating) |
| 292 | operating | 609 | Chief Operating Office | largest in Chief Operating Office (operating) |
| 293 | operating | 611 | Operational Services | City note splitting the amount among units |
| 294 | operating | 613 | Corporate Planning & Financial Services | largest in Corporate Planning & Financial Services (operating) |
| 310 | operating | 644 | Law, Legislative Services & Security | largest in Law, Legislative Services & Security (operating) |
| 314 | operating | 651 | Chief Administrator's Office | largest in Chief Administrator's Office (operating) |
| 316 | operating | 655 | Planning & Development Services | table shows 0.0 |
| 359 | capital | 741 | Law, Legislative Services, & Security | drawn at random in Law, Legislative Services, & Security (capital) |
| 365 | capital | 753 | Corporate Planning & Financial Services | largest in Corporate Planning & Financial Services (capital) |
| 369 | capital | 761 | People, Innovation & Collaboration Services | largest in People, Innovation & Collaboration Services (capital) |
| 381 | capital | 785 | People, Innovation & Collaboration Services | drawn at random in People, Innovation & Collaboration Services (capital) |
| 384 | capital | 791 | Law, Legislative Services, & Security | last case |

Result: every figure and category visible in the 40 pictures equals the dataset. Request 124's note states its full one-time amount in different words from the other sixteen ("requirement" where the others say "request for this initiative"). The first version of the new field missed it; the reader was widened and the field now holds 17 requests.

## Findings

### 2.1 Complete list of all 384 business cases

**PASS.** Number, title, kind, first page, pages, department, business unit and funding for every request, with every amount by year, purpose, ward, stage, funding source and Budget ID in the CSV file.

- Evidence: evidence/pdf/all-384-cases.md; evidence/pdf/all-384-cases.csv (43 columns)
- To repeat: `python3 evidence/tools/list_cases.py ui/budget-intel/business-cases.json evidence/pdf/third-reading.json out.csv out.md`

### 2.2 No case is missing

**PASS.** The PDF has 792 pages; 10 are the cover and contents. Every page from 11 to 792 belongs to exactly one case (none unclaimed, none claimed twice). The numbers run 1 to 384 with none missing or repeated, in page order, and the first line of each of the 384 start pages begins with that case's number. No other page begins like a case heading.

- Evidence: evidence/pdf/pdf-checks.json (completeness)
- To repeat: `python3 evidence/tools/plumb.py <pdf> pages.json; python3 evidence/tools/pdf_checks.py pages.json ui/budget-intel/business-cases.json ui/budget-intel/crosswalk.json <sample.json> out.json`

### 2.3 Duplicated cases

**PASS.** No case appears twice. One title is used by two different requests: "Technology Improvements" (156, Mobility, $6.0 million; 204, Fleet & Inventory, $14.5 million). 16 Budget IDs are each shared by 2 to 8 requests (the most shared: A446562, by requests 338 to 345), and 9 requests carry more than one Budget ID; 247 distinct IDs in all. A Budget ID is therefore not a key for a request, and the centre does not use it as one.

- Evidence: evidence/pdf/pdf-checks.json (duplicates_and_oddities)
- To repeat: as 2.2

### 2.4 Ambiguously classified or unusual cases

**PASS.** Identified and listed, none silently resolved: three department names and five business-unit names are printed in more than one way (matched by hand in crosswalk.json, never changed in the data); one business unit ("Chief Operating Officer", request 292) is not in the open data; three capital requests print the reason in short form (44 and 145 "Explicit", 219 "Implicit"); seven capital requests have their funding table on their second page (26, 27, 28, 30, 31, 32, 33); request 104 runs to 13 pages and request 32 to four; two operating requests show no amount above zero (298 and 316); four operating requests print no risk rating (1, 6, 273, 278) and 12 print no performance measure; one request has money in 2031 or later (28, $26.741 million); 20 operating requests carry a City note under the table, 17 of which state a larger full amount (finding 1.9). Two capital requests (179 and 272) say in their risk text that the amount is less than the full planning request; that is prose, which the centre links to and does not copy.

- Evidence: evidence/pdf/pdf-checks.json
- To repeat: as 2.2

### 2.5a Every case read again with a third, independent PDF reader

**PASS.** All 384 requests, not a sample: 8,048 comparisons of 35 kinds (every amount by year, the 10-year needs, the purpose percentages, positions, titles, departments, business units, reasons, wards, stages, funding sources, Budget IDs, risk ratings, the "Required" mark, the City-note mark and the full one-time amounts). 8,048 agree; 0 differ. This reader (pdfplumber) places each number in its column by its position on the page, a different method from the first two readings.

- Evidence: evidence/pdf/third-reading.json
- To repeat: `python3 evidence/tools/plumb_words.py <pdf> words.json; python3 evidence/tools/verify_plumber.py words.json ui/budget-intel/business-cases.json out.json`

### 2.5b The third reading does notice wrong values

**PASS.** 21 wrong values of different kinds were planted in a copy of the dataset (a total off by one, two years swapped, a ward changed, a dash turned into 0.0, a word dropped from a title, and others). All 21 were reported, and nothing else was (0 false alarms).

- Evidence: evidence/pdf/mutation-test.json
- To repeat: `python3 evidence/tools/mutation_test.py evidence/tools/verify_plumber.py words.json ui/budget-intel/business-cases.json work out.json`

### 2.5c A sample read by eye from pictures of the City's pages

**PASS.** 40 requests (21 capital, 19 operating) covering all 20 combinations of department and kind in the document: the largest request in each, one drawn at random in each, and the unusual ones. Every figure and category in the pictures equals the dataset. The pictures are not kept in this public repository because they are pages of the City's document; the list of what was checked is.

- Evidence: evidence/pdf/pdf-checks.json (check_by_eye)
- To repeat: `python3 evidence/tools/visual_sample.py <pdf> words.json ui/budget-intel/business-cases.json <sample.json> <out-dir>, then look at the sheets`

### 2.5d What the check by eye found

**PASS.** Request 124's note states its full one-time amount in different words from the other sixteen ("requirement" where the others say "request for this initiative"). The first version of the new field missed it; the reader was widened and the field now holds 17 requests. This is why a sample by eye was worth doing on top of three machine readings.

- Evidence: evidence/pdf/pdf-checks.json; tools/budget_intel_extract.py
- To repeat: Open the City's PDF at page 275

### 2.6 Differences between the PDF reading methods

**PASS.** Four ways of reading were used: pdftotext with page layout (the reader that makes the dataset; columns by character position), pypdf (row labels followed by their numbers), pdfplumber (numbers placed by position on the page) and pictures read by eye. The three text readers give exactly the same words on 736 of 792 pages (pdftotext and pdfplumber) and differ elsewhere only in how they split hyphenated words in sentences ("long-term"). They give the same numbers on 787 of 792 pages; the five pages that differ are three contents pages and two sentences of prose, none in a funding table. Details and limits are in section 2.

- Evidence: evidence/pdf/engine-differences.json
- To repeat: `python3 evidence/tools/compare_engines.py <pdf> pages.json out.json`
