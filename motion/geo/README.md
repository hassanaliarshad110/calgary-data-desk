# Calgary base geometry (calgary_base.json)

Used by the motion engine (`M.geo.*`). Local metres: x east, y north, origin downtown Calgary (51.0447, -114.0719).

| Layer | What | Source |
|---|---|---|
| boundary | City of Calgary limits | OpenStreetMap (ODbL) |
| rivers | named rivers, creeks, canals (centre lines): Bow, Elbow, Nose Creek, Fish Creek... | OpenStreetMap |
| water | lakes, reservoirs (incl. Glenmore Reservoir), river areas | OpenStreetMap |
| parks | named parks over 15 ha (Nose Hill, Fish Creek PP, Prince's Island...) | OpenStreetMap |
| roads | motorway, trunk and primary roads, grouped by name (Deerfoot, Crowchild, Glenmore, Stoney...) | OpenStreetMap |
| lrt, lrt_stations | CTrain lines and stations | OpenStreetMap |
| buildings_downtown | footprints and heights for downtown, Beltline, East Village, Eau Claire, Stampede Park (`src` says if the height is tagged, from levels x 3.6 m, or a default) | OpenStreetMap |
| landmarks | centre points of named landmarks (Calgary Tower, Saddledome, Peace Bridge, Fort Calgary...) | OpenStreetMap |
| wards | Ward Boundaries (dataset tz8z-hyaz) | City of Calgary Open Data |
| communities | Community District Boundaries (dataset surr-xmvs) | City of Calgary Open Data |

On-screen credit for any map scene: **Map data © OpenStreetMap contributors · City of Calgary Open Data**.

Built Nov 12, 2026 on the studio-probe lane (internet is only reachable from GitHub Actions). To rebuild: temporarily put `build/geo_probe.py` (then `build/geo_probe2.py`) in place of `probe/tts.py` on the studio-probe branch, push, read `geo/` on studio-probe-out, then restore the original `probe/tts.py` immediately (the narration lane depends on it). Ward and community boundaries change after redistributions; rebuild then.
