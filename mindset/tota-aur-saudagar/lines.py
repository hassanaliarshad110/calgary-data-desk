# Awazzzz Mindset — morning Short, Nov 24 2026 — "The Parrot Who Escaped" (Masnavi, Book I, Story VII, tr. Whinfield)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'A bird escaped its cage... without breaking a single bar.','A bird escaped its cage... without breaking a single bar.'),
('n2',N,'Rumi tells how.','Rumi tells how.'),
('n3',N,'A merchant heads to India. His caged parrot says... tell the wild parrots I\'m locked in here.','A merchant heads to India. His caged parrot says... tell the wild parrots I\'m locked in here.'),
('q1',Q,'He does... On hearing it, one of them at once fell down dead.','He does... "On hearing it one of them at once fell down dead."'),
('n4',N,'Back home, his parrot hears this... and drops. Thrown out... it flies to a branch. Alive.','Back home, his parrot hears this... and drops. Thrown out... it flies to a branch. Alive.'),
('q2',Q,'The wild parrot had only feigned death... to suggest this way of escaping from confinement in a cage.','The wild parrot "had only feigned death to suggest this way of escaping from confinement in a cage."'),
('n5',N,"In Rumi's full verse, the message was... your sweet voice keeps you caged.","In Rumi's full verse, the message was... your sweet voice keeps you caged."),
('n6',N,'The gift that wins you praise... can become your cage.','The gift that wins you praise... can become your cage.'),
('n7',N,"The top student who never risks a wrong answer. The joker who can't say he's hurt.","The top student who never risks a wrong answer. The joker who can't say he's hurt."),
('n8',N,"Freedom isn't smashing bars. It's dropping the performance.","Freedom isn't smashing bars. It's dropping the performance."),
('n9',N,'Today, do one thing nobody will clap for... just to grow.','Today, do one thing nobody will clap for... just to grow.'),
('n10',N,'What were you praised into? One word, in the comments.','What were you praised into? One word, in the comments.'),
('n11',N,'Follow Awaaz for tomorrow morning\'s lesson.','Follow Awazzzz for tomorrow morning\'s lesson.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
