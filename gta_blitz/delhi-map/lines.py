# Awazzzz GTA blitz #15 — Agar GTA ka map Delhi hota? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"सिर्फ़ कल्पना है, कोई असली गेम या ऐलान नहीं!","Sirf kalpana hai, koi asli game ya elaan nahi!"),
("n02",N,"ज़ोन वन: चाँदनी चौक! सदियों पुराना बाज़ार, गलियाँ इतनी तंग कि कार नहीं, रिक्शा मिशन!","Zone 1: Chandni Chowk! Sadiyon purana bazaar, galiyan itni tang ki car nahi, rickshaw mission!"),
("n03",N,"फ़ास्ट ट्रैवल? दिल्ली मेट्रो, भारत का सबसे बड़ा मेट्रो नेटवर्क!","Fast travel? Delhi Metro, Bharat ka sabse bada metro network!"),
("n04",N,"ट्विस्ट! बॉस लेवल: कनॉट प्लेस के गोल चक्कर! असली में भी सड़कें गोल घेरों में हैं। चेज़ में गोल-गोल घूमते रहो!","Twist! Boss level: Connaught Place ke gol chakkar! Asli mein bhi sadkein gol gheron mein hain. Chase mein gol-gol ghoomte raho!"),
("n05",N,"सर्दी में स्मॉग मोड! असली दिल्ली में भी स्मॉग और कोहरा विज़िबिलिटी घटा देते हैं।","Sardi mein smog mode! Asli Dilli mein bhi smog aur kohra visibility ghata dete hain."),
("n06",N,"आख़िरी सीन: रात में जगमगाता इंडिया गेट, सैनिकों की याद में बना युद्ध स्मारक!","Aakhri scene: raat mein jagmagata India Gate, sainikon ki yaad mein bana yudh smarak!"),
("h1o",N,"सोचो अगर, GTA का मैप दिल्ली होता!","Socho agar GTA ka map Dilli hota!"),
("h1e",N,"दिल्ली मैप में आप सबसे पहले कहाँ जाएँगे? कमेंट करो!","Dilli map mein aap sabse pehle kahan jaayenge? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
