# SUSUMAN — publishing playbook (no approval needed; same procedure every day)

## Where it goes
- Metricool brand **Susuman**, blogId **8051708** (YouTube UCcRe0XnHPTeqmZeCMGOW0VQ, Instagram susu.man99, Facebook page, TikTok Susuman).
- Host media publicly on GitHub branch `susuman-media` of hassanaliarshad110/calgary-data-desk, folder `epN/` (orphan branch: clone with `--depth 1 -b susuman-media`, add files, push). URL: https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/susuman-media/epN/<file>. (The sandbox proxy returns 403 for raw URLs; Metricool fetches them fine — check with the GitHub contents API instead.)

## Files per episode
- `susuman_epN_vertical.mp4` (1080×1920, ~110 s) · `susuman_epN_16x9.mp4` (vertical video centred on a 1920×1080 branded frame `wide_bg`, ffmpeg overlay at x=656) · `cover_vertical.jpg` (1080×1920) · `thumb_16x9.jpg` (1280×720). Thumbnails: bright yellow rays, Susuman big + the episode's animal/kid, 2-word Roman hook in Bangers (white + red), SUSUMAN logo, EP badge (see episodes/ep1/thumbs.js).

## Time (India + Pakistan prime time; no DST there)
- YouTube Short: **19:30 Asia/Karachi** (= 20:00 IST)
- IG Reel + FB Reel + TikTok: **19:35 Asia/Karachi**
- YouTube full video (16:9): **19:40 Asia/Karachi**
Use `publicationDate: {dateTime, timezone: "Asia/Karachi"}` and the `date` param with `+05:00`.

## Metadata
- YouTube (both): madeForKids **true**, category FILM_ANIMATION, isAiGeneratedContent false, privacy public, ~18 tags (susuman, suusuu man, susuman episode N, "<x> wala cartoon", hindi cartoon, urdu cartoon, kids cartoon, desi cartoon, superhero cartoon, cartoon kahani, moral story for kids, pakistani cartoon, bachon ka cartoon, …).
- Short title: `<Devanagari hook>? 😱 <X> Wala Cartoon | Susuman Ep N | Hindi Urdu Cartoon #shorts` (≤100 chars).
- Full title: `Susuman Episode N – <Roman title> | <Devanagari keyword> | Hindi Urdu Cartoon for Kids`.
- Description: 2-line hook in Roman Hindi/Urdu → episode name → one-line lesson → (full video) chapters from timeline.json scene starts → characters → subscribe link `https://www.youtube.com/channel/UCcRe0XnHPTeqmZeCMGOW0VQ?sub_confirmation=1` → keyword line mixing Roman, Devanagari and Urdu script → `#susuman #hindicartoon #urducartoon` (+ `#shorts` on Shorts).
- IG/FB/TikTok caption: SHORT — one hook line with 2–3 emoji, "YouTube par full episode 👉 youtube.com/channel/UCcRe0XnHPTeqmZeCMGOW0VQ", 8 hashtags (#susuman #hindicartoon #urducartoon #cartoon #kidscartoon #desicartoon #funnycartoon + episode animal/topic). instagramData REEL showReelOnFeed true; facebookData REEL with title; tiktokData title + PUBLIC_TO_EVERYONE. videoThumbnailUrl = cover_vertical.jpg on all.
- Made-for-kids: never ask viewers to comment; CTA is LIKE + SUBSCRIBE.

## Lessons from competitor research (Nov 2026, vidIQ)
- Breakout desi cartoon channels (Pagal Babu Comedy: 271K subs in 18 months, ~2M avg views) win with: an animal + a recurring kid character in the title, mixed Devanagari + Roman titles, everyday topics kids search for (billi, bandar, ice cream, injection/doctor, train, haathi), numbered parts, long keyword lists in descriptions.
- Big kids channels post Shorts of 50–125 s and long videos of 4–15 min; compilations later (every 5 episodes → a "Susuman ke saare episodes" compilation as a long video).
- Consistency (daily, same time) + a recognisable character face on every thumbnail.

## Voices check
- English loanwords in edge-tts lines: write them in Latin script inside the Urdu text (e.g. `LIKE اور SUBSCRIBE`) — verified with faster-whisper (tts/tts_asr_check.py). Run that ASR check on every new edge line containing English words.
