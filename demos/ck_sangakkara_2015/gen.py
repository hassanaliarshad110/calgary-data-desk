#!/usr/bin/env python3
"""Writes ck_lines.json, caps.js and script.md from one table, so the three versions of every line stay in step."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = "4 match, 4 shatak: Sangakkara 2015"; EN = "Four hundreds in a row: Sangakkara, 2015"
ROWS = [
 ("चार मैच, चार शतक! वनडे क्रिकेट में ऐसा पहले कभी नहीं हुआ था।",
  "4 match, 4 shatak! ODI cricket mein aisa pehle kabhi nahi hua tha.",
  "Four matches, four hundreds. Nobody had done it in ODI cricket before."),
 ("दो हज़ार पंद्रह का वर्ल्ड कप। सैंतीस साल के कुमार संगकारा का आख़िरी वर्ल्ड कप।",
  "2015 ka World Cup. 37 saal ke Kumar Sangakkara ka aakhri World Cup.",
  "The 2015 World Cup. Kumar Sangakkara, 37, had said he would retire from ODIs after it."),
 ("मेलबर्न में बांग्लादेश के ख़िलाफ़ नाबाद एक सौ पाँच। फिर वेलिंग्टन में इंग्लैंड के ख़िलाफ़ नाबाद एक सौ सत्रह।",
  "Melbourne mein Bangladesh ke khilaaf naabaad 105. Phir Wellington mein England ke khilaaf naabaad 117.",
  "105 not out v Bangladesh in Melbourne (26 Feb). Then 117 not out v England in Wellington (1 Mar)."),
 ("सिडनी में ऑस्ट्रेलिया के ख़िलाफ़ एक सौ चार। टीम हार गई, पर संगकारा नहीं रुके।",
  "Sydney mein Australia ke khilaaf 104. Team haar gayi, par Sangakkara nahi ruke.",
  "104 v Australia in Sydney (8 Mar). Sri Lanka lost by 64 runs, but he kept going."),
 ("ग्यारह मार्च, होबार्ट। स्कॉटलैंड के ख़िलाफ़ पंचानवे गेंदों में एक सौ चौबीस!",
  "11 March, Hobart. Scotland ke khilaaf 95 gendon mein 124!",
  "11 March, Hobart: 124 off 95 balls v Scotland."),
 ("लगातार चौथा शतक! वनडे इतिहास में पहली बार।",
  "Lagataar chautha shatak! ODI itihaas mein pehli baar.",
  "A fourth hundred in a row: a first in ODI history."),
 ("उसी दिन विकेटकीपिंग में भी रिकॉर्ड: वर्ल्ड कप में चौवन शिकार, गिलक्रिस्ट से आगे।",
  "Usi din wicketkeeping mein bhi record: World Cup mein 54 shikaar, Gilchrist se aage.",
  "Same day, a wicketkeeping record too: 54 World Cup dismissals, past Adam Gilchrist's 52."),
 ("ग्यारह साल बाद भी मेंस वनडे का यह रिकॉर्ड संगकारा के नाम है। इसे कौन तोड़ेगा? अगली कहानी, नीदरलैंड्स बनाम साउथ अफ़्रीका। फ़ॉलो कीजिए!",
  "11 saal baad bhi men's ODI ka yeh record Sangakkara ke naam hai. Ise kaun todega? Agli kahani: Netherlands vs South Africa. Follow kijiye!",
  "Eleven years on, it is still the men's ODI record (Amy Satterthwaite matched it in women's ODIs). Who will break it? Next: the Netherlands v South Africa."),
]
json.dump({"hi_sanga": {"voice": "hi-IN-MadhurNeural", "rate": "+6%", "pitch": "+0Hz", "lines": [r[0] for r in ROWS]}}, open(f'{HERE}/ck_lines.json', 'w'), ensure_ascii=False, indent=1)
js = lambda a: "[\n" + ",\n".join(" " + json.dumps(x, ensure_ascii=False) for x in a) + "\n];\n"
open(f'{HERE}/caps.js', 'w').write("/* Four hundreds in a row: Sangakkara, 2015 — captions (Roman Hindi/Urdu + English), one per shot. Generated from the fact-checked script (gen.py). */\nconst CAP_R = " + js([r[1] for r in ROWS]) + "const CAP_E = " + js([r[2] for r in ROWS]))
md = f"# Cricket Kahani — {TITLE}\n\nSeries: Legends · Short · voice hi-IN-MadhurNeural +6% (edge-tts) · vertical 1080x1920 · target 30–60 s · calendar date 2026-11-27\n"
for i, r in enumerate(ROWS): md += f"\n## s{i}\n\n{r[0]}\n\n*{r[1]}*\n\nEN: {r[2]}\n"
open(f'{HERE}/script.md', 'w').write(md); print(sum(len(r[0]) for r in ROWS), [len(r[0]) for r in ROWS])
