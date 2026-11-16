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
- NOTE (Nov 16, 2026): the times below are the OLD Nov 12 order. The "Daily-run schedule" section further down (Short 19:30 · IG Reel + FB Reel 19:35 · full 16:9 19:40 Asia/Karachi, NO TikTok) is the one in force.
- **The full 16:9 YouTube video goes out FIRST: 18:00 Asia/Karachi** (= 18:30 IST).
- Then the YouTube Short **19:30** and IG Reel + FB Reel + TikTok **19:35** — their captions/descriptions must **link to the full YouTube video** ("Poora episode dekhein 👉 <full video URL>").
- The full video's URL only exists after it publishes, so: schedule the Short/Reels with the channel link, then after 18:00 PKT read the full video's publicUrl (getScheduledPosts shows it once published) and update the Short/Reels text with it (use send_later to wake the session at ~13:10 UTC).
Use `publicationDate: {dateTime, timezone: "Asia/Karachi"}` and the `date` param with `+05:00`.

## Facebook rule (Hassan, Nov 13, 2026 — never break this)
- Facebook Reels go out as a SEPARATE Metricool post with provider **facebook only** (never bundled with Instagram/TikTok).
- **No YouTube link anywhere in a Facebook caption** (Facebook shows posts with YouTube links to fewer people). The caption is the same short social caption, but its YouTube line reads exactly `▶️ Poora episode YouTube par: Susuman channel` — no URL at all.
- The YouTube link goes in `firstCommentText`: `▶️ Poora episode dekhein: <full-episode link, or the channel link until the full video is live>`.
- The Instagram Reel is its own post (provider instagram only, 19:35) and keeps the YouTube link in the caption.

