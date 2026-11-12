# Phase 1 — Audit of existing animation capability (12 Nov 2026)

## What already existed (all preserved, nothing modified)

| Existing asset / skill | Where | What it actually is |
|---|---|---|
| `susuman-cartoon` skill + Susuman kit | repo branch `susuman-kit` | Canvas 2D rig for Qasim/Susuman and Ammi (front view), 3 sets, caption/bubble/burst helpers, amp() lip-sync, 11-scene Ep 1 template, desi score generator (dholak, harmonium, bansuri theme), SFX mixer, Kokoro + edge-tts voice cast run on GitHub Actions |
| `calgary-insight-video-explainer` | skill | Playwright-drawn 1080p scenes timed to Kokoro narration (Actions), ffmpeg assembly, logo rules |
| `calgary-storyteller`, `calgary-origins-documentary`, `calgary-civic-analyst`, `calgary-data-explainer` | skills | Writing/research playbooks for CalgaryInsight videos (they rely on the explainer pipeline for visuals) |
| `video-making` | skill | Generic render rules (one MP4 per scene, concat with `-c copy`) |
| `game-assets-enhancement` | skill | Sprite generation through fal.ai (paid) for games |
| 17 published CalgaryInsight videos | `main:ui/video/*.mp4` | Finished videos + posters |
| 17 3D character meshes | branches `game-3d-src*` | Tripo-generated GLB meshes from the Calgary game — **static: no skeleton, no animation clips** (verified by reading each file's glTF JSON: `skins: 0, animations: 0`) |
| Studio branches (`studio-probe`, `studio-videos`, `content-studio`) | repo | Narration probe + content calendar/packages for the automated CalgaryInsight program |

## Gaps found
- **Characters:** only 2 rigged characters (Susuman series only, front view only). No turnaround, no side/back views, no walk/run cycles beyond simple bobbing, no expression library, no reusable cast for news or documentary.
- **Rigs vs. statics:** the 17 game GLBs look like characters but cannot move — they need auto-rigging (external) first.
- **Environments:** 3 Susuman sets (desi interiors). Nothing for newsroom, office, hospital, school, Calgary skyline, mountains, historical or futuristic scenes; no parallax layering.
- **Props, VFX, transitions, camera presets, text animation:** written ad hoc inside each video; nothing reusable or catalogued.
- **Broadcast graphics:** none (no lower thirds, banners, tickers, bugs, stings).
- **Maps & data:** charts were per-video HTML; no map renderer, no geodata on disk.
- **Audio:** desi score + 7 synthesized SFX; nothing for news/documentary/comedy; no ambiences.
- **3D:** no 3D scene pipeline at all; no realistic Calgary model.
- **Formats not supported:** Lottie, animated SVG, glTF animation playback, HDRI lighting.
- **Duplicates:** `music.py` and `musiclib.py` in the Susuman kit share the same instrument functions (musiclib is the library copy); the published videos exist both in `main:ui/video` and `studio-videos`. No other duplicate animation files were found.
- **Tooling limits in this workspace:** no Blender, no internet except GitHub/package registries — downloads and TTS therefore run on the repo's GitHub Actions (same method as the existing narration).

## Reusable-component opportunities taken
One shared engine (`engine/`) that all three channels use, with channel themes on top; a generic renderer (`render/render.py`) instead of one per video; voice timing → lip-sync as a standard step; one catalogue with licences so assets can be picked automatically.
