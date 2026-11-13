# Shia Voice Dubai — studio kit

Daily animated Reels for the Facebook page Shia Voice Dubai (Metricool brand "Shia voice", blogId 8027214, Facebook only).
Each episode is made in Urdu and Arabic, vertical 1080x1920, 30 fps, narrated, subtitles burned in.

Hard rules
- Never show the face or hands of the Prophet, the Ahlul Bayt or any holy personality: they appear only as light (`holyLight`).
- Other people are dark silhouettes with no features. Nothing graphic.
- Shia perspective, factual tone, sources named on screen (Shia narrations and, where they exist, Sunni books). People are named as history names them, no insults.
- No music: wind, a low drone, fire crackle and spot effects only.
- Every video: a hook first line, an engaging question, follow CTA for Shia Voice Dubai, a teaser for tomorrow.
- Urdu subtitles in Nastaliq, Arabic in Amiri. Honorifics: ﷺ, (س)/(ع) on screen; spoken in full in the narration.

Pipeline
1. Script: 9 lines per language (hook, 6-7 story beats, CTA). Numbers written as words for the voice.
2. Narration (free): branch `budget-probe` of this repo. Put `{"ur":{voice:"ur-PK-AsadNeural",rate:"-6%",pitch:"-2Hz",lines:[...]}, "ar":{voice:"ar-SA-HamedNeural",...}}`
   in `probe/sv_lines.json`, point `.github/workflows/budget-probe.yml` at `python probe/tts_sv.py _b` (copy of tts_sv.py here),
   commit as Hassan Ali, force-push `budget-probe`, wait for the run, clone `budget-probe-out` → `ur_0.wav… ar_8.wav` + `sv_info.json` (durations and a Whisper transcript to check pronunciation).
3. Scenes: copy the last episode's `page.html` + `render.py`, rewrite `SCENES` (one function per narration line) and `LABELS`.
   `python3 render.py <ur|ar> <audio_dir> preview <scene>:<t> ...` → look at the frames; then `full`.
4. `python3 mix.py <lang> <audio_dir>` (edit the `ep2_` folder name and crackle/thud scene numbers), then concat scenes with `-c copy`, mux `mix.wav`, re-encode at `-crf 27 -preset veryfast` (~10 MB).
   `python3 thumb.py` for the cover (scene 0 without captions).
5. Publish: push the MP4s and JPG covers to branch `social-media` under `shia-voice/epNN_<slug>_<lang>.mp4|jpg`,
   then Metricool createScheduledPost with the raw.githubusercontent.com URLs, facebookData type REEL, videoThumbnailUrl = cover.
6. Mark the day's row Posted in the "Shia Voice Dubai — Daily Video Calendar" sheet (https://claude.ai/artifact/Jy7cecLM6RCFTDJHUVVXsW).
