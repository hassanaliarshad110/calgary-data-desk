import json, os, sys, subprocess, asyncio, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts'], check=True)
import edge_tts
L = json.load(open(os.path.join(os.path.dirname(__file__), 'fg_lines.json')))
res = {}
async def main():
    for l in L:
        for attempt in range(3):
            try:
                c = edge_tts.Communicate(l['text'], l['name'], rate=l['rate'], pitch=l['pitch'])
                await c.save(os.path.join(out, l['id'] + '.mp3')); res[l['id']] = 'ok'; break
            except Exception as e:
                res[l['id']] = repr(e); await asyncio.sleep(2)
asyncio.run(main())
fonts = {
 'Kalam-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/kalam/Kalam-Bold.ttf',
 'Kalam-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/kalam/Kalam-Regular.ttf',
 'Oswald.ttf': 'https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf',
 'Inter.ttf': 'https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf',
}
for n,u in fonts.items():
    try: urllib.request.urlretrieve(u, os.path.join(out, n)); res[n]='ok'
    except Exception as e: res[n]=repr(e)
json.dump(res, open(os.path.join(out, 'res.json'), 'w'), indent=1)
print(res)
