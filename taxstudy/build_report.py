"""Technical report (PDF) for the 15% tax study, built from the committed figure files."""
import json, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

S = '/home/claude/study'; OUT = f'{S}/out'; os.makedirs(OUT, exist_ok=True)
B = json.load(open(f'{S}/fig_budget.json')); A = json.load(open(f'{S}/fig_assess.json')); W = json.load(open(f'{S}/fig_wards.json')); WH = json.load(open(f'{S}/fig_where.json')); K = json.load(open(f'{S}/fig_capital.json'))
COMMIT = '2cb5947'
D = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DV', D + 'DejaVuSans.ttf')); pdfmetrics.registerFont(TTFont('DVB', D + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DVI', D + 'DejaVuSans-Oblique.ttf')); pdfmetrics.registerFont(TTFont('DVM', D + 'DejaVuSansMono.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('DV', normal='DV', bold='DVB', italic='DVI', boldItalic='DVB')

INK = '#1f2933'; MUTED = '#5f6b76'; ACC = '#2b6cb0'; ACC2 = '#c05621'; GRID = '#d9dee3'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 8.5, 'axes.edgecolor': GRID, 'axes.labelcolor': INK,
                     'xtick.color': MUTED, 'ytick.color': MUTED, 'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.grid': True, 'grid.color': GRID, 'grid.linewidth': 0.6, 'axes.axisbelow': True})

def save(fig, name):
    p = f'{OUT}/{name}.png'; fig.savefig(p, dpi=200, bbox_inches='tight'); plt.close(fig); return p

# ---------- figures ----------
figs = {}
# F1 benchmarks on matching spans
fig, ax = plt.subplots(figsize=(6.6, 3.0))
labels = ['Population + inflation', 'Operating budget excl. Water Services (City data)', 'Operating budget (City data)', 'Operating budget (Herald totals)', 'Property tax, existing properties']
v26 = [B['pop_plus_cpi_2026_2030_pct'], None, None, B['herald_2026_2030_pct'], B['tax_path_compound_pct']]
v27 = [B['pop_plus_cpi_2027_2030_pct'], B['op_ex_water']['growth_pct'], B['op_open_growth_pct'], B['op_herald']['growth_2027_2030_pct'], B['tax_path_2027_2030_pct']]
import numpy as np
y = np.arange(len(labels)); h = 0.36
for i, (a, b) in enumerate(zip(v26, v27)):
    if a is not None:
        ax.barh(i - h / 2, a, h, color=ACC); ax.text(a + 0.8, i - h / 2, f'{a:+.1f}%', va='center', fontsize=7.5, color=INK)
    else:
        ax.text(1, i - h / 2, 'not comparable', va='center', fontsize=7, color=MUTED)
    ax.barh(i + h / 2, b, h, color=ACC2); ax.text(b + 0.8, i + h / 2, f'{b:+.1f}%', va='center', fontsize=7.5, color=INK)
ax.set_yticks(y, labels); ax.invert_yaxis(); ax.set_xlabel('Cumulative change (%)'); ax.grid(axis='y', visible=False)
ax.legend(handles=[plt.Rectangle((0, 0), 1, 1, color=ACC), plt.Rectangle((0, 0), 1, 1, color=ACC2)],
          labels=['2026 to 2030 (4 steps)', '2027 to 2030 (3 steps)'], frameon=False, fontsize=7.5, loc='lower center', bbox_to_anchor=(0.5, 1.0), ncol=2)
ax.set_xlim(0, 62)
figs['bench'] = save(fig, 'f1_benchmarks')

# F2 ward growth decomposition
wr = sorted(W['wards'], key=lambda x: -x['growth_pct'])
fig, ax = plt.subplots(figsize=(6.6, 2.7))
xs = np.arange(len(wr)); homes = [x['growth_model_pct'] for x in wr]; tot = [x['growth_pct'] for x in wr]
ax.bar(xs, homes, color=ACC, label='Residents in new homes (measured by community)')
ax.bar(xs, [t - m for t, m in zip(tot, homes)], bottom=homes, color='#a3bfe0', label='Residual growth, allocated evenly by model (not measured)')
for i, t in enumerate(tot): ax.text(i, t + 0.6, f'{t:.0f}', ha='center', fontsize=7, color=INK)
ax.set_xticks(xs, [f'W{x["ward"]}' for x in wr]); ax.set_ylabel('% change on 2021 Census count'); ax.grid(axis='x', visible=False)
ax.legend(frameon=False, fontsize=7.5, loc='upper right'); ax.set_ylim(0, 45)
figs['growth'] = save(fig, 'f2_ward_growth')

# F3 paired assessment change by type, 2025->2026, with IQR
pr = A['pairs']['2025-2026']; types = [k for k in pr if k != 'All homes']
short = {'Detached house': 'Detached', 'Semi-detached / duplex': 'Semi / duplex', 'Row house / townhouse (code R401)': 'Row house (R401)',
         'Townhouse condo (code R402)': 'Townhouse condo (R402)', 'Low-rise condo apartment': 'Low-rise apt', 'High-rise condo apartment': 'High-rise apt'}
fig, ax = plt.subplots(figsize=(6.6, 2.5))
for i, k in enumerate(types):
    r = pr[k]; ax.plot([r['p25'], r['p75']], [i, i], color='#a3bfe0', lw=6, solid_capstyle='butt')
    ax.plot(r['median_pct'], i, 'o', color=ACC, ms=6); ax.text(r['p75'] + 0.4, i, f"median {r['median_pct']:+.1f}%", va='center', fontsize=7.5)
ax.axvline(A['base_change_2025_2026_pct'], color=ACC2, lw=1, ls='--'); ax.text(A['base_change_2025_2026_pct'] + 0.2, -0.75, 'residential base +1.0%', color=ACC2, fontsize=7)
ax.set_yticks(range(len(types)), [short[t] for t in types]); ax.invert_yaxis(); ax.set_xlabel('Same-home assessment change, 2025 to 2026 roll (%), bar = interquartile range')
ax.grid(axis='y', visible=False); ax.set_xlim(-12, 9)
figs['paired'] = save(fig, 'f3_paired')

# F4 back-test predicted vs actual
bt = A['backtest_2026']
fig, ax = plt.subplots(figsize=(6.6, 2.3))
ks = list(bt); xs = np.arange(len(ks)); w = 0.38
ax.bar(xs - w / 2, [bt[k]['predicted_pct'] for k in ks], w, color='#a3bfe0', label='Predicted from CREB July 2025 gaps')
ax.bar(xs + w / 2, [bt[k]['actual_pct'] for k in ks], w, color=ACC, label='Actual median, 2026 roll')
ax.axhline(0, color=MUTED, lw=0.8); ax.set_xticks(xs, [short[k].replace(' (', '\n(') for k in ks], fontsize=7); ax.set_ylabel('% change'); ax.grid(axis='x', visible=False)
ax.legend(frameon=False, fontsize=7.5, loc='lower left')
figs['backtest'] = save(fig, 'f4_backtest')

# F5 ward bill change vs condo apartment share
fig, ax = plt.subplots(figsize=(6.6, 2.6))
crowd = sorted([x for x in W['wards'] if 5 < x['apt_share_pct'] < 20], key=lambda x: (-x['bill_change_2027_pct'], x['apt_share_pct']))
ys = np.linspace(15.62, 14.62, len(crowd))
for x in W['wards']:
    ax.scatter(x['apt_share_pct'], x['bill_change_2027_pct'], s=x['residents_now'] / 2500, color=ACC, alpha=0.75, edgecolor='white', zorder=3)
for x, yy in zip(crowd, ys):
    ax.annotate(f"W{x['ward']} ({x['bill_change_2027_pct']:+.1f}%)", (x['apt_share_pct'], x['bill_change_2027_pct']), xytext=(27, yy), textcoords='data', fontsize=6.8,
                va='center', arrowprops=dict(arrowstyle='-', color='#9aa5b1', lw=0.5))
for x in W['wards']:
    if x not in crowd:
        ax.annotate(f"W{x['ward']} ({x['bill_change_2027_pct']:+.1f}%)", (x['apt_share_pct'], x['bill_change_2027_pct']), xytext=(5, 3), textcoords='offset points', fontsize=6.8)
ax.set_title('Model-implied (follows from the assessment assumptions)', fontsize=7.5, color=MUTED, loc='left')
ax.axhline(15, color=ACC2, lw=1, ls='--'); ax.text(44, 15.05, '15% revenue increase', color=ACC2, fontsize=7)
ax.set_xlabel('Condo apartments, % of homes on the 2026 roll'); ax.set_ylabel('Est. 2027 City tax change on homes (%)')
figs['wardbill'] = save(fig, 'f5_ward_bill')

