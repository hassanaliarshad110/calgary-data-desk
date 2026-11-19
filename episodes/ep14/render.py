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
    'ur': dict(title1='بی بی فاطمہ (س) کی قبر پر امام علی (ع) کے الفاظ', q0='«میرا صبر کم ہو گیا ہے»', who='۹ جمادی الثانی · ایامِ فاطمیہ',
               k1='بابا ﷺ کے بعد', days='دن بعد', date='۳ جمادی الثانی · ۱۱ ہجری', famous='شیعوں میں مشہور روایت',
               k2='وصیت', k2b='رات کا جنازہ', will='«مجھے رات کو، خاموشی سے دفن کیا جائے»', wash='غسل و کفن: امام علی (ع) اور اسماء بنت عمیس',
               prayed='امام حسن و امام حسین (ع) کے ساتھ نمازِ جنازہ', some='بعض روایات: سلمان، ابوذر، مقداد',
               k3='سنی کتاب میں بھی', bukhari='صحیح بخاری', bukhariRef='حدیث ۴۲۴۰ · کتاب المغازی', bukhariRef2='صحیح بخاری · ۴۲۴۰',
               bq='«ان کے شوہر علی نے انہیں رات کو دفن کیا، ابوبکر کو خبر نہ دی، اور خود نمازِ جنازہ پڑھی»',
               k4='چھپی ہوئی قبر', effaced='قبر کا نشان مٹا دیا گیا', sevenForty='روایات: سات، یا چالیس قبریں', unknown='قبر کی جگہ آج بھی یقینی نہیں',
               pHouse='ان کا گھر؟', pRawda='مسجدِ نبوی: قبر اور منبر کے درمیان؟', pBaqi='جنت البقیع؟',
               k5='اللہ کے نبی ﷺ کی قبر کی طرف', kafi='اصولِ کافی · امالی', kafiRef='امام حسین (ع) سے روایت',
               salaam='«اے اللہ کے نبی! آپ کو میری طرف سے سلام، اور آپ کی اس بیٹی کی طرف سے بھی، جو آپ کے پڑوس میں آ اتری، اور بہت جلد آپ سے آ ملی»',
               nahj='نہج البلاغہ · خطبہ ۲۰۲',
               k6='صبر کم ہو گیا', patience='«آپ کی برگزیدہ بیٹی کے بعد، میرا صبر کم ہو گیا ہے، اور میری ہمت جواب دے رہی ہے»',
               trust='«امانت واپس لے لی گئی، اور جو گروی تھا، وہ بھی لے لیا گیا»', grief='«میرا غم ہمیشہ کا ہے، اور میری راتیں جاگتے گزریں گی»',
               k7='ان سے پوچھیے', k7b='یہ الفاظ کہاں ہیں؟', askHer='«آپ کی بیٹی آپ کو بتائے گی، کہ آپ کی امت نے اس پر ظلم کے لیے کیسے ایکا کیا۔ ان سے تفصیل سے پوچھیے»',
               nahjT='نہج البلاغہ', nahjSub='خطبہ ۲۰۲ · اصولِ کافی ج۱ ص۴۵۸', sibt='سبط ابن جوزی (سنی، حنفی)', sibtSub='تذکرۃ الخواص',
               brand='شیعہ وائس', ask='بی بی نے رات کی تدفین کی وصیت کیوں کی؟ کمنٹ میں لکھیں', next='کل: جنگِ جمل، ۳۶ ہجری'),
    'ar': dict(title1='كلمات الإمام عليّ (ع) عند قبر السيّدة فاطمة (ع)', q0='«قَلَّ صَبْرِي»', who='٩ جمادى الآخرة · الأيّام الفاطميّة',
               k1='بعد رحيل أبيها ﷺ', days='يوماً', date='٣ جمادى الآخرة · ١١ للهجرة', famous='الرواية المشهورة عند الشيعة',
               k2='الوصيّة', k2b='جنازةٌ في الليل', will='«أن أُدفن ليلاً، سرّاً»', wash='الغسل والكفن: الإمام عليّ (ع) وأسماء بنت عُمَيس',
               prayed='صُلّي عليها مع الإمامين الحسن والحسين (ع)', some='في بعض الروايات: سلمان، أبو ذرّ، المقداد',
               k3='في كتب أهل السنّة أيضاً', bukhari='صحيح البخاري', bukhariRef='الحديث ٤٢٤٠ · كتاب المغازي', bukhariRef2='صحيح البخاري · ٤٢٤٠',
               bq='فَلَمَّا تُوُفِّيَتْ، دَفَنَهَا زَوْجُهَا عَلِيٌّ لَيْلاً، وَلَمْ يُؤْذِنْ بِهَا أَبَا بَكْرٍ، وَصَلَّى عَلَيْهَا',
               k4='القبر المخفيّ', effaced='عُفّي أثرُ القبر', sevenForty='في الروايات: سبعة قبور، أو أربعون', unknown='موضع القبر لا يُعرف يقيناً',
               pHouse='بيتُها؟', pRawda='الروضة النبويّة؟', pBaqi='البقيع؟',
               k5='إلى قبر رسول الله ﷺ', kafi='الكافي · الأمالي', kafiRef='عن الإمام الحسين (ع)',
               salaam='السَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ عَنِّي، وَعَنِ ابْنَتِكَ النَّازِلَةِ فِي جِوَارِكَ، وَالسَّرِيعَةِ اللَّحَاقِ بِكَ',
               nahj='نهج البلاغة · الخطبة ٢٠٢',
               k6='قلَّ صبري', patience='قَلَّ يَا رَسُولَ اللَّهِ عَنْ صَفِيَّتِكَ صَبْرِي، وَرَقَّ عَنْهَا تَجَلُّدِي',
               trust='فَلَقَدِ اسْتُرْجِعَتِ الْوَدِيعَةُ، وَأُخِذَتِ الرَّهِينَةُ', grief='أَمَّا حُزْنِي فَسَرْمَدٌ، وَأَمَّا لَيْلِي فَمُسَهَّدٌ',
               k7='فأحفها السؤال', k7b='أين هذه الكلمات؟', askHer='وَسَتُنَبِّئُكَ ابْنَتُكَ بِتَضَافُرِ أُمَّتِكَ عَلَى هَضْمِهَا، فَأَحْفِهَا السُّؤَالَ، وَاسْتَخْبِرْهَا الْحَالَ',
               nahjT='نهج البلاغة', nahjSub='الخطبة ٢٠٢ · الكافي ج١ ص٤٥٨', sibt='سبط ابن الجوزي (الحنفي)', sibtSub='تذكرة الخواصّ',
               brand='شيعة فويس', ask='لماذا أوصت السيّدة أن تُدفن ليلاً؟ اكتب في التعليقات', next='غداً: حرب الجمل، ٣٦ للهجرة'),
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
