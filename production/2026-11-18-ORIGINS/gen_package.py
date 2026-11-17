import json, sys, re
sys.path.insert(0, '/home/claude/work')
import episode as E
from claims import C

DATE = '2026-11-18'
SLOT = 'ORIGINS'
UTM = lambda net: f'https://calgaryinsight.ca/visit/stampede/?utm_source={net}&utm_medium=social&utm_campaign=origins-ranch-era'
TIMINGS = None
try:
    TIMINGS = json.load(open('/home/claude/work/timing.json'))
except Exception:
    pass

def onscreen(v):
    out = []
    for k in ('hook', 'q'):
        if v.get(k): out.append(f'“{v[k].upper() if k == "hook" else v[k]}”')
    if v.get('big') and isinstance(v.get('big'), str): out.append(f"{v['big']} {v.get('bigLabel', '')}".strip())
    for a, b in v.get('items', []): out.append(f'{a} {b}')
    if v.get('chapter'): out.append(f"CALGARY ORIGINS · EPISODE 2 · THE RANCH ERA · PART {v['chapter']} OF 4: {E.CH_TITLES[v['chapter']].upper()}")
    if v.get('name'): out.append(f"{v['name']} / {v.get('role', '')}" + (f" / {v['sub2']}" if v.get('sub2') else ''))
    if v.get('kind') == 'brand': out.append(f"brand {'Bar U (U with a bar)' if v['brand'] == 'BARU' else v['brand']} · {v.get('label', '')} · {v.get('sub', '')}")
    if v.get('quote'): out.append(f"doc card “{v['title']}”: highlighted “{v['quote']}” · source {v['src']}")
    if v.get('events'): out.append('timeline ' + ', '.join(f'{(e[2] if len(e) > 2 else e[0])} {e[1]}' for e in v['events']))
    if v.get('names'): out.append(' · '.join(v['names']))
    if v.get('ports'): out.append('ports: ' + ', '.join(v['ports']) + ' · scale: LIVE CATTLE > WHEAT (until ~1900)')
    if v.get('lower'): out.append(f"lower third “{v['lower']}”" + (f" / “{v['sub']}”" if v.get('sub') else ''))
    elif v.get('sub') and v.get('kind') == 'question': out.append(v['sub'])
    if v.get('chip'): out.append(f"chip {v['chip']}")
    if v.get('pins'): out.append('map pins: ' + ', '.join(v['pins']) + ' (schematic regional map, north up)')
    if v.get('src') and not v.get('quote'): out.append(f"source line: {v['src']}")
    return '; '.join(out)

TECH = {'hook': 'cinematic cold open + kinetic hook (Storyteller) + number slam (Explainer)', 'city': '3D drone over real Calgary geography (Storyteller)',
        'chapter': 'chapter card over moving landscape (Storyteller)', 'land': '2.5D parallax landscape, weather, herd motion (Storyteller)',
        'timeline': 'timeline scrub (Storyteller/Civic)', 'doc': 'document card, exact words highlighted (Civic Analyst)', 'map': 'schematic regional map dive, pins, herd routes (Explainer/Civic)',
        'stats': 'counter slam to the audited value (Data Explainer)', 'name': 'silhouette lower-third, no likeness (Storyteller)', 'brand': 'branding-iron stamp (Explainer)',
        'question': 'closing question frame', 'export': 'route map + balance comparison (Explainer)', 'bigfour': 'four silhouettes + guarantee stamp (Explainer)'}
PURPOSE = {'hook': 'grab: the twist of the chapter', 'city': 'WHERE in today\'s Calgary', 'chapter': 'orient: series and part', 'land': 'WHAT it looked like / what happened on the land',
           'timeline': 'WHEN', 'doc': 'the exact wording of the source', 'map': 'WHERE the ranches, routes and towns were', 'stats': 'HOW MUCH', 'name': 'WHO',
           'brand': 'WHAT the ranch was called and why', 'question': 'invite a one-word answer', 'export': 'WHERE the cattle went and why it mattered', 'bigfour': 'WHO paid and HOW MUCH'}

def chapters_text():
    if TIMINGS and TIMINGS.get('chapters'):
        return '\n'.join(f"{c['t']} Part {c['n']} · {c['title']}" for c in TIMINGS['chapters'])
    return '0:00 Part 1 · Grass for a Penny\n2:2x Part 2 · Two Hard Winters\n4:4x Part 3 · The Beef King\n7:0x Part 4 · The End of the Open Range\n(exact times set from the measured narration before posting)'
