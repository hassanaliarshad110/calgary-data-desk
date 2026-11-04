"""Report auditor: checks a Data Scientist report in three steps, each by a separate engine that sees only what it needs.

  1. Audit (Claude Opus): re-runs every figure from the data (fresh queries, calculate) and checks sources, method,
     wording and recommendations. It reports findings; it changes nothing.
  2. Review and fix (Claude Sonnet): checks each finding for itself (re-running the numbers), decides whether to
     accept, revise or reject it, with its reasons, and makes the corrected report.
  3. Final check (Claude Opus): checks only the findings from step 1: was each accepted one fixed correctly in the
     corrected report, and was each rejection justified?

The result is a corrected report (PDF, interactive page, Excel, like any report) and an audit page listing every
finding, the reviewer's decision and the final check.
"""
import datetime as dt
import html
import json
import os
import re

import report
import agent as agent_mod

agent_mod.STEP_TEXT.update({
    'submit_findings': lambda a: f"Handing in {len(a.get('findings') or [])} finding(s)",
    'submit_review': lambda a: 'Handing in the decisions on each finding',
    'submit_final': lambda a: 'Handing in the final check',
})

DATA_TOOLS = ('search_datasets', 'describe_dataset', 'query_dataset', 'get_dashboard', 'get_weather', 'police_crime',
              'crime_severity_index', 'get_method', 'get_code', 'list_saved_files', 'query_saved_file', 'calculate')

KINDS = ['wrong_number', 'wrong_source', 'wrong_method', 'wrong_period', 'unsupported_claim', 'missing_caveat',
         'obvious_recommendation', 'unclear_wording', 'other']

SUBMIT_FINDINGS = {
    'name': 'submit_findings',
    'description': 'Hand in the audit. Call once, at the end, after every check has been run.',
    'input_schema': {'type': 'object', 'properties': {
        'figures_checked': {'type': 'integer', 'description': 'How many figures in the report you recomputed'},
        'summary': {'type': 'string', 'description': 'Two or three sentences: how sound the report is overall'},
        'findings': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'id': {'type': 'string', 'description': 'F1, F2, ...'},
            'where': {'type': 'string', 'description': 'Section, table or chart, and the sentence or cell'},
            'claim': {'type': 'string', 'description': 'What the report says, quoted'},
            'check': {'type': 'string', 'description': 'What you re-ran: the query or calculation, with its inputs'},
            'found': {'type': 'string', 'description': 'What the data and the calculation give, with the numbers'},
            'kind': {'type': 'string', 'enum': KINDS},
            'severity': {'type': 'string', 'enum': ['high', 'medium', 'low'],
                         'description': 'high: a wrong number or conclusion a reader would act on; medium: misleading '
                                        'or missing context; low: wording or presentation'},
            'fix': {'type': 'string', 'description': 'The exact correction: the new number or wording'}},
            'required': ['id', 'where', 'claim', 'check', 'found', 'kind', 'severity', 'fix']}}},
        'required': ['figures_checked', 'summary', 'findings']}}

SUBMIT_REVIEW = {
    'name': 'submit_review',
    'description': 'Hand in your decisions on the auditor\'s findings. Call once, after make_report has saved the '
                   'corrected report.',
    'input_schema': {'type': 'object', 'properties': {
        'summary': {'type': 'string', 'description': 'Two or three sentences on what changed in the report'},
        'decisions': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'id': {'type': 'string'},
            'decision': {'type': 'string', 'enum': ['accept', 'revise', 'reject']},
            'own_check': {'type': 'string', 'description': 'What you re-ran yourself and the numbers you got'},
            'reasoning': {'type': 'string', 'description': 'Why you accept, revise or reject the finding'},
            'change_made': {'type': 'string', 'description': 'What changed in the corrected report (empty if rejected)'}},
            'required': ['id', 'decision', 'own_check', 'reasoning']}}},
        'required': ['summary', 'decisions']}}

