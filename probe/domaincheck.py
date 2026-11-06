import socket, subprocess, sys, os
out = sys.argv[1]; os.makedirs(out, exist_ok=True); log = []
def L(*a): s = ' '.join(str(x) for x in a); print(s); log.append(s)
for h in ('calgaryinsight.ca', 'www.calgaryinsight.ca'):
    try: L(h, 'resolves to', sorted({a[4][0] for a in socket.getaddrinfo(h, 80, socket.AF_INET)}))
    except Exception as e: L(h, 'DNS FAIL', e)
for args in (['dig', '+short', 'www.calgaryinsight.ca', 'CNAME'], ['dig', '+short', 'calgaryinsight.ca', 'A', '@8.8.8.8'], ['dig', '+short', 'calgaryinsight.ca', 'NS']):
    try: L(' '.join(args), '->', subprocess.run(args, capture_output=True, text=True, timeout=30).stdout.strip().replace('\n', ' '))
    except Exception as e: L(args, e)
for u in ('http://calgaryinsight.ca/', 'https://calgaryinsight.ca/', 'http://www.calgaryinsight.ca/', 'https://hassanaliarshad110.github.io/calgary-data-desk/'):
    r = subprocess.run(['curl', '-sS', '-o', '/dev/null', '-L', '--max-time', '40', '-w', '%{http_code} final=%{url_effective} redirects=%{num_redirects}', u], capture_output=True, text=True)
    L(u, '->', r.stdout.strip(), r.stderr.strip()[:200])
r = subprocess.run(['curl', '-sS', '-L', '--max-time', '40', 'http://calgaryinsight.ca/'], capture_output=True, text=True)
import re; m = re.search(r'<title>(.*?)</title>', r.stdout or '', re.S); L('title', m.group(1).strip() if m else None)
open(f'{out}/log.txt', 'w').write('\n'.join(log))
