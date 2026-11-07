import os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = {'door0.png': 'https://d8j0ntlcm91z4.cloudfront.net/user_3KCBM5g2og8WAtnWqfWf92dKZR4/hf_20261107_120244_bcc0cd30-8867-4995-8c69-636eeb2aa364.png',
     'door1.png': 'https://d8j0ntlcm91z4.cloudfront.net/user_3KCBM5g2og8WAtnWqfWf92dKZR4/hf_20261107_120245_937d2a8b-7dac-4531-856a-7b48c280f8f9.png'}
for n, u in U.items():
    open(os.path.join(out, n), 'wb').write(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())
