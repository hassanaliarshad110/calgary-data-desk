#!/usr/bin/env python3
"""Writes ck_lines.json, caps.js and script.md from one table, so the three versions of every line stay in step."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = "Netherlands ne South Africa ko World Cup se bahar kar diya"; EN = "The Netherlands knock out South Africa (2022)"
ROWS = [
 ("साउथ अफ़्रीका वर्ल्ड कप से बाहर! और बाहर किया नीदरलैंड्स ने!",
  "South Africa World Cup se bahar! Aur bahar kiya Netherlands ne!",
  "South Africa, out of the World Cup. Knocked out by the Netherlands."),
 ("छह नवंबर दो हज़ार बाईस, एडिलेड। सेमीफ़ाइनल के लिए साउथ अफ़्रीका को बस जीत चाहिए थी।",
  "6 November 2022, Adelaide. Semi-final ke liye South Africa ko bas jeet chahiye thi.",
  "6 November 2022, Adelaide, T20 World Cup. South Africa only had to win this match to reach the semi-finals."),
 ("नीदरलैंड्स ने एक सौ अट्ठावन रन बनाए। कॉलिन एकरमैन, छब्बीस गेंदों में नाबाद इकतालीस!",
  "Netherlands ne 158 run banaye. Colin Ackermann, 26 gendon mein naabaad 41!",
  "Put in to bat, the Netherlands made 158 for 4. Colin Ackermann: 41 not out off 26 balls."),
 ("साउथ अफ़्रीका एक सौ बारह पर चार। मिलर ने गेंद हवा में उछाली, वैन डर मर्व पीछे दौड़े, और कमाल का कैच!",
  "South Africa 112 par 4. Miller ne gend hawa mein uchhali, van der Merwe peeche daude, aur kamaal ka catch!",
  "Chasing 159, South Africa were 112 for 4. David Miller top-edged a pull; Roelof van der Merwe ran back and held a stunning catch."),
 ("और वैन डर मर्व? वो पहले साउथ अफ़्रीका के लिए ही टी ट्वेंटी वर्ल्ड कप खेल चुके थे!",
  "Aur van der Merwe? Woh pehle South Africa ke liye hi T20 World Cup khel chuke the!",
  "And van der Merwe? Born in Johannesburg, he had played for South Africa at the 2009 and 2010 T20 World Cups."),
 ("ब्रैंडन ग्लोवर, नौ रन देकर तीन विकेट। नीदरलैंड्स तेरह रन से जीत गया!",
  "Brandon Glover, 9 run dekar 3 wicket. Netherlands 13 run se jeet gaya!",
  "Brandon Glover took 3 for 9. South Africa finished on 145 for 8, and the Netherlands won by 13 runs."),
 ("साउथ अफ़्रीका बाहर, इंडिया सेमीफ़ाइनल में। और पाकिस्तान बांग्लादेश को हराकर सेमीफ़ाइनल, फिर फ़ाइनल तक पहुँचा!",
  "South Africa bahar, India semi-final mein. Aur Pakistan Bangladesh ko harakar semi-final, phir final tak pahuncha!",
  "South Africa were out and India were through. Pakistan beat Bangladesh the same day to reach the semi-finals, and went on to the final."),
 ("मैच किसने पलटा: एकरमैन के छक्के, या वैन डर मर्व का कैच? अगली कहानी, ब्रैथवेट के चार छक्के। फ़ॉलो कीजिए!",
  "Match kisne palta: Ackermann ke chhakke, ya van der Merwe ka catch? Agli kahani: Brathwaite ke 4 chhakke. Follow kijiye!",
  "What turned the match: Ackermann's sixes or van der Merwe's catch? Next: Carlos Brathwaite's four sixes. Follow for more."),
]
json.dump({"hi_nedsb": {"voice": "hi-IN-MadhurNeural", "rate": "+10%", "pitch": "+0Hz", "lines": [r[0] for r in ROWS]}}, open(f'{HERE}/ck_lines.json', 'w'), ensure_ascii=False, indent=1)
js = lambda a: "[\n" + ",\n".join(" " + json.dumps(x, ensure_ascii=False) for x in a) + "\n];\n"
open(f'{HERE}/caps.js', 'w').write("/* The Netherlands knock out South Africa (2022) — captions (Roman Hindi/Urdu + English), one per shot. Generated from the fact-checked script (gen.py). */\nconst CAP_R = " + js([r[1] for r in ROWS]) + "const CAP_E = " + js([r[2] for r in ROWS]))
md = f"# Cricket Kahani — {TITLE}\n\nSeries: Underdog · Short · voice hi-IN-MadhurNeural +10% (edge-tts; the channel's usual +6% ran 61.3 s, +10% keeps this Short under 60 s) · vertical 1080x1920 · target 30–60 s · calendar date 2026-11-28\n"
for i, r in enumerate(ROWS): md += f"\n## s{i}\n\n{r[0]}\n\n*{r[1]}*\n\nEN: {r[2]}\n"
open(f'{HERE}/script.md', 'w').write(md); print(sum(len(r[0]) for r in ROWS), [len(r[0]) for r in ROWS])
