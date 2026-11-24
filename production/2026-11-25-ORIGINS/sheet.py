import sys, glob
from PIL import Image
d, out, w, h, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
fs = sorted(glob.glob(d + '/*.png'), key=lambda f: float(f.split('_')[-1][:-4]))
ims = [Image.open(f).resize((w, h)) for f in fs]; rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (w * cols, h * rows))
for k, im in enumerate(ims): sh.paste(im, ((k % cols) * w, (k // cols) * h))
sh.save(out, quality=80); print(len(fs))
