import os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = {'open0.png': 'https://d8j0ntlcm91z4.cloudfront.net/user_3KCBM5g2og8WAtnWqfWf92dKZR4/hf_20261107_120352_e8ca2fcf-e35a-4d2a-9706-56fcf76c8989.png',
     'open1.png': 'https://d8j0ntlcm91z4.cloudfront.net/user_3KCBM5g2og8WAtnWqfWf92dKZR4/hf_20261107_120353_c2af7e06-f842-440b-bfa9-957153a82b11.png'}
for n, u in U.items():
    open(os.path.join(out, n), 'wb').write(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())
