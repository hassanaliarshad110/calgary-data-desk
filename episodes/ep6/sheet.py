"""Contact sheet of preview frames: python3 sheet.py out.jpg prev/a.jpg prev/b.jpg ..."""
import sys
from PIL import Image
fs = sys.argv[2:]; n = len(fs); cols = min(n, 4); rows = (n + cols - 1) // cols
W, H = 360, 640
sh = Image.new('RGB', (cols * W, rows * H), 'black')
for i, f in enumerate(fs): sh.paste(Image.open(f).resize((W, H)), ((i % cols) * W, (i // cols) * H))
sh.save(sys.argv[1], quality=85)
