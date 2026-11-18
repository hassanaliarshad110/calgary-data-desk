# Awazzzz Mindset — morning Short, Nov 19 2026 — "Loved or feared?" (The Prince, Ch. 17, tr. Marriott)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Loved... or feared? Which makes you stronger?','Loved... or feared? Which makes you stronger?'),
('n2',N,'Machiavelli asked this over five hundred years ago.','Machiavelli asked this over 500 years ago.'),
('n3',N,'Picture a new team leader who never says no. She just wants to be liked.','Picture a new team leader who never says no. She just wants to be liked.'),
('n4',N,'Soon... nobody takes her seriously.','Soon... nobody takes her seriously.'),
('q1',Q,'His answer? Ideally, both. But if you must choose... it is much safer to be feared than loved, when, of the two, either must be dispensed with.','His answer? Ideally, both. But if you must choose... "it is much safer to be feared than loved, when, of the two, either must be dispensed with."'),
('n6',N,"But here's the catch. He also says: avoid hatred.","But here's the catch. He also says: avoid hatred."),
('q2',Q,'A wise prince should establish himself on that which is in his own control, and not in that of others.','"A wise prince should establish himself on that which is in his own control and not in that of others."'),
('n7',N,'He meant fear. My take? Love depends on others. Respect, you can earn, with clear, fair standards.','He meant fear. My take? Love depends on others. Respect, you can earn, with clear, fair standards.'),
('n8',N,'Your action today: set one clear standard... and keep it, calmly.','Your action today: set one clear standard... and keep it, calmly.'),
('n9',N,'Loved or respected... which would you choose? Comment below.','Loved or respected... which would you choose? Comment below.'),
('n10',N,'Follow Awaaz for your daily mindset.','Follow Awazzzz for your daily mindset.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('nv_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words')
