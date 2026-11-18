# Awazzzz GTA blitz #27 — What if: Arjun ki teer-andaazi ek mini-game hoti (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"लेवल वन, महाभारत से: गुरु द्रोण ने पेड़ की चोटी पर, एक नकली चिड़िया रखवाई।","Level 1, Mahabharat se: Guru Drona ne ped ki choti par ek nakli chidiya rakhwaayi."),
("n02",N,"सवाल: तुम्हें क्या दिख रहा है? युधिष्ठिर बोले: पेड़, आप, भाई, और चिड़िया। द्रोण: अलग हट जाओ!","Sawaal: tumhe kya dikh raha hai? Yudhishthir bole: ped, aap, bhai aur chidiya. Drona: alag hat jaao!"),
("n03",N,"दुर्योधन, भीम, सबका वही जवाब। किसी को तीर चलाने का मौक़ा ही नहीं!","Duryodhan, Bhim, sabka wahi jawaab. Kisi ko teer chalaane ka mauka hi nahi!"),
("n04",N,"ट्विस्ट: अर्जुन बोले, सिर्फ़ चिड़िया दिख रही है। फिर: सिर्फ़ उसका सिर! द्रोण: चलाओ! और नकली चिड़िया का सिर, सीधा ज़मीन पर!","Twist: Arjun bole, sirf chidiya dikh rahi hai. Phir: sirf uska sir! Drona: chalaao! Aur nakli chidiya ka sir, seedha zameen par!"),
("n05",N,"तो मिनी-गेम का रूल: सब धुंधला, सिर्फ़ टारगेट साफ़। फ़ोकस फुल, तभी तीर चलेगा!","Toh mini-game ka rule: sab dhundhla, sirf target saaf. Focus full, tabhi teer chalega!"),
("n06",N,"सबक: जहाँ फ़ोकस, वहीं जीत!","Sabak: jahan focus, wahin jeet!"),
("h1o",N,"सोचो अगर, अर्जुन की तीरंदाज़ी एक मिनी-गेम होती!","Socho agar Arjun ki teer-andaazi ek mini-game hoti!"),
("h1e",N,"तुम्हें क्या दिखेगा: पूरा पेड़, या सिर्फ़ टारगेट? कमेंट करो!","Tumhe kya dikhega: poora ped, ya sirf target? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
