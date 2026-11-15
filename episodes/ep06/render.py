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
    'ur': [('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('علی، علیہ السلام،', 'علی (ع)'), ('امام حسین، علیہما السلام،', 'امام حسین (ع)')],
    'ar': [('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('عليٌّ، عليه السلام،', 'عليٌّ (ع)'), ('عليّ، عليه السلام،', 'عليّ (ع)'), ('والحسينَ، عليهما السلام،', 'والحسينَ (ع)')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup [[speaker|intensity|words]] -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='رات کی تدفین… اور چھپی ہوئی قبر', q0='چودہ سو برس بعد بھی، کوئی یقین سے نہیں جانتا: قبر کہاں ہے؟', why='ایسا کیوں ہوا؟',
               k1='۳ جمادی الثانی، ۱۱ ہجری', days='بابا کے ۹۵ دن بعد — مشہور شیعہ روایت', sunset='سورج ڈوبنے کے بعد · بحار الانوار', will1='وصیت: رات میں تدفین · قبر چھپی رہے',
               k2='غسل و کفن', ghusl='غسل: امام علی (ع) · تاریخِ یعقوبی', asma='مدد: اسماء بنتِ عمیس · شیعہ کتب', delay='دروازے پر لوگ جمع · بتایا گیا: جنازہ مؤخر ہے', src2='ابوذر · روضۃ الواعظین',
               k3='اندھیرے میں چند لوگ', three='سلمان · ابوذر · مقداد', src3a='تاریخِ یعقوبی', others='امام حسن (ع) · امام حسین (ع) · عمار · عقیل · بنی ہاشم', src3b='روضۃ الواعظین · اعلام الوریٰ',
               k4='صرف شیعہ روایت نہیں', bukhari='صحیح بخاری', ref4='صحیح بخاری ۴۲۴۰-۴۲۴۱ · کتاب المغازی', spoke='وفات تک ابوبکر سے بات نہیں کی',
               k5='قبر کے نشان مٹا دیے گئے', seven='۷ نئی قبریں · مناقبِ ابنِ شہر آشوب', forty='۴۰ قبریں · دلائل الامامہ',
               k6='اگلی صبح', came='ابوبکر اور عمر نمازِ جنازہ کے لیے آئے · کتابِ سُلیم', miqdad='مقداد نے بتایا: تدفین رات ہی میں ہو چکی', dig='قبریں کھودنے کی بات… امام علی (ع) کی تنبیہ', src6='شیعہ روایات · بحار الانوار',
               k7='قبر کہاں ہے؟ تین بڑے مقام', p1='ان کا اپنا گھر — اب مسجدِ نبوی میں', p2='روضہ — قبرِ نبی ﷺ اور منبر کے بیچ', p3='جنت البقیع', tusi='شیخ طوسی: تینوں جگہ زیارت · مصباح المتہجد',
               brand='شیعہ وائس', ask='بی بی (س) نے اپنی قبر کو چھپانا کیوں چاہا؟ کمنٹ میں لکھیں', next='کل: فدک'),
    'ar': dict(title1='الدفن ليلاً… والقبر المخفيّ', q0='بعد أربعة عشر قرناً، لا يعرف أحدٌ يقيناً: أين قبرُها؟', why='فلماذا؟',
               k1='٣ جمادى الآخرة، سنة ١١ هـ', days='بعد أبيها بـ ٩٥ يوماً — الرواية الشيعية المشهورة', sunset='بعد غروب الشمس · بحار الأنوار', will1='الوصية: الدفن ليلاً · وإخفاء القبر',
               k2='الغُسل والكفن', ghusl='غسّلها الإمام علي (ع) · تاريخ اليعقوبي', asma='أعانته أسماء بنت عُمَيس · مصادر شيعية', delay='اجتمع الناس عند الباب · قيل: تأخّرت الجنازة', src2='أبو ذرّ · روضة الواعظين',
               k3='قليلون في الظلام', three='سلمان · أبو ذرّ · المقداد', src3a='تاريخ اليعقوبي', others='الحسن (ع) · الحسين (ع) · عمّار · عقيل · بنو هاشم', src3b='روضة الواعظين · إعلام الورى',
               k4='ليست روايةً شيعيةً فقط', bukhari='صحيح البخاري', ref4='صحيح البخاري ٤٢٤٠-٤٢٤١ · كتاب المغازي', spoke='لم تكلّم أبا بكر حتى تُوفّيت',
               k5='مُحي أثرُ القبر', seven='٧ قبور جديدة · مناقب ابن شهرآشوب', forty='٤٠ قبراً · دلائل الإمامة',
               k6='في الصباح', came='جاء أبو بكر وعمر للصلاة عليها · كتاب سُلَيم', miqdad='أخبرهم المقداد: دُفنت ليلاً', dig='الكلام في نبش القبور… وتحذير الإمام علي (ع)', src6='مصادر شيعية · بحار الأنوار',
               k7='أين قبرُها؟ ثلاثة مواضع رئيسية', p1='بيتها — اليوم في المسجد النبوي', p2='الروضة — بين القبر الشريف والمنبر', p3='البقيع', tusi='الشيخ الطوسي: زيارتها في المواضع الثلاثة · مصباح المتهجّد',
               brand='شيعة فويس', ask='لماذا أرادت الزهراء (ع) أن يبقى قبرُها مخفيّاً؟ اكتب في التعليقات', next='غداً: فدك'),
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
