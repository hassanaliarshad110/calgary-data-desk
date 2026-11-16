# Ep4 — GTA 6 Special #1: Rockstar India (16 Nov 2026)
- Wildcard/Paisa pillar; lenses Bharat ka aaina + Paisa kiski jeb mein. Title is a statement ("daave, sach aur paisa") because the 1,615-developer figure is unsourced and unconfirmed (truth gate; auditor round 1-3).
- No game footage, logos or characters: generic beach/city, controller and console props only; "SAANKETIK DRISHYA · GAME KA NAHI" tag on the beach scene.
- Voices: all hi-IN-SwaraNeural (N +12%/+3Hz, tester S +6%/+14Hz) and ur-IN-GulNeural for the gamer line (Urdu script). All 49 lines rendered first time.
- Score: score_mix.py (kit root copy is shared with shorts.py) — 112 bpm bed, 0.42 alone / ~0.21 under voice, riser into 'twist'. Measured kick/bass band under narration -24 dB vs -19 dB without voice.
- Shorts: rewritten kit-root shorts.py is self-contained (builds picture + audio from aud/, timeline.json, score_mix.py). shorts_cfg.json lists line ranges per Short; every scene has a native portrait DRAWV in scenes_v.js (no crop fallback used).
- Render: python3 render.py full 0 184 partA.tmp.mp4 & python3 render.py full 184 368.4 partB.tmp.mp4; concat; mux with mix.wav (loudnorm -14).
- Media: awazzz-media ep4/ (full.mp4, thumb.jpg, short1-4.mp4, cover1-4.jpg).
