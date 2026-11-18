# Awazzzz GTA blitz #20 — GTA V ne kitni copies bechi - India ki aabadi se tulna (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"नौ नवंबर को Take-Two के CEO ने बताया: GTA V अब तक दुनिया भर में क़रीब साढ़े तेईस करोड़ यूनिट्स बिक चुका है।","9 November ko Take-Two ke CEO ne bataya: GTA V ab tak duniya bhar mein kareeb 23.5 crore units bik chuka hai."),
("n02",N,"और भारत की आबादी? UN के अनुमान से, दो हज़ार पच्चीस में क़रीब एक सौ छियालीस करोड़।","Aur Bharat ki aabadi? UN ke anumaan se, 2025 mein kareeb 146 crore."),
("n03",N,"मतलब ये सारी कॉपियाँ भारत में बाँट दो, तो हर छह-सात लोगों पर एक कॉपी!","Matlab ye saari copies Bharat mein baant do, toh har 6-7 logon par ek copy!"),
("n04",N,"ट्विस्ट: अगर हर कॉपी एक इंसान होती, तो ये GTA देश आबादी में दुनिया का सातवाँ सबसे बड़ा देश होता, ब्राज़ील से भी बड़ा!","Twist: agar har copy ek insaan hoti, toh ye GTA desh aabadi mein duniya ka saatvaan sabse bada desh hota, Brazil se bhi bada!"),
("n05",N,"और ये कमाल एक ही गेम का है, जो दो हज़ार तेरह में आया था। तेरह साल बाद भी बिक रहा है!","Aur ye kamaal ek hi game ka hai, jo 2013 mein aaya tha. 13 saal baad bhi bik raha hai!"),
("h1o",N,"GTA V की कॉपियाँ गिनो, तो एक पूरा देश बन जाए!","GTA V ki copies gino, toh ek poora desh ban jaaye!"),
("h1e",N,"क्या GTA 6 ये रिकॉर्ड तोड़ पाएगा? कमेंट करो!","Kya GTA 6 ye record tod paayega? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
