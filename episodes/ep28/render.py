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
    'ur': dict(k0='صلحِ حدیبیہ · ۶ ہجری', title1='حدیبیہ: وہ لفظ، جو علی (ع) نے نہیں مٹایا',
               madinah='مدینہ', makkah='مکہ', hudaybiyya='حدیبیہ', k1='ذوالقعدہ ۶ ہجری · عمرے کا سفر',
               ihram='تقریباً ۱۴۰۰ اصحاب · احرام میں', camels='ستر قربانی کے اونٹ · تلواریں صرف نیام میں',
               blocked='قریش نے راستہ روک لیا', k2='قریش کا نمائندہ: سہیل بن عمرو',
               suhaylN='سہیل', aliN='علی (ع)',
               rahman='رحمٰن کو، خدا کی قسم، میں نہیں جانتا۔ یوں لکھو: باسمک اللّٰہم', rahmanRef='سہیل بن عمرو · صحیح بخاری',
               law='اگر ہم جانتے کہ آپ اللہ کے رسول ہیں، تو نہ آپ کو کعبہ سے روکتے، نہ آپ سے لڑتے', lawRef='سہیل بن عمرو · صحیح بخاری',
               inni='خدا کی قسم، میں اللہ کا رسول ہوں، چاہے تم مجھے جھٹلاؤ', inniRef='اللہ کے نبی ﷺ · صحیح بخاری',
               laamhah='خدا کی قسم، میں اسے کبھی نہیں مٹاؤں گا', laamhahRef='علی (ع) · صحیح بخاری، حدیث ۳۱۸۴',
               erased='اللہ کے نبی ﷺ نے اپنے ہاتھ سے مٹایا', 
               terms=['دس سال جنگ نہیں', 'اس سال واپسی، اگلے سال عمرہ', 'مکہ میں صرف تین دن، تلواریں نیام میں', 'قریش کا آدمی مسلمان ہو کر آئے، تو واپس'],
               jandalN='ابو جندل بن سہیل · زنجیروں میں', jandal='اے مسلمانو! کیا مجھے مشرکوں کو لوٹا دیا جائے گا؟ میں تو مسلمان ہو کر آیا ہوں', jandalRef='ابو جندل · صحیح بخاری',
               bukhari='صحیح بخاری · حدیث ۲۷۳۱', alasta='کیا آپ سچ مچ اللہ کے نبی نہیں؟ تو پھر ہم اپنے دین میں یہ ذلت کیوں قبول کریں؟', alastaRef='عمر · صحیح بخاری',
               nasiri='میں اللہ کا رسول ہوں، میں اس کی نافرمانی نہیں کرتا، اور وہی میرا مددگار ہے', nasiriRef='اللہ کے نبی ﷺ · صحیح بخاری',
               qumu='اٹھو، قربانی کرو، سر منڈواؤ', umm='تین بار کہنے پر بھی کوئی نہ اٹھا · ام سلمہ کا مشورہ', fathRef='سورۂ فتح · آیت ۱',
               brand='شیعہ وائس', ask='علی (ع) نے وہ لفظ مٹانے سے انکار کیوں کیا؟ کمنٹ میں لکھیں',
               next='کل: فتحِ مکہ', nextSub='جب کعبہ کے بت گرائے گئے'),
    'ar': dict(k0='صلح الحديبية · سنة ٦ هـ', title1='الحديبية: الكلمة التي لم يمحُها عليّ (ع)',
               madinah='المدينة', makkah='مكّة', hudaybiyya='الحديبية', k1='ذو القعدة ٦ هـ · سفر العمرة',
               ihram='نحو ١٤٠٠ من الأصحاب · مُحرِمين', camels='سبعون بَدَنة · والسيوف في أغمادها',
               blocked='منعتهم قريش', k2='مندوب قريش: سُهيل بن عمرو',
               suhaylN='سُهيل', aliN='عليّ (ع)',
               rahman='', rahmanRef='سُهيل بن عمرو · صحيح البخاري',
               law='', lawRef='سُهيل بن عمرو · صحيح البخاري',
               inni='', inniRef='رسول الله ﷺ · صحيح البخاري',
               laamhah='', laamhahRef='عليّ (ع) · صحيح البخاري، الحديث ٣١٨٤',
               erased='فمحاها رسولُ الله ﷺ بيده',
               terms=['لا حربَ عشرَ سنين', 'الرجوع هذا العام، والعمرة في العام المقبل', 'ثلاثة أيّام بمكّة، والسيوف في أغمادها', 'مَن جاء من قريش مسلماً رُدَّ إليهم'],
               jandalN='أبو جَندل بن سُهيل · في قيوده', jandal='', jandalRef='أبو جَندل · صحيح البخاري',
               bukhari='صحيح البخاري · الحديث ٢٧٣١', alasta='', alastaRef='عمر · صحيح البخاري',
               nasiri='', nasiriRef='رسول الله ﷺ · صحيح البخاري',
               qumu='قوموا فانحروا، ثمّ احلقوا', umm='ما قام منهم رجل حتّى قالها ثلاثاً · مشورة أمّ سلمة', fathRef='سورة الفتح · الآية ١',
               brand='شيعة فويس', ask='لماذا أبى عليٌّ (ع) أن يمحوَ تلك الكلمة؟ اكتبوا في التعليقات',
               next='غداً: فتح مكّة', nextSub='يوم سقطت أصنام الكعبة'),
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
