"""Render the Shia Voice Dubai episode.
usage: python3 render.py <lang> <audio_dir> preview <scene>:<t> [...]
       python3 render.py <lang> <audio_dir> full [scene ids]
"""
import json, sys, os, base64, subprocess, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
lang, adir, mode = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3]
lines = json.load(open('/home/claude/probe_wt/probe/sv_lines.json'))[lang]['lines']
info = json.load(open(adir / 'sv_info.json'))
durs = info[lang]['durs'] if lang in info else info['durs']

LEAD, GAP, HOLD = 0.8, 0.5, 3.0
REPL = {
    'ur': [('رسولِ خدا، صلی اللہ علیہ وآلہ وسلم،', 'رسولِ خدا ﷺ'), ('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('امام علی، علیہ السلام،', 'امام علی (ع)')],
    'ar': [('رسولُ الله، صلّى اللهُ عليه وآله وسلّم،', 'رسولُ الله ﷺ'), ('الزهراء، عليها السلام.', 'الزهراء (ع).'), ('عليٌّ، عليه السلام،', 'عليٌّ (ع)')],
}
caps = []
for l in lines:
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='بی بی فاطمہ زہرا (س)', title2='اور ان کا دروازہ', k1='آیتِ تطہیر — سورۂ احزاب: ۳۳', k2='۲۸ صفر — ۱۱ ہجری',
               saq='سقیفۂ بنی ساعدہ', bayt='بیتِ فاطمہ (س) — امام علی (ع) اور بنی ہاشم', k4='دروازے پر آگ', q='چاہے ہوں',
               b1='تاریخِ طبری', b2='مصنفِ ابنِ ابی شیبہ', k5='اہلِ سنت کی تاریخ میں بھی', k5b='گھر جلانے کی دھمکی',
               mohsin='جنابِ محسن (ع)', age='۱۸ برس', next='کل: بی بی (س) کی شہادت کیسے ہوئی؟', brand='شیعہ وائس دبئی',
               ask='اس دروازے کا درد ہمیں کیا سکھاتا ہے؟ کمنٹ میں لکھیں'),
    'ar': dict(title1='السيدة فاطمة الزهراء (ع)', title2='وبابُ بيتها', k1='آية التطهير — الأحزاب: ٣٣', k2='٢٨ صفر — ١١ للهجرة',
               saq='سقيفة بني ساعدة', bayt='بيت فاطمة (ع) — عليٌّ (ع) وبنو هاشم', k4='النارُ عند الباب', q='وإنْ',
               b1='تاريخ الطبري', b2='مصنَّف ابن أبي شيبة', k5='في كتب أهل السنّة أيضاً', k5b='التهديد بإحراق البيت',
               mohsin='المحسن (ع)', age='١٨ عاماً', next='غداً: كيف استُشهدت الزهراء (ع)؟', brand='شيعة فويس دبي',
               ask='ماذا يعلّمنا ألمُ هذا الباب؟ اكتب لنا في التعليقات'),
}
scenes = []
for i, d in enumerate(durs):
    dur = (LEAD if i == 0 else 0) + d + GAP + (HOLD if i == len(durs) - 1 else 0)
    scenes.append(dict(dur=round(dur, 3)))
CFG = dict(lang=lang, caps=caps, durs=durs, lead=LEAD, scenes=scenes, labels=LABELS[lang])
OUT = HERE / f'out_{lang}'; OUT.mkdir(exist_ok=True)
json.dump(CFG, open(OUT / 'cfg.json', 'w'), ensure_ascii=False, indent=1)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    pg.goto((HERE / 'page.html').as_uri())
    ok = pg.evaluate('cfg => window.setup(cfg)', CFG)
    print('fonts ok', ok)
    if mode == 'preview':
        for spec in sys.argv[4:]:
            si, t = spec.split(':'); si = int(si); t = float(t)
            data = pg.evaluate('([s,t]) => window.frame(s,t,.9)', [si, t])
            fn = OUT / f'prev_{si}_{t:.1f}.jpg'; fn.write_bytes(base64.b64decode(data.split(',', 1)[1])); print(fn)
    else:
        ids = [int(x) for x in sys.argv[4:]] or list(range(len(scenes)))
        for si in ids:
            dur = scenes[si]['dur']; n = int(round(dur * 30))
            tmp, final = OUT / f'scene_{si}.tmp.mp4', OUT / f'scene_{si}.mp4'
            ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', str(tmp)], stdin=subprocess.PIPE)
            for f in range(n):
                data = pg.evaluate('([s,t]) => window.frame(s,t)', [si, f / 30])
                ff.stdin.write(base64.b64decode(data.split(',', 1)[1]))
            ff.stdin.close()
            if ff.wait() == 0: os.replace(tmp, final); print('scene', si, n, 'frames')
            else: print('FAILED scene', si)
    b.close()
