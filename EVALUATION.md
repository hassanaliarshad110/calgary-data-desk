# Phase 8 — Quality test of the three demonstrations

| | CalgaryInsight documentary | Cartoon two-hander | News bulletin |
|---|---|---|---|
| File | `demos/calgary_doc/CalgaryInsight_Demo_City_Above_the_Street.mp4` | `demos/cartoon/Cartoon_Channel_Demo_The_Trick.mp4` | `demos/news/News_Channel_Demo_Breaking_Bulletin.mp4` |
| Length / format | 42.6 s · 1920×1080 · 30 fps · H.264 + AAC | 26.6 s · same | 36.6 s · same |
| Voice | Kokoro `af_heart` (free, GitHub Actions) | Kokoro `bm_george` + `af_bella` (pitched) | Kokoro `am_michael` |
| Render time (this workspace, CPU only) | ~12 min (3D scenes ≈ 0.7 s/frame on software WebGL) | ~1.5 min | ~2 min |
| Audio | voice −18 dB mean, music ducked under voice, peaks −0.7 dB | same targets | same targets |

**Visual quality.** 2D: clean vector toon style, consistent line weight, layered sets with parallax. 3D: real downtown geometry from OpenStreetMap (3,097 buildings incl. Calgary Tower, The Bow, Brookfield Place) with HDRI lighting — reads as a clean "architectural model" look, not photoreal (no textures on buildings, no shadows: SwiftShader is too slow for shadow maps here).

**Motion smoothness.** 30 fps throughout; motions are continuous functions of time (no frame-stepping); clip changes crossfade with `perform()`. Walk/run cycles are tied to stride length to avoid foot sliding when speeds match `strideSpeed()`.

**Character consistency.** Each character is one `CAST` entry drawn by the same rig in every shot and every video, so proportions, colours and outfits cannot drift. Lip-sync follows voice loudness (10 mouth shapes) — convincing for dialogue, not phoneme-exact.

**What I checked.** Contact sheets of every scene (frames looked at), durations against the voice timeline, audio loudness, licences of every acquired file. **Not verifiable by me:** how the voices and music sound (I can't listen) — please give them a listen.

**Known weaknesses.** Rig is 2D toon (no cloth/hair physics); hands are simple mitts; 3D buildings have no facade textures; Overpass road network did not download (roads absent from 3D city); Plus 15 bridges shown are only those mapped in OSM (48 ways), labelled as such on screen.
