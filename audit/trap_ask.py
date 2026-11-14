"""Read only: the 9 trap questions through Data Genie (Fast, web on as on the website) and two through the Data Scientist
(thorough, web on), on the live site's own files, with the site key. usage: trap_ask.py <app dir> <out.txt>"""
import json, os, sys, time
APP, OUT = sys.argv[1:3]
sys.path.insert(0, APP); os.chdir(APP)
import agent                                                 # noqa: E402
dash = json.load(open('_dash.json', encoding='utf-8'))
Q = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trap_questions.json')))['questions']
events = []
def make(who):
    a = agent.Agent(lambda: {'api_key': os.environ['KEY'], 'models': {}}, events.append, os.path.join(APP, '_down'), lambda: dash,
                    os.path.join(APP, '_appdata'), lambda: dash.get('wards_summary'))
    a.tax_provider = lambda: None
    if who:
        a.who, a.web = who, True
    else:
        a.web, a.web_max = True, 4
    return a
os.makedirs(os.path.join(APP, '_down'), exist_ok=True)
G, S = make(None), make('The Data Scientist')
runs = [(G, 'Genie', 'fast', q) for q in Q] + [(S, 'Scientist', 'smart', q) for q in Q if 'communities' in q['ask'] or 'cycle' in q['ask']]
total = 0.0
with open(OUT, 'w', encoding='utf-8') as f:
    for A, name, tier, q in runs:
        A.reset(); events.clear(); t = time.time()
        try:
            r = A.ask(q['ask'], tier, today='2026-11-14')
        except Exception as e:                               # noqa: BLE001
            r = {'exception': repr(e)}
        steps = [e.get('text') or e.get('name') for e in events if isinstance(e, dict) and e.get('type') in ('tool', 'step')]
        cost = A.last_cost if isinstance(A.last_cost, dict) else {}
        total += float(cost.get('usd') or 0)
        f.write(f"#### {name}: {q['ask']}\nTRAP: {q['trap']}\nPASS IF: {q['pass']}\nsecs: {time.time()-t:.0f}  cost: {json.dumps(cost, default=str)}\n")
        f.write('steps: ' + json.dumps(steps, default=str)[:2500] + '\n')
        f.write('ANSWER:\n' + ((r.get('text') or r.get('answer') or json.dumps(r, default=str)[:6000]) if isinstance(r, dict) else str(r)) + '\n\n')
        f.flush()
    f.write(f'TOTAL USD (reported): {total:.4f}\n')
print(open(OUT, encoding='utf-8').read()[-3000:])
