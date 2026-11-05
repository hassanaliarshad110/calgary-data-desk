// Runs the desktop app's Python (agent.py and the modules it uses) in the browser with Pyodide, for Data Genie and
// the Data Scientist on the website. Messages in: {id, op, args}; out: {id, ok, result} for replies and
// JSON text {event, who} for progress (the same events the desktop app shows).
'use strict';
let py = null, ready = null;

async function boot(base) {
  importScripts(base + 'pyodide/pyodide.js');
  py = await loadPyodide({ indexURL: base + 'pyodide/' });
  const app = '/home/pyodide/app', cache = '/home/pyodide/appdata';
  py.FS.mkdirTree(app); py.FS.mkdirTree(cache);
  const man = await (await fetch(base + 'py/manifest.json', { cache: 'no-cache' })).json();
  await Promise.all(man.files.map(async f => {
    const r = await fetch(base + 'py/' + f, { cache: 'no-cache' });
    if (!r.ok) throw new Error('Could not load ' + f);
    const dest = app + '/' + f;
    py.FS.mkdirTree(dest.slice(0, dest.lastIndexOf('/')));
    py.FS.writeFile(dest, new Uint8Array(await r.arrayBuffer()));
  }));
  // the daily build's saved copies of sources a web page cannot read directly (police, Crime Severity Index)
  await Promise.all((man.cache || []).map(async f => {
    const r = await fetch(base + 'data/cache/' + f, { cache: 'no-cache' });
    if (!r.ok) return;
    const dest = cache + '/' + f;
    py.FS.mkdirTree(dest.slice(0, dest.lastIndexOf('/')));
    py.FS.writeFile(dest, new Uint8Array(await r.arrayBuffer()));
  }));
  // the chart and map libraries the report's interactive page needs, inlined into it (report.VENDOR = ui/vendor)
  await Promise.all(['chart.umd.min.js', 'leaflet.js', 'leaflet.css', 'fira-sans-regular.woff', 'fira-sans-semibold.woff', 'fira-sans-bold.woff'].map(async f => {
    try {
      const r = await fetch(base + 'vendor/' + f);
      if (!r.ok) return;
      py.FS.mkdirTree(app + '/ui/vendor');
      py.FS.writeFile(app + '/ui/vendor/' + f, new Uint8Array(await r.arrayBuffer()));
    } catch (err) { /* the report then explains a chart could not be drawn */ }
  }));
  py.runPython(`import sys, os\nsys.path.insert(0, '${app}')\nos.chdir('${app}')`);
  py.runPython(new TextDecoder().decode(py.FS.readFile(app + '/web/webapp.py')), { globals: py.globals });
}

onmessage = async (e) => {
  const { id, op, args } = e.data || {};
  try {
    if (op === 'boot') {
      ready = ready || boot(args.base);
      await ready;
      postMessage({ id, ok: true, result: true });
      return;
    }
    await ready;
    if (op === 'read') {                       // a file Data Genie saved, for the visitor to download or open
      const data = py.FS.readFile(args.path);
      postMessage({ id, ok: true, result: data }, [data.buffer]);
      return;
    }
    const out = py.globals.get('handle')(op, JSON.stringify(args || {}));
    postMessage({ id, ok: true, result: JSON.parse(out) });
  } catch (err) {
    postMessage({ id, ok: false, error: String((err && err.message) || err).split('\n').slice(-3).join(' ') });
  }
};
