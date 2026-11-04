// ================================================================ REPORT AUDITOR (a tab of Data Scientist)
// Opus audits a report (re-running every figure), Sonnet reviews each finding and makes the corrected report,
// Opus checks only those findings were dealt with. The engine side is auditor.py.
let auBusy = false;
wireSeg($('#ds-tabs'), v => {
  $('#ds-make').hidden = v !== 'make';
  $('#ds-audit').hidden = v !== 'audit';
  if (v === 'audit') renderAuditor();
});

async function renderAuditor() {
  const a = await api();
  const reports = (await a.analyst_reports()).filter(r => !/\(audited\)\s*$/i.test(r.title || ''));
  const box = $('#au-reports');
  box.innerHTML = reports.length ? `<div class="ds-rows">${reports.slice(0, 40).map((r, i) => `<div class="ds-row">
      <div class="ds-row-main"><b>${esc(r.title || 'Report')}</b><small>${esc(stampText(r.made))}</small></div>
      <div class="file-actions"><button class="btn" data-p="${esc(r.interactive || r.pdf)}">${icon('open')}<span>Open</span></button>
      <button class="btn primary" data-audit="${i}" ${auBusy ? 'disabled' : ''}>${icon('check')}<span>Audit</span></button></div></div>`).join('')}</div>`
    : '<p class="card-sub ds-empty">No reports to audit yet. Make one on the Make reports tab first.</p>';
  $$('[data-p]', box).forEach(b => b.addEventListener('click', () => a.open_path(b.dataset.p)));
  $$('[data-audit]', box).forEach(b => b.addEventListener('click', () => runAudit(reports[+b.dataset.audit])));
  loadAudits();
}

async function loadAudits() {
  const a = await api();
  const list = a.audit_list ? await a.audit_list() : [];
  const box = $('#au-list');
  box.innerHTML = list.length ? `<div class="ds-rows">${list.map(x => `<div class="ds-row">
      <div class="ds-row-main"><b>${esc(x.title)}</b><small>${esc(x.made)} · ${fmt(x.findings)} finding${x.findings === 1 ? '' : 's'}, ${fmt(x.fixed)} fixed${x.open ? `, <span class="neg">${fmt(x.open)} still open</span>` : ''}</small></div>
      <div class="file-actions"><button class="btn primary" data-p="${esc(x.page)}">${icon('check')}<span>Audit findings</span></button>
      ${x.corrected_pdf ? `<button class="btn" data-p="${esc(x.corrected_pdf)}">${icon('file')}<span>Corrected report</span></button>` : ''}
      ${x.corrected_xlsx ? `<button class="btn" data-p="${esc(x.corrected_xlsx)}">${icon('download')}<span>Excel</span></button>` : ''}</div></div>`).join('')}</div>`
    : '<p class="card-sub ds-empty">No audits yet.</p>';
  $$('[data-p]', box).forEach(b => b.addEventListener('click', () => a.open_path(b.dataset.p)));
}

function auStage(n, done = false) {
  $$('#au-stages li').forEach(li => { const k = +li.dataset.stage; li.classList.toggle('done', done || k < n); li.classList.toggle('on', !done && k === n); });
}

async function runAudit(r) {
  if (auBusy || !r) return;
  auBusy = true;
  $$('[data-audit]').forEach(b => { b.disabled = true; });
  $('#au-run').hidden = false;
  $('#au-run').classList.remove('is-done');
  $('#au-run-title').textContent = 'Audit: ' + (r.title || 'Report');
  $('#au-run-sub').textContent = 'Working on it. This usually takes 5 to 15 minutes; you can use the rest of the app meanwhile.';
  $('#au-steps').innerHTML = '';
  $('#au-result').innerHTML = '';
  auStage(0);
  $('#au-run').scrollIntoView({ behavior: 'smooth', block: 'start' });
  try {
    const res = await (await api()).audit_run(r.pdf || r.interactive);
    if (!res.ok) { auStage(-1); $('#au-run-sub').textContent = 'The audit could not be finished.'; $('#au-result').innerHTML = `<div class="err">${esc(res.error)}</div>`; }
    else {
      auStage(3, true);
      $('#au-run').classList.add('is-done');
      $('#au-run-sub').textContent = `Done: ${res.findings} finding${res.findings === 1 ? '' : 's'}.`;
      $('#au-result').innerHTML = `<div class="answer"><p><b>Final check:</b> ${esc(res.verdict || '')}</p></div>
        <div class="file-actions"><button class="btn primary" data-p="${esc(res.page)}">${icon('check')}<span>Open the audit findings</span></button>
        ${res.corrected && res.corrected.pdf ? `<button class="btn" data-p="${esc(res.corrected.pdf)}">${icon('file')}<span>Corrected report</span></button>` : ''}</div>`;
      $$('#au-result [data-p]').forEach(b => b.addEventListener('click', async () => (await api()).open_path(b.dataset.p)));
    }
  } catch (e) {
    auStage(-1);
    $('#au-result').innerHTML = `<div class="err">${esc(e.message || e)}</div>`;
  } finally {
    auBusy = false;
    renderAuditor();
  }
}

window.onAuditEvent = ev => {
  if (ev.type === 'stage') {
    auStage({ audit: 0, review: 1, final: 2 }[ev.stage] || 0);
    $('#au-steps').insertAdjacentHTML('beforeend', `<li><b>${esc(ev.text)}</b></li>`);
  } else if (ev.type === 'step') {
    $('#au-steps').insertAdjacentHTML('beforeend', `<li>${esc(ev.text)}</li>`);
  }
};
