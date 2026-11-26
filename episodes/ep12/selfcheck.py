"""Rule 7 self-check: contact sheet at 0,1,2,3,5,8,12 s and a per-second motion measure for the first 15 s (mean abs frame diff,
over 0.25 s steps); flags any 3 s stretch where the picture is nearly static."""
import sys, subprocess, numpy as np, json
from PIL import Image
f = sys.argv[1]; tag = sys.argv[2]
W, H = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout.strip().split(','))
w, h = (320, 180) if W > H else (180, 320)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-t', '15', '-vf', f'fps=4,scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
per_s = [round(float(d[i * 4:(i + 1) * 4].mean()), 2) for i in range(len(d) // 4)]
static = [i for i in range(len(d) - 12) if d[i:i + 12].max() < 0.4]
out = {'motion_per_second': per_s, 'static_3s_windows_at': [round(i / 4, 2) for i in static]}
print(json.dumps(out)); json.dump(out, open(f'selfcheck_{tag}.json', 'w'), indent=1)
ims = []
for t in [0, 1, 2, 3, 5, 8, 12]:
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(t), '-i', f, '-frames:v', '1', f'/tmp/sc_{t}.png'], check=True); ims.append(Image.open(f'/tmp/sc_{t}.png'))
tw, th = (480, 270) if W > H else (270, 480)
cols = 4 if W > H else 7; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * th), 'white')
for i, im in enumerate(ims): S.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
S.save(f'contact_{tag}.jpg', quality=85)
