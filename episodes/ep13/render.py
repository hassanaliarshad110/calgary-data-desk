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
    'ur': dict(title1='ایک اونٹ اور ایک خچر', who='اُمُّ المؤمنین عائشہ · جنگِ جمل اور جنازۂ امام حسن (ع)',
               k1='مکہ سے بصرہ', med='مدینہ', mak='مکہ', bas='بصرہ', umra='طلحہ اور زبیر: عمرے کی اجازت', joined='مکہ میں اُمُّ المؤمنین ساتھ ہو گئیں',
               blood='«عثمان کے خون کا بدلہ»', army='تقریباً ۳۰۰۰ کا لشکر',
               k2='حوأب کا پانی', ahmad='مسند احمد · حدیث ۲۴۲۵۴', ahmadTx='سنی کتاب · سند صحیح (ارناؤوط)',
               hawab='«تم میں سے کس پر حوأب کے کتے بھونکیں گے؟»', hawabRef='اللہ کے نبی ﷺ اپنی بیویوں سے · مسند احمد', onward='ساتھ والوں نے آگے بڑھنے پر آمادہ کیا',
               k3='جنگِ جمل', when='۳۶ ہجری · خُرَیبہ، بصرہ کے قریب', armored='زرہ پوش اونٹ، لشکر کے آگے', askar='اونٹ کا نام: عسکر',
               k4='جنگ کا انجام', thousands='ہزاروں مسلمان مارے گئے', wiki='روایات کے مطابق', k4b='مدینہ واپسی',
               brother='بھائی محمد بن ابی بکر: خبر گیری', honour='احترام کے ساتھ مدینہ', women='بصرہ کی عورتیں، مردانہ لباس میں',
               k5='چودہ سال بعد', poison='امام حسن (ع) کو زہر دیا گیا', will='«مجھے میرے نانا ﷺ کے پہلو میں دفن کرنا، مگر یہ کہ روکا جائے»', yaqubi='تاریخِ یعقوبی',
               drop='خون کا ایک قطرہ بھی نہ بہے',
               k6='جنازہ روکا گیا', marwan='مروان بن حکم · سعید بن عاص', myhouse='«یہ میرا گھر ہے، میں یہاں کسی کو دفن ہونے کی اجازت نہیں دیتی»',
               arrows='شیعہ روایات: جنازے سے ستّر تیر نکالے گئے',
               k7='ایک دن خچر پر', daySaying='«اے عائشہ! ایک دن خچر پر، اور ایک دن اونٹ پر!»', hanafiyya='محمد بن حنفیہ · روایات',
               k7b='جنت البقیع', kept='امام حسین (ع) نے وصیت پوری کی، لڑائی نہ ہونے دی', buried='دادی فاطمہ بنت اسد کے پہلو میں',
               athir='ابنِ اثیر · الکامل', dhahabi='ذہبی · تاریخ الاسلام', prevented='سنی کتب: نانا ﷺ کے پاس تدفین روک دی گئی',
               brand='شیعہ وائس', ask='تاریخ ان دو دنوں کو کیسے یاد رکھے؟ کمنٹ میں لکھیں', next='کل: اللہ کے نبی ﷺ کی آخری خواہش، قلم اور کاغذ'),
    'ar': dict(title1='جملٌ وبغلة', who='أمّ المؤمنين عائشة · حرب الجمل وجنازة الإمام الحسن (ع)',
               k1='من مكّة إلى البصرة', med='المدينة', mak='مكّة', bas='البصرة', umra='طلحة والزبير: استئذانٌ للعمرة', joined='في مكّة انضمّت أمّ المؤمنين',
               blood='«الثأر لدم عثمان»', army='جيشٌ من نحو ٣٠٠٠',
               k2='ماء الحوأب', ahmad='مسند أحمد · الحديث ٢٤٢٥٤', ahmadTx='إسناده صحيح (الأرناؤوط)',
               hawab='كَيْفَ بِإِحْدَاكُنَّ تَنْبَحُ عَلَيْهَا كِلَابُ الْحَوْأَبِ؟', hawabRef='رسول الله ﷺ · مسند أحمد', onward='دفعها مَن معها إلى المضيّ',
               k3='حرب الجمل', when='٣٦ للهجرة · الخُرَيبة قرب البصرة', armored='جملٌ مُدرَّعٌ أمام الجيش', askar='اسم الجمل: عسكر',
               k4='نهاية الحرب', thousands='قُتل آلافٌ من المسلمين', wiki='بحسب الروايات', k4b='العودة إلى المدينة',
               brother='أخوها محمّد بن أبي بكر يتفقّدها', honour='أُعيدت إلى المدينة باحترام', women='نسوةٌ من البصرة في ثياب الرجال',
               k5='بعد أربع عشرة سنة', poison='استُشهد الإمام الحسن (ع) مسموماً', will='ادْفِنُونِي إِلَى جَنْبِ جَدِّي ﷺ، إِلَّا أَنْ يُمْنَعَ ذَلِكَ', yaqubi='تاريخ اليعقوبي',
               drop='لا تُهراق في أمره قطرةُ دم',
               k6='مُنع الدفن', marwan='مروان بن الحكم · سعيد بن العاص', myhouse='هَذَا بَيْتِي، لَا آذَنُ فِيهِ لِأَحَدٍ',
               arrows='روايات شيعيّة: انتُزع من الجنازة سبعون سهماً',
               k7='يوماً على بغل', daySaying='يَا عَائِشَةُ، يَوْماً عَلَى بَغْلٍ، وَيَوْماً عَلَى جَمَلٍ!', hanafiyya='محمّد بن الحنفيّة · الروايات',
               k7b='البقيع', kept='حفظ الإمام الحسين (ع) الوصيّة ومنع القتال', buried='إلى جنب جدّته فاطمة بنت أسد',
               athir='ابن الأثير · الكامل', dhahabi='الذهبي · تاريخ الإسلام', prevented='كتب أهل السنّة: مُنع دفنه عند جدّه ﷺ',
               brand='شيعة فويس', ask='كيف ينبغي أن يذكر التاريخ هذين اليومين؟ اكتب في التعليقات', next='غداً: طلب رسول الله ﷺ الأخير، القلم والقرطاس'),
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
