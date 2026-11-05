"""Calgary News: the daily articles (each with its sources) published to the repository's `news` branch.

Read live, so a new edition appears without rebuilding the website. Used by the laptop version and by Data Genie
and the Data Scientist (get_dashboard section city_news).
"""
import datetime as dt
import json
import urllib.request

BASE = 'https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/news/news/'


def _get(name):
    # plain request, no open data token: this is GitHub, not the City's portal
    with urllib.request.urlopen(urllib.request.Request(BASE + name), timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def latest():
    """Every article from the last 60 days, newest first."""
    d = _get('latest.json')
    d['articles'] = sorted(d.get('articles') or [], key=lambda a: (a.get('date', ''), a.get('published_at', '')), reverse=True)
    return d


def day(date):
    return _get(f'days/{date}.json')


def index():
    return _get('index.json')


def find(words=None, days=None, topic=None, date=None, full=True):
    """Articles matching all the words (title, summary, text, sources), a topic, a date, or the last `days` days."""
    try:
        if date:
            arts = (day(date) or {}).get('articles') or []
        else:
            arts = latest()['articles']
    except Exception as e:                     # noqa: BLE001
        return {'error': f'Calgary News could not be read just now ({str(e)[:120]}).'}
    if days:
        cut = (dt.date.today() - dt.timedelta(days=int(days))).isoformat()
        arts = [a for a in arts if a.get('date', '') >= cut]
    if topic:
        arts = [a for a in arts if any(topic.lower() == t.lower() for t in a.get('topics') or [])]
    q = [w for w in (words or '').lower().split() if w]
    if q:
        def text(a):
            return ' '.join([a.get('title', ''), a.get('dek', '')] + (a.get('body') or []) + (a.get('topics') or [])
                            + [s.get('title', '') + ' ' + s.get('outlet', '') for s in a.get('sources') or []]).lower()
        arts = [a for a in arts if all(w in text(a) for w in q)]
    keep = ('id', 'date', 'title', 'dek', 'topics', 'communities', 'wards', 'key_facts', 'sources')
    out = [{k: a.get(k) for k in keep + (('body',) if full else ())} for a in arts[:30]]
    return {'articles': out, 'found': len(arts),
            'note': 'Calgary News articles are written from the reports listed under sources, with [n] marking which '
                    'source supports each statement. Quote the original sources (outlet, title, link) when you rely '
                    'on an article; the article is a summary of them, not a primary source.'}
