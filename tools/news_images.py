"""Find a reference image for each Calgary News article that has none, from Wikimedia Commons.

Runs in GitHub Actions on every push to the `news` branch (the workspace that writes articles cannot reach Commons).
Each article names what to show in "image_query" (a place or object, never a person). The first openly licensed
photo that matches (CC0, public domain, CC BY or CC BY-SA), is at least 800 px wide and is not filed under people or
portraits is kept, with its author, licence and Commons page so the site can credit it. The image illustrates the
subject; it is not a photo of the event.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import news_publish                                        # noqa: E402

API = 'https://commons.wikimedia.org/w/api.php'
UA = {'User-Agent': 'CalgaryDataDesk/2.0 (https://github.com/hassanaliarshad110/calgary-data-desk; news images)'}
LICENCE = re.compile(r'^(CC0|Public domain|PD|CC BY(-SA)? \d(\.\d)?)', re.I)
PEOPLE = re.compile(r'people|portrait|politician|men\b|women\b|children|selfie|members of|mayors? of|ministers? of|'
                    r'musicians|athletes|players|actors|births|deaths|celebrit|crowd|protest|funeral', re.I)


def strip(h):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h or '')).strip()


def search(q):
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': q + ' filetype:bitmap',
              'gsrnamespace': 6, 'gsrlimit': 15, 'prop': 'imageinfo|categories', 'iiprop': 'url|extmetadata|mime|size',
              'iiurlwidth': 1200, 'cllimit': 'max', 'clshow': '!hidden'}
    with urllib.request.urlopen(urllib.request.Request(API + '?' + urllib.parse.urlencode(params), headers=UA), timeout=60) as r:
        pages = (json.loads(r.read()).get('query') or {}).get('pages') or {}
    words = [w for w in re.findall(r'[a-z]{3,}', q.lower())]
    def score(p):                       # files whose name carries more of the query words first, then search order
        t = p.get('title', '').lower()
        return (-sum(w in t for w in words), p.get('index', 99))
    for p in sorted(pages.values(), key=score):
        ii = (p.get('imageinfo') or [{}])[0]
        md = ii.get('extmetadata') or {}
        lic = (md.get('LicenseShortName') or {}).get('value', '')
        cats = ' '.join(c.get('title', '') for c in p.get('categories') or []) + ' ' + (md.get('Categories') or {}).get('value', '')
        if ii.get('mime') not in ('image/jpeg', 'image/png') or (ii.get('width') or 0) < 800:
            continue
        if not LICENCE.match(lic) or PEOPLE.search(cats) or PEOPLE.search(p.get('title', '')):
            continue
        if (md.get('Restrictions') or {}).get('value') or re.search(r'abandon|ruin|derelict|disaster|wreck', p.get('title', ''), re.I):
            continue
        return {'url': ii.get('thumburl') or ii.get('url'), 'page': ii.get('descriptionurl'),
                'credit': strip((md.get('Artist') or {}).get('value')) or 'Unknown author',
                'license': lic, 'license_url': (md.get('LicenseUrl') or {}).get('value', ''),
                'alt': strip((md.get('ObjectName') or {}).get('value')) or q, 'query': q, 'via': 'Wikimedia Commons'}
    return None


def main(root):
    changed = 0
    ddir = os.path.join(root, 'news', 'days')
    for f in sorted(os.listdir(ddir))[-3:]:                 # the newest days only
        path = os.path.join(ddir, f)
        with open(path, encoding='utf-8') as fh:
            day = json.load(fh)
        for a in day['articles']:
            if a.get('image') or not a.get('image_query') or a.get('image_tried') == a['image_query']:
                continue
            for q in [a['image_query']] + [x for x in [a.get('image_query_2'), 'Calgary skyline'] if x]:
                try:
                    img = search(q)
                except Exception as e:                      # noqa: BLE001
                    print('search failed', q, e)
                    img = None
                if img:
                    a['image'] = img
                    break
            a['image_tried'] = a['image_query']
            changed += 1
            print(f, a['title'][:60], '->', (a.get('image') or {}).get('page'))
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(day, fh, ensure_ascii=False, indent=1)
    if changed:
        news_publish.reindex(root)
    print('articles looked at:', changed)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
