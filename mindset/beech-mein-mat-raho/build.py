import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "Don\'t Sit on the Fence" (The Prince, Ch. 21)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['greece', 'antiochus', 'rome', 'envoys'], n3: ['neutral', 'arms'], n4: ['warns', 'favour', 'prize'], q1: ['pattern'], n5: ['two', 'both', 'good'], n6: ['wins', 'help', 'either'], q2: ['bluntly'], n7: ['safe', 'lesser', 'open'], n8: ['swing', 'stand', 'why'], n9: ['tonight', 'fine', 'real', 'kindly', 'reason'], n10: ['neutral', 'cost'], n11: ['awazzzz', 'fence'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 4, q2: 2 };", b)
# caption token fixes: show the spoken "either is fine" as a quoted phrase
b = b.replace("w[2] = w[2].replace(/\\.\\.\\.$/, '…'); });", "w[2] = w[2].replace(/\\.\\.\\.$/, '…'); if (id === 'n9') { if (w[2] === 'with,') w[2] = 'with'; if (w[2] === 'either') w[2] = '“either'; if (w[2] === 'fine…') w[2] = 'fine”…'; } });")
b = b.replace("for (const id in LINES) { if (!act(id, 0.05) || id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];", "for (const id of Object.keys(LINES).filter(i => act(i, 0.05) && GT >= LINES[i].start - 0.08).sort((a, b) => LINES[b].start - LINES[a].start).slice(0, 1)) { if (id === 'h1') continue; const u = lt(id); const chs = CAPCH[id];")
assert 'slice(0, 1)' in b and "q2: 2 }" in b and "'fence']" in b and "“either" in b and "Ch. 21)" in b
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_f.js').read())
print('built')
