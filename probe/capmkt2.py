import os, sys, urllib.request, re
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def get(u, name=None, ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64)'):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': ua, 'Accept': '*/*'}), timeout=60) as r:
            b = r.read(); print('OK', r.status, u, r.headers.get('Content-Type'), len(b))
            if name: open(os.path.join(out, name), 'wb').write(b)
            return b
    except Exception as e:
        print('ERR', u, str(e)[:150])
get('https://www.tsx.com/resource/en/571', 'tmx_issuers.xlsx')
get('https://www.tsx.com/json/company-directory/search/tsx/%5E*', 'tsx_dir.json')
get('https://www.tsx.com/json/company-directory/search/tsxv/%5E*', 'tsxv_dir.json')
h = get('https://www.tsx.com/en/listings/current-market-statistics', 'tmx_stats.html')
if h:
    s = h.decode('utf-8', 'replace')
    print('RES', sorted(set(re.findall(r'href="([^"]*resource[^"]*)"[^>]*>([^<]{0,80})', s)))[:80])
sec = 'Calgary Data Desk research hassanaliarshad110@users.noreply.github.com'
get('https://www.sec.gov/files/company_tickers_exchange.json', 'sec_tickers.json', sec)
get('https://data.sec.gov/submissions/CIK0000311337.json', 'sec_sub_cnq.json', sec)   # Canadian Natural? test
get('https://data.sec.gov/api/xbrl/companyfacts/CIK0000311337.json', None, sec)
for u in ['https://www.thecse.com/listings/', 'https://thecse.com/en/listings', 'https://webapi.thecse.com/trading/listed/securities.json',
          'https://www.thecse.com/api/listings', 'https://issuers.thecse.com/listings']:
    b = get(u)
    if b: print('   ', b[:300])
