# Awazzzz GTA blitz #14 — GTA mein speeding vs Motor Vehicles Act: asli challan kitna? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"मोटर व्हीकल्स एक्ट की धारा एक सौ तिरासी: कार जैसी लाइट मोटर व्हीकल से स्पीड लिमिट तोड़ी, तो जुर्माना कम से कम एक हज़ार, और दो हज़ार रुपये तक।","Motor Vehicles Act ki dhaara 183: car jaisi light motor vehicle se speed limit todi, to jurmana kam se kam 1,000, aur 2,000 rupaye tak."),
("n02",N,"ट्रक या बस जैसी भारी गाड़ी? दो हज़ार से चार हज़ार रुपये।","Truck ya bus jaisi bhaari gaadi? 2,000 se 4,000 rupaye."),
("n03",N,"ट्विस्ट: दो हज़ार उन्नीस के संशोधन से पहले, यही जुर्माना सिर्फ़ चार सौ रुपये तक था!","Twist: 2019 ke sanshodhan se pehle, yahi jurmana sirf 400 rupaye tak tha!"),
("n04",N,"और दूसरी बार पकड़े गए? तो ड्राइविंग लाइसेंस इम्पाउंड, यानी ज़ब्त होगा।","Aur doosri baar pakde gaye? To driving licence impound, yaani zabt hoga."),
("n05",N,"और GTA जैसी सड़क पर रेस? धारा एक सौ नवासी: पहली बार में तीन महीने तक जेल, या पाँच हज़ार जुर्माना, या दोनों। दोबारा: एक साल तक जेल, या दस हज़ार जुर्माना, या दोनों।","Aur GTA jaisi sadak par race? Dhaara 189: pehli baar mein 3 mahine tak jail, ya 5,000 jurmana, ya dono. Dobaara: 1 saal tak jail, ya 10,000 jurmana, ya dono."),
("h1o",N,"GTA में दो सौ की स्पीड, कोई चालान नहीं। लेकिन इंडिया की असली सड़क पर?","GTA mein 200 ki speed, koi challan nahi. Lekin India ki asli sadak par?"),
("h1e",N,"आपका कभी स्पीड का चालान कटा है? कितने का? कमेंट करो!","Aapka kabhi speed ka challan kata hai? Kitne ka? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