# F6 per-resident spending with and without water
fig, ax = plt.subplots(figsize=(6.6, 2.2))
cats = ['All operating', 'Excl. Water Services', 'Excl. water and waste']
v0 = [B['op_per_resident']['2027'] if '2027' in B['op_per_resident'] else B['op_per_resident'][2027], B['op_ex_water']['per_resident_2027'], B['op_ex_utilities']['per_resident_2027']]
v1 = [B['op_per_resident']['2030'] if '2030' in B['op_per_resident'] else B['op_per_resident'][2030], B['op_ex_water']['per_resident_2030'], B['op_ex_utilities']['per_resident_2030']]
real = [B['op_per_resident_real_growth_pct'], B['op_ex_water']['real_per_resident_growth_pct'], B['op_ex_utilities']['real_per_resident_growth_pct']]
xs = np.arange(3)
ax.bar(xs - 0.2, v0, 0.38, color='#a3bfe0', label='2027'); ax.bar(xs + 0.2, v1, 0.38, color=ACC, label='2030')
for i in range(3): ax.text(i + 0.2, v1[i] + 60, f'real {real[i]:+.1f}%', ha='center', fontsize=7.5)
ax.set_xticks(xs, cats); ax.set_ylabel('$ per resident (nominal)'); ax.grid(axis='x', visible=False); ax.legend(frameon=False, fontsize=7.5, loc='upper right'); ax.set_ylim(0, 5600)
figs['perres'] = save(fig, 'f6_per_resident')

# ---------- document ----------
ss = getSampleStyleSheet()
base = ParagraphStyle('b', parent=ss['Normal'], fontName='DV', fontSize=9.2, leading=12.6, textColor=colors.HexColor(INK), spaceAfter=5)
small = ParagraphStyle('s', parent=base, fontSize=7.6, leading=10, textColor=colors.HexColor(MUTED))
cap = ParagraphStyle('c', parent=small, fontName='DVI', spaceBefore=2, spaceAfter=9)
h1 = ParagraphStyle('h1', parent=base, fontName='DVB', fontSize=13, leading=16, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor('#102a43'))
h2 = ParagraphStyle('h2', parent=base, fontName='DVB', fontSize=10.2, leading=13, spaceBefore=8, spaceAfter=4)
mono = ParagraphStyle('m', parent=base, fontName='DVM', fontSize=7.6, leading=10, backColor=colors.HexColor('#f4f6f8'), borderPadding=5, spaceBefore=3, spaceAfter=8)
cell = ParagraphStyle('cell', parent=base, fontSize=7.6, leading=9.6, spaceAfter=0)
cellb = ParagraphStyle('cellb', parent=cell, fontName='DVB')
P = lambda t, s=base: Paragraph(t, s)

urlst = ParagraphStyle('url', parent=cell, wordWrap='CJK')
def table(rows, widths, header=True, align_right_from=1, col_styles=None):
    data = [[Paragraph(str(c), cellb if (header and i == 0) else ((col_styles or {}).get(j) or cell)) for j, c in enumerate(r)] for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor(GRID)), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]
    if header: st.append(('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8eef5')))
    t.setStyle(TableStyle(st)); return t

def img(p, w=6.4):
    from reportlab.lib.utils import ImageReader
    iw, ih = ImageReader(p).getSize(); return Image(p, width=w * inch, height=w * inch * ih / iw)

story = []
# Title block
story += [P('calgaryinsight.ca · Technical report · Independent analysis of a proposed budget. Not an official City of Calgary report.', small),
          P("Growth or Spending? Calgary's Proposed 15% Property Tax Increase", ParagraphStyle('t', parent=h1, fontSize=17, leading=21, spaceBefore=4)),
          P('A ward-level analysis of growth, spending, property assessments and amenity provision, 2021–2030', ParagraphStyle('st', parent=base, fontSize=10.5, textColor=colors.HexColor(MUTED))),
          P(f'Data pulled 13 November 2026 · Code and data: github.com/hassanaliarshad110/calgary-data-desk, frozen snapshot branches <font name="DVM">taxstudy-v1.5</font> (scripts, commit 6a0754f) and <font name="DVM">taxstudy-v1.3-data-p1/p2/p3</font> (raw data) · Independent audit: 5 passes, plus v1.4 and v1.5 section audits (Section 5)', small),
          Spacer(1, 6)]

story += [P('Abstract', h1), P(
    "On 10 November 2026 City administration proposed raising municipal property tax from existing properties by 15% in 2027, then 10%, 7.7% and 6% "
    f"(compounded +{B['tax_path_compound_pct']}% to 2030). We combine the City's 2027–2030 budget open data, 384 business cases, the full assessment roll "
    "(2023–2026, matched home by home), and modelled ward population estimates from the calgaryinsight.ca growth model to address four questions: (1) does the increase track growth and inflation, "
    "(2) who would bear it, (3) where growth and amenity inventories diverge, and (4) what 10% or 5% would mean in dollars. "
    f"Population growth combined with consumer inflation produces a comparison benchmark of +{B['pop_plus_cpi_2026_2030_pct']}% over 2026–2030, against a proposed cumulative tax-revenue increase of +{B['tax_path_compound_pct']}%; "
    f"over 2027–2030 the tax steps (+{B['tax_path_2027_2030_pct']}%) track operating spending (+{B['op_open_growth_pct']}% City data). "
    f"Real operating spending per resident rises {B['op_per_resident_real_growth_pct']}% (2027–2030) including the water utility and {B['op_ex_water']['real_per_resident_growth_pct']}% without it. "
    "Because Calgary taxes homes at one rate, the 15% revenue increase translates to roughly +18% for semi-detached homes, +16% for detached and +8% for condo apartments "
    "(indicative, back-tested error up to 2.7 points). On modelled estimates, five wards absorbed 51% of population growth since 2021; they have lower amenity provision by site count per resident than the other nine (amenity provision by inventory count: 33% fewer transit stops and 73% fewer City recreation sites per resident), which is not a measure of capacity or service quality. "
    f"Separately from the ~${WH['levy_step_2027_m']:.0f}M the proposed 2027 step would raise, the City's {WH['n_operating_requests']} operating requests ask for ${WH['total_2027_m']}M of new money in 2027 ({WH['ongoing_share_pct']:.0f}% ongoing), mostly under the City's Safe city ({WH['by_theme'][0][2]:.0f}%) and Reliable and sustainable infrastructure ({WH['by_theme'][1][2]:.0f}%) themes; the business cases do not show how much would be funded by property tax. "
    "The study does not argue for or against the increase. It compares the proposed tax trajectory with population growth, inflation and operating expenditure, examines the distribution of estimated tax changes across property types and wards, and identifies areas where growth and amenity inventories diverge.")]

story += [P('Three different "increases"', h2), table([
    ['Level', 'What it measures', '2027 figure', 'Source'],
    ['Citywide revenue', 'Municipal property tax levied on existing properties (budgeted revenue, homes and businesses)', '+15% (~$384M)', 'City (proposed)'],
    ['Residential tax rate', 'Rate per dollar of assessed value applied to homes', 'about +19% (18.7–19.5%)', 'Our inference from City typical-home figures'],
    ['Individual bill', "Your bill = your assessment × the rate; depends on how your assessment moved", 'Typical home +16%; by type about +8% to +18% (modelled, ±3 pts)', 'City (typical home); our estimate (types)'],
], [1.15 * inch, 2.75 * inch, 1.35 * inch, 1.25 * inch]),
    P('The 15% figure is the first row only. It is not the change on every bill.', small)]

story += [P('Executive conclusion', h1), table([
    ['The evidence establishes', 'The evidence does not establish'],
    ['The proposed tax path (+44.4% to 2030) is about three times population growth plus consumer inflation (+15.6%) over the same years.',
     'That spending above that benchmark is unnecessary. City costs also rise with wages, construction prices, ageing infrastructure and service obligations.'],
    ['From 2027, tax steps (+25.6%) and operating spending (+26.8% to +31.9%) move together; 43% of the spending increase is the water utility, which is rate-funded.',
     'Which specific programs should be funded or cut. The 10% and 5% gaps are scale comparisons, not cut lists.'],
    ['Because homes share one tax rate, semi-detached and detached owners would likely pay more than 15% and condo owners less, as already happened on 2026 bills.',
     'Any individual 2027 bill. 2027 assessments are unpublished; type estimates carry about ±3 points of uncertainty.'],
    ['On modelled estimates, growth since 2021 is concentrated (five wards, 51%), and those wards have fewer transit stops and recreation sites per resident.',
     'Service failure or lower service quality. Site counts do not measure capacity, and lower 311 rates are not evidence of better service.'],
    ['The proposed capital plan (about $4.4B in 2027, about $21B to 2030) would, if spent in full, be about 1.05 to 1.26 times the City\'s forecast 2026 capital spending ($4.18B) and 1.8 to 2.1 times its 2025 forecast; 42% of the $13B in new capital requests is the Water Utilities service area (water, wastewater, stormwater).',
     'Whether the City will or will not deliver it. Stage labels are not contract status, and unspent capital moves to later years rather than lapsing.'],
], [3.25 * inch, 3.25 * inch])]

