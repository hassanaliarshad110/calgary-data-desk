"""Calgary News as pages search engines can read: calgaryinsight.ca/news/ (the latest stories), one page per story
(news/<id>/), and a page per month (news/YYYY-MM/). The stories are the same ones the City News screen shows, read
from the published editions on the repository's `news` branch (news/days/YYYY-MM-DD.json), so every story ever
published keeps its page. Each page credits the outlets the story is based on and links to them.

Called by build_site with the site folder; with no network (a laptop build) it quietly makes nothing."""
import html
import json
import os
import re
import urllib.request

from seo_pages import SITE, page, slug

RAW = 'https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/news/news/'
e = html.escape
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def _get(path, src):
    if src:
        with open(os.path.join(src, path), encoding='utf-8') as f:
            return json.load(f)
    req = urllib.request.Request(RAW + path, headers={'User-Agent': 'CalgaryInsightSite/1.0'})
    return json.loads(urllib.request.urlopen(req, timeout=40).read().decode('utf-8'))


def articles(src=None):
    """Every published story, newest first, with no repeats (a story updated later keeps the newest version)."""
    idx = _get('index.json', src)
    seen, out = set(), []
    for d in sorted({x['date'] for x in idx.get('days') or []}, reverse=True):
        try:
            day = _get(f'days/{d}.json', src)
        except Exception:
            continue
        for a in sorted(day.get('articles') or [], key=lambda a: a.get('published_at') or '', reverse=True):
            if a.get('id') and a['id'] not in seen and a.get('title') and a.get('body'):
                seen.add(a['id'])
                out.append(a)
    return out


def nice_date(d):
    try:
        y, m, dd = d[:10].split('-')
        return f'{MONTHS[int(m) - 1]} {int(dd)}, {y}'
    except Exception:
        return d


def chart_table(c, sources):
    labels, series = c.get('labels') or [], c.get('series') or []
    if not labels or not series:
        return ''
    unit = c.get('unit') or ''
    head = ''.join(f'<th class="n">{e(s.get("name") or "")}{(" (" + e(unit) + ")") if unit else ""}</th>' for s in series)
    rows = ''.join('<tr><td>' + e(str(l)) + '</td>' + ''.join(
        f'<td class="n">{e(str((s.get("values") or [None] * len(labels))[i]) if i < len(s.get("values") or []) else "")}</td>' for s in series) + '</tr>'
        for i, l in enumerate(labels))
    src = ''
    k = c.get('source')
    if isinstance(k, int) and 1 <= k <= len(sources):
        s = sources[k - 1]
        src = f'<p class="note">Source: {e(s.get("outlet") or "")}</p>'
    return f'<h2>{e(c.get("title") or "")}</h2><div class="wrap"><table><thead><tr><th></th>{head}</tr></thead><tbody>{rows}</tbody></table></div>{src}'


