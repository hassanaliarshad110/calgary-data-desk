# Awazzzz GTA blitz #16 — Raji: An Ancient Epic, Mahabharat-Ramayan se inspired Indian game (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"राजी: ऐन एन्शिएंट एपिक। पुणे के नॉडिंग हेड्स स्टूडियो का गेम, महाभारत-रामायण से इंस्पायर्ड।","Raji: An Ancient Epic. Pune ke Nodding Heads studio ka game, Mahabharat-Ramayan se inspired."),
("n02",N,"एक लड़की, राजी, राक्षसों से इंसानों को बचाती है, और अपने भाई गोलू को ढूँढती है।","Ek ladki, Raji, raakshason se insaanon ko bachaati hai, aur apne bhai Golu ko dhoondhti hai."),
("n03",N,"ट्विस्ट: किकस्टार्टर फ़ेल! फ़ाउंडर्स ने सेविंग्स से टीम को सैलरी दी, और को-फ़ाउंडर श्रुति घोष ने अपना फ़्लैट बेच दिया।","Twist: Kickstarter fail! Founders ne savings se team ko salary di, aur co-founder Shruti Ghosh ne apna flat bech diya."),
("n04",N,"फिर अनरियल डेव ग्रांट मिला। टीम? सिर्फ़ तेरह लोग, पाँच देशों से।","Phir Unreal Dev Grant mila. Team? Sirf 13 log, paanch deshon se."),
("n05",N,"दो हज़ार बीस में स्विच, फिर PC, PS4 और Xbox पर लॉन्च। और द गेम अवॉर्ड्स में, बेस्ट डेब्यू इंडी गेम का नॉमिनेशन!","2020 mein Switch, phir PC, PS4 aur Xbox par launch. Aur The Game Awards mein, Best Debut Indie Game ka nomination!"),
("h1o",N,"GTA 6 के शोर में एक देसी गेम, जिसके लिए को-फ़ाउंडर ने अपना फ़्लैट बेच दिया!","GTA 6 ke shor mein ek desi game, jiske liye co-founder ne apna flat bech diya!"),
("h1e",N,"आप GTA 6 के साथ कोई इंडियन गेम खेलोगे? कौन सा? कमेंट करो!","Aap GTA 6 ke saath koi Indian game kheloge? Kaun sa? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
