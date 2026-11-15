"""Shia Voice narration on GitHub Actions: python probe/tts_sv.py <out_dir>   (reads probe/sv_lines.json)

sv_lines.json: {"ur": {"voice", "rate", "pitch", "lines": [...], "cast": {...}}, "ar": {...}}
A line is plain narration, or narration with quoted DIALOGUE marked inline as
    [[speaker|intensity|spoken words]]
The dialogue is voiced by that speaker's own voice (from "cast", falling back to CAST below),
with rate/pitch/volume shifted by the intensity (INTENSITY below), and a short pause around it.
Captions strip the markup (render.py) so the screen shows only the spoken words.
Writes <lang>_<i>.wav (44.1 kHz mono) per line + sv_info.json (durations, Whisper transcript)."""
import json, os, re, sys, subprocess, asyncio
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'edge-tts', 'imageio-ffmpeg', 'faster-whisper'], check=True)
import edge_tts, imageio_ffmpeg
ff = imageio_ffmpeg.get_ffmpeg_exe()
ALL = json.load(open(os.path.join(os.path.dirname(__file__), 'sv_lines.json')))

# default second voices per language (override per episode with "cast" in sv_lines.json)
CAST = {
    'ur': {'man': {'voice': 'ur-IN-SalmanNeural'}, 'man2': {'voice': 'ur-IN-SalmanNeural', 'pitch': -8},
           'woman': {'voice': 'ur-PK-UzmaNeural'}, 'woman2': {'voice': 'ur-IN-GulNeural'}},
    'ar': {'man': {'voice': 'ar-AE-HamdanNeural'}, 'man2': {'voice': 'ar-IQ-BasselNeural'},
           'woman': {'voice': 'ar-SA-ZariyahNeural'}, 'woman2': {'voice': 'ar-AE-FatimaNeural'}},
}
# delivery by the intensity of the moment: rate %, pitch Hz, volume % (added to the speaker's base)
INTENSITY = {
    'calm':       (-6, 0, 0),
    'tender':     (-10, -2, -10),
    'grief':      (-16, -6, -12),
    'firm':       (-2, 0, 10),
    'dismissive': (4, -6, 0),     # e.g. a curt "So what?"
    'angry':      (8, 6, 25),
    'urgent':     (12, 8, 15),
    'fearful':    (6, 10, -5),
    'proud':      (-4, 4, 15),
    'whisper':    (-10, -2, -40),
}
MARK = re.compile(r'\[\[([^|\]]+)\|([^|\]]+)\|(.+?)\]\]')
GAP = 0.22  # seconds of silence around a dialogue segment

def segments(line, J, lang):
    base = dict(voice=J['voice'], rate=int(J['rate'].rstrip('%')), pitch=int(J['pitch'].rstrip('Hz')), volume=0)
    cast = {**CAST.get(lang, {}), **J.get('cast', {})}
    segs, pos = [], 0
    for m in MARK.finditer(line):
        if line[pos:m.start()].strip(): segs.append((line[pos:m.start()].strip(), base, False))
        who, how, txt = m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
        c = cast.get(who, {'voice': J['voice'], 'pitch': -6})
        dr, dp, dv = INTENSITY.get(how, INTENSITY['calm'])
        segs.append((txt, dict(voice=c['voice'], rate=c.get('rate', base['rate']) + dr, pitch=c.get('pitch', base['pitch']) + dp,
                               volume=c.get('volume', 0) + dv), True))
        pos = m.end()
    if line[pos:].strip(): segs.append((line[pos:].strip(), base, False))
    return segs

def sgn(v, unit): return f'{v:+d}{unit}'
def to_pcm(p):
    return subprocess.run([ff, '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', '44100', '-'], capture_output=True).stdout

INFO = {}
for LANG, J in ALL.items():
    info = INFO.setdefault(LANG, {'durs': [], 'err': {}, 'asr': [], 'segments': {}})
    async def main():
        for i, line in enumerate(J['lines']):
            segs = segments(line, J, LANG)
            pcm = b''
            if any(d for *_, d in segs): info['segments'][i] = [[t, s['voice'], s['rate'], s['pitch'], s['volume']] for t, s, d in segs]
            for k, (txt, s, dialog) in enumerate(segs):
                p = os.path.join(out, f'{LANG}_{i}_{k}.mp3')
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(txt, s['voice'], rate=sgn(s['rate'], '%'), pitch=sgn(s['pitch'], 'Hz'),
                                                   volume=sgn(s['volume'], '%')).save(p); break
                    except Exception as e:
                        info['err'][f'{i}.{k}'] = repr(e)
                gap = b'\x00\x00' * int(44100 * GAP) if dialog else b''
                pcm += gap + to_pcm(p) + gap
                if os.path.exists(p): os.remove(p)
            w = os.path.join(out, f'{LANG}_{i}.wav')
            subprocess.run([ff, '-v', 'error', '-y', '-f', 's16le', '-ac', '1', '-ar', '44100', '-i', '-', w], input=pcm, check=False)
            subprocess.run([ff, '-v', 'error', '-y', '-i', w, '-b:a', '96k', os.path.join(out, f'{LANG}_{i}.mp3')], check=False)
            info['durs'].append(round(len(pcm) / 2 / 44100, 3))
    asyncio.run(main())
try:
    import numpy as np
    from faster_whisper import WhisperModel
    mdl = WhisperModel('medium', device='cpu', compute_type='int8')
    for LANG, J in ALL.items():
        for i in range(len(J['lines'])):
            raw = subprocess.run([ff, '-v', 'error', '-i', os.path.join(out, f'{LANG}_{i}.mp3'), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
            segs, _ = mdl.transcribe(np.frombuffer(raw, np.float32), language=LANG, beam_size=5)
            INFO[LANG]['asr'].append(' '.join(x.text.strip() for x in segs))
except Exception as e:
    INFO['asr_err'] = repr(e)
json.dump(INFO, open(os.path.join(out, 'sv_info.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(INFO, ensure_ascii=False, indent=1))
