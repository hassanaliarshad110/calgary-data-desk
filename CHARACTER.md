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
