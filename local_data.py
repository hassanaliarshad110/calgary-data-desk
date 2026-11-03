"""Data already on this computer, for Data Genie to use before asking the City's website again.

  - files saved in the Files folder (CSV): list them, and filter, group, count and sum them
  - the Calgary Police Service community safety data the dashboard downloaded (crime and disorder by month)
  - any table Data Genie has worked out, saved as a CSV
"""
import csv
import datetime as dt
import os
import re

OPS = {'=', '!=', 'contains', 'not contains', 'starts with', '>', '>=', '<', '<=', 'in'}
MAX_GROUPS = 500


class LocalDataError(Exception):
    pass


def _safe_name(name, ext='.csv'):
    stem = re.sub(r'[^\w\- .()]+', '_', os.path.splitext(name or '')[0]).strip(' ._') or 'Data Genie table'
    return stem + ext


def _count_rows(path, limit_bytes=300_000_000):
    if os.path.getsize(path) > limit_bytes:
        return None
    with open(path, 'rb') as f:
        return max(0, sum(chunk.count(b'\n') for chunk in iter(lambda: f.read(1 << 20), b'')) - 1)


def list_files(folder):
    """CSV files saved in the Files folder, newest first, with their columns and row counts."""
    if not os.path.isdir(folder):
        return {'folder': folder, 'files': []}
    out = []
    for name in os.listdir(folder):
        path = os.path.join(folder, name)
        if not (os.path.isfile(path) and name.lower().endswith('.csv')):
            continue
        try:
            with open(path, encoding='utf-8-sig', newline='') as f:
                header = next(csv.reader(f), [])
            st = os.stat(path)
            out.append({'file_name': name, 'columns': header, 'rows': _count_rows(path),
                        'size_mb': round(st.st_size / 1e6, 1),
                        'saved': dt.datetime.fromtimestamp(st.st_mtime).strftime('%Y-%m-%d %H:%M')})
        except (OSError, UnicodeDecodeError):
            continue
    out.sort(key=lambda x: x['saved'], reverse=True)
    return {'folder': folder, 'files': out[:60]}


def _num(v):
    try:
        return float(str(v).replace(',', ''))
    except (TypeError, ValueError):
        return None


def _match(value, op, want):
    v = '' if value is None else str(value)
    if op == 'in':
        items = want if isinstance(want, list) else [x.strip() for x in str(want).split(',')]
        return v.lower() in {str(x).lower() for x in items}
    w = '' if want is None else str(want)
    if op == '=':
        return v.lower() == w.lower()
    if op == '!=':
        return v.lower() != w.lower()
    if op == 'contains':
        return w.lower() in v.lower()
    if op == 'not contains':
        return w.lower() not in v.lower()
    if op == 'starts with':
        return v.lower().startswith(w.lower())
    a, b = _num(v), _num(w)
    if a is None or b is None:            # compare as text (dates like 2025-10-01 sort correctly as text)
        a, b = v, w
    return {'>': a > b, '>=': a >= b, '<': a < b, '<=': a <= b}[op]


def _key_value(value, how):
    if how == 'year':
        return str(value)[:4]
    if how == 'month':
        return str(value)[:7]
    return value


def query_file(folder, file_name, filters=None, group_by=None, sum_columns=None, columns=None, limit=200,
               order='count desc'):
    """Filter a saved CSV; optionally group it (count and sums), or return matching rows.
    filters: [{'column', 'op', 'value'}]; group_by: ['column' or 'column:year' or 'column:month']."""
    path = os.path.join(folder, os.path.basename(file_name or ''))
    if not os.path.isfile(path):
        names = [f['file_name'] for f in list_files(folder)['files']]
        raise LocalDataError(f'No file called "{file_name}" in Files. Saved files: {names[:20]}')
    filters = filters or []
    for f in filters:
        if f.get('op') not in OPS:
            raise LocalDataError(f"Unknown op {f.get('op')}; use one of {sorted(OPS)}")
    groups = []
    for g in group_by or []:
        col, _, how = str(g).partition(':')
        groups.append((col, how or None))
    sums = sum_columns or []
    limit = max(1, min(int(limit or 200), 2000))
    matched = 0
    agg, rows = {}, []
    with open(path, encoding='utf-8-sig', newline='') as fh:
        reader = csv.DictReader(fh)
        header = reader.fieldnames or []
        for col in [f.get('column') for f in filters] + [c for c, _ in groups] + list(sums) + list(columns or []):
            if col not in header:
                raise LocalDataError(f'Column "{col}" is not in {file_name}. Columns: {header}')
        for r in reader:
            if not all(_match(r.get(f['column']), f['op'], f.get('value')) for f in filters):
                continue
            matched += 1
            if groups:
                key = tuple(_key_value(r.get(c), how) for c, how in groups)
                a = agg.get(key)
                if a is None:
                    if len(agg) >= 50_000:
                        continue
                    a = agg[key] = {'count': 0, **{f'sum_{c}': 0.0 for c in sums}}
                a['count'] += 1
                for c in sums:
                    a[f'sum_{c}'] += _num(r.get(c)) or 0
            elif len(rows) < limit:
                rows.append({c: r.get(c) for c in (columns or header)})
    if groups:
        out = [{**{(f'{c}:{how}' if how else c): k[i] for i, (c, how) in enumerate(groups)}, **v} for k, v in agg.items()]
        if order == 'count desc':
            out.sort(key=lambda x: -x['count'])
        else:
            out.sort(key=lambda x: [str(x.get(f'{c}:{h}' if h else c)) for c, h in groups])
        return {'file_name': file_name, 'matched_rows': matched, 'groups': len(out), 'rows': out[:min(limit, MAX_GROUPS)]}
    return {'file_name': file_name, 'matched_rows': matched, 'returned': len(rows), 'rows': rows}


