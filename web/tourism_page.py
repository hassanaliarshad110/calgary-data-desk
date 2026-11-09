"""calgaryinsight.ca/tourism-intelligence/: Calgary's visitor economy for businesses, researchers and government, kept
apart from the visitor tools. Written by the build from data/tourism.json (Statistics Canada, refreshed every day) and
data/tourism_research.json (figures checked by hand, each with its source and date). Every figure says what it is:
a count (historical), an organisation's own estimate, or a target."""
import json
import os

from seo_pages import SITE, bars, e, page

MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
TAG = {'count': '<span class="tag">Count</span>', 'estimate': '<span class="tag">Estimate</span>', 'target': '<span class="tag">Target</span>'}
CSS = """<style>.tag{display:inline-block;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid currentColor;border-radius:2px;padding:0 .35rem;margin-left:.35rem;opacity:.75;vertical-align:middle}
.src{font-size:.85rem;opacity:.85}.cmp td,.cmp th{vertical-align:top}</style>"""


def _n(v, d=0):
    return '–' if v is None else f'{v:,.{d}f}'


def _m(v):
    return '–' if v is None else (f'${v / 1e9:,.1f} billion' if v >= 1e9 else f'${v / 1e6:,.0f} million')


def _src(s):
    if not s:
        return ''
    if isinstance(s, list):
        return ' '.join(_src(x) for x in s)
    t = e(s.get('title') or s.get('name') or 'Source')
    pub = f', {e(s["publisher"])}' if s.get('publisher') else ''
    return f'<a href="{e(s["url"])}" rel="noopener">{t}</a>{pub}.' if s.get('url') else f'{t}{pub}.'


