import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "Easy to Cure, Hard to See" (The Prince, Ch. 3)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['rewind', 'six', 'strangers'], n3: ['two', 'shorter'], n4: ['week', 'honest', 'fixed'], q1: ['wrote'], n5: ['machiavelli', 'doctor'], n6: ['cheap', 'invisible', 'expensive'], n7: ['essence', 'early', 'once'], n8: ['skill', 'small', 'silly'], n9: ['tonight', 'fine', 'five'], n10: ['ignoring'], n11: ['awazzzz', 'early'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2 };", b)
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_d.js').read())
print('built')
