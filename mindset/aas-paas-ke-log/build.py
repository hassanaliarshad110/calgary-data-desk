import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "Your Circle Is Your Real CV" (The Prince, Ch. 22)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['siena', 'lord', 'right'], n3: ['venafro', 'judged'], n4: ['essence', 'clever', 'having'], q1: ['words'], n5: ['three'], n6: ['alone', 'recognises', 'neither'], q2: ['verdict'], n7: ['genius', 'spotting', 'power'], n8: ['quiet', 'brilliant'], n9: ['flip', 'wise'], n10: ['morning', 'sharper', 'why'], n11: ['venafro', 'corner'], n12: ['circle', 'awazzzz'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2, q2: 2 };", b)
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('helpers_b.js').read() + '\n' + open('scenes_s.js').read())
print('built')
