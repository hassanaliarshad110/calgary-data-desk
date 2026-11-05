import json, os, sys
import numpy as np, soundfile as sf
from kokoro import KPipeline
lines = json.load(open('tts/lines.json'))
os.makedirs('_tts', exist_ok=True)
for voice in sys.argv[1:]:
    pipe = KPipeline(lang_code=voice[0])
    for i, text in enumerate(lines):
        chunks = [a for _, _, a in pipe(text, voice=voice, speed=1.0)]
        audio = np.concatenate([np.asarray(c) for c in chunks])
        sf.write(f'_tts/{voice}_{i}.wav', audio, 24000)
        print(voice, i, round(len(audio) / 24000, 2))
