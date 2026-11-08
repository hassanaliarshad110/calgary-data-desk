"""Data Genie and Data Scientist on the website: the desktop app's own agent (agent.py), run in the visitor's browser
by Pyodide inside a web worker (genie-worker.js).

The only differences from the desktop app:
  - web requests go through the browser (urllib.request.urlopen is replaced by a synchronous XMLHttpRequest, which a
    worker may make), so they reach only sources that let a web page read them (City of Calgary open data does);
  - the police, Crime Severity Index and other saved copies come from the website's daily build (data/cache/);
  - the Claude key is the one unlocked with the access code, and files are kept in the browser's memory.
"""
import email.message
import io
import json
import os
import sys
import urllib.error
import urllib.request

import js                                        # the worker's global scope
from pyodide.ffi import to_js

HOME = '/home/pyodide'
DATA = os.path.join(HOME, 'appdata')             # the desktop app's _appdata: police, CSI, reports list
DOWN = os.path.join(HOME, 'downloads')           # files Data Genie saves (offered to the visitor as downloads)
for d in (DATA, DOWN):
    os.makedirs(d, exist_ok=True)

NO_CORS = ('calgarypolice.ca', 'statcan.gc.ca', 'cmhc-schl.gc.ca', 'alberta.ca', 'newsroom.calgary.ca')


# ---------------------------------------------------------------- the web, through the browser
class _Reply(io.BytesIO):
    def __init__(self, body, status, url, headers):
        super().__init__(body)
        self.status = self.code = status
        self.url, self.headers = url, headers

    def getcode(self):
        return self.status

    def geturl(self):
        return self.url

    def info(self):
        return self.headers


def _headers(raw):
    h = email.message.Message()
    for line in str(raw or '').splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            h[k.strip()] = v.strip()
    return h


def urlopen(req, data=None, timeout=None, **_):
    if isinstance(req, str):
        req = urllib.request.Request(req, data=data)
    url, body = req.full_url, req.data if req.data is not None else data
    host = url.split('/')[2] if '//' in url else url
    if any(host.endswith(h) for h in NO_CORS):
        raise urllib.error.URLError(f'{host} does not let a web page read it directly; the website uses its daily copy '
                                    'of this source, and the desktop app reads it live')
    headers = dict(req.header_items())
    if host == 'api.anthropic.com':
        headers['anthropic-dangerous-direct-browser-access'] = 'true'
    tries = 3 if host == 'api.anthropic.com' else 1       # a dropped phone connection: try the AI service again
    for attempt in range(tries):
        x = js.XMLHttpRequest.new()
        x.open(req.get_method(), url, False)
        x.responseType = 'arraybuffer'
        for k, v in headers.items():
            if k.lower() not in ('user-agent', 'host', 'connection', 'content-length', 'accept-encoding'):
                x.setRequestHeader(k, v)
        try:
            x.send(to_js(bytes(body)) if body else None)
        except Exception as e:                   # noqa: BLE001 - blocked, offline or refused by the site
            if attempt + 1 < tries:
                continue
            raise urllib.error.URLError(f'could not reach {host} from this browser ({e})') from None
        if x.status:
            break
        if attempt + 1 >= tries:
            raise urllib.error.URLError(f'could not reach {host} from this browser')
    raw = bytes(js.Uint8Array.new(x.response).to_py()) if x.response else b''
    h = _headers(x.getAllResponseHeaders())
    if x.status >= 400:
        raise urllib.error.HTTPError(url, x.status, str(x.statusText or ''), h, io.BytesIO(raw))
    return _Reply(raw, x.status, url, h)


urllib.request.urlopen = urlopen

import agent as agent_mod                        # noqa: E402  (after the web is set up)
import analyst                                   # noqa: E402
import auditor                                   # noqa: E402
import census                                    # noqa: E402
import methods                                   # noqa: E402

STATE = {'key': '', 'dash': None, 'wards': None, 'tax': None}


def _post(who, event):
    js.postMessage(json.dumps({'event': event, 'who': who}, default=str))


def _settings():
    return {'api_key': STATE['key'], 'models': {}}


def _scope():
    return (STATE['dash'] or {}).get('scope') or {}


