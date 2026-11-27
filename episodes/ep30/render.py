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
    'ur': dict(k0='فتحِ مکہ · رمضان، آٹھ ہجری', title1='علی (ع)، اللہ کے نبی ﷺ کے کندھوں پر: کعبہ کے بت کیسے گرے؟',
               hud='صلحِ حدیبیہ · چھ ہجری · دس سال کے لیے', khuza='قبیلۂ خزاعہ ← مسلمانوں کے ساتھ', bakr='بنو بکر ← قریش کے ساتھ',
               broke='دو سال بعد: قریش نے صلح توڑ دی',
               ram='رمضان · آٹھ ہجری', tenK='تقریباً دس ہزار کا لشکر، مکہ کی طرف', entry='بیس رمضان', entrySub='اکثر مؤرخین کے مطابق: لشکر مکہ میں داخل ہوا',
               waqidi='مغازیِ واقدی', waqidiSub='سعد بن عبادہ، ابوسفیان سے', malhama='آج خون بہانے کا دن ہے!', malhamaRef='سعد بن عبادہ',
               marhama='آج رحمت کا دن ہے', marhamaRef='اللہ کے نبی ﷺ',
               irshad='کتاب الارشاد · شیخ مفید', irshadSub='جلد ۱، صفحہ ۵۳', flag='حکم: علی (ع)، سعد سے جھنڈا لے لیں',
               bukhari='صحیح بخاری · صحیح مسلم', bukhariSub='جب آپ ﷺ مکہ میں داخل ہوئے', idols='کعبہ کے گرد بت · ہاتھ کی چھڑی سے گراتے گئے',
               haqqM='حق آ گیا، اور باطل مٹ گیا، بے شک باطل مٹنے ہی والا ہے · سورۂ اسراء ۸۱ · صحیح مسلم', haqqRef='',
               ahmad='مسند احمد · مستدرکِ حاکم', ahmadSub='خود علی (ع) کی روایت', sit='آپ ﷺ نے فرمایا: بیٹھ جاؤ · پھر میری کمزوری دیکھی',
               isad='میرے کندھوں پر چڑھ جاؤ', isadRef='اللہ کے نبی ﷺ · مسند احمد',
               ufuq='مجھے یوں لگا، کہ اگر میں چاہوں، تو آسمان کے کنارے کو چھو لوں', ufuqRef='علی (ع) · مسند احمد',
               hakim='مستدرکِ حاکم', hakimSub='قریش کا سب سے بڑا بت · پیتل کا، لوہے کی میخوں سے گڑا ہوا',
               glass='شیشے کی طرح ٹوٹ کر بکھر گیا', when='یہ کب ہوا؟', whenSub='اکثر روایتوں میں وقت نہیں · ابنِ طاؤس: فتحِ مکہ سے جوڑتے ہیں',
               now='اب تم کیا کہتے ہو؟', tathrib='آج تم پر کوئی ملامت نہیں', tathribRef='حضرت یوسف (ع) کے الفاظ · سورۂ یوسف ۹۲',
               free='جاؤ، تم آزاد ہو', freeRef='اللہ کے نبی ﷺ', tulaqa='«طُلَقاء»: آزاد کیے ہوئے',
               letter='امیر المومنین (ع) کا خط، معاویہ کے نام', letterSub='اسے بھی طلقاء میں گنا',
               date='بیس رمضان · آٹھ ہجری', dateSub='فتحِ مکہ',
               brand='شیعہ وائس', ask='بت گرانے کے لیے، اللہ کے نبی ﷺ نے علی (ع) ہی کو کیوں چنا؟ کمنٹ میں لکھیں',
               next='کل: سورۂ کوثر کیوں اتری؟', nextSub='انہوں نے کہا «ابتر» · اللہ نے جواب دیا: کوثر'),
    'ar': dict(k0='فتح مكّة · رمضان، السنة الثامنة', title1='عليٌّ (ع) على كتفَي رسول الله ﷺ: كيف سقطت أصنامُ الكعبة؟',
               hud='صلح الحديبية · السنة السادسة · لعشر سنين', khuza='خُزاعة ← في حلف المسلمين', bakr='بنو بكر ← في حلف قريش',
               broke='بعد سنتين: نقضت قريشٌ الصلح',
               ram='رمضان · السنة الثامنة', tenK='نحو عشرة آلاف، إلى مكّة', entry='العشرون من رمضان', entrySub='على قول أكثر المؤرّخين: دخل الجيشُ مكّة',
               waqidi='مغازي الواقدي', waqidiSub='سعد بن عبادة لأبي سفيان', malhama='', malhamaRef='سعد بن عبادة',
               marhama='', marhamaRef='رسول الله ﷺ',
               irshad='الإرشاد · الشيخ المفيد', irshadSub='الجزء ١، ص ٥٣', flag='أمر عليّاً (ع) أن يأخذ الراية من سعد',
               bukhari='صحيح البخاري · صحيح مسلم', bukhariSub='دخل رسولُ الله ﷺ مكّة', idols='صنماً حول الكعبة · يطعنها بعودٍ في يده',
               haqqM='', haqqRef='سورة الإسراء ٨١ · صحيح مسلم',
               ahmad='مسند أحمد · مستدرك الحاكم', ahmadSub='يرويه عليٌّ (ع) نفسُه', sit='قال: اجلس · فرأى منّي ضعفاً',
               isad='', isadRef='رسول الله ﷺ · مسند أحمد',
               ufuq='', ufuqRef='عليّ (ع) · مسند أحمد',
               hakim='مستدرك الحاكم', hakimSub='صنم قريش الأكبر · من نحاس، موتَّدٌ بأوتادٍ من حديد',
               glass='تكسّر كما تتكسّر القوارير', when='متى كان ذلك؟', whenSub='أكثر الروايات لا تذكر وقتَه · ابن طاووس: بفتح مكّة',
               now='', tathrib='', tathribRef='قول يوسف (ع) · سورة يوسف ٩٢',
               free='', freeRef='رسول الله ﷺ', tulaqa='«الطُّلَقاء»',
               letter='كتاب أمير المؤمنين (ع) إلى معاوية', letterSub='عدّه من الطلقاء',
               date='العشرون من رمضان · السنة الثامنة', dateSub='فتح مكّة',
               brand='شيعة فويس', ask='لماذا اختار رسولُ الله ﷺ عليّاً (ع) لكسر الأصنام؟ اكتبوا في التعليقات',
               next='غداً: سورة الكوثر، لماذا نزلت؟', nextSub='قالوا «الأبتر» · فجاء الجواب: الكوثر'),
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
