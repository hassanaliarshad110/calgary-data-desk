"""The interface build step (web/build_site.py: page) run from two checkouts, and the two results compared file by file.
usage: python3 built_compare.py <main checkout> <branch checkout> <work dir> <out.json>"""
import sys, os, json, hashlib, subprocess, shutil
main, branch, work, out = sys.argv[1:5]
for name, src in (('main', main), ('branch', branch)):
    d = os.path.join(work, name); shutil.rmtree(d, ignore_errors=True)
    subprocess.run([sys.executable, '-c', f"import sys; sys.path.insert(0, 'web'); sys.path.insert(0, '.'); import build_site; build_site.page({d!r})"], cwd=src, check=True, capture_output=True)
def tree(d):
    o = {}
    for dp, dn, fn in os.walk(d):
        for f in fn:
            p = os.path.join(dp, f); o[os.path.relpath(p, d)] = (hashlib.sha256(open(p, 'rb').read()).hexdigest(), os.path.getsize(p))
    return o
a, b = tree(os.path.join(work, 'main')), tree(os.path.join(work, 'branch'))
same = [k for k in a if k in b and a[k] == b[k]]; changed = [k for k in a if k in b and a[k] != b[k]]
ma = [k for k in a if k.startswith('site.') and k.endswith('.js')][0]; da = [k for k in b if k.startswith('site.') and k.endswith('.js')][0]
A = open(os.path.join(work, 'main', ma), 'rb').read(); B = open(os.path.join(work, 'branch', da), 'rb').read(); src = open(os.path.join(branch, 'ui', 'budget-intel.js'), 'rb').read()
i = B.find(src); j = B.rfind(b'// ---- budget-intel.js\n', 0, i); rest = B[:j] + B[i + len(src):]
k = 0
while k < len(A) and k < len(rest) and A[k] == rest[k]: k += 1
rest2 = rest[:k] + rest[k + (len(rest) - len(A)):]
res = {'main_build_files': len(a), 'branch_build_files': len(b), 'identical': len(same),
       'changed': {x: {'main_sha256': a[x][0], 'main_bytes': a[x][1], 'branch_sha256': b[x][0], 'branch_bytes': b[x][1]} for x in changed},
       'removed': [x for x in a if x not in b and x != ma], 'added': sorted(x for x in b if x not in a and x != da),
       'added_details': {x: {'sha256': b[x][0], 'bytes': b[x][1]} for x in b if x not in a and x != da},
       'renamed_bundle': {'main': ma, 'branch': da, 'main_sha256': a[ma][0], 'branch_sha256': b[da][0], 'main_bytes': a[ma][1], 'branch_bytes': b[da][1]},
       'bundle_check': {'the_branch_bundle_is_the_main_bundle_plus_one_block': rest2 == A, 'block': 'the bundler\'s heading line for budget-intel.js, the file itself, and the bundler\'s separator', 'block_bytes': len(B) - len(A),
                        'sha256_after_removing_the_block': hashlib.sha256(rest2).hexdigest()}}
json.dump(res, open(out, 'w'), indent=1)
print(res['main_build_files'], res['branch_build_files'], res['identical'], list(res['changed']), res['removed'], res['added'], res['renamed_bundle']['main'], res['renamed_bundle']['branch'], res['bundle_check']['the_branch_bundle_is_the_main_bundle_plus_one_block'], res['bundle_check']['block_bytes'])
