# Visual quality-control gate

Run it twice: on the stills before the full render (frames 0.0, 0.5, 1.0, 1.5 s, the two busiest scenes and the closing frame), and on the contact sheet after the render. Score every line 0 (fails), 1 (weak) or 2 (good). **Any 0 blocks posting**: fix and re-check. Paste the table into the package with a one-line note per score below 2.

| # | Question (the brief's seven, made checkable) | How to check | Score |
|---|---|---|---|
| 1 | **Is the opening visually compelling?** Frame 0 moves and shows the subject; the first hook word already on screen at frame 0 and readable on a 270-px-wide copy; no logo/title card before 3 s; matches the thumbnail | look at the 0.0/0.5/1.0/1.5 s stills and the 270-px copy | |
| 2 | **Does every scene add information?** Every storyboard card has a "Purpose" that is not decoration, and the picture shows it (map for where, timeline for when, cutaway for how, chart for how much) | read the beat list against the stills | |
| 3 | **Are the animations technically achievable?** Everything is built with the engine (or marked AI/path B and not used in this render); no scene relies on footage we don't have | the render finished; no placeholder frames | |
| 4 | **Are transitions smooth?** No pops, no blank frames, no frame from a previous scene showing through; transitions from the identity's set; every transition has a reason | step through frames at each cut (± 0.3 s) | |
| 5 | **Is the visual style consistent?** One coherent look throughout (borrowed techniques are restyled into it); palette, type sizes, camera language and grade stay put; continuity bible obeyed (same place looks the same; north stays north) | contact sheet | |
| 6 | **Are all data visualisations accurate?** Every on-screen number equals its claim (unit, period, boundary); counters stop exactly on the value; bars start at zero; estimates/projections labelled; source line on every data scene; maps credited | compare each data still with the claims table | |
| 7 | **Does it look like a professional documentary, not a generic AI slideshow?** At least 60 % of the runtime has camera or subject motion beyond fades; no more than two text-only scenes in a row; at least three different techniques from the library (Storyteller: four); nothing from the "Never" list in SKILL.md | count from the EDL and the contact sheet | |
| 7b | **No step back from the current house style.** Type is never smaller or thinner than the posted videos (vertical: hook ≥ 120 px, names and key lines ≥ 110 px, chips ≥ 48 px, quotes ≥ 72 px, closing question ≥ 92 px); key text sits on a calm, dark enough backing; a 3D background never makes text harder to read than the plain navy card did | stills at 270 px wide, side by side with the last posted video of the same type | |
| 8 | Safe areas and legibility: vertical content between y≈300 and y≈1420, captions in the band, nothing in the right-hand 120 px; no text overlaps | stills | |
| 9 | Captions match the audited narration word for word (site name shown as calgaryinsight.ca) | diff the caption list with the approved lines | |
| 10 | Sound: voice on top; loudness about -14 to -16 LUFS; every effect tied to a visual event; ending fades | ebur128, volumedetect, cue sheet vs EDL | |
| 11 | Ending: ≤ 2:00 → closing question frame, no end card, question-to-last-frame ≤ 4 s; > 2:00 → full PLAYBOOK end card | last stills, duration | |

Record: `qc: {stills: "pass", final: "pass", scores: [..], notes: [..]}` in the log entry.
