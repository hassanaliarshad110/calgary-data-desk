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
    'ur': dict(title1='اویس قرنی', who='اللہ کے نبی ﷺ کو کبھی نہیں دیکھا · پھر بھی آپ ﷺ نے ان کا ذکر کیا',
               k1='یمن', name='اویس بن عامر', tribe='قرن · قبیلۂ مراد کی ایک شاخ', herder='اونٹ چرانے والے', mother='بوڑھی، نابینا ماں کی خدمت',
               k2='یمن سے مدینہ', yemen='یمن', madinah='مدینہ', away='اللہ کے نبی ﷺ شہر سے باہر تھے', promise='ماں سے وعدہ · ملے بغیر واپسی',
               bihar='بحار الانوار', biharSub='علامہ مجلسی · شیعہ روایت', whose='اس گھر میں یہ کس کا نور ہے؟', herderCame='اویس نام کا ایک ساربان آیا تھا، اور چلا گیا', gift='یہ نور، ایک تحفہ',
               k4='صحیح مسلم', refM='صحیح مسلم · حدیث ۲۵۴۲',
               k5='الارشاد · شیخ مفید', mufid='شیخ مفید', imamAli='امام علی (ع) کی روایت، اللہ کے نبی ﷺ سے', hizb='اللہ کی جماعت میں سے', shahada='راہِ دین میں شہادت', shafa='شفاعت سے بہت سے لوگ جہنم سے آزاد',
               k6='کوفہ', close='امام علی (ع) کے قریبی ساتھی', bayah='شیخ مفید: بیعت کرنے والے شیعوں میں', kufa='آخری برس: کوفہ',
               k7='جنگِ صفین', hijri='ہجری · معاویہ کے خلاف', army='امام علی (ع) کے لشکر میں', age='شہادت · سڑسٹھ برس کی عمر میں',
               k7b='رقہ، شام', raqqa='مانی جانے والی قبر · عمار بن یاسر کے ساتھ', y2013='۲۰۱۳ · مزار پر حملہ، بڑا حصہ تباہ',
               never='اللہ کے نبی ﷺ کو کبھی نہیں دیکھا، مگر', v1='ماں کی خدمت', v2='علی (ع) سے وفا',
               brand='شیعہ وائس', ask='اویس کی زندگی کا سب سے بڑا سبق کیا ہے؟ کمنٹ میں لکھیں', next='کل: حمزہ، احد میں اللہ کا شیر'),
    'ar': dict(title1='أُوَيْسٌ القَرَنيّ', who='لم يرَ رسولَ الله ﷺ قطّ · ومع ذلك تحدّث عنه ﷺ',
               k1='اليمن', name='أُوَيْسُ بنُ عامر', tribe='قَرَن · بطنٌ من قبيلة مُراد', herder='راعي إبل', mother='يخدم أمَّه العجوزَ الكفيفة',
               k2='من اليمن إلى المدينة', yemen='اليمن', madinah='المدينة', away='رسولُ الله ﷺ خارج المدينة', promise='وعدٌ لأمّه · عاد دون أن يلقاه',
               bihar='بحار الأنوار', biharSub='العلّامة المجلسيّ · روايةٌ شيعيّة', whose='نورُ مَن هذا في هذا البيت؟', herderCame='جاء راعي إبلٍ اسمُه أويس، ثمّ انصرف', gift='هذا النور · هديّة',
               k4='صحيح مسلم', refM='صحيح مسلم · الحديث ٢٥٤٢',
               k5='الإرشاد · الشيخ المفيد', mufid='الشيخ المفيد', imamAli='يرويه الإمامُ عليٌّ (ع) عن رسول الله ﷺ', hizb='من حزب الله', shahada='موتُه شهادةٌ في سبيل الدين', shafa='يُعتَق بشفاعته خلقٌ كثير من النار',
               k6='الكوفة', close='من خاصّة أصحاب الإمام عليّ (ع)', bayah='الشيخ المفيد: من الشيعة الذين بايعوا', kufa='سنواته الأخيرة: الكوفة',
               k7='معركة صفّين', hijri='للهجرة · ضدّ معاوية', army='في جيش الإمام عليّ (ع)', age='استُشهد · ابنُ سبعٍ وستّين سنة',
               k7b='الرَّقّة، سوريا', raqqa='قبرُه على الأرجح · إلى جانب عمّار بن ياسر', y2013='٢٠١٣ · هجومٌ على المقام ودمارُ أكثره',
               never='لم يرَ رسولَ الله ﷺ قطّ، لكنّ', v1='برَّه بأمّه', v2='ووفاءَه لعليٍّ (ع)',
               brand='شيعة فويس', ask='ما أعظمُ درسٍ في حياة أويس؟ اكتب في التعليقات', next='غداً: حمزة، أسدُ الله في أُحُد'),
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
