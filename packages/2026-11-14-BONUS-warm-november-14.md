# 2026-11-14 BONUS fun fact: Fourteen degrees in mid-November

Requested by Hassan on Nov 14, 2026 (outside the calendar): a fun fact on today's warmth against every November 14 in the last hundred years, posted right away, with Calgary Insight's chat giving the same answer.
Skill: calgary-data-explainer (lead identity: Data Explainer), directed with calgary-motion-director, produced with calgary-insight-video-explainer.

## Narration (v3 after audit round 1; Kokoro af_heart, studio-probe lane; measured line lengths)
| # | Line (as spoken) | s |
|---|---|---|
| 0 | Almost fourteen degrees. In the middle of November. | 2.859 |
| 1 | That's what Calgary's airport hit today. The usual high for this date is under five. | 4.843 |
| 2 | So we checked every November fourteenth for the last hundred years. | 3.520 |
| 3 | Only four were warmer than today. | 1.771 |
| 4 | Nineteen seventy-nine still holds the record, at eighteen point seven. | 4.117 |
| 5 | That puts today in the top five of the last century. | 2.645 |
| 6 | Did you get outside and enjoy it? Yes or no? | 2.539 |

## On-screen text
- S0 hook: "13.9°C" (shown from frame 0), "IN NOVEMBER?", thermometer; map credit.
- S1: "NOVEMBER 14 · CALGARY AIRPORT"; bars "Today 13.9°C" and "Usual high* 4.6°C"; "*mean of the 30 Nov 14 highs, 1991–2020"; chip "TODAY: PRELIMINARY".
- S2: "EVERY NOVEMBER 14"; year counter 1926 → 2025; 100 dots.
- S3: "ONLY 4 WERE WARMER"; dots for 1936, 1953, 1975, 1979 light up with their years.
- S4: ranked bars 1979 18.7°, 1936 16.7°, 1953 16.1°, 1975 15.0°, then TODAY 13.9°, 1940 13.9° and 1949 13.9° joined by a bracket "TIED 5TH"; dashed line "TODAY 13.9°C"; RECORD stamp on 1979.
- S5: "TOP 5", "NOV 14ths SINCE 1926", the same bars with the "TIED 5TH" bracket, today glowing.
- S6: "Did you get outside and enjoy it? Yes or no?", "Drop your thoughts below 👇", "calgaryinsight.ca".
- Source lines: "Environment and Climate Change Canada · Calgary airport daily records, Nov 14, 1926–2025" and "Today: Environment Canada station data, Calgary airport, highest to 4 p.m., Nov 14, 2026 (preliminary)".

## Storyboard and direction (summary)
Lead Data Explainer; borrowed Storyteller drone over the real downtown (S0) and a Civic record stamp (S4). Techniques: counter slam, map dive to the airport station, bars from zero, 100-dot year grid (one dot = one year), ranked bars with a reference line, stamp. Transitions: whip, push, zoom, whip, push, flash. Sound: pulse bed; impact on 14°C, ticks on counters, whooshes on cuts, pops on the four dots, stamp on RECORD (cues.json). No end card (under 2:00). Header from 3 s. Captions burned in. Scene code: production/2026-11-14-BONUS/scene.js.
AI prompts (optional paid version, not run): S0 "aerial drone over downtown Calgary skyline and Bow River on a bright, clear November afternoon, low sun, dry brown grass, no snow, slow push toward the Calgary Tower"; S1 "top-down map zoom onto Calgary International Airport, northeast Calgary"; S2-S5 motion graphics only.

## Captions (v4, no numbers)
Instagram / YouTube Short:
```
How warm was today for mid-November? ☀️
Calgary's airport just had one of its warmest days for this date in a century. Only a handful of years beat it.
Did you get outside and enjoy it? Yes or no? Drop your thoughts below 👇

🔔 Follow @calgaryinsight for more Calgary stories
More Calgary stories, studies and analysis: calgaryinsight.ca

#Calgary #yyc #yycweather #Alberta
```
Facebook: the same, with "🔗 Link in the first comment" above the calgaryinsight.ca line; first comment: "☀️ The full figures and sources: https://calgaryinsight.ca/?view=videos&utm_source=facebook&utm_medium=social&utm_campaign=warm-mid-november"
YouTube title: "How rare is a day this warm in mid-November in Calgary? #shorts"

## Evidence files (saved in production/2026-11-14-BONUS/)
- eccc_nov14_1926_2025.json: Environment and Climate Change Canada daily rows for November 14 of every year 1926–2025, pulled from the ECCC bulk daily download (station 2205 CALGARY INT'L A, climate ID 3031093, to 2012; station 50430 CALGARY INTL A, climate ID 3031092, from 2012), each row with its download URL. 100 years, no gaps.
- cyyc_swob_2026-11-14.json: ECCC surface observations (SWOB-ML, dd.weather.gc.ca) for CYYC on Nov 14, 2026, hourly, with max_air_temp_pst1hr and max_air_temp_pst24hrs (file times are UTC; Calgary = UTC-6).

## Claims table (v4)
| # | Claim as worded | Figure, unit, period, boundary | Label | Source | Where |
|---|---|---|---|---|---|
| C1 | "Almost fourteen degrees… That's what Calgary's airport hit today." / "13.9°C", "Today 13.9°C", "TODAY: PRELIMINARY" | Highest temperature so far on Nov 14, 2026 at Calgary Int'l Airport (CYYC): 13.9 °C (max past hour in the 22:00 UTC = 4 p.m. observation; past-24-hour max 13.9) — re-checked against the latest observation before posting | fact (preliminary) | ECCC SWOB, cyyc_swob_2026-11-14.json; https://weather.gc.ca/past_conditions/index_e.html?station=yyc | 2026-11-14-2200 entry |
| C2 | "The usual high for this date is under five." / "Usual high* 4.6°C", "*mean of the 30 Nov 14 highs, 1991–2020" | Mean of the 30 ECCC Nov 14 daily highs 1991–2020 = 4.57 °C | fact (arithmetic) | eccc_nov14_1926_2025.json (cross-check: extremeweatherwatch year table gives the same 30 values; its normal box says 4.1) | rows 1991–2020 |
| C3 | "We checked every November fourteenth for the last hundred years. Only four were warmer than today." / "ONLY 4 WERE WARMER", dots 1936, 1953, 1975, 1979 | ECCC Nov 14 highs 1926–2025 (100 years): above 13.9 °C only 1979 18.7, 1936 16.7, 1953 16.1, 1975 15.0; 1940 and 1949 exactly 13.9; 2024 8.1; 2025 2.8 | fact | eccc_nov14_1926_2025.json; cross-check https://www.extremeweatherwatch.com/cities/calgary/day/november-14 (1926–2023) | all rows |
| C4 | "Nineteen seventy-nine still holds the record, at eighteen point seven." / RECORD on 1979 | 18.7 °C, Nov 14, 1979, the highest Nov 14 high on record (1881 onward) | historical record | extremeweatherwatch all-time records box; ECCC row 1979 | — |
| C5 | "That puts today in the top five of the last century." / "TOP 5", "NOV 14ths SINCE 1926", "TIED 5TH" | Today 13.9 = 1940 = 1949; four higher; so tied 5th among Nov 14ths since 1926 | interpretation (arithmetic from C1 + C3) | C1 + C3 | — |
| Q | "Did you get outside and enjoy it? Yes or no?" | question | — | — | — |
