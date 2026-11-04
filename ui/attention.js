/* Needs attention: the communities that score lowest on public amenities, growth taken into account.
   The score, tiers and catch-up list are worked out in attention.py (the build); this screen only shows them. */
'use strict';
let atTier = '', atWard = '';
const AT_TIERS = ['Urgent', 'High', 'Watch'];

function atRows() {
  const a = D && D.amenity_gap && D.amenity_gap.attention;
  if (!a) return [];
  const wardOf = {};
  (D.communities || []).forEach(c => { wardOf[c.code] = c.ward; });
  return (a.rows || []).map((r, i) => ({ ...r, rank: i + 1, ward: wardOf[r.code] }));
}

function atNeed(c) {
  return `${esc(String(c.label).replace(/\s*\(hectares\)/i, ''))} <b>+${fmt(c.need, c.unit === 'ha' ? 1 : 0)}${c.unit === 'ha' ? ' ha' : ''}</b> <small>(has ${fmt(c.have, c.unit === 'ha' ? 1 : 0)})</small>`;
}

function renderAttention(countOnly) {
  const a = D && D.amenity_gap && D.amenity_gap.attention;
  const cnt = $('#tab-attn-count');
  if (cnt) cnt.textContent = a ? fmt((a.counts.Urgent || 0) + (a.counts.High || 0)) : '';
  if (countOnly) return;
  const list = $('#at-list');
  if (!a) {
    $('#at-stats').innerHTML = ''; $('#at-ctl').innerHTML = ''; $('#at-method').innerHTML = ''; $('#at-caveat').hidden = true;
    list.innerHTML = '<p class="empty card">City asset data is not available right now. It is counted again at the next refresh.</p>';
    return;
  }
  const city = isCity(), th = a.thresholds || {};
  $('#at-sub').textContent = city
    ? `Calgary communities that score lowest on public amenities, with growth since ${CY()} taken into account`
    : `${W()} communities that score lowest on public amenities, with growth since ${CY()} taken into account`;
  const words = {
    Urgent: `below ${fmt(th.urgent_level, 2)} of the Calgary level and growing fast`,
    High: `below ${fmt(th.list_level, 2)} and growing fast`,
    Watch: `below ${fmt(th.list_level, 2)}, slower growth`,
  };
  $('#at-stats').innerHTML = AT_TIERS.map(t => `<div class="at-stat at-${t.toLowerCase()}"><b>${fmt(a.counts[t] || 0)}</b><span><strong>${t}</strong> ${words[t]}</span><small>${fmt(a.residents[t] || 0)} residents</small></div>`).join('')
    + `<div class="at-stat"><b>${fmt(a.checked)}</b><span><strong>Checked</strong> lived-in communities with an amenity level</span><small>${esc(popChip())} count of residents</small></div>`;
  $('#at-caveat').hidden = false;
  $('#at-caveat').innerHTML = '<b>Priorities for review, not a spending recommendation.</b> The City\'s open data has no costs. New communities often have parks and playgrounds still to come from the developer. School, private and community association amenities, and those just across a community boundary, are not counted.';

  let rows = atRows();
  const wards = [...new Set(rows.map(r => r.ward).filter(Boolean))].sort((x, y) => x - y);
  if (atWard && !wards.includes(+atWard)) atWard = '';
  $('#at-ctl').innerHTML = `<div class="seg" role="radiogroup" aria-label="Tier" id="at-seg">
      ${['', ...AT_TIERS].map(t => `<button type="button" role="radio" aria-checked="${t === atTier}" data-at="${t}">${t || 'All'}${t ? ` (${fmt(a.counts[t] || 0)})` : ''}</button>`).join('')}</div>
    ${city && wards.length ? `<label class="field at-ward"><span>Ward</span><select id="at-ward"><option value="">Every ward</option>${wards.map(w => `<option value="${w}" ${String(w) === String(atWard) ? 'selected' : ''}>Ward ${w}</option>`).join('')}</select></label>` : ''}`;
  if (atTier) rows = rows.filter(r => r.tier === atTier);
  if (atWard) rows = rows.filter(r => String(r.ward) === String(atWard));

  list.innerHTML = rows.map(r => `<article class="card at-card at-${r.tier.toLowerCase()}">
      <div class="at-top">
        <span class="at-rank">#${r.rank}</span>
        <div class="at-name"><h3>${esc(titleCase(r.name))}</h3><span>${r.ward ? 'Ward ' + r.ward + ' · ' : ''}${fmt(r.residents)} residents · ${r.new ? 'new since ' + CY() : 'growth ' + signed(r.growth_pct, 1, '%') + ' since ' + CY()}</span></div>
        <div class="at-score"><b>${fmt(r.score)}</b><span>score</span></div>
      </div>
      <div class="at-mid"><span class="at-tier">${r.tier}</span>
        <span class="at-level">Amenity level ${gapMeter(r.level)} <b>${fmt(r.level, 2)}</b> <small>(Calgary = 1.00)</small></span></div>
      <p class="at-calc"><code>100 × shortfall ${fmt(r.shortfall, 2)} × pressure ${fmt(r.pressure, 2)} ÷ 2 = ${fmt(r.score)}</code></p>
      ${(r.catch_up || []).length ? `<p class="at-need-h">To reach the Calgary level</p><ul class="at-need">${r.catch_up.map(c => `<li>${atNeed(c)}</li>`).join('')}</ul>` : ''}
    </article>`).join('') || `<p class="empty card">No ${atTier ? atTier.toLowerCase() + ' ' : ''}communities${atWard ? ' in Ward ' + atWard : ''}. Every lived-in community here is at ${fmt(th.list_level, 2)} of the Calgary amenity level or above.</p>`;

  $('#at-method').innerHTML = `<summary>How the score is worked out</summary>
    <pre class="at-code"><code># attention.py
shortfall = max(0, 1 - level)                 # 0 at the Calgary level, 1 with nothing
pressure  = ${fmt(th.new_pressure, 1)} if new else 1 + min(max(growth_pct, 0), ${th.growth_cap}) / 100
score     = round(100 * shortfall * pressure / 2)   # 0 to 100

tier = "Urgent" if level &lt; ${fmt(th.urgent_level, 2)} and (new or growth_pct &gt; ${th.growth_pct})
       "High"   if level &lt; ${fmt(th.list_level, 2)} and (new or growth_pct &gt; ${th.growth_pct})
       "Watch"  if level &lt; ${fmt(th.list_level, 2)}
need = calgary_per_1000 * residents / 1000 - has   # rounded up; playgrounds per children 0 to 14</code></pre>
    <ol>${(a.method || []).map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <p class="card-note"><button type="button" class="link-btn small" data-method="needs_attention">Every formula the app uses</button> · Ask Data Genie "how is the needs attention score worked out?" and it reads the same code.</p>`;
  $('#at-notes').textContent = `Amenity counts: City of Calgary open data (parks seating, playground equipment, sport equipment, plumbing fixtures, garbage, off-leash areas, park sites, public trees, recreation facilities, community services, transit stops), counted ${D.amenity_gap.counted ? dmy(D.amenity_gap.counted) : ''}. Residents: ${popWords()}. Growth: the growth model (homes built since ${CY()}).`;
}

