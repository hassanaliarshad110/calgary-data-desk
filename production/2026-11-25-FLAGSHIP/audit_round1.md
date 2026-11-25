# Fact audit, round 1: 2026-11-25 FLAGSHIP (Turner Valley 1914)

Auditor: independent (did not write the script). Date: 2026-11-25.
Method: every source URL S1-S9 opened with WebFetch (all loaded; direct curl is blocked by the proxy, so quotes are as returned by the fetch tool). The calgaryinsight.ca linked page was checked only against the site source (web/visit_content.py), as the input notes.

## Claims

| # | Verdict | Evidence found (source) | Note |
|---|---|---|---|
| C1 | PASS (interpretation) | S3: Dingman No. 1 "blew in with sweet, 'wet' gas ... wasn't the oil the investors and observers had hoped" and fed the speculation; S1: "struck wet gas ... the start of the province's first oil and gas boom" | S2 body text says the company "struck oil at 780 m", while its timeline says "strikes wet gas". S1, S3, S7 and the S2 timeline support the framing. |
| C2 | PASS | S1: "In 1911, William Stewart Herron, an Okotoks-area farmer, rancher, and cartage company operator, noticed gas seeps along the Sheep River" | |
| C3 | PASS | S2: Herron recruited Dingman and "some of Calgary's most influential businessmen" (July 1912); S1: Dingman "an experienced driller and businessman" | |
| C4 | PASS | S4: "began drilling in Turner Valley in 1913"; S1: "In January 1913, the company began drilling at a Sheep River site" | |
| C5 | PASS | S9: "the first strike in 1914 at Turner Valley, a few kilometres southwest of Calgary" | The video gives no distance, which is good: S9's "a few kilometres" understates it. |
| C6 | PASS | S1: "On May 14, 1914, the Dingman No. 1 well struck wet gas"; S3: on May 14, 1914 Dingman No. 1 blew in | |
| C7 | PASS | S2: people "drove from Calgary to gawk at the streams of gas" and "fill their cars with the unprocessed, light petroleum" | |
| C8 | PASS | S2: "More than 500 oil companies were started"; S6: "by summer there were 500 newly incorporated oil companies in Calgary" | S7 calls it "an estimated 500"; S3 says "reportedly". Fine as worded. |
| C9 | PASS | S7 ch. 5: "other brokers, overwhelmed by orders, locked the doors to their offices" (Calgary, days after the strike) | |
| C10 | PASS (narration) / FAIL (on-screen year) | S2: Herald quote "more than $400,000 were withdrawn from the savings account of Calgary banks" | S2 gives no date for this Herald report, so the on-screen "CALGARY HERALD · 1914" year is unsupported. The on-screen wording in the claims table ("...· Calgary Herald, 1914 (reported)") also differs from the on-screen text list ("$400,000+ withdrawn from savings at Calgary banks"). |
| C11 | PASS | S3: wet gas, "wasn't the oil the investors ... had hoped"; S7: "Dingman #1 produced a wet natural gas that contained naphtha"; S4: "principal product became naphtha"; S1: wet gas is "a mix of normally liquid hydrocarbons dissolved in natural gas" | S2's "wet natural gas ... high concentration of liquid naptha" describes Herron's seep sample, not the well. Cite S7 for the well. |
| C12 | PASS (narration) | S6: "In August 1914, war was declared and the boom was over." | S6 puts the war in sequence with a collapse that was already under way ("the Dingman well turned out to be a false spring"). S7 says the war "removed European capital" and calls the boom "a few delirious weeks in May 1914". L8 matches S6 word for word, so it passes. See C20 for the caption. |
| C13 | PASS | S2: "all but twenty-one of these companies had failed, most without even drilling a well"; S7: "Only fifty of these companies ever drilled for oil" | |
| C14 | PASS | S4: "In 1921, the company was acquired by Imperial Oil"; S2: Calgary Petroleum Products Company acquired by Imperial Oil in 1921 | |
| C15 | PASS (attributed) | S2: "it confirmed Calgary's position as the epicentre for Canada's oil and gas industry" | |
| C16 | PASS | S5 timeline: "Royalite No. 4 erupts in fire."; caption: "Burning Gas at Royalite No. 4, Hell's Half Acre, Turner Valley, Alberta, 1924." | The timeline entry has no year; the 1924 comes from the caption. |
| C17 | PASS | S5: "With little demand for its natural gas, Turner Valley flared approximately 90% of its supply" | S5 gives no period for this figure, and the narration gives none either. "about" / "approx." are kept. |
| C18 | PASS | S2 caption: "Oil well Royalties No. 1 as a gusher after striking oil on June 16, 1936"; timeline: discovery "sets off another oil boom for the region" | |
| C19 | PASS | S8: "Calgary is home to head offices of almost every major company throughout the energy-value chain." | This is a promotional agency's own statement. See advisory A1. |
| C20 | FAIL | S6 only puts the war in sequence: "In August 1914, war was declared and the boom was over." No source says the war ended the boom; S6 and S7 describe it fading first. | Caption "the war soon ended the boom" states cause. The rest of C20 passes (S2, S3). |
| C21 | PASS | as C6 (S1, S3) | |
| C22 | PASS (interpretation) | S2 (frenzy: cars, 500+ companies, Herald withdrawals); S4/S5/S2 (Royalite 1920s, flaring, 1936 boom) | |
| C23 | PASS (labelled illustration) | S1: "It sprayed out with great force." | |
| C24 (added) Instagram caption "Plan a day trip southwest of the city" | FAIL / not in claims table | Site source: Kananaskis "South-west of Calgary"; Banff and Canmore are given as west ("Lake Louise ... Kananaskis Country, to the south-west, is closer") | The linked page is mostly west (Banff, Canmore), not southwest. This line also differs from the YouTube, Facebook and first-comment wording ("into the foothills and mountains"). |
| Q | n/a (question) | | A recall yes/no question. It is not leading, partisan or one-sided. |

