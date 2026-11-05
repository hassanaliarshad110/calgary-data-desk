"""Publish a day's Calgary News edition to the `news` branch layout.

    python tools/news_publish.py EDITION.json NEWS_DIR

EDITION.json: {"date": "YYYY-MM-DD", "articles": [article, ...]}  (at least 3 articles)
article: {"title", "dek", "body": [paragraphs with [n] citation markers], "key_facts": [..], "topics": [..],
          "wards": [ints, optional], "communities": [names, optional],
          "sources": [{"title", "outlet", "url", "published": "YYYY-MM-DD"}]}
NEWS_DIR is a checkout of the `news` branch; this writes news/days/DATE.json, news/latest.json (last 60 days) and
news/index.json (every day's headlines). The website, the laptop version and Data Genie read these files.
The checks stop the publish when an article is not cited, a marker points at no source, or a quote runs long.
"""
import datetime as dt
import json
import os
import re
import sys

KEEP_DAYS = 60
TOPICS = {'City Council', 'City services', 'Transit', 'Roads and traffic', 'Housing', 'Development', 'Public safety',
          'Health', 'Education', 'Economy', 'Business', 'Energy', 'Environment', 'Weather', 'Parks and recreation',
          'Arts and culture', 'Sports', 'Community', 'Provincial', 'Federal', 'Courts', 'Water', 'Budget and taxes',
          'Elections', 'Indigenous', 'Immigration', 'Technology', 'Events'}


def slug(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')[:70]


def check(ed):
    errs = []
    date = ed.get('date', '')
    try:
        dt.date.fromisoformat(date)
    except ValueError:
        errs.append(f'date {date!r} is not YYYY-MM-DD')
    arts = ed.get('articles') or []
    if len(arts) < 3:
        errs.append(f'an edition needs at least 3 articles, this has {len(arts)}')
    titles = set()
    for k, a in enumerate(arts, 1):
        w = f'article {k} ({(a.get("title") or "")[:50]!r})'
        for f in ('title', 'dek', 'body', 'sources', 'topics'):
            if not a.get(f):
                errs.append(f'{w}: missing {f}')
        if a.get('title') in titles:
            errs.append(f'{w}: same title twice')
        titles.add(a.get('title'))
        src = a.get('sources') or []
        for n, s in enumerate(src, 1):
            if not str(s.get('url', '')).startswith('https://'):
                errs.append(f'{w}: source {n} has no https url')
            if not s.get('outlet') or not s.get('title'):
                errs.append(f'{w}: source {n} needs title and outlet')
        body = a.get('body') or []
        if isinstance(body, str):
            errs.append(f'{w}: body must be a list of paragraphs')
            body = [body]
        text = ' '.join(body)
        used = {int(m) for m in re.findall(r'\[(\d+)\]', text)}
        if src and not used:
            errs.append(f'{w}: the body cites no source ([1], [2] ...)')
        for m in used:
            if m < 1 or m > len(src):
                errs.append(f'{w}: marker [{m}] has no source')
        for n in range(1, len(src) + 1):
            if n not in used:
                errs.append(f'{w}: source {n} is listed but never cited')
        for q in re.findall(r'["“]([^"”]+)["”]', text):
            if len(q.split()) > 15:
                errs.append(f'{w}: a quotation runs past 15 words ({q[:40]!r}...); put it in your own words')
        if len(re.findall(r'["“][^"”]{12,}["”]', text)) > 1:
            errs.append(f'{w}: more than one direct quotation')
        words = len(text.split())
        if words < 150 or words > 900:
            errs.append(f'{w}: {words} words; write 150 to 900')
        bad = [t for t in a.get('topics') or [] if t not in TOPICS]
        if bad:
            errs.append(f'{w}: unknown topics {bad}; use {sorted(TOPICS)}')
        low = (text + ' ' + a.get('title', '') + ' ' + a.get('dek', '')).lower()
        for word in ('supersonic', 'nobody has counted'):
            if word in low:
                errs.append(f'{w}: avoid the phrase {word!r}')
    return errs


def publish(ed, root):
    date = ed['date']
    now = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    os.makedirs(os.path.join(root, 'news', 'days'), exist_ok=True)
    arts = []
    for a in ed['articles']:
        a = dict(a)
        a['id'] = a.get('id') or f'{date}-{slug(a["title"])}'
        a['date'] = date
        a['published_at'] = a.get('published_at') or now
        a['words'] = len(' '.join(a['body']).split())
        arts.append(a)
    day = {'date': date, 'published_at': now, 'articles': arts}
    with open(os.path.join(root, 'news', 'days', f'{date}.json'), 'w', encoding='utf-8') as f:
        json.dump(day, f, ensure_ascii=False, indent=1)
    days = sorted((f[:-5] for f in os.listdir(os.path.join(root, 'news', 'days')) if f.endswith('.json')), reverse=True)
    index, latest = [], []
    cut = (dt.date.fromisoformat(days[0]) - dt.timedelta(days=KEEP_DAYS)).isoformat()
    for d in days:
        with open(os.path.join(root, 'news', 'days', f'{d}.json'), encoding='utf-8') as f:
            x = json.load(f)
        index.append({'date': d, 'articles': [{'id': a['id'], 'title': a['title'], 'topics': a.get('topics', []),
                                               'sources': len(a.get('sources', []))} for a in x['articles']]})
        if d > cut:
            latest += x['articles']
    with open(os.path.join(root, 'news', 'index.json'), 'w', encoding='utf-8') as f:
        json.dump({'updated': now, 'days': index}, f, ensure_ascii=False)
    with open(os.path.join(root, 'news', 'latest.json'), 'w', encoding='utf-8') as f:
        json.dump({'updated': now, 'keep_days': KEEP_DAYS, 'articles': latest}, f, ensure_ascii=False)
    return len(arts), len(days)


if __name__ == '__main__':
    with open(sys.argv[1], encoding='utf-8') as f:
        edition = json.load(f)
    problems = check(edition)
    if problems:
        print('NOT PUBLISHED. Fix these:\n- ' + '\n- '.join(problems))
        sys.exit(1)
    n, d = publish(edition, sys.argv[2])
    print(f'published {n} articles for {edition["date"]}; {d} days on file')
