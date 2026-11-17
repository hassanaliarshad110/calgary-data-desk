# Awazzzz GTA blitz #7 — GTA 6 download vs India ka mobile data (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"रॉकस्टार के मुताबिक़, GTA 6 का प्री-लोड, डिवाइस के हिसाब से, दो सौ बारह GB तक है।","Rockstar ke mutabik, GTA 6 ka pre-load, device ke hisaab se, 212 GB tak hai."),
("n02",N,"TRAI कहता है: भारत में एक मोबाइल डेटा यूज़र, महीने में औसतन अट्ठाईस दशमलव चार GB चलाता है।","TRAI kehta hai: Bharat mein ek mobile data user, mahine mein ausatan 28.4 GB chalaata hai."),
("n03",N,"ट्विस्ट: पूरे दो सौ बारह GB, यानी एक औसत यूज़र का लगभग साढ़े सात महीने का डेटा!","Twist: poore 212 GB… yaani ek ausat user ka lagbhag saadhe saat mahine ka data!"),
("n04",N,"दो GB रोज़ वाला प्लान? तो इसमें पूरे एक सौ छह दिन का डेटा जाएगा!","2 GB roz waala plan? To ismein poore 106 din ka data jaayega!"),
("n05",N,"पैसों में? कंपनियों की औसत कमाई, सात रुपये तेरह पैसे प्रति GB। यानी लगभग पंद्रह सौ रुपये का डेटा!","Paison mein? Companiyon ki ausat kamaai, ₹7.13 prati GB… yaani lagbhag ₹1,500 ka data!"),
("n06",N,"सबक़: इतना बड़ा गेम वाई-फ़ाई पर डाउनलोड करो, और दो सौ बारह GB तक जगह पहले से ख़ाली रखो।","Sabak: itna bada game Wi-Fi par download karo, aur 212 GB tak jagah pehle se khaali rakho."),
("h1o",N,"मोबाइल डेटा से GTA 6 डाउनलोड किया, तो कितने महीने का डेटा जाएगा?","Mobile data se GTA 6 download kiya, to kitne mahine ka data jaayega?"),
("h1e",N,"आप किस पर डाउनलोड करोगे: वाई-फ़ाई या मोबाइल डेटा? कमेंट करो!","Aap kis par download karoge: Wi-Fi ya mobile data? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
