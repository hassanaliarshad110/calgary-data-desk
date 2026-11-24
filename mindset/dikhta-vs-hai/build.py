import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "The Eye and the Hand" (The Prince, Ch. 18)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['dan', 'big'], n3: ['aisha', 'quietly', 'nobody'], n4: ['six', 'promoted'], n5: ['unfair', 'machiavelli', 'five', 'hundred'], q1: ['wrote'], n6: ['eye', 'hand', 'few'], n7: ['rulers', 'virtue', 'seem'], n8: ['mask', 'flip', 'judge', 'hand', 'promise'], n9: ['aisha', 'hidden', 'see'], n10: ['tonight', 'three', 'finished'], n11: ['aisha', 'comments'], n12: ['awazzzz', 'real', 'seen'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2, q2: 0 };", b)
open('mindset.js', 'w').write(b + '\nconst DRAW = {};\n' + open('scenes_d.js').read())
print('built')
