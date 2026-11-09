import json, urllib.request
H={'User-Agent':'Mozilla/5.0 (compatible; CalgaryInsight/1.0)','Content-Type':'application/json'}
for pid in (24100053, 24100055, 24100050, 23100253, 23100312):
    req=urllib.request.Request('https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata',data=json.dumps([{'productId':pid}]).encode(),headers=H)
    d=json.loads(urllib.request.urlopen(req,timeout=120).read())[0]['object']
    print('CHK ==',pid,d['cubeTitleEn'][:90])
    for dim in d['dimension']:
        mem=[m['memberNameEn'] for m in dim['member']]
        cal=[m for m in mem if 'Calgary' in m or 'Alberta' in m]
        print('CHK   dim',dim['dimensionNameEn'],len(mem),mem[:8],'| calgary/alberta:',cal[:6])
