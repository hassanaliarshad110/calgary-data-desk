"""The build outputs that follow the changed source files, made offline from main and from the branch and compared.
usage: python3 build_steps.py <steps_main dir> <steps_dev dir> <published data dir> <branch py manifest> <out.json>"""
import sys, json
M, D, P, man, out = sys.argv[1:6]
L = lambda d, f: json.load(open(f'{d}/{f}'))
key = lambda X: {x['key']: x for x in (X['pages'] if isinstance(X, dict) else X)}
res = {}
for f in ('methods.json', 'analyst_topics.json'):
    p, m, d = L(P, f), L(M, f), L(D, f); km, kd = key(m), key(d)
    res[f] = {'published': len(p), 'made_from_main_offline': len(m), 'made_from_the_branch': len(d), 'main_offline_equals_published_exactly': json.dumps(m, sort_keys=True) == json.dumps(p, sort_keys=True),
              'added_on_the_branch': sorted(set(kd) - set(km)), 'removed': sorted(set(km) - set(kd)), 'changed': [k for k in kd if k in km and kd[k] != km[k]]}
m, d = key(L(M, 'registry.json')), key(L(D, 'registry.json'))
res['registry.json'] = {'made_from_main_offline': len(m), 'made_from_the_branch': len(d), 'added_on_the_branch': sorted(set(d) - set(m)), 'removed': sorted(set(m) - set(d)), 'changed': [k for k in d if k in m and d[k] != m[k]],
                        'note': 'Made offline with every published data file present, so two entries for files that the real build writes later (built, genie) appear on both sides.'}
m, d = L(M, 'search.json'), L(D, 'search.json'); rm = {json.dumps(r, sort_keys=True) for r in m['rows']}; rd = {json.dumps(r, sort_keys=True) for r in d['rows']}
res['search.json'] = {'rows_from_main': len(m['rows']), 'rows_from_the_branch': len(d['rows']), 'rows_removed': len(rm - rd), 'rows_added': [json.loads(r).get('t') + ' (' + json.loads(r).get('k') + ')' for r in sorted(rd - rm)]}
mf = json.load(open(man))['files']
res['files_shipped_to_the_browser_for_the_assistants'] = {'files': len(mf), 'new': [f for f in mf if 'budget_intel' in f or 'business-cases' in f or 'crosswalk' in f]}
json.dump(res, open(out, 'w'), indent=1)
print(json.dumps(res)[:900])
