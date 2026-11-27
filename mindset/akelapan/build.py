import re
b = open('base.js').read()
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['1512', 'job', 'prison', 'farm', 'power'], n3: ['dust', 'evening'], q1: ['wrote'], n4: ['great', 'four', 'trouble'], n5: ['mind', 'appointment', 'dress'], n6: ['rumi', 'reed', 'crowd', 'happy', 'sad'], q2: ['sighs'], n7: ['lonely', 'full', 'tears'], n8: ['take', 'wrote', 'sang', 'end', 'raw'], n9: ['tonight', 'hour', 'phone', 'one', 'page', 'plan', 'song'], n10: ['alone', 'book', 'flute'], n11: ['awazzzz', 'less'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2, q2: 3 };", b)
b = b.replace("const s = \"MACHIAVELLI'S RULES\";", "const s = 'MIND vs HEART';")
b = b.replace("for (const id in LINES) { if (!act(id, 0.05) || id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];", "for (const id of Object.keys(LINES).filter(i => act(i, 0.05) && GT >= LINES[i].start - 0.08).sort((a, b) => LINES[b].start - LINES[a].start).slice(0, 1)) { if (id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];")
assert 'slice(0, 1)' in b
assert "MIND vs HEART" in b and "q2: 3" in b
open('mindset.js', 'w').write(b + '\n' + open('rumi_lib.js').read() + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_a.js').read())
print('built')
