import urllib.request, re
H = {'User-Agent': 'Mozilla/5.0'}
B = 'https://calgaryinsight.ca/'
def get(u):
    r = urllib.request.urlopen(urllib.request.Request(B + u + ('&' if '?' in u else '?') + 'v=3', headers=H), timeout=30); return r.status, r.read()
for u in ['game/', 'game/img/hero.jpg', 'game/img/eau-claire.jpg', '311/', 'crime/', 'growth/', 'communities/pages.json', 'about/']:
    try: s, b = get(u); print('CHK', s, u, len(b))
    except Exception as e: print('CHK ERR', u, e)
s, h = get(''); h = h.decode()
print('CHK view-game', 'id="view-game"' in h, 'data-view="game"' in h)
js = re.search(r'site\.[0-9a-f]+\.js', h).group(0)
s, j = get(js); j = j.decode()
for k in ['web-finder', 'onCommunityPanel', 'vi-game', 'web-game-promo', 'web-game-tab']: print('CHK', k, k in j)
s, sm = get('sitemap.xml'); print('CHK sitemap game', b'/game/' in sm, '311', b'/311/' in sm)
s, a = get('about/'); print('CHK about corrections', b'Spotted an error' in a, 'Hassan' in a.decode())
