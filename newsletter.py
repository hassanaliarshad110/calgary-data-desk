"""Ward 5 community update: a newsletter for any range of months, made from the dashboard's figures.

render() turns one dashboard (built for the chosen months) into a printable page; to_pdf() prints that page to a
PDF with Microsoft Edge, which every Windows 10 and 11 computer has, so nothing extra needs installing.
"""
import datetime as dt
import html
import os
import pathlib
import re
import shutil
import subprocess
import tempfile

SECTIONS = [
    ('glance', 'At a glance'),
    ('requests', 'What residents reported to 311'),
    ('communities', 'Community by community'),
    ('open', 'Requests still open'),
    ('growth', 'Growth and new development'),
    ('families', 'Families, child care and schools'),
    ('safety', 'Crime and safety'),
    ('rents', 'Rents and vacancy'),
    ('investment', 'Investment coming to Ward 5'),
    ('roads', 'Road construction'),
    ('contact', 'Contact the office'),
]
DEFAULT_TITLE = 'Ward 5 Community Update'
CONTACT_PAGE = 'https://www.calgary.ca/council/ward-5/contact-ward-5.html'


def e(v):
    return html.escape(str(v if v is not None else ''))


def n(v, d=0):
    if v is None:
        return '–'
    try:
        return f'{float(v):,.{d}f}'
    except (TypeError, ValueError):
        return e(v)


POP_NOTE = {
    'model': "Residents today are estimated with the Ward 5 growth model (homes on the City's property roll times 2021 "
             "Census people per home).",
    'census2021': 'Residents are counted as at the 2021 Census, without growth since then (the same base as the City\'s 311 ward '
                  'dashboard, which shows requests per 2021 Census household). Fast-growing communities have more residents today, so their rates per 1,000 look higher.',
    'city_pace': "Residents are the 2021 Census grown at one rate for all of Calgary, so the city adds up to the City's "
                 "own population estimate and forecast. Communities where many homes were built are likely undercounted.",
}


def chg(v, up_is_bad=None, unit='%'):
    """A change written in words as well as colour: 'up 4.4%'."""
    if v is None:
        return ''
    if abs(v) < 1:
        return '<span class="chg flat">about the same</span>'
    up = v > 0
    cls = 'neutral' if up_is_bad is None else ('bad' if up == up_is_bad else 'good')
    return f'<span class="chg {cls}">{"up" if up else "down"} {abs(v):,.1f}{unit}</span>'


def fell(v):
    """True when a change went down by at least 1%."""
    return v is not None and v <= -1


def rose(v):
    return v is not None and v >= 1


def _month_name(ym):
    y, m = int(ym[:4]), int(ym[5:7])
    return dt.date(y, m, 1).strftime('%B %Y')


def period_words(D):
    ps = D.get('period_spec') or {}
    if ps.get('start') == ps.get('end'):
        return _month_name(ps['start'])
    a, b = _month_name(ps['start']), _month_name(ps['end'])
    if a[-4:] == b[-4:]:
        a = a[:-5]
    return f'{a} to {b}'


def prev_words(D):
    ps = D.get('period_spec') or {}
    if ps.get('cstart') == ps.get('cend'):
        return _month_name(ps['cstart'])
    return f"{_month_name(ps['cstart'])} to {_month_name(ps['cend'])}"


def _bars_svg(labels, cur, prev=None, w=640, h=135):
    """Monthly bars (this period) with the same months a year earlier as thin grey bars."""
    if not cur:
        return ''
    top = max(cur + (prev or [])) or 1
    pad_l, pad_b, pad_t = 34, 24, 8
    cw = (w - pad_l) / len(cur)
    bw = min(34, cw * .56)
    out = [f'<svg viewBox="0 0 {w} {h}" class="bars" role="img" aria-label="311 requests by month">']
    for k in range(0, 5):
        y = pad_t + (h - pad_b - pad_t) * (1 - k / 4)
        out.append(f'<line x1="{pad_l}" x2="{w}" y1="{y:.1f}" y2="{y:.1f}" class="grid"/>'
                   f'<text x="{pad_l - 6}" y="{y + 4:.1f}" class="ax" text-anchor="end">{n(top * k / 4)}</text>')
    for i, v in enumerate(cur):
        x = pad_l + i * cw + (cw - bw) / 2
        if prev and i < len(prev) and prev[i] is not None:
            ph = (h - pad_b - pad_t) * prev[i] / top
            out.append(f'<rect x="{x + bw + 2:.1f}" y="{h - pad_b - ph:.1f}" width="{max(3, bw * .22):.1f}" height="{ph:.1f}" class="prev"/>')
        bh = (h - pad_b - pad_t) * v / top
        out.append(f'<rect x="{x:.1f}" y="{h - pad_b - bh:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="2" class="cur"/>')
        if len(cur) <= 14 or i % 2 == 0:
            out.append(f'<text x="{x + bw / 2:.1f}" y="{h - 8}" class="ax" text-anchor="middle">{e(labels[i])}</text>')
    out.append('</svg>')
    return ''.join(out)


