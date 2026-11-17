# 2026-11-17 MOMENT: "Fourteen degrees on Sunday. A snowfall warning today."

Same-day moment (PLAYBOOK section 9). Trigger: an Environment and Climate Change Canada (ECCC) **snowfall warning issued for the City of Calgary today** (qualifier: "an ECCC warning issued for Calgary today"). Lead identity: Data Explainer (calgary-data-explainer), with motion direction from calgary-motion-director and production from calgary-insight-video-explainer.

## Detection (run at about 10:45 Alberta time (UTC-6), Nov 17, 2026)
- ECCC alerts API, re-checked 17:05 UTC (version used): City of Calgary snowfall warning `continued`, updated 2026-11-17T16:46:24Z (10:46 a.m. Alberta time, UTC-6): "Snow at times heavy continues over southwestern Alberta... General snowfall totals of 15 to 20 cm are expected, with Calgary on the lower end of this range... Snowfall will taper off Wednesday evening."
- First version: ECCC alerts API (City of Calgary, feature fea1-1961): `snowfall warning`, status `issued`, published 2026-11-17T10:47:59Z (4:47 in the morning, Alberta time, UTC-6), risk colour yellow, confidence High, impact Moderate. Text: "Snowfall, with total amounts of 15 to 25 cm is expected. Snow, at times heavy, will develop this morning over southwestern Alberta and spread northward through the day... Snowfall will taper off Wednesday evening... There may be a significant impact on rush hour traffic." The earlier special weather statement (5 to 15 cm) for the City of Calgary shows status `ended`.
- CYYC SWOB, today so far (to 16:00 UTC): temperature -2.0 to 0.8 °C, no precipitation, top 10-minute gust 27.7 km/h. Not a record, no chinook, no 80 km/h gust.
- City of Calgary traffic incidents today so far: 8 (365-day max 111, 99th percentile 62): not rare (yet).
- AQHI feed: not available (404). News search: nothing else rare and confirmed.
- Decision (python): snowfall warning issued for Calgary today → qualifies. Snow totals finish Wednesday evening, so the reel reports the warning (a forecast, labelled "expected") and the history, not totals.

## Hooks considered
1. "Fourteen degrees on Sunday. A snowfall warning today." (chosen: whiplash every Calgarian feels; number-led; true high 14.2 is not rounded up)
2. "No snow all November. Until now?"
3. "Winter tires on yet?"

## Narration (Kokoro af_heart; numbers in words; ~2.5 words/s; this is the wording approved in audit round 2; a shorter variant was rejected in round 3 and not used)
| # | Line |
|---|---|
| L0 | Fourteen degrees on Sunday. A snowfall warning today. |
| L1 | Environment Canada has put Calgary under a snowfall warning: fifteen to twenty centimetres expected, with Calgary at the lower end. |
| L2 | Sunday's high at the airport was fourteen point two. And through Monday, the airport had measured no snow at all this month. |
| L3 | We checked every November since nineteen twenty-six. Fifteen centimetres or more over two days happened in twenty-one of them. |
| L4 | About one November in five. The last time was twenty twenty-four. |
| L5 | Winter tires on yet? Yes or no? |

## On-screen text (by scene)
- S0 (hook, frame 0): "14.2°" counter slam with chip "SUNDAY · CALGARY AIRPORT"; kinetic "SNOWFALL WARNING" + "TODAY"; snow begins to fall over the 3D downtown. Source line: ECCC; map credit.
- S1 (warning): chip "SNOWFALL WARNING · CITY OF CALGARY · ISSUED NOV 17"; big "15–20 cm"; "EXPECTED"; chip "CALGARY: LOWER END"; "Tapering off Wednesday evening"; "Forecast, not a measurement"; a snow gauge whose band marks 15 to 20 cm. Source: "Environment and Climate Change Canada weather alert, Nov 17, 2026".
- S2 (before): calendar tiles Nov 1–16, each "0 cm" snow, Sunday Nov 15 tile highlighted with "14.2°"; line "SNOW MEASURED NOV 1–16: 0 cm". Footnote: "ECCC daily data, Calgary Intl A (provisional)".
- S3 (search): "EVERY NOVEMBER SINCE 1926", year counter 1926→2025, 100 dots fill.
- S4 (result): "21 of 100" counter with "ON RECORD"; 21 dots light up white; "≈ 1 in 5"; label on the 2024 dot "LAST: 2024". Title "15 cm+ OF SNOW IN 2 DAYS · NOVEMBER". Footnote: "Some days missing in 1993, 2012, 2017, 2019, 2020".
- S5 (closer): "Winter tires on yet? Yes or no?" + "Drop your thoughts below 👇" + calgaryinsight.ca. No end card (video under 2:00).
- Overlay: logo header from ~3 s; burned-in captions from the narration; follow pill not used (under 25 s target; if the final runs over 25 s, a 2 s follow pill appears at the midpoint).

