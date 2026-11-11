"""Before and after: every file of the daily refresh system on main and on the branch, as git itself records them.
Run in the repository, on the branch. usage: python3 refresh_compare.py <base-commit> <out-dir>"""
import sys, subprocess, json, hashlib, os, re
base, out = sys.argv[1], sys.argv[2]
sh = lambda *a: subprocess.run(a, capture_output=True, text=True).stdout
raw = lambda *a: subprocess.run(a, capture_output=True).stdout
os.makedirs(os.path.join(out, 'workflows', 'main'), exist_ok=True); os.makedirs(os.path.join(out, 'workflows', 'branch'), exist_ok=True)
def tree(ref):
    o = {}
    for l in sh('git', 'ls-tree', '-r', ref).splitlines():
        meta, path = l.split('\t'); o[path] = meta.split()[2]
    return o
subprocess.run(['git', 'add', '-A'], check=True)                       # so that new files are counted; nothing is committed here
head_tree = sh('git', 'write-tree').strip()
A, B = tree(base), tree(head_tree)
wf = []
for p in sorted(x for x in A if x.startswith('.github/workflows/')):
    a = raw('git', 'show', f'{base}:{p}'); b = open(p, 'rb').read() if os.path.exists(p) else b''
    name = os.path.basename(p)
    open(os.path.join(out, 'workflows', 'main', name + '.txt'), 'wb').write(a); open(os.path.join(out, 'workflows', 'branch', name + '.txt'), 'wb').write(b)
    t = a.decode('utf-8')
    wf.append({'file': p, 'main_sha256': hashlib.sha256(a).hexdigest(), 'branch_sha256': hashlib.sha256(b).hexdigest(), 'main_git_blob': A[p], 'branch_git_blob': B.get(p), 'bytes': len(a),
               'identical': a == b, 'schedules': re.findall(r"cron:\s*'([^']+)'", t), 'started_by': [k for k in ('schedule', 'workflow_dispatch', 'push') if re.search(r'^\s+' + k + r':', t, re.M)]})
new_wf = sorted(x for x in B if x.startswith('.github/') and x not in A)
is_refresh = lambda p: p.startswith('.github/') or p.startswith('web/') or p.startswith('data/') or p.startswith('gateway/') or (p.endswith('.py') and '/' not in p) or p in ('tools/archive.py', 'tools/news_publish.py', 'requirements.txt')
rows = []
for p in sorted(set(A) | set(B)):
    st = 'same' if A.get(p) == B.get(p) else 'added' if p not in A else 'removed' if p not in B else 'changed'
    doc = p.startswith('docs/calgary-budget-intelligence/')      # the reports and evidence, which include this file: their checksums are not recorded, because a file cannot hold its own
    rows.append({'file': p, 'status': st, 'part_of_the_refresh_system': is_refresh(p), 'main_git_blob': A.get(p), 'branch_git_blob': None if doc else B.get(p), **({'note': 'documentation or evidence of this review; checksum not recorded here'} if doc else {})})
cnt = lambda f: sum(1 for r in rows if f(r))
summary = {'base_commit': sh('git', 'rev-parse', base).strip(), 'files_on_main': len(A), 'files_on_the_branch': len(B),
           'same': cnt(lambda r: r['status'] == 'same'), 'changed': [r['file'] for r in rows if r['status'] == 'changed'], 'removed': [r['file'] for r in rows if r['status'] == 'removed'], 'added': cnt(lambda r: r['status'] == 'added'),
           'refresh_system_files_on_main': cnt(lambda r: r['part_of_the_refresh_system'] and r['main_git_blob']), 'refresh_system_files_same': cnt(lambda r: r['part_of_the_refresh_system'] and r['status'] == 'same'),
           'refresh_system_files_changed': [r['file'] for r in rows if r['part_of_the_refresh_system'] and r['status'] == 'changed'],
           'refresh_system_files_added': [r['file'] for r in rows if r['part_of_the_refresh_system'] and r['status'] == 'added'],
           'refresh_system_files_removed': [r['file'] for r in rows if r['part_of_the_refresh_system'] and r['status'] == 'removed'],
           'workflow_files_added_or_removed': {'added': new_wf, 'removed': [w['file'] for w in wf if not w['branch_git_blob']]}}
json.dump({'what': __doc__, 'counted_as_the_refresh_system': 'everything under .github/, web/, data/ and gateway/; every Python file at the top of the repository (the data modules and the assistants); tools/archive.py and tools/news_publish.py',
           'summary': summary, 'workflows': wf, 'files': rows}, open(os.path.join(out, 'before-after.json'), 'w'), indent=1)
print(json.dumps(summary, indent=0)[:1500]); print([(w['file'], w['identical'], w['schedules'], w['started_by']) for w in wf])
