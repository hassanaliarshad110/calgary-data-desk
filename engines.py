"""The AI services Data Genie and the Data Scientist can use, in the office's order of priority.

Up to four services are saved in Settings (Claude, Gemini, ChatGPT, or any service with an OpenAI-style chat
address). Each question goes to the first one that works. When a service runs out of credit, reaches its daily
or per-minute limit, refuses the key or is down, the question carries on with the next one in the list, from the
step it had reached, and the failed service rests for a while before it is tried again.

The conversation is kept in one format (Claude's) and translated for the other services on each call, so a
question can change service half way through without losing its work.
"""
import json
import re
import time
import urllib.error
import urllib.request
import uuid

MAX_ENGINES = 4
ANTHROPIC_VERSION = '2023-06-01'

PROVIDERS = {
    'claude': {'label': 'Claude', 'company': 'Anthropic', 'kind': 'anthropic',
               'url': 'https://api.anthropic.com/v1/messages',
               'fast': 'claude-haiku-5-5', 'smart': 'claude-sonnet-5-5', 'key_hint': 'sk-ant-...',
               'key_page': 'https://console.anthropic.com/settings/keys', 'free': False,
               'about': 'Paid by use. The most reliable for long reports.'},
    'gemini': {'label': 'Gemini', 'company': 'Google', 'kind': 'chat',
               'url': 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
               'fast': 'gemini-2.5-flash', 'smart': 'gemini-2.5-pro', 'key_hint': 'AIza...',
               'key_page': 'https://aistudio.google.com/apikey', 'free': True,
               'about': 'A free key from Google AI Studio has daily limits. On the free tier Google may use what is '
                        'sent to improve its products, so do not type residents\' personal details.'},
    'openai': {'label': 'ChatGPT', 'company': 'OpenAI', 'kind': 'chat',
               'url': 'https://api.openai.com/v1/chat/completions',
               'fast': 'gpt-5-mini', 'smart': 'gpt-5', 'key_hint': 'sk-...',
               'key_page': 'https://platform.openai.com/api-keys', 'free': False,
               'about': 'Needs an OpenAI platform key with credit (a ChatGPT Plus subscription does not include it).'},
    'other': {'label': 'Other service', 'company': 'OpenAI-compatible', 'kind': 'chat', 'url': '',
              'fast': '', 'smart': '', 'key_hint': 'key', 'key_page': '', 'free': False,
              'about': 'Any service with an OpenAI-style chat address, for example OpenRouter, Groq or Mistral. '
                       'Paste its chat completions address.'},
}

# How long a service rests after each kind of failure (seconds), and the words shown to the office
REST = {'key': 1800, 'credit': 1800, 'daily': 3600, 'rate': 60, 'model': 1800, 'busy': 30, 'request': 0, 'network': 0}
WORDS = {'key': 'the key was refused', 'credit': 'out of credit', 'daily': 'daily limit reached',
         'rate': 'too many requests this minute', 'model': 'model name not found', 'busy': 'service busy',
         'request': 'request not accepted', 'network': 'could not be reached'}
_resting = {}           # engine id -> (until, reason)


class EngineError(Exception):
    def __init__(self, kind, detail=''):
        super().__init__(WORDS.get(kind, kind) + (f' ({detail})' if detail else ''))
        self.kind = kind
        self.detail = detail


# ----- saved list -------------------------------------------------------------------------------------------------
def _clean_engine(e):
    p = e.get('provider') if e.get('provider') in PROVIDERS else 'claude'
    d = PROVIDERS[p]
    return {'id': str(e.get('id') or uuid.uuid4().hex[:8]), 'provider': p, 'key': (e.get('key') or '').strip(),
            'fast': (e.get('fast') or '').strip() or d['fast'], 'smart': (e.get('smart') or '').strip() or d['smart'],
            'url': (e.get('url') or '').strip() if p == 'other' else d['url'],
            'free': bool(e.get('free', d['free']))}


