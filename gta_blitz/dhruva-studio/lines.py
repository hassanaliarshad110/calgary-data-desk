# Awazzzz GTA blitz #19 — Dhruva Interactive: Bharat ka pehla game studio ki kahani (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"उन्नीस सौ सत्तानवे, बेंगलुरु। राजेश राव ने शुरू किया ध्रुव इंटरैक्टिव, जिसे भारत का पहला गेम स्टूडियो माना जाता है।","1997, Bengaluru. Rajesh Rao ne shuru kiya Dhruva Interactive, jise Bharat ka pehla game studio maana jaata hai."),
("n02",N,"असली शुरुआत उन्नीस सौ पचानवे में: बैंक लोन, पापा से मिले पैसे, एक कंप्यूटर और चौदह पॉइंट चार केबीपीएस का मॉडम।","Asli shuruaat 1995 mein: bank loan, papa se mile paise, ek computer aur 14.4 kbps ka modem."),
("n03",N,"पहला गेम कॉन्ट्रैक्ट उन्नीस सौ अट्ठानवे में मिला। लेकिन वो गेम कभी रिलीज़ ही नहीं हुआ!","Pehla game contract 1998 mein mila. Lekin wo game kabhi release hi nahi hua!"),
("n04",N,"फिर ध्रुव ने दुनिया के बड़े गेम्स के आर्ट में हाथ बटाया: Forza, Halo, Sea of Thieves।","Phir Dhruva ne duniya ke bade games ke art mein haath bataya: Forza, Halo, Sea of Thieves."),
("n05",N,"ट्विस्ट: दो हज़ार उन्नीस में GTA बनाने वाली रॉकस्टार गेम्स ने ध्रुव को ख़रीद लिया, सात दशमलव नौ मिलियन डॉलर में!","Twist: 2019 mein GTA banane wali Rockstar Games ne Dhruva ko khareed liya, 7.9 million dollar mein!"),
("n06",N,"क़रीब तीन सौ लोग रॉकस्टार इंडिया में शामिल हो गए। एक मॉडम से GTA वाली कंपनी तक!","Kareeb 300 log Rockstar India mein shaamil ho gaye. Ek modem se GTA wali company tak!"),
("h1o",N,"एक मॉडम से शुरू हुआ भारत का पहला गेम स्टूडियो... पहुँचा कहाँ?","Ek modem se shuru hua Bharat ka pehla game studio... pahuncha kahaan?"),
("h1e",N,"आपके हिसाब से भारत का अपना GTA-लेवल गेम कब आएगा? कमेंट करो!","Aapke hisaab se Bharat ka apna GTA-level game kab aayega? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
