# GTA 6 eve: "Explore Calgary's real map today" (YYC City Stories) — Calgary Insight package

- Slot: special, all posts on Wednesday November 18, 2026 (America/Edmonton), the day before GTA 6's release (Rockstar: Thursday, November 19, 2026, PlayStation 5 and Xbox Series X|S; re-checked Nov 15 with web search).
- Requested by Hassan on Nov 15, 2026. Made unattended; no paid credits used (Kokoro on GitHub Actions, Playwright + SwiftShader capture of the game, PIL/ffmpeg compositing).
- Formats: full video 1920×1080 (YouTube 11:00, Facebook 13:00); native 1080×1920 teaser (8:00) and Parts 1-3 (15:00, 17:30, 20:00) for Instagram Reels, Facebook Reels and YouTube Shorts.
- Credit: calgaryinsight.ca only. The game's on-screen byline, the in-game credits, Natalia's music-video end card and the free-roam crew name tags were kept out of every captured frame (CSS hid the credits; those screens were never filmed). The "See it for real" photo feature was not claimed: it only works on github.io/localhost, not on calgaryinsight.ca.

## 1. Lead identity and direction
- Lead: Data Explainer pace (punchy hook, clean labels) over real gameplay, borrowing the Storyteller's slow drone moves for the skyline, river and Stampede night, and the Civic Analyst's evidence chips ("From the City's open data", "not affiliated with ..." notes).
- Visual hook (0-5 s): fast cuts every ~1 s (downtown drone, Grandstand fireworks, CTrain ride, midway Ferris wheel, Saddledome at night) under kinetic text "GTA 6 drops TOMORROW." → "But what if your next open world…" → "is CALGARY?" in Calgary Insight's own type (Fira Sans Bold, gold accent). No Rockstar/GTA logos, fonts, art or footage. Small line on the hook: "Not affiliated with Rockstar Games."
- Continuity: real in-game footage only ("Gameplay: YYC City Stories" chip on every shot), Calgary Insight header (logo + CALGARY INSIGHT · GAMEPLAY on 16:9; centred logo + "Calgary Insight" on 9:16), navy/gold label cards, white-on-dark burned captions. Day scenes at 13:00-16:00 game time, Stampede at 21:30-22:00 (fireworks/concert hours). Halloween decorations switched off (Settings).
- Vertical versions are laid out natively at 1080×1920 (portrait viewport captures, full-bleed gameplay); captions and labels between y≈300 and y≈1420, clear of the right 120 px.

