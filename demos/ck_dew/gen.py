#!/usr/bin/env python3
"""Writes ck_lines.json, caps.js and script.md from one table, so the three versions of every line stay in step."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = "Os (dew) raat ke match ka khel kyun badal deti hai?"; EN = "Why dew changes night matches"
ROWS = [
 ("टॉस जीता, और पहले बॉलिंग! रात के मैच में ऐसा क्यों? जवाब है, ओस।",
  "Toss jeeta, aur pehle bowling! Raat ke match mein aisa kyun? Jawab hai: os.",
  "Win the toss, bowl first. Why, in night matches? The answer: dew."),
 ("रात को घास ठंडी होती है, और हवा की नमी उस पर बूंदें बनकर बैठ जाती है।",
  "Raat ko ghaas thandi hoti hai, aur hawa ki nami us par boondein bankar baith jaati hai.",
  "At night the grass cools, and water vapour in the air condenses on it as droplets."),
 ("गेंद घास को छूते ही गीली। डेल स्टेन कहते हैं: यह गीले साबुन से बॉलिंग जैसा है!",
  "Gend ghaas ko chhoote hi geeli. Dale Steyn kehte hain: yeh geele sabun se bowling jaisa hai!",
  "The ball gets wet as soon as it touches the grass. Dale Steyn: like bowling with a wet bar of soap."),
 ("स्पिनर की पकड़ कमज़ोर, और गेंद पिच से फिसलकर सीधी बल्ले पर आती है।",
  "Spinner ki pakad kamzor, aur gend pitch se phisal kar seedhi balle par aati hai.",
  "Spinners struggle to grip it, and the ball skids off the pitch on to the bat."),
 ("ओस रात के साथ बढ़ती है। बाद में बॉलिंग करना और मुश्किल। इसीलिए कप्तान अक्सर चेज़ चुनते हैं।",
  "Os raat ke saath badhti hai. Baad mein bowling karna aur mushkil. Isiliye captain aksar chase chunte hain.",
  "Dew gets heavier as the night goes on, so bowling second is harder. That is why captains often choose to chase."),
 ("मिसाल? दो हज़ार इक्कीस टी ट्वेंटी वर्ल्ड कप। दुबई के तेरह में से बारह मैच, चेज़ करने वाली टीम जीती। फ़ाइनल भी!",
  "Misaal? 2021 T20 World Cup. Dubai ke 13 mein se 12 match chase karne wali team jeeti. Final bhi!",
  "An example, the 2021 T20 World Cup: the chasing side won 12 of the 13 matches in Dubai, the final included."),
 ("दो हज़ार पच्चीस में आई पी एल में नया रूल आया: दूसरी पारी में, दस ओवर के बाद, गेंद एक बार बदलवाई जा सकती है।",
  "2025 mein IPL mein naya rule aaya: doosri paari mein, 10 over ke baad, gend ek baar badalwayi ja sakti hai.",
  "IPL 2025: the team bowling second may ask for one ball change after the 10th over, to counter dew."),
 ("आप टॉस जीतकर क्या चुनेंगे? अगली कहानी, संगकारा के चार शतक। फ़ॉलो कीजिए!",
  "Aap toss jeet kar kya chunenge? Agli kahani: Sangakkara ke chaar shatak. Follow kijiye!",
  "What would you choose after winning the toss? Next: Sangakkara's four hundreds. Follow!"),
]
json.dump({"hi_dew": {"voice": "hi-IN-MadhurNeural", "rate": "+6%", "pitch": "+0Hz", "lines": [r[0] for r in ROWS]}}, open(f'{HERE}/ck_lines.json', 'w'), ensure_ascii=False, indent=1)
js = lambda a: "[\n" + ",\n".join(" " + json.dumps(x, ensure_ascii=False) for x in a) + "\n];\n"
open(f'{HERE}/caps.js', 'w').write("/* Why dew changes night matches — captions (Roman Hindi/Urdu + English), one per shot. Generated from the fact-checked script (gen.py). */\nconst CAP_R = " + js([r[1] for r in ROWS]) + "const CAP_E = " + js([r[2] for r in ROWS]))
md = f"# Cricket Kahani — {TITLE}\n\nEnglish title: {EN}\n\nSeries: Cricket Science · Short · voice hi-IN-MadhurNeural +6% (edge-tts) · vertical 1080x1920 · target 30–60 s · calendar date 2026-11-26\n"
for i, r in enumerate(ROWS): md += f"\n## s{i}\n\n{r[0]}\n\n*{r[1]}*\n\nEN: {r[2]}\n"
open(f'{HERE}/script.md', 'w').write(md); L = [len(r[0]) for r in ROWS]; print(L, sum(L), 'est s:', round(sum(L[:-1]) * 0.082 + L[-1] * 0.105 + 4.2, 1))
