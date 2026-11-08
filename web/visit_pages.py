"""The six Visit Calgary guides (calgaryinsight.ca/visit/<topic>/), one per tile on the welcome page, written from
visit_content.py with the photos in web/visit/img/ (credits in img/credits.json). Same night-and-chinook look as the
welcome page; plain HTML that search engines read without JavaScript."""
import html, json, os

import visit_content as V

SITE = 'https://calgaryinsight.ca/'
URLS = ['visit/' + p['slug'] + '/' for p in V.PAGES]

CSS = r""":root{--night:#0c1020;--night2:#141a30;--ink:#f4ecdf;--mute:#aab0c4;--line:#2a3250;--chinook:#f2a33a;--glacier:#5cc8c2;
--display:'Big Shoulders Display','Arial Narrow',Impact,sans-serif;--body:'Hanken Grotesk',system-ui,sans-serif;color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;background:var(--night);color:var(--ink);font-family:var(--body);font-size:17px;line-height:1.6}
a{color:var(--chinook)}
:focus-visible{outline:3px solid var(--glacier);outline-offset:3px}
h1,h2,h3{font-family:var(--display);font-weight:900;text-transform:uppercase;letter-spacing:.02em;line-height:.95;margin:0;text-wrap:balance}
img{max-width:100%;display:block}
.pad{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.wrap{max-width:1080px;margin:0 auto}
.hero{position:relative;min-height:min(78vh,720px);display:flex;align-items:flex-end;overflow:hidden}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,15,.55),transparent 30%,transparent 45%,rgba(12,16,32,.96))}
.hero .wrap{position:relative;z-index:1;width:100%;padding-block:0 2.6rem}
.crumb{position:absolute;z-index:2;top:max(14px,env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;text-decoration:none;color:var(--ink);text-shadow:0 1px 6px #000}
.kicker{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--glacier)}
.hero h1{font-size:clamp(3rem,11vw,7.5rem);margin:.5rem 0 0;text-shadow:0 4px 40px rgba(0,0,0,.5)}
.intro{max-width:62ch;margin:2rem 0 0}
.intro p{color:var(--mute);font-size:1.1rem;margin:0 0 1rem}
.glance{display:flex;gap:2rem;overflow-x:auto;padding:1rem 0;border-block:1px solid var(--line);margin:2rem 0 1rem;font-variant-numeric:tabular-nums}
.glance div{flex:0 0 auto}
.glance small{display:block;color:var(--mute);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase}
.glance b{font-family:var(--display);font-size:1.7rem;font-weight:900;line-height:1.15}
nav.topics{position:sticky;top:0;z-index:5;background:rgba(12,16,32,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
nav.topics .wrap{display:flex;gap:1.3rem;overflow-x:auto;padding-block:.75rem;white-space:nowrap;scrollbar-width:none}
nav.topics a{color:var(--mute);text-decoration:none;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase}
nav.topics a[aria-current]{color:var(--chinook)}
.places{display:grid;gap:3.5rem;padding-block:3rem}
.place{display:grid;grid-template-columns:1.15fr 1fr;gap:2rem;align-items:center}
.place:nth-child(even) figure{order:2}
.place.noimg{grid-template-columns:1fr}
.place.noimg .txt{max-width:62ch;border-left:3px solid var(--chinook);padding-left:1.4rem}
.place figure{margin:0;position:relative;border-radius:3px;overflow:hidden;background:var(--night2);aspect-ratio:3/2}
.place figure img{width:100%;height:100%;object-fit:cover}
.place figcaption{position:absolute;right:8px;bottom:6px;font-size:.62rem;color:rgba(244,236,223,.85);text-shadow:0 1px 4px #000;max-width:90%;text-align:right}
.txt{min-width:0}
.num{font-family:var(--display);font-weight:900;color:var(--chinook);font-size:1rem;letter-spacing:.14em}
.place h2{font-size:clamp(2rem,5vw,3rem);margin:.3rem 0 .4rem}
.where{color:var(--glacier);font-size:.85rem;letter-spacing:.06em;margin:0 0 .9rem}
.offers{margin:0}
.offers b{display:block;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--mute);margin-bottom:.25rem;font-weight:500}
.txt ul{margin:1rem 0 0;padding:0;list-style:none;display:grid;gap:.45rem}
.txt li{padding-left:1.2rem;position:relative;color:var(--mute);font-size:.95rem}
.txt li::before{content:"";position:absolute;left:0;top:.62em;width:.5rem;height:2px;background:var(--chinook)}
.links{margin:1rem 0 0;display:flex;flex-wrap:wrap;gap:.6rem}
.links a{display:inline-block;border:1px solid var(--line);padding:.45rem .8rem;border-radius:2px;font-size:.85rem;text-decoration:none}
.links a:hover{border-color:var(--chinook)}
@media(max-width:760px){.place{grid-template-columns:1fr;gap:1rem}.place:nth-child(even) figure{order:0}}
.plan{background:var(--night2);border:1px solid var(--line);border-radius:3px;padding:clamp(1.2rem,4vw,2.2rem);display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.6rem;margin-bottom:3rem}
.plan h2{font-size:2rem;grid-column:1/-1}
.plan h3{font-family:var(--body);text-transform:none;letter-spacing:0;font-size:1rem;font-weight:700;line-height:1.3}
.plan p{margin:.3rem 0 .5rem;color:var(--mute);font-size:.95rem}
.next h2{font-size:clamp(1.8rem,5vw,2.6rem);margin-bottom:1rem}
.next .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.8rem;margin-bottom:3rem}
.next a{position:relative;aspect-ratio:4/5;border-radius:3px;overflow:hidden;display:block;text-decoration:none;color:var(--ink);background:var(--night2)}
.next a img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s}
.next a:hover img{transform:scale(1.04)}
.next a::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 45%,rgba(5,7,15,.9))}
.next a span{position:absolute;left:.8rem;right:.8rem;bottom:.8rem;z-index:1;font-family:var(--display);font-weight:900;text-transform:uppercase;font-size:1.4rem;line-height:1}
footer{border-top:1px solid var(--line);padding-block:2rem 3rem;color:var(--mute);font-size:.8rem}
footer ul{padding-left:1.1rem;margin:.6rem 0 1rem}
footer li{margin:.15rem 0}
.checked{color:var(--mute);font-size:.85rem;margin:0 0 2rem}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
"""

