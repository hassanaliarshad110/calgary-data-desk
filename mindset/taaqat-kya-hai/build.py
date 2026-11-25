import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "What Is Real Power?" (Mind vs Heart: The Prince Ch. 20 vs Masnavi I.1389)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['thinkers', 'centuries'], n3: ['essence', 'feared', 'hated'], q1: ['wrote'], n4: ['walls', 'gone'], n5: ['inside', 'essence', 'within'], q2: ['words'], n6: ['captain', 'referee', 'red'], n7: ['temper'], n8: ['walls', 'gate', 'both', 'inside'], n9: ['today', 'urge', 'obey', 'once'], n10: ['outside', 'inside', 'comment'], n11: ['awazzzz', 'lion'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2, q2: 2 };", b)
b = b.replace("const s = \"MACHIAVELLI'S RULES\";", "const s = 'MIND vs HEART';")
assert "MIND vs HEART" in b
open('mindset.js', 'w').write(b + '\n' + open('rumi_lib.js').read() + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_p.js').read())
print('built')
