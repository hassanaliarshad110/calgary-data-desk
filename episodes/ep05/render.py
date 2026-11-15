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
    'ur': [('فاطمہ، سلام اللہ علیہا،', 'فاطمہ (س)'), ('علی، علیہ السلام،', 'علی (ع)'), ('صادق، علیہما السلام،', 'صادق (ع)')],
    'ar': [('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('عليّاً، عليه السلام،', 'عليّاً (ع)'), ('عليٌّ، عليه السلام،', 'عليٌّ (ع)'), ('والصادقُ، عليهما السلام.', 'والصادقُ (ع).')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup [[speaker|intensity|words]] -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='اسماء بنتِ عمیس', q0='شادی کی رات دروازے پر… اور آخری رات بھی ساتھ', why='یہ خاتون کون تھیں؟',
               k1='اسماء بنتِ عمیس', tribe='قبیلۂ خثعم', early='جعفر بن ابی طالب کے ساتھ — شروع کے مسلمان', hijra='ہجرت: حبشہ',
               sons=['عبداللہ', 'محمد', 'عون'],
               k2='شادی کی رات — ایک روایت', books2a='المعجم الکبیر — طبرانی · مصنف عبدالرزاق', books2b='مستدرکِ حاکم · کشف الغمہ',
               doubt='محققین: بعید ہے — شادی ۲ ہجری میں، اسماء تب حبشہ میں',
               k3='حبشہ سے واپسی کے بعد', tl=[['۷ ہجری', 'مدینہ واپسی'], ['۸ ہجری', 'جعفر — جنگِ موتہ میں شہید'], ['۱۱ ہجری', 'اللہ کے نبی ﷺ کی آخری بیماری']],
               k4='بی بی فاطمہ (س) کی بیماری', fear='«کھلے تختے پر سب کے سامنے؟»', habasha='«حبشہ میں ڈھکا ہوا جنازہ دیکھا ہے»', palms='کھجور کی تازہ شاخیں · مستدرکِ حاکم',
               smile='بی بی (س) مسکرا دیں', never='بابا کے بعد، اس دن کے سوا، کبھی مسکراتے نہیں دیکھا گیا', src5='مستدرکِ حاکم',
               k6='آخری رات', ghusl='امام علی (ع) کے ساتھ غسل میں', src6a='الاستیعاب — ابنِ عبدالبر', few='رات کے جنازے میں چند لوگ', src6b='انساب الاشراف — بلاذری',
               k7='اہلِ بیت (ع) کے ساتھ ساتھ', yahya='امام علی (ع) سے نکاح · بیٹے یحییٰ', praise7='امام باقر (ع) اور امام صادق (ع) کی تعریف', src7='رجالِ کشی · الخصال — شیخ صدوق',
               abys='حبشہ', madina='مدینہ',
               brand='شیعہ وائس', ask='اسماء کی وہ چھوٹی سی خدمت اتنی بڑی کیوں تھی؟ کمنٹ میں لکھیں', next='کل: بلال کی آخری اذان'),
    'ar': dict(title1='أسماء بنت عُمَيس', q0='على الباب ليلةَ الزفاف… ومعها في الليلة الأخيرة', why='فمَن هذه المرأة؟',
               k1='أسماء بنت عُمَيس', tribe='من قبيلة خَثْعَم', early='أسلمت مع جعفر بن أبي طالب — من الأوائل', hijra='الهجرة: الحبشة',
               sons=['عبد الله', 'محمد', 'عَون'],
               k2='ليلة الزفاف — رواية', books2a='المعجم الكبير — الطبراني · مصنّف عبد الرزاق', books2b='المستدرك للحاكم · كشف الغمّة',
               doubt='باحثون: مستبعد — الزفاف سنة ٢ هـ، وأسماء يومئذٍ في الحبشة',
               k3='بعد العودة من الحبشة', tl=[['٧ هـ', 'العودة إلى المدينة'], ['٨ هـ', 'استشهاد جعفر في مؤتة'], ['١١ هـ', 'مرض رسول الله ﷺ الأخير']],
               k4='مرض الزهراء (ع)', fear='«أُحمَل على السرير ظاهرة؟»', habasha='«رأيتُ في الحبشة نعشاً»', palms='جريد النخل الرطب · المستدرك',
               smile='تبسّمت الزهراء (ع)', never='ما رُئيت متبسّمةً بعد أبيها إلّا يومئذٍ', src5='المستدرك للحاكم',
               k6='الليلة الأخيرة', ghusl='شاركت الإمام عليّاً (ع) في غُسلها', src6a='الاستيعاب — ابن عبد البرّ', few='من القلائل في التشييع ليلاً', src6b='أنساب الأشراف — البلاذري',
               k7='إلى جانب أهل البيت (ع)', yahya='زواجها من الإمام علي (ع) · يحيى', praise7='أثنى عليها الباقر (ع) والصادق (ع)', src7='رجال الكشّي · الخصال للصدوق',
               abys='الحبشة', madina='المدينة',
               brand='شيعة فويس', ask='لماذا كانت تلك الخدمة الصغيرة عظيمة؟ اكتب في التعليقات', next='غداً: أذان بلال الأخير'),
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
