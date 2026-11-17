# Awazzzz GTA blitz #17 — GTA 6 India mein ban ho sakta hai? Record par kya hai? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"दो हज़ार बीस में PUBG समेत एक सौ अठारह ऐप्स ब्लॉक हुए, IT एक्ट की धारा उनहत्तर-ए से।","2020 mein PUBG samet 118 apps block hue, IT Act ki dhaara 69A se."),
("n02",N,"सरकारी वजह: सुरक्षा और यूज़र्स का डेटा। गेम की मार-धाड़ का ज़िक्र तक नहीं।","Sarkaari wajah: suraksha aur users ka data. Game ki maar-dhaad ka zikr tak nahi."),
("n03",N,"दो हज़ार पच्चीस का गेमिंग कानून? बैन पैसा लगाओ, पैसा जीतो वाले मनी गेम्स पर। ई-स्पोर्ट्स को बढ़ावा।","2025 ka Gaming kanoon? Ban paisa lagaao, paisa jeeto wale money games par. E-sports ko badhaava."),
("n04",N,"ट्विस्ट: सऊदी और UAE में GTA फ़ाइव बारह साल ऑफ़िशियली नहीं बिका। आज वहाँ GTA 6 के प्री-ऑर्डर चालू हैं!","Twist: Saudi aur UAE mein GTA V 12 saal officially nahi bika. Aaj wahaan GTA 6 ke pre-order chaalu hain!"),
("n05",N,"और भारत? कोई बैन रिपोर्ट नहीं। प्लेस्टेशन इंडिया पर प्री-ऑर्डर चालू, उन्नीस नवंबर को लॉन्च।","Aur Bharat? Koi ban report nahi. PlayStation India par pre-order chaalu, 19 November ko launch."),
("h1o",N,"क्या GTA 6 भारत में बैन हो सकता है?","Kya GTA 6 Bharat mein BAN ho sakta hai?"),
("h1e",N,"आपकी राय: किसी गेम को बैन करना कभी सही है? कमेंट करो!","Aapki raay: kisi game ko ban karna kabhi sahi hai? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
