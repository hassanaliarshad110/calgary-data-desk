# Game box-art poster (GTA-related posts)

Calgary Insight's "open-world game box art" look, first used on the GTA 6 eve posts (Nov 18, 2026; Hassan's request, Nov 16, 2026). PLAYBOOK.md section "GTA-RELATED POSTS" says when to use it. Free: Playwright + OpenCV + ffmpeg, no credits.

Examples: `example-9x16.jpg` (Reels/Shorts cover with a PART badge), `example-16x9.jpg` (YouTube thumbnail).

## The look (homage, never a copy)
- 6-9 tilted comic panels, thick black borders on a cream gutter, saturated sunset/neon grade.
- Wordmark: "GRAND TOUR" over "CALGARY" in Bowlby One, white, thick black outline, 3D extrude (variant B "YYC CITY / STORIES" in Anton is in poster.py; A tested stronger).
- Neon script tag "Cowtown City" in Pacifico, hot pink glow.
- Chips "calgaryinsight.ca/<page>" and "FREE • PLAY IN YOUR BROWSER" (change to fit the post), sub-line with the real product name.
- Hook line in Fira Sans (house font) at the top: the only place "GTA 6" may appear.
- Hard limits: never "GTA" / "Grand Theft Auto" in the wordmark; never the Pricedown font, any Rockstar logo, font, key art or character (or look-alikes); no brand logos; no real people. Keep "Not affiliated with Rockstar Games." on vertical covers and in descriptions.

## Files
| File | What it does |
|---|---|
| `stylise.py` | Turns gameplay/our own frames into comic panels: bilateral smoothing, sunset sky replacement on day skies, saturation punch, posterize (6 levels), halftone shadows, Canny ink lines. `FRAMES=<dir of 1920x1080 frames> PANELS=<out dir> python3 stylise.py`; edit the `P` table (frame, crop box, grade) per job, and keep crops clear of burned-in captions, chips and HUD. |
| `chinook.py` | Our own illustrated panel: Chinook arch over the Rockies with the downtown skyline and the Calgary Tower, drawn from code, then inked. |
| `poster.html` | The template: panels, wordmark, neon tag, chips, hook line, optional PART badge, optional 311-style pin, and the animation (`render(t)`: panels slam in with overshoot and flash, wordmark punch + camera shake, neon flicker, horizontal whip with motion blur into the next video's first frame). |
| `poster.py` | Layouts for 1080x1920, 1280x720 (rendered x1.5 for 1920x1080 video) and 1080x1350, variants A/B. `python3 poster.py stills OUT` (A and B for review), `python3 poster.py final OUT` (JPEG covers), `python3 poster.py frames A 1080x1920 OUT first_frame.jpg 30 1.8` (hook frames). Run it next to `poster.html`, `fonts/` and `panels/`. |
| `build_hook.py` | Prepends the hook to a finished video: encodes only the hook with the original's x264 settings (same CRF, size, fps, timescale; VUI colour/aspect tags stripped so SPS/PPS match byte for byte), concat demuxer `-c copy`, rebuilds the soundtrack once (song bars before the video's music + synthesised slams/whoosh from motion/engine/sfx.py, then the original mix untouched), -14 LUFS with a limiter only if needed, AAC 192k. `python3 build_hook.py FRAMES ORIGINAL.mp4 OUT.mp4 CRF`. Read the CRF from the original (`strings file.mp4 | grep -o "crf=[0-9.]*"`). Change `SONG`/`SONG_AT` for another track. |

## Fonts (all free, OFL; licences in `fonts/`)
- Bowlby One (wordmark), Anton (variant B wordmark), Bungee (badges, pin), Pacifico (neon tag): Google Fonts, fetched through the asset-probe lane (branch asset-probe-out3) and the studio library (animation-studio acquired/fonts).
- Fira Sans Bold/SemiBold (hook line, chips, sub-line): the house font from motion/engine/fonts.

## Timing that worked (1.8 s, 54 frames at 30 fps)
Panels 0.1 s apart from -0.2 s (three already on screen at frame 0 with the hook line), wordmark at 0.76 s, neon at 0.94 s, hold, whip 1.5-1.77 s landing exactly on the video's first frame. Music about -17 LUFS under the poster, easing out under the video's first 0.35 s.
