"""Report auditor: checks a Data Scientist report in three steps, each by a separate engine that sees only what it needs.

  1. Audit (Claude Opus): re-runs every figure from the data (fresh queries, calculate) and checks sources, method,
     wording and recommendations. It reports findings; it changes nothing.
  2. Review and fix (Claude Sonnet): checks each finding for itself (re-running the numbers), decides whether to
     accept, revise or reject it, with its reasons, and makes the corrected report.
  3. Final audit (Claude Fable, the final auditor): checks every finding from step 1 (was each accepted one fixed
     correctly, was each rejection justified?), then reads the corrected report against the question it was asked:
     is every part of the question answered, was evidence in the data missed, does the data contradict a claim? It
     runs on every report, including one where step 1 found nothing.

The result is a corrected report (PDF, interactive page, Excel, like any report) and an audit page listing every
finding, the reviewer's decision and the final audit (fixes checked, question coverage and any new issues).
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
    'submit_final': lambda a: 'Handing in the final audit',
})

DATA_TOOLS = ('search_datasets', 'describe_dataset', 'query_dataset', 'get_dashboard', 'get_weather', 'police_crime',
              'crime_severity_index', 'list_sources', 'read_source', 'get_method', 'get_code', 'list_saved_files',
              'query_saved_file', 'calculate')

KINDS = ['wrong_number', 'wrong_source', 'wrong_method', 'wrong_period', 'unsupported_claim', 'missing_caveat',
         'obvious_recommendation', 'unclear_wording', 'question_not_answered', 'missed_evidence', 'other']

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

COVERAGE = {'type': 'array', 'description': 'The question split into its parts, each with how far the report answers it',
            'items': {'type': 'object', 'properties': {
                'part': {'type': 'string', 'description': 'One part of the question, in its own words'},
                'status': {'type': 'string', 'enum': ['answered', 'partly', 'not_answered', 'cannot_with_the_data'],
                           'description': 'cannot_with_the_data: the report says plainly that the data cannot answer it, and that is true'},
                'note': {'type': 'string', 'description': 'Where the report answers it, or what is missing and what data would answer it'}},
                'required': ['part', 'status', 'note']}}

SUBMIT_FINAL = {
    'name': 'submit_final',
    'description': 'Hand in the final audit. Call once.',
    'input_schema': {'type': 'object', 'properties': {
        'verdict': {'type': 'string', 'description': 'One or two sentences: can the corrected report be relied on, and does it answer the question'},
        'coverage': COVERAGE,
        'new_findings': {'type': 'array', 'description': 'Problems the auditor missed, found in your own pass (empty if none)',
                         'items': {'type': 'object', 'properties': {
                             'id': {'type': 'string', 'description': 'N1, N2, ...'},
                             'where': {'type': 'string'},
                             'issue': {'type': 'string', 'description': 'What is wrong or missing'},
                             'evidence': {'type': 'string', 'description': 'What you ran and the numbers you got'},
                             'kind': {'type': 'string', 'enum': KINDS},
                             'severity': {'type': 'string', 'enum': ['high', 'medium', 'low']},
                             'fix': {'type': 'string', 'description': 'What the report should say or add'}},
                             'required': ['id', 'where', 'issue', 'evidence', 'kind', 'severity', 'fix']}},
        'checks': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'id': {'type': 'string'},
            'status': {'type': 'string', 'enum': ['fixed', 'not_fixed', 'fixed_wrongly', 'rightly_rejected', 'wrongly_rejected']},
            'note': {'type': 'string', 'description': 'What you looked at in the corrected report, and any number you re-ran'}},
            'required': ['id', 'status', 'note']}}},
        'required': ['verdict', 'coverage', 'new_findings', 'checks']}}

COMMON = """Today is {today}. You work inside Calgary Insight, an app for the City of Calgary's Mayor and councillors \
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
4. Check the wording: claims the data does not support, causes stated as fact, missing caveats, distance or crowding \
figures presented as spending recommendations or a ranking of need (open data has no costs), and \
recommendations that are obvious or routine (things the Mayor's or a councillor's office would already know) rather than specific \
and backed by the findings.
5. In a business plan, check the costs: each cost counted once (a net lease's base rent, operating costs and property tax share are separate lines; a gross lease's rent already includes them, so a separate tax line would count it twice), the lease type stated, and every rate per square foot or per cent of sales stated and sourced.
6. Check the report against its QUESTION: split the question into its parts and check each is answered. A part \
left out, or quietly swapped for an easier question, is a question_not_answered finding (if the data cannot answer \
it, the fix is to say so plainly in the key findings and name the data that would). A claim that something is not \
available, not broken down or not published must be tested before it stands: search list_sources, read_source and \
the get_dashboard sections; if the data does hold it, that is a missed_evidence finding. The same for a large change \
(a tenth or more of a total) the report leaves unexplained when the data could explain it: for a budget, trace each \
large department or business-unit change to its requests (get_dashboard section budget_intelligence, part \
department_bridge) and state what no request explains.
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

