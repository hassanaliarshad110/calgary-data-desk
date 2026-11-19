# Awazzzz Mindset — morning Short, Nov 20 2026 — "Lion or Fox?" (The Prince, Ch. 18, tr. Marriott)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Lion... or fox? Which one are you?','Lion... or fox? Which one are you?'),
('n2',N,'Start your day with this.','Start your day with this.'),
('n3',N,'Picture Sam. Fearless. A pure lion.','Picture Sam. Fearless. A pure lion.'),
('n4',N,'He signs a big deal fast... and walks into a trap in the small print.','He signs a big deal fast... and walks into a trap in the small print.'),
('n5',N,'Maya is a pure fox. She spots every trap... but when a bully pushes, she folds.','Maya is a pure fox. She spots every trap... but when a bully pushes, she folds.'),
('q1',Q,'Machiavelli wrote... it is necessary to be a fox to discover the snares... and a lion to terrify the wolves.','Machiavelli wrote... "it is necessary to be a fox to discover the snares and a lion to terrify the wolves."'),
('n6',N,"But here's the catch.","But here's the catch."),
('q2',Q,'His fox also breaks promises... a great pretender and dissembler.','His fox also breaks promises... "a great pretender and dissembler."'),
('n7',N,"Don't copy that. Understand it... so nobody plays you. Spot the trap... never set one.","Don't copy that. Understand it... so nobody plays you. Spot the trap... never set one."),
('n8',N,"Your action today: before you say yes to anything, ask one fox question... what's the catch? Then answer like a lion.","Your action today: before you say yes to anything, ask one fox question... what's the catch? Then answer like a lion."),
('n9',N,'More lion, or more fox? Comment below.','More lion, or more fox? Comment below.'),
('n10',N,'Follow Awaaz for your daily mindset.','Follow Awazzzz for your daily mindset.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words')
