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

## Episode 7 additions (Injection Se Dar)
- Set (episodes/ep7/ep7.js): `bazaar()` — the 2.5D BAZAAR in daylight: sky/sun (50) · clouds (12) · far city + kites + heat haze (6) · mid rooftops (3) · `bazaarRow` (1.3: CHAI, DAWAI, a pastel house, the **MOHALLA CLINIC** `clinic()` — mint walls, teal sign with a green plus (never a red cross), yellow banner "AAJ: BACHCHON KA TEEKA + JANWAR CAMP", open front with poster DOCTOR = DOST, eye chart, medicine cabinet, desk, weighing scale, and its outside **WC door** `CWC` with bulb + gold glow — then the half-built building with the bamboo **MACHAAN** `machaan()` (4 plank levels `MCH.lv`, ladders, green net, KAAM CHALU HAI sign, sand + cement bags, loose top plank `PLANK` with `plankAng`/`plankCrack`), SABZI, KIRYANA, MITHAI; poles + wires, a crow, a stuck kite) · `bazaarGround` (1: paving, kerb + naali, road, parked rickshaw, cycle, gali dog) · `bazaarFG` (.6: wires with crows, bougainvillea, fruit crates + pots; `fgY` moves the crates into a close street shot).
- Camera helper `camD(d, X, Y, z, sx, sy)` puts the depth-d point (X, Y) at screen (sx, sy). Mano's climb is a waypoint path `MP`/`manoPath(u)` (run, cling-climb the ladders, out onto the plank).
- Props: `syringe(x, y, s, rot, push)` (kid-friendly, tiny needle), `plaster()` (star band-aid), `stetho()` (Latifa's stethoscope), `thermo()`, `basket()` (Mano's cane basket), `bamboo()`, `plankSvg()`, `shopFront()`.
- LATIFA's story function here: medical student helping at the Mohalla Clinic on teeka day (white coat + stethoscope); she gives the lesson "Doctor dushman nahi, dost hote hain!". DHARMENDER skates past on the road and spots Mano on the machaan.
- Sakina's crying-girl act used twice: once to get Mama to let go of Qasim's hand ("mera haath pakdo"), once BACKFIRING ("mujhe injection nahi lagwana…" → "tumhara teeka bhi aaj hi hai!": tears freeze mid-air, ULTA PAD GAYA).
- Voices first used for these lines: Latifa = ur-IN-GulNeural +8% +20Hz (proposed); Dharmender = hi-IN-MadhurNeural +8% +25Hz (proposed; the first edge request returned no audio, the retry worked).

## Episode 8 additions (Gaay Aur Traffic Jam)
- LALI GAAY (`gaay()` / `lali()` in episodes/ep8/ep8_set.js): the chowk's gentle cream-white desi cow with light-brown patches, small hump, short curved horns, pink muzzle, big lashed eyes, red-yellow rope collar with a brass bell; head turned to the viewer. Poses `sit` / `stand` / `walk`; `moo`, `chew`, `grass` (munching), moods `happy` / `sad` / `scared` / `love`. CHHOTU (`chhotu()`): her little brown calf with cream patches, no horns, same options. Sheet: `episodes/ep8/ep8_cast.jpg`.
- Vehicles (ep8_set.js, side views, `flip` -1 faces left, wheels roll): `car(x, y, s, col, {L, inside, carrier, dent, honk})` — Baba's old sky-blue family car = `L: 1.3` with a roof carrier and a dent; the family sits in the three windows via `famCar()` (ep8_scenes.js: `SEAT` face positions — Basim + Qasim in the back, Sakina + Dada Abu in the middle, Mama + Baba (driving) in front); `bus()` (CITY BUS / SHEHAR BUS with heads in the windows), `truck()` (painted desi truck, HORN OK PLEASE), `bike()` (motorbike + helmeted rider), `rickshaw()` (Ep 4), `honkB()` honk bubbles (PEEP! PAAN! POM POM!), `signal()` traffic light, `whistle()` (Officer Gill), `chaara()` (bundle of green fodder).
- Set: `chowk()` — the 2.5D CHOWK: sky/sun (50) · clouds (12) · far city + kites + heat haze (6) · mid rooftops (3) · `chowkRow` (1.3: KAPDE, DHABA, DAWAI, CHAI, MOBILE, a pastel house, the PETROL PUMP `pump()` with canopy, dispensers, price pole, kiosk and its outside WC door (same `CWC` box + `wcDoor()` glow), HARA BHARA PARK `park()` (lawn, neem trees, bench, swing, railing + arched gate), SABZI with fodder crates, KIRYANA, MITHAI, BAKERY, JUICE, poles + wires) · the road as three lane flats: lane A (1.15, kerb + zebra + signal), lane B (1.0, the chowk centre, Lali sits on the zebra at `ZX`), lane C (.86, front lane + near pavement) · foreground (.6: wires with crows, bougainvillea, fruit crates). Returns `{back, A(inner), B(inner), C(inner), front}` so vehicles and characters go into the right lane layer. Camera `camL(d, X, Y, z, sx, sy)` (= camD).
- The jam: `JAM` lists per lane (type, x, facing); `jam(lane, t, {honk, go, skip})` draws them (go = traffic moving after the signal turns green).
- Officer Gill's story function here: traffic — he whistles and pleads with the cow, then asks "Lekin ye tha kaun?!". Dada Abu gives the moral ("Sabr karo", "Sabr se kaam lo, to har jam khul jaata hai"). Basim rides along and credits "ek SUPERHERO".
- Sakina's crying-girl act used twice (both worked): to keep Mama in the car so Qasim can slip away, and to win ice cream from Baba.
- No new voices this episode (Baba, Dada Abu, Basim, Officer Gill as in voices.json). The recurring catchphrase clips (narrator open, both SUUU-SUUU-MAN shouts, "Mama! Suusuu aayi hai!", "Phir se?!…", "Jaa jaldi!", "Kuch nahi Mama!", "Qasim! Kahan the tum?") are reused from Ep 7 so they sound identical every episode.