story += [P('1. Research questions', h1), table([
    ['#', 'Question', 'Primary evidence', 'Section'],
    ['Q1', 'Is the increase explained by population growth and inflation?', 'City population/CPI forecasts; budget open data; Herald totals', '4.1–4.2'],
    ['Q2', 'Who pays more or less than 15%?', 'Assessment roll 2023–2026 matched by roll number; CREB benchmarks; tax bylaw', '4.3'],
    ['Q3', 'Where did growth happen and is service pressure visible?', 'Growth model by community/ward; 311; City asset inventories', '4.4–4.5'],
    ['Q4', 'What do 10% or 5% mean in dollars?', 'City typical-home figures; $25.6M per 1%; business-case totals', '4.6'],
    ['Q5', 'What does the proposal fund, and what pace does it require?', 'Business cases (operating and capital); City financial reports; press', '4.2.1–4.2.3'],
], [0.35 * inch, 2.45 * inch, 2.9 * inch, 0.8 * inch])]

story += [P('2. Data', h1), table([
    ['Source', 'ID / document', 'Coverage', 'Records used'],
    ['City 2027–2030 Budget (open data)', 'nnnm-9sfh', 'Operating (net of recoveries) and capital, by dept/BU, 2027–2032', '1,392 rows'],
    ['Budget request business cases', 'City PDF, 792 pp. (SHA-256 in README)', 'All operating and capital requests, Nov 2026', '384 cases (124 op, 260 cap)'],
    ['Current-year assessment roll', '4bsw-nn7w', '2026 roll (valued 1 Jul 2025)', '501,999 RE rows; 499,455 roll numbers'],
    ['Historical assessment roll', '4ur7-wsgc', 'Roll years 2023–2025', '469,439 / 477,666 / 491,208 rows'],
    ['2026 Property Tax Bylaw 9M2026', 'Alberta Municipal Affairs', 'Rates and levy by class', 'residential rate 0.0038906'],
    ['Growth model (calgaryinsight.ca)', 'population.py, dashboard.py', 'Homes × 2021 Census people per home, scaled to City total', '14 wards, residential communities'],
    ['311 service requests; City assets', '311 data; hxfu-6d96 (recreation); parks; transit stops', 'Nov 2024–Oct 2026', 'per ward'],
    ['City Economic Outlook', 'Spring 2026 Table 4; Fall 2026 Table 1', 'Population 2021–2030; CPI 2021–2030', '—'],
    ['CREB monthly statistics', 'Calgary packages, Jul 2025 / Jul 2026', 'Benchmark price YoY by type', '5 types × 2 years'],
    ['City financial reports', 'Annual Financial Reports 2023–2025; 2023 Progress Update; year-end 2024 update; 2025 Q3 and 2026 Q2 quarterly reports; Budget 2026 (preview and as approved)', 'Capital and operating budget vs actual and forecasts; year-end surpluses', '2023–2026'],
    ['Press', 'Calgary Herald (10 Nov), Global News (2 Sep, 10 Nov), CTV, CBC, LiveWire, BuildForce Canada', '2026 base, 2028–30 steps, $25.6M per 1%; 2027 capital, debt, positions, staff counts, construction labour outlook', 'cited inline'],
], [1.65 * inch, 1.7 * inch, 1.9 * inch, 1.25 * inch]),
    P('Collection: three GitHub Actions jobs (branches taxstudy-probe, taxstudy2-probe, taxstudy3-probe) queried the City portal on 13 Nov 2026 and committed raw outputs to the matching "-out" branches. Historical roll codes (e.g. RE0110, RE0410) were mapped to current codes (R110, R402) by cross-tabulating roll numbers present in both 2025 and 2026; leading zeros were stripped on both rolls.', small)]

story += [P('3. Methods', h1),
          P('3.1 Population', h2), P(
    "Homes = assessment roll, class RE, property type LI, sub-property use R*, by community and year built. Residents from new homes = homes × 2021 Census people per home (+ rentals). "
    "The main view scales every community's 2021 count by one factor (1.1001 on this run) and adds measured new-home growth so the sum equals the City's monthly estimate "
    "(straight line between April figures). Communities are assigned to the ward holding most of their area. The Census-based residential-community population (1,288,995) is about 2.5% below the City's April 2021 estimate (1,321,600). Ward estimates incorporate a uniform citywide scaling adjustment to align the two; this is not a ward-specific measurement of Census undercoverage. Ward figures are modelled estimates, not official ward counts. The City publishes a citywide estimate and forecast as of April each year, not ward populations; our ward totals sum the residential communities assigned to each ward and are interpolated to the month (November 2026). Community-to-ward assignment: each community goes wholly to the ward that contains most of its area (City community and ward boundary files); communities split by a ward boundary therefore count entirely in one ward."),
          P('3.2 Spending benchmarks', h2), P(
    "Per-resident spending = budget ÷ City April population of the same year; real = ÷ compounded City CPI forecast. Spans are matched (2026→2030 four steps; 2027→2030 three steps). "
    "The City's 2027–2030 open data is not comparable with 2023–2026, so the 2026 base uses Calgary Herald totals ($5.118B 2026, $5.963B 2027, $7.867B end of cycle). "
    "Water Services (and Waste & Recycling) are shown separately because they are funded mainly through utility rates, not property tax. "
    "Population plus consumer inflation is a comparison benchmark only: it is not a measure of justified spending, and spending above it is not by itself evidence of waste. "
    "City cost drivers (collective agreements, construction prices, ageing assets, new service obligations) can run above consumer inflation."),
          P('3.3 Who pays: rate-multiplier rule', h2), P("From the City's typical home (tax $229.32 → $266; value $706,000 → $688,000):"),
          P(f"R = (266 / 229.32) / (688,000 / 706,000) = {B['implied_rate_multiplier'][1]}   [range {B['implied_rate_multiplier'][0]}–{B['R_bylaw']}]<br/>"
            f"bill change(g) = (1 + g) × R − 1     break-even g = 1.15 / R − 1 = {B['breakeven_value_change_pct']}%<br/>"
            "g(type) = −2.55% + (CREB_Jul2026(type) − CREB_Jul2026(detached))<br/>"
            "ward change = Σ v·r·(1+g_type)·R / Σ v·r − 1   over every home on the 2026 roll, r = 0.0038906", mono),
          P("<b>Baseline.</b> The central estimate uses $229.32, the City's published 2026 monthly City tax for its typical single residential property (2026 budget adjustments, calgary.ca/adjustments). Recomputing that bill from the final 2026 bylaw rate gives 706,000 × 0.0038906 ÷ 12 = $228.90. The City's figure was published with the 2026 budget adjustments, before the final bylaw rate was set (March 31, 2026), which likely explains the $0.42 gap. $228.90 is used only as a sensitivity test: it moves R from 1.1903 to 1.1925 (+0.2 points). The $1 rounding of the City's $266 moves R by ±0.2 points."),
          P("R is inferred, not published. A rate rise above 15% can come from a falling residential base, a change in the residential/non-residential split, or both. "
            "CREB 'row' is applied to R401/R402 and 'apartment' to R201/R202/R301/R302; other residential codes use CREB total residential. "
            "Validation: the same anchoring applied to CREB July 2025 is compared with the actual 2025→2026 same-home medians (Section 5)."),
          P('3.4 Paired assessment change', h2), P(
    "Change = value(t) / value(t−1) − 1 for the same roll number and the same home type; medians and interquartile ranges by type. "
    f"2025→2026: {A['paired_2025_2026']:,} matched accounts, {A['same_type_pairs_2025_2026']:,} with the same type."),
          P('3.5 Service pressure', h2), P(
    "Transit stops and recreation sites: all sites in each ward divided by the ward's modelled residents (one base for counts and rates). Park hectares and 311 rates: per 1,000 residents of residential communities (311 uses mid-period residents), averaged across wards weighted by residents. The five fastest-growing wards (by modelled growth) are compared with the other nine. "
    "Counts measure sites, not size, quality or frequency of service.")]

