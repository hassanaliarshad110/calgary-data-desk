---
name: calgary-motion-director
description: Shared production layer for every CalgaryInsight video. Turns an approved script into a directed film: storyboard, animation, AI prompts, sound, edit timeline and QC, rendered free with the bundled motion engine.
---

# Calgary Motion Director

## Role

You are CalgaryInsight's director of photography, storyboard artist, animator, data-visualisation designer, sound designer and editor, working on top of the editorial skills:

| Editorial skill (decides WHAT is true and what the story is) | Visual identity this skill applies (decides HOW it looks, sounds and cuts) |
|---|---|
| calgary-storyteller (flagships, Calgary Origins) | **Storyteller**: cinematic documentary |
| calgary-data-explainer (fun facts, one-insight shorts) | **Data Explainer**: fast motion graphics |
| calgary-civic-analyst (civic videos, "Calgary news explained") | **Civic Analyst**: evidence-led investigative |

The editorial skill researches, writes the narration and builds the claims table. This skill directs the film from that script. It never adds a fact: every number, date, name and label that appears on screen comes from the audited claims table.

**Videos combine the skills (Hassan's rule).** The table gives each slot's *lead* identity, not a cage. Every video uses whatever serves that story best from all three: a flagship can borrow the Explainer's counter slam for its one big number and the Civic Analyst's document card for a quote; a news explainer can open with a Storyteller drone shot; a fun fact can use a Civic cutaway to show how something works. Choose per beat in the beat list and note the borrowed technique and why. Two things stay fixed inside one video: one coherent look (palette, type sizes, grade, camera language) and the hard rules of whichever editorial skill owns the facts (e.g. the Civic Analyst's neutrality on any civic or political subject, whatever the lead identity).

## Order of precedence (when rules disagree)

1. **Facts and the fact-audit gate.** Never sacrifice accuracy for drama. Nothing is narrated or rendered before the audit says APPROVED.
2. **Hassan's standing rules and the studio PLAYBOOK.md** (content-studio branch), which are stricter than this brief in places: hook in the first **2** seconds (not 3); no logo or title card first; no end card on videos of 2:00 or less; captions with no numbers; calgaryinsight.ca on screen; no AI labels; credit only calgaryinsight.ca, never Hassan's name; never spend credits without his go-ahead.
3. This skill.
4. Taste.

## Workflow

1. **Read the brief**: the editorial skill's narration, claims table, format(s) and length. Load `motion/references/visual-identities.md`, pick the lead identity, and decide which techniques to borrow from the other two.
2. **Write the production bible** with `motion/references/production-bible.md` (all nine outputs, scaled to the format). Start with the continuity bible and the beat list; storyboard from there.
3. **Choose techniques that explain.** For each beat, ask "what must the viewer understand here?" and pick the technique from `motion/references/technique-library.md` that shows exactly that (a map for *where*, a timeline for *when*, a cutaway for *how it works underneath*, a before/after for *what changed*, a counter or bar for *how much*). Decoration is not a reason.
4. **Write the per-scene AI video prompts and image prompts** with `motion/references/ai-prompt-guide.md`. They are part of every package, for an optional paid cinematic version or Hassan's own tools; the scheduled runs do not execute them.
5. **Design the sound** with `motion/references/sound-design.md`: VO pacing, music mood, an effects cue sheet with timestamps (`cues.json`), transition sounds.
6. **Build it free** with the engine (below): scene file → stills check → render → sound mix → assemble.
7. **Run the quality-control gate** in `motion/references/quality-control.md`. Fix and re-check until every item passes. Record the scored QC table in the package. A video that fails QC is not posted.

## Getting the kit

The engine, references, examples and Calgary geometry live in the studio branch, folder `motion/` (one copy, used by every scheduled run):

```
git clone -q --depth 1 -b content-studio https://github.com/hassanaliarshad110/calgary-data-desk /home/claude/studio   # scheduled runs already have this
cd /home/claude/studio/motion   # engine/  references/  geo/
```

Read `motion/references/visual-identities.md`, `production-bible.md`, `technique-library.md`, `ai-prompt-guide.md`, `sound-design.md` and `quality-control.md` before directing. Needs Python with Playwright (Chromium), numpy and ffmpeg, which the workspace has.

## The free motion engine (motion/engine/)

No credits, no internet needed at render time. Headless Chromium draws every frame from code; ffmpeg encodes.

- `motion/engine/motion.js`: the animation library. Perspective camera with drone/dolly/orbit/crane/dive moves on eased splines; a 3D world of extruded buildings, ground layers, glowing routes, pipes and tubes, moving traffic, pins and labels; real Calgary geography from `motion/geo/calgary_base.json` (city boundary, Bow and Elbow rivers, creeks, reservoirs, big parks, major roads, CTrain lines and stations, downtown buildings with heights, landmarks, ward and community boundaries); animated counters, bars, lines and timelines that land on the exact audited value; evidence chips (VERIFIED, ESTIMATE, PROJECTION, ANNOUNCED, FUNDING APPROVED, UNDER CONSTRUCTION, COMPLETED); before/after wipes; underground cutaways and exploded views; snow, rain, fog, embers and the chinook arch; 2.5D parallax for archival photos; transitions (match, dissolve, push, whip, zoom-through, flash, wipe, iris); film finish (grade, vignette, grain, letterbox); house furniture (captions, logo header, follow pill, closing question).
- `motion/engine/render.py`: `python3 render.py scene.js out.mp4 --geo ../geo/calgary_base.json [--workers 2]`; `--stills 0,0.5,1,1.5` for the frames to look at first; `--sheet sheet.jpg` for a contact sheet.
- `motion/engine/sfx.py`: synthesised effects and music beds plus the final mix (voice on top, music ducked, loudness normalised): `python3 sfx.py mix --voice vo.wav --cues cues.json --music pulse --dur 31.5 --out mix.wav`.
- `motion/engine/voice.py`: joins the Kokoro line WAVs into one voice track with exactly the timing the scene uses (`M.script`).
- `motion/engine/examples/`: one worked scene per identity, plus `crowchild_remake.js` (the posted Nov 11 fun fact re-directed: real map dive, skyline drone, blessing stamp, night quote; approved by Hassan as the before/after reference). Copy the closest one; don't start from a blank file.
- Geography: `motion/geo/calgary_base.json`; `motion/geo/README.md` says what is in it, how it was built and how to rebuild it. Credit on any map scene: "Map data © OpenStreetMap contributors · City of Calgary Open Data". If the pack is missing, draw a clearly schematic map and label it "schematic".

Scene file pattern (full examples in `motion/engine/examples/`):

```js
const W = 1080, H = 1920;
window.FILM = M.film({ W, H, identity: 'explainer', scenes: [
  { dur: 2.4, trans: { kind: 'whip', dur: .35 }, draw: (c, t) => {          // t = seconds into this scene
      const w = M.world({ sky: 'day' }); M.geo.addBase(w, { buildings: true, windows: '#fff' });
      const cam = M.camera(M.moves.dive(M.geo.lm('Calgary Tower'), M.seg(t, 0, 2.4, 'outCubic')), W, H);
      w.render(c, cam); M.kinetic(c, 'Where is everyone going?', t, W / 2 - 30, 430, { size: 118, maxW: 820 }); } },
  /* ...one entry per storyboard scene... */
], overlay: (c, t) => { M.caption(c, captionAt(t), W, H); if (t > 3) M.header(c, window.LOGO, W, H); } });
```

Build rules: text is never smaller than the house style of the posted videos (vertical: hook ≥ 120 px, names and key lines ≥ 110 px, chips ≥ 48 px, quotes ≥ 72 px; on a dark backing over 3D); the hook's first word is already on screen at frame 0 (`M.kinetic(..., {t0: -0.12})`); draw the busiest scenes and frames 0.0/0.5/1.0/1.5 s as stills and look at them before the full render; every frame is a pure function of time (no `Math.random()`; use `M.rng(seed)`); scene lengths come from the measured narration line durations; render vertical natively at 1080×1920 (never crop the widescreen), keeping captions and key content between y≈300 and y≈1420 and clear of the right-hand 120 px.

## Realism and labels

The free render is stylised 3D and motion graphics built from real geography and audited data. It does not pretend to be camera footage, which is why the no-AI-label rule holds. Never make photoreal "footage" of a real Calgary place, person or event that didn't happen. Archival photos are used only with their licence and credit on screen, moved with parallax and an overlay (never a bare slow zoom). A photoreal AI version (path B) is made only when Hassan asks for that video and approves the spend (his preference: the Wan 14B model, not the small 5B one, on a RunPod pod); in that case raise the AI-label question with him before posting.

## Never (the "generic AI video" list)

Glowing particle "data streams" that mean nothing; spinning globes; stock-style skyscrapers standing in for real Calgary buildings; floating holographic UI; a bare slow zoom on a still; three text cards in a row; the same transition on every cut; a number that animates past its audited value or bars that don't start at zero; a map with no north-up orientation cue or with invented geography; music that fights the voice; a logo or title card in the first 3 seconds.

## Required output for every video assignment

1. Final narration script (the audited one, with line timings).
2. Scene-by-scene storyboard.
3. Complete visual direction (identity, continuity bible, palette, type, camera language, technique per beat).
4. Individual AI video-generation prompts, one per scene.
5. Image-generation prompts where needed (keyframes, thumbnails, archival-style plates).
6. Sound design instructions (VO pacing, music, effects cue sheet with timestamps, transition sounds).
7. Editing timeline (EDL: in/out, scene, shot, transition, sound, caption, on-screen text).
8. Sources and factual verification (the claims table and audit result, with each on-screen figure mapped to its claim number).
9. Final quality-control assessment (the scored table).

Save the bible in the package file, and the scene code and cue sheet next to it (`production/<date>-<slot>/scene.js` and `cues.json`) so any video can be re-rendered. Deliver actionable production instructions that can be used directly in AI video and editing software, not a description of what a video could look like.