def build(out, tourism=None, research=None):
    """Write out/tourism-intelligence/index.html. Returns its site-relative path, or None without data."""
    T, R = tourism or {}, research or {}
    if not R:
        return None
    A = T.get('arrivals') or {}
    ports = A.get('ports') or {}
    yr = A.get('latest_full_year')
    c25 = R.get('calgary_2025') or {}
    body = ['<h1>Tourism Intelligence</h1>',
            '<p class="lead">Calgary\'s visitor economy in one place, for businesses, researchers and government: who comes, from where, '
            'when, what they spend, the gateway to the Rockies, and how other destinations grew. Every figure carries its source and '
            'says whether it is a count, an organisation\'s own estimate or a target. Planning a visit instead? '
            '<a href="../visit/explore/">Explore Calgary</a>.</p>' + CSS]
    # 1. the visitor economy (Tourism Calgary's estimates)
    if c25:
        sp = c25.get('spending_by_origin') or {}
        body += ['<h2>The visitor economy, 2025</h2>',
                 f'<p>{_n(c25.get("visitors") / 1e6, 1)} million visitors spent {_m(c25.get("visitor_spending"))} in Calgary {TAG["estimate"]}. '
                 f'Hotel occupancy was {c25.get("hotel_occupancy_pct")}% and short-term rental occupancy {c25.get("short_term_rental_occupancy_pct")}% {TAG["estimate"]}; '
                 f'{_n(c25.get("tourism_and_hospitality_jobs"))} Calgarians work in tourism and hospitality, counting seasonal and part-time jobs.</p>',
                 '<h3>Visitor spending by where visitors live</h3>',
                 bars([('Elsewhere in Alberta', sp.get('alberta')), ('Rest of Canada', sp.get('rest_of_canada')), ('United States', sp.get('united_states')),
                       ('Overseas', sp.get('overseas'))], _m),
                 f'<p>Canadians account for about {round(((sp.get("alberta") or 0) + (sp.get("rest_of_canada") or 0)) / max(1, sum(v or 0 for v in sp.values())) * 100)}% of visitor spending. '
                 f'Goal: {e(c25.get("goal"))} {TAG["target"]}.</p>',
                 f'<p>Meetings and conventions: {c25["meetings_and_conventions"]["hosted"]} hosted ({c25["meetings_and_conventions"]["hosted_2024"]} in 2024), '
                 f'{_n(c25["meetings_and_conventions"]["delegates"])} delegates, {_m(c25["meetings_and_conventions"]["economic_impact"])} impact {TAG["estimate"]}. '
                 f'Sport, culture and major events: {c25["sport_culture_major_events"]["hosted"]} hosted, {_m(c25["sport_culture_major_events"]["economic_impact"])} impact {TAG["estimate"]}.</p>',
                 f'<p class="src">Source: {_src(c25.get("source"))} Tourism Calgary\'s own estimates; its reports give the method.</p>']
    # 2. international arrivals (Statistics Canada)
    if ports:
        yrs = [y for y in sorted((ports.get('Calgary') or {}).get('overnight_by_year', {}))][-7:]
        head = ''.join(f'<th class="n">{e(y)}</th>' for y in yrs)
        rows = ''
        for p in ('Calgary', 'Vancouver', 'Toronto', 'Montréal', 'Edmonton', 'Canada'):
            v = (ports.get(p) or {}).get('overnight_by_year') or {}
            ytd = (ports.get(p) or {}).get('year_to_date') or {}
            ch = (v.get(yr) / v.get(str(int(yr) - 1)) - 1) * 100 if yr and v.get(yr) and v.get(str(int(yr) - 1)) else None
            rows += (f'<tr><td>{e(p if p != "Toronto" else "Toronto (Pearson)")}</td>' + ''.join(f'<td class="n">{_n(v.get(y))}</td>' for y in yrs)
                     + f'<td class="n">{"–" if ch is None else f"{ch:+.0f}%"}</td></tr>')
        cal = ports.get('Calgary') or {}
        us, ov = (cal.get('us_by_year') or {}).get(yr), (cal.get('overseas_by_year') or {}).get(yr)
        ytd = cal.get('year_to_date') or {}
        body += ['<h2>International visitors arriving by air</h2>',
                 f'<p>Overnight visitors from other countries entering Canada by air at each airport {TAG["count"]}. In {e(yr)}, '
                 f'{_n((cal.get("overnight_by_year") or {}).get(yr))} entered at Calgary, {e((A.get("share_of_canada_pct") or {}).get("Calgary"))}% of Canada\'s air arrivals; '
                 f'{round(us / (us + ov) * 100) if us and ov else "–"}% were from the United States.'
                 + (f' This year to {e(ytd.get("through"))}: {_n(ytd.get("total"))}, against {_n(ytd.get("same_months_last_year"))} in the same months last year.' if ytd else '') + '</p>',
                 f'<div class="wrap"><table><thead><tr><th>Airport</th>{head}<th class="n">Change {e(yr)}</th></tr></thead><tbody>{rows}</tbody></table></div>',
                 '<p class="src">A port of entry is where a visitor first enters Canada, not where they stay: many who enter at Calgary are on their way to Banff, '
                 'and visitors who enter at Vancouver or Toronto and fly on to Calgary are counted there. Source: '
                 '<a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2410005501" rel="noopener">Statistics Canada, table 24-10-0055</a>, monthly; refreshed by this site every day.</p>']
        bc = (A.get('by_country') or {}).get('Calgary') or []
        if bc:
            body += [f'<h3>Overseas visitors entering at Calgary by country, {e(yr)}</h3>',
                     bars([(r['country'], r['overnight']) for r in bc[:12]], lambda v: _n(v)),
                     '<p class="src">Selected priority markets; the United States is shown above.</p>']
        am = cal.get('average_by_month') or {}
        if am:
            body += ['<h3>The seasons: international arrivals at Calgary by month</h3>',
                     bars([(MONTHS[int(k) - 1], v) for k, v in sorted(am.items())], lambda v: _n(v)),
                     '<p class="src">Average of the years in the file (the last eleven, pandemic years included), overnight visitors by air.</p>']
    # 3. airports
    ap = T.get('airports_annual') or {}
    if ap:
        y = max((max(x['years']) for x in ap.values()), default=None)
        rows = ''.join(f'<tr><td>{e(c)}</td>' + ''.join(f'<td class="n">{_n(((x["years"].get(y) or {}).get(k) or 0) / 1e6, 1)}</td>' for k in ('total', 'domestic', 'transborder', 'international')) + '</tr>'
                       for c, x in sorted(ap.items(), key=lambda kv: -((kv[1]['years'].get(y) or {}).get('total') or 0)) if (x['years'].get(y) or {}).get('total'))
        air = R.get('airport') or {}
        body += [f'<h2>Airports, {e(y)}</h2>', f'<p>Passengers in millions, enplaned plus deplaned, by sector {TAG["count"]}. '
                 f'Calgary\'s airport reports {_n(air.get("passengers_2025") / 1e6, 1)} million passengers in 2025 and {air.get("destinations")} non-stop destinations; '
                 f'Tourism Calgary puts international travellers connecting through Calgary without leaving the airport at more than {_n(air.get("connecting_international_travellers_a_year") / 1e6, 0)} million a year {TAG["estimate"]}.</p>',
                 f'<div class="wrap"><table><thead><tr><th>Airport</th><th class="n">Total</th><th class="n">Domestic</th><th class="n">United States</th><th class="n">Other international</th></tr></thead><tbody>{rows}</tbody></table></div>',
                 f'<p class="src">Source: <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2310025301" rel="noopener">Statistics Canada, table 23-10-0253</a>; {_src(air.get("sources"))}</p>']
    # 4. the gateway
    ac = R.get('around_calgary') or {}
    if ac:
        rows = ''.join(f'<tr><td>{e(p["place"])}</td><td class="n">{e(p["drive_minutes"])} min</td><td>{e(p.get("unesco_world_heritage") or "")}</td>'
                       f'<td class="n">{_n((p.get("visitors") or {}).get("visitors"))}</td></tr>' for p in ac.get('places') or [])
        k = ac.get('kananaskis') or {}
        body += ['<h2>The gateway: what lies within a few hours</h2>',
                 f'<p>{e(ac.get("unesco"))} Banff National Park had {_n((R.get("banff_gateway") or {}).get("banff_national_park_visitors_2025_26"))} visitors in 2025-26 {TAG["count"]}; '
                 f'Kananaskis Country about {_n(k.get("visits_2024"))} visits in 2024 {TAG["estimate"]}. {e((ac.get("banff_cannot_grow_beds") or {}).get("what"))}</p>',
                 f'<div class="wrap"><table><thead><tr><th>Place</th><th class="n">Drive from downtown</th><th>UNESCO</th><th class="n">Visitors</th></tr></thead><tbody>{rows}</tbody></table></div>',
                 f'<p class="src">Drive times: OpenStreetMap routing at free-flowing speeds (estimates). {_src((R.get("banff_gateway") or {}).get("source"))} {_src(k.get("source"))} '
                 f'{_src((ac.get("banff_cannot_grow_beds") or {}).get("source"))}</p>']
    # 5. infrastructure, incentives and investment
    lv, rl, ind, sp_ = R.get('levies') or {}, R.get('rail') or {}, R.get('indigenous_tourism') or {}, R.get('calgary_stopover_program') or {}
    body += ['<h2>Infrastructure, incentives and investment</h2><ul>',
             f'<li><b>Stopover pilot.</b> {e(sp_.get("what"))} {_src(sp_.get("source"))}</li>' if sp_ else '',
             f'<li><b>Levies.</b> Alberta tourism levy {lv.get("alberta_tourism_levy_pct")}%; {e(lv.get("destination_marketing_fee"))} {e(lv.get("from_2027"))} {_src(lv.get("source"))}</li>' if lv else '',
             f'<li><b>Rail.</b> {e(rl.get("status_june_2026"))} {_src(rl.get("source"))}</li>' if rl else '',
             f'<li><b>Indigenous tourism.</b> {e(ind.get("mou"))} {e(ind.get("demand"))} {_src(ind.get("sources"))}</li>' if ind else '',
             f'<li><b>Kananaskis.</b> {e((ac.get("kananaskis") or {}).get("plans"))}</li>' if ac else '',
             f'<li><b>The Stampede.</b> {_m((R.get("stampede") or {}).get("economic_impact_alberta_2025"))} economic impact across Alberta in 2025 {TAG["estimate"]}. {_src((R.get("stampede") or {}).get("source"))}</li>' if R.get('stampede') else '',
             '</ul>']
    # 6. Calgary and Dubai: two models
    du = next((x for x in R.get('lessons_from_other_destinations') or [] if x['place'].startswith('Dubai')), None)
    if du:
        cal_air = ((ports.get('Calgary') or {}).get('overnight_by_year') or {}).get(yr)
        body += ['<h2>Calgary and Dubai: two models</h2>',
                 '<p>Dubai is the reference most often cited for tourism growth. The two are not like for like: Dubai is a global air hub with year-round sun, '
                 'visa policy set nationally and a state-led plan; Calgary is a mid-sized gateway to mountain parks, with federal visa rules and a seasonal peak. '
                 'The comparison shows the levers, not a target.</p>',
                 '<div class="wrap"><table class="cmp"><thead><tr><th></th><th>Calgary</th><th>Dubai</th></tr></thead><tbody>'
                 f'<tr><td>International overnight visitors</td><td>{_n(cal_air)} entering Canada by air at Calgary, {e(yr)} {TAG["count"]}</td><td>19.59 million, 2025 {TAG["count"]}</td></tr>'
                 f'<tr><td>All visitors</td><td>{_n((c25.get("visitors") or 0) / 1e6, 1)} million, 2025 (residents of Canada included) {TAG["estimate"]}</td><td>Not published on the same basis</td></tr>'
                 f'<tr><td>Hotel occupancy</td><td>{c25.get("hotel_occupancy_pct")}% {TAG["estimate"]}</td><td>80.7% across 154,000 rooms {TAG["count"]}</td></tr>'
                 '<tr><td>Hub airline and stopovers</td><td>WestJet hub; stopover pilot on two UK routes since June 2026</td><td>Emirates hub; stopover and transit hotel offers</td></tr>'
                 '<tr><td>Events calendar</td><td>The Stampede (July), conventions, sport and culture events</td><td>Shopping Festival, Summer Surprises, Fitness Challenge spread through the year</td></tr>'
                 '<tr><td>Funding the marketing</td><td>Destination marketing fee at hotels (regulated from 2027)</td><td>Tourism dirham fee per room night</td></tr>'
                 f'<tr><td>Stated goal</td><td>{e(c25.get("goal"))} {TAG["target"]}</td><td>The Dubai Economic Agenda (D33) {TAG["target"]}</td></tr>'
                 '</tbody></table></div>',
                 f'<p class="src">{_src(du.get("sources"))} {_src(c25.get("source"))} The tourism dirham fee and the D33 agenda are named as Dubai\'s own policies; see the Dubai Department of Economy and Tourism for their terms.</p>']
    lessons = R.get('lessons_from_other_destinations') or []
    if lessons:
        body += ['<h2>What other destinations did</h2><ul>'] + [f'<li><b>{e(x["place"])}.</b> {e(x["what"])} <i>For Calgary:</i> {e(x["fit_for_calgary"])} {_src(x.get("sources"))}</li>' for x in lessons] + ['</ul>']
    body += ['<h2>How this page is made</h2>',
             '<p>Statistics Canada\'s tables are read by this site every day (international arrivals monthly, airport passengers yearly). The other figures are '
             f'checked by hand from the sources named beside them (last checked {e(R.get("checked"))}); they are counts, organisations\' own estimates or targets, as marked. '
             'Ask the <a href="../data-scientist/">Data Scientist</a> for a full report on Calgary\'s tourism potential, with the same data. '
             'Calgary Insight is independent: it is not Tourism Calgary or the City of Calgary.</p>',
             f'<p>Spotted an error? <a href="../about/">Corrections and suggestions</a>.</p>']
    desc = ('Calgary\'s visitor economy with sources: visitors and spending, international arrivals by country and month against Vancouver and Toronto, '
            'airports, the gateway to Banff and Kananaskis, levies and incentives, and how Dubai, Iceland, Singapore and Denver grew.')
    path = 'tourism-intelligence/'
    os.makedirs(os.path.join(out, path), exist_ok=True)
    with open(os.path.join(out, path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(page(path, 'Tourism Intelligence: Calgary\'s visitor economy, with sources | Calgary Insight', desc,
                     [('Calgary Insight', ''), ('Tourism Intelligence', path)], '\n'.join(x for x in body if x),
                     [{'@type': 'Dataset', 'name': 'Calgary tourism intelligence', 'description': desc, 'url': SITE + path,
                       'creator': {'@type': 'Organization', 'name': 'Calgary Insight'}, 'isBasedOn': ['https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2410005501']}],
                     T.get('built') or ''))
    return path


if __name__ == '__main__':
    import sys
    t = json.load(open(sys.argv[2], encoding='utf-8')) if len(sys.argv) > 2 else {}
    r = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'tourism_research.json'), encoding='utf-8'))
    print(build(sys.argv[1], t, r))