def _hbars(rows, label_key, value_key, maxn=8, extra=None):
    rows = rows[:maxn]
    top = max([r[value_key] or 0 for r in rows] + [1])
    li = []
    for r in rows:
        li.append(f'<li><span class="lbl">{e(r[label_key])}</span><span class="track"><span style="width:{(r[value_key] or 0) / top * 100:.1f}%"></span></span>'
                  f'<span class="v">{n(r[value_key])}</span>{extra(r) if extra else ""}</li>')
    return '<ul class="hbars">' + ''.join(li) + '</ul>'


def render(D, opts=None):
    opts = opts or {}
    on = set(opts.get('sections') or [k for k, _ in SECTIONS])
    title = (opts.get('title') or DEFAULT_TITLE).strip()
    message = (opts.get('message') or '').strip()
    good = opts.get('positive_only', True) is not False     # good news only: leave out figures that got worse
    s = D.get('summary') or {}
    ward = D.get('ward') or {}
    pop_method = (D.get('population') or {}).get('method') or 'model'
    months = (D.get('period_spec') or {}).get('months') or 12
    per = period_words(D)
    prev = prev_words(D)
    rate_words = 'a year' if months != 12 else 'a year'
    names = {c['code']: c['name'] for c in D.get('communities') or []}
    import dashboard
    today = dashboard.calgary_now().strftime('%B %d, %Y').replace(' 0', ' ')
    parts = []

    def gchg(v, up_is_bad=None):
        """In good-news mode, only changes that read well: falls in problems, rises in homes and investment."""
        if not good:
            return chg(v, up_is_bad)
        if up_is_bad is None:                       # counts of reports: show only a fall
            return chg(v, True) if fell(v) else ''
        return chg(v, up_is_bad) if (fell(v) if up_is_bad else rose(v)) else ''

    # ---- cover band
    parts.append(f'''<header class="band">
  <div class="band-l"><p class="kicker">City of Calgary · Ward 5</p><h1 contenteditable="true">{e(title)}</h1>
    <p class="per">{e(per)}</p></div>
  <div class="band-r"><p><b>{("Councillor " + e(ward.get("councillor"))) if ward.get("councillor") else "All 14 wards"}</b></p><p>Published {e(today)}</p>
    <p class="small">Figures compare {e(per)} with {e(prev)}.</p></div>
</header>''')
    if message:
        paras = ''.join(f'<p>{e(p)}</p>' for p in message.split('\n') if p.strip())
        parts.append(f'<section class="msg"><h2>{"A message from the Councillor" if ward.get("councillor") else "A message"}</h2>{paras}</section>')

    # ---- at a glance
    if 'glance' in on:
        dv = D.get('development') or {}
        c7, c7c = s.get('closed_7_days_pct'), s.get('closed_7_days_pct_city')
        tiles = [
            (('Residents (2021 Census)', n(ward.get('residents')), 'as counted on May 11, 2021', '')
             if pop_method == 'census2021' else
             ('Residents today', n(ward.get('residents')), f'{n(ward.get("growth_pct"), 1)}% more than the 2021 Census ({n(ward.get("census2021"))})'
              + ('' if pop_method == 'model' else ", grown to the City's total"), '')),
            ('311 requests', n(s.get('requests12')), f'{n(s.get("requests_per_1000"), 0)} per 1,000 residents {rate_words}', gchg(s.get('requests_change_pct'), None)),
            None if good else ('Road, water and park problems', n(s.get('infra12')), f'{n(s.get("infra_per_1000"), 1)} per 1,000 residents {rate_words}', ''),
            ('Closed within 7 days', f'{n(c7, 1)}%', 'of the requests closed so far'
             + ('' if good and (c7 or 0) < (c7c or 0) else f'; City as a whole: {n(c7c, 1)}%'), ''),
            ('Homes in building permits issued', n(s.get('issued_homes12')), 'new homes approved to be built', gchg(s.get('issued_homes_change_pct'), False)),
            ('Larger development applications', n(dv.get('larger')), 'new buildings, changes of use, commercial', gchg(dv.get('larger_change_pct'), False)),
            None if good else ('Requests still open today', n(s.get('open_now')), f'{n(s.get("open_over_90_days"))} open more than 90 days', ''),
            ('Traffic incidents', n(s.get('traffic12')), 'reported with a location in Ward 5', chg(s.get('traffic_change_pct'), True))
            if not good or fell(s.get('traffic_change_pct')) else None,
        ]
        tiles = [t for t in tiles if t]
        parts.append('<section><h2>At a glance</h2><div class="tiles">' + ''.join(
            f'<div class="tile"><p class="t">{e(a)}</p><p class="v">{b}</p><p class="f">{e(c)} {d}</p></div>' for a, b, c, d in tiles)
            + f'<p class="note">Changes compare {e(per)} with {e(prev)}. Rates per 1,000 residents a year use the estimated population for each period.</p></div></section>')

    # ---- 311
    if 'requests' in on:
        tr = D.get('trend') or {}
        lab = [dt.date(int(m[:4]), int(m[5:7]), 1).strftime('%b') for m in tr.get('months') or []]
        chart = _bars_svg(lab, tr.get('all') or [], tr.get('prev') if len(tr.get('prev') or []) == len(tr.get('all') or []) else None) if len(lab) > 1 else ''
        areas = [a for a in D.get('service_areas') or [] if a.get('n12')][:8]
        parts.append(f'''<section><h2>What was reported to 311</h2>
  <p>311 received <b>{n(s.get("requests12"))}</b> requests about places in Ward 5 in {e(per)}{"." if good and not fell(s.get("requests_change_pct")) else ", " + (chg(s.get("requests_change_pct"), None) or "about the same") + (" as " if s.get("requests_change_pct") is None or abs(s.get("requests_change_pct")) < 1 else " on ") + e(prev) + "."}
  {n(s.get("app_share_pct"), 1)}% were made through the 311 app (city: {n(s.get("app_share_pct_city"), 1)}%).</p>
  {f'<figure>{chart}<figcaption>311 requests by month. Thin grey bars: the same month a year earlier.</figcaption></figure>' if chart else ''}
  <h3>By City service</h3>
  {_hbars(areas, "area", "n12", 8, lambda r: f'<span class="c">{gchg(r.get("change_pct"), None)}</span>')}
</section>''')

    # ---- communities
    if 'communities' in on:
        rows = [c for c in D.get('communities') or [] if c.get('residential')]
        rows.sort(key=lambda c: -(c.get('requests12') or 0))
        if good:
            body = ''.join(f'<tr><td>{e(c["name"])}</td><td class="num">{n(c.get("residents"))}</td><td class="num">{n(c.get("requests12"))}</td>'
                           f'<td class="num">{n(c.get("requests_per_1000"))}</td>'
                           f'<td class="num">{n(c.get("issued_homes12"))}</td></tr>' for c in rows)
            head = ('<th>Community</th><th class="num">Residents today</th><th class="num">311 requests</th><th class="num">Per 1,000 a year</th>'
                    '<th class="num">New homes approved</th>')
        else:
            body = ''.join(f'<tr><td>{e(c["name"])}</td><td class="num">{n(c.get("residents"))}</td><td class="num">{n(c.get("requests12"))}</td>'
                           f'<td class="num">{n(c.get("requests_per_1000"))}</td><td>{chg(c.get("requests_change_pct"), None)}</td>'
                           f'<td class="num">{n(c.get("infra_per_1000"), 1)}</td><td class="num">{n(c.get("open"))}</td>'
                           f'<td class="num">{n(c.get("issued_homes12"))}</td></tr>' for c in rows)
            head = ('<th>Community</th><th class="num">Residents today</th><th class="num">311 requests</th><th class="num">Per 1,000 a year</th>'
                    '<th>Change</th><th class="num">Road, water, parks per 1,000</th><th class="num">Still open</th><th class="num">New homes approved</th>')
        parts.append(f'''<section class="keep"><h2>Community by community</h2>
  <table><thead><tr>{head}</tr></thead>
  <tbody>{body}</tbody></table>
  <p class="note">{e(POP_NOTE.get((D.get('population') or {}).get('method') or 'model', POP_NOTE['model']))}</p>
</section>''')

    # ---- open requests
    if 'open' in on and not good:
        types = [t for t in D.get('open_by_type') or [] if t['type'] != '311 Contact Us'][:6]
        contact = next((t['n'] for t in D.get('open_by_type') or [] if t['type'] == '311 Contact Us'), 0)
        li = ''.join(f'<li><span class="lbl">{e(t["type"])}</span><span class="v">{n(t["n"])}</span><span class="c">oldest from {e(t["oldest"][:4])}</span></li>' for t in types)
        parts.append(f'''<section class="keep"><h2>Requests still open</h2>
  <p><b>{n(s.get("open_now"))}</b> Ward 5 requests are still marked open in the City's records today, and <b>{n(s.get("open_over_90_days"))}</b> of them have been open more than 90 days.
  Some are years old and may have been dealt with without the record being closed. If a problem near you is still not fixed, please report it again to 311 or contact our office.</p>
  <ul class="plain">{li}</ul>
  {f'<p class="note">Not counted above: {n(contact)} open "311 Contact Us" general enquiries.</p>' if contact else ''}
</section>''')

    # ---- growth
    if 'growth' in on:
        dv = D.get('development') or {}
        pop = D.get('population') or {}
        larger_types = set(dv.get('larger_types') or [])
        big = [p for p in dv.get('list') or [] if p.get('type') in larger_types][:6]
        li = ''.join(f'<li><b>{e((p.get("what") or p.get("type") or "").capitalize())}</b>, {e(p.get("address") or "")}'
                     f' <span class="muted">({e(names.get(p.get("comm"), p.get("comm") or ""))}; applied {e(p.get("applied"))}; {e(p.get("status"))})</span></li>' for p in big)
        types = dv.get('by_type') or []
        parts.append(f'''<section><h2>Growth and new development</h2>
  <p>{f'Ward 5 had <b>{n(ward.get("census2021"))}</b> residents at the 2021 Census, in {n(pop.get("homes_census"))} homes; it has about {n(pop.get("homes_now"))} homes today.' if pop_method == 'census2021' else f'Ward 5 has about <b>{n(ward.get("residents"))}</b> residents today, up from {n(ward.get("census2021"))} at the 2021 Census, in about {n(pop.get("homes_now"))} homes.'}
  Building permits issued in {e(per)} approved <b>{n(s.get("issued_homes12"))}</b> new homes {gchg(s.get("issued_homes_change_pct"), False)}.</p>
  <p>The City received <b>{n(dv.get("applied"))}</b> development permit applications in Ward 5, of which <b>{n(dv.get("larger"))}</b> were larger developments
  (new homes and apartment buildings, changes of use, new commercial and industrial buildings). Most of the rest were basement suites, home businesses and signs.</p>
  {_hbars(types, "type", "n", 10)}
  {f'<h3>Recent larger applications</h3><ul class="plain list">{li}</ul>' if li else ''}
  <p class="note">"Change of use" includes new child care centres, schools, clinics and places of worship. Search any permit at calgary.ca/development.</p>
</section>''')

    # ---- families
    if 'families' in on:
        f = D.get('families') or {}
        cc, sc = f.get('child_care') or {}, f.get('schools') or {}
        if cc or sc:
            tot = (sc.get('totals') or [{}])[-1] if sc else {}
            parts.append(f'''<section class="keep"><h2>Families, child care and schools</h2><div class="two">
  {f"""<div><h3>Child care</h3><p><b>{n(cc.get("spaces"))}</b> licensed child care spaces in Ward 5 ({e(cc.get("as_of"))}), for about <b>{n(cc.get("children_0_14"))}</b> children aged 0 to 14
  and {n(cc.get("children_0_4"))} under 5 (estimates). That is about {n(cc.get("per_100_0_14"), 1)} spaces for every 100 children.</p>
  <p class="note">Government of Alberta, Child Care Information, published quarterly.</p></div>""" if cc else ''}
  {f"""<div><h3>Schools</h3><p><b>{n(sc.get("students"))}</b> students are enrolled in Ward 5's schools in {e(sc.get("latest_year"))}:
  {n(tot.get("k_to_9"))} in kindergarten to grade 9 and {n(tot.get("g10_12"))} in grades 10 to 12.</p>
  <p class="note">Government of Alberta, Student enrolment by school, published yearly.</p></div>""" if sc else ''}
</div></section>''')

    # ---- safety
    if 'safety' in on:
        cr = D.get('crime')
        sf = D.get('safety')
        if cr and good and not fell(cr.get('change_pct')):
            cr = None                                     # crime did not fall: left out of a good-news edition
        if cr and good:
            cats_rows = sorted([x for x in cr['by_category'] if fell(x.get('change_pct'))], key=lambda x: x['change_pct'])
            comm_rows = sorted([x for x in cr['by_comm'] if x.get('residents') and fell(x.get('change_pct'))], key=lambda x: x['change_pct'])
            cats = ''.join(f'<tr><td>{e(x.get("label") or x["category"])}</td><td class="num">{n(x["n"])}</td><td>{chg(x.get("change_pct"), True)}</td></tr>'
                           for x in cats_rows)
            comms = ''.join(f'<tr><td>{e(x["name"])}</td><td class="num">{n(x["n"])}</td><td>{chg(x.get("change_pct"), True)}</td></tr>'
                            for x in comm_rows)
            dis = cr.get('disorder')
            lower = (cr.get('per_1000') or 0) < (cr.get('city_per_1000') or 0)
            parts.append(f'''<section><h2>Crime is down in Ward 5</h2>
  <p>The Calgary Police Service recorded <b>{n(cr["crimes"])}</b> crimes in Ward 5 in {e(cr["period"])}, {chg(cr.get("change_pct"), True)} on the same
  months a year before{f" (Calgary as a whole: {chg(cr.get('city_change_pct'), True)})" if fell(cr.get('city_change_pct')) and (cr.get('change_pct') or 0) <= (cr.get('city_change_pct') or 0) else ""}.
  {f'Violent crime fell too: <b>{n(cr["violent"])}</b> {chg(cr.get("violent_change_pct"), True)}.' if fell(cr.get("violent_change_pct")) else ''}
  {f'That is {n(cr.get("per_1000"), 1)} crimes per 1,000 residents a year, lower than the Calgary rate of {n(cr.get("city_per_1000"), 1)}.' if lower else ''}
  {f'Calls to police about disorder fell to <b>{n(dis["n"])}</b> {chg(dis.get("change_pct"), True)}.' if dis and fell(dis.get("change_pct")) else ''}</p>
  <div class="two">{f'<table class="small"><thead><tr><th>Types of crime that fell</th><th class="num">Crimes</th><th>Change</th></tr></thead><tbody>{cats}</tbody></table>' if cats else ''}
  {f'<table class="small"><thead><tr><th>Communities where crime fell</th><th class="num">Crimes</th><th>Change</th></tr></thead><tbody>{comms}</tbody></table>' if comms else ''}</div>
  <p class="note">Calgary Police Service community safety data: the "Download Community Safety Data" spreadsheet on the
  <a href="https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata">Calgary Police Community Safety Dashboard page</a>.</p>
</section>''')
        elif cr:
            cats = ''.join(f'<tr><td>{e(x.get("label") or x["category"])}</td><td class="num">{n(x["n"])}</td><td>{chg(x.get("change_pct"), True)}</td></tr>'
                           for x in cr['by_category'])
            comms = ''.join(f'<tr><td>{e(x["name"])}</td><td class="num">{n(x["n"])}</td><td class="num">{n(x.get("per_1000"), 1)}</td>'
                            f'<td>{chg(x.get("change_pct"), True)}</td></tr>' for x in cr['by_comm'] if x.get('residents'))
            moved = (f' The police have published figures up to {e(cr["latest"])}, so this section covers {e(cr["period"])}.'
                     if cr.get('moved') else '')
            dis = cr.get('disorder')
            parts.append(f'''<section><h2>Crime and safety in Ward 5</h2>
  <p>The Calgary Police Service recorded <b>{n(cr["crimes"])}</b> crimes in Ward 5 in {e(cr["period"])}, {chg(cr.get("change_pct"), True)} on the same
  months a year before (Calgary as a whole: {chg(cr.get("city_change_pct"), True)}). <b>{n(cr["violent"])}</b> were violent {chg(cr.get("violent_change_pct"), True)}.
  That is {n(cr.get("per_1000"), 1)} crimes per 1,000 residents a year, against {n(cr.get("city_per_1000"), 1)} for Calgary.
  {f'Calls to police about disorder: <b>{n(dis["n"])}</b> {chg(dis.get("change_pct"), True)}.' if dis else ''}{moved}</p>
  <div class="two"><table class="small"><thead><tr><th>Type of crime</th><th class="num">Crimes</th><th>Change</th></tr></thead><tbody>{cats}</tbody></table>
  <table class="small"><thead><tr><th>Community</th><th class="num">Crimes</th><th class="num">Per 1,000 a year</th><th>Change</th></tr></thead><tbody>{comms}</tbody></table></div>
  <p class="note">Calgary Police Service community safety data. Ward totals include business and industrial areas and the airport. The police leave out domestic violence and incidents with no location. Data: the "Download Community Safety Data" spreadsheet on the
  <a href="https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata">Calgary Police Community Safety Dashboard page</a> (section "Dashboard data download").</p>
</section>''')
        if sf and good and not (sf.get('calgary_change_pct') or {}).get('csi', 0) <= -1:
            sf = None                                     # Calgary's index did not fall
        if sf:
            c, ch = sf['calgary'], sf['calgary_change_pct']
            rank = ''.join(f'<tr class="{"me" if r["city"] == "Calgary" else ""}"><td>{e(r["city"])}</td><td class="num">{n(r["csi"], 1)}</td><td>{gchg(r.get("change_pct"), True)}</td></tr>' for r in sf['ranking'])
            parts.append(f'''<section class="keep"><h2>Crime in Calgary compared with other cities</h2><div class="two">
  <div><p>Calgary's Crime Severity Index was <b>{n(c["csi"], 1)}</b> in {e(sf["latest_year"])}, {chg(ch["csi"], True)} on the year before and
  {"" if good and (sf.get("calgary_10yr_pct") or 0) >= 0 else f'{n(abs(sf.get("calgary_10yr_pct") or 0), 0)}% {"lower" if (sf.get("calgary_10yr_pct") or 0) < 0 else "higher"} than in {e(sf["years"][0])}'}. Canada: {n(sf.get("canada"), 1)}.
  {"" if good and not fell(ch.get("violent")) else f'Violent crime: {n(c["violent"], 1)} {chg(ch["violent"], True)}. '}{"" if good and not fell(ch.get("non_violent")) else f'Non-violent crime: {n(c["non_violent"], 1)} {chg(ch["non_violent"], True)}.'}</p>
  <p class="note">The index weighs each police-reported crime by how serious it is, per person (100 = Canada in 2006). Statistics Canada, table {e(sf["table"])}, published each July.
  Crime by community is on the Calgary Police Service Community Safety Dashboard (calgary.ca/cps).</p></div>
  <div><table class="small"><thead><tr><th>City</th><th class="num">Index</th><th>Change</th></tr></thead><tbody>{rank}</tbody></table></div>
</div></section>''')

    # ---- rents
    if 'rents' in on:
        r = D.get('rents') or {}
        A = r.get('areas') or {}
        w, cal = A.get('ward5') or A.get('northeast'), A.get('calgary')
        zone = ((A.get('northeast') or {}).get('name') or '').strip()
        zone_name = (zone + ' Calgary') if zone and 'calgary' not in zone.lower() else (zone or 'Survey zone')
        where_words = 'the Ward 5 area' if A.get('ward5') else f'the {zone_name} survey zone'
        if w and cal:
            def cell(a, m, b, money=True):
                c = ((a or {}).get(m) or {}).get(b) or {}
                v = c.get('value')
                return '–' if v is None else (f'${v:,.0f}' if money else f'{v:.1f}%')
            rows = ''.join(f'<tr><td>{e(nm)}</td><td class="num">{cell(A.get(k), "rent", "1 Bedroom")}</td>'
                           f'<td class="num">{cell(A.get(k), "rent", "2 Bedroom")}</td><td class="num">{cell(A.get(k), "rent", "3 Bedroom +")}</td>'
                           f'<td class="num"><b>{cell(A.get(k), "rent", "Total")}</b></td><td class="num">{cell(A.get(k), "vacancy", "Total", False)}</td></tr>'
                           for k, nm in (('ward5', 'Ward 5 area'), ('northeast', zone_name), ('calgary', 'Calgary')) if A.get(k))
            parts.append(f'''<section class="keep"><h2>Rents and vacancy</h2>
  <p>In CMHC's {e(r.get("survey") or "latest")} survey, rental apartments in {where_words} rented for <b>{cell(w, "rent", "Total")}</b> a month on average
  (Calgary: {cell(cal, "rent", "Total")}), and <b>{cell(w, "vacancy", "Total", False)}</b> were empty and ready to rent (Calgary: {cell(cal, "vacancy", "Total", False)}).</p>
  <table class="small"><thead><tr><th>Area</th><th class="num">1 bedroom</th><th class="num">2 bedroom</th><th class="num">3 bedroom +</th><th class="num">All</th><th class="num">Vacancy</th></tr></thead><tbody>{rows}</tbody></table>
  <p class="note">CMHC Rental Market Survey, purpose-built rental apartments, surveyed each October. The Ward 5 area also takes in Coral Springs, Horizon and Sunridge.</p>
</section>''')

    # ---- roads
    if 'investment' in on:
        parts.append(_investment(D))

    if 'roads' in on:
        rw = D.get('roadwork') or []
        if rw:
            li = ''.join(f'<li><b>{e(r["title"])}</b>{". Expected to finish " + e(r["completion"]) if r.get("completion") else ""}'
                         f'{". Budget " + e(r["budget"]) if r.get("budget") else ""}.{" " + e(r.get("what")) if r.get("what") else ""}</li>' for r in rw[:6])
            parts.append(f'<section class="keep"><h2>Road construction</h2><ul class="plain list">{li}</ul></section>')

    # ---- contact
    if 'contact' in on:
        parts.append(f'''<section class="keep contact"><h2>Contact the office</h2>
  <p>To report a pothole, a broken streetlight, garbage or any other City service problem, call <b>311</b> or use the <b>311 Calgary app</b>.
  For anything else, or if a problem is not being fixed, contact the Ward 5 office: {e(CONTACT_PAGE.replace("https://", ""))}.</p></section>''')

    parts.append(f'''<footer><p>Figures from public open data: City of Calgary Open Data (311 Service Requests, Building Permits, Development Permits,
  Traffic Incidents, Road Construction Projects, Property Assessments, 2021 Census by Community), project pages of the City, the Province, school boards and the airport, Calgary Police Service community safety data, CMHC Rental Market Survey, Government of Alberta open data and Statistics Canada.
  Data as of {e(D.get("built_at", "")[:10])}.</p></footer>''')

    body = '\n'.join(parts)
    sc = D.get('scope') or {}
    if sc and not (sc.get('kind') == 'ward' and sc.get('ward') == 5):     # another ward, or the whole city
        place = sc.get('name') or 'Calgary'
        body = (body.replace('City of Calgary · Ward 5', 'City of Calgary' + ('' if sc.get('kind') == 'city' else ' · ' + place))
                .replace('contact the Ward 5 office: ' + e(CONTACT_PAGE.replace('https://', '')),
                         'contact your councillor\'s office: calgary.ca/council' if sc.get('kind') == 'city'
                         else f"contact the {place} office: calgary.ca/council/ward-{sc.get('ward')}")
                .replace(' The Ward 5 area also takes in Coral Springs, Horizon and Sunridge.', '')
                .replace("Ward 5's", place + "'s").replace('Ward 5', place))
        if title == DEFAULT_TITLE:
            title = (place if sc.get('kind') == 'ward' else 'Calgary') + ' Community Update'
            body = body.replace(e(DEFAULT_TITLE), e(title))
    import census
    year = int((D.get('census') or {}).get('year') or 2021)
    return census.relabel(PAGE.replace('{{TITLE}}', e(f'{title}, {per}')).replace('{{BODY}}', body), year)


