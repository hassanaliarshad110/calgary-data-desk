"""The live registry.json with its hand-written pages replaced by the new code's (as the next build would write them)."""
import json, sys
sys.path.insert(0, 'app')
import registry
live = json.load(open('app/data/registry.json'))['pages']
new = {p['key']: dict(p, registered=True) for p in registry.PAGES}
have = {p['key'] for p in live}
json.dump({'pages': [new.get(p['key'], p) for p in live] + [p for k, p in new.items() if k not in have]}, open('app/data/registry.json', 'w'))
print('registry pages', len(live), 'replaced', sum(1 for p in live if p['key'] in new))
