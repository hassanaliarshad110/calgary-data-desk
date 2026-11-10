import requests, pdfplumber, re
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight; hello@calgaryinsight.ca)'}
def get(u):
    try:
        r = requests.get(u, headers=UA, timeout=90); print(r.status_code, len(r.content), r.headers.get('content-type'), u); return r
    except Exception as e: print('ERR', e, u)
for name, u in [('proposed-2027-2030', 'https://pub-calgary.escribemeetings.com/FileStream.ashx?DocumentId=377372'),
                ('plan-schedule', 'https://pub-calgary.escribemeetings.com/filestream.ashx?DocumentId=351269'),
                ('budget-2026-overview', 'https://pub-calgary.escribemeetings.com/filestream.ashx?DocumentId=338952'),
                ('survey-2023', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/other-reports/Residential-Property-Taxes-and-Utility-Charges-Survey-2023.pdf'),
                ('edmonton-tax-compare-2025', 'https://pub-edmonton.escribemeetings.com/filestream.ashx?DocumentId=294459')]:
    r = get(u)
    if not r or r.status_code != 200 or b'%PDF' not in r.content[:1024]: continue
    open(f'out/{name}.pdf', 'wb').write(r.content)
    with pdfplumber.open(f'out/{name}.pdf') as p:
        open(f'out/{name}.txt', 'w').write('\n\n=== page\n'.join((pg.extract_text() or '') for pg in p.pages)); print('  pages', len(p.pages))
r = get('https://data.calgary.ca/api/views/m5bi-n8x4/rows.csv?accessType=DOWNLOAD')
if r and r.status_code == 200: open('out/m5bi-n8x4.csv', 'wb').write(r.content)
r = get('https://data.calgary.ca/api/views/m5bi-n8x4.json')
if r and r.status_code == 200: open('out/m5bi-n8x4.meta.json', 'wb').write(r.content)
m = get('https://pub-calgary.escribemeetings.com/Meeting.aspx?Id=92e1e45e-2fd7-4165-b332-06c1ea477848&lang=English&Agenda=Agenda&Item=27&Tab=attachments')
if m and m.status_code == 200:
    open('out/meeting-nov10.html', 'w').write(m.text)
    for did, t in re.findall(r'DocumentId=(\d+)[^>]*>([^<]{0,120})', m.text)[:30]:
        print('doc', did, t.strip())