def story_page(a, comm_paths, prev_next):
    path = f'news/{a["id"]}/'
    sources = a.get('sources') or []
    img = a.get('image') or {}
    body = [f'<p class="kicker">{e(a.get("section") or "Calgary News")} · {e(nice_date(a.get("date") or ""))}</p>',
            f'<h1>{e(a["title"])}</h1>']
    if a.get('dek'):
        body.append(f'<p class="lead">{e(a["dek"])}</p>')
    if img.get('url'):
        cr = ', '.join(x for x in [img.get('credit'), img.get('license')] if x)
        body.append(f'<figure class="hero"><img src="{e(img["url"])}" alt="{e(img.get("alt") or "")}" loading="lazy" referrerpolicy="no-referrer">'
                    f'<figcaption>Photo: {e(cr)}{", " if cr else ""}<a href="{e(img.get("page") or img["url"])}" rel="nofollow noopener">{e(img.get("via") or "source")}</a></figcaption></figure>')
    if a.get('key_facts'):
        body.append('<div class="facts"><h2>Key facts</h2><ul>' + ''.join(f'<li>{e(k)}</li>' for k in a['key_facts']) + '</ul></div>')
    def cite(p):                  # [1] marks the source a statement comes from: link it, as the dashboard does
        return re.sub(r'\[(\d+)\]', lambda m: (f'<a class="cite" href="{e(sources[int(m.group(1)) - 1].get("url") or "")}" rel="noopener" '
                                                f'title="{e(sources[int(m.group(1)) - 1].get("outlet") or "")}">[{m.group(1)}]</a>')
                      if 1 <= int(m.group(1)) <= len(sources) else m.group(0), e(p))
    body += [f'<p>{cite(p)}</p>' for p in (a.get('body') or []) if p]
    body.append('<p class="note">Each statement is marked with the source it comes from. This story summarises those reports in its own words and adds no opinion.</p>')
    for c in a.get('charts') or []:
        body.append(chart_table(c, sources))
    if sources:
        body.append('<h2>Sources</h2><p>This story is written from the reporting and official notices below. Read them for the full details.</p><ol class="srcs">'
                    + ''.join(f'<li><a href="{e(s.get("url") or "")}" rel="noopener">{e(s.get("title") or s.get("url") or "")}</a>'
                              f' <span>{e(s.get("outlet") or "")}{(", " + e(nice_date(s["published"]))) if s.get("published") else ""}</span></li>' for s in sources)
                    + '</ol>')
    places = []
    for w in a.get('wards') or []:
        try:
            places.append(f'<a href="../../wards/{int(w)}/">Ward {int(w)}</a>')
        except (TypeError, ValueError):
            pass
    for c in a.get('communities') or []:
        p = comm_paths.get(str(c).upper()) or comm_paths.get(slug(str(c)))
        if p:
            places.append(f'<a href="../../{p[0]}">{e(p[1])}</a>')
    if places:
        body.append('<h2>The places in this story</h2><p>Figures for each, from public data: ' + ' · '.join(places) + '</p>')
    if a.get('topics'):
        body.append('<p class="note">Topics: ' + ', '.join(e(t) for t in a['topics']) + '</p>')
    pv, nx = prev_next
    nav = []
    if nx:
        nav.append(f'<a href="../{nx["id"]}/">← Newer: {e(nx["title"])}</a>')
    if pv:
        nav.append(f'<a href="../{pv["id"]}/">Older: {e(pv["title"])} →</a>')
    body.append('<p class="pn">' + '<br>'.join(nav) + '</p>' if nav else '')
    body.append('<a class="cta" href="../../?view=citynews">Today\'s Calgary News on the dashboard</a>')
    m = (a.get('date') or '')[:7]
    if len(m) == 7:
        body.append(f'<p><a href="../">All Calgary News</a> · <a href="../{m}/">{MONTHS[int(m[5:]) - 1]} {m[:4]}</a></p>')
    ld = [{'@type': 'NewsArticle', 'headline': a['title'][:110], 'description': a.get('dek') or '', 'url': SITE + path,
           'mainEntityOfPage': SITE + path, 'datePublished': a.get('published_at') or a.get('date'), 'dateModified': a.get('published_at') or a.get('date'),
           'articleSection': a.get('section') or '', 'keywords': ', '.join(a.get('topics') or []),
           'image': [img['url']] if img.get('url') else [SITE + 'og-image.png'],
           'author': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE},
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE, 'logo': {'@type': 'ImageObject', 'url': SITE + 'logo.svg'}},
           'isBasedOn': [s.get('url') for s in sources if s.get('url')],
           'contentLocation': {'@type': 'City', 'name': 'Calgary'}}]
    desc = (a.get('dek') or a['title'])[:300]
    return path, page(path, f'{a["title"]} | Calgary News', desc,
                      [('Calgary Insight', ''), ('Calgary News', 'news/'), (a['title'][:60] + ('…' if len(a['title']) > 60 else ''), path)],
                      '\n'.join(x for x in body if x), ld, og_type='article', image=img.get('url'))


