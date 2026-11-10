import urllib.request, os
UA={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0)'}
for u,n in [('https://calgaryinsight.ca/data/city_actual/w0.json','w0.json'),('https://calgaryinsight.ca/data/cache/police/community_safety.json','community_safety.json')]:
    try:
        b=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=300).read(); open('out/'+n,'wb').write(b); print(n,len(b))
    except Exception as e: print(n,'ERR',e)
