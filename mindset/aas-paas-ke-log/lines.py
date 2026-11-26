# Awazzzz Mindset — morning Short, Nov 27 2026 — "Your Circle Is Your Reputation" (The Prince, Ch. 22, tr. Marriott)
# structure: five-names challenge hook + history moment (Siena: Pandolfo Petrucci & Antonio da Venafro) + key quote
#            + three-kinds-of-minds ladder (quote) + "you don't need to be the genius" take + group-project example
#            + flip-it twist (be someone's Venafro) + morning action
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,'Name the five people you talk to most. That list... is your real CV.','Name the five people you talk to most. That list... is your real CV.'),
('n2',N,'Siena... over five hundred years ago. Its lord, Pandolfo Petrucci, had a right-hand man.','Siena... over 500 years ago. Its lord, Pandolfo Petrucci, had a right-hand man.'),
('n3',N,'Antonio da Venafro. People judged Pandolfo... by him.','Antonio da Venafro. People judged Pandolfo... by him.'),
('n4',N,'In essence, Machiavelli says Pandolfo looked clever... simply for having him.','In essence, Machiavelli says Pandolfo looked clever... simply for having him.'),
('q1',Q,'His words... the first opinion which one forms of a prince... is by observing the men he has around him.','His words... "the first opinion which one forms of a prince... is by observing the men he has around him."'),
('n5',N,'Then he sorts minds into three kinds.','Then he sorts minds into three kinds.'),
('n6',N,'One works things out alone. One recognises good ideas from others. One does neither.','One works things out alone. One recognises good ideas from others. One does neither.'),
('q2',Q,'His verdict... the first is the most excellent, the second is good, the third is useless.','His verdict... "the first is the most excellent, the second is good, the third is useless."'),
('n7',N,"So you don't need to be the genius. Spotting good minds... is a power of its own.","So you don't need to be the genius. Spotting good minds... is a power of its own."),
('n8',N,'Group project. Pick the quiet kid who reads the brief... and you look brilliant on results day.','Group project. Pick the quiet kid who reads the brief... and you look brilliant on results day.'),
('n9',N,"Now flip it. You're in someone's circle too. Make them look wise.","Now flip it. You're in someone's circle too. Make them look wise."),
('n10',N,'This morning, message one person who makes you sharper... and tell them why.','This morning, message one person who makes you sharper... and tell them why.'),
('n11',N,"Who's the Venafro in your corner? Tell us what they do for you.","Who's the Venafro in your corner? Tell us what they do for you."),
('n12',N,'Choose your circle well... and follow Awaaz.','Choose your circle well... and follow Awazzzz.'),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