def caption_of(t): return re.sub(r'calgary insight dot c a', 'calgaryinsight.ca', t, flags=re.I)

POSTS = {
 'yt_title': "Grass for a Penny: How Ranching Built Calgary | Calgary Origins",
 'yt_desc': ("How did a police fort on the Bow become a cattle town?\n"
             "Ottawa rented out prairie grass for almost nothing, Montreal money built giant ranches, brutal winters drove the first big ranch south, and a meat-packing millionaire and his friends backed the first Stampede.\n"
             "Is Calgary still a cattle town at heart? Yes or no? Drop your thoughts below 👇\n\n"
             "🔔 Follow @calgaryinsight for more Calgary stories\n"
             "More Calgary stories, studies and analysis: calgaryinsight.ca\n\n"
             "{chapters}\n\n#Calgary #yyc #CalgaryHistory #Ranching #Alberta"),
 'parts': {
  1: ("Calgary's cattle boom took off with grass rented for almost nothing.\n"
      "Part 1 of 4: the buffalo vanished, Ottawa opened the range to giant leases, and Montreal money rode west.\n"
      "Would you have bet on cattle here? Yes or no? Drop your thoughts below 👇"),
  2: ("Alberta's first big ranch was battered by its first hard winters.\n"
      "Part 2 of 4: a cattle drive from Montana, heavy losses on the Cochrane Ranche, and the rise of the Bar U.\n"
      "Cochrane or the Bar U: which ranch would you have ridden for? Drop your thoughts below 👇"),
  3: ("Calgary's first millionaire built his fortune on beef.\n"
      "Part 3 of 4: the railway arrives, cattle ship to Britain, and Pat Burns becomes the beef king of the West.\n"
      "Did you know this? Yes or no? Drop your thoughts below 👇"),
  4: ("The winter the chinook never came.\n"
      "Part 4 of 4: homesteaders move in, a hard winter ends the era of the big ranches, and a group of ranchers back the first Stampede.\n"
      "Is Calgary still a cattle town at heart? Yes or no? Drop your thoughts below 👇"),
 },
 'hashtags': '#Calgary #yyc #CalgaryHistory #Ranching',
 'first_comment': '🔗 The Stampede those ranchers backed, today: {url}',
}

