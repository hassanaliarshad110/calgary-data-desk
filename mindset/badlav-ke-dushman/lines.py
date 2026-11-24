# Awazzzz Mindset — morning Short, Nov 25 2026 — "A Great Idea Makes Enemies" (The Prince, Ch. 6, tr. Marriott)
# structure: myth vs fact + everyday example (new hire's better method) + quote + own commentary (win the lukewarm with proof)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Myth... a great idea sells itself.','Myth... a great idea sells itself.'),
('n2',N,'Fact... a great idea makes enemies. Machiavelli knew it in fifteen thirteen.','Fact... a great idea makes enemies. Machiavelli knew it in 1513.'),
('n3',N,'Maya, new on her team, finds a way to do the weekly report in half the time.','Maya, new on her team, finds a way to do the weekly report in half the time.'),
('n4',N,'The people who built the old way push back. The people it helps... just shrug.','The people who built the old way push back. The people it helps... just shrug.'),
('q1',Q,'He wrote... the innovator has for enemies all those who have done well under the old conditions, and lukewarm defenders in those who may do well under the new.','He wrote... "the innovator has for enemies all those who have done well under the old conditions, and lukewarm defenders in those who may do well under the new."'),
('n5',N,"Two groups. One has something to lose. The other... doesn't believe it yet.","Two groups. One has something to lose. The other... doesn't believe it yet."),
('n6',N,"In essence... people don't trust new things until they've lived with them a long time.","In essence... people don't trust new things until they've lived with them a long time."),
('n7',N,'My take? Stop pouring your energy into the critics. Win the shruggers... with proof, not speeches.','My take? Stop pouring your energy into the critics. Win the shruggers... with proof, not speeches.'),
('n8',N,'Maya quietly runs her method for one week... then shows the hours saved. Now the shruggers defend it.','Maya quietly runs her method for one week... then shows the hours saved. Now the shruggers defend it.'),
('n9',N,'Today, build the smallest version of your idea that works... and show one person it helps.','Today, build the smallest version of your idea that works... and show one person it helps.'),
('n10',N,'What change did people fight you on? Tell me below.','What change did people fight you on? Tell me below.'),
('n11',N,'Follow Awaaz... and keep building.','Follow Awazzzz... and keep building.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
