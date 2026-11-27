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
    'ur': [('، سلام اللہ علیہا،', ' (س)،'), ('علیہما السلام', '(ع)'), ('علیہم السلام', '(ع)'), ('علیہ السلام', '(ع)'), ('سلام اللہ علیہا', '(س)')],
    'ar': [('عليهما السلام', '(ع)'), ('عليهم السلام', '(ع)'), ('عليها السلام', '(ع)'), ('عليه السلام', '(ع)')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(k0='بی بی فاطمہ (س) کے نام', abiha='«اپنے باپ کی ماں»', title1='اللہ کے نبی ﷺ نے اپنی بیٹی کو «اپنے باپ کی ماں» کیوں کہا؟',
               nine='امام جعفر صادق (ع) سے روایت', nineSub='اللہ کے نزدیک، بی بی فاطمہ (س) کے نو نام',
               fatm='«فَطَم»: الگ کر دینا', naar='وہ، اور ان سے محبت کرنے والے: آگ سے دور', naarRef='روایت: اللہ کے نبی ﷺ',
               zahra='روشن، چمکتی ہوئی', zahraQ='محراب میں ان کا نور، آسمان والوں کے لیے ایسے چمکتا، جیسے ستارے زمین والوں کے لیے', zahraRef='امام صادق (ع) سے روایت',
               ilal='علل الشرائع · شیخ صدوق', ilalSub='لقب «زہرا» پر پورا باب',
               batool='الگ ہو جانے والی · اللہ کی طرف', amal='عمل', akhlaq='اخلاق', ilm='علم', batoolSub='اپنے زمانے کی عورتوں سے الگ اور بلند',
               siddiqa='بہت سچی', kafiSub='شیعہ حدیث کی کتاب', shah='«صدیقہ شہیدہ»: سچی، اور شہید', shahRef='الکافی · جلد ۱، صفحہ ۴۵۸',
               scene='باپ کے لیے بیٹی کی فکر کا ایک منظر', bukhari='صحیح بخاری · حدیث ۲۴۰', bukhariSub='عبداللہ ابنِ مسعود کی روایت · کعبہ کے پاس',
               came='فاطمہ (س) آئیں، اور اسے ہٹا دیا',
               shia='شیعہ کتابیں', sunni='سنی کتابیں', maqSub='امام صادق (ع)، امام باقر (ع) سے', hajar='ابنِ حجر',
               kunyaRef='اسد الغابہ · الاستیعاب · الاصابہ', asif='گویا اپنے بابا کی ماں',
               date='بی بی فاطمہ (س) کے نام', dateSub='نو نام · کئی لقب · ایک کنیت: اُمِّ ابیہا',
               brand='شیعہ وائس', ask='آپ کو بی بی فاطمہ (س) کا کون سا نام سب سے پیارا ہے؟ کمنٹ میں لکھیں',
               next='کل: علی (ع) اور فاطمہ (س) کی شادی', nextSub='مدینہ کی سب سے سادہ شادی'),
    'ar': dict(k0='أسماء فاطمة (ع)', abiha='ابنةٌ، وأمٌّ لأبيها', title1='لماذا دعا رسولُ الله ﷺ ابنتَه «أمَّ أبيها»؟',
               nine='عن الإمام جعفر الصادق (ع)', nineSub='لفاطمة (ع) تسعةُ أسماءٍ عند الله',
               fatm='«الفَطْم»: القطعُ والفصل', naar='فطمها، وفطم محبّيها، عن النار', naarRef='روايةٌ عن رسول الله ﷺ',
               zahra='المُنيرةُ المُشرقة', zahraQ='', zahraRef='عن الإمام الصادق (ع)',
               ilal='علل الشرائع · الشيخ الصدوق', ilalSub='بابٌ في لقب «الزهراء»',
               batool='المنقطعةُ إلى الله', amal='العمل', akhlaq='الأخلاق', ilm='العلم', batoolSub='تميّزت عن نساء زمانها وفاقتهنّ',
               siddiqa='كثيرةُ الصدق', kafiSub='للكليني', shah='', shahRef='الكافي · ج ١، ص ٤٥٨',
               scene='مشهدٌ من حنان البنت على أبيها', bukhari='صحيح البخاري · ٢٤٠', bukhariSub='عن عبد الله بن مسعود · عند الكعبة',
               came='جاءت فاطمة (ع)، فطرحته عن ظهره',
               shia='من كتب الشيعة', sunni='من كتب السنّة', maqSub='عن الصادق عن أبيه الباقر (ع)', hajar='لابن حجر',
               kunyaRef='أسد الغابة · الاستيعاب · الإصابة', asif='كأنّها أمٌّ لأبيها',
               date='أسماء فاطمة (ع)', dateSub='تسعة أسماء · ألقاب كثيرة · وكنية: أمّ أبيها',
               brand='شيعة فويس', ask='أيُّ أسماء فاطمة (ع) أحبُّ إليكم؟ اكتبوا في التعليقات',
               next='غداً: زواج عليٍّ وفاطمة (ع)', nextSub='أبسطُ زواجٍ في المدينة'),
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
