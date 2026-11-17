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
    'ur': [('بی بی فاطمہ زہرا، سلام اللہ علیہا۔', 'بی بی فاطمہ زہرا (س)۔')],
    'ar': [('فاطمةُ الزهراء، عليها السلام.', 'فاطمةُ الزهراء (ع).')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='خطبۂ فدکیہ', q0='مسجدِ نبوی · خلیفہ، مہاجرین اور انصار کے سامنے', who='بی بی فاطمہ زہرا (س)',
               k1='فدک کے بعد', taken='فدک لے لیا گیا', masjid='تب: مسجدِ نبوی میں خطبہ', ihtijaj='الاحتجاج', shia='طبرسی · شیعہ',
               balagha='بلاغات النساء', sunni='ابنِ طیفور · سنی', oldest='سب سے پرانا ماخذ',
               k2='مسجد کی طرف', src2='الاحتجاج کے مطابق', hashim='بنی ہاشم کی خواتین کے ساتھ', walk='چال: اللہ کے نبی ﷺ جیسی',
               seated='ابوبکر · مہاجرین اور انصار', curtain='بی بی کے لیے پردہ لگایا گیا',
               k3='ایک آہ', sigh='پردے کے پیچھے سے ایک آہ', wept='پوری مسجد رونے لگی', risalat='اللہ کی حمد · بابا کی رسالت کا ذکر',
               k4='احکام کی حکمت', p1='ایمان ← شرک سے پاکیزگی', p2='نماز ← تکبر سے دوری', p3='عدل ← دلوں کا جوڑ', p4='اہلِ بیت کی امامت ← تفرقے سے امان',
               k5='«میں فاطمہ ہوں»', tr1='اے لوگو! جان لو، میں فاطمہ ہوں، اور میرے بابا محمد ﷺ ہیں',
               tr2='اے ابوقحافہ کے بیٹے! کیا اللہ کی کتاب میں ہے کہ تم باپ کے وارث بنو، اور میں نہ بنوں؟',
               k6='قرآن کی دلیلیں', r1='سورۂ نمل · ۱۶', r2='سورۂ مریم · ۶ (زکریا کی دعا)', r3='سورۂ انفال · ۷۵',
               tr3='اچھا فیصلہ کرنے والا اللہ، دعوے دار محمد ﷺ، وعدے کا دن قیامت',
               k7='جواب', claim='ابوبکر: انبیا کی میراث نہیں', tr4='میرے بابا، اللہ کی کتاب کے خلاف نہیں چلتے تھے',
               hujja='دلیل: قرآن', qadiyya='مقدمہ: اللہ کی عدالت میں',
               brand='شیعہ وائس', ask='اس خطبے کی کون سی بات آج سب سے اہم ہے؟ کمنٹ میں لکھیں', next='کل: بیت الاحزان · بقیع میں غم کا گھر'),
    'ar': dict(title1='الخطبة الفدكية', q0='المسجد النبوي · أمام الخليفة والمهاجرين والأنصار', who='فاطمة الزهراء (ع)',
               k1='بعد فدك', taken='أُخذت فدك', masjid='فخطبت في المسجد النبوي', ihtijaj='الاحتجاج', shia='الطبرسي · شيعي',
               balagha='بلاغات النساء', sunni='ابن طيفور · سنّي', oldest='أقدم مصادرها',
               k2='إلى المسجد', src2='في الاحتجاج', hashim='في نساءٍ من بني هاشم', walk='مِشيتُها مِشيةُ رسول الله ﷺ',
               seated='أبو بكر · في حشدٍ من المهاجرين والأنصار', curtain='فنِيطت دونها مُلاءة',
               k3='أنّة', sigh='أنّةٌ من خلف الستار', wept='أجهش القوم بالبكاء', risalat='حمدُ الله · ذكرُ رسالة أبيها',
               k4='حكمة الأحكام', p1='الإيمان ← تطهيرٌ من الشرك', p2='الصلاة ← تنزيهٌ عن الكِبر', p3='العدل ← تنسيقٌ للقلوب', p4='إمامتنا ← أمانٌ من الفُرقة',
               k5='«اعلموا أنّي فاطمة»', tr1='', tr2='',
               k6='حجّة القرآن', r1='النمل · ١٦', r2='مريم · ٦ (دعاء زكريّا)', r3='الأنفال · ٧٥', tr3='',
               k7='الجواب', claim='أبو بكر: الأنبياء لا يُورَثون', tr4='',
               hujja='الحجّة: القرآن', qadiyya='والقضيّة: عند الله',
               brand='شيعة فويس', ask='أيُّ كلمةٍ من هذه الخطبة الأهمّ اليوم؟ اكتب في التعليقات', next='غداً: بيت الأحزان · بيت الحزن في البقيع'),
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
