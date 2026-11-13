# Shia Voice — studio kit

Daily animated Reels for the Facebook page (currently named Shia Voice Dubai; on-screen and spoken branding is just "SHIA VOICE" / شیعہ وائس / شيعة فويس, never "Dubai") (Metricool brand "Shia voice", blogId 8027214, Facebook only).
Each episode is made in Urdu and Arabic, vertical 1080x1920, 30 fps, narrated, subtitles burned in.

Hard rules
- Never show the face or hands of the Prophet, the Ahlul Bayt or any holy personality: they appear only as light (`holyLight`).
- Other people are dark silhouettes with no features. Nothing graphic.
- Shia perspective, factual tone, sources named on screen (Shia narrations and, where they exist, Sunni books). People are named as history names them, no insults.
- Background score on every video (score.py, original, maqam Hijaz: drone, strings, oud, ney, daf), one mood per scene in moods.json:
  lament, tender, tension (with impact = fraction of the scene), evidence, procession, grave, end. Plus wind / fire crackle / door thud. Music sits ~8-12 dB under the voice and ducks.
- Every video: a hook first line, an engaging question, follow CTA for Shia Voice Dubai, a teaser for tomorrow.
- Urdu subtitles in Nastaliq, Arabic in Amiri. Honorifics: ﷺ, (س)/(ع) on screen; spoken in full in the narration.

Pipeline
1. Script: 9 lines per language (hook, 6-7 story beats, CTA). Numbers written as words for the voice.
   PRONUNCIATION: the display lines (captions) keep correct spelling; the TTS lines are the display lines with lexicon.json applied
   (e.g. رسولِ خدا→رسولے خدا, شیعہ→شِیعہ, بیت الاحزان→بیت ال احزان, بقیع→جنت البقیع). For any new hard name (Arabic proper nouns, places),
   first test 2-4 spellings with lex_test.py on Actions (Whisper medium judges) and add the winner to lexicon.json. Arabic: add tashkeel to rare words.
   After the narration run, read sv_info.json ASR (Whisper medium) line by line and re-voice any line where a key name is wrong.
2. Narration (free): branch `budget-probe` of this repo. Put `{"ur":{voice:"ur-PK-AsadNeural",rate:"-6%",pitch:"-2Hz",lines:[...]}, "ar":{voice:"ar-SA-HamedNeural",...}}`
   in `probe/sv_lines.json`, point `.github/workflows/budget-probe.yml` at `python probe/tts_sv.py _b` (copy of tts_sv.py here),
   commit as Hassan Ali, force-push `budget-probe`, wait for the run, clone `budget-probe-out` → `ur_0.wav… ar_8.wav` + `sv_info.json` (durations and a Whisper transcript to check pronunciation).
3. Scenes: copy the last episode's `page.html` + `render.py`, rewrite `SCENES` (one function per narration line) and `LABELS`.
   `python3 render.py <ur|ar> <audio_dir> preview <scene>:<t> ...` → look at the frames; then `full`.
4. Write episodes/epNN/moods.json, then `python3 mix.py <lang> <audio_dir>` (edit the `ep2_` folder name and crackle/thud scene numbers), then concat scenes with `-c copy`, mux `mix.wav`, re-encode at `-crf 27 -preset veryfast` (~10 MB).
   `python3 thumb.py` for the cover (scene 0 without captions).
5. Publish: push the MP4s and JPG covers to branch `social-media` under `shia-voice/epNN_<slug>_<lang>.mp4|jpg`,
   then Metricool createScheduledPost with the raw.githubusercontent.com URLs, facebookData type REEL, videoThumbnailUrl = cover.
6. Mark the day's row Posted in the "Shia Voice Dubai — Daily Video Calendar" sheet (https://claude.ai/artifact/Jy7cecLM6RCFTDJHUVVXsW).
