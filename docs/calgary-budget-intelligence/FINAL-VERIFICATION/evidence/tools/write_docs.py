"""Writes the report pages (README and the five section pages) from findings.json and the evidence files.
usage: python3 write_docs.py <FINAL-VERIFICATION dir> <extra.json>"""
import sys, json, os
FV, extra = sys.argv[1], json.load(open(sys.argv[2]))
E = os.path.join(FV, 'evidence'); J = lambda *p: json.load(open(os.path.join(E, *p), encoding='utf-8'))
D = json.load(open(os.path.join(FV, 'findings.json'), encoding='utf-8')); F = D['findings']
fin, pdfc, third, eng = J('financial', 'financial-audit.json'), J('pdf', 'pdf-checks.json'), J('pdf', 'third-reading.json'), J('pdf', 'engine-differences.json')
ba, runs, tasks, src = J('refresh', 'before-after.json'), J('refresh', 'runs.json'), J('refresh', 'scheduled-tasks.json'), J('financial', 'sources-read.json')
built, inv, ux, steps, dsd = J('code', 'built-files.json'), J('code', 'changed-files.json'), J('ux', 'ux-results.json'), J('code', 'build-steps.json'), J('code', 'dataset-before-after.json')
BC = json.load(open(extra['dataset'], encoding='utf-8')); C = BC['cases']
m = lambda v, d=1: f'{v:,.{d}f}'
sg = lambda v: '0.0' if abs(v) < 0.05 else f'{v:+,.1f}'
sec = lambda n: [f for f in F if f['id'].startswith(str(n) + '.')]
cnt = lambda L: {r: sum(1 for f in L if f['result'] == r) for r in ('PASS', 'FAIL', 'UNVERIFIED')}
def blocks(L):
    o = []
    for f in L:
        o.append(f"### {f['id']} {f['finding']}\n\n**{f['result']}.** {f['what_was_found']}\n\n- Evidence: {f['evidence']}\n- To repeat: `{f['how_to_repeat']}`\n" if f['how_to_repeat'].startswith(('python3', 'git ', 'gh ', 'node ', 'cd ', 'grep ')) else
                 f"### {f['id']} {f['finding']}\n\n**{f['result']}.** {f['what_was_found']}\n\n- Evidence: {f['evidence']}\n- To repeat: {f['how_to_repeat']}\n")
    return '\n'.join(o)
HEAD = lambda title: f"# {title}\n\nPart of the second-stage verification of the Budget Intelligence branch (`budget-intelligence`), written {extra['written']}. Nothing here was published, merged or deployed. Start with [README.md](README.md).\n\n"
NAMES = {1: 'Financial reconciliation', 2: 'PDF extraction', 3: 'Daily refresh and backup', 4: 'Code and security', 5: 'User experience'}
FILES = {1: '1-FINANCIAL-RECONCILIATION.md', 2: '2-PDF-EXTRACTION.md', 3: '3-REFRESH-AND-BACKUP.md', 4: '4-CODE-AND-SECURITY.md', 5: '5-USER-EXPERIENCE.md'}

