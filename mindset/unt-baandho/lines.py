# Awazzzz Mindset — morning Short, Nov 28 2026 — "You Have Hands. Why Wait?" (Rumi's Voice)
# Rumi: Masnavi, Book I, Story V "The Lion and the Beasts", tr. E. H. Whinfield (1898)
# structure: question hook + fable retold as a two-round debate (beasts vs lion) + the hare's plan (twist)
#            + job-hunt example + "hope with folded hands" commentary + before-noon one-step action
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,"Waiting for the right moment? Rumi's lion has a question for you.","Waiting for the right moment? Rumi's lion has a question for you."),
('n2',N,"In the Masnavi, the animals offer a lion a deal... one of them each day, if he stops hunting.","In the Masnavi, the animals offer a lion a deal... one of them each day, if he stops hunting."),
('n3',N,"He'd rather rely on his own effort. They say... relax.","He'd rather rely on his own effort. They say... relax."),
('q1',Q,"Lay aside caution... trust is the better part.",'"Lay aside caution... trust is the better part."'),
('n4',N,"The lion concedes one point. True, he says... trust is the mainstay. But...","The lion concedes one point. True, he says... trust is the mainstay. But..."),
('q2',Q,"Ye have feet... why then pretend ye are lame? Ye have hands... why then conceal your claws?",'"Ye have feet — why then pretend ye are lame? Ye have hands — why then conceal your claws?"'),
('n5',N,"In essence... the Creator sets a ladder at your feet. Climb to the roof... step by step.","In essence... the Creator sets a ladder at your feet. Climb to the roof... step by step."),
('n6',N,"And just waiting? He calls it sleeping on the road... among highwaymen.","And just waiting? He calls it sleeping on the road... among highwaymen."),
('n7',N,"The twist? The lion takes their deal anyway. Then the hare, the weakest of them, makes a plan... and outwits him.","The twist? The lion takes their deal anyway. Then the hare, the weakest of them, makes a plan... and outwits him."),
('n8',N,"Trust was never the problem. Trust with folded hands is. Like dreaming of the right job... and sending zero applications.","Trust was never the problem. Trust with folded hands is. Like dreaming of the right job... and sending zero applications."),
('n9',N,"This morning, pick one thing you keep saying will work out... and take one step before noon. One email. One page. One call.","This morning, pick one thing you keep saying will work out... and take one step before noon. One email. One page. One call."),
('n10',N,"What are you still waiting on? One word, in the comments.","What are you still waiting on? One word, in the comments."),
('n11',N,"Follow Awaaz... and climb one step today.","Follow Awazzzz... and climb one step today."),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L), sum(len(t.split()) for i,s,t,c in L),'words', sum(len(t.split()) for i,s,t,c in L if s==Q),'quote-line words')
