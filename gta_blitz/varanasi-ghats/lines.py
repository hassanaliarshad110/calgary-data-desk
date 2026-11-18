# Awazzzz GTA blitz #24 — Agar GTA Varanasi mein hota - ghats par mission? (FAN-THEORY: kalpana)
# id, speaker, tts_text (Devanagari), roman_caption
N='N'
L = [
("n02",N,"गेम वाला हिस्सा सिर्फ़ कल्पना है! मिशन: सुबह की नाव रेस। कोई गन नहीं, कोई चोरी नहीं!","Game wala hissa sirf kalpana hai! Mission: subah ki naav race. Koi gun nahi, koi chori nahi!"),
("n03",N,"ट्विस्ट! इस लेवल में कार का क्या काम? काशी की पतली गलियों में, मिशन पैदल या नाव से ही होगा!","Twist! Is level mein car ka kya kaam? Kashi ki patli galiyon mein, mission paidal ya naav se hi hoga!"),
("n04",N,"रेस का रूट: अस्सी घाट से आदि केशव घाट तक, चेकपॉइंट सिर्फ़ पानी पर चमकते रिंग्स!","Race ka route: Assi Ghat se Adi Keshav Ghat tak, checkpoint sirf paani par chamakte rings!"),
("n05",N,"अब असली दुनिया: विकिपीडिया के हिसाब से, वाराणसी में चौरासी घाट हैं। ज़्यादातर अठारहवीं सदी में, मराठा संरक्षण में दोबारा बने। और गंगा पर सुबह की नाव की सैर, यात्रियों में बहुत पॉपुलर है।","Ab asli duniya: Wikipedia ke hisaab se, Varanasi mein 84 ghaat hain. Zyaadatar 18vi sadi mein, Maratha sanrakshan mein dobara bane. Aur Ganga par subah ki naav ki sair, yatriyon mein bahut popular hai."),
("n06",N,"रूल: रेस सिर्फ़ बीच धार के खुले पानी में। घाटों के पास रेस रुक जाती है: शांत ज़ोन, सम्मान पहले!","Rule: race sirf beech dhaar ke khule paani mein. Ghaaton ke paas race ruk jaati hai: shaant zone, samman pehle!"),
("h1o",N,"सोचो अगर, GTA का अगला मिशन वाराणसी के घाटों पर होता!","Socho agar, GTA ka agla mission Varanasi ke ghaaton par hota!"),
("h1e",N,"आप कौन सा मिशन खेलते: नाव रेस, पैदल मिशन या लस्सी डिलीवरी? कमेंट करो!","Aap kaunsa mission khelte: naav race, paidal mission ya lassi delivery? Comment karo!"),
]
VOICE = {'N': dict(name='hi-IN-SwaraNeural', rate='+12%', pitch='+3Hz')}
FEMALE = {'hi-IN-SwaraNeural', 'ur-PK-UzmaNeural', 'ur-IN-GulNeural'}
if __name__=='__main__':
    import json
    assert all(v['name'] in FEMALE for v in VOICE.values())
    json.dump([dict(id=i, text=t, **VOICE[s]) for i,s,t,r in L], open('nv_lines.json','w'), ensure_ascii=False, indent=0)
    print(len(L), sum(len(r.split()) for i,s,t,r in L), 'words')
