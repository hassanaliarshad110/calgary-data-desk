# Awazzzz Mindset — evening Short, Nov 21 2026 — "Everyone Was Right, Everyone Was Wrong" (Masnavi, Book III, Story V, tr. Whinfield)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Everyone in that room was right... and everyone was wrong.','Everyone in that room was right... and everyone was wrong.'),
('n2',N,'Rumi tells this story in the Masnavi.','Rumi tells this story in the Masnavi.'),
('n3',N,'An elephant in a dark room. Nobody can see it... so they touch it.','An elephant in a dark room. Nobody can see it... so they touch it.'),
('q1',Q,'One felt its trunk... and declared that the beast resembled a water-pipe.','"One felt its trunk, and declared that the beast resembled a water-pipe."'),
('n4',N,'Another felt the ear... a large fan. The leg... a pillar. The back... a great throne.','Another felt the ear... a large fan. The leg... a pillar. The back... a great throne.'),
('n5',N,'At work, a launch flops. Sales blames the price. Support... the bugs. Design... the look.','At work, a launch flops. Sales blames the price. Support... the bugs. Design... the look.'),
('n6',N,'Each one holds a piece... and calls it the whole elephant.','Each one holds a piece... and calls it the whole elephant.'),
('n7',N,'Rumi says our senses work like the palm of a hand.','Rumi says our senses work like the palm of a hand.'),
('q2',Q,'The whole of the object... is not grasped in the palm.','"The whole of the object is not grasped in the palm."'),
('n8',N,"The twist? You're in that room too. Your piece always feels like the whole.","The twist? You're in that room too. Your piece always feels like the whole."),
('n9',N,"Before tonight, in one disagreement, ask... what are you seeing that I'm not?","Before tonight, in one disagreement, ask... what are you seeing that I'm not?"),
('n10',N,'Which piece are you holding right now? Tell me below.','Which piece are you holding right now? Tell me below.'),
('n11',N,'Follow Awaaz... and see the whole elephant.','Follow Awazzzz... and see the whole elephant.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote words')
