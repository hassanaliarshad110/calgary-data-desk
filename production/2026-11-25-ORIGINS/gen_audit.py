"""Write the auditor's input: narration, part cuts, on-screen text, captions/titles/thumbnails, claims table. No research notes.
   python3 gen_audit.py OUT.md"""
import sys, re, importlib
sys.path.insert(0, '/home/claude/work')
import episode as E, claims as CL, posts as P
cap = lambda t: re.sub(r'calgary insight dot c a', 'calgaryinsight.ca', t, flags=re.I)
TXT_KEYS = ['hook', 'chip', 'lower', 'sub', 'big', 'bigLabel', 'q', 'name', 'role', 'sub2', 'title', 'quote', 'marquee']
def onscreen(v):
    out = []
    for k in TXT_KEYS:
        if v.get(k): out.append(f"{k}: “{v[k]}”")
    if v.get('items'): out.append('numbers: ' + '; '.join(f"“{a}” / “{b}”" for a, b in v['items']))
    if v.get('events'): out.append('timeline ' + f"{v['from_']}–{v['to']}: " + '; '.join(f"{e[0]} “{e[1]}”" for e in v['events']))
    if v.get('kind') == 'bars':
        if v.get('taxes'): out.append('chart: two schematic lines labelled “LAND SALES” and “TAX COLLECTIONS” falling (no values, labelled schematic)')
        else:
            yrs = ['1910 “$5.6M”', '1911 “$12.9M”', '1912 “$20.4M”'][:v.get('show', 3)]
            out.append('bar chart (value of building permits, from zero): ' + ', '.join(yrs) + (' + stamp “RECORD”' if v.get('record') else '') + (' + 1913 arrow “LESS THAN HALF” (no 1913 value shown)' if v.get('fall') else ''))
    if v.get('kind') == 'price': out.append(f"price tag “${v['a']}” ({v['ya']}, “{v['la']}”) flips to “${v['b']}” ({v['yb']}, “{v['lb']}”)")
    if v.get('kind') == 'citymap':
        if v.get('comms'): out.append('map highlights community outlines (City of Calgary community boundaries, today): ' + ', '.join(x.title() for x in v['comms']))
        if v.get('limits'): out.append('map: rectangle labelled “1910 LIMITS (APPROX.)” on today\'s roads: McKnight Blvd (north), 59 Ave S (south), 37 St W (west), Barlow Trail (east)' + ('; west edge labelled “37 ST W”' if v.get('west') else ''))
        if v.get('ring'): out.append('map: ring 8 km around the old downtown (post office area) labelled “ABOUT 8 KM”; pin “CENTRAL POST OFFICE (APPROX.)”')
        out.append('map credit: “Map data © OpenStreetMap contributors · City of Calgary Open Data”')
    if v.get('kind') == 'offices': out.append('pins: ' + ', '.join(v['cities']))
    if v.get('kind') == 'arrivals': out.append('arrows labelled: ' + ', '.join(v['origins']) + ' → “' + v.get('hub', 'WESTERN CANADA') + '”')
    if v.get('kind') == 'oil': out.append('derrick with gas plume (illustration)')
    if v.get('kind') == 'queue': out.append('a line of 1950s silhouettes beside a sign “CITY LOTS”')
    if v.get('kind') == 'ledger': out.append('ledger page: column headings “UNPAID TAXES” → “ASSETS”' + ('; newspaper strip “TAX ARREARS · 1919” with a highlighted row “LAKE VIEW HEIGHTS”' if v.get('arrears') else ''))
    if v.get('kind') == 'town' and v.get('brokers'): out.append('window sign “REAL ESTATE” painted over with “OIL SHARES”')
    if v.get('kind') == 'town' and v.get('forsale'): out.append('“FOR SALE” signs')
    if v.get('kind') == 'hook' and v.get('bg') == 'office': out.append('windows lettered “REAL ESTATE” go dark; “CLOSED” signs')
    if v.get('kind') == 'hook' and v.get('stake'): out.append('survey stake with tag “SOLD”')
    if v.get('kind') == 'land' and v.get('golf'): out.append('golf flag (illustration)')
    if v.get('chip') == 'INTERPRETATION': out.append('(chip marks this scene as interpretation)')
    if v.get('src'): out.append(f"source line: “{v['src']}”")
    return '; '.join(out) or '(picture only, no text)'