def _short(text, limit=220):
    """The first sentences of a description, up to about limit characters."""
    out = ''
    for sent in re.split(r'(?<=[.!?])\s+', str(text or '')):
        if out and len(out) + len(sent) > limit:
            break
        out = (out + ' ' + sent).strip()
    return out


def _investment(D):
    """Every known project being built or planned in Ward 5, with what the owners have published about it."""
    allp = list(D.get('projects') or [])
    opened = [p for p in allp if p.get('state') == 'completed']
    projects = [p for p in allp if p.get('state') != 'completed']
    big = [b for b in (D.get('big_permits') or []) if b.get('cost')]
    if not allp and not big:
        return ''
    order = lambda p: (0 if re.search(r'under construction|sod turned', p.get('status') or '', re.I) else 1, -(p.get('cost') or 0))
    projects.sort(key=order)
    known = [p for p in projects if p.get('cost') and not p.get('cost_partial')]
    total = sum(p['cost'] for p in known)
    rows = ''.join(
        f'<tr><td><b>{e(p.get("title"))}</b><br><span class="muted">{e(_short(p.get("what")))}</span></td>'
        f'<td>{e(p.get("status") or "")}{(". " + e(p["completion"])) if p.get("completion") else ""}</td>'
        f'<td>{e(p.get("budget") or "Not published")}</td></tr>' for p in projects)
    checked = (projects[0].get('checked') if projects else '') or ''
    intro = (f'<p>{len(projects)} major projects are being built or planned in Ward 5. The ones with a published cost add up to about '
             f'<b>${total / 1e6:,.0f} million</b> ({", ".join(e(p["title"].split(" (")[0]) for p in known)}).</p>') if projects else ''
    if opened:
        intro += ('<p><b>Recently opened:</b> ' + '; '.join(f'{e(p["title"])} ({e(p.get("budget") or "")})' for p in opened) + '.</p>')
    permits = ''
    if big:
        li = ''.join(f'<li><b>{e(b.get("title"))}</b>, {e(b.get("address") or "")}: {e(b.get("budget") or "")}'
                     f'{", issued " + e(b["issued"]) if b.get("issued") else ""}</li>' for b in big[:6])
        permits = (f'<h3>Largest building permits issued, {e(D.get("period") or "")} (not homes)</h3>'
                   f'<ul class="plain list">{li}</ul>')
    return (f'<section><h2>Investment coming to Ward 5</h2>{intro}'
            f'{"<table><thead><tr><th>Project</th><th>Stage</th><th>Cost</th></tr></thead><tbody>" + rows + "</tbody></table>" if rows else ""}'
            f'{permits}<p class="note">Status, costs and dates are as published by the City, the Province, school boards, the airport '
            f'and developers{", checked " + e(checked) if checked else ""}. Costs are estimates; where no opening date or cost has been '
            f'published, none is given. The amount listed so far for the Saddle Ridge grades 5 to 9 school covers design only and is '
            f'not in the total. Building permit costs are what applicants declared.</p></section>')