story += [PageBreak(), P('4. Results', h1), P('4.1 The tax path against growth and inflation', h2), img(figs['bench']),
          P('Figure 1. Cumulative change on matching spans. Sources: City Economic Outlook (population, CPI); City budget open data; Calgary Herald; proposed tax path.', cap),
          P(f"Over 2026–2030 the tax path is about three times population plus inflation. From 2027 the tax steps (+{B['tax_path_2027_2030_pct']}%) and operating spending "
            f"(+{B['op_open_growth_pct']}% to +{B['op_herald']['growth_2027_2030_pct']}%) move together, both more than double population plus inflation (+{B['pop_plus_cpi_2027_2030_pct']}%). "
            f"Excluding Water Services, which is funded mainly through utility rates and accounts for {B['water_share_of_increase_pct']}% of the increase, City-data operating expenditure rises +{B['op_ex_water']['growth_pct']}% "
            f"(${B['op_ex_water']['2027_m']:,.1f}M to ${B['op_ex_water']['2030_m']:,.1f}M). This still does not show how much of the remaining spending is funded by property tax; that would need a funding-source reconciliation the City has not published. "
            f"The 2026→2027 jump in the Herald operating total is +{B['op_herald']['growth_2026_2027_pct']}%. July documents (Global News) put the increase needed only to maintain services in 2027 at 5.4%. The benchmark shows scale, not whether spending is justified (Section 3.2)."),
          KeepTogether([P('4.2 Spending per resident and where it grows', h2), img(figs['perres'])]),
          P('Figure 2. Operating spending per resident, City data (net of recoveries). Real growth deflated by City CPI forecast 2028–2030 (+6.0%).', cap),
          table([['Business unit', '2027 ($M)', '2030 ($M)', 'Change ($M)']] +
                [[x['bu'], f"{x['2027']:,.1f}", f"{x['2030']:,.1f}", f"+{x['change_m']:,.1f}"] for x in B['op_bu_top_change'][:6]] +
                [['All', f"{B['op_open_m']['2027'] if '2027' in B['op_open_m'] else B['op_open_m'][2027]:,.1f}", f"{B['op_open_m']['2030'] if '2030' in B['op_open_m'] else B['op_open_m'][2030]:,.1f}", f"+{B['op_increase_2027_2030_m']:,.1f}"]],
                [3.3 * inch, 1.05 * inch, 1.05 * inch, 1.1 * inch]),
          P(f"Water Services is {B['water_share_of_increase_pct']}% of the operating increase. New ongoing requests total ${B['ongoing_requests_m_total']}M (four years): "
            "explicit Council direction $256.5M, implicit $153.9M, risk-based $129.1M, provincial changes $28.2M, Police Commission $27.9M; 1,926 FTEs.", small),
          P(f"Capital requests (${B['capital_requests_b']}B, 2027–2031) by City purpose tag: maintenance {B['capital_split_pct']['maintenance']}%, growth {B['capital_split_pct']['growth']}%, "
            f"enhancement {B['capital_split_pct']['enhancement']}%, transformative {B['capital_split_pct']['transformative']}%. Utilities Delivery is ${B['capital_utilities_b']}B ({B['capital_utilities_pct']}%); "
            f"excluding it, maintenance is {B['capital_split_ex_utilities_pct']['maintenance']}%. Only {B['capital_named_ward_cases']} of 260 requests ({100 * B['capital_named_ward_cases'] / 260:.1f}%; {B['capital_named_ward_pct']}% of dollars) carry a ward tag; "
            f"the correlation between residents added and ward-tagged capital is {W['corr_growth_vs_named_capital']} (tags record location, not benefit).", small),
          P("<b>Capital periods.</b> The business cases request $13.05B in total: $13.02B for 2027–2030 plus $26.7M scheduled for 2031 and later (hence '2027–2031'). The City's $21B headline is the four-year capital plan: "
            f"these new requests plus capital approved in earlier budgets (the open data lists ${sum(v for k, v in B['capital_approved_m'].items() if int(k) <= 2030) / 1000:.1f}B approved for 2027–2030). "
            "The two published totals do not fully reconcile (about $1B); Sections 4.2.2–4.2.3 use $21B only as the City's stated four-year total.", small),
          P("<b>Two spending series, not one.</b> The City's open data (2027–2030, operating expenditures net of recoveries) and the Calgary Herald totals (2026 base and end-of-cycle total operating budget) "
            "use different accounting scopes, and no reconciliation between them has been published. They are reported side by side as separate comparisons and are never joined into one trend.", small)]

story += [P('4.2.1 What the 2027 requests would fund', h2),
          P(f"The proposed 15% step would raise about ${WH['levy_step_2027_m']:.0f}M in 2027 (at the reported ${WH['per_point_m_reported']}M per point). Separately, the City's {WH['n_operating_requests']} operating budget requests "
            f"({WH['n_with_2027_money']} with a 2027 amount) ask for ${WH['total_2027_m']}M of new money that year: ${WH['ongoing_2027_m']}M ongoing ({WH['ongoing_share_pct']:.0f}%) and ${WH['one_time_2027_m']}M one-time, with {WH['ftes_2027']} new full-time equivalent (FTE) positions. "
            "The two figures should not be subtracted. The business cases do not state which requests would be paid by property tax and which by reserves, fees or other sources, "
            f"and the levy step must also cover cost growth in existing services, which the business cases do not itemize; July City documents, as reported by Global News, put the increase needed only to maintain services at {WH['maintain_services_pct_reported']}% (roughly ${WH['maintain_services_m_approx']:.0f}M at ${WH['per_point_m_reported']}M per point, our arithmetic). "
            "Amounts are proposed and grouped by the City's own theme for each request; shares may not sum to 100 because of rounding."),
          table([['City theme', '2027 new money ($M)', 'Share']] + [[t, f"{v:,.1f}", f"{pc:.1f}%"] for t, v, pc in WH['by_theme']] +
                [['All 2027 requests', f"{WH['total_2027_m']:,.1f}", '100%']], [3.6 * inch, 1.5 * inch, 1.4 * inch]),
          Spacer(1, 6),
          table([['Request (City title, shortened)', 'Business unit', '2027 ($M)', 'Type', 'City rationale', 'Page']] +
                [[r['title'] if len(r['title']) <= 76 else r['title'][:74].rsplit(' ', 1)[0].rstrip(' -,') + '…', r['bu'], f"{r['m_2027']:.1f}", r['kind'], r['rationale'].replace('Direction from Council', 'Council direction'), str(r['page'])] for r in WH['top'][:10]],
                [2.2 * inch, 1.3 * inch, 0.6 * inch, 0.7 * inch, 1.2 * inch, 0.5 * inch]),
          P(f"The ten largest requests are {sum(r['m_2027'] for r in WH['top'][:10]) / WH['total_2027_m'] * 100:.0f}% of 2027 new money; the top three are {WH['top3_share_pct']:.0f}%. "
            f"By the City's own rationale categories, {WH['rationale_pct']['Explicit Direction from Council']:.0f}% cites explicit direction from Council and {WH['rationale_pct']['Implicit Direction from Council']:.0f}% implicit direction (the City's inference), "
            f"{WH['rationale']['Risk-based considerations'] / WH['total_2027_m'] * 100:.0f}% risk-based considerations and {WH['rationale']['Commission Requested'] / WH['total_2027_m'] * 100:.0f}% the Police Commission's request. "
            "Some 2027 amounts start larger programs: the City's note puts the full one-time request for renewing finance, supply-chain and HR systems at "
            f"${[r for r in WH['top'] if r['n'] == 14][0]['full_one_time_m']}M, and the Industrial Development Incentive Program at ${[r for r in WH['top'] if r['n'] == 255][0]['full_one_time_m']}M. "
            "The infrastructure maintenance request starts at $62.4M a year in 2027, with further yearly additions requested to 2030 ($18.8M, $15.7M, $11.9M). Page = page of the City's 792-page business-case document. 'Mixed' = ongoing and one-time money in 2027.", small)]

