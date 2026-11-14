N='N'
L=[
("s01",N,"अमेरिका में सिर्फ़ तीन दिन, और पाँच बड़े झटके!","America mein sirf 3 din… aur 5 bade jhatke!"),
("s02",N,"एक! एनविडिया के बॉस जेनसन हुआंग का इस्तीफ़ा, जासूसी विवाद के बीच।","Ek! NVIDIA ke boss Jensen Huang ka istifa — jasoosi vivaad ke beech."),
("s03",N,"दो! माइक्रोसॉफ़्ट का आउटलुक और टीम्स, पूरी दुनिया में घंटों ठप।","Do! Microsoft ka Outlook aur Teams — poori duniya mein ghanton thapp."),
("s04",N,"तीन! न्यूयॉर्क के ब्रुकलिन में एक इमारत ढह गई, लोग मलबे में दब गए।","Teen! New York ke Brooklyn mein ek imaarat dhah gayi, log malbe mein dab gaye."),
("s05",N,"चार! न्यू ऑर्लियन्स में एक टैंकर ने क्रूज़ जहाज़ को टक्कर मारी, और जहाज़ पलट गया।","Chaar! New Orleans mein ek tanker ne cruise jahaaz ko takkar maari — aur jahaaz palat gaya."),
("s06",N,"और पाँच! एक कम्युनिकेशन ख़राबी, और पूरे अमेरिका में उड़ानें ज़मीन पर रोक दी गईं।","Aur paanch! Ek communication kharaabi… aur poore America mein udaanein zameen par rok di gayin."),
("s07",N,"तो क्या ये सब जुड़ा है? अब तक नहीं। हर घटना की वजह अलग है, और किसी हमले का संकेत नहीं।","To kya ye sab juda hai? Ab tak — nahi. Har ghatna ki wajah alag hai, aur kisi hamle ka sanket nahi."),
("s08",N,"सबक़? एक सिस्टम, एक गड़बड़ी, और पूरा देश रुक जाता है। आवाज़ को सब्सक्राइब कीजिए!","Sabak? Ek system, ek gadbad… aur poora desh ruk jaata hai. Awazzzz ko SUBSCRIBE kijiye!"),
]
VOICE={'N':dict(name='hi-IN-SwaraNeural',rate='+12%',pitch='+3Hz')}
if __name__=='__main__':
    import json
    json.dump([dict(id=i,text=t,**VOICE[s]) for i,s,t,r in L],open('nv_lines.json','w'),ensure_ascii=False,indent=0)
    print(len(L))
