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
    'ur': dict(k0='مدینہ · کربلا کے بعد', hookQ='حسین کا کیا ہوا؟', riwayat='روایت', title1='وفات کی یاد · تیرہ جمادی الثانی',
               kilab='فاطمہ بنت حزام · قبیلہ بنی کلاب', wife='امام علی (ع) کی زوجہ',
               sons=['عباس', 'عبداللہ', 'جعفر', 'عثمان'],
               k2='کربلا', inMadinah='وہ مدینہ میں تھیں، کربلا میں نہیں', maqatil='مقاتل الطالبیین', isfahani='ابو الفرج اصفہانی · چاروں بیٹے امام حسین (ع) کے ساتھ شہید',
               k3='اسیروں کا قافلہ شام سے مدینہ لوٹا', bashir='امام زین العابدین (ع) نے بشیر بن جذلم کو آگے بھیجا',
               luhuf='اللہوف', luhufSub='سید ابن طاؤس · مسجدِ نبوی میں اعلان', luhufRef='بشیر بن جذلم · اللہوف',
               yathrib='اے اہلِ یثرب، اب یہاں تمہارا ٹھہرنا نہیں۔ حسین قتل کر دیے گئے، اور میری آنکھوں سے آنسو بہہ رہے ہیں',
               women='اللہوف: ہر پردہ دار خاتون روتی ہوئی گھر سے نکل آئی', sonsNews='کسی نے بیٹوں کی شہادت کی خبر دی', tellMe='مجھے حسین کے بارے میں بتاؤ',
               ransom='کاش میرے بچے، اور دنیا کی ہر چیز، حسین پر قربان ہو جاتی، اور وہ زندہ رہتے', firstGrief='چار بیٹے کھوئے · پہلا غم حسین',
               elegy='اے وہ، جس نے عباس کو دشمن کے لشکر پر حملہ کرتے دیکھا… میرے بیٹے کے سر پر وار ہوا، جب اس کے ہاتھ کٹ چکے تھے',
               grandson='ہر روز جنت البقیع · پوتے عبید اللہ بن عباس کے ساتھ', wept='ان کے مرثیے سن کر لوگ رو پڑتے',
               date='تیرہ جمادی الثانی · چونسٹھ ہجری', dateSub='صحیح تاریخ کتابوں میں درج نہیں · اس دن یاد منائی جاتی ہے',
               buried='جنت البقیع میں دفن', imams='امام حسن، امام زین العابدین، امام باقر، امام جعفر صادق (ع) کے قریب', ziyara='آج بھی زیارت گاہ',
               close1='جس ماں نے چار بیٹے کربلا کو دیے',
               brand='شیعہ وائس', ask='ام البنین (س) کی وفا کا سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں', next='کل: حدیثِ کساء · ایک چادر کے نیچے پانچ'),
    'ar': dict(k0='المدينة · بعد كربلاء', hookQ='', riwayat='رواية', title1='ذكرى الوفاة · الثالث عشر من جمادى الآخرة',
               kilab='فاطمة بنت حِزام · من بني كِلاب', wife='زوجة الإمام عليّ (ع)',
               sons=['العبّاس', 'عبد الله', 'جعفر', 'عثمان'],
               k2='كربلاء', inMadinah='كانت في المدينة، لا في كربلاء', maqatil='مقاتل الطالبيّين', isfahani='أبو الفرج الأصفهانيّ · استُشهد الأربعة مع الحسين (ع)',
               k3='عودة السبايا من الشام إلى المدينة', bashir='الإمام زين العابدين (ع) يرسل بشير بن جَذْلَم قبل الركب',
               luhuf='اللهوف', luhufSub='السيّد ابن طاووس · النعي في المسجد النبويّ', luhufRef='بشير بن جَذْلَم · اللهوف',
               yathrib='',
               women='اللهوف: لم تبقَ مخدَّرةٌ إلّا خرجت باكية', sonsNews='أخبرها أحدٌ باستشهاد أبنائها', tellMe='',
               ransom='ليت أبنائي وكلَّ ما في الدنيا كانوا فداءً للحسين، وبقي حيّاً', firstGrief='فقدت أربعة أبناء · وكان حزنها الأوّل على الحسين',
               elegy='يا مَن رأى العبّاسَ يحمل على جموع الأعداء… أُنبئتُ أنّ ابني أُصيب برأسه، وقد قُطعت يداه',
               grandson='كلَّ يومٍ إلى البقيع · مع حفيدها عُبَيد الله بن العبّاس', wept='فيبكي الناسُ لرثائها',
               date='الثالث عشر من جمادى الآخرة · ٦٤ هـ', dateSub='لا تذكر الكتب يوماً محدّداً · تُحيا الذكرى في هذا اليوم',
               buried='مدفونة في البقيع', imams='قرب الإمام الحسن والسجّاد والباقر والصادق (ع)', ziyara='وما زال قبرُها مزاراً',
               close1='أمٌّ قدّمت أربعة أبناء في كربلاء',
               brand='شيعة فويس', ask='ما أعظمُ درسٍ من وفاء أمّ البنين (ع)؟ اكتبوا في التعليقات', next='غداً: حديث الكساء · خمسةٌ تحت كساءٍ واحد'),
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
