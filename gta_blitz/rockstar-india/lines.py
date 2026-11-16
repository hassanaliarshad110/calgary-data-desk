# Awazzzz GTA blitz #4 — Bengaluru mein Rockstar: Indian engineers GTA mein kya banate hain? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"GTA फ़ाइव के लॉस सैंटोस की गाड़ियाँ और सामान बनाने में, बेंगलुरु की एक टीम का हाथ था।","GTA V ke Los Santos ki gaadiyan aur saamaan banane mein Bengaluru ki ek team ka haath tha."),
("n02",N,"नाम था Technicolor Games। चेहरे का एनिमेशन और मोशन कैप्चर की सफ़ाई भी इन्होंने की।","Naam tha Technicolor Games. Chehre ka animation aur motion capture ki safaai bhi inhone ki."),
("n03",N,"अब ट्विस्ट! दो हज़ार सोलह के आसपास, Rockstar ने बेंगलुरु में अपना स्टूडियो खोला: Rockstar India!","Ab twist! 2016 ke aaspaas Rockstar ne Bengaluru mein apna studio khola: Rockstar India!"),
("n04",N,"ये स्टूडियो Red Dead Redemption टू की डेवलपमेंट टीम का हिस्सा बना।","Ye studio Red Dead Redemption 2 ki development team ka hissa bana."),
("n05",N,"मई दो हज़ार उन्नीस में इसमें मिला Dhruva Interactive, भारत का सबसे पुराना गेम डेवलपर। टीम, क़रीब आठ सौ लोग!","May 2019 mein ismein mila Dhruva Interactive, Bharat ka sabse purana game developer. Team: kareeb 800 log!"),
("n06",N,"आज इसकी एक जॉब पोस्ट कहती है: यहाँ की टीम मोशन कैप्चर से किरदारों की हरकतें बनाती है, सारे Rockstar गेम्स के लिए।","Aaj iski ek job post kehti hai: yahan ki team motion capture se kirdaron ki harkatein banati hai, saare Rockstar games ke liye."),
("h1o",N,"GTA फ़ाइव की गाड़ियों के पीछे, बेंगलुरु का हाथ?","GTA V ki gaadiyon ke peeche Bengaluru ka haath?"),
("h1e",N,"क्या आप Rockstar India में काम करना चाहोगे? कमेंट में बताइए!","Kya aap Rockstar India mein kaam karna chahoge? Comment mein bataaiye!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