## Flags (blocking)

1. **Captions contain a number.** The YouTube caption link (and the FB/IG first comment) uses `utm_campaign=turner-valley-1914`. Fix: `utm_campaign=turner-valley-origins` (or any tag with no digits) in all three places.
2. **Caption states the war as the cause (C20).** "and the war soon ended the boom" is not supported. Fix: "...not the oil investors hoped for, and by the time war broke out that August, the boom was over." Or, without a time word: "...and when war broke out, the boom was over."
3. **On-screen year not in the source (C10).** "CALGARY HERALD · 1914": S2 gives no date for the $400,000 report. Fix: change the card to "CALGARY HERALD" plus chip "AS REPORTED" with no year (or cite a source that dates that report). Also make the claims table's on-screen wording for C10 match the on-screen text list.
4. **Instagram CTA (C24).** "Plan a day trip southwest of the city" is a factual line missing from the claims table, and it is inaccurate for the linked page. Fix: use the same line as the other platforms: "🔗 Plan a day trip into the foothills and mountains: link in bio".
5. **Short cut has broken references.** The Short drops L2, so L3's "their well" has nothing to refer to, and L10's "Dingman's company" names a person the Short never introduces (it only names the well). Fix: in the Short, use the audited T1 wording for L3: "On May fourteenth, nineteen-fourteen, a well in Turner Valley, Dingman Number One, blew in." For L10, write "the company behind the well" or drop L10. Also, the Short is 189 words, about 76 s at 2.5 words/s, which is over the 75 s cap, so dropping L10 solves both problems.
6. **Inconsistent figure.** The dot grid says "~500 COMPANIES", but the narration, the counter and the sources say more than 500. Fix: "500+ COMPANIES".

## Advisory (non-blocking, recommended)

- A1: L14 speaks Calgary Economic Development's promotional claim without attribution (the on-screen source line names CED). Consider: "According to Calgary Economic Development, Calgary is home to head offices of almost every major company in the energy business."
- A2: L8 matches S6, but S6 and S7 suggest the boom was already fading before August. "and the boom was over" is acceptable as written. Don't strengthen it to cause anywhere.
- A3: The widescreen narration is 284 words, about 1:54 at 2.5 words/s, which is close to the 2:00 limit. If the render reaches 2:00 or more, the end-card and spoken-follow rules change. Check the measured length.
- A4: Hook: L0 is spoken, hook words are on screen at frame 0, and the scene 1 derrick/flare is tagged "illustration" (C23). The storyboard text does not say the camera move ("push-in") explicitly. Add it so the render matches.

## Checks passed

- Opening hook present (L0), and L7 pays it off.
- Closing question present and neutral. Comment prompt "Drop your thoughts below" is in the narration (C), the closing frame and the caption.
- Follow prompt is a mid-video pill plus a caption line. calgaryinsight.ca is on the closing frame and in the caption. No end card or spoken follow line, which is correct for a video under 2:00.
- Numbers in words match the on-screen figures: 1911, 1913, May 14 1914, 500+, $400,000+, 21, 1921, 1924, No. 4, ~90%, 1936, No. 1.
- Estimates keep their hedges ("more than", "about"). Nothing partisan. No person named Hassan. No non-metric units.
- The base caption contains no numbers. The only digits in captions are in the UTM tag (flag 1).

VERDICT: NOT APPROVED. Fixes needed: (1) remove digits from utm_campaign in the YouTube caption and the FB/IG first comment; (2) reword the caption "the war soon ended the boom" to sequence wording; (3) remove "1914" from the "CALGARY HERALD" card (or source the date) and align the C10 wording in the claims table; (4) replace the Instagram "southwest of the city" line with the "into the foothills and mountains" wording; (5) fix the Short's L3 "their well" (use the T1 wording) and drop or reword L10, which also brings the Short under 75 s; (6) change "~500 COMPANIES" to "500+ COMPANIES".
