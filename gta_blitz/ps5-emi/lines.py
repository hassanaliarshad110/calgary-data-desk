# Awazzzz GTA blitz #2 — PS5 + GTA 6 ka total bill: EMI pe kitne mahine? (FACT)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"PS फ़ाइव स्लिम डिजिटल, चौंसठ हज़ार नौ सौ नब्बे रुपये। ऊपर से GTA सिक्स, पाँच हज़ार नौ सौ निन्यानवे।","PS5 Slim Digital ₹64,990. Upar se GTA 6: ₹5,999."),
("n02",N,"कुल बिल, सत्तर हज़ार नौ सौ नवासी रुपये!","Kul bill: ₹70,989!"),
("n03",N,"बारह महीनों में बाँटो, तो क़रीब पाँच हज़ार नौ सौ सोलह रुपये महीना।","12 mahinon mein baanto: kareeb ₹5,916 mahina."),
("n04",N,"चौबीस महीनों में, क़रीब दो हज़ार नौ सौ अट्ठावन रुपये महीना।","24 mahinon mein: kareeb ₹2,958 mahina."),
("n05",N,"पर ट्विस्ट सुनो! चौबीस महीने की EMI में, गेम नवंबर दो हज़ार छब्बीस में आएगा, और आख़िरी क़िस्त, क़रीब नवंबर दो हज़ार अट्ठाईस में!","Par twist suno! 24 mahine ki EMI: game Nov 2026 mein, aakhri kist kareeb Nov 2028 mein!"),
("n06",N,"और ये सिर्फ़ सीधा भाग है। असली EMI में ब्याज और चार्जेज़ जुड़ सकते हैं, इसलिए पहले पूरा हिसाब पढ़िए!","Aur ye sirf seedha bhaag hai. Asli EMI mein byaaj aur charges jud sakte hain, isliye pehle poora hisaab padhiye!"),
("h1o",N,"PS फ़ाइव और GTA सिक्स EMI पर लिया, तो कितने महीने भरोगे?","PS5 + GTA 6 EMI par liya, to kitne mahine bharoge?"),
("h1e",N,"आप EMI लोगे, या पैसे जोड़कर कैश में? कमेंट में बताइए!","Aap EMI loge ya paise jodkar cash mein? Comment mein bataaiye!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
