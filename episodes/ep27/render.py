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
    'ur': dict(k0='مباہلہ · نجران کے عیسائیوں کے سامنے', title1='مباہلہ: جب اللہ کے نبی ﷺ اپنے اہلِ بیت (ع) کو ساتھ لائے',
               madinah='مدینہ', najran='نجران', k1='۹ ہجری · نجران سے مدینہ',
               delegation='نجران کا عیسائی وفد', leaders='عاقب · سید · ابو حارثہ',
               debate='مسجدِ نبوی میں بحث: حضرت عیسیٰ (ع)', trinity='ان کا اصرار: عیسیٰ، تثلیث میں سے ایک ہیں',
               mithlRef='سورۂ آل عمران · آیت ۵۹', mubRef='آیتِ مباہلہ · سورۂ آل عمران · آیت ۶۱',
               day='مقررہ دن', carry='امام حسین (ع) گود میں، امام حسن (ع) کا ہاتھ ہاتھ میں', withL='ساتھ: بی بی فاطمہ (س) اور علی (ع)',
               amin='جب میں دعا کروں، تو تم آمین کہنا', aminRef='اللہ کے نبی ﷺ · تفسیر الکشاف، زمخشری',
               sonsN='حسن (ع) · حسین (ع)', womenN='فاطمہ (س)', selvesN='علی (ع)',
               mufassir='زمخشری · فخر الدین رازی · بیضاوی', mufassirSub='اہلِ سنت کے مفسرین: «انفسنا» سے مراد علی (ع)',
               sat='خدا کی قسم، یہ نبی اسی طرح بیٹھے ہیں، جیسے انبیاء مباہلہ کے لیے بیٹھا کرتے تھے', satRef='ابو حارثہ',
               faces='میں ایسے چہرے دیکھ رہا ہوں، کہ اگر یہ دعا کریں کہ پہاڑ اپنی جگہ سے ہٹ جائے، تو وہ ہٹ جائے گا', facesRef='ابو حارثہ · ایک روایت',
               peace='اے ابو القاسم، ہم مباہلہ نہیں کرتے، ہم سے صلح کر لیجیے', peaceRef='ابو حارثہ',
               robes='صلح: ہر سال دو ہزار لباس (حُلّے)', jizya='اپنے دین پر رہیں گے، اور جزیہ دیں گے', none='مباہلہ کی نوبت ہی نہ آئی',
               muslim='صحیح مسلم', muslimSub='سعد بن ابی وقاص کی روایت · حدیث ۲۴۰۴', ahli='اے اللہ، یہ میرے اہل ہیں', ahliRef='اللہ کے نبی ﷺ · صحیح مسلم',
               kashshaf='تفسیر الکشاف', kashshafSub='زمخشری', kisa='اصحابِ کساء کی فضیلت پر، اس سے مضبوط کوئی دلیل نہیں', kisaRef='زمخشری · الکشاف',
               date='۲۴ ذی الحجہ', dateSub='روزِ مباہلہ',
               brand='شیعہ وائس', ask='اللہ کے نبی ﷺ نے صرف ان چار ہستیوں کو ہی کیوں چنا؟ کمنٹ میں لکھیں',
               next='کل: آیتِ تطہیر', nextSub='وہ آیت، جو ایک گھرانے کی پاکیزگی کا اعلان کرتی ہے'),
    'ar': dict(k0='المباهلة · أمام نصارى نجران', title1='المباهلة: يوم أخرج رسولُ الله ﷺ أهلَ بيته (ع)',
               madinah='المدينة', najran='نجران', k1='سنة ٩ هـ · من نجران إلى المدينة',
               delegation='وفد نصارى نجران', leaders='العاقب · السيّد · أبو حارثة',
               debate='الحوار في مسجد النبيّ: عيسى (ع)', trinity='وهم يُصرّون: أنّه أحدُ الثالوث',
               mithlRef='سورة آل عمران · الآية ٥٩', mubRef='آية المباهلة · سورة آل عمران · الآية ٦١',
               day='اليوم الموعود', carry='الحسين (ع) في حضنه، والحسن (ع) آخذٌ بيده', withL='ومعه فاطمة (ع) وعليّ (ع)',
               amin='', aminRef='رسول الله ﷺ · الكشّاف للزمخشري، بما معناه',
               sonsN='الحسن (ع) · الحسين (ع)', womenN='فاطمة (ع)', selvesN='عليّ (ع)',
               mufassir='الزمخشري · الفخر الرازي · البيضاوي', mufassirSub='مفسّرون من أهل السنّة: المراد بأنفسنا عليّ (ع)',
               sat='', satRef='أبو حارثة · بما معناه',
               faces='', facesRef='أبو حارثة · في رواية',
               peace='', peaceRef='أبو حارثة',
               robes='الصلح: ألفا حُلّة كلَّ عام', jizya='يبقَون على دينهم، ويؤدّون الجزية', none='ولم تقع المباهلة أصلاً',
               muslim='صحيح مسلم', muslimSub='عن سعد بن أبي وقّاص · الحديث ٢٤٠٤', ahli='', ahliRef='رسول الله ﷺ · صحيح مسلم',
               kashshaf='الكشّاف', kashshafSub='الزمخشري', kisa='', kisaRef='الزمخشري · الكشّاف',
               date='٢٤ ذو الحجّة', dateSub='يوم المباهلة',
               brand='شيعة فويس', ask='لماذا اختار رسولُ الله ﷺ هؤلاء الأربعة وحدَهم؟ اكتبوا في التعليقات',
               next='غداً: آية التطهير', nextSub='الآية التي أعلنت طهارةَ بيتٍ واحد'),
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
