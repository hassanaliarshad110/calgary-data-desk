import re
b = open('base.js').read()
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['deal', 'one', 'day', 'hunting'], n3: ['effort', 'relax'], n4: ['concedes', 'true', 'trust', 'mainstay', 'but'], n5: ['creator', 'ladder', 'climb', 'step'], n6: ['waiting', 'sleeping', 'highwaymen'], n7: ['twist', 'hare', 'weakest', 'plan', 'outwits'], n8: ['folded', 'hands', 'zero'], n9: ['one', 'step', 'noon', 'email', 'page', 'call'], n10: ['waiting', 'word'], n11: ['awazzzz', 'climb'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 0, q2: 0 };", b)
b = b.replace("const s = \"MACHIAVELLI'S RULES\";", "const s = \"RUMI'S VOICE\";")
b = b.replace("for (const id in LINES) { if (!act(id, 0.05) || id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];", "for (const id of Object.keys(LINES).filter(i => act(i, 0.05) && GT >= LINES[i].start - 0.08).sort((a, b) => LINES[b].start - LINES[a].start).slice(0, 1)) { if (id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];")
assert 'slice(0, 1)' in b and "RUMI'S VOICE" in b and "q2: 0 }" in b and "'outwits'" in b
open('mindset.js', 'w').write(b + '\n' + open('rumi_lib.js').read() + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_u.js').read())
print('built')
