#!/usr/bin/env python3
"""Writes ck_lines.json, caps.js and script.md from one table, so the three versions of every line stay in step."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = "19 wicket ek Test mein: Jim Laker ka record"; EN = "19 wickets in one Test: Jim Laker"
ROWS = [
 ("एक टीम के बीस विकेट। उनमें से उन्नीस, अकेले एक बॉलर ने लिए!",
  "Ek team ke 20 wicket. Unmein se 19, akele ek bowler ne liye!",
  "A team has 20 wickets in a Test. One bowler took 19 of them."),
 ("जुलाई उन्नीस सौ छप्पन, मैनचेस्टर। इंग्लैंड बनाम ऑस्ट्रेलिया।",
  "July 1956, Manchester. England vs Australia.",
  "26–31 July 1956 · Old Trafford · Ashes, 4th Test"),
 ("इंग्लैंड ने बनाए चार सौ उनसठ। फिर गेंद आई, ऑफ़ स्पिनर जिम लेकर के हाथ में।",
  "England ne banaye 459. Phir gend aayi off-spinner Jim Laker ke haath mein.",
  "England made 459. Then the ball went to off-spinner Jim Laker."),
 ("चाय के बाद, बाईस गेंदों में सात विकेट! ऑस्ट्रेलिया चौरासी पर ऑल आउट। लेकर के नौ।",
  "Chai ke baad, 22 gendon mein 7 wicket! Australia 84 par all out. Laker ke 9.",
  "After tea: 7 for 8 in 22 balls. Australia 84 all out. Laker: 9 for 37."),
 ("फ़ॉलो ऑन। दूसरी पारी में लेकर ने पूरे दस विकेट लिए, टेस्ट क्रिकेट में पहली बार!",
  "Follow-on. Doosri paari mein Laker ne poore 10 wicket liye — Test cricket mein pehli baar!",
  "Following on, Australia made 205. Laker took all 10 for 53: a first in Test cricket."),
 ("मैच में नब्बे रन देकर उन्नीस विकेट। बचा हुआ एक, साथी स्पिनर टोनी लॉक को मिला।",
  "Match mein 90 run dekar 19 wicket. Bacha hua ek, saathi spinner Tony Lock ko mila.",
  "Match figures: 19 for 90. Tony Lock took the other wicket. England won by an innings and 170 runs."),
 ("उसी शाम लेकर एक पब में रुके। टीवी पर उन्हीं की बॉलिंग चल रही थी, और किसी ने पहचाना नहीं!",
  "Usi shaam Laker ek pub mein ruke. TV par unhi ki bowling chal rahi thi, aur kisi ne pehchana nahi!",
  "Driving home that evening he stopped at a pub in Lichfield. His bowling was on TV; nobody recognised him."),
 ("सत्तर साल बाद भी, रिकॉर्ड क़ायम है। क्या यह कभी टूटेगा? अगली कहानी, ओस और रात के मैच। फ़ॉलो कीजिए!",
  "70 saal baad bhi record kayam hai. Kya yeh kabhi tootega? Agli kahani: os aur raat ke match. Follow kijiye!",
  "70 years on, the record still stands. Will it ever be broken? Next: how dew changes night matches."),
]
json.dump({"hi_laker": {"voice": "hi-IN-MadhurNeural", "rate": "+6%", "pitch": "+0Hz", "lines": [r[0] for r in ROWS]}}, open(f'{HERE}/ck_lines.json', 'w'), ensure_ascii=False, indent=1)
js = lambda a: "[\n" + ",\n".join(" " + json.dumps(x, ensure_ascii=False) for x in a) + "\n];\n"
open(f'{HERE}/caps.js', 'w').write("/* 19 wickets in one Test: Jim Laker — captions (Roman Hindi/Urdu + English), one per shot. Generated from the fact-checked script (gen.py). */\nconst CAP_R = " + js([r[1] for r in ROWS]) + "const CAP_E = " + js([r[2] for r in ROWS]))
md = f"# Cricket Kahani — {TITLE}\n\nSeries: Record Book · Short · voice hi-IN-MadhurNeural +6% (edge-tts) · vertical 1080x1920 · target 30–60 s · calendar date 2026-11-25\n"
for i, r in enumerate(ROWS): md += f"\n## s{i}\n\n{r[0]}\n\n*{r[1]}*\n\nEN: {r[2]}\n"
open(f'{HERE}/script.md', 'w').write(md); print(sum(len(r[0]) for r in ROWS))
