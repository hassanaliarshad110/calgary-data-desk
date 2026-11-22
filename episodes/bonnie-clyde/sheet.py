import sys,glob
from PIL import Image
fs=sys.argv[2:]; cols=3; w,h=640,360
im=Image.new('RGB',(cols*w,((len(fs)+cols-1)//cols)*h))
for i,f in enumerate(fs): im.paste(Image.open(f).resize((w,h)),((i%cols)*w,(i//cols)*h))
im.save(sys.argv[1],quality=85)
