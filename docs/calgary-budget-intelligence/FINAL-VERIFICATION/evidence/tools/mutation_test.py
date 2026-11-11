"""Does the third reading notice a wrong value? Twenty-one wrong values are planted in a copy of the dataset (never in the
real file) and the third reading is run on the copy. Every planted error must be reported, and nothing else.
usage: python3 mutation_test.py <verify_plumber.py> <plumber-words.json> <business-cases.json> <work-dir> <out.json>"""
import sys, json, copy, subprocess, os
ver, words, bcf, work, out = sys.argv[1:6]
BC = json.load(open(bcf)); M = copy.deepcopy(BC); by = {c['n']: c for c in M['cases']}; seeds = []
def seed(n, what, fn): fn(by[n]); seeds.append((n, what))
seed(16, 'capital total +1', lambda c: c['cap_k'].__setitem__(0, c['cap_k'][0] + 1))
seed(82, 'capital 2029 and 2030 swapped', lambda c: c['cap_k'].__setitem__(slice(3, 5), [c['cap_k'][4], c['cap_k'][3]]))
seed(55, 'purpose percentages moved one column', lambda c: c.__setitem__('split', [0, 100, 0, 0]))
seed(18, 'ward 7 changed to ward 8', lambda c: c.__setitem__('wards', [8]))
seed(23, '10-year needs for 2031 and later +1,000', lambda c: c['needs_k'].__setitem__(4, c['needs_k'][4] + 1000))
seed(104, 'positions in 2027: 17 changed to 18', lambda c: c['ftes'].__setitem__(0, 18))
seed(2, 'an ongoing amount moved from 2028 to 2029', lambda c: c.__setitem__('ongoing_m', [2.1, None, 0.7, None]))
seed(14, 'one-time 2027: 20.4 changed to 2.04', lambda c: c['one_time_m'].__setitem__(0, 2.04))
seed(1, 'a word dropped from a title', lambda c: c.__setitem__('title', c['title'].replace('Residential ', '')))
seed(173, 'risk rating changed', lambda c: c.__setitem__('risk', 'Low' if c['risk'] != 'Low' else 'High'))
seed(5, 'department changed', lambda c: c.__setitem__('dept', 'Community Services'))
seed(31, 'funding source shortened', lambda c: c.__setitem__('funding', 'Reserves'))
seed(219, 'Budget ID changed by one character', lambda c: c.__setitem__('budget_id', 'P616_001'))
seed(57, 'stage changed', lambda c: c.__setitem__('stage', 'Stage 3: Define'))
seed(200, 'reason given changed', lambda c: c.__setitem__('rationale', 'Explicit'))
seed(20, '"Required" mark flipped', lambda c: c.__setitem__('required', not c.get('required')))
seed(13, 'a dash turned into 0.0', lambda c: c.__setitem__('one_time_m', [0.0] + c['one_time_m'][1:]))
seed(124, 'the full one-time amount in the City note removed', lambda c: c.pop('full_one_time_m'))
seed(293, 'the "City note under the table" mark removed', lambda c: c.__setitem__('footnotes', False))
seed(166, 'the long-term plan changed', lambda c: c.__setitem__('plan', (c.get('plan') or '') + ' and another plan'))
seed(275, 'moved to another Council priority', lambda c: c.__setitem__('theme', 'Safe city' if c['theme'] != 'Safe city' else 'Functional transportation network'))
os.makedirs(work, exist_ok=True); mf = os.path.join(work, 'mutated.json'); json.dump(M, open(mf, 'w'))
txt = subprocess.run([sys.executable, '-I', ver, words, mf, os.path.join(work, 'mutated-result.json')], capture_output=True, text=True).stdout
R = json.load(open(os.path.join(work, 'mutated-result.json')))
flagged = {r['n']: r['notes'] for r in R['cases'] if r['notes']}
res = [{'request': n, 'planted_error': w, 'reported': n in flagged, 'as': (flagged.get(n) or [''])[0][:140]} for n, w in seeds]
o = {'how': __doc__, 'planted': len(seeds), 'reported': sum(1 for r in res if r['reported']), 'differences_reported_in_all': R['differ'], 'requests_reported': sorted(flagged), 'requests_planted': sorted({n for n, _ in seeds}),
     'false_alarms': sorted(set(flagged) - {n for n, _ in seeds}), 'results': res}
json.dump(o, open(out, 'w'), indent=1, ensure_ascii=False)
print('planted', o['planted'], 'reported', o['reported'], 'differences', o['differences_reported_in_all'], 'false alarms', o['false_alarms'])
