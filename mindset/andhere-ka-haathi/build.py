import re
b = open('base.js').read()
b = re.sub(r"const KEY = \{.*?\};", "const KEY = { n2: ['rumi', 'masnavi'], n3: ['elephant', 'dark', 'touch'], n4: ['ear', 'fan', 'leg', 'pillar', 'back', 'throne'], n5: ['launch', 'price', 'bugs', 'look'], n6: ['piece', 'whole'], n7: ['senses', 'palm'], n8: ['twist', 'room', 'whole'], n9: ['tonight', 'seeing'], n10: ['piece', 'below'], n11: ['awazzzz', 'whole'] };", b, flags=re.S)
b = re.sub(r"const NOCAP = \{.*?\};", "const NOCAP = { q1: 0, q2: 0, n9: 6 };", b)
b = b.replace('''const s = "MACHIAVELLI'S RULES"''', '''const s = "RUMI'S VOICE"''')
open('mindset.js', 'w').write(b + '\n' + open('rumi_lib.js').read() + '\nconst DRAW = {};\n' + open('scenes_e.js').read())
print('built')
