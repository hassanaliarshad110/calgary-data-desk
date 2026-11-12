# Production bible template

Every video gets one. Write it into the package file under the heading `## Production bible`, after the editorial sections and before the claims table. Scale it to the format: a 20-second fun fact has 6-9 scenes and a compact bible; a 10-minute Calgary Origins film has a beat list per chapter. Every field is filled; write "none" rather than leaving one out.

## A. Visual direction (output 3)

```
Identity:        Storyteller | Data Explainer | Civic Analyst   (references/visual-identities.md)
Formats:         e.g. 1080x1920 vertical 30 fps (native layout) + 1920x1080 widescreen 30 fps
Runtime:         from the measured narration: lead 0.3 s + lines + 0.4 s gaps (0.8 s before a reveal) + ending
Look:            sky/grade preset, palette (hex), type sizes, grain/vignette/letterbox
Camera language: e.g. "slow drone moves, never faster than ~1/3 screen per second; one handheld drift shot max"
Cut rhythm:      e.g. "cut or change the picture every 1.5-2.5 s for the first 6 s, then 2.5-4 s"
Transition set:  the 2-3 transitions this film uses, and where
Visual hook:     what moves in frames 0-60, exactly (it must match the thumbnail)
Motifs:          the 1-2 recurring visual ideas that carry the story (e.g. "the Bow as a gold thread")
```

### Continuity bible
A table that every scene and every AI prompt must obey:

| Element | Fixed description | Where it comes from |
|---|---|---|
| Place | e.g. "Mewata Armoury, 801 11 St SW: long, low red-brick Tudor Gothic drill hall" | claims table #R1-R2; geo landmark |
| Geography | e.g. "Bow River north of downtown flowing west to east; Elbow joins at Fort Calgary" | geo pack |
| Time of day / season | e.g. "late-November dusk, light snow on the ground" | creative choice, stated |
| Palette | e.g. navy #0b1f3a, gold #f2b632, remembrance red #e2483d | identity |
| Recurring objects | e.g. "gold pin with navy dot = a place in the story" | creative choice |
| Characters | none, or "no real person depicted; silhouettes only" | rule |

Camera geography stays consistent: north is up on maps; when the camera flies, the rivers and mountains stay on the side they really are (the Rockies are west).

## B. Beat list and storyboard (output 2)

First the beat list: one line per narration line, in order: `beat # | what the viewer must understand | technique`.

Then one storyboard card per scene:

```
SCENE 03 · 00:04.6-00:08.9 (4.3 s) · formats: V + W
Narration:      "In nineteen thirty-three, the army acquired land for a new base..."   (exact audited line)
Purpose:        WHERE the base was and WHEN it began (one sentence; if it explains nothing, cut the scene)
Composition:    V: map fills y 300-1300, pin at centre third; W: map left two-thirds, text card right third
Foreground:     gold pin + label "Currie Barracks"; year chip "1933"
Background:     city map, Glenmore Trail and Crowchild Trail in gold, Elbow River blue
Environment:    winter map palette, light fog toward the horizon
Camera:         position over downtown at 9 km altitude → dives to 1.2 km oblique over the site, outCubic, 3.8 s
Lighting:       overcast skylight, sun from the south-west (low), soft shadows
Objects/people: no people; roads; LRT line red
Animation:      0.0 pin drops (outBack 0.4 s) · 0.6 year chip stamps · 1.2 route draws on Crowchild (1.5 s)
Data on screen: "1933" (claim #7) · source line "Calgary Heritage Initiative, 2025"
Transition out: match-cut on the pin into scene 04 (0.4 s)
Sound:          0.0 pop (pin) · 0.6 stamp · music bed continues
Caption:        burned-in from the narration line
Engine:         M.geo.addBase + M.moves.dive + M.pin + M.chip
```

## C. AI prompts (outputs 4 and 5)
One video prompt per scene, written with `ai-prompt-guide.md`, then the image prompts needed (keyframe for each scene that would be generated image-to-video, plus the thumbnail plate).

## D. Sound design (output 6)
- VO pacing: words per second for this identity, pauses before reveals, the line that gets the longest silence.
- Music: bed (`story`, `pulse`, `civic`, `suspense` or none), where it drops out, where it returns, level under the voice.
- Effects cue sheet, also saved as `cues.json`:

| t (s) | Effect | Gain dB | Tied to |
|---|---|---|---|
| 0.00 | impact | -3 | hook number slams in |
| 2.15 | whoosh | -8 | whip to scene 2 |

- Transition sounds: which transition gets which sound (a cut gets none).
- Room tone/ambience beds (city, wind, rain) and where.

## E. Editing timeline (output 7)
An EDL table the editor (or the engine) follows exactly:

| # | In | Out | Dur | Scene/shot | Transition in | On-screen text | Caption | Sound |
|---|---|---|---|---|---|---|---|---|
| 1 | 00:00.00 | 00:02.40 | 2.40 | S01 dive onto downtown | none (frame 0 moving) | "WHERE IS EVERYONE GOING?" | line 0 | impact 0.00 |

Then subtitle and on-screen text rules for this video: positions (vertical: captions bottom band y≈1240-1420; never in the right-hand 120 px), maximum words per line, how numbers appear (on-screen digits from the claims table; narration in words), the source-line position on data scenes, and where the logo header appears (from about 3 s, not on the closing frame).

## F. Sources and factual verification (output 8)
The claims table (PLAYBOOK 3b) plus a column mapping every on-screen figure, label and map to its claim number, and the audit verdict (rounds, claims checked). Map scenes cite the geo pack credit.

## G. Quality control (output 9)
The scored table from `quality-control.md`, filled in after the stills check and again after the final render.
