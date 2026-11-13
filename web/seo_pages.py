"""Pages for search engines: one plain page for every Calgary ward and every community, with the day's figures written
into the page itself (the app draws its screens in the browser, which search engines read poorly, and every screen
shares one address). People search for their own community ("Martindale crime", "Ward 5 311"); these pages answer that
search and lead into the app.

    build(out, data_dir, method) -> list of page addresses (for the sitemap)

Writes OUT/wards/, OUT/wards/<n>/, OUT/communities/, OUT/communities/<slug>/ and OUT/seo.css.
"""
import datetime as dt
import html
import json
import os
import re

SITE = 'https://calgaryinsight.ca/'
e = lambda v: html.escape(str(v if v is not None else ''), quote=True)


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', str(name).lower().replace('&', ' and ').replace("'", '')).strip('-') or 'area'


def num(v, d=0):
    if v is None or (isinstance(v, float) and v != v):
        return None
    try:
        return f'{float(v):,.{d}f}'
    except (TypeError, ValueError):
        return None


def pct(v, d=1):
    if v is None:
        return None
    return f'up {num(v, d)}%' if v > 0 else f'down {num(-v, d)}%' if v < 0 else 'unchanged'


def nice_type(t):
    return re.sub(r'\s+-\s+GIS$', '', str(t or '')).replace(' - ', ': ', 1)


def ordinal(n):
    return f'{n}{"th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")}'


CSS = """:root{--bg:#F7F8FA;--card:#FFFFFF;--fg:#0B1220;--fg2:#334155;--mute:#5B6475;--line:#E2E6EC;--accent:#0369A1;--brand:#071226;--chip:#E8F1F8}
@media (prefers-color-scheme:dark){:root{--bg:#060B16;--card:#0E1626;--fg:#F1F5F9;--fg2:#CBD5E1;--mute:#94A3B8;--line:#1F2A3C;--accent:#38BDF8;--brand:#030712;--chip:#0F2236}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
a{color:var(--accent)}
.top{background:var(--brand);color:#fff;padding:12px max(16px,env(safe-area-inset-left))}
.top a{color:#fff;text-decoration:none;font-weight:700;letter-spacing:.01em;display:inline-flex;align-items:center;gap:10px}
.top img{width:28px;height:28px}
main{max-width:860px;margin:0 auto;padding:20px max(16px,env(safe-area-inset-left)) 48px}
.crumbs{font-size:.85rem;color:var(--mute);margin:4px 0 14px}.crumbs a{color:var(--mute)}
h1{font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.15;margin:0 0 6px;text-wrap:balance}
h2{font-size:1.25rem;margin:30px 0 8px}
.lead{font-size:1.08rem;color:var(--fg2);max-width:65ch}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:18px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.kpi b{display:block;font-size:1.45rem;font-variant-numeric:tabular-nums}.kpi span{font-size:.8rem;color:var(--mute);text-transform:uppercase;letter-spacing:.05em}
.kpi small{display:block;color:var(--mute);font-size:.8rem;margin-top:2px}
p,li{max-width:70ch}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-variant-numeric:tabular-nums}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line);font-size:.93rem}th{color:var(--mute);font-weight:600}td.n,th.n{text-align:right}
.wrap{overflow-x:auto}
.cta{display:inline-block;margin:18px 0 4px;background:var(--accent);color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:10px}
@media (prefers-color-scheme:dark){.cta{color:#06202F}}
.list{columns:3 200px;padding-left:18px}.list li{break-inside:avoid;margin:2px 0}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none}.chips a{display:inline-block;background:var(--chip);padding:5px 11px;border-radius:999px;text-decoration:none;font-size:.92rem}
footer{max-width:860px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-left)) 40px;color:var(--mute);font-size:.85rem}

.kicker{font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 6px}
figure.hero{margin:18px 0}figure.hero img{width:100%;max-height:440px;object-fit:cover;border-radius:10px;display:block}
figure.hero figcaption{font-size:.78rem;color:var(--mute);margin-top:4px}
.facts{background:var(--chip);border-radius:10px;padding:4px 18px 10px;margin:18px 0}.facts h2{margin-top:12px;font-size:1.05rem}
.facts ul{margin:0;padding-left:18px}.facts li{margin:4px 0}
ol.srcs li{margin:6px 0}ol.srcs span{color:var(--mute);font-size:.9rem}
ul.news{list-style:none;padding:0;margin:0 0 10px}ul.news li{padding:10px 0;border-bottom:1px solid var(--line)}
ul.news a{font-weight:700;font-size:1.05rem}ul.news span{display:block;font-size:.8rem;color:var(--mute);margin-top:2px}
ul.news p{margin:4px 0 0;color:var(--fg2);font-size:.95rem}
.note{font-size:.85rem;color:var(--mute)}.pn{margin:22px 0;line-height:1.9}
.qa{border:1px solid var(--line);border-radius:12px;padding:6px 18px 14px;margin:14px 0;background:var(--card)}
.qa h3{margin:12px 0 6px;font-size:1.05rem}.qa h3::before{content:"Q. ";color:var(--accent)}
.bars{display:grid;gap:5px;margin:8px 0}.bars div{display:grid;grid-template-columns:minmax(0,11rem) 1fr auto;gap:8px;align-items:center;font-size:.9rem}
.study{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px 10px;margin:14px 0}
.study h2{margin:4px 0 6px;font-size:1.2rem;text-wrap:balance}.study h2 a{color:var(--fg);text-decoration:none}.study h2 a:hover{color:var(--accent)}
.study-links{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px}.study-links .cta{margin:4px 0}
.study-open{margin:10px 0 18px}.study-open .cta{margin:6px 8px 6px 0}.cta.alt{background:transparent;color:var(--accent);border:2px solid var(--accent);padding:9px 16px}
@media (prefers-color-scheme:dark){.cta.alt{color:var(--accent)}}
.bars i{display:block;height:12px;border-radius:0 4px 4px 0;background:var(--accent)}.bars b{font-variant-numeric:tabular-nums;font-weight:600}
.steps{counter-reset:s;list-style:none;padding:0}.steps li{counter-increment:s;padding:8px 0 8px 2.4rem;position:relative}
.steps li::before{content:counter(s);position:absolute;left:0;top:7px;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--chip);color:var(--accent);font-weight:700;display:grid;place-items:center}
"""


def page(path, title, desc, crumbs, body, ld_extra=None, updated='', og_type='website', image=None):
    url = SITE + path
    bc = {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + p}
                                                          for i, (n, p) in enumerate(crumbs)]}
    ld = {'@context': 'https://schema.org', '@graph': [bc] + (ld_extra or [])}
    depth = path.count('/')
    up = '../' * depth
    return f'''<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{e(url)}">
<meta name="robots" content="index,follow">
<link rel="icon" href="{up}logo.svg"><link rel="stylesheet" href="{up}seo.css">
<meta property="og:type" content="{og_type}"><meta property="og:site_name" content="Calgary Insight">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(url)}"><meta property="og:image" content="{e(image or SITE + "og-image.png")}"><meta property="og:locale" content="en_CA">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, separators=(',', ':'))}</script>
</head><body>
<header class="top"><a href="{up}"><img src="{up}logo.svg" alt="" width="28" height="28">Calgary Insight</a></header>
<main>
<nav class="crumbs" aria-label="Breadcrumb">{' › '.join(f'<a href="{up}{p}">{e(n)}</a>' for n, p in crumbs[:-1])} › {e(crumbs[-1][0])}</nav>
{body}
</main>
<footer><p>Calgary Insight is independent and non-partisan, made from public data and refreshed every morning{f" (these figures: {e(updated)}, Calgary time)" if updated else ""}. It is not affiliated with The City of Calgary. <a href="{up}about/">About</a> · <a href="{up}studies/">Studies</a> · <a href="{up}wards/">All wards</a> · <a href="{up}communities/">All communities</a></p></footer>
</body></html>
'''


def load(data_dir, method, w):
    p = os.path.join(data_dir, method, f'w{w}.json')
    if not os.path.exists(p):
        return None
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def kpi(label, value, sub=''):
    return f'<div class="kpi"><span>{e(label)}</span><b>{e(value if value is not None else "–")}</b>{f"<small>{e(sub)}</small>" if sub else ""}</div>'


def sources_p(c0):
    return ('<h2>Where the figures come from</h2><p>311 requests: The City of Calgary, 311 Service Requests open data '
            '(data.calgary.ca, iahh-g8bj), the last 12 complete months against the 12 before. Crime: Calgary Police Service, '
            'community crime statistics, the latest 12 months the police have published. Residents: '
            f'{e(((c0.get("population") or {}).get("method_label")) or "the City’s population estimate")}, with the 2021 Census count '
            'beside it. New homes and permits: City of Calgary building and development permit open data. Rates per 1,000 residents a year '
            'use residents in the middle of each period.</p>')


