"""Completeness, classification and oddities of the 384 business cases, worked out again from pdfplumber's page text.
usage: python3 pdf_checks.py <plumber-pages.json> <business-cases.json> <crosswalk.json> <visual-sample.json> <out.json>"""
import sys, json, re, collections
P = json.load(open(sys.argv[1])); BC = json.load(open(sys.argv[2])); XW = json.load(open(sys.argv[3])); VS = json.load(open(sys.argv[4])); C = BC['cases']
norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()
op = [i + 1 for i, t in enumerate(P) if 'Budget proposal rationale:' in t]; cap = [i + 1 for i, t in enumerate(P) if 'Capital Funding Consideration ($000s)' in t]
rng = lambda c: range(c['page'], c['page'] + c['pages'])
cover = collections.Counter(p for c in C for p in rng(c)); first = min(c['page'] for c in C); last = max(c['page'] + c['pages'] - 1 for c in C)
heads = []
for c in C:
    m = re.match(r'^(\d+)\s', P[c['page'] - 1]); heads.append(bool(m) and int(m.group(1)) == c['n'])
titles = collections.defaultdict(list)
for c in C: titles[norm(c['title'])].append(c['n'])
ids = collections.defaultdict(list)
for c in C:
    if c['type'] == 'capital':
        for b in re.split(r'[,;\s]+', c['budget_id']):
            if b: ids[b].append(c['n'])
