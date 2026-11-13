"""Render the Shia Voice Dubai episode.
usage: python3 render.py <lang> <audio_dir> preview <scene>:<t> [...]
       python3 render.py <lang> <audio_dir> full [scene ids]
"""
import json, sys, os, base64, subprocess, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
lang, adir, mode = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3]
lines = json.load(open(HERE / 'ep2_lines.json'))[lang]['lines']
info = json.load(open(adir / 'sv_info.json'))
durs = info[lang]['durs'] if lang in info else info['durs']

LEAD, GAP, HOLD = 0.8, 0.5, 3.0
REPL = {
    'ur': [('رسولِ خدا، صلی اللہ علیہ وآلہ وسلم،', 'رسولِ خدا ﷺ'), ('فاطمہ زہرا، سلام اللہ علیہا،', 'فاطمہ زہرا (س)'), ('امام علی، علیہ السلام،', 'امام علی (ع)')],
    'ar': [('لرسول الله، صلّى اللهُ عليه وآله وسلّم.', 'لرسول الله ﷺ.'), ('الزهراء، عليها السلام،', 'الزهراء (ع)'), ('عليّاً، عليه السلام:', 'عليّاً (ع):')],
}
caps = []
for l in lines:
    for a, b in REPL[lang]: l = l.replace(a, b)
    caps.append(l)
LABELS = {
    'ur': dict(title1='بی بی فاطمہ زہرا (س)', title2='صرف ۱۸ برس میں شہادت کیوں؟', daysAfter='دن — بابا کے بعد', tlL='بعثت کا پانچواں سال', tlR='۱۱ ہجری',
               birth='ولادت: ۲۰ جمادی الثانی', age='۱۸ برس', q2='«میرے اہلِ بیت میں سب سے پہلے تم مجھ سے آ ملو گی»', bukhari='صحیح بخاری',
               c1='پہلو زخمی، ہڈیاں ٹوٹیں', c2='جنابِ محسن (ع) شہید', c3='بازو پر تازیانے کا نشان', fadak='فدک', khutba='خطبۂ فدکیہ', ahzan='بیت الاحزان — بقیع',
               b1='صحیح بخاری', b2='الامامۃ والسیاسۃ', k5='اہلِ سنت کی کتب میں بھی', k5b='وفات تک بات نہیں کی', will='وصیت: رات میں دفن', k6b='بخاری: علی (ع) نے رات میں دفن کیا',
               date='۳ جمادی الثانی — ۱۱ ہجری', grave='قبر آج تک پوشیدہ', brand='شیعہ وائس', ask='آپ کیا سمجھتے ہیں؟ کمنٹ میں لکھیں', next='کل: بی بی (س) کی وصیت'),
    'ar': dict(title1='السيدة فاطمة الزهراء (ع)', title2='لماذا رحلت في الثامنة عشرة؟', daysAfter='يوماً بعد أبيها', tlL='السنة الخامسة للبعثة', tlR='١١ للهجرة',
               birth='الولادة: ٢٠ جمادى الآخرة', age='١٨ عاماً', q2='«أنتِ أوّلُ أهلِ بيتي لحوقاً بي»', bukhari='صحيح البخاري',
               c1='كُسِر ضلعُها', c2='استُشهِد المحسن (ع)', c3='أثرُ السوط على عضدها', fadak='فدك', khutba='الخطبة الفدكية', ahzan='بيت الأحزان — البقيع',
               b1='صحيح البخاري', b2='الإمامة والسياسة', k5='في كتب أهل السنّة أيضاً', k5b='هجرته فلم تكلّمه حتى توفّيت', will='الوصية: الدفن ليلاً', k6b='البخاري: دفنها عليٌّ (ع) ليلاً',
               date='٣ جمادى الآخرة — ١١ للهجرة', grave='قبرها مخفيّ إلى اليوم', brand='شيعة فويس', ask='ما رأيك؟ اكتب لنا في التعليقات', next='غداً: وصيّة الزهراء (ع)'),
}
scenes = []
for i, d in enumerate(durs):
    dur = (LEAD if i == 0 else 0) + d + GAP + (HOLD if i == len(durs) - 1 else 0)
    scenes.append(dict(dur=round(dur, 3)))
CFG = dict(lang=lang, caps=caps, durs=durs, lead=LEAD, scenes=scenes, labels=LABELS[lang])
OUT = HERE / f'ep2_{lang}'; OUT.mkdir(exist_ok=True)
json.dump(CFG, open(OUT / 'cfg.json', 'w'), ensure_ascii=False, indent=1)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    pg.goto((HERE / 'page2.html').as_uri())
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