_y = K['new_capital_by_year_m']; _sa = {r[0]: r for r in K['by_service_area']}; _z = K['size']; _H = K['history']; _P = K['pace']
_st = {r[0]: r for r in K['by_stage']}; _st27 = {r[0]: r for r in K['by_stage_2027']}
story += [P('4.2.2 The capital plan', h2),
          P("The City proposes about $21B of capital from 2027 to 2030 (City budget page), about $4.4B of it in 2027 (as reported by Global News). "
            f"Of this, $13.05B is in {K['n_capital_requests']} new capital requests ({K['purpose_weighted'][0][2]}% of it maintenance or replacement by the City's purpose split); the rest is capital approved in earlier budgets ($6.9B in the open data; see the capital-periods note in 4.2). "
            f"The new requests rise from ${_y['2027']/1000:.2f}B in 2027 to ${_y['2028']/1000:.2f}B, ${_y['2029']/1000:.2f}B and ${_y['2030']/1000:.2f}B (${_y['2031+']:.1f}M in 2031+). "
            f"The Water Utilities service area (water, wastewater and stormwater) is the largest (${_sa['Water Utilities'][1]/1000:.2f}B, {_sa['Water Utilities'][2]:.1f}%; water and wastewater alone ${K['water_wastewater_excl_stormwater_m']/1000:.2f}B); Utilities Delivery, which also runs waste and recycling, is $5.87B (Section 4.2). "
            f"Then come all-services corporate needs (fleet, facilities, project development, land, technology; {_sa['All Services'][2]:.1f}%), roads and pathways ({_sa['Roads & Pathways'][2]:.1f}%) and transit ({_sa['Transit'][2]:.1f}%). "
            "Weighted by each request's purpose split: " + ', '.join(f"{n.lower()} {pc:.1f}%" for n, v, pc in K['purpose_weighted']) + ". "
            f"The median request is ${_z['median_m']}M; {_z['n_under_10m']} are under $10M, {_z['n_100m_plus']} are $100M or more and {_z['n_500m_plus']} exceed $500M (all water or wastewater); the ten largest are {_z['top10_share_pct']}% of the total and {K['top10_overall_share_of_2027_pct']}% of the 2027 amount "
            f"(the ten largest 2027 amounts are {_z['top10_share_2027_pct']}% of 2027). For the same requests the City lists ${K['needs_2027_2030_m']/1000:.1f}B of 2027–2030 needs; the budget funds ${K['budget_2027_2030_m']/1000:.1f}B ({K['needs_funded_pct']}%) in aggregate, "
            f"with {K['n_budget_above_own_needs']} requests budgeted above their own listed needs, partly from timing."),
          table([['Request (City title, shortened)', 'Service area', 'Total ($M)', '2027 ($M)', 'City stage', 'Page']] +
                [[r['title'] if len(r['title']) <= 60 else r['title'][:58].rsplit(' ', 1)[0].rstrip(' -,') + '…', r['service_area'], f"{r['total_m']:,.0f}", f"{r['m_2027']:,.0f}", r['stage'].split(': ')[1], str(r['page'])] for r in K['top'][:10]],
                [2.3 * inch, 1.05 * inch, 0.7 * inch, 0.65 * inch, 1.3 * inch, 0.5 * inch]),
          Spacer(1, 6),
          table([['Funding group (requests often combine sources)', 'New capital ($M)', 'Share']] + [[n, f"{v:,.0f}", f"{pc:.1f}%"] for n, v, pc in K['funding']],
                [4.1 * inch, 1.3 * inch, 1.1 * inch]),
          P("Funding groups are assigned by the sources each request lists, in this order: any self-supported debt; otherwise any tax-supported debt; otherwise neither. Fleet self-supported debt ($552M) is repaid through charges to other City units, many of them tax-supported. As reported, City debt would rise from $4.2B in 2027 to $10B in 2030, about 80% of its debt capacity.", small)]
story += [KeepTogether([P('4.2.3 What pace would the plan require?', h2),
          table([['Year', 'Capital budget', 'Spent', 'Spend rate', 'Source']] +
                [['2023', f"${_H['cap_2023']['budget_m']/1000:.2f}B", f"${_H['cap_2023']['actual_m']/1000:.2f}B", f"{_H['cap_2023']['rate_pct']}%", 'City 2023 Progress Update'],
                 ['2024', f"${_H['cap_2024']['budget_m']/1000:.2f}B", f"${_H['cap_2024']['actual_m']/1000:.2f}B", f"{_H['cap_2024']['rate_pct']}%", 'City year-end 2024 update'],
                 ['2025', '$2.7B', f"~${_H['cap_2025_forecast_m']/1000:.2f}B (forecast)", '91% (forecast)', 'City Q3 2025 report'],
                 ['2026', '$3.7B approved; $4.47B at Jun 30', '$1.38B to Jun 30; ~$4.18B (forecast)', '94% (forecast)', 'City Q2 2026 report'],
                 ['2027', '~$4.4B (proposed)', '–', '–', 'Global News'],
                 ['2027–2030', f"~${_P['cap_avg_2027_2030_b']:.2f}B a year (proposed)", '–', '–', 'calgary.ca ($21B / 4)']],
                [0.85 * inch, 1.85 * inch, 1.75 * inch, 0.9 * inch, 1.15 * inch])]),
          P(f"The City forecasts capital spending of about $4.18B in 2026 (94% of a budget approved at $3.7B and standing at $4.47B at June 30; $1.38B spent by then). If spent in full, the proposed 2027 capital budget would be about {_P['cap_2027_vs_2026f_x']:.2f} times the 2026 forecast and about {_P['cap_2027_vs_2025_x']:.1f} times the 2025 forecast; "
            f"the four-year average about {_P['cap_avg_vs_2026f_x']:.2f} and {_P['cap_avg_vs_2025_x']:.1f} times. The City's 2025 year-end forecasts moved between 91% and 101% during the year; the 2025 year-end actual is in a report that could not be retrieved, and the 2026 figure can still change. "
            f"By the City's stage labels, {_st['Stage 4: Execute'][2]}% of new capital ({_st27['Stage 4: Execute'][2]}% of 2027) is at Stage 4, Execute; {100 * (_st['Stage 1: Identify'][1] + _st['Stage 2: Assess & Select'][1]) / K['new_capital_total_m']:.1f}% is at Identify or Assess & Select. "
            "Stage labels are not contract status, which the budget documents do not give. Among works in the four-year plan, the Fish Creek wastewater plant upgrade contract was awarded in January 2025 ($547.1M; the contractor lists completion in 2030). "
            f"The Green Line, funded mainly from earlier approvals (${K['green_line_in_new_requests_m']}M in the new requests), reports more than $200M of construction contracts awarded, station contracts expected late 2026 and its track RFP posted in July 2026. "
            f"The operating requests (none of the capital requests) add {_P['new_ftes_2027']} FTEs in 2027 and {_P['new_ftes_4y']:,} over four years (about 1,800 as reported), mostly in " + ', '.join(f"{n} ({v})" for n, v in K['ftes_4y_by_bu_top'][:3]) + ". "
            "For scale, the City's website lists 16,846 employees (basis and scope not stated); City staff excluding police, civic partners and on-call, student and seasonal staff rose from 13,483 (Dec 2022) to 15,751 (Sept 2024) (City data via CBC); the website figure and this series are on different bases. "
            "The City attributes part of its first-half 2026 operating savings to vacancies and delayed hiring (Q2 2026 quarterly report). Large projects are built by contractors (for example Graham on Fish Creek; PCL and Graham on Green Line packages). "
            "The City's 2026 budget lists cost escalation from a tight labour market and supply chain challenges as a capital-delivery risk; BuildForce Canada forecasts that Alberta's construction labour force will need to add 48,800 workers by 2035, including replacing about 43,700 retirements. "
            "Capital budget that is not spent is re-timed to later years: in February 2025 the City moved $893M of its 2025 budget to 2027 and later, so it now falls in or after the 2027–2030 plan period. "
            f"Separately, consolidated operating expenses were {_H['operating_actual_vs_budget_pct']['2023']}%, {_H['operating_actual_vs_budget_pct']['2024']}% and {_H['operating_actual_vs_budget_pct']['2025']}% of budget in 2023–2025 (Annual Financial Reports); the year-end operating surpluses "
            f"(${_H['operating_surplus_m']['2023']:.0f}M, ${_H['operating_surplus_m']['2024']:.0f}M, ${_H['operating_surplus_m']['2025']:.0f}M) reflect both spending below budget and revenue above it, such as investment income, and were transferred to the Fiscal Stability Reserve the following year. "
            "The study does not predict delivery; it shows the pace the plan would require.")]

