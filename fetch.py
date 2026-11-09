import json, urllib.request, urllib.parse, time
H={'User-Agent':'CalgaryInsight/1.0 (civic data site; hello@calgaryinsight.ca)'}
def get(u, data=None):
    return urllib.request.urlopen(urllib.request.Request(u, data=data, headers=H), timeout=180).read()
open('live_visit.json','wb').write(get('https://calgaryinsight.ca/data/visit.json'))
q='[out:json][timeout:60];(node["railway"="station"]["station"="light_rail"](50.84,-114.32,51.22,-113.85);node["public_transport"="station"]["light_rail"="yes"](50.84,-114.32,51.22,-113.85););out body;'
open('ctrain.json','wb').write(get('https://overpass-api.de/api/interpreter', urllib.parse.urlencode({'data':q}).encode()))
names=[('Olympic Plaza','Calgary'),('Banff Gondola','Banff'),('Johnston Canyon','Alberta'),('Lake Minnewanka','Alberta'),("St. Patrick's Island Park",'Calgary'),('Edworthy Park','Calgary'),('Scotiabank Saddledome','Calgary'),('McMahon Stadium','Calgary'),('Arts Commons','Calgary'),('Elbow River Camp','Calgary'),('Douglas Fir Trail','Calgary'),('Bow Valley Ranche','Calgary'),('Inglewood Bird Sanctuary','Calgary'),('Reader Rock Garden','Calgary'),('Riley Park','Calgary'),('Central Memorial Park','Calgary'),('Crescent Heights Park','Calgary'),('Scotsman\'s Hill','Calgary'),('Ralph Klein Park','Calgary'),('River Park','Calgary'),('Calgary City Hall','Calgary'),('The Bow tower','Calgary'),('Wonderland sculpture','Calgary')]
out={}
for n,c in names:
    try:
        r=json.loads(get('https://nominatim.openstreetmap.org/search?'+urllib.parse.urlencode({'q':f'{n}, {c}','format':'json','limit':1,'countrycodes':'ca'})))
        out[n]=({'lat':float(r[0]['lat']),'lon':float(r[0]['lon']),'display':r[0]['display_name'][:120],'osm':r[0]['osm_type']+'/'+str(r[0]['osm_id'])} if r else None)
    except Exception as e: out[n]={'error':str(e)[:80]}
    time.sleep(1.2)
json.dump(out,open('geocoded.json','w'),indent=1)
print('done')
