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
    'ur': dict(k0='شیعہ روایت · جابر بن عبد اللہ انصاری', title1='ایک چادر، پانچ ہستیاں، اور ایک فرشتہ',
               jabir='جابر بن عبد اللہ انصاری', jabirSub='بی بی فاطمہ (س) سے روایت', nabi='اللہ کے نبی ﷺ',
               yamani='میں اپنے بدن میں کمزوری محسوس کر رہا ہوں۔ یمنی چادر لاؤ، اور مجھے اس سے ڈھانپ دو',
               hasan='امام حسن (ع)', fragrance='اماں، مجھے آپ کے پاس ایک پاکیزہ خوشبو آ رہی ہے، جیسے میرے نانا، اللہ کے نبی ﷺ کی خوشبو', hasanRef='امام حسن (ع)',
               husayn='امام حسین (ع)', same='انہوں نے بھی یہی کہا',
               ali='امیر المومنین علی (ع)', aliQ='جیسے میرے بھائی اور چچا زاد، اللہ کے نبی ﷺ کی خوشبو', aliRef='امیر المومنین علی (ع)',
               fatima='بی بی فاطمہ (س)', five='ایک چادر کے نیچے، پانچ ہستیاں',
               ends='چادر کے دونوں کنارے · آسمان کی طرف اشارہ',
               dua='اے اللہ، یہ میرے اہلِ بیت ہیں۔ ان کا گوشت میرا گوشت ہے، اور ان کا خون میرا خون…',
               khalaq='میں نے یہ آسمان، یہ زمین، یہ روشن چاند اور چمکتا سورج… صرف ان پانچ کی محبت میں پیدا کیے ہیں، جو اس چادر کے نیچے ہیں', khalaqRef='مفہوم · حدیثِ کساء، شیعہ روایت',
               who='جبرائیل: چادر کے نیچے کون ہیں؟', hum='وہ نبوت کا گھرانہ، اور رسالت کا خزانہ ہیں: فاطمہ، ان کے بابا، ان کے شوہر، اور ان کے دو بیٹے', humRef='حدیثِ کساء · شیعہ روایت',
               jibril='جبرائیل', sixth='ان کے ساتھ چھٹا', verseRef='سورۂ احزاب · آیت تینتیس',
               muslim='صحیح مسلم', muslimSub='ام المومنین عائشہ کی روایت', mirtRef='کالے بالوں کی دھاری دار چادر',
               tirmidhi='جامع ترمذی', tirmidhiSub='آیت ام المومنین ام سلمہ کے گھر میں اتری', umm='اے اللہ کے نبی، کیا میں بھی ان کے ساتھ ہوں؟', ummRef='ام سلمہ',
               makan='تم اپنی جگہ پر ہو، اور تم خیر پر ہو',
               close1='جہاں یہ واقعہ بیان ہو، وہاں رحمت اترتی ہے',
               brand='شیعہ وائس', ask='کیا آپ کے گھر میں حدیثِ کساء پڑھی جاتی ہے؟ کمنٹ میں بتائیں', next='کل: مباہلہ', nextSub='اپنے بیٹے، اپنی عورتیں، اپنے نفس · اللہ کے نبی ﷺ یہی چار ہستیاں لائے'),
    'ar': dict(k0='الرواية الشيعية · جابر بن عبد الله الأنصاري', title1='كساءٌ واحد، وخمسة، ومَلَك',
               jabir='جابر بن عبد الله الأنصاري', jabirSub='عن السيّدة فاطمة الزهراء (ع)', nabi='رسول الله ﷺ',
               yamani='', hasan='الإمام الحسن (ع)', fragrance='', hasanRef='الإمام الحسن (ع)',
               husayn='الإمام الحسين (ع)', same='وقال مثلَ ذلك',
               ali='أمير المؤمنين عليّ (ع)', aliQ='', aliRef='أمير المؤمنين عليّ (ع)',
               fatima='السيّدة فاطمة (ع)', five='خمسةٌ تحت كساءٍ واحد',
               ends='أخذ بطرفَي الكساء · وأومأ إلى السماء', dua='',
               khalaq='', khalaqRef='حديث الكساء · الرواية الشيعية',
               who='جبرائيل: مَن تحت الكساء؟', hum='', humRef='حديث الكساء · الرواية الشيعية',
               jibril='جبرائيل', sixth='ليكون معهم سادساً', verseRef='سورة الأحزاب · الآية ٣٣',
               muslim='صحيح مسلم', muslimSub='عن أمّ المؤمنين عائشة', mirtRef='صحيح مسلم',
               tirmidhi='سنن الترمذي', tirmidhiSub='نزلت في بيت أمّ المؤمنين أمّ سلمة', umm='', ummRef='أمّ سلمة',
               makan='',
               close1='حيثما ذُكر هذا الخبر، نزلت الرحمة',
               brand='شيعة فويس', ask='هل يُقرأ حديث الكساء في بيتكم؟ اكتبوا في التعليقات', next='غداً: المباهلة', nextSub='أبناءَنا ونساءَنا وأنفسَنا · خرج رسول الله ﷺ بهؤلاء الأربعة'),
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