def saved(settings, env_key=''):
    """The office's services in priority order. Older settings (one Claude key) become the first entry."""
    raw = settings.get('engines')
    if isinstance(raw, list) and raw:
        return [_clean_engine(e) for e in raw[:MAX_ENGINES] if isinstance(e, dict)]
    key = (settings.get('api_key') or env_key or '').strip()
    models = settings.get('models') or {}
    return [_clean_engine({'id': 'claude1', 'provider': 'claude', 'key': key,
                           'fast': models.get('fast'), 'smart': models.get('smart')})] if key else []


def label(e):
    return PROVIDERS[e['provider']]['label'] if e['provider'] != 'other' else (_host(e.get('url')) or 'Other service')


def _host(url):
    m = re.match(r'https?://([^/]+)', url or '')
    return m.group(1) if m else ''


def public(settings, env_key=''):
    """The list for the Settings page: no full keys, plus each service's resting state."""
    now = time.time()
    out = []
    for e in saved(settings, env_key):
        until, why = _resting.get(e['id'], (0, ''))
        out.append({**{k: v for k, v in e.items() if k != 'key'}, 'label': label(e), 'has_key': bool(e['key']),
                    'key_hint': ('...' + e['key'][-4:]) if e['key'] else '',
                    'resting': (why if until > now else ''), 'resting_until': (until if until > now else 0)})
    return out


def merge(settings, items):
    """Save the list from the Settings page. A blank key keeps the one already saved for that entry."""
    old = {e['id']: e for e in saved(settings)}
    out = []
    for it in (items or [])[:MAX_ENGINES]:
        if not isinstance(it, dict):
            continue
        prev = old.get(str(it.get('id') or ''), {})
        key = (it.get('key') or '').strip() or (prev.get('key') if prev.get('provider') == it.get('provider') else '')
        out.append(_clean_engine({**it, 'key': key}))
    settings['engines'] = out
    settings.pop('api_key', None)            # now kept in the list
    _resting.clear()                          # a new key or order: try everything again
    return settings


def ready(settings, env_key=''):
    """Services with a key, in priority order; those resting after a recent failure go to the back."""
    now = time.time()
    with_key = [e for e in saved(settings, env_key) if e['key'] and (e['provider'] != 'other' or e['url'])]
    awake = [e for e in with_key if _resting.get(e['id'], (0, ''))[0] <= now]
    return awake + [e for e in with_key if e not in awake]


def rest(e, err):
    secs = REST.get(getattr(err, 'kind', ''), 0)
    if secs:
        _resting[e['id']] = (time.time() + secs, str(err))


def resting_words(e):
    until, why = _resting.get(e['id'], (0, ''))
    return why if until > time.time() else ''


# ----- errors -----------------------------------------------------------------------------------------------------
def classify(code, msg):
    m = (msg or '').lower()
    if code in (401, 403) and not re.search(r'quota|billing|credit', m):
        return 'key'
    if code == 402 or re.search(r'credit balance|insufficient_quota|insufficient quota|billing|exceeded your current quota|'
                                r'payment required|out of credits', m):
        return 'credit'
    if code == 429:
        return 'daily' if re.search(r'per.?day|perday|daily|requests_per_day', m) else 'rate'
    if code == 404 or re.search(r'model.*(not found|does not exist|not supported)|no such model|unknown model', m):
        return 'model'
    if code in (500, 502, 503, 504, 529) or 'overloaded' in m:
        return 'busy'
    return 'request'


