# Awazzzz Originals — Hindi/Urdu explainer kit
Episode 1: "NVIDIA ke Boss ke Peeche Chini Jasoos?" (6:23) — source files in the root are that episode; copy and adapt for new ones.

## Pipeline (run in /home/claude/<work dir>)
1. lines.py — script: list of (id, speaker, tts_text Devanagari/Urdu, roman_caption). Narrator N = hi-IN-SwaraNeural +12% +3Hz (Hassan, Nov 13 2026: energetic; Madhur sounded boring — keep Madhur only as a secondary male voice) (Hindustani words, numbers as words, English loanwords in Devanagari or Latin caps). Character voices: ur-IN-SalmanNeural, hi-IN-SwaraNeural, ur-PK-AsadNeural, ur-PK-UzmaNeural (Urdu script for ur-* voices). `python3 lines.py` writes nv_lines.json.
2. Voices: copy nv_lines.json + tts_nv.py to the budget-probe branch as probe/nv_lines.json + probe/tts_nv.py, point .github/workflows/budget-probe.yml at `python probe/tts_nv.py _b`, commit as Hassan Ali, push -f, poll `git ls-remote origin budget-probe-out` until it changes, clone -b budget-probe-out.
3. prep_audio.py (expects mp3s in ../nvout) → aud/*.wav + aud_info.json; timeline.py (PLAN of scenes ↔ lines) → timeline.js/json.
4. rig.js (characters/props, KINDS incl. jensen) + scenes.js (DRAW.<scene>(t,d), subtitles, watermark "Awazzzz ORIGINALS", end card with logo + LIKE/SHARE/SUBSCRIBE) + thumb.js. index.html loads fonts/ + logo.jpg.
5. `python3 render.py preview <T> ...` → prev/*.jpg ; `python3 render.py full <a> <b> out.mp4` (run 2 halves in parallel).
6. music.py (score, sections by chapter) → mix.py (voices + ducked score + SFX, loudnorm -14) → ffmpeg mux. RULE (Hassan, Nov 13 2026): every Awazzzz video has an energetic background score that is clearly audible all the way through — bed gain ~0.42, ducked only to ~50% under voice (never 0.20/55%). Pulse/kick + bass + arp, booms/whooshes on chapter and reveal moments. Template: episodes/short_news1/score_mix.py.
7. shorts.py — 4 vertical 1080x1920 Shorts from short_segs.json, each with spoken opening + closing hook (h{k}o/h{k}e voice lines), branded frame, covers.

## Style
Paper Billions-like flat vector look, palette #121B2B / #F4D06F / #2BFF88, bean-body characters. From Nov 12 2026 the standing style is **2.5D**: same 2D characters, but every scene built from 3-4 parallax layers, camera moves through them, soft shadows, light pools/glow, haze on far layers, slight blur on nearest/farthest layers.