def save_table(folder, file_name, columns, rows):
    """Save a table Data Genie has worked out as a CSV in Files (no new download needed)."""
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, _safe_name(file_name))
    base, ext = os.path.splitext(path)
    n = 2
    while os.path.exists(path):
        path = f'{base} ({n}){ext}'
        n += 1
    with open(path, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(columns)
        for r in rows:
            w.writerow(['' if v is None else v for v in r])
    return {'saved_to': path, 'rows': len(rows), 'bytes': os.path.getsize(path)}


# ------------------------------------------------------------------------------------------- police data
def police_query(data, kind='crime', wards=None, communities=None, categories=None, start=None, end=None,
                 group_by=None, limit=300):
    """Totals from the police community safety data. start/end 'YYYY-MM' (inclusive).
    group_by: any of category, community, ward, year, month."""
    rows = (data or {}).get('disorder' if kind == 'disorder' else 'crime') or []
    if not rows:
        raise LocalDataError('The police data has not been downloaded yet; refresh the dashboard first.')
    up = lambda xs: {str(x).strip().upper() for x in xs or []}
    wset = {f'WARD {w}' if str(w).strip().isdigit() else str(w).strip().upper() for w in wards or []}
    cset, kset = up(communities), up(categories)

    def ym(s):
        return int(s[:4]) * 12 + int(s[5:7]) - 1 if s else None
    a, b = ym(start), ym(end)
    keys = {'category': 0, 'community': 1, 'ward': 2, 'year': 3, 'month': None}
    groups = [g for g in (group_by or []) if g in keys]
    agg, total = {}, 0
    latest = max(r[3] * 12 + r[4] - 1 for r in rows)
    for r in rows:
        k = r[3] * 12 + r[4] - 1
        if (a is not None and k < a) or (b is not None and k > b):
            continue
        if wset and r[2].upper() not in wset:
            continue
        if cset and r[1].upper() not in cset:
            continue
        if kset and r[0].upper() not in kset and not any(x in r[0].upper() for x in kset):
            continue
        total += r[5]
        key = tuple(f'{r[3]}-{r[4]:02d}' if g == 'month' else r[keys[g]] for g in groups)
        agg[key] = agg.get(key, 0) + r[5]
    out = [{**{g: key[i] for i, g in enumerate(groups)}, 'count': v} for key, v in agg.items()]
    out.sort(key=lambda x: (-x['count']) if not ({'month', 'year'} & set(groups)) else 0)
    if {'month', 'year'} & set(groups):
        out.sort(key=lambda x: [str(x.get(g)) for g in groups])
    cats = sorted({r[0] for r in rows})
    return {'kind': kind, 'total': total, 'latest_month': f'{latest // 12}-{latest % 12 + 1:02d}',
            'first_month': '2020-01', 'groups': len(out), 'rows': out[:max(1, min(int(limit or 300), 2000))],
            'categories_available': cats,
            'source': 'https://www.calgarypolice.ca/transparency-and-accountability/community-safety-dashboard---monthly-snapshot.html#dashdata',
            'notes': 'Calgary Police Service community safety data (download: police page, section "Dashboard data download"). Crime: most serious offence per incident, unfounded '
                     'and domestic violence excluded, incidents without a location excluded. '
                     'Disorder: public calls for service by event; definition changed in 2025.'}
