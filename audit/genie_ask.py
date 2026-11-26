"""One test of Data Genie (Fast, as on the website) with the new code on the live site's files. Uses the site's own key.
usage: genie_ask.py <app dir> <out.txt>"""
import json, os, sys
APP, OUT = sys.argv[1:3]
sys.path.insert(0, APP); os.chdir(APP)
import agent                                                 # noqa: E402
dash = json.load(open('_dash.json', encoding='utf-8'))
events = []
A = agent.Agent(lambda: {'api_key': os.environ['KEY'], 'models': {}}, events.append, os.path.join(APP, '_down'), lambda: dash,
                os.path.join(APP, '_appdata'), lambda: dash.get('wards_summary'))
os.makedirs(os.path.join(APP, '_down'), exist_ok=True)
A.tax_provider = lambda: None
QS = ['What surplus did the City of Calgary have at year end in each of the last five budgets, where does the surplus go, '
      'and is it used as relief in later budgets?',
      'Is the City\'s reserve kept in fixed deposits and investments?']
with open(OUT, 'w', encoding='utf-8') as f:
    for q in QS:
        A.reset(); events.clear()
        try:
            r = A.ask(q, 'fast', today='2026-11-11')
        except Exception as e:                               # noqa: BLE001
            r = {'exception': repr(e)}
        steps = [e for e in events if isinstance(e, dict) and e.get('type') in ('tool', 'step', 'status', 'tool_call', 'progress')]
        f.write('#### Q: ' + q + '\n')
        f.write('steps: ' + json.dumps([{k: e.get(k) for k in ('type', 'name', 'text', 'label', 'args') if e.get(k)} for e in steps], default=str)[:3000] + '\n')
        f.write('event types: ' + json.dumps(sorted({str(e.get('type')) for e in events if isinstance(e, dict)})) + '\n')
        f.write('cost: ' + json.dumps(A.last_cost, default=str) + '\n')
        f.write('ANSWER:\n' + (r.get('text') or r.get('answer') or json.dumps(r, default=str)[:6000] if isinstance(r, dict) else str(r)) + '\n\n')
print(open(OUT, encoding='utf-8').read()[:4000])
