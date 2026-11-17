# Awazzzz GTA blitz #18 — Fan theory: Vice City aur Mumbai itne milte-julte kyun lagte hain? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"सिर्फ़ फ़ैन थ्योरी है! गेम में ऐसा कुछ नहीं, ना रॉकस्टार का कोई ऐलान!","Sirf fan theory hai! Game mein aisa kuch nahi, na Rockstar ka koi elaan!"),
("n02",N,"GTA सिक्स की वाइस सिटी, मियामी से इंस्पायर्ड है: समंदर किनारा, पेस्टल आर्ट डेको होटल।","GTA 6 ki Vice City, Miami se inspired hai: samandar kinara, pastel Art Deco hotel."),
("n03",N,"अब मरीन ड्राइव देखो! तीन किलोमीटर समंदर किनारा, और पीली, गुलाबी, नीली आर्ट डेको इमारतें।","Ab Marine Drive dekho! Teen kilometre samandar kinara, aur peeli, gulabi, neeli Art Deco imaaratein."),
("n04",N,"ट्विस्ट! माना जाता है, मियामी के बाद दुनिया का दूसरा सबसे बड़ा आर्ट डेको कलेक्शन मुंबई में है! दो हज़ार अठारह में मरीन ड्राइव की ये इमारतें यूनेस्को वर्ल्ड हेरिटेज का हिस्सा बनीं!","Twist! Maana jaata hai, Miami ke baad duniya ka doosra sabse bada Art Deco collection Mumbai mein hai! 2018 mein Marine Drive ki ye imaaratein UNESCO World Heritage ka hissa baneen!"),
("n05",N,"रात में लाइटें मोतियों की माला जैसी, इसीलिए नाम, क्वीन्स नेकलेस! फ़र्क बस इतना: मियामी का डेको नियॉन, मुंबई का शांत।","Raat mein lights motiyon ki maala jaisi, isiliye naam Queen's Necklace! Farak bas itna: Miami ka Deco neon, Mumbai ka shaant."),
("n06",N,"तो फ़ैन थ्योरी: वाइस सिटी का देसी जुड़वाँ? मरीन ड्राइव!","Toh fan theory: Vice City ka desi judwaan? Marine Drive!"),
("h1o",N,"सोचो अगर, वाइस सिटी का जुड़वाँ मुंबई हो!","Socho agar, Vice City ka judwaan Mumbai ho!"),
("h1e",N,"आपको वाइस सिटी किस इंडियन शहर जैसी लगती है? कमेंट करो!","Aapko Vice City kis Indian shehar jaisi lagti hai? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
