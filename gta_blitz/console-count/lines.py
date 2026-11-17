# Awazzzz GTA blitz #10 — Kitne Indians ke paas PS5/Xbox? Console reality check (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"निको पार्टनर्स के मुताबिक़, दो हज़ार पच्चीस में भारत में इक्यावन करोड़ से ज़्यादा गेमर्स थे।","Niko Partners ke mutabik, 2025 mein Bharat mein 51 crore se zyada gamers the."),
("n02",N,"लेकिन इनमें से लगभग पंचानवे प्रतिशत, फ़ोन पर खेलते हैं।","Lekin inmein se lagbhag 95% phone par khelte hain."),
("n03",N,"और GTA सिक्स? उन्नीस नवंबर को सिर्फ़ PS फ़ाइव और Xbox सीरीज़ X और S पर। ना फ़ोन, ना PC।","Aur GTA 6? 19 November ko sirf PS5 aur Xbox Series X|S par. Na phone, na PC."),
("n04",N,"ट्विस्ट: इंडिया गेमिंग रिपोर्ट दो हज़ार पच्चीस के हिसाब से, कंसोल गेमर्स? सिर्फ़ लगभग दो करोड़। यानी उस रिपोर्ट के उनसठ करोड़ गेमर्स में से, सिर्फ़ लगभग साढ़े तीन प्रतिशत!","Twist: India Gaming Report 2025 ke hisaab se, console gamers? Sirf lagbhag 2 crore. Yaani us report ke 59 crore gamers mein se, sirf lagbhag saadhe teen percent!"),
("n05",N,"मतलब, भारत के ज़्यादातर गेमर्स जिस डिवाइस पर खेलते हैं, यानी फ़ोन, उस पर GTA सिक्स है ही नहीं।","Matlab, Bharat ke zyaadatar gamers jis device par khelte hain, yaani phone, us par GTA 6 hai hi nahi."),
("h1o",N,"भारत में पचास करोड़ से ज़्यादा गेमर्स। लेकिन GTA सिक्स कितने खेल पाएंगे?","Bharat mein 50 crore se zyada gamers. Lekin GTA 6 kitne khel paayenge?"),
("h1e",N,"आप GTA सिक्स किस पर खेलोगे: PS फ़ाइव, Xbox, या PC का इंतज़ार? कमेंट करो!","Aap GTA 6 kis par kheloge: PS5, Xbox, ya PC ka intezaar? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
