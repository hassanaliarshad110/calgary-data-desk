# Awazzzz GTA blitz #22 — GTA wala helicopter asli mein kitne ka? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"एक नया, चार सीट वाला छोटा हेलिकॉप्टर लो: Robinson R44 Raven II.","Ek naya, 4 seat wala chhota helicopter lo: Robinson R44 Raven II."),
("n02",N,"अमेरिका के एक authorized Robinson dealer के मुताबिक़, एक जनवरी दो हज़ार छब्बीस से इसकी base कीमत है छह लाख छियालीस हज़ार डॉलर।","America ke ek authorized Robinson dealer ke mutabik, 1 January 2026 se iski base keemat hai 6,46,000 dollar."),
("n03",N,"रुपये में? क़रीब छह करोड़! और ये सिर्फ़ अमेरिका की base कीमत है, options जोड़ो तो और ज़्यादा।","Rupaye mein? Kareeb 6 crore! Aur ye sirf America ki base keemat hai, options jodo toh aur zyada."),
("n04",N,"इतने में एक सौ साठ से ज़्यादा Alto K10 आ जाएँ, दिल्ली की ex-showroom कीमत पर!","Itne mein 160 se zyada Alto K10 aa jaayen, Delhi ki ex-showroom keemat par!"),
("n05",N,"ट्विस्ट: इसी पैसे में GTA 6 की दस हज़ार से ज़्यादा कॉपियाँ आ जाएँ!","Twist: isi paise mein GTA 6 ki 10 hazaar se zyada copies aa jaayen!"),
("n06",N,"मतलब हेलिकॉप्टर वाला शौक़, गेम में ही सबसे सस्ता है!","Matlab helicopter wala shauq, game mein hi sabse sasta hai!"),
("h1o",N,"GTA जैसा हेलिकॉप्टर असली में ख़रीदो, तो कितने का पड़ेगा?","GTA jaisa helicopter asli mein khareedo, toh kitne ka padega?"),
("h1e",N,"तुम क्या लोगे: एक हेलिकॉप्टर या एक सौ साठ Alto? कमेंट करो!","Tum kya loge: ek helicopter ya 160 Alto? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
