# 2026-11-15 MOMENT: Thirteen warm days in the first half of November (tied record since 1926)

Same-day moment (scheduled watch, 16:41 check). Detected from official ECCC data: Nov 1–15, 2026 has 13 days with a high of 10 °C or warmer at Calgary airport, tied with 2016 for the most in any Nov 1–15 since 1926 (PLAYBOOK section 9: record for the period). Today's high so far 14.2 °C (preliminary, ECCC SWOB 22:00 UTC observation, mid-afternoon in Calgary); today alone ranks 9th among Nov 15ths (not top 5), so the story is the streak. Other checks: no ECCC alerts for Calgary; no gust ≥ 80 km/h; City traffic incidents today so far 9 (365-day max 110, 99th percentile 63) → not notable.
Skill: calgary-data-explainer (lead), directed with calgary-motion-director, produced with calgary-insight-video-explainer. Template: 2026-11-14-BONUS.

## Narration (Kokoro af_heart, studio-probe lane; measured)
| # | Line (as spoken) | s |
|---|---|---|
| 0 | Thirteen warm days. In the first half of November. | 2.987 |
| 1 | That's how many days this month reached ten degrees or warmer at Calgary's airport. Today too, at over fourteen so far. | 7.147 |
| 2 | So we counted the same fifteen days in every November since nineteen twenty-six. | 4.587 |
| 3 | Only one year matched it. Twenty sixteen. | 2.496 |
| 4 | No year had more. It ties the record, going back to nineteen twenty-six. | 4.309 |
| 5 | Ready for snow yet? Yes or no? | 2.048 |
Length 27.2 s, 1080x1920, -15 LUFS.

## On-screen text
- S0 hook (frame 0, drone over downtown): "13" counter slam, "WARM DAYS", "IN NOVEMBER?"; map credit.
- S1: "CALGARY AIRPORT · DAILY HIGHS"; 15 tiles Nov 1–15 with highs 8.1°, 12.1°, 14.5°, 9.3°, 12.4°, 14.4°, 13.7°*, 14.2°, 10.4°, 13.6°, 13.3°, 13.9°, 12.1°, 13.9°, 14+° (orange = 10 °C or warmer); counter "13 of 15 at 10°C+"; chip "NOV 15: 14+ °C SO FAR · PRELIMINARY"; footnote "*Nov 7: daily max missing; hourly readings reached 13.7°C"; sources.
- S2: "EVERY NOV 1–15 SINCE 1926"; year counter 1926 → 2025; 100 dots (one per year).
- S3: "ONLY 1 MATCHED"; the 2016 dot lights up.
- S4: "DAYS AT 10°C OR WARMER, NOV 1–15"; ranked bars THIS YEAR 13, 2016 13 (bracket "TIED 1ST"), 1954 11, 1962 11, 1981 11, 1999 11, 2001 11, 2004 11; stamp "TIED MOST SINCE 1926".
- S5: "Ready for snow yet? Yes or no?", "Drop your thoughts below 👇", "calgaryinsight.ca".
- Source lines: "Environment and Climate Change Canada · Calgary (airport record) daily highs, Nov 1–15, 1926–2025"; "Nov 2026: ECCC daily data; Nov 15 = station data through mid-afternoon (preliminary)"; "Environment and Climate Change Canada · stations 50430 / CYYC".

## Storyboard and direction
Visual hook: frame 0 already moving (drone push over downtown toward the Calgary Tower), "13" slams in at frame 0, kinetic "warm days / in November?" by 0.5 s. Techniques: counter slam, calendar tiles filling one by one, 100-dot year grid with a rolling year counter, ranked bars from zero with ties bracketed, stamp. Transitions whip, push, zoom, whip, push. Sound: pulse bed, impact on 13, ticks under the tiles and the year roll, pop on 2016, stamp on TIED MOST SINCE 1926 (cues.json). No end card (under 2:00). Header from 3 s; captions burned in. Source: production/2026-11-15-MOMENT-warm-days/scene.js.
AI prompts (not run): S0 "aerial drone over downtown Calgary on a bright, snowless mid-November afternoon, brown grass, low sun, slow push toward the Calgary Tower"; S1–S4 motion graphics only.

## Captions (no numbers)
Instagram / YouTube Short:
```
Has November felt more like September to you? ☀️
Calgary's airport has had warm day after warm day this month. Going back a century, only one other year kept pace.
Ready for snow yet? Yes or no? Drop your thoughts below 👇

🔗 Link in the first comment (Instagram: link in bio)
🔔 Follow @calgaryinsight for more Calgary stories
More Calgary stories, studies and analysis: calgaryinsight.ca

#Calgary #yyc #yycweather #Alberta #November
```
Facebook: the same. First comment: "☀️ The full figures and sources: https://calgaryinsight.ca/?view=videos&utm_source=<platform>&utm_medium=social&utm_campaign=warm-days-nov15"
YouTube title: "Calgary just tied the most warm days in early November since 1926 #shorts"

