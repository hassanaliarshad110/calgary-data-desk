# Awazzzz GTA blitz #13 — GTA 6 launch: 19 Nov ko India mein kis time unlock? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"PlayStation और Xbox स्टोर की लिस्टिंग के हिसाब से, GTA सिक्स हर देश में वहाँ की आधी रात को खुलेगा।","PlayStation aur Xbox store ki listing ke hisaab se, GTA 6 har desh mein wahan ki aadhi raat ko khulega."),
("n02",N,"मतलब इंडिया में: उन्नीस नवंबर, रात बारह बजे। यानी अठारह की रात, जैसे ही बारह बजें!","Matlab India mein: 19 November, raat 12 baje. Yaani 18 ki raat, jaise hi 12 bajein!"),
("n03",N,"ट्विस्ट: सबसे पहले न्यूज़ीलैंड! इंडिया के टाइम से अठारह नवंबर, शाम साढ़े चार बजे। हमसे साढ़े सात घंटे पहले!","Twist: sabse pehle New Zealand! India ke time se 18 November, shaam saadhe chaar baje. Humse saadhe saat ghante pehle!"),
("n04",N,"और अमेरिका के ईस्टर्न टाइम वाले? इंडिया के टाइम से उन्नीस नवंबर, सुबह साढ़े दस बजे। हम उनसे दस घंटे से ज़्यादा आगे!","Aur America ke Eastern time waale? India ke time se 19 November, subah saadhe das baje. Hum unse das ghante se zyaada aage!"),
("n05",N,"Rockstar के मुताबिक़, डिजिटल प्री-लोड दस नवंबर से खुला है, दो सौ बारह GB तक। तो रात बारह से पहले डाउनलोड कर लो!","Rockstar ke mutabik, digital pre-load 10 November se khula hai, 212 GB tak. To raat 12 se pehle download kar lo!"),
("h1o",N,"GTA सिक्स उन्नीस नवंबर को आ रहा है। लेकिन इंडिया में कितने बजे खुलेगा?","GTA 6 19 November ko aa raha hai. Lekin India mein kitne baje khulega?"),
("h1e",N,"आप रात बारह बजे जागकर खेलोगे, या सुबह आराम से? कमेंट करो!","Aap raat 12 baje jaagkar kheloge, ya subah aaram se? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
