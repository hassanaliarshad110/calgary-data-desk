"""Calgary Capital Markets: Calgary's public companies, from official sources, collected apart from the page.

Read at every website refresh:
  - TMX's monthly list of TSX and TSX Venture Exchange issuers (tsx.com). TMX does not allow the file to be copied or
    redistributed, so only totals worked out from it are published: counts and market value by exchange, sector,
    province and group, never a company's own figures. Groups of fewer than MIN_GROUP companies show a count only.
  - TMX's TSX and TSXV company directories: every listed ticker, to check the tickers in the company list.
  - US SEC filings (data.sec.gov), for the Calgary companies that also file in the United States: revenue, net income
    and dividends per share by year, and the latest filing date. The SEC asks every reader to give a contact email
    (CDD_SEC_CONTACT); without one this part is skipped.
The company list itself (head office city, group, industry, website) is checked by hand, company by company, and kept
in ui/capmkt/companies.json with a source for every head office.

    python capmkt.py OUT.json [PREVIOUS.json]
"""
import datetime as dt
import io
import json
import os
import re
import sys
import time
import urllib.request

TMX_ISSUERS = 'https://www.tsx.com/resource/en/571'
TMX_DIR = 'https://www.tsx.com/json/company-directory/search/{ex}/%5E*'
SEC_TICKERS = 'https://www.sec.gov/files/company_tickers_exchange.json'
SEC_SUBS = 'https://data.sec.gov/submissions/CIK{cik:010d}.json'
SEC_FACTS = 'https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json'
UA = 'Mozilla/5.0 (CalgaryInsight civic data dashboard)'
MIN_GROUP = 3                              # a total over fewer companies would show a company's own figure
FUNDS = ('ETP', 'Closed-End Funds')
BANDS = [('Large (C$10 billion or more)', 10e9), ('Mid (C$2 to 10 billion)', 2e9), ('Small (C$300 million to 2 billion)', 3e8), ('Micro (under C$300 million)', 0)]
HERE = os.path.dirname(os.path.abspath(__file__))


def _get(url, ua=UA, timeout=120):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': ua, 'Accept-Encoding': 'identity'}), timeout=timeout) as r:
                return r.read()
        except Exception:                   # noqa: BLE001 - try again, then give up
            if i == 2:
                raise
            time.sleep(4)


def companies():
    with open(os.path.join(HERE, 'ui', 'capmkt', 'companies.json'), encoding='utf-8') as f:
        return json.load(f)


def tmx_issuers():
    """Every TSX and TSXV issuer in TMX's monthly file: [{exchange, name, ticker, mcap, sector, prov, listing_type,
    listing_date}], and the month it describes. Kept in memory only: never written out company by company."""
    import openpyxl                         # noqa: PLC0415
    wb = openpyxl.load_workbook(io.BytesIO(_get(TMX_ISSUERS)), read_only=True, data_only=True)
    rows, month = [], None
    for ws in wb.worksheets:
        it = list(ws.iter_rows(values_only=True))
        hi = next(i for i, r in enumerate(it) if r and any(str(x or '').startswith('Root') for x in r))
        H = [' '.join(str(x or '').split()) for x in it[hi]]
        col = lambda pre: next(i for i, h in enumerate(H) if h.startswith(pre))  # noqa: E731
        c = {k: col(p) for k, p in (('ex', 'Exchange'), ('name', 'Name'), ('t', 'Root Ticker'), ('mc', 'Market Cap'), ('sec', 'Sector'),
                                    ('prov', 'HQ Location'), ('lt', 'Listing Type'), ('ld', 'Listing Date'))}
        m = re.search(r'(\d{1,2})-([A-Za-z]+)-(\d{4})', H[c['mc']])
        if m:
            month = dt.datetime.strptime(f'{m.group(1)} {m.group(2)} {m.group(3)}', '%d %B %Y').date().isoformat()
        for r in it[hi + 1:]:
            if not r or not r[c['t']] or not r[c['name']]:
                continue
            mc = r[c['mc']]
            rows.append({'exchange': str(r[c['ex']]).strip(), 'name': str(r[c['name']]).strip(), 'ticker': str(r[c['t']]).strip().upper(),
                         'mcap': float(mc) if isinstance(mc, (int, float)) else None, 'sector': (r[c['sec']] or 'Not given'),
                         'prov': (r[c['prov']] or ''), 'listing_type': r[c['lt']] or '', 'listing_date': str(r[c['ld']] or '')})
    if not rows:
        raise ValueError('TMX issuer file: no rows read')
    return rows, month


def tmx_tickers():
    out = {}
    for ex in ('tsx', 'tsxv'):
        for x in json.loads(_get(TMX_DIR.format(ex=ex)))['results']:
            out[x['symbol'].split('.')[0].upper()] = ex.upper()
    return out


def _sum(rows):
    vals = [r['mcap'] for r in rows if r['mcap'] is not None]
    return {'n': len(rows), 'mcap': round(sum(vals)) if len(rows) >= MIN_GROUP else None, 'with_value': len(vals)}