## Evidence files (production/2026-11-15-MOMENT-warm-days/)
- eccc_nov1-15_1926_2026.json: ECCC daily max temperature rows for Nov 1–15 of every year 1926–2026, from the ECCC bulk daily download (station 2205 CALGARY INT'L A, climate ID 3031093, 1926–2012; station 50430 CALGARY INTL A, climate ID 3031092, 2012–2026; for 2012 the non-empty value is used), each row with its download URL (https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=<id>&Year=<y>&Month=11&Day=15&timeframe=2&submit=Download+Data).
- count_by_year.json: per year, the number of Nov 1–15 days with a daily max ≥ 10.0 °C and any missing days.
- eccc_hourly_2026_11.csv: ECCC hourly data, station 50430, Nov 2026 (Nov 7 hourly peak 13.7 °C at 13:00 LST).
- cyyc_swob_2026-11-15.json: ECCC SWOB-ML observations for CYYC, UTC Nov 15 (https://dd.weather.gc.ca/today/observations/swob-ml/20261115/CYYC/); 22:00 UTC: max_air_temp_pst1hr 14.2, max_air_temp_pst24hrs 14.2.
- eccc_alerts_calgary_2026-11-15.json: api.weather.gc.ca weather-alerts for the Calgary bounding box: none.

## Claims table
| # | Claim as worded | Figure, unit, period, boundary | Label | Source | Where |
|---|---|---|---|---|---|
| C1 | "Thirteen warm days. In the first half of November." / "13 WARM DAYS", "13 of 15 at 10°C+" ; "That's how many days this month reached ten degrees or warmer at Calgary's airport." | Nov 1–15, 2026 at Calgary Int'l Airport: 13 days with max ≥ 10 °C (11 from ECCC daily max + Nov 7, whose daily max is missing but whose hourly readings reached 13.7 °C, + Nov 15 preliminary 14.2 °C). Only Nov 1 (8.1) and Nov 4 (9.3) were below 10. | fact (Nov 15 preliminary) | ECCC daily bulk 2026 station 50430; ECCC hourly Nov 2026; SWOB | 2026 rows Nov 1–14; hourly 2026-11-07 13:00 |
| C2 | Tiles: 8.1, 12.1, 14.5, 9.3, 12.4, 14.4, 13.7*, 14.2, 10.4, 13.6, 13.3, 13.9, 12.1, 13.9, 14+ | ECCC daily max Nov 1–14, 2026 (Nov 7 = hourly peak, footnoted), Nov 15 SWOB so far | fact | as C1 | — |
| C3 | "Today too, at over fourteen so far." / "NOV 15: 14+ °C SO FAR · PRELIMINARY" / source line "Nov 15 = station data through mid-afternoon (preliminary)" | Nov 15, 2026 CYYC max so far 14.2 °C (22:00 UTC obs, max past hour); re-checked before posting | fact (preliminary) | SWOB cyyc_swob_2026-11-15.json; https://weather.gc.ca/past_conditions/index_e.html?station=yyc | 2026-11-15-2200 |
| C4 | "So we counted the same fifteen days in every November since nineteen twenty-six. Only one year matched it. Twenty sixteen." / "ONLY 1 MATCHED", 2016 dot | Nov 1–15 days with max ≥ 10 °C, 1926–2025: 2016 = 13 (no missing days); every other year ≤ 11. Years with missing days (2012: 5 missing, 1 counted; 2017: 2 missing, 0; 2018: 1 missing, 4; 2023: 1 missing, 4) cannot reach 13. | fact (count) | eccc_nov1-15_1926_2026.json; count_by_year.json | all rows |
| C5 | "No year had more. It ties the record, going back to nineteen twenty-six." / bars 13, 13, 11 ×6, "TIED 1ST", "TIED MOST SINCE 1926" | 2026 = 13 = 2016; next 11 (1954, 1962, 1981, 1999, 2001, 2004). "The record" = the most in any Nov 1–15 in the 1926–2026 airport series (on-screen "since 1926") | interpretation (count from C1 + C4) | C1 + C4 | — |
| C6 | Caption "Going back a century, only one other year kept pace." / YouTube title "Calgary just tied the most warm days in early November since 1926" | 1926–2025 = 100 Novembers checked; only 2016 reached 13 (C4); 2026 ties it (C5) | fact (count) | C4, C5 | — |
| C7 | Caption "Calgary's airport has had warm day after warm day this month." | 13 of 15 days at 10 °C or warmer (C1) | fact | C1 | — |
| Q | "Ready for snow yet? Yes or no?" | question | — | — | — |

Note (audit round 1): before about 1938–39 the Calgary record was observed in town rather than at today's airport; source lines therefore say "Calgary (airport record)". Comparison covers 1926 onward only; nothing claims a record before 1926.
