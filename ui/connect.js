// Connect your AI: how to add Calgary Insight to Claude, ChatGPT or another AI app (the connector, connector/ in the code).
'use strict';
(function () {
  const URL_ = 'https://calgary-insight-mcp.hasssanaliarshad.workers.dev/mcp';
  const ic = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const card = (title, sub, inner, cls) => `<div class="card ${cls || ''}"><div class="card-head"><div><h2>${title}</h2>${sub ? `<p class="meta">${sub}</p>` : ''}</div></div>${inner}</div>`;
  const what = [
    ['Calgary at a glance', 'for the whole city or any ward: residents, growth, 311, traffic, new homes, child care, schools, amenities'],
    ['Every dashboard section', 'crime, traffic, communities, Growth vs amenities, development, rents, the Census profile, property tax'],
    ['The 14 wards side by side', 'with each ward\'s place on every measure'],
    ['Budget requests 2027 to 2030', 'all 384 business cases, searchable, and budget against actual (proposed figures marked as proposed)'],
    ['Elections', 'who represents each area, official results and the micro-level picture'],
    ['Studies and more', 'police performance, What Calgarians pay, school tax, tourism, the federal budget, Calgary News, Visiting Calgary'],
    ['All of the City\'s open data', 'search the 400+ datasets and query any of them, live'],
    ['How it\'s counted', 'the method, dataset and cautions behind every figure'],
  ];
  const asks = ['Which wards had the biggest rise in 311 requests per 1,000 residents this year?', 'How does crime in Ward 7 compare with the rest of Calgary?',
    'What does the proposed 2027-2030 budget ask for transit?', 'Which communities in Ward 12 are furthest from playgrounds and parks?', 'How many dog licences are there by community?'];
  window.renderConnect = function () {
    const el = document.getElementById('connect-body');
    if (!el || el.dataset.done) return;
    el.dataset.done = '1';
    el.innerHTML = `
      ${card('What it does', 'A connector lets your AI look things up in Calgary Insight while it answers you, instead of guessing. Ask in your own words; the AI picks what it needs and names the figure, period and source.',
        `<ul class="conn-list">${what.map(([a, b]) => `<li>${ic('check')}<span><strong>${a}</strong>: ${b}</span></li>`).join('')}</ul>`, 'span-12')}
      ${card('The connector address', 'Paste it into your AI app as shown below. No account or sign-in is needed; it only reads public data, and it keeps nothing you ask.',
        `<div class="conn-url"><code>${URL_}</code><button type="button" class="btn" id="conn-copy">${ic('file')}<span>Copy</span></button></div><p class="meta" id="conn-msg" aria-live="polite"></p>`, 'span-12')}
      ${card('Claude', 'Every plan; the free plan allows one custom connector.', `<ol class="conn-steps">
        <li>In Claude on the web or desktop, open <strong>Settings</strong> (or <strong>Customize</strong>), then <strong>Connectors</strong>.</li>
        <li>Choose <strong>Add custom connector</strong>.</li>
        <li>Name it <strong>Calgary Insight</strong> and paste the address. Leave the sign-in settings empty.</li>
        <li>Choose <strong>Add</strong>. In a chat, check that Calgary Insight is switched on in the <strong>+</strong> menu, then ask.</li></ol>`, 'span-6')}
      ${card('ChatGPT', 'A paid plan, on the web.', `<ol class="conn-steps">
        <li>Open <strong>Settings</strong>, then <strong>Apps</strong> (or <strong>Apps &amp; Connectors</strong>), then <strong>Advanced settings</strong>, and turn on <strong>Developer mode</strong>. On some accounts it is under <strong>Security</strong>.</li>
        <li>Choose <strong>Create</strong> (or <strong>Create app</strong>).</li>
        <li>Name it <strong>Calgary Insight</strong>, paste the address, choose <strong>No authentication</strong>, confirm that you trust it, and create it.</li>
        <li>In a chat, add Calgary Insight from the <strong>+</strong> menu and ask.</li></ol>`, 'span-6')}
      ${card('Try asking', '', `<div class="conn-asks">${asks.map(q => `<span class="chip">${q}</span>`).join('')}</div>`, 'span-12')}
      <p class="meta conn-foot span-12">Menu names in Claude and ChatGPT change from time to time; if a step looks different, look for "connectors", "apps" or "developer mode". AI answers can be wrong: check them against the figures and their sources. Information only, not advice.</p>`;
    const b = document.getElementById('conn-copy');
    b.addEventListener('click', async () => {
      const m = document.getElementById('conn-msg');
      try { await navigator.clipboard.writeText(URL_); m.textContent = 'Copied.'; } catch (e) { m.textContent = 'Select the address and copy it.'; }
    });
  };
})();
