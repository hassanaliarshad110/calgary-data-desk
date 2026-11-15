# thumbnails: 16:9 YouTube (1280x720) and 9:16 covers (1080x1920)
# usage: python3 thumbs.py wide <bg.jpg> out.jpg  |  python3 thumbs.py tall <bg.jpg> out.jpg "<kicker>" "<line2>"
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
sys.path.insert(0, '/home/claude/gta6')
from compose import font, logo, GOLD, WHITE, NAVY

def grade(im):
    im = ImageEnhance.Contrast(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.25); return im

def outlined(d, xy, text, f, fill, sw=6, anchor='la'):
    d.text(xy, text, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=(0, 0, 0))

def wide(bg, out):
    W, H = 1280, 720
    im = grade(Image.open(bg).convert('RGB')).resize((W, H), Image.LANCZOS).convert('RGBA')
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    for x in range(W):   # left-side darkening for the words
        a = int(205 * max(0, 1 - x / 820) ** 1.3); d.line([(x, 0), (x, H)], fill=(5, 12, 28, a))
    im.alpha_composite(sh); d = ImageDraw.Draw(im)
    outlined(d, (46, 52), 'GTA 6 TOMORROW?', font('b', 64), WHITE, 5)
    outlined(d, (40, 128), 'PLAY', font('b', 118), WHITE, 7)
    outlined(d, (40, 246), 'CALGARY', font('b', 150), GOLD, 8)
    outlined(d, (44, 404), 'TODAY', font('b', 104), WHITE, 7)
    # FREE badge
    bx, by = 900, 70; d.rounded_rectangle((bx, by, bx + 320, by + 130), 26, fill=(200, 16, 46, 255), outline=(255, 255, 255, 255), width=6)
    d.text((bx + 160, by + 67), 'FREE', font=font('b', 92), fill=WHITE, anchor='mm')
    d.rounded_rectangle((44, 560, 652, 628), 34, fill=(8, 21, 48, 225))
    d.text((72, 594), 'Real map · real landmarks · in your browser', font=font('s', 28), fill=WHITE, anchor='lm')
    im.alpha_composite(logo(84), (W - 84 - 36, H - 84 - 30))
    d.text((W - 136, H - 72), 'calgaryinsight.ca', font=font('s', 26), fill=WHITE, anchor='rm', stroke_width=3, stroke_fill=(0, 0, 0))
    im.convert('RGB').save(out, quality=92)

def tall(bg, out, kicker, line2):
    W, H = 1080, 1920
    im = grade(Image.open(bg).convert('RGB')).resize((W, H), Image.LANCZOS).convert('RGBA')
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    for y in range(H):
        a = int(200 * max(0, 1 - abs(y - 760) / 620) ** 1.2); d.line([(0, y), (W, y)], fill=(5, 12, 28, a))
    im.alpha_composite(sh); d = ImageDraw.Draw(im)
    cx = 60 + (W - 210) / 2
    outlined(d, (cx, 380), 'GTA 6 TOMORROW?', font('b', 78), WHITE, 6, 'ma')
    outlined(d, (cx, 490), 'PLAY', font('b', 150), WHITE, 8, 'ma')
    outlined(d, (cx, 650), 'CALGARY', font('b', 176), GOLD, 9, 'ma')
    outlined(d, (cx, 840), 'TODAY', font('b', 130), WHITE, 8, 'ma')
    d.rounded_rectangle((cx - 170, 1010, cx + 170, 1140), 28, fill=(200, 16, 46, 255), outline=(255, 255, 255, 255), width=6)
    d.text((cx, 1076), 'FREE', font=font('b', 96), fill=WHITE, anchor='mm')
    if kicker:
        d.rounded_rectangle((cx - 360, 1190, cx + 360, 1290), 50, fill=(8, 21, 48, 230))
        d.text((cx, 1240), kicker, font=font('b', 52), fill=GOLD, anchor='mm')
    if line2: outlined(d, (cx, 1320), line2, font('s', 46), WHITE, 4, 'ma')
    im.alpha_composite(logo(84), (int(cx - 42), 150))
    im.convert('RGB').save(out, quality=92)

if __name__ == '__main__':
    if sys.argv[1] == 'wide': wide(sys.argv[2], sys.argv[3])
    else: tall(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else '', sys.argv[5] if len(sys.argv) > 5 else '')
