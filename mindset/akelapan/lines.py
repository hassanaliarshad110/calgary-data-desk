# Awazzzz Mindset — evening Short, Nov 27 2026 — "Alone? Two Answers" (Mind vs Heart)
# Machiavelli: Vettori letter of Dec 1513 as translated in Marriott's Introduction to The Prince (1908)
# Rumi: Masnavi, Book I, Prologue (the reed-flute), tr. E. H. Whinfield (1898)
# structure: bold-claim hook + history moment at night (dismissal, prison, farm, the evening ritual)
#            + reed-flute-in-a-crowd parable + "my take" commentary + tonight's one-hour action
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,"Feeling alone? Machiavelli's darkest days... are when he wrote The Prince.","Feeling alone? Machiavelli's darkest days... are when he wrote The Prince."),
('n2',N,'Fifteen twelve. He loses his job. Then prison. Then a small farm... far from power.','1512. He loses his job. Then prison. Then a small farm... far from power.'),
('n3',N,'By day... dust and neighbours. But every evening...','By day... dust and neighbours. But every evening...'),
('q1',Q,'he wrote... I pull off my peasant-clothes... and put on my noble court dress.','he wrote... "I pull off my peasant-clothes... and put on my noble court dress."'),
('n4',N,'Then, with the great men of old... for four hours, he forgot every trouble.','Then, with the great men of old... for four hours, he forgot every trouble.'),
('n5',N,"The mind's answer. Being alone is an appointment... so dress for it.","The mind's answer. Being alone is an appointment... so dress for it."),
('n6',N,"Rumi's reed flute plays in every crowd... for the happy and the sad.","Rumi's reed flute plays in every crowd... for the happy and the sad."),
('q2',Q,'Yet it sighs... each interprets my notes... but not one fathoms the secrets of my heart.','Yet it sighs... "each interprets my notes... but not one fathoms the secrets of my heart."'),
('n7',N,'Lonely... in a full room. And still, that same song moves people to tears.','Lonely... in a full room. And still, that same song moves people to tears.'),
('n8',N,"My take? Neither man hid it. One wrote it down. One sang it out. Alone isn't the end... it's raw material.","My take? Neither man hid it. One wrote it down. One sang it out. Alone isn't the end... it's raw material."),
('n9',N,'Tonight, one hour alone, phone in another room... and make one thing. A page. A plan. A song.','Tonight, one hour alone, phone in another room... and make one thing. A page. A plan. A song.'),
('n10',N,'When you feel alone... do you reach for the book, or the flute? Tell us below.','When you feel alone... do you reach for the book, or the flute? Tell us below.'),
('n11',N,"Follow Awaaz... you're less alone than you think.","Follow Awazzzz... you're less alone than you think."),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
