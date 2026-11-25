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
    'ur': dict(k0='خندق · پانچ ہجری', title1='خندق کے دن: علی (ع) اور عمرو بن عبدِ وُد',
               k1='پانچ ہجری · جنگِ خندق', ahzab='اس پار: قریش اور ان کے اتحادی',
               amr='عمرو بن عبدِ وُد', third='قریش کا تیسرا بڑا شہسوار', thousand='ہزار سواروں کے برابر',
               with1='ساتھ: عکرمہ بن ابی جہل اور چند ساتھی', books1='خندق کے ایک تنگ حصے سے · تاریخِ طبری · الارشاد',
               call='ہے کوئی، جو میرے مقابلے پر آئے؟', taunt='کہاں ہے وہ جنت، جس کا تم دعویٰ کرتے ہو؟ کیا تم میں سے کوئی اسے نہیں چاہتا؟',
               silence='خاموشی', irshad='کتاب الارشاد', irshadSub='شیخ مفید', hoarse='پکار پکار کر، میری آواز بیٹھ گئی ہے',
               itsAmr='یہ عمرو بن عبدِ وُد ہے', narr='اللہ کے نبی ﷺ · ایک روایت', turban='اللہ کے نبی ﷺ کا عمامہ', sword='اور ان کی تلوار',
               imanRef='پورا ایمان، پورے شرک کے مقابلے پر نکلا ہے · شرح نہج البلاغہ، ابنِ ابی الحدید',
               dua='اے اللہ، بدر کے دن تو نے مجھ سے عبیدہ کو لیا، اور احد کے دن حمزہ کو۔ آج علی کو میرے لیے سلامت رکھ', duaRef='اللہ کے نبی ﷺ کی دعا · ایک روایت',
               pledge='تمہارا عہد: قریش کا جو آدمی تین باتوں کی دعوت دے…', o1='اسلام قبول کرو', o2='جہاں سے آئے ہو، لوٹ جاؤ', o3='گھوڑے سے اترو، اور مقابلہ کرو',
               r1='اپنے باپ دادا کا دین چھوڑ دوں؟', r2='پھر عرب کہیں گے، کہ میں بھاگ گیا',
               shield='علی (ع) نے وار ڈھال پر روکا',
               jabir='میں انہیں دیکھ نہ سکا، یہاں تک کہ تکبیر کی آواز بلند ہوئی، اور میں سمجھ گیا، کہ علی نے عمرو کو قتل کر دیا', jabirRef='جابر بن عبد اللہ انصاری · الارشاد',
               sunni='اہلِ سنت کی کتابوں میں بھی', mustadrak='المستدرک', mustadrakSub='حاکم نیشاپوری', baghdad='تاریخِ بغداد', baghdadSub='خطیب بغدادی',
               duel='خندق کے دن، عمرو بن عبدِ وُد سے علی کا مقابلہ، قیامت تک میری امت کے اعمال سے افضل ہے', duelRef='اللہ کے نبی ﷺ · المستدرک · تاریخِ بغداد',
               thaqRef='علی کی ضرب، جن و انس کی عبادت سے افضل · نہج الحق، علامہ حلی',
               close1='جب سب خاموش تھے، علی (ع) اٹھے',
               brand='شیعہ وائس', ask='آپ کے خیال میں، اس دن کی سب سے بڑی بات کیا تھی؟ کمنٹ میں لکھیں', next='کل: حدیبیہ · وہ لفظ جو علی (ع) نے نہیں مٹایا'),
    'ar': dict(k0='الخندق · سنة ٥ هـ', title1='يوم الخندق: عليٌّ (ع) وعمرو بن عبد وُدّ',
               k1='السنة الخامسة للهجرة · غزوة الخندق', ahzab='خلفه: قريش وحلفاؤها',
               amr='عمرو بن عبد وُدّ', third='ثالث فرسان قريش', thousand='يُعَدُّ بألف فارس',
               with1='معه: عكرمة بن أبي جهل ونفرٌ من أصحابه', books1='من مكانٍ ضيّقٍ في الخندق · تاريخ الطبري · الإرشاد',
               call='', taunt='أين جنّتُكم التي تزعمون أنّكم داخلوها؟ أفلا يريدها أحدٌ منكم؟',
               silence='فسكت المسلمون', irshad='الإرشاد', irshadSub='الشيخ المفيد', hoarse='',
               itsAmr='إنّه عمرو بن عبد وُدّ', narr='رسول الله ﷺ · في رواية', turban='عمامة رسول الله ﷺ', sword='وسيفُه',
               imanRef='شرح نهج البلاغة · ابن أبي الحديد',
               dua='اللّهمّ إنّك أخذتَ منّي عُبيدةَ يومَ بدر، وحمزةَ يومَ أُحُد، فاحفظ لي عليّاً اليوم', duaRef='دعاء رسول الله ﷺ · في رواية، بما معناه',
               pledge='عهدُك: ألّا يدعوَك رجلٌ من قريشٍ إلى ثلاث خصالٍ إلّا أجبتَه', o1='أن تُسلم', o2='أن ترجع من حيث أتيت', o3='انزل عن فرسك، وقاتِل',
               r1='أأتركُ دينَ آبائي؟', r2='إذن تتحدّثُ العربُ بفراري',
               shield='اتّقى عليٌّ (ع) ضربتَه بتُرسه',
               jabir='فلم أرَهما، إلى أن رُفع صوتُ التكبير، وفهمتُ أنّ عليّاً قد قتل عمراً', jabirRef='جابر بن عبد الله الأنصاري · الإرشاد',
               sunni='في كتب أهل السنّة أيضاً', mustadrak='المستدرك على الصحيحين', mustadrakSub='الحاكم النيسابوري', baghdad='تاريخ بغداد', baghdadSub='الخطيب البغدادي',
               duel='', duelRef='رسول الله ﷺ · المستدرك · تاريخ بغداد',
               thaqRef='نهج الحقّ · العلّامة الحلّي',
               close1='حين سكت الجميع، قام عليٌّ (ع)',
               brand='شيعة فويس', ask='برأيكم، ما أعظمُ ما في ذلك اليوم؟ اكتبوا في التعليقات', next='غداً: الحديبية · الكلمة التي لم يمحُها عليٌّ (ع)'),
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