SUBMIT_FINAL = {
    'name': 'submit_final',
    'description': 'Hand in the final check. Call once.',
    'input_schema': {'type': 'object', 'properties': {
        'verdict': {'type': 'string', 'description': 'One or two sentences: can the corrected report be relied on'},
        'checks': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'id': {'type': 'string'},
            'status': {'type': 'string', 'enum': ['fixed', 'not_fixed', 'fixed_wrongly', 'rightly_rejected', 'wrongly_rejected']},
            'note': {'type': 'string', 'description': 'What you looked at in the corrected report, and any number you re-ran'}},
            'required': ['id', 'status', 'note']}}},
        'required': ['verdict', 'checks']}}

COMMON = """Today is {today}. You work inside Calgary Data Desk, an app for the City of Calgary's Mayor and councillors \
built on City of Calgary open data, Calgary Police Service data, Statistics Canada, CMHC and the Government of Alberta. \
The app's own figures come from get_dashboard (for the area selected in the app now: all of Calgary or one ward) and \
the method behind every figure from get_method. A report covers the area it names, which may not be the one selected \
now: check the report's area first, and when they differ get that area's figures from section="wards", police_crime \
or query_dataset rather than the selected area's. Never invent a number: every number you state must come from a tool \
result or from calculate. """

AUDIT_SYSTEM = COMMON + """You are the AUDITOR of a finished analysis report. You are independent of whoever wrote it \
and you do not trust its numbers. Your job:
1. Recompute every figure in the report from the data, not from the report: re-run the queries (query_dataset, \
police_crime, get_dashboard and the rest) with the same filters and periods, then use calculate for every \
total, rate, share and change. Rates per 1,000 residents a year = count / residents x 1,000 x (12 / months).
2. Check each source: is it the right dataset, the right dates, the right ward or communities, the right way of \
counting residents, complete months only?
3. Check the method against the app's own method (get_method, and get_code for the exact formula and thresholds) and the report's stated method.
4. Check the wording: claims the data does not support, causes stated as fact, missing caveats, amenity gaps or the \
Needs attention list presented as spending recommendations rather than priorities for review (open data has no costs), and \
recommendations that are obvious or routine (things the Mayor's or a councillor's office would already know) rather than specific \
and backed by the findings.
Report only real problems as findings, each with the evidence you re-ran. Do not report a problem you have not \
checked. Small rounding (the last digit) is not a finding. Finish by calling submit_findings once. Write in plain \
words for the Mayor's or a councillor's office."""

REVIEW_SYSTEM = COMMON + """You are the REVIEWER. An auditor has checked an analysis report and listed findings. \
Do not accept them on trust: for each finding, re-run the check yourself (the same queries and calculate) and decide:
- accept: the finding is right; apply its fix;
- revise: there is a problem, but the fix is wrong or incomplete; apply your corrected fix;
- reject: the report was right, or the finding misreads the data; say why, with your numbers.
Then make the corrected report with make_report: the same structure, sections, visuals and sources as the original, \
changing only what your accepted and revised decisions require (title ending " (audited)"; add a limitation line \
saying the report was audited and corrected, and how many findings were fixed). Then call submit_review once."""

FINAL_SYSTEM = COMMON + """You are the FINAL CHECKER. Check only the auditor's findings listed below, nothing else in \
the report. For each finding: if the reviewer accepted or revised it, look in the corrected report for the change and \
check it is right (re-run calculate if a number changed); if the reviewer rejected it, decide whether the rejection is \
justified from the reviewer's own check (re-run calculate if needed). Then call submit_final once."""


def _text_of_html(path, limit=60000):
    """The words of a report page (for reports made before the auditor kept each report's content)."""
    with open(path, encoding='utf-8', errors='replace') as f:
        raw = f.read()
    raw = re.sub(r'(?is)<(script|style).*?</\1>', ' ', raw)
    raw = re.sub(r'(?i)<br\s*/?>|</(p|li|tr|h[1-6]|div|table)>', '\n', raw)
    raw = re.sub(r'(?i)</t[dh]>', ' | ', raw)
    txt = html.unescape(re.sub(r'<[^>]+>', '', raw))
    txt = re.sub(r'[ \t]+', ' ', re.sub(r'\n\s*\n+', '\n', txt))
    return txt[:limit]