story += [KeepTogether([P('4.3 Who pays more than 15%', h2), img(figs['paired'])]),
          P('Figure 3. Same-home assessment change by type, 2025→2026 roll (valuation dates 1 Jul 2024 → 1 Jul 2025). Dot = median; bar = interquartile range.', cap),
          table([['Home type', 'Homes 2026', 'Median value', 'Median Δ 25→26', 'Δ 23→26', 'Share above base']] +
                [[t, f"{A['count_2026'].get(t, 0):,}", f"${A['median_value_2026'].get(t, 0):,.0f}", f"{pr[t]['median_pct']:+.1f}%",
                  f"{A['pairs']['2023-2026'][t]['median_pct']:+.1f}%", f"{A['share_above_base_2025_2026'].get(t, 0):.0f}%"] for t in types],
                [2.2 * inch, 0.8 * inch, 0.9 * inch, 0.95 * inch, 0.75 * inch, 0.9 * inch]),
          Spacer(1, 6),
          table([['Home type', 'CREB Jul-2026 YoY', 'Assumed 2027 assessment Δ', 'Modelled 2027 City tax Δ (central)', 'Range (±3 pts)']] +
                [[k, f"{v:+.2f}%", f"{B['who_pays_anchored'][k]['value_change_pct']:+.2f}%", f"{B['who_pays_anchored'][k]['bill_change_pct']:+.1f}%", f"{B['who_pays_anchored'][k]['bill_change_pct'] - 3:+.0f}% to {B['who_pays_anchored'][k]['bill_change_pct'] + 3:+.0f}%"]
                 for k, v in [('Semi-detached', -0.30), ('Detached', -1.87), ('Row', -6.10), ('Apartment condominium', -8.37)]],
                [1.7 * inch, 1.1 * inch, 1.35 * inch, 1.35 * inch, 1.0 * inch]),
          P('Modelled municipal tax changes for each home type, not confirmed individual bills. The range reflects the back-tested error of the CREB proxy (up to 2.7 points).', small),
          Spacer(1, 4), img(figs['backtest']),
          P('Figure 4. Back-test of the anchoring method on the 2026 roll. Errors: semi +1.2, row codes −0.4 / −2.2, apartments +2.7 points. Direction correct for every type; CREB understated the condo apartment decline.', cap),
          img(figs['wardbill']),
          P(f"Figure 5. Model-implied relationship, not independent evidence: the model assumes condo apartment assessments fall more than houses, so wards with more condo apartments are estimated to get smaller increases. Citywide check: +{W['city']['bill_change_2027_pct']}%. "
            f"Sensitivity: with raw CREB changes (no anchoring) wards range {min(v for k, v in W['ward_bill_sensitivity']['raw_creb'].items() if k != '0'):+.1f}% to {max(v for k, v in W['ward_bill_sensitivity']['raw_creb'].items() if k != '0'):+.1f}%; "
            f"with apartments a further 2.7 points lower (the back-test error) {min(v for k, v in W['ward_bill_sensitivity']['apartments_minus_2_7'].items() if k != '0'):+.1f}% to {max(v for k, v in W['ward_bill_sensitivity']['apartments_minus_2_7'].items() if k != '0'):+.1f}%. "
            "In both, Wards 8 and 7 stay lowest and Wards 10 and 4 highest.", cap)]

story += [KeepTogether([P('4.4 Growth by ward', h2), img(figs['growth'])]),
          P(f"Figure 6. Modelled estimate (not an official ward count). Dark: residents in new homes, measured by community. Light: growth new homes do not explain, allocated evenly by the model (not measured by ward); "
            f"it includes the uniform scaling to the City's 2021 estimate. Like-for-like citywide growth on the City's estimates: +{W['growth_like_for_like_pct']}%. Residents are rounded to the nearest 100.", cap),
          P("<b>Allocation sensitivity.</b> Share of added residents in the five fastest-growing wards (5, 12, 3, 13, 2) under different allocations of growth that new homes do not explain: "
            f"even by 2021 population (main) {W['five_share_sensitivity']['even_by_2021_population (main)']}%; equal per ward {W['five_share_sensitivity']['equal_per_ward']}%; "
            f"proportional to new-home growth {W['five_share_sensitivity']['proportional_to_new_home_growth']}%. The finding that about half or more of growth went to these five wards holds under all three.", small),
          table([['Ward', 'Residents now (model)', '2021 Census', 'Δ (Census base)', 'Δ new homes', 'Homes added', 'Share of added', 'Res. tax / resident', 'Est. 2027 Δ', 'Condo apt %']] +
                [[x['ward'], f"{round(x['residents_now'], -2):,}", f"{x['census2021']:,}", f"{x['growth_pct']:+.1f}%", f"{x['growth_model_pct']:+.1f}%", f"{x['homes_added']:,}",
                  f"{x['share_of_city_growth_pct']}%", f"${x['muni_res_tax_per_resident']:,}", f"{x['bill_change_2027_pct']:+.1f}%", f"{x['apt_share_pct']}%"] for x in W['wards']] +
                [['City', f"{round(W['city']['residents_now'], -2):,}", f"{W['city']['census2021']:,}", f"{W['city']['growth_pct']:+.1f}%", f"{W['city']['growth_model_pct']:+.1f}%",
                  f"{W['city']['homes_now'] - W['city']['homes_2021']:,}", '100%', f"${W['city']['muni_res_tax_per_resident']:,}", f"{W['city']['bill_change_2027_pct']:+.1f}%", f"{W['city']['apt_share_pct']}%"]],
                [0.5 * inch, 0.75 * inch, 0.78 * inch, 0.7 * inch, 0.62 * inch, 0.62 * inch, 0.6 * inch, 0.7 * inch, 0.68 * inch, 0.62 * inch]),
          ]
fv = W['fast_vs_rest']
rc = W['rec_count_based']; tc = W['transit_count_based']
story += [P('4.5 Amenity provision by inventory count, and 311', h2), table([['Measure', 'Five fastest (W5, 12, 3, 13, 2)', 'Other nine', 'Difference']] +
                [['Transit stops per 1,000 (all stops in ward ÷ residents)', f"{tc['fast_per_1000']:.2f}", f"{tc['rest_per_1000']:.2f}", f"{tc['gap_pct']:+.0f}%"],
                 ['City recreation sites per 100,000 (all sites in ward ÷ residents)', f"{rc['fast_per_100k']:.2f} ({rc['fast_sites']} sites / {rc['fast_residents']:,})", f"{rc['rest_per_100k']:.2f} ({rc['rest_sites']} / {rc['rest_residents']:,})", f"{rc['gap_pct']:+.0f}%"],
                 ['Local park ha per 1,000 (residential communities, resident-weighted)', f"{fv['local_park_ha_per_1000']['fast']:.2f}", f"{fv['local_park_ha_per_1000']['rest']:.2f}", f"{fv['local_park_ha_per_1000']['gap_pct']:+.0f}%"],
                 ['311 requests per 1,000 a year (resident-weighted)', f"{fv['requests_per_1000']['fast']:.0f}", f"{fv['requests_per_1000']['rest']:.0f}", f"{fv['requests_per_1000']['gap_pct']:+.0f}%"]],
                [2.4 * inch, 1.75 * inch, 1.45 * inch, 0.9 * inch]),
          P("Interpretation: the five fastest-growing wards have lower amenity provision by inventory count per resident. Counts do not measure capacity, size, quality or accessibility; one large complex counts the same as a small facility. "
            "311 request rates are lower in the fastest-growing wards. This should not be interpreted as evidence of better service delivery or lower infrastructure pressure: "
            "request rates also reflect reporting habits, awareness of 311, access and the age of the housing stock.", base),
          P("A transit stop is not a measure of frequency or capacity; a recreation site is not a measure of size; park hectares do not measure access or upkeep; 311 requests are not a count of infrastructure failures. "
            f"Ward-level correlations with growth (n = 14, descriptive only): transit stops {W['corr_growth_vs_transit']} (dropping the fastest ward {W['corr_sensitivity']['transit_stops_per_1000']['drop_fastest']}, the two fastest {W['corr_sensitivity']['transit_stops_per_1000']['drop_two_fastest']}, leave-one-out {W['corr_sensitivity']['transit_stops_per_1000']['leave_one_out_min']} to {W['corr_sensitivity']['transit_stops_per_1000']['leave_one_out_max']}); "
            f"recreation {W['corr_growth_vs_rec']} ({W['corr_sensitivity']['rec_facilities_per_1000']['drop_fastest']}, {W['corr_sensitivity']['rec_facilities_per_1000']['drop_two_fastest']}; {W['corr_sensitivity']['rec_facilities_per_1000']['leave_one_out_min']} to {W['corr_sensitivity']['rec_facilities_per_1000']['leave_one_out_max']}); "
            f"311 rate {W['corr_growth_vs_311']} ({W['corr_sensitivity']['requests_per_1000']['drop_fastest']}, {W['corr_sensitivity']['requests_per_1000']['drop_two_fastest']}; {W['corr_sensitivity']['requests_per_1000']['leave_one_out_min']} to {W['corr_sensitivity']['requests_per_1000']['leave_one_out_max']}). "
            f"The transit and recreation associations keep their sign and weaken but do not vanish when the fastest wards are removed; the 311 association is weak. Citywide 311: {W['city']['requests_per_1000']} per 1,000 (prev. {W['city']['requests_per_1000_prev']}).", small),
          KeepTogether([P('4.6 Scenarios for 2027', h2), P('<b>These are revenue gaps against the proposed 15%, not savings or cuts.</b> They do not show that spending could fall by these amounts without affecting services. All dollar amounts are estimates based on the reported figure of about $25.6M per percentage point, assumed constant across scenarios; the City has not published a scenario table, and our own estimate from the 2026 levy is $25.2M per point.', base),
          table([['2027 increase', 'Est. revenue (at $25.6M per 1%)', 'Typical home $/month', 'Δ vs 2026 /month', 'Δ /year', 'Revenue gap against the proposed 15%', 'Gap as % of new 2027 requests (all / ongoing)']] +
                [[f'{p}%', f"${B['scenarios'][str(p)]['revenue_m']:.0f}M", f"${B['scenarios'][str(p)]['typical_month']:.2f}", f"+${B['scenarios'][str(p)]['typical_month_change']:.2f}",
                  f"+${B['scenarios'][str(p)]['typical_year_change']}", '—' if p == 15 else f"${B['scenarios'][str(p)]['gap_vs_15_m']:.0f}M",
                  '—' if p == 15 else f"{B['gap_share_of_2027_requests_pct'][str(p)]}% / {B['gap_share_of_2027_ongoing_pct'][str(p)]}%"] for p in (15, 10, 5)],
                [0.7 * inch, 0.9 * inch, 0.85 * inch, 0.85 * inch, 0.55 * inch, 1.05 * inch, 1.6 * inch])]),
          P(f"Four-year path on the typical home: ${B['typical_path_month']['2026']:.0f} → ${B['typical_path_month']['2027']:.0f} → ${B['typical_path_month']['2028']:.0f} → "
            f"${B['typical_path_month']['2029']:.0f} → ${B['typical_path_month']['2030']:.0f} a month (+${B['typical_2030_year_change']:,}/yr by 2030; +{B['typical_2030_real_change_pct']}% real). "
            "The gap ratios are a scale comparison, not a cut list: the 15% also funds cost growth in the existing budget, and the business cases do not state how much of the requests would be paid by property tax (Section 4.2.1).", small),
          P("How the scenarios are calculated: revenue = increase × $25.6M per 1% (reported City figure). Typical-home bill = $229.32 × (1 + increase) × 1.0087, where 1.0087 = 266 ÷ 229.32 ÷ 1.15 "
            "is the City's own ratio between its typical-home change and the 15% revenue change; it is held constant across scenarios. "
            "Denominators for the gap ratios: all new 2027 requests = $276.1M ongoing + $78.6M one-time = $354.7M (e.g. $128M ÷ $354.7M = 36.1%); "
            "ongoing only = $276.1M ($128M ÷ $276.1M = 46.4%). Both come from the totals of the City's 384 business cases.", small)]

