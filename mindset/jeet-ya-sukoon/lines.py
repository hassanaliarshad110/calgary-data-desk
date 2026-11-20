# Awazzzz Mindset — evening Short, Nov 20 2026 — "Win or Peace?" (Mind vs Heart: The Prince Ch. 17, tr. Marriott · Masnavi Book I, tr. Whinfield)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Do you want to win... or do you want peace?','Do you want to win... or do you want peace?'),
('n2',N,'Two great minds. Two answers.','Two great minds. Two answers.'),
('n3',N,'Picture Leo. He waits for his boss to notice him... and loses the promotion.','Picture Leo. He waits for his boss to notice him... and loses the promotion.'),
('q1',Q,'Machiavelli wrote... a wise prince should establish himself on that which is in his own control... and not in that of others.','Machiavelli wrote... "A wise prince should establish himself on that which is in his own control and not in that of others."'),
('n4',N,'Now picture Sara. She wins everything... and still feels homesick inside.','Now picture Sara. She wins everything... and still feels homesick inside.'),
('q2',Q,'Rumi wrote... he who abides far away from his home... is ever longing for the day he shall return.','Rumi wrote... "He who abides far away from his home is ever longing for the day he shall return."'),
('n5',N,"But here's the catch.","But here's the catch."),
('n6',N,"They're not enemies. Machiavelli wins the game outside... Rumi guards the home inside.","They're not enemies. Machiavelli wins the game outside... Rumi guards the home inside."),
('n7',N,'Your action today: finish one thing in your control... then take five quiet minutes, no phone.','Your action today: finish one thing in your control... then take five quiet minutes, no phone.'),
('n8',N,'Win or peace... which comes first for you? Comment below.','Win or peace... which comes first for you? Comment below.'),
('n9',N,'Follow Awaaz for your daily mindset.','Follow Awazzzz for your daily mindset.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words')
