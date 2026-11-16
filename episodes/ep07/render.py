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
    'ur': [('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('امام علی، علیہ السلام۔', 'امام علی (ع)۔')],
    'ar': [('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('عليٌّ، عليه السلام.', 'عليٌّ (ع).')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup [[speaker|intensity|words]] -> «words»
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='ادھوری اذان', q0='مؤذن اللہ کے نبی ﷺ کے نام تک پہنچا… اور رک گیا', why='کیوں؟',
               k1='بلال حبشی', slave='مکہ کا ایک غلام', umayya='امیہ بن خلف کی اذیتیں · دھوپ اور بھاری پتھر', majah='سنن ابنِ ماجہ',
               k2='اسلام کا پہلا مؤذن', first='اللہ کے نبی ﷺ نے مؤذن بنایا', fath='فتحِ مکہ: کعبہ پر اذان',
               k3='مدینہ خاموش ہو گیا', never='«اللہ کے نبی ﷺ کے بعد کسی کے لیے اذان نہیں»', src3='من لا یحضرہ الفقیہ · ج ۱ ص ۲۹۸',
               ali='صرف وہی جسے اللہ کے نبی ﷺ نے جانشین بنایا: امام علی (ع)', src3b='شیعہ روایات',
               k4='بی بی فاطمہ (س) کی خواہش', wish='«میرا دل چاہتا ہے کہ اپنے بابا کے مؤذن کی آواز میں اذان سنوں»', began='بلال نے اذان شروع کی',
               k5='اذان', wept='بابا یاد آئے… بی بی (س) رونے لگیں', fell='بی بی (س) بے ہوش ہو کر گر پڑیں',
               k6='اذان رک گئی', stop='«بلال، رک جاؤ!»', unfinished='اذان پوری نہ ہوئی', faqih='من لا یحضرہ الفقیہ', faqref='شیخ صدوق · جلد ۱، صفحہ ۲۹۸',
               k7='معذرت… اور شام کا راستہ', fear='«اے عورتوں کی سردار، مجھے آپ کی حالت کا ڈر ہے»', excused='بی بی (س) نے معاف رکھا',
               sham='بلال مدینہ چھوڑ کر شام چلے گئے', grave='دمشق · باب الصغیر (مشہور روایت)',
               brand='شیعہ وائس', ask='بلال نے اذان دینا کیوں چھوڑ دیا؟ کمنٹ میں لکھیں', next='کل: ام ایمن'),
    'ar': dict(title1='الأذان الذي لم يكتمل', q0='بلغ المؤذّن اسمَ رسول الله ﷺ… فتوقّف', why='فلماذا؟',
               k1='بلال الحبشي', slave='عبدٌ في مكة', umayya='عذاب أميّة بن خلف · الشمس والصخرة', majah='سنن ابن ماجه',
               k2='أوّل مؤذّن في الإسلام', first='اختاره رسول الله ﷺ مؤذّناً', fath='يوم الفتح: الأذان على الكعبة',
               k3='وسكتت المدينة', never='«لا أؤذّن لأحدٍ بعد رسول الله ﷺ»', src3='من لا يحضره الفقيه · ج ١ ص ٢٩٨',
               ali='لا يقبل إلّا من نصّبه رسول الله ﷺ: الإمام علي (ع)', src3b='مصادر شيعية',
               k4='أمنية الزهراء (ع)', wish='«إنّي أشتهي أن أسمع صوت مؤذّن أبي بالأذان»', began='فأخذ بلال في الأذان',
               k5='الأذان', wept='ذكرت أباها… فلم تتمالك من البكاء', fell='شهقت وسقطت مغشيّاً عليها',
               k6='انقطع الأذان', stop='«أمسِك يا بلال!»', unfinished='ولم يُتمّه', faqih='من لا يحضره الفقيه', faqref='الشيخ الصدوق · ج ١ ص ٢٩٨',
               k7='فأعفته… وطريق الشام', fear='«يا سيّدة النسوان، إنّي أخشى عليكِ إذا سمعتِ صوتي بالأذان»', excused='فأعفته الزهراء (ع)',
               sham='وخرج بلال من المدينة إلى الشام', grave='دمشق · مقبرة باب الصغير (المشهور)',
               brand='شيعة فويس', ask='لماذا ترك بلالٌ الأذان؟ اكتب في التعليقات', next='غداً: أمّ أيمن'),
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