story += [P('5. Validation and sensitivity', h1), table([
    ['Check', 'Result'],
    ['Independent re-run of all scripts', 'Figure files byte-identical (auditor pass 1 and 2; analysis_where.py re-run byte-identical in the v1.4 audit; analysis_capital.py re-run byte-identical in both v1.5 audits)'],
    ['Rate multiplier R', f"{B['implied_rate_multiplier'][0]}–{B['R_bylaw']} from $1 rounding of $266 and the 2026 bylaw rate ($228.90/month); reported as ~19% (18.7–19.5%)"],
    ['Anchoring consistency', f"Type changes applied to every home give a citywide residential increase of +{W['city']['bill_change_2027_pct']}% (target 15%)"],
    ['CREB back-test (2026 roll)', 'Direction correct for all types; absolute error ≤ 2.7 points; apartment decline understated'],
    ['Population base', f"Census base vs City 2021 estimate: −2.5%; like-for-like growth +{W['growth_like_for_like_pct']}% (vs +24.0% on Census base)"],
    ['Matched spans', 'All growth benchmarks compared over identical year spans (2026→2030, 2027→2030)'],
    ['Population allocation', f"Five-ward share of growth {min(W['five_share_sensitivity'].values())}% to {max(W['five_share_sensitivity'].values())}% across allocations of residual growth"],
    ['Ward tax ranking', 'Wards 8 and 7 lowest, 10 and 4 highest under the central, raw-CREB and apartments −2.7-point assumptions'],
    ['Correlation robustness', 'Transit and recreation associations keep their sign after dropping the fastest one or two wards and under leave-one-out; n = 14'],
    ['Recreation rate', 'Count and rate on one base (all sites ÷ ward residents): 17 ÷ 635,573 = 2.67 per 100,000'],
    ['Audit', 'Pass 1 (Claude Fable): 7 high, 12 medium, 3 low findings, all addressed. Pass 2: 1 new error (span mismatch) and 4 minor, fixed. Pass 3 (external review of the PDF, 8/10): baseline, terminology, 311 interpretation, model qualification and amenity wording, all addressed in v1.1. Pass 4 (second external review): recreation base, levied vs collected, model-implied correlation, Census wording, population and correlation sensitivity, capital periods, spending series, ±3-point ranges, gap labelling; all addressed in v1.2. Pass 5 (third external review, 9/10): operating growth excluding water, four questions, subtitle, abstract scope, $25.6M qualification, full links and frozen snapshot branches; all addressed in v1.3. v1.4 (new Section 4.2.1): audit with independent recomputation, 12 findings (levy step not to be netted against requests, approval wording, theme labels, rounding), all addressed; final check by Claude Fable. v1.5 (Sections 4.2.2–4.2.3): audit with independent recomputation, 24 findings, all addressed; final check by Claude Fable, which found the 2026 capital comparator missing (added from the City\'s Q2 2026 report) and 13 minor items, all addressed.'],
], [1.9 * inch, 4.6 * inch])]

story += [P('6. Limitations', h1)] + [P(f'{i}. {t}', base) for i, t in enumerate([
    '2027 assessments are unpublished (roll mailed January 2027); type and ward bill changes are indicative proxies (±3 points).',
    'R is inferred from rounded City figures; the residential/non-residential split for 2027 is unknown.',
    '2028–2030 tax steps, the $25.6M per 1% and the 2026 operating base come from news reports, not City documents we could read.',
    'Ward populations are model estimates; growth not explained by new homes is spread evenly and is not measured by ward.',
    'Amenity counts measure sites, not capacity or service frequency; correlations use n = 14 and are descriptive.',
    'Ward capital tags record location, not benefit, and cover 8.2% of requested dollars.',
    'R401/R402 home-type labels are inferred from value, zoning and building age, not from a City code list.',
    'Consumer inflation is used as a benchmark; City cost inflation (wages, construction) can differ.',
    'Property tax figures are tax levied (billed), estimated from the roll and the 2026 bylaw, not tax collected.',
    '2025 and 2026 capital spending are City forecasts (Q3 2025 and Q2 2026), not year-end actuals; the $21B (City) and $13.05B (requests) differ in scope and do not fully reconcile; stage labels are not contract status; the new FTEs are in operating requests; staff counts come from sources on different bases.'], 1)]

story += [KeepTogether([P('7. Reproducibility', h1), P('Repository: <link href="https://github.com/hassanaliarshad110/calgary-data-desk" color="#2b6cb0">github.com/hassanaliarshad110/calgary-data-desk</link>. Frozen snapshot branches (not updated after release): <font name="DVM">taxstudy-v1.5</font> at commit <font name="DVM">6a0754f</font> (scripts, figure files, this report builder) and <font name="DVM">taxstudy-v1.3-data-p1</font> (d050cc6), <font name="DVM">-p2</font> (7e1713b), <font name="DVM">-p3</font> (56cc601) (raw probe outputs pulled 13 Nov 2026). Requirements: Python 3.12+ (standard library for the analysis; matplotlib and reportlab for the PDF) and a checkout of the main branch.'),
          P("git clone -b taxstudy-v1.5 https://github.com/hassanaliarshad110/calgary-data-desk.git ta<br/>"
            "for b in taxstudy-v1.3-data-p1:p1 taxstudy-v1.3-data-p2:p2 taxstudy-v1.3-data-p3:p3; do<br/>"
            "&nbsp;&nbsp;git clone -q --depth 1 -b ${b%%:*} https://github.com/hassanaliarshad110/calgary-data-desk.git ta/taxstudy/${b##*:}; done<br/>"
            "cd ta/taxstudy &amp;&amp; export STUDY=$(pwd) REPO=/path/to/calgary-data-desk<br/>"
            "python3 analysis_budget.py &amp;&amp; python3 analysis_assess.py &amp;&amp; python3 analysis_wards.py<br/>python3 analysis_where.py business-cases.json<br/>python3 analysis_capital.py business-cases.json budget-vs-actual.json", mono)]),
          table([['Script', 'Output', 'Feeds']], [1.8 * inch, 1.5 * inch, 3.2 * inch]),
          ]
story[-1] = table([['Script', 'Output', 'Feeds'],
                   ['probe/taxstudy.py', 'p1/ (dashboard build, tax by community)', 'Growth, 311, amenities, tax per resident'],
                   ['probe/taxstudy2.py', 'p2/ (2026 homes, budget open data)', 'Operating/capital budget'],
                   ['probe/taxstudy3.py', 'p3/ (rolls 2022–2026 by roll number)', 'Paired changes, back-test, ward bill change'],
                   ['analysis_budget.py', 'fig_budget.json', 'Sections 4.1, 4.2, 4.3 (rule), 4.6'],
                   ['analysis_assess.py', 'fig_assess.json', 'Section 4.3 (paired, back-test)'],
                   ['analysis_wards.py', 'fig_wards.json', 'Sections 4.3 (ward), 4.4, 4.5'],
                   ['analysis_capital.py', 'fig_capital.json', 'Sections 4.2.2–4.2.3 and Executive conclusion (reads business-cases.json and budget-vs-actual.json, pinned; cited press and City figures are listed with sources in the script)'],
                   ['analysis_where.py', 'fig_where.json', 'Abstract and Section 4.2.1 (reads business-cases.json, pinned in the snapshot; SHA-256 of the City PDF recorded in the file; and fig_budget.json)']],
                  [1.8 * inch, 2.3 * inch, 2.4 * inch])