e = html.escape


def credit_line(c):
    lic = e(c.get('lic', ''))
    lic = f'<a href="{e(c["licurl"])}">{lic}</a>' if c.get('licurl') else lic
    return f'{e(c.get("artist", ""))}, {lic}, <a href="{e(c["page"])}">Wikimedia Commons</a>'


def page(p, credits):
    pics = [p['hero']] + [pl[0] for pl in p['places'] if pl[0]]
    hero = credits[p['hero']]
    url = SITE + 'visit/' + p['slug'] + '/'
    nav = ''.join(f'<a href="../{q["slug"]}/"{" aria-current=page" if q is p else ""}>{e(q["tab"])}</a>' for q in V.PAGES)
    blocks = []
    for i, (key, name, where, offers, good, links) in enumerate(p['places'], 1):
        fig = ''
        if key:
            c = credits[key]
            fig = (f'<figure><img src="../img/{key}.jpg" alt="{e(name)}" width="{c["w"]}" height="{c["h"]}" loading="lazy" decoding="async">'
                   f'<figcaption>Photo: {e(c["artist"])}</figcaption></figure>')
        lis = ''.join(f'<li>{e(g)}</li>' for g in good)
        lk = ''.join(f'<a href="{e(u)}" rel="noopener">{e(t)} ↗</a>' for t, u in links)
        blocks.append(f'<article class="place{"" if key else " noimg"}" id="p{i}">{fig}<div class="txt"><div class="num">{i:02d}</div>'
                      f'<h2>{e(name)}</h2><p class="where">{e(where)}</p><p class="offers"><b>What it offers</b>{e(offers)}</p>'
                      f'{"<ul>" + lis + "</ul>" if lis else ""}{"<div class=links>" + lk + "</div>" if lk else ""}</div></article>')
    plan = ''.join(f'<div><h3>{e(t)}</h3><p>{e(d)}</p><a href="{e(u)}" rel="noopener">{e(u.split("//")[1].rstrip("/"))} ↗</a></div>' for t, d, u in p['plan'])
    others = [q for q in V.PAGES if q is not p]
    nxt = ''.join(f'<a href="../{q["slug"]}/"><img src="../img/{q["hero"]}.jpg" alt="" loading="lazy" decoding="async"><span>{e(q["tab"])}</span></a>' for q in others)
    glance = ''.join(f'<div><small>{e(a)}</small><b>{e(b)}</b></div>' for a, b in p['glance'])
    intro = ''.join(f'<p>{e(x)}</p>' for x in p['intro'])
    creds = ''.join(f'<li>{e(next((pl[1] for pl in p["places"] if pl[0] == k), "Top of the page"))}: {credit_line(credits[k])}</li>' for k in dict.fromkeys(pics))
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'TouristDestination', 'name': p['title'], 'description': p['desc'], 'url': url, 'image': SITE + 'visit/img/' + p['hero'] + '.jpg',
         'touristType': 'Visitors to Calgary', 'containedInPlace': {'@type': 'City', 'name': 'Calgary', 'address': {'@type': 'PostalAddress', 'addressRegion': 'AB', 'addressCountry': 'CA'}},
         'includesAttraction': [{'@type': 'TouristAttraction', 'name': pl[1], 'description': pl[3]} for pl in p['places']]},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Calgary Insight', 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': 'Visit Calgary', 'item': SITE + 'visit/'},
            {'@type': 'ListItem', 'position': 3, 'name': p['tab'], 'item': url}]}]}
    return f"""<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(p['title'])}: a visitor's guide · Calgary Insight</title>
<meta name="description" content="{e(p['desc'])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:title" content="{e(p['title'])}"><meta property="og:description" content="{e(p['desc'])}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}visit/img/{p['hero']}.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../logo.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Hanken+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../guide.css">
<link rel="preload" as="image" href="../img/{p['hero']}.jpg">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head><body>
<header class="hero"><img src="../img/{p['hero']}.jpg" alt="" width="{hero['w']}" height="{hero['h']}" fetchpriority="high">
<a class="crumb" href="../">← Welcome to Calgary</a>
<div class="wrap pad"><div class="kicker">Visiting Calgary · {e(p['kicker'])}</div><h1>{e(p['title'])}</h1></div></header>
<nav class="topics" aria-label="Visitor guides"><div class="wrap pad">{nav}</div></nav>
<main class="wrap pad">
<div class="intro">{intro}</div>
<div class="glance" aria-label="At a glance">{glance}</div>
<p class="checked">Facts checked {V.CHECKED}. Opening hours and prices change: follow the official link for each place before you go.</p>
<div class="places">{''.join(blocks)}</div>
<section class="plan"><h2>Plan it</h2>{plan}</section>
<section class="next"><h2>Pick another Calgary</h2><div class="grid">{nxt}</div></section>
</main>
<footer class="wrap pad"><b>Photo credits</b> (free licences, from Wikimedia Commons)<ul>{creds}</ul>
A guide from <a href="../../">Calgary Insight</a>, independent, non-partisan Calgary data in plain words. <a href="../">Back to Welcome to Calgary</a>.</footer>
<script>try{{var c=document.querySelector('nav.topics [aria-current]'),w=c.parentNode;w.scrollLeft=c.offsetLeft-(w.clientWidth-c.offsetWidth)/2}}catch(e){{}}</script>
</body></html>
"""


def build(visit_dir):
    """Write visit_dir/<slug>/index.html for each guide, and visit_dir/guide.css. Returns the site-relative URLs."""
    credits = json.load(open(os.path.join(visit_dir, 'img', 'credits.json'), encoding='utf-8'))
    with open(os.path.join(visit_dir, 'guide.css'), 'w', encoding='utf-8') as f:
        f.write(CSS)
    for p in V.PAGES:
        d = os.path.join(visit_dir, p['slug'])
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(p, credits))
    return URLS


if __name__ == '__main__':
    import sys
    print(build(sys.argv[1]))
