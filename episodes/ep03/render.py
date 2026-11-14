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
    'ur': [('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('امام علی، علیہ السلام،', 'امام علی (ع)')],
    'ar': [('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('عليّاً، عليه السلام،', 'عليّاً (ع)،')],
}
caps = []
for l in lines:
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='بی بی فاطمہ زہرا (س) کی وصیت', q0='«مجھے رات میں دفن کرنا»', why='یہ وصیت کیوں؟',
               k1='۱۱ ہجری — مدینہ', c1='شیعہ کتب: بیمار اور زخمی', will='امام علی (ع) کو وصیت',
               k2='پہلی وصیت: غسل', yaqubi='تاریخِ یعقوبی', shahr='مناقب — ابنِ شہر آشوب',
               k3='سب کچھ رات میں', steps=['غسل', 'کفن', 'نماز', 'دفن'], none='کسی کو خبر نہ دینا', books3='بحار الانوار · دلائل الامامہ',
               k4='«وہ میرے جنازے میں نہ آئیں»', c4='جنہوں نے ظلم کیا اور حق چھینا', qutayba='سنی عالم ابنِ قتیبہ بھی یہی لکھتے ہیں',
               k5='ایک ماں کا دل', umama='«امامہ سے نکاح کرنا»', quran='«قبر کے پاس قرآن پڑھنا»',
               k6='اہلِ سنت کی کتاب میں بھی', bukhari='صحیح بخاری', k6a='علی (ع) نے رات میں دفن کیا', k6b='ابوبکر کو خبر نہ دی',
               date='۳ جمادی الثانی — ۱۱ ہجری', sunset='سورج ڈوبنے کے بعد', few='چند لوگ: امام حسن (ع)، امام حسین (ع)، سلمان، ابوذر، مقداد',
               brand='شیعہ وائس', ask='بی بی (س) نے ایسا کیوں چاہا؟ کمنٹ میں لکھیں', next='کل: رات کی تدفین اور پوشیدہ قبر'),
    'ar': dict(title1='وصيّة السيّدة فاطمة الزهراء (ع)', q0='«ادفنّي ليلاً»', why='لماذا هذه الوصيّة؟',
               k1='١١ للهجرة — المدينة', c1='مصادر الشيعة: عليلةٌ مثقلةٌ بالجراح', will='الوصيّة إلى الإمام عليّ (ع)',
               k2='الوصيّة الأولى: الغُسل', yaqubi='تاريخ اليعقوبي', shahr='المناقب — ابن شهرآشوب',
               k3='كلُّ شيءٍ ليلاً', steps=['الغُسل', 'الكفن', 'الصلاة', 'الدفن'], none='لا تُعلِمْ أحداً', books3='بحار الأنوار · دلائل الإمامة',
               k4='«لا يحضرْ جنازتي من ظلمني»', c4='ممّن ظلمها وغصب حقّها', qutayba='ويذكره ابنُ قتيبة من علماء السنّة',
               k5='قلبُ أمّ', umama='«تزوّجْ بعدي أُمامة»', quran='«اجلس عند قبري واقرأ القرآن»',
               k6='في كتب أهل السنّة أيضاً', bukhari='صحيح البخاري', k6a='دفنها عليٌّ (ع) ليلاً', k6b='ولم يُؤذِنْ بها أبا بكر',
               date='٣ جمادى الآخرة — ١١ للهجرة', sunset='بعد غروب الشمس', few='نفرٌ قليل، منهم الحسن والحسين (ع)، وسلمان، وأبو ذرّ، والمقداد',
               brand='شيعة فويس', ask='لماذا أرادت الزهراء (ع) ذلك؟ اكتب في التعليقات', next='غداً: الدفن ليلاً والقبر المخفيّ'),
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
