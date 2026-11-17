# Awazzzz GTA blitz #9 — Agar Abhimanyu ka chakravyuh ek game mission hota? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"ये सिर्फ़ कल्पना है, एक फ़ैन थ्योरी! पर कहानी, महाभारत से।","Ye sirf kalpana hai, ek fan theory! Par kahaani Mahabharat se."),
("n02",N,"मिशन: चक्रव्यूह। युद्ध का तेरहवाँ दिन। द्रोणाचार्य ने सेना को, पहिये जैसी गोल व्यूह-रचना में सजाया।","Mission: Chakravyuh. Yuddh ka terahva din. Dronacharya ne sena ko pahiye jaisi gol vyuh-rachna mein sajaaya."),
("n03",N,"प्लेयर: अर्जुन और सुभद्रा का बेटा, अभिमन्यु। पर उस दिन, अर्जुन दूर, संशप्तकों से लड़ रहे थे।","Player: Arjun aur Subhadra ka beta, Abhimanyu. Par us din Arjun door, Samshaptakon se lad rahe the."),
("n04",N,"अब ट्विस्ट! कथा कहती है, अभिमन्यु ने माँ के गर्भ में ही, व्यूह में घुसने का तरीका सुन लिया था। पर बाहर निकलने का नहीं!","Ab twist! Katha kehti hai: Abhimanyu ne maa ke garbh mein hi — vyuh mein ghusne ka tareeka sun liya tha. Par bahar nikalne ka nahi!"),
("n05",N,"यानी गेम में, एंट्री खुली, एग्ज़िट लॉक! और पीछे आने वाले पांडवों को, जयद्रथ ने रोक दिया।","Yaani game mein: entry khuli, exit lock! Aur peeche aane waale Pandavon ko Jayadrath ne rok diya."),
("n06",N,"अभिमन्यु अंदर अकेला रह गया, फिर भी उसकी हिम्मत, उसकी उम्र से कहीं बड़ी निकली।","Abhimanyu andar akela reh gaya. Phir bhi uski himmat uski umar se kahin badi nikli."),
("n07",N,"तो इस मिशन का सबक? अंदर जाने से पहले, बाहर आने का रास्ता भी सीखो!","Toh is mission ka sabak? Andar jaane se pehle, bahar aane ka raasta bhi seekho!"),
("h1o",N,"सोचो अगर, अभिमन्यु का चक्रव्यूह एक गेम मिशन होता!","Socho agar Abhimanyu ka chakravyuh ek game mission hota!"),
("h1e",N,"तुम होते, तो पहले क्या सीखते: एंट्री या एग्ज़िट? कमेंट करो!","Tum hote, toh pehle kya seekhte: entry ya exit? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
