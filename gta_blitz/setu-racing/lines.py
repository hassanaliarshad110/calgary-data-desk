# Awazzzz GTA blitz #21 — Agar Ramayan ka Lanka setu ek racing level hota? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n02",N,"गेम वाला हिस्सा सिर्फ़ कल्पना है! पर नाप-जोख, वाल्मीकि रामायण से। इंजीनियर? विश्वकर्मा के बेटे, नल!","Game wala hissa sirf kalpana hai! Par naap-jokh, Valmiki Ramayan se. Engineer? Vishwakarma ke bete, Nal!"),
("n03",N,"ट्विस्ट! ट्रैक एक दिन में नहीं बना। पाँच दिन, पाँच स्टेज: चौदह, बीस, इक्कीस, बाईस, तेईस योजन!","Twist! Track ek din mein nahi bana. Paanch din, paanch stage: 14, 20, 21, 22, 23 yojan!"),
("n04",N,"कुल सौ योजन! अनगिनत वानर, एक टीम बनकर, चट्टानें और पेड़ लाए!","Kul 100 yojan! Anginat vaanar, ek team bankar, chattaanein aur ped laaye!"),
("n05",N,"अब असली दुनिया: रामेश्वरम के पंबन द्वीप से श्रीलंका के मन्नार तक, लगभग अड़तालीस किलोमीटर, उथली चट्टानों और रेत की कड़ी: राम सेतु या एडम्स ब्रिज। वहाँ पानी आम तौर पर एक से तीन मीटर गहरा।","Ab asli duniya: Rameswaram ke Pamban dweep se Sri Lanka ke Mannar tak, lagbhag 48 km, uthli chattaanon aur reti ki kadi: Ram Setu ya Adam's Bridge. Wahan paani aam taur par 1-3 metre gehra."),
("n06",N,"तो रूल? ये रेस अकेले नहीं, टीम से जीती जाती है!","Toh rule? Ye race akele nahi, team se jeeti jaati hai!"),
("h1o",N,"सोचो अगर, रामायण का सेतु एक रेसिंग लेवल होता!","Socho agar, Ramayan ka setu ek racing level hota!"),
("h1e",N,"इस लेवल में आप क्या चलाते: कार, बाइक या बोट? कमेंट करो!","Is level mein aap kya chalaate: car, bike ya boat? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
