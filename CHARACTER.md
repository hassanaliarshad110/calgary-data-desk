# SUSUMAN — character bible (keep identical in every video)

Reference: `Susuman_model_sheet.jpg`. Drawing code: `rig.js` (`susu()`, `ammi()`); never redraw by hand or with an image AI.

## Qasim / Susuman
- Real name QASIM, a 4-year-old desi boy; secretly he is SUSUMAN, who saves the world, kids and animals. Big dark-brown curly hair with a fringe swooping over the forehead.
- Signature look: thick serious eyebrows (frown), big brown eyes, small mouth.
- Black hoodie with red hood lining and red cuffs, white drawstrings, gold drop emblem on chest.
- Silver kara on his right wrist. Dark joggers, white sneakers with red stripe.
- Power form (after the flush): gold aura, red cape, floating gold/white crown, bigger chest emblem.
- Power rule: every washroom trip + flush fills the SUSU POWER bar. The washroom is never shown inside: door closes, gold light under the door, "FLUUSH!", he bursts out.
- Catchphrase gag: "Mama! Susu aayi hai!" → Mama: "Phir se?! Abhi to gaye the!"
- THE SECRET: only SAKINA (his elder sister, Baaji) knows Qasim is Susuman. Nobody else knows: not Mama, not Baba, not Dada Abu, not Dadi, not Basim, not the gali. Sakina covers for him and keeps the secret.

## Mama (Qasim's mother)
- NAME ON SCREEN AND IN DIALOGUE (Hassan, Nov 14, 2026): the kids call her **"Mama"** — never "Ammi". Every line, caption, speaker chip (MAMA), title and social caption says Mama. The code function is still `ammi()` / `CAST.ammi`; only the word changes.
- Teal kurta, pink dupatta, white shalwar, black hair in a bun with centre parting, gold earrings, usually on her phone.

## Voices — see voices/voices.json
- Qasim: Kokoro hf_beta pitched up ×1.28 (child voice). Mama: ur-PK-UzmaNeural. Narrator: ur-PK-AsadNeural (Edge neural TTS, Urdu script). Reference clips in voices/.

## Music
- DIALOGUE FIRST (Hassan, Nov 14, 2026): sound effects and music must never be so loud that a line of dialogue is hard to hear. In the mix, duck the score AND every SFX under dialogue (sidechain on the voice track); an SFX that overlaps a spoken line peaks at least 10 dB below the voice, and loud hits (FLUUSH, booms, crashes, cheers) go in the gaps between lines, not on top of words. Check before publishing: for every dialogue line, measure the voice stem vs the music+SFX stem over the line's time span (speech band 300-3400 Hz) — the voice must be at least 10 dB louder; fix and re-mix any line that fails. Final mix -14 LUFS, true peak -1 dB.
- music.py: synthesised desi cartoon band (dholak/tabla kaharwa groove, harmonium chords, bansuri theme in D major, rubab-style plucks for sneaky moments, big hit for the Susuman reveal). Keep the bansuri THEME as the show's signature tune.

## Style
- Titles: Bangers (white, black stroke, red shadow). Subtitles: Baloo 2 ExtraBold, Roman script, speaker chip (QASIM red, MAMA teal).
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
- **Depth of field:** far layers (d≥5) soft blur, foreground (d≤.8) strong blur; the action plane stays sharp. Foreground characters (e.g. Mama in front of the WC door) go in a `dofNear2` group.
- **Scale with distance:** a character at depth d is `1/d` of its action-plane size (use `at()`/`proj()`); walking from the stairs (d=1.3) to the floor (d=1) or into the WC door (back to d=1.3) changes size smoothly.
- **Shadows:** every character/object on a floor gets a soft contact shadow, pushed away from the light (sun upper-right → shadows to the lower-left, skewX ≈ 35); lifted/flying characters get smaller, fainter shadows (`liftShadow`). Big props (water tank, charpai, mumty) get long cast-shadow polygons.
- **Light:** a visible light source per scene (sun with glow + `shafts()` god rays; bulbs with `poolW`), sun patches on floors/walls, and the washroom-door gold light: glow strip under the door → `lightPool()` spilling across the floor in perspective → rays when it bursts open.
- **Atmosphere:** haze bands on far layers, drifting sunlit dust `motes()` in front of the action plane.
- **Thumbnails too:** blurred far rooftops + haze, mid set piece, Susuman sharp and big on the hero plane, a blurred foreground object.
- Rendering cost: blur filters are clipped to the frame (≈0.7 s/frame); render scenes in 2 parallel workers.
- **16:9 renders:** the vertical filter region (x -20..1100) cuts blurred layers off at the sides of a widescreen frame — always build the wide frame's defs with `depthDefsW()` (rig.js), which widens every depth filter region.
- **Flat set rows (Ep 5):** for a long pan along a row of rooftops use an oblique floor (`RK` slant: gaps, joints and side walls all lean the same way) instead of one-point perspective, so the floor stays correct wherever the camera is; gaps between roofs show the dark gali far below; poles stand in the gaps; wires sag between poles.
- **Light FX:** `sparks(x, y, t, k)` (rig.js) for electric crackle with a cold blue glow — use it for any danger near wires; a white flash frame on the big zap.
- **POV blur:** for a character who can't see (Dadi without her chashma) wrap the whole frame in `dofNear` with a light veil and a label; it doubles as the reason the secret stays safe.

