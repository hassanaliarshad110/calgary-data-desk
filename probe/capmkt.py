import io, json, os, sys, subprocess, urllib.request, inspect
os.makedirs(sys.argv[1], exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Calgary Data Desk research; hassanaliarshad110@users.noreply.github.com)'}
def get(u, n=None):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
            b = r.read(); print('OK', r.status, u, r.headers.get('Content-Type'), len(b), r.geturl() if r.geturl() != u else ''); return b
    except Exception as e:
        print('ERR', u, str(e)[:150])
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'cad_tickers', 'openpyxl', 'pandas'], check=False)
try:
    import cad_tickers.exchanges.tsx as tx, cad_tickers.exchanges.cse as cx
    for m in (tx, cx):
        src = inspect.getsource(m)
        print('SRC', m.__name__, '\n'.join(l for l in src.splitlines() if 'http' in l or 'url' in l.lower())[:2500])
except Exception as e:
    print('CADERR', e)
for u in ['https://www.tsx.com/resource/en/571', 'https://www.tsx.com/json/company-directory/search/tsx/%5E*',
          'https://www.tsx.com/en/listings/current-market-statistics', 'https://www.tmx.com/en/listings/current-market-statistics',
          'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&State=A0&type=40-F&dateb=&owner=include&count=40',
          'https://www.sec.gov/files/company_tickers_exchange.json']:
    b = get(u)
    if b and u.endswith('statistics'):
        import re
        print('LINKS', sorted(set(re.findall(r'href="([^"]*(?:resource|xlsx|xls|csv)[^"]*)"', b.decode('utf-8', 'replace'))))[:60])
    if b and 'resource/en/571' in u:
        try:
            import pandas as pd
            x = pd.read_excel(io.BytesIO(b), sheet_name=None, header=None)
            for k, df in x.items():
                print('SHEET', k, df.shape); print(df.head(12).to_string()[:3000])
        except Exception as e:
            print('XLERR', e, b[:200])
    if b and 'company-directory' in u:
        print(b[:600])
    if b and 'State=A0' in u:
        print(b.decode('utf-8', 'replace')[:200])
