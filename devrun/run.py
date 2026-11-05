import json, os, sys, time
sys.path.insert(0, '.')
import calgary_data as cd
cd.RETRIES, cd.RETRY_WAIT = 3, 10
import elections as E
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
t = time.time()
b = E.build()
json.dump(b, open(os.path.join(out, 'elections.json'), 'w'), indent=0)
print('seconds', round(time.time() - t, 1), 'errors', b.get('errors'))
for ev in ():
    try:
        open(os.path.join(out, f'ab_event_{ev}.html'), 'wb').write(E._get(E.AB_EVENT_PAGE.format(event=ev)))
    except Exception as e:
        print('event', ev, e)
try:
    open(os.path.join(out, 'ab_winning.html'), 'wb').write(E._get(E.AB_RESULTS + 'orWinningCandidates.cfm?EventId=130'))
except Exception as e:
    print('winning', e)

try:
    open(os.path.join(out, 'ab_bye_130_23.html'), 'wb').write(E._get(E.AB_BYE_PAGE.format(event=130, ed='23')))
except Exception as e:
    print('bye page', e)
