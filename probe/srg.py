import sys, os, json, re, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (CalgaryInsight research)'}
def get(url, name=None, binary=False):
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90)
        b = r.read()
        if name:
            open(os.path.join(out, name), 'wb').write(b)
        print('OK', len(b), url)
        return b
    except Exception as e:
        print('FAIL', url, e); return b''
ITEM = '6d7a9bcb73814daab1ff73bf7e1001d9'
base = f'https://www.arcgis.com/sharing/rest/content/items/{ITEM}'
get(base + '?f=json', 'item.json')
d = get(base + '/data?f=json', 'story.json')
get(base + '/resources?f=json&num=1000', 'resources.json')
# every URL in the story: images, embeds, items
urls = sorted(set(re.findall(rb'https?://[^"\\\s]+', d)))
open(os.path.join(out, 'story_urls.txt'), 'wb').write(b'\n'.join(urls))
# resources (images uploaded to the story)
try:
    res = json.load(open(os.path.join(out, 'resources.json')))
    os.makedirs(os.path.join(out, 'res'), exist_ok=True)
    for r in res.get('resources', []):
        n = r['resource']
        get(base + '/resources/' + urllib.parse.quote(n), os.path.join('res', n.replace('/', '_')))
except Exception as e:
    print('resources fail', e)
# referenced arcgis items (webmaps, apps, embedded tables)
ids = sorted(set(re.findall(rb'[0-9a-f]{32}', d)) - {ITEM.encode()})
os.makedirs(os.path.join(out, 'items'), exist_ok=True)
for i in ids:
    i = i.decode()
    get(f'https://www.arcgis.com/sharing/rest/content/items/{i}?f=json', f'items/{i}.json')
    get(f'https://www.arcgis.com/sharing/rest/content/items/{i}/data?f=json', f'items/{i}_data.json')
# City page and PDFs
pg = get('https://www.calgary.ca/research/suburban-residential-growth.html', 'city_page.html')
links = sorted(set(re.findall(rb'href="([^"]+)"', pg)))
open(os.path.join(out, 'city_links.txt'), 'wb').write(b'\n'.join(links))
os.makedirs(os.path.join(out, 'pdf'), exist_ok=True)
for l in links:
    l = l.decode()
    if l.lower().endswith('.pdf') or 'xlsx' in l.lower() or 'csv' in l.lower():
        u = urllib.parse.urljoin('https://www.calgary.ca/', l)
        get(u, 'pdf/' + os.path.basename(urllib.parse.urlparse(u).path))
for u in ['https://www.calgary.ca/content/dam/www/pda/pd/documents/development/PD-Suburban-Residential-Growth-2022-2026-Web-Posting-Final.pdf',
          'https://www.calgary.ca/content/dam/www/pda/pd/documents/development/Suburban%20Growth%20Report%202021-2025_for_web_posting.pdf']:
    get(u, 'pdf/' + urllib.parse.unquote(os.path.basename(u)).replace(' ', '_'))
# open data search
for q in ['suburban residential growth', 'suburban growth', 'land supply']:
    get('https://data.calgary.ca/api/catalog/v1?domains=data.calgary.ca&limit=20&q=' + urllib.parse.quote(q), 'catalog_' + q.replace(' ', '_') + '.json')
