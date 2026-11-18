# Rebuild each v2 voice timeline with the splice bug fixed: an original line that starts within a frame
# before a splice point must move after the inserted segment too (v2 compared t0 >= Tc exactly and missed them).
import json
B = '/home/claude/calgary-data-desk/gta6-eve/build'
SPEC = {'teaser': 'spec_teaser.json', 'part1': 'spec_part1.json', 'part3': 'spec_part3.json', 'full_land': 'spec_full_land.json'}
NEW = set('snq')
for name, sp in SPEC.items():
    tl = json.load(open(f'{B}/v2/timeline_{name}.json')); spec = json.load(open(f'{B}/{sp}'))
    cuts = tl['cuts']  # [old-time Tc, seg dur, seg name]
    old = [v for v in spec['voice']]
    seg = [v for v in tl['voice'] if v[0] in NEW]
    fixed = []
    for k, i, t0 in old:
        sh = sum(d for Tc, d, _ in cuts if t0 >= Tc - 0.05)
        fixed.append([k, i, round(t0 + sh, 3)])
    fixed += seg; fixed.sort(key=lambda v: v[2])
    moved = [(o, f) for o, f in zip(sorted([v for v in tl['voice'] if v[0] not in NEW], key=lambda v: (v[0], v[1])), sorted([v for v in fixed if v[0] not in NEW], key=lambda v: (v[0], v[1]))) if abs(o[2] - f[2]) > 1e-6]
    print(name, 'moved:', moved)
    json.dump({'dur': tl['dur'], 'voice': fixed}, open(f'/home/claude/gta6/fix/timeline_{name}.json', 'w'), indent=1)
