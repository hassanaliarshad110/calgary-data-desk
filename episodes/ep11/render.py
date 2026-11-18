"""Render a Shia Voice episode.
usage: python3 render.py <lang> <audio_dir> preview <scene>:<t> [...]
       python3 render.py <lang> <audio_dir> full [scene ids]
"""
import json, sys, os, re, base64, subprocess, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
lang, adir, mode = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3]
lines = json.load(open(HERE / 'lines.json'))[lang]['lines']
info = json.load(open(adir / 'sv_info.json'))
durs = info[lang]['durs'] if lang in info else info['durs']

LEAD, GAP, HOLD = 0.8, 0.5, 3.0
REPL = {
    'ur': [('علیہ السلام', '(ع)')],
    'ar': [('عليه السلام', '(ع)')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='سلمانِ فارسی اور خندق', q0='ایک فارسی کی تدبیر · جس نے مدینہ بچایا', who='جنگِ خندق · ۵ ہجری',
               k1='جنگِ احزاب', month='ہجرت کا پانچواں سال · اکثر کے مطابق شوال', quraysh='قریش · ابوسفیان کی سربراہی میں · اتحادی قبیلے',
               ahzab='حملہ آور لشکر', ahzabname='اسی لیے: جنگِ احزاب', muslims='مدینہ کے مسلمان (تقریباً)',
               k2='سلمان کا مشورہ', shura='اللہ کے نبی ﷺ کا مشورہ', few='تھوڑی فوج، بڑی فوج کا مقابلہ نہیں کر سکتی',
               enemy='دشمن کا راستہ', city='مدینہ', dig='دشمن کے راستے پر: خندق', hisham='سیرتِ ابنِ ہشام: مشورہ سلمان کا تھا',
               k3='کھدائی', bukhari='صحیح بخاری', carried='اللہ کے نبی ﷺ خود مٹی اٹھاتے رہے', backs='مہاجرین و انصار: پیٹھ پر مٹی',
               dua='اے اللہ! بھلائی بس آخرت کی ہے، انصار و مہاجرین کو برکت دے',
               k4='«سلمان ہم میں سے ہیں»', muhajirun='مہاجرین', ansar='انصار', salmanTr='سلمان ہم میں سے ہیں، ہم اہلِ بیت میں سے',
               tabarani='طبرانی · المعجم الکبیر', hakim='حاکم · المستدرک', hayat='مجلسی · حیات القلوب (شیعہ)',
               k5='چٹان', hard='کدال سے نہ ٹوٹنے والی چٹان', f1='پہلی چمک: حیرہ اور مدائن کے محل', f2='دوسری چمک: روم', f3='تیسری چمک: صنعا',
               bidaya='روایت: البدایہ والنہایہ · ابنِ کثیر',
               k6='عمرو بن عبدِ وُد', siege='محاصرہ: ہفتوں', amr='عمرو نے خندق پار کی اور للکارا',
               imanRef='پورا ایمان، پورے شرک کے مقابلے میں · کنز الفوائد · اعلام الوریٰ', won='علی (ع) جیت گئے',
               k7='ہوا اور لشکر', duelRef='خندق کے دن علی (ع) کا مقابلہ، قیامت تک امت کے اعمال سے افضل · المستدرک',
               windRef='سورۂ احزاب · ۹', left='سارے لشکر ناکام لوٹ گئے',
               brand='شیعہ وائس', ask='سلمان کو یہ مقام کس چیز نے دیا؟ کمنٹ میں لکھیں', next='کل: ایک اونٹ اور ایک خچر · جمل سے امام حسن (ع) کے جنازے تک'),
    'ar': dict(title1='سلمان الفارسي والخندق', q0='فكرةُ رجلٍ فارسيّ · أنقذت المدينة', who='غزوة الخندق · ٥ هـ',
               k1='غزوة الأحزاب', month='السنة الخامسة للهجرة · شوّال على قول الجمهور', quraysh='قريش بقيادة أبي سفيان · وقبائل متحالفة',
               ahzab='جيش الأحزاب', ahzabname='ولذلك: غزوة الأحزاب', muslims='المسلمون في المدينة (نحو)',
               k2='مشورة سلمان', shura='استشار رسول الله ﷺ أصحابه', few='القليل لا يقوى على الكثير',
               enemy='طريق العدوّ', city='المدينة', dig='على طريق العدوّ: خندق', hisham='ابن هشام: يُقال إنّ الذي أشار به سلمان',
               k3='الحفر', bukhari='صحيح البخاري', carried='رسول الله ﷺ ينقل التراب بنفسه', backs='المهاجرون والأنصار: التراب على الظهور',
               dua='',
               k4='«سلمانُ منّا أهلَ البيت»', muhajirun='المهاجرون', ansar='الأنصار', salmanTr='',
               tabarani='الطبراني · المعجم الكبير', hakim='الحاكم · المستدرك', hayat='المجلسي · حياة القلوب (شيعي)',
               k5='الصخرة', hard='صخرةٌ لا تعمل فيها المعاول', f1='البرقة الأولى: قصور الحيرة والمدائن', f2='البرقة الثانية: الروم', f3='البرقة الثالثة: صنعاء',
               bidaya='الرواية: البداية والنهاية · ابن كثير',
               k6='عمرو بن عبد ودّ', siege='الحصار: أسابيع', amr='عبر عمرو الخندق ودعا إلى المبارزة',
               imanRef='كنز الفوائد · إعلام الورى · شرح نهج البلاغة', won='انتصر عليّ (ع)',
               k7='الريح والجنود', duelRef='المستدرك على الصحيحين · الحاكم',
               windRef='سورة الأحزاب · ٩', left='فرجع الأحزاب خائبين',
               brand='شيعة فويس', ask='ما الذي بلغ بسلمان هذه المنزلة؟ اكتب في التعليقات', next='غداً: جملٌ وبغلة · من الجمل إلى جنازة الإمام الحسن (ع)'),
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
