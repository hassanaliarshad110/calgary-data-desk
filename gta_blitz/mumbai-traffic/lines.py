# Awazzzz GTA blitz #29 — Mumbai ki traffic vs Vice City (Miami) ki traffic: average speed ka sach (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"GTA 6 की Vice City, असली Miami पर based है। तो चलो: Miami vs मुंबई!","GTA 6 ki Vice City, asli Miami par based hai. Toh chalo: Miami vs Mumbai!"),
("n02",N,"TomTom Index, दो हज़ार पच्चीस: मुंबई में दस किलोमीटर, औसतन अट्ठाईस मिनट इक्यावन सेकंड।","TomTom Index 2025: Mumbai mein 10 km, ausatan 28 minute 51 second."),
("n03",N,"Miami में? सिर्फ़ सत्रह मिनट पैंतालीस सेकंड। यानी मुंबई में हर दस किलोमीटर पर ग्यारह मिनट ज़्यादा!","Miami mein? Sirf 17 minute 45 second. Yaani Mumbai mein har 10 km par 11 minute zyada!"),
("n04",N,"ट्विस्ट: Miami, America के top पाँच सबसे congested शहरों में है। फिर भी मुंबई उससे काफ़ी धीमा!","Twist: Miami, America ke top 5 sabse congested shehron mein hai. Phir bhi Mumbai usse kaafi dheema!"),
("n05",N,"Rush hour की औसत speed? मुंबई: सिर्फ़ सत्रह point छह। Miami: सत्ताईस point चार!","Rush hour ki ausat speed? Mumbai: sirf 17.6 km/h. Miami: 27.4 km/h!"),
("n06",N,"और rush hour के traffic में, मुंबई का driver साल में एक सौ छब्बीस घंटे खोता है: पाँच दिन से ज़्यादा!","Aur rush hour ke traffic mein, Mumbai ka driver saal mein 126 ghante khota hai: 5 din se zyada!"),
("n07",N,"तो GTA 6 का traffic? असली boss level तो मुंबई है!","Toh GTA 6 ka traffic? Asli boss level toh Mumbai hai!"),
("h1o",N,"Vice City या मुंबई: traffic में कौन ज़्यादा slow?","Vice City ya Mumbai: traffic mein kaun zyada slow?"),
("h1e",N,"तुम्हारे शहर में दस किलोमीटर कितने मिनट में? कमेंट करो!","Tumhare shehar mein 10 km kitne minute mein? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
