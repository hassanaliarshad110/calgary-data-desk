# Ep3 — Honey Trap Files #1 (India strategy v2 template)
- First episode of the India-only strategy (Nov 13, 2026). Use this as the template.
- 2.5D helpers live at the top of scenes.js: depth() parallax layers + haze, drift(), shadow(), lightPool(), sky(), bokeh(), tag(), sanketik(), card(), phoneUI(), msg(), folder(), checkRow(), courtSet().
- Real people = generic symbolic characters + "SANKETIK CHITRAN" tag; allegations always "aarop"; dramatised chat lines get the NAATYA RUPANTAR tag.
- Do NOT draw an India outline map (Kashmir boundary issue) — use city pins on an abstract board.
- Avoid the 'grey' hair style for Indian men: it reads as a prayer cap. Use 'short' or 'buzz'.
- edge-tts refused some lines repeatedly ("No audio"): send 2-3 reworded variants and keep the one that works.
- Render: python3 render.py full 0 170 partA.tmp.mp4 & python3 render.py full 170 END partB.tmp.mp4 (2 cores), then concat + mix.

## Update 14 Nov 2026
n31 and n36 rewritten after Jensen Huang resigned (12 Nov, SEC 8-K): board probe ongoing; he will testify before Congress. Caveat chip and the 'next' calendar card changed (12 NOV · ISTIFA). Lines kept in the Madhur voice for consistency inside this episode. Music bed raised to 0.42 with 50% ducking.
- Nov 14, 2026: Shorts 2-4 re-voiced with hi-IN-SwaraNeural (female-only rule); full video and Short 1 were already published in the Madhur voice.

## Update 15 Nov 2026 — Shorts are full-screen vertical
- Parts 3 and 4 rebuilt full-bleed 1080x1920 (shorts/short3_fs.mp4, short4_fs.mp4; hosted on awazzz-media ep3/). Every scene (zchat, quote, list, tips) is redrawn natively in portrait in scenes_v.js, plus portrait hook/closing scenes (hook3 = Zara reveal, hook4 = target on 'you', end3 = FARAAR poster, end4 = tips wall).
- Audio = the female-voice mix of short{k}_f.mp4 (f45ae42) unchanged; shorts.py measures the static hook-card lengths with freezedetect so the new picture lines up frame-exactly.
- Fallback crop (no DRAWV for a scene) works but the default slow pan cuts the 16:9 cards/headlines (tested on Part 2) — add "focus" keyframes per scene in shorts_cfg.json, or better, a DRAWV recomposition, before using it.
- shorts_f.py / short_segs.json are the old banded layout — do not use.