## 2. Capture method (free)
- Game served locally from a read-only clone of the game repo; Chromium (SwiftShader WebGL). Time made deterministic: requestAnimationFrame / performance.now / Date.now replaced by a manual clock; 3 game frames (0.1 s) per captured frame, only the last one rendered; JPEG q92 screenshots via CDP. Clips are then played back at the needed length with frame blending.
- Camera: the game's own cinematic camera hook (game.cineCam) on splines for drone shots; the game's own chase camera for gameplay (CTrain ride on the Blue Line from Bridgeland - Memorial to Centre Street, driving in Bridgeland, helicopter over Eau Claire, the 311 request card in Temple, the Genesis Centre info card, Natalia's bullying mission, the bus-stop panel at EB 9 Av S @ Centre St S).
- Clips (both orientations unless noted): skyline, tower, cityhall, river, homes (Bridgeland street), fireworks (Grandstand), saddledome (night, concert lawn), midway, bus, ctrain, r311, card, natalia, chars (character select), langs (language picker, Punjabi and Arabic screens), title; car and heli (16:9 only).

## 3. Sound design
- Voice: Kokoro af_heart (budget-probe Actions lane, run 43699393524), one WAV per line; lines start 0.35 s in; 0.9 s gaps (full) / 0.6 s (vertical) plus breathers of 1.2-1.6 s at section changes, where the music rises.
- Music: "Under One Sky" (the game's title song, audio/under-one-sky.mp3) from the chorus at 61.8 s (the game's own CHORUS point, confirmed with a short-term loudness scan: the song steps up from about -18 to -15 LUFS-S at 60 s), looped with a 3 s crossfade; ducked to about 16 dB under the voice and lifted 7 dB between lines; 2 s fade-out.
- Mix: integrated -14 LUFS, limiter at about -1.9 dBFS. Measured per output in section 8.

## 4. AI video prompts (for an optional paid cinematic version; not run)
Continuity tags: stylised low-poly game look, clean daylight or neon Stampede night, no real people's faces, no third-party logos.
1. Hook: rapid drone push over a stylised low-poly downtown Calgary skyline with a red-and-white observation tower, fast cut to fireworks over a stadium stage, a light-rail train gliding past towers, a lit Ferris wheel. 2. Aerial orbit of the downtown skyline at 2 pm, slow, 3D game style. 3. Low dolly down a residential street of detailed two-storey houses, autumn trees. 4. Crane up beside a sandstone city hall with a green copper clock tower. 5. Rising shot up a slim observation tower against blue sky. 6. Night midway: Ferris wheel lights, food booths, string lights, crowds in cowboy hats (stylised). 7. Fireworks over an outdoor grandstand stage at night. 8. Neon-lit arena with a saddle-shaped roof at night, concert lawn. 9. Third-person view of a red-and-white light-rail train running down a median toward a skyline. 10. Floating map icons above a suburban field, then a white info card. 11. Character select screen with five avatars. 12. Language picker with six languages. 13. Red helicopter lifting off over a river park. 14. Calm golden-hour flight along a river with islands, skyline and mountains.

Image prompts: thumbnail background "stylised 3D game render of a downtown skyline with a red-and-white observation tower, clear afternoon, aerial, wide, saturated, room for bold text on the left".

## 5. Narration (approved, spoken form; captions show GTA 6, YYC, 311, 811 and calgaryinsight.ca/game)

### Full video (1920×1080, 226.3 s)
| # | in–out (s) | line |
|---|---|---|
| f0 | 0.3–5.1 | G T A six drops tomorrow. But what if your next open world... is Calgary? |
| f1 | 6.0–13.8 | You know these streets. Now you can walk them, drive them, and even fly over them, in a free game built on the real map of Calgary. |
| f2 | 14.7–21.2 | It's called Y Y C City Stories. It runs right in your web browser, with no download and no account. |
| f3 | 23.3–33.0 | Start with the map. The streets come from OpenStreetMap. The buildings, the parks, and even the shape of the ground mostly come from the City of Calgary's open data. |
| f4 | 33.9–39.9 | So when you drive down your own street, the homes are where they really are, fitted to their real footprint and height. |
| f5 | 40.8–55.0 | In and around downtown, the skyline is real too. Landmarks like Historic City Hall, The Bow, TELUS Sky and the Saddledome are built as their own detailed 3D models. And the Calgary Tower stands right where it should. |
| f6 | 57.5–62.0 | But the skyline is only the beginning. Wait until you see Stampede Park. |
| f7 | 62.9–72.6 | In this game, it's always Stampede time. There's a midway with a Ferris wheel and food booths, the Grandstand Show, a country music stage, and fireworks every night. |
| f8 | 73.5–80.9 | Next to the Saddledome, there's a concert of the game's own title song, Under One Sky. That's the song you're hearing right now. |
| f9 | 83.4–90.6 | Need to get around? Calgary Transit is in the game, with real bus routes and real stops from the City's own timetable. |
| f10 | 91.5–97.6 | Walk up to a stop, catch a bus, or ride the CTrain on the Red and Blue lines, right through downtown. |
| f11 | 98.5–102.4 | Now here's something a little different: real three one one requests. |
| f12 | 103.3–115.6 | Recent service requests from the City's open data show up as icons in the community where they were reported. Tap one to see what it's about, when it was reported, whether it's still open, and who's handling it. |
| f13 | 118.1–119.6 | And then, there are the stories. |
| f14 | 120.5–139.4 | Pick one of five characters. Ali, who just landed at Y Y C to start a new life. Natalia, a high school student who stands up to bullies. Chris, a seventy-two-year-old senior. Jean, who has lived in Martindale for years. And Leo, a visitor who arrives right in the middle of the Stampede. |
| f15 | 140.3–150.6 | Across twenty-seven missions, they learn how the city really works. How to pay a transit fare. Where newcomers can get free help. What Fair Entry and the public library offer. |
| f16 | 151.5–160.4 | How to sort your black, blue and green carts. Why you clear your sidewalk after it snows. When to call Health Link at eight one one. And how to spot a scam. |
| f17 | 161.3–166.2 | Natalia's story takes on bullying and cyberbullying, and it ends with a music video. |
| f18 | 167.1–174.4 | You can play in six languages: English, French, Punjabi, Urdu, Tagalog and Arabic, with voice lines in each one. |
| f19 | 175.3–183.3 | And when you just want to explore, there's free roam. Grab a car, call a helicopter, hunt for landmarks, or play online with other players. |
| f20 | 185.6–194.9 | So, is this G T A? No. G T A six comes out tomorrow on PlayStation five and Xbox Series X and S. If you're playing it, have fun! |
| f21 | 195.8–203.3 | Y Y C City Stories is something different: a small, free game about the city we actually live in. And you can play it today. |
| f22 | 204.8–207.7 | Play free at calgary insight dot c a slash game. |
| f23 | 208.6–212.0 | Which Calgary spot should we add next? Tell us in the comments. |
| f24 | 212.9–219.2 | Follow Calgary Insight on Facebook and Instagram, and subscribe on YouTube, for more Calgary stories. |

### teaser (1080×1920, 30.6 s)
| line | starts at (s) | text |
|---|---|---|
| t0 | 0.3 | G T A six drops tomorrow. But you can explore Calgary today. |
| t1 | 4.9 | It's a free game on the real map of Calgary. Real streets, homes right where they stand, and Calgary's landmarks. |
| t2 | 12.1 | Stampede Park. Real bus routes and the CTrain. Even real three one one requests. |
| t3 | 18.3 | Five characters, six languages, and twenty-seven missions about how the city works. |
| t4 | 23.7 | Play free at calgary insight dot c a slash game. Which Calgary spot should we add next? |

### part1 (1080×1920, 66.7 s)
| line | starts at (s) | text |
|---|---|---|
| p0 | 0.3 | G T A six drops tomorrow. But did you know you can already explore Calgary's real map? Part one: the city. |
| f3 | 7.8 | Start with the map. The streets come from OpenStreetMap. The buildings, the parks, and even the shape of the ground mostly come from the City of Calgary's open data. |
| f4 | 18.2 | So when you drive down your own street, the homes are where they really are, fitted to their real footprint and height. |
| f5 | 24.7 | In and around downtown, the skyline is real too. Landmarks like Historic City Hall, The Bow, TELUS Sky and the Saddledome are built as their own detailed 3D models. And the Calgary Tower stands right where it should. |
| f7 | 39.5 | In this game, it's always Stampede time. There's a midway with a Ferris wheel and food booths, the Grandstand Show, a country music stage, and fireworks every night. |
| f8 | 49.9 | Next to the Saddledome, there's a concert of the game's own title song, Under One Sky. That's the song you're hearing right now. |
| p1 | 57.9 | Play free at calgary insight dot c a slash game. Which landmark would you visit first? Part two is coming later today. |

### part2 (1080×1920, 48.2 s)
| line | starts at (s) | text |
|---|---|---|
| p2 | 0.3 | G T A six drops tomorrow. Here's how a free Calgary game does transit and three one one. Part two. |
| f9 | 7.5 | Need to get around? Calgary Transit is in the game, with real bus routes and real stops from the City's own timetable. |
| f10 | 15.2 | Walk up to a stop, catch a bus, or ride the CTrain on the Red and Blue lines, right through downtown. |
| f11 | 22.0 | Now here's something a little different: real three one one requests. |
| f12 | 26.5 | Recent service requests from the City's open data show up as icons in the community where they were reported. Tap one to see what it's about, when it was reported, whether it's still open, and who's handling it. |
| p3 | 39.3 | Play free at calgary insight dot c a slash game. Have you ever made a three one one request? Part three is coming tonight. |

### part3 (1080×1920, 61.3 s)
| line | starts at (s) | text |
|---|---|---|
| p4 | 0.3 | G T A six drops tomorrow. But this free Calgary game has stories of its own. Part three. |
| f14 | 6.8 | Pick one of five characters. Ali, who just landed at Y Y C to start a new life. Natalia, a high school student who stands up to bullies. Chris, a seventy-two-year-old senior. Jean, who has lived in Martindale for years. And Leo, a visitor who arrives right in the middle of the Stampede. |
| f15 | 26.2 | Across twenty-seven missions, they learn how the city really works. How to pay a transit fare. Where newcomers can get free help. What Fair Entry and the public library offer. |
| f16 | 37.2 | How to sort your black, blue and green carts. Why you clear your sidewalk after it snows. When to call Health Link at eight one one. And how to spot a scam. |
| f18 | 46.7 | You can play in six languages: English, French, Punjabi, Urdu, Tagalog and Arabic, with voice lines in each one. |
| p5 | 54.7 | Play free at calgary insight dot c a slash game. Which character would you play first? |

## 6. Storyboard / edit decision list (EDL)

### full_land
| in–out (s) | gameplay clip (fraction played) | zoom | on-screen label |
|---|---|---|---|
| 0.0–1.0 | skyline (0.55–0.70) | 1 |  |
| 1.0–1.9 | fireworks (0.30–0.45) | 1 |  |
| 1.9–2.9 | ctrain (0.50–0.65) | 1 |  |
| 2.9–3.8 | midway (0.30–0.50) | 1 |  |
| 3.8–6.0 | saddledome (0.20–0.40) | 1 |  |
| 6.0–8.6 | homes (0.00–0.50) | 1 |  |
| 8.6–11.6 | car (0.10–0.80) | 1 |  |
| 11.6–14.7 | heli (0.30–1.00) | 1 |  |
| 14.7–17.9 | title (0.00–1.00) | 1.75→1.84 | Free game · in your browser: YYC City Stories |
| 17.9–23.3 | chars (0.82–0.98) | 1.75→1.75 |  |
| 23.3–30.3 | skyline (0.00–0.55) | 1 | The real map: OpenStreetMap + City of Calgary open data |
| 30.3–33.9 | river (0.00–0.50) | 1 |  |
| 33.9–40.8 | homes (0.30–1.00) | 1 | Real homes: Real footprints and heights |
| 40.8–46.4 | cityhall (0.00–1.00) | 1 | Landmark: Historic City Hall |
| 46.4–52.0 | tower (0.00–1.00) | 1 | Landmark: Calgary Tower |
| 52.0–57.5 | skyline (0.50–1.00) | 1 |  |
| 57.5–60.1 | river (0.50–0.80) | 1 |  |
| 60.1–62.9 | saddledome (0.00–0.40) | 1 |  |
| 62.9–68.9 | midway (0.00–1.00) | 1 | Stampede Park: Midway · Grandstand Show · fireworks |
| 68.9–73.5 | fireworks (0.00–0.60) | 1 |  |
| 73.5–80.7 | saddledome (0.30–1.00) | 1 | Music: Under One Sky, the game's title song |
| 80.7–83.4 | fireworks (0.60–1.00) | 1 |  |
| 83.4–85.8 | bus (0.00–0.30) | 1 | Calgary Transit: Real routes and stops |
| 85.8–91.5 | bus (0.30–1.00) | 1.00→1.70 |  |
| 91.5–98.5 | ctrain (0.00–1.00) | 1 | Ride the CTrain: Red Line and Blue Line |
| 98.5–103.3 | r311 (0.00–0.40) | 1 | Real 311 requests: From the City's open data |
| 103.3–109.8 | r311 (0.40–0.58) | 1 |  |
| 109.8–118.1 | r311 (0.58–1.00) | 1.35→1.75 |  |
| 118.1–120.5 | chars (0.00–0.02) | 1.75→1.75 |  |
| 120.5–124.2 | chars (0.00–0.19) | 1.75→1.75 |  |
| 124.2–128.2 | chars (0.20–0.39) | 1.75→1.75 |  |
| 128.2–131.6 | chars (0.40–0.59) | 1.75→1.75 |  |
| 131.6–135.2 | chars (0.60–0.79) | 1.75→1.75 |  |
| 135.2–140.3 | chars (0.80–1.00) | 1.75→1.75 |  |
| 140.3–146.3 | card (0.20–1.00) | 1.40→1.60 |  |
| 146.3–151.5 | natalia (0.00–0.45) | 1 | Twenty-seven missions: Learn how the city works |
| 151.5–156.5 | card (0.00–0.60) | 1.60→1.70 |  |
| 156.5–161.3 | natalia (0.55–1.00) | 1.45→1.55 | Missions teach: Carts · snow · Health Link 811 · scams |
| 161.3–167.1 | natalia (0.00–0.50) | 1.20→1.35 | Natalia's story: Bullying and cyberbullying |
| 167.1–175.3 | langs (0.00–1.00) | 1.75→1.75 |  |
| 175.3–179.3 | heli (0.00–0.60) | 1 | Free roam: Cars · helicopter · landmarks · online |
| 179.3–182.8 | car (0.30–1.00) | 1 |  |
| 182.8–185.6 | river (0.60–1.00) | 1 |  |
| 185.6–190.8 | tower (0.20–1.00) | 1 |  |
| 190.8–195.8 | skyline (0.20–0.70) | 1 |  |
| 195.8–204.8 | river (0.00–1.00) | 1 | Free · no download · no account: Play it today |
| 204.8–208.6 | skyline (0.60–1.00) | 1 |  |
| 208.6–212.9 | fireworks (0.20–0.80) | 1 |  |
| 212.9–219.8 | saddledome (0.00–0.70) | 1 |  |
| 219.8–226.3 | saddledome (0.70–1.00) | 1 |  |
- CTA card 204.8–208.3 s: PLAY FREE / calgaryinsight.ca/game
- CTA card 208.6–212.9 s: Drop your thoughts below / Which Calgary spot should we add next?
- CTA card 212.9–219.8 s: Follow @calgaryinsight / Facebook · Instagram · YouTube
- Note chip 57.5–81.5 s: Stampede Park is re-created in the game · not affiliated with the Calgary Stampede
- Note chip 208.6–219.8 s: Stampede Park is re-created in the game · not affiliated with the Calgary Stampede
- Note chip 83.4–115.6 s: Not affiliated with the City of Calgary
- Note chip 185.6–195.4 s: Not affiliated with Rockstar Games
- Follow pop-up at 118.3 s for 2.6 s
- End card from 219.8 s: logo, title, Play free: calgaryinsight.ca/game, comment prompt, SUBSCRIBE + Follow @calgaryinsight, More at calgaryinsight.ca, not-affiliated line

### teaser
| in–out (s) | gameplay clip (fraction played) | zoom | on-screen label |
|---|---|---|---|
| 0.0–1.0 | skyline (0.55–0.70) | 1 |  |
| 1.0–2.0 | fireworks (0.30–0.45) | 1 |  |
| 2.0–3.0 | ctrain (0.50–0.65) | 1 |  |
| 3.0–4.9 | midway (0.30–0.50) | 1 |  |
| 4.9–8.1 | skyline (0.00–0.50) | 1 | Free game: The real map of Calgary |
| 8.1–10.3 | homes (0.30–0.80) | 1 |  |
| 10.3–12.1 | cityhall (0.20–0.80) | 1 |  |
| 12.1–14.1 | fireworks (0.00–0.50) | 1 | Stampede · CTrain · 311: Real routes, real 311 data |
| 14.1–16.1 | ctrain (0.30–0.80) | 1 |  |
| 16.1–18.3 | r311 (0.50–0.80) | 1 |  |
| 18.3–20.9 | chars (0.00–0.60) | 1.25→1.30 | Five characters · six languages: Twenty-seven missions |
| 20.9–23.7 | langs (0.40–1.00) | 1.25→1.30 |  |
| 23.7–30.6 | skyline (0.40–1.00) | 1 |  |
- CTA card 23.7–30.6 s: Play free: calgaryinsight.ca/game / Which Calgary spot should we add next?
- Note chip 12.1–14.3 s: Re-created in the game · not affiliated with the Calgary Stampede
- Note chip 4.9–11.5 s: Not affiliated with Rockstar Games or the City of Calgary
- Note chip 23.7–30.6 s: Drop your thoughts below
- Follow pop-up at 7.5 s for 2.4 s

### part1
| in–out (s) | gameplay clip (fraction played) | zoom | on-screen label |
|---|---|---|---|
| 0.0–1.1 | skyline (0.55–0.70) | 1 |  |
| 1.1–2.2 | tower (0.60–0.75) | 1 |  |
| 2.2–3.3 | river (0.30–0.45) | 1 |  |
| 3.3–4.5 | cityhall (0.30–0.50) | 1 |  |
| 4.5–7.8 | skyline (0.70–0.90) | 1 |  |
| 7.8–13.8 | skyline (0.00–0.55) | 1 | The real map: OpenStreetMap + City of Calgary open data |
| 13.8–18.2 | river (0.00–0.60) | 1 |  |
| 18.2–24.7 | homes (0.00–1.00) | 1 | Real homes: Real footprints and heights |
| 24.7–30.1 | cityhall (0.00–1.00) | 1 | Landmark: Historic City Hall |
| 30.1–35.5 | tower (0.00–1.00) | 1 | Landmark: Calgary Tower |
| 35.5–39.5 | skyline (0.50–1.00) | 1 |  |
| 39.5–45.1 | midway (0.00–1.00) | 1 | Stampede Park: Midway · Grandstand Show · fireworks |
| 45.1–49.9 | fireworks (0.00–1.00) | 1 |  |
| 49.9–57.9 | saddledome (0.00–1.00) | 1 | Music: Under One Sky, the game's title song |
| 57.9–66.7 | river (0.00–1.00) | 1 |  |
- CTA card 57.9–66.7 s: Play free: calgaryinsight.ca/game / Which landmark would you visit first?
- Note chip 39.5–57.3 s: Re-created in the game · not affiliated with the Calgary Stampede
- Note chip 7.8–17.6 s: Not affiliated with Rockstar Games or the City of Calgary
- Note chip 57.9–66.7 s: Drop your thoughts below
- Follow pop-up at 25.2 s for 2.4 s

### part2
| in–out (s) | gameplay clip (fraction played) | zoom | on-screen label |
|---|---|---|---|
| 0.0–1.2 | ctrain (0.50–0.65) | 1 |  |
| 1.2–2.3 | bus (0.30–0.50) | 1.25→1.30 |  |
| 2.3–3.5 | r311 (0.20–0.35) | 1 |  |
| 3.5–7.5 | ctrain (0.65–1.00) | 1 |  |
| 7.5–9.9 | bus (0.00–0.30) | 1.25→1.30 | Calgary Transit: Real routes and stops |
| 9.9–15.2 | bus (0.30–1.00) | 1.25→1.30 |  |
| 15.2–22.0 | ctrain (0.00–1.00) | 1 | Ride the CTrain: Red Line and Blue Line |
| 22.0–26.5 | r311 (0.00–0.40) | 1 | Real 311 requests: From the City's open data |
| 26.5–33.0 | r311 (0.40–0.58) | 1 |  |
| 33.0–39.3 | r311 (0.58–1.00) | 1.25→1.30 |  |
| 39.3–48.2 | river (0.00–1.00) | 1 |  |
- CTA card 39.3–48.2 s: Play free: calgaryinsight.ca/game / Have you ever made a 311 request?
- Note chip 7.5–38.7 s: Not affiliated with the City of Calgary or Rockstar Games
- Note chip 39.3–48.2 s: Drop your thoughts below
- Follow pop-up at 22.5 s for 2.4 s

### part3
| in–out (s) | gameplay clip (fraction played) | zoom | on-screen label |
|---|---|---|---|
| 0.0–1.1 | natalia (0.20–0.30) | 1 |  |
| 1.1–2.3 | chars (0.30–0.36) | 1.25→1.30 |  |
| 2.3–3.5 | card (0.30–0.50) | 1.25→1.30 |  |
| 3.5–6.8 | langs (0.70–0.90) | 1.25→1.30 |  |
| 6.8–10.5 | chars (0.00–0.19) | 1.25→1.30 | Five characters: Ali · Natalia · Chris · Jean · Leo |
| 10.5–14.5 | chars (0.20–0.39) | 1.25→1.30 |  |
| 14.5–17.9 | chars (0.40–0.59) | 1.25→1.30 |  |
| 17.9–21.5 | chars (0.60–0.79) | 1.25→1.30 |  |
| 21.5–26.2 | chars (0.80–1.00) | 1.25→1.30 |  |
| 26.2–31.7 | card (0.20–1.00) | 1.25→1.30 | Twenty-seven missions: Learn how the city works |
| 31.7–37.2 | natalia (0.00–0.45) | 1 |  |
| 37.2–41.7 | card (0.00–0.60) | 1.25→1.30 | Missions teach: Carts · snow · Health Link 811 · scams |
| 41.7–46.7 | natalia (0.55–1.00) | 1.25→1.30 |  |
| 46.7–54.7 | langs (0.00–1.00) | 1.25→1.30 | Six languages: English · French · Punjabi · Urdu · Tagalog · Arabic |
| 54.7–61.3 | chars (0.80–1.00) | 1.25→1.30 |  |
- CTA card 54.7–61.3 s: Play free: calgaryinsight.ca/game / Which character would you play first?
- Note chip 6.8–25.6 s: Not affiliated with Rockstar Games or the City of Calgary
- Note chip 54.7–61.3 s: Drop your thoughts below
- Follow pop-up at 37.7 s for 2.4 s

## 7. Sources and fact audit

# Claims table: "GTA 6 tomorrow, explore real Calgary today" (YYC City Stories)

Game code: /home/claude/yyc-story (folder city-stories/). All paths below are relative to city-stories/ unless they start with ../ . Public page of the game: calgaryinsight.ca/game/ (its "Play" link goes to calgaryinsight.ca/city-stories/, the same code).

Display substitutions in burned-in captions (spoken form -> shown form): "G T A six" -> "GTA 6"; "Y Y C" -> "YYC"; "three one one" -> "311"; "eight one one" -> "811"; "calgary insight dot c a slash game" -> "calgaryinsight.ca/game"; "3D" stays.

| # | Claim as worded | Evidence (file:line or URL) |
|---|---|---|
| 1 | GTA 6 "drops tomorrow" / "comes out tomorrow" (all posts go out Wed Nov 18, 2026, Calgary time) | Rockstar Newswire: https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026 ; Rockstar on X: https://x.com/RockstarGames/status/1986540361011880167 (Thursday, November 19, 2026) |
| 2 | GTA 6 comes out on PlayStation 5 and Xbox Series X and S | Same Rockstar Newswire article; also https://www.forbes.com/sites/brianmazique/2026/05/12/grand-theft-auto-6-release-date-and-everything-confirmed/ |
| 3 | A free game built on the real map of Calgary | ../README.md "Map data"; CREDITS.txt:3-4 and :12 ("free and non-commercial"); index.html of the public page ("isAccessibleForFree": true) |
| 4 | You can walk, drive and fly over the streets | js/player.js (modes foot / car / heli); js/heli.js; js/main.js placeHeli() in startGame ("a helicopter next to you, whichever way you start") |
| 5 | It's called YYC City Stories; runs in your web browser; no download, no account | index.html <title>; js/mp.js:66-68 (online play asks only a display name, stored in localStorage); no login code anywhere |
| 6 | Streets come from OpenStreetMap | CREDITS.txt:3-4; world.json credits ("Map data © OpenStreetMap contributors") |
| 7 | Buildings, parks and the shape of the ground come from the City of Calgary's open data | js/main.js:141 credits list ("Ground heights: City of Calgary LiDAR bare-earth elevation model", "Park benches ... City of Calgary Parks open data"); world.json credits ("Building shapes: City of Calgary 3D building models from LiDAR"); ../README.md ("Building outlines, communities, wards, parks ... City of Calgary") |
| 8 | Homes are where they really are, fitted to their real footprint and height | js/houses3d.js:1-4 ("each plain house from the City's 3D buildings is replaced by a detailed model ... fitted to its real footprint and height") |
| 9 | Historic City Hall, The Bow, TELUS Sky and the Saddledome are built as their own detailed 3D models | js/houses3d.js:103-127 (model list); js/main.js:141 credits ("landmarks (Historic City Hall, The Bow, Brookfield Place, Suncor Energy Centre, TELUS Sky, the Saddledome ...): 3D models made for this game") |
| 10 | The Calgary Tower stands right where it should | js/world.js:66-79 (tower built at the landmark position); world.json landmarks: Calgary Tower x -352, y -112 (metres from City Hall) |
| 11 | It's always Stampede time (Stampede Park) | js/main.js:173 ("it's Stampede time: the fair at Stampede Park"), built at every start with no date check; js/stampede.js |
| 12 | A midway with a Ferris wheel and food booths, the Grandstand Show, a country music stage, and fireworks every night | js/stampede.js:1-4 ("midway (Ferris wheel, swing ride, food and game booths...), the Grandstand Show ..., a country music stage, ... fireworks every night"); js/stampede.js:23 isFireworks |
| 13 | Next to the Saddledome there's a concert of the game's own title song, Under One Sky | js/main.js (game.concert = new Concert(scene, 385, -772 ...) "on the lawn north of the Saddledome, facing it"); js/concert.js:1-2, :11 (concert 7 pm to 3 am, "Under One Sky" playing) |
| 14 | "That's the song you're hearing right now" | The video's music bed is audio/under-one-sky.mp3, the game's title song (js/music.js; js/main.js:141 "Title song: Under One Sky") |
| 15 | Calgary Transit is in the game with real bus routes and real stops from the City's own timetable | world.json credits ("Calgary Transit routes and stops from the City of Calgary open data timetable"); world.json: 261 routes, 6,213 stops; js/buses.js:1 ("every real bus stop (City of Calgary open data)") |
| 16 | Walk up to a stop, catch a bus, or ride the CTrain on the Red and Blue lines, right through downtown | js/buses.js:1-2; js/metro.js:1-2 ("Take the CTrain from any station"); world.json routes "201 Red Line" and "202 Blue Line"; js/stories.js (ali-transit: Blue Line ride Saddletowne to City Hall) |
| 17 | Recent 311 service requests from the City's open data show up as icons in the community where they were reported | js/r311.js:1-3 ("Calgary 311 requests from the last two weeks (City of Calgary open data ...) ... every icon sits at its own random spot inside that community"); ../tools/fetch_311.py:1,6 (last 14 days, dataset iahh-g8bj); data/311.json (made 2026-11-10, 15,244 requests) |
| 18 | Tap one to see what it's about, when it was reported, whether it's still open, and who's handling it | js/r311.js:50-54 (tap opens card); js/r311.js:98-105 (title = service, Open/Closed, "reported <date>", "Handled by: <agency>") |
| 19 | Five characters: Ali, who just landed at YYC to start a new life; Natalia, a high school student who stands up to bullies; Chris, a 72-year-old senior; Jean, who has lived in Martindale for years; Leo, a visitor who arrives in the middle of the Stampede | js/stories.js:89-100 (CHARACTERS and blurbs: "Ali just landed at YYC to start a new life", "Natalia goes to high school ... Stand up to bullies", "Chris is 72", "Jean has lived in Martindale for years", "Leo is visiting Calgary for the first time, right in the middle of the Stampede") |
| 20 | Twenty-seven missions | js/stories.js: 27 mission objects (grep -c "id: '" js/stories.js = 27: Ali 7, Natalia 6, Chris 4, Jean 4, Leo 6); public page says "27 missions" |
| 21 | Missions teach: how to pay a transit fare | js/stories.js:133-140 (ali-arrive card "Paying for the bus and the CTrain") |
| 22 | Where newcomers can get free help | js/stories.js:146-152 (ali-newcomers card "Help for newcomers is free") |
| 23 | What Fair Entry and your local library offer | js/stories.js:212-217 (ali-community card: Saddletowne Library free programs; Fair Entry discounts) ; also chris senior pass mission (stories.js ~451) |
| 24 | How to sort your black, blue and green carts | js/stories.js:507 (jean "Black, blue and green" waste carts mission) |
| 25 | Why you clear your sidewalk after it snows | js/stories.js:521 (jean "Shovel your sidewalk", 24-hour rule) |
| 26 | When to call Health Link at 811 | js/stories.js:462 (chris "Stay healthy", Health Link 811) |
| 27 | How to spot a scam | js/stories.js:473 (chris "Don't get scammed") |
| 28 | Natalia's story takes on bullying and cyberbullying, and ends with a music video | js/stories.js:246, 332 (nat-stand; "The group chat" cyberbullying), 387-429 (assembly ends with the "Beyond the Mask" music video, js/songvideo.js) |
| 29 | Six languages: English, French, Punjabi, Urdu, Tagalog and Arabic, with voice lines in each | js/i18n.js:2-9; lang/*.json; audio/{en,fr,pa,ur,tl,ar}/ (83 mp3 each, audio/manifest.json); js/voice.js |
| 30 | Free roam: grab a car, call a helicopter, hunt for landmarks, play online with other players | js/main.js startGame('free'); js/player.js toggleSeat (cars, F); js/heli.js and HUD button "Call the helicopter (K)" (index.html); world.json 33 landmarks + js/missions.js "Landmark found"; js/mp.js (online: other players, chat) |
| 31 | A small, free game about the city we live in, playable today | CREDITS.txt:12; public page calgaryinsight.ca/game/ (live since before Nov 15, 2026) |

On-screen labels (not narrated): "Gameplay: YYC City Stories"; "Not affiliated with Rockstar Games."; on Stampede shots "Stampede Park re-created in the game · not affiliated with the Calgary Stampede" (js/main.js:141 credits: "a game re-creation, not affiliated with the Calgary Stampede"); music credit "Music: Under One Sky, the game's title song"; "Play free: calgaryinsight.ca/game"; "Not affiliated with Rockstar Games or the City of Calgary." (the public game page says "not affiliated with The City of Calgary"). The video music bed for every version is audio/under-one-sky.mp3.
| 32 | In and around downtown, the skyline is real too | world.json credits ("Building shapes: City of Calgary 3D building models from LiDAR"); js/main.js loadSky3D (b3d skyline) |


Audit: round 1 (independent agent) returned CHANGES NEEDED: "real homes" in the teaser, "the real Calgary" in Part 1, "Calgary anthem" (the code calls it the title song), "Downtown" for the Saddledome. All four fixed, plus "mostly" for City data and "the public library". Round 2 (new independent agent, 31 claims + the skyline line): **APPROVED**. Report: audits/2026-11-18-GTA6-EVE.md.


## 8. QC

| Check | Result |
|---|---|
| Fact audit | APPROVED in round 2 (two independent agents) |
| Narration = approved script | lines_used.json on budget-probe-out equals lines.json (checked) |
| Hook in first 2 s | kinetic "GTA 6 drops TOMORROW." on screen at frame 0 over moving gameplay, voice from 0.35 s; cuts every ~1 s in the first 5 s |
| No logo/title card first | header appears only after the hook |
| Real gameplay only, labelled | every shot is captured from YYC City Stories; "Gameplay: YYC City Stories" chip on every non-hook frame |
| No Rockstar/GTA assets | "GTA 6" written in Fira Sans; no logos, key art, fonts, trailer footage or characters; "Not affiliated with Rockstar Games or the Calgary Stampede." on every hook |
| Disclaimers | City of Calgary and Calgary Stampede not-affiliated chips on transit/311 and Stampede shots; end card line |
| No personal names | game byline, credits, songs' credits, end cards and crew tags never captured; only calgaryinsight.ca credited |
| Captions | burned in, white on dark; vertical between y≈1250-1350, clear of the right 120 px; spoken "calgary insight dot c a slash game" shown as calgaryinsight.ca/game |
| Vertical layout | native 1080×1920 portrait captures, full-bleed; game UI panels zoomed ×1.25 and kept above captions |
| Ending | full video (>2 min): CTA + question + follow/subscribe + end card held 6.5 s; verticals (<2 min): closing question card with calgaryinsight.ca/game, 1.6 s hold, no end card |
| Follow pop-up | mid-video pill in every version over 25 s |
| Music | "Under One Sky" from the chorus under every version, about 16 dB under the voice, +7 dB between lines |
| Loudness | see the measured table below |

Measured (ffmpeg ebur128 on the final files): full 3:46, -14.0 LUFS, peak -1.7 dBFS; teaser 30.6 s, -14.0 LUFS, -1.8 dBFS; Part 1 66.7 s, -14.1 LUFS, -1.7 dBFS; Part 2 48.2 s, -14.1 LUFS, -0.8 dBFS; Part 3 61.3 s, -14.1 LUFS, -1.6 dBFS.
Voice vs music (stems, before the final file): music under the voice 15.7-16.0 dB below the voice in every version; between lines the song comes up about 7 dB (full: -23.3 LUFS vs voice -13.5).
Contact sheets of every output were reviewed; fixed before posting: label/UI overlaps on zoomed game screens (labels dropped or moved), hook gradient band in 9:16, "PART 1" wrap, follow pill vs note chip, kicker overflow, game title screen behind end CTAs (swapped for gameplay).

---

## v2 revision (Nov 15, 2026): "Take the stage" + "Play together"

Requested by Hassan on Nov 15, 2026: a scene of our character on stage at the Stampede with the lyrics on the big screen, and a proper explanation that you can play online together (ride in a friend's car, fly a helicopter together, explore, text and voice chat). Made unattended; no paid credits (Kokoro on GitHub Actions, Playwright + SwiftShader capture, PIL/ffmpeg).

### What changed
| Output | Change | New length |
|---|---|---|
| Full video (YouTube 11:00, Facebook 13:00) | + "Take the stage" beat after the Saddledome concert line (Stampede section); + new "Play together" section (title card "PLAY TOGETHER", 5 lines) after the free-roam line, before "So, is this GTA?" | 4:29 (268.8 s, was 3:46) |
| Teaser (8:00) | + one line before the closing question: "Take the stage at Stampede Park. Or go online, and explore the city together with other Calgarians." Stage shot, two multiplayer shots, label "Play together online" | 37.1 s (was 30.6 s) |
| Part 1 (15:00) | + "Take the stage" beat before the closing question | 78.2 s (was 66.7 s) |
| Part 3 (20:00) | + "Play together" section before the closing question | 87.3 s (was 61.3 s) |
| Part 2 (17:30) | unchanged (transit/311; no natural place) | 48.2 s |

Method: the approved v1 picture is kept frame for frame; the new segments are drawn with the same compositor (compose.py: same header, gameplay chip, labels, notes, captions) and spliced in at line boundaries (build_v2.py); the whole soundtrack is re-mixed on the new timeline with audio.py (voice + "Under One Sky" from the chorus, about 16 dB under the voice, lifted between lines, -14 LUFS).

### New narration (Kokoro af_heart, budget-probe Actions run on Nov 15)
- s0 (10.5 s): "And you don't just watch the show. At Stampede Park, walk up on stage, grab the mic and perform, while the crowd in cowboy hats dances and the lyrics light up the big screen."
- n0 (2.8 s): "And here's the best part: you don't have to play alone."
- n1 (6.6 s): "Go online, and dozens of Calgarians can share the same city at the same time, up to forty players at once."
- n2 (6.5 s): "Explore together. Hop in a friend's car and ride along, or fly over the skyline together in a helicopter."
- n3 (4.8 s): "Chat by text, or hold the mic button and talk with voice chat to the players near you."
- n4 (2.2 s): "It's all free, right in your web browser."
- q0 (5.9 s, teaser): "Take the stage at Stampede Park. Or go online, and explore the city together with other Calgarians."

Multiplayer number: the game's server allows 40 players per room (server/src/worker.js: `const MAX = 40`, re-checked on yyc-story commit 4c69164) and every client joins the one room "calgary" (city-stories/js/mp.js). So the video says "dozens ... up to forty players at once"; post captions say "room for dozens of players" (no numerals). "Hundreds" would need the room limit raised in the game first.

### New gameplay clips (both 1920×1080 and native 1080×1920)
- Stage (Grandstand Show stage, Stampede Park, 9:36 pm game time): stagewalk (Natalia walks up the steps to the mic, chase camera), stagewide (crowd in cowboy hats, stage, big screen), stageclose (Natalia dancing at the mic, lyrics behind), stagecrowd (from the deck: Natalia performing to the crowd, skyline and Saddledome behind), stagescreen ("🎤 LIVE ON STAGE: Natalia" and the lyrics). Song time follows the game clock (media.js) so the on-screen lyrics play at the right speed; filmed from the chorus ("Oh-oh, Calgary!").
- Multiplayer (free roam is online): three real game clients in the same room, named Ali, Natalia and Chris, each its own character. mpgroup (the three together on 9 Avenue SE downtown, name tags, chat bubbles and the chat feed, the 🎤 talk button lit), mpcar (Natalia walks to Ali's car and hops in: "🚗 Natalia hopped in — you drive!", then they drive off), mpheliboard (Ali walks to Chris's helicopter at Prince's Island Park and gets in: "You're riding with Chris"), mpheli (Ali riding in Chris's helicopter over Eau Claire towards the downtown skyline).
- How the online capture was done: the live server (yyc-city-stories-mp…workers.dev) is blocked by the sandbox's network policy (proxy 403), so the three game clients were connected to a local copy of the game's own relay (mpsrv/relay.js: server/src/worker.js's Room logic, same protocol, same 40-player limit) on localhost. Everything on screen is drawn by the unmodified game client from those three real connections; nothing was composited or faked. Off-screen clients skipped loading city tiles (memory); the filmed client is the normal game. The game's storefront signs were hidden in the group shot (a real business name sat behind the players).
- Every clip was checked frame by frame (contact sheets); first takes with problems were re-shot (players too far, cut-off chat bubble, objective box under the header, wrong boarding spot, business sign).

### Fact audit
See audit_v2.md: round 1 CHANGES NEEDED (teaser line implied dozens of people are actually online → reworded), round 2 APPROVED (claims 33-44, every label and the post lines).

### QC (v2 outputs)
| Check | Result |
|---|---|
| Fact audit | APPROVED in round 2 (independent agents; audit_v2.md) |
| Narration = approved lines | lines_used.json on budget-probe-out = gta6v2_lines.json (q0 is the corrected wording) |
| Hooks / openings | unchanged v1 hooks; the "Play together" section opens with a title card "PLAY TOGETHER · online · free · in your browser" |
| Real gameplay only, labelled | all new shots captured from the game; "Gameplay: YYC City Stories" chip on every new frame |
| Disclaimers | Stampede not-affiliated chip on every stage shot; v1 chips kept |
| No personal names | the stage screen reads "LIVE ON STAGE: Natalia" (the character); player names are Ali, Natalia, Chris; no byline, credits or real business names in the new shots |
| Captions | burned in, white on dark; vertical y≈1250-1350, clear of the right 120 px; "forty" spoken and shown as a word |
| Vertical layout | native 1080×1920 captures, full-bleed; HUD shots lightly zoomed so the game's top bar sits outside the frame |
| Music | "Under One Sky" under every version, 15.7-15.9 dB under the voice, lifted between lines |
| Loudness (ebur128 on the final files) | full -14.1 LUFS / -1.3 dBFS; teaser -14.0 / -1.6; Part 1 -14.1 / -1.3; Part 3 -14.0 / -1.1 |
| Files | full 1920×1080 268.8 s 82 MB; teaser 1080×1920 37.1 s; Part 1 78.2 s; Part 3 87.3 s; all 30 fps H.264 + AAC 48 kHz |
| Contact sheets | every changed output reviewed; fixed before posting: HUD objective box under the header, chat bubbles under labels, group shot re-shot (players too far, business sign), boarding re-shot, portrait group re-framed |
| Covers / thumbnail | unchanged (a multiplayer Part 3 cover was tried and was less readable than the current one) |

### Metricool (brand 7089421, America/Edmonton), swapped Nov 15-16, 2026
| Post | Time Nov 18 | uuid (unchanged) | new id | media now |
|---|---|---|---|---|
| Teaser (FB Reel + IG Reel + YT Short) | 08:00 | -4106170589206459640 | 429459827 | gta6-eve-teaser-v2.mp4 |
| Full, YouTube | 11:00 | 8813243528655556352 | 429459982 | gta6-eve-full-v2.mp4 |
| Full, Facebook video | 13:00 | -6850499379735608285 | 429460070 | gta6-eve-full-v2.mp4 |
| Part 1 | 15:00 | -6050349263285304598 | 429460251 | gta6-eve-part1-v2.mp4 |
| Part 2 | 17:30 | 4290377413255446574 | 428868677 | unchanged |
| Part 3 | 20:00 | 4084820982645016873 | 429460288 | gta6-eve-part3-v2.mp4 |
Times, networks, titles, first comments and cover images kept; texts updated as in posts_v2.json (no numerals added; "Not affiliated with Rockstar Games." kept where it was).

---

## v3 revision (Nov 16, 2026): "game box-art" poster hook + covers

Requested by Hassan on Nov 16, 2026 ("when GTA related video goes out on Calgary Insight we use GTA type game hook… something like this but related to Calgary"). Made unattended; no credits (Playwright + ffmpeg + OpenCV on our own gameplay frames).

### What it is
- An homage to open-world box art, all Calgary and all ours: tilted comic panels with thick black borders, saturated sunset/neon grade, the chunky white wordmark "GRAND TOUR / CALGARY" (Bowlby One, black outline, 3D extrude), the hot-pink neon script tag "Cowtown City" (Pacifico), sub-line "YYC City Stories · a free game on the real map of Calgary", chips "calgaryinsight.ca/game" and "FREE • PLAY IN YOUR BROWSER", hook line "GTA 6 drops tomorrow. Calgary is playable today." in Fira Sans (house font), small "Not affiliated with Rockstar Games." on the vertical and 4:5 covers.
- Trademark limits kept: no "GTA"/"Grand Theft Auto" in the wordmark (only in the small Fira Sans hook line), no Pricedown, no Rockstar logo/font/key art/characters or look-alikes, no brand logos, no real people.
- Panels (all from the v2 outputs' own gameplay frames, stylised with bilateral smoothing, a sunset sky replacement on day skies, posterize, halftone shadows and Canny ink lines; build/v3/stylise.py): Calgary Tower + skyline at sunset, the Grandstand Show stage with "Oh-oh, Calgary!" lyrics on the big screen, the helicopter over downtown, the Elbow/Bow river and park, the Stampede midway Ferris wheel, the CTrain on the Blue Line, a 311 pin popping over the Temple field (pin drawn by us over the game's real 311 view), a Chinook-arch-over-the-Rockies panel drawn from code (build/v3/chinook.py), the Saddledome at night. Not used: a character on a bike (the game has no bicycles; nothing invented).
- Variants: A "GRAND TOUR / CALGARY" (box-art layout, hero tower panel) vs B "YYC CITY / STORIES" (even 3×3 grid, Anton). A chosen: the wordmark reads at a glance, the neon tag stays clear, and the game name still appears in the sub-line (build/v3/variants_A_vs_B_*.jpg).

### Animated hook (first 1.8 s of every Nov 18 output)
- 1.8 s, 54 frames, 1080×1920 and 1920×1080: panels slam in (overshoot scale + white flash, 0.1 s apart, three already on screen at frame 0 with the hook line), wordmark punches in at 0.76 s with a 0.3 s camera shake, neon tag flickers on at 0.94 s, horizontal whip (motion blur) from 1.5 s that lands exactly on the original video's first frame; then the existing spoken "GTA 6 drops tomorrow" hook plays unchanged.
- Sound: "Under One Sky" (web/visit/chorus.mp3, the game's title song) from the bars just before the point where the videos' own music starts, at about -17 LUFS under the poster, synthesised slams/impact/pop/whoosh (motion/engine/sfx.py), easing out under the video's first 0.35 s.
- Assembly: only the hook is encoded (x264 medium, same CRF as each original, High, yuv420p, 30 fps, timescale 15360, VUI matched: SPS/PPS byte-identical to the originals), joined with the concat demuxer (-c copy); the soundtrack is rebuilt once (hook + original mix untouched) and encoded AAC 192 kb/s 48 kHz.

### QC (v3)
| Output | Length | Frames | Integrated | Sample peak | Decode errors |
|---|---|---|---|---|---|
| teaser-v3 | 38.9 s | 1167 | -14.0 LUFS | -1.6 dBFS | 0 |
| full-v3 (16:9) | 4:30.6 | 8118 | -14.0 LUFS | -1.5 dBFS | 0 |
| part1-v3 | 80.0 s | 2400 | -14.0 LUFS | -1.2 dBFS | 0 |
| part2-v3 | 50.0 s | 1501 | -14.0 LUFS | -1.4 dBFS | 0 |
| part3-v3 | 89.1 s | 2673 | -14.0 LUFS | -1.4 dBFS | 0 |
- Frame counts = hook 54 + original, every output. Contact sheet of the first 4 s of each: build/v3/contact_first4s.jpg (reviewed).
- Frame 0 shows moving art and the hook line (rule 0b.1); no logo/title card; captions/labels of the original untouched.
- Covers: poster-teaser-9x16.jpg, poster-part1/2/3-9x16.jpg (with a PART badge), poster-yt-thumb.jpg (1280×720), poster-fb-4x5.jpg (1080×1350). Template saved to content-studio motion/templates/game_poster/.

### Metricool (brand 7089421, America/Edmonton), swapped Nov 16, 2026
| Post | Time Nov 18 | uuid (unchanged) | new id | media now | cover |
|---|---|---|---|---|---|
| Teaser (FB Reel + IG Reel + YT Short) | 08:00 | -4106170589206459640 | 429815032 | gta6-eve-teaser-v3.mp4 | poster-teaser-9x16.jpg |
| Full, YouTube | 11:00 | 8813243528655556352 | 429815326 | gta6-eve-full-v3.mp4 | poster-yt-thumb.jpg |
| Full, Facebook video | 13:00 | -6850499379735608285 | 429815359 | gta6-eve-full-v3.mp4 | poster-yt-thumb.jpg (16:9 like the video; poster-fb-4x5.jpg kept as a spare) |
| Part 1 | 15:00 | -6050349263285304598 | 429815755 | gta6-eve-part1-v3.mp4 | poster-part1-9x16.jpg |
| Part 2 | 17:30 | 4290377413255446574 | 429815802 | gta6-eve-part2-v3.mp4 | poster-part2-9x16.jpg |
| Part 3 | 20:00 | 4084820982645016873 | 429815871 | gta6-eve-part3-v3.mp4 | poster-part3-9x16.jpg |
Texts, times, networks, titles, tags and first comments unchanged; every thumbnail accepted (no retries needed). Rule added to the studio PLAYBOOK (section 3d) and template saved in content-studio motion/templates/game_poster/.
