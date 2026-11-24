"""Write the episode package (packages/2026-11-25-ORIGINS-boom-and-bust.md): script, reel cuts, production bible, posts, claims, audit status."""
import sys, re, json
sys.path.insert(0, '/home/claude/work')
import episode as E, claims as CL, posts as P
from gen_audit import onscreen
cap = lambda t: re.sub(r'calgary insight dot c a', 'calgaryinsight.ca', t, flags=re.I)
est = lambda t: round(len(t.split()) / 2.45 + .3 * len(re.findall(r'[.?!:] ', t)), 1)
TECH = {'hook': 'visual hook (moving push-in + kinetic hook text, frame-0 word)', 'price': 'counter / price-tag flip (how much, what changed)', 'chapter': 'chapter card over painted 1912 street (Storyteller)',
        'land': '2.5D painted parallax landscape (where/when)', 'stats': 'counter slam (Data Explainer)', 'doc': 'document card with highlight sweep (Civic Analyst)', 'arrivals': 'schematic flow arcs (where from)',
        'town': '2.5D boom-town street: buildings rise / go dark (what changed)', 'bars': 'bar chart from zero (how much)', 'timeline': 'timeline scrub (when)', 'city': '3D drone over today\'s Calgary (OSM geometry)',
        'question': 'closing question frame', 'plat': 'survey grid drawing itself / SOLD stamps (how it worked)', 'citymap': 'real Calgary map: community outlines, rivers, roads (where)', 'name': 'silhouette name card',
        'offices': 'schematic map + arc (where)', 'world': 'schematic money-flow arc thinning (why)', 'oil': 'illustrated derrick + gas plume (what happened)', 'ledger': 'ledger / newspaper illustration (how it worked)', 'queue': 'tracking shot along a 1953 line of buyers'}
o = []
o.append(f"# ORIGINS 2026-11-25 · Calgary Origins, Episode 3 · {E.TITLE}\n")
o.append("Slot ORIGINS (weekly documentary) · skills: calgary-origins-documentary + calgary-motion-director (lead **Storyteller**; borrows Data Explainer counters/bars and Civic Analyst document cards, ledgers and maps) · formats: 1920×1080 film (four chapters, ~9.5 min) + four 1080×1920 reels “PART n OF 4” (60-75 s, twist-first cuts of each chapter's strongest beat, section 8).")
o.append("Calendar topic: “Ep 3: Boom and Bust: the 1912 land rush that drew Calgary's map, and the 1913 crash”. Kept. No repeat: the Nov 23 and Nov 24 flagships (annexation, original boundary) skipped 1912 for this episode; the Nov 19 streetcar film mentioned only that the boom ended in 1913 and Hextall's Bowness bridge/park deal (here: only his 1911 plans and the empty land). Library selection run (animation-studio `select_assets.py`): reused the City community geodata (calgary_base.json), the documentary music bed style (`story`), SFX set; 3D downtown from the motion engine's OSM layer.\n")
o.append("**STATUS: BLOCKED BY AUDIT (3 rounds, not approved).** Nothing narrated, rendered or posted. The two round-3 blocking items are fixed below and a ready round-4 input is saved (`production/2026-11-25-ORIGINS/audit_input_r4_ready.md`); it needs Hassan's go-ahead for a fourth audit round.\n")
o.append("## 1. Title, hooks, chapters\n")
o.append(f"**{E.TITLE}** · YouTube: “{P.YT_TITLE}”\n")
for n in range(1, 5):
    i = E.PART_LINES[n][0]; l = E.L[i]
    o.append(f"- Part {n} “{E.CH_TITLES[n]}”: spoken “{l['text']}” · on screen “{l['v'].get('hook')}” · visual: {l['ai']}")