# =================================================================== section 1
h = fin['headline_21_billion']; a2 = fin['approved_capital_two_datasets']; gl = a2['green_line']; bu = fin['proposed_capital_by_business_unit']; nc = fin['new_capital_13_05_billion']; pos = fin['positions']; od = fin['open_data_nnnm']
Y6 = a2['years']
s1 = HEAD('1. Financial reconciliation') + f"""All amounts are in millions of dollars unless a line says otherwise. Every figure below is worked out by `evidence/tools/fin_audit.py` from four files: the business cases, the names crosswalk, and the City's two open datasets as downloaded on November 11, 2026 (copies in `evidence/financial/`, with their checksums in `sources-read.json`). No source figure is changed anywhere.

## The $21 billion headline and the $19.98 billion in the open data

| City open data `nnnm-9sfh`, fund = Capital | 2027 | 2028 | 2029 | 2030 | 2027 to 2030 | 2031 | 2032 | All years |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Approved in earlier budgets | {' | '.join(m(od['capital_approved_m'][y], 2) for y in Y6[:4])} | **{m(h['open_data_2027_2030_m']['approved_in_earlier_budgets'], 2)}** | {m(od['capital_approved_m']['2031'], 2)} | {m(od['capital_approved_m']['2032'], 2)} | {m(sum(od['capital_approved_m'].values()), 2)} |
| Proposed (new) | {' | '.join(m(od['capital_proposed_m'][y], 2) for y in Y6[:4])} | **{m(h['open_data_2027_2030_m']['proposed'], 2)}** | {m(od['capital_proposed_m']['2031'], 2)} | {m(od['capital_proposed_m']['2032'], 2)} | {m(sum(od['capital_proposed_m'].values()), 2)} |
| Both | {' | '.join(m(od['capital_approved_m'][y] + od['capital_proposed_m'][y], 2) for y in Y6[:4])} | **{m(h['open_data_2027_2030_m']['total'], 2)}** | {m(h['open_data_all_years_in_the_dataset_m']['2031'], 2)} | {m(h['open_data_all_years_in_the_dataset_m']['2032'], 2)} | **{m(h['open_data_all_years_in_the_dataset_m']['total'], 2)}** |

- 2027 to 2030: ${m(h['open_data_2027_2030_m']['total'] / 1000, 2)} billion, which rounds to $20 billion.
- All years in the dataset (2027 to 2032): ${m(h['open_data_all_years_in_the_dataset_m']['total'] / 1000, 2)} billion, which rounds to $21 billion.
- The City's wording (its budget page and news release, read November 11): $21 billion of recommended capital over four years, of which $13 billion is new capital infrastructure. The pages do not say which rows the $21 billion covers.

So the arithmetic is settled (PASS) and the reason for the headline is not (UNVERIFIED): the only sum of published rows that gives 21 includes 2031 and 2032. The centre shows the open-data sums, shows the headline as the City's, and uses it in no calculation.

## 2028: $1,440 million or $2,570 million of capital already approved

Two City datasets hold "capital already approved" for 2027 onward. The older one (`fqax-i3nz`, the 2023 to 2026 budget; its rows were last updated {src['datasets'][1]['rows_last_updated'][:10]}) and the newer one (`nnnm-9sfh`, the 2027 to 2030 budget; rows last updated {src['datasets'][0]['rows_last_updated'][:10]}).

| Capital already approved | {' | '.join(Y6)} | Six years |
|---|{'---:|' * 7}
| Newer dataset (`nnnm-9sfh`) | {' | '.join(m(v, 1) for v in a2['newer_total_m'])} | {m(a2['six_year_total_m']['newer'], 1)} |
| Older dataset (`fqax-i3nz`) | {' | '.join(m(v, 1) for v in a2['older_total_m'])} | {m(a2['six_year_total_m']['older'], 1)} |
| Newer minus older | {' | '.join(sg(v) for v in a2['difference_m'])} | {sg(a2['six_year_total_m']['difference'])} |
| of which Green Line | {' | '.join(sg(v) for v in gl['difference_m'])} | {sg(gl['six_year_total_m']['newer'] - gl['six_year_total_m']['older'])} |
| of which everything else | {' | '.join(sg(v) for v in a2['everything_else_difference_m'])} | {sg(sum(a2['everything_else_difference_m']))} |

| Green Line | {' | '.join(Y6)} | Six years |
|---|{'---:|' * 7}
| Newer ("{gl['newer_name']}") | {' | '.join(m(v, 1) for v in gl['newer_m'])} | {m(gl['six_year_total_m']['newer'], 1)} |
| Older ("{gl['older_name']}") | {' | '.join(m(v, 1) for v in gl['older_m'])} | {m(gl['six_year_total_m']['older'], 1)} |

The Green Line's six-year total is the same in both; the newer dataset puts ${m(gl['difference_m'][0], 1)} million more of it in 2027 and ${m(gl['difference_m'][1], 1)} million more in 2028, and less in every later year. For 2028 that is ${m(gl['difference_m'][1], 1)} million of the ${m(a2['difference_m'][1], 1)} million difference. The rest, by business unit (2028, newer minus older, differences of $5 million or more):

| Business unit, as each dataset names it | Newer | Older | Difference |
|---|---:|---:|---:|
""" + '\n'.join(f"| {r['business_unit']} | {m(r['newer_m'], 1)} | {m(r['older_m'], 1)} | {sg(r['difference_m'])} |" for r in a2['by_business_unit_2028'] if abs(r['difference_m']) >= 5) + f"""

That money was moved between years, and that the two datasets are ten months apart, is read from the figures; the City has not published a reconciliation (UNVERIFIED as to the reason). The centre uses the newer dataset for 2027 to 2030, shows both figures under Data checks, and now shows this unit-by-unit table there, worked out from the day's data.

## The six business units that do not match

Proposed (new) capital for 2027 to 2030, the 260 business cases against the open data's "Proposed" rows, business unit by business unit. {bu['match_within_1_million']} of {bu['units_compared']} units match within $1 million in total and in every year. The six that do not:

| Business unit | | 2027 | 2028 | 2029 | 2030 | 2027 to 2030 |
|---|---|---:|---:|---:|---:|---:|
""" + '\n'.join(f"| **{u['business_unit']}** | business cases | {' | '.join(m(v, 1) for v in u['business_cases_m'])} | {m(sum(u['business_cases_m']), 1)} |\n| | open data | {' | '.join(m(v, 1) for v in u['open_data_proposed_m'])} | {m(sum(u['open_data_proposed_m']), 1)} |\n| | difference | {' | '.join(sg(v) for v in u['difference_m'])} | **{u['difference_2027_2030_m']:+,.1f}** |" for u in bu['units'] if u.get('exception')) + f"""

They net to {bu['net_of_exceptions_m']:+,.1f} over the four years. All 33 units together differ by {' / '.join(f'{v:+,.2f}' for v in bu['net_of_all_units_by_year_m'])} in 2027 / 2028 / 2029 / 2030 (the open data rounds each line to $0.1 million).

What the differences equal:

| Business unit | Difference | Request or requests with the same amounts | How close |
|---|---:|---|---|
""" + '\n'.join(f"| {u['business_unit']} | {u['difference_2027_2030_m']:+,.1f} | " + (' + '.join(f"{x['n']}. {x['title']} ({m(sum(x['by_year_m']), 1)})" for x in u['requests_that_equal_the_difference']['requests']) + f" | {u['requests_that_equal_the_difference']['strength']}; largest yearly gap ${m(u['requests_that_equal_the_difference']['largest_yearly_gap_m'], 2)} million |" if u.get('requests_that_equal_the_difference') else ('the 2027 amount of request 193, Mobility Network Gaps (1.165): the open data has nothing for this unit in 2027 | exact for 2027; the other years match |' if u['business_unit'] == 'City & Regional Planning' else f"the other five differences together ({m(sum(x['difference_2027_2030_m'] for x in bu['units'] if x.get('exception') and x['difference_2027_2030_m'] > 0))}) | leaves {m(abs(bu['net_of_exceptions_m']))}, the net of the six |")) for u in sorted((u for u in bu['units'] if u.get('exception')), key=lambda u: -u['difference_2027_2030_m'])) + f"""

Reading: the open data appears to file these requests under Public Spaces Delivery, and the business cases under the unit that asks for them. Three of the matches are a single request that equals the difference in every year, which is strong; the Project Development match is a combination of three requests, which is weaker. The City has published no mapping, so the explanation is an inference (UNVERIFIED); the amounts themselves are checked (PASS). The screen's check now names the single-request matches, worked out from the day's data.

## New capital: $13.05 billion and its four purposes

| | $ thousands | $ millions |
|---|---:|---:|
| Sum of the 260 stated totals ("4-Year Capital Budget Consideration") | {nc['sum_of_stated_totals_k']:,} | {m(nc['sum_of_stated_totals_k'] / 1000, 1)} |
""" + '\n'.join(f"| {k.replace('_', ' ')} | {v:,} | {m(v / 1000, 1)} |" for k, v in nc['by_year_k'].items()) + f"""
| Sum of the five year columns | {nc['sum_of_the_year_columns_k']:,} | {m(nc['sum_of_the_year_columns_k'] / 1000, 1)} |
| Stated totals minus year columns (the City's rounding inside 77 requests) | {nc['stated_totals_minus_year_columns_k']} | |

| Purpose (the City's own percentage for each request, times the request's total) | $ millions | Share |
|---|---:|---:|
""" + '\n'.join(f"| {k.replace('_', ' ').capitalize()} | {m(v)} | {v / nc['purposes_add_to_m'] * 100:.1f}% |" for k, v in nc['by_purpose_m'].items()) + f"""
| All four | {m(nc['purposes_add_to_m'])} | 100% |

{nc['cases_with_one_purpose_only']} requests have one purpose only; {nc['cases_with_a_mixed_purpose']} are split by the City between two or more. The dollar amounts by purpose are a calculation and are labelled "Calculated" on the screen; the City publishes the percentages, not the dollars.

## Positions: 855 in 2027

| | 2027 | 2028 | 2029 | 2030 | Four years |
|---|---:|---:|---:|---:|---:|
| Full-time equivalents in the FTE rows of the 124 operating requests | {' | '.join(f'{v:,}' for v in pos['by_year'].values())} | {pos['four_years']:,} |

2027 by department, as the document prints the names: """ + '; '.join(f"{k} {v}" for k, v in pos['2027_by_department'].items() if v) + f""". {pos['cases_with_positions_in_2027']} of the 124 requests have a figure for 2027.

- Period: each column is what the requests add in that year. The columns are not running totals.
- Calculation: a plain sum of the cells; a dash counts as nothing; no request is counted twice.
- Limit: these are the positions in the requests' own rows. Request 104 (Calgary Police) shows 17 for 2027 and its text also refers to 275 officers and 191 civilian positions for the present level of service that are not in its row. So 855 is not a figure for the City's whole change in staff, and no City total was found to compare it with.

## One-time requests that are only partly in the proposed budget (found by this audit)

| Request | In the table | Full amount in the City's note |
|---|---:|---:|
""" + '\n'.join(f"| {c['n']}. {c['title'][:90]} | {m(sum(v or 0 for v in c['one_time_m']))} | {m(c['full_one_time_m'])} |" for c in C if 'full_one_time_m' in c) + f"""
| **17 requests** | **{m(fin['operating']['requests_only_partly_in_the_budget']['in_their_tables_m'])}** | **{m(fin['operating']['requests_only_partly_in_the_budget']['full_requests_stated_m'])}** |

The centre's one-time total (${m(fin['operating']['one_time_m_four_years'])} million over four years) adds the tables. Where a note's own wording of the included amount differs from the table by $0.1 million (for example request 175: table 1.8, note 1.7) that is the City's rounding; nothing is adjusted.

## Formulas, source fields, units and rounding

| Figure | Formula | Source fields | Units | Rounding |
|---|---|---|---|---|
| A capital request's amount | as printed | `cap_k[0]` (row "4-Year Capital Budget Consideration", column Total) | $ thousands in the file; divided by 1,000 to show $ millions | shown to one decimal ($ millions) or two ($ billions) |
| New capital, total | sum over the 260 capital requests | `cap_k[0]` | $ thousands, then / 1,000 or / 1,000,000 | sum first, round once |
| New capital by year | sum by column | `cap_k[1]` to `cap_k[4]` (2027 to 2030), `cap_k[5]` (2031 and later) | as above | as above |
| Capital by purpose | sum of amount x percentage / 100 | `cap_k[0]`, `split[0..3]` | as above | as above |
| One-time operating | sum of the cells | `one_time_m[0..3]` (row "One-time ($M)") | $ millions as printed (one decimal) | sum, then one decimal |
| Ongoing added in a year | sum of the cells for that year | `ongoing_m[i]` (row "Ongoing ($M)") | $ millions as printed | sum, then one decimal |
| One request's ongoing amount | sum of its four yearly cells, as the City does in its own notes | `ongoing_m[0..3]` | $ millions | one decimal |
| Positions | sum of the cells | `ftes[i]` (row "FTEs") | full-time equivalents, whole numbers | none needed |
| Full one-time amount | as stated in the City's note | `full_one_time_m` | $ millions | as printed |
| Open data, proposed capital | sum of rows where `fund` = Capital and `budget_status` = Proposed, by `year` | `budget_millions` (dataset `nnnm-9sfh`) | $ millions, one decimal per row | sum, then compare |
| Reconciliation by year | (sum of `cap_k[year]` / 1,000) minus open data; passes if within 0.5% | both | $ millions | none before comparing |
| Reconciliation by business unit | the same, grouped by business unit; listed if the difference is over $1 million | `bu` (document) matched to `bu` (open data) through `crosswalk.json` for five spellings | $ millions | none before comparing |
| Capital already approved | sum of rows where `fund` = Capital and `budget_status` = Approved | `budget_millions` (`nnnm-9sfh`); `budget` (`fqax-i3nz`) | $ millions | one decimal for display |
| Requests naming a ward | count of capital requests whose ward list includes the ward | `wards` | requests | none; dollars are never divided between wards |
| Share for all wards | sum of amounts where `wards` = all, divided by the total | `cap_k[0]`, `wards` | per cent | {m(sum(c['cap_k'][0] for c in C if c['type'] == 'capital' and c['wards'] == 'all') / nc['sum_of_stated_totals_k'] * 100, 1)}%, shown as "about 92%" |
| Tax simulator | assessed value x 2026 municipal residential rate x (1 + chosen %) | `tax.json` rate; the visitor's inputs | dollars | nearest dollar |

Rules that apply everywhere: a dash in a City table is kept as a dash and counts as nothing in a sum; nothing is rounded before it is added; names are kept exactly as printed and matched, never rewritten; where two City sources disagree both are shown; "ongoing" amounts are additions to the base budget in that year and no four-year cash cost is worked out.

## Findings

""" + blocks(sec(1))
open(os.path.join(FV, FILES[1]), 'w', encoding='utf-8').write(s1)

