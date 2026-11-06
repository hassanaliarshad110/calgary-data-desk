/* Calgary Data Desk: Find help near me. Shelters, meals, day spaces, health care and help lines, nearest first when the
   visitor shares their location. The location stays in the browser: it is used to sort and to draw "you are here", and
   is never sent anywhere. The list (help/help.json) comes from the Calgary Homeless Foundation's 2026 Supports and
   Resources Guide and Alberta's list of Calgary homeless shelters; shelters for people leaving abuse are listed by phone
   only, never on the map, because their locations are kept private for safety. */
'use strict';

let HELP = null, helpKind = 'shelter', helpWho = '', helpMe = null, helpMap = null, helpMsg = '';
async function loadHelp() {
  if (HELP) return HELP;
  try { const r = await fetch('help/help.json', { cache: 'no-cache' }); if (r.ok) HELP = await r.json(); } catch (e) { /* shown below */ }
  return HELP;
}
const HELP_KINDS = [['shelter', 'A bed tonight'], ['food', 'Food and meals'], ['day', 'Day spaces, showers, ID'], ['health', 'Health and recovery'], ['safe', 'Leaving abuse']];
const HELP_WHO = [['', 'Everyone'], ['men', 'Men'], ['women', 'Women'], ['families', 'Families'], ['youth', 'Youth 12 to 17']];
function helpKm(a, b) { const R = 6371, t = Math.PI / 180, dLat = (b[0] - a[0]) * t, dLon = (b[1] - a[1]) * t; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
const helpTel = p => String(p || '').replace(/[^\d+]/g, '');
const helpWhoOk = (p, w) => {
  if (!w) return true;
  const t = (p.who || '').toLowerCase();
  if (w === 'men') return /\bmen\b|all adults|adults/.test(t) && !/women/.test(t);
  if (w === 'women') return /women|all adults|adults/.test(t);
  if (w === 'families') return /famil|children/.test(t);
  if (w === 'youth') return /youth|12 to 17|ages 1[2-5]/.test(t);
  return true;
};
function helpDir(p, mode) {
  const to = isNum(p.lat) ? `${p.lat},${p.lon}` : encodeURIComponent(`${p.address}, Calgary, AB`);
  return `https://www.google.com/maps/dir/?api=1&destination=${to}&travelmode=${mode}`;
}
function helpCard(p) {
  const d = helpMe && isNum(p.lat) ? helpKm(helpMe, [p.lat, p.lon]) : null;
  const walk = isNum(d) ? Math.round(d / 4.5 * 60) : null;
  return `<article class="help-card${p.always ? ' is-247' : ''}">
    <div class="help-top"><h3>${esc(p.name)}</h3>${/24\/7/.test(p.hours || '') ? '<span class="help-247">Open 24/7</span>' : ''}</div>
    <p class="help-who">${esc(p.who || '')}</p>
    ${p.address ? `<p class="help-addr">${esc((p.unit ? p.unit + ', ' : '') + p.address)}${isNum(d) ? ` · <b>${fmt(d, d < 10 ? 1 : 0)} km</b>${walk <= 90 ? `, about ${fmt(walk)} min walk` : ''}` : ''}</p>` : '<p class="help-addr">Location kept private for safety: call and they will tell you where to go.</p>'}
    ${p.hours ? `<p class="help-hours">${esc(p.hours)}</p>` : ''}
    <div class="help-btns">${p.phone ? `<a class="btn primary" href="tel:${helpTel(p.phone)}">Call ${esc(p.phone)}</a>` : ''}
      ${isNum(p.lat) || p.address ? `<a class="btn" href="${helpDir(p, 'walking')}" target="_blank" rel="noopener">Walk there</a><a class="btn" href="${helpDir(p, 'transit')}" target="_blank" rel="noopener">By bus or train</a>` : ''}
      ${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">Website</a>` : ''}</div>
    ${p.phone2 ? `<p class="help-more">Also: <a href="tel:${helpTel(p.phone2)}">${esc(p.phone2)}</a></p>` : ''}</article>`;
}

async function renderHelp() {
  const body = $('#help-body'); if (!body) return;
  if (!HELP) body.innerHTML = '<section class="card span-12"><p class="muted">Loading the list…</p></section>';
  await loadHelp();
  if (!HELP) { body.innerHTML = '<section class="card span-12 help-urgent"><p>The list could not be loaded. <b>Call or text 2-1-1</b> any time, day or night, for a shelter bed, food and help. In danger: <b>call 9-1-1</b>.</p></section>'; return; }
  const all = HELP.places || [];
  let list = all.filter(p => p.kind === helpKind && (helpKind !== 'shelter' || helpWhoOk(p, helpWho)));
  if (helpMe) list = list.slice().sort((a, b) => (isNum(a.lat) ? helpKm(helpMe, [a.lat, a.lon]) : 1e9) - (isNum(b.lat) ? helpKm(helpMe, [b.lat, b.lon]) : 1e9));
  const lines = HELP.lines || [];
  const urgent = `<section class="card span-12 help-urgent"><div class="help-urgent-in">
      <a class="help-big danger" href="tel:911"><b>9-1-1</b><span>In danger or someone is not responding</span></a>
      <a class="help-big" href="tel:211"><b>2-1-1</b><span>Call or text, 24/7: shelter beds, food, any help</span></a>
      <a class="help-big" href="tel:988"><b>9-8-8</b><span>Suicide crisis line, call or text, 24/7</span></a>
      <a class="help-big" href="tel:4032664357"><b>403-266-4357</b><span>Distress Centre Calgary, 24/7</span></a></div></section>`;
  const near = `<section class="card span-12 help-find"><div class="card-head"><div><h2>What do you need?</h2><p class="card-sub">${helpMe ? 'Nearest to you first.' : 'Share your location to see the nearest first. It stays on your phone and is never sent anywhere.'} Call before you go: beds fill and hours change.</p></div>
      <div class="card-tools"><button type="button" class="btn primary help-loc" id="help-loc">${helpMe ? 'Update my location' : '📍 Use my location'}</button></div></div>
    ${helpMsg ? `<p class="help-msg" role="status">${esc(helpMsg)}</p>` : ''}
    <div class="help-kinds" role="radiogroup" aria-label="What do you need">${HELP_KINDS.map(([k, t]) => `<button type="button" class="chip${k === helpKind ? ' is-on' : ''}" role="radio" aria-checked="${k === helpKind}" data-helpkind="${k}">${t}</button>`).join('')}</div>
    ${helpKind === 'shelter' ? `<div class="help-kinds small" role="radiogroup" aria-label="Who is it for">${HELP_WHO.map(([k, t]) => `<button type="button" class="chip${k === helpWho ? ' is-on' : ''}" role="radio" aria-checked="${k === helpWho}" data-helpwho="${k}">${t}</button>`).join('')}</div>` : ''}
    ${helpKind === 'safe' ? '<p class="card-sub help-safe">These shelters keep their addresses private so nobody can follow you there. Call: they will help you get there safely. If you are in danger now, call 9-1-1.</p>' : ''}
    ${list.some(p => isNum(p.lat)) ? '<div id="help-map" class="help-map" role="img" aria-label="Map of the places listed"></div>' : ''}
    <div class="help-list">${list.map(helpCard).join('') || '<p class="muted">Nothing listed here. Call or text 2-1-1 for help finding it.</p>'}</div></section>`;
  const more = `<section class="card span-12"><div class="card-head"><div><h2>More help lines</h2><p class="card-sub">Tap a number to call</p></div></div>
    <div class="help-lines">${lines.map(l => `<a class="help-line" href="tel:${helpTel(l.phone)}"><b>${esc(l.phone)}</b><span>${esc(l.name)}${l.note ? ` · ${esc(l.note)}` : ''}</span></a>`).join('')}</div>
    <p class="card-note">${esc(HELP.note || '')} Sources: ${(HELP.sources || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('; ')}. Checked ${esc(HELP.checked || '')}. During extreme cold or heat, extra spaces open: <a href="https://www.calgaryhomeless.com/ewr" target="_blank" rel="noopener">calgaryhomeless.com/ewr</a>.</p></section>`;
  body.innerHTML = urgent + near + more;
  body.querySelectorAll('[data-helpkind]').forEach(b => b.addEventListener('click', () => { helpKind = b.dataset.helpkind; renderHelp(); }));
  body.querySelectorAll('[data-helpwho]').forEach(b => b.addEventListener('click', () => { helpWho = b.dataset.helpwho; renderHelp(); }));
  const lb = $('#help-loc');
  if (lb) lb.addEventListener('click', () => {
    if (!navigator.geolocation) { helpMsg = 'This browser cannot share a location. The list is sorted with downtown first.'; renderHelp(); return; }
    lb.disabled = true; lb.textContent = 'Finding you…';
    navigator.geolocation.getCurrentPosition(pos => { helpMe = [pos.coords.latitude, pos.coords.longitude]; helpMsg = ''; renderHelp(); },
      err => { helpMsg = err && err.code === 1 ? 'Location was not shared. That is fine: the list is below, and 2-1-1 can tell you what is closest.' : 'Your location could not be found just now. The list is below.'; renderHelp(); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
  helpDrawMap(list);
}
function helpDrawMap(list) {
  const el = $('#help-map'); if (!el || typeof L === 'undefined') return;
  if (helpMap) { try { helpMap.remove(); } catch (e) { /* gone */ } helpMap = null; }
  try {
    helpMap = L.map(el, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(helpMap);
    const pts = [];
    list.filter(p => isNum(p.lat)).forEach(p => {
      pts.push([p.lat, p.lon]);
      L.circleMarker([p.lat, p.lon], { radius: 8, color: '#0B1220', weight: 2, fillColor: /24\/7/.test(p.hours || '') ? '#F59E0B' : '#38BDF8', fillOpacity: 0.95 })
        .bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.address || '')}<br>${p.phone ? `<a href="tel:${helpTel(p.phone)}">${esc(p.phone)}</a> · ` : ''}<a href="${helpDir(p, 'walking')}" target="_blank" rel="noopener">Directions</a>`).addTo(helpMap);
    });
    if (helpMe) { L.circleMarker(helpMe, { radius: 9, color: '#fff', weight: 3, fillColor: '#22C55E', fillOpacity: 1 }).bindTooltip('You are here').addTo(helpMap); pts.push(helpMe); }
    if (helpMe && pts.length > 1) {
      const near = list.filter(p => isNum(p.lat)).slice(0, 3).map(p => [p.lat, p.lon]);
      helpMap.fitBounds(L.latLngBounds([helpMe, ...near]).pad(0.25));
    } else if (pts.length) helpMap.fitBounds(L.latLngBounds(pts).pad(0.15));
    else helpMap.setView([51.045, -114.06], 12);
  } catch (e) { el.innerHTML = '<p class="card-note">The map could not be drawn here; the list below has every place.</p>'; }
}
window.renderHelp = renderHelp;