def _by(rows, key):
    g = {}
    for r in rows:
        g.setdefault(key(r), []).append(r)
    return {k: _sum(v) for k, v in sorted(g.items(), key=lambda kv: -len(kv[1]))}


def totals(issuers, month, cos, today):
    """Totals only: Canada, Alberta and the checked Calgary list, by exchange, sector, size and new listings."""
    ops = [r for r in issuers if r['sector'] not in FUNDS]
    ab = [r for r in ops if r['prov'] == 'AB']
    key = {(r['exchange'], r['ticker']) for r in issuers}
    byk = {(r['exchange'], r['ticker']): r for r in issuers}
    cal_t = {(c['exchange'], c['ticker']) for c in cos if c['group'] == 'calgary'}
    cal = [byk[k] for k in cal_t if k in byk]
    ind = {(c['exchange'], c['ticker']): c['industry'] for c in cos}
    one_year = (today - dt.timedelta(days=365)).strftime('%Y%m%d')
    new_ab = [r for r in ab if r['listing_date'] >= one_year]
    canada = _sum(ops)
    out = {'month': month,
           'canada': {'all': canada, 'by_exchange': _by(ops, lambda r: r['exchange'])},
           'alberta': {'all': _sum(ab), 'by_exchange': _by(ab, lambda r: r['exchange']), 'by_sector': _by(ab, lambda r: r['sector']),
                       'share_count': round(len(ab) / len(ops), 4) if ops else None,
                       'share_mcap': round(sum(r['mcap'] or 0 for r in ab) / sum(r['mcap'] or 0 for r in ops), 4) if ops else None,
                       'new_12m': {'n': len(new_ab), 'by_type': {k: v['n'] for k, v in _by(new_ab, lambda r: r['listing_type'] or 'Not given').items()}}},
           'calgary': {'all': _sum(cal), 'by_exchange': _by(cal, lambda r: r['exchange']),
                       'by_industry': _by(cal, lambda r: ind.get((r['exchange'], r['ticker']), 'Not given')),
                       'by_size': {b: n for b, n in ((b, sum(1 for r in cal if r['mcap'] is not None and r['mcap'] >= lo and (i == 0 or r['mcap'] < BANDS[i - 1][1])))
                                                     for i, (b, lo) in enumerate(BANDS))},
                       'share_of_canada_mcap': round(sum(r['mcap'] or 0 for r in cal) / sum(r['mcap'] or 0 for r in ops), 4) if ops else None,
                       'share_of_alberta_mcap': round(sum(r['mcap'] or 0 for r in cal) / sum(r['mcap'] or 0 for r in ab), 4) if ab else None},
           'checked_in_file': sum(1 for c in cos if (c['exchange'], c['ticker']) in key)}
    return out


