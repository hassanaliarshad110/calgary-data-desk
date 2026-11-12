# AI video and image prompts

Every package carries one video prompt per scene and the image prompts it needs. They are for an optional paid cinematic version (path B) or for Hassan's own tools. Scheduled runs write them but never run them, and never spend credits.

## Video prompt template (one per scene)

```
[S04 · 4.0 s · 9:16 · 1080x1920 · 30 fps · continuity: CI-STORY-MEWATA]
Main subject:     Mewata Armoury, 801 11 Street SW, Calgary: a long, low red-brick Tudor Gothic drill hall with crenellated corner towers
Environment:      late-November dusk, light snow on the lawn, bare elm trees, 11 Street SW in the foreground, downtown towers soft in the background haze
Visual style:     cinematic documentary, natural colour, gentle film grain, no text in frame
Camera movement:  slow lateral dolly left to right along the façade at 2 m height, 0.5 m/s, no zoom
Subject movement: snow falling lightly; one car's headlights pass in the foreground; nothing else moves
Lighting:         cold blue ambient, warm sodium street lights switching on, low sun below the horizon (west, screen left)
Composition:      building fills the middle third, horizon at the upper third, towers on the left, safe area clear in the bottom 25 %
Duration:         4 s (one clip)
Aspect ratio:     9:16
Continuity:       same building design, colour and season as S03 and S05; snow level unchanged; camera on the street side
Negative:         no modern glass additions, no invented towers or skyscrapers, no people's faces, no text, no logos, no warping
```

## Rules
- **One shot, one action.** One camera move and at most one subject motion per prompt. If the storyboard scene has two actions, write two prompts and cut between them.
- **Real things described as they are.** Name the real building or place and describe it from the research (materials, shape, setting). Never "a futuristic skyscraper" for a real Calgary tower. Use the geo pack for what is where (the Bow north of downtown, the Rockies west).
- **Continuity tag.** Give each recurring location or look a tag (CI-STORY-MEWATA, CI-PULSE-MAP) and repeat the same fixed description word for word in every prompt that uses it. Keep time of day, season, weather, palette and camera side consistent.
- **Duration and format** in every prompt; generators make about 5-second clips, so a longer scene is two prompts.
- **People.** No real, identifiable person is generated. Historical people appear only in credited archival photos. Crowds are distant or silhouetted.
- **Data never in the generated picture.** Numbers, labels and maps are added in the engine on top, from the claims table, so they are exact.
- **Image-to-video for continuity.** For path B, generate the keyframe image first (image prompt below), then animate it, and start each following clip from the previous clip's last frame.
- **Model.** Hassan's preference for paid generation is the Wan 14B model (on a RunPod pod), not the small 5B one; Wan makes clips of about 5 seconds, so plan scenes in clips of 5 s or less. Ask Hassan before any spend.

## Image prompt template (keyframes, thumbnail plates, archival-style plates)

```
[IMG S04-key · 1080x1920 · continuity: CI-STORY-MEWATA]
Subject, environment, style, lighting and composition as in the S04 video prompt; frozen at its first frame.
Leave the top 35 % calm (sky) for the hook text; no text, no logos.
```

Archival-style plates are never presented as real archival photos. If a scene needs a real historical photo, find an openly licensed one (City of Calgary Archives, Glenbow/University of Calgary digital collections, Wikimedia Commons) and credit it on screen.

## Thumbnail prompt
One plate per format (1080×1920 cover, 1280×720 YouTube), matching the opening frame; the designed thumbnail itself (type, logo) is still built in the engine per PLAYBOOK section 5.
