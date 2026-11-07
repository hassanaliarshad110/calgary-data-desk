import os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = {'door.mp4': 'https://d8j0ntlcm91z4.cloudfront.net/user_3KCBM5g2og8WAtnWqfWf92dKZR4/hf_20261107_120711_03ee0270-b459-4e11-b838-b28454fd7991.mp4'}
for n, u in U.items():
    open(os.path.join(out, n), 'wb').write(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())