PAGE = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{{TITLE}}</title>
<style>
@page { size: Letter; margin: 14mm 14mm 16mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 10.5pt/1.45 "Segoe UI", Arial, sans-serif; color: #0F172A; background: #fff; }
.wrap { max-width: 780px; margin: 0 auto; padding: 0 0 8px; }
.band { display: flex; justify-content: space-between; gap: 20px; background: #0B3A66; color: #fff; padding: 20px 22px; border-radius: 6px; margin-bottom: 14px; }
.band h1 { margin: 2px 0 4px; font-size: 24pt; line-height: 1.1; letter-spacing: -.3px; }
.kicker { margin: 0; text-transform: uppercase; letter-spacing: 1.4px; font-size: 8.5pt; color: #BFDBFE; font-weight: 600; }
.per { margin: 0; font-size: 13pt; color: #E0F2FE; }
.band-r { text-align: right; font-size: 9.5pt; color: #E0F2FE; }
.band-r p { margin: 0 0 3px; }
.band-r b { color: #fff; font-size: 11pt; }
.small { font-size: 8.5pt; }
h2 { font-size: 13.5pt; margin: 14px 0 6px; color: #0B3A66; border-bottom: 2px solid #0B3A66; padding-bottom: 3px; break-after: avoid; }
h3 { font-size: 10.5pt; margin: 10px 0 4px; color: #1E293B; break-after: avoid; }
p { margin: 0 0 7px; }
section.keep, .tile, figure, tr { break-inside: avoid; }
.msg { background: #F1F5F9; border-left: 4px solid #0B3A66; padding: 2px 16px 8px; border-radius: 4px; }
.msg h2 { border: 0; margin-top: 10px; }
.tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.tile { border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 10px; }
.tile .t { font-size: 8.5pt; color: #475569; margin: 0 0 2px; font-weight: 600; }
.tile .v { font-size: 17pt; font-weight: 700; margin: 0; color: #0B3A66; line-height: 1.15; }
.tile .f { font-size: 8pt; color: #475569; margin: 2px 0 0; }
.tiles .note { grid-column: 1 / -1; }
.note { font-size: 8.5pt; color: #64748B; }
.muted { color: #64748B; }
.chg { display: inline-block; font-size: 8pt; font-weight: 700; padding: 0 6px; border-radius: 9px; white-space: nowrap; }
.chg.good { background: #DCFCE7; color: #166534; } .chg.bad { background: #FEE2E2; color: #991B1B; }
.chg.neutral { background: #E0F2FE; color: #075985; } .chg.flat { background: #F1F5F9; color: #475569; }
figure { margin: 6px 0 4px; } figcaption { font-size: 8.5pt; color: #64748B; }
svg.bars { width: 100%; height: auto; } svg .cur { fill: #0B6BB5; } svg .prev { fill: #CBD5E1; }
svg .grid { stroke: #E2E8F0; } svg .ax { font: 8pt "Segoe UI", Arial; fill: #64748B; }
.hbars { list-style: none; margin: 4px 0 6px; padding: 0; }
.hbars li { display: grid; grid-template-columns: 210px 1fr 54px 90px; gap: 8px; align-items: center; margin: 3px 0; font-size: 9.5pt; }
.hbars .track { background: #F1F5F9; height: 9px; border-radius: 5px; overflow: hidden; }
.hbars .track span { display: block; height: 100%; background: #0B6BB5; border-radius: 5px; }
.hbars .v { text-align: right; font-weight: 600; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 4px 0 6px; }
th { text-align: left; font-size: 8pt; color: #475569; border-bottom: 1.5px solid #94A3B8; padding: 4px 5px; vertical-align: bottom; }
td { border-bottom: 1px solid #E2E8F0; padding: 4px 5px; }
.num { text-align: right; } tr.me td { font-weight: 700; background: #FEF2F2; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
ul.plain { margin: 4px 0 6px; padding-left: 18px; } ul.plain li { margin: 2px 0; }
ul.plain li .c, ul.plain li .v { margin-left: 6px; } ul.plain li .v { font-weight: 700; } ul.plain li .c { color: #64748B; font-size: 8.5pt; }
ul.list li { margin: 3px 0; }
.contact { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 0 14px 6px; }
.contact h2 { border: 0; }
footer { margin-top: 10px; border-top: 1px solid #CBD5E1; padding-top: 6px; font-size: 7.5pt; color: #64748B; }
[contenteditable]:focus, body[contenteditable]:focus { outline: none; }
@media screen { body { background: #E2E8F0; } .wrap { background: #fff; padding: 14mm; margin: 12px auto; box-shadow: 0 2px 10px rgba(15,23,42,.15); } }
</style></head>
<body><div class="wrap">
{{BODY}}
</div></body></html>'''


# ------------------------------------------------------------------------------------------------ PDF
def _browser():
    """Microsoft Edge (or Chrome) on this computer, used to print the page to PDF."""
    cands = []
    for env in ('PROGRAMFILES(X86)', 'PROGRAMFILES', 'LOCALAPPDATA'):
        base = os.environ.get(env)
        if base:
            cands += [os.path.join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
                      os.path.join(base, 'Google', 'Chrome', 'Application', 'chrome.exe')]
    for c in cands:
        if os.path.exists(c):
            return c
    for name in ('msedge', 'chrome', 'chromium', 'chromium-browser', 'google-chrome'):
        p = shutil.which(name)
        if p:
            return p
    return None


def to_pdf(page_html, out_path, browser=None, timeout=120):
    """Print the page to a PDF file. Returns out_path; raises RuntimeError if no browser could do it."""
    exe = browser or _browser()
    if not exe:
        raise RuntimeError('Microsoft Edge was not found on this computer, so the PDF could not be made.')
    work = tempfile.mkdtemp(prefix='w5news_')
    src = os.path.join(work, 'newsletter.html')
    with open(src, 'w', encoding='utf-8') as f:
        f.write(page_html)
    tmp_pdf = os.path.join(work, 'newsletter.pdf')
    url = pathlib.Path(src).resolve().as_uri()
    args = [exe, '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
            '--disable-extensions', f'--user-data-dir={os.path.join(work, "profile")}', '--no-pdf-header-footer',
            f'--print-to-pdf={tmp_pdf}', url]
    flags = 0x08000000 if os.name == 'nt' else 0          # CREATE_NO_WINDOW: no black window flashing up
    try:
        subprocess.run(args, timeout=timeout, capture_output=True, creationflags=flags)
    except subprocess.TimeoutExpired:
        pass
    if not os.path.exists(tmp_pdf) or os.path.getsize(tmp_pdf) < 1000:
        raise RuntimeError('The PDF could not be made.')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    shutil.move(tmp_pdf, out_path)
    shutil.rmtree(work, ignore_errors=True)
    return out_path
