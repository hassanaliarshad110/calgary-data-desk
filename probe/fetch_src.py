import sys, os, urllib.request, time
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = ['https://sacred-texts.com/isl/masnavi/msn01.htm', 'https://www.sacred-texts.com/isl/masnavi/msn01.htm',
     'https://www.intratext.com/IXT/ENG0134/_INDEX.HTM'] + [f'https://www.intratext.com/IXT/ENG0134/_P{i}.HTM' for i in range(1, 12)]
for u in U:
    n = u.split('//')[1].replace('/', '_')
    for k in range(3):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}), timeout=30)
            open(os.path.join(out, n), 'wb').write(r.read()); print('ok', u); break
        except Exception as e:
            print('fail', u, e); time.sleep(3)