def _place():
    """The area selected on the website: 'Calgary' or a ward's name (None before the dashboard is sent)."""
    sc = _scope()
    return 'Calgary' if sc.get('kind') == 'city' else sc.get('name')


def setattr_(o, k, v):
    setattr(o, k, v)
    return o


def _make(who):
    a = agent_mod.Agent(_settings, lambda ev: _post(who, ev), DOWN, lambda: STATE['dash'], DATA, lambda: STATE['wards'])
    a.tax_provider = lambda: STATE['tax']
    return a


GENIE, SCIENTIST = _make('genie'), _make('scientist')
SCIENTIST.who = 'The Data Scientist'
SCIENTIST.web = True                     # the Data Scientist can search the web and read pages (Claude only)


def _today():
    import dashboard
    return dashboard.calgary_now().date().isoformat()


def _reports():
    try:
        with open(os.path.join(DATA, 'reports.json'), encoding='utf-8') as f:
            items = json.load(f)
    except (OSError, ValueError):
        return []
    out = []
    for x in items:
        ok = {k: x.get(k) if x.get(k) and os.path.exists(x[k]) else None for k in ('pdf', 'interactive', 'xlsx', 'print')}
        if any(ok.values()):
            out.append({**x, **ok})
    return out


def handle(op, args_json):
    """One request from the page. Returns JSON text."""
    a = json.loads(args_json or '{}')
    try:
        if op == 'key':
            STATE['key'] = a.get('key') or ''
            return json.dumps({'ok': True})
        if op == 'context':
            for k in ('dash', 'wards', 'tax'):
                if k in a:
                    STATE[k] = a[k]
            return json.dumps({'ok': True})
        if op == 'ask':
            res = GENIE.ask(a.get('question') or '', a.get('mode') or 'fast', today=_today())
            return json.dumps({'ok': True, **res}, default=str)
        if op == 'new_chat':
            GENIE.reset()
            return json.dumps(True)
        if op == 'analyst_run':
            SCIENTIST.reset()
            tier = 'smart' if a.get('depth') == 'quick' else 'audit'       # Quick: the fast model; Thorough: the strongest
            res = SCIENTIST.ask(analyst.brief(a.get('key'), a.get('text'), area=_place()), tier, today=_today())
            return json.dumps({'ok': True, **res}, default=str)
        if op == 'business_report':
            SCIENTIST.reset()
            res = SCIENTIST.ask(analyst.business_brief(a.get('text'), a.get('area') or _place()), 'audit', today=_today())
            return json.dumps({'ok': True, **res}, default=str)
        if op == 'election_report':
            SCIENTIST.reset()
            res = SCIENTIST.ask(analyst.election_brief(a.get('text'), a.get('area') or _place()), 'audit', today=_today())
            return json.dumps({'ok': True, **res}, default=str)
        if op == 'analyst_reports':
            return json.dumps(_reports(), default=str)
        if op == 'audit_list':
            return json.dumps(auditor.index(DATA), default=str)
        if op == 'audit_run':
            entry = next((r for r in _reports() if a.get('report') in (r.get('pdf'), r.get('interactive'))), None)
            if not entry:
                return json.dumps({'ok': False, 'error': 'That report is not in this browser any more.'})
            res = auditor.run(entry, lambda: setattr_(_make('auditor'), 'who', 'The report auditor'), lambda ev: _post('auditor', ev), _today(), DOWN)
            auditor.index(DATA, res)
            return json.dumps({'ok': True, 'page': res['page'], 'findings': len(res['findings']), 'verdict': res['verdict'],
                               'corrected': res.get('corrected')}, default=str)
        if op == 'file':
            p = os.path.realpath(a.get('path') or '')
            if not p.startswith(HOME + '/') or not os.path.isfile(p):
                return json.dumps({'ok': False, 'error': 'That file is not in this browser any more.'})
            return json.dumps({'ok': True, 'name': os.path.basename(p), 'path': p})
        return json.dumps({'ok': False, 'error': f'unknown request {op}'})
    except agent_mod.AgentError as e:
        return json.dumps({'ok': False, 'error': str(e)})
    except Exception as e:                       # noqa: BLE001 - shown on the screen instead of stopping the worker
        import traceback
        traceback.print_exc()
        return json.dumps({'ok': False, 'error': f'Something went wrong: {e}'})
