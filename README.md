# STUDIO — multi-channel animation library (CalgaryInsight · Cartoon Channel · News Channel)

A code-first animation studio: every character, set, prop, effect, graphic and camera move is a reusable,
time-driven function, so any frame of any video can be re-rendered and every asset stays identical across videos.

```
engine/      core.js (camera, parallax, transitions, text, lip-sync, compositing) · chars.js (2D rig + 16-character cast incl. the Susuman ensemble + 31 motions + 16 expressions + 10 visemes)
             sets.js (16 layered environments) · props.js (53 props + 5 food variants) · fx.js (24 effects) · graphics.js (charts, maps, broadcast, documentary) · city3d.js (3D Calgary, three.js)
render/      render.py (Playwright → one MP4 per scene) · audio.py (SFX/ambience/music synth + ducking mixer) · lipsync.py (voice → mouth track) · serve.py
assets/      characters/<key>/ sheets · audio/ (synthesized) · lottie/ (15 original Lotties) · svg/ (6 animated SVGs) · reels/Engine_Reel.mp4
acquired/    downloaded CC0 / CC-BY / OFL / MIT / ODbL / public-domain assets + manifest*.json (source, licence, format, permissions for every file)
catalog/     catalog.json · catalog.csv · catalog.html (thumbnail browser) · select_assets.py (brief → asset plan) · build_catalog.py · make_html.py
channels/    calgaryinsight/ cartoon/ news/ shared/  → package.json (theme, fonts, voice, music, rules, asset list)
demos/       calgary_doc/ cartoon/ news/  → index.html (scenes) + build.py (timeline → render → mix → MP4) + finished MP4
tools/       sheets.html (turnaround/expression/viseme/pose sheets) · library.html · reels.html · rig3d_reel.html · model3d.html · lottie.html · make_lottie.py · import_pack.py · build_reels.py
```

## Make a new video (any channel)
1. **Pick assets:** `python3 catalog/select_assets.py brief.json` (or `--text "news: storm map with presenter"`).
2. **Copy the nearest demo** folder (`demos/news`, `demos/cartoon`, `demos/calgary_doc`), edit the lines and the `DRAW_FN` scenes.
3. **Voices:** add lines to `probe/demo_lines.json` on the repo's `asset-probe` branch (Kokoro, free on GitHub Actions) — or reuse the existing studio/budget probe.
4. `python3 build.py timeline` → `render` → `mix` (writes the MP4).
Preview single frames first: `python3 render/render.py demos/x/index.html preview <scene>:<t>`.

## Using the rig
```js
drawChar(CAST.sakina, MOVES.walk(t, { yaw: Math.PI/2 }), x, groundY, scale, { t });   // any of 31 motions
const p = MOVES.talk(t, { expr: 'smug' }); p.face.mouth = visemeAt(LIPS.tracks.z0, t); // lip-sync from audio
perform([{ move: 'walk', t0: 0 }, { move: 'turn', t0: 2, opts: { from: Math.PI/2, to: 0 } }, { move: 'wave', t0: 2.5 }], t); // blended sequence
jointPos(CAST.dadaAbu, pose, x, gy, s, 'wriL') // attach props to hands/head
```
New character = a new entry in `CAST` (age, build, skin, hair style, outfit type, accessories). New motion = a function in `MOVES` returning a pose.

## Adding assets you download yourself
Kenney's site blocks automated downloads (its pages are tagged `noai` / text-and-data-mining reserved), and Mixamo and LottieFiles need a login. Download the pack in a browser, then:
`python3 tools/import_pack.py kenney_city-kit.zip --source "Kenney - City Kit" --url https://kenney.nl/assets/city-kit-commercial --licence CC0 --category environments/3d_city --include "*.glb"`
and rebuild the catalogue: `python3 catalog/build_catalog.py && python3 catalog/make_html.py`.

## Licences (summary)
Original engine art, audio, Lotties and SVGs: Hassan Ali's own work. Acquired files keep their own licence (see `acquired/manifest*.json` and the catalogue):
Poly Haven, Natural Earth, RobotExpressive, Fox: CC0 / public domain · Google Fonts: OFL / Apache · three.js, lottie-web, d3, turf: MIT/ISC · GSAP: GSAP no-charge licence ·
OpenStreetMap data: ODbL, credit "© OpenStreetMap contributors" · City of Calgary open data: credit the City · Kevin MacLeod music and CesiumMan / RiggedFigure: CC BY 4.0, credit required.

## Susuman ensemble
`SUSUMAN_ENSEMBLE` in engine/chars.js: qasim, susuman, ammi, dadaAbu, dadi, sakina (elder sister, the only one who knows the secret), basim, zahra, ammar, officer, latifa, dharmender, daniel, amara. Sheet: `assets/characters/susuman/susuman_ensemble.png`. Old keys (chacha, zoya, rafi, nani, maya, marcus, layla, jamal) still resolve to the renamed characters.
