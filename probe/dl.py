import os, sys, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
U = {'door_audio.mp4': 'https://d8j0ntlcm91z4.cloudfront.net/user_3KCBM5g2og8WAtnWqfWf92dKZR4/hf_20261107_121408_9edac32f-f4b5-48e7-9924-5cf2f26c81d2.mp4'}
for n, u in U.items():
    open(os.path.join(out, n), 'wb').write(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())
