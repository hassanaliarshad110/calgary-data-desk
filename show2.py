import json, urllib.request, time, math
P=[('Banff (town)',51.1784,-115.5708),('Canmore',51.0884,-115.3479),('Lake Louise (lake)',51.4167,-116.2156),('Moraine Lake',51.3217,-116.1860),
('Kananaskis Village',50.9300,-115.1530),('Forget-Me-Not Pond (Kananaskis)',50.7962,-114.8063),('Peter Lougheed Provincial Park',50.6900,-115.1200),('Bragg Creek',50.9476,-114.5705),
('Cochrane',51.1890,-114.4670),('Big Hill Springs Provincial Park',51.2490,-114.3860),('Okotoks Big Rock erratic',50.7040,-114.1490),
('Yoho National Park (Field)',51.3955,-116.4910),('Kootenay National Park (Radium gate)',50.6205,-116.0710),('Columbia Icefield Centre',52.2196,-117.2235),('Jasper (town)',52.8737,-118.0814),
('Royal Tyrrell Museum (Drumheller)',51.4790,-112.7900),('Horseshoe Canyon (Drumheller)',51.4200,-112.8700),('Blackfoot Crossing Historical Park',50.7680,-112.8880),
('Dinosaur Provincial Park',50.7540,-111.5070),('Head-Smashed-In Buffalo Jump',49.7484,-113.6255),('Waterton Park (townsite)',49.0517,-113.9136),
('Writing-on-Stone Provincial Park',49.0830,-111.6230),('Glacier National Park, Montana (St. Mary)',48.7470,-113.4400)]
O=(51.0447,-114.0719)
def hav(a,b):
    R=6371; la1,lo1=map(math.radians,a); la2,lo2=map(math.radians,b)
    return 2*R*math.asin(math.sqrt(math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2))
out=[]
for n,la,lo in P:
    u=f'http://router.project-osrm.org/route/v1/driving/{O[1]},{O[0]};{lo},{la}?overview=false'
    try:
        d=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'CalgaryInsight/1.0'}),timeout=60).read())
        r=d['routes'][0]; out.append((n,round(r['distance']/1000),round(r['duration']/60),round(hav(O,(la,lo)))))
    except Exception as e: out.append((n,None,None,round(hav(O,(la,lo))),str(e)[:60]))
    time.sleep(1.2)
for x in out: print('CHK',x)
