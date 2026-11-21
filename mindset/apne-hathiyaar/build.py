import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "Borrowed Armour" (The Prince, Ch. 13)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['borrowed', 'prisoner'], n3: ['david', 'giant'], n4: ['armour', 'heavy', 'polished', 'royal'], n5: ['sling'], n6: ['code', 'client'], n7: ['help', 'skill', 'yours'], n8: ['yourself', 'today'], n9: ['sling'], n10: ['awazzzz', 'strength'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 0, q2: 0 };", b)
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('scenes_a.js').read())
print('built')
