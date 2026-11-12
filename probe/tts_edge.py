import json, os, sys, subprocess, asyncio
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts'], check=True)
import edge_tts
L = json.load(open(os.path.join(os.path.dirname(__file__), 'tts_edge_lines.json')))
res = {}
async def main():
    for l in L:
        for v in l['voices']:
            key = f"{l['id']}__{v['name']}{v.get('tag','')}"
            try:
                c = edge_tts.Communicate(l[v.get('script','ur')], v['name'], rate=v.get('rate', '+0%'), pitch=v.get('pitch', '+0Hz'))
                await c.save(os.path.join(out, key + '.mp3')); res[key] = 'ok'
            except Exception as e:
                res[key] = repr(e)
asyncio.run(main())
json.dump(res, open(os.path.join(out, 'edge.json'), 'w'), indent=1)
print(res)