def build(out, data_dir, method='city_actual'):
    city = load(data_dir, method, 0)
    if not city or not city.get('communities'):
        raise RuntimeError('no city-wide data to write pages from')
    with open(os.path.join(out, 'seo.css'), 'w', encoding='utf-8') as f:
        f.write(CSS)
    updated = str(city.get('built_at') or '')[:16].replace('T', ' ')
    period = city.get('period') or 'the last 12 months'
    crime = city.get('crime') or {}
    cperiod = crime.get('period') or 'the latest 12 months'
    byc = {x['code']: x for x in crime.get('by_comm') or [] if x.get('code')}
    S = city.get('summary') or {}
    city_req = S.get('requests_per_1000')
    city_crime = crime.get('city_per_1000')
    # unnamed residual areas (02L, 13A) have no name anyone searches for, and almost no figures: no page
    comms = [c for c in city['communities'] if c.get('code') and c.get('name') and not re.fullmatch(r'\d{2}[A-Z]{1,2}', str(c['name']).strip())]
    slugs, seen = {}, set()
    for c in sorted(comms, key=lambda c: c['name']):
        s = slug(c['name'])
        if s in seen:
            s = f'{s}-{c["code"].lower()}'
        seen.add(s)
        slugs[c['code']] = s
    wards = {}
    for w in range(1, 15):
        d = load(data_dir, method, w)
        if d:
            wards[w] = d
    council = {w: (d.get('ward') or {}).get('councillor') for w, d in wards.items()}
    lived = [c for c in comms if c.get('residential') and not c.get('few_residents')]
    def rank(key, getter):
        vals = sorted([(getter(c), c['code']) for c in lived if getter(c) is not None], reverse=True)
        return {code: (i + 1, len(vals)) for i, (_, code) in enumerate(vals)}
    r_crime = rank('crime', lambda c: (byc.get(c['code']) or {}).get('per_1000'))
    r_req = rank('req', lambda c: c.get('requests_per_1000'))
    r_grow = rank('grow', lambda c: c.get('growth_pct'))
    urls = []

    # ---- every community
    for c in comms:
        code, name, s = c['code'], c['name'], slugs[c['code']]
        w = c.get('ward')
        cr = byc.get(code) or {}
        lived_here = c.get('residential') and not c.get('few_residents')
        res = c.get('residents')
        top = [t for t in (c.get('open_top') or []) if not re.search(r'contact us', str(t.get('type')), re.I)][:5]
        bits = []
        if lived_here and res:
            g = c.get('growth_pct')
            bits.append(f'{name} is a community in Ward {w} of Calgary, home to about {num(res)} people'
                        + (f' ({num(c.get("census2021"))} at the 2021 Census' + (f', {pct(g)} since' if g is not None else '') + ')' if c.get('census2021') else '') + '.')
        else:
            bits.append(f'{name} is a {"business or industrial area" if not c.get("residential") else "community with few residents"} in Ward {w} of Calgary.')
        if c.get('requests12') is not None:
            bits.append(f'Residents and businesses made {num(c["requests12"])} requests to 311 in {period}'
                        + (f', {pct(c.get("requests_change_pct"))} on the year before' if c.get('requests_change_pct') is not None else '') + '.')
        if c.get('open'):
            bits.append(f'{num(c["open"])} requests are open now' + (f', {num(c.get("open_over_90_days"))} of them for more than 90 days' if c.get('open_over_90_days') else '') + '.')
        if cr.get('n') is not None:
            bits.append(f'The Calgary Police Service recorded {num(cr["n"])} crimes here in {cperiod}'
                        + (f' ({num(cr.get("per_1000"), 1)} per 1,000 residents a year; Calgary as a whole: {num(city_crime, 1)})' if cr.get('per_1000') is not None and city_crime else '')
                        + (f', {pct(cr.get("change_pct"))} on the year before' if cr.get('change_pct') is not None else '') + '.')
        lead = ' '.join(bits)
        kp = [kpi('Residents today', num(res) if lived_here else '–', f'2021 Census: {num(c.get("census2021"))}' if c.get('census2021') else ''),
              kpi('Growth since 2021', (num(c.get('growth_pct'), 1) + '%') if lived_here and c.get('growth_pct') is not None else '–',
                  (f'{ordinal(r_grow[code][0])} fastest of {r_grow[code][1]}' if code in r_grow else '')),
              kpi('311 requests, 12 months', num(c.get('requests12')), (f'{num(c.get("requests_per_1000"), 0)} per 1,000 residents (Calgary {num(city_req, 0)})' if lived_here and c.get('requests_per_1000') is not None else '')),
              kpi('Open 311 requests now', num(c.get('open')), (f'{num(c.get("open_over_90_days"))} open over 90 days' if c.get('open_over_90_days') else '')),
              kpi('Crimes per 1,000 a year', num(cr.get('per_1000'), 1) if cr.get('per_1000') is not None else '–',
                  (f'{ordinal(r_crime[code][0])} highest of {r_crime[code][1]} communities' if code in r_crime else (f'{num(cr.get("n"))} crimes' if cr.get('n') is not None else ''))),
              kpi('New homes, 12 months', num(c.get('new_homes12')), f'{num(c.get("homes_now"))} homes in all' if c.get('homes_now') else '')]
        body = [f'<h1>{e(name)}, Calgary</h1><p class="lead">{e(lead)}</p>', '<div class="kpis">' + ''.join(kp) + '</div>']
        if top:
            body.append(f'<h2>What people report to 311 in {e(name)}</h2><p>The most common requests still open, with the oldest one of each kind:</p>'
                        '<div class="wrap"><table><thead><tr><th>Request</th><th class="n">Open</th><th>Oldest since</th></tr></thead><tbody>'
                        + ''.join(f'<tr><td>{e(nice_type(t.get("type")))}</td><td class="n">{num(t.get("n"))}</td><td>{e(t.get("oldest") or "")}</td></tr>' for t in top)
                        + '</tbody></table></div>')
        if cr.get('n') is not None:
            more = (f' That is the {ordinal(r_crime[code][0])} highest rate of {r_crime[code][1]} lived-in communities.' if code in r_crime else '')
            body.append(f'<h2>Crime in {e(name)}</h2><p>{num(cr["n"])} crimes were reported to the Calgary Police Service in {e(cperiod)}, '
                        f'against {num(cr.get("prev"))} in the same months a year before.'
                        + (f' Per resident that is {num(cr.get("per_1000"), 1)} crimes per 1,000 people a year; Calgary as a whole has {num(city_crime, 1)}.' if cr.get('per_1000') is not None and city_crime else '')
                        + more + ' Counts are the police’s, by community and month; the police do not publish where each crime happened.</p>')
        if lived_here and (c.get('new_homes12') is not None or c.get('dev_permits12') is not None):
            body.append(f'<h2>Growth and new homes</h2><p>{num(c.get("new_homes12")) or 0} new homes were finished and {num(c.get("issued_homes12")) or 0} '
                        f'were approved for building in {e(period)}; {num(c.get("dev_permits12")) or 0} development permits were issued.'
                        + (f' The community has about {num(c.get("homes_now"))} homes and had {num(c.get("households_2021"))} households at the 2021 Census.' if c.get('homes_now') and c.get('households_2021') else '') + '</p>')
        if w:
            near = sorted([x for x in comms if x.get('ward') == w and x['code'] != code], key=lambda x: x['name'])
            body.append(f'<h2>Ward {w}</h2><p>{e(name)} is in <a href="../../wards/{w}/">Ward {w}</a>'
                        + (f', represented on Calgary City Council by Councillor {e(council.get(w))}' if council.get(w) else '') + '.'
                        + (' Other communities in the ward:' if near else '') + '</p>'
                        + ('<ul class="chips">' + ''.join(f'<li><a href="../{slugs[x["code"]]}/">{e(x["name"])}</a></li>' for x in near) + '</ul>' if near else ''))
        body.append(f'<a class="cta" href="../../?ward={w or 0}&amp;community={e(code)}">Open {e(name)} on the interactive map</a>')
        body.append(sources_p(city))
        title = f'{name}, Calgary: population, 311 requests and crime | Calgary Insight'
        desc = (f'{name} (Ward {w}, Calgary): ' + (f'about {num(res)} residents, ' if lived_here and res else '')
                + (f'{num(c.get("requests12"))} 311 requests in 12 months, ' if c.get('requests12') is not None else '')
                + (f'{num(cr.get("per_1000"), 1)} crimes per 1,000 residents a year, ' if cr.get('per_1000') is not None else '')
                + 'new homes and open issues, from public data refreshed daily.')
        place = {'@type': 'Place', 'name': f'{name}, Calgary', 'containedInPlace': {'@type': 'City', 'name': 'Calgary', 'address': {'@type': 'PostalAddress', 'addressRegion': 'AB', 'addressCountry': 'CA'}}}
        path = f'communities/{s}/'
        os.makedirs(os.path.join(out, path), exist_ok=True)
        with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(path, title, desc, [('Calgary Insight', ''), ('Communities', 'communities/'), (name, path)], '\n'.join(body), [place], updated))
        urls.append(path)

    # ---- every ward
    for w, d in sorted(wards.items()):
        W, Sw, Cw = d.get('ward') or {}, d.get('summary') or {}, d.get('crime') or {}
        mine = sorted([x for x in comms if x.get('ward') == w], key=lambda x: x['name'])
        types = [t for t in d.get('open_by_type') or [] if not re.search(r'contact us', str(t.get('type')), re.I)][:6]
        cats = (Cw.get('by_category') or [])[:6]
        lead = (f'Ward {w} is one of Calgary’s 14 wards' + (f', represented by Councillor {W["councillor"]}' if W.get('councillor') else '')
                + f'. About {num(W.get("residents"))} people live in its {sum(1 for x in mine if x.get("residential"))} residential communities'
                + (f' ({num(W.get("census2021"))} at the 2021 Census' + (f', {pct(W.get("growth_pct"))} since' if W.get('growth_pct') is not None else '') + ')' if W.get('census2021') else '') + '. '
                + (f'They made {num(Sw.get("requests12"))} 311 requests in {period}' + (f', {pct(Sw.get("requests_change_pct"))} on the year before' if Sw.get('requests_change_pct') is not None else '') + '. ' if Sw.get('requests12') is not None else '')
                + (f'Police recorded {num(Cw.get("crimes"))} crimes in {cperiod} ({num(Cw.get("per_1000"), 1)} per 1,000 residents a year; Calgary {num(Cw.get("city_per_1000"), 1)}).' if Cw.get('crimes') is not None else ''))
        kp = [kpi('Residents today', num(W.get('residents')), f'2021 Census: {num(W.get("census2021"))}' if W.get('census2021') else ''),
              kpi('Growth since 2021', (num(W.get('growth_pct'), 1) + '%') if W.get('growth_pct') is not None else '–'),
              kpi('311 requests, 12 months', num(Sw.get('requests12')), f'{num(Sw.get("requests_per_1000"), 0)} per 1,000 residents' if Sw.get('requests_per_1000') is not None else ''),
              kpi('Open 311 requests now', num(Sw.get('open_now')), f'{num(Sw.get("open_over_90_days"))} open over 90 days' if Sw.get('open_over_90_days') else ''),
              kpi('Crimes per 1,000 a year', num(Cw.get('per_1000'), 1), f'Calgary {num(Cw.get("city_per_1000"), 1)}' if Cw.get('city_per_1000') else ''),
              kpi('Closed within 7 days', (num(Sw.get('closed_7_days_pct'), 1) + '%') if Sw.get('closed_7_days_pct') is not None else '–', 'of 311 requests closed')]
        body = [f'<h1>Ward {w}, Calgary</h1><p class="lead">{e(lead)}</p>', '<div class="kpis">' + ''.join(kp) + '</div>']
        if types:
            body.append('<h2>Most common open 311 requests</h2><div class="wrap"><table><thead><tr><th>Request</th><th class="n">Open now</th></tr></thead><tbody>'
                        + ''.join(f'<tr><td>{e(nice_type(t.get("type")))}</td><td class="n">{num(t.get("n"))}</td></tr>' for t in types) + '</tbody></table></div>')
        if cats:
            body.append(f'<h2>Crime by kind, {e(cperiod)}</h2><div class="wrap"><table><thead><tr><th>Kind</th><th class="n">Crimes</th><th class="n">Year before</th></tr></thead><tbody>'
                        + ''.join(f'<tr><td>{e(x.get("label") or x.get("category"))}</td><td class="n">{num(x.get("n"))}</td><td class="n">{num(x.get("prev"))}</td></tr>' for x in cats) + '</tbody></table></div>')
        rows = []
        for x in mine:
            cr = byc.get(x['code']) or {}
            live = x.get('residential') and not x.get('few_residents')
            rows.append(f'<tr><td><a href="../../communities/{slugs[x["code"]]}/">{e(x["name"])}</a></td><td class="n">{num(x.get("residents")) if live else "–"}</td>'
                        f'<td class="n">{num(x.get("requests12")) or "–"}</td><td class="n">{num(x.get("open")) or "–"}</td><td class="n">{num(cr.get("per_1000"), 1) if live and cr.get("per_1000") is not None else "–"}</td></tr>')
        body.append('<h2>Communities in the ward</h2><div class="wrap"><table><thead><tr><th>Community</th><th class="n">Residents</th><th class="n">311 requests, 12 months</th><th class="n">Open now</th><th class="n">Crimes per 1,000</th></tr></thead><tbody>'
                    + ''.join(rows) + '</tbody></table></div>')
        body.append(f'<a class="cta" href="../../?ward={w}">Open Ward {w} on the interactive dashboard</a>')
        body.append('<h2>Other wards</h2><ul class="chips">' + ''.join(f'<li><a href="../{n}/">Ward {n}</a></li>' for n in sorted(wards) if n != w) + '</ul>')
        body.append(sources_p(city))
        title = f'Ward {w} Calgary' + (f' (Councillor {W["councillor"]})' if W.get('councillor') else '') + ': communities, 311 and crime | Calgary Insight'
        desc = (f'Calgary Ward {w}' + (f', Councillor {W["councillor"]}' if W.get('councillor') else '') + f': about {num(W.get("residents"))} residents, '
                f'{num(Sw.get("requests12"))} 311 requests in 12 months, crime per 1,000 residents and every community in the ward, from public data refreshed daily.')
        path = f'wards/{w}/'
        os.makedirs(os.path.join(out, path), exist_ok=True)
        place = {'@type': 'AdministrativeArea', 'name': f'Ward {w}, Calgary', 'containedInPlace': {'@type': 'City', 'name': 'Calgary'}}
        with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(path, title, desc, [('Calgary Insight', ''), ('Wards', 'wards/'), (f'Ward {w}', path)], '\n'.join(body), [place], updated))
        urls.append(path)

    # ---- the two lists
    wl = ''.join(f'<tr><td><a href="{w}/">Ward {w}</a></td><td>{e(council.get(w) or "")}</td><td class="n">{num((d.get("ward") or {}).get("residents"))}</td>'
                 f'<td class="n">{num((d.get("summary") or {}).get("requests12"))}</td><td class="n">{num((d.get("crime") or {}).get("per_1000"), 1) or "–"}</td></tr>' for w, d in sorted(wards.items()))
    body = ('<h1>Calgary’s 14 wards</h1><p class="lead">Every ward of the City of Calgary with its councillor, residents, 311 requests and crime, '
            'from public data refreshed every morning. Open a ward for its communities and figures.</p>'
            '<div class="wrap"><table><thead><tr><th>Ward</th><th>Councillor</th><th class="n">Residents</th><th class="n">311 requests, 12 months</th><th class="n">Crimes per 1,000</th></tr></thead>'
            f'<tbody>{wl}</tbody></table></div><p><a href="../communities/">Every community in Calgary</a></p>')
    os.makedirs(os.path.join(out, 'wards'), exist_ok=True)
    with open(os.path.join(out, 'wards', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page('wards/', 'Calgary wards and councillors: residents, 311 and crime by ward | Calgary Insight',
                     'All 14 Calgary wards with their councillors, residents, 311 requests and crime per 1,000 residents, from public data refreshed daily.',
                     [('Calgary Insight', ''), ('Wards', 'wards/')], body, None, updated))
    groups = ''.join(f'<h2><a href="../wards/{w}/">Ward {w}</a></h2><ul class="list">'
                     + ''.join(f'<li><a href="{slugs[x["code"]]}/">{e(x["name"])}</a></li>' for x in sorted([x for x in comms if x.get('ward') == w], key=lambda x: x['name']))
                     + '</ul>' for w in sorted({x.get('ward') for x in comms if x.get('ward')}))
    body = ('<h1>Every Calgary community</h1><p class="lead">All of Calgary’s communities, ward by ward. Each page has the population and growth '
            'since 2021, 311 requests and what is still open, crime per 1,000 residents and new homes, from public data refreshed every morning.</p>' + groups)
    os.makedirs(os.path.join(out, 'communities'), exist_ok=True)
    with open(os.path.join(out, 'communities', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page('communities/', 'Calgary communities: population, 311 requests and crime for every neighbourhood | Calgary Insight',
                     f'Every one of Calgary’s {len(comms)} communities: population and growth, 311 requests, crime per 1,000 residents and new homes, from public data refreshed daily.',
                     [('Calgary Insight', ''), ('Communities', 'communities/')], body, None, updated))
    # ---- three topic pages with their own address and title (the dashboard screens all share the home page's)
    urls += topic_pages(out, city, wards, comms, slugs, byc, crime, cperiod, period, updated)
    urls += ai_pages(out, city, wards, comms, slugs, byc, crime, cperiod, period, updated)
    urls += study_pages(out, updated)
    urls += sewer_page(out, updated)
    urls += police_page(out, updated)
    urls += pay_page(out, updated)
    urls += growth_page(out, updated)
    urls += studies_index(out, updated)

    # the list the dashboard uses to link each community to its page, and for its "find your community" box
    with open(os.path.join(out, 'communities', 'pages.json'), 'w', encoding='utf-8') as f:
        json.dump([{'code': c['code'], 'name': c['name'], 'ward': c.get('ward'), 'path': 'communities/' + slugs[c['code']] + '/'}
                   for c in sorted(comms, key=lambda c: c['name'])], f, ensure_ascii=False, separators=(',', ':'))
    return ['wards/', 'communities/'] + urls


def topic_pages(out, city, wards, comms, slugs, byc, crime, cperiod, period, updated):
    """calgaryinsight.ca/311/, /crime/ and /growth/: city-wide figures, every ward, and the communities at the top."""
    S, P = city.get('summary') or {}, city.get('population') or {}
    ws = {r['ward']: r for r in ((city.get('wards_summary') or {}).get('wards') or [])}
    lived = [c for c in comms if c.get('residential') and not c.get('few_residents') and (c.get('residents') or 0) >= 1000]   # rates need enough residents to mean something
    out_urls = []

    def write(path, title, desc, name, body):
        os.makedirs(os.path.join(out, path), exist_ok=True)
        with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(path, title, desc, [('Calgary Insight', ''), (name, path)], '\n'.join(body), None, updated))
        out_urls.append(path)

    def ward_table(cols):
        head = ''.join(f'<th class="n">{e(h)}</th>' for h, _ in cols)
        rows = ''.join(f'<tr><td><a href="../wards/{w}/">Ward {w}</a></td><td>{e(r.get("councillor") or "")}</td>' + ''.join(f'<td class="n">{g(r) or "–"}</td>' for _, g in cols) + '</tr>'
                       for w, r in sorted(ws.items()))
        return f'<div class="wrap"><table><thead><tr><th>Ward</th><th>Councillor</th>{head}</tr></thead><tbody>{rows}</tbody></table></div>'

    def top(getter, fmt, n=10):
        vals = sorted([(getter(c), c) for c in lived if getter(c) is not None], key=lambda t: -t[0])[:n]
        return ''.join(f'<tr><td><a href="../communities/{slugs[c["code"]]}/">{e(c["name"])}</a></td><td>Ward {c.get("ward") or ""}</td><td class="n">{fmt(v)}</td></tr>' for v, c in vals)

    # 311
    types = [t for t in city.get('open_by_type') or [] if not re.search(r'contact us', str(t.get('type')), re.I)][:10]
    body = ['<h1>311 in Calgary: requests, what is still open, and by ward</h1>',
            f'<p class="lead">Calgarians made {num(S.get("requests12"))} 311 requests in {e(period)}'
            + (f', {pct(S.get("requests_change_pct"))} on the year before' if S.get('requests_change_pct') is not None else '')
            + f'. {num(S.get("open_now"))} requests are still marked open in the City’s data, {num(S.get("open_over_90_days"))} of them for more than 90 days. '
            '“Still open” is how the City’s data marks them, not proof the work is undone: some older requests were finished but never closed.</p>',
            '<div class="kpis">' + ''.join([
                kpi('311 requests, 12 months', num(S.get('requests12')), f'{num(S.get("requests_per_1000"), 0)} per 1,000 residents a year'),
                kpi('Still open today', num(S.get('open_now')), f'{num(S.get("open_over_90_days"))} open over 90 days'),
                kpi('Open per 1,000 residents', num(S.get('open_per_1000'), 1), 'requests in residential communities only'),
                kpi('Closed within 7 days', (num(S.get('closed_7_days_pct'), 1) + '%') if S.get('closed_7_days_pct') is not None else '–', 'of requests made'),
                kpi('Made in the 311 app', (num(S.get('app_share_pct'), 1) + '%') if S.get('app_share_pct') is not None else '–', 'of requests')]) + '</div>',
            '<h2>Every ward</h2>',
            ward_table([('311 requests, 12 months', lambda r: num(r.get('requests12'))), ('Per 1,000 a year', lambda r: num(r.get('requests_per_1000'), 0)),
                        ('Still open', lambda r: num(r.get('open'))), ('Open per 1,000', lambda r: num(r.get('open_per_1000'), 1)),
                        ('Closed in 7 days', lambda r: (num(r.get('closed_7_days_pct'), 1) + '%') if r.get('closed_7_days_pct') is not None else None)]),
            '<p>Rates per 1,000 residents count requests in residential communities only, since business and industrial areas have almost no residents.</p>']
    if types:
        body.append('<h2>The most common requests still open</h2><div class="wrap"><table><thead><tr><th>Request</th><th class="n">Open now</th></tr></thead><tbody>'
                    + ''.join(f'<tr><td>{e(nice_type(t.get("type")))}</td><td class="n">{num(t.get("n"))}</td></tr>' for t in types) + '</tbody></table></div>')
    body.append('<h2>Communities with the most 311 requests per resident</h2><p>Communities with at least 1,000 residents. Busy commercial areas get requests from far more people than live there.</p><div class="wrap"><table><thead><tr><th>Community</th><th>Ward</th><th class="n">Per 1,000 a year</th></tr></thead><tbody>'
                + top(lambda c: c.get('requests_per_1000'), lambda v: num(v, 0)) + '</tbody></table></div>')
    body += ['<a class="cta" href="../?view=issues">See every open request on the dashboard</a>',
             '<p><a href="../crime/">Crime in Calgary</a> · <a href="../growth/">Growth and new homes</a> · <a href="../wards/">All wards</a> · <a href="../communities/">All communities</a></p>', sources_p(city)]
    write('311/', 'Calgary 311 requests by ward and community: what is still open | Calgary Insight',
          f'{num(S.get("requests12"))} Calgary 311 requests in 12 months and {num(S.get("open_now"))} still marked open, ward by ward and community by community, from City open data refreshed daily.',
          '311 in Calgary', body)

    # crime
    cats = (crime.get('by_category') or [])[:10]
    body = ['<h1>Crime in Calgary by ward and community</h1>',
            f'<p class="lead">The Calgary Police Service recorded {num(crime.get("city_crimes") or crime.get("crimes"))} crimes in {e(cperiod)}'
            + (f', {pct(crime.get("city_change_pct") if crime.get("city_change_pct") is not None else crime.get("change_pct"))} on the year before' if (crime.get('city_change_pct') if crime.get('city_change_pct') is not None else crime.get('change_pct')) is not None else '')
            + f': {num(crime.get("city_per_1000") or crime.get("per_1000"), 1)} for every 1,000 residents.</p>',
            '<div class="kpis">' + ''.join([
                kpi('Crimes, latest 12 months', num(crime.get('city_crimes') or crime.get('crimes'))),
                kpi('Per 1,000 residents a year', num(crime.get('city_per_1000') or crime.get('per_1000'), 1)),
                kpi('Violent crimes', num(crime.get('violent')), (pct(crime.get('violent_change_pct')) + ' on the year before') if crime.get('violent_change_pct') is not None else '')]) + '</div>',
            '<h2>Every ward</h2>',
            ward_table([('Crimes', lambda r: num(r.get('crimes'))), ('Per 1,000 a year', lambda r: num(r.get('crime_per_1000'), 1)),
                        ('Change', lambda r: pct(r.get('crime_change_pct')) if r.get('crime_change_pct') is not None else None)])]
    if cats:
        body.append(f'<h2>Crime by kind, {e(cperiod)}</h2><div class="wrap"><table><thead><tr><th>Kind</th><th class="n">Crimes</th><th class="n">Year before</th></tr></thead><tbody>'
                    + ''.join(f'<tr><td>{e(x.get("label") or x.get("category"))}</td><td class="n">{num(x.get("n"))}</td><td class="n">{num(x.get("prev"))}</td></tr>' for x in cats) + '</tbody></table></div>')
    body.append('<h2>Communities with the most crime per resident</h2><p>Communities with at least 1,000 residents. Downtown and busy shopping areas see crime from far more people than live there.</p>'
                '<div class="wrap"><table><thead><tr><th>Community</th><th>Ward</th><th class="n">Per 1,000 a year</th></tr></thead><tbody>'
                + top(lambda c: (byc.get(c['code']) or {}).get('per_1000'), lambda v: num(v, 1)) + '</tbody></table></div>')
    body += ['<div class="qa"><h3>Study: Calgary Police performance, resources and the 2027 to 2030 budget request</h3><p>How Calgary’s police have performed since 2019 '
             'for the resources they have had, compared with Edmonton, Vancouver, Winnipeg, Ottawa and Toronto, with a budget calculator.</p>'
             '<p><a href="../studies/calgary-police/">Read the study →</a></p></div>',
             '<a class="cta" href="../?view=safety">Open crime on the dashboard</a>',
             '<p><a href="../311/">311 in Calgary</a> · <a href="../growth/">Growth and new homes</a> · <a href="../wards/">All wards</a> · <a href="../communities/">All communities</a></p>', sources_p(city)]
    write('crime/', 'Calgary crime by ward and community, per 1,000 residents | Calgary Insight',
          f'Calgary crime from Calgary Police Service statistics: {num(crime.get("city_per_1000") or crime.get("per_1000"), 1)} per 1,000 residents a year, every ward and the communities with the highest rates, refreshed daily.',
          'Crime in Calgary', body)

    # growth
    body = ['<h1>Calgary’s growth: population and new homes by ward</h1>',
            f'<p class="lead">About {num(P.get("city_now"))} people live in Calgary today by the City’s estimate, against {num(P.get("census_city"))} at the 2021 Census. '
            f'{num(S.get("new_homes12"))} new homes were applied for and {num(S.get("issued_homes12"))} approved in building permits in {e(period)}.</p>',
            '<div class="kpis">' + ''.join([
                kpi('Residents today (estimate)', num(P.get('city_now')), f'2021 Census: {num(P.get("census_city"))}'),
                kpi('Homes today', num(P.get('homes_now')), f'2021: {num(P.get("homes_census"))}'),
                kpi('Homes in permits applied for', num(S.get('new_homes12')), (pct(S.get('new_homes_change_pct')) + ' on the year before') if S.get('new_homes_change_pct') is not None else ''),
                kpi('Homes in permits issued', num(S.get('issued_homes12')), (pct(S.get('issued_homes_change_pct')) + ' on the year before') if S.get('issued_homes_change_pct') is not None else '')]) + '</div>',
            '<h2>Every ward</h2>',
            ward_table([('Residents today', lambda r: num(r.get('residents'))), ('2021 Census', lambda r: num(r.get('census2021'))),
                        ('Growth since 2021', lambda r: (num(r.get('growth_pct'), 1) + '%') if r.get('growth_pct') is not None else None),
                        ('Homes applied for, 12 months', lambda r: num(r.get('new_homes12')))]),
            '<h2>Fastest-growing communities since 2021</h2><div class="wrap"><table><thead><tr><th>Community</th><th>Ward</th><th class="n">Growth</th></tr></thead><tbody>'
            + top(lambda c: c.get('growth_pct') if (c.get('census2021') or 0) >= 500 else None, lambda v: num(v, 1) + '%') + '</tbody></table></div>',
            f'<p>Residents today: {e(P.get("method_label") or "the City’s population estimate")}. Estimates, rounded to whole people; the 2021 Census is the last full count.</p>',
            '<a class="cta" href="../?view=growth">Open growth on the dashboard</a>',
            '<p><a href="../311/">311 in Calgary</a> · <a href="../crime/">Crime in Calgary</a> · <a href="../wards/">All wards</a> · <a href="../communities/">All communities</a></p>', sources_p(city)]
    write('growth/', 'Calgary population growth and new homes by ward and community | Calgary Insight',
          f'Calgary’s population today (about {num(P.get("city_now"))}) against the 2021 Census, new homes in building permits, and growth in every ward and community, refreshed daily.',
          'Growth in Calgary', body)
    return out_urls


def bars(rows, fmt, link=None):
    """A small bar chart in HTML: rows of (label, value[, href])."""
    rows = [r for r in rows if r[1] is not None]
    if not rows:
        return ''
    top = max(abs(r[1]) for r in rows) or 1
    out = []
    for r in rows:
        lab = f'<a href="{e(r[2])}">{e(r[0])}</a>' if len(r) > 2 and r[2] else e(r[0])
        out.append(f'<div><span>{lab}</span><i style="width:{max(2, round(100 * abs(r[1]) / top))}%"></i><b>{e(fmt(r[1]))}</b></div>')
    return '<div class="bars">' + ''.join(out) + '</div>'


def ai_pages(out, city, wards, comms, slugs, byc, crime, cperiod, period, updated):
    """calgaryinsight.ca/ask/ (Data Genie) and /data-scientist/: what each does, with sample answers worked out from the same data."""
    S, P = city.get('summary') or {}, city.get('population') or {}
    ws = {r['ward']: r for r in ((city.get('wards_summary') or {}).get('wards') or [])}
    lived = [c for c in comms if c.get('residential') and not c.get('few_residents') and (c.get('residents') or 0) >= 1000]
    cp = lambda c: f'../communities/{slugs[c["code"]]}/' if c.get('code') in slugs else None
    urls = []

    def write(path, title, desc, name, body, ld):
        os.makedirs(os.path.join(out, path), exist_ok=True)
        with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page(path, title, desc, [('Calgary Insight', ''), (name, path)], '\n'.join(body), ld, updated))
        urls.append(path)

    # sample answers, worked out here from the published figures
    qa = []
    most_open = sorted([c for c in comms if c.get('open')], key=lambda c: -c['open'])[:8]
    if most_open:
        qa.append(('Which Calgary communities have the most 311 requests still open?',
                   f'{e(most_open[0]["name"])} has the most, with {num(most_open[0]["open"])} requests still marked open in the City’s data. The eight with the most:',
                   bars([(c['name'], c['open'], cp(c)) for c in most_open], lambda v: num(v))))
    wr = sorted([(w, r) for w, r in ws.items() if r.get('open_per_1000') is not None], key=lambda t: -t[1]['open_per_1000'])
    if wr:
        qa.append(('Which ward has the most open 311 requests for its population?',
                   f'Ward {wr[0][0]}, with {num(wr[0][1]["open_per_1000"], 1)} open requests per 1,000 residents (requests in residential communities only). Every ward:',
                   bars([(f'Ward {w}', r['open_per_1000'], f'../wards/{w}/') for w, r in wr], lambda v: num(v, 1))))
    ch = crime.get('city_change_pct') if crime.get('city_change_pct') is not None else crime.get('change_pct')
    cats = [x for x in (crime.get('by_category') or []) if x.get('n')][:8]
    if cats:
        qa.append(('Is crime going up or down in Calgary?',
                   f'The Calgary Police Service recorded {num(crime.get("city_crimes") or crime.get("crimes"))} crimes in {e(cperiod)}'
                   + (f', {pct(ch)} on the year before' if ch is not None else '') + f', or {num(crime.get("city_per_1000") or crime.get("per_1000"), 1)} for every 1,000 residents. By kind:',
                   bars([(x.get('label') or x.get('category'), x['n']) for x in cats], lambda v: num(v))))
    types = [t for t in city.get('open_by_type') or [] if not re.search(r'contact us', str(t.get('type')), re.I)][:8]
    if types:
        qa.append(('What do Calgarians most often report to 311 that is still open?',
                   f'{e(nice_type(types[0].get("type")))} leads, with {num(types[0].get("n"))} open requests. The most common:',
                   bars([(nice_type(t.get('type')), t.get('n')) for t in types], lambda v: num(v))))
    grow = sorted([c for c in lived if c.get('growth_pct') is not None and (c.get('census2021') or 0) >= 500], key=lambda c: -c['growth_pct'])[:8]
    if grow:
        qa.append(('Which established communities have grown fastest since the 2021 Census?',
                   f'{e(grow[0]["name"])}, up {num(grow[0]["growth_pct"], 1)}% by the City’s estimate. The eight fastest among communities with at least 500 people in 2021:',
                   bars([(c['name'], c['growth_pct'], cp(c)) for c in grow], lambda v: num(v, 1) + '%')))
    mrt = next((c for c in comms if c.get('name') == 'Martindale'), None)
    if mrt:
        b = byc.get(mrt.get('code')) or {}
        qa.append(('Brief me on Martindale.',
                   f'Martindale, in Ward {mrt.get("ward")}: about {num(mrt.get("residents"))} residents. {num(mrt.get("requests12"))} 311 requests in {e(period)}, '
                   f'{num(mrt.get("open"))} still marked open. '
                   + (f'{num(b.get("crimes"))} crimes recorded in {e(cperiod)}, {num(b.get("per_1000"), 1)} per 1,000 residents. ' if b.get('crimes') else '')
                   + f'<a href="{e(cp(mrt) or "")}">Martindale’s full page</a>.', ''))
    qa_html = ''.join(f'<div class="qa"><h3>{e(q)}</h3><p>{a}</p>{c}</div>' for q, a, c in qa)

    body = ['<h1>Data Genie: ask Calgary’s open data in plain words</h1>',
            '<p class="lead">Data Genie answers questions about Calgary from public data. It finds the right datasets among more than 400 from seven public sources, '
            'including the City of Calgary’s open data and Calgary Police Service statistics, works out the figures, and answers with charts, tables, maps, '
            'downloads and full reports. Every figure says where it comes from.</p>',
            '<h2>Who it is for</h2><p>Councillors’ offices preparing casework, briefings and council meetings; community associations; journalists; researchers; and residents who want a straight answer about their part of the city.</p>',
            '<h2>What it can answer</h2><ul><li>Open 311 requests in any community, the oldest ones and what changed this year</li><li>Crime by community and kind, against last year</li>'
            '<li>Growth, building permits and new homes</li><li>Comparisons between communities, wards and the whole city</li><li>Lists to download, such as every open request in a community</li></ul>',
            f'<h2>Sample answers</h2><p>These are worked out from the same public figures Data Genie uses, as of {e(updated)} (Calgary time). Ask your own on the dashboard.</p>',
            qa_html,
            '<h2>How to use it</h2><p>Data Genie is on the dashboard under <b>Ask the data</b>. Asking questions needs an approved account: sign in with Google, or use the passcode you were given. '
            'The figures, charts and snapshots around it are open to everyone.</p>',
            '<a class="cta" href="../?view=ask">Open Data Genie</a>',
            '<p><a href="../data-scientist/">Data Scientist: full reports</a> · <a href="../311/">311 in Calgary</a> · <a href="../crime/">Crime</a> · <a href="../growth/">Growth</a> · <a href="../communities/">All communities</a></p>',
            sources_p(city)]
    ld = [{'@type': 'WebApplication', 'name': 'Data Genie', 'url': SITE + 'ask/', 'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Web browser',
           'description': 'Ask questions about Calgary’s open data in plain words and get answers with charts, tables, maps and reports.',
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}},
          {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': re.sub('<[^>]+>', '', a)}} for q, a, _ in qa]}]
    write('ask/', 'Data Genie: ask Calgary’s open data in plain words | Calgary Insight',
          'An AI analyst for Calgary’s public data: ask about 311 requests, crime, growth and permits in any ward or community and get answers with charts, maps and sources.',
          'Data Genie', body, ld)

    # Data Scientist, with a short sample brief for Ward 5 worked out from the figures
    r5 = ws.get(5) or {}
    w5c = sorted([c for c in comms if c.get('ward') == 5 and c.get('open')], key=lambda c: -c['open'])[:6]
    sample = ''
    if r5:
        sample = ('<div class="qa"><h3>Sample: Ward 5 in brief</h3>'
                  f'<p>Ward 5 has {num(r5.get("residents"))} residents by the City’s estimate. It had {num(r5.get("requests12"))} 311 requests in {e(period)}, '
                  f'{num(r5.get("requests_per_1000"), 0)} per 1,000 a year, and {num(r5.get("open"))} requests are still marked open, {num(r5.get("open_over_90_days"))} of them for over 90 days. '
                  + (f'Police recorded {num(r5.get("crimes"))} crimes, {num(r5.get("crime_per_1000"), 1)} per 1,000 residents' + (f' ({pct(r5.get("crime_change_pct"))} on the year before)' if r5.get('crime_change_pct') is not None else '') + '. ' if r5.get('crimes') else '')
                  + 'Communities with the most open requests:</p>'
                  + bars([(c['name'], c['open'], cp(c)) for c in w5c], lambda v: num(v))
                  + '<p class="note">A full report adds trends since 2021, maps by community, comparisons with Calgary, findings, recommendations and an action plan, as a PDF with an Excel workbook of every figure.</p></div>')
    body = ['<h1>Data Scientist: full analysis reports on Calgary and any ward</h1>',
            '<p class="lead">Data Scientist writes complete, sourced reports from live public data: every figure worked out from the data itself, with charts, maps, '
            'findings, recommendations and an action plan. A second step, the report auditor, checks the figures and the reasoning before you read it.</p>',
            '<h2>What you get</h2><ul><li>A report as a PDF, ready to print or send</li><li>Interactive charts and maps</li><li>An Excel workbook with every figure behind the report</li></ul>',
            '<h2>How a report is made</h2><ol class="steps"><li><b>Gather the data:</b> the right public datasets for the question, for the area chosen</li>'
            '<li><b>Work out the figures:</b> calculated from the records themselves, not estimated</li><li><b>Draw charts and maps</b></li>'
            '<li><b>Write the report:</b> findings in plain words, each figure with its source</li><li><b>Audit:</b> a separate check of the numbers, the method and the conclusions</li></ol>',
            '<h2>Reports it is built for</h2><ul><li>How have vehicle thefts and break-ins changed in each community since 2021, with recommendations</li>'
            '<li>Where are 311 requests taking longest to close, and which kinds</li><li>A briefing on a community before a town hall or council meeting</li>'
            '<li>Growth and new housing against services in a ward</li><li>Your own question, described in plain words, with the visuals you want</li></ul>',
            '<div class="qa"><h3>Sample study: Who Calgary’s 311 Hears</h3><p>Two years of 311 requests across 195 communities show the City closes requests equally fast '
            'everywhere, but hears about 23% fewer infrastructure reports where more residents don’t speak English, even comparing like with like. '
            'The study sets out the findings, Ward 5 adjusted for growth, twelve recommendations and its limits.</p>'
            '<p><a href="../studies/who-calgarys-311-hears/">Read the study in brief →</a></p></div>',
            '<div class="qa"><h3>Sample report: Calgary’s ageing sewers, and how long sewer pipes last around the world</h3><p>Made by the Data Scientist from the City’s '
            'open data on all 368,085 public sanitary service connections: how old they are, what they are made of, how that compares with service lives used by utilities in '
            'Canada, Australia, the UK and Germany, where back-ups happen most, and what renewal would take. The full 18-page report, as published, with its charts, map and workbook.</p>'
            '<p><a href="../studies/calgary-sewers/">Read the report →</a></p></div>',
            sample,
            '<h2>Who it is for</h2><p>Ward offices and City staff, community associations, journalists, non-profits and researchers. Reports take about 3 to 8 minutes.</p>',
            '<h2>How to use it</h2><p>Data Scientist is on the dashboard under <b>Ask the data</b>. Making reports needs an approved account: sign in with Google, or use the passcode you were given. '
            'To ask for access or a report, write to hello@calgaryinsight.ca.</p>',
            '<a class="cta" href="../?view=scientist">Open Data Scientist</a>',
            '<p><a href="../ask/">Data Genie: quick answers</a> · <a href="../wards/5/">Ward 5</a> · <a href="../wards/">All wards</a> · <a href="../communities/">All communities</a></p>',
            sources_p(city)]
    ld = [{'@type': 'WebApplication', 'name': 'Data Scientist', 'url': SITE + 'data-scientist/', 'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Web browser',
           'description': 'Full analysis reports on Calgary and any ward from live public data, with charts, maps, recommendations and an audit of every figure.',
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}}]
    write('data-scientist/', 'Data Scientist: analysis reports on Calgary wards and communities | Calgary Insight',
          'Sourced analysis reports on Calgary and any ward from live public data: 311, crime, growth and permits, with charts, maps, recommendations and an audited action plan.',
          'Data Scientist', body, ld)
    return urls


