"""Calgary Data Desk (formerly Ward 5 Data Desk): a Windows app for City and ward offices.

A live dashboard of Calgary and of each of its 14 wards from City of Calgary Open Data, with every ward set against
the others, and an AI agent that answers questions about any City dataset, downloads data and shows charts,
tables and maps.

Run with run.bat (first run installs what it needs), or: python app.py
"""
import os as _os
import sys as _sys


def _startup_log(kind, value, tb):
    """pythonw has no console: any problem while starting is written next to the app, and shown in a message box."""
    import traceback as _tb
    here = _os.path.dirname(_os.path.abspath(__file__))
    path = _os.path.join(here, 'startup-error.log')
    try:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(''.join(_tb.format_exception(kind, value, tb)))
        if _sys.platform.startswith('win'):
            import ctypes
            ctypes.windll.user32.MessageBoxW(None, f'Calgary Data Desk could not start. Details are in {path}',
                                             'Calgary Data Desk', 0x10)
    except Exception:
        pass


_sys.excepthook = _startup_log
import datetime as dt
import json
import os
import subprocess
import sys
import threading
import traceback
import csv
import webbrowser

import webview

import agent as agent_mod
import analyst
import auditor
import engines
import camfeed
import dashboard
import census
import budget
import proptax
import livecheck
import methods
import missing
import newsletter

APP_NAME = 'Calgary Data Desk'
APP_FOLDER = 'Ward 5 Data Desk'      # the Downloads folder keeps its first name, so saved files stay where they were
HERE = os.path.dirname(os.path.abspath(__file__))
OLD_DATA_DIR = os.path.join(os.environ.get('APPDATA') or os.path.expanduser('~/.config'), 'Ward5DataDesk')
# a copy with its own _appdata folder keeps its saved data there (the v2 test copy), so the working app is untouched
DATA_DIR = (os.environ.get('CDD_DATA_DIR') or (os.path.join(HERE, '_appdata') if os.path.isdir(os.path.join(HERE, '_appdata'))
                                              else OLD_DATA_DIR))
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
DASHBOARD_CACHE = os.path.join(DATA_DIR, 'dashboard_cache.json')
DOWNLOADS = os.path.join(os.path.expanduser('~'), 'Downloads', APP_FOLDER)


