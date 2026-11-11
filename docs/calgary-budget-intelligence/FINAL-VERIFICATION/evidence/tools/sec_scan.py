"""Static security scan of everything the branch adds or changes (run from the repository root, on the branch).
usage: python3 sec_scan.py <base-commit> <out.json>
Looks for: secrets and credentials, personal contact details, links and scripts to outside hosts, code that writes
files or sends data, and risky JavaScript patterns. It reads files; it changes nothing."""
import sys, subprocess, re, json, os
base, out = sys.argv[1], sys.argv[2]
sh = lambda *a: subprocess.run(a, capture_output=True, text=True).stdout
names = [l.split('\t') for l in sh('git', 'diff', '--name-status', base).splitlines() if l]
untracked = [l for l in sh('git', 'ls-files', '--others', '--exclude-standard').splitlines() if l]
files = [(s, p) for s, p in names if s != 'D'] + [('A', p) for p in untracked]
TEXT = ('.py', '.js', '.css', '.html', '.json', '.md', '.txt', '.yml', '.yaml', '.csv', '.patch')
SECRET = [('private key block', r'-----BEGIN [A-Z ]*PRIVATE KEY-----'), ('GitHub token', r'\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}'),
          ('AWS key', r'\bAKIA[0-9A-Z]{16}\b'), ('Anthropic or OpenAI style key', r'\bsk-[A-Za-z0-9_-]{20,}\b'), ('Google API key', r'\bAIza[0-9A-Za-z_-]{35}\b'),
          ('Slack token', r'\bxox[baprs]-[A-Za-z0-9-]{10,}'), ('bearer token', r'[Bb]earer\s+[A-Za-z0-9._-]{20,}'), ('JSON web token', r'\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'),
          ('password or secret assigned in code', r'(?i)\b(password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret|auth[_-]?token)\b\s*[:=]\s*["\'][^"\'\s]{6,}["\']'),
          ('credentials inside a URL', r'[a-z]+://[^/\s:@]+:[^/\s:@]+@')]
PERSONAL = [('e-mail address', r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'), ('phone number', r'(?<![\d.,])(?:\+?1[ .-])?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?![\d,])'),
            ('scratch or home path of the build machine', r'/tmp/[c]laude|/home/[c]laude|/[r]oot/|C:\\\\Users'), ('session link', r'[c]laude\.ai/code/session')]
OK_MAIL = {'noreply@anthropic.com', 'hassanaliarshad110@users.noreply.github.com'}
JS_RISK = [('eval or new Function', r'\beval\s*\(|new\s+Function\s*\('), ('document.write', r'document\.write\s*\('), ('script element made in code', r"createElement\(\s*['\"]script"),
           ('fetch, XMLHttpRequest, WebSocket, sendBeacon or EventSource', r'\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket|sendBeacon|EventSource'), ('cookie', r'document\.cookie'),
           ('localStorage, sessionStorage or indexedDB', r'localStorage|sessionStorage|indexedDB'), ('postMessage', r'postMessage\s*\('), ('window.open or location change', r'window\.open\s*\(|location\.(href|assign|replace)\s*[=(]'),
           ('inline event handler in markup', r'\son(click|error|load|mouseover)\s*='), ('javascript: link', r'javascript:')]
PY_RISK = [('writes a file', r"open\([^)]*['\"][wax]b?\+?['\"]|\.write\(|json\.dump\(|shutil\.(copy|move|rmtree)|os\.(remove|unlink|rename|makedirs|mkdir)"), ('runs a program', r'subprocess\.|os\.system|os\.popen'),
           ('network', r'\burllib\b|\brequests\.(get|post|put|delete|Session)|http\.client|\bsocket\.|urlopen'), ('eval, exec or pickle', r'\beval\(|\bexec\(|pickle\.|__import__\(')]
res = {'base': base, 'files_scanned': 0, 'not_text': [], 'secrets': [], 'personal': [], 'hosts': {}, 'hosts_in_documents_and_evidence': {}, 'javascript': {}, 'python': {}, 'external_script_or_style_tags_added': []}
SKIP = ('security-static.json', 'sensitive-scan.json')          # this scan's own results
for st, p in files:
    if os.path.basename(p) in SKIP: continue
    product = not p.startswith('docs/')
    if not p.lower().endswith(TEXT):
        res['not_text'].append(p); continue
    try: t = open(p, encoding='utf-8').read()
    except (OSError, UnicodeDecodeError): res['not_text'].append(p); continue
    res['files_scanned'] += 1
    whole = t
    if st == 'M':                      # a file that existed before: only the lines this branch adds are searched for secrets and contact details
        t = '\n'.join(l[1:] for l in sh('git', 'diff', '-U0', base, '--', p).splitlines() if l.startswith('+') and not l.startswith('+++'))
        res.setdefault('existing_files_added_lines_only', []).append(p)
    for name, rx in SECRET:
        for m in re.finditer(rx, t): res['secrets'].append({'file': p, 'kind': name, 'line': t.count('\n', 0, m.start()) + 1})
    for name, rx in PERSONAL:
        for m in re.finditer(rx, t):
            if name == 'e-mail address' and m.group(0) in OK_MAIL: continue
            if name == 'phone number' and re.search(r'[\d,]{3,}\s*$', t[max(0, m.start() - 4):m.start()]): continue
            res['personal'].append({'file': p, 'kind': name, 'line': t.count('\n', 0, m.start()) + 1})
    for m in re.finditer(r'https?://([A-Za-z0-9.-]+)', t): res['hosts' if product else 'hosts_in_documents_and_evidence'].setdefault(m.group(1).lower(), set()).add(p)
    if st != 'M': t = whole
    if not product: continue                # the patterns below are looked for in the site's own code, not in the test scripts kept as evidence
    if p.endswith('.js') or p.endswith('.html'):
        for name, rx in JS_RISK:
            n = len(re.findall(rx, t))
            if n: res['javascript'].setdefault(p, {})[name] = n
    if p.endswith('.py'):
        for name, rx in PY_RISK:
            n = len(re.findall(rx, t))
            if n: res['python'].setdefault(p, {})[name] = n
added = [l[1:] for l in sh('git', 'diff', base, '--', 'ui/index.html').splitlines() if l.startswith('+') and not l.startswith('+++')]
res['external_script_or_style_tags_added'] = [l.strip()[:200] for l in added if re.search(r'<(script|link|iframe|img|object|embed)[^>]+(src|href)\s*=\s*["\']?(https?:)?//', l)]
res['script_and_style_tags_added_to_index_html'] = [l.strip()[:160] for l in added if re.search(r'<(script|link)\b', l)]
res['hosts'] = {h: sorted(v) for h, v in sorted(res['hosts'].items())}
res['hosts_in_documents_and_evidence'] = {h: len(v) for h, v in sorted(res['hosts_in_documents_and_evidence'].items())}
res['not_text'].sort()
json.dump(res, open(out, 'w'), indent=1)
print('files scanned', res['files_scanned'], '| not text', len(res['not_text']), '| secrets', len(res['secrets']), '| personal', len(res['personal']), '| hosts', len(res['hosts']))
