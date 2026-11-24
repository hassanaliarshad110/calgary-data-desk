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
    'ur': dict(k0='اُحد · تین ہجری', title1='جب لشکر بھاگ گیا، کون ڈٹا رہا؟',
               k1='شوال · تین ہجری', quraysh='قریش کا لشکر', muslims='اللہ کے نبی ﷺ کے ساتھ نکلے', left='کچھ لوٹ گئے · مقابلے پر سات سو',
               aynayn='جبلِ عینین · تیر انداز', jubayr='سردار: عبد اللہ بن جبیر', bukhari='صحیح بخاری', bukhariSub='غزوۂ اُحد · براء بن عازب کی روایت',
               order='اس جگہ کو مت چھوڑنا… اگر تم دیکھو کہ وہ ہم پر غالب آ رہے ہیں، تب بھی ہماری مدد کو نہ آنا', orderRef='اللہ کے نبی ﷺ · صحیح بخاری',
               booty='دشمن پیچھے ہٹا · مالِ غنیمت', reminded='عبد اللہ بن جبیر نے وعدہ یاد دلایا', refused='ساتھیوں نے انکار کر دیا',
               behind='خالد بن ولید اور عکرمہ بن ابی جہل · پیچھے سے حملہ',
               cry='ایک پکار: اللہ کے نبی ﷺ شہید ہو گئے؟', verseRef='سورۂ آلِ عمران · آیت ایک سو تریپن',
               mufid='شیخ مفید', mufidSub='عبد اللہ بن مسعود کی روایت', onlyAli='صرف علی (ع) اللہ کے نبی ﷺ کے پاس رہے',
               returned='پھر کچھ لوگ لوٹ آئے', names=['عاصم بن ثابت', 'ابو دجانہ', 'سہل بن حنیف'],
               tabari='تاریخِ طبری', tabariSub='ابو رافع کی روایت', charge='ان پر حملہ کرو', again='دوسرا گروہ · پھر وہی حکم',
               jib1='علی کی فدا کاری کیسی عظیم ہے!', jibRef='جبرائیل · مفہوم · طبری، ابو رافع سے', minni='وہ مجھ سے ہے، اور میں اس سے ہوں', nabi='اللہ کے نبی ﷺ',
               minkuma='اور میں آپ دونوں سے ہوں', jibName='جبرائیل', fataRef='علی جیسا کوئی جوان نہیں، ذوالفقار جیسی کوئی تلوار نہیں',
               close1='جب لشکر بھاگ گیا، علی (ع) ڈٹے رہے',
               brand='شیعہ وائس', ask='آپ کے خیال میں، اُحد کا سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں', next='کل: خندق · علی (ع) اور عمرو بن عبدِ وُد'),
    'ar': dict(k0='أُحُد · سنة ٣ هـ', title1='حين فرّ الجيش، مَن ثبت؟',
               k1='شوّال · سنة ثلاثٍ للهجرة', quraysh='جيش قريش', muslims='خرجوا مع رسول الله ﷺ', left='رجع بعضهم · بقي سبعُمئة',
               aynayn='جبل عَيْنَيْن · الرماة', jubayr='أميرهم: عبد الله بن جُبَيْر', bukhari='صحيح البخاري', bukhariSub='غزوة أُحُد · عن البراء بن عازب',
               order='', orderRef='رسول الله ﷺ · صحيح البخاري',
               booty='انهزم المشركون · الغنيمة', reminded='ذكّرهم عبد الله بن جُبَيْر بالعهد', refused='فأبى أصحابُه',
               behind='خالد بن الوليد وعِكرمة بن أبي جهل · من الخلف',
               cry='صرخ صارخ: قُتل محمّد!', verseRef='سورة آل عمران · الآية ١٥٣',
               mufid='الشيخ المفيد', mufidSub='عن عبد الله بن مسعود', onlyAli='لم يبقَ يحميه إلّا عليٌّ (ع)',
               returned='ثمّ عاد إليه نفرٌ', names=['عاصم بن ثابت', 'أبو دُجانة', 'سهل بن حُنَيْف'],
               tabari='تاريخ الطبري', tabariSub='عن أبي رافع', charge='احمِل عليهم', again='جماعةٌ أخرى · فحمل عليٌّ مرّةً أخرى',
               jib1='', jibRef='جبرائيل · ما معناه · الطبري عن أبي رافع', minni='', nabi='رسول الله ﷺ',
               minkuma='', jibName='جبرائيل', fataRef='صوتٌ سُمع يوم أُحُد',
               close1='حين فرّ الجيش، ثبت عليٌّ (ع)',
               brand='شيعة فويس', ask='برأيكم، ما أعظمُ درسٍ من يوم أُحُد؟ اكتبوا في التعليقات', next='غداً: الخندق · عليٌّ (ع) وعمرو بن عبد وُدّ'),
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
