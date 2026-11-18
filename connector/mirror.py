"""Copies from the published website what web/mcp_answers.py needs, so the connector's answers can be checked
without a full build:  python connector/mirror.py https://calgaryinsight.ca/ OUT_DIR
(py/ with its manifest, data/cache/, data/city_actual/w0..14.json, tax.json, catalog.json, methods.json)."""
import concurrent.futures as cf
import json
import os
import sys
import time
import urllib.request


def get(url, path, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'calgaryinsight-connector-check'}), timeout=120) as r:
                b = r.read()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            open(path, 'wb').write(b)
            return len(b)
        except Exception as e:                               # noqa: BLE001
            if i == tries - 1:
                print('could not copy', url, e)
                return 0
            time.sleep(5 * (i + 1))


def main():
    site, out = sys.argv[1].rstrip('/') + '/', os.path.abspath(sys.argv[2])
    get(site + 'py/manifest.json', os.path.join(out, 'py', 'manifest.json'))
    man = json.load(open(os.path.join(out, 'py', 'manifest.json'), encoding='utf-8'))
    jobs = [(site + 'py/' + f, os.path.join(out, 'py', f)) for f in man['files']]
    jobs += [(site + 'data/cache/' + f, os.path.join(out, 'data', 'cache', f)) for f in man.get('cache') or []]
    jobs += [(site + f'data/city_actual/w{w}.json', os.path.join(out, 'data', 'city_actual', f'w{w}.json')) for w in range(15)]
    jobs += [(site + 'data/' + f, os.path.join(out, 'data', f)) for f in ('tax.json', 'catalog.json', 'methods.json', 'built.json')]
    with cf.ThreadPoolExecutor(8) as ex:
        sizes = list(ex.map(lambda j: get(*j), jobs))
    print(f'copied {sum(1 for s in sizes if s)} of {len(jobs)} files, {sum(sizes) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
