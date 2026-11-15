"""Assemble a Susuman compilation (true 16:9): title card -> [episode card -> episode] x N.
Every segment is re-encoded to 1920x1080 30 fps yuv420p, libx264 crf 18, AAC 192k stereo 44.1 kHz, loudness-normalised to -14 LUFS (two-pass loudnorm).
Usage: python3 build_compilation.py <work> <out.mp4> <spec.json>
spec: {"title_png": ..., "title_wav": ..., "card_wav": ..., "eps": [{"ep":1,"card_png":...,"video":...}, ...]}
Writes <out>.chapters.json with each episode's start time."""
import sys, os, json, subprocess, re
work, out, spec = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3])); os.makedirs(work, exist_ok=True)
V = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-g', '60']
A = ['-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2']
def run(c): subprocess.run(c, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
def ln_params(f):
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(e[e.rindex('{'):e.rindex('}') + 1])
    return f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
def card(png, wav, d, o, zoom):
    if os.path.exists(o) and os.path.exists(o + '.ok'): return
    fr = int(d * 30)
    vf = (f"scale=3840:2160,zoompan=z='1+{zoom}*on/{fr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={fr}:s=1920x1080:fps=30,"
          f"fade=t=in:st=0:d=0.2,fade=t=out:st={d - 0.25}:d=0.25,format=yuv420p")
    run(['ffmpeg', '-y', '-loop', '1', '-i', png, '-i', wav, '-filter_complex', f"[0:v]{vf}[v];[1:a]aresample=44100,apad,atrim=0:{d},volume=0.55[a]", '-map', '[v]', '-map', '[a]', '-t', str(d), *V, *A, o]); open(o + '.ok', 'w').close()
def episode(src, o):
    if os.path.exists(o) and os.path.exists(o + '.ok'): return
    af = ln_params(src) + ',aresample=44100'
    run(['ffmpeg', '-y', '-i', src, '-vf', 'scale=1920:1080:flags=lanczos,fps=30,format=yuv420p', '-af', af, *V, *A, o]); open(o + '.ok', 'w').close()
segs = []; t0 = os.path.join(work, 's00_title.mp4'); card(spec['title_png'], spec['title_wav'], 5.0, t0, .06); segs.append(t0)
for i, e in enumerate(spec['eps'], 1):
    c = os.path.join(work, f's{i:02d}a_card.mp4'); card(e['card_png'], spec['card_wav'], 2.0, c, .04)
    v = os.path.join(work, f's{i:02d}b_ep{e["ep"]}.mp4'); episode(e['video'], v); segs += [c, v]; print('built', e['ep'], flush=True)
lst = os.path.join(work, 'list.txt'); open(lst, 'w').write(''.join(f"file '{s}'\n" for s in segs))
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', out])
t = 0.0; chapters = []
for s in segs:
    m = re.search(r'_ep(\d+)\.mp4$', s)
    if s.endswith('_card.mp4'): card_start = t
    if m: chapters.append({'ep': int(m.group(1)), 'start': round(card_start, 2)})
    t += dur(s)
json.dump({'duration': round(dur(out), 2), 'chapters': chapters}, open(out + '.chapters.json', 'w'), indent=1); print(open(out + '.chapters.json').read())
