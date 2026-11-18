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
    'ur': dict(title1='بیت الاحزان', q0='غموں کا گھر · جنت البقیع، مدینہ', who='۸ جمادی الثانی، ایامِ فاطمیہ',
               k1='بابا کی یاد میں', day='دن رات آنسو', five='سب سے زیادہ رونے والے پانچ', amali='شیخ صدوق · الامالی · امام صادق (ع) سے',
               n_adam='آدم (ع)', n_yaqub='یعقوب (ع)', n_yusuf='یوسف (ع)', n_fatima='فاطمہ (س)', n_zain='زین العابدین (ع)',
               k2='مدینہ کی شکایت', bihar='علامہ مجلسی · بحار الانوار', elders='مدینہ کے بزرگ',
               complaint='«فاطمہ دن رات روتی ہیں، نہ رات کو نیند آتی ہے، نہ دن کو چین ملتا ہے»', either='یا رات کو روئیں، یا دن کو',
               k3='بی بی کا جواب', reply='«ان کے بیچ میرا رہنا کتنا تھوڑا ہے… میں روتی رہوں گی، یہاں تک کہ اپنے بابا ﷺ سے جا ملوں»',
               replyRef='بحار الانوار · بیت الاحزان، شیخ عباس قمی',
               k4='غموں کا گھر', far='شہر کے گھروں سے دور، بقیع میں', city='مدینہ', name='بیت الاحزان · غموں کا گھر',
               k5='ہر روز بقیع', ahead='امام حسن و امام حسین (ع) آگے آگے', graves='قبروں کے بیچ آنسو', night='رات کو امام علی (ع) گھر لے جاتے',
               k6='ستائیس دن', after='بابا ﷺ کی وفات کے بعد', some='بعض روایات · بحار الانوار', ill='بیماری کی وجہ سے، بی بی وہاں نہ جا سکیں',
               centuries='وہ گھر صدیوں تک باقی رہا',
               k7='سنی کتابوں میں بھی', samhudi='سمہودی · وفاء الوفاء', samhudiTx='غزالی سے: مسجدِ بیت الحزن میں نماز مستحب',
               jubayr='ابنِ جبیر · سفرنامہ', jubayrTx='عباس کے گنبد کے ساتھ، فاطمہ (س) کا گھر: بیت الحزن',
               lblAbbas='گنبدِ عباس', lblHouse='بیت الاحزان', year='ہجری', razed='وہابی حکومت نے بقیع کے گنبد گرا دیے',
               brand='شیعہ وائس', ask='بی بی کے یہ آنسو کس بات کی گواہی ہیں؟ کمنٹ میں لکھیں', next='کل: بی بی فاطمہ (س) کی قبر پر امام علی (ع) کے الفاظ'),
    'ar': dict(title1='بيت الأحزان', q0='بيتُ الحزن · البقيع، المدينة', who='٨ جمادى الآخرة، الأيّام الفاطميّة',
               k1='حزناً على أبيها', day='بكاءٌ ليلاً ونهاراً', five='البكّاؤون خمسة', amali='الشيخ الصدوق · الأمالي · عن الإمام الصادق (ع)',
               n_adam='آدم (ع)', n_yaqub='يعقوب (ع)', n_yusuf='يوسف (ع)', n_fatima='فاطمة (ع)', n_zain='عليّ بن الحسين (ع)',
               k2='شكوى أهل المدينة', bihar='العلّامة المجلسي · بحار الأنوار', elders='شيوخ المدينة',
               complaint='إِنَّ فَاطِمَةَ تَبْكِي اللَّيْلَ وَالنَّهَارَ، فَلَا يَهْنَأُ أَحَدٌ مِنَّا بِالنَّوْمِ لَيْلًا، وَلَا بِالرَّاحَةِ نَهَارًا', either='إمّا ليلاً، وإمّا نهاراً',
               k3='جوابها', reply='يَا أَبَا الْحَسَنِ، مَا أَقَلَّ مَكْثِي بَيْنَهُمْ… فَوَاللهِ لَا أَزَالُ أَبْكِي حَتَّى أَلْحَقَ بِأَبِي ﷺ',
               replyRef='بحار الأنوار · بيت الأحزان، الشيخ عبّاس القمّي',
               k4='بيتُ الأحزان', far='بعيداً عن بيوت الناس، في البقيع', city='المدينة', name='بيت الأحزان · بيتُ الحزن',
               k5='كلَّ يومٍ إلى البقيع', ahead='الحسن والحسين (ع) أمامها', graves='بكاءٌ بين القبور', night='في الليل يردّها عليٌّ (ع) إلى البيت',
               k6='سبعة وعشرون يوماً', after='بعد وفاة أبيها ﷺ', some='بعض الروايات · بحار الأنوار', ill='أقعدها المرض عن الخروج',
               centuries='وبقي البيت قروناً',
               k7='في كتب أهل السنّة أيضاً', samhudi='السمهودي · وفاء الوفا', samhudiTx='عن الغزالي: تُستحبّ الصلاة في مسجد بيت الحزن',
               jubayr='ابن جبير · الرحلة', jubayrTx='يلي القبّةَ العبّاسيّة بيتٌ لفاطمة (ع): بيت الحزن',
               lblAbbas='القبّة العبّاسيّة', lblHouse='بيت الأحزان', year='للهجرة', razed='هدم الحكمُ الوهّابيّ قباب البقيع',
               brand='شيعة فويس', ask='على ماذا تشهد هذه الدموع؟ اكتب في التعليقات', next='غداً: كلمات الإمام عليّ (ع) عند قبر فاطمة (ع)'),
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
