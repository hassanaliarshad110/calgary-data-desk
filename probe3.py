import alberta
rs=alberta.resources(alberta.ENROLMENT_PKG, None)
au=sorted([x for x in rs if 'authority-enrolment' in x['url']], key=lambda r:r['url'])
print('CHK auth files',[r['url'].rsplit('/',1)[-1] for r in au][-3:])
rows=alberta.read_xlsx(alberta.fetch(au[-1]['url']))
print('CHK header',rows[0]); [print('CHK r',r) for r in rows[1:4]]
for r in rows:
    if any(k in ' '.join(r) for k in ('Calgary','Edmonton School','Edmonton Catholic','Rocky View')): print('CHK c',r)
print('CHK rows',len(rows))