def sec_financials(cos, contact):
    """Revenue, net income and dividends per share by fiscal year, from the SEC's XBRL data, for checked companies
    that also file in the United States (matched by name). Returns {ticker: {...}}."""
    ua = f'CalgaryInsight {contact}'
    tick = json.loads(_get(SEC_TICKERS, ua))
    norm = lambda s: ' '.join(re.sub(r'[^a-z0-9 ]', ' ', re.sub(r'\b(inc|ltd|limited|corp|corporation|co|company|the|plc)\b\.?', ' ', s.lower())).split())  # noqa: E731
    byname = {norm(dict(zip(tick['fields'], r))['name']): dict(zip(tick['fields'], r)) for r in tick['data']}
    out = {}
    for c in cos:
        if c['group'] not in ('calgary', 'calgary_office', 'alberta'):
            continue
        d = byname.get(norm(c['name']))
        if not d:
            continue
        cik = int(d['cik'])
        try:
            sub = json.loads(_get(SEC_SUBS.format(cik=cik), ua))
            rec = sub['filings']['recent']
            annual = next(((rec['form'][i], rec['filingDate'][i], rec['reportDate'][i]) for i in range(len(rec['form'])) if rec['form'][i] in ('40-F', '10-K', '20-F')), None)
            latest = next(((rec['form'][i], rec['filingDate'][i]) for i in range(len(rec['form'])) if rec['form'][i] in ('40-F', '10-K', '20-F', '10-Q', '6-K')), None)
            facts = json.loads(_get(SEC_FACTS.format(cik=cik), ua)).get('facts', {})
            series = {}
            for key, names in (('revenue', ('Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'RevenuesNetOfInterestExpense', 'OperatingRevenue')),
                               ('net_income', ('NetIncomeLoss', 'ProfitLoss', 'NetIncomeLossAttributableToParent')),
                               ('dividends_per_share', ('CommonStockDividendsPerShareDeclared', 'CommonStockDividendsPerShareCashPaid'))):
                for std in ('ifrs-full', 'us-gaap'):
                    names2 = names if std == 'us-gaap' else {'revenue': ('Revenue',), 'net_income': ('ProfitLoss', 'ProfitLossAttributableToOwnersOfParent'),
                                                               'dividends_per_share': ('DividendsRecognisedAsDistributionsToOwnersOfParentRelatingToCurrentYearPerShare',)}[key]
                    for n in names2:
                        f = facts.get(std, {}).get(n)
                        if not f:
                            continue
                        for unit, vals in f['units'].items():
                            yr = {}
                            for v in vals:   # one value per fiscal year, from annual reports, the latest filing of each
                                if v.get('fp') == 'FY' and v.get('form') in ('40-F', '10-K', '20-F', '40-F/A', '10-K/A') and v.get('start') and v.get('end') \
                                        and 330 <= (dt.date.fromisoformat(v['end']) - dt.date.fromisoformat(v['start'])).days <= 380:
                                    y = v['end'][:4]
                                    if y not in yr or v['filed'] > yr[y][1]:
                                        yr[y] = (v['val'], v['filed'])
                            if yr:
                                series[key] = {'unit': unit, 'tag': f'{std}:{n}', 'years': {y: v for y, (v, _) in sorted(yr.items())[-8:]}}
                                break
                        if key in series:
                            break
                    if key in series:
                        break
            out[c['ticker']] = {'cik': cik, 'sec_name': sub.get('name'), 'annual_form': annual, 'latest_filing': latest,
                                'fiscal_year_end': sub.get('fiscalYearEnd'), 'series': series,
                                'filings_url': f'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}'}
        except Exception as e:              # noqa: BLE001 - one company unread leaves the rest
            out[c['ticker']] = {'cik': cik, 'error': str(e)[:120]}
        time.sleep(0.2)
    return out


def build(previous=None, today=None):
    today = today or dt.date.today()
    doc = companies()
    cos = doc['companies']
    out = {'built_at': dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'errors': {}}
    try:
        issuers, month = tmx_issuers()
        out['totals'] = totals(issuers, month, cos, today)
        out['tmx_month'] = month
    except Exception as e:                  # noqa: BLE001
        out['errors']['tmx'] = str(e)[:200]
    try:
        tk = tmx_tickers()
        out['ticker_check'] = {c['ticker']: (tk.get(c['ticker']) == c['exchange']) for c in cos}
    except Exception as e:                  # noqa: BLE001
        out['errors']['tickers'] = str(e)[:200]
    contact = os.environ.get('CDD_SEC_CONTACT', '').strip() or os.environ.get('CDD_CONTACT_EMAIL', '').strip()
    if contact:
        try:
            out['sec'] = sec_financials(cos, contact)
        except Exception as e:              # noqa: BLE001
            out['errors']['sec'] = str(e)[:200]
    else:
        out['errors']['sec'] = 'No contact email set for the SEC, so US filings were not read.'
    # the count over time: one point per TMX month, carried forward from the previous refresh
    hist = list((previous or {}).get('history') or [])
    t = out.get('totals')
    if t and t.get('month'):
        hist = [h for h in hist if h.get('month') != t['month']] + [{
            'month': t['month'], 'alberta_n': t['alberta']['all']['n'], 'alberta_mcap': t['alberta']['all']['mcap'],
            'calgary_n': t['calgary']['all']['n'], 'calgary_mcap': t['calgary']['all']['mcap'],
            'canada_n': t['canada']['all']['n'], 'canada_mcap': t['canada']['all']['mcap']}]
    out['history'] = sorted(hist, key=lambda h: h['month'])[-120:]
    if not t and previous and previous.get('totals'):
        out['totals'], out['tmx_month'], out['stale'] = previous['totals'], previous.get('tmx_month'), True
    if 'sec' not in out and previous and previous.get('sec'):
        out['sec'], out['sec_stale'] = previous['sec'], True
    out['sources'] = [
        {'title': 'TSX and TSXV listed issuers (monthly)', 'publisher': 'TMX Group', 'url': 'https://www.tsx.com/en/listings/current-market-statistics'},
        {'title': 'TSX and TSXV company directory', 'publisher': 'TMX Group', 'url': 'https://www.tsx.com/listings/listing-with-us/listed-company-directory'},
        {'title': 'Company filings and financial data (XBRL)', 'publisher': 'US Securities and Exchange Commission', 'url': 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces'},
        {'title': 'Company filings', 'publisher': 'SEDAR+ (Canadian Securities Administrators)', 'url': 'https://www.sedarplus.ca/'}]
    return out


def load(data_dir=None):
    for p in [os.path.join(HERE, 'data', 'capmkt.json'), os.path.join(data_dir, 'capmkt.json') if data_dir else None]:
        if p and os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                return json.load(f)
    return None


if __name__ == '__main__':
    prev = None
    if len(sys.argv) > 2 and os.path.exists(sys.argv[2]):
        with open(sys.argv[2], encoding='utf-8') as f:
            prev = json.load(f)
    d = build(prev)
    with open(sys.argv[1] if len(sys.argv) > 1 else 'capmkt.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, separators=(',', ':'))
    print('errors', d['errors'], 'month', d.get('tmx_month'), 'calgary', ((d.get('totals') or {}).get('calgary') or {}).get('all'))