def _post(url, headers, body, timeout):
    req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), method='POST',
                                 headers={**headers, 'content-type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        raw = ''
        try:
            raw = e.read().decode('utf-8', 'replace')
            j = json.loads(raw)
            err = j[0].get('error', {}) if isinstance(j, list) and j else j.get('error', {})
            msg = (err.get('message') if isinstance(err, dict) else str(err)) or raw
        except (ValueError, AttributeError):
            msg = raw
        raise EngineError(classify(e.code, msg), f'{e.code}: {msg[:200]}') from None
    except urllib.error.URLError as e:
        raise EngineError('network', str(e.reason)) from None
    except (TimeoutError, OSError) as e:
        raise EngineError('network', str(e)) from None
    except ValueError:
        raise EngineError('request', 'the reply was not readable') from None


STREAM = True    # ask the AI service to stream its reply: bytes keep flowing while it works, so a long answer is not
                 # cut off by a phone network or a router dropping a quiet connection (the reply is put back together)


def from_stream(text):
    """A streamed Messages reply (server-sent events) put back together as the usual reply {'content', 'stop_reason',
    'usage', ...}."""
    msg, blocks, partial = {}, {}, {}
    for line in text.splitlines():
        if not line.startswith('data:'):
            continue
        try:
            ev = json.loads(line[5:].strip())
        except ValueError:
            continue
        t = ev.get('type')
        if t == 'message_start':
            msg = dict(ev.get('message') or {})
        elif t == 'content_block_start':
            blocks[ev['index']] = dict(ev.get('content_block') or {})
            if blocks[ev['index']].get('type') in ('tool_use', 'server_tool_use'):
                partial[ev['index']] = ''
        elif t == 'content_block_delta':
            b, d = blocks.setdefault(ev['index'], {}), ev.get('delta') or {}
            dt = d.get('type')
            if dt == 'text_delta':
                b['text'] = b.get('text', '') + d.get('text', '')
            elif dt == 'input_json_delta':
                partial[ev['index']] = partial.get(ev['index'], '') + d.get('partial_json', '')
            elif dt == 'thinking_delta':
                b['thinking'] = b.get('thinking', '') + d.get('thinking', '')
            elif dt == 'signature_delta':
                b['signature'] = b.get('signature', '') + d.get('signature', '')
            elif dt == 'citations_delta':
                b.setdefault('citations', []).append(d.get('citation'))
        elif t == 'message_delta':
            msg.update({k: v for k, v in (ev.get('delta') or {}).items() if v is not None})
            u = dict(msg.get('usage') or {})
            u.update(ev.get('usage') or {})
            msg['usage'] = u
        elif t == 'error':
            err = ev.get('error') or {}
            kind = err.get('type') or ''
            code = 529 if 'overloaded' in kind else 429 if 'rate_limit' in kind else 500 if 'api_error' in kind else 400
            raise EngineError(classify(code, err.get('message') or kind), f'{kind}: {(err.get("message") or "")[:200]}')
    for i, raw in partial.items():
        try:
            blocks[i]['input'] = json.loads(raw) if raw.strip() else {}
        except ValueError:
            raise EngineError('request', 'the reply was cut off') from None
    if not msg:
        raise EngineError('request', 'the reply was not readable')
    msg['content'] = [blocks[i] for i in sorted(blocks)]
    return msg


def post_anthropic(key, body, timeout=180):
    headers = {'x-api-key': key, 'anthropic-version': ANTHROPIC_VERSION}
    if not STREAM:
        return _post(PROVIDERS['claude']['url'], headers, body, timeout)
    req = urllib.request.Request(PROVIDERS['claude']['url'], data=json.dumps({**body, 'stream': True}).encode('utf-8'),
                                 method='POST', headers={**headers, 'content-type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            text = r.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        raw = ''
        try:
            raw = e.read().decode('utf-8', 'replace')
            j = json.loads(raw)
            err = j.get('error', {}) if isinstance(j, dict) else {}
            msg = (err.get('message') if isinstance(err, dict) else str(err)) or raw
        except (ValueError, AttributeError):
            msg = raw
        raise EngineError(classify(e.code, msg), f'{e.code}: {msg[:200]}') from None
    except urllib.error.URLError as e:
        raise EngineError('network', str(e.reason)) from None
    except (TimeoutError, OSError) as e:
        raise EngineError('network', str(e)) from None
    if text.lstrip().startswith('{'):            # a plain reply after all
        try:
            return json.loads(text)
        except ValueError:
            raise EngineError('request', 'the reply was not readable') from None
    return from_stream(text)


def post_chat(url, key, body, timeout=180):
    return _post(url, {'authorization': f'Bearer {key}'}, body, timeout)


# ----- translating the conversation -------------------------------------------------------------------------------
def for_anthropic(messages):
    """Claude format, minus the extra fields kept for other services."""
    out = []
    for m in messages:
        c = m['content']
        if isinstance(c, list):
            c = [{k: v for k, v in b.items() if not k.startswith('_')} for b in c]
        out.append({'role': m['role'], 'content': c})
    return out


def _schema(s, gemini):
    """Tool input schemas as the chat services accept them (Gemini takes a narrower set)."""
    if isinstance(s, list):
        return [_schema(x, gemini) for x in s]
    if not isinstance(s, dict):
        return s
    out = {}
    for k, v in s.items():
        if gemini and k in ('additionalProperties', '$schema', 'default', 'examples'):
            continue
        if k == 'type' and isinstance(v, list):
            kinds = [t for t in v if t != 'null']
            out['type'] = kinds[0] if kinds else 'string'
            if gemini and 'null' in v:
                out['nullable'] = True
            continue
        out[k] = _schema(v, gemini) if k in ('properties',) else (_schema(v, gemini) if isinstance(v, (dict, list)) else v)
    if k_props_empty(out) and gemini:
        out.pop('properties', None)
    return out


def k_props_empty(s):
    return s.get('type') == 'object' and isinstance(s.get('properties'), dict) and not s['properties']


def chat_tools(tools, gemini=False):
    out = []
    for t in tools:
        fn = {'name': t['name'], 'description': t.get('description', '')}
        params = _schema(t.get('input_schema') or {'type': 'object', 'properties': {}}, gemini)
        if not (gemini and params.get('type') == 'object' and not params.get('properties')):
            fn['parameters'] = params
        out.append({'type': 'function', 'function': fn})
    return out


def chat_messages(system, messages):
    out = [{'role': 'system', 'content': system}]
    for m in messages:
        c = m['content']
        if isinstance(c, str):
            out.append({'role': m['role'], 'content': c})
            continue
        if m['role'] == 'assistant':
            text = '\n\n'.join(b.get('text', '') for b in c if b.get('type') == 'text').strip()
            calls = []
            for b in c:
                if b.get('type') == 'tool_use':
                    call = {'id': b['id'], 'type': 'function',
                            'function': {'name': b['name'], 'arguments': json.dumps(b.get('input') or {})}}
                    if b.get('_extra'):
                        call['extra_content'] = b['_extra']
                    calls.append(call)
            msg = {'role': 'assistant', 'content': text or None}
            if calls:
                msg['tool_calls'] = calls
            if msg['content'] is None and not calls:
                msg['content'] = '(no reply)'
            out.append(msg)
        else:
            texts = []
            for b in c:
                if b.get('type') == 'tool_result':
                    body = b.get('content')
                    if isinstance(body, list):
                        body = '\n'.join(x.get('text', '') for x in body if isinstance(x, dict))
                    out.append({'role': 'tool', 'tool_call_id': b['tool_use_id'], 'content': str(body or '')})
                elif b.get('type') == 'text':
                    texts.append(b.get('text', ''))
            if texts:
                out.append({'role': 'user', 'content': '\n\n'.join(texts)})
    return out


_SAFE_ID = re.compile(r'[^A-Za-z0-9_-]')


def from_chat(resp):
    """A chat reply in Claude's format: content blocks, stop_reason and usage."""
    choices = resp.get('choices') or []
    if not choices:
        raise EngineError('request', 'empty reply')
    ch = choices[0]
    msg = ch.get('message') or {}
    content = []
    text = msg.get('content')
    if isinstance(text, list):
        text = ''.join(p.get('text', '') for p in text if isinstance(p, dict))
    if text and str(text).strip():
        content.append({'type': 'text', 'text': str(text)})
    for i, call in enumerate(msg.get('tool_calls') or []):
        fn = call.get('function') or {}
        try:
            args = json.loads(fn.get('arguments') or '{}')
            if not isinstance(args, dict):
                args = {}
        except ValueError:
            args = {}
        cid = _SAFE_ID.sub('_', str(call.get('id') or ''))[:60] or f'call_{uuid.uuid4().hex[:12]}'
        block = {'type': 'tool_use', 'id': cid, 'name': fn.get('name', ''), 'input': args}
        if call.get('extra_content'):
            block['_extra'] = call['extra_content']
        content.append(block)
    has_tools = any(b['type'] == 'tool_use' for b in content)
    fr = ch.get('finish_reason')
    stop = 'tool_use' if has_tools else ('max_tokens' if fr == 'length' else 'end_turn')
    u = resp.get('usage') or {}
    cached = ((u.get('prompt_tokens_details') or {}).get('cached_tokens') or 0)
    usage = {'input_tokens': max(0, (u.get('prompt_tokens') or 0) - cached), 'cache_read_input_tokens': cached,
             'cache_creation_input_tokens': 0, 'output_tokens': u.get('completion_tokens') or 0}
    if not content:
        content = [{'type': 'text', 'text': ''}]
    return {'content': content, 'stop_reason': stop, 'usage': usage}


def call(e, model, system, tools, messages, max_tokens, anthropic_post=None, chat_post=None, cache_mark=None):
    """One step with one service. Returns Claude-format {'content', 'stop_reason', 'usage'}; raises EngineError."""
    if PROVIDERS[e['provider']]['kind'] == 'anthropic':
        msgs = for_anthropic(messages)
        body = {'model': model, 'max_tokens': max_tokens, 'tools': tools,
                'system': [{'type': 'text', 'text': system, 'cache_control': {'type': 'ephemeral'}}],
                'messages': cache_mark(msgs) if cache_mark else msgs}
        resp = (anthropic_post or post_anthropic)(e['key'], body)
        if resp.get('type') == 'error':
            err = resp.get('error') or {}
            raise EngineError(classify(0, err.get('message', '')), err.get('message', ''))
        return resp
    gemini = e['provider'] == 'gemini'
    body = {'model': model, 'messages': chat_messages(system, messages), 'tools': chat_tools(tools, gemini)}
    body['max_completion_tokens' if e['provider'] == 'openai' else 'max_tokens'] = max_tokens
    resp = (chat_post or post_chat)(e['url'], e['key'], body)
    if isinstance(resp, dict) and resp.get('error'):
        err = resp['error'] if isinstance(resp['error'], dict) else {'message': str(resp['error'])}
        raise EngineError(classify(int(err.get('code') or 0) if str(err.get('code') or '').isdigit() else 0,
                                   err.get('message', '')), err.get('message', '')[:200])
    return from_chat(resp)


def test(e, anthropic_post=None, chat_post=None):
    """A tiny request with each of the entry's two models. {'ok', 'results': [{'model', 'ok', 'text'}]}"""
    results = []
    for model in dict.fromkeys([e['fast'], e['smart']]):
        try:
            started = time.time()
            call(e, model, 'You are testing a connection.', [{'name': 'ping', 'description': 'Reply check.',
                 'input_schema': {'type': 'object', 'properties': {'ok': {'type': 'boolean'}}}}],
                 [{'role': 'user', 'content': 'Reply with the single word OK.'}], 400, anthropic_post, chat_post)
            results.append({'model': model, 'ok': True, 'text': f'works ({time.time() - started:.1f} s)'})
        except EngineError as err:
            results.append({'model': model, 'ok': False, 'text': str(err)})
    return {'ok': all(r['ok'] for r in results), 'results': results}
