"""A small Excel (.xlsx) writer: several sheets of plain rows, a bold header row, sensible column widths and links.
No extra library is needed; Excel, Google Sheets and LibreOffice all open the result."""
import re
import zipfile
from xml.sax.saxutils import escape

_BAD = re.compile(r'[\[\]:*?/\\]')
_CTRL = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')


def _col(n):
    s = ''
    n += 1
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def _cell(ref, v, style):
    if isinstance(v, bool):
        v = 'Yes' if v else 'No'
    if isinstance(v, (int, float)) and v == v and v not in (float('inf'), float('-inf')):
        return f'<c r="{ref}"{style}><v>{v}</v></c>'
    if isinstance(v, str) and v.startswith('=') and len(v) > 1:      # an Excel formula, worked out when the file opens
        return f'<c r="{ref}"{style}><f>{escape(v[1:])}</f></c>'
    text = _CTRL.sub('', '' if v is None else str(v))[:32000]
    if not text:
        return ''
    return f'<c r="{ref}" t="inlineStr"{style}><is><t xml:space="preserve">{escape(text)}</t></is></c>'


def sheet_name(name, used):
    base = _BAD.sub(' ', str(name or 'Sheet')).strip().strip("'")[:28] or 'Sheet'
    out, n = base, 2
    while out.lower() in used:
        out = f'{base[:25]} ({n})'
        n += 1
    used.add(out.lower())
    return out


def write(path, sheets):
    """sheets: [(name, rows, header=True)] where rows is a list of lists. Returns path."""
    used, names = set(), []
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for i, sh in enumerate(sheets, 1):
            name, rows = sh[0], sh[1]
            header = sh[2] if len(sh) > 2 else True
            names.append(sheet_name(name, used))
            widths = {}
            for r in rows[:500]:
                for j, v in enumerate(r):
                    widths[j] = max(widths.get(j, 6), min(60, len(str(v if v is not None else '')) + 2))
            cols = ''.join(f'<col min="{j + 1}" max="{j + 1}" width="{w}" customWidth="1"/>' for j, w in sorted(widths.items()))
            body = []
            for ri, r in enumerate(rows, 1):
                style = ' s="1"' if header and ri == 1 else ''
                cells = ''.join(_cell(f'{_col(j)}{ri}', v, style) for j, v in enumerate(r))
                body.append(f'<row r="{ri}">{cells}</row>')
            pane = ('<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" '
                    'state="frozen"/></sheetView></sheetViews>') if header and rows else ''
            z.writestr(f'xl/worksheets/sheet{i}.xml',
                       '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                       '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                       f'{pane}{"<cols>" + cols + "</cols>" if cols else ""}<sheetData>{"".join(body)}</sheetData></worksheet>')
        z.writestr('[Content_Types].xml',
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                   '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                   '<Default Extension="xml" ContentType="application/xml"/>'
                   '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
                   '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
                   + ''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                             for i in range(1, len(names) + 1)) + '</Types>')
        z.writestr('_rels/.rels',
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
                   '</Relationships>')
        z.writestr('xl/workbook.xml',
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
                   'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
                   + ''.join(f'<sheet name="{escape(n)}" sheetId="{i}" r:id="rId{i}"/>' for i, n in enumerate(names, 1))
                   + '</sheets></workbook>')
        z.writestr('xl/_rels/workbook.xml.rels',
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   + ''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>'
                             for i in range(1, len(names) + 1))
                   + f'<Relationship Id="rId{len(names) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
                   '</Relationships>')
        z.writestr('xl/styles.xml',
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                   '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
                   '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
                   '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
                   '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
                   '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
                   '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
                   '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
                   '</styleSheet>')
    return path
