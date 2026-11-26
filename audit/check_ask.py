"""One real run of the report pre-check (the site key) on two requests. usage: check_ask.py <app dir> <out>"""
import json, os, sys
APP, OUT = sys.argv[1:3]
sys.path.insert(0, APP); os.chdir(APP)
import agent
A = agent.Agent(lambda: {'api_key': os.environ['KEY'], 'models': {}}, lambda e: None, '/tmp', lambda: {}, '/tmp', lambda: None)
A.who = 'The Data Scientist'
reqs = [('Election Analytics report', 'Calgary', 'What could irender grewal do differently next year election to flip and win the election ? What are recommendations and how his next 12 months look like to reduce deficit of 10% margin into a clear win'),
        ('Data Scientist report', 'Ward 5', 'Compare 311 service requests per 1,000 residents in Ward 5 with Calgary for the last 12 months, by category, with a map by community')]
with open(OUT, 'w') as f:
    for kind, area, t in reqs:
        f.write(f'## {kind} | {area} | {t}\n' + json.dumps(A.check_request(t, area, kind, '2026-11-11'), indent=1) + '\n\n')
print(open(OUT).read())