## Production bible (motion director)
1. Visual direction: house navy/gold; snow white and ice blue (#9fd3ff) for snow; warm orange (#ff7a3d) only for the Sunday 14.2°. One look throughout.
2. Storyboard / techniques: S0 drone push over the real downtown (Calgary Tower landmark) + counter slam + weather particles (before/after flash: sunlit sky → snow); S1 evidence chip + gauge fill; S2 calendar grid; S3 dot-per-year scan with rolling year; S4 highlight reveal + counter; S5 closer. Techniques: drone camera, counter, weather overlay, dot-per-year grid, highlight reveal, evidence chip.
3. Visual hook: frame 0 already moving (drone push), "14.2°" slamming in at 0.0 s, "SNOWFALL WARNING" punching in by 0.6 s, snow starting at ~1.2 s. Thumbnail repeats this design.
4. AI video prompts (not run): S0 "aerial push toward Calgary downtown skyline at noon, low sun, then first snowflakes drift across frame, 5 s, no people"; S1 "close-up of snow piling against a measuring stake, 4 s"; S2-S4 graphics only.
5. Sound: pulse music bed under voice; impact on frame 0, whoosh at each cut, ticks under the year scan, pop on the 2024 dot, impact on the closer. Mixed by `sfx.py mix` to about -14 LUFS.
6. Edit timeline: scene lengths from `durs.json` via `M.script` (lead 0.3 s, gap 0.35 s, tail 1.6 s).
7. Figure-to-claim map: 14.2° → C1; "SNOWFALL WARNING", "15–20 cm", "CALGARY: LOWER END", "tapering off Wednesday evening" → C2; "0 cm Nov 1–16" → C3; "21 of 100", dots → C4; "≈ 1 in 5" → C6; "LAST: 2024" → C5.
8. QC table: stills at 0, 0.5, 1.0, 1.5 s, busiest scenes and closer; contact sheet after render; loudness check.

## Captions (no numbers)
Instagram / Facebook / YouTube text:
```
Sunday felt like fall. Today: a snowfall warning ❄️
Environment Canada expects snow, at times heavy, in Calgary until Wednesday evening, after a snow-free start to November at the airport.
Winter tires on yet? Yes or no? Drop your thoughts below 👇

🔗 Link in the first comment (Instagram: link in bio)
🔔 Follow @calgaryinsight for more Calgary stories
More Calgary stories, studies and analysis: calgaryinsight.ca

#Calgary #yyc #yycweather #CalgarySnow #Alberta
```
YouTube Short title: `14°C Sunday, snowfall warning today: Calgary #shorts`
First comment: `🔗 Every Calgary Insight video brief, with the data: https://calgaryinsight.ca/?view=videos&utm_source=<network>&utm_medium=social&utm_campaign=moment_snowfall_warning_nov17`

## Thumbnail concept
1080×1920 navy, centre 1080×1350: huge "14.2°" in orange with a snowflake slash, then "SNOWFALL WARNING" in white Fira Sans 900 and "TODAY" in gold; light snow particles; logo small top-left. Words: about 4.

## Method and limitations
- History: ECCC daily "Total Snow (cm)", Calgary airport: station 2205 (CALGARY INT'L A, climate ID 3031093) for 1926-2011 and station 50430 (CALGARY INTL A, climate ID 3031092) for 2012-2025 (station 2205 reports no November 2012 data). For each November we took the largest sum of two consecutive days' Total Snow (Nov 1-30, both days reported). A year counts if that sum is 15 cm or more. Result: 21 of 100 years (1926, 1927, 1929, 1930, 1937, 1938, 1945, 1947, 1959, 1965, 1966, 1976, 1980, 1992, 1994, 2001, 2013, 2014, 2018, 2019, 2024). Some days are missing (1993: 1 day, 2012: 8, 2017: 1, 2019: 4, 2020: 7), so the count is "on record". Evidence: `production/2026-11-17-MOMENT-snowfall-warning/two_day_snow_nov_1926_2025.json` and `eccc_november_daily_1926_2026.json`.
- The 15-20 cm figure (updated at 16:46 UTC from 15-25 cm; Calgary at the lower end) is ECCC's forecast (labelled "expected"), not a measurement. The warning's storm runs Tuesday into Wednesday, which is why the history uses two-day totals.
- Nov 2026 daily data are ECCC's current-month values (provisional).

## Claims table (section 3b)
| # | Claim as worded | Exact figure, unit, period, boundary | Label | Source URL | Where |
|---|---|---|---|---|---|
| C1 | "Fourteen degrees on Sunday" / "Sunday's high at the airport was fourteen point two" / on screen "14.2°", "SUNDAY · CALGARY AIRPORT" | Max Temp 14.2 °C, Sunday Nov 15, 2026, Calgary Intl A (station 50430, climate ID 3031092); spoken "fourteen" is a round-down of 14.2 | fact (provisional) | https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=50430&Year=2026&Month=11&Day=17&timeframe=2&submit=Download+Data | row 2026-11-15, "Max Temp (°C)" |
| C2 | "A snowfall warning today" / "Environment Canada has put Calgary under a snowfall warning: fifteen to twenty centimetres expected, with Calgary at the lower end" / on screen "SNOWFALL WARNING · CITY OF CALGARY · ISSUED NOV 17", "15–20 cm", "EXPECTED", "CALGARY: LOWER END", "Tapering off Wednesday evening" | ECCC snowfall warning, City of Calgary, first published 2026-11-17 10:47 UTC; updated ("continued") 2026-11-17 16:46 UTC: "General snowfall totals of 15 to 20 cm are expected, with Calgary on the lower end of this range"; "Snow at times heavy continues"; "Snowfall will taper off Wednesday evening" | fact (the amount is a forecast) | https://api.weather.gc.ca/collections/weather-alerts/items?f=json&bbox=-114.4,50.8,-113.8,51.25&limit=50 (also https://weather.gc.ca/en/location/index.html?coords=51.046,-114.057) | feature "City of Calgary", alert_name_en "snowfall warning", alert_text_en; saved copies: production/2026-11-17-MOMENT-snowfall-warning/eccc_alerts_calgary_2026-11-17.json (10:47 UTC version, 15 to 25 cm) and eccc_alerts_calgary_2026-11-17_recheck_1705Z.json (16:46 UTC update, 15 to 20 cm, Calgary lower end: the version used); also caption "snow, at times heavy… until Wednesday evening" |
| C1b | S2 tiles: daily highs Nov 1-16, 2026 (8.1, 12.1, 14.5, 9.3, 12.4, 14.4, —, 14.2, 10.4, 13.6, 13.3, 13.9, 12.1, 13.9, 14.2, 10.2 °C) | Max Temp Nov 1-16, 2026, station 50430; Nov 7 missing | fact (provisional) | same URL as C1 | rows 2026-11-01 to 2026-11-16, "Max Temp (°C)" |
| C3 | "through Monday, the airport had measured no snow at all this month" / on screen "SNOW MEASURED NOV 1–16: 0 cm" | Total Snow 0.0 cm on every day Nov 1-16, 2026, station 50430 | fact (provisional) | same URL as C1 | rows 2026-11-01 to 2026-11-16, "Total Snow (cm)"; also caption "snow-free start to November at the airport" |
| C4 | "We checked every November since nineteen twenty-six. Fifteen centimetres or more over two days happened in twenty-one of them." / on screen "21 of 100", "15 cm+ OF SNOW IN 2 DAYS · NOVEMBER", "EVERY NOVEMBER SINCE 1926" | 21 of the 100 Novembers 1926-2025 had a two-consecutive-day Total Snow sum ≥ 15 cm at the Calgary airport station (2205 for 1926-2011, 50430 for 2012-2025; 2205 has no November 2012 data) | fact (our count from official data) | https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=2205&Year=<1926-2011>&Month=11&Day=17&timeframe=2&submit=Download+Data and https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=50430&Year=<2012-2025>&Month=11&Day=17&timeframe=2&submit=Download+Data | November rows, "Total Snow (cm)"; computed in two_day_snow_nov_1926_2025.json; also S4 footnote "Some days missing in 1993, 2012, 2017, 2019, 2020" |
| C5 | "The last time was twenty twenty-four." / on screen "LAST: 2024" | Nov 22 + Nov 23, 2024 = 23.1 cm (Nov 23: 20.8 cm), station 50430; no qualifying November in 2025 | fact | https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=csv&stationID=50430&Year=2024&Month=11&Day=17&timeframe=2&submit=Download+Data | rows 2024-11-22, 2024-11-23 |
| C6 | "About one November in five." / on screen "≈ 1 in 5" | 21/100 = 0.21 | interpretation of C4 | as C4 | |
| C7 | Sunday = Nov 15, 2026; today = Tuesday Nov 17, 2026 | calendar | fact | — | — |
| Q | "Winter tires on yet? Yes or no?" | closing question, neutral | not a claim | — | — |
