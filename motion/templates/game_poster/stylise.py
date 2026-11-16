# Comic-panel stylise: smooth -> sunset/neon grade -> posterize -> ink edges -> halftone shading. Free, deterministic.
import cv2, numpy as np, json, sys
from PIL import Image
import os
FR = os.environ.get('FRAMES', '/home/claude/hook/fr/')          # folder of full-res gameplay frames (1920x1080)
OUTP = os.environ.get('PANELS', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'panels'))
SKY = {'tower', 'skyline', 'river'}
P = {  # name: (frame, crop x0,y0,x1,y1 in 1920x1080, grade)
 'tower':  ('L_230.5.jpg', (380, 180, 1480, 860), 'sunset'),
 'stage':  ('S_95.jpg',    (420, 100, 1800, 850), 'neon'),
  'midway': ('L_65.jpg',    (560, 330, 1600, 860), 'neon'),
 'fireworks': ('L_69.5.jpg', (600, 60, 1500, 850), 'neon'),
 'dome':   ('L_76.jpg',    (520, 330, 1500, 870), 'neon'),
 'ctrain': ('L_108.jpg',   (520, 340, 1440, 900), 'sunset'),
 'r311':   ('L_117.jpg',   (300, 330, 1800, 870), 'teal'),
 'heli':   ('L_225.jpg',   (700, 180, 1700, 880), 'sunset'),
 'mp':     ('L_205.jpg',   (250, 330, 1700, 880), 'teal'),
 'skyline':('L_233.5.jpg', (300, 180, 1700, 860), 'sunset'),
 'car':    ('L_9.jpg',     (300, 180, 1500, 860), 'sunset'),
 'river':  ('L_60.jpg',    (500, 180, 1800, 850), 'sunset'),
}
GR = {'sunset': [(255, 120, 40), (255, 60, 140)], 'neon': [(140, 40, 255), (255, 40, 170)], 'teal': [(20, 200, 220), (255, 150, 40)]}
def sunset_sky(img):
    # replace the daylight sky (bright/blue region touching the top edge) with a box-art sunset gradient
    h, w = img.shape[:2]; hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    cand = ((hsv[..., 2] > 150) & ((hsv[..., 1] < 90) | ((hsv[..., 0] > 90) & (hsv[..., 0] < 130)))).astype(np.uint8)
    cand = cv2.morphologyEx(cand, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab = cv2.connectedComponents(cand); top = set(np.unique(lab[0])) - {0}
    m = np.isin(lab, list(top)).astype(np.float32)
    m = cv2.GaussianBlur(m, (7, 7), 0)[..., None]
    ys = np.linspace(0, 1, h)[:, None, None]; stops = np.array([[70, 30, 120], [200, 50, 140], [255, 110, 70], [255, 190, 90]], np.float32)[:, ::-1]
    k = np.clip(ys * 1.6, 0, 1) * 3; i = np.clip(k.astype(int), 0, 2); f = k - i
    grad = stops[i[..., 0]] * (1 - f) + stops[np.clip(i[..., 0] + 1, 0, 3)] * f
    grad = np.broadcast_to(grad, (h, w, 3))
    # keep cloud texture: modulate by the original luminance a little
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)[..., None] / 255
    sky = np.clip(grad * (0.8 + 0.35 * (lum - 0.7)), 0, 255)
    return (img * (1 - m) + sky * m).astype(np.uint8)
def stylise(img, grade, sky=False, night=False):
    if night:
        img = np.clip(255 * (img / 255.0) ** 0.72, 0, 255).astype(np.uint8)
    if sky: img = sunset_sky(img)
    h, w = img.shape[:2]
    a = cv2.bilateralFilter(img, 9, 60, 9); a = cv2.bilateralFilter(a, 9, 50, 7)
    # saturation / contrast punch
    hsv = cv2.cvtColor(a, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * 1.55 + 12, 0, 255)
    hsv[..., 2] = np.clip((hsv[..., 2] - 128) * 1.18 + 136, 0, 255); a = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32) / 255
    # gradient grade (soft light), strongest at the top (sky)
    c0, c1 = [np.array(c[::-1], np.float32) / 255 for c in GR[grade]]
    t = np.linspace(0, 1, h)[:, None, None]; g = c0 * (1 - t) + c1 * t
    sl = np.where(g < .5, 2 * a * g + a * a * (1 - 2 * g), 2 * a * (1 - g) + np.sqrt(a) * (2 * g - 1))
    wgt = (0.55 - 0.25 * t); a = a * (1 - wgt) + sl * wgt
    # posterize (6 levels per channel)
    L = 6; a = np.round(a * (L - 1)) / (L - 1)
    out = (np.clip(a, 0, 1) * 255).astype(np.uint8)
    # halftone dots in the shadows
    gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    s = 9; yy, xx = np.mgrid[0:h, 0:w]; u = ((xx + yy) % s) - s / 2; v = ((xx - yy) % s) - s / 2
    r = np.sqrt(u * u + v * v) / (s * .7); dots = (r < np.clip((0.55 - gray) * 1.6, 0, 1)).astype(np.float32)
    out = (out.astype(np.float32) * (1 - 0.45 * dots[..., None])).astype(np.uint8)
    # ink lines
    g2 = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    e = cv2.Canny(g2, 60, 140); e = cv2.dilate(e, np.ones((2, 2), np.uint8))
    out[e > 0] = (out[e > 0] * 0.12).astype(np.uint8)
    return out
if __name__ == '__main__':
    for n, (f, (x0, y0, x1, y1), gr) in P.items():
        im = cv2.imread(FR + f)[y0:y1, x0:x1]
        im = cv2.resize(im, None, fx=1.25, fy=1.25, interpolation=cv2.INTER_CUBIC)  # a bit more resolution for the ink
        cv2.imwrite(f'{OUTP}/{n}.jpg', stylise(im, gr, n in SKY, gr == 'neon'), [cv2.IMWRITE_JPEG_QUALITY, 93])
        print(n, im.shape)
