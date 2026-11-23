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
    'ur': dict(k0='مکہ · صفا کے قریب', title1='اللہ کے نبی ﷺ کے چچا · اللہ کا شیر',
               am='عبد المطلب', abd='عبد اللہ', hamzaN='حمزہ', nabi='اللہ کے نبی ﷺ',
               thuwayba='بعض روایات: ثُوَیبہ نے دونوں کو دودھ پلایا', older='عمر میں کم از کم دو سال بڑے',
               hisham='سیرتِ ابنِ ہشام', hishamSub='ابو جہل کی توہین · صفا کے قریب', hunt='شکار سے واپسی',
               declare='میں بھی انہی کے دین پر ہوں',
               k3a='شعبِ ابی طالب کا محاصرہ', k3b='بدر', front='دشمن کے سب سے قریب · پہلی صف',
               sent='امام علی (ع) اور عبیدہ بن حارث کے ساتھ · قریش کے سرداروں کے مقابلے پر',
               k4='شوال · تین ہجری · اُحد', bukhari='صحیح بخاری', bukhariSub='وحشی کی اپنی روایت',
               promise='اگر تم نے میرے چچا کے بدلے حمزہ کو قتل کیا، تو تم آزاد ہو', jubayr='جبیر بن مطعم · صحیح بخاری',
               k5='اُحد', rock='چٹان کی اوٹ سے · ایک نیزہ', martyr='اللہ کا شیر شہید ہو گیا',
               k6='اللہ کے نبی ﷺ رو پڑے', first='شہیدوں میں سب سے پہلے · نمازِ جنازہ', master='شہیدوں کے سردار',
               majah='سنن ابن ماجہ', majahSub='انصار کی عورتیں اپنے شہیدوں پر رو رہی تھیں',
               nobody='لیکن حمزہ پر رونے والا کوئی نہیں', wept='تب انصار کی عورتیں حمزہ پر رونے لگیں',
               saad='طبقاتِ ابنِ سعد', saadSub='روایت: بی بی فاطمہ (س) ان کی قبر پر جاتیں',
               close1='جس نے مکہ میں اللہ کے نبی ﷺ کا دفاع کیا',
               brand='شیعہ وائس', ask='جنابِ حمزہ کی زندگی کا سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں', next='کل: اُحد · جب لشکر بھاگا، کون ڈٹا رہا؟'),
    'ar': dict(k0='مكّة · عند الصفا', title1='عمُّ رسول الله ﷺ · أسدُ الله',
               am='عبد المطّلب', abd='عبد الله', hamzaN='حمزة', nabi='رسول الله ﷺ',
               thuwayba='في بعض الروايات: أرضعتهما ثُوَيْبة', older='أكبرُ منه بسنتين على الأقلّ',
               hisham='سيرة ابن هشام', hishamSub='أبو جهل يشتم رسول الله ﷺ عند الصفا', hunt='عائداً من الصيد',
               declare='وأعلن أنّه على دينه',
               k3a='حصار شِعب أبي طالب', k3b='بدر', front='في الصفّ الأقرب إلى العدوّ',
               sent='مع الإمام عليّ (ع) وعُبَيْدة بن الحارث · لمبارزة سادة قريش',
               k4='شوّال · السنة الثالثة · أُحُد', bukhari='صحيح البخاريّ', bukhariSub='روايةُ وحشيٍّ بنفسه',
               promise='', jubayr='جُبَيْر بن مُطْعِم · صحيح البخاريّ',
               k5='أُحُد', rock='من تحت صخرة · حربة', martyr='استُشهد أسدُ الله',
               k6='بكى رسولُ الله ﷺ', first='صلّى عليه أوّلاً · قبل سائر الشهداء', master='حمزةُ بنُ عبد المطّلب',
               majah='سنن ابن ماجه', majahSub='نساءُ الأنصار يبكين قتلاهنّ يوم أُحُد',
               nobody='', wept='فجاءت نساءُ الأنصار يبكين حمزة',
               saad='طبقات ابن سعد', saadSub='يُروى: كانت فاطمة الزهراء (ع) تزور قبرَه',
               close1='الذي دافع عن رسول الله ﷺ في مكّة',
               brand='شيعة فويس', ask='ما أعظمُ درسٍ من حياة حمزة؟ اكتبوا في التعليقات', next='غداً: أُحُد · مَن ثبت حين فرّ الجيش؟'),
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
