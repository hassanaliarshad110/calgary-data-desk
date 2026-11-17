# GTA blitz #12 — hastinapur-chase (FAN-THEORY): "Desi GTA: Agar Hastinapur ki sadkon par chase hota?"
- Sources read this run (web-fetch agent): en.wikipedia.org Hastinapur + B._B._Lal, openthemagazine.com "Hastinapur Calling". Britannica failed (client error).
- Check round 1 PROBLEMS (n02 implied epic city = today's town; n04 "katha bhi" after the dig implied proof) -> fixed ("naam sirf kahaani mein nahi milta"; "Par dono ko jodna pakka saboot nahi" + on-screen PAKKA SABOOT NAHI box). Round 2 APPROVED by a fresh independent agent.
- Voice: 7 lines hi-IN-SwaraNeural +12%/+3Hz (v3: n01/n04 trimmed to fit 55 s). Scene gaps 0.08/0.12 s.
- Build: work dir = these files + episodes/ep4/scenes.js + ep4 prep_audio.py/score_mix.py over budget-probe mp3s (/home/claude/nvout; mkdir aud first); `python3 ../kit/shorts.py 1`; `python3 thumb.py`.
- Studio assets (select_assets.py on brief.json): PRP-056 clipboard, PRP-013 clock, VFX-004 rain, VFX-011 impactStar, VFX-015 stars, GFX-009 pin, GFX-010 route, ported in scenes_v.js. Ancient-city street set, chariot + horse, soil cross-section with flood scar, trowel/brush and rising water are own drawings. No map of India (abstract board + river + city pins), no deity/epic character/real person drawn, no police or combat.
- Bug fixed: chariot dust radius went negative at t<0 (modulo of negative time) -> ((x%1)+1)%1.
- Output 54.6 s, -14.4 LUFS, score ducked ~57% under voice. Metricool uuid 3148399153105488223, 18 Nov 2026 01:30 IST (2:00 PM Regina, 17 Nov).
- WARNING seen in getScheduledPosts: the 13:00 IST 17 Nov post (GTA 6 Special #1 Part 2/4, uuid -6593897045793092952) FAILED on YouTube: "The user has exceeded the number of videos they may upload."
