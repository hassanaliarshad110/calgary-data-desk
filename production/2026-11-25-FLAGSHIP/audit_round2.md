# Audit round 2: 2026-11-25 FLAGSHIP (Turner Valley 1914)

Independent audit. I opened all nine sources (S1-S9) with WebFetch and all loaded. I did not read audit_round1.md. Linked page (C24) checked in /home/claude/calgary-data-desk/web/visit_content.py.

## Claims

| # | Verdict | Evidence (what the source actually says) |
|---|---|---|
| C1 | PASS (with a fix to the evidence note, see F4) | S1: "Alberta's first productive well had been opened, and the province's first oil and gas boom was on." S3: "Dingman No. 1 blew in with sweet, 'wet' gas" / "it wasn't the oil the investors and observers had hoped they would find". This is a labelled interpretation, and S1 supports it. |
| C2 | PASS | S1: "In 1911, William Stewart Herron, an Okotoks area farmer, rancher and cartage company operator, noticed gas seeps along the Sheep River..." |
| C3 | PASS | S1: Herron let "Archibald Dingman, an experienced driller and well-connected businessman ... acquire a majority share". S2: they "started the Calgary Petroleum Products Company in July 1912" with "some of Calgary's most influential businessmen". |
| C4 | PASS | S1: "In January 1913, with a cable tool drilling rig acquired by Dingman in California..." S4: "began drilling in Turner Valley in 1913". |
| C5 | PASS | S9: "the first strike in 1914 at Turner Valley, a few kilometres southwest of Calgary". The narration says only "southwest of the city". It gives no distance, which is right, because S9's "a few kilometres" understates it. |
| C6 | PASS | S3: "Finally, on May 14, 1914, Dingman No. 1 blew in with sweet, 'wet' gas". S1: "On May 14, 1914, the well known as Dingman No. 1 brought forth a supply of wet gas." |
| C7 | PASS | S2: people drove from Calgary "to gawk at the streams of gas coming from the well and to fill their cars with the unprocessed, light petroleum". |
| C8 | PASS | S2: "More than 500 oil companies were started, most of them ill-founded, over-valued and unsustainable." S3 and S6 agree ("more than 500"; "500 newly incorporated oil companies in Calgary" by summer 1914). |
| C9 | PASS | S7, ch. 5 (Calgary, 1914): "Stock vendors sold shares on the street stands while other brokers, overwhelmed by orders, locked the doors to their offices." |
| C10 | PASS | S2: "The Calgary Herald wrote that ... more than $400,000 were withdrawn from the savings account of Calgary banks". The attribution and the "more than" match the source. |
| C11 | PASS | S3: "it wasn't the oil the investors and observers had hoped they would find". S7: "Dingman #1 produced a wet natural gas that contained naphtha". S4: "principal product became naphtha". S2 calls it "light petroleum". |
| C12 | PASS | S6: "In August 1914, war was declared and the boom was over." |
| C13 | PASS | S2: "all but twenty-one of these companies had failed" by the end of the First World War, "most without even drilling a well". |
| C14 | PASS | S4: "In 1921, the company was acquired by Imperial Oil." S1/S2: the company was Calgary Petroleum Products, with Dingman as managing director. |
| C15 | PASS | S2 (Alberta's Energy Heritage): Imperial's takeover "confirmed Calgary's position as the epicentre for Canada's oil and gas industry". The attribution is correct. |
| C16 | PASS | S5 timeline (1924): "Royalite No. 4 erupts in fire." Photo caption: "Burning Gas at Royalite No. 4, Hell's Half Acre, Turner Valley, Alberta, 1924". |
| C17 | PASS | S5: "With little demand for its natural gas, Turner Valley flared approximately 90% of its supply". The estimate is hedged ("about", "~", "approx."). |
| C18 | PASS | S2 caption: "Oil well Royalties No. 1 as a gusher after striking oil on June 16, 1936." S2 timeline: "sets off another oil boom for the region". |
| C19 | PASS | S8: "Calgary is home to head offices of almost every major company throughout the energy-value chain." The attribution is correct. |
| C20 | **FAIL** | S6: "In August 1914, war was declared and the boom was over." The caption says "by the time war broke out that August, the boom was over". That means the boom had already ended before the war began, which no source says, and C20 itself says it follows "order of events only, as S6". **Fix:** "...and when war broke out that August, the boom was over." |
| C21 | PASS | Same as C6 (S1, S3). The other teaser sentences repeat C8 and C11 word for word, and both pass. |
| C22 | PASS | "Calgary went wild": S2 (crowds, cars), S7 ("People are literally standing in the streets and throwing their money into the brokers' offices"). "Turner Valley kept going": S5 and S2 (1924, 1936). |
| C23 | PASS | Labelled "illustration". S1: wet gas "sprayed from the well with great force". |
| C24 | PASS (call to action, not a factual claim) | visit_content.py, slug `mountains`: "Banff, Canmore, Kananaskis"; "Kananaskis Country", "South-west of Calgary, via Highway 40". See F5. |
| Q | PASS (question, not a fact) | Neutral yes/no question. It is not leading or partisan. |

## Checks with no problem found
- **Numbers in words vs figures:** all match: 1911, 1913, May 14 1914, 500+, $400,000+, 21, 1921, 1924, ~90%, 1936, No. 1 / No. 4 / No. 1.
- **Hook pays off:** the "gas well" hook is answered by L7 in the widescreen, the Short and the teaser.
- **Closing question and CTA:**
  - Closing question is present and neutral.
  - The spoken and on-screen comment prompt "Drop your thoughts below" is present.
  - The follow prompt appears as a mid-video pill and as a caption line on IG, FB and YT.
  - calgaryinsight.ca is on the closing screen.
  - There is no end card and no spoken follow line, which is correct under the 2:00 house rule.
- **Attributions:** "The Calgary Herald reported", "Alberta's energy history archive says" and "According to Calgary Economic Development" are all attributed the way the sources attribute them.
- **Cause and fairness:**
  - L8 follows S6's own wording; the caption does not (C20).
  - Nothing is partisan or unfair.
  - No estimate is stated as a hard fact.
- **Base caption, hashtags and UTM URLs:** no digits.
- **Hassan:** no mention.
- **Non-metric units:** none. "Hell's Half Acre" is a proper place name, not a measurement.
- **Short cut** (L0, L3, L4, L5, L7, L8, L9, L13, L14, Q, C):
  - 171 words, about 68 s at 2.5 words/s, which is inside 60-75 s.
  - It reads coherently on its own. "Dingman Number One" works as a well name without introducing Dingman. "those companies" refers back to L5. "Then in nineteen thirty-six" is a clear time jump.
- **Teaser:** 50 words, about 20 s, plus a ~2 s card, so about 22 s. That is inside 20-30 s.
- **YouTube chapter times:** they agree with the word-count timing: L7 47 s, L8 56 s, L10 69 s, L11 80 s, L13 94 s.

## Flags
- **F1 (widescreen length):**
  - All lines total 292 words, which is about 117 s (1:57) at 2.5 words/s.
  - That is over the 1:45-1:55 target and leaves only about 3 s under 2:00 before any scene pauses or the hook hold.
  - **Fix:** measure the render. If it runs over 1:55, trim, for example by cutting "With little demand for the gas," from L12 (6 words, about 2.4 s). If you cut it, also delete "With little demand" from the C17 wording, and leave the S5 quote as it is.
- **F2 (visual hook not documented):**
  - The input gives frame-0 hook words and a derrick plume (C23 lists scenes 1, 4 and 12 as "gas plume / flare").
  - It never says that frame 0 is a fast push-in on a derrick with a venting (unlit) gas plume.
  - **Fix:** add to the scene-1 spec: "frame 0: hook words over a fast push-in on a wooden derrick venting a gas plume (tag 'illustration')". Then confirm it in the render.
- **F3 (numbers in the YouTube post caption):**
  - The widescreen YouTube description is the caption plus chapters. The chapters "00:00 ... 01:33" are digits, which breaks the house rule that post captions contain no numbers.
  - **Fix:** either remove the chapters from the description, or record a written exception in the house rules for YouTube chapter timestamps.
- **F4 (C1 evidence note):**
  - The claims table quotes S3 as "...it did feed the oil speculation" with an ellipsis. S3's full words are "it did feed the oil speculation **that had already erupted**". In other words, S3 says the speculation was already under way before the well blew in, which cuts against "started with".
  - **Fix:** in the C1 row, put S1 first as the evidence ("Alberta's first productive well had been opened, and the province's first oil and gas boom was on"). Quote S3 in full or drop it. The narration needs no change.
- **F5 (CTA promise, advisory):**
  - The caption CTA says "Plan a day trip into the foothills and mountains". The linked page (slug `mountains`) covers Banff, Canmore and Kananaskis, and has no foothills or Turner Valley content.
  - **Fix:** use "Plan a day trip into the mountains" on IG, YT and the FB/IG first comment.

VERDICT: NOT APPROVED

Exact fixes:
1. Caption (C20): replace "by the time war broke out that August, the boom was over" with "when war broke out that August, the boom was over".
2. Widescreen: confirm a measured runtime of 1:55 or less. Otherwise cut "With little demand for the gas," from L12 (and from the C17 wording).
3. Scene 1 spec: state the frame-0 fast push-in on a derrick venting a gas plume, with the hook words over it.
4. YouTube widescreen description: remove the chapter timestamps, or document a house-rule exception for them.
5. Claims table C1: use the S1 quote as the evidence, and quote S3 without the misleading ellipsis.
6. (Advisory) CTA: "foothills and mountains" becomes "mountains".
