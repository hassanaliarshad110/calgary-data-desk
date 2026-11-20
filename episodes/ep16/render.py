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
    'ur': dict(title1='جنگِ جمل', who='مسلمانوں کی پہلی خانہ جنگی · اور امام علی (ع) کا طریقہ',
               k1='۳۶ ہجری · ایک روایت: ۱۰ جمادی الثانی', med='مدینہ', bas='بصرہ', broke='طلحہ اور زبیر نے بیعت توڑ دی', army='بصرہ میں ایک لشکر جمع تھا', n700='امام علی (ع) · صرف سات سو ساتھیوں کے ساتھ',
               k2='جنگ روکنے کی کوششیں', letters='خط: طلحہ، زبیر، اور اُمُّ المؤمنین کو', envoys='سفیر: ابنِ عباس اور صعصعہ بن صوحان',
               orders=['جنگ میں پہل نہ کریں', 'کسی زخمی کو قتل نہ کریں', 'اجازت کے بغیر کسی گھر میں داخل نہ ہوں'],
               k3='زبیر کو یاد دہانی', zub='«زبیر! تمہیں اللہ کی قسم، کیا تم نے اللہ کے نبی ﷺ کو یہ کہتے نہیں سنا، کہ تم مجھ سے جنگ کرو گے، اور تم مجھ پر ظلم کرنے والے ہو گے؟»',
               zubRef='امام علی (ع) · سنی کتاب: المستدرک حاکم، حدیث ۵۵۷۷', reply='زبیر: «ہاں، مگر میں بھول گیا تھا»', left='میدان چھوڑا · وادی السباع میں قتل',
               k4='قرآن کی دعوت', youth='قبیلۂ عبدالقیس کا ایک نوجوان، ہاتھ میں قرآن', baladhuri='بلاذری · انساب الاشراف', bTx37='جلد ۳، ص ۳۷', bTx43='جلد ۳، ص ۴۳', bTx57='جلد ۳، ص ۵۷',
               shot='تیر برسائے گئے، وہ شہید ہو گیا', advance='تب امام (ع) نے آگے بڑھنے کا حکم دیا',
               k5='جنگ شروع', marwan='مروان بن حکم کا تیر، پیچھے سے طلحہ پر', mq='«میں نے تمہارے باپ کے قاتلوں میں سے ایک کو مار دیا ہے»', mqRef='مروان، عثمان کے بیٹے ابان سے',
               k6='اونٹ', armored='اُمُّ المؤمنین · زرہ پوش اونٹ پر', order='امام (ع) کا حکم: اونٹ کی کونچیں کاٹ دی جائیں', ended='اور خون ریزی ختم ہوئی', ropes='محمد بن ابی بکر نے کجاوے کی رسیاں کاٹیں',
               k7='جنگ کے دوران اور فتح کے بعد', mercy=['بھاگنے والے کا پیچھا نہ کیا جائے', 'ہتھیار ڈالنے والے سے نہ لڑا جائے', 'کسی عورت یا بچے کو غلام نہ بنایا جائے'],
               heirs='مقتول مخالفوں کا مال · ان کے وارثوں کو',
               brand='شیعہ وائس', ask='امام علی (ع) کے ان احکام میں، آج کے لیے سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں', next='کل: «فاطمہ میرا ٹکڑا ہے» · سنی کتابوں میں بھی'),
    'ar': dict(title1='حربُ الجمل', who='أوّلُ حربٍ أهليّةٍ بين المسلمين · وطريقةُ الإمام عليّ (ع)',
               k1='سنة ٣٦ للهجرة · في رواية: ١٠ جمادى الآخرة', med='المدينة', bas='البصرة', broke='نكث طلحةُ والزبيرُ البيعة', army='جيشٌ مجتمعٌ في البصرة', n700='الإمام عليّ (ع) · في سبعمئةٍ فقط',
               k2='محاولاتُ منعِ الحرب', letters='كتب: إلى طلحة والزبير وأمّ المؤمنين', envoys='الرسل: ابن عبّاس وصعصعة بن صوحان',
               orders=['ألّا يبدؤوا القتال', 'ألّا يقتلوا جريحاً', 'ألّا يدخلوا داراً إلّا بإذن'],
               k3='تذكيرُ الزبير', zub='نَشَدْتُكَ بِاللهِ يا زبير، أما سمعتَ رسولَ الله ﷺ يقول: إنّك تُقاتلُني وأنتَ لي ظالم؟',
               zubRef='الإمام عليّ (ع) · المستدرك للحاكم، الحديث ٥٥٧٧', reply='الزبير: «بلى، ولكنّي نسيت»', left='ترك الميدان · قُتل في وادي السِّباع',
               k4='الدعوةُ إلى القرآن', youth='شابٌّ من عبد القيس، بيده مصحف', baladhuri='البلاذري · أنساب الأشراف', bTx37='ج ٣، ص ٣٧', bTx43='ج ٣، ص ٤٣', bTx57='ج ٣، ص ٥٧',
               shot='رُمي بالسهام حتّى استُشهد', advance='عندها أمر الإمام (ع) بالتقدّم',
               k5='بدأت الحرب', marwan='سهمُ مروان بن الحكم في طلحة، من خلفه', mq='لقد قتلتُ واحداً من قتلةِ أبيك', mqRef='مروان لأبانَ بنِ عثمان',
               k6='الجمل', armored='أمّ المؤمنين · على جملٍ مُدرَّع', order='أمر الإمام (ع) بعقر الجمل', ended='وبذلك توقّف سفكُ الدماء', ropes='قطع محمّد بن أبي بكر حبالَ الهودج',
               k7='في أثناء الحرب وبعد النصر', mercy=['لا يُتبَعُ مُدبِر', 'لا يُقاتَلُ مَن ألقى سلاحه', 'لا تُسبى امرأةٌ ولا طفل'],
               heirs='أموالُ القتلى من خصومه · تُردّ إلى ورثتهم',
               brand='شيعة فويس', ask='ما أعظمُ درسٍ لنا اليوم في أوامر الإمام عليّ (ع)؟ اكتب في التعليقات', next='غداً: «فاطمةُ بَضعةٌ منّي» · في كتب أهل السنّة أيضاً'),
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
