# Awazzzz Mindset — evening Short, Nov 25 2026 — "What Is Real Power?" (Mind vs Heart: The Prince Ch. 20 vs Masnavi Book I v. 1389)
# structure: trick question hook + two-answer debate (walls vs the self) + sports example (captain's red card) + own verdict
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Who has more power... the boss everyone fears... or the one nobody wants to lose?','Who has more power... the boss everyone fears... or the one nobody wants to lose?'),
('n2',N,'Two thinkers, centuries apart... two answers.','Two thinkers, centuries apart... two answers.'),
('n3',N,"In essence, Machiavelli says... better feared than loved, if you must choose. But never... be hated.","In essence, Machiavelli says... better feared than loved, if you must choose. But never... be hated."),
('q1',Q,'He wrote... the best possible fortress is... not to be hated by the people.','He wrote... "the best possible fortress is... not to be hated by the people."'),
('n4',N,'Walls, titles, money... none of it saves you if your people want you gone.','Walls, titles, money... none of it saves you if your people want you gone.'),
('n5',N,'In essence... Rumi turns from the battle outside... to the battle within.','In essence... Rumi turns from the battle outside... to the battle within.'),
('q2',Q,'His words... the true lion is he that breaks himself.','His words... "the (true) lion is he that breaks (conquers) himself."'),
('n6',N,'A team captain. Best player on the pitch. One bad call... he shoves the referee. Red card. Final... without him.','A team captain. Best player on the pitch. One bad call... he shoves the referee. Red card. Final... without him.'),
('n7',N,'Nobody beat him. His own temper did.','Nobody beat him. His own temper did.'),
('n8',N,'Machiavelli guards the walls. Rumi guards the gate inside. Real power needs both... and it starts inside.','Machiavelli guards the walls. Rumi guards the gate inside. Real power needs both... and it starts inside.'),
('n9',N,"Today, catch one urge... to snap, to quit, to scroll... and don't obey it.","Today, catch one urge... to snap, to quit, to scroll... and don't obey it."),
('n10',N,'Which battle is harder for you... outside or inside? Comment below.','Which battle is harder for you... outside or inside? Comment below.'),
('n11',N,'Follow Awaaz... and be the true lion.','Follow Awazzzz... and be the true lion.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    open('script.txt','w').write('\n'.join(f'{i} [{s}] {c}' for i,s,t,c in L)+'\n')
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
