"""Data Genie and the Data Scientist: the new section is tried the way the website runs it. Run from the folder of Python
files the website ships to the browser (py/ in the built site), with no site data folder, as in the browser.
usage: cd <built site>/py && python3 genie_test.py <out.json>"""
import sys, json
sys.path.insert(0, '.')
import agent, analyst
a = agent.Agent({}, lambda e: None, '/tmp/none-down', lambda: {'period': 'test', 'built_at': 'x'}, '/tmp/none-appdata', lambda: {})
T = []
def t(name, cond, detail=''):
    T.append((name, bool(cond), str(detail)[:220])); print(('PASS ' if cond else 'FAIL ') + name, '|', str(detail)[:200])
g = lambda **k: a.run_tool('get_dashboard', dict(section='budget_intelligence', **k))
r = g(); t('summary: 384 requests, 124 operating, 260 capital', r.get('counts') == {'requests': 384, 'operating': 124, 'capital': 260}, r.get('counts'))
t('summary: capital total and years ($ millions)', r['capital_m'] == {'total': 13051.5, '2027': 1554.1, '2028': 3016.3, '2029': 4027.5, '2030': 4426.9, '2031_and_later': 26.7}, r['capital_m'])
t('summary: positions by year', r['positions_by_year'] == {'2027': 855, '2028': 445, '2029': 279, '2030': 347}, r['positions_by_year'])
t('summary: capital by purpose', r['capital_by_purpose_m'] == {'Maintenance or replacement': 5529.5, 'Growth': 4520.7, 'Service enhancement': 2644.0, 'Transformative': 357.3}, r['capital_by_purpose_m'])
p = r['one_time_requests_partly_in_the_budget']; t('summary: requests only partly in the budget', (p['requests'], p['in_their_tables_m'], p['full_requests_stated_m']) == (17, 235.8, 613.4), (p['requests'], p['in_their_tables_m'], p['full_requests_stated_m']))
t('summary: status says nothing is approved; the guidance says PROPOSED, no rating, no dividing citywide amounts', 'Nothing here is approved' in r['status'] and 'PROPOSED' in r['how'] and 'never divide' in r['how'] and 'never rate' in r['how'], r['status'])
c = g(part='case', find='82')['case']; t('one request by number (82)', c['title'].startswith('GamePLAN') and c['proposed_capital_m'] == 283.8 and c['page_url'].endswith('#page=180'), (c['title'], c['proposed_capital_m'], c['page_url'][-12:]))
c = g(part='case', find='124')['case']; t('request 124 carries the City note about the full amount', c.get('full_one_time_request_m') == 23.9 and '23.9' in c.get('note', ''), c.get('note'))
c = g(part='case', find='104')['case']; t('request 104: positions by year', c['positions_by_year'] == {'2027': 17, '2028': 15, '2029': 13, '2030': 13}, c['positions_by_year'])
r = g(part='cases', find='police'); t('list: search "police"', r['matching'] == 6 and len(r['cases']) == 6, r['matching'])
r = g(part='cases', ward=7, kind='capital'); t('list: capital requests naming ward 7', r['matching'] == 16, r['matching'])
r = g(part='departments'); t('by department: 13 names as printed, requests add to 384', len(r['by_department']) == 13 and sum(d['requests'] for d in r['by_department']) == 384, len(r['by_department']))
r = g(part='priorities'); t('by Council priority: six', len(r['by_council_priority']) == 6, len(r['by_council_priority']))
r = g(part='service_areas'); t('capital by service area: fifteen, with the related Calgary Insight pages', len(r['capital_by_service_area']) == 15 and any(x.get('on_calgary_insight') for x in r['capital_by_service_area']), len(r['capital_by_service_area']))
r = g(part='wards'); t('by ward: fourteen wards, and the rule that dollars are not divided', len(r['wards']) == 14 and 'not divided' in r['note'], r['note'])
r = g(part='checks'); names = [x['check'] for x in r['checks']]
t('checks: eight, including the part-requests and the reconciliation with the open data', len(names) == 8 and any('partly' in n for n in names) and any('open data' in n for n in names), names)
u = [x for x in r['checks'] if x['check'].startswith('The same')][0]
t('checks: the three single requests that equal a business-unit difference are named', sorted(d['one_request_equals_the_difference_each_year']['n'] for d in u['differences'] if d.get('one_request_equals_the_difference_each_year')) == [57, 82, 219], '')
r = g(part='sources'); t('sources: the City document and how it was read', 'calgary.ca' in json.dumps(r), list(r)[4:])
r = g(part='nonsense'); t('an unknown part gives a plain error, not a crash', 'error' in r, r.get('error'))
m = a.run_tool('get_method', {'topic': 'budget_intelligence'}); t('"How it is counted" note is served (get_method)', m['methods'][0]['key'] == 'budget_intelligence' and len(m['methods'][0]['cautions']) == 7, len(m['methods'][0]['cautions']))
rs = a.run_tool('read_source', {'key': 'budget-intelligence'}); t('the raw files can be read (read_source)', 'error' not in rs and rs.get('page') == 'Budget Intelligence', rs.get('page'))
t('Data Scientist: the topic "budget requests" exists; no stray automatic topic for the page or its crosswalk file', 'budget_requests' in analyst.BY_KEY and 'page_budget-intelligence' not in analyst.BY_KEY and 'page_data:crosswalk' not in analyst.BY_KEY, analyst.BY_KEY['budget_requests'][1])
d = [x for x in agent.TOOLS if x['name'] == 'get_dashboard'][0]
t('the tool\'s description and its lists of sections and parts name the new section', 'budget_intelligence' in d['description'] and 'budget_intelligence' in d['input_schema']['properties']['section']['enum'] and all(x in d['input_schema']['properties']['part']['enum'] for x in ('cases', 'case', 'departments', 'priorities', 'service_areas', 'wards', 'checks')), '')
json.dump({'how': __doc__, 'passed': sum(1 for x in T if x[1]), 'failed': sum(1 for x in T if not x[1]), 'results': [{'name': n, 'result': 'PASS' if ok else 'FAIL', 'detail': d} for n, ok, d in T]}, open(sys.argv[1], 'w'), indent=1)
print('passed', sum(1 for x in T if x[1]), 'failed', sum(1 for x in T if not x[1]))