document.addEventListener('click', e => {
  const b = e.target.closest('#at-seg [data-at]');
  if (b) { atTier = b.dataset.at; renderAttention(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'at-ward') { atWard = e.target.value; renderAttention(); }
});
$('#at-export').addEventListener('click', async e => {
  const button = e.currentTarget, rows = atRows();
  if (!rows.length) return;
  const r = await (await api()).save_csv(`Needs attention, ${W()}, ${(D.amenity_gap || {}).counted || ''}`,
    ['Rank', 'Community', 'Ward', 'Tier', 'Score (0 to 100)', 'Amenity level (1.00 = Calgary)', 'Shortfall', 'Growth pressure',
      `Growth since ${CY()} (%)`, `New since ${CY()}`, 'Residents', 'Children 0 to 14', 'To reach the Calgary level'],
    rows.map(x => [x.rank, titleCase(x.name), x.ward || '', x.tier, x.score, x.level, x.shortfall, x.pressure, x.growth_pct ?? '', x.new ? 'yes' : '',
      x.residents, x.children_0_14, (x.catch_up || []).map(c => `${c.label} +${c.need}${c.unit === 'ha' ? ' ha' : ''} (has ${c.have})`).join('; ')]));
  if (r && r.ok) { const s = button.querySelector('span'); s.textContent = 'Saved'; setTimeout(() => { s.textContent = 'Save this list'; }, 2500); }
});
window.renderAttention = renderAttention;
