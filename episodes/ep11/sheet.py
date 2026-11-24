import sys
from PIL import Image
fs = sys.argv[2:]; out = sys.argv[1]
ims = [Image.open(f) for f in fs]; w, h = ims[0].size; tw = 360 if h > w else 640; th = int(h * tw / w)
cols = min(len(ims), 6 if h > w else 3); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * th), 'white')
for i, im in enumerate(ims): S.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
S.save(out, quality=85)
