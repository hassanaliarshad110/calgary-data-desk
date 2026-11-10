import json, re, html, requests, pdfplumber, io, zipfile, csv
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'}
U = json.load(open('urls.json'))
for k, u in U.items():
    try:
        r = requests.get(u, headers=UA, timeout=60)
    except Exception as e:
        print('ERR', k, e); continue
    print(r.status_code, len(r.content), k, r.url[:120])
    if r.status_code != 200: continue
    if r.content[:5] == b'%PDF-':
        open(f'out/{k}.pdf', 'wb').write(r.content)
        try:
            with pdfplumber.open(io.BytesIO(r.content)) as p:
                txt = '\n\n=== page\n'.join((pg.extract_text() or '') for pg in p.pages[:400])
        except Exception as e: txt = 'PDF ERR ' + str(e)
    else:
        t = re.sub(r'<script.*?</script>|<style.*?</style>|<nav.*?</nav>|<footer.*?</footer>', '', r.text, flags=re.S | re.I)
        t = re.sub(r'<(br|p|li|tr|h\d|div|td|th)[^>]*>', '\n', t, flags=re.I)
        txt = html.unescape(re.sub(r'<[^>]+>', ' ', t)); txt = re.sub(r'[ \t]+', ' ', txt); txt = re.sub(r'\n\s*\n+', '\n', txt)
    open(f'out/{k}.txt', 'w').write(txt)
# 2021 Census household income and population by city (Statistics Canada 98-10-0057 and 98-10-0001)
CSD = {'4806016': 'Calgary', '4811061': 'Edmonton', '5915022': 'Vancouver', '3520005': 'Toronto', '3506008': 'Ottawa', '4611040': 'Winnipeg', '4711066': 'Saskatoon', '4706027': 'Regina'}
for tid in ['98100057', '98100058', '98100055']:
    try:
        m = requests.get(f'https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{tid}/en', headers=UA, timeout=60).json()
        z = requests.get(m['object'], headers=UA, timeout=600)
        print('table', tid, len(z.content))
        zf = zipfile.ZipFile(io.BytesIO(z.content))
        name = [n for n in zf.namelist() if not n.endswith('MetaData.csv')][0]
        out = open(f'out/{tid}_cities.csv', 'w', newline=''); w = None
        with zf.open(name) as f:
            rd = csv.reader(io.TextIOWrapper(f, encoding='utf-8-sig'))
            hdr = next(rd); w = csv.writer(out); w.writerow(hdr)
            gi = [i for i, h in enumerate(hdr) if 'DGUID' in h][0]
            for row in rd:
                if row[gi][-7:] in CSD and 'A0005' in row[gi]: w.writerow(row)
        out.close()
    except Exception as e: print('table err', tid, e)
