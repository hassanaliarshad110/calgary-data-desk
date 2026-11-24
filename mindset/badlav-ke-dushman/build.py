import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "A Great Idea Makes Enemies" (The Prince, Ch. 6)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['fact', 'enemies', 'machiavelli'], n3: ['maya', 'half'], n4: ['push', 'shrug'], q1: ['wrote'], n5: ['lose', 'believe'], n6: ['essence', 'trust', 'long'], n7: ['critics', 'shruggers', 'proof'], n8: ['week', 'hours', 'defend'], n9: ['today', 'smallest', 'works', 'one'], n10: ['change', 'fight', 'below'], n11: ['awazzzz', 'building'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2 };", b)
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_b.js').read())
print('built')
