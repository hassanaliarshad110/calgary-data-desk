/* CIVIC ANALYST example: "Calgary news explained", 25-45 s vertical. Evidence-led, neutral, calm.
 * Shape: what happened (document) -> where (ward/site map) -> how it works (cutaway) -> what's next (stages) -> question.
 * Change only the EDIT blocks. Quotes on the document card stay under 15 words and are exact.
 */
const W = 1080, H = 1920, CX = (W - 120) / 2 + 30;

// EDIT 1: audited narration with measured durations
const S = M.script([
  { text: 'City council has a decision to make about a water main.', dur: 3.4 },
  { text: 'Here is what the report actually says.', dur: 2.4 },
  { text: 'The work would happen under this part of the city.', dur: 2.9 },
  { text: 'Below the street, the main sits beneath layers of soil and gravel.', dur: 3.8 },
  { text: 'It has been announced. Funding is the next step.', dur: 3.1 },
  { text: 'Fair use of money, or should it wait? Drop your thoughts below.', dur: 3.6 },
], { lead: .3, gap: .4, tail: 1.6 });
const sc = S.scenes;

// EDIT 2: evidence from the claims table (example placeholders; replace every value)
const DOC = { title: 'Report to Infrastructure and Planning Committee (example)', quote: 'example quote of the exact wording, under fifteen words', source: 'Source: example only, replace with the audited report and date' };
const SITE = M.geo.lm('Calgary Municipal Building') || [600, 150, 0];
const WARD = M.geo.within('wards', SITE);   // the ward the site is in, from the City's boundaries (never pick a ward by hand)
const STAGE = 0;                     // 0 announced, 1 funding approved, 2 under construction, 3 completed (from the evidence)

window.FILM = M.film({ W, H, identity: 'civic', scenes: [
  // 0 HOOK: frame 0 is the real map already moving; the question punches in
  { dur: sc[0].sceneDur, trans: { kind: 'wipe', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'blueprint', fog: false }); M.geo.addBase(w, { buildings: false, wards: true, highlightWard: WARD, hiColor: '#7cc4ff', colors: { land: '#123a66', park: '#1d4a5e', water: '#2a6aa8', road: '#5d86b3', motorway: '#9cc3ea' }, lineAlpha: .5 });
      const cam = M.camera({ pos: [SITE[0], SITE[1] - 10, M.lerp(30000, 22000, M.seg(t, 0, sc[0].sceneDur, 'outCubic'))], look: SITE, fov: 50 }, W, H); w.render(c, cam);
      M.kinetic(c, 'A decision under your street', t, CX, 430, { t0: -.12, size: 120, maxW: 820, accent: '#7cc4ff', highlight: ['decision'] });
  } },
  // 1 WHAT HAPPENED: the document, exact words highlighted
  { dur: sc[1].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      c.fillStyle = '#0e1726'; c.fillRect(0, 0, W, H);
      M.doc(c, { x: 80, y: 380, w: W - 280, h: 760, p: M.seg(t, 0, sc[1].sceneDur * .9, 'linear'), title: DOC.title, quote: DOC.quote, source: DOC.source, accent: '#ffd54a' });
      M.evidence(c, 'fact', 80, 1180);
  } },
  // 2 WHERE: steady dive from the city to the site, ward outlined
  { dur: sc[2].sceneDur, trans: { kind: 'push', dur: .4 }, draw: (c, t) => {
      const w = M.world({ sky: 'overcast', fog: { near: 6000, far: 30000, max: .5 } });
      M.geo.addBase(w, { buildings: true, wards: true, highlightWard: WARD, hiColor: '#7cc4ff', hiAlpha: .25 });
      M.pin(w, SITE, 'Site', { p: M.seg(t, 1.2, 2, 'linear'), color: '#7cc4ff' });
      const cam = M.camera(M.moves.dive(SITE, M.seg(t, 0, sc[2].sceneDur * .9, 'inOutCubic'), { h0: 14000, h1: 700, back0: 1, back1: 1100, ahead: 0 }), W, H); w.render(c, cam);
      M.source(c, 'Map data © OpenStreetMap contributors · City of Calgary Open Data', 60, 1460, { size: 20 });
  } },
  // 3 HOW: underground cutaway (layers labelled "illustration" unless the depths come from a source)
  { dur: sc[3].sceneDur, trans: { kind: 'wipe', dur: .45 }, draw: (c, t) => {
      const w = M.world({ sky: 'overcast', fog: false, ground: '#7f8c7a' }); const p = M.seg(t, .2, 1.6);
      M.cutaway(w, [-30, 0, 30, 25], p, { layers: [{ d: 1, c: '#5b4632', name: 'Topsoil' }, { d: 2.5, c: '#806648', name: 'Clay' }, { d: 3.5, c: '#9a8566', name: 'Gravel' }] });
      w.tube([[-30, -.8, -3.6], [30, -.8, -3.6]], .6, { color: '#7cc4ff' });
      M.label(w, [0, -1, -2.6], 'Water main (illustration)', { size: 34, alpha: M.seg(t, 1.4, 1.9), dy: -10 });
      const cam = M.camera({ pos: [-14, M.lerp(-48, -30, p), M.lerp(14, 4, p)], look: [0, 0, -3], fov: 50 }, W, H); w.render(c, cam);
  } },
  // 4 WHAT'S NEXT: project stage, never past the evidence
  { dur: sc[4].sceneDur, trans: { kind: 'dissolve', dur: .4 }, draw: (c, t) => {
      c.fillStyle = '#0e1726'; c.fillRect(0, 0, W, H);
      M.text(c, "WHAT'S NEXT", CX, 520, { size: 64, weight: 800, align: 'center', color: '#7cc4ff', tracking: .06 });
      M.stages(c, STAGE, M.seg(t, .2, 1.6), 90, 860, W - 300, { accent: '#7cc4ff', size: 26 });
  } },
  // 5 CLOSER: two-sided question, no end card
  { dur: sc[5].sceneDur, draw: (c, t) => { c.fillStyle = '#0e1726'; c.fillRect(0, 0, W, H); M.closer(c, 'Fair use of money, or should it wait?', M.seg(t, 0, sc[5].sceneDur, 'linear'), W, H, { accent: '#7cc4ff' }); } },
], overlay: (c, t, info) => {
  if (t > 3 && info.index < 5) M.header(c, window.LOGO, W, H);
  if (info.index < 5) M.caption(c, S.captionAt(t), W, H);
  const mid = S.total / 2; if (S.total > 25) M.followPill(c, (t - (mid - 1)) / 2, W, H);
} });

// EDIT 3: effects cue sheet (civic: restrained; no impacts)
window.CUES = [
  { t: sc[1].sceneStart + .2, sfx: 'shutter', gain: -14 }, { t: sc[1].sceneStart + .9, sfx: 'click', gain: -14 },
  { t: sc[2].sceneStart + 1.2, sfx: 'pop', gain: -12 }, { t: sc[3].sceneStart + .2, sfx: 'thud', gain: -12 },
  { t: sc[4].sceneStart + .3, sfx: 'stamp', gain: -11 },
];
