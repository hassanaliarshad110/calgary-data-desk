"""Inventory of what the branch changes, and the patch of the six files that existed before. Run in the repository, on the branch.
usage: python3 code_inventory.py <base-commit> <examined-commit> <out-dir>"""
import sys, subprocess, json, hashlib, os, re
base, examined, out = sys.argv[1], sys.argv[2], sys.argv[3]
sh = lambda *a: subprocess.run(a, capture_output=True, text=True).stdout
subprocess.run(['git', 'add', '-A'], check=True)                 # so that new files are counted; nothing is committed here
names = [l.split('\t') for l in sh('git', 'diff', '--cached', '--name-status', base).splitlines() if l]
num = {l.split('\t')[2]: (l.split('\t')[0], l.split('\t')[1]) for l in sh('git', 'diff', '--cached', '--numstat', base).splitlines() if l}
existing = [{'file': p, 'added': int(num[p][0]), 'removed': int(num[p][1])} for s, p in names if s == 'M']
new = [p for s, p in names if s == 'A']
prod = [p for p in new if not p.startswith('docs/')]
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
inv = {'base_commit': sh('git', 'rev-parse', base).strip(), 'examined_commit': sh('git', 'rev-parse', examined).strip(),
       'existing_files': existing, 'deleted_or_renamed': [p for s, p in names if s[0] in 'DR'],
       'new_product_files': [{'file': p, 'bytes': os.path.getsize(p), 'sha256': sha(p), 'what': {
           'budget_intel.py': 'the new data for Data Genie and the Data Scientist (reads only)', 'ui/budget-intel.js': 'the screen', 'ui/budget-intel.css': 'its styles',
           'ui/budget-intel/business-cases.json': 'the 384 business cases read from the City\'s PDF', 'ui/budget-intel/crosswalk.json': 'hand-kept name matches and topic links',
           'tools/budget_intel_extract.py': 'reads the City\'s PDF into business-cases.json (run by hand)', 'tools/budget_intel_check.py': 'checks the dataset and reconciles it with the open data (run by hand)'}.get(p, '')} for p in prod],
       'new_document_files': len(new) - len(prod), 'new_document_folders': sorted({os.path.dirname(p) for p in new if p.startswith('docs/')}),
       'changed_since_the_version_examined': [l.split('\t') for l in sh('git', 'diff', '--cached', '--name-status', examined).splitlines() if l and not l.split('\t')[1].startswith('docs/')]}
json.dump(inv, open(os.path.join(out, 'changed-files.json'), 'w'), indent=1)
open(os.path.join(out, 'existing-files.patch.txt'), 'w').write(sh('git', 'diff', '--cached', base, '--', *[x['file'] for x in existing]))
# the dataset: the version examined against the version now
a = json.loads(sh('git', 'show', f'{examined}:ui/budget-intel/business-cases.json')); b = json.load(open('ui/budget-intel/business-cases.json'))
changed = [(x['n'], k) for x, y in zip(a['cases'], b['cases']) for k in x if x[k] != y.get(k)]
added = [{'request': y['n'], 'field': k, 'value': y[k]} for x, y in zip(a['cases'], b['cases']) for k in y if k not in x]
json.dump({'compared': f'{examined[:7]} (the version examined) with the working files', 'requests': [len(a['cases']), len(b['cases'])], 'existing_values_changed': changed, 'fields_removed': [(x['n'], k) for x, y in zip(a['cases'], b['cases']) for k in x if k not in y],
           'fields_added': added, 'top_level_changes': {k: [a.get(k), b.get(k)] for k in set(a) | set(b) if k not in ('cases', 'units') and a.get(k) != b.get(k)}, 'units_added': sorted(set(b['units']) - set(a['units'])),
           'file_sha256': {'examined': hashlib.sha256(sh('git', 'show', f'{examined}:ui/budget-intel/business-cases.json').encode()).hexdigest(), 'now': sha('ui/budget-intel/business-cases.json')}}, open(os.path.join(out, 'dataset-before-after.json'), 'w'), indent=1)
# words that should not be in a public repository
words = r'commercial|pricing|price list|subscription|paid idea|paid tier|revenue-earning|earn revenue|monetiz|paywall'
hits = []
for l in sh('git', 'grep', '--cached', '-n', '-i', '-E', words, '--', 'docs/calgary-budget-intelligence', 'ui/budget-intel.js', 'ui/budget-intel.css', 'ui/budget-intel', 'budget_intel.py', 'tools/budget_intel_extract.py', 'tools/budget_intel_check.py').splitlines():
    f, n, t = l.split(':', 2)
    if f.endswith(('production-site-files.txt', 'security-static.json', 'sensitive-scan.json', 'findings.json', 'code_inventory.py', 'make_report.py', 'write_docs.py')) or '/FINAL-VERIFICATION/' in f and f.endswith('.md'): continue
    why = ('the City\'s own title of request 108 ("... Subscription-Based Software Models")' if f.endswith(('business-cases.json', 'all-384-cases.csv', 'all-384-cases.md', 'third-reading.json')) else
           'records that the commercial opportunity was removed, or states that there is no paywall or payment code' if f.endswith('TECHNICAL-REPORT.md') or ('removed' in t.lower() and 'commercial' in t.lower()) else 'NOT EXPECTED')
    hits.append({'file': f, 'line': int(n), 'why_it_is_there': why, 'text': t.strip()[:160] if why != 'NOT EXPECTED' and not f.endswith('.json') and not f.endswith('.csv') else t.strip()[:80]})
personal = []
for l in sh('git', 'diff', '--cached', '-U0', base).splitlines():
    if l.startswith('+') and not l.startswith('+++') and re.search(r'/tmp/[c]laude|/home/[c]laude|[c]laude\.ai/code/session|@[g]mail\.com|@[h]otmail\.com|@[o]mniyat', l): personal.append('one added line (not quoted here)')
json.dump({'words_searched': words, 'where': 'the documents folder, the new screen, its data, the new module and the two tools', 'hits': hits, 'not_expected': [h for h in hits if h['why_it_is_there'] == 'NOT EXPECTED'],
           'machine_paths_session_links_or_private_mail_addresses_in_added_lines': personal}, open(os.path.join(out, 'sensitive-scan.json'), 'w'), indent=1)
print('existing', existing); print('new product', len(prod), 'new documents', len(new) - len(prod)); print('dataset: changed', changed, 'added', len(added)); print('word hits', [(h['file'].split('/')[-1], h['line'], h['why_it_is_there'][:20]) for h in hits]); print('personal', personal[:5])
subprocess.run(['git', 'reset', '-q'], check=True)
