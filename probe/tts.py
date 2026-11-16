import json, os, sys, subprocess, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True)

# --- MOMENT fetch block (temporary) ---
import re as _re, ssl as _ssl
def _get(u, fn, t=60):
    try:
        req=urllib.request.Request(u, headers={'User-Agent':'Mozilla/5.0 CalgaryInsight'})
        d=urllib.request.urlopen(req, timeout=t).read()
        open(os.path.join(out, fn),'wb').write(d); return d
    except Exception as e:
        open(os.path.join(out, fn+'.err'),'w').write(repr(e)); return b''
_mf=os.path.join(out,'moment'); os.makedirs(_mf, exist_ok=True)
import urllib.parse as _up
_get('https://data.calgary.ca/api/views/35ra-9556.json', 'moment/traffic_meta.json')
smp=_get('https://data.calgary.ca/resource/35ra-9556.json?%24limit=3', 'moment/traffic_sample.json')
try:
    meta=json.load(open(os.path.join(_mf,'traffic_meta.json')))
    cols=[c['fieldName'] for c in meta['columns'] if c.get('dataTypeName') in ('calendar_date','floating_timestamp')]
except Exception as ex:
    cols=['start_dt']
open(os.path.join(_mf,'traffic_cols.txt'),'w').write(repr(cols))
for c in cols:
    q={'$select':'date_trunc_ymd(%s) as d, count(*) as n'%c,'$where':"%s > '2025-11-01T00:00:00'"%c,'$group':'d','$order':'d','$limit':'5000'}
    _get('https://data.calgary.ca/resource/35ra-9556.json?'+_up.urlencode(q), 'moment/traffic_daily_%s.json'%c)
    q2={'$order':'%s DESC'%c,'$limit':'40'}
    _get('https://data.calgary.ca/resource/35ra-9556.json?'+_up.urlencode(q2), 'moment/traffic_latest_%s.json'%c)
sys.exit(0)
# --- end fetch block ---

subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
L = json.load(open(os.path.join(os.path.dirname(__file__), 'tts_lines.json')))
cfg = L.pop('_cfg', {})  # optional {"voice": {key: voice}, "speed": {key: speed}}; default af_heart, 1.0
durs = {}
for name, lines in L.items():
    durs[name] = []
    for i, t in enumerate(lines):
        a, sr = k.create(t, voice=cfg.get('voice', {}).get(name, 'af_heart'), speed=cfg.get('speed', {}).get(name, 1.0), lang='en-us')
        sf.write(os.path.join(out, f'{name}_{i}.wav'), a, sr)
        durs[name].append(round(len(a) / sr, 3))
json.dump(durs, open(os.path.join(out, 'durs.json'), 'w'))
print(durs)
