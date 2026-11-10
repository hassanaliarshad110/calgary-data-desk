import requests, zipfile, io, csv
CSD = {'4806016': 'Calgary', '4811061': 'Edmonton', '5915022': 'Vancouver', '3520005': 'Toronto', '3506008': 'Ottawa', '4611040': 'Winnipeg', '4711066': 'Saskatoon', '4706027': 'Regina'}
for tid in ['98100058', '98100057']:
    m = requests.get(f'https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{tid}/en', timeout=60).json()
    z = zipfile.ZipFile(io.BytesIO(requests.get(m['object'], timeout=600).content))
    name = [n for n in z.namelist() if 'etadata' not in n.lower()][0]
    with z.open(name) as f, open(f'out/{tid}_cities.csv', 'w', newline='') as o:
        rd = csv.reader(io.TextIOWrapper(f, encoding='utf-8-sig')); hdr = next(rd); w = csv.writer(o); w.writerow(hdr); n = 0
        for row in rd:
            if len(row) > 2 and row[2][-7:] in CSD: w.writerow(row); n += 1
    print(tid, hdr, n)
