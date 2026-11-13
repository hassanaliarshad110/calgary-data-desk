# SUSUMAN — publishing playbook (no approval needed; same procedure every day)

## Where it goes
- Metricool brand **Susuman**, blogId **8051708** (YouTube UCcRe0XnHPTeqmZeCMGOW0VQ, Instagram susu.man99, Facebook page, TikTok Susuman).
- Host media publicly on GitHub branch `susuman-media` of hassanaliarshad110/calgary-data-desk, folder `epN/` (orphan branch: clone with `--depth 1 -b susuman-media`, add files, push). URL: https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/susuman-media/epN/<file>. (The sandbox proxy returns 403 for raw URLs; Metricool fetches them fine — check with the GitHub contents API instead.)

## Files per episode (Hassan's rules, Nov 12, 2026 — never break these)
- **Full YouTube video = a TRUE 16:9 render** (`WIDE=1 python3 render_epN.py full` → `drawFrameW`, 1920x1080, every scene re-framed for widescreen, captions redrawn for 16:9). **NEVER** put the vertical video in the middle of a branded frame with art on both sides (the old `wide_bg` layout is retired — Hassan saw Ep 1 with "two thumbnails on both sides" and it was wrong).
- Vertical `susuman_epN_vertical.mp4` (1080x1920) for the YouTube Short + IG/FB/TikTok Reels.
- `thumb_16x9.jpg` (1280x720) for the full video; `cover_vertical.jpg` (1080x1920) for Shorts/Reels. Bright yellow rays, Susuman big + the episode's animal/kid, 2-word Roman hook in Bangers (white + red), SUSUMAN logo, EP badge.
- Full quality: libx264 crf 18, 30 fps, AAC 192k, -14 LUFS-ish mix. Don't compromise quality for speed.

## Order + time (India + Pakistan prime time; no DST there)
- **The full 16:9 YouTube video goes out FIRST: 18:00 Asia/Karachi** (= 18:30 IST).
- Then the YouTube Short **19:30** and IG Reel + FB Reel + TikTok **19:35** — their captions/descriptions must **link to the full YouTube video** ("Poora episode dekhein 👉 <full video URL>").
- The full video's URL only exists after it publishes, so: schedule the Short/Reels with the channel link, then after 18:00 PKT read the full video's publicUrl (getScheduledPosts shows it once published) and update the Short/Reels text with it (use send_later to wake the session at ~13:10 UTC).
Use `publicationDate: {dateTime, timezone: "Asia/Karachi"}` and the `date` param with `+05:00`.

## Facebook rule (Hassan, Nov 13, 2026 — never break this)
- Facebook Reels go out as a SEPARATE Metricool post with provider **facebook only** (never bundled with Instagram/TikTok).
- **No YouTube link anywhere in a Facebook caption** (Facebook shows posts with YouTube links to fewer people). The caption is the same short social caption, but its YouTube line reads exactly `▶️ Poora episode YouTube par: Susuman channel` — no URL at all.
- The YouTube link goes in `firstCommentText`: `▶️ Poora episode dekhein: <full-episode link, or the channel link until the full video is live>`.
- Instagram Reel + TikTok stay together in one post (19:35) and keep the YouTube link in the caption.

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
