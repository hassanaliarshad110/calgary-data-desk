import json, os, sys, subprocess, asyncio
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts'], check=True)
import edge_tts
L = json.load(open(os.path.join(os.path.dirname(__file__), 'mind_lines.json')))
res = {}; words = {}
async def one(l):
    try: c = edge_tts.Communicate(l['text'], l['name'], rate=l['rate'], pitch=l['pitch'], boundary='WordBoundary')
    except TypeError: c = edge_tts.Communicate(l['text'], l['name'], rate=l['rate'], pitch=l['pitch'])
    wb = []
    with open(os.path.join(out, l['id'] + '.mp3'), 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': wb.append([ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']])
    words[l['id']] = wb
async def main():
    for l in L:
        for attempt in range(4):
            try: await one(l); res[l['id']] = 'ok'; break
            except Exception as e: res[l['id']] = repr(e); await asyncio.sleep(3)
asyncio.run(main())
json.dump(words, open(os.path.join(out, 'words.json'), 'w'), indent=0)
json.dump(res, open(os.path.join(out, 'res.json'), 'w'), indent=1); print(res)
