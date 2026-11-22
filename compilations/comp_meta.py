"""Write the YouTube title/description/tags for a danger-first compilation from <out>.chapters.json.
Usage: python3 comp_meta.py <chapters.json> <out.json>"""
import sys, json
ch = json.load(open(sys.argv[1]))
EP = {1: ('Mano Billi Ko Bachao', '-70Gg8PqdOM', 'Ped par khud mat chadhna, badon ko bulao'),
      2: ('Barish Mein Pilla', 'eZijPMb29N0', 'Barish ke paani mein mat khelo, badon ko bulao'),
      3: ('Patang Aur Kabootar', 'ZuUMi_oLv3A', 'Manjha parindon ko zakhmi karta hai, saada dhaaga use karo'),
      4: ('Ice Cream Wala Thela', 'ZDBCuH5FKfk', 'Sadak par mat khelo, dhalaan par khadi gaadi se door raho'),
      5: ('Bandar Ne Chashma Churaya', 'TVRY95uRGb8', 'Janwaron ko tang mat karo, unse pyaar karo'),
      6: ('Mele Mein Gum', 'g5bEc_L5Zhc', 'Mele mein Mama Baba ka haath pakad ke rakho, apna naam-pata yaad rakho'),
      7: ('Injection Se Dar', 'NZQsXHh-H6k', 'Doctor se daro mat, doctor hamare dost hote hain'),
      8: ('Gaay Aur Traffic Jam', 'Oh4d887IBqk', 'Sadak par sabr karo, aur janwaron se door raho'),
      9: ('Garmi Mein Parinde', 'n1GPwRwROEk', 'Garmi mein chhat par parindon ke liye paani rakho')}
def ts(s): s = int(s); return f'{s // 60}:{s % 60:02d}'
n = len(ch['chapters'])
d = ["Mama ko nahi pata… Qasim hi hai SUUU-SUUU-MAN! 🤫🦸‍♂️",
     "Bandar Mama bijli ke khambe par, gaay ne poora shehar rok diya, Mano billi ped par, chidiya garmi mein gir gayi… Susuman sabko bachata hai! " + str(n) + " episodes ek saath, " + ts(ch['duration']).replace(':', ' min ') + " sec — TV par poori family ke saath dekhein. 📺",
     "", "⏱️ Chapters"]
d += [f"{ts(c['start'])} {c['chapter']} (Ep {c['ep']})" for c in ch['chapters']]
d += ["", "▶️ Har episode alag se dekhein:"]
d += [f"Ep {e} – {EP[e][0]}: https://www.youtube.com/watch?v={EP[e][1]}" for e in sorted(c['ep'] for c in ch['chapters'])]
d += ["", "📚 Seekh: " + " • ".join(EP[c['ep']][2] for c in ch['chapters']) + " 🙏", "",
      "👪 Characters: Qasim (Susuman), Mama, Baba, Sakina Baaji, Dadi, Dada Abu, Basim, Zahra Miss, Latifa Baaji, Officer Gill, Dharmender, Ammar, Kulfi Chacha, Bunty, Guddu, Pari, Bandar Mama, Lali gaay + Chhotu, Mano billi, Moti pilla, Kabootar, Chidiya",
      "🔔 LIKE aur SUBSCRIBE karo: https://www.youtube.com/channel/UCcRe0XnHPTeqmZeCMGOW0VQ?sub_confirmation=1", "",
      "Susuman | सुसुमैन | سوسومین — Hindi Urdu cartoon for kids", "",
      "#susuman #hindicartoon #urducartoon"]
title = "बंदर, गाय, बिल्ली… सबको बचाया! Susuman Saare Episodes | Hindi Urdu Cartoon for Kids"
tags = ["susuman", "susuman all episodes", "susuman saare episodes", "susuman cartoon", "suusuu man", "susuman compilation", "सुसुमैन",
        "hindi cartoon", "urdu cartoon", "اردو کارٹون", "kids cartoon", "cartoon compilation", "desi cartoon", "superhero cartoon",
        "bandar wala cartoon", "gaay wala cartoon", "billi wala cartoon", "moral story for kids"]
out = {'title': title, 'description': '\n'.join(d), 'tags': tags}
assert len(title) <= 100 and len(out['description']) < 5000
json.dump(out, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False); print(len(title), len(out['description'])); print(out['description'])
