import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "The Yes-Man Trap" (The Prince, Ch. 23)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['flatterers', 'pest', 'courts'], n3: ['captain', 'great', 'weak', 'defence', 'match'], n4: ['maximilian', 'secret', 'nobody'], q1: ['close'], n5: ['pushed', 'gave', 'done', 'undone'], n6: ['wise', 'everything', 'decide'], n7: ['reward', 'bad'], n8: ['morning', 'wrong', 'listen'], n9: ['truth', 'comments'], n10: ['awazzzz', 'honest'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 6, q2: 0 };", b)
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('scenes_c.js').read())
print('built')