o.append("\n## 2. Narration (one line = one scene; numbers in words; captions = narration, site name shown as calgaryinsight.ca)\n\n| id | part | line | est. s | claims |\n|---|---|---|---|---|")
for i, l in enumerate(E.L): o.append(f"| L{i} | {l['ch']} | {l['text']} | {est(l['text'])} | {', '.join(l['claims']) or '—'} |")
o.append(f"| END | film | {E.END_FILM} | {est(E.END_FILM)} | CTA |")
tot = .3 + sum(est(l['text']) + (l['gap'] or .85) for l in E.L) + est(E.END_FILM) + 4.2
o.append(f"\nEstimated film length {tot/60:.1f} min (measured Kokoro durations replace these after approval).\n")
o.append("## 3. Reel cuts (60-75 s, twist first, no end card)\n")
for n in range(1, 5):
    ids = E.PART_LINES[n]; d = .3 + sum(est(E.L[i]['text']) + .85 for i in ids) + est(E.END_PART[n]) + .7 + est(E.L[E.PART_Q[n]]['text']) + 1.6
    o.append(f"- Part {n}: " + ' → '.join(f'L{i}' for i in ids) + f" → “{E.END_PART[n]}” → L{E.PART_Q[n]} (closing question, held 1.6 s with “Drop your thoughts below 👇”, calgaryinsight.ca and “▶ Full film on YouTube”) · est. {d:.0f} s")
o.append("\n## 4. Production bible\n### 4.1 Visual direction and continuity bible\n- Lead identity Storyteller: painted 2.5D parallax (1901 village, cash-crop farms, 1912 sandstone street with derricks and a streetcar, storm-dark 1913 street, Turner Valley derrick, 1953 line of buyers), slow push-ins, warm dawn/dusk grade, grain and vignette (engine finish).\n- Borrowed: Data Explainer counter slams and bars from zero (permits 1910-1912, population, oil companies); Civic Analyst document cards (Chastko, Foran, MacLeod, Heritage Calgary ad), ledger, schematic money flow, real community maps.\n- Palette: navy #0b1f3a, gold #f2b632, cream #f3ead7, sandstone #c9a66b/#b88d55, brick #8a4a32, alert red #e0523f, ORIGINS orange #F7931E. Type: Fira Sans 600-900; vertical hook ≥ 136 px, lower-thirds 110 px, chips ≥ 48 px, quotes 72 px, closing question 110 px.\n- Continuity: the same 1912 street (seeded) is used for every boom-era beat and turns storm-dark from the crash on; the survey stake with a red SOLD tag is the episode's motif (hook, price flip, thumbnails); maps are north-up with an N arrow, real geometry (OpenStreetMap + City of Calgary community outlines, today's), the 1910 limits drawn as an approximate rectangle on today's roads and labelled so; schematic graphics are labelled SCHEMATIC; silhouettes and illustrations are labelled.\n- Series brand: “Calgary Insight ORIGINS” header from 3 s (never in the first 3 s); PART n OF 4 chip on reels.")
o.append("\n### 4.2 Beat list per chapter (technique per beat)\n")
for n in range(1, 5):
    o.append(f"**Chapter {n}: {E.CH_TITLES[n]}** (≈2:20-2:30; opens on its moving hook, builds to its reveal)")
    for i, l in enumerate(E.L):
        if l['ch'] == n: o.append(f"- L{i} · {TECH.get(l['v']['kind'], l['v']['kind'])}")
    o.append("")
o.append("### 4.3 Storyboard cards (scene = line)\n\n| scene | visual (engine build) | purpose / technique | on-screen text | AI video prompt (path B, not run) |\n|---|---|---|---|---|")
for i, l in enumerate(E.L):
    o.append(f"| S{i:02d} | {l['v']['kind']} | {TECH.get(l['v']['kind'], '')} | {onscreen(l['v'])} | {l['ai']} |")
