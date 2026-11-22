import sys
parts=['base.js','rumi_lib.js','ep_core.js','ep_sets.js','ep_scenes.js']
open('mindset_long.js','w').write('\n'.join(open(p).read() for p in parts))
open('mindset_short.js','w').write('\n'.join(open(p).read() for p in parts+['ep_short.js']))
for mode,(w,h,rig) in {'long':(1920,1080,'rig_l.js'),'short':(1080,1920,'rig_p.js')}.items():
    open(f'index_{mode}.html','w').write(f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Oswald;src:url(fonts/Oswald.ttf);font-weight:200 700}}
@font-face{{font-family:Montserrat;src:url(fonts/Montserrat.ttf);font-weight:100 900}}
@font-face{{font-family:CrimsonText;src:url(fonts/CrimsonText-SemiBold.ttf);font-weight:600}}
@font-face{{font-family:CrimsonText;src:url(fonts/CrimsonText-Bold.ttf);font-weight:700}}
@font-face{{font-family:CrimsonText;font-style:italic;src:url(fonts/CrimsonText-Italic.ttf);font-weight:600}}
body{{margin:0;background:#000}}canvas{{display:block}}</style></head><body>
<img id="logo" src="logo.jpg" style="display:none"><canvas id="c" width="{w}" height="{h}"></canvas>
<script src="{rig}"></script><script src="timeline_{mode}.js"></script><script src="mindset_{mode}.js"></script>
<script>ctx=document.getElementById('c').getContext('2d');
function grab(T){{drawFrame(T);return document.getElementById('c').toDataURL('image/jpeg',0.9).split(',')[1];}}
</script></body></html>''')
print('built')
