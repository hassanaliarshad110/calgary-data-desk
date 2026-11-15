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
