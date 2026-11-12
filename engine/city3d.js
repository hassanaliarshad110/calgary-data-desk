/* STUDIO ENGINE · city3d.js — realistic 3D Calgary from OpenStreetMap (ODbL) with three.js (MIT).
   Builds downtown buildings (real footprints + heights/levels), the Bow River, parks, LRT lines and
   OSM-mapped Plus 15 footbridges; Poly Haven HDRI (CC0) lighting. Renders into an offscreen WebGL canvas
   that 2D scenes composite with composite()/C.drawImage → 2D + 3D compositing.
   Usage (module):  await City3D.init({ root: '../../' });  const cv = City3D.render(t, CAM3D.orbit(t));  */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const LAT0 = 51.0477, LON0 = -114.0650, KX = Math.cos(LAT0 * Math.PI / 180) * 111320, KZ = 110540;
const xy = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KZ];
let R, S, CAMERA, GROUPS = {}, READY = false;

function heightOf(tags) {
  const h = parseFloat((tags.height || '').replace(/[^0-9.]/g, '')); if (h > 0) return h;
  const lv = parseFloat(tags['building:levels']); if (lv > 0) return lv * 3.6 + 2;
  return 9;
}
function shapeFrom(ring) { const s = new THREE.Shape(); ring.forEach((p, i) => { const [x, z] = xy(p.lon, p.lat); i ? s.lineTo(x, -z) : s.moveTo(x, -z); }); return s; }
function ringsOf(el) {
  if (el.type === 'way') return el.geometry ? [el.geometry] : [];
  return (el.members || []).filter(m => m.role === 'outer' && m.geometry).map(m => m.geometry);
}
function extrude(ring, h, base = 0) { const g = new THREE.ExtrudeGeometry(shapeFrom(ring), { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, base, 0); return g; }
function ribbon(points, width, y, color, emissive = 0) { // flat strip along a polyline
  const pos = [], idx = []; const P = points.map(p => xy(p.lon, p.lat));
  for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L; pos.push(P[i][0] - dz * width / 2, y, P[i][1] + dx * width / 2, P[i][0] + dz * width / 2, y, P[i][1] - dx * width / 2); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function boxAlong(points, w, h, y) { // solid enclosed walkway between two or more points
  const geos = []; for (let i = 1; i < points.length; i++) { const [x0, z0] = xy(points[i - 1].lon, points[i - 1].lat), [x1, z1] = xy(points[i].lon, points[i].lat); const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.5) continue; const g = new THREE.BoxGeometry(L, h, w); g.rotateY(-Math.atan2(z1 - z0, x1 - x0)); g.translate((x0 + x1) / 2, y + h / 2, (z0 + z1) / 2); geos.push(g); } return geos;
}

export const City3D = {
  async init({ root = '../../', width = 1920, height = 1080, hdri = 'acquired/polyhaven/hdris/kloofendal_48d_partly_cloudy_puresky_1k.hdr' } = {}) {
    const get = p => fetch(root + p).then(r => r.ok ? r.json() : null).catch(() => null);
    const [bld, p15, lrt, riv, pw] = await Promise.all(['downtown_buildings', 'plus15_bridges', 'lrt_lines', 'rivers', 'downtown_parks_water'].map(n => get(`acquired/geo/osm/${n}.json`)));
    R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false }); R.setSize(width, height, false); R.setPixelRatio(1);
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.82; R.outputColorSpace = THREE.SRGBColorSpace;
    S = new THREE.Scene(); S.background = new THREE.Color('#b9d3ea'); S.fog = new THREE.Fog('#c9dced', 2600, 9000);
    CAMERA = new THREE.PerspectiveCamera(40, width / height, 2, 9000);
    // lighting: HDRI image-based light if available, plus a sun
    try { const tex = await new RGBELoader().loadAsync(root + hdri); tex.mapping = THREE.EquirectangularReflectionMapping; S.environment = tex; GROUPS.hdri = tex; } catch (e) { console.warn('hdri', e); }
    S.add(new THREE.HemisphereLight('#dcecff', '#3a4a2a', 0.55)); const sun = new THREE.DirectionalLight('#fff3df', 2.2); sun.position.set(-900, 1400, 700); S.add(sun); GROUPS.sun = sun;
    // ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(14000, 14000), new THREE.MeshStandardMaterial({ color: '#6f7d68', roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.5; S.add(ground);
    // parks + water
    const parkG = [], waterG = [];
    for (const el of (pw?.elements || [])) for (const ring of ringsOf(el)) { if (ring.length < 4) continue; const isW = el.tags?.natural === 'water' || el.tags?.waterway === 'riverbank'; try { (isW ? waterG : parkG).push(extrude(ring, isW ? 0.4 : 0.2, isW ? 0.05 : 0)); } catch (e) {} }
    const water = new THREE.MeshStandardMaterial({ color: '#3d7fb0', roughness: 0.15, metalness: 0.2 });
    if (parkG.length) S.add(new THREE.Mesh(mergeGeometries(parkG), new THREE.MeshStandardMaterial({ color: '#6fa35c', roughness: 1 })));
    if (waterG.length) S.add(new THREE.Mesh(mergeGeometries(waterG), water));
    const rivG = []; for (const el of (riv?.elements || [])) { if (el.type === 'way' && el.geometry) rivG.push(ribbon(el.geometry, el.tags?.name === 'Bow River' ? 120 : 60, 0.3)); }
    if (rivG.length) S.add(new THREE.Mesh(mergeGeometries(rivG), water));
    // LRT lines
    const lrtG = []; for (const el of (lrt?.elements || [])) if (el.geometry) lrtG.push(ribbon(el.geometry, 7, 0.6));
    if (lrtG.length) { GROUPS.lrt = new THREE.Mesh(mergeGeometries(lrtG), new THREE.MeshStandardMaterial({ color: '#c1121f', emissive: '#5a0000', roughness: 0.6 })); S.add(GROUPS.lrt); }
    // buildings — merged by height class for speed; landmarks kept separate for highlighting
    const classes = [[0, 30, '#c9bfae'], [30, 90, '#9eacba'], [90, 150, '#7f97b1'], [150, 999, '#6f8bab']]; const bins = classes.map(() => []); GROUPS.landmarks = {};
    for (const el of (bld?.elements || [])) { const tags = el.tags || {}; const h = heightOf(tags); for (const ring of ringsOf(el)) { if (ring.length < 4) continue; let g; try { g = extrude(ring, h); } catch (e) { continue; }
      if (['Calgary Tower', 'The Bow', 'Brookfield Place'].includes(tags.name)) { GROUPS.landmarks[tags.name] = g; continue; } bins[classes.findIndex(c => h >= c[0] && h < c[1])].push(g); } }
    GROUPS.buildings = new THREE.Group(); bins.forEach((b, i) => { if (b.length) GROUPS.buildings.add(new THREE.Mesh(mergeGeometries(b), new THREE.MeshStandardMaterial({ color: classes[i][2], roughness: i > 1 ? 0.35 : 0.85, metalness: i > 1 ? 0.45 : 0.05, envMapIntensity: 0.9 }))); }); S.add(GROUPS.buildings);
    GROUPS.landmarkMeshes = {}; for (const [n, g] of Object.entries(GROUPS.landmarks)) { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: n === 'Calgary Tower' ? '#e9e4da' : '#a9c1da', roughness: 0.3, metalness: 0.5 })); GROUPS.landmarkMeshes[n] = m; S.add(m); }
    if (GROUPS.landmarkMeshes['Calgary Tower']) { const tw = GROUPS.landmarkMeshes['Calgary Tower']; tw.geometry.computeBoundingBox(); const c = new THREE.Vector3(); tw.geometry.boundingBox.getCenter(c); const pod = new THREE.Mesh(new THREE.CylinderGeometry(22, 18, 22, 32), new THREE.MeshStandardMaterial({ color: '#d62828', roughness: 0.4 })); pod.position.set(c.x, 165, c.z); S.add(pod); GROUPS.towerXZ = [c.x, c.z]; }
    // Plus 15 footbridges (as mapped in OSM): glowing enclosed walkways ~4.6 m (15 ft) above street
    const pG = []; for (const el of (p15?.elements || [])) if (el.geometry) pG.push(...boxAlong(el.geometry, 14, 9, 4.6));
    GROUPS.p15mat = new THREE.MeshStandardMaterial({ color: '#f2b705', emissive: '#f2b705', emissiveIntensity: 0.0, roughness: 0.4 });
    if (pG.length) { GROUPS.p15 = new THREE.Mesh(mergeGeometries(pG), GROUPS.p15mat); S.add(GROUPS.p15); }
    GROUPS.p15count = (p15?.elements || []).length; GROUPS.buildingCount = (bld?.elements || []).length;
    READY = true; return this;
  },
  stats() { return { buildings: GROUPS.buildingCount, plus15: GROUPS.p15count }; },
  canvas() { return R.domElement; },
  /* cam: {pos:[x,y,z], look:[x,y,z], fov}; look: { p15glow 0..1, ghost 0..1 (fade buildings), night 0..1 } */
  render(cam, look = {}) {
    CAMERA.position.set(...cam.pos); CAMERA.lookAt(new THREE.Vector3(...cam.look)); if (cam.fov) { CAMERA.fov = cam.fov; CAMERA.updateProjectionMatrix(); }
    GROUPS.p15mat.emissiveIntensity = (look.p15glow ?? 0) * 2.2; GROUPS.p15mat.color.set(look.p15glow ? '#ffd166' : '#d8cfb8');
    const ghost = look.ghost ?? 0; GROUPS.buildings.children.forEach(m => { m.material.transparent = ghost > 0; m.material.opacity = 1 - ghost * 0.75; m.material.depthWrite = ghost < 0.5; });
    const n = look.night ?? 0; S.background.set(n ? new THREE.Color('#b9d3ea').lerp(new THREE.Color('#0b1430'), n) : '#b9d3ea'); S.fog.color.copy(S.background); GROUPS.sun.intensity = 2.2 * (1 - n * 0.85); R.toneMappingExposure = 0.82 - n * 0.35;
    R.render(S, CAMERA); return R.domElement;
  },
};
// 3D CAMERA PRESETS (metres; origin = downtown core, +x east, +z south)
const tw3 = (t, t0, d, a, b) => { const k = Math.max(0, Math.min(1, (t - t0) / d)); const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; return a.map((v, i) => v + (b[i] - v) * e); };
export const CAM3D = {
  dolly: (t, d, from, to, look) => ({ pos: tw3(t, 0, d, from, to), look }),
  orbit: (t, { center = [0, 40, 0], radius = 1500, height = 700, speed = 0.08, phase = 0, fov = 40 } = {}) => ({ pos: [center[0] + Math.cos(phase + t * speed) * radius, height, center[2] + Math.sin(phase + t * speed) * radius], look: center, fov }),
  crane: (t, d, at, fromH, toH, dist = 600) => ({ pos: [at[0] + dist * 0.7, tw3(t, 0, d, [fromH], [toH])[0], at[2] + dist], look: [at[0], Math.max(5, tw3(t, 0, d, [fromH * 0.15], [toH * 0.05])[0]), at[2]] }),
  topDown: (t, d, h0 = 2600, h1 = 1700) => ({ pos: [0, tw3(t, 0, d, [h0], [h1])[0], 120], look: [0, 0, 0], fov: 40 }),
  flyover: (t, d, path, lookAhead = 0.08) => { const k = Math.min(1, t / d); const at = f => { const x = f * (path.length - 1), i = Math.min(path.length - 2, Math.floor(x)), u = x - i; return path[i].map((v, j) => v + (path[i + 1][j] - v) * u); }; return { pos: at(k), look: at(Math.min(1, k + lookAhead)).map((v, j) => j === 1 ? v * 0.4 : v) }; },
  street: (t, d, x0, x1, z, h = 2.5) => ({ pos: [x0 + (x1 - x0) * Math.min(1, t / d), h, z], look: [x0 + (x1 - x0) * Math.min(1, t / d) + 200, h + 25, z - 30], fov: 55 }),
};
window.City3D = City3D; window.CAM3D = CAM3D;