FINAL_SYSTEM = COMMON + """You are the FINAL AUDITOR, the last step before the report is relied on. You are \
independent of the writer, the auditor and the reviewer, and you trust none of them. Two duties:
A. Each of the auditor's findings listed below (if any): if the reviewer accepted or revised it, look in the corrected \
report for the change and check it is right (re-run the numbers if one changed); if the reviewer rejected it, decide \
whether the rejection is justified, re-running the check yourself. One entry in checks for each finding.
B. Your own pass over the corrected report, against the QUESTION it was asked:
- split the question into its parts and say for each whether the report answers it, partly answers it, does not, or \
says plainly that the data cannot answer it (coverage). An easier question answered in place of the one asked, \
without saying so, is not_answered;
- test every claim that something is not available, not broken down or not published (list_sources, read_source, \
get_dashboard); a large change (a tenth or more of a total) left unexplained when the data explains it, or a large \
item in the data the report never mentions, is missed evidence (for a budget: get_dashboard section \
budget_intelligence, part department_bridge);
- spot-check the figures the conclusions rest on (re-run them).
Each problem you find yourself goes in new_findings, with the evidence you ran. Do not repeat the auditor's findings \
there. Report only real problems; do not report one you have not checked. Your verdict says whether the report can be \
relied on and whether it answers the question. Then call submit_final once."""


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
                'question': (d.get('spec') or {}).get('question') or entry.get('question') or '(not kept for this report)',
                'content': json.dumps(d.get('spec'), default=str), 'queries': json.dumps(d.get('provenance') or [], default=str)[:20000]}
    page = entry.get('interactive') or entry.get('pdf')
    if page and page.endswith('.html') and os.path.exists(page):
        return {'title': entry.get('title'), 'question': entry.get('question') or '(not kept for this report)',
                'content': _text_of_html(page), 'queries': '(not kept for this report)'}
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
                  'corrected_pdf': cor.get('pdf'), 'corrected_print': cor.get('print'), 'corrected_interactive': cor.get('interactive'), 'corrected_xlsx': cor.get('xlsx'),
                  'findings': len(a.get('findings') or []), 'verdict': a.get('verdict'),
                  'fixed': sum(1 for c in a.get('checks') or [] if c.get('status') == 'fixed'),
                  'open': sum(1 for c in a.get('checks') or [] if c.get('status') not in GOOD),
                  'new_findings': len(a.get('new_findings') or []),
                  'question_gaps': sum(1 for c in a.get('coverage') or [] if c.get('status') in ('partly', 'not_answered'))}] + items
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
                   f"Audit this report.\n\nQUESTION THE REPORT WAS ASKED:\n{rep['question']}\n\nREPORT ({rep['title']}):\n"
                   f"{rep['content']}\n\nQUERIES THE REPORT RAN:\n{rep['queries']}",
                   'audit', today, emit, 'Chinook, the auditor, is re-running every figure')
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
                              'smart', today, emit, 'Bow, the reviewer, is checking each finding for itself')
        cost.append(r2.get('tokens', {}).get('cost_usd'))
        corrected = reviewer.last_report
        if 'review' not in got:
            raise RuntimeError('The reviewer stopped without handing in its decisions. Try again.')
    decisions = (got.get('review') or {}).get('decisions') or []

    # 3. final audit (Fable), on every report: the auditor's findings, then the question, missed evidence and key figures
    cor = load_report(corrected) if corrected else rep
    which = 'CORRECTED REPORT' if corrected else ('REPORT (the auditor found nothing to correct, so it is unchanged)' if not findings
                                                  else 'REPORT (no corrected report was made, so this is the original)')
    _, r3 = _stage(make_agent, 'final', FINAL_SYSTEM, data_tools + [SUBMIT_FINAL], {'submit_final': keep('final')},
                   f"QUESTION THE REPORT WAS ASKED:\n{rep['question']}\n\nAUDITOR'S FINDINGS:\n{json.dumps(findings, indent=1)}\n\n"
                   f"REVIEWER'S DECISIONS:\n{json.dumps(decisions, indent=1)}\n\n{which}:\n{cor['content']}",
                   'final', today, emit, 'Rundle, the final auditor, is checking the fixes and whether the report answers the question')
    cost.append(r3.get('tokens', {}).get('cost_usd'))
    if 'final' not in got:
        raise RuntimeError('The final auditor stopped without handing in its audit. Try again.')
    checks = got['final'].get('checks') or []
    verdict = got['final'].get('verdict') or ''
    coverage = got['final'].get('coverage') or []
    new_findings = got['final'].get('new_findings') or []

    out = {'title': rep['title'], 'report': entry, 'corrected': corrected, 'audit_summary': got['findings'].get('summary'),
           'figures_checked': got['findings'].get('figures_checked'), 'findings': findings, 'decisions': decisions,
           'review_summary': (got.get('review') or {}).get('summary'), 'checks': checks, 'verdict': verdict,
           'coverage': coverage, 'new_findings': new_findings, 'final_model': r3.get('model'),
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


COVER_WORDS = {'answered': 'Answered', 'partly': 'Partly answered', 'not_answered': 'Not answered',
               'cannot_with_the_data': 'Cannot be answered with the data (said plainly)'}
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
    cov = ''.join(f"<tr><td>{e(c.get('part'))}</td><td><b class=\"{'ok' if c.get('status') in ('answered', 'cannot_with_the_data') else 'bad'}\">"
                  f"{e(COVER_WORDS.get(c.get('status'), c.get('status')))}</b></td><td class=\"small\">{e(c.get('note'))}</td></tr>"
                  for c in a.get('coverage') or [])
    new = ''.join(f"<tr><td><b>{e(f.get('id'))}</b><br><span class=\"sev {e(f.get('severity'))}\">{e(f.get('severity'))}</span></td>"
                  f"<td><p class=\"where\">{e(f.get('where'))}</p><p><b>Issue:</b> {e(f.get('issue'))}</p></td>"
                  f"<td class=\"small\">{e(f.get('evidence'))}</td><td>{e(f.get('fix'))}</td></tr>" for f in a.get('new_findings') or [])
    fm = a.get('final_model') or ''
    fable = fm.startswith('claude-fable')
    n_new = len(a.get('new_findings') or [])
    gaps = sum(1 for c in a.get('coverage') or [] if c.get('status') in ('partly', 'not_answered'))
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
<div class="band"><p class="kick">Calgary Insight · Report audit</p><h1>{e(a['title'])}</h1><p>Audited {e(a['made'])}: audit by Chinook, review and fixes by Bow, final audit by Rundle{' (Claude Fable)' if fable else ''}</p></div>
{'' if fable or not fm else f'<div class="box bad"><b>Note:</b> the final audit ran on {e(fm)}, not Claude Fable (Fable was not reachable).</div>'}
<div class="stats"><div><b>{e(a.get('figures_checked'))}</b>figures re-run</div><div><b>{n}</b>findings</div><div><b>{fixed}</b>fixed</div><div><b>{rej}</b>rightly rejected</div><div><b class="{'bad' if bad else 'ok'}">{bad}</b>still open</div><div><b class="{'bad' if n_new else 'ok'}">{n_new}</b>new issues from the final audit</div><div><b class="{'bad' if gaps else 'ok'}">{gaps}</b>parts of the question not fully answered</div></div>
<div class="box"><b>Final audit:</b> {e(a.get('verdict'))}</div>
<div class="box"><b>Auditor:</b> {e(a.get('audit_summary'))}</div>
{f'<div class="box"><b>Reviewer:</b> {e(a.get("review_summary"))}</div>' if a.get('review_summary') else ''}
{'<table><thead><tr><th>Finding</th><th>What Chinook (the auditor) found</th><th>Decision by Bow (the reviewer)</th><th>Final audit by Rundle</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table>' if rows else '<p>The auditor found no problems: every figure re-run matched the report.</p>'}
{'<h2>Does the report answer the question?</h2><table><thead><tr><th>Part of the question</th><th>Answer</th><th>Note</th></tr></thead><tbody>' + cov + '</tbody></table>' if cov else ''}
{'<h2>New issues found by the final audit</h2><table><thead><tr><th>Issue</th><th>What is wrong or missing</th><th>Evidence</th><th>What the report should say</th></tr></thead><tbody>' + new + '</tbody></table>' if new else ''}
</body></html>"""
