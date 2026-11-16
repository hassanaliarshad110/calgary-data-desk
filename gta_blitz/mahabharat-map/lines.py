# Awazzzz GTA blitz #3 — Agar Mahabharat ek open-world game hota? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n01",N,"ये सिर्फ़ कल्पना है, एक फ़ैन थ्योरी! पर मैप असली महाकाव्य से।","Ye sirf kalpana hai, ek fan theory! Par map asli mahakavya se."),
("n02",N,"पहला रीजन: हस्तिनापुर। वो सिंहासन, जिसके लिए कुरुक्षेत्र का युद्ध हुआ।","Pehla region: Hastinapur. Woh singhasan, jiske liye Kurukshetra ka yuddh hua."),
("n03",N,"दूसरा रीजन: इंद्रप्रस्थ, पांडवों का बसाया राज्य। अक्सर दिल्ली के पुराने क़िले से जोड़ा जाता है, पर पक्का नहीं।","Doosra region: Indraprastha, Pandavon ka basaaya rajya. Aksar Dilli ke Purana Qila se joda jaata hai, par pakka nahi."),
("n04",N,"और साइड मिशन? द्रौपदी के स्वयंवर वाला निशाना! अर्जुन ने घूमती मछली की आँख भेदी थी।","Aur side mission? Draupadi ke swayamvar wala nishaana! Arjun ne ghoomti machhli ki aankh bhedi thi."),
("n05",N,"पर ट्विस्ट सुनो! इस गेम में नंबर अठारह हर जगह है। युद्ध अठारह दिन चला, और सेनाएँ थीं, अठारह अक्षौहिणी!","Par twist suno! Is game mein number 18 har jagah hai. Yuddh 18 din chala, aur senaayein thi 18 akshauhini!"),
("n06",N,"और साइज़? क़रीब एक लाख श्लोक, अब तक का सबसे लंबा महाकाव्य! यानी ये गेम, कभी ख़त्म ही न हो!","Aur size? Kareeb 1 lakh shlok: ab tak ka sabse lamba mahakavya! Yaani ye game kabhi khatm hi na ho!"),
("h1o",N,"सोचो अगर, महाभारत एक ओपन-वर्ल्ड गेम होता!","Socho agar Mahabharat ek open-world game hota!"),
("h1e",N,"आप पहले कौन सा रीजन खेलोगे: हस्तिनापुर या इंद्रप्रस्थ? कमेंट करो!","Aap pehle kaun sa region kheloge: Hastinapur ya Indraprastha? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
