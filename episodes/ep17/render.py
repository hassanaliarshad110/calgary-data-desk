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
    'ur': dict(title1='شبہائے پشاور', who='دس راتیں · ایک شیعہ عالم اور اہلِ سنت کے علماء',
               k1='سلطان الواعظین شیرازی', title='یعنی: واعظوں کے سلطان', born='تہران میں پیدا ہوئے · کربلا میں دینی تعلیم',
               india='تیس برس کی عمر میں · ہندوستان کا سفر', welcome='جہاں گئے، پرجوش استقبال',
               k2='پشاور کا سفر', teh='تہران', pes='پشاور', then='پشاور: اُس وقت ہندوستان · آج پاکستان',
               date='۲۳ رجب ۱۳۴۵ ھ · ۲۷ جنوری ۱۹۲۷', house='مرزا یعقوب علی خان قزلباش کا گھر',
               k3='آمنے سامنے', kabul='کابل کے دو مشہور علماء', names='حافظ محمد رشید · شیخ عبدالسلام',
               cond='صرف وہی حوالے، جو دونوں مسلکوں کو قبول ہوں', condRef='مناظرے کی شرط', farsi='زبان: فارسی · اُس وقت پشاور میں عام',
               k4='مجلس اور روداد', ppl='تقریباً دو سو لوگ · شیعہ اور سنی', four='چار رپورٹر گفتگو لکھتے', papers='اگلی صبح · پشاور کے مقامی اخبار',
               k5='کتاب کے مطابق · بڑے سوال', qs=['امامت کیا ہے؟', 'اللہ کے نبی ﷺ کے بعد خلافت کس کا حق تھا؟', 'حدیثِ ثقلین', 'حدیثِ منزلت'],
               night8='آٹھویں رات', fadak='فدک · بی بی فاطمہ (س) کا مقدمہ',
               k6='آخری رات', record='یہ روداد · شیعہ مصنف کی اپنی تحریر', last='مصنف کے بیان کے مطابق',
               six='مجلس کے چھ سنی معززین اور تاجروں نے، شیعہ مسلک اختیار کیا',
               k7='ایک روداد، ایک کتاب', fa='فارسی · سلطان الواعظین شیرازی', tehran='تہران میں چھپی · بار بار چھپتی رہی',
               urdu='اردو ترجمہ', arab='عربی: لیالیِ بیشاور',
               brand='شیعہ وائس', ask='کیا آج بھی ایسی گفتگو، احترام اور دلیل کے ساتھ ہو سکتی ہے؟ کمنٹ میں لکھیں', next='کل: اویس قرنی · جنہوں نے اللہ کے نبی ﷺ کو کبھی نہیں دیکھا'),
    'ar': dict(title1='ليالي بيشاور', who='عشرُ ليالٍ · عالمٌ شيعيٌّ وعلماءُ من أهل السنّة',
               k1='سلطان الواعظين الشيرازي', title='لقبُه: سلطانُ الواعظين', born='وُلد في طهران · ودرس في كربلاء',
               india='في الثلاثين من عمره · رحلةٌ إلى الهند', welcome='استُقبل بحفاوةٍ أينما ذهب',
               k2='الرحلةُ إلى بيشاور', teh='طهران', pes='بيشاور', then='بيشاور: يومها في الهند · واليوم في باكستان',
               date='٢٣ رجب ١٣٤٥ هـ · ٢٧ يناير ١٩٢٧', house='بيتُ ميرزا يعقوب علي خان قزلباش',
               k3='وجهاً لوجه', kabul='عالِمان معروفان من كابل', names='الحافظ محمد رشيد · الشيخ عبد السلام',
               cond='لا يُستشهَد إلّا بمصادر يقبلها الطرفان', condRef='شرطُ المناظرة', farsi='اللغة: الفارسيّة · المفهومة يومها في بيشاور',
               k4='المجلسُ والمحاضر', ppl='نحوُ مئتي شخص · من الشيعة والسنّة', four='أربعةُ مراسلين يدوّنون الحوار', papers='في الصباح التالي · الصحفُ المحلّيّة في بيشاور',
               k5='بحسب الكتاب · الأسئلةُ الكبرى', qs=['ما الإمامة؟', 'لمن كانت الخلافةُ بعد رسول الله ﷺ؟', 'حديثُ الثقلين', 'حديثُ المنزلة'],
               night8='الليلةُ الثامنة', fadak='فدك · واحتجاجُ السيّدة فاطمة (ع)',
               k6='الليلةُ الأخيرة', record='هذه الرواية · تدوينُ المؤلّف الشيعيّ نفسه', last='بحسب قول المؤلّف',
               six='اعتنق ستّةٌ من وجهاء أهل السنّة وتجّارهم في المجلس مذهبَ التشيّع',
               k7='محاضرُ صارت كتاباً', fa='بالفارسيّة · سلطان الواعظين الشيرازي', tehran='طُبع في طهران · وأُعيد طبعُه مراراً',
               urdu='بالأرديّة', arab='بالعربيّة: ليالي بيشاور',
               brand='شيعة فويس', ask='هل يمكن اليومَ حوارٌ كهذا، بالاحترام والدليل؟ اكتب في التعليقات', next='غداً: أُوَيْسٌ القَرَنيّ · الذي لم يرَ رسولَ الله ﷺ'),
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
