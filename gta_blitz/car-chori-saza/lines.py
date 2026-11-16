# Awazzzz GTA blitz #5 — GTA jaisi car chheeni to Bharat mein kitni saza? (FACT, BNS 2023 s.309)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"गेम में एक बटन: ड्राइवर बाहर, गाड़ी आपकी। पर असली क़ानून क्या कहता है?","Game mein ek button: driver bahar, gaadi aapki. Par asli kanoon kya kehta hai?"),
("n02",N,"भारतीय न्याय संहिता, दो हज़ार तेईस। सेक्शन तीन सौ नौ।","Bharatiya Nyaya Sanhita, 2023. Section 309."),
("n03",N,"ट्विस्ट: चोरी के लिए किसी को चोट पहुँचाई, ज़बरदस्ती रोका, या फ़ौरन जान या चोट का डर दिखाया, तो ये सिर्फ़ चोरी नहीं, लूट यानी रॉबरी है!","Twist: chori ke liye kisi ko chot pahunchaayi… zabardasti roka… ya fauran jaan ya chot ka darr dikhaaya… to ye sirf chori nahi: loot yaani robbery hai!"),
("n04",N,"सज़ा? दस साल तक की कठोर क़ैद, और जुर्माना भी।","Saza? Das saal tak ki kathor qaid, aur jurmana bhi."),
("n05",N,"और अगर ये हाईवे पर, सूरज ढलने से सूरज उगने के बीच हुआ? तो क़ैद चौदह साल तक जा सकती है!","Aur agar ye highway par, suraj dhalne se suraj ugne ke beech hua? To qaid 14 saal tak ja sakti hai!"),
("n06",N,"सिर्फ़ कोशिश की? फिर भी सात साल तक। और लूट में किसी को जान-बूझकर चोट पहुँचाई? तो उम्रक़ैद तक!","Sirf koshish ki? Phir bhi 7 saal tak. Aur loot mein kisi ko jaan-boojhkar chot pahunchaayi? To umrqaid tak!"),
("n07",N,"गेम में रीस्पॉन होता है, असली ज़िंदगी में नहीं।","Game mein respawn hota hai, asli zindagi mein nahi."),
("h1o",N,"GTA जैसी गाड़ी छीनी, तो भारत में कितनी सज़ा?","GTA jaisi gaadi chheeni, to Bharat mein kitni saza?"),
("h1e",N,"GTA का कौन सा काम असली ज़िंदगी में सबसे भारी पड़ेगा? कमेंट करो!","GTA ka kaunsa kaam asli zindagi mein sabse bhaari padega? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
