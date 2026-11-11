"""The workflow runs that matter for this review, read from GitHub (read only). usage: python3 runs_record.py <out.json>"""
import sys, json, subprocess, datetime
R = 'hassanaliarshad110/calgary-data-desk'
def api(path):
    return json.loads(subprocess.run(['gh', 'api', f'repos/{R}/{path}'], capture_output=True, text=True).stdout or 'null')
def run(i, why):
    r = api(f'actions/runs/{i}'); j = api(f'actions/runs/{i}/jobs') or {'jobs': []}
    return {'run_id': i, 'why_it_matters': why, 'workflow': r['name'], 'file': r['path'], 'started_by': r['event'], 'branch': r['head_branch'], 'commit': r['head_sha'], 'status': r['status'], 'result': r['conclusion'],
            'started': r['run_started_at'], 'last_update': r['updated_at'], 'address': r['html_url'],
            'jobs': [{'name': x['name'], 'result': x['conclusion'], 'steps': len(x['steps']), 'steps_not_successful': [s['name'] for s in x['steps'] if s['conclusion'] not in ('success', 'skipped', None)], 'steps_still_running_or_waiting': [s['name'] for s in x['steps'] if s['status'] != 'completed']} for x in j['jobs']]}
def last(wf, n):
    return [{'run_id': r['id'], 'started_by': r['event'], 'status': r['status'], 'result': r['conclusion'], 'commit': r['head_sha'][:8], 'started': r['run_started_at']} for r in api(f'actions/workflows/{wf}/runs?per_page={n}')['workflow_runs']]
out = {'read_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%SZ'), 'repository': R,
       'main_branch_commit_now': api('branches/main')['commit']['sha'], 'backup_branch_commit': api('branches/backup%2Fpre-budget-intelligence-20261111')['commit']['sha'],
       'runs': [run(42977312843, 'The build that published the site this work started from (main at ff42583).'),
                run(43011014041, 'The daily refresh of November 11, started by the "backup morning refresh" scheduled task while this review was under way; it builds main, which this work has not touched.'),
                run(42877892134, 'The last run started by GitHub\'s own schedule (November 10).'),
                run(42997418780, 'The backup taken before development (artifact backup-7).'),
                run(42863009683, 'The last backup started by its own schedule (November 10).'),
                run(42973286311, 'The last Calgary News images run started by its schedule.'),
                run(42764816551, 'The last AI gateway deployment (starts only when gateway/ changes on main).')],
       'latest_runs_by_workflow': {w: last(w, 8) for w in ('site.yml', 'backup.yml', 'news-images.yml', 'gateway.yml')},
       'runs_started_by_this_review': 'The only runs this review started are Backup 42997418780 (read only: it makes a backup file) and read-only evidence runs on the separate branches site-check-21, site-check-22 and site-check-23. No Website, Calgary News images or AI gateway run was started by this review.',
       'workflows_registered': [{'name': w['name'], 'file': w['path'], 'state': w['state']} for w in api('actions/workflows')['workflows'] if w['path'].endswith(('site.yml', 'backup.yml', 'news-images.yml', 'gateway.yml'))]}
json.dump(out, open(sys.argv[1], 'w'), indent=1)
for r in out['runs']: print(r['run_id'], r['workflow'], r['started_by'], r['status'], r['result'], r['commit'][:8], [(j['name'], j['result'], j['steps'], j['steps_not_successful']) for j in r['jobs']])
print('main', out['main_branch_commit_now'][:8], 'backup branch', out['backup_branch_commit'][:8], [(w['name'], w['state']) for w in out['workflows_registered']])
