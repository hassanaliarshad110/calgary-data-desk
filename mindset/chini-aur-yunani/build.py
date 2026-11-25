import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "The Wall With No Paint" (Masnavi, Book I, Story XIV)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['rumi', 'contest', 'sultan'], n3: ['paint', 'wonders'], n4: ['colours', 'polished'], n5: ['sultan', 'admired', 'end'], n6: ['every', 'endless'], n7: ['heart', 'books'], n8: ['adding', 'clearing'], n9: ['progress', 'nothing', 'light'], n10: ['remove', 'grudge'], n11: ['clear', 'word'], n12: ['awazzzz'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 0, q2: 0 };", b)
b = b.replace('''const s = "MACHIAVELLI'S RULES"''', '''const s = "RUMI'S VOICE"''')
open('mindset.js', 'w').write(b + '\n' + open('rumi_lib.js').read() + '\nconst DRAW = {};\n' + open('scenes_c.js').read())
print('built')
