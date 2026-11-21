# Awazzzz Mindset — morning Short, Nov 22 2026 — "Borrowed Armour" (The Prince, Ch. 13, tr. Marriott)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Borrowed strength... always sends you a bill.','Borrowed strength... always sends you a bill.'),
('n2',N,"Machiavelli studied rulers who won with a borrowed army... then became its prisoner.","Machiavelli studied rulers who won with a borrowed army... then became its prisoner."),
('q1',Q,'For losing, one is undone... and winning, one is their captive.','"For losing, one is undone, and winning, one is their captive."'),
('n3',N,'He retells an old story. Young David offers to face a giant.','He retells an old story. Young David offers to face a giant.'),
('n4',N,'King Saul hands him his own armour. Heavy. Polished. Royal.','King Saul hands him his own armour. Heavy. Polished. Royal.'),
('n5',N,"David takes it off. He can't use it. He walks out... with his sling.","David takes it off. He can't use it. He walks out... with his sling."),
('n6',N,"Today, the armour is the friend who writes all your code... or the one client your shop can't lose.","Today, the armour is the friend who writes all your code... or the one client your shop can't lose."),
('q2',Q,'The arms of others either fall from your back... or they weigh you down... or they bind you fast.','"The arms of others either fall from your back, or they weigh you down, or they bind you fast."'),
('n7',N,"That doesn't mean refuse all help. But the skill that saves you... must be yours.","That doesn't mean refuse all help. But the skill that saves you... must be yours."),
('n8',N,'Pick one job you always hand to someone else. Do it yourself, once, today.','Pick one job you always hand to someone else. Do it yourself, once, today.'),
('n9',N,"What's your sling? Tell me in the comments.","What's your sling? Tell me in the comments."),
('n10',N,'Follow Awaaz... and build your own strength.','Follow Awazzzz... and build your own strength.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote words')
