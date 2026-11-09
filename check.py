import schooltax as st, alberta, collections, re
rs=[r for r in alberta.resources(st.REQ_PKG,'c/alberta') if '2026' in r['url']]
import os
data=st._get(rs[0]['url'])
lines=st._pdf_lines(data)
y,p,rows=st.parse_requisitions(lines)
print('CHK rows',len(rows), collections.Counter(r['category'] for r in rows))
print('CHK sum total',sum(r['total'] for r in rows if r['category']!='Total'), [r for r in rows if r['category']=='Total'])
pat=re.compile(r'\$[\d,]+')
miss=[l for l in lines if len(pat.findall(l))>=2 and not any(l.startswith(r['name']) for r in rows)]
print('CHK unparsed money lines',len(miss)); [print('CHK  U',l[:200]) for l in miss[:40]]
tail=[l for l in lines if re.search(r'(?i)total|opted|separate|grand',l)]
[print('CHK  T',l[:200]) for l in tail[:30]]
print('CHK last lines'); [print('CHK  L',l[:200]) for l in lines[-25:]]
