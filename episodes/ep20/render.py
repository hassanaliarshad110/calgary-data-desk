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
    'ur': dict(title1='کربلا کی لوٹ مار', ghadir='عیدِ غدیر · ۱۸ ذی الحجہ ۱۲۱۶ ھ',
               k1='نجد · درعیہ', saudi='درعیہ کی امارت · پہلی سعودی ریاست', ruler='حکمران: عبدالعزیز بن محمد', belief='ان کے وہابی عقیدے میں: قبروں پر عمارت اور زیارت = شرک',
               k2='۱۸ ذی الحجہ ۱۲۱۶ ھ · عیدِ غدیر', karbala='کربلا', najaf='نجف', ziyarat='امام علی (ع) کے روضے کی زیارت', empty='شہر تقریباً مردوں سے خالی',
               k3='حملہ', order='عبدالعزیز کا حکم', saud='کمان: ان کا بیٹا سعود', fled='عثمانی فوجی بھاگ نکلے',
               k4='نجدی مؤرخ کی گواہی', najdi='عثمان بن بشر · نجدی مؤرخ', bishr='وہ دیواروں پر چڑھے، شہر میں داخل ہوئے، اور زیادہ تر لوگوں کو بازاروں اور گھروں میں قتل کیا', bishrRef='عثمان بن بشر کے بیان کا مفہوم',
               k5='شہداء', turath='تراثِ کربلا · شیعہ کتاب', range='دوسرے اندازے: ۲۰۰۰ سے ۵۰۰۰', scholar='عالمِ دین عبدالصمد ہمدانی', bahr='کتاب بحر المعارف کے مصنف',
               k6='روضے', dome='امام حسین (ع) کی قبر کا گنبد گرا دیا گیا · ابن بشر', abbas='حضرت عباس (ع) کا روضہ بھی تباہ · شیعہ مؤرخین', looted='دونوں روضوں کا مال لوٹ لیا گیا',
               k7='لوٹ', loot='سونا · ایرانی قالین · نقدی · موتی · ہتھیار', hours='تقریباً آٹھ گھنٹے', camels='چار ہزار سے زیادہ اونٹ', captives='کچھ عورتیں قیدی',
               k8='کربلا', tragedy='عاشورا کے بعد، کربلا کا سب سے بڑا سانحہ', k8b='نجف', kashif='شیخ جعفر کاشف الغطاء نے لوگوں کو اکٹھا کیا', rocks='داخلی راستے بڑے پتھروں سے بند',
               k9='ایک خط', shah='فتح علی شاہ، بادشاہِ ایران کے نام', letter='جو شرک اور کفر پر اڑا رہے گا، اس کے ساتھ وہی ہوگا جو کربلا والوں کے ساتھ ہوا', letterRef='عبدالعزیز کے خط کا مفہوم',
               k10='ایران کا جواب', offer='فوجی مدد کی پیشکش · عثمانیوں نے رد کی', baluch='۵۰۰ بلوچ خاندان، کربلا کی حفاظت کے لیے',
               k11='کربلا کی دیوار', riyad='۱۲۱۷ ھ · سید علی طباطبائی (صاحبِ ریاض)', gates='چھ دروازوں والی دیوار', again='۱۲۲۳ ھ · بیس ہزار کا لشکر پھر آیا', held='شہر کی دیواروں کے پیچھے سے مقابلہ',
               close1='عیدِ غدیر کے دن کربلا لُٹا، مگر کربلا کا ذکر نہیں رکا',
               brand='شیعہ وائس', ask='اتنے حملوں کے بعد بھی کربلا سے محبت کیوں نہیں ٹوٹی؟ کمنٹ میں لکھیں', next='اگلی ویڈیو: حمزہ، احد میں اللہ کا شیر'),
    'ar': dict(title1='نهبُ كربلاء', ghadir='عيد الغدير · ١٨ ذي الحجّة ١٢١٦ هـ',
               k1='نجد · الدرعيّة', saudi='إمارة الدرعيّة · الدولة السعوديّة الأولى', ruler='الحاكم: عبد العزيز بن محمّد', belief='في عقيدتهم الوهّابيّة: البناءُ على القبور وزيارتُها شرك',
               k2='١٨ ذو الحجّة ١٢١٦ هـ · عيد الغدير', karbala='كربلاء', najaf='النجف', ziyarat='لزيارة مرقد الإمام عليّ (ع)', empty='المدينة شبهُ خاليةٍ من الرجال',
               k3='الهجوم', order='بأمر عبد العزيز', saud='بقيادة ابنه سعود', fled='فرّت الحاميةُ العثمانيّة',
               k4='شهادةُ مؤرّخٍ نجديّ', najdi='عثمان بن بشر · مؤرّخ نجديّ', bishr='تسوّروا الجدران، ودخلوا البلد، وقتلوا أكثرَ أهله في الأسواق والبيوت', bishrRef='معنى ما كتبه ابن بشر',
               k5='الشهداء', turath='تراث كربلاء · كتابٌ شيعيّ', range='تقديراتٌ أخرى: ٢٠٠٠ إلى ٥٠٠٠', scholar='العالم عبد الصمد الهمدانيّ', bahr='مؤلّف كتاب بحر المعارف',
               k6='المرقدان', dome='هدموا القبّة على قبر الإمام الحسين (ع) · ابن بشر', abbas='وخُرّب مرقد العبّاس (ع) · مؤرّخون شيعة', looted='ونُهبت أموالُ المرقدين',
               k7='النهب', loot='ذهب · سجّاد فارسيّ · نقود · لآلئ · أسلحة', hours='نحو ثماني ساعات', camels='أكثر من أربعة آلاف جمل', captives='وسَبَوا عدداً من النساء',
               k8='كربلاء', tragedy='أعظمُ مصيبةٍ على كربلاء بعد عاشوراء', k8b='النجف', kashif='الشيخ جعفر كاشف الغطاء جمع الناس', rocks='سدّوا مداخلَ المدينة بالصخور',
               k9='رسالة', shah='إلى فتح علي شاه، ملك إيران', letter='من أصرّ على الشرك والكفر، سيصيبه ما أصاب أهلَ كربلاء', letterRef='معنى رسالة عبد العزيز',
               k10='ردّ إيران', offer='عرضُ مساعدةٍ عسكريّة · رفضها العثمانيّون', baluch='٥٠٠ عائلة بلوشيّة لحماية كربلاء',
               k11='سورُ كربلاء', riyad='١٢١٧ هـ · السيّد عليّ الطباطبائيّ (صاحب الرياض)', gates='سورٌ له ستّةُ أبواب', again='١٢٢٣ هـ · عشرون ألفاً من جديد', held='قاوم أهلُ المدينة من خلف أسوارها',
               close1='نُهبت كربلاء يومَ الغدير، لكنّ ذكرَها لم يتوقّف',
               brand='شيعة فويس', ask='لماذا لم تنكسر محبّةُ الناس لكربلاء؟ اكتب في التعليقات', next='الحلقة القادمة: حمزة، أسدُ الله في أُحُد'),
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
