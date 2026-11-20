# Shia Voice — studio kit

Daily animated Reels for the Facebook page (currently named Shia Voice Dubai; on-screen and spoken branding is just "SHIA VOICE" / شیعہ وائس / شيعة فويس, never "Dubai") (Metricool brand "Shia voice", blogId 8027214, Facebook only).
Each episode is made in Urdu and Arabic, vertical 1080x1920, 30 fps, narrated, subtitles burned in.

Hard rules
- LEGAL AND PLATFORM SAFETY (Nov 20, 2026, overrides tone choices below): UAE Federal Decree-Law 34/2023 makes it a crime to insult, mock, defame or curse a prophet or the prophets' wives, family or companions; Pakistan's Penal Code (s. 298-A) has a similar offence, and Meta removes content that attacks people for their religion. So: no insulting, mocking or derogatory words, adjectives, visuals or sarcasm about ANY companion or wife of the Prophet, in script, captions, titles or thumbnails; state contested events as "according to <book>" with the source; never generalise about Sunni Muslims as a group; no calls to hostility. Facts and sources are fine; contempt is not.
- Never show the face or hands of the Prophet, the Ahlul Bayt or any holy personality: they appear only as light (`holyLight`).
- Other people are dark silhouettes with no features. Nothing graphic.
- Shia perspective, factual tone, sources named on screen (Shia narrations and, where they exist, Sunni books). People are named as history names them, no insults.
- ABU BAKR, UMAR, UTHMAN (Hassan's rule, Nov 15 2026): nothing on the page is favorable or neutral towards them. Mention them only where
  the Ahlul Bayt's story needs them (Fadak, the door, the pen and paper...), presented from the Shia perspective with the sourced facts.
  No praise, no honorifics, no neutral biography (e.g. drop "she married Abu Bakr" from a companion's life story). Still no insults or
  curses, and every claim about them sourced like any other.
- Background score on every video (score.py, original, maqam Hijaz: drone, strings, oud, ney, daf), one mood per scene in moods.json:
  lament, tender, tension (with impact = fraction of the scene), evidence, procession, grave, end. Plus wind / fire crackle / door thud. Music sits ~8-12 dB under the voice and ducks.
- Every video: a hook first line, an engaging question, follow CTA for Shia Voice (never "Dubai"), a teaser for tomorrow's topic in the same topic column.
- Urdu: the Prophet is called «اللہ کے نبی» — never «رسولِ خدا», no spoken salawat (Hassan's rule, Nov 13 2026: the voice mispronounces them). Script writes «اللہ کے نبی ﷺ»; lexicon.json makes the voice say only "Allah ke Nabi" and the captions keep ﷺ. Arabic keeps «رسول الله ﷺ».
- DIALOGUE VOICES (Hassan's rule, Nov 15 2026): whenever the script quotes what another person said (e.g. «Umar said: "So what?"»),
  the quoted words are voiced by a SECOND voice, not the narrator, and delivered with the intensity of that moment
  (a curt dismissal sounds curt, a threat sounds hard, grief sounds broken). Mark it inline in lines.json:
  `[[speaker|intensity|quoted words]]`, e.g. `عمر نے کہا: [[man|dismissive|تو کیا ہوا؟]]`.
  Speakers (tts_sv.py CAST, override per episode with "cast" in lines.json): man, man2, woman, woman2
  (ur: ur-IN-SalmanNeural / ur-PK-UzmaNeural / ur-IN-GulNeural; ar: ar-AE-HamdanNeural / ar-IQ-BasselNeural / ar-SA-ZariyahNeural / ar-AE-FatimaNeural);
  match the speaker's gender, and keep one voice per person within an episode (two different men in one scene -> man and man2).
  Intensities: calm, tender, grief, firm, dismissive, angry, urgent, fearful, proud, whisper.
  `narrator` as the speaker keeps the narrator's voice but applies the intensity.
  The Prophet ﷺ, the Ahlul Bayt (a.s.) and other holy personalities are NOT acted by a character voice: their words stay in the
  narrator's voice (use `[[narrator|<intensity>|...]]` if the moment needs it), just as they are never drawn.
  Captions strip the markup (render.py) and show only the words; the lexicon is applied to the whole line, markup included.
  Check sv_info.json "segments" and the ASR of dialogue lines like any other line.
- Urdu subtitles in Nastaliq, Arabic in Amiri. Honorifics: ﷺ, (س)/(ع) on screen; spoken in full in the narration.

Posting schedule (since Nov 14 2026: two topics a day, each in Urdu and Arabic, Facebook Reels, Asia/Dubai)
- Topic 2 (calendar columns H-K): 13:00 Urdu, 16:00 Arabic.
- Topic 1 (calendar columns C-G, tied to the Hijri date): 19:00 Urdu, 21:00 Arabic.
- If a slot has passed: next time at least 15 min from now and 60 min from every other Shia Voice post that day, Urdu before Arabic. No teaser cuts.
- Two daily tasks share this repo: the episode number is the next after the highest folder in episodes/; always `git pull --rebase` before pushing.

Pipeline
1. Script: 9 lines per language (hook, 6-7 story beats, CTA). Numbers written as words for the voice.
   PRONUNCIATION: the display lines (captions) keep correct spelling; the TTS lines are the display lines with lexicon.json applied
   in ONE regex pass, longest key first (so self-mapping keys like جنت البقیع are not replaced twice)
   (e.g. رسولِ خدا→رسولے خدا, شیعہ→شِیعہ, بیت الاحزان→بیت ال احزان, بقیع→جنت البقیع). For any new hard name (Arabic proper nouns, places),
   first test 2-4 spellings with lex_test.py on Actions (Whisper medium judges) and add the winner to lexicon.json. Arabic: add tashkeel to rare words.
   After the narration run, read sv_info.json ASR (Whisper medium) line by line and re-voice any line where a key name is wrong.
2. Narration (free): branch `budget-probe` of this repo. Put `{"ur":{voice:"ur-PK-AsadNeural",rate:"-6%",pitch:"-2Hz",lines:[...]}, "ar":{voice:"ar-SA-HamedNeural",...}}`
   in `probe/sv_lines.json` (dialogue marked `[[speaker|intensity|words]]`, optional "cast" per language), point `.github/workflows/budget-probe.yml` at `python probe/tts_sv.py _b` (copy of tts_sv.py here),
   commit as Hassan Ali, force-push `budget-probe`, wait for the run, clone `budget-probe-out` → `ur_0.wav… ar_8.wav` + `sv_info.json` (durations and a Whisper transcript to check pronunciation).
3. Scenes: copy the last episode's `page.html` + `render.py` (ep03 onward: reads `lines.json`/`page.html` in its own folder, writes `out_<lang>/`; symlink `fonts -> ../../fonts`), rewrite `SCENES` (one function per narration line), `REPL` and `LABELS`.
   `python3 render.py <ur|ar> <audio_dir> preview <scene>:<t> ...` → look at the frames; then `full`. Lex test + narration can run in one Actions job (tts_sv.py first, then lex_test.py with continue-on-error); re-voice only the lines whose names came out wrong.
4. Write episodes/epNN/moods.json (moods, impacts, and sound effects: `"thud": [[scene, fraction]]`, `"crackle": [[scene, level]]`), then `python3 mix.py <lang> <audio_dir> episodes/epNN`, then concat scenes with `-c copy`, mux `mix.wav`, re-encode at `-crf 27 -preset veryfast` (~7-10 MB).
   `python3 thumb.py episodes/epNN` for the covers (scene 0 without captions).
5. Publish: push the MP4s and JPG covers to branch `social-media` under `shia-voice/epNN_<slug>_<lang>.mp4|jpg`,
   then Metricool createScheduledPost with the raw.githubusercontent.com URLs, facebookData type REEL, videoThumbnailUrl = cover.
6. Mark the day's row Posted in the "Shia Voice Dubai — Daily Video Calendar" sheet (https://claude.ai/artifact/Jy7cecLM6RCFTDJHUVVXsW).
