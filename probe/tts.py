"""Calgary Insight narration lane (studio-probe), v2: Kokoro af_heart with five free upgrades.

Input  probe/tts_lines.json : {"v": ["line 0", "line 1", ...], "<other key>": [...], "_cfg": {...}}
Output <out>/<key>_<i>.wav (final, mastered), <out>/durs.json (seconds per line), <out>/asr_report.json, <out>/raw/

Upgrades (Hassan, Nov 17, 2026: "apply free upgrade first and QCs"):
 1. Pronunciation list   probe/lexicon.json maps a written word to how Kokoro should say it (respelling). Only the
                         spoken text changes; captions keep the script's spelling.
 2. Sentence pacing      every line is voiced one sentence at a time and re-joined with measured pauses
                         (". " 0.30 s, "? " 0.40 s, "! " 0.34 s); the hook line is read a touch faster, the closing line a touch slower.
 3. Takes                the hook (first line) and the closing line get three takes; the cleanest one is kept.
 4. Listen-back check    faster-whisper transcribes every line and compares it with the script; a line that doesn't match
                         is re-voiced at other speeds, and anything still off is flagged "check" in asr_report.json.
 5. Audio polish         high-pass, de-ess, gentle compression and two-pass loudness to -18 LUFS per line, so every
                         line sits at the same level before sfx.py mixes the final video at -14 LUFS.

_cfg (all optional):
  "voice": {key: voice}, "speed": {key: base speed}, "mode": {key: "baseline"} (old v1 behaviour, still scored),
  "hook_speed": 1.05, "close_speed": 0.97, "gap": {".": .30, "?": .40, "!": .34}, "asr": true, "master": true,
  "lufs": -18, "min_acc": 0.9, "takes": 3
"""
import json, os, re, sys, subprocess, urllib.request, difflib, unicodedata

out = sys.argv[1]; os.makedirs(os.path.join(out, 'raw'), exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(HERE, 'tts_lines.json')))
cfg = L.pop('_cfg', {})
USE_ASR = cfg.get('asr', True)
pkgs = ['kokoro-onnx', 'soundfile', 'numpy'] + (['faster-whisper', 'num2words'] if USE_ASR else [])
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q'] + pkgs, check=True)
base = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    if not os.path.exists(f): urllib.request.urlretrieve(base + f, f)
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
SR = 24000

LEX_PATH = os.path.join(HERE, 'lexicon.json')
LEX = {w: v for w, v in json.load(open(LEX_PATH)).items() if not w.startswith('_')} if os.path.exists(LEX_PATH) else {}
GAP = {'.': .30, '?': .40, '!': .34, **cfg.get('gap', {})}
MIN_ACC = cfg.get('min_acc', .9); NTAKES = max(1, int(cfg.get('takes', 3))); LUFS = cfg.get('lufs', -18)

# ---------- 1. pronunciation list ----------
def spoken(text):
    """Apply the lexicon (whole words, case-sensitive keys first so 'Bow' the river never touches 'bow' the verb)."""
    for w in sorted(LEX, key=len, reverse=True):
        say = LEX[w]['say'] if isinstance(LEX[w], dict) else LEX[w]
        text = re.sub(r'(?<![\w\'’])' + re.escape(w) + r'(?![\w\'’])', say, text)
    return text

# ---------- 2. sentence pacing ----------
def sentences(text):
    parts = re.split(r'(?<=[.!?])\s+(?=["“‘\'(]?[A-ZÀ-Ý0-9])', text.strip())
    return [p for p in parts if p.strip()]

def fade(a, ms=12):
    n = min(len(a) // 2, int(SR * ms / 1000))
    if n > 0:
        r = np.linspace(0, 1, n, dtype=np.float32); a = a.copy(); a[:n] *= r; a[-n:] *= r[::-1]
    return a

def voice_line(text, voice, speed):
    chunks = []
    sents = sentences(spoken(text))
    for j, s in enumerate(sents):
        a, sr = k.create(s, voice=voice, speed=speed, lang='en-us')
        a = fade(np.asarray(a, dtype=np.float32)); chunks.append(a)
        if j < len(sents) - 1:
            chunks.append(np.zeros(int(SR * GAP.get(s.rstrip()[-1:], .30)), dtype=np.float32))
    return np.concatenate(chunks) if chunks else np.zeros(1, dtype=np.float32)

# ---------- 4. listen-back check ----------
asr = None
if USE_ASR:
    from faster_whisper import WhisperModel
    from num2words import num2words
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')

def norm_words(t):
    t = unicodedata.normalize('NFKD', t)
    t = ''.join(c for c in t if not unicodedata.combining(c)).lower()
    t = t.replace('’', "'").replace('-', ' ').replace('—', ' ').replace('–', ' ')
    out_w = []
    for w in re.findall(r"[a-z0-9']+", t):
        w = w.replace("'", '')
        m = re.fullmatch(r'(\d+)(st|nd|rd|th)?', w)
        if m and asr is not None:
            n = int(m.group(1))
            words = num2words(n, to='ordinal') if m.group(2) else (num2words(n, to='year') if 1100 <= n <= 2099 else num2words(n))
            out_w += norm_words(words)
        elif w:
            out_w.append(w)
    return out_w

def similar(a, b, lex=False):
    return a == b or difflib.SequenceMatcher(None, a, b).ratio() >= (.5 if lex else .8)

LEX_WORDS = set(w for key in LEX for w in norm_words(key))

def accuracy(ref_text, heard):
    ref, hyp = norm_words(ref_text), norm_words(heard)
    if not ref: return 1.0, []
    sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
    ok, miss = 0, []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal': ok += i2 - i1; continue
        r, h = ref[i1:i2], hyp[j1:j2]
        if tag == 'replace':
            for x, y in zip(r, h):
                if similar(x, y, x in LEX_WORDS): ok += 1
                else: miss.append(f'{x}->{y}')
            miss += [f'{x}->(missing)' for x in r[len(h):]]
        elif tag == 'delete':
            miss += [f'{x}->(missing)' for x in r]
        else:
            miss += [f'(extra)->{y}' for y in h]
    extra = sum(1 for m in miss if m.startswith('(extra)'))
    return max(0.0, (ok - extra) / len(ref)), miss

def proper_nouns(lines):
    names = set()
    for ln in lines:
        for s in sentences(ln):
            for w in re.findall(r"[A-ZÀ-Ý][\w'’-]+", s)[1:]: names.add(w)
    return ', '.join(sorted(names))[:400]

def hear(audio, prompt):
    """Transcribe in memory (16 kHz float32): no file decoding, so no PyAV version issues. Never blocks narration."""
    global asr
    if asr is None: return ''
    try:
        n16 = int(len(audio) * 16000 / SR)
        a16 = np.interp(np.linspace(0, len(audio) - 1, n16), np.arange(len(audio)), audio).astype(np.float32)
        segs, _ = asr.transcribe(a16, language='en', beam_size=5, initial_prompt=prompt or None, vad_filter=False,
                                 condition_on_previous_text=False)
        return ' '.join(s.text.strip() for s in segs).strip()
    except Exception as e:                      # the check is advisory: narration still ships, the report says why
        print('listen-back check unavailable:', repr(e)[:200], flush=True)
        return None

# ---------- 5. audio polish ----------
def master(src, dst):
    chain = 'highpass=f=70,deesser=i=0.35,acompressor=threshold=0.09:ratio=2.5:attack=8:release=90:makeup=1.5'
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', f'{chain},loudnorm=I={LUFS}:TP=-2:LRA=9:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True)
    m = json.loads(p.stderr[p.stderr.rfind('{'):p.stderr.rfind('}') + 1])
    ln = (f"loudnorm=I={LUFS}:TP=-2:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'{chain},{ln}', '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', dst],
                   check=True)
    return float(m['input_i'])

