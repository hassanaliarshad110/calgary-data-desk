# Awazzzz GTA blitz #8 — GTA V ki kamaai vs Bollywood ki sabse badi film (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"भारत की सबसे ज़्यादा कमाने वाली फ़िल्म: दंगल। दुनिया भर में, लगभग दो हज़ार सत्तर करोड़ रुपये।","Bharat ki sabse zyada kamaane waali film: Dangal. Duniya bhar mein, lagbhag ₹2,070 crore."),
("n02",N,"और इसमें तेरह सौ करोड़ से ज़्यादा, सिर्फ़ चीन से आए!","Aur ismein ₹1,300 crore se zyada, sirf China se aaye!"),
("n03",N,"अब एक गेम। सितंबर दो हज़ार तेरह, GTA फ़ाइव। टेक-टू के मुताबिक़, पहले ही दिन की बिक्री: आठ सौ मिलियन डॉलर से ज़्यादा!","Ab ek game. September 2013, GTA V. Take-Two ke mutabik, pehle hi din ki bikri: $800 million se zyada!"),
("n04",N,"ट्विस्ट: उस दिन के डॉलर रेट से, ये पाँच हज़ार करोड़ रुपये से ज़्यादा। यानी दंगल की पूरी कमाई का दो गुना से भी ज़्यादा, सिर्फ़ एक दिन में!","Twist: us din ke dollar rate se, ye ₹5,000 crore se zyada… yaani Dangal ki poori kamaai ka do guna se bhi zyada, sirf ek din mein!"),
("n05",N,"और तीन दिन में? एक बिलियन डॉलर पार। गेमिंग की दुनिया का नया रिकॉर्ड!","Aur teen din mein? $1 billion paar. Gaming ki duniya ka naya record!"),
("n06",N,"अब उन्नीस नवंबर को आ रहा है GTA सिक्स। क्या ये अपने बड़े भाई का रिकॉर्ड तोड़ेगा?","Ab 19 November ko aa raha hai GTA 6. Kya ye apne bade bhai ka record todega?"),
("h1o",N,"एक गेम की एक दिन की कमाई, या बॉलीवुड की सबसे बड़ी फ़िल्म की पूरी कमाई: कौन आगे?","Ek game ki ek din ki kamaai, ya Bollywood ki sabse badi film ki poori kamaai: kaun aage?"),
("h1e",N,"आपके हिसाब से GTA सिक्स पहले दिन कितना कमाएगा? कमेंट करो!","Aapke hisaab se GTA 6 pehle din kitna kamaayega? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
