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
    'ur': dict(title1='ام البنین (س) کون تھیں؟', riwayat='روایت · شیعہ کتب',
               k1='بی بی فاطمہ (س) کی شہادت کے بعد', aqil='عقیل بن ابی طالب', aqilSub='امام علی (ع) کے بھائی · عرب نسبوں کے ماہر',
               brave1='بہادر خاندان کی خاتون', brave2='تاکہ بہادر بیٹے پیدا ہوں', umda='عمدۃ الطالب · ابن عنبہ',
               bravest='عقیل: عربوں میں بنی کلاب سے زیادہ بہادر کوئی نہیں', tabari='تاریخِ طبری: والد کا نام حزام بن خالد',
               k3='شیعہ کتابوں میں', aqila='فاطمہ نہیں · ام البنین کہہ کر پکاریں',
               sons=['عباس', 'عبداللہ', 'جعفر', 'عثمان'], mother='ام البنین = بیٹوں کی ماں', famed='بہادری کے لیے مشہور',
               k5='اہلِ بیت (ع) کی خدمت', shahid='شہید ثانی', shahidQ='ایک نیک خاتون · زندگی اہلِ بیت (ع) کی خدمت میں',
               qurashi='علامہ باقر شریف قرشی', qurashiQ='بی بی فاطمہ (س) کے بچوں کا، اپنے بچوں سے زیادہ خیال',
               k6='اعیان الشیعہ', k6b='کربلا', amin='سید محسن امین', poet='فصیح شاعرہ · شریف اور بہادر خاندان',
               maqatil='مقاتل الطالبیین', isfahani='ابو الفرج اصفہانی', martyred='چاروں بیٹے · امام حسین (ع) کے ساتھ شہید',
               k7='ہر روز · جنت البقیع', grandson='پوتے عبید اللہ بن عباس کے ساتھ', elegies='مرثیے · مدینہ کے لوگ ساتھ روتے',
               marwan='کہا جاتا ہے: مروان بن حکم بھی رو پڑا',
               close1='روایت: بی بی فاطمہ (س) کے بچوں کی خاطر',
               brand='شیعہ وائس', ask='ام البنین (س) کی زندگی کا سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں', next='کل: ام البنین (س) کی وفات'),
    'ar': dict(title1='مَن هي أمُّ البنين (ع)؟', riwayat='يُروى · كتبُ الشيعة',
               k1='بعد شهادة فاطمة الزهراء (ع)', aqil='عقيل بن أبي طالب', aqilSub='أخو الإمام عليّ (ع) · عالمٌ بأنساب العرب',
               brave1='امرأةٌ من بيتٍ شجاع', brave2='تلدُ أبناءً شجعاناً', umda='عمدة الطالب · ابن عنبة',
               bravest='عقيل: ليس في العرب أشجعُ من رجال بني كلاب', tabari='تاريخ الطبريّ: أبوها حِزامُ بنُ خالد',
               k3='في كتب الشيعة', aqila='لا فاطمة · بل أمّ البنين',
               sons=['العبّاس', 'عبد الله', 'جعفر', 'عثمان'], mother='أمّ البنين = أمّ الأبناء', famed='اشتهروا بالشجاعة',
               k5='في خدمة أهل البيت (ع)', shahid='الشهيد الثاني', shahidQ='امرأةٌ صالحة · وهبت حياتها لخدمة أهل البيت (ع)',
               qurashi='العلّامة باقر شريف القرشيّ', qurashiQ='تهتمّ بأبناء فاطمة (ع) أكثرَ من أبنائها',
               k6='أعيان الشيعة', k6b='كربلاء', amin='السيّد محسن الأمين', poet='شاعرةٌ فصيحة · من أسرةٍ شريفةٍ شجاعة',
               maqatil='مقاتل الطالبيّين', isfahani='أبو الفرج الأصفهانيّ', martyred='أبناؤها الأربعة · استُشهدوا مع الحسين (ع)',
               k7='كلَّ يوم · البقيع', grandson='مع حفيدها عُبَيد الله بن العبّاس', elegies='مراثٍ · وأهلُ المدينة يبكون معها',
               marwan='يُقال: بكى مروانُ بنُ الحكم أيضاً',
               close1='يُروى: من أجل أبناء فاطمة (ع)',
               brand='شيعة فويس', ask='ما أعظمُ درسٍ من حياة أمّ البنين (ع)؟ اكتبوا في التعليقات', next='غداً: وفاةُ أمّ البنين (ع)'),
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
