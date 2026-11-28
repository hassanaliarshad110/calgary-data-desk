import sys, glob
from PIL import Image
fs=sorted(glob.glob('prev/p_*.jpg')); want=[f'prev/p_{float(x):07.2f}.jpg' for x in sys.argv[2:]]; fs=[f for f in want if f in fs]
ims=[Image.open(f).resize((360,640)) for f in fs]; c=min(len(ims),6)
sh=Image.new('RGB',(360*c,640*((len(ims)+c-1)//c)))
for i,im in enumerate(ims): sh.paste(im,((i%c)*360,(i//c)*640))
sh.save(sys.argv[1])
