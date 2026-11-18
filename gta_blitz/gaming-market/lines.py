# Awazzzz GTA blitz #23 — Indian gaming market kitna bada? (FICCI-EY numbers) (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"FICCI-EY की दो हज़ार छब्बीस वाली report कहती है: दो हज़ार पच्चीस में भारत में क़रीब बावन करोड़ gamers थे!","FICCI-EY ki 2026 wali report kehti hai: 2025 mein Bharat mein kareeb 52 crore gamers the!"),
("n02",N,"मतलब हर तीन भारतीयों में से एक से ज़्यादा! और दस करोड़ से ज़्यादा लोग रोज़ खेलते हैं।","Matlab har teen Bharatiyon mein se ek se zyada! Aur 10 crore se zyada log roz khelte hain."),
("n03",N,"पर ट्विस्ट: उसी साल online gaming की कमाई सत्रह percent गिर गई!","Par twist: usi saal online gaming ki kamaai 17% gir gayi!"),
("n04",N,"वजह? पैसे वाले games पर ban. उनकी कमाई छब्बीस percent घटी।","Wajah? Paise wale games par ban. Unki kamaai 26% ghati."),
("n05",N,"लेकिन video games में, in-app ख़रीदारी पंद्रह percent बढ़ी!","Lekin video games mein, in-app khareedari 15% badhi!"),
("n06",N,"Video games और esports की कमाई मिलाकर, दो हज़ार पच्चीस में छह हज़ार तीन सौ करोड़ रुपये थी। और दो हज़ार अट्ठाईस तक, नौ हज़ार दो सौ करोड़ का अनुमान!","Video games aur esports ki kamaai milakar, 2025 mein 6,300 crore rupaye thi. Aur 2028 tak 9,200 crore ka anumaan!"),
("n07",N,"यानी पैसे वाले games गिरे, और video games बढ़ रहे हैं!","Yaani paise wale games gire, aur video games badh rahe hain!"),
("h1o",N,"भारत में कितने लोग games खेलते हैं? अंदाज़ा लगाओ!","Bharat mein kitne log games khelte hain? Andaaza lagao!"),
("h1e",N,"तुम कौन से gamer हो: रोज़ वाले या कभी-कभी वाले? कमेंट करो!","Tum kaun se gamer ho: roz wale ya kabhi-kabhi wale? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