## Episode 2 additions (Patang Aur Kabootar)
- KABOOTAR (`kabootar()` in rig.js): grey-blue rock pigeon, green/purple shimmering neck, orange eyes, pink feet; poses perch / fly / tangled / held. Became Qasim's friend; perches on his shoulder.
- PAPPU: kid on the rival roof, red shirt with white stripe, side-parted hair (kid() in ep2.js). Kite rival, friendly.
- Props in rig.js: `patang()` (kite), `dor()` (kite string), `charkhi()` (spool; red = manjha, white = cotton thread), `feather()`.
- Sets (episodes/ep2/ep2.js): `chhat()` rooftop (sky, far city, mid rooftops with tanks/clotheslines/kite-flyers, rival roof, neem tree, our roof with jaali parapet, mumty stair room, water tank; foreground wires with a stuck kite) and `aangan()` courtyard (neighbours' rooftops above the wall, stairs to the roof, WC door with bulb, window, blue room door, charpai with Mano, chai stool; foreground clothesline).
- Running detail: a white pigeon feather stays in Qasim's curls after the rescue (Mama notices: "ye pankh kahan se aaya?").

## Studio skeleton version (Nov 2026)
Qasim, Susuman and Mama (`CAST.ammi`) are also rigged on the studio skeleton (branch `animation-studio`, `CAST.qasim / CAST.susuman / CAST.ammi`) with the same colours as `rig.js`: 31 motions, turnarounds, 16 expressions, lip-sync. Sheets and a motion test are in `studio_rig/`. Use either rig; keep the look identical to this bible.

## The ensemble (from Nov 12, 2026) — reference: `studio_rig/susuman_ensemble.png`
All on the studio skeleton (`CAST.<key>` in engine/chars.js, branch `animation-studio`).
- **Family**
  - BABA (`baba`, NEW Nov 14, 2026): Qasim and Sakina's father — the kids call him **"Baba"**. Mid-30s, kind and a bit tired after work; neat black hair, short trimmed beard-and-moustache, rectangular glasses; light-blue shirt with rolled sleeves (office) or a grey kurta at home, dark trousers, office bag and a tiffin. Loves chai with Dada Abu and cricket on TV; soft-hearted — the easiest adult for Sakina's crying to win over. He does NOT know the secret. Build him on the studio skeleton in the same style as the ensemble (CAST.baba) and add him to the model sheet the first time he appears.
  - DADA ABU (`dadaAbu`): Qasim's grandfather (Baba's father). White kurta, glasses, moustache, walking slowly; loves chai, the newspaper and old stories.
  - DADI (`dadi`): Qasim's grandmother. Purple suit, white dupatta, glasses; feeds everyone, worries, says duas.
  - SAKINA (`sakina`): Qasim's elder sister, Baaji, 14. Teal hoodie. **The only person who knows he is Susuman.** She covers for him ("Mama, woh mere saath tha!"), hands him water before missions, and keeps the secret from everyone.
    - **"CRYING GIRL" (NEW Nov 14, 2026):** Sakina is also known as the crying girl. Her own funny "power": when she wants something from the grown-ups (ice cream, the TV remote, a later bedtime, a trip to the mela, or a cover story for Qasim) she switches on huge cartoon tears — wobbling lip, a slow "Mamaaa…" / "Babaaa…" wail, two fountain streams of tears — and the adult melts and says yes. Show it as a comic set-piece (tear streams, a puddle, a sad violin sting from the score, the adult caving in seconds, then her instant grin and wink to the camera). It is a running gag: use it in most episodes, often to help Qasim slip away for a rescue. Keep it light and kind (made for kids): no lying that hurts anyone, and now and then it backfires (Dadi sees through it, or Qasim copies it and fails) so the lesson stays balanced.
  - MAMA (`ammi`): as above — always called Mama.
