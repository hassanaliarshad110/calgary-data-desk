# Calgary Insight content studio: run playbook

Every scheduled run follows this file exactly. One run = one video.

## 0. Guard rails (always)
- Credit is always **calgaryinsight.ca** (spoken "calgary insight dot c a"). Never put Hassan's name or any credential in a video, package or caption.
- **Free pipeline only:** Kokoro narration on GitHub Actions, Playwright scenes and ffmpeg. Never spend credits (Higgsfield, OpenArt, vidIQ, Descript, RunPod, fal.ai).
- **Post only what passed.** Hassan approved automatic posting to Calgary Insight's Instagram, Facebook and YouTube through Metricool (Nov 9, 2026), but only for videos whose fact audit returned APPROVED and whose render checks passed. Never post anything blocked, script-only or failed. Never touch `main` or the website, or any branch other than `content-studio`, `studio-probe` and `studio-videos`.
- Never mention Canada Insight in Calgary Insight content.
- Nonpartisan and neutral across wards. No attacks on or endorsements of councillors, candidates or parties.
- Every figure is researched in this run from a primary source, with its URL. Never state a number, date or quote from memory. If a claim can't be verified, cut it.

## 0b. Growth rules: views that turn into visits (Hassan's go-ahead, Nov 11, 2026: "optimise strategy for success"). These override any older length, timing or caption rule below.
What the numbers showed (Metricool, Nov 8-11): Facebook Reels 107-549 views, Instagram Reels 0-129; average watch about 1-9 s; 80-100% of Instagram viewers swiped away within 3 s on most reels; almost no likes, comments, shares or saves; Reel captions' links can't be tapped. The best: Federal Budget (549), sewer pipes (345), migration (270): money, "does this affect me", timely.
1. **The first 2 seconds decide everything.** Frame 0 already moves and already shows the subject: a fast push-in on the real place or archival photo, a map zooming onto the community, a number slamming in, a before/after flash. The voice starts by 0.3 s with the hook. No logo, no title card, no "Calgary Insight presents", no slow fade-in in the first 3 s (the logo header appears from about 3 s). The on-screen hook is 3-7 words, very large, in the upper middle, readable with the sound off. Cut or change the picture every 1.5-2.5 s for the first 6 s. The thumbnail repeats the opening frame.
2. **Hook formulas that work** (pick one, never a slow intro): a direct "you" question ("Do you pay more than Edmonton?"); a surprising number in plain words ("One pipe carries 60% of our water"); a myth to break ("Deerfoot Trail isn't named after a road builder"); "Your street, your number"; a place everyone knows with a twist ("You drive past this every day. Here's what it was").
3. **Shorter.** Fun facts 15-25 s (never over 30); news explained 25-45 s; flagship Short 45-75 s where the story allows (the widescreen film can stay longer). One idea per video. End fast (section 3: no end card on videos of 2:00 or less).
4. **A tappable link on every post.** Reel captions can't be tapped, so EVERY Facebook and Instagram post sets `firstCommentText` (Metricool) to one line with the deep link (rule 5): for example `🔗 See your community's number: https://calgaryinsight.ca/communities/` (links in Facebook comments can be tapped). The caption's last text line before the hashtags says `🔗 Link in the first comment` (Facebook) and the calgaryinsight.ca line stays (Instagram: also "link in bio").
5. **A specific page, never just the home page.** Each video points to the most specific page that exists on the site, checked with WebFetch (200) before posting; if a page doesn't load, use the next one up:
   | Topic | Link |
   |---|---|
   | A news story we published | `https://calgaryinsight.ca/news/<article id>/` (from news/index.json on the news branch; the page exists from the next morning's build: if not yet, `https://calgaryinsight.ca/?view=citynews`) |
   | A community or neighbourhood | `https://calgaryinsight.ca/communities/<slug>/` (all: `/communities/`) |
   | A ward or councillor | `https://calgaryinsight.ca/wards/<n>/` (all: `/wards/`) |
   | Property tax, City bills, the budget | `https://calgaryinsight.ca/bill` (your own bill), `/studies/what-calgarians-pay/`, `/?view=budget`, `/?view=budget-intelligence` |
   | Police, crime, safety | `/studies/calgary-police/`, `/?view=safety` |
   | Water, pipes, roads | `/studies/calgary-sewers/`, `/?view=infra` |
   | Tourism, things to do, places, history of a place | `/visit/explore/`, `/visit/downtown/`, `/visit/river/`, `/visit/mountains/`, `/visit/stampede/`, `/tourism-intelligence/` |
   | Elections, MLAs, MPs | `/?view=elections` |
   | Growth, parks, schools, families | `/?view=growth`, `/?view=families` |
   Add `?utm_source=<facebook|instagram|youtube>&utm_medium=social&utm_campaign=<slug>` to the link so visits can be counted by post.
6. **A reason to click.** The closing line on screen and in the caption offers something personal the site gives: "Find your community's number", "Work out your own bill", "See your ward". If the topic has no personal tool, offer the next story ("The full story, with the photos: link in the first comment").
7. **Questions people can answer in one word.** "Which one: A or B?", "Did you know this? Yes or no", "Guess the year 👇". Still neutral and two-sided on news.
8. **Fewer, better.** About two posts a day: one fun fact a day (not two), the flagship every second day, news Monday/Wednesday/Friday, Calgary Origins weekly. A weak topic is skipped rather than posted.
9. **Times follow the audience** (Metricool's best times for this Facebook page: weekdays 10:00 and 12:00, then 17:00-18:00; weekends about 10:00). See section 7's table.
10. **Every Monday the weekly review** (its own scheduled task) reads last week's numbers (views, average watch, 3-second skip rate, shares, saves, comments, and site visits by utm_campaign where available), writes `insights.md`, and updates the "What's working" list below: which hooks, topics, lengths and times did best. Follow it when picking hooks and topics.

### What's working (updated by the weekly review)
- (Nov 11, 2026) Best so far: timely money and "affects me" topics (Federal Budget, sewer pipes, migration, tourism). Weakest: long, number-heavy captions and slow openings.

## Content direction (Hassan, Nov 10, 2026): stories, fun facts and news. No independent studies.
- **Quick slots (AM/PM): a Calgary fun fact or mini-story.** Surprising, shareable, light: places, names, people, firsts, history, nature, culture. Not a statistics study. Use a number only when the fact itself is a number, and never compute or model anything ourselves.
- **Flagship slots: a Calgary story.** History, people, places, turning points, told as a story with a beginning, a surprise and an ending. Not an analysis or a report.
- **CIVIC slots (Mon/Wed/Fri) are now "Calgary news explained".** Pick the biggest or most-talked-about Calgary story of the past ~48 hours (City Hall, transit, weather, events, business, community), using at least two independent reports or an official source, and explain in 25-45 s what happened, why it matters and what happens next. Strictly neutral: no opinion, no taking sides, no predictions. Don't repeat a story already in log.json unless something new happened. If there's no solid Calgary news, make a timely Calgary story instead (an anniversary, a season, an event this week).
- No independent studies, scores, rankings we computed, or ward-by-ward comparisons. Everything is still fact-checked by the audit gate.

## 1. Find today's slot
- **First, confirm earlier posts.** For every log entry whose `posted` items have a publish time that has passed but no confirmed status, call getScheduledPosts (brandId 7089421, timezone America/Edmonton, covering those dates) and record each provider's PUBLISHED `publicUrl` or ERROR `detailedStatus` in the log. Mention any ERROR in this run's delivery message.
- Today = `TZ=America/Edmonton date +%F`. If today is before 2026-11-09 or after 2026-12-31, stop and do nothing.
- Slot: the scheduled task says which type it is (quick-insight / flagship / civic). For quick-insight, local hour < 14 → `AM`, else `PM`.
- Look up `calendar.json` for (date, slot). If `log.json` already has that date+slot with status `done`, stop (it already ran).

## 2. Pick and verify the topic
- Load the skill named in the calendar row (`calgary-data-explainer`, `calgary-storyteller` or `calgary-civic-analyst`) and follow it, plus `calgary-motion-director` (section 3c) for direction, animation, sound and QC, and `calgary-insight-video-explainer` and `video-making` for production.
- The calendar topic is a **starting point, not a verified fact.** Research it (web search plus fetching the original pages). If the data doesn't hold up, is stale, or the story is already in `log.json` or on the covered list below, pick a stronger topic **in the same category** and write down why in the log.
- Prefer timely and underreported angles: check the news from the past two weeks for that subject first.
- No repeats: the topic and its central number must not repeat anything in `log.json`. A follow-up is fine only if the evidence is materially new; say what changed.
- **Already covered on calgaryinsight.ca (don't recycle):** Budget 2026 explainer, Election field guide 2027, Invest in Calgary, Parks crowding, Population growth model, Ward 5 and 311 / "Who Calgary's 311 Hears", Growth vs amenities. Also already posted on Calgary Insight's social channels (Nov 8-9, 2026), so not to be repeated as a main subject: "Where Two Rivers Meet: The Story of Calgary" (city history overview: Mohkinstsis, NWMP fort 1875, Treaty 7, railway 1883, 1886 fire and Sandstone City, first Stampede, Turner Valley, Leduc, Calgary Tower, 1988 Olympics, 2013 flood; a deep dive on one of these is fine only with a clearly new angle), "The Elbow: Calgary's First Peoples" (Treaty 7, Mohkinstsis, Blackfoot, Tsuut'ina, Stoney Nakoda, Métis), "The pipes beneath Calgary" (sewer service connections' age), "Calgary Has a Secret City 15 Feet Above the Ground" (Plus 15 network).

## 3. Write the package
Write `packages/<date>-<slot>-<slug>.md` with **every** required output of the skill (topics/angles, hooks, verified evidence labelled fact / estimate / projection / interpretation, methodology and limitations where the skill asks for them, full narration, timestamped scene-by-scene storyboard, visual generation prompts, chart/map instructions with exact values and units, clickable sources with publication date and data period, captions / YouTube title and description, thumbnail concept, short-form version for flagships).
- Narration: Canadian English, short sentences, **every number written in words as spoken**. It has to fit the runtime (about 2.5 words a second). End with a spoken close; never end abruptly. The end card is only for videos over 2 minutes (see "Length rule for the ending" below).
- **Site name on screen:** the narration spells the site for the voice ("calgary insight dot c a"), but every caption, subtitle, end card and on-screen text must show it as **calgaryinsight.ca**, never the spelled-out words. Build captions from the narration with that one substitution (for example `re.sub(r"calgary insight dot c a", "calgaryinsight.ca", line, flags=re.I)`), and check the closing caption frame before the full render.
- **Captions and descriptions (Hassan's rule, Nov 10, 2026): short, engaging, no figures.** Every post text (Instagram, Facebook, YouTube Short, teaser) is:
  1. a one-line hook (a question or a surprising plain-language statement),
  2. one or two short sentences with the key facts in plain words, with **no numbers, percentages, dollar amounts or tables** (say "nearly half", "more than doubled" only if audited; otherwise just describe it),
  3. a one-line question that invites comments, ending "Drop your thoughts below 👇",
  4. `More Calgary stories, studies and analysis: calgaryinsight.ca` **on its own line** (never run into a sentence),
  5. 3-5 hashtags (#Calgary #yyc plus 1-3 on the topic).
  No source lists, no URLs other than calgaryinsight.ca, no long paragraphs. About 300 characters before the hashtags. The full YouTube widescreen description may add chapters below the same short text, nothing else. Sources live in the package and on the site, not in the post.
- **Visual hook + text hook + CTA in EVERY video (Hassan's rule, Nov 11, 2026: "It is important").** Applies to fun facts, news, flagships (Short, widescreen and teaser), and every Calgary Origins film and part.
  - **Visual hook (0-2 s):** the first frames must *move* and grab the eye, together with the text hook, never a static title card. Pick what fits the story: a fast push-in or zoom onto a real Calgary landmark, map or archival-style scene; a bold before/after flash; an object or number slamming in; a split-second "reveal" (a wipe, a pin dropping on the map, a road sign flipping, a light switching on); kinetic hook text punching in word by word. It must match the thumbnail's design (section 5) and be readable with the sound off.
  - **Text hook (0-2 s):** the spoken and on-screen hook line, as before.
  - **Length rule for the ending (Hassan's rule, Nov 11, 2026: the ending was far too long on short videos). It overrides everything below about the ending.**
    - **Videos of 2:00 or less** (fun facts, news, flagship Shorts and widescreen versions, teasers): **no end card, no Subscribe button, no spoken "Follow Calgary Insight..." or "For more Calgary stories... visit calgaryinsight.ca" lines.** The video ends on the closing question: spoken and shown big, with "Drop your thoughts below 👇" and a small `calgaryinsight.ca` line in the same frame, held about 1.5 s after the voice stops (so it never ends abruptly). The ending, from the closing question to the last frame, is 4 seconds at most. The mid-video Follow pop-up and the caption lines stay.
    - **Videos over 2:00** (Calgary Origins films and parts, longer flagships, site explainers): the full ending below (CTA lines, then the end card with Follow + Subscribe, held ≥ 3 s).
    - The renderer checks the length before building the ending, and the final check confirms a video of 2:00 or less has no end card.
  - **CTA at the end (videos over 2:00; spoken and on screen, before the end card):** (1) the comment prompt: the closing question + "Drop your thoughts below 👇"; then (2) "For more Calgary stories, studies and analysis, visit calgaryinsight.ca" (spoken as "calgary insight dot c a", shown as calgaryinsight.ca). The end card repeats both: a big "💬 Comment below" and "More at calgaryinsight.ca", held for at least 2 seconds.
  - **Follow / subscribe prompt (Hassan's rule, Nov 11, 2026).** Platforms don't allow clickable buttons inside a video, so every video shows a visual prompt that sends viewers to the platform's own Follow / Subscribe button:
    - **Mid-video pop-up** (videos over 25 s): a small animated pill for about 2 s at roughly the halfway point, "🔔 Follow @calgaryinsight for more Calgary stories", top area, never covering captions or the key visual.
    - **End card (videos over 2:00 only; hold ≥ 3 s), in this order:** "💬 Comment below" · an animated **Follow + Subscribe** button (red "SUBSCRIBE" button with a bell that gets tapped, plus "Follow @calgaryinsight") · "More at calgaryinsight.ca". Spoken: "Follow Calgary Insight for more, and tell us what you think in the comments."
    - The same file goes to Instagram, Facebook and YouTube, so the wording covers all three ("Follow / Subscribe · Calgary Insight · @calgaryinsight").
    - Caption: add the line `🔔 Follow @calgaryinsight for more Calgary stories` just above the calgaryinsight.ca line.
  - **Caption CTA:** after the question line and before the hashtags, a line `More Calgary stories, studies and analysis: calgaryinsight.ca` (this replaces "Sources and the full story: calgaryinsight.ca"; in section 7b posts it sits beside the ▶ Full film line).
  - Storyboards must name the visual hook explicitly (what moves, how, for how long). The renderer checks the first 2 seconds as stills (frame at 0.0 s, 0.5 s, 1.0 s and 1.5 s) and the CTA frames before the full render.
- **Hook and question in every video (Hassan's rule, Nov 10, 2026).**
  - **Open with a hook** in the first 2 seconds, spoken and on screen: a question or a surprising line ("Why is a Calgary highway named after a runner?"), never a slow intro.
  - **Close with a question to the viewer**, spoken and shown big on screen (the last frame for videos of 2:00 or less; just before the end card for longer ones), followed by "Drop your thoughts below" (on screen: "Drop your thoughts below 👇"). Example: "Do you think this is fair, or too much? Drop your thoughts below."
  - The caption follows the same pattern: hook as the first line, the question near the end with "Drop your thoughts below 👇", then the calgaryinsight.ca line and hashtags.
  - Questions must be genuinely open or two-sided ("fair, or too much?", "Did you know this?", "Which one would you visit first?", "How has this affected you?"), never leading, partisan or pushing one answer, especially in news videos. They are not facts, so they need no source, but the auditor checks they're neutral.
- The package ends with the claims table required by section 3b.
- Visual generation prompts are kept for an optional paid cinematic version later. This run renders the free version only, built with the motion engine (section 3c).
- The package also carries the **production bible** (section 3c): visual direction and continuity bible, scene-by-scene storyboard, one AI video prompt per scene, image prompts, sound design with an effects cue sheet, the editing timeline (EDL), the figure-to-claim map and the QC table.

## 3b. Fact audit: the gate (nothing is narrated or rendered until it passes)
1. **Claims table.** At the end of the package, list every factual statement in the narration, on-screen text, captions, chart labels and descriptions: `# | claim as worded in the script | exact figure, unit, period, boundary | label (fact / estimate / projection / interpretation) | source URL | where in the source (page, table or section)`.
2. **Independent auditor.** Spawn a fresh subagent (Agent tool, general-purpose) that did not draft the script. Give it **only** the narration, on-screen text and the claims table, not your research notes or reasoning. Its instructions:
   - Open every source URL yourself and check each claim against what the page actually says: the number, unit, date, reference period, geographic boundary (city / CMA / ward / community) and attribution.
   - Mark each claim **PASS**, **FAIL** (the source says something different, and give the correct wording), or **UNSUPPORTED** (the page doesn't say it, won't load, or isn't a credible source).
   - Also flag: any factual sentence missing from the claims table; numbers in words that don't match the figure (for example "forty-two" vs 4.2); comparisons across mismatched periods or boundaries; estimates or projections stated as facts; correlation presented as cause; a hook the data doesn't pay off; anything partisan or unfair to a ward or person; a closing question that is leading or one-sided; a missing opening hook or closing question; a missing visual hook in the storyboard; a missing end CTA (comment prompt + follow/subscribe prompt + calgaryinsight.ca) in the narration, end card or caption; any mention of Hassan's name.
   - Return a table with one row per claim, plus a verdict: **APPROVED** only if every claim passes and nothing is flagged.
3. **Fix and re-audit.** Correct or cut every FAIL and UNSUPPORTED claim, deal with every flag, and send the revised script to a **new** auditor subagent. Allow at most 3 rounds.
4. **If it still isn't approved after round 3:** do not narrate or render. Save the package and audit report, log status `"blocked-by-audit"` with the reasons, and tell Hassan which claims couldn't be verified.
5. If the Agent tool isn't available, run the audit yourself as a separate pass: re-fetch every URL fresh and apply the same checks, and label the report "self-audit".
6. Save the final auditor report as `audits/<date>-<slot>.md` (every claim, its verdict and the source it was checked against). Record `audit: {rounds, claims_checked, verdict}` in the log.
7. **After rendering,** confirm that the narration lines sent to Kokoro and the burned-in captions match the approved script word for word (the only allowed difference: the spoken site name is shown as calgaryinsight.ca in captions). Any change after approval needs a new audit round.

## 3c. Motion direction: the professional documentary standard (Hassan, Nov 12, 2026)
Every video is directed, not assembled from text cards. Load the skill **`calgary-motion-director`** (if it isn't listed in the run, read `motion/README.md` in this branch: the same instructions) and follow it, inside every rule of this playbook (where they differ, this playbook wins: 2-second hook, endings, captions, no AI labels, credits, no spending).
- **Lead identity by slot, combined as the story needs (Hassan, Nov 12, 2026):** FLAGSHIP and ORIGINS lead with Storyteller (cinematic documentary); AM/PM fun facts lead with Data Explainer (fast motion graphics); CIVIC "news explained" leads with Civic Analyst (evidence-led investigative). Every video combines the three skills and uses whatever is best for that story, beat by beat (a drone opener on a news story, a counter slam in a flagship, a document card or cutaway in a fun fact), in one coherent look, while the owning skill's rules stay (neutrality on civic and political subjects always). Details in `motion/references/visual-identities.md`.
- **Never a step back:** text is never smaller than the posted videos' house style (hook ≥ 120 px vertical, names ≥ 110, chips ≥ 48, quotes ≥ 72) and the first hook word is on screen at frame 0. The approved before/after reference is `motion/engine/examples/crowchild_remake.js`.
- **Production bible in the package** (all nine outputs; `motion/references/production-bible.md`), written before the audit so the auditor also checks every on-screen figure and label against the claims table. Scale: fun fact 6-9 scenes; news 8-12; flagship 12-20 per format; Origins a beat list per chapter.
- **Build with the motion engine**, free: `motion/engine/motion.js` (camera moves, 3D city from real geography, maps, charts, cutaways, traffic, weather, transitions), `motion/geo/calgary_base.json` (OpenStreetMap + City of Calgary boundaries; credit it on map scenes), `motion/engine/render.py` (stills, contact sheets, MP4), `motion/engine/sfx.py` (synthesised music bed + effects cue sheet, mixed under the Kokoro voice and loudness-normalised). Start from the matching file in `motion/engine/examples/`. Scene lengths come from the measured narration.
- **Every animation explains** something (where, when, how much, how it works, what changed); pick from `motion/references/technique-library.md`. At least three techniques per video (Storyteller four); no more than two text-only scenes in a row.
- **Sound:** the music bed and effects from the cue sheet go under the narration in every video (`sfx.py mix`), voice on top, about -14 to -16 LUFS.
- **QC gate** (`motion/references/quality-control.md`): scored on the stills before the full render and on the contact sheet after. Any 0 blocks posting; fix and re-check. Record `qc` in the log entry. If time is short, simplify the scenes (fewer, still moving and explaining) rather than ship a failing video.
- **Save the source:** `production/<date>-<slot>/scene.js` and `cues.json` in this branch, so any video can be re-rendered.
- AI video and image prompts are written for every scene (one action per shot, continuity tags) but never run here; a photoreal paid version only on Hassan's request.

## 4. Narration (free, dedicated lane)
Use the **`studio-probe`** branch, not `budget-probe` (that one is Hassan's own lane).
```
git clone -q --depth 1 -b studio-probe https://github.com/hassanaliarshad110/calgary-data-desk /home/claude/sp
# write probe/tts_lines.json as {"v": ["scene 0 line", "scene 1 line", ...]}
cd /home/claude/sp && git add -A && git -c user.name="Hassan Ali" -c user.email=hassanaliarshad110@users.noreply.github.com commit -qm "Studio narration <date> <slot>" && git push -q origin studio-probe
gh run list --repo hassanaliarshad110/calgary-data-desk --branch studio-probe -L 1 --json status,conclusion   # poll until completed success
git clone -q --depth 1 -b studio-probe-out https://github.com/hassanaliarshad110/calgary-data-desk /home/claude/sp_out
```
- Check that `sp_out/lines_used.json` equals the JSON you sent. If it doesn't (another run overwrote it), wait one minute, re-clone, and push again if needed.
- Voice `af_heart` is the house voice. Verify the WAVs with `ffprobe` and `volumedetect`.

## 5. Render (motion engine per section 3c; logo, layout and assembly rules from calgary-insight-video-explainer)
- Quick insight and civic: **1080×1920 vertical**.
- Flagship: **two versions from the same narration**, both rendered every time (YouTube Shorts accept up to 3 minutes, and flagships are always under 3):
  1. `<slug>-short.mp4`: **1080×1920 vertical Short**, laid out natively for vertical (not cropped from the widescreen), with key content between y≈300 and y≈1420 and clear of the right-hand 120 px.
  2. `<slug>-youtube.mp4`: **1920×1080 widescreen** for regular YouTube and the website.
  3. `<slug>-teaser.mp4`: **1080×1920 vertical teaser, 20-30 seconds (never over 85 s)**, rendered from package section 12 (the short-form teaser script), with its own short narration run on the studio-probe lane. It ends on a short card (about 2 s, no Subscribe button) saying "Full video on our page · calgaryinsight.ca". Its claims must be a subset of the audited claims table, with no new facts.
  All versions get burned-in captions and the logo; only versions over 2:00 get the end card (section 3, length rule). 30 fps, H.264 `-crf 18 -preset veryfast`, one file per scene, concatenated with `-c copy`.
- Logo: `assets/logo.svg` in this branch, placed as the explainer skill specifies. Navy/gold, Fira Sans. Burned-in captions. Source and data period shown small on every data scene.
- Audio: mux the `sfx.py mix` output (voice + music bed + effects), not the bare narration.
- Before the full render, render the two busiest scenes plus the last frame (the closing question for videos of 2:00 or less, the end card for longer ones) as stills and **look at them** (Read the image). Fix overlaps and clipped text.
- After assembly: contact sheet of six frames (look at it), duration check, fade check. Aim for ≤ 10 MB.
- **Thumbnails (required for every video; Hassan's rule, Nov 10, 2026).** Design them as their own images with Playwright, never a random frame:
  - `<slug>-thumb.jpg` at **1080×1920** for every vertical file (quick insight, civic, flagship Short, teaser). Keep all text and the key visual inside the centre **1080×1350** area, because Instagram and Facebook crop covers in the grid.
  - `<slug>-thumb-yt.jpg` at **1280×720** for the flagship widescreen video.
  - Design: a 3-6 word hook in very large, heavy type (Fira Sans 800 or 900, at least 110 px on vertical and 96 px on widescreen), one strong, real Calgary-specific visual or chart shape, high contrast (navy background, gold and white text, one accent colour), the Calgary Insight logo small in a corner. At most one number, and only if it is the audited headline figure. No source lines, no small text, no more than about 8 words in total. It must make someone stop scrolling and say exactly what the video is about.
  - Check it: render a 270-px-wide copy, look at it (Read the image), and fix anything unreadable at that size.
  - Save the thumbnails as JPG under 2 MB beside the MP4s on `studio-videos`.

## 6. Deliver
- Video files go to the **`studio-videos`** branch (GitHub releases are blocked for these sessions). Keep it light; never clone it with history:
  `git clone -q --depth 1 -b studio-videos https://github.com/hassanaliarshad110/calgary-data-desk /home/claude/sv`, copy the MP4(s) and thumbnail JPG(s) into `sv/<date>-<slot>/` (flagships: `-short`, `-youtube`, `-teaser` MP4s, `-thumb.jpg` and `-thumb-yt.jpg`), commit as Hassan Ali, then `git pull --rebase --depth 1` and push, retrying up to 3 times.
  Raw link (for Metricool later, once Hassan approves): `https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/studio-videos/<date>-<slot>/<slug>.mp4`
- Append to `log.json`: `{date, slot, type, category, title, topic_used, changed_from_calendar (reason or null), central_figure, sources:[urls], length_s, video_path, identity, qc:{stills, final, scores}, status:"done"}`. If rendering failed, save the package anyway with status `"script-only"` and the reason.
- Commit the package and log to `content-studio` as Hassan Ali, `git pull --rebase` then push, retrying up to 3 times.
- Send the MP4(s) to Hassan with SendUserFile (flagships: both versions) (display attach), then a SendUserMessage of at most 5 lines: title, length and format, the one key figure with its source, the raw video link, and when and where it is scheduled to post (or why it wasn't).

## 7. Post to social (Metricool), only after APPROVED and a successful render
- Brand: Metricool `blogId` **7089421**, timezone **America/Edmonton**. Connected: Instagram @calgaryinsight, the Calgary Insight Facebook page, the YouTube channel.
- Media: the raw link `https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/studio-videos/<date>-<slot>/<file>.mp4`, used only **after** the push to `studio-videos` has succeeded. Metricool copies the file when the post is created.
- **Publish times are fixed and spread through the day (Hassan's rule, Nov 11, 2026). Never post several videos together.** Calgary time:
  | Time | Post |
  |---|---|
  | 09:30 | Calgary Origins full film (YouTube), Wednesdays |
  | 10:00 | Calgary Origins: Wed = Part 1; Thu = Part 2; Fri = Part 3; Sat = Part 4 (each part: Instagram Reel, Facebook Reel, YouTube Short) |
  | 12:30 | Flagship post A (vertical Short: Instagram Reel + YouTube Short) |
  | 15:00 | CIVIC / news explained (Mon/Wed/Fri) |
  | 17:30 | Flagship post B (widescreen: Facebook video + YouTube video) |
  | 18:30 | Fun fact (one a day, from Nov 12, 2026) |
  | 20:00 | Flagship post C (teaser: Facebook Reel) |
  Schedule each post for its slot time today, `autoPublish: true`, `draft: false`. If that time has already passed (a late or re-run), use the earliest time that is at least 10 minutes from now **and** at least 60 minutes from every other Calgary Insight post scheduled or published today (check with getScheduledPosts for today), and note the change in the log. Always set `videoThumbnailUrl` to the raw link of the matching thumbnail (`https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/studio-videos/<date>-<slot>/<slug>-thumb.jpg`; flagship widescreen post: `<slug>-thumb-yt.jpg`), pushed before posting. If Metricool rejects the post with VIDEO_THUMBNAIL_NOT_APPLICABLE, retry once without it and say so in the delivery message. A YouTube warning "Could not upload video thumbnail" means the YouTube channel isn't verified for custom thumbnails: the video still published, so record it as published with that warning.
- Text: the package's audited short caption (section 3 rules), word for word.
- **YouTube daily upload cap.** YouTube limits how many videos the channel can upload in any 24 hours, and Hassan's own uploads count too. On Nov 11, 2026 about 10 uploads in 24 hours hit the limit ("The user has exceeded the number of videos they may upload"). Rules:
  - Before scheduling any YouTube post, count the channel's YouTube posts published or scheduled in the 24 hours before and after its publish time (getScheduledPosts). Keep that count at **8 or fewer**. If adding this one would go over, still post Instagram and Facebook on time, but schedule the YouTube copy as its own post at the next 10:00, 11:00 or 14:00 slot where the 24-hour count is back under 8 (log it as `youtube_deferred`).
  - Priority when space is short: full-length YouTube videos (flagship widescreen, Origins film) first, then news Shorts, then Origins part Shorts, then fun-fact Shorts.
  - If a YouTube post still fails with that error, the next run's confirm step (section 1) re-schedules the same file and text as a YouTube-only post the next day at 11:00 (or 14:00 if 11:00 is taken), then records it. Never retry within the same 24 hours.
- **No AI labels (Hassan's rule, Nov 11, 2026).** On every post set `instagramData.isAiGenerated: false`, `youtubeData.isAiGeneratedContent: false`, and `tiktokData.isAigc: false` if TikTok is ever used. This is right for our animated graphics, charts and maps with narration. The one exception: if a video ever shows a realistic synthetic person, or realistic footage of a real place or event that never happened, don't make it that way; tell Hassan instead.
- **Thumbnail on EVERY post, every platform (Hassan's rule, repeated Nov 11, 2026).** No post goes out without its designed thumbnail: `videoThumbnailUrl` on every Instagram, Facebook and YouTube post, including each Origins part, each flagship file and the teaser. If Metricool rejects the thumbnail field, retry once with `videoCoverMilliseconds` pointing at the designed hook frame (below), never with no cover at all. Make the video's opening hook frame (first ~1 s) use the same design as the thumbnail, so even where a platform picks a frame itself (YouTube Shorts often does), it shows the designed look.
- YouTube: `privacy: "public"`, `madeForKids: false`, title from the package (100 characters max), 3-7 tags, category `EDUCATION` (civic videos: `NEWS_POLITICS`).
- What goes where:
  - **Quick insight and civic (vertical):** one post with providers instagram (`type: REEL`, `showReelOnFeed: true`), facebook (`type: REEL`) and youtube (`type: short`).
  - **Flagship:** post A with `<slug>-short.mp4` to instagram (`REEL`) and youtube (`short`, Short title) at 12:30; post B at 17:30 with `<slug>-youtube.mp4` to facebook (`type: POST`, `title` = full video title) and youtube (`type: video`, full title, the short description plus chapters); post C, the teaser `<slug>-teaser.mp4` to facebook only (`type: REEL`) at 20:00, is left as a `pending_link` item for the link-up task (section 7b) so its caption carries the full film's YouTube link.
- If a post is rejected, fix the field the error names and retry once. If it still fails, log status `"made-not-posted"` with the error and tell Hassan. Never post the same video twice: check the log's `posted` field first.
- **Confirm it went live.** Metricool can accept a post and then fail when it publishes (this happened on Nov 9 because of a plan limit). For a post due within 30 minutes, wait until 2-3 minutes past its publish time, then call getScheduledPosts (brandId 7089421, timezone America/Edmonton, a range covering today) and read each provider's `status`. PUBLISHED: record the `publicUrl`s in the log. ERROR: record the `detailedStatus`, set status `"made-not-posted"` and say so in the delivery message. Never report a video as posted until it shows PUBLISHED. Posts due later than 30 minutes are reported as "scheduled for HH:MM" and are confirmed by the next run (section 1).
- Add `posted: [{metricool_id, plannerUrl, providers, publish_at}]` to the log entry, then commit and push the log again.

## 7b. Posts that point to a full video carry its YouTube link (Hassan's rule, Nov 11, 2026)
- Any post that sends people to a full film (the flagship teaser; every Calgary Origins part) must include the **actual YouTube link** of that film, never just "full film on YouTube". Caption layout, each item on its own line:
  ```
  <hook>
  <one or two plain sentences>
  <question> Drop your thoughts below 👇

  ▶ Full film: https://youtu.be/<id>
  🌐 More Calgary stories, studies and analysis: calgaryinsight.ca

  #Calgary #yyc ...
  ```
- The link exists only after YouTube publishes the film, so these posts are **not** scheduled by the run that makes the videos. That run schedules the film itself (flagship post B at 17:30; Origins film Wednesday 09:30), then adds a `pending_link` item to the log entry for each dependent post: `{file, raw_url, thumbnail_url, providers, caption_without_link, first_comment, post_at, link_to: "<metricool id of the YouTube film post>"}` (first_comment: the section 0b rule 4 line with the deep link; the link-up task sends it as `firstCommentText`).
- The **link-up task** (runs 09:41 and 17:41 daily) finds every `pending_link` item whose film shows PUBLISHED in getScheduledPosts, takes the film's YouTube `publicUrl` (use the https://youtu.be/<id> form), builds the caption with the layout above, and schedules the post for its `post_at` time (or, if that has passed, by the section 7 fallback). If the film failed on YouTube, it links the channel instead: https://www.youtube.com/channel/UC5LiLMNGPjdreg5pjcNm_jg. If a dependent post was already scheduled earlier without the link, it updates that scheduled post's text (updateScheduledPost) instead of creating a second one.

## 8. Calgary Origins (weekly documentary series, from Nov 18, 2026)
- One episode a week, released on **Wednesdays** (calendar rows with slot `ORIGINS`). Episode 1, "The Town That Moved Across the River", was posted on Nov 11 by Hassan.
- Made by the scheduled task on the **Tuesday before**, following the `calgary-origins-documentary` skill, directed with `calgary-motion-director` (Storyteller identity, section 3c: production bible per chapter, motion engine, sound mix, QC gate) (about 10 minutes, four 2:30 chapters, four vertical "PART n OF 4" reels), plus every rule in this playbook: content direction, the fact audit gate (section 3b) over the whole script (nothing is narrated or published until APPROVED; any open discrepancy the skill would ask Hassan about counts as not approved), site name shown as calgaryinsight.ca, opening hook and closing viewer question in each part, designed thumbnails (1280x720 for the film, 1080x1920 per part), short engaging captions with no numbers.
- Narration uses the `studio-probe` lane (section 4), not `budget-probe`. Videos go to the `social-media` branch under `social/<slug>/` as the skill says.
- Every film and every part gets its own designed thumbnail and no AI labels (section 7). Posting is spread across the week, never all together: the run schedules only the full film to YouTube (type video) for Wednesday 09:30, and records the four parts as `pending_link` items (Part 1 Wed 10:00, Part 2 Thu 10:00, Part 3 Fri 10:00, Part 4 Sat 10:00; each to Instagram Reel, Facebook Reel and YouTube Short). The link-up task (section 7b) schedules them with the film's YouTube link. Each caption shows "Part n of 4" and uses the section 7b layout.
- No repeats of topics in log.json, the already-posted list or the flagship calendar.
