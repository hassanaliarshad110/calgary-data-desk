import re
b = open('base.js').read()
b = b.replace('// ===== Awazzzz Mindset — "Half Your Life Is Luck" (The Prince, Ch. 25)', '// ===== Awazzzz Mindset — "The Parrot Who Escaped" (Masnavi, Book I, Story VII)')
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['rumi'], n3: ['india', 'caged', 'wild', 'locked'], q1: ['does'], n4: ['drops', 'thrown', 'branch', 'alive'], q2: ['wild'], n5: ['rumi', 'voice', 'caged'], n6: ['praise', 'cage'], n7: ['top', 'wrong', 'joker', 'hurt'], n8: ['freedom', 'dropping', 'performance'], n9: ['today', 'nobody', 'clap', 'grow'], n10: ['praised', 'word', 'comments'], n11: ['awazzzz'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 2, q2: 3 };", b)
b = b.replace('''const s = "MACHIAVELLI'S RULES"''', '''const s = "RUMI'S VOICE"''')
open('mindset.js', 'w').write(b + '\n' + open('rumi_lib.js').read() + '\nconst DRAW = {};\n' + open('scenes_t.js').read())
print('built')
