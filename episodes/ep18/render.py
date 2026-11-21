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
    'ur': [('، سلام اللہ علیہا،', ' (س)،'), ('علیہما السلام', '(ع)'), ('علیہ السلام', '(ع)'), ('سلام اللہ علیہا', '(س)')],
    'ar': [('عليهما السلام', '(ع)'), ('عليها السلام', '(ع)'), ('عليه السلام', '(ع)')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='اللہ کے نبی ﷺ: فاطمہ میرا ٹکڑا ہے', who='شیعہ کتب · صحیح بخاری · صحیح مسلم',
               k1='صحیح بخاری', bab='باب: فضائلِ فاطمہ', miswar='راوی: مِسوَر بن مَخرَمہ', refB='صحیح بخاری · حدیث ۳۷۶۷',
               k2='صحیح مسلم', refM='صحیح مسلم · حدیث ۲۴۴۹',
               k3='شیعہ کتب', saduq='شیخ صدوق', refA='الامالی · شیخ صدوق',
               k4='سنن ابی داؤد', aisha='ام المومنین عائشہ کی روایت', acts=['کھڑے ہو جاتے', 'ہاتھ تھامتے', 'چومتے', 'اپنی جگہ بٹھاتے'],
               k5='صحیح بخاری · میراث اور فدک', claim='والد کی میراث کا مطالبہ · فدک', refused='ابوبکر کا انکار', refB2='صحیح بخاری · حدیث ۴۲۴۰',
               k6='صحیح بخاری · حدیث ۴۲۴۰', six='اپنے والد کے بعد · صرف چھ مہینے', night='علی (ع) نے رات میں دفن کیا', noinfo='ابوبکر کو خبر نہیں دی', prayed='اور نمازِ جنازہ پڑھی',
               k7='بسترِ بیماری', kifaya='کفایۃ الاثر', kifayaSub='شیعہ کتاب · خزاز قمی', cited='ابوبکر اور عمر سے گفتگو میں · یہی حدیث بطور دلیل',
               one='جس نے اسے ناراض کیا، اس نے مجھے ناراض کیا', two='فاطمہ نے وفات تک ان سے بات نہیں کی · بخاری',
               brand='شیعہ وائس', ask='ان دونوں جملوں کو ساتھ پڑھ کر، کیا بات سامنے آتی ہے؟ کمنٹ میں لکھیں', next='کل: ام البنین (س) کون تھیں؟'),
    'ar': dict(title1='رسول الله ﷺ: فاطمةُ بَضْعةٌ منّي', who='كتبُ الشيعة · صحيح البخاريّ · صحيح مسلم',
               k1='صحيح البخاريّ', bab='بابُ مناقب فاطمة', miswar='الراوي: المِسْوَرُ بنُ مَخْرَمة', refB='صحيح البخاريّ · الحديث ٣٧٦٧',
               k2='صحيح مسلم', refM='صحيح مسلم · الحديث ٢٤٤٩',
               k3='كتبُ الشيعة', saduq='الشيخ الصدوق', refA='الأمالي · الشيخ الصدوق',
               k4='سنن أبي داود', aisha='روايةُ أمّ المؤمنين عائشة', acts=['قام إليها', 'أخذ بيدها', 'قبّلها', 'أجلسها في مجلسه'],
               k5='صحيح البخاريّ · الميراث وفدك', claim='طلبت ميراثَها من أبيها · ومنه فدك', refused='فأبى أبو بكر', refB2='صحيح البخاريّ · الحديث ٤٢٤٠',
               k6='صحيح البخاريّ · الحديث ٤٢٤٠', six='بعد أبيها · ستّةُ أشهرٍ فقط', night='دفنها عليٌّ (ع) ليلاً', noinfo='ولم يُؤذِن بها أبا بكر', prayed='وصلّى عليها',
               k7='على فراش المرض', kifaya='كفاية الأثر', kifayaSub='كتابٌ شيعيّ · الخزّاز القمّي', cited='في حوارٍ مع أبي بكرٍ وعمر · احتجّت بهذا الحديث',
               one='صحيح البخاريّ · الحديث ٣٧٦٧', two='صحيح البخاريّ · الحديث ٤٢٤٠',
               brand='شيعة فويس', ask='ماذا تعني الجملتان معاً؟ اكتب في التعليقات', next='غداً: مَن هي أمُّ البنين (ع)؟'),
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