def build():
    lines = E.L
    o = []
    A = o.append
    A(f"# ORIGINS {DATE} · Calgary Origins, Episode 2 · {E.TITLE}\n")
    A("Slot ORIGINS (weekly documentary) · skills: calgary-origins-documentary + calgary-motion-director (lead identity **Storyteller**, borrowing Data Explainer counter slams and branding stamps, Civic Analyst document cards and timelines) · formats: 1920×1080 film (four chapters) + four 1080×1920 reels “PART n OF 4”.")
    A("Calendar topic: “Ep 2: The Ranch Era: how cattle leases and ranchers turned Calgary into Cowtown (1880s-1900s)”. Kept, with one change: no authoritative source found in this run explains the origin of the nickname “Cowtown”, so the film never claims it; it says “cattle town” (The Canadian Encyclopedia’s framing) and asks whether Calgary is still a cattle town at heart.")
    A("No repeat: log.json and the already-posted list have no ranching story. The Nov 8-9 overview mentioned the first Stampede in one line; this episode’s angle (grazing leases, the Cochrane and Bar U ranches, Pat Burns, the end of the open range and who paid for the 1912 Stampede) is new. Fish Creek (Nov 16 PM) is mentioned only as the location of the Bow Valley Ranch.\n")
    A("## 1. Title and hooks\n**" + E.TITLE + "** (YouTube: “" + POSTS['yt_title'] + "”)\n")
    A("Chapter hooks (each part opens on a moving visual hook; first word on screen at frame 0):")
    for ch in range(1, 5):
        h = [l for l in lines if l['ch'] == ch][0]
        A(f"- Part {ch} “{E.CH_TITLES[ch]}”: spoken “{h['text']}” · on screen “{h['v']['hook'].upper()}” · visual: {h['ai']}")
    A("\nAlternatives considered: “Calgary’s first millionaire was a meat packer.” / “The Sundance Kid broke horses southwest of Calgary.” / “Live cattle once mattered more to Canada than wheat.”\n")
    A("## 2. Narration script (Canadian English, numbers in words; one line = one scene)\n")
    A("| id | part | line | caption (as burned in) | claims |\n|---|---|---|---|---|")
    for i, l in enumerate(lines):
        A(f"| L{i} | {l['ch']} | {l['text']} | {'same' if caption_of(l['text']) == l['text'] else caption_of(l['text'])} | {', '.join(l['claims']) or 'none (transition/question)'} |")
    A(f"| E-film | film end | {E.END_FILM} | {caption_of(E.END_FILM)} | none (CTA) |")
    for n in range(1, 4):
        A(f"| E{n} | reel {n} end card | {E.END_PART[n]} | {caption_of(E.END_PART[n])} | none (CTA) |")
    A("| E4 | reel 4 end card | same as E-film | same | none (CTA) |")
    A("\nEach part opens with its hook line and closes with its one-word viewer question (L of the chapter’s last line). The film keeps all four questions (one per chapter) and ends with the full CTA and the end card (Comment below · Follow + Subscribe · More at calgaryinsight.ca, held ≥ 3 s). Each reel ends with its own end card E1-E4 (comment prompt, “Part n+1 is next”, follow, calgaryinsight.ca). Mid-video Follow pill on every file.\n")
    A("## 3. Research and evidence\nAll facts come from pages opened in this run (Parks Canada / W. Naftel’s *The Cochrane Ranch*, the Canadian Register of Historic Places, the Dictionary of Canadian Biography, The Canadian Encyclopedia, Glenbow, the Calgary Stampede’s SAM Centre, the Western Stock Growers’ Association, City of Calgary, Heritage Calgary, Alberta RETROactive). Conflicts kept out of the narration: Calgary Brewing and Malting founded 1892 (TCE, Parks Canada, City) vs 1891 (RETROactive) → 1892; Ranchmen’s Club 1891 (City, Lougheed House, club) vs 1892 (Heritage Calgary brochure) → 1891; Burns’s 1928 sale ($15 million reported vs $9.6 million paid, DCB) → not used; buffalo 1879/1880 (Glenbow) vs 1884 (volunteer blog) → Glenbow; Cochrane lease size (109,000 / 100,000 / >200,000 acres in different sources) → no lease size narrated for Cochrane; Lane’s herd (16,000-18,000 head on all properties vs 3,000-4,000 breeding cows) → not used; Parks plaque says “the hard winter of 1906”, TCE says 1906-07 → narration says “the winter of nineteen oh six to oh seven” (TCE) and quotes the plaque only for “marked the end of the era of the big ranches”. Not used (unverified): the origin of the nickname “Cowtown”, Pat Burns’s arrival year, a first cattle shipment to Britain.\n")
    A("## Production bible\n### A. Visual direction (lead: Storyteller)")
    A("```\nIdentity:        Storyteller lead; borrowed: Data Explainer counter slams + branding-iron stamps (how much / what it was called), Civic Analyst document cards + timelines (exact wording / when)\nFormats:         1920x1080 30 fps film (4 chapters + end card); 4 x 1080x1920 30 fps reels, native vertical layout (key content y 300-1420, clear of right 120 px)\nRuntime:         from measured narration: lead 0.3 s, 0.7 s gaps (0.9 s before reveals, 1.2 s after each chapter question)\nLook:            painted 2.5D foothills (Rockies always WEST = left of frame on maps, behind the foothills in landscapes); prairie palette: grass #c9a65a / #8a7a3e, sky by time of day, snow #eef3f8; house navy #0b1f3a, gold #f2b632; grain .055, vignette .55\nType:            Fira Sans 800 hooks (vertical >=120 px, wide 110 px), names >=110 px vertical / 96 px wide, chips >=48 px vertical, quotes >=72 px vertical; dark backing under all text over pictures\nCamera language: slow eased drifts and pushes (3-6 s), crane-downs into valleys, map dives; parallax on every landscape; one whip only between distant places\nCut rhythm:      fast first 6 s of each chapter (picture changes at hook, number, chip), then 3-8 s per line\nTransition set:  dissolve (time passes), match (map pin to place), flash (shock numbers: losses), whip (between distant places) -- max these four\nVisual hook:     every chapter/part opens already moving: grass rushing under a low dawn camera with the 1-cent coin spinning in (P1), blizzard streaking past (P2), dusk drone over the Elbow (P3), frozen range under a chinook arch that never opens (P4); hook word 1 on screen at frame 0\nMotifs:          the gold line of a cattle trail on the map; the branding iron (Bar U, A7); the chinook arch (open = hope, shut = loss)\n```")
    A("\n**Continuity bible**\n\n| Element | Fixed description | Source |\n|---|---|---|\n| Geography | Rockies to the west; foothills between; Calgary at the Bow-Elbow confluence; Cochrane west-northwest of Calgary on Big Hill Creek; Morley further west on the Bow; Bar U southwest near Pekisko Creek, west of High River; Nanton and Fort Macleod south; Fort Benton, Montana far south-east across the border | claims C3-C16, C30, C35; regional map schematic, north up, labelled “schematic” |\n| Today’s Calgary (3D) | real OpenStreetMap / City of Calgary geography from the geo pack, credited on screen | geo pack |\n| Time of day/season | Part 1 dawn→dusk summer; Part 2 autumn→night blizzard; Part 3 day/dusk town; Part 4 winter→night city | creative |\n| People | silhouettes only, no faces or likenesses of real people; named people are shown by name cards | rule |\n| Animals | cattle as dark silhouettes; bison only in Part 1’s ‘what disappeared’ beat | creative |\n| Brands | Bar U = a U with a bar above; A7 = letters A7 | C15, C30 |\n")
    A("### B. Beat list per chapter and storyboard (one card per narration line)\n")
    for ch in range(1, 5):
        A(f"#### Part {ch}: {E.CH_TITLES[ch]}\n| beat | narration (exact) | purpose | technique | on-screen text / figures | transition out |\n|---|---|---|---|---|---|")
        for i, l in enumerate(lines):
            if l['ch'] != ch: continue
            v = l['v']; tr = v.get('trans') or ('flash' if v.get('blizzard') else 'dissolve')
            A(f"| L{i} | {l['text']} | {PURPOSE[v['kind']]} | {TECH[v['kind']]} | {onscreen(v)} | {tr} |")
        A("")
    A("Camera/composition per scene type: **land** = layered parallax (sky, far Rockies, foothills, mid grass, near grass) drifting 2-4 % per scene, herd/horses/sheep animated along the ground plane, weather particles; **map** = schematic regional map (real town coordinates, north up, rivers and border drawn, ‘Schematic map’ label) with a slow eased zoom toward the focus pin, routes drawing on with moving herd dots; **city** = engine 3D drone/crane over the real geo pack (credit line); **stats/doc/timeline/brand/name/question** = over a dimmed moving landscape plate, never a flat card. Vertical: same scenes re-laid out natively (map fills y 300-1300, text above, caption band 1240-1420).\n")
    A("### C. AI video prompts (one per scene; optional paid version, NOT run) and image prompts\n")
    for i, l in enumerate(lines):
        A(f"- L{i}: {l['ai']} Continuity: stylised documentary illustration, warm grade, no faces, Rockies west. Negative: no modern objects in historic scenes, no text, no logos.")
    A("- Image prompts: (1) thumbnail plate: low dawn view over golden prairie grass toward the Rockies, a single spinning copper one-cent coin in the foreground, cattle silhouettes on the horizon, cinematic, 16:9 and 9:16; (2) Part 2 plate: blizzard on open range, dark cattle silhouettes; (3) Part 3 plate: dusk over the Elbow River with a frontier slaughterhouse silhouette; (4) Part 4 plate: grey chinook-arch sky over a frozen range with a fence line.\n")
    A("### D. Sound design\n- VO: af_heart, studio-probe lane v2 (sentence pacing, lexicon, listen-back). About 2.5 words/s; 0.9 s pause before the loss numbers and the Stampede reveal; 1.2 s after each chapter question.\n- Music: `story` bed (minor pad, low pulse) under the whole film, ducked under the voice; `suspense` texture implied by wind beds in the winter beats.\n- Effects (cues.json, generated from the scene file): wind bed under every landscape, impact on each hook word and counter slam, ticks while counters roll, stamp on branding irons, documents and chips, whoosh on whips, pop + ping on map pins, swell into each chapter reveal, crowd murmur under the fair and Stampede, city bed under the 3D Calgary shots.\n- Transition sounds: whip = whoosh; flash = boom; dissolve/match = none.\n")
    A("### E. Editing timeline (EDL)\n")
    if TIMINGS:
        A("| # | in | out | dur | scene | transition in | caption | key sound |\n|---|---|---|---|---|---|---|---|")
        for r in TIMINGS['film']:
            A(f"| {r['i']} | {r['in']} | {r['out']} | {r['dur']} | {r['scene']} | {r['trans']} | {r['cap']} | {r['sfx']} |")
    else:
        A("Built from the measured narration after APPROVED (scene i = line i; in/out = line start to next line start; see production/2026-11-18-ORIGINS/cues.json). Subtitle rules: burned-in from the narration, site name shown as calgaryinsight.ca; vertical caption band y 1240-1420, never in the right-hand 120 px; wide captions bottom centre; on-screen numbers in digits exactly as in the claims table; source line bottom-left on every data and document scene; logo header from 3 s, not on the closing/end frames; ‘PART n OF 4’ chip top-left on reels.")
    A("\n### F. Figure-to-claim map (every on-screen figure, label and map)\n| on-screen | claim |\n|---|---|")
    for i, l in enumerate(lines):
        os_ = onscreen(l['v'])
        if re.search(r'\d', os_) or l['v'].get('quote') or l['v'].get('names') or l['v'].get('name'):
            A(f"| L{i}: {os_} | {', '.join(l['claims']) or 'none'} |")
    A("| all map scenes: town positions (schematic) | geography; ‘Schematic map’ label; 3D Calgary scenes credited ‘Map data © OpenStreetMap contributors · City of Calgary Open Data’ |")
    A("\n### G. QC table\nFilled in after the stills check and the final render (see ‘QC gate’ below).\n")
    A("## 4. Post texts (short, no figures; section 7b layout added by the link-up task)\n")
    A("**YouTube film** (type video, public, not made for kids, EDUCATION) title: “" + POSTS['yt_title'] + "”\n```\n" + POSTS['yt_desc'].replace('{chapters}', chapters_text()) + "\n```")
    for n in range(1, 5):
        A(f"**Part {n} of 4** (Instagram Reel, Facebook Reel, YouTube Short) caption_without_link:\n```\n{POSTS['parts'][n]}\n```")
    A("Then (link-up task): `▶ Full film: https://youtu.be/<id>` (Facebook: `▶ Full film on our YouTube channel: Calgary Insight`, link in the first comment) · `🌐 More Calgary stories, studies and analysis: calgaryinsight.ca` · `🔔 Follow @calgaryinsight for more Calgary stories` · hashtags `" + POSTS['hashtags'] + "`.")
    A("First comment (Facebook, Instagram): `" + POSTS['first_comment'].format(url=UTM('<facebook|instagram>')) + "`. Link target: https://calgaryinsight.ca/visit/stampede/ (the Stampede visitor guide; the closing beat is the Stampede the ranchers backed).\n")
    A("## 5. Thumbnails\n- Film 1280×720: dawn prairie plate, copper one-cent coin large on the right third, hook “GRASS FOR A PENNY” (Fira Sans 900, ≥96 px, gold on PENNY), small chip “CALGARY ORIGINS”, logo small top-left. No other text.\n- Parts 1080×1920 (text and key visual inside the centre 1080×1350): each part’s opening frame design: P1 “GRASS FOR A PENNY” + coin; P2 “TWO WINTERS. THOUSANDS LOST.” + blizzard herd; P3 “CALGARY’S FIRST MILLIONAIRE?” + dusk Elbow; P4 “NO CHINOOK.” + frozen range under a shut chinook arch; each with a gold “PART n OF 4” chip.\n")
    A("## Claims table (PLAYBOOK 3b)\n| # | claim as worded in the script | exact figure, unit, period, boundary | label | source URL | where in the source |\n|---|---|---|---|---|---|")
    for k, (cl, fig, lab, url, where) in C.items():
        A(f"| {k} | {cl} | {fig or '—'} | {lab} | {url} | {where} |")
    il = [i for i, l in enumerate(lines) if 'INTERPRETATION' == l['v'].get('chip')]
    A("\nInterpretation lines (chip ‘INTERPRETATION’ on screen): " + '; '.join(f"L{i} (“{lines[i]['text']}”)" for i in il) + ".\n")
    return '\n'.join(o)

if __name__ == '__main__':
    open(sys.argv[1], 'w').write(build())
    print('ok')