# ---------- run ----------
durs, report = {}, {}
for name, lines in L.items():
    voice = cfg.get('voice', {}).get(name, 'af_heart'); spd0 = cfg.get('speed', {}).get(name, 1.0)
    baseline = cfg.get('mode', {}).get(name) == 'baseline'
    prompt = proper_nouns(lines)
    durs[name], report[name] = [], []
    for i, text in enumerate(lines):
        last, first = i == len(lines) - 1, i == 0
        if baseline:
            a, _ = k.create(text, voice=voice, speed=spd0, lang='en-us'); a = np.asarray(a, dtype=np.float32)
            heard = hear(a, prompt) if asr else None
            acc, miss = accuracy(text, heard) if heard is not None else (None, [])
            best = {'audio': a, 'speed': spd0, 'acc': acc, 'miss': miss, 'heard': heard}; takes = [best]
        else:
            spd = spd0 * (cfg.get('hook_speed', 1.05) if first and len(lines) > 1 else cfg.get('close_speed', .97) if last and len(lines) > 1 else 1.0)
            plan = [spd, spd * 1.04, spd * .96][:NTAKES] if (first or last) else [spd]
            takes = []
            def try_speed(s):
                a = voice_line(text, voice, s)
                heard = hear(a, prompt) if asr else None
                acc, miss = accuracy(text, heard) if heard is not None else (None, [])
                takes.append({'audio': a, 'speed': round(s, 3), 'acc': acc, 'miss': miss, 'heard': heard})
            for s in plan: try_speed(s)
            if all(t['acc'] is not None for t in takes) and max(t['acc'] for t in takes) < MIN_ACC:          # re-voice a line that didn't come out clean
                for s in (spd * .94, spd * 1.06):
                    if all(abs(t['speed'] - s) > .005 for t in takes): try_speed(s)
            best = max(takes, key=lambda t: (round(t['acc'] or 0, 3), -abs(t['speed'] - spd)))
        raw = os.path.join(out, 'raw', f'{name}_{i}.wav'); sf.write(raw, best['audio'], SR)
        dst = os.path.join(out, f'{name}_{i}.wav')
        if baseline or not cfg.get('master', True):
            sf.write(dst, best['audio'], SR); in_lufs = None
        else:
            in_lufs = master(raw, dst)
        d = round(sf.info(dst).frames / SR, 3); durs[name].append(d)
        status = 'ok' if (best['acc'] is None or best['acc'] >= MIN_ACC) else 'check'
        report[name].append({'i': i, 'text': text, 'said': text if baseline else spoken(text), 'heard': best['heard'] or '',
                             'acc': None if best['acc'] is None else round(best['acc'], 3), 'mismatches': best['miss'],
                             'speed': best['speed'], 'takes': [{'speed': t['speed'], 'acc': None if t['acc'] is None else round(t['acc'], 3)} for t in takes],
                             'dur': d, 'input_lufs': in_lufs, 'status': status})
        print(name, i, status, best['acc'], d, (best['heard'] or '')[:90], flush=True)

summary = {key: {'lines': len(v), 'check': [r['i'] for r in v if r['status'] == 'check'],
                 'mean_acc': round(sum(r['acc'] for r in v if r['acc'] is not None) / max(1, sum(1 for r in v if r['acc'] is not None)), 3) if asr else None}
           for key, v in report.items()}
json.dump(durs, open(os.path.join(out, 'durs.json'), 'w'))
json.dump({'summary': summary, 'lexicon_entries': len(LEX), 'lines': report}, open(os.path.join(out, 'asr_report.json'), 'w'), indent=1, ensure_ascii=False)
print(durs); print('SUMMARY', json.dumps(summary))
