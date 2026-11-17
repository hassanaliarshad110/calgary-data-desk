# Awazzzz GTA blitz #7 — GTA 6 download vs India ka mobile data (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"रॉकस्टार ने ख़ुद बताया: GTA 6 का प्री-लोड, डिवाइस के हिसाब से, दो सौ बारह GB तक है।","Rockstar ne khud bataaya: GTA 6 ka pre-load, device ke hisaab se, 212 GB tak hai."),
("n02",N,"अब TRAI का डेटा: भारत में एक मोबाइल डेटा यूज़र, महीने में औसतन अट्ठाईस दशमलव चार GB इस्तेमाल करता है।","Ab TRAI ka data: Bharat mein ek mobile data user, mahine mein ausatan 28.4 GB istemaal karta hai."),
("n03",N,"ट्विस्ट: यानी पूरे दो सौ बारह GB का डाउनलोड, एक औसत मोबाइल डेटा यूज़र के लगभग साढ़े सात महीने के डेटा के बराबर!","Twist: yaani poore 212 GB ka download… ek ausat mobile data user ke lagbhag saadhe saat mahine ke data ke barabar!"),
("n04",N,"और अगर आपका प्लान दो GB रोज़ का है? तो पूरे दो सौ बारह GB के लिए, एक सौ छह दिन तक रोज़ का पूरा डेटा सिर्फ़ इसी गेम में!","Aur agar aapka plan 2 GB roz ka hai? To poore 212 GB ke liye… 106 din tak roz ka poora data sirf isi game mein!"),
("n05",N,"पैसों में? TRAI के मुताबिक़, कंपनियों को एक GB से औसतन सात रुपये तेरह पैसे मिलते हैं। यानी कंपनियों की औसत कमाई के हिसाब से, लगभग पंद्रह सौ रुपये का डेटा!","Paison mein? TRAI ke mutabik, companiyon ko ek GB se ausatan ₹7.13 milte hain… yaani companiyon ki ausat kamaai ke hisaab se, lagbhag ₹1,500 ka data!"),
("n06",N,"सबक़: इतना बड़ा गेम वाई-फ़ाई पर डाउनलोड करो, और कंसोल में दो सौ बारह GB तक जगह पहले से ख़ाली रखो।","Sabak: itna bada game Wi-Fi par download karo, aur console mein 212 GB tak jagah pehle se khaali rakho."),
("h1o",N,"GTA 6 सिर्फ़ मोबाइल डेटा से डाउनलोड किया, तो कितने महीने का डेटा जाएगा?","GTA 6 sirf mobile data se download kiya, to kitne mahine ka data jaayega?"),
("h1e",N,"आप GTA 6 किस पर डाउनलोड करोगे: वाई-फ़ाई या मोबाइल डेटा? कमेंट करो!","Aap GTA 6 kis par download karoge: Wi-Fi ya mobile data? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
