# Calgary Insight content studio: run playbook

Every scheduled run follows this file exactly. One run = one video.

## 0. Guard rails (always)
- Credit is always **calgaryinsight.ca** (spoken "calgary insight dot c a"). Never put Hassan's name or any credential in a video, package or caption.
- **Free pipeline only:** Kokoro narration on GitHub Actions, Playwright scenes and ffmpeg. Never spend credits (Higgsfield, OpenArt, vidIQ, Descript, RunPod, fal.ai).
- **Create, don't publish.** Never post to Instagram, Facebook, YouTube or Metricool. Never touch `main`, the website or any branch other than `content-studio` and `studio-probe`. Hassan reviews and publishes himself.
- Never mention Canada Insight in Calgary Insight content.
- Nonpartisan and neutral across wards. No attacks on or endorsements of councillors, candidates or parties.
- Every figure is researched in this run from a primary source, with its URL. Never state a number, date or quote from memory. If a claim can't be verified, cut it.

## 1. Find today's slot
- Today = `TZ=America/Edmonton date +%F`. If today is before 2026-11-09 or after 2026-12-31, stop and do nothing.
- Slot: the scheduled task says which type it is (quick-insight / flagship / civic). For quick-insight, local hour < 14 → `AM`, else `PM`.
- Look up `calendar.json` for (date, slot). If `log.json` already has that date+slot with status `done`, stop (it already ran).

## 2. Pick and verify the topic
- Load the skill named in the calendar row (`calgary-data-explainer`, `calgary-storyteller` or `calgary-civic-analyst`) and follow it, plus `calgary-insight-video-explainer` and `video-making` for production.
- The calendar topic is a **starting point, not a verified fact.** Research it (web search plus fetching the original pages). If the data doesn't hold up, is stale, or the story is already in `log.json` or on the covered list below, pick a stronger topic **in the same category** and write down why in the log.
- Prefer timely and underreported angles: check the news from the past two weeks for that subject first.
- No repeats: the topic and its central number must not repeat anything in `log.json`. A follow-up is fine only if the evidence is materially new; say what changed.
- **Already covered on calgaryinsight.ca (don't recycle):** Budget 2026 explainer, Election field guide 2027, Invest in Calgary, Parks crowding, Population growth model, Ward 5 and 311 / "Who Calgary's 311 Hears", Growth vs amenities.

## 3. Write the package
Write `packages/<date>-<slot>-<slug>.md` with **every** required output of the skill (topics/angles, hooks, verified evidence labelled fact / estimate / projection / interpretation, methodology and limitations where the skill asks for them, full narration, timestamped scene-by-scene storyboard, visual generation prompts, chart/map instructions with exact values and units, clickable sources with publication date and data period, captions / YouTube title and description, thumbnail concept, short-form version for flagships).
- Narration: Canadian English, short sentences, **every number written in words as spoken**. It has to fit the runtime (about 2.5 words a second). End with a spoken close and the calgaryinsight.ca end card; never end abruptly.
- Visual generation prompts are kept for an optional paid cinematic version later. This run renders the free motion-graphics version only.

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
- Quick insight and civic: **1080×1920 vertical**. Flagship: **1920×1080 widescreen**. 30 fps, H.264 `-crf 18 -preset veryfast`, one file per scene, concatenated with `-c copy`.
- Logo: `assets/logo.svg` in this branch, placed as the explainer skill specifies. Navy/gold, Fira Sans. Burned-in captions. Source and data period shown small on every data scene.
- Before the full render, render the two busiest scenes plus the end card as stills and **look at them** (Read the image). Fix overlaps and clipped text.
- After assembly: contact sheet of six frames (look at it), duration check, fade check, poster JPG. Aim for ≤ 10 MB.

## 6. Deliver
- Create a **draft** release (drafts stay private on this public repo), one per video:
  `gh release create studio-<date>-<slot> --repo hassanaliarshad110/calgary-data-desk --draft --target content-studio --title "<date> <slot> · <title>" --notes-file <short notes: type, length, caption, sources> <slug>.mp4 <slug>.jpg packages/<file>.md`
- Append to `log.json`: `{date, slot, type, category, title, topic_used, changed_from_calendar (reason or null), central_figure, sources:[urls], length_s, release_tag, status:"done"}`. If rendering failed, save the package anyway with status `"script-only"` and the reason.
- Commit the package and log to `content-studio` as Hassan Ali, `git pull --rebase` then push, retrying up to 3 times.
- Send the MP4 to Hassan with SendUserFile (display attach), then a SendUserMessage of at most 5 lines: title, length and format, the one key figure with its source, and the draft release name.
