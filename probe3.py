import alberta, os
rs=alberta.resources(alberta.ENROLMENT_PKG, None)
print('CHK enrol files', [r['url'].rsplit('/',1)[-1] for r in rs][-3:])
r=[x for x in rs if x['url'].endswith('.xlsx')][-1]
rows=alberta.read_xlsx(alberta.fetch(r['url']))
print('CHK header',rows[0]); print('CHK row1',rows[1]); print('CHK rows',len(rows))
import collections
c=collections.Counter(); h=rows[0]; ia=h.index('School Authority Name') if 'School Authority Name' in h else None
ti=[i for i,x in enumerate(h) if x.strip().lower() in ('total','grand total')]
print('CHK total col',ti)
