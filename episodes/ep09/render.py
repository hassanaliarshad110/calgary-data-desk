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
    'ur': [('امام علی، علیہ السلام،', 'امام علی (ع)'), ('بی بی فاطمہ، سلام اللہ علیہا،', 'بی بی فاطمہ (س)')],
    'ar': [('لفاطمةَ، عليها السلام،', 'لفاطمةَ (ع)'), ('عليّ، عليه السلام.', 'عليّ (ع).')],
}
caps = []
for l in lines:
    l = re.sub(r'\[\[[^|\]]+\|[^|\]]+\|(.+?)\]\]', r'\1', l)  # dialogue markup [[speaker|intensity|words]] -> words
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='ام ایمن', q0='«میری ماں کے بعد میری ماں»', who='وہ کون تھیں؟',
               k1='برکہ', habasha='حبشہ', makkah='مکہ', name='برکہ بنتِ ثعلبہ · ام ایمن', src1='طبقات ابن سعد',
               servant='جنابِ عبداللہ کی کنیز', inherit='میراث میں: اللہ کے نبی ﷺ کے پاس',
               k2='ابواء', amina='بی بی آمنہ کی وفات', maarif='المعارف (ابن قتیبہ): مکہ تک سنبھالا', isaba='الاصابہ (ابن حجر): برسوں پرورش کی',
               k3='«اماں»', ibnsaad='ابن سعد: کبھی کبھی «اماں» کہہ کر پکارتے', riwayat='روایت', love='آپ ﷺ انہیں بہت چاہتے تھے', muslim='صحیح مسلم: ان کے گھر ملنے جاتے',
               k4='آزادی اور خاندان', freed='بی بی خدیجہ سے شادی پر آزادی', ummayman='ام ایمن', ubayd='عبید خزرجی', ayman='ایمن', zayd='زید بن حارثہ', usama='اسامہ بن زید',
               k5='ہجرت', route='مکہ سے مدینہ', thirst='روزہ · سخت پیاس', water='آسمان سے پانی کا ڈول', src5='روایت · طبقات ابن سعد',
               k6='احد اور خیبر', uhud='احد: زخمیوں کو پانی · مرہم پٹی', khaybar='خیبر: اللہ کے نبی ﷺ کے ساتھ', src6='المغازی (واقدی) · طبقات (ابن سعد)',
               k7='فدک کی گواہی', ihtijaj='الاحتجاج (طبرسی)', wit='گواہ: امام علی (ع) · ام ایمن', question='«کیا تم نہیں جانتے کہ اللہ کے نبی ﷺ نے فرمایا تھا: ام ایمن جنتی عورت ہے؟»',
               yes='اقرار کیا', testified='گواہی: فدک، بی بی فاطمہ (س) کو تحفہ', rejected='گواہی نہ مانی گئی', baladhuri='فتوح البلدان (بلاذری): دو مرد گواہ مانگے گئے',
               brand='شیعہ وائس', ask='ام ایمن کا کون سا لمحہ دل کو چھوتا ہے؟ کمنٹ میں لکھیں', next='کل: جنگِ خندق · سلمان فارسی'),
    'ar': dict(title1='أمُّ أيمن', q0='«أمّي بعد أمّي»', who='فمَن كانت؟',
               k1='بَرَكة', habasha='الحبشة', makkah='مكّة', name='بركة بنت ثعلبة · أمّ أيمن', src1='طبقات ابن سعد',
               servant='جاريةُ عبد الله', inherit='ميراثاً: صارت لرسول الله ﷺ',
               k2='الأبواء', amina='وفاة آمنة', maarif='المعارف (ابن قتيبة): احتضنته حتى مكّة', isaba='الإصابة (ابن حجر): رعته سنين',
               k3='«يا أُمَّه»', ibnsaad='ابن سعد: كان أحياناً يدعوها «يا أُمَّه»', riwayat='رواية', love='وكان ﷺ يحبّها كثيراً', muslim='صحيح مسلم: كان يزورها في بيتها',
               k4='العتق والأسرة', freed='أعتقها حين تزوّج خديجة', ummayman='أمّ أيمن', ubayd='عُبيد الخزرجي', ayman='أيمن', zayd='زيد بن حارثة', usama='أسامة بن زيد',
               k5='الهجرة', route='من مكّة إلى المدينة', thirst='صائمة · عطشٌ شديد', water='دلوٌ من السماء فيه ماء', src5='رواية · طبقات ابن سعد',
               k6='أُحُد وخيبر', uhud='أُحُد: تسقي الجرحى وتداويهم', khaybar='خيبر: مع رسول الله ﷺ', src6='المغازي (الواقدي) · الطبقات (ابن سعد)',
               k7='شهادة فدك', ihtijaj='الاحتجاج (الطبرسي)', wit='الشهود: الإمام علي (ع) · أمّ أيمن', question='«ألستَ تعلم أنّ رسول الله ﷺ قال: أمُّ أيمن من أهل الجنّة؟»',
               yes='فأقرّ بذلك', testified='شهدت: فدك هبةٌ لفاطمة (ع)', rejected='لم تُقبل الشهادة', baladhuri='فتوح البلدان (البلاذري): طُلب رجلان',
               brand='شيعة فويس', ask='أيُّ لحظةٍ من حياة أمّ أيمن تمسّ قلبك؟ اكتب في التعليقات', next='غداً: غزوة الخندق · سلمان الفارسي'),
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