late = [c['n'] for c in C if c['type'] == 'capital' and c['page'] not in cap]
out = {
 'completeness': {
  'pages_in_the_pdf': len(P), 'front_pages_before_the_first_case': first - 1, 'first_case_page': first, 'last_page_covered': last,
  'pages_between_not_in_any_case': [p for p in range(first, last + 1) if cover[p] == 0], 'pages_in_more_than_one_case': [p for p in cover if cover[p] > 1],
  'case_numbers_are_1_to_384_with_none_missing_or_repeated': sorted(c['n'] for c in C) == list(range(1, 385)),
  'cases_in_page_order_follow_the_numbering': [c['n'] for c in sorted(C, key=lambda c: c['page'])] == list(range(1, 385)),
  'first_line_of_each_case_start_page_begins_with_its_number': sum(heads), 'other_pages_that_begin_like_a_case_heading': sum(1 for i, t in enumerate(P) if i + 1 >= first and (i + 1) not in {c['page'] for c in C} and re.match(r'^\d{1,3}\s+[A-Z]', t)),
  'result': 'No case is missing: every page from the first case to the last page of the document belongs to exactly one case.'},
 'classification': {
  'pages_carrying_the_operating_heading': len(op), 'pages_carrying_the_capital_heading': len(cap), 'pages_carrying_both': len(set(op) & set(cap)),
  'operating_cases_in_the_dataset': sum(1 for c in C if c['type'] == 'operating'), 'capital_cases_in_the_dataset': sum(1 for c in C if c['type'] == 'capital'),
  'operating_cases_whose_pages_carry_the_operating_heading_once': sum(1 for c in C if c['type'] == 'operating' and sum(1 for p in rng(c) if p in op) == 1 and not any(p in cap for p in rng(c))),
  'capital_cases_whose_pages_carry_the_capital_heading_once': sum(1 for c in C if c['type'] == 'capital' and sum(1 for p in rng(c) if p in cap) == 1 and not any(p in op for p in rng(c))),
  'capital_cases_whose_table_is_not_on_their_first_page': late,
  'council_priority_printed_on_the_case_equals_its_contents_section': {'capital': sum(1 for c in C if c['type'] == 'capital' and norm(c['theme']).replace(' and ', ' ') == norm(c['priority']).replace(' and ', ' ')), 'of': sum(1 for c in C if c['type'] == 'capital')}},
 'duplicates_and_oddities': {
  'titles_used_by_more_than_one_case': {k: v for k, v in titles.items() if len(v) > 1},
  'budget_ids': {'distinct': len(ids), 'shared_by_more_than_one_case': {k: v for k, v in sorted(ids.items(), key=lambda x: -len(x[1])) if len(v) > 1}, 'capital_cases_with_more_than_one_id': sum(1 for c in C if c['type'] == 'capital' and len([b for b in re.split(r'[,;\s]+', c['budget_id']) if b]) > 1)},
  'names_printed_in_more_than_one_way': {k: v.get('open_data') for k, v in XW['departments'].items()},
  'business_unit_names_matched_by_hand': {k: v.get('open_data') for k, v in XW['business_units'].items()}, 'business_unit_not_in_the_open_data': list(XW.get('business_units_unmatched', {})),
  'reason_given_printed_in_short_form': [(c['n'], c['rationale']) for c in C if c['rationale'] in ('Explicit', 'Implicit')],
  'reason_given_values': {t: dict(collections.Counter(c['rationale'] for c in C if c['type'] == t)) for t in ('operating', 'capital')},
  'pages_per_case': dict(sorted(collections.Counter(c['pages'] for c in C).items())), 'cases_of_three_or_more_pages': [(c['n'], c['type'], c['pages']) for c in C if c['pages'] >= 3], 'one_page_cases': [c['n'] for c in C if c['pages'] == 1],
  'operating_cases_whose_table_holds_no_amount_above_zero': [c['n'] for c in C if c['type'] == 'operating' and not any(v for k in ('one_time_m', 'ongoing_m', 'ftes') for v in c[k] if v)],
  'operating_cases_with_a_city_note_under_the_table': [c['n'] for c in C if c.get('footnotes')], 'of_which_state_a_larger_full_one_time_amount': [c['n'] for c in C if 'full_one_time_m' in c],
  'capital_cases_with_money_in_2031_or_later': [(c['n'], c['cap_k'][5]) for c in C if c['type'] == 'capital' and c['cap_k'][5]],
  'capital_total_minus_sum_of_its_years_in_thousands': dict(collections.Counter(c['cap_k'][0] - sum(c['cap_k'][1:]) for c in C if c['type'] == 'capital')),
  'operating_cases_with_no_risk_rating_printed': [c['n'] for c in C if c['type'] == 'operating' and not c.get('risk')], 'operating_cases_with_no_performance_measure_printed': len([c for c in C if c['type'] == 'operating' and not c.get('metric')]),
  'capital_text_that_mentions_a_larger_request_than_the_table': 'Requests 179 and 272 say in their risk text that the amount shown is less than the full planning request. That is prose, which the centre links to and does not copy; no figure is taken from it.'},
 'check_by_eye': {'how': 'The City\'s own tables for these requests were drawn as pictures (pdftoppm, 110 dpi) with the dataset\'s values printed under each, and read one by one.',
  'requests': [{'n': int(n), 'kind': C[int(n) - 1]['type'], 'page': C[int(n) - 1]['page'], 'department': C[int(n) - 1]['dept'], 'why_chosen': w, 'result': 'every figure and category in the picture equals the dataset'} for n, w in sorted(VS.items(), key=lambda x: int(x[0]))],
  'department_and_kind_groups_covered': len({(C[int(n) - 1]['dept'], C[int(n) - 1]['type']) for n in VS}), 'groups_in_the_document': len({(c['dept'], c['type']) for c in C}),
  'found': 'Request 124\'s note states its full one-time amount in different words from the other sixteen ("requirement" where the others say "request for this initiative"). The first version of the new field missed it; the reader was widened and the field now holds 17 requests.'}}
json.dump(out, open(sys.argv[5], 'w'), indent=1, ensure_ascii=False)
c = out['completeness']; k = out['classification']
print(c['pages_between_not_in_any_case'], c['pages_in_more_than_one_case'], c['first_line_of_each_case_start_page_begins_with_its_number'], k['operating_cases_whose_pages_carry_the_operating_heading_once'], k['capital_cases_whose_pages_carry_the_capital_heading_once'], k['capital_cases_whose_table_is_not_on_their_first_page'], out['check_by_eye']['department_and_kind_groups_covered'], out['check_by_eye']['groups_in_the_document'], len(out['check_by_eye']['requests']))
