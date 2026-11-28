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
    'ur': dict(k0='امام علی (ع) اور بی بی فاطمہ (س)', title1='ایک بہت سادہ شادی', title2='امام علی (ع) اور بی بی فاطمہ (س) کی شادی',
               nasai='سنن نسائی · ۳۲۲۱', nasaiSub='بریدہ کی روایت', married='پھر علی نے رشتہ مانگا، اور آپ ﷺ نے شادی کر دی',
               ilam='اعلام الوریٰ · شیخ طبرسی', ilamSub='حیا کی وجہ سے کچھ کہہ نہ سکے', anything='کیا تمہارے پاس کچھ ہے؟', onlyArmour='میری زرہ کے سوا کچھ نہیں',
               objection='کچھ لوگوں نے اعتراض کیا', godGave='علی کی شادی فاطمہ سے میں نے نہیں کی، بلکہ اللہ نے کی ہے', yaqubi='تاریخِ یعقوبی',
               dawudSub='ابنِ عباس کی روایت', nasaiNo='۳۳۷۶', dirham='درہم · شیعہ روایات', sunna='امام رضا (ع): پانچ سو درہم · مہرِ سنت',
               sold='علی (ع) نے اپنا سامان بیچا', perfume='میری بیٹی کے لیے اچھی خوشبو خریدو', amali='امالی · شیخ طوسی', amaliSub='باقی رقم سے گھر کا سامان',
               things=['قمیص', 'چٹائی', 'چکی', 'تانبے کا برتن', 'لکڑی کا پیالہ', 'مشکیزہ'], more='اور چند اور چیزیں',
               nasai3384='سنن نسائی · ۳۳۸۴', jahhaz='اللہ کے نبی ﷺ نے فاطمہ کو جہیز میں ایک چادر، ایک مشکیزہ، اور اذخر سے بھرا تکیہ دیا', fromAli='امام علی (ع) کا بیان',
               date='دو ہجری · مشہور قول', dateSub='بحار الانوار: رخصتی، یکم ذی الحجہ', walima='ولیمہ: ایک بکری اور کچھ جو',
               dua='اللہ ان کے دلوں کو جوڑ دے، اور ان کی نسل میں برکت دے', haritha='حارثہ بن نعمان کا دیا ہوا گھر',
               brand='شیعہ وائس', ask='اس شادی میں آج ہماری شادیوں کے لیے سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں',
               next='کل: ولادت سے پہلے بی بی خدیجہ (س) کی تنہائی', nextSub='مکہ کی عورتیں نہ آئیں، اور پھر کمرہ نور سے بھر گیا'),
    'ar': dict(k0='الإمام علي (ع) وفاطمة الزهراء (ع)', title1='زواجٌ بسيطٌ جدّاً', title2='زواج الإمام علي وفاطمة الزهراء (ع)',
               nasai='سنن النسائي · ٣٢٢١', nasaiSub='عن بُريدة', married='ثمّ خطبها عليّ، فزوّجها منه',
               ilam='إعلام الورى · الطبرسي', ilamSub='منعه الحياء أن يتكلّم', anything='هل عندك شيء؟', onlyArmour='ليس عندي إلّا درعي',
               objection='واعترض بعضُ الناس', godGave='لستُ أنا الذي زوّجتُ عليّاً فاطمة، بل الله زوّجها إيّاه', yaqubi='تاريخ اليعقوبي · ما معناه',
               dawudSub='عن ابن عبّاس', nasaiNo='٣٣٧٦', dirham='درهم · روايات الشيعة', sunna='الإمام الرضا (ع): مهر السنّة خمسمئة درهم',
               sold='باع عليٌّ بعضَ متاعه', perfume='اشترِ لابنتي طيباً حسناً', amali='الأمالي · الشيخ الطوسي', amaliSub='وبالباقي متاعُ البيت',
               things=['قميص', 'حصير', 'رحى', 'طستٌ من نحاس', 'قدحٌ من خشب', 'قِربة'], more='وأشياءُ أخرى يسيرة',
               nasai3384='سنن النسائي · ٣٣٨٤', jahhaz='', fromAli='عن الإمام علي (ع)',
               date='السنة الثانية للهجرة · على المشهور', dateSub='بحار الأنوار: الزفاف في الأوّل من ذي الحجّة', walima='الوليمة: شاةٌ وشيءٌ من الشعير',
               dua='أن يؤلّف الله بين قلبيهما، ويبارك في ذرّيّتهما', haritha='بيتٌ قدّمه حارثة بن النعمان',
               brand='شيعة فويس', ask='ما أكبرُ درسٍ من هذا الزواج لأعراسنا اليوم؟ اكتبوا في التعليقات',
               next='غداً: وحدةُ السيّدة خديجة (ع) قبل الولادة', nextSub='لم تأتِها نساءُ مكّة، ثمّ امتلأت الغرفةُ نوراً'),
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
