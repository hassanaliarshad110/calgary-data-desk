# Fact audit v2: "Take the stage" + "Play together" (added Nov 15, 2026)

Auditors: two independent general-purpose agents that had not seen the drafting; each got only claims_v2.md, the earlier claims.md and the read-only game repo (yyc-story commit 4c69164).

## Round 1: CHANGES NEEDED
- Claims 33-43, all new labels and both post lines: PASS.
- Claim 44 / teaser q0 FAIL: "explore the city with dozens of other Calgarians" reads as a promise of how many people are online; the code only sets a capacity (worker.js:4 MAX = 40).
- Fixed: q0 -> "Take the stage at Stampede Park. Or go online, and explore the city together with other Calgarians."; post line -> "room for dozens of players at once".

## Round 2: APPROVED
- Claims 33-44, s0, n0-n4, q0, every new label and both post lines: PASS (file:line evidence re-checked).
- Notes adopted: not-affiliated-with-the-Calgary-Stampede chip on every stage shot (the in-game stage sign reads "CALGARY STAMPEDE"); film the stage clip with the song playing so the lyrics show.
- Player limit used: worker.js:4 MAX = 40 per room, one room "calgary" (mp.js:19) -> the video says "dozens ... up to forty players at once"; "hundreds" would be false.
