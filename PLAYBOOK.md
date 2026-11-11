# Calgary Insight content studio: run playbook

Every scheduled run follows this file exactly. One run = one video.

## 0. Guard rails (always)
- Credit is always **calgaryinsight.ca** (spoken "calgary insight dot c a"). Never put Hassan's name or any credential in a video, package or caption.
- **Free pipeline only:** Kokoro narration on GitHub Actions, Playwright scenes and ffmpeg. Never spend credits (Higgsfield, OpenArt, vidIQ, Descript, RunPod, fal.ai).
- **Post only what passed.** Hassan approved automatic posting to Calgary Insight's Instagram, Facebook and YouTube through Metricool (Nov 9, 2026), but only for videos whose fact audit returned APPROVED and whose render checks passed. Never post anything blocked, script-only or failed. Never touch `main` or the website, or any branch other than `content-studio`, `studio-probe` and `studio-videos`.
- Never mention Canada Insight in Calgary Insight content.
- Nonpartisan and neutral across wards. No attacks on or endorsements of councillors, candidates or parties.
- Every figure is researched in this run from a primary source, with its URL. Never state a number, date or quote from memory. If a claim can't be verified, cut it.

## Content direction (Hassan, Nov 10, 2026): stories, fun facts and news. No independent studies.
- **Quick slots (AM/PM): a Calgary fun fact or mini-story.** Surprising, shareable, light: places, names, people, firsts, history, nature, culture. Not a statistics study. Use a number only when the fact itself is a number, and never compute or model anything ourselves.
- **Flagship slots: a Calgary story.** History, people, places, turning points, told as a story with a beginning, a surprise and an ending. Not an analysis or a report.
- **CIVIC slots (Mon/Wed/Fri) are now "Calgary news explained".** Pick the biggest or most-talked-about Calgary story of the past ~48 hours (City Hall, transit, weather, events, business, community), using at least two independent reports or an official source, and explain in 30-60 s what happened, why it matters and what happens next. Strictly neutral: no opinion, no taking sides, no predictions. Don't repeat a story already in log.json unless something new happened. If there's no solid Calgary news, make a timely Calgary story instead (an anniversary, a season, an event this week).
- No independent studies, scores, rankings we computed, or ward-by-ward comparisons. Everything is still fact-checked by the audit gate.

## 1. Find today's slot
- Today = `TZ=America/Edmonton date +%F`. If today is before 2026-11-09 or after 2026-12-31, stop and do nothing.
- Slot: the scheduled task says which type it is (quick-insight / flagship / civic). For quick-insight, local hour < 14 → `AM`, else `PM`.
- Look up `calendar.json` for (date, slot). If `log.json` already has that date+slot with status `done`, stop (it already ran).

