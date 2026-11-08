import urllib.request
h = urllib.request.urlopen(urllib.request.Request('https://calgaryinsight.ca/?v=4', headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode()
print('CHK tag', 'content="FPH2p5PKD0IMwkmSMZKKO8Hrn_KdssN6pZcbr1Khu6o"' in h)
