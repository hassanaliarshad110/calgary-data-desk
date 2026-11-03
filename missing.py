"""Missing-person appeals from the Calgary Police Service, live.

The police post each appeal as a news release on the City newsroom and take it down once the person is found, so the
same public feed the newsroom publishes is read each time, and only what is still posted is shown. Nothing is saved
to disk: names and descriptions stay in memory for a few minutes and disappear from the app as soon as the police
remove the release. There is no public count of missing persons by ward or community, so the app shows appeals only.
"""
import html
import re
import threading
import time
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

FEED = 'https://newsroom.calgary.ca/tagfeed/en/tags/police'
PAGE = 'https://newsroom.calgary.ca/police-news-releases/'
CPS_MISSING = 'https://www.calgary.ca/cps/community-programs-and-resources/crime-prevention/missing-persons.html'
HOLD_SECONDS = 600

# An appeal: the title asks for help finding someone. Not: reviews, reports or charges that mention a past search.
APPEAL = re.compile(r'\bmissing\s+(person|persons|man|woman|men|women|teen|teens|youth|girl|boy|girls|boys|senior|'
                    r'child|children|mother|father|mom|dad|\d+[\s-]year[\s-]old)\b|^missing\b|help\s+(to\s+)?(locate|find)\b|'
                    r'seeking public assistance\s*[-–]\s*missing', re.I)
NOT_APPEAL = re.compile(r'\b(located|found safe|found|review|recommendation|response in|charged|remains|cold case)\b', re.I)
FOUND_TEXT = re.compile(r'\b(has|have) been (located|found)\b|\bwas located\b|\bfound safe\b', re.I)
# places in Ward 5 that releases name instead of the community
WARD5_PLACES = {'Saddletowne': 'Saddle Ridge', 'Genesis Centre': 'Saddle Ridge', 'Martindale CTrain': 'Martindale',
                'Saddletowne CTrain': 'Saddle Ridge', 'Cityscape': 'Cityscape', 'Country Hills Village': 'Cityscape'}

_lock = threading.Lock()
_held = {'at': 0.0, 'data': None}


def _fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Ward5DataDesk/1.0',
                                               'Accept': 'application/rss+xml, application/xml, text/xml'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def _text(fragment):
    t = re.sub(r'<[^>]+>', ' ', fragment or '')
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()


def is_appeal(title, body):
    return bool(APPEAL.search(title or '')) and not NOT_APPEAL.search(title or '') and not FOUND_TEXT.search(body[:400])


def where(body, ward5_names):
    """Ward 5 communities named in the release, and the first other place named ('in the community of X')."""
    hits = []
    for name in ward5_names:
        if re.search(r'\b' + re.escape(name) + r'\b', body, re.I) and name not in hits:
            hits.append(name)
    for place, comm in WARD5_PLACES.items():
        if re.search(r'\b' + re.escape(place) + r'\b', body, re.I) and comm not in hits:
            hits.append(comm)
    m = re.search(r"(?:community of|communities of|in the area of|near)\s+([A-Z][\w'-]*(?: [A-Z][\w'-]*){0,3})", body)
    return hits, (m.group(1).rstrip('.,') if m else '')


def parse(xml_bytes, ward5_names):
    root = ET.fromstring(xml_bytes)
    out = []
    for it in root.iter('item'):
        title = _text(it.findtext('title'))
        body = _text(it.findtext('description'))
        if not is_appeal(title, body):
            continue
        try:
            posted = parsedate_to_datetime(it.findtext('pubDate') or '').strftime('%Y-%m-%d %H:%M')
        except (TypeError, ValueError):
            posted = ''
        hits, place = where(body, ward5_names)
        sentences = re.split(r'(?<=[.!?])\s+', body)
        out.append({'title': title, 'link': (it.findtext('link') or '').strip(), 'posted': posted,
                    'ward5': bool(hits), 'communities': hits, 'place': place,
                    'summary': ' '.join(sentences[:2])[:420]})
    out.sort(key=lambda x: x['posted'], reverse=True)
    out.sort(key=lambda x: not x['ward5'])
    return out


def current(ward5_names, force=False, fetch=None):
    """{'ok', 'appeals': [...], 'checked': 'YYYY-MM-DD HH:MM', 'source', 'page', 'cps'} or {'ok': False, 'error'}."""
    import dashboard                      # here: Calgary time, without loading the dashboard at start-up
    with _lock:
        if not force and _held['data'] and time.time() - _held['at'] < HOLD_SECONDS:
            return _held['data']
        try:
            appeals = parse((fetch or _fetch)(FEED), [n for n in ward5_names if n and not re.match(r'^\d', n)])
            data = {'ok': True, 'appeals': appeals, 'checked': dashboard.calgary_now().strftime('%Y-%m-%d %H:%M'),
                    'source': FEED, 'page': PAGE, 'cps': CPS_MISSING}
        except Exception as e:                  # noqa: BLE001 - offline, site down or a changed feed
            data = {'ok': False, 'error': f'Could not read the police news releases ({e}).', 'page': PAGE, 'cps': CPS_MISSING,
                    'appeals': [], 'checked': ''}
            if _held['data'] and _held['data'].get('ok'):
                return {**_held['data'], 'stale': True}
            return data
        _held.update(at=time.time(), data=data)
        return data
