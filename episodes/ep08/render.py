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
    'ur': [('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('امام علی، علیہ السلام،', 'امام علی (ع)'), ('امام حسین، علیہما السلام،', 'امام حسین (ع)')],
    'ar': [('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('عليّاً، عليه السلام،', 'عليّاً (ع)'), ('والحسين، عليهما السلام،', 'والحسين (ع)')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup [[speaker|intensity|words]] -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='فدک: باپ کا تحفہ', q0='اللہ کے نبی ﷺ نے اپنی بیٹی کو دیا…', taken='…اور ان کے بعد چھین لیا گیا',
               k1='فدک کہاں ہے؟', madinah='مدینہ', khaybar='خیبر', fadak='فدک', km='تقریباً ۱۶۰ کلومیٹر', farms='کھیت · باغ · کھجور کے باغات', muajam='معجم البلدان',
               k2='بغیر جنگ کے', year='۷ ہجری · خیبر کی فتح کے بعد', peace='صلح · آدھی زمینیں', tabari='تاریخ طبری: «بغیر جنگ کے»', hashr='سورۂ حشر، آیت ۶',
               fay='فَے: اللہ کے نبی ﷺ کا · مفسرین: جسے چاہیں دیں',
               isra='سورۂ بنی اسرائیل، آیت ۲۶', mufassir='شیعہ مفسرین · الدر المنثور (سیوطی)', gift='فدک: بی بی فاطمہ (س) کو تحفہ',
               k4='اللہ کے نبی ﷺ کے بعد', nobody='«فدک کسی کی ملکیت نہیں»', src4='شیعہ کتب: الکافی · المقنعہ', agents='بی بی (س) کے کارندے نکال دیے گئے',
               k5='گواہ', giftclaim='بی بی (س): فدک بابا کا تحفہ ہے', wit='امام علی (ع) · ام ایمن', baladhuri='سنی مؤرخ بلاذری · فتوح البلدان',
               wit2='بعض شیعہ روایات: امام حسن (ع) · امام حسین (ع)', rejected='گواہی نہ مانی گئی', rule='دو مرد، یا ایک مرد اور دو عورتیں',
               k6='میراث کا دعویٰ', bukhari='صحیح بخاری', only='شیعہ علما: اس وقت صرف ابوبکر کی روایت', naml='سورۂ نمل، آیت ۱۶',
               k7='تحریر… جو پھاڑ دی گئی', src7='سیرت حلبیہ · الکافی', torn='عمر نے تحریر پھاڑ دی', bukhari2='صحیح بخاری',
               silent='بی بی فاطمہ (س) ابوبکر سے ناراض ہوئیں، اور وفات تک بات نہ کی',
               brand='شیعہ وائس', ask='کیا فدک صرف زمین کا ٹکڑا تھا؟ کمنٹ میں لکھیں', next='کل: خطبۂ فدکیہ'),
    'ar': dict(title1='فدك: هديةُ أب', q0='أعطاها رسولُ الله ﷺ لابنته…', taken='…وانتُزعت بعد رحيله',
               k1='أين فدك؟', madinah='المدينة', khaybar='خيبر', fadak='فدك', km='نحو ١٦٠ كم', farms='مزارع · بساتين · نخيل', muajam='معجم البلدان',
               k2='بلا قتال', year='٧ هـ · بعد فتح خيبر', peace='صلحٌ · نصفُ الأرض', tabari='تاريخ الطبري: «بلا حرب»', hashr='سورة الحشر، الآية ٦',
               fay='فيءٌ لرسول الله ﷺ · المفسّرون: يعطيه من يشاء',
               isra='سورة الإسراء، الآية ٢٦', mufassir='مفسّرو الشيعة · الدرّ المنثور (السيوطي)', gift='فدك: هبةٌ للزهراء (ع)',
               k4='بعد رسول الله ﷺ', nobody='«فدك ليست ملكاً لأحد»', src4='مصادر شيعية: الكافي · المقنعة', agents='وأُخرج عمّال فاطمة (ع)',
               k5='الشهود', giftclaim='فدك هبةٌ من أبيها', wit='الإمام علي (ع) · أمّ أيمن', baladhuri='المؤرّخ السنّي البلاذري · فتوح البلدان',
               wit2='بعض الروايات الشيعية: الحسن (ع) · الحسين (ع)', rejected='لم تُقبل الشهادة', rule='رجلان، أو رجلٌ وامرأتان',
               k6='المطالبة بالميراث', bukhari='صحيح البخاري', only='علماء الشيعة: رواه أبو بكر وحده يومئذٍ', naml='سورة النمل، الآية ١٦',
               k7='كتابٌ… مُزِّق', src7='السيرة الحلبية · الكافي', torn='أخذه عمر ومزّقه', bukhari2='صحيح البخاري',
               silent='غضبت فاطمة (ع) على أبي بكر، فهجرته حتى توفّيت',
               brand='شيعة فويس', ask='هل كانت فدكٌ مجرّدَ أرض؟ اكتب في التعليقات', next='غداً: الخطبة الفدكية'),
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
