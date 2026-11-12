# Sound design and editing

## Voiceover pacing
| Identity | Words per second | Gap between lines | Before a reveal | Feel |
|---|---|---|---|---|
| Storyteller | 2.1-2.4 | 0.45 s | 0.8-1.0 s of silence (music drops out) | measured, room to breathe |
| Data Explainer | 2.6-2.9 | 0.25-0.35 s | 0.4 s | brisk, punchy |
| Civic Analyst | 2.3-2.5 | 0.4 s | 0.6 s | calm, precise |

Narration is the free Kokoro voice (`af_heart`) on the studio-probe lane, one line per scene, numbers written in words. Scene lengths come from the measured line durations plus the gaps. Never stretch audio to fit a picture; change the picture.

## Music
Synthesised beds from `engine/sfx.py` (no licences needed):
- `story`: slow minor pad and a low pulse (Storyteller).
- `suspense`: drone and heartbeat that rise (Storyteller mystery beats, Origins chapter openings).
- `pulse`: bright 100 bpm plucks and kick (Data Explainer).
- `civic`: sparse piano-like chords (Civic Analyst).
- `none`: silence under the voice (allowed; often right for sensitive news).
Music sits about 20-26 dB under the voice and is ducked further while the voice speaks (the mix does this). Drop the music out 0.5-1 s before the biggest reveal and bring it back on the reveal. Never music under a quote or a victim-related news line.

## Effects vocabulary (tie every effect to something on screen)
| Visual event | Effect | Typical gain |
|---|---|---|
| Hook number or word slams in | `impact` | -3 to -5 dB |
| Whip, push, zoom-through | `whoosh` (or `whoosh_rev` into a reveal) | -8 dB |
| Counter rolling | `ticks` with `dur` = roll time | -10 dB |
| Pin drop, marker | `pop` then `ping` | -8 / -14 dB |
| Evidence or status chip lands | `stamp` | -8 dB |
| Build-up into a reveal | `riser` (1.5-2.5 s, ends on the cut) | -10 dB |
| Big reveal (Storyteller) | `boom` or `swell` | -6 dB |
| Document highlight | `click` | -12 dB |
| Archival photo appears | `shutter` | -12 dB |
| Places | ambience bed `city`, `wind`, `rain`, `crowd_murmur` with `dur` | -18 to -24 dB |

Cuts get no sound; transitions do. Write the cue sheet with timestamps in the bible and save it as `cues.json` for `sfx.py mix`.

## Mix and checks
`python3 sfx.py mix --voice vo.wav --cues cues.json --music story --dur <video length> --out mix.wav`, then mux with the picture (`-c:v copy -c:a aac -b:a 192k`). Check: `ffmpeg -i final.mp4 -af ebur128=peak=true -f null -` gives about -14 to -16 LUFS integrated and a peak under -1 dB; the voice is clearly on top (listen-check by numbers: `volumedetect` on a voice-only stretch vs a music-only stretch should differ by 15 dB or more); the last 1.5 s fades.

## Editing timeline
- The EDL in the bible is the source of truth; the scene file's `dur` values must match it.
- First 6 s: a picture change every 1.5-2.5 s (all identities).
- Cut on the narration stress or the sound hit, never mid-word.
- J-cuts: let the next scene's ambience start 0.3 s before the picture changes on place changes (Storyteller).
- Subtitles: burned in from the audited lines, max two lines, 32-46 characters a line, bottom band (vertical y≈1240-1420), never over the key number; on-screen numbers in digits from the claims table.