o.append("| END | end card | CTA | 💬 Comment below · SUBSCRIBE + bell · Follow @calgaryinsight · More at calgaryinsight.ca | Navy card, gold ridge line drifting; subscribe button tapped. 4 s. |")
o.append("\n### 4.4 Image prompts (keyframes / thumbnails; not run)\n- Film thumbnail 1280×720: “Dawn prairie field, a weathered survey stake with a red SOLD tag in the foreground, distant Rockies; painted, warm side light; large white headline space top-left.” Text: “" + P.THUMB_TEXT['film'] + "”.\n" + '\n'.join(f"- Part {n} 1080×1920: same art as that part's opening frame; text “{P.THUMB_TEXT[n]}” in the top third (inside the centre 1080×1350)." for n in range(1, 5)) + "\n- Keyframe plates: 1912 sandstone street with derricks; 1913 night street with REAL ESTATE windows going dark; Turner Valley derrick with gas plume; 1953 line of buyers at a CITY LOTS office.")
o.append("\n### 4.5 Sound design\n- VO: af_heart on the studio-probe lane; 0.85 s between lines, 1.2 s after each chapter question; hook at 1.05 speed, closing line 0.97 (lane v2).\n- Music: synthesised `story` bed (slow minor pad, low pulse) under the voice, ducked; voice on top; mix to about -14 LUFS (`sfx.py mix`).\n- Effects cue sheet (generated per scene in scene.js → cues.json): impact on every hook; stamp on SOLD stamps and RECORD; click × 3 as office windows go dark; riser under growing bars; boom when the 1913 arrow drops and on the gas strike; rain under storm scenes; crowd murmur on street and queue scenes; city bed on 3D scenes; ping/pop on map pins; shutter + click on document cards; whoosh on whips and the price flip; swell under each question and the end card.\n- Transitions: dissolve (default), whip into counters, zoom into maps, match between map views, flash into the crash, push into documents.")
o.append("\n### 4.6 Editing timeline (EDL)\nGenerated from the measured narration after approval (`timing.json`): one scene per line, in/out from durs.json with the gaps above. Not produced, because the audit blocked narration.\n")
o.append("### 4.7 Figure-to-claim map\n")
figs = []
for i, l in enumerate(E.L):
    v = l['v']; vals = []
    for k in ('hook', 'chip', 'big', 'sub', 'lower', 'quote'):
        if v.get(k) and re.search(r'\d', str(v[k])): vals.append(str(v[k]))
    for a, b in v.get('items', []): vals.append(f"{a} {b}")
    for e in v.get('events', []): vals.append(f"{e[0]} {e[1]}")
    if v.get('kind') == 'bars' and not v.get('taxes'): vals.append('$5.6M / $12.9M / $20.4M bars' + (' + LESS THAN HALF' if v.get('fall') else ''))
    if v.get('kind') == 'price': vals.append('$500 1912 → $400 1955')
    if vals: figs.append(f"- L{i}: " + '; '.join(vals) + f" → {', '.join(l['claims']) or 'C29'}")
o += figs
o.append("\n### 4.8 QC\nNot run: the fact audit blocked narration and rendering (playbook 3b). Development stills were checked for layout only (no narration, nothing published).\n")
o.append("## 5. Posts (audited wording; captions with no numbers except “Part n of 4”)\n")
o.append(f"- YouTube film ({P.YT_TITLE}); tags {', '.join(P.TAGS)}; description:\n```\n{P.FILM_CAPTION}\n```")
for n, p in P.PARTS.items():
    o.append(f"- Part {n} — YouTube Short title “{p['title']}”\n```\n{p['hook']}\n{p['body']}\n{p['q']}\n\n▶ Full film: https://youtu.be/<id>\n🌐 More Calgary stories, studies and analysis: calgaryinsight.ca\n\n{P.HASHTAGS}\n```\n  first comment: {P.first_comment(n, '<platform>')}")
o.append(f"- Link planned: {P.LINK} (communities index); to be checked (200) before posting — not checked in this run because the audit blocked posting.\n")
o.append("## 6. Claims table\n\n| # | claim as worded | figure / unit / period / boundary | label | source URL | where in source |\n|---|---|---|---|---|---|")
for k, (cl, fig, lab, url, where) in CL.C.items(): o.append(f"| {k} | {cl} | {fig} | {lab} | {url} | {where} |")
o.append("\n## 7. Audit\nSee `audits/2026-11-25-ORIGINS.md`. Round 1: 5 fails + 18 flags; round 2: 3 fails + 9 flags; round 3: all 57 claims PASS, 2 blocking flags (B1 on-screen arrow label, B2 L57 causal wording + Part 4 title) → NOT APPROVED → blocked-by-audit. Both fixed in this package (L8 arrow label “THE PRAIRIES”; L57 “To see why so much of the boom's map sat empty for so long, go back to the crash.”; Part 4 title “Calgarians Lined Up for Days for City Lots in 1953 | …”).")
open(sys.argv[1], 'w').write('\n'.join(o) + '\n'); print(sys.argv[1], len(o))
