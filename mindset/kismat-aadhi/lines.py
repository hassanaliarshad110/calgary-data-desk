# Awazzzz Mindset — morning Short, Nov 21 2026 — "Half Your Life Is Luck" (The Prince, Ch. 25, tr. Marriott)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Luck controls half your life. The other half... is yours.','Luck controls half your life. The other half... is yours.'),
('n2',N,'Start your day with this.','Start your day with this.'),
('n3',N,'Two students. Same surprise test... same bad luck.','Two students. Same surprise test... same bad luck.'),
('n4',N,"Nia shrugs. It's fate.","Nia shrugs. It's fate."),
('n5',N,'Omar studied twenty minutes a night. When the storm hit... his walls were built.','Omar studied twenty minutes a night. When the storm hit... his walls were built.'),
('q1',Q,'Machiavelli wrote... Fortune is the arbiter of one half of our actions... but she still leaves us to direct the other half... or perhaps a little less.','Machiavelli wrote... "Fortune is the arbiter of one-half of our actions, but... she still leaves us to direct the other half, or perhaps a little less."'),
('n6',N,"He compared fortune to a raging river. In calm weather... build your barriers.","He compared fortune to a raging river. In calm weather... build your barriers."),
('n7',N,"But here's the catch.","But here's the catch."),
('q2',Q,'The cautious man... when it is time to turn adventurous... does not know how to do it.','"The cautious man, when it is time to turn adventurous, does not know how to do it."'),
('n8',N,'The habit that won yesterday... can sink you tomorrow. So change with the river.','The habit that won yesterday... can sink you tomorrow. So change with the river.'),
('n9',N,'Your action today: name one storm coming your way... and build one small wall against it before lunch.','Your action today: name one storm coming your way... and build one small wall against it before lunch.'),
('n10',N,"What's your wall today? Comment below.","What's your wall today? Comment below."),
('n11',N,'Follow Awaaz for your daily mindset.','Follow Awazzzz for your daily mindset.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words')