- **Gali, school & TV**
  - BASIM (`basim`): Qasim's best friend from the gali, about his age, spiky hair, orange kurta. Does not know the secret; often the one Susuman saves or plays with.
  - ZAHRA MISS (`zahra`): Qasim's school teacher, glasses, blue kameez.
  - AMMAR (`ammar`): Ammar mistri, the mohalla builder uncle; yellow hard hat, orange safety vest. Repairs, ladders, scaffolding, things that fall.
  - OFFICER GILL (`officer`): the friendly mohalla police uncle (turban, navy uniform).
  - LATIFA (`latifa`): the college-going neighbour, orange hijab, white coat.
  - DHARMENDER (`dharmender`): Dharmender bhaiya, the gali teenager in the yellow hoodie, skateboard and cricket.
  - DANIEL and AMARA (`daniel`, `amara`): TV news anchors, only seen on the family TV ("Mysterious hero saves kitten!").
- Old names map automatically in code (chacha→dadaAbu, zoya→sakina, rafi→basim, nani→dadi, maya→zahra, marcus→ammar, layla→latifa, jamal→dharmender).

### Rotation rule (every episode)
- Every episode: Qasim/Susuman + Mama + **at least 2 other family members** (Sakina in most; bring Baba in regularly) + **at least 2 from the gali/school/TV list**.
- Rotate the featured cast so nobody is absent for more than 3 episodes in a row; keep a "Cast:" line in each episode's notes and check the last 3 before choosing.
- Give each a story function, not just a cameo: Dada Abu/Dadi set up problems and moral endings, Basim is the friend in trouble, Zahra Miss the school stories, Ammar the building/height rescues, Officer Gill the lost things/traffic, Latifa and Dharmender bhaiya the neighbourhood events, Daniel/Amara report the "mystery hero" on TV.
- The secret never slips: only Sakina may react knowingly (a wink, a cover story); everyone else credits "koi superhero" on TV.

