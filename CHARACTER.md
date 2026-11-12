# SUSUMAN — character bible (keep identical in every video)

Reference: `Susuman_model_sheet.jpg`. Drawing code: `rig.js` (`susu()`, `ammi()`); never redraw by hand or with an image AI.

## Qasim / Susuman
- Real name QASIM, a 4-year-old desi boy; secretly he is SUSUMAN, who saves the world, kids and animals. Big dark-brown curly hair with a fringe swooping over the forehead.
- Signature look: thick serious eyebrows (frown), big brown eyes, small mouth.
- Black hoodie with red hood lining and red cuffs, white drawstrings, gold drop emblem on chest.
- Silver kara on his right wrist. Dark joggers, white sneakers with red stripe.
- Power form (after the flush): gold aura, red cape, floating gold/white crown, bigger chest emblem.
- Power rule: every washroom trip + flush fills the SUSU POWER bar. The washroom is never shown inside: door closes, gold light under the door, "FLUUSH!", he bursts out.
- Catchphrase gag: "Ammi! Susu aayi hai!" → Ammi: "Phir se?! Abhi to gaye the!"
- Parents don't know his power.

## Ammi
- Teal kurta, pink dupatta, white shalwar, black hair in a bun with centre parting, gold earrings, usually on her phone.

## Voices — see voices/voices.json
- Qasim: Kokoro hf_beta pitched up ×1.28 (child voice). Ammi: ur-PK-UzmaNeural. Narrator: ur-PK-AsadNeural (Edge neural TTS, Urdu script). Reference clips in voices/.

## Music
- music.py: synthesised desi cartoon band (dholak/tabla kaharwa groove, harmonium chords, bansuri theme in D major, rubab-style plucks for sneaky moments, big hit for the Susuman reveal). Keep the bansuri THEME as the show's signature tune.

## Style
- Titles: Bangers (white, black stroke, red shadow). Subtitles: Baloo 2 ExtraBold, Roman script, speaker chip (QASIM red, AMMI teal).
- Vertical 1080×1920 for Shorts; captions y≈1290–1420; first 2 s = text hook + visual hook.
- Audience: India + Pakistan. Hindustani words common to both. Kids content (YouTube "Made for Kids" → no comment CTA; use Like/Subscribe).

## Render
`python3 render.py preview <scene>:<t>` · `python3 render.py full` · `python3 mix.py` · concat scenes + mix.wav with ffmpeg.

## Side cast (Episode 1) — see Susuman_side_cast.jpg, functions in episodes/ep1/ep1.js
- BUNTY: gali cricket captain, ~9, spiky hair, blue shirt no. 10 with yellow stripe, dark shorts, chappals. Bossy but kind at heart.
- GUDDU: bowler, chubby, round glasses, yellow shirt with orange stripe, brown shorts. Laughs a lot.
- MANO: white-and-orange kitten Qasim saves; now follows him around.
- Gali dog (brown stray, harmless).
- Susuman outdoor look: same power form + black sunglasses as a mask.
- Set: gali() parallax street — pastel houses with green shutters, balconies, water tanks, clotheslines, kites, birds, neem tree with a thin branch, brick stumps, chalk boundary line. Qasim's house has the blue door.

## Pronunciation
- "Susu" is सूसू (suːsuː) — long u, as the Hindi/Urdu word for pee. The hero shout is "SUUU-SUUU-MAN!".

## Episode pipeline (episodes/ep1 is the template)
- timeline.py: lines + scene plan (pre, lines with gaps, post) -> timeline.js/json; voice WAVs in aud1/.
- amp.js: per-speaker loudness per frame for lip-sync — run amp_build.py after timeline.py.
- ep1.js: new cast + gali set + FX; ep1_scenes.js: one function per scene using dialogue times; render_ep1.py; ep1_audio.py: score cues + SFX (meow, bark, crack, thwack, cheer, rewind) + mix.

## 2.5D style (standing rule from Nov 12, 2026 — every Susuman and Awazzzz video)
Same flat 2D characters from rig.js (never redrawn); the DEPTH comes from staging. Helpers live at the bottom of rig.js:
`depthDefs()`, `layer(d, cam, svg)`, `proj(d, cam, x, y)`, `veil()`, `shadow()`/`liftShadow()`, `lightPool()`, `shafts()`, `haze()`, `motes()`; episodes/ep2/ep2.js adds `at(d, cam, x, y, rigFn, opts)` to place any character at a depth with its shadow.
- **Layers (at least 4 per shot):** sky/sun (d≈50) → clouds (d≈12) → far city + far kites (d=6, blurred, hazy) → mid rooftops (d=3) → near set pieces (rival roof d=1.7, neem d=1.45, courtyard wall d=1.3) → action plane (d=1: floor, characters) → foreground (d≈.55–.8: wires, leaves, clothesline, plants; strongly blurred). Put a `veil()` after the far and mid layers (aerial haze).
- **Camera:** one `cam = {x, y, z, px, py}` per frame; every layer gets it. Pans/cranes move near layers more than far ones; push-ins (z) grow near layers more (real dolly parallax). Never a static frame: always a pan, crane, push-in or pull-back, blended with `lerpCam`.
- **Depth of field:** far layers (d≥5) soft blur, foreground (d≤.8) strong blur; the action plane stays sharp. Foreground characters (e.g. Ammi in front of the WC door) go in a `dofNear2` group.
- **Scale with distance:** a character at depth d is `1/d` of its action-plane size (use `at()`/`proj()`); walking from the stairs (d=1.3) to the floor (d=1) or into the WC door (back to d=1.3) changes size smoothly.
- **Shadows:** every character/object on a floor gets a soft contact shadow, pushed away from the light (sun upper-right → shadows to the lower-left, skewX ≈ 35); lifted/flying characters get smaller, fainter shadows (`liftShadow`). Big props (water tank, charpai, mumty) get long cast-shadow polygons.
- **Light:** a visible light source per scene (sun with glow + `shafts()` god rays; bulbs with `poolW`), sun patches on floors/walls, and the washroom-door gold light: glow strip under the door → `lightPool()` spilling across the floor in perspective → rays when it bursts open.
- **Atmosphere:** haze bands on far layers, drifting sunlit dust `motes()` in front of the action plane.
- **Thumbnails too:** blurred far rooftops + haze, mid set piece, Susuman sharp and big on the hero plane, a blurred foreground object.
- Rendering cost: blur filters are clipped to the frame (≈0.7 s/frame); render scenes in 2 parallel workers.

## Episode 2 additions (Patang Aur Kabootar)
- KABOOTAR (`kabootar()` in rig.js): grey-blue rock pigeon, green/purple shimmering neck, orange eyes, pink feet; poses perch / fly / tangled / held. Became Qasim's friend; perches on his shoulder.
- PAPPU: kid on the rival roof, red shirt with white stripe, side-parted hair (kid() in ep2.js). Kite rival, friendly.
- Props in rig.js: `patang()` (kite), `dor()` (kite string), `charkhi()` (spool; red = manjha, white = cotton thread), `feather()`.
- Sets (episodes/ep2/ep2.js): `chhat()` rooftop (sky, far city, mid rooftops with tanks/clotheslines/kite-flyers, rival roof, neem tree, our roof with jaali parapet, mumty stair room, water tank; foreground wires with a stuck kite) and `aangan()` courtyard (neighbours' rooftops above the wall, stairs to the roof, WC door with bulb, window, blue room door, charpai with Mano, chai stool; foreground clothesline).
- Running detail: a white pigeon feather stays in Qasim's curls after the rescue (Ammi notices: "ye pankh kahan se aaya?").
