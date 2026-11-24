# Awazzzz Mindset — evening Short, Nov 24 2026 — "The Eye and the Hand" (The Prince, Ch. 18, tr. Marriott)
# structure: two-person dilemma (workplace) + quote + commentary flip
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Why does the loudest person in the room... get the credit?','Why does the loudest person in the room... get the credit?'),
('n2',N,'Two new hires. Dan talks big in every meeting.','Two new hires. Dan talks big in every meeting.'),
('n3',N,'Aisha quietly fixes the problems nobody sees.','Aisha quietly fixes the problems nobody sees.'),
('n4',N,'Six months later... Dan gets promoted.','Six months later... Dan gets promoted.'),
('n5',N,'Unfair? Machiavelli saw this coming... over five hundred years ago.','Unfair? Machiavelli saw this coming... over 500 years ago.'),
('q1',Q,'He wrote... men judge generally more by the eye than by the hand.','He wrote... "men judge generally more by the eye than by the hand."'),
('n6',N,'The eye is how you look. The hand is what people find up close... and few get that close.','The eye is how you look. The hand is what people find up close... and few get that close.'),
('q2',Q,'Everyone sees what you appear to be... few really know what you are.','"Everyone sees what you appear to be, few really know what you are."'),
('n7',N,"He meant it as advice to rulers... you don't need every virtue... just seem to have them.","He meant it as advice to rulers... you don't need every virtue... just seem to have them."),
('n8',N,"Don't copy the mask. Flip the lesson. Judge people by the hand... what they do, not what they promise.","Don't copy the mask. Flip the lesson. Judge people by the hand... what they do, not what they promise."),
('n9',N,"And if you're Aisha... hidden work can't speak for you. Let the eye see it.","And if you're Aisha... hidden work can't speak for you. Let the eye see it."),
('n10',N,'Tonight, send your team one short note... three things you finished this month.','Tonight, send your team one short note... three things you finished this month.'),
('n11',N,'Ever been an Aisha? Tell me in the comments.','Ever been an Aisha? Tell me in the comments.'),
('n12',N,'Follow Awaaz... and let your real work be seen.','Follow Awazzzz... and let your real work be seen.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