out = []
out.append(f"# Audit input · Calgary Origins Ep 3 · {E.TITLE}\n")
out.append("Format: ~9-10 min widescreen film (four chapters) + four vertical reels “PART n OF 4” (60-75 s each, cut from the same approved lines). Narration is read by a synthetic voice; numbers are written in words as spoken. Captions = narration word for word, except the spoken site name “calgary insight dot c a” is shown as “calgaryinsight.ca”. Silhouettes are labelled “Silhouette for illustration”; illustrations are stylised motion graphics, not photos.\n")
out.append("## 1. Narration (film), one line = one scene\n\n| id | ch | narration (spoken = caption) | claims | on-screen text and graphics |\n|---|---|---|---|---|")
for i, l in enumerate(E.L):
    out.append(f"| L{i} | {l['ch']} | {l['text']} | {', '.join(l['claims']) or 'none (transition / question)'} | {onscreen(l['v'])} |")
out.append(f"| END | film | {E.END_FILM} | none (CTA) | end card: “💬 Comment below” · SUBSCRIBE button with bell · “Follow @calgaryinsight” · “More at calgaryinsight.ca” |")
out.append("\nOn screen in every scene after 3 s: logo header “Calgary Insight ORIGINS”; chapter chip “PART n OF 4 · <chapter title>” at each chapter start (film). Chapter titles: " + '; '.join(f"{k}: “{v}”" for k, v in E.CH_TITLES.items()) + ". Mid-film pop-up: “🔔 Follow @calgaryinsight for more Calgary stories”. Chapter card (L2) shows “CALGARY ORIGINS · EPISODE 3” / “Boom and bust”.\n")
out.append("## 2. The four reels (each is a cut of these approved lines, in this order)\n")
for n in range(1, 5):
    ids = E.PART_LINES[n] + ['P'] + [E.PART_Q[n]]
    out.append(f"- **Part {n}**: " + ' → '.join(f"L{i}" if i != 'P' else f"“{E.END_PART[n]}”" for i in ids) + f". Chip “PART {n} OF 4” top-left; last frame: the question + “Drop your thoughts below 👇” + “calgaryinsight.ca” + “▶ Full film on YouTube”. No end card (under 2:00).")
out.append("\n## 3. Post text (captions, titles, first comments, thumbnails)\n")
out.append(f"- YouTube film title: “{P.YT_TITLE}”; tags: {', '.join(P.TAGS)}\n- YouTube film description (plus chapter timestamps “0:00 A City in a Hurry” etc.):\n```\n{P.FILM_CAPTION}\n```")
for n, p in P.PARTS.items():
    out.append(f"- Part {n} title (YouTube Short): “{p['title']}”\n- Part {n} caption:\n```\n{p['hook']}\n{p['body']}\n{p['q']}\n\n▶ Full film: https://youtu.be/<id>   (Facebook: “▶ Full film on our YouTube channel: Calgary Insight”, link moved to the first comment)\n🌐 More Calgary stories, studies and analysis: calgaryinsight.ca\n\n{P.HASHTAGS}\n```\n  first comment: “{P.first_comment(n, 'facebook')}”")
out.append("- Thumbnails (text only + picture): film 1280×720 “" + P.THUMB_TEXT['film'] + "” over a survey stake on empty prairie with a 1912 sandstone street behind; parts 1080×1920: " + '; '.join(f"Part {n} “{P.THUMB_TEXT[n]}” (same picture as that part's opening frame)" for n in range(1, 5)) + "; each with the Calgary Insight ORIGINS logo and a chip “PART n OF 4 · CALGARY ORIGINS” (film: “CALGARY ORIGINS · BOOM AND BUST”).\n")
out.append("## 4. Claims table\n\n| # | claim as worded in the script | exact figure, unit, period, boundary | label | source URL | where in the source |\n|---|---|---|---|---|---|")
for k, (cl, fig, lab, url, where) in CL.C.items():
    out.append(f"| {k} | {cl} | {fig} | {lab} | {url} | {where} |")
open(sys.argv[1], 'w').write('\n'.join(out) + '\n')
print(sys.argv[1], len(out))
