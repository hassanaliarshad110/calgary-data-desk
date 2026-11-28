# Awazzzz Mindset — evening Short, Nov 28 2026 — "Don't Sit on the Fence" (Machiavelli's Rules)
# Machiavelli: The Prince, Ch. 21, tr. W. K. Marriott (1908) (Standard Ebooks edition of Marriott's text)
# structure: bold-claim hook + history moment (Achaean council: two envoys, two demands) + the pattern (quote)
#            + team-meeting dilemma ("both have good points") + blunt verdict (quote) + no-safe-path twist
#            + "a side is not a swing" commentary + honest-answer action
# (id, kind, tts_text, caption_text)  kind: N narration, Q quote read aloud
N='N'; Q='Q'
L=[
('h1',N,"Staying out of it feels safe. Five hundred years ago, one man disagreed.","Staying out of it feels safe. Five hundred years ago, one man disagreed."),
('n2',N,"Ancient Greece. King Antiochus comes to drive out Rome. Both send envoys to the Achaeans.","Ancient Greece. King Antiochus comes to drive out Rome. Both send envoys to the Achaeans."),
('n3',N,"Antiochus says... stay neutral. Rome says... take up arms.","Antiochus says... stay neutral. Rome says... take up arms."),
('n4',N,"Rome warns... stay out, and you get no favour. You're just the winner's prize.","Rome warns... stay out, and you get no favour. You're just the winner's prize."),
('q1',Q,"Machiavelli saw the pattern... he who is not your friend will demand your neutrality, whilst he who is your friend will entreat you to declare yourself.",'Machiavelli saw the pattern... "he who is not your friend will demand your neutrality, whilst he who is your friend will entreat you to declare yourself…"'),
('n5',N,"Team meeting. Two plans. Both leads look at you... you say, both are good.","Team meeting. Two plans. Both leads look at you... you say, both are good."),
('n6',N,"Plan A wins. Its lead remembers you didn't help. The other... remembers you didn't either.","Plan A wins. Its lead remembers you didn't help. The other... remembers you didn't either."),
('q2',Q,"Machiavelli, bluntly... irresolute princes, to avoid present dangers, generally follow the neutral path, and are generally ruined.",'Machiavelli, bluntly... "irresolute princes, to avoid present dangers, generally follow the neutral path, and are generally ruined."'),
('n7',N,"Is picking a side safe? No path is perfectly safe, he admits. Choose the lesser risk... eyes open.","Is picking a side safe? No path is perfectly safe, he admits. Choose the lesser risk... eyes open."),
('n8',N,"Taking a side isn't taking a swing. It's saying where you stand... and why.","Taking a side isn't taking a swing. It's saying where you stand... and why."),
('n9',N,"Tonight, one choice you keep dodging with, either is fine... give your real answer. Kindly, with a reason.","Tonight, one choice you keep dodging with \"either is fine\"... give your real answer. Kindly, with a reason."),
('n10',N,"When did staying neutral cost you? Tell us below.","When did staying neutral cost you? Tell us below."),
('n11',N,"Follow Awaaz... we don't sit on the fence.","Follow Awazzzz... we don't sit on the fence."),
]
VOICE=dict(name='en-US-ChristopherNeural',rate='-8%',pitch='-6Hz')
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE) for i,s,t,c in L],open('mind_lines.json','w'),ensure_ascii=False,indent=0)
    qw=sum(len(c.split('"')[1].split()) for i,s,t,c in L if s==Q)
    tw=sum(len(t.split()) for i,s,t,c in L)
    print(len(L), tw,'words', qw,'quoted words', round(100*qw/tw),'%')