# =================================================================== section 2
c = pdfc['completeness']; o = pdfc['duplicates_and_oddities']; eye = pdfc['check_by_eye']; pr = eng['pairs']
kinds = {}
for r in third['cases']:
    for k2 in r['checks']: kinds[k2] = kinds.get(k2, 0) + 1
s2 = HEAD('2. PDF extraction') + f"""The source is the City of Calgary's "2027-2030 budget request business cases": {c['pages_in_the_pdf']} pages, {src['pdf']['bytes']:,} bytes, sha256 `{src['pdf']['sha256']}`, last changed by the City on November 9, 2026. It was downloaded again on November 11 for this audit and is the same file.

The complete list of the 384 cases is in [`evidence/pdf/all-384-cases.md`](evidence/pdf/all-384-cases.md) (number, title, kind, page, department, business unit, funding) and [`evidence/pdf/all-384-cases.csv`](evidence/pdf/all-384-cases.csv) (43 columns: every amount by year, the purposes, wards, stage, funding source, Budget ID, and the result of the third reading for each case).

## The four readings and how they differ

| Reading | Tool | How it finds a figure | What it covers | Result |
|---|---|---|---|---|
| 1 | pdftotext 24.02.0 with page layout (the reader that makes the dataset, `tools/budget_intel_extract.py`) | finds the row by its label and cuts columns by character position; stops and writes nothing if any row has the wrong number of figures | every field of all 384 cases | 384 cases, no problem reported |
| 2 | pypdf 6.17.0 | finds the row label and takes the numbers that follow it, in order | the five kinds of figure row and the purpose percentages of all 384 cases | {extra['pypdf_rows']:,} rows agree, 0 differ |
| 3 | pdfplumber 0.11.10 (pdfminer.six), added for this audit | takes each word with its position on the page and puts a number under the column heading whose right edge it lines up with | {len(kinds)} kinds of comparison on all 384 cases: every figure and every category | {third['agree']:,} of {third['comparisons']:,} agree, {third['differ']} differ |
| 4 | pictures of the pages (pdftoppm), read by eye | a person-style reading of the City's own table next to the dataset's values | {len(eye['requests'])} requests across all {eye['groups_in_the_document']} combinations of department and kind | all agree; one omission found (below) |

How the text readers differ from each other: pdftotext and pdfplumber give exactly the same words on {pr['pdftotext -layout (poppler 24.02.0) | pdfplumber 0.11.10 (pdfminer.six)']['pages_with_exactly_the_same_words']} of 792 pages; pypdf agrees with pdftotext word for word on {pr['pdftotext -layout (poppler 24.02.0) | pypdf 6.17.0']['pages_with_exactly_the_same_words']}. Where they differ it is in sentences: one reader keeps "long-term" as one word and another splits it, and a special hyphen is kept or dropped. All three give the same numbers on {eng['pages_where_all_three_give_the_same_numbers']} of 792 pages; the other five are three contents pages (a page number joined to or split from a dot leader) and two sentences of prose (pages 70 and 574). None is in a funding table.

What each reading is weak at, and why more than one was used:

- Reading 1 depends on the columns lining up as characters. It is strict: a row with the wrong number of figures stops it. It cannot notice a figure that sits in the wrong column but still lines up.
- Reading 2 would be fooled by an empty cell (the next number would slide left). The document never leaves a cell empty (it prints a dash), which the strict count in reading 1 confirms.
- Reading 3 does not depend on spacing or on order, only on where the number sits on the page, so it catches what the first two could miss. It was itself tested by planting 21 wrong values (finding 2.5b).
- Reading 4 is the only one that does not depend on any text extraction. It found what the three machine readings could not: a note worded differently from the rest.

Fields that no machine reading covers: none of the figures; of the text fields, the performance measure is checked only for the presence of its words (it wraps across lines in the document). The City's descriptions, benefits and risk statements are deliberately not in the dataset.

## Completeness

| Check | Result |
|---|---|
| Pages in the PDF | {c['pages_in_the_pdf']} ({c['front_pages_before_the_first_case']} front pages: cover and contents) |
| Pages from the first case ({c['first_case_page']}) to the last ({c['last_page_covered']}) that belong to no case | {len(c['pages_between_not_in_any_case'])} |
| Pages claimed by more than one case | {len(c['pages_in_more_than_one_case'])} |
| Numbers 1 to 384, none missing or repeated | {'yes' if c['case_numbers_are_1_to_384_with_none_missing_or_repeated'] else 'NO'} |
| Cases in page order follow the numbering | {'yes' if c['cases_in_page_order_follow_the_numbering'] else 'NO'} |
| Start pages whose first line begins with the case's number | {c['first_line_of_each_case_start_page_begins_with_its_number']} of 384 |
| Other pages that begin like a case heading | {c['other_pages_that_begin_like_a_case_heading']} |
| Pages per case | """ + ', '.join(f"{v} case{'s' if v != 1 else ''} of {k} page{'s' if k != '1' else ''}" for k, v in o['pages_per_case'].items()) + f""" |

## Duplicates, and cases that are unusual or could be read two ways

| What | Which | How it is handled |
|---|---|---|
| A title used twice | "Technology Improvements": 156 (Mobility) and 204 (Fleet & Inventory) | two different requests; both kept; the screen shows the business unit under each title |
| Budget IDs shared by several requests | {len(o['budget_ids']['shared_by_more_than_one_case'])} IDs; the most shared is A446562 (requests 338 to 345) | the Budget ID is shown and searchable but is not used as a key |
| Requests with more than one Budget ID | {o['budget_ids']['capital_cases_with_more_than_one_id']} | all IDs kept as printed |
| A department printed in more than one way | """ + '; '.join(f'"{k}"' for k in o['names_printed_in_more_than_one_way']) + f""" | kept as printed; grouped through `crosswalk.json`; the match is listed under Data checks |
| A business unit spelled differently from the open data | """ + '; '.join(f'"{k}"' for k in o['business_unit_names_matched_by_hand']) + f""" | the same |
| A business unit that is not in the open data | "Chief Operating Officer" (request 292, operating) | recorded as not matched |
| Reason printed in short form | """ + ', '.join(f"{n} \"{r}\"" for n, r in o['reason_given_printed_in_short_form']) + f""" | kept as printed; grouped with the full wording for filtering |
| Funding table not on the first page of the request | capital requests {', '.join(map(str, pdfc['classification']['capital_cases_whose_table_is_not_on_their_first_page']))} | read from the second page; the page link goes to the first page of the request |
| Long requests | """ + ', '.join(f"{n} ({p} pages)" for n, t, p in o['cases_of_three_or_more_pages']) + f""" | one table each; nothing else is taken from the extra pages |
| No amount above zero in the table | operating requests {', '.join(map(str, o['operating_cases_whose_table_holds_no_amount_above_zero']))} | shown as printed (0.0 or a dash); 316 carries a City note with its full amount |
| No risk rating printed | operating requests {', '.join(map(str, o['operating_cases_with_no_risk_rating_printed']))} | shown as "not stated" |
| No performance measure printed | {o['operating_cases_with_no_performance_measure_printed']} operating requests | shown as "no measure stated" |
| Money in 2031 or later | request 28 (26,741 thousand) | shown in its own column; counted in the total, not in 2027 to 2030 |
| A City note under the table | {len(o['operating_cases_with_a_city_note_under_the_table'])} operating requests; {len(o['of_which_state_a_larger_full_one_time_amount'])} of them state a larger full one-time amount | flagged on the request; the full amount is now kept (finding 1.9) |
| Text that mentions a larger request than the table | capital requests 179 and 272 (in the risk text) | prose: linked, not copied; no figure taken from it |
| Operating or capital? | none ambiguous: each request carries exactly one of the two layouts | |
| Which Council priority? | none ambiguous: the priority printed on each request equals the contents section it sits in, for all 384 | |

## The sample read by eye

Chosen so that every combination of department and kind in the document is covered ({eye['groups_in_the_document']} of them): the largest request of each, one drawn at random of each (fixed seed 20261111, so the draw can be repeated), and the unusual ones.

| No. | Kind | Page | Department | Why chosen |
|---:|---|---:|---|---|
""" + '\n'.join(f"| {r['n']} | {r['kind']} | {r['page']} | {r['department']} | {r['why_chosen']} |" for r in eye['requests']) + f"""

Result: every figure and category visible in the 40 pictures equals the dataset. {eye['found']}

## Findings

""" + blocks(sec(2))
open(os.path.join(FV, FILES[2]), 'w', encoding='utf-8').write(s2)

