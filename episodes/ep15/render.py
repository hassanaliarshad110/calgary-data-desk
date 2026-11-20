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
    'ur': dict(title1='قلم اور کاغذ', who='اللہ کے نبی ﷺ کی آخری خواہش · صحیح بخاری میں بھی',
               k1='گیارہ ہجری · جمعرات کا دن', last='زندگی کے آخری دن', ill='بیماری شدید ہو چکی تھی', near='کچھ اصحاب پاس موجود تھے',
               k2='آخری خواہش', req='«لکھنے کا سامان لاؤ، میں تمہارے لیے ایک تحریر لکھ دوں، جس کے بعد تم کبھی گمراہ نہ ہو گے»', reqRef='اللہ کے نبی ﷺ · صحیح بخاری، حدیث ۱۱۴',
               k3='«اللہ کی کتاب کافی ہے»', umar='«نبی پر درد کا غلبہ ہے۔ ہمارے پاس اللہ کی کتاب ہے، وہی ہمارے لیے کافی ہے»', umarRef='عمر · صحیح بخاری، حدیث ۱۱۴',
               bukhari='صحیح بخاری · حدیث ۱۱۴', bukhariTx='سنی کتاب · کتاب العلم',
               k4='اختلاف اور شور', noise='اختلاف ہوا، شور بڑھ گیا', hajar='«ان کا کیا حال ہے؟ کیا یہ ہذیان ہے؟ ان سے پوچھ لو!»', hajarRef='صحیح مسلم · حدیث ۱۶۳۷',
               k5='«میرے پاس سے اٹھ جاؤ»', rise='«میرے پاس سے اٹھ جاؤ، میرے سامنے جھگڑنا مناسب نہیں»', riseRef='اللہ کے نبی ﷺ · صحیح بخاری، حدیث ۱۱۴', never='وہ تحریر کبھی نہ لکھی گئی',
               k6='ابنِ عباس کے آنسو', thu='«جمعرات کا دن! اور کیا تھا وہ جمعرات کا دن!»', thuRef='صحیح مسلم ۱۶۳۷ · صحیح بخاری ۳۰۵۳', pebbles='آنسوؤں سے کنکریاں تر ہو جاتیں',
               raz='«سب سے بڑی مصیبت وہ تھی، جو اللہ کے نبی ﷺ اور ان کی تحریر کے درمیان حائل ہو گئی»', razRef='ابنِ عباس · صحیح بخاری، حدیث ۱۱۴',
               k7='وہ تحریر کیا تھی؟', shia='شیعہ علماء: امام علی (ع) کی خلافت کی تاکید', ihd='ابنِ ابی الحدید · شرحِ نہج البلاغہ', ihdTx='جلد ۱۲، ص ۲۰-۲۱ · عمر کا ابنِ عباس سے بیان',
               named='روایت: علی (ع) کو نامزد کرنا چاہتے تھے، عمر نے روکا',
               brand='شیعہ وائس', ask='اگر وہ تحریر لکھ دی جاتی، تو تاریخ کیسی ہوتی؟ کمنٹ میں لکھیں', next='کل: اویس قرنی، جس نے اللہ کے نبی ﷺ کو کبھی نہیں دیکھا'),
    'ar': dict(title1='القلم والقرطاس', who='الطلب الأخير لرسول الله ﷺ · في صحيح البخاري أيضاً',
               k1='سنة ١١ للهجرة · يوم الخميس', last='الأيّام الأخيرة من حياته ﷺ', ill='اشتدّ به الوجع', near='وعنده نفرٌ من الصحابة',
               k2='الطلب الأخير', req='ائْتُونِي بِكِتَابٍ أَكْتُبْ لَكُمْ كِتَاباً لَا تَضِلُّوا بَعْدَهُ', reqRef='رسول الله ﷺ · صحيح البخاري، الحديث ١١٤',
               k3='«حسبنا كتاب الله»', umar='إِنَّ النَّبِيَّ غَلَبَهُ الْوَجَعُ، وَعِنْدَنَا كِتَابُ اللَّهِ حَسْبُنَا', umarRef='عمر · صحيح البخاري، الحديث ١١٤',
               bukhari='صحيح البخاري · الحديث ١١٤', bukhariTx='كتاب العلم',
               k4='اختلافٌ ولَغَط', noise='فاختلفوا، وكثُر اللَّغَط', hajar='مَا شَأْنُهُ؟ أَهَجَرَ؟ اسْتَفْهِمُوهُ', hajarRef='صحيح مسلم · الحديث ١٦٣٧',
               k5='«قوموا عنّي»', rise='قُومُوا عَنِّي، وَلَا يَنْبَغِي عِنْدِي التَّنَازُعُ', riseRef='رسول الله ﷺ · صحيح البخاري، الحديث ١١٤', never='ولم يُكتَبْ ذلك الكتابُ أبداً',
               k6='دموع ابن عبّاس', thu='يَوْمُ الْخَمِيسِ، وَمَا يَوْمُ الْخَمِيسِ!', thuRef='صحيح مسلم ١٦٣٧ · صحيح البخاري ٣٠٥٣', pebbles='بكى حتّى بَلَّ دمعُه الحصى',
               raz='إِنَّ الرَّزِيَّةَ كُلَّ الرَّزِيَّةِ مَا حَالَ بَيْنَ رَسُولِ اللَّهِ ﷺ وَبَيْنَ كِتَابِهِ', razRef='ابن عبّاس · صحيح البخاري، الحديث ١١٤',
               k7='ماذا كان ذلك الكتاب؟', shia='علماء الشيعة: تأكيد خلافة الإمام عليّ (ع)', ihd='ابن أبي الحديد · شرح نهج البلاغة', ihdTx='ج ١٢، ص ٢٠-٢١ · خبر عمر لابن عبّاس',
               named='الرواية: أراد أن ينصّ على عليّ (ع)، فمنعه عمر',
               brand='شيعة فويس', ask='لو كُتب ذلك الكتاب، كيف كان سيكون التاريخ؟ اكتب في التعليقات', next='غداً: أُويس القَرَني، الذي لم يرَ رسول الله ﷺ'),
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
