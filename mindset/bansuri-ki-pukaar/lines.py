# Awazzzz Mindset — evening Short, Nov 19 2026 — "Why does a flute sound so sad?" (Masnavi, Book I, Prologue, tr. Whinfield 1898)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Why does a flute... sound so sad?','Why does a flute... sound so sad?'),
('n2',N,'Rumi opens his great poem, the Masnavi, with a crying flute.','Rumi opens his great poem, the Masnavi, with a crying flute.'),
('q1',Q,'Hearken to the reed-flute, how it complains, lamenting its banishment from its home.','"Hearken to the reed-flute, how it complains, lamenting its banishment from its home."'),
('n3',N,'The flute was cut from its reed bed. Its song... is the sound of missing home.','The flute was cut from its reed bed. Its song... is the sound of missing home.'),
('n4',N,'Like a student in a new city, far from family. Life looks fine... but something keeps calling.','Like a student in a new city, far from family. Life looks fine... but something keeps calling.'),
('q2',Q,'He who abides far away from his home is ever longing for the day he shall return.','"He who abides far away from his home is ever longing for the day he shall return."'),
('n6',N,"But here's the catch... the reed only sings because it was cut... and hollowed.","But here's the catch... the reed only sings because it was cut... and hollowed."),
('n7',N,'Your longing is not weakness. It is a compass.','Your longing is not weakness. It is a compass.'),
('n8',N,'Your action today: name one thing you miss... and take one small step toward it.','Your action today: name one thing you miss... and take one small step toward it.'),
('n9',N,'What does your heart miss most? Tell me below.','What does your heart miss most? Tell me below.'),
('n10',N,'Follow Awaaz for your daily mindset.','Follow Awazzzz for your daily mindset.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words')
