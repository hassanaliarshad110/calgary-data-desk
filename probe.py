import urllib.request, re
UA={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0)'}
for n,u in [('fall','https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Fall.pdf'),
            ('spring','https://www.calgary.ca/content/dam/www/cfod/finance/documents/corporate-economics/calgary-and-region-economic-outlook/Calgary-and-Region-Economic-Outlook-2026-Spring.pdf')]:
    try:
        b=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read(); open(f'out/{n}.pdf','wb').write(b); print(n,len(b))
    except Exception as e: print(n,'ERR',e)