# =================================================================== section 3
s = ba['summary']; R = runs['runs']
s3 = HEAD('3. Daily refresh and backup') + f"""## Workflow files, before and after

Copies of every workflow file as it is on main and as it is on the branch are in `evidence/refresh/workflows/main/` and `evidence/refresh/workflows/branch/` (saved with `.txt` added so that they cannot be mistaken for live workflows).

| Workflow file | Starts on | Schedule (UTC) | sha256 on main | sha256 on the branch | Identical |
|---|---|---|---|---|---|
""" + '\n'.join(f"| `{w['file']}` | {', '.join(w['started_by'])} | {', '.join(w['schedules']) or 'none'} | `{w['main_sha256'][:20]}…` | `{w['branch_sha256'][:20]}…` | {'yes' if w['identical'] else 'NO'} |" for w in ba['workflows']) + f"""

The machine-readable comparison of every file is `evidence/refresh/before-after.json`: {s['files_on_main']} files on main, {s['same']} unchanged, {len(s['changed'])} changed, {len(s['removed'])} removed, {s['added']} added. Counting as "the refresh system" everything under `.github/`, `web/`, `data/` and `gateway/`, every Python file at the top of the repository, and `tools/archive.py` and `tools/news_publish.py`: {s['refresh_system_files_on_main']} files, of which {s['refresh_system_files_same']} are unchanged.

The five that are changed, and what each change is:

| File | What it does in the build | What is added |
|---|---|---|
| `registry.py` | the master list of pages and data files that the assistants read; the build writes it to `data/registry.json` | one entry for the new screen and its two data files |
| `web/search_index.py` | builds the site search index | one entry for the new screen with four of its sections |
| `methods.py` | the "How it is counted" notes; the build writes them to `data/methods.json` | one note for the new screen |
| `analyst.py` | the Data Scientist's list of report topics; the build writes it to `data/analyst_topics.json` | one topic |
| `agent.py` | Data Genie's tools | the new section in the dashboard tool's description and lists, and the two places that answer it |

One file is added to that set: `budget_intel.py` (reads the business cases for the assistants; it only reads). No fetch, no data module, no data file, no schedule and no publishing step is touched.

## Runs

| Run | Workflow | Started by | Commit | Result | Why it matters |
|---|---|---|---|---|---|
""" + '\n'.join(f"| [{r['run_id']}]({r['address']}) | {r['workflow']} | {r['started_by']} | `{r['commit'][:7]}` | {r['result'] or r['status']} | {r['why_it_matters']} |" for r in R) + f"""

Read at {runs['read_at']}. {runs['runs_started_by_this_review']}

## Backup

| | |
|---|---|
| Artifact | `backup-7`, id {extra['artifact']['id']}, from Backup run 42997418780 |
| Size | {extra['artifact']['size']:,} bytes |
| Created / kept until | {extra['artifact']['created']} / {extra['artifact']['expires']} |
| Digest of the artifact | `{extra['artifact']['digest']}` |
""" + '\n'.join(f"| File inside | `{x}` |" for x in extra['artifact']['files']) + f"""
| Branch copy | `backup/pre-budget-intelligence-20261111` at `{runs['backup_branch_commit']}` (the same commit as main) |
| Copy made in the development workspace (first stage) | bundle sha256 `b11e9616…04e2cf`, 887,073,813 bytes; restored there to commit ff42583, 330 files. That workspace is temporary, so this copy is not counted as durable. |

The independent restore test ran on a separate machine and its full output is `evidence/refresh/restore-test-from-the-artifact.txt`. In short: the bundle cloned to commit `ff42583`, tree `ba8f1f74`, 330 tracked files, no changes; `git bundle verify` reported a complete history; `git fsck` found nothing; the site archive holds 847 files (344 MB); and the script bundle rebuilt from the restored code is byte-for-byte the published one.

## Scheduled tasks

| Task | Schedule (Calgary time) | On | Last run | Next run (UTC) | Can it change main? |
|---|---|---|---|---|---|
""" + '\n'.join(f"| {t['name']} | `{t['schedule']}` | {'yes' if t['enabled'] else 'NO'} | {(t['last_run']['fired_at'][:16] + ' ' + t['last_run']['status']) if t['last_run'] else 'not yet (created ' + t.get('created', '')[:10] + ')'} | {t['next_run'][:16]} | {t['touches_main']} |" for t in tasks['calgary_insight_tasks']) + f"""

{extra['followup_note']} Two of these tasks (the daily follow-up and the weekly hand check) can commit to main on their own schedule. None of the files they change is changed by this branch, so they do not conflict with it; but main can move before publication, and the merge has to be checked against main as it is on that day.

## What could not be verified

| Item | Why | What would verify it |
|---|---|---|
| The laptop archive (`tools/archive.py` under Windows Task Scheduler) | it runs on the owner's laptop, out of reach of this review | on the laptop: the task's last result and the date of the newest archive file |
| A full build of the branch with live data | {extra['full_build']['short']} | {extra['full_build']['verify']} |
| A full restore to a public site | it would publish | not authorized |
| That GitHub's own schedule fires tomorrow | cannot be known in advance; it fired about seven hours late on November 10 | the backup morning refresh task covers a late or missed run |
| The values of the build's secrets and settings | only their names were seen, by design | today's successful builds show they work |
| The Cloudflare gateway and the Windows desktop app | not touched and not run | the owner's own check after publication |
| Complete workflow logs | read on GitHub, not copied here | the run addresses in `evidence/refresh/runs.json` |

## Findings

""" + blocks(sec(3))
open(os.path.join(FV, FILES[3]), 'w', encoding='utf-8').write(s3)

