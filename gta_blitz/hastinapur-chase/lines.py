# Awazzzz GTA blitz #12 — Desi GTA: Agar Hastinapur ki sadkon par chase hota? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"मिशन: हस्तिनापुर रथ चेज़! महाभारत की कुरु राजधानी। यहाँ गाड़ी नहीं, रथ!","Mission: Hastinapur Rath Chase! Mahabharat ki Kuru rajdhani. Yahan gaadi nahi — rath!"),
("n02",N,"अब ट्विस्ट! हस्तिनापुर नाम, सिर्फ़ कहानी में नहीं मिलता। मेरठ ज़िले में, गंगा किनारे, आज भी ये शहर है।","Ab twist! Hastinapur naam sirf kahaani mein nahi milta. Meerut zile mein, Ganga kinare, aaj bhi ye shehar hai."),
("n03",N,"उन्नीस सौ पचास से बावन तक, बी बी लाल ने यहाँ खुदाई की। उनके मुताबिक, टीले में गंगा की बड़ी बाढ़ के निशान दिखे, शायद आठ सौ ईसा पूर्व के।","1950 se 1952 tak, B.B. Lal ne yahan khudaai ki. Unke mutabik, teele mein Ganga ki badi baadh ke nishaan dikhe — shaayad 800 isa purv ke."),
("n04",N,"पुरानी कथा में लिखा है: राजा निचक्षु के समय, बाढ़ हस्तिनापुर का बड़ा हिस्सा बहा ले गई, और राजधानी कौशाम्बी चली गई। पर दोनों को जोड़ना, पक्का सबूत नहीं।","Puraani katha mein likha hai: Raja Nichakshu ke samay baadh Hastinapur ka bada hissa baha le gayi, aur rajdhani Kaushambi chali gayi. Par dono ko jodna pakka saboot nahi."),
("n05",N,"तो गेम का फ़ाइनल लेवल? चेज़ पुलिस से नहीं, बाढ़ से! पानी से पहले, कौशाम्बी पहुँचो!","Toh game ka final level? Chase police se nahi — baadh se! Paani se pehle Kaushambi pahuncho!"),
("h1o",N,"सोचो अगर, GTA जैसा चेज़, हस्तिनापुर की सड़कों पर होता!","Socho agar GTA jaisa chase Hastinapur ki sadkon par hota!"),
("h1e",N,"तुम क्या खेलोगे: रथ रेस, या बाढ़ से एस्केप? कमेंट करो!","Tum kya kheloge: rath race, ya baadh se escape? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