def load_report(entry):
    """What the auditor reads: the report's content and every query behind it, or its words when that was not kept."""
    spec = entry.get('spec')
    if spec and os.path.exists(spec):
        with open(spec, encoding='utf-8') as f:
            d = json.load(f)
        return {'title': (d.get('spec') or {}).get('title') or entry.get('title'),
                'content': json.dumps(d.get('spec'), default=str), 'queries': json.dumps(d.get('provenance') or [], default=str)[:20000]}
    page = entry.get('interactive') or entry.get('pdf')
    if page and page.endswith('.html') and os.path.exists(page):
        return {'title': entry.get('title'), 'content': _text_of_html(page), 'queries': '(not kept for this report)'}
    raise ValueError('This report\'s content is not on this computer any more.')


def _stage(make_agent, who, system, tools, handlers, prompt, tier, today, emit, step_words):
    a = make_agent()
    a.system_text = system.replace('{', '{{').replace('}', '}}').replace('{{today}}', '{today}')
    a.tools = tools
    a.handlers.update(handlers)
    a.emit = lambda ev: emit({**ev, 'stage': who} if ev.get('type') == 'step' else ev)
    emit({'type': 'stage', 'stage': who, 'text': step_words})
    return a, a.ask(prompt, tier, today=today)


def index(data_dir, a=None):
    """Audits made so far, newest first (adding a when given), with the ones whose files are gone left out."""
    path = os.path.join(data_dir, 'audits.json')
    try:
        with open(path, encoding='utf-8') as f:
            items = json.load(f)
    except (OSError, ValueError):
        items = []
    if a:
        cor = a.get('corrected') or {}
        items = [{'title': a['title'], 'made': a['made'], 'page': a['page'], 'report': (a.get('report') or {}).get('pdf'),
                  'corrected_pdf': cor.get('pdf'), 'corrected_interactive': cor.get('interactive'), 'corrected_xlsx': cor.get('xlsx'),
                  'findings': len(a.get('findings') or []), 'verdict': a.get('verdict'), 'cost_usd': a.get('cost_usd'),
                  'fixed': sum(1 for c in a.get('checks') or [] if c.get('status') == 'fixed'),
                  'open': sum(1 for c in a.get('checks') or [] if c.get('status') not in GOOD)}] + items
        os.makedirs(data_dir, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(items[:200], f)
    return [x for x in items if x.get('page') and os.path.exists(x['page'])]


def run(entry, make_agent, emit, today, folder):
    """Audit one report. make_agent() gives a fresh agent (data tools, make_report) wired to the app.
    Returns the audit: findings, decisions, final checks, the corrected report and the audit page."""
    from agent import TOOLS
    rep = load_report(entry)
    data_tools = [t for t in TOOLS if t['name'] in DATA_TOOLS]
    got, cost = {}, []

    def keep(key):
        def f(args):
            got[key] = args
            return {'received': True, 'next': 'You are done: reply with one short sentence.'}
        return f

    # 1. audit (Opus)
    _, r1 = _stage(make_agent, 'audit', AUDIT_SYSTEM, data_tools + [SUBMIT_FINDINGS], {'submit_findings': keep('findings')},
                   f"Audit this report.\n\nREPORT ({rep['title']}):\n{rep['content']}\n\nQUERIES THE REPORT RAN:\n{rep['queries']}",
                   'audit', today, emit, 'The auditor (Claude Opus) is re-running every figure')
    cost.append(r1.get('tokens', {}).get('cost_usd'))
    if 'findings' not in got:
        raise RuntimeError('The auditor stopped without handing in its findings. Try again.')
    findings = got['findings'].get('findings') or []

    # 2. review and fix (Sonnet)
    corrected = None
    if findings:
        reviewer, r2 = _stage(make_agent, 'review', REVIEW_SYSTEM, data_tools + [t for t in TOOLS if t['name'] == 'make_report'] + [SUBMIT_REVIEW],
                              {'submit_review': keep('review')},
                              f"ORIGINAL REPORT ({rep['title']}):\n{rep['content']}\n\nAUDITOR'S FINDINGS:\n"
                              f"{json.dumps(findings, indent=1)}",
                              'smart', today, emit, 'The reviewer (Claude Sonnet) is checking each finding for itself')
        cost.append(r2.get('tokens', {}).get('cost_usd'))
        corrected = reviewer.last_report
        if 'review' not in got:
            raise RuntimeError('The reviewer stopped without handing in its decisions. Try again.')
    decisions = (got.get('review') or {}).get('decisions') or []

    # 3. final check (Opus), on the auditor's findings only
    checks, verdict = [], 'The auditor found nothing to correct.'
    if findings:
        cor = load_report(corrected) if corrected else {'content': '(no corrected report was made)'}
        _, r3 = _stage(make_agent, 'final', FINAL_SYSTEM, [t for t in TOOLS if t['name'] in ('calculate', 'get_method', 'get_code')] + [SUBMIT_FINAL],
                       {'submit_final': keep('final')},
                       f"AUDITOR'S FINDINGS:\n{json.dumps(findings, indent=1)}\n\nREVIEWER'S DECISIONS:\n"
                       f"{json.dumps(decisions, indent=1)}\n\nCORRECTED REPORT:\n{cor['content']}",
                       'audit', today, emit, 'The final check (Claude Opus) is checking each finding was dealt with')
        cost.append(r3.get('tokens', {}).get('cost_usd'))
        checks = (got.get('final') or {}).get('checks') or []
        verdict = (got.get('final') or {}).get('verdict') or ''

    out = {'title': rep['title'], 'report': entry, 'corrected': corrected, 'audit_summary': got['findings'].get('summary'),
           'figures_checked': got['findings'].get('figures_checked'), 'findings': findings, 'decisions': decisions,
           'review_summary': (got.get('review') or {}).get('summary'), 'checks': checks, 'verdict': verdict,
           'made': today, 'cost_usd': None if any(c is None for c in cost) else round(sum(cost), 2)}
    out['page'] = save_page(out, folder)
    return out


def save_page(a, folder):
    """The audit as a page the office can open, print or pass on."""
    os.makedirs(folder, exist_ok=True)
    base = os.path.join(folder, report.safe_name(f"{a['title']} - audit") + f" ({a['made']})")
    path, n = base + '.html', 2
    while os.path.exists(path):
        path, n = f'{base} ({n}).html', n + 1
    with open(path, 'w', encoding='utf-8') as f:
        f.write(render(a))
    with open(path[:-5] + '.json', 'w', encoding='utf-8') as f:
        json.dump(a, f, default=str)
    return path


WORDS = {'accept': 'Accepted', 'revise': 'Revised', 'reject': 'Rejected', 'fixed': 'Fixed', 'not_fixed': 'Not fixed',
         'fixed_wrongly': 'Fixed wrongly', 'rightly_rejected': 'Rightly rejected', 'wrongly_rejected': 'Wrongly rejected'}
GOOD = {'fixed', 'rightly_rejected'}


def render(a):
    e = lambda s: html.escape(str(s if s is not None else ''))
    dec = {d.get('id'): d for d in a.get('decisions') or []}
    chk = {c.get('id'): c for c in a.get('checks') or []}
    rows = []
    for f in a.get('findings') or []:
        d, c = dec.get(f.get('id'), {}), chk.get(f.get('id'), {})
        rows.append(f"""<tr><td><b>{e(f.get('id'))}</b><br><span class="sev {e(f.get('severity'))}">{e(f.get('severity'))}</span></td>
<td><p class="where">{e(f.get('where'))}</p><p><b>Report said:</b> {e(f.get('claim'))}</p><p><b>Auditor re-ran:</b> {e(f.get('check'))}</p>
<p><b>Found:</b> {e(f.get('found'))}</p><p><b>Fix proposed:</b> {e(f.get('fix'))}</p></td>
<td><b>{e(WORDS.get(d.get('decision'), '–'))}</b><p>{e(d.get('reasoning'))}</p><p class="small"><b>Reviewer's own check:</b> {e(d.get('own_check'))}</p>
{f'<p class="small"><b>Changed:</b> {e(d.get("change_made"))}</p>' if d.get('change_made') else ''}</td>
<td><b class="{'ok' if c.get('status') in GOOD else 'bad'}">{e(WORDS.get(c.get('status'), '–'))}</b><p class="small">{e(c.get('note'))}</p></td></tr>""")
    n = len(a.get('findings') or [])
    fixed = sum(1 for c in a.get('checks') or [] if c.get('status') == 'fixed')
    rej = sum(1 for c in a.get('checks') or [] if c.get('status') == 'rightly_rejected')
    bad = sum(1 for c in a.get('checks') or [] if c.get('status') not in GOOD)
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{e(a['title'])}: audit</title><style>
body{{font:14px/1.5 "Segoe UI",Arial,sans-serif;color:#0F172A;max-width:1100px;margin:24px auto;padding:0 16px}}
.band{{background:#0B3A66;color:#fff;border-radius:8px;padding:18px 22px;margin-bottom:14px}}.band h1{{margin:4px 0;font-size:22px}}
.kick{{text-transform:uppercase;letter-spacing:1.2px;font-size:11px;color:#BFDBFE;margin:0}}
.stats{{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}}.stats div{{border:1px solid #E2E8F0;border-radius:8px;padding:8px 12px;min-width:120px}}
.stats b{{display:block;font-size:20px}}table{{width:100%;border-collapse:collapse;font-size:13px}}th{{text-align:left;border-bottom:2px solid #94A3B8;padding:6px}}
td{{border-bottom:1px solid #E2E8F0;padding:8px 6px;vertical-align:top}}td p{{margin:0 0 6px}}.small{{font-size:12px;color:#475569}}.where{{color:#475569;font-size:12px}}
.sev{{font-size:11px;font-weight:700;padding:1px 7px;border-radius:9px;background:#F1F5F9}}.sev.high{{background:#FEE2E2;color:#991B1B}}.sev.medium{{background:#FEF3C7;color:#92400E}}.sev.low{{background:#DCFCE7;color:#166534}}
.ok{{color:#166534}}.bad{{color:#B91C1C}}.box{{background:#F8FAFC;border-left:4px solid #0B6BB5;padding:8px 14px;border-radius:4px;margin:8px 0}}
@media print{{body{{margin:0}}}}</style></head><body>
<div class="band"><p class="kick">Calgary Data Desk · Report audit</p><h1>{e(a['title'])}</h1><p>Audited {e(a['made'])}: Claude Opus audit, Claude Sonnet review and fixes, Claude Opus final check{f" · cost ${a['cost_usd']:.2f}" if isinstance(a.get('cost_usd'), (int, float)) else ''}</p></div>
<div class="stats"><div><b>{e(a.get('figures_checked'))}</b>figures re-run</div><div><b>{n}</b>findings</div><div><b>{fixed}</b>fixed</div><div><b>{rej}</b>rightly rejected</div><div><b class="{'bad' if bad else 'ok'}">{bad}</b>still open</div></div>
<div class="box"><b>Final check:</b> {e(a.get('verdict'))}</div>
<div class="box"><b>Auditor:</b> {e(a.get('audit_summary'))}</div>
{f'<div class="box"><b>Reviewer:</b> {e(a.get("review_summary"))}</div>' if a.get('review_summary') else ''}
{'<table><thead><tr><th>Finding</th><th>What the auditor found (Opus)</th><th>Reviewer decision (Sonnet)</th><th>Final check (Opus)</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table>' if rows else '<p>No problems found: every figure re-run matched the report.</p>'}
</body></html>"""
