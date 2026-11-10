"""What Calgarians pay: the proposed 2027-2030 budget and Calgary against seven Canadian cities (data/pay_study.json).

The published study (calgaryinsight.ca/studies/calgary-police/) as data, for Data Genie and the Data Scientist:
its summary, every section with its tables and chart data, the method, limits, recommendations and every source.
Figures come from Statistics Canada (crime severity, clearance, police staffing for Calgary and five other city police
services), the Calgary Police Service's reports and 2027 to 2030 budget plan, and the police community crime file.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = 'https://calgaryinsight.ca/studies/what-calgarians-pay/'


def load(data_dir=None, can_build=True):
    for d in (data_dir, os.path.join(HERE, 'data')):
        p = os.path.join(d or '', 'pay_study.json')
        if d and os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    return None


def summary(d, part=None, find=None):
    """part: 'summary' (default: the findings, the five answers and the sources), 'sections' (every section with its
    tables and chart data), 'sources', 'limitations'; find narrows sections to those whose heading or text mentions it."""
    if not d:
        return {'error': 'The study is not available here.'}
    out = {'title': d['title'], 'page': PAGE, 'calculator': PAGE + 'calculator.html'}
    secs = d.get('sections') or []
    if find:
        f = str(find).lower()
        secs = [s for s in secs if f in (s.get('heading') or '').lower() or f in (s.get('text') or '').lower()
                or f in json.dumps(s.get('visuals') or []).lower()]
    if part in (None, '', 'summary'):
        out.update({'summary': d.get('summary'), 'conclusion': d.get('conclusion'),
                    'sections': [s['heading'] for s in secs], 'data_sources': d.get('data_sources'),
                    'note': 'part="sections" gives every section with its tables and chart data; find narrows.'})
    elif part == 'sections':
        out['sections'] = secs
    elif part == 'sources':
        out.update({'data_sources': d.get('data_sources'), 'method': d.get('method')})
    elif part == 'limitations':
        out.update({'limitations': d.get('limitations'), 'recommendations': d.get('recommendations')})
    else:
        out['error'] = 'part must be summary, sections, sources or limitations'
    return out
