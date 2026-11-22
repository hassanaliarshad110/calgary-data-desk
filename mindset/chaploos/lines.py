# Awazzzz Mindset — morning Short, Nov 23 2026 — "The Yes-Man Trap" (The Prince, Ch. 23, tr. Marriott)
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'The person who always agrees with you... might be your biggest risk.','The person who always agrees with you... might be your biggest risk.'),
('n2',N,'Machiavelli called flatterers a pest... and said courts are full of them.','Machiavelli called flatterers a pest... and said courts are full of them.'),
('n3',N,'A captain shares his plan. Everyone says... great idea! Nobody mentions the weak defence... until match day.','A captain shares his plan. Everyone says... great idea! Nobody mentions the weak defence... until match day.'),
('n4',N,'Take Emperor Maximilian. He kept his plans secret... and asked nobody for advice.','Take Emperor Maximilian. He kept his plans secret... and asked nobody for advice.'),
('q1',Q,'A man close to him said... He consulted with no one, yet never got his own way in anything.','A man close to him said... "He consulted with no one, yet never got his own way in anything."'),
('n5',N,'His plans came out... his people pushed back... he gave in. Done one day... undone the next.','His plans came out... his people pushed back... he gave in. Done one day... undone the next.'),
('n6',N,"Shutting people out isn't the answer. Pick wise people... ask them everything... then decide yourself.","Shutting people out isn't the answer. Pick wise people... ask them everything... then decide yourself."),
('q2',Q,'The more freely he shall speak... the more he shall be preferred.','"The more freely he shall speak, the more he shall be preferred."'),
('n7',N,'Reward whoever brings bad news... and bad news stops hiding.','Reward whoever brings bad news... and bad news stops hiding.'),
('n8',N,'This morning, ask someone you trust... what am I getting wrong? Then just listen.','This morning, ask someone you trust... what am I getting wrong? Then just listen.'),
('n9',N,'Who always tells you the truth? Shout them out in the comments.','Who always tells you the truth? Shout them out in the comments.'),
('n10',N,'Follow Awaaz... and keep honest people close.','Follow Awazzzz... and keep honest people close.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
