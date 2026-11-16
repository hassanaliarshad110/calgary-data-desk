# Our own illustration: a Chinook arch over the Rockies with the downtown skyline, drawn from code, then inked like the game panels.
import numpy as np, cv2, sys
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from stylise import stylise
W, H = 1400, 1000
img = np.zeros((H, W, 3), np.float32)
ys = np.linspace(0, 1, H)[:, None]
# clear sky band under the arch: deep teal-blue at the top of the band to gold at the horizon
def lerp(a, b, t): return np.array(a, np.float32) * (1 - t) + np.array(b, np.float32) * t
for y in range(H):
    t = y / H
    img[y] = lerp((60, 30, 110), (255, 90, 60), min(1, t * 1.4)) if t < .72 else lerp((255, 120, 60), (255, 200, 90), (t - .72) / .28)
img = img[..., ::-1].copy()
# the arch: a heavy cloud deck whose lower edge is a long, almost straight arc
xs = np.arange(W); edge = 300 + 110 * ((xs - W * .55) / (W * .7)) ** 2
cloud = np.zeros((H, W), np.float32)
for x in xs: cloud[:int(edge[x]), x] = 1
rng = np.random.default_rng(7)
noise = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 18); noise = (noise - noise.min()) / (noise.max() - noise.min())
deck = lerp((70, 40, 90), (140, 70, 120), noise[..., None])[..., ::-1]
cm = cv2.GaussianBlur(cloud, (0, 0), 3)[..., None]
# lit underside of the arch
under = np.zeros((H, W), np.float32)
for x in xs: e = int(edge[x]); under[max(0, e - 26):e, x] = 1
um = cv2.GaussianBlur(under, (0, 0), 6)[..., None]
img = img * (1 - cm) + deck * cm; img = img * (1 - um * .8) + np.array((90, 150, 255), np.float32) * um * .8
# mountains: jagged ridgeline with snow caps
px = [0]; r2 = np.random.default_rng(3)
while px[-1] < W: px.append(px[-1] + int(r2.integers(50, 130)))
py = [700 - (r2.integers(70, 190) if i % 2 else r2.integers(0, 40)) for i in range(len(px))]
ridge = np.interp(xs, px, py)
for x in xs:
    r = int(ridge[x]); img[r:, x] = (120, 60, 70); img[r:min(H, r + 16), x] = (235, 220, 255)
# prairie and the downtown skyline with the Calgary Tower (silhouettes)
img[780:] = (40, 30, 50)
def rect(x0, y0, x1, y1, c): img[y0:y1, x0:x1] = c
for (x0, w, h) in [(420, 70, 230), (500, 60, 300), (570, 90, 200), (670, 55, 340), (735, 80, 260), (830, 60, 180), (900, 70, 240), (980, 50, 150)]:
    rect(x0, 780 - h, x0 + w, 781, (50, 35, 60))
    for yy in range(780 - h + 14, 770, 22):
        for xx in range(x0 + 10, x0 + w - 10, 16): rect(xx, yy, xx + 7, yy + 10, (120, 210, 255))
rect(1093, 470, 1109, 781, (70, 50, 80)); rect(1072, 446, 1130, 476, (40, 40, 210)); rect(1068, 468, 1134, 484, (70, 50, 80)); rect(1099, 400, 1103, 446, (70, 50, 80))
out = stylise(np.clip(img, 0, 255).astype(np.uint8), 'sunset')
cv2.imwrite(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'panels', 'chinook.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 93])
