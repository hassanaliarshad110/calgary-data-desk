# Claims table v2: new lines added Nov 15, 2026 ("Take the stage" + "Play together")

Game code: /home/claude/yyc (read-only clone of hassanaliarshad110/yyc-story, commit 4c69164). Paths are relative to that folder.
Display substitutions in burned-in captions: none needed for these lines (numbers are spoken and shown as words, e.g. "forty").
Posting context: these videos go out Wednesday Nov 18, 2026 on Calgary Insight; the game is played at calgaryinsight.ca/game (Play link opens calgaryinsight.ca/city-stories/).

## New narration lines
- s0 (full video, Part 1; Stampede section): "And you don't just watch the show. At Stampede Park, walk up on stage, grab the mic and perform, while the crowd in cowboy hats dances and the lyrics light up the big screen."
- n0 (full video, Part 3; new "Play together" section): "And here's the best part: you don't have to play alone."
- n1: "Go online, and dozens of Calgarians can share the same city at the same time, up to forty players at once."
- n2: "Explore together. Hop in a friend's car and ride along, or fly over the skyline together in a helicopter."
- n3: "Chat by text, or hold the mic button and talk with voice chat to the players near you."
- n4: "It's all free, right in your web browser."
- q0 (teaser): "Take the stage at Stampede Park. Or go online, and explore the city together with other Calgarians."

## New on-screen labels (not narrated)
- "Take the stage" / "Grab the mic · lyrics on the big screen"
- "Play together online" / "Up to forty players in one city"  (full video and Part 3)
- "Ride along" / "A friend's car or helicopter"
- "Text and voice chat" / "Talk to players near you"
- Teaser label: "Play together online" / "Explore the city with other Calgarians"
- Note chip on stage shots: "Stampede Park is re-created in the game · not affiliated with the Calgary Stampede"

## Social post text additions (no numbers allowed in post captions)
- "Play online together: room for dozens of players at once, ride in a friend's car or helicopter, text and voice chat"
- "Take the stage at Stampede Park and perform while the lyrics play on the big screen"

| # | Claim as worded | Evidence (file:line) |
|---|---|---|
| 33 | At Stampede Park there is a stage you can walk up onto | city-stories/js/stampede.js:239 (Grandstand Show stage at x 420, y -1192, title 'GRANDSTAND SHOW'); stampede.js:1-3 (Stampede Park, Grandstand Show); stagekit.js:1-2, 35-47 (solid stage, "you walk up the front steps onto the deck"); stampede.js:166 (the Stage uses solidStage) |
| 34 | Grab the mic and perform | stagekit.js:1-2 ("at the mic you can take over the show and rap the song yourself while the crowd dances"); main.js:446-456 toggleMic(): at the mic, press E: "You're on! Rap along with the words on the screen", player.act = { dance: 3 }; main.js:658 prompt "Press E (✋) to take the mic and rap 🎤" |
| 35 | While the crowd in cowboy hats dances | stampede.js:158-162 (the band and the front rows of the crowd are Dancers with { hats: true }); dancers.js:1-2 ("dancing to the beat ... cowboy hats at the Stampede"), dancers.js update() dance animation; stagekit.js:2 "while the crowd dances" |
| 36 | The lyrics light up the big screen | stampede.js:173-176 (stage screen: "🎤 LIVE ON STAGE: <name>" while you perform, and drawLyricsOn(g, W) "the song's words on the big screen while it plays", forced on while performing); lyrics.js:20-31 (drawLyricsOn draws the sung line); main.js:575-576 (music.concert(1) while on stage, updateLyrics) |
| 37 | Go online; you can play with others in the same city at the same time | city-stories/js/mp.js:1-3 ("Play online: see other players walking and driving around Calgary, text chat, and proximity voice chat"); mp.js:19 (one room: .../room/calgary); main.js:221 (🌐 Play online button), main.js:239-241 (free roam is online too: it joins automatically) |
| 38 | Dozens of Calgarians ... up to forty players at once | server/src/worker.js:4 (const MAX = 40; players per room); worker.js:27 (room full at 40); mp.js:19 (every client joins the single room "calgary") |
| 39 | Hop in a friend's car and ride along, or fly together in a helicopter | games.js:4 ("ride along in a friend's car or helicopter"); games.js:171-183 ridePass (works when the other player is in mode 'car' or 'heli'; toast "You're riding with <name>. They drive"); games.js:194-199 updateRide (you move with their car or helicopter); games.js:221 (driver sees "🚗 <name> hopped in — you drive!") |
| 40 | Fly over the skyline | js/heli.js (helicopter, flies anywhere in the city, incl. downtown); claim 4 of the first table |
| 41 | Chat by text | mp.js:42-45 (💬 "Chat (T)" button, chat box), mp.js:54 (T opens chat), mp.js:88 chat(); mp.js:113-117 bubble over the player |
| 42 | Hold the mic button and talk with voice chat to the players near you | mp.js:43 (🎤 "Hold to talk (V)"); mp.js:52-53 (pointerdown/up = push to talk); mp.js:21 VOICE_R = 45 m; mp.js:180-201 (connects to the closest players in range, louder the closer); mp.js:1-3 ("you hear people near you ... never recorded") |
| 43 | It's all free, right in your web browser | first table claims 3, 5 and 31 (free, in the browser, no download, no account); worker.js:5 (the online server accepts calgaryinsight.ca and www.calgaryinsight.ca) |
| 44 | "Explore the city together with other Calgarians" (teaser) | same as 37 (no number claimed) |

Round 1 audit (independent agent): CHANGES NEEDED on q0 only ("with dozens of other Calgarians" read as a promise of how many people are online; the code only sets a limit). Fixed to "explore the city together with other Calgarians"; post line tightened to "room for dozens of players at once".
