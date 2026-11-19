import sys, glob
from PIL import Image, ImageDraw
fs = sys.argv[2:]; out = sys.argv[1]
ims = [Image.open(f) for f in fs]; w, h = ims[0].size; sc = 360 / w if w < h else 640 / w
tw, th = int(w * sc), int(h * sc); cols = min(len(ims), 6 if w < h else 3); rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * (th + 24)), 'white'); d = ImageDraw.Draw(S)
for i, (im, f) in enumerate(zip(ims, fs)):
    x, y = (i % cols) * tw, (i // cols) * (th + 24); S.paste(im.resize((tw, th)), (x, y + 24)); d.text((x + 4, y + 4), f.split('/')[-1], fill='black')
S.save(out, quality=85)