# =================================================================== section 4
ex = {x['file']: x for x in inv['existing_files']}
WHY = {
 'ui/index.html': 'One line loads the screen\'s stylesheet. One line adds the tab "Budget Intelligence" under Money, after City budget. Fifteen lines are the empty frame of the screen (a heading, a place for a warning, the list of sections and the content area), which the script fills. One line loads the screen\'s script after `budget.js`. One line, added for the owner\'s request about the assistants, is a suggested question on the Data Genie screen. Nothing else on the page is touched.',
 'registry.py': 'One entry in the list of pages (11 lines): the screen\'s name, what it holds, how the assistants should read it, and its two data files. Declaring the crosswalk file here also stops the build from offering it as a report topic of its own.',
 'web/search_index.py': 'One entry in the list of screens (4 lines), so the site search finds the screen and four of its sections.',
 'agent.py': 'Seven lines of description tell Data Genie what the new section holds and which parts it can ask for. Two existing lines are edited: the list of allowed sections gains `budget_intelligence`, and the list of allowed parts gains seven names (cases, case, departments, priorities, service_areas, wards, checks). Eight lines (two blocks of four) answer the new section in the two places the dashboard tool is answered, by calling `budget_intel.py`. No existing answer is changed.',
 'analyst.py': 'One topic for the Data Scientist (14 lines): what to set out, which tool parts to read, and the rules (label everything proposed, never divide a citywide amount, take no side).',
 'methods.py': 'One "How it is counted" note (25 lines: what is read, how it is added, how it is checked, two steps to check it yourself, seven cautions) and one line that says where the method lives in the code.',
}
cs = inv['changed_since_the_version_examined']
s4 = HEAD('4. Code and security') + f"""## Inventory

Compared with main at `{inv['base_commit']}`. The complete diff is `git diff {inv['base_commit'][:7]} budget-intelligence`; the patch of the six existing files is saved as `evidence/code/existing-files.patch.txt`.

| Existing file | Lines added | Existing lines edited | What was added |
|---|---:|---:|---|
""" + '\n'.join(f"| `{f}` | {ex[f]['added']} | {ex[f]['removed']} | {WHY[f]} |" for f in ('ui/index.html', 'registry.py', 'web/search_index.py', 'agent.py', 'analyst.py', 'methods.py')) + f"""
| **Six files** | **{sum(x['added'] for x in ex.values())}** | **{sum(x['removed'] for x in ex.values())}** | An edited line counts as one line removed and one added, so {sum(x['added'] for x in ex.values()) - sum(x['removed'] for x in ex.values())} lines are purely new. |

The version examined had 31 added lines in three files (`ui/index.html` 18, `registry.py` 9, `web/search_index.py` 4). Those are all still present. The other lines came after: the owner's instruction to make Data Genie and the Data Scientist aware of the new data (`agent.py`, `analyst.py`, `methods.py`, the suggestion chip, and the fuller registry entry).

| New product file | Bytes | What it is |
|---|---:|---|
""" + '\n'.join(f"| `{x['file']}` | {x['bytes']:,} | {x['what']} |" for x in inv['new_product_files']) + f"""

Everything else that is new is documentation and evidence under `docs/calgary-budget-intelligence/` ({inv['new_document_files']} files). Nothing is deleted or renamed.

## What changed on the branch since the version examined (commit `{inv['examined_commit'][:7]}`)

The owner examined the review of commit `{inv['examined_commit'][:7]}`. The branch has changed since, for two instructions from the owner and for what this audit found. Product files changed since then: """ + ', '.join(f"`{p}`" + (' (new)' if st == 'A' else '') for st, p in cs) + f""".

| Change | Why |
|---|---|
| Data Genie and the Data Scientist know the new data (`budget_intel.py`, the tool's lists, a report topic, a method note, a suggested question) | the owner's instruction |
| The commercial opportunity is removed from the plan and the reports | the owner's instruction |
| A new field, the full one-time amount stated in the City's note, on 17 operating requests; shown on the request, listed under Data checks, in the export and known to the assistants | found by this audit (finding 1.9). No existing value changed: {len(dsd['existing_values_changed'])} values differ, {len(dsd['fields_added'])} fields added |
| The check on the two datasets now shows, unit by unit, where the largest yearly difference is; the business-unit check names a single request where one equals the difference | found by this audit (findings 1.2 and 1.3); worked out from the day's data, nothing typed in |
| The "Budget vs actual" note no longer sends readers to the later years on the City budget screen, and says why | found by this audit (finding 1.2d) |
| The keyboard focus stays on the control that was used; the simulator's slider has a label; the list of sections takes the arrow keys | found by this audit (finding 5.7) |
| A link is only made to an http or https address or a page of this site | found by this audit (finding 4.8) |
| A difference that rounds to zero is shown as 0.0, not -0.0 | found by this audit |

## The built files

Building the interface step (`build_site.page`) from main and from the branch:

| | Main | Branch |
|---|---:|---:|
| Files built | {built['main_build_files']} | {built['branch_build_files']} |
| Identical | {built['identical']} | {built['identical']} |

| Changed built file | Main | Branch |
|---|---|---|
| `index.html` | {built['changed']['index.html']['main_bytes']:,} bytes, sha256 `{built['changed']['index.html']['main_sha256'][:16]}…` | {built['changed']['index.html']['branch_bytes']:,} bytes, sha256 `{built['changed']['index.html']['branch_sha256'][:16]}…` |
| the script bundle | `{built['renamed_bundle']['main']}` | `{built['renamed_bundle']['branch']}` |

The bundle's file name is the first ten characters of its own checksum, so a changed bundle has a new name. Proof that it is otherwise the same: removing the one block that the bundler adds for the new script ({built['bundle_check']['block_bytes']:,} bytes) leaves a file whose sha256 is `{built['bundle_check']['sha256_after_removing_the_block'][:16]}…`, the published bundle's own. Added to the build: {', '.join('`' + x + '`' for x in built['added'])}.

The later build steps that read the changed files, run offline from main and from the branch against a copy of the published data:

| Build output | From main | From the branch | Difference |
|---|---:|---:|---|
| `data/methods.json` | {steps['methods.json']['made_from_main_offline']} notes (equal to the published file: {'yes' if steps['methods.json']['main_offline_equals_published_exactly'] else 'NO'}) | {steps['methods.json']['made_from_the_branch']} | added: {', '.join(steps['methods.json']['added_on_the_branch'])}; none changed or removed |
| `data/analyst_topics.json` | {steps['analyst_topics.json']['made_from_main_offline']} topics (equal to the published file: {'yes' if steps['analyst_topics.json']['main_offline_equals_published_exactly'] else 'NO'}) | {steps['analyst_topics.json']['made_from_the_branch']} | added: {', '.join(steps['analyst_topics.json']['added_on_the_branch'])}; none changed or removed |
| `data/registry.json` | {steps['registry.json']['made_from_main_offline']} entries | {steps['registry.json']['made_from_the_branch']} | added: {', '.join(steps['registry.json']['added_on_the_branch'])}; none changed or removed |
| `data/search.json` | {steps['search.json']['rows_from_main']} rows | {steps['search.json']['rows_from_the_branch']} | {len(steps['search.json']['rows_added'])} rows added, {steps['search.json']['rows_removed']} removed |
| files shipped to the browser for the assistants | | {steps['files_shipped_to_the_browser_for_the_assistants']['files']} | new: {', '.join(steps['files_shipped_to_the_browser_for_the_assistants']['new'])} |

## Findings

""" + blocks(sec(4))
open(os.path.join(FV, FILES[4]), 'w', encoding='utf-8').write(s4)

