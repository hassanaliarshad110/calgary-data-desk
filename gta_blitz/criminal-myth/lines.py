# Awazzzz GTA blitz #11 — GTA khelne se criminal? Myth vs research (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"दो हज़ार उन्नीस में, ऑक्सफ़र्ड ने ब्रिटेन के लगभग एक हज़ार टीनेजर्स पर स्टडी की।","2019 mein Oxford ne Britain ke lagbhag 1,000 teenagers par study ki."),
("n02",N,"नतीजा? वायलेंट गेम्स पर कितना टाइम बिताया, इसका टीनेजर्स के आक्रामक बर्ताव से कोई रिश्ता नहीं मिला।","Natija? Violent games par kitna time bitaaya, iska teenagers ke aggressive bartaav se koi rishta nahi mila."),
("n03",N,"दो हज़ार बीस में, अमेरिकन साइकोलॉजिकल एसोसिएशन: वायलेंट गेम्स से हिंसक बर्ताव होता है, इसका वैज्ञानिक सबूत नाकाफ़ी है।","2020 mein American Psychological Association: violent games se hinsak bartaav hota hai, iska scientific saboot naakaafi hai."),
("n04",N,"ट्विस्ट: APA मानता है कि वायलेंट गेम्स और छोटे आक्रामक बर्ताव, जैसे चिल्लाना या धक्का देना, में छोटा सा रिश्ता है। पर इसे बड़ी हिंसा से जोड़ना मुश्किल है।","Twist: APA maanta hai ki violent games aur chhote aggressive bartaav, jaise chillaana ya dhakka dena, mein chhota sa rishta hai. Par ise badi hinsa se jodna mushkil hai."),
("n05",N,"मतलब, 'GTA खेलो, हिंसक बनो', इसका पक्का सबूत नहीं। APA प्रेसिडेंट: हिंसा का दोष गेम्स पर डालना वैज्ञानिक रूप से सही नहीं।","Matlab, 'GTA khelo, hinsak bano', iska pakka saboot nahi. APA President: hinsa ka dosh games par daalna scientifically sahi nahi."),
("h1o",N,"क्या GTA जैसे गेम्स खेलकर लोग हिंसक बनते हैं?","Kya GTA jaise games khelkar log hinsak bante hain?"),
("h1e",N,"आपकी राय? गेम्स पर इल्ज़ाम सही या गलत? कमेंट करो!","Aapki raay? Games par ilzaam sahi ya galat? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
