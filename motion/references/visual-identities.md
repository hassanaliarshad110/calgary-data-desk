# The three CalgaryInsight visual identities

One house (navy, gold, Fira Sans, the magnifying-lens logo, calgaryinsight.ca), three distinct ways of filming. A viewer should be able to tell which series a video is from with the sound off. In the engine, pass `identity: 'storyteller' | 'explainer' | 'civic'` to `M.film` and use that identity's presets below.

## 1. Calgary Storyteller: cinematic documentary
Used by: flagship stories (Short, widescreen, teaser), Calgary Origins films and parts.

- **Feeling:** a premium independent documentary. Suspense, place, time, consequence.
- **Picture:** immersive 3D environments of real Calgary geography (rivers, escarpments, the downtown skyline from the geo pack), drone flights, crane-ups, time-of-day light (dusk and dawn presets), weather and atmosphere (snow, fog, chinook arch, embers for the 1886 fire), archival photos in 2.5D parallax with credit, historical timeline transformations (the city growing out of the river valley year by year).
- **Camera:** slow and deliberate. Long eased moves (3-6 s), drone fly-throughs on splines, orbit reveals, a crane-up for the "big picture" beat. Letterbox (2.2:1) on widescreen for the two or three most dramatic beats only.
- **Cut rhythm:** after the 2-second hook and the fast first 6 s, 2.5-6 s per shot; let the reveal breathe (0.8 s of silence before it).
- **Transitions:** match cuts (pin to pin, river to river, year to year), slow dissolves through time, a flash for a shock moment, a whip only between places. Never more than three kinds in one film.
- **Type:** big condensed hook (Fira Sans 800, letter-spaced), quiet lower-thirds for places and years, chapter cards ("PART 2 OF 4") only on long films.
- **Grade:** warm highlights, deep shadows, grain .055, vignette .55.
- **Sound:** `story` bed (minor pad, low pulse), `suspense` under the mystery beats, swells into reveals, ambience (wind, river, city) under places.
- **Structure tools:** cold open on the most visual moment; a question that hangs; the reveal; a complication; the meaning; the closing question.

## 2. Calgary Data Explainer: fast motion graphics
Used by: daily fun facts and one-insight shorts (15-25 s, never over 30).

- **Feeling:** "I didn't know that about Calgary", understood in one viewing with the sound off.
- **Picture:** snap dives from a top-down city map into the exact community or landmark, numbers that slam in and roll to the audited value, bars and comparisons that build in rhythm, before/after flashes, simple 3D blocks of the real downtown, kinetic type.
- **Camera:** fast: punch-ins, snap zooms, whip pans, map dives. Nothing static for longer than 1.5 s.
- **Cut rhythm:** 1.2-2.5 s per picture change. Every cut lands on a narration stress or an effect.
- **Transitions:** push, zoom-through, whip, angled wipe with a gold edge. Cuts on the beat.
- **Type:** huge numbers (150-220 px vertical), hook 110-130 px, one idea per screen, at most 7 words on screen besides the caption.
- **Grade:** clean and bright (day sky), grain .025, light vignette.
- **Sound:** `pulse` bed (100 bpm), impact on the number, ticks while counters roll, whooshes on whips, a pop on every pin.
- **Structure:** hook (0-2 s) → the fact (2-6 s) → see it (6-16 s) → why it's interesting (16-22 s) → one-word question.

## 3. Calgary Civic Analyst: evidence-led investigative
Used by: "Calgary news explained" (Mon/Wed/Fri, 25-45 s) and civic videos.

- **Feeling:** credible, calm, careful. Shows its evidence. Never sensational, never partisan.
- **Picture:** clean top-down plans and oblique 3D maps of the exact site or ward, infrastructure diagrams (cutaways of pipes, roads, bridges; exploded views of facilities), document cards with highlighted lines (the real wording, quoted under 15 words), status chips on every project (ANNOUNCED → FUNDING APPROVED → UNDER CONSTRUCTION → COMPLETED), evidence chips on every figure (VERIFIED / ESTIMATE / PROJECTION), timelines of decisions with dates, a source line on every data scene.
- **Camera:** steady: locked-off frames, slow pushes, measured dives from the city to the site. Blueprint or overcast skies.
- **Cut rhythm:** 2-4.5 s; slower than the explainer, faster than the storyteller.
- **Transitions:** clean wipes, dissolves, pushes. No flashes, no whips.
- **Type:** smaller and precise; document typography; clear hierarchy (what happened / why it matters / what's next as three labelled beats).
- **Grade:** neutral, cool; grain .03.
- **Sound:** `civic` bed (sparse piano chords) or none; stamps on chips, clicks on highlights, no dramatic impacts.
- **Neutrality in pictures:** no red/green "good/bad" colour coding of a ward, councillor or party; equal visual weight for each side of a two-sided question; never animate a politician; projections and estimates are dashed or labelled.

## Combining the identities (the default)
The slot sets the lead identity; the story decides the rest. Borrow freely, per beat, and say so in the beat list:
- Storyteller → anything: a cinematic drone or crane opener, a dusk/night grade for an emotional line, letterbox for one dramatic beat.
- Explainer → anything: a counter slam for the one number that matters, a snap map dive, a bar comparison.
- Civic → anything: a document card with the exact words highlighted, evidence and stage chips, a cutaway or exploded view, a decision timeline.
Keep one coherent look per video (palette, type sizes, grade, camera language), and keep the owning editorial skill's rules (neutrality on civic and political subjects always applies).

## Shared house rules (all three)
- Frame 0 already moves and shows the subject; the first hook word already on screen at frame 0 and the whole hook by about 0.5 s; no logo or title card in the first 3 s; the logo header from about 3 s (`M.header`), not on the closing frame.
- Vertical: native 1080×1920 layout; captions in the bottom band (y≈1240-1420); nothing important in the right-hand 120 px.
- Captions burned in from the audited narration (site name shown as calgaryinsight.ca).
- Videos of 2:00 or less end on the closing question (`M.closer`), held about 1.5 s after the voice, at most 4 s from question to last frame, no end card. Longer videos get the PLAYBOOK end card.
- Over 25 s: the follow pill (`M.followPill`) for about 2 s at the halfway point.
- The thumbnail and the opening frame share one design.