# =================================================================== section 5
grp = {}
for r in ux['results']: grp.setdefault(r['group'], []).append(r)
on = {}
def _dev(t):
    return 'emulated phone (Chromium)' if t.startswith('emulated phone') else 'emulated tablet (Chromium)' if t.startswith('emulated tablet') else 'desktop Chromium (headless)'
for r in ux['results']: on.setdefault(_dev(r['tested_on']), [0, 0]); on[_dev(r['tested_on'])][0 if r['result'] == 'PASS' else 1] += 1
s5 = HEAD('5. User experience') + f"""## What was tested on what

Everything in this section was run in headless desktop Chromium by `evidence/tools/ux.js` on {ux['when'][:10]}. **No real phone or tablet and no screen reader was used.** "Phone" and "tablet" below mean an emulated device: Chromium given that device's screen size, touch input and browser name. That is a fair test of layout and of the script; it is not a test of Safari, of a real on-screen keyboard, or of how a real phone downloads a file or opens a PDF.

| Tested on | Checks passed | Checks failed |
|---|---:|---:|
""" + '\n'.join(f"| {k} | {v[0]} | {v[1]} |" for k, v in sorted(on.items(), key=lambda x: -x[1][0])) + f"""
| **All (emulated or desktop; none on a real device)** | **{ux['passed']}** | **{ux['failed']}** |
| Real phone, real tablet, screen reader | not tested | not tested |

| Group | Passed | Of |
|---|---:|---:|
""" + '\n'.join(f"| {g} | {sum(1 for r in L if r['result'] == 'PASS')} | {len(L)} |" for g, L in sorted(grp.items())) + f"""

Every single check, with what it was run on and what it saw, is in `evidence/ux/ux-results.json`.

## Defects this audit found on the branch, and fixed

| Defect | Who it affected | Fix |
|---|---|---|
| Opening or closing a request, moving to the next 25, or choosing a year redrew that part of the screen and dropped the keyboard focus | anyone using a keyboard or a screen reader: after each action they were back at the top of the page | the focus is put back on the control that was used |
| The simulator's slider had no label that a screen reader could read (the label was attached to the number beside it instead) | screen-reader users | the label is tied to the slider |
| The list of sections did not respond to the arrow keys, and every one of its eleven buttons was a separate Tab stop | keyboard users | it now behaves as a radio group does elsewhere on the site: one Tab stop; arrow keys, Home and End |
| A link inside a section that leads to another section left the focus on a button that no longer existed | keyboard and screen-reader users | the focus moves to the new section's content |

The first run of this audit failed five checks because of these; after the fixes all {ux['passed']} pass. They are reported because they were real, and because they were not caught by the first-stage tests.

## For the owner: ten minutes on a real phone

The working preview on the review page is the real screen on a copy of the published data. On an iPhone or Android phone, please try:

1. Open the preview. Does the strip of sections scroll sideways with a finger, and does the page itself stay still?
2. Tap "Business cases". Type "police" in the search box. Does the keyboard cover the list, and can you still reach the results?
3. Tap a request. Does it open under its row? Tap "p. 224" (request 104). Does the City's PDF open, and at page 224 or at page 1?
4. "Save this list" cannot be tried in the preview: saving files is switched off there, and the preview says so when the button is tapped. It is one to try on the site on the first day after publication: does a file arrive, and does it open in a spreadsheet app?
5. Turn the phone sideways on the Overview. Does the map redraw and do the tiles reflow?
6. Switch the phone to dark mode (or use the site's theme button). Is everything readable?
7. In the simulator, drag the slider. Does the result follow your finger?
8. With VoiceOver or TalkBack on, swipe through the Overview. Are the section buttons announced as a group with the chosen one marked? Is each tile's figure read with its label?

Anything that fails there is a defect this audit could not see.

## Findings

""" + blocks(sec(5))
open(os.path.join(FV, FILES[5]), 'w', encoding='utf-8').write(s5)

