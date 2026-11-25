# Awazzzz Mindset — morning Short, Nov 26 2026 — "The Wall With No Paint" (Masnavi, Book I, Story XIV "The Chinese and the Greek Artists", tr. Whinfield)
# Structure: pick-a-winner poll hook + contest retold + "grow by clearing" commentary + morning action
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'One team used every colour... the other used none. Pick your winner.','One team used every colour... the other used none. Pick your winner.'),
('n2',N,'Rumi tells of a contest. A Sultan gives two houses... one to Chinese artists, one to Greek.','Rumi tells of a contest. A Sultan gives two houses... one to Chinese artists, one to Greek.'),
('n3',N,'The Chinese gather every kind of paint... and cover their walls with wonders.','The Chinese gather every kind of paint... and cover their walls with wonders.'),
('n4',N,'The Greeks used no colours at all. They just cleaned... and polished.','The Greeks "used no colours at all." They just cleaned... and polished.'),
('q1',Q,'Burnishing them... till they were as clear and bright as the heavens.','"...burnishing them till they were as clear and bright as the heavens."'),
('n5',N,'The Sultan inspects both. The painted house is much admired. But in the end...','The Sultan inspects both. The painted house is much admired. But in the end...'),
('q2',Q,'The Greek house carried off the palm.','"...the Greek house carried off the palm."'),
('n6',N,'Their shining walls caught every colour... in endless shades.','Their shining walls caught every colour... in endless shades.'),
('n7',N,'In essence... what your heart truly knows beats what you only learned from books.','In essence... what your heart truly knows beats what you only learned from books.'),
('n8',N,'We try to grow by adding... more apps, more courses, more noise. Sometimes, we grow by clearing.','We try to grow by adding... more apps, more courses, more noise. Sometimes, we grow by clearing.'),
('n9',N,'Painting looks like progress. Polishing looks like nothing... until the light hits.','Painting looks like progress. Polishing looks like nothing... until the light hits.'),
('n10',N,'This morning, remove one thing before adding anything... a tab, an app, a grudge.','This morning, remove one thing before adding anything... a tab, an app, a grudge.'),
('n11',N,'What would you clear first? One word, below.','What would you clear first? One word, below.'),
('n12',N,'Follow Awaaz... keep your wall clean.','Follow Awazzzz... keep your wall clean.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q)+5,'quote words incl. n4 inline')