story += [P('Hard-coded inputs and their sources are listed in taxstudy/README.md. Ward figures move slightly with the run date because the City total is interpolated monthly.', small),
          P('Sources', h1), P('Every title and address is a clickable link; addresses are given in full.', small), table([['Source (click to open)', 'Full address']] + [['<link href="%s" color="#2b6cb0">%s</link>' % (u, t), '<link href="%s" color="#2b6cb0"><font name="DVM" size="6.3">%s</font></link>' % (u, u)] for t, u in [('City of Calgary, 2027 Budget page and financial impact (15%, typical home $229 to $266, $21B capital)', 'https://www.calgary.ca/our-finances/2027-budget.html'), ('City of Calgary, 2026 budget adjustments (typical home $229.32 a month)', 'https://www.calgary.ca/adjustments'), ('City of Calgary, proposed 2027–2030 Budget document (Nov 10, 2026)', 'https://pub-calgary.escribemeetings.com/FileStream.ashx?DocumentId=377372'), ('City of Calgary, 2027–2030 operating and capital budget requests (792 pp.)', 'https://www.calgary.ca/content/dam/www/ca/city-manager/documents/2027-2030-budget/2027-2030-operating-capital-budget-requests.pdf'), ('Open data: 2027–2030 Budget (nnnm-9sfh)', 'https://data.calgary.ca/Government/2027-2030-Budget/nnnm-9sfh'), ('Open data: Current Year Property Assessments (4bsw-nn7w)', 'https://data.calgary.ca/d/4bsw-nn7w'), ('Open data: Historical Property Assessments (4ur7-wsgc)', 'https://data.calgary.ca/d/4ur7-wsgc'), ('Open data: Recreation facilities (hxfu-6d96)', 'https://data.calgary.ca/d/hxfu-6d96'), ('2026 Property Tax Bylaw 9M2026 (rates and levy)', 'https://municipalaffairs.gov.ab.ca/cfml/FinancialTaxRateSearch/pdf/tr_bylaws/2026_Bylaw_CALGARY_0046.pdf'), ('Calgary and Region Economic Outlook, Spring 2026 (Table 4, population)', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf'), ('Calgary and Region Economic Outlook, Fall 2026 (Table 1, inflation)', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Fall.pdf'), ('CREB Calgary Monthly Statistics, July 2026', 'https://www.creb.com/Housing_Statistics/documents/07_2026_Calgary_Monthly_Stats_Package.pdf'), ('CREB Calgary Monthly Statistics, July 2025', 'https://www.creb.com/Housing_Statistics/documents/07_2025_Calgary_Monthly_Stats_Package.pdf'), ('Calgary Herald via Yahoo News (Nov 10, 2026): operating totals, +$204/month by 2030', 'https://ca.news.yahoo.com/calgary-draft-budget-proposes-largest-160350073.html'), ('CTV News (Nov 10, 2026): 15/10/7.7/6 path', 'https://www.ctvnews.ca/calgary/article/calgary-budget-proposes-largest-single-year-property-tax-increase-in-about-30-years/'), ('LiveWire Calgary (Nov 10, 2026): $25.6M per 1%', 'https://livewirecalgary.com/2026/11/10/calgary-four-year-budget-breakdown-money-spent/'), ('Global News (Sept 2, 2026): 20.2% request list, 5.4% to maintain services', 'https://globalnews.ca/news/12044564/calgary-2027-budget-requests-property-tax-estimate/'), ('CBC News (Nov 2026): Edmonton proposed budget', 'https://www.cbc.ca/news/canada/edmonton/proposed-edmonton-operating-budget-calls-for-property-tax-hikes-between-3-9-and-4-9-9.7406008'), ('Global News (Nov 10, 2026): $4.4B capital in 2027, $21B/$13B, debt $4.2B to $10B, 1,800 positions', 'https://globalnews.ca/news/12144269/calgary-budget-proposes-15-property-tax-increase/'), ('City of Calgary, 2023 Progress Update (2023 capital budget and spend)', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/plans-budgets-and-financial-reports/progress-update-report.pdf'), ('City of Calgary, Financial and Economic Update, 2024 Year-End and Q1 2025', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/financial-economic-update-2024-year-end-Q1-2025.pdf'), ('City of Calgary, Quarterly Report 2025 Second and Third Quarter (2025 forecast 91%)', 'https://pub-calgary.escribemeetings.com/filestream.ashx?DocumentId=339376'), ('City of Calgary, Budget 2026 as approved Dec 3, 2025 ($3.7B capital; capital-delivery risks)', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/plans-budgets-and-financial-reports/2023-2026-service-plans-budgets/2026-budget-as-approved-dec-3-2025.pdf'), ('City of Calgary, Quarterly Report 2026 Second Quarter (2026 capital forecast; delayed hiring)', 'https://www.calgary.ca/content/dam/www/our-organization/our-performance/documents/quarterly-report-2026-q2.pdf'), ('City of Calgary, 2023 Annual Financial Report', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/Finance-2023-Annual-Report.pdf'), ('City of Calgary, 2024 Annual Financial Report', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/Finance-2024-Annual-Report.pdf'), ('City of Calgary, 2025 Annual Financial Report', 'https://www.calgary.ca/content/dam/www/cfod/finance/documents/2025-Annual-Financial-Report.pdf'), ('LiveWire Calgary (Jul 22, 2025): Q2 2025 capital forecast 101%', 'https://livewirecalgary.com/2025/07/22/citys-spring-spending-surplus-steady-despite-dicey-economy/'), ('LiveWire Calgary (Feb 10, 2025): capital recast, $893M moved from 2025', 'https://livewirecalgary.com/2025/02/10/normal-course-of-business-city-capital-spend-deferred-to-align-with-project-delivery/'), ('LiveWire Calgary (Jul 27, 2026): 16,846 City employees', 'https://livewirecalgary.com/2026/07/27/calgary-compensation-disclosure-coo-director-level-pay-bands/'), ('CBC News: City of Calgary staff counts 2022 to 2024', 'https://www.cbc.ca/news/canada/calgary/city-calgary-administration-headcount-growth-staff-1.7414092'), ('BuildForce Canada (Jul 20, 2026): Alberta construction outlook to 2035', 'https://www.buildforce.ca/en/press-release/construction-activity-rises-in-alberta-to-2035-as-non-residential-growth-offsets-moderating-residential-demands/'), ('LiveWire Calgary (Feb 14, 2025): Fish Creek WWTP contract, $547,125,000', 'https://livewirecalgary.com/2025/02/14/calgarys-fish-creek-wastewater-treatment-plant-upgrade-to-have-alberta-first-heat-technology/'), ('Graham: Fish Creek WWTP upgrades (completion 2030)', 'https://www.grahambuilds.com/fish-creek-wastewater-treatment-plant-upgrades/'), ('City of Calgary, Green Line Year One update ($200M+ awarded)', 'https://www.calgary.ca/green-line/green-line-news/article-engine/year-one-365-days-of-progress.html'), ('City of Calgary, Green Line: contracts awarded to Graham, PCL and Supreme Steel', 'https://www.calgary.ca/green-line/green-line-news/article-engine/new-construction-contracts-awarded-to-graham-pcl-and-supreme-steel-supporting-local-jobs.html'), ('City of Calgary, Green Line track contract (RFP July 24, 2026)', 'https://www.calgary.ca/green-line/construction/supply-and-contract-opportunities/supply-and-contract-opportunities-article-engine/track.html')]], [2.7 * inch, 3.8 * inch], col_styles={1: urlst})]

def frame(c, d):
    c.saveState(); c.setFont('DV', 7); c.setFillColor(colors.HexColor(MUTED))
    c.drawString(0.75 * inch, 0.5 * inch, "calgaryinsight.ca · 15% property tax study · technical report v1.5 · 13 Nov 2026 · independent analysis, not a City of Calgary report")
    c.drawRightString(letter[0] - 0.75 * inch, 0.5 * inch, f'{d.page}'); c.restoreState()

doc = SimpleDocTemplate(f'{OUT}/Calgary_15pct_Tax_Study_Technical_Report.pdf', pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                        topMargin=0.7 * inch, bottomMargin=0.75 * inch, title="Growth or Spending? Calgary's Proposed 15% Property Tax Increase — Technical report",
                        author='calgaryinsight.ca', subject='Draft technical report')
doc.build(story, onFirstPage=frame, onLaterPages=frame)
print('ok')
