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
    'ur': dict(k0='قرآن · سورۂ احزاب · آیت ۳۳', title1='آیتِ تطہیر: وہ آیت، جو ایک گھرانے کی پاکیزگی کا اعلان کرتی ہے',
               ref33='آیتِ تطہیر · سورۂ احزاب · آیت ۳۳',
               mafhum='مفہوم: اے اہلِ بیت، اللہ بس یہی چاہتا ہے کہ تم سے ہر ناپاکی دور رکھے، اور تمہیں پوری طرح پاک رکھے',
               tirmidhi='جامع ترمذی', tirmidhiSub='عمر بن ابی سلمہ کی روایت · حدیث ۳۷۸۷', house='آیت، ام المومنین ام سلمہ کے گھر میں اتری',
               ahli='اے اللہ، یہ میرے اہلِ بیت ہیں، ان سے ہر ناپاکی دور رکھ، اور انہیں پوری طرح پاک کر دے', ahliRef='اللہ کے نبی ﷺ · جامع ترمذی',
               femL='۳۳:۳۲ · نبی کی بیویوں سے خطاب: عورتوں کا صیغہ', mascL='آیتِ تطہیر: مردوں والا صیغہ',
               femIf='اگر مراد صرف بیویاں ہوتیں، تو یوں ہوتا', shiaM='شیعہ مفسرین کی دلیل',
               innamaM='اِنّما: بس، صرف یہی', rijsItems=['شرک', 'نفاق', 'جہالت', 'گناہ'], rijsM='الرِّجس: ہر طرح کی ناپاکی',
               ulama='شیخ مفید · علامہ طباطبائی', ulamaSub='شیعہ علماء', isma='آیت، اہلِ بیت (ع) کی عصمت کی دلیل',
               tirAhmad='جامع ترمذی · مسند احمد', anas='انس بن مالک کی روایت', salatM='نماز، اے اہلِ بیت!', months='چھ مہینے · ہر روز فجر کے وقت',
               muslim='صحیح مسلم', muslimSub='ام المومنین عائشہ کی روایت · حدیث ۲۴۲۴', mirt='کالے بالوں کی دھاری دار چادر میں، یہی چار ہستیاں',
               ikrima='عکرمہ: صرف بیویوں کے بارے میں؟', ikrimaSub='بعض لوگوں کی رائے', ummQ='ام سلمہ: کیا میں بھی ان کے ساتھ ہوں؟',
               makan='تم اپنی جگہ پر ہو، اور تم خیر پر ہو', makanRef='اللہ کے نبی ﷺ · جامع ترمذی',
               ibnKathir='تفسیر ابنِ کثیر', ibnKathirSub='ابنِ ابی حاتم سے روایت', kufa='امیر المومنین (ع) کے بعد · امام حسن (ع) منبر پر',
               iraq='اے اہلِ عراق، ہمارے بارے میں اللہ سے ڈرو۔ ہم تمہارے امیر اور تمہارے مہمان ہیں، اور ہم ہی وہ اہلِ بیت ہیں', iraqRef='امام حسن (ع) · تفسیر ابنِ کثیر',
               wept='مسجد میں ہر کوئی رو رہا تھا',
               date='سورۂ احزاب · آیت ۳۳', dateSub='آیتِ تطہیر',
               brand='شیعہ وائس', ask='اللہ کے نبی ﷺ چھ مہینے تک، اسی دروازے پر یہ آیت کیوں پڑھتے رہے؟ کمنٹ میں لکھیں',
               next='کل: بی بی فاطمہ (س) کے نام', nextSub='زہرا · بتول · صدیقہ · ام ابیہا'),
    'ar': dict(k0='القرآن · سورة الأحزاب · الآية ٣٣', title1='آية التطهير: الآية التي أعلنت طهارةَ بيتٍ واحد',
               ref33='آية التطهير · سورة الأحزاب · الآية ٣٣', mafhum='',
               tirmidhi='جامع الترمذي', tirmidhiSub='عن عمر بن أبي سلمة · الحديث ٣٧٨٧', house='نزلت الآية في بيت أمّ المؤمنين أمّ سلمة',
               ahli='', ahliRef='رسول الله ﷺ · جامع الترمذي',
               femL='٣٣:٣٢ · خطاب نساء النبيّ: ضمير النسوة', mascL='آية التطهير: ضمير المذكّر',
               femIf='لو كان المقصود الزوجاتِ وحدهنّ، لقال', shiaM='استدلال مفسّري الشيعة',
               innamaM='إنّما: للحصر', rijsItems=['الشرك', 'النفاق', 'الجهل', 'الذنب'], rijsM='الرِّجس بالألف واللام: كلُّ رجس',
               ulama='الشيخ المفيد · العلّامة الطباطبائي', ulamaSub='علماء الشيعة', isma='الآية دليلٌ على عصمة أهل البيت (ع)',
               tirAhmad='جامع الترمذي · مسند أحمد', anas='عن أنس بن مالك', salatM='', months='ستّة أشهر · كلَّ فجر',
               muslim='صحيح مسلم', muslimSub='عن أمّ المؤمنين عائشة · الحديث ٢٤٢٤', mirt='في مِرطٍ مُرحَّلٍ من شعرٍ أسود: هؤلاء الأربعة',
               ikrima='عكرمة: في الزوجات وحدهنّ؟', ikrimaSub='قولُ بعضهم', ummQ='أمّ سلمة: وأنا معهم يا نبيَّ الله؟',
               makan='', makanRef='رسول الله ﷺ · جامع الترمذي',
               ibnKathir='تفسير ابن كثير', ibnKathirSub='عن ابن أبي حاتم', kufa='بعد أمير المؤمنين (ع) · الإمام الحسن (ع) على المنبر',
               iraq='', iraqRef='الإمام الحسن (ع) · تفسير ابن كثير',
               wept='ما بقي في المسجد أحدٌ إلّا وهو يبكي',
               date='سورة الأحزاب · الآية ٣٣', dateSub='آية التطهير',
               brand='شيعة فويس', ask='لماذا كان رسولُ الله ﷺ يتلو هذه الآية على ذلك الباب ستّةَ أشهر؟ اكتبوا في التعليقات',
               next='غداً: أسماء فاطمة (ع)', nextSub='الزهراء · البتول · الصدّيقة · أمّ أبيها'),
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
