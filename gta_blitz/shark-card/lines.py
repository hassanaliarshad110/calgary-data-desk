# Awazzzz GTA blitz #28 — GTA Online paisa vs asli paisa: Shark Card ki keemat rupaye mein (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"GTA 5 के GTA Online में असली पैसे से game का पैसा ख़रीदा जाता है: Shark Card.","GTA 5 ke GTA Online mein asli paise se game ka paisa khareeda jaata hai: Shark Card."),
("n02",N,"सबसे बड़ा, Megalodon Shark Card: एक करोड़ GTA डॉलर। PlayStation Store India पर पूरी कीमत: पाँच हज़ार सात सौ निन्यानवे रुपये।","Sabse bada, Megalodon Shark Card: 1 crore GTA dollar. PlayStation Store India par poori keemat: ₹5,799."),
("n03",N,"यानी एक रुपये में क़रीब सत्रह सौ GTA डॉलर!","Yaani 1 rupaye mein kareeb 1,700 GTA dollar!"),
("n04",N,"ट्विस्ट: ये card लगभग GTA 6 जितना महँगा है! GTA 6 का Standard Edition: पाँच हज़ार नौ सौ निन्यानवे रुपये। फ़र्क़ सिर्फ़ दो सौ रुपये!","Twist: ye card lagbhag GTA 6 jitna mehnga hai! GTA 6 ka Standard Edition: ₹5,999. Farq sirf ₹200!"),
("n05",N,"और GTA Online की सबसे महँगी सवारी, Luxor Deluxe jet: पूरे एक करोड़ GTA डॉलर! यानी पूरा card, एक ही jet में ख़त्म।","Aur GTA Online ki sabse mehngi sawaari, Luxor Deluxe jet: poore 1 crore GTA dollar! Yaani poora card, ek hi jet mein khatam."),
("n06",N,"तो game में करोड़पति बनना आसान है... बस असली जेब ढीली करनी पड़ती है!","Toh game mein crorepati banna aasaan hai... bas asli jeb dheeli karni padti hai!"),
("h1o",N,"एक करोड़ GTA डॉलर, असली रुपयों में कितने के?","1 crore GTA dollar, asli rupayon mein kitne ke?"),
("h1e",N,"तुम एक करोड़ GTA डॉलर किस पर उड़ाओगे? कमेंट करो!","Tum 1 crore GTA dollar kis par udaaoge? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
