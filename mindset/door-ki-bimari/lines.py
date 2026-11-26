# Awazzzz Mindset — evening Short, Nov 26 2026 — "Easy to Cure, Hard to See" (The Prince, Ch. 3, tr. Marriott)
# structure: bold-claim hook + friendship told in REWIND (month six -> week one) + physician quote + crossing-curves commentary
#            + Rome "stay close" in essence + noticing-is-the-skill take + tonight's five-minute action
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Most problems that wreck you... were once small enough to fix in five minutes.','Most problems that wreck you... were once small enough to fix in five minutes.'),
('n2',N,"Rewind a friendship. Month six... you're basically strangers.","Rewind a friendship. Month six... you're basically strangers."),
('n3',N,'Month two... the replies got shorter. Nobody said a word.','Month two... the replies got shorter. Nobody said a word.'),
('n4',N,'Week one... a cancelled plan. A joke that landed wrong. One honest message would have fixed it.','Week one... a cancelled plan. A joke that landed wrong. One honest message would have fixed it.'),
('n5',N,"In fifteen thirteen, Machiavelli explained this trap... with a doctor's rule.","In 1513, Machiavelli explained this trap... with a doctor's rule."),
('q1',Q,'He wrote... in the beginning of the malady it is easy to cure but difficult to detect... but in the course of time... it becomes easy to detect but difficult to cure.','He wrote... "in the beginning of the malady it is easy to cure but difficult to detect... but in the course of time... it becomes easy to detect but difficult to cure."'),
('n6',N,"While a problem is cheap... it's invisible. Once everyone sees it... it's expensive.","While a problem is cheap... it's invisible. Once everyone sees it... it's expensive."),
('n7',N,'In essence... he praised the Romans for spotting trouble early... and dealing with it at once.','In essence... he praised the Romans for spotting trouble early... and dealing with it at once.'),
('n8',N,"The real skill isn't fixing big problems. It's acting on small ones... while it still feels silly.","The real skill isn't fixing big problems. It's acting on small ones... while it still feels silly."),
('n9',N,"Tonight, pick one thing you keep calling fine... a friend, a bill, that noise in your car... give it five minutes.","Tonight, pick one thing you keep calling \"fine\"... a friend, a bill, that noise in your car... give it five minutes."),
('n10',N,"What small thing are you ignoring? One word, below.","What small thing are you ignoring? One word, below."),
('n11',N,'Follow Awaaz... and catch it early.','Follow Awazzzz... and catch it early.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
