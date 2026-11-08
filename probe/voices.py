"""Voices for YYC City Stories dialogue: every spoken line in six languages, free and offline.
English and French: Kokoro (Apache 2.0). Urdu, Punjabi, Tagalog, Arabic: Meta MMS-TTS (CC BY-NC 4.0, non-commercial).
Output: <out>/<lang>/<n>.mp3 and <out>/manifest.json ({lang: {n: seconds}})."""
import json, os, re, sys, subprocess, unicodedata
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
D = json.load(open(os.path.join(os.path.dirname(__file__), 'voice_lines.json')))
man = {}

def clean(t):
    t = re.sub(r'<[^>]+>', ' ', t)
    t = ''.join(ch for ch in t if not (unicodedata.category(ch) == 'So' or 0x1F000 <= ord(ch) <= 0x1FAFF))
    t = t.replace('«', '').replace('»', '').replace('"', '').replace('“', '').replace('”', '')
    return re.sub(r'\s+', ' ', t).strip()

def save(lang, i, a, sr):
    import soundfile as sf
    d = os.path.join(out, lang); os.makedirs(d, exist_ok=True)
    wav = os.path.join(d, f'{i}.wav'); sf.write(wav, a, sr)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', 'loudnorm=I=-18:TP=-2,afade=t=in:d=0.02', '-ac', '1', '-ar', '24000', '-b:a', '40k', os.path.join(d, f'{i}.mp3')], check=True)
    os.remove(wav)
    man.setdefault(lang, {})[str(i)] = round(len(a) / sr, 2)

# ---- Kokoro
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'kokoro-onnx', 'soundfile'], check=True)
import urllib.request
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
have = set(k.get_voices()) if hasattr(k, 'get_voices') else set()
for lang, kl in (('en', 'en-us'), ('fr', 'fr-fr')):
    for i, t, w in D['lines'][lang]:
        v = D['voices'].get(w, 'af_heart') if lang == 'en' else 'ff_siwis'
        if have and v not in have: v = 'af_heart'
        if v.startswith('b') and lang == 'en': kl2 = 'en-gb'
        else: kl2 = kl
        a, sr = k.create(clean(t), voice=v, speed=1.0, lang=kl2)
        save(lang, i, a, sr)
    print(lang, 'done', flush=True)

# ---- MMS
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'torch', '--index-url', 'https://download.pytorch.org/whl/cpu'], check=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'transformers', 'uroman'], check=True)
import torch
from transformers import VitsModel, AutoTokenizer
MODELS = {'ur': 'facebook/mms-tts-urd-script_arabic', 'pa': 'facebook/mms-tts-pan', 'tl': 'facebook/mms-tts-tgl', 'ar': 'facebook/mms-tts-ara'}
ur = None
for lang, name in MODELS.items():
    tok = AutoTokenizer.from_pretrained(name); model = VitsModel.from_pretrained(name); model.eval()
    sr = model.config.sampling_rate
    print(lang, 'uroman' if getattr(tok, 'is_uroman', False) else 'native script', flush=True)
    for i, t, w in D['lines'][lang]:
        txt = clean(t)
        if getattr(tok, 'is_uroman', False):
            if ur is None:
                import uroman as U; ur = U.Uroman()
            txt = ur.romanize_string(txt)
        parts = [p for p in re.split(r'(?<=[.!?؟۔।])\s+', txt) if p.strip()] or [txt]
        import numpy as np
        chunks = []
        for p in parts:
            torch.manual_seed(1)
            with torch.no_grad(): a = model(**tok(p, return_tensors='pt')).waveform[0].numpy()
            chunks += [a, np.zeros(int(sr * 0.25), dtype=a.dtype)]
        save(lang, i, np.concatenate(chunks[:-1]), sr)
    print(lang, 'done', flush=True)
json.dump(man, open(os.path.join(out, 'manifest.json'), 'w'))
print({l: len(v) for l, v in man.items()})
