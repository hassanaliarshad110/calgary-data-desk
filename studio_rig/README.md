# Susuman on the studio skeleton

Qasim, Susuman (power form) and Ammi now also exist on the shared studio rig (branch `animation-studio`, `engine/chars.js`):
`CAST.qasim`, `CAST.susuman`, `CAST.ammi`. They use the same 3D-projected skeleton as every studio character, so they get:

- any view angle (front, 3/4, side, back) and smooth turning
- all 31 motions: walk, run, jump, sit, stand, turn, talk, listen, laugh, cry, shout, punch, kick, fall, dance, celebrate, wave, point, shrug, facepalm, thumbsUp, clap, think, scared, holdHead, fightStance, present, **holdPhone** (Ammi), **powerPose**, **fly**
- 16 expressions, 10 lip-sync mouth shapes driven by the voice (`render/lipsync.py` → `visemeAt`)
- power form extras: gold aura, waving red cape (in front of the body in back view), floating glowing crown, bigger emblem; `drawChar(CAST.susuman, pose, x, gy, s, { t, power: 0..1 })` fades them in

```js
drawChar(CAST.qasim, MOVES.walk(t), x, groundY, 2.0, { t });
const p = MOVES.talk(t, { expr: 'happy' }); p.face.mouth = visemeAt(LIPS.tracks.q1, t); drawChar(CAST.qasim, p, 420, 1500, 2.0, { t });
drawChar(CAST.susuman, MOVES.powerPose(t), 420, 1500, 2.0, { t, power: clamp(t / 0.8) });
drawChar(CAST.ammi, MOVES.holdPhone(t, { lookUp: true, expr: 'surprised' }), 760, 1500, 1.6, { t });
```
`rig.js` here (the original SVG rig) is unchanged and still works for existing episodes. Studio cartoon characters (Chacha, Zoya, Rafi, Nani, Jamal…) can be used as reference or as side characters — they are drawn in the same style family.
Preview: `tools/susuman_sheet.html` (modelSheet(), turnarounds(), scene `susu_motion`).