# =================================================================== README
tot = cnt(F)
fails = [f for f in F if f['result'] == 'FAIL']; unv = [f for f in F if f['result'] == 'UNVERIFIED']
rd = f"""# Final independent verification: Budget Intelligence (second stage)

Written {extra['written']}. Branch `budget-intelligence`, compared with main at `{inv['base_commit'][:7]}`. **Nothing was published, merged or deployed, and the daily refresh system was not modified.** main is where it was before development started; the live website is unchanged by this work.

## Result

| Section | PASS | FAIL | UNVERIFIED | Page |
|---|---:|---:|---:|---|
""" + '\n'.join(f"| {i}. {NAMES[i]} | {cnt(sec(i))['PASS']} | {cnt(sec(i))['FAIL']} | {cnt(sec(i))['UNVERIFIED']} | [{FILES[i]}]({FILES[i]}) |" for i in range(1, 6)) + f"""
| **All {len(F)} findings** | **{tot['PASS']}** | **{tot['FAIL']}** | **{tot['UNVERIFIED']}** | [findings.json](findings.json) |

PASS means checked and found right, with evidence that can be re-run. FAIL means checked and found wrong or not as required. UNVERIFIED means it could not be checked from here, or a reason is an inference that the City has not confirmed; each says what would verify it.

## The {len(fails)} FAIL findings

""" + '\n'.join(f"- **{f['id']} {f['finding']}.** {f['what_was_found']}" for f in fails) + f"""

## The {len(unv)} UNVERIFIED findings, in short

| | What is not verified | Why |
|---|---|---|
""" + '\n'.join(f"| {f['id']} | {f['finding']} | {extra['unverified_why'].get(f['id'], '')} |" for f in unv) + f"""

## Where the instructions were not followed as written

The owner's instruction was to accept only what is right. These are the places where the request could not or should not be met as worded:

1. **Real-device results.** There are none. Every phone and tablet result is an emulated device and is labelled so; nothing was invented to fill the column. A ten-minute list for a real phone is in section 5.
2. **The laptop archive.** Not verified and not claimed. It runs on a machine this review cannot reach.
3. **"Explain" the $21 billion and the 2028 difference.** The arithmetic is given in full. The reasons are the City's to give and it has not published them, so they are marked as inferences, not explanations.
4. **Actual workflow logs.** Run numbers, results, step counts and addresses are supplied. The full log text is not copied into a public repository; it is on GitHub at those addresses.
5. **A complete Git diff as a file.** A file cannot contain the diff of itself. The exact command is given, the patch of the six existing files is saved, and every new file is listed with its checksum.
6. **Pictures of the City's pages.** Forty requests were checked by eye from pictures. The pictures are pages of the City's document, so they are not committed here; the list of what was checked is.
7. **The 31 additions.** Explained, and still present, but the count is now {sum(x['added'] for x in ex.values())} because the owner's later instruction about Data Genie and this audit's fixes added lines. Section 4 explains each block.
8. **Rewriting the branch's history** to remove one sentence from its first commit (finding 4.9b) was not done without instruction, because it cannot be undone.

## What this audit changed

It was asked to verify, and it also found things worth fixing on the branch. All are listed in section 4 ("What changed on the branch since the version examined"). In short: 17 requests now carry the full one-time amount that the City states in a note; two checks on the screen explain more; one sentence that pointed readers to figures that do not add up was rewritten; four keyboard and screen-reader defects and one link-safety weakness were fixed. No existing figure in the dataset changed. All tests were run again on the final files: {extra['tests_line']}

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
"""
open(os.path.join(FV, 'README.md'), 'w', encoding='utf-8').write(rd)
print('written', {k: os.path.getsize(os.path.join(FV, v)) for k, v in FILES.items()}, os.path.getsize(os.path.join(FV, 'README.md')), tot)