## Episode 4 additions (Ice Cream Wala Thela)
- KULFI CHACHA (`kulfiWala`, studio skeleton, CAST entry in episodes/ep4/engine/chars.js): the gali kulfi seller, balding grey hair, moustache, sky-blue kurta, white shalwar; voice edge `ur-IN-SalmanNeural` rate +0% pitch -30Hz, Urdu script (proposed — Hassan to check). Sheet: `episodes/ep4/ep4_cast.jpg`.
- Props in rig.js: `thela()` (blue KULFI cart: 2 spoked wheels that roll with distance, striped umbrella, 2 clay matkas, brass bell; opts ang/roll/ring/rattle/um/flip), `kulfi()` (stick kulfi: mango / malai / pista, `bite`), `brick()`, `skateboard()` (Dharmender's).
- 2.5D helpers added to rig.js: `castShadow(x, y, w, len, op)` (long cast shadow for props, sun upper-right → falls lower-left) and `heatHaze(t, y0, y1)` (summer shimmer on far layers).
- Set (episodes/ep4/ep4.js): `dhalaan()` — the sloped lane down to the main road. Ground line `G(x)` slopes down to the right (SL = .17) and is flat after XR (chowk, asphalt road, zebra crossing). Layers: sky/sun · clouds · far city + kites + heat haze (6) · mid rooftops (3) · `houseRowL` (1.3: pastel houses on the same slope, shops KIRYANA/MITHAI/DAWAI…, coolers, balconies, poles, neem) · `streetL` (1: kerb + naali, house-shade band, paving, sleeping dog, cycle, pots) · `galiFG` (.62: wires with crows, caught kite, bougainvillea, hand-pump, mango crates, pots — wrapped in `skewY(slope)` so it stays put on screen while the camera travels down the lane).
- Slope camera: `camG(worldX, z, screenY, screenX, lift)` keeps a ground point fixed on screen while panning down the slope (layers with the same slope stay aligned; far layers drift = parallax). Characters on the lane: `onLane(depth, cam, x, rigFn, opts)`; the cart: `thelaAt(cam, x, opts)` (tilts with the slope, wheels roll).
- Family TV in the aangan (`tvSet()` / `tvNews()` in ep4_scenes.js): Daniel + Amara in a studio, BREAKING NEWS bar, scrolling ticker, inset footage. Reuse it for every "mystery hero" report.

## Episode 5 additions (Bandar Ne Chashma Churaya)
- BANDAR MAMA (`bandar()` in rig.js): the gali monkey (rhesus style): brown fur, light belly, pink heart-shaped face, round ears, long curling tail. Poses: `sit`, `run` (gallop cycle), `leap`, `hang` (origin = the gripping hand on a wire/branch), `angry` flag (screech, teeth), `chew`, `wave`; items: `chashma` (held), `wear` (glasses on his face), `kela` (+ `peel`). Naughty but not bad: he snatches only when teased. Sheet: `episodes/ep5/ep5_cast.jpg`.
- Props in rig.js: `chashma()` (Dadi's round brown glasses, glint), `kela()` (banana, peel 0..1), `moongPlate()` (steel plate of roasted peanuts on a stool), `kitaab()` + `page()` (Latifa's books, flying pages), `sparks()`.
- CAST.dadiNoG (episodes/ep5/engine/chars.js): Dadi without her glasses.
- Zahra Miss visits Dadi in the winter sun (teacher-neighbour); Latifa studies on her roof. Voices used for the first time this episode (proposed, Hassan to check): Dadi = ur-IN-GulNeural -10% -10Hz; Latifa = ur-IN-GulNeural +8% +20Hz; Zahra Miss = hi-IN-SwaraNeural.
- Set (episodes/ep5/ep5.js): `chhatein()` — the ROOFTOP ROW: sky/sun · clouds · far city + kites (6) · mid roofs (3) · `backRowL` (1.5: taller houses with balconies, dish antennas, kids flying kites, the big gali neem) · `rowRoofL` (1: our roof with the mumty + charpai + moongphali, Basim's roof, Latifa's roof with her mat, the next roofs; gaps; poles at 765/3085/4565, transformer + KHATRA sign on POLE; sagging wires `wireY()`) · `rowFG` (.6: clotheslines with dupattas, wires with crows, neem leaves, pots, bricks). Camera: `camR(worldX, z, screenY, screenX, worldY)`.

## Episode 6 additions (Mele Mein Gum)
- BABA built on the studio skeleton: `CAST.baba` (office: light-blue shirt, dark trousers, rectangular glasses, short trimmed beard = `stubble`) and `CAST.babaKurta` (grey kurta at home / outings), in `episodes/ep6/engine/chars.js`. Voice: edge `ur-IN-SalmanNeural` -3% -8Hz, Urdu script (proposed — Hassan to check). Added to `studio_rig/susuman_ensemble.png` (labels now say MAMA). Sheet: `episodes/ep6/ep6_cast.jpg`.
- PARI (`CAST.pari`): the little girl lost at the mela (pink frock, ponytail, toddler proportions); voice Kokoro `hf_alpha` speed 1.0 + kid filter `asetrate=24000*1.25,aresample=24000,atempo=0.8,highpass=f=120` (proposed). Her parents `CAST.pariMa` (yellow kurta, green dupatta) and `CAST.pariPa` (maroon kurta, moustache).
- Set (episodes/ep6/ep6.js): `mela()` — the 2.5D fairground at dusk: dusk sky + stars + moon (d=40) · far city with lit windows (6) · giant wheel with chasing bulbs, striped tents, chakri (2.4) · sea of mela-goers + bulb strings (1.6) · stall row (1.3: KHILONE, BUDDHI KE BAAL, CHAAT, CHOODIYAN, GUBBARE, KHOYA-PAAYA police booth, JALEBI + the blue mela WC booth `wcBooth()` with door glow) · dusty ground with light pools and litter (1) · foreground bunting, bulb string and crowd heads (.6). Camera `camM(worldX, z, screenY, screenX, worldY)`. Generic crowd figure `crowdP()`, props `buddhi()` (cotton candy), `gubbara()` / `balloonBunch()`, `bulb()`, `bulbString()`, `bunting()`, `jalebiPlate`, `bag`, `tiffin`.
- Sakina's crying-girl FX (ep6_scenes.js): `cryGag()` = `fountain()` tear arcs + drops from both eyes, growing `puddle()`, `violin()` icon + notes; audio `sadSting()` (sarangi sob) in ep6_audio.py.
- `xAt(X, dFrom, dTo, cam)` keeps a moving character's screen x when it changes depth (e.g. walking into the WC booth at d=1.3).