STUDY = 'https://hassanaliarshad110.github.io/calgary-311/'


def study_pages(out, updated):
    """calgaryinsight.ca/studies/who-calgarys-311-hears/: the 311 equity study in brief, with links to the full study,
    its report to the City, method and data. The sample of the kind of work the Data Scientist is built for."""
    path = 'studies/who-calgarys-311-hears/'
    recs = [('Measure who 311 hears', ['Make “reports per 1,000 residents” an official 311 measure', 'Refresh the gap analysis every year']),
            ('Make reporting easier', ['Put 311 where people already are', 'Add photo-first reporting', 'Accept reports by text or WhatsApp', 'Close the loop']),
            ('Reward and encourage reporting', ['Fix-It Points', 'Community Care Challenge', '311 Community Ambassadors', 'Bring in young people']),
            ('Don’t rely on reports alone', ['Inspect proactively where reporting is low', 'Measure “fixed”, not just “closed”'])]
    n = 0
    rec_html = []
    for g, items in recs:
        lis = []
        for it in items:
            n += 1
            lis.append(f'<li value="{n}">{e(it)}</li>')
        rec_html.append(f'<h3>{e(g)}</h3><ol>{"".join(lis)}</ol>')
    body = ['<p class="kicker">Independent study · Calgary 311 data, October 2024 to September 2026</p>',
            '<h1>Who Calgary’s 311 Hears</h1>',
            '<p class="lead">Calgary’s 311 system closes requests just as quickly in poorer neighbourhoods as in richer ones. But it hears far less from '
            'neighbourhoods where many residents don’t speak English. For many problems, like a broken streetlight, a resident’s report is how the City finds out, '
            'so communities that report less risk having problems missed.</p>',
            '<div class="kpis">' + ''.join([
                kpi('Communities studied', '195', '2 years of 311 requests'),
                kpi('Fewer infrastructure reports', 'about 23%', 'like for like, where 5% vs 1% of residents don’t speak English (95% range 9% to 33%)'),
                kpi('Closed within 7 days', 'within 1.5%', 'of expected, in every income and language group'),
                kpi('Recommendations', '12', 'with a 12-month pilot plan')]) + '</div>',
            '<h2>What the study found</h2>',
            '<h3>1. Communities where more residents don’t speak English make far fewer infrastructure reports</h3>'
            '<p>Communities were split into four equal groups by the share of residents with no knowledge of English (2021 Census), and reports about roads, '
            'sidewalks, streetlights, water, sewers, parks and trees were counted per 1,000 residents. Comparing communities first settled in the same era, and then '
            'allowing for income, renters, community age and distance from downtown, the gap remains: about 23% fewer reports. It holds outside northeast Calgary, '
            'for roads, water and parks separately, in each year studied, and under 14 different models. Between the groups with the most and the fewest non-English '
            'speakers, reports are lower in 20 of 21 request types, including streetlights (23% lower), potholes (35%) and sidewalks (40%).</p>',
            '<h3>2. Once a request is made, the City closes it equally fast in every group</h3>'
            '<p>Each community’s requests were compared with the citywide speed for the same type of request in the same year. Across income and language groups, '
            'the share closed within 7 days is within 1.5% of expected, and within 0.6% at 30 days. Response is not the problem; the gap is in who reports.</p>',
            '<h3>3. Fewer requests come through the 311 app in lower-income and non-English-speaking areas</h3>'
            '<p>The share of requests made through the app is lower in these communities, which matters as the City adds languages to the 311 app.</p>',
            '<p class="note">Lower 311 reporting is not automatically good news: it can mean problems go unreported. That is why the study does not score communities “best” or “worst”.</p>',
            '<h2>Ward 5, adjusted for growth</h2>'
            '<p>Northeast Calgary has grown faster than the 2021 Census shows, so the study models today’s population for Ward 5’s communities. Adjusted, Ward 5 makes '
            '36.8 infrastructure reports per 1,000 residents a year, the lowest of the 14 wards (all study communities: 66.8), about 8% below similar communities; '
            'Taradale is 32% below and Martindale 26% below. 78.3% of its requests close within 7 days, against 75.8% for all study communities.</p>',
            '<h2>Twelve recommendations</h2><p>Most can be piloted within existing budgets.</p>' + ''.join(rec_html),
            '<h2>How it was measured, and its limits</h2>'
            '<p>Every non-duplicate 311 request from October 1, 2024 to September 30, 2026 (City of Calgary open data), across 30 common service types; 21 of them '
            'count as infrastructure. Residents from the 2021 Census; community characteristics from the City’s Calgary Equity Index, Census households and '
            'employment, property assessments and building permits. The like-for-like estimate is a population-weighted regression, with 13 alternative models and '
            'a 1,000-draw bootstrap that resamples whole areas.</p>'
            '<p>It shows a pattern, not its cause: fewer reports could partly reflect fewer problems, and the City finds some problems through its own inspections. '
            'Language figures are for Census areas, not individual residents. The full method explains every choice.</p>',
            '<h2>Read the full study</h2><ul>'
            f'<li><a href="{STUDY}">The full study</a>: an interactive map, profiles of all 195 communities with 52 indicators each, and video briefs</li>'
            f'<li><a href="{STUDY}downloads/Who-Calgarys-311-Hears_Report-to-the-City.pdf">Report to the City</a> (8-page PDF)</li>'
            f'<li><a href="{STUDY}downloads/Who-Calgarys-311-Hears_Methodology.pdf">Methodology</a> (PDF)</li>'
            f'<li><a href="{STUDY}downloads/calgary-311-community-indicators.csv">Community indicators</a> (CSV) and the <a href="{STUDY}downloads/Calgary-311-Study.zip">full study package</a> with source data and code</li>'
            '</ul>',
            '<p>This study is the kind of work the <a href="../../data-scientist/">Data Scientist</a> is built for: a question about Calgary answered from public data, '
            'every figure worked out and sourced, with findings, recommendations and its limits stated.</p>',
            '<a class="cta" href="../../data-scientist/">See the Data Scientist</a>',
            '<p class="note">An independent study, not affiliated with The City of Calgary. Data: City of Calgary Open Data, Open Government Licence – City of Calgary. '
            'Corrections and questions: hello@calgaryinsight.ca.</p>']
    ld = [{'@type': 'Report', 'name': 'Who Calgary’s 311 Hears', 'url': SITE + path, 'about': 'Equity in Calgary 311 reporting and response',
           'description': 'An independent study of who Calgary’s 311 system hears from, using two years of City of Calgary 311 open data across 195 communities.',
           'temporalCoverage': '2024-10-01/2026-09-30', 'spatialCoverage': {'@type': 'City', 'name': 'Calgary'},
           'sameAs': STUDY, 'isBasedOn': 'https://data.calgary.ca/', 'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}}]
    os.makedirs(os.path.join(out, path), exist_ok=True)
    with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page(path, 'Who Calgary’s 311 Hears: an independent study of equity in Calgary 311 | Calgary Insight',
                     'Calgary’s 311 closes requests equally fast everywhere, but hears about 23% fewer infrastructure reports where more residents don’t speak English. Findings, Ward 5, 12 recommendations and the full method.',
                     [('Calgary Insight', ''), ('Studies', 'studies/'), ('Who Calgary’s 311 Hears', path)], '\n'.join(body), ld, updated, og_type='article'))
    return [path]


def _md(t):
    """The report's light markdown (**bold**) as HTML."""
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', e(t))


def _paras(t):
    out, lst = [], []
    for block in re.split(r'\n\s*\n', t or ''):
        lines = [l for l in block.split('\n') if l.strip()]
        if lines and all(l.lstrip().startswith('- ') for l in lines):
            out.append('<ul>' + ''.join(f'<li>{_md(l.lstrip()[2:])}</li>' for l in lines) + '</ul>')
        elif lines:
            out.append(f'<p>{_md(" ".join(lines))}</p>')
    return ''.join(out)


# Every study and report published on the site, newest first: the Studies page (studies/) and the home page list these.
STUDIES = [
    {'path': 'studies/growth-or-spending/', 'kind': 'Independent study', 'date': 'November 13, 2026',
     'title': "Growth or Spending? Calgary's proposed 15% property tax increase",
     'blurb': 'Is the proposed increase about growth or about spending? The tax path against population and inflation, where the new money goes, '
              'who would pay more than 15% (houses) and less (condos), and how growth and amenities compare by ward. With a two-minute video.',
     'extra': [('growth-or-spending-15-percent-tax-study.pdf', 'Full study (PDF)')]},
    {'path': 'studies/what-calgarians-pay/', 'kind': 'Independent study', 'date': 'November 10, 2026',
     'title': 'What Calgarians pay: the proposed budget, and Calgary against seven Canadian cities',
     'blurb': 'What the proposed 2027 to 2030 budget would cost a typical Calgary home, and how Calgary’s City property tax and water, '
              'wastewater and waste bills compare with Edmonton, Vancouver, Toronto, Ottawa, Winnipeg, Saskatoon and Regina. With a calculator for your own bill.',
     'extra': [('calculator.html', 'Your City bill calculator'), ('what-calgarians-pay.pdf', 'Full study (PDF)'), ('what-calgarians-pay-calculations.xlsx', 'Calculation workbook (Excel)')]},
    {'path': 'studies/calgary-police/', 'kind': 'Independent study', 'date': 'November 10, 2026',
     'title': 'Calgary Police: performance, resources and the 2027 to 2030 budget request',
     'blurb': 'How Calgary’s police have performed since 2019 for the resources they have had, compared with five other large Canadian cities, '
              'and what the evidence says about the request for 309 more officers. With a budget calculator.',
     'extra': [('calculator.html', 'Budget calculator'), ('calgary-police-performance-study.pdf', 'Full study (PDF)')]},
    {'path': 'studies/calgary-sewers/', 'kind': 'Report', 'date': 'November 7, 2026',
     'title': 'Calgary’s ageing sewers, and how long sewer pipes last around the world',
     'blurb': 'The age and material of all 368,085 public sanitary service connections, compared with service lives used by utilities in Canada, '
              'Australia, the UK and Germany, where back-ups happen most, and what renewal would take.',
     'extra': [('calgary-sewer-ageing-report.pdf', 'Full report (PDF)')]},
    {'path': 'studies/who-calgarys-311-hears/', 'kind': 'Independent study', 'date': 'October 2024 to September 2026 data',
     'title': 'Who Calgary’s 311 Hears',
     'blurb': 'Two years of 311 requests across 195 communities: the City closes requests equally fast everywhere, but hears about 23% fewer '
              'infrastructure reports where more residents don’t speak English.',
     'extra': []},
]


def studies_index(out, updated):
    """calgaryinsight.ca/studies/: every study and report, each opening its summary page, which opens the full study."""
    have = [s for s in STUDIES if os.path.exists(os.path.join(out, s['path'], 'index.html'))]
    cards = ''.join(
        f'<article class="study"><p class="kicker">{e(s["kind"])} · {e(s["date"])}</p>'
        f'<h2><a href="{e(s["path"][8:])}">{e(s["title"])}</a></h2><p>{e(s["blurb"])}</p>'
        f'<p class="study-links"><a class="cta" href="{e(s["path"][8:])}">{"Read the report" if s["kind"] == "Report" else "Read the study"}</a>'
        + ''.join(f' <a href="{e(s["path"][8:] + u)}">{e(t)}</a>' for u, t in s['extra']) + '</p></article>'
        for s in have)
    body = ('<h1>Studies and reports</h1><p class="lead">In-depth studies of Calgary from public data: each one opens with a summary of what it found, '
            'and links from there to the full study, its sources and every figure.</p>' + cards
            + '<p class="note">Independent analysis, not affiliated with The City of Calgary or the Calgary Police Service. Corrections and responses: hello@calgaryinsight.ca.</p>')
    ld = [{'@type': 'CollectionPage', 'name': 'Calgary Insight studies and reports', 'url': SITE + 'studies/',
           'hasPart': [{'@type': 'Report', 'name': s['title'], 'url': SITE + s['path']} for s in have]}]
    os.makedirs(os.path.join(out, 'studies'), exist_ok=True)
    with open(os.path.join(out, 'studies', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page('studies/', 'Studies and reports on Calgary | Calgary Insight',
                     'In-depth studies of Calgary from public data: the proposed 15% tax increase, what Calgarians pay against other cities, police performance and the budget request, ageing sewers, and who Calgary’s 311 hears.',
                     [('Calgary Insight', ''), ('Studies', 'studies/')], body, ld, updated))
    return ['studies/']


def police_page(out, updated):
    """calgaryinsight.ca/studies/calgary-police/: the police performance and resources study, with its PDF, interactive
    version, workbook and budget calculator beside it (web/studies/calgary-police/, copied by build_site)."""
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'studies', 'calgary-police', 'spec.json')
    if not os.path.exists(here):
        return []
    with open(here, encoding='utf-8') as f:
        r = json.load(f)
    path = 'studies/calgary-police/'
    body = ['<p class="kicker">Independent study · Calgary Insight · November 10, 2026</p>',
            f'<h1>{e(r["title"])}</h1>', f'<p class="lead">{e(r.get("subtitle") or "")}</p>',
            '<div class="facts"><h2>In short</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r.get('summary') or []) + '</ul></div>',
            '<div class="study-open"><a class="cta" href="report.html">Read the full study</a> <a class="cta alt" href="calculator.html">Try the budget calculator</a>'
            '<p><a href="calgary-police-performance-study.pdf">The full study as a PDF</a> · <a href="calgary-police-performance-figures.xlsx">Every figure (Excel)</a> · '
            '<a href="#s1">Read the findings on this page ↓</a></p></div>']
    for i, sec in enumerate(r.get('sections') or [], 1):
        body.append(f'<h2 id="s{i}">{i}. {e(sec.get("heading") or "")}</h2>{_paras(sec.get("text"))}')
        tabs = [v for v in sec.get('visuals') or [] if v.get('type') == 'table']
        for t in tabs[:1]:
            body.append(f'<h3>{e(t.get("title") or "")}</h3><div class="wrap"><table><thead><tr>' + ''.join(f'<th>{e(c)}</th>' for c in t['columns'])
                        + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{e(x)}</td>' for x in row) + '</tr>' for row in t['rows'][:15]) + '</tbody></table></div>')
    if r.get('conclusion'):
        body.append('<h2>Conclusion</h2>' + _paras(r['conclusion']))
    recs = r.get('recommendations') or []
    if recs:
        body.append('<h2>Recommendations</h2><ol>' + ''.join(
            f'<li><b>{e(x.get("title") or "")}</b> <span class="note">({e(x.get("priority") or "")} priority)</span><br>{e(x.get("detail") or "")}</li>' for x in recs) + '</ol>')
    ap = r.get('action_plan') or []
    if ap:
        body.append('<h2>Next steps</h2><div class="wrap"><table><thead><tr><th>Step</th><th>Who</th><th>How we would know</th></tr></thead><tbody>'
                    + ''.join(f'<tr><td>{e(x.get("action") or "")}</td><td>{e(x.get("owner") or "")}</td><td>{e(x.get("measure") or "")}</td></tr>' for x in ap) + '</tbody></table></div>')
    if r.get('method'):
        body.append('<h2>Method</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['method']) + '</ul>')
    if r.get('limitations'):
        body.append('<h2>Limits</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['limitations']) + '</ul>')
    if r.get('data_sources'):
        body.append('<h2>Data sources</h2><ul>' + ''.join(
            f'<li><a href="{e(x.get("url") or "")}">{e(x.get("name") or "")}</a>, {e(x.get("publisher") or "")}{(" (" + e(x["period"]) + ")") if x.get("period") else ""}</li>'
            for x in r['data_sources']) + '</ul>')
    body += ['<a class="cta" href="calculator.html">Try the police budget calculator</a>',
             '<p><a href="../../crime/">Crime in Calgary by ward and community</a> · <a href="../who-calgarys-311-hears/">Who Calgary’s 311 Hears</a> · <a href="../../communities/">All communities</a></p>',
             '<p class="note">Independent analysis. Not affiliated with the Calgary Police Service, the Calgary Police Commission or The City of Calgary. '
             'Statistics Canada data under the Statistics Canada Open Licence. Corrections and responses: hello@calgaryinsight.ca.</p>']
    ld = [{'@type': 'Report', 'name': r['title'], 'url': SITE + path, 'description': r.get('subtitle') or '', 'datePublished': '2026-11-10',
           'spatialCoverage': {'@type': 'City', 'name': 'Calgary'}, 'encoding': [{'@type': 'MediaObject', 'contentUrl': SITE + path + 'calgary-police-performance-study.pdf', 'encodingFormat': 'application/pdf'}],
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}}]
    desc = re.sub(r'[*]', '', ' '.join((r.get('summary') or [])[:2]))[:300]
    os.makedirs(os.path.join(out, path), exist_ok=True)
    with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page(path, 'Calgary Police: performance, resources and the 2027 to 2030 budget request | Calgary Insight', desc,
                     [('Calgary Insight', ''), ('Studies', 'studies/'), ('Calgary Police study', path)], '\n'.join(body), ld, updated, og_type='article'))
    return [path, path + 'calculator.html']


def growth_page(out, updated):
    """calgaryinsight.ca/studies/growth-or-spending/: the proposed 15% property tax increase against growth, inflation and
    spending, who would pay more than 15%, and growth against amenities by ward, with the full technical report (PDF) and the
    video beside it (web/studies/growth-or-spending/, copied by build_site)."""
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'studies', 'growth-or-spending', 'spec.json')
    if not os.path.exists(here):
        return []
    with open(here, encoding='utf-8') as f:
        r = json.load(f)
    path = 'studies/growth-or-spending/'
    pdf = 'growth-or-spending-15-percent-tax-study.pdf'
    body = [f'<p class="kicker">Independent study · Calgary Insight · {e(r.get("date") or "")}</p>',
            f'<h1>{e(r["title"])}</h1>', f'<p class="lead">{e(r.get("subtitle") or "")}</p>',
            '<div class="facts"><h2>In short</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r.get('summary') or []) + '</ul></div>',
            f'<div class="study-open"><a class="cta" href="{pdf}">Read the full study (PDF)</a>'
            '<p><a href="#video">Watch the two-minute video</a> · <a href="#s1">Read the findings on this page ↓</a></p></div>',
            '<h2 id="video">The study in two minutes</h2>'
            '<video controls preload="none" playsinline poster="../../video/growth-or-spending.jpg" style="width:100%;max-width:960px;border-radius:12px">'
            '<source src="../../video/growth-or-spending.mp4" type="video/mp4">'
            'Your browser can’t play this video. <a href="../../video/growth-or-spending.mp4">Download it (MP4)</a>.</video>']
    for i, sec in enumerate(r.get('sections') or [], 1):
        body.append(f'<h2 id="s{i}">{i}. {e(sec.get("heading") or "")}</h2>{_paras(sec.get("text"))}')
        for t in [v for v in sec.get('visuals') or [] if v.get('type') == 'table'][:3]:
            body.append(f'<h3>{e(t.get("title") or "")}</h3><div class="wrap"><table><thead><tr>' + ''.join(f'<th>{e(c)}</th>' for c in t['columns'])
                        + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{e(x)}</td>' for x in row) + '</tr>' for row in t['rows'][:15]) + '</tbody></table></div>')
    if r.get('conclusion'):
        body.append('<h2>Conclusion</h2>' + _paras(r['conclusion']))
    if r.get('method'):
        body.append('<h2>Method</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['method']) + '</ul>')
    if r.get('limitations'):
        body.append('<h2>Limits</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['limitations']) + '</ul>')
    if r.get('data_sources'):
        body.append('<h2>Data sources</h2><ul>' + ''.join(
            f'<li><a href="{e(x.get("url") or "")}">{e(x.get("name") or "")}</a>, {e(x.get("publisher") or "")}</li>' for x in r['data_sources']) + '</ul>')
    body += [f'<a class="cta" href="{pdf}">Read the full study (PDF)</a>',
             '<p><a href="../what-calgarians-pay/">What Calgarians pay: Calgary against seven cities</a> · <a href="../../?view=budget-intelligence">Budget Intelligence</a></p>',
             '<p class="note">Independent analysis of a proposed budget. Not affiliated with The City of Calgary. Corrections and responses: hello@calgaryinsight.ca.</p>']
    ld = [{'@type': 'Report', 'name': r['title'], 'url': SITE + path, 'description': r.get('subtitle') or '', 'datePublished': '2026-11-13',
           'spatialCoverage': {'@type': 'City', 'name': 'Calgary'}, 'encoding': [{'@type': 'MediaObject', 'contentUrl': SITE + path + pdf, 'encodingFormat': 'application/pdf'}],
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}}]
    desc = re.sub(r'[*]', '', ' '.join((r.get('summary') or [])[:2]))[:300]
    os.makedirs(os.path.join(out, path), exist_ok=True)
    with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page(path, "Growth or Spending? Calgary's proposed 15% property tax increase | Calgary Insight", desc,
                     [('Calgary Insight', ''), ('Studies', 'studies/'), ('Growth or Spending?', path)], '\n'.join(body), ld, updated, og_type='article'))
    return [path]


def pay_page(out, updated):
    """calgaryinsight.ca/studies/what-calgarians-pay/: what the proposed 2027-2030 budget would cost a typical Calgary home,
    and Calgary's City tax and utility bills against seven other Canadian cities, with the PDF, interactive version,
    workbook and household calculator beside it (web/studies/what-calgarians-pay/, copied by build_site)."""
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'studies', 'what-calgarians-pay', 'spec.json')
    if not os.path.exists(here):
        return []
    with open(here, encoding='utf-8') as f:
        r = json.load(f)
    path = 'studies/what-calgarians-pay/'
    body = ['<p class="kicker">Independent study · Calgary Insight · November 10, 2026</p>',
            f'<h1>{e(r["title"])}</h1>', f'<p class="lead">{e(r.get("subtitle") or "")}</p>',
            '<div class="facts"><h2>In short</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r.get('summary') or []) + '</ul></div>',
            '<div class="study-open"><a class="cta" href="report.html">Read the full study</a> <a class="cta alt" href="calculator.html">Work out your own bill</a>'
            '<p><a href="what-calgarians-pay.pdf">The full study as a PDF</a> · <a href="what-calgarians-pay-calculations.xlsx">The calculation workbook (Excel: every input, source and formula)</a> · <a href="what-calgarians-pay-figures.xlsx">Every figure (Excel)</a> · '
            '<a href="#s1">Read the findings on this page ↓</a></p></div>']
    for i, sec in enumerate(r.get('sections') or [], 1):
        body.append(f'<h2 id="s{i}">{i}. {e(sec.get("heading") or "")}</h2>{_paras(sec.get("text"))}')
        tabs = [v for v in sec.get('visuals') or [] if v.get('type') == 'table']
        for t in tabs[:1]:
            body.append(f'<h3>{e(t.get("title") or "")}</h3><div class="wrap"><table><thead><tr>' + ''.join(f'<th>{e(c)}</th>' for c in t['columns'])
                        + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{e(x)}</td>' for x in row) + '</tr>' for row in t['rows'][:15]) + '</tbody></table></div>')
    if r.get('conclusion'):
        body.append('<h2>Conclusion</h2>' + _paras(r['conclusion']))
    recs = r.get('recommendations') or []
    if recs:
        body.append('<h2>Options to consider</h2><ol>' + ''.join(
            f'<li><b>{e(x.get("title") or "")}</b><br>{e(x.get("detail") or "")}</li>' for x in recs) + '</ol>')
    ap = r.get('action_plan') or []
    if ap:
        body.append('<h2>Next steps</h2><div class="wrap"><table><thead><tr><th>Step</th><th>Who</th><th>How we would know</th></tr></thead><tbody>'
                    + ''.join(f'<tr><td>{e(x.get("action") or "")}</td><td>{e(x.get("owner") or "")}</td><td>{e(x.get("measure") or "")}</td></tr>' for x in ap) + '</tbody></table></div>')
    if r.get('method'):
        body.append('<h2>Method</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['method']) + '</ul>')
    if r.get('limitations'):
        body.append('<h2>Limits</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['limitations']) + '</ul>')
    if r.get('data_sources'):
        body.append('<h2>Data sources</h2><ul>' + ''.join(
            f'<li><a href="{e(x.get("url") or "")}">{e(x.get("name") or "")}</a>{(", " + e(x["publisher"])) if x.get("publisher") else ""}{(" (" + e(x["period"]) + ")") if x.get("period") else ""}</li>'
            for x in r['data_sources']) + '</ul>')
    body += ['<a class="cta" href="calculator.html">Work out your own City bill, 2026 to 2030</a>',
             '<p><a href="../../?view=budget">The City budget, with the proposed 2027 to 2030 budget</a> · <a href="../">All studies</a> · <a href="../calgary-police/">The Calgary Police study</a></p>',
             '<p class="note">Independent analysis. Not affiliated with The City of Calgary or any other city. Rates and budgets as published to November 10, 2026. '
             'Statistics Canada data under the Statistics Canada Open Licence. Corrections and responses: hello@calgaryinsight.ca.</p>']
    ld = [{'@type': 'Report', 'name': r['title'], 'url': SITE + path, 'description': r.get('subtitle') or '', 'datePublished': '2026-11-10',
           'spatialCoverage': {'@type': 'City', 'name': 'Calgary'}, 'encoding': [{'@type': 'MediaObject', 'contentUrl': SITE + path + 'what-calgarians-pay.pdf', 'encodingFormat': 'application/pdf'}],
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}}]
    desc = re.sub(r'[*]', '', ' '.join((r.get('summary') or [])[:2]))[:300]
    os.makedirs(os.path.join(out, path), exist_ok=True)
    with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page(path, 'What Calgarians pay: the proposed budget and seven Canadian cities | Calgary Insight', desc,
                     [('Calgary Insight', ''), ('Studies', 'studies/'), ('What Calgarians pay', path)], '\n'.join(body), ld, updated, og_type='article'))
    # the short address said in the study's video: calgaryinsight.ca/bill opens the household calculator
    os.makedirs(os.path.join(out, 'bill'), exist_ok=True)
    with open(os.path.join(out, 'bill', 'index.html'), 'w', encoding='utf-8') as f:
        f.write('<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><title>Your City bill calculator | Calgary Insight</title>'
                f'<meta name="robots" content="noindex"><link rel="canonical" href="{SITE}{path}calculator.html">'
                f'<meta http-equiv="refresh" content="0; url=/{path}calculator.html"></head><body>'
                f'<p><a href="/{path}calculator.html">Work out your own City bill, 2026 to 2030</a></p></body></html>')
    return [path, path + 'calculator.html']


def sewer_page(out, updated):
    """calgaryinsight.ca/studies/calgary-sewers/: a Data Scientist report, published in full as a sample, with the PDF,
    the interactive version and the workbook beside it (web/studies/calgary-sewers/, copied by build_site)."""
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'studies', 'calgary-sewers', 'spec.json')
    if not os.path.exists(here):
        return []
    with open(here, encoding='utf-8') as f:
        r = json.load(f)
    path = 'studies/calgary-sewers/'
    body = ['<p class="kicker">Sample report · made by the Data Scientist · November 7, 2026</p>',
            f'<h1>{e(r["title"])}</h1>', f'<p class="lead">{e(r.get("subtitle") or "")}</p>',
            '<p><a class="cta" href="calgary-sewer-ageing-report.pdf">The full report (PDF, 18 pages)</a></p>'
            '<p><a href="report.html">Interactive version with charts and the community map</a> · <a href="calgary-sewer-ageing-figures.xlsx">Every figure (Excel)</a></p>',
            '<div class="facts"><h2>In short</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r.get('summary') or []) + '</ul></div>']
    for i, sec in enumerate(r.get('sections') or [], 1):
        body.append(f'<h2>{i}. {e(sec.get("heading") or "")}</h2>{_paras(sec.get("text"))}')
    if r.get('conclusion'):
        body.append('<h2>Conclusion</h2>' + _paras(r['conclusion']))
    recs = r.get('recommendations') or []
    if recs:
        body.append('<h2>Recommendations</h2><ol>' + ''.join(
            f'<li><b>{e(x.get("title") or "")}</b> <span class="note">({e(x.get("priority") or "")} priority)</span><br>{e(x.get("detail") or "")}</li>' for x in recs) + '</ol>')
    ap = r.get('action_plan') or []
    if ap:
        body.append('<h2>Action plan</h2><div class="wrap"><table><thead><tr><th>Action</th><th>Who</th><th>How we would know</th></tr></thead><tbody>'
                    + ''.join(f'<tr><td>{e(x.get("action") or "")}</td><td>{e(x.get("owner") or "")}</td><td>{e(x.get("measure") or "")}</td></tr>' for x in ap) + '</tbody></table></div>')
    if r.get('method'):
        body.append('<h2>Method</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['method']) + '</ul>')
    if r.get('limitations'):
        body.append('<h2>Limits</h2><ul>' + ''.join(f'<li>{_md(x)}</li>' for x in r['limitations']) + '</ul>')
    if r.get('data_sources'):
        body.append('<h2>Data sources</h2><ul>' + ''.join(
            f'<li><a href="{e(x.get("url") or "")}">{e(x.get("name") or "")}</a>, {e(x.get("publisher") or "")}{(" (" + e(x["period"]) + ")") if x.get("period") else ""}</li>'
            for x in r['data_sources']) + '</ul>')
    body += ['<p>This report was made by the <a href="../../data-scientist/">Data Scientist</a> from the question: '
             f'<i>“{e(r.get("question") or "")}”</i> Every figure is worked out from the City’s open data and checked by the report auditor.</p>',
             '<a class="cta" href="../../data-scientist/">See the Data Scientist</a>',
             '<p><a href="../who-calgarys-311-hears/">Who Calgary’s 311 Hears</a> · <a href="../../ask/">Data Genie</a> · <a href="../../communities/">All communities</a></p>',
             '<p class="note">Not affiliated with The City of Calgary. Data: City of Calgary Open Data, Open Government Licence – City of Calgary. Corrections: hello@calgaryinsight.ca.</p>']
    ld = [{'@type': 'Report', 'name': r['title'], 'url': SITE + path, 'description': r.get('subtitle') or '', 'datePublished': '2026-11-07',
           'spatialCoverage': {'@type': 'City', 'name': 'Calgary'}, 'encoding': [{'@type': 'MediaObject', 'contentUrl': SITE + path + 'calgary-sewer-ageing-report.pdf', 'encodingFormat': 'application/pdf'}],
           'publisher': {'@type': 'Organization', 'name': 'Calgary Insight', 'url': SITE}}]
    desc = re.sub(r'\*\*', '', ' '.join((r.get('summary') or [])[:2]))[:300]
    os.makedirs(os.path.join(out, path), exist_ok=True)
    with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page(path, 'Calgary’s ageing sewers: how old the pipes are and how long sewer pipes last | Calgary Insight', desc,
                     [('Calgary Insight', ''), ('Data Scientist', 'data-scientist/'), ('Calgary’s ageing sewers', path)], '\n'.join(body), ld, updated, og_type='article'))
    return [path]