def listing(items, up):
    out, day = [], None
    for a in items:
        if a.get('date') != day:
            if day is not None:
                out.append('</ul>')
            day = a.get('date')
            out.append(f'<h2>{e(nice_date(day or ""))}</h2><ul class="news">')
        out.append(f'<li><a href="{up}{a["id"]}/">{e(a["title"])}</a><span>{e(a.get("section") or "")}</span>'
                   + (f'<p>{e(a["dek"])}</p>' if a.get('dek') else '') + '</li>')
    if day is not None:
        out.append('</ul>')
    return '\n'.join(out)


def build(out, comm_pages=None, src=None):
    """Write the news pages into the site folder `out`. Returns the site-relative addresses, newest first."""
    try:
        items = articles(src)
    except Exception as ex:
        print('  Calgary News pages skipped:', str(ex)[:120])
        return []
    if not items:
        return []
    comm_paths = {}
    for c in comm_pages or []:
        comm_paths[str(c.get('code', '')).upper()] = (c['path'], c['name'])
        comm_paths[slug(c['name'])] = (c['path'], c['name'])
    urls = []
    for i, a in enumerate(items):
        pv = items[i + 1] if i + 1 < len(items) else None
        nx = items[i - 1] if i > 0 else None
        path, doc = story_page(a, comm_paths, (pv, nx))
        os.makedirs(os.path.join(out, path), exist_ok=True)
        with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(doc)
        urls.append(path)
    # the front page: the last 14 days of stories, then links to every month
    recent_days = sorted({a['date'] for a in items}, reverse=True)[:14]
    months = sorted({a['date'][:7] for a in items if a.get('date')}, reverse=True)
    mlinks = ' · '.join(f'<a href="{m}/">{MONTHS[int(m[5:]) - 1]} {m[:4]}</a>' for m in months)
    sections = sorted({a.get('section') for a in items if a.get('section')})
    body = ['<h1>Calgary News</h1>',
            '<p class="lead">The day\'s Calgary stories in plain words, each written from the reporting and official notices it cites, '
            'with links to the original sources and to the figures for the wards and communities involved. New stories every day.</p>',
            '<p>Sections: ' + ', '.join(e(s) for s in sections) + '.</p>',
            listing([a for a in items if a['date'] in recent_days], ''),
            '<h2>Every month</h2><p>' + mlinks + '</p>',
            '<a class="cta" href="../?view=citynews">Read Calgary News on the dashboard</a>']
    os.makedirs(os.path.join(out, 'news'), exist_ok=True)
    with open(os.path.join(out, 'news', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page('news/', 'Calgary News: today\'s Calgary stories with their sources | Calgary Insight',
                     'The day\'s Calgary news in plain words: City Hall, public safety, transit, housing, business and events, each story with its sources and the figures for the communities involved.',
                     [('Calgary Insight', ''), ('Calgary News', 'news/')], '\n'.join(body),
                     [{'@type': 'CollectionPage', 'name': 'Calgary News', 'url': SITE + 'news/'}]))
    urls.insert(0, 'news/')
    for m in months:
        mi = [a for a in items if a['date'].startswith(m)]
        name = f'{MONTHS[int(m[5:]) - 1]} {m[:4]}'
        mb = [f'<h1>Calgary News, {e(name)}</h1>', f'<p class="lead">{len(mi)} Calgary stories published in {e(name)}, newest first.</p>',
              listing(mi, '../'), '<p><a href="../">Latest Calgary News</a> · ' + mlinks.replace('href="', 'href="../') + '</p>']
        os.makedirs(os.path.join(out, 'news', m), exist_ok=True)
        with open(os.path.join(out, 'news', m, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(f'news/{m}/', f'Calgary News, {name} | Calgary Insight', f'Every Calgary News story published in {name}, with its sources.',
                         [('Calgary Insight', ''), ('Calgary News', 'news/'), (name, f'news/{m}/')], '\n'.join(mb)))
        urls.append(f'news/{m}/')
    print(f'  Calgary News pages: {len(items)} stories, {len(months)} months')
    return urls
