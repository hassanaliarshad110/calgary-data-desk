import sys, os
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]
ims = [Image.open(f) for f in files]; W, H = ims[0].size
tw = 270 if H > W else 480; th = int(tw * H / W); cols = 8 if H > W else 4
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * (th + 22)), 'white'); d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * tw, (i // cols) * (th + 22); S.paste(im.resize((tw, th)), (x, y + 22)); d.text((x + 4, y + 4), os.path.basename(f), fill='black')
S.save(out, quality=82)