## Metadata
- YouTube (both): madeForKids **true**, category FILM_ANIMATION, isAiGeneratedContent false, privacy public, ~18 tags (susuman, suusuu man, susuman episode N, "<x> wala cartoon", hindi cartoon, urdu cartoon, kids cartoon, desi cartoon, superhero cartoon, cartoon kahani, moral story for kids, pakistani cartoon, bachon ka cartoon, …).
- Short title: `<Devanagari hook>? 😱 <X> Wala Cartoon | Susuman Ep N | Hindi Urdu Cartoon #shorts` (≤100 chars).
- Full title: `Susuman Episode N – <Roman title> | <Devanagari keyword> | Hindi Urdu Cartoon for Kids`.
- Description: 2-line hook in Roman Hindi/Urdu → episode name → one-line lesson → (full video) chapters from timeline.json scene starts → characters → subscribe link `https://www.youtube.com/channel/UCcRe0XnHPTeqmZeCMGOW0VQ?sub_confirmation=1` → keyword line mixing Roman, Devanagari and Urdu script → `#susuman #hindicartoon #urducartoon` (+ `#shorts` on Shorts).
- Chapters must be at least 10 s each (YouTube ignores shorter ones): merge short scenes (hook + intro, home into the scene before it).
- IG/FB/TikTok caption: SHORT — one hook line with 2–3 emoji, "YouTube par full episode 👉 youtube.com/channel/UCcRe0XnHPTeqmZeCMGOW0VQ", 8 hashtags (#susuman #hindicartoon #urducartoon #cartoon #kidscartoon #desicartoon #funnycartoon + episode animal/topic). instagramData REEL showReelOnFeed true; facebookData REEL with title; tiktokData title + PUBLIC_TO_EVERYONE. videoThumbnailUrl = cover_vertical.jpg on all.
- Made-for-kids: never ask viewers to comment; CTA is LIKE + SUBSCRIBE.

## Lessons from competitor research (Nov 2026, vidIQ)
- Breakout desi cartoon channels (Pagal Babu Comedy: 271K subs in 18 months, ~2M avg views) win with: an animal + a recurring kid character in the title, mixed Devanagari + Roman titles, everyday topics kids search for (billi, bandar, ice cream, injection/doctor, train, haathi), numbered parts, long keyword lists in descriptions.
- Big kids channels post Shorts of 50–125 s and long videos of 4–15 min; compilations later (every 5 episodes → a "Susuman ke saare episodes" compilation as a long video).
- Consistency (daily, same time) + a recognisable character face on every thumbnail.

## Voices check
- English loanwords in edge-tts lines: write them in Latin script inside the Urdu text (e.g. `LIKE اور SUBSCRIBE`) — verified with faster-whisper (tts/tts_asr_check.py). Run that ASR check on every new edge line containing English words.

## Notes (Nov 14, 2026)
- Metricool's create response shows the time in America/Edmonton; check with getScheduledPosts(timezone Asia/Karachi) — the stored time is the Asia/Karachi one you sent.

## Weekly compilation (from Nov 15, 2026)
- "Susuman Saare Episodes" long video (true 16:9) built with `compilations/` (see compilations/README.md), hosted on `susuman-media/compilations/`, one YouTube video at 17:00 Asia/Karachi. Only episodes already live on YouTube go in; chapters = each episode card start, first chapter 0:00 = Ep 1.
- GitHub rejects files > 100 MB and Git LFS uploads are blocked from the sandbox, so a crf 18 master over ~95 MB is fitted with `compilations/fit_github.sh` (two-pass x264 tune animation; Nov 15 test: SSIM 0.993 / PSNR 43-45 dB vs the crf 18 master).

## No TikTok (Nov 14, 2026 — decided as co-founder with Hassan's go-ahead)
- Do NOT post to TikTok. 6 videos got 3 views in total; TikTok is a 13+ app and does not push kids' content. The account stays connected in Metricool — just never add the tiktok provider.

## Daily-run schedule (from Nov 15, 2026)
- Check getScheduledPosts for the next 7 days first; publish on the first day from tomorrow that has no Susuman episode.
- YouTube Short 19:30 Asia/Karachi · Instagram Reel 19:35 (instagram only) · Facebook Reel 19:35 (separate post, facebook only, Facebook rule above) · YouTube full 16:9 video 19:40.
- If Metricool rejects a custom thumbnail, retry that post without videoThumbnailUrl.
- The full 16:9 video is a TRUE 16:9 render (drawFrameW), never the vertical on a branded side-panel frame (Hassan's Nov 12 rule above wins over older prompts that say "wide_bg style").

## Secret hook first (performance check, Nov 14, 2026)
- Reels that opened on Qasim's secret ("4 saal ka bachcha… aur ek SECRET POWER!", "Sirf Sakina Baaji jaanti hai Qasim ka raaz!") got 912 and 1,556 IG views with the lowest swipe-away; reels that opened on the rescue alone got 134-176.
- So the opening text hook, the first spoken line, the Short's first caption line and EVERY social caption/description lead with the secret (e.g. "Mama ko nahi pata… Qasim hi hai SUUU-SUUU-MAN! 🤫"), then the episode's problem in one line.

## Family rules (Hassan, Nov 14, 2026)
- Qasim and Sakina call their mother **Mama** — never "Ammi" — in every line, caption, speaker chip (MAMA), title and social caption. Code keeps `ammi()` / `CAST.ammi`.
- **Baba** (their father, CAST.baba / CAST.babaKurta, built in Ep 6) appears regularly; he does NOT know the secret.
- **Sakina, "the crying girl"**: fake fountain tears, wobbling lip, "Mamaaa…/Babaaa…" wail, sad sarangi sting → the adult gives in → instant grin + wink to camera. In most episodes, often to help Qasim slip away; light and kind; now and then it backfires.

## Sound rule (Hassan, Nov 14, 2026)
- Music and SFX must never make dialogue hard to hear: duck the score AND every SFX under the voice (sidechain); an SFX overlapping a line peaks >= 10 dB below the voice; loud hits (FLUUSH, booms, crashes, cheers) go in the gaps between lines.
- Before publishing, for every dialogue line measure voice stem vs music+SFX stem over the line's span in the 300-3400 Hz band: voice >= 10 dB louder. Fix and re-mix any failing line. (episodes/ep6/ep6_audio.py does this automatically and writes dialogue_check.json.)
- Final mix -14 LUFS, true peak -1 dB. Same for the 16:9 version and the Shorts.
- NO WHEEZE (Hassan, Nov 15, 2026 — Ep 6 v1 "sound effect distort voice… wheezing"): never use continuous noise beds (crowd/street/birds noise) or shaker/breath noise in the score; never let ANY SFX overlap a spoken line (SFX only in the gaps — ep6_audio.py trims/drops them automatically); duck the music smoothly over whole lines (no word-by-word pumping); no hard limiter on the master — normalise each line by RMS, gentle 2.5:1 voice compression, one static gain to -14 LUFS and only a look-ahead peak trim on rare overs (episodes/ep6/finalize_mix.py). Keep Sakina's sob vibrato light (vibrato f=5 d=0.12). Check: HF noise (4-10 kHz) in pauses between lines should be below -60 dBFS (Ep 6 v1 was -30, v2 is -71).

## Daily-run checklist (kept in one place, Nov 16, 2026)
- Facebook: separate post, provider facebook only, no YouTube URL in the caption ("▶️ Poora episode YouTube par: Susuman channel"), link only in firstCommentText.
- No TikTok (never add the tiktok provider).
- Secret hook first: opening text hook, first spoken line, the Short's first caption line and every caption lead with "Mama ko nahi pata… Qasim hi hai SUUU-SUUU-MAN! 🤫", then the episode's problem.
- Family rules: Mama (never Ammi) in every line/chip/title/caption; Baba regularly (doesn't know the secret); Sakina's crying-girl gag in most episodes, sometimes backfiring.
- Sound rule: score + every SFX ducked under dialogue, SFX only in the gaps, every line's voice >= 10 dB over music+SFX (300-3400 Hz) — epN_audio.py + finalize_mix.py write dialogue_check.json; -14 LUFS, -1 dBTP; same mix for the Short and the 16:9 video.
