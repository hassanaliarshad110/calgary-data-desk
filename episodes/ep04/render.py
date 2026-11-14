"""Render a Shia Voice episode.
usage: python3 render.py <lang> <audio_dir> preview <scene>:<t> [...]
       python3 render.py <lang> <audio_dir> full [scene ids]
"""
import json, sys, os, base64, subprocess, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
lang, adir, mode = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3]
lines = json.load(open(HERE / 'lines.json'))[lang]['lines']
info = json.load(open(adir / 'sv_info.json'))
durs = info[lang]['durs'] if lang in info else info['durs']

LEAD, GAP, HOLD = 0.8, 0.5, 3.0
REPL = {
    'ur': [('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('ابوالحسن، علیہ السلام،', 'ابوالحسن (ع)')],
    'ar': [('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('أبي الحسن، عليه السلام؟', 'أبي الحسن (ع)؟')],
}
caps = []
for l in lines:
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='بی بی فاطمہ (س) کا خطبہ', q0='مدینہ کی عورتیں عیادت کو آئیں… جواب میں خطبہ ملا', why='اس خطبے میں کیا تھا؟',
               k1='۱۱ ہجری — مدینہ', c1='اللہ کے نبی ﷺ کے بعد — آخری بیماری', books1='معانی الاخبار · الاحتجاج', women='مہاجرین و انصار کی عورتیں',
               q2='«بیماری میں آپ نے صبح کیسے کی؟»', praise='اللہ کی حمد، بابا پر درود', ans='«میں نے صبح کی: تمہاری دنیا سے بیزار، تمہارے مردوں سے ناراض»',
               k3='ابوالحسن (ع) میں کیا برا لگا؟', quals=['ان کی تلوار', 'موت سے بے پروائی', 'وار کی سختی', 'اللہ کے لیے غصہ'],
               k4='«علی (ع) انہیں راستے پر لاتے»', gentle='نرمی سے لے چلتے', spring='صاف، بہتا چشمہ', nodunya='دنیا سے اپنے لیے کچھ نہ لیتے',
               k5='«بیج پڑ چکا ہے»', blood='دودھ کی جگہ خون اور زہر', woes=['تیز تلوار', 'ظالم کے حملے', 'ہر طرف افراتفری'],
               k6='مردوں کی معذرت', sorry='«ابوالحسن پہلے بتاتے…»', reply='«تمہارے بہانوں کے بعد کوئی عذر نہیں»',
               k7a='شیعہ کتب', b1='معانی الاخبار — شیخ صدوق', b2='الاحتجاج — طبرسی', k7b='اور غیر شیعہ کتب میں بھی', b3='بلاغات النساء — ابنِ طیفور', b4='شرحِ نہج البلاغہ — ابنِ ابی الحدید',
               brand='شیعہ وائس', ask='بی بی (س) نے عیادت کے جواب میں خطبہ کیوں دیا؟ کمنٹ میں لکھیں', next='کل: اسماء بنتِ عمیس'),
    'ar': dict(title1='خطبة الزهراء (ع) في نساء المدينة', q0='«جئن يَعُدْنَها… فأجابت بخطبة»', why='فماذا قالت؟',
               k1='١١ للهجرة — المدينة', c1='بعد رسول الله ﷺ — مرضها الأخير', books1='معاني الأخبار · الاحتجاج', women='نساء المهاجرين والأنصار',
               q2='«كيف أصبحتِ من علّتكِ يا ابنة رسول الله؟»', praise='حمدت الله وصلّت على أبيها', ans='«أصبحتُ واللهِ عائفةً لدنياكُنّ، قاليةً لرجالكُنّ»',
               k3='ما الذي نقموا من أبي الحسن (ع)؟', quals=['نكيرُ سيفه', 'قلّةُ مبالاته لحتفه', 'شدّةُ وطأته', 'تنمّرُه في ذات الله'],
               k4='«لسار بهم سيراً سُجُحاً»', gentle='لردّهم إلى المحجّة', spring='منهلاً نميراً صافياً', nodunya='لم يتحلَّ من الدنيا بطائل',
               k5='«أما لعمري لقد لقِحَت»', blood='ملءَ القَعْب دماً عبيطاً', woes=['سيفٌ صارم', 'سطوةُ معتدٍ غاشم', 'هَرْجٌ شامل'],
               k6='جاؤوا معتذرين', sorry='«لو كان أبو الحسن ذكر لنا…»', reply='«إليكم عنّي، فلا عذرَ بعد تعذيركم»',
               k7a='في كتب الشيعة', b1='معاني الأخبار — الصدوق', b2='الاحتجاج — الطبرسي', k7b='وفي غير كتب الشيعة أيضاً', b3='بلاغات النساء — ابن طيفور', b4='شرح نهج البلاغة — ابن أبي الحديد',
               brand='شيعة فويس', ask='لماذا أجابت الزهراء (ع) العائدات بخطبة؟ اكتب في التعليقات', next='غداً: أسماء بنت عُمَيس'),
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
