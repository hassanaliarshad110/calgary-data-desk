# Awazzzz GTA blitz #6 — Agar GTA ka next map Mumbai hota? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"ये सिर्फ़ कल्पना है, एक फ़ैन थ्योरी! कोई असली गेम या ऐलान नहीं।","Ye sirf kalpana hai, ek fan theory! Koi asli game ya elaan nahi."),
("n02",N,"पहला ज़ोन: मरीन ड्राइव। रात में स्ट्रीट लाइट्स की चमकती माला, जिसे क्वीन्स नेकलेस कहते हैं। नाइट ड्राइव, परफ़ेक्ट!","Pehla zone: Marine Drive. Raat mein street lights ki chamakti maala, jise Queen's Necklace kehte hain. Night drive, perfect!"),
("n03",N,"साइड मिशन: पीक टाइम में लोकल ट्रेन पकड़ो! गेम का सबसे मुश्किल लेवल।","Side mission: peak time mein local train pakdo! Game ka sabse mushkil level."),
("n04",N,"पर ट्विस्ट! यहाँ सबसे बड़ा दुश्मन पुलिस नहीं, ट्रैफ़िक जाम है! वांटेड लेवल फ़ुल, और गाड़ी एक इंच भी न हिले!","Par twist! Yahan sabse bada dushman police nahi, traffic jam hai! Wanted level full, aur gaadi ek inch bhi na hile!"),
("n05",N,"और मौसम? मानसून मोड! सड़कों पर पानी, और कार की जगह नाव वाला मिशन!","Aur mausam? Monsoon mode! Sadkon par paani, aur car ki jagah naav wala mission!"),
("n06",N,"फ़ाइनल मिशन: बांद्रा-वर्ली सी लिंक पर, समंदर के ऊपर चेज़!","Final mission: Bandra-Worli Sea Link par, samandar ke upar chase!"),
("h1o",N,"सोचो अगर, GTA का अगला मैप मुंबई होता!","Socho agar GTA ka agla map Mumbai hota!"),
("h1e",N,"मुंबई मैप में आप सबसे पहले कहाँ जाएँगे? कमेंट करो!","Mumbai map mein aap sabse pehle kahan jaayenge? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
