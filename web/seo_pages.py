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
"""


def page(path, title, desc, crumbs, body, ld_extra=None, updated=''):
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
<meta property="og:type" content="website"><meta property="og:site_name" content="Calgary Insight">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(url)}"><meta property="og:image" content="{SITE}og-image.png"><meta property="og:locale" content="en_CA">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, separators=(',', ':'))}</script>
</head><body>
<header class="top"><a href="{up}"><img src="{up}logo.svg" alt="" width="28" height="28">Calgary Insight</a></header>
<main>
<nav class="crumbs" aria-label="Breadcrumb">{' › '.join(f'<a href="{up}{p}">{e(n)}</a>' for n, p in crumbs[:-1])} › {e(crumbs[-1][0])}</nav>
{body}
</main>
<footer><p>Calgary Insight is independent and non-partisan, made from public data and refreshed every morning{f" (these figures: {e(updated)}, Calgary time)" if updated else ""}. It is not affiliated with The City of Calgary. <a href="{up}about/">About</a> · <a href="{up}wards/">All wards</a> · <a href="{up}communities/">All communities</a></p></footer>
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
    body += ['<a class="cta" href="../?view=safety">Open crime on the dashboard</a>',
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
