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
    'ur': dict(k0='سورۃ الکوثر', title1='انہوں نے کہا «ابتر»، اللہ نے جواب دیا: کوثر',
               qasim='قاسم', abdullah='عبداللہ', saad='ابنِ سعد · ابنِ عباس سے روایت', saadSub='پہلے قاسم دنیا سے گئے، پھر عبداللہ',
               majlis='قریش کی ایک محفل', said='اسے چھوڑو، اس کا کوئی بیٹا نہیں', wahidi='واحدی', ishaq='ابنِ اسحاق',
               three='صرف تین آیتیں', surahRef='سورۃ الکوثر · ۱۰۸: ۱-۳',
               muslim='صحیح مسلم · حدیث ۴۰۰', muslimSub='انس بن مالک کی روایت', nahr='کوثر ایک نہر ہے، جس کا میرے رب نے مجھ سے وعدہ کیا ہے، اس پر بہت خیر ہے', muslimRef='صحیح مسلم · ۴۰۰',
               good='بہت زیادہ خیر', meanings=['جنت کی نہر', 'حوضِ کوثر', 'نبوت', 'قرآن', 'شفاعت', 'کثیر نسل'],
               majma='مجمع البیان · طبرسی', majmaSub='یہ سب معنی درست ہو سکتے ہیں',
               shiaUl='کئی شیعہ علماء', mizanSub='علامہ طباطبائی', instance='کوثر کا ایک مصداق: بی بی فاطمہ (س) اور ان کی اولاد', laqab='کوثر: بی بی فاطمہ (س) کا ایک لقب',
               sadat='آج کئی ملکوں میں، سادات کے خاندان، اپنا سلسلہ بی بی فاطمہ (س) تک پہنچاتے ہیں', shaniRef='بے شک آپ کا دشمن ہی ابتر ہے · ۱۰۸: ۳',
               date='سورۃ الکوثر', dateSub='تین آیتیں · ایک طعنے کا جواب',
               brand='شیعہ وائس', ask='آپ کے خیال میں، کوثر کا کون سا معنی سب سے خوبصورت ہے؟ کمنٹ میں لکھیں',
               next='کل: بی بی فاطمہ (س) کا بابرکت ہار', nextSub='بھوکے کو کھانا، غریب کو کپڑا، غلام کو آزادی'),
    'ar': dict(k0='سورة الكوثر', title1='قالوا: «أبتر»، فأجاب الله: الكوثر',
               qasim='القاسم', abdullah='عبد الله', saad='ابن سعد · عن ابن عبّاس', saadSub='مات القاسم أوّلاً، ثمّ عبد الله',
               majlis='مجلسٌ من قريش', said='دعوه، فإنّه لا ولدَ له', wahidi='للواحدي', ishaq='ابن إسحاق',
               three='ثلاثُ آياتٍ فقط', surahRef='سورة الكوثر · ١٠٨: ١-٣',
               muslim='صحيح مسلم · ٤٠٠', muslimSub='عن أنس بن مالك', nahr='', muslimRef='صحيح مسلم · ٤٠٠',
               good='الخيرُ الكثير', meanings=['نهرٌ في الجنّة', 'الحوض', 'النبوّة', 'القرآن', 'الشفاعة', 'كثرةُ الذرّيّة'],
               majma='مجمع البيان · الطبرسي', majmaSub='كلُّ هذه المعاني يمكن أن تكون صحيحة',
               shiaUl='كثيرٌ من علماء الشيعة', mizanSub='العلّامة الطباطبائي', instance='من مصاديق الكوثر: فاطمة الزهراء (ع) وذرّيّتها', laqab='الكوثر: لقبٌ من ألقابها',
               sadat='واليوم، في بلدانٍ كثيرة، أُسَرٌ من السادة تنتسب إلى فاطمة (ع)', shaniRef='سورة الكوثر · ١٠٨: ٣',
               date='سورة الكوثر', dateSub='ثلاث آيات · جوابٌ على كلمة سخرية',
               brand='شيعة فويس', ask='أيُّ معاني الكوثر أجملُ عندكم؟ اكتبوا في التعليقات',
               next='غداً: عِقدُ فاطمة (ع) المبارك', nextSub='أطعم جائعاً، وكسا فقيراً، وأعتق عبداً'),
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