## 2. Pick and verify the topic
- Load the skill named in the calendar row (`calgary-data-explainer`, `calgary-storyteller` or `calgary-civic-analyst`) and follow it, plus `calgary-insight-video-explainer` and `video-making` for production.
- The calendar topic is a **starting point, not a verified fact.** Research it (web search plus fetching the original pages). If the data doesn't hold up, is stale, or the story is already in `log.json` or on the covered list below, pick a stronger topic **in the same category** and write down why in the log.
- Prefer timely and underreported angles: check the news from the past two weeks for that subject first.
- No repeats: the topic and its central number must not repeat anything in `log.json`. A follow-up is fine only if the evidence is materially new; say what changed.
- **Already covered on calgaryinsight.ca (don't recycle):** Budget 2026 explainer, Election field guide 2027, Invest in Calgary, Parks crowding, Population growth model, Ward 5 and 311 / "Who Calgary's 311 Hears", Growth vs amenities. Also already posted on Calgary Insight's social channels (Nov 8-9, 2026), so not to be repeated as a main subject: "Where Two Rivers Meet: The Story of Calgary" (city history overview: Mohkinstsis, NWMP fort 1875, Treaty 7, railway 1883, 1886 fire and Sandstone City, first Stampede, Turner Valley, Leduc, Calgary Tower, 1988 Olympics, 2013 flood; a deep dive on one of these is fine only with a clearly new angle), "The Elbow: Calgary's First Peoples" (Treaty 7, Mohkinstsis, Blackfoot, Tsuut'ina, Stoney Nakoda, Métis), "The pipes beneath Calgary" (sewer service connections' age), "Calgary Has a Secret City 15 Feet Above the Ground" (Plus 15 network).

## 3. Write the package
Write `packages/<date>-<slot>-<slug>.md` with **every** required output of the skill (topics/angles, hooks, verified evidence labelled fact / estimate / projection / interpretation, methodology and limitations where the skill asks for them, full narration, timestamped scene-by-scene storyboard, visual generation prompts, chart/map instructions with exact values and units, clickable sources with publication date and data period, captions / YouTube title and description, thumbnail concept, short-form version for flagships).
- Narration: Canadian English, short sentences, **every number written in words as spoken**. It has to fit the runtime (about 2.5 words a second). End with a spoken close and the calgaryinsight.ca end card; never end abruptly.
- **Site name on screen:** the narration spells the site for the voice ("calgary insight dot c a"), but every caption, subtitle, end card and on-screen text must show it as **calgaryinsight.ca**, never the spelled-out words. Build captions from the narration with that one substitution (for example `re.sub(r"calgary insight dot c a", "calgaryinsight.ca", line, flags=re.I)`), and check the closing caption frame before the full render.
- **Captions and descriptions (Hassan's rule, Nov 10, 2026): short, engaging, no figures.** Every post text (Instagram, Facebook, YouTube Short, teaser) is:
  1. a one-line hook (a question or a surprising plain-language statement),
  2. one or two short sentences with the key facts in plain words, with **no numbers, percentages, dollar amounts or tables** (say "nearly half", "more than doubled" only if audited; otherwise just describe it),
  3. a one-line question that invites comments, ending "Drop your thoughts below 👇",
  4. `Sources and the full story: calgaryinsight.ca`,
  5. 3-5 hashtags (#Calgary #yyc plus 1-3 on the topic).
  No source lists, no URLs other than calgaryinsight.ca, no long paragraphs. About 300 characters before the hashtags. The full YouTube widescreen description may add chapters below the same short text, nothing else. Sources live in the package and on the site, not in the post.
- **Hook and question in every video (Hassan's rule, Nov 10, 2026).**
  - **Open with a hook** in the first 2 seconds, spoken and on screen: a question or a surprising line ("Why is a Calgary highway named after a runner?"), never a slow intro.
  - **Close with a question to the viewer**, spoken and shown big on screen just before the end card, followed by "Drop your thoughts below" (on screen: "Drop your thoughts below 👇"). Example: "Do you think this is fair, or too much? Drop your thoughts below."
  - The caption follows the same pattern: hook as the first line, the question near the end with "Drop your thoughts below 👇", then the calgaryinsight.ca line and hashtags.
  - Questions must be genuinely open or two-sided ("fair, or too much?", "Did you know this?", "Which one would you visit first?", "How has this affected you?"), never leading, partisan or pushing one answer, especially in news videos. They are not facts, so they need no source, but the auditor checks they're neutral.
- The package ends with the claims table required by section 3b.
- Visual generation prompts are kept for an optional paid cinematic version later. This run renders the free motion-graphics version only.

## 3b. Fact audit: the gate (nothing is narrated or rendered until it passes)
1. **Claims table.** At the end of the package, list every factual statement in the narration, on-screen text, captions, chart labels and descriptions: `# | claim as worded in the script | exact figure, unit, period, boundary | label (fact / estimate / projection / interpretation) | source URL | where in the source (page, table or section)`.
2. **Independent auditor.** Spawn a fresh subagent (Agent tool, general-purpose) that did not draft the script. Give it **only** the narration, on-screen text and the claims table, not your research notes or reasoning. Its instructions:
   - Open every source URL yourself and check each claim against what the page actually says: the number, unit, date, reference period, geographic boundary (city / CMA / ward / community) and attribution.
   - Mark each claim **PASS**, **FAIL** (the source says something different, and give the correct wording), or **UNSUPPORTED** (the page doesn't say it, won't load, or isn't a credible source).
   - Also flag: any factual sentence missing from the claims table; numbers in words that don't match the figure (for example "forty-two" vs 4.2); comparisons across mismatched periods or boundaries; estimates or projections stated as facts; correlation presented as cause; a hook the data doesn't pay off; anything partisan or unfair to a ward or person; a closing question that is leading or one-sided; a missing opening hook or closing question; any mention of Hassan's name.
   - Return a table with one row per claim, plus a verdict: **APPROVED** only if every claim passes and nothing is flagged.
3. **Fix and re-audit.** Correct or cut every FAIL and UNSUPPORTED claim, deal with every flag, and send the revised script to a **new** auditor subagent. Allow at most 3 rounds.
4. **If it still isn't approved after round 3:** do not narrate or render. Save the package and audit report, log status `"blocked-by-audit"` with the reasons, and tell Hassan which claims couldn't be verified.
5. If the Agent tool isn't available, run the audit yourself as a separate pass: re-fetch every URL fresh and apply the same checks, and label the report "self-audit".
6. Save the final auditor report as `audits/<date>-<slot>.md` (every claim, its verdict and the source it was checked against). Record `audit: {rounds, claims_checked, verdict}` in the log.
7. **After rendering,** confirm that the narration lines sent to Kokoro and the burned-in captions match the approved script word for word (the only allowed difference: the spoken site name is shown as calgaryinsight.ca in captions). Any change after approval needs a new audit round.

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

## 5. Render (follow calgary-insight-video-explainer)
- Quick insight and civic: **1080×1920 vertical**.
- Flagship: **two versions from the same narration**, both rendered every time (YouTube Shorts accept up to 3 minutes, and flagships are always under 3):
  1. `<slug>-short.mp4`: **1080×1920 vertical Short**, laid out natively for vertical (not cropped from the widescreen), with key content between y≈300 and y≈1420 and clear of the right-hand 120 px.
  2. `<slug>-youtube.mp4`: **1920×1080 widescreen** for regular YouTube and the website.
  3. `<slug>-teaser.mp4`: **1080×1920 vertical teaser, 20-30 seconds (never over 85 s)**, rendered from package section 12 (the short-form teaser script), with its own short narration run on the studio-probe lane. It ends on a card saying "Full video on our page · calgaryinsight.ca". Its claims must be a subset of the audited claims table, with no new facts.
  All versions get burned-in captions, the logo and the end card. 30 fps, H.264 `-crf 18 -preset veryfast`, one file per scene, concatenated with `-c copy`.
- Logo: `assets/logo.svg` in this branch, placed as the explainer skill specifies. Navy/gold, Fira Sans. Burned-in captions. Source and data period shown small on every data scene.
- Before the full render, render the two busiest scenes plus the end card as stills and **look at them** (Read the image). Fix overlaps and clipped text.
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
- Append to `log.json`: `{date, slot, type, category, title, topic_used, changed_from_calendar (reason or null), central_figure, sources:[urls], length_s, video_path, status:"done"}`. If rendering failed, save the package anyway with status `"script-only"` and the reason.
- Commit the package and log to `content-studio` as Hassan Ali, `git pull --rebase` then push, retrying up to 3 times.
- Send the MP4(s) to Hassan with SendUserFile (flagships: both versions) (display attach), then a SendUserMessage of at most 5 lines: title, length and format, the one key figure with its source, the raw video link, and when and where it is scheduled to post (or why it wasn't).

## 7. Post to social (Metricool), only after APPROVED and a successful render
- Brand: Metricool `blogId` **7089421**, timezone **America/Edmonton**. Connected: Instagram @calgaryinsight, the Calgary Insight Facebook page, the YouTube channel.
- Media: the raw link `https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/studio-videos/<date>-<slot>/<file>.mp4`, used only **after** the push to `studio-videos` has succeeded. Metricool copies the file when the post is created.
- Publish time: about 10 minutes after now (Calgary time), `autoPublish: true`, `draft: false`. Always set `videoThumbnailUrl` to the raw link of the matching thumbnail (`https://raw.githubusercontent.com/hassanaliarshad110/calgary-data-desk/studio-videos/<date>-<slot>/<slug>-thumb.jpg`; flagship widescreen post: `<slug>-thumb-yt.jpg`), pushed before posting. If Metricool rejects the post with VIDEO_THUMBNAIL_NOT_APPLICABLE, retry once without it and say so in the delivery message. A YouTube warning "Could not upload video thumbnail" means the YouTube channel isn't verified for custom thumbnails: the video still published, so record it as published with that warning.
- Text: the package's audited short caption (section 3 rules), word for word.
- YouTube: `privacy: "public"`, `madeForKids: false`, title from the package (100 characters max), 3-7 tags, category `EDUCATION` (civic videos: `NEWS_POLITICS`).
- What goes where:
  - **Quick insight and civic (vertical):** one post with providers instagram (`type: REEL`, `showReelOnFeed: true`), facebook (`type: REEL`) and youtube (`type: short`).
  - **Flagship:** post A with `<slug>-short.mp4` to instagram (`REEL`) and youtube (`short`, Short title); then post B, 5 minutes later, with `<slug>-youtube.mp4` to facebook (`type: POST`, `title` = full video title) and youtube (`type: video`, full title, the short description plus chapters); then post C, 5 minutes after B, with `<slug>-teaser.mp4` to facebook only (`type: REEL`), with the same short-caption style, ending "Full video on our page. calgaryinsight.ca" plus hashtags. Facebook's publishing API only accepts Reels of 3-90 seconds, so the full flagship goes to Facebook as a regular video and the teaser goes as the Reel.
- If a post is rejected, fix the field the error names and retry once. If it still fails, log status `"made-not-posted"` with the error and tell Hassan. Never post the same video twice: check the log's `posted` field first.
- **Confirm it went live.** Metricool can accept a post and then fail when it publishes (this happened on Nov 9 because of a plan limit). After scheduling, wait until 2-3 minutes past the publish time, then call getScheduledPosts (brandId 7089421, timezone America/Edmonton, a range covering today) and read each provider's `status`. PUBLISHED: record the `publicUrl`s in the log. ERROR: record the `detailedStatus`, set status `"made-not-posted"` and say so in the delivery message. Never report a video as posted until it shows PUBLISHED.
- Add `posted: [{metricool_id, plannerUrl, providers, publish_at}]` to the log entry, then commit and push the log again.