def load_settings():
    try:
        with open(SETTINGS_FILE, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_settings(s):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(s, f, indent=1)


class Api:
    """Functions the window's JavaScript can call (window.pywebview.api.<name>)."""

    def __init__(self):
        self._window = None
        self._full = False
        self._dash = None
        self._lock = threading.Lock()
        self._agent = agent_mod.Agent(load_settings, self._emit, DOWNLOADS, lambda: self._dash, DATA_DIR, self._wards_summary)
        self._analyst = agent_mod.Agent(load_settings, self._emit_analyst, DOWNLOADS, lambda: self._dash, DATA_DIR,
                                        self._wards_summary)
        self._agent.tax_provider = self._analyst.tax_provider = self._tax_for_agent
        self._analyst.who = 'The Data Scientist'
        self._analyst_busy = False
        self._cams = camfeed.CameraFeed(os.path.join(DATA_DIR, 'camera_replay'))
        self._cams.start()

    def _emit(self, event):
        if self._window:
            self._window.evaluate_js(f'window.onAgentEvent({json.dumps(event)})')

    def _emit_analyst(self, event):
        if self._window:
            self._window.evaluate_js(f'window.onAnalystEvent && window.onAnalystEvent({json.dumps(event)})')

    # ---- dashboard ----
    def _ward(self):
        """The view the office last chose: 0 for the whole city, or a ward 1 to 14."""
        s = load_settings()
        return dashboard.wardmap.ward_ok(s.get('scope', 0))

    def set_scope(self, ward):
        """Show the whole city (0) or one ward (1 to 14). The dashboard reloads after."""
        s = load_settings()
        s['scope'] = dashboard.wardmap.ward_ok(ward)
        save_settings(s)
        return s['scope']

    def load_dashboard(self, force=False, period=None, ward=None, quick=False):
        """period: None for the last 12 months, or {'kind': ..., 'start': 'YYYY-MM', 'end': 'YYYY-MM', ...}.
        ward: 0 for the whole city, 1 to 14 for a ward, None for the view last chosen.
        quick: if a saved copy of that view exists, return it at once (however old) with needs_refresh set when it
        is more than an hour old; the screen shows it and then asks again without quick for the fresh copy."""
        try:
            spec = period if isinstance(period, dict) and period.get('kind') else None
            want = self._ward() if ward is None else dashboard.wardmap.ward_ok(ward)
            if quick and not force:
                data, age = dashboard.saved(DASHBOARD_CACHE, spec=spec, pop_method=self._pop_method(), ward=want)
                if data:
                    self._dash = data
                    if want != self._ward():
                        self.set_scope(want)
                    return {'ok': True, 'data': data, 'needs_refresh': age > 1, 'age_hours': round(age, 1)}
            with self._lock:
                self._dash = dashboard.load(DASHBOARD_CACHE, max_age_hours=1, force=bool(force), spec=spec,
                                            pop_method=self._pop_method(), ward=want)
            if want != self._ward():
                self.set_scope(want)               # remembered only once that view has loaded
            return {'ok': True, 'data': self._dash}
        except dashboard.PeriodError as e:     # a period that can't be used
            return {'ok': False, 'error': str(e), 'period_error': True}
        except Exception as e:      # shown in the app instead of crashing it
            traceback.print_exc()
            return {'ok': False, 'error': str(e)}

    def _wards_summary(self):
        """Every ward side by side for the assistants (the whole-city dashboard for the period on screen)."""
        res = self.compare_wards(False, (self._dash or {}).get('period_spec'))
        return (res.get('data') or {}).get('wards_summary') if res.get('ok') else None

    def compare_wards(self, force=False, period=None):
        """Every ward side by side (and Calgary as a whole), from the whole-city dashboard for the same period."""
        try:
            spec = period if isinstance(period, dict) and period.get('kind') else None
            with self._lock:
                city = dashboard.load(DASHBOARD_CACHE, max_age_hours=6, force=bool(force), spec=spec,
                                      pop_method=self._pop_method(), ward=0)
            return {'ok': True, 'data': {k: city.get(k) for k in ('wards_summary', 'period', 'prev_period', 'period_spec',
                                                                  'built_at', 'scope', 'population', 'stale')},
                    'wards_geo': (city.get('geo') or {}).get('wards'), 'city_geo': (city.get('geo') or {}).get('city')}
        except dashboard.PeriodError as e:
            return {'ok': False, 'error': str(e), 'period_error': True}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': str(e)}

    WARD5_COMMUNITIES = ['Castleridge', 'Cityscape', 'Cornerstone', 'Falconridge', 'Homestead', 'Martindale', 'Redstone',
                         'Saddle Ridge', 'Skyview Ranch', 'Taradale', 'Stonegate Landing', 'Skyline East', 'Westwinds',
                         'Pegasus', 'Calgary International Airport']

    def missing_persons(self, force=False):
        """Missing-person appeals the police have posted and not yet taken down (read live, kept in memory only)."""
        names = [c.get('name') for c in (self._dash or {}).get('communities') or []] or self.WARD5_COMMUNITIES
        try:
            return missing.current(names, force=bool(force))
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': str(e), 'appeals': [], 'page': missing.PAGE, 'cps': missing.CPS_MISSING}

    # ---- live connection tests (Data sources screen) ----
    def live_sources(self):
        return livecheck.listing()

    def test_source(self, key):
        return livecheck.test(key)

    # ---- property tax by ward (an estimate from the assessment roll and the tax bylaw) ----
    def get_property_tax(self, force=False):
        try:
            data = proptax.load(DATA_DIR, force=bool(force))
            table = dashboard.wardmap.load(DATA_DIR)
            names = {c: v.get('name') for c, v in (table.get('communities') or {}).items()}
            return {'ok': True, 'data': {**{k: v for k, v in data.items() if k != 'by_comm'},
                                         'by_ward': {str(k): v for k, v in proptax.by_ward(data, table).items()},
                                         'by_comm': {c: dict(e, name=names.get(c, c), ward=(table['communities'].get(c) or {}).get('ward'))
                                                     for c, e in data['by_comm'].items()},
                                         'wards': table.get('wards')}}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': str(e)}

    def _tax_for_agent(self):
        res = self.get_property_tax()
        if not res.get('ok'):
            return None
        d = res['data']
        return {k: d.get(k) for k in ('year', 'roll_year', 'city', 'by_ward', 'factors', 'rates', 'levy', 'bylaw', 'source')}

    # ---- the City budget ----
    def get_budget(self, force=False):
        try:
            return {'ok': True, 'data': budget.load(DATA_DIR, force=bool(force))}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': str(e)}

    def get_methods(self):
        return census.relabel(methods.METHODS, self._census_year())

    # ---- newsletter ----
    def _unique(self, name):
        import re
        os.makedirs(DOWNLOADS, exist_ok=True)
        stem, ext = os.path.splitext(name)
        stem = re.sub(r'[^\w\- .()]+', '_', stem).strip(' ._') or 'Ward 5 Community Update'
        path = os.path.join(DOWNLOADS, stem + ext)
        base, ext = os.path.splitext(path)
        n = 2
        while os.path.exists(path):
            path = f'{base} ({n}){ext}'
            n += 1
        return path

    def _save_newsletter(self, page, name, open_it=True):
        """Print to PDF; if that is not possible, save the page itself so it can be printed from a browser."""
        try:
            path = newsletter.to_pdf(page, self._unique(name + '.pdf'))
            kind, warn = 'pdf', None
        except Exception as e:      # no Edge, or it failed: keep the page instead
            traceback.print_exc()
            path = self._unique(name + '.html')
            with open(path, 'w', encoding='utf-8') as f:
                f.write(page)
            kind, warn = 'html', f'{e} Saved as a web page instead: open it and choose Print, then Save as PDF.'
        if open_it:
            try:
                self.open_path(path)
            except Exception:
                pass
        return {'path': path, 'name': os.path.basename(path), 'kind': kind, 'warning': warn}

    def newsletter_make(self, opts=None):
        """opts: {'start': 'YYYY-MM', 'end': 'YYYY-MM', 'title', 'message', 'sections': [...], 'pdf': True}"""
        opts = opts if isinstance(opts, dict) else {}
        try:
            spec = {'kind': 'custom', 'start': str(opts.get('start') or ''), 'end': str(opts.get('end') or '')}
            if len(spec['start']) != 7 or len(spec['end']) != 7:
                return {'ok': False, 'error': 'Choose the first and last month.'}
            with self._lock:
                data = dashboard.load(DASHBOARD_CACHE, max_age_hours=6, spec=spec, pop_method=self._pop_method(),
                                      ward=self._ward())
            page = newsletter.render(data, opts)
            period = newsletter.period_words(data)
            out = {'ok': True, 'html': page, 'period': period, 'stale': bool(data.get('stale'))}
            if opts.get('pdf', True):
                where = (data.get('scope') or {}).get('name') or 'Ward 5'
                out.update(self._save_newsletter(page, f'{where} Community Update - {period}'))
            return out
        except dashboard.PeriodError as e:      # a period that can't be used
            return {'ok': False, 'error': str(e)}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': f'The newsletter could not be made: {e}'}

    def newsletter_save(self, page, period=''):
        """Save the preview again, with any changes typed into it."""
        try:
            page = str(page or '')
            if not page.lstrip().lower().startswith('<!doctype'):
                page = '<!doctype html>\n' + page
            return {'ok': True, **self._save_newsletter(page, f'Ward 5 Community Update - {period or "edited"}')}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': str(e)}

    # ---- traffic camera replay ----
    def cam_watch(self, urls):
        self._cams.set_watch(urls)
        return {'ok': True}

    def cam_frames(self, seen=None):
        try:
            return {'ok': True, **self._cams.since(seen)}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    # ---- agent ----
    def ask(self, question, model_choice='fast'):
        try:
            res = self._agent.ask(question, model_choice, today=dashboard.calgary_now().date().isoformat())
            return {'ok': True, **res}
        except agent_mod.AgentError as e:
            return {'ok': False, 'error': str(e)}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': f'Something went wrong: {e}'}

    # ---- Data Scientist: ready-made analysis topics ----
    def _place(self):
        """The area on screen, as the reports name it: 'Calgary' or the ward's name."""
        sc = (self._dash or {}).get('scope') or {}
        return 'Calgary' if sc.get('kind') == 'city' else sc.get('name')

    def _ward(self):
        sc = (self._dash or {}).get('scope') or {}
        return 0 if sc.get('kind') == 'city' else sc.get('ward')

    def analyst_topics(self, n=6):
        return analyst.topics(int(n or 6), area=self._place(), ward=self._ward())

    def analyst_run(self, key=None, text=None):
        """Run one analysis (a topic key, or the office's own words) to a full report. One at a time."""
        if self._analyst_busy:
            return {'ok': False, 'error': 'An analysis is already running. It will finish in a few minutes.'}
        if not key and not (text or '').strip():
            return {'ok': False, 'error': 'Choose a topic or describe the analysis you need.'}
        self._analyst_busy = True
        try:
            self._analyst.reset()                 # each report starts fresh
            res = self._analyst.ask(analyst.brief(key, text, area=self._place()), 'smart',
                                    today=dashboard.calgary_now().date().isoformat())
            return {'ok': True, **res}
        except agent_mod.AgentError as e:
            return {'ok': False, 'error': str(e)}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': f'The analysis stopped: {e}'}
        finally:
            self._analyst_busy = False

    def analyst_reports(self):
        """Reports made so far (Data Scientist and Data Genie), newest first, that are still in Files."""
        try:
            with open(os.path.join(DATA_DIR, 'reports.json'), encoding='utf-8') as f:
                items = json.load(f)
        except (OSError, ValueError):
            return []
        out = []
        for x in items:
            ok = {k: x.get(k) if x.get(k) and os.path.exists(x[k]) else None for k in ('pdf', 'interactive', 'xlsx')}
            if any(ok.values()):
                out.append({**x, **ok})
        return out

    # ---- Report auditor: Opus audits, Sonnet reviews and fixes, Opus checks the fixes ----
    def _emit_audit(self, event):
        if self._window:
            self._window.evaluate_js(f'window.onAuditEvent && window.onAuditEvent({json.dumps(event)})')

    def _audit_agent(self):
        a = agent_mod.Agent(load_settings, self._emit_audit, DOWNLOADS, lambda: self._dash, DATA_DIR, self._wards_summary)
        a.tax_provider = self._tax_for_agent
        a.who = 'The report auditor'
        return a

    def audit_list(self):
        return auditor.index(DATA_DIR)

    def audit_run(self, report_pdf):
        """Audit one of the reports in Your reports (named by its file). One at a time."""
        if self._analyst_busy:
            return {'ok': False, 'error': 'A report or an audit is already running. It will finish in a few minutes.'}
        entry = next((r for r in self.analyst_reports() if report_pdf in (r.get('pdf'), r.get('interactive'))), None)
        if not entry:
            return {'ok': False, 'error': 'That report is not on this computer any more.'}
        self._analyst_busy = True
        try:
            res = auditor.run(entry, self._audit_agent, self._emit_audit, dashboard.calgary_now().date().isoformat(), DOWNLOADS)
            auditor.index(DATA_DIR, res)
            return {'ok': True, 'page': res['page'], 'findings': len(res['findings']), 'verdict': res['verdict'],
                    'corrected': res.get('corrected')}
        except agent_mod.AgentError as e:
            return {'ok': False, 'error': str(e)}
        except Exception as e:
            traceback.print_exc()
            return {'ok': False, 'error': f'The audit stopped: {e}'}
        finally:
            self._analyst_busy = False

    def new_chat(self):
        self._agent.reset()
        return True

    # ---- settings ----
    def get_settings(self):
        s = load_settings()
        gkey = s.get('google_maps_key', '')
        engs = engines.public(s, os.environ.get('ANTHROPIC_API_KEY', ''))
        keyed = [e for e in engs if e['has_key']]
        return {'has_key': bool(keyed), 'key_hint': keyed[0]['key_hint'] if keyed else '',
                'engines': engs, 'max_engines': engines.MAX_ENGINES,
                'providers': [{'key': k, **{f: v[f] for f in ('label', 'company', 'fast', 'smart', 'key_hint', 'key_page',
                                                              'free', 'about', 'url')}} for k, v in engines.PROVIDERS.items()],
                'models': {**agent_mod.MODELS, **(s.get('models') or {})}, 'downloads': DOWNLOADS,
                'theme': s.get('theme', 'system'), 'map_style': s.get('map_style', 'street'),
                'has_google_key': bool(gkey), 'google_key_hint': ('...' + gkey[-4:]) if gkey else '',
                'google_key': gkey,
                'pop_method': dashboard.pop_method_ok(s.get('pop_method')),
                'scope': dashboard.wardmap.ward_ok(s.get('scope', 0)),
                'pop_methods': census.relabel([{'key': k, **v} for k, v in dashboard.POP_METHODS.items()], self._census_year())}

    def _census_year(self):
        """The federal Census the dashboard counts from (2021 until the City publishes a newer one by community)."""
        return int(((self._dash or {}).get('census') or {}).get('year') or 2021)

    def _pop_method(self):
        s = load_settings()
        if s.get('pop_method_v', 0) < 2:          # November 2026: the default became the City's total shared by actual growth
            s['pop_method'], s['pop_method_v'] = dashboard.DEFAULT_POP_METHOD, 2
            save_settings(s)
        return dashboard.pop_method_ok(s.get('pop_method'))

    def set_pop_method(self, method):
        """How residents are counted: 'city_actual' (the City's total shared by actual growth, the default), 'city_pace'
        (the City's total, one rate for all), 'model' or 'census2021'. The dashboard reloads after."""
        s = load_settings()
        s['pop_method'], s['pop_method_v'] = dashboard.pop_method_ok(method), 2
        save_settings(s)
        return self.get_settings()

    def save_settings(self, api_key=None, fast_model=None, smart_model=None, google_key=None):
        s = load_settings()
        if api_key is not None and api_key.strip():
            s['api_key'] = api_key.strip()
        if google_key is not None and google_key.strip():
            s['google_maps_key'] = google_key.strip()
        models = s.get('models') or {}
        if fast_model:
            models['fast'] = fast_model.strip()
        if smart_model:
            models['smart'] = smart_model.strip()
        s['models'] = models
        save_settings(s)
        return self.get_settings()

    def save_engines(self, items):
        """The AI services in priority order (up to four). A blank key keeps the saved one."""
        s = engines.merge(load_settings(), items if isinstance(items, list) else [])
        save_settings(s)
        return self.get_settings()

    def test_engine(self, item):
        """Send a tiny request with an entry's two models, using a newly pasted key or the saved one."""
        try:
            item = dict(item or {})
            if not (item.get('key') or '').strip():
                old = {e['id']: e for e in engines.saved(load_settings(), os.environ.get('ANTHROPIC_API_KEY', ''))}
                prev = old.get(str(item.get('id') or ''), {})
                item['key'] = prev.get('key', '') if prev.get('provider') == item.get('provider') else ''
            e = engines._clean_engine(item)
            if not e['key']:
                return {'ok': False, 'results': [{'model': '', 'ok': False, 'text': 'Paste a key first.'}]}
            if e['provider'] == 'other' and not e['url']:
                return {'ok': False, 'results': [{'model': '', 'ok': False, 'text': 'Paste the service address first.'}]}
            return engines.test(e, agent_mod.post_messages, agent_mod.post_chat)
        except Exception as err:
            traceback.print_exc()
            return {'ok': False, 'results': [{'model': '', 'ok': False, 'text': str(err)}]}

    def set_theme(self, theme):
        if theme in ('system', 'light', 'dark'):
            s = load_settings()
            s['theme'] = theme
            save_settings(s)
        return True

    def remove_key(self):
        s = load_settings()
        s.pop('api_key', None)
        s['engines'] = [e for e in engines.saved(s) if e['provider'] != 'claude']
        save_settings(s)
        return self.get_settings()

    def remove_google_key(self):
        s = load_settings()
        s.pop('google_maps_key', None)
        save_settings(s)
        return self.get_settings()

    def set_map_style(self, style):
        if style in ('street', 'satellite', 'grey'):
            s = load_settings()
            s['map_style'] = style
            save_settings(s)
        return True

    # ---- links, saved lists, full screen ----
    def open_url(self, url):
        url = str(url or '')
        if not url.startswith(('https://', 'http://')):
            return False          # only web links
        webbrowser.open(url)
        return True

    def save_csv(self, name, columns, rows):
        try:
            os.makedirs(DOWNLOADS, exist_ok=True)
            import calgary_data
            path = os.path.join(DOWNLOADS, calgary_data.safe_filename(name))
            base, ext = os.path.splitext(path)
            n = 2
            while os.path.exists(path):
                path = f'{base} ({n}){ext}'
                n += 1
            with open(path, 'w', newline='', encoding='utf-8-sig') as f:
                w = csv.writer(f)
                w.writerow(columns)
                w.writerows(rows)
            return {'ok': True, 'path': path}
        except Exception as e:      # shown on the button instead of failing silently
            traceback.print_exc()
            return {'ok': False, 'error': str(e)}

    def set_fullscreen(self, on):
        if self._window and bool(on) != self._full:
            self._window.toggle_fullscreen()
            self._full = bool(on)
        return True

    # ---- downloads ----
    def list_downloads(self):
        if not os.path.isdir(DOWNLOADS):
            return []
        out = []
        for name in os.listdir(DOWNLOADS):
            p = os.path.join(DOWNLOADS, name)
            if os.path.isfile(p):
                st = os.stat(p)
                out.append({'name': name, 'path': p, 'bytes': st.st_size,
                            'modified': dt.datetime.fromtimestamp(st.st_mtime).strftime('%Y-%m-%d %H:%M')})
        return sorted(out, key=lambda x: x['modified'], reverse=True)

    def open_path(self, path):
        path = os.path.abspath(path)
        root = os.path.abspath(DOWNLOADS)
        try:
            inside = os.path.commonpath([path, root]) == root
        except ValueError:        # a different drive
            inside = False
        if not inside:
            return False          # only open files this app saved
        os.makedirs(DOWNLOADS, exist_ok=True)
        if sys.platform.startswith('win'):
            os.startfile(path)
        elif sys.platform == 'darwin':
            subprocess.Popen(['open', path])
        else:
            subprocess.Popen(['xdg-open', path])
        return True

    def open_downloads(self):
        return self.open_path(DOWNLOADS)


def _first_run_settings():
    """A new data folder starts with the office's settings (AI keys, choices) from the first version, once."""
    new, old = os.path.join(DATA_DIR, 'settings.json'), os.path.join(OLD_DATA_DIR, 'settings.json')
    if DATA_DIR != OLD_DATA_DIR and not os.path.exists(new) and os.path.exists(old):
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            import shutil
            shutil.copyfile(old, new)
        except OSError:
            pass


def _windows_identity():
    """Windows shows the app as itself (its own logo on the taskbar), not as Python."""
    if not sys.platform.startswith('win'):
        return
    try:
        import ctypes
        ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID('CalgaryDataDesk.App')
    except Exception:
        pass


def _window_icon():
    """Put the logo on the window's title bar and taskbar button (pywebview on Windows uses Python's own)."""
    if not sys.platform.startswith('win'):
        return
    try:
        import ctypes
        u = ctypes.windll.user32
        ico = os.path.join(HERE, 'ui', 'logo.ico')
        hwnd = u.FindWindowW(None, APP_NAME)
        if not hwnd:
            return
        for which, size in ((1, 256), (0, 32)):            # ICON_BIG, ICON_SMALL
            h = u.LoadImageW(None, ico, 1, size if which else 16, size if which else 16, 0x10)  # IMAGE_ICON, LR_LOADFROMFILE
            if h:
                u.SendMessageW(hwnd, 0x80, which, h)       # WM_SETICON
    except Exception:
        pass


def main():
    _first_run_settings()
    _windows_identity()
    api = Api()
    window = webview.create_window(APP_NAME, os.path.join(HERE, 'ui', 'index.html'), js_api=api,
                                   width=1380, height=900, min_size=(1000, 680), background_color='#F8FAFC')
    api._window = window
    home = os.path.join(HERE, 'ui', 'index.html')

    def stay_home():
        # if the window ever lands on a web page (a link clicked inside the app), open that page in the browser
        # and bring the app back, since the app window has no Back button
        try:
            url = window.get_current_url() or ''
        except Exception:
            return
        if url.startswith(('http://', 'https://')) and not url.split('/')[2].split(':')[0] in ('127.0.0.1', 'localhost'):
            webbrowser.open(url)
            window.load_url(home)
    window.events.loaded += stay_home
    window.events.shown += _window_icon
    webview.start(debug='--debug' in sys.argv, icon=os.path.join(HERE, 'ui', 'logo.ico'))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        # pythonw has no console, so record the problem and tell the user where it is
        os.makedirs(DATA_DIR, exist_ok=True)
        log = os.path.join(DATA_DIR, 'error.log')
        with open(log, 'w', encoding='utf-8') as f:
            f.write(traceback.format_exc())
        if sys.platform.startswith('win'):
            import ctypes
            ctypes.windll.user32.MessageBoxW(None, f'{APP_NAME} could not start. Details are in {log}',
                                             APP_NAME, 0x10)
        raise
