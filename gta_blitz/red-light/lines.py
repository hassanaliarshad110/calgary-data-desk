# Awazzzz GTA blitz #25 — Red light jump: GTA vs India — challan aur points (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"मोटर व्हीकल्स ऐक्ट की धारा एक सौ चौरासी में, दो हज़ार उन्नीस से लिखा है: red light jump करना, ख़तरनाक driving है।","Motor Vehicles Act ki dhaara 184 mein, 2019 se likha hai: red light jump karna, khatarnaak driving hai."),
("n02",N,"पहली बार: एक हज़ार से पाँच हज़ार रुपये तक जुर्माना, या छह महीने से एक साल तक जेल, या दोनों।","Pehli baar: ₹1,000 se ₹5,000 tak jurmana, ya 6 mahine se 1 saal tak jail, ya dono."),
("n03",N,"तीन साल के अंदर दोबारा? दो साल तक जेल, या दस हज़ार रुपये जुर्माना, या दोनों।","3 saal ke andar dobaara? 2 saal tak jail, ya ₹10,000 jurmana, ya dono."),
("n04",N,"ट्विस्ट: दिल्ली ट्रैफ़िक पुलिस की list में इसका fixed जुर्माना नहीं, court challan है: रक़म court तय करेगा!","Twist: Delhi Traffic Police ki list mein iska fixed jurmana nahi, 'court challan' hai: rakam court tay karega!"),
("n05",N,"और licence points? अभी सिर्फ़ Ministry का प्रस्ताव। पर दो हज़ार छब्बीस के नए नियम से, साल में पाँच या ज़्यादा offences पर licence पर action हो सकता है।","Aur licence points? Abhi sirf Ministry ka prastaav. Par 2026 ke naye niyam se, saal mein 5 ya zyada offences par licence par action ho sakta hai."),
("n06",N,"Game में बस एक button, असली में जुर्माना, जेल, या दोनों!","Game mein bas ek button, asli mein jurmana, jail, ya dono!"),
("h1o",N,"GTA में red light तोड़ना आम लगता है। पर भारत की असली सड़क पर?","GTA mein red light todna aam lagta hai. Par Bharat ki asli sadak par?"),
("h1e",N,"Points system आना चाहिए? हाँ या ना, कमेंट करो!","Points system aana chahiye? Haan ya na, comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
