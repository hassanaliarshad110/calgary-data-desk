import tourism as t, json
meta=t._post('getCubeMetadata',[{'productId':t.ARRIVALS}])[0]['object']
dims={d['dimensionNameEn']:d for d in meta['dimension']}
order=[d['dimensionNameEn'] for d in meta['dimension']]
print('CHK order',order, [d['dimensionPositionId'] for d in meta['dimension']])
g=[m['memberNameEn']+'|'+str(m['memberId'])+'|p'+str(m.get('parentMemberId')) for m in dims['Geography']['member'] if any(w in m['memberNameEn'] for w in ('Toronto','Montr','Vancouver','Calgary','Edmonton','Pearson','Trudeau'))]
print('CHK geos',g)
c=[m['memberNameEn']+'|'+str(m['memberId']) for m in dims['Country of residence']['member'] if m['memberNameEn'] in ('United Kingdom','Germany','Japan','Brazil','Non-resident visitors entering Canada')]
print('CHK countries',c)
cal=t._member(dims['Geography'],'Calgary'); uk=t._member(dims['Country of residence'],'United Kingdom')
ids={'Geography':cal,'Country of residence':uk,'Mode of transportation':t._member(dims['Mode of transportation'],'All modes of transportation'),'Arrival type':t._member(dims['Arrival type'],'All arrivals'),'Traveller type':t._member(dims['Traveller type'],'Tourists (overnight)')}
coord='.'.join(str(ids[d]) for d in order)+'.0'*(10-len(order))
print('CHK coord',coord)
info=t._post('getSeriesInfoFromCubePidCoord',[{'productId':t.ARRIVALS,'coordinate':coord}])
print('CHK info',json.dumps(info)[:600])
r=t._post('getDataFromCubePidCoordAndLatestNPeriods',[{'productId':t.ARRIVALS,'coordinate':coord,'latestN':3}])
print('CHK data',json.dumps(r)[:600])
