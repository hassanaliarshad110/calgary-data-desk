import schooltax as st, alberta, collections, re
U='https://open.alberta.ca/dataset/74aa70ca-c77e-46c0-8fd8-ee79b8c8b42a/resource/2c02aaa4-8b49-49db-854f-f394aba9b666/download/ma-education-property-tax-requisition-comparison-report-2026.pdf'
import os
data=st._get(U)
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
