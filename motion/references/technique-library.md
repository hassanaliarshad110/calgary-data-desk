# Technique library: what each technique explains, and how to build it free

Pick by what the beat must explain. Each row says whether the free engine does it fully (✓), as a stylised approximation (≈), or only in a paid AI version (AI).

| Technique | Explains | Free engine | Engine recipe |
|---|---|---|---|
| 3D city environment | where something is in the real city; scale; density | ✓ (real downtown footprints and heights) | `w = M.world({sky}); M.geo.addBase(w, {buildings:true, windows:'#fff'})` |
| Aerial drone simulation | arriving at a place; the shape of a neighbourhood; following a river or road | ✓ | `M.moves.fly([posA,posB,posC], [lookA,lookB,lookC], p)` + `M.drift(t, 4)` added to pos for life |
| 3D geographic map | location, distance, spread, boundaries | ✓ (boundary, rivers, roads, LRT, wards, communities) | `M.moves.dive(target, p)` from 30 km plan view to an oblique; `highlightWard` / `highlightCommunity` |
| Infrastructure cutaway | what is under the street; how a system works | ≈ (layered soil, pipes as shaded tubes, lid lifts) | `M.cutaway(w, rect, p, {layers})` + `w.tube(points3d, radius, {color})` |
| Exploded view | the parts of a facility, bridge or machine and how they fit | ≈ (boxes move apart with labels) | `M.explode(w, parts, p)` |
| Moving vehicles and traffic | congestion, commuting, a route's use | ✓ (two-way, seeded, headlights at night) | `M.traffic(w, roadPolylines, t, {spacing, speed, night})` |
| Animated financial figures | how much; change over time | ✓ | `M.counter(c, value, p, x, y, {prefix:'$', suffix:' M', slam:true})`, `M.bars`, `M.lineChart` |
| Dynamic charts and graphs | comparison, trend, share | ✓ | bars start at zero; dashed lines for projections; the source line on screen |
| Historical timeline transformation | when; how the city changed | ✓ / ≈ | `M.timeline` scrubbing, plus the 3D city with `buildingsGrow: b => …` to grow the skyline by year (only with dated data; otherwise use archival photos) |
| Before-and-after comparison | what changed | ✓ | `M.beforeAfter(c, p, drawBefore, drawAfter, W, H, {labels:['1912','Today']})` |
| Weather and environment | season, flood, chinook, fire, smoke | ≈ | `M.weather(c, 'snow'|'rain'|'fog'|'chinook'|'embers'|'dust', t, W, H)`; sky presets dusk/night/winter/overcast |
| Parallax and depth | bring an archival photo or illustration to life | ✓ | `M.parallax` with 2-4 cut-out layers, or `M.photo` + foreground particles + a moving light; never a bare zoom |
| Cinematic camera | emotion, scale, reveal | ✓ | orbit reveal (`M.moves.orbit`), crane-up (raise z while look stays), dolly (`M.moves.dolly`), rack focus by blurring a buffer (`ctx.filter='blur(6px)'`) |
| Photoreal footage of places | realism | AI only, with Hassan's go-ahead | path B: prompts from `ai-prompt-guide.md` |

## Recipes worth knowing

**Hook in two seconds (all identities).** Start the camera already moving at frame 0 (a dive, a push or an orbit at full speed), the hook words punching in from 0.05 s (`M.kinetic(..., {t0: .05})`), the impact sound at 0.0. Thumbnail = this frame at about 0.8 s.

**River as a story thread (Storyteller).** `M.geo.river('Bow River')` lines drawn with `{p: progress, glow: 4, color: gold}` while the drone follows the same polyline (`M.moves.fly` with points sampled from it, 300-600 m altitude, looking 800 m ahead).

**Map dive to a community (Explainer).** Plan view of the whole city (h0 ≈ 32 km) with the community highlighted gold, dive to 1.5 km oblique in 1.6-2.2 s (`outCubic`), pin drops at landing, the number slams in 0.2 s later.

**Status of a project (Civic).** Oblique 3D map of the site; four chips in a row, the reached stage lit, later stages outlined; never show a stage the evidence hasn't reached.

**Underground (Civic / Storyteller).** Street-level camera, lid lifts over 1.2 s, camera cranes down 6-10 m, pipes as tubes with labelled age or material from the claims table, soil layers from a source or labelled "illustration".

**Year-by-year growth (Storyteller).** Only with dated building or boundary data. Otherwise: an archival photo pair as a before/after wipe, credited.

## Performance notes
- The downtown pack has a few thousand buildings: a full-frame 1080×1920 3D scene renders in roughly 50-200 ms per frame. Use `--workers 2` for long films.
- Turn off what the shot doesn't show (`addBase(w, {roads:false, parks:false})`) to keep frames fast and readable.
- Fog hides the far city and gives depth; tune `M.world({fog:{near, far}})` to the camera height (near ≈ 2× altitude).
- Keep everything deterministic: `M.rng(seed)`, never `Math.random()`.
