import urllib.request, re
B='https://calgaryinsight.ca/'
def get(p):
    try:
        r=urllib.request.urlopen(urllib.request.Request(B+p,headers={'User-Agent':'CalgaryInsightCheck/1.0'}),timeout=60)
        return r.status, r.read()
    except Exception as e:
        return getattr(e,'code',str(e)), b''
for p in ['news/','ask/','data-scientist/','studies/who-calgarys-311-hears/','studies/calgary-sewers/','studies/calgary-sewers/calgary-sewer-ageing-report.pdf','studies/calgary-sewers/report.html','studies/calgary-sewers/calgary-sewer-ageing-figures.xlsx']:
    s,b=get(p); print('CHK',p,s,len(b))
s,b=get('news/'); ids=sorted(set(re.findall(r'href="([a-z0-9-]{8,})/"',b.decode('utf-8','ignore'))))
print('CHK news story links',len(ids))
if ids: s2,_=get('news/'+ids[0]+'/'); print('CHK story',ids[0],s2)
s,b=get('sitemap.xml'); t=b.decode('utf-8','ignore')
for k in ['/news/','/ask/','/studies/calgary-sewers/','/data-scientist/']: print('CHK sitemap',k,k in t)
s,b=get('index.html'); t=b.decode('utf-8','ignore')
print('CHK index YYC Game','Learn City Services: YYC Game' in t,'first-peoples','calgary-first-peoples' in t)
s,b=get('data-scientist/'); t=b.decode('utf-8','ignore'); print('CHK ds links sewer','calgary-sewers' in t,'311','who-calgarys-311-hears' in t)
