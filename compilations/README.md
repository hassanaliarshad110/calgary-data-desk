# Susuman compilations ("Saare Episodes")
Weekly long video for TV watch time: title card (5 s) → [episode card (2 s) → episode] × N, all TRUE 16:9.
1. `python3 render_comp_gfx.py <out> '<json {"n":N,"eps":[{"ep":1,"title":"...","animal":"cat|pilla|kabootar|kulfi"}]}>'` → title_card.png, card_epN.png, thumb_16x9.jpg (1280x720). Graphics reuse rig.js + episodes/ep4 helpers (comp.html / comp.js); add a new animal to `animal()` in comp.js for new episodes.
2. `python3 stings.py <out>` → title/card music stings from musiclib.py.
3. `python3 build_compilation.py <work> <out.mp4> <spec.json>` → crf 18 / AAC 192k, every episode loudnorm'd to -14 LUFS; writes `<out>.chapters.json` (episode start = its card start).
4. If the result is > ~95 MB: `sh fit_github.sh in.mp4 out.mp4 95` (GitHub 100 MB limit; LFS upload is blocked by the sandbox proxy).
Sources: only TRUE 16:9 renders (ep1/susuman_ep1_16x9_true.mp4, barish/susuman_barish_16x9.mp4, ep2/susuman_patang_16x9.mp4, epN/susuman_epN_16x9.mp4) — never the side-panel files (ep1/susuman_ep1_16x9.mp4, ep2/susuman_ep2_16x9.mp4).
Only include episodes already live on YouTube at the compilation's publish time. First chapter 0:00 = Ep 1 (title card folded in; YouTube needs chapters ≥ 10 s).

## Danger-first compilation (from Nov 22, 2026 — STRATEGY.md retention rules; replaces the title-card layout above)
No title card, no episode cards, no narrator recap. `build_coldopen_comp.py` + `spec_<date>.json`:
- 0:00 cold open = the best episode's most exciting rescue moment (8–12 s, mid-action, its own sound) + 2–4 word Roman hook (`hook.png`) + small corner badge (`badge_s.png`).
- Episodes best-performing first (YouTube views via Metricool YTVP06); the newest episode last (its cliffhanger flash + end card stay).
- Each episode starts where its danger is first on screen (after the narrator recap / setup scenes; checked on frames) and ends right after the narrator's "Bachcho, …" lesson (LIKE + SUBSCRIBE part of the end card dropped; `vend` holds the picture where the burned-in caption switches before the lesson audio ends).
- Joins: 1 s whoosh slide (last lesson frame held, next episode slides in with its own sound) + a 3 s "EPISODE N" pill.
1. `python3 render_comp9_gfx.py <gfx> '{"n":9,"hook":"BANDAR KHATRE MEIN!","eps":[5,6,...]}'` → thumb_16x9.jpg (Susuman left, 4 animals in danger right, SAARE EPISODES, count badge), hook.png, badge(_s).png, epN.png.
2. `python3 build_coldopen_comp.py <work> <master.mp4> spec.json` → crf 18 / AAC 192k master, pieces gain-matched to -14 LUFS, `<master>.chapters.json`.
3. `sh fit_github.sh master.mp4 final.mp4 95`, then `python3 comp_meta.py <chapters.json> yt.json` for title/description/tags (no keyword lists in the description: other-script keywords go in tags).
Reference cut points used on Nov 22 (source seconds): Ep1 45.4–104.39 (hold 104.065), Ep2 Barish 22.65–87.11, Ep3 Patang 43.85–105.51, Ep4 35.4–104.06, Ep5 16.43–107.09, Ep6 36.3–110.41 (hold 110.28), Ep7 31.5–109.81, Ep8 cold-open file 0–94.22, Ep9 0–end; cold open Ep5 57.4–67.5.
