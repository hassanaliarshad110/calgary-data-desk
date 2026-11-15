# Susuman compilations ("Saare Episodes")
Weekly long video for TV watch time: title card (5 s) → [episode card (2 s) → episode] × N, all TRUE 16:9.
1. `python3 render_comp_gfx.py <out> '<json {"n":N,"eps":[{"ep":1,"title":"...","animal":"cat|pilla|kabootar|kulfi"}]}>'` → title_card.png, card_epN.png, thumb_16x9.jpg (1280x720). Graphics reuse rig.js + episodes/ep4 helpers (comp.html / comp.js); add a new animal to `animal()` in comp.js for new episodes.
2. `python3 stings.py <out>` → title/card music stings from musiclib.py.
3. `python3 build_compilation.py <work> <out.mp4> <spec.json>` → crf 18 / AAC 192k, every episode loudnorm'd to -14 LUFS; writes `<out>.chapters.json` (episode start = its card start).
4. If the result is > ~95 MB: `sh fit_github.sh in.mp4 out.mp4 95` (GitHub 100 MB limit; LFS upload is blocked by the sandbox proxy).
Sources: only TRUE 16:9 renders (ep1/susuman_ep1_16x9_true.mp4, barish/susuman_barish_16x9.mp4, ep2/susuman_patang_16x9.mp4, epN/susuman_epN_16x9.mp4) — never the side-panel files (ep1/susuman_ep1_16x9.mp4, ep2/susuman_ep2_16x9.mp4).
Only include episodes already live on YouTube at the compilation's publish time. First chapter 0:00 = Ep 1 (title card folded in; YouTube needs chapters ≥ 10 s).
