# Awazzzz GTA blitz #26 — Kya GTA 6 PC par aayega? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"Rockstar ने GTA 6 अभी तक सिर्फ़ PS5 और Xbox Series X और S के लिए announce किया है।","Rockstar ne GTA 6 abhi tak sirf PS5 aur Xbox Series X|S ke liye announce kiya hai."),
("n02",N,"PC की कोई official date नहीं, और PC पर कोई pre-order भी नहीं।","PC ki koi official date nahi, aur PC par koi pre-order bhi nahi."),
("n03",N,"ट्विस्ट: पिछली बार भी यही हुआ था! GTA V console पर September दो हज़ार तेरह में आया, और PC पर April दो हज़ार पंद्रह में: क़रीब उन्नीस महीने बाद।","Twist: pichhli baar bhi yahi hua tha! GTA V console par September 2013 mein aaya, aur PC par April 2015 mein: kareeb 19 mahine baad."),
("n04",N,"Red Dead Redemption टू? Console पर October दो हज़ार अठारह, PC पर November दो हज़ार उन्नीस: क़रीब एक साल बाद।","Red Dead Redemption 2? Console par October 2018, PC par November 2019: kareeb ek saal baad."),
("n05",N,"तो PC वालों, पुराना pattern इंतज़ार का है, पर GTA 6 PC की कोई तारीख़ पक्की नहीं। जब तक Rockstar ख़ुद न बोले, rumours पर भरोसा मत करना!","Toh PC waalon, purana pattern intezaar ka hai, par GTA 6 PC ki koi tareekh pakki nahi. Jab tak Rockstar khud na bole, rumours par bharosa mat karna!"),
("h1o",N,"उन्नीस November को GTA 6 आ रहा है। पर PC gamers के लिए?","19 November ko GTA 6 aa raha hai. Par PC gamers ke liye?"),
("h1e",N,"तुम console लोगे, या PC का इंतज़ार करोगे? कमेंट करो!","Tum console loge, ya PC ka intezaar karoge? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
