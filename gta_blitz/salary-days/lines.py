# Awazzzz GTA blitz #1 — GTA 6 ki keemat = kitne din ki salary? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"भारत में GTA सिक्स का स्टैंडर्ड एडिशन, पाँच हज़ार नौ सौ निन्यानवे रुपये।","Bharat mein GTA 6 ka Standard Edition: ₹5,999."),
("n02",N,"सरकारी सर्वे PLFS के मुताबिक़, नौकरीपेशा पुरुष की औसत कमाई, चौबीस हज़ार दो सौ सत्रह रुपये महीना। महिला की, अठारह हज़ार तीन सौ तिरेपन।","Sarkaari survey PLFS ke mutabiq, naukripesha purush ki average kamaai ₹24,217 mahina. Mahila ki ₹18,353."),
("n03",N,"यानी गेम, पुरुष की क़रीब साढ़े सात दिन की कमाई। महिला की, क़रीब दस दिन।","Yaani game = purush ki kareeb saadhe saat din ki kamaai. Mahila ki kareeb 10 din."),
("n04",N,"पर ट्विस्ट बाक़ी है! ये गेम सिर्फ़ PS फ़ाइव, और Xbox सीरीज़ एक्स या एस पर आ रहा है।","Par twist baaki hai! Ye game sirf PS5 aur Xbox Series X/S par aa raha hai."),
("n05",N,"PS फ़ाइव स्लिम डिजिटल, चौंसठ हज़ार नौ सौ नब्बे। गेम मिलाकर, सत्तर हज़ार नौ सौ नवासी रुपये!","PS5 Slim Digital ₹64,990. Game milaakar: ₹70,989!"),
("n06",N,"यानी पुरुष की क़रीब तीन महीने की कमाई। और महिला की? क़रीब चार महीने!","Yaani purush ki kareeb 3 mahine ki kamaai. Aur mahila ki? Kareeb 4 mahine!"),
("h1o",N,"GTA सिक्स ख़रीदने में, कितने दिन की कमाई लगेगी?","GTA 6 khareedne mein kitne din ki kamaai lagegi?"),
("h1e",N,"आप GTA सिक्स के लिए, कितने दिन की कमाई देंगे? कमेंट में बताइए!","Aap GTA 6 ke liye kitne din ki kamaai denge? Comment mein bataaiye!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