## Episode 9 additions (Garmi Mein Parinde)
- CHIDIYA (`chidiya()` / generic `bird()` in episodes/ep9/ep9_birds.js): the house sparrow — warm-brown back with dark streaks and a white wing bar, grey crown, chestnut nape, white cheek, black bib, cream belly, short dark beak, pink-brown legs. Poses `stand` / `fly` / `faint` (on its side, X eyes) / `drink` / `hop`; `pant` (beak open + tongue, heatwave), `happy`, `fluff`, `drip`. Same skeleton with palettes for MYNA (dark brown, yellow beak + eye patch), TOTA (green parrot, red hooked beak, long tail) and KAUWA (crow, grey nape); pigeons use rig.js `kabootar()`. Sheet: `episodes/ep9/ep9_cast.jpg`.
- Props (ep9_birds.js): `hotTank()` — Basim's black tank (the set's tank at x 1500) with its old pipe, tap and rusty joint (`shake` → `burst` → `bend` = gooseneck); `jet()` water jet + splash; `runoff()`; `ledgeSvg()` — the orange tin CHHAJJA over the gap between Basim's and Latifa's roofs (with a glimpse of the gali far below); `kunda()` — clay bird-water bowl with ripples and drips; `thermo9()` 48° sign; `heatTint()`, `heatWiggle()`, `sweat()`; `wireBirds()` thirsty birds panting on the wires.
- Heatwave look: `skyDefsHot` (pale hot sky) in ep9_tail.js + `heatTint()` over the rooftop row.
- Retention structure (STRATEGY.md) first used here: frame 0 = the sparrow tipping off the tank, Basim's shout at 0.3 s, the text hook from frame 0, the narrator only at the flush (reused n2), and a 4 s "AGLE EPISODE MEIN…" flash before a native 16:9 end screen (`E_endcardW`: Susuman waving on the left, two empty boxes on the right for YouTube's end-screen elements).
- Voices: no new voices. Dadi's line "Koi hero aaya tha, parindon ko paani pila kar chala gaya!" was retaken once (the first take with "…" pauses failed the ASR check). Recurring catchphrase clips (n2, both SUUU-SUUU-MAN, "Mama! Suusuu aayi hai!", "Phir se?!", "Jaa jaldi!", "Kuch nahi Mama!", "Qasim! Kahan the tum?", "Achha? Mujhe to suusuu aayi thi!") reused from Ep 8.

## Episode 10 additions (School Ka Pehla Din)
- NOOR (`CAST.noor`, episodes/ep10/engine/chars.js): the shy new girl in Qasim's class (~5) — long black hair, blue school frock, pink earrings; sad and alone on the first day, then Qasim's new friend (she shares her aloo paratha "aadha aadha"). Voice: Kokoro `hf_alpha` speed 1.0 + the PARI kid filter `asetrate=24000*1.25,aresample=24000,atempo=0.8,highpass=f=120` (proposed — Hassan to check).
- DRIVER CHACHA (`CAST.driver`): the school-van driver — khaki shirt, brown trousers, moustache, chubby; no lines (he runs after the van, hugs the kids).
- SCHOOL VAN (`schoolVan()` / `vanAt()` / `vanPt()` in episodes/ep10/ep10_props.js): yellow desi school van, red SCHOOL VAN band, flashing amber roof light, four windows with kids' faces (`kface()`: scream / o / cry / smile, raised hands; Noor in window 2 with a pink clip), empty driver seat, detachable rear bumper (`vanBumper()`), sliding door, tilt around the front wheel (`piv`), `lift`. Lane scale `VS = .8` (a van is taller than the grown-ups).
- Sets/props: `khadda()` — Ammar mistri's open naali trench across the bottom of the dhalaan (x 2700–2860) with barricade, blinking lamp, sand pile + shovel, bricks, pipe; `schoolRow()` — NANHE TAARE SCHOOL at the chowk (yellow building, sign, open green gate, swing, bunting) drawn in the dhalaan house row; `platformSet()` — railway platform + green train for the Ep 11 flash; `schoolBag()`, `tiffin()`.
- Story functions: AMMAR warns about his khadda and wedges bricks behind the wheels; BABA chases the van (adults chase, kids stay on the kerb) and credits "koi SUPERHERO"; ZAHRA MISS welcomes the class at the school gate; BASIM shouts the cold-open line (same clip as the Ep 9 flash) and waves at school.
- Sakina's crying-girl act (worked): her tiffin is "in the van" → Mama goes in to pack a new one, so Qasim slips away.
- Narrator only twice: the reused power line (n2) and the closing lesson on the end screen (n3: "Bachcho, naye bachchon se dosti karo, aur chalti gaadi se door raho! Video achhi lagi to LIKE aur SUBSCRIBE karo!").
