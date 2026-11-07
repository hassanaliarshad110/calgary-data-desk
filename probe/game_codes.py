import json, os, sys, urllib.request
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
req = urllib.request.Request('https://data.calgary.ca/resource/5843-8tyj.json?$limit=5000', headers={'User-Agent': 'CalgaryGameMap/1.0'})
data = json.loads(urllib.request.urlopen(req, timeout=120).read())
json.dump(data, open(os.path.join(OUT, 'codes.json'), 'w'), indent=0)
print(len(data))
