import sys, os, re, json, subprocess, urllib.request, html
OUT = sys.argv[1] if len(sys.argv) > 1 else '_b'
os.makedirs(OUT, exist_ok=True)
SID = 'cd7b7487-b2be-452f-9300-3312998747f2'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept': '*/*', 'Referer': 'https://suno.com/'}
log = []
def get(url, n=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=n) as r:
        return r.status, r.headers.get('content-type'), r.read()
def ffprobe(p):
    d = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip()
    v = subprocess.run(['ffmpeg','-i',p,'-af','volumedetect','-f','null','-'],capture_output=True,text=True).stderr
    mv = re.findall(r'mean_volume: (-?[\d.]+)', v)
    return float(d or 0), float(mv[0]) if mv else -99
cands = [f'https://cdn1.suno.ai/{SID}.mp3', f'https://cdn2.suno.ai/{SID}.mp3', f'https://cdn1.suno.ai/{SID}.m4a']
# pages
for pg in ['https://suno.com/s/kNr2zzlcLt6VIMIL', f'https://suno.com/song/{SID}']:
    try:
        st, ct, b = get(pg)
        t = b.decode('utf-8', 'ignore')
        open(os.path.join(OUT, 'page_' + pg.rsplit('/',1)[-1] + '.html'), 'w').write(t)
        found = set(re.findall(r'https?://[^"\'\s\\]+?\.(?:mp3|m4a|wav)', t.replace('\\u002F','/').replace('\\/','/')))
        log.append({'page': pg, 'status': st, 'len': len(t), 'audio_urls': sorted(found)})
        for u in found:
            if u not in cands: cands.append(u)
        m = re.findall(r'"(?:lyric|prompt)"\s*:\s*"((?:[^"\\]|\\.){40,})"', t)
        if m:
            open(os.path.join(OUT, 'page_lyrics.txt'), 'w').write(json.loads('"'+m[0]+'"'))
    except Exception as e:
        log.append({'page': pg, 'err': repr(e)})
song = None
for u in cands:
    try:
        st, ct, b = get(u, 120)
        ext = '.m4a' if '.m4a' in u else ('.wav' if '.wav' in u else '.mp3')
        p = os.path.join(OUT, 'song' + ext)
        open(p, 'wb').write(b)
        dur, mv = ffprobe(p)
        log.append({'url': u, 'status': st, 'ct': ct, 'bytes': len(b), 'dur': dur, 'mean_db': mv})
        if dur > 60 and mv > -50:
            song = p; break
        os.remove(p)
    except Exception as e:
        log.append({'url': u, 'err': repr(e)})
json.dump(log, open(os.path.join(OUT, 'fetch_log.json'), 'w'), indent=1)
print(json.dumps(log, indent=1))
if not song:
    sys.exit(0)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'faster-whisper==1.0.3'], check=False)
wav = os.path.join(OUT, 'song16k.wav')
subprocess.run(['ffmpeg','-y','-v','error','-i',song,'-ac','1','-ar','16000',wav], check=True)
from faster_whisper import WhisperModel
res = {}
for lang in ['hi', 'ur']:
    try:
        m = WhisperModel('medium', device='cpu', compute_type='int8')
        segs, info = m.transcribe(wav, language=lang, word_timestamps=True, vad_filter=False, beam_size=5,
                                  condition_on_previous_text=False,
                                  initial_prompt='सूसू मैन! आया सूसू मैन! बिल्ली हो या पिल्ला, सब की बचाए जान। छोटा सा क़ासिम। मामा! सूसू आई है!')
        out = []
        for s in segs:
            out.append({'start': round(s.start,2), 'end': round(s.end,2), 'text': s.text,
                        'words': [{'w': w.word, 's': round(w.start,2), 'e': round(w.end,2), 'p': round(w.probability,2)} for w in (s.words or [])]})
        res[lang] = out
        json.dump(out, open(os.path.join(OUT, f'whisper_{lang}.json'), 'w'), ensure_ascii=False, indent=1)
        print(lang, len(out))
    except Exception as e:
        print('whisper', lang, repr(e))
    if lang == 'hi': break
os.remove(wav)
