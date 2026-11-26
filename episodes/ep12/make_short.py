"""Ep 12 cliffhanger Short (vertical, ~30 s), cut from the vertical episode: opens on the danger at frame 0 (cold open with the text hook),
runs through the escalation (the horn, Golu jumps onto the rails, the goods engine, slow-mo dive) and ENDS UNRESOLVED a moment before the catch with "POORA EPISODE DEKHO!".
No narrator. Audio = the same cuts of the dialogue-checked episode mix (+ a short sting on the end card), loudness -14 LUFS / -1 dBTP."""
import json, subprocess, os
from PIL import Image, ImageDraw, ImageFont
TL = json.load(open('timeline.json')); S = {s['id']: s for s in TL['scenes']}; L = TL['lines']
src = 'susuman_ep12_vertical.mp4'
def A(sid, t): return S[sid]['start'] + t
segs = [(0.0, A('why', L['d1']['s'] + L['d1']['d'] + .25)),                          # frame 0: ball flying at the window -> CHHANNN -> Gill -> the lie -> "sach bol de"
        (A('why', L['b2']['s'] + L['b2']['d'] - .35), A('why', L['b3']['s'] + L['b3']['d'] + .3)),   # runs to the pipe, climbs, Dada Abu, stuck: "Bachao!"
        (A('power', 4.4), A('power', S['power']['dur'])),                           # door burst + SUUU-SUUU-MAN! (after the narrator line)
        (A('rescue', 0.0), A('rescue', 9.35 - .45))]                                 # streak in -> KRAAAK -> pipe swings -> slow-mo fall (stop BEFORE the catch)
os.makedirs('short', exist_ok=True)
parts = []
for i, (a, b) in enumerate(segs):
    o = f'short/p{i}.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-i', src, '-t', f'{b - a:.3f}', '-af', f'afade=t=in:d=0.03,afade=t=out:st={b - a - .06:.3f}:d=0.06',
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', o], check=True)
    parts.append(o)
# end card: freeze the last frame, darken, "POORA EPISODE DEKHO!" + arrow (2.6 s)
last = f'short/last.png'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-sseof', '-0.05', '-i', parts[-1], '-frames:v', '1', last], check=True)
im = Image.open(last).convert('RGB'); ov = Image.new('RGBA', im.size, (0, 0, 0, 110)); im = Image.alpha_composite(im.convert('RGBA'), ov)
d = ImageDraw.Draw(im); F = lambda s: ImageFont.truetype('../../fonts/Bangers.ttf', s)
def txt(y, s, size, fill):
    f = F(size); w = d.textlength(s, font=f); x = (1080 - w) / 2
    d.text((x + 8, y + 10), s, font=f, fill=(0, 0, 0)); d.text((x, y), s, font=f, fill=fill, stroke_width=12, stroke_fill=(0, 0, 0))
txt(330, 'BASIM BACHEGA?!', 116, (255, 255, 255)); txt(700, 'POORA EPISODE', 150, (255, 200, 58)); txt(870, 'DEKHO!', 190, (224, 34, 44))
d.polygon([(540, 1240), (470, 1150), (510, 1150), (510, 1130 - 60), (570, 1130 - 60), (570, 1150), (610, 1150)], fill=(255, 255, 255), outline=(0, 0, 0))
im.convert('RGB').save('short/end.png')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-t', '2.6', '-i', 'short/end.png', '-f', 'lavfi', '-t', '2.6', '-i',
                'aevalsrc=0.5*sin(2*PI*587*t)*exp(-3*t)+0.35*sin(2*PI*880*t)*exp(-4*t)+0.4*sin(2*PI*55*t)*exp(-6*t):s=44100',
                '-vf', "zoompan=z='1+0.0015*on':d=78:s=1080x1920:fps=30", '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', 'short/end.mp4'], check=True)
parts.append('short/end.mp4')
open('short/list.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'short/list.txt', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
                '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'susuman_ep12_short.mp4'], check=True)
print(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'susuman_ep12_short.mp4'], capture_output=True, text=True).stdout)
