// Calgary Insight connector: the website's data for any AI app that speaks MCP (Claude, ChatGPT and others).
// Read-only. The dashboard answers are the ones Data Genie gives on the website, written every night by
// web/mcp_answers.py into the site's data/mcp/ folder; this worker only reads them. City of Calgary open data is
// read live from data.calgary.ca.
import { createServer, ToolError } from './mcp.js';

let SITE = 'https://calgaryinsight.ca/';
const SODA = 'https://data.calgary.ca';
const WARD_SECTIONS = ['overview', 'communities', 'child_care', 'schools', 'development', 'amenities', 'access', 'other_amenities',
  'population_recon', 'crime', 'traffic', 'rents', 'profile', 'property_tax', 'elections', 'election_analytics', 'growth_forecast'];
const CITY_SECTIONS = ['wards', 'ward_amenities', 'federal_budget', 'city_news', 'safest_cities', 'school_tax', 'tourism', 'police_study',
  'pay_study', 'city_budget_2027', 'budget_intelligence', 'business', 'visiting'];
const PARTS = {
  federal_budget: ['summary', 'revenue_by_province', 'tables', 'tax', 'chapter', 'province'],
  tourism: ['summary', 'arrivals', 'countries', 'airports', 'research'],
  school_tax: ['summary', 'municipalities', 'residents', 'boards', 'spending', 'grants', 'approvals', 'projects', 'factors'],
  pay_study: ['summary', 'sections', 'sources', 'limitations'],
  police_study: ['summary', 'sections', 'sources', 'limitations'],
  budget_intelligence: ['summary', 'cases', 'case', 'departments', 'priorities', 'service_areas', 'wards', 'checks', 'sources', 'actual'],
  growth_forecast: ['summary', 'sectors', 'communities', 'infrastructure', 'planned', 'fields'],
  visiting: ['summary', 'weather_months', 'weather_years', 'records', 'today', 'whats_on', 'sights', 'stay', 'getting_around', 'facts', 'stats'],
};
const ABOUT = {
  overview: 'population, 311 requests, open requests, traffic, new homes, child care, schools and amenities for the area',
  communities: 'every community in the area: residents, growth, 311 per 1,000, infrastructure reports, open requests, new homes',
  child_care: 'licensed child care spaces and programs, inspections', schools: 'school enrolment by school',
  development: 'development permits and rezonings', amenities: 'facilities, playgrounds, transit stops, major projects being built or planned, road projects',
  access: 'Growth vs amenities: share of homes within reach of playgrounds, parks, transit, community and recreation centres, libraries',
  other_amenities: 'private amenities accessible to the community (OpenStreetMap)', population_recon: 'how the population of each community is built up',
  crime: 'crime and disorder by category and community (Calgary Police Service) and the Crime Severity Index',
  traffic: 'traffic incidents: hotspots, by month, by snowfall', rents: 'rents (CMHC)', profile: 'who lives there (2021 Census): households, ages, languages, income, housing',
  property_tax: 'property tax estimate by ward and community', elections: 'who represents the area and their last official result',
  election_analytics: 'the micro-level election picture: polls, voting locations, turnout', growth_forecast: "the City's Suburban Residential Growth forecast and its effect on amenities",
  wards: 'all 14 wards side by side with ranks', ward_amenities: 'every amenity ward by ward', federal_budget: 'the federal Budget 2026 and what it means for Alberta',
  city_news: 'daily Calgary news with sources (last 60 days)', safest_cities: "Canada's safest cities by Crime Severity Index", school_tax: 'school tax and school funding, Calgary against Alberta',
  tourism: 'international visitors, airport passengers and tourism research', police_study: 'the published study of Calgary Police performance and resources',
  pay_study: 'the published study What Calgarians pay (property tax and utility bills across cities)', city_budget_2027: "the City's proposed 2027-2030 budget (not yet approved)",
  budget_intelligence: 'the 384 business cases behind the proposed 2027-2030 budget, and budget against actual 2023-2025', business: 'businesses in Calgary by category and community',
  visiting: 'visiting Calgary: weather, what\'s on, sights, getting around, facts',
};
const ALL_SECTIONS = [...WARD_SECTIONS, ...CITY_SECTIONS];

/* ------------------------------------------------------------------ reading the site's files */
async function getText(rel) {
  const r = await fetch(SITE + rel, { cf: { cacheTtl: 1800, cacheEverything: true } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`the site answered ${r.status} for ${rel}`);
  return r.text();
}
async function getJSON(rel) { const t = await getText(rel); return t === null ? null : JSON.parse(t); }
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const toks = q => norm(q).split(' ').filter(t => t.length > 1 && !['the', 'and', 'of', 'in', 'for', 'by', 'calgary', 'city', 'data'].includes(t));

// keeps, at any depth, only the list items that mention every word of find (lists of 3 or more items are narrowed)
function narrow(v, ts) {
  if (Array.isArray(v)) {
    if (v.length >= 3 && v.some(x => x && typeof x === 'object')) {
      const hit = v.filter(x => { const h = norm(JSON.stringify(x)); return ts.every(t => h.includes(t)); });
      return hit.map(x => narrow(x, ts));
    }
    return v.map(x => narrow(x, ts));
  }
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = narrow(x, ts); return o; }
  return v;
}

async function section({ section, ward = 0, part, chapter, province, find, kind }) {
  if (!ALL_SECTIONS.includes(section)) throw new ToolError(`Unknown section "${section}". Sections: ${ALL_SECTIONS.join(', ')}.`);
  const w = Math.max(0, Math.min(14, parseInt(ward, 10) || 0));
  const scope = CITY_SECTIONS.includes(section) ? 'city' : `w${w}`;
  let name = section;
  if (part && part !== 'summary') {
    if (PARTS[section] && !PARTS[section].includes(part)) throw new ToolError(`Section ${section} has the parts: ${PARTS[section].join(', ')}.`);
    if (part === 'chapter') { const c = parseInt(chapter, 10); if (!(c >= 1 && c <= 6)) throw new ToolError('Give chapter, 1 to 6.'); name = `${section}__chapter_${c}`; }
    else if (part === 'province') { if (String(province || 'AB').toUpperCase() !== 'AB' && !/alberta/i.test(province || '')) throw new ToolError('Only Alberta is available here (province AB).'); name = `${section}__province_AB`; }
    else if (part === 'case') { const n = parseInt(find, 10); if (!(n >= 1)) throw new ToolError('Give find = the case number (1 to 384).'); name = `${section}__case__${n}`; }
    else name = `${section}__${part}`;
  }
  if (section === 'elections' && part === 'full') name = 'elections__full';
  const text = await getText(`data/mcp/${scope}/${name}.json`);
  if (text === null) throw new ToolError(`No answer is kept for ${section}${part ? ' part ' + part : ''}${scope !== 'city' ? ' in ward ' + w : ''}. Try another part, or all of Calgary (ward 0).`);
  if (!find || part === 'case') {
    if (!kind) return text;
  }
  let d = JSON.parse(text);
  if (kind && section === 'budget_intelligence' && Array.isArray(d.cases)) d.cases = d.cases.filter(c => norm(JSON.stringify(c)).includes(norm(kind)));
  if (find && part !== 'case') d = narrow(d, toks(find));
  return d;
}
const areaName = w => (w ? `Ward ${w}` : 'all of Calgary');

/* ------------------------------------------------------------------ City of Calgary open data (live) */
const ID = /^[a-z0-9]{4}-[a-z0-9]{4}$/;
let CAT = null;
async function catalog() { if (!CAT) CAT = await getJSON('data/mcp/catalog.json'); if (!CAT) throw new ToolError('The catalogue is not available right now.'); return CAT; }
const stem = w => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const words = s => norm(s).split(' ').filter(Boolean).map(stem);

/* ------------------------------------------------------------------ tools */
const S = (props, required = []) => ({ type: 'object', properties: props, required, additionalProperties: false });
const str = d => ({ type: 'string', description: d });
const wardP = { type: 'integer', minimum: 0, maximum: 14, description: '0 = all of Calgary (default), 1 to 14 = one ward' };

const tools = [
  {
    name: 'calgary_overview', title: 'Calgary at a glance',
    description: 'Start here. The main figures for all of Calgary or one ward: residents today and at the 2021 Census, growth, 311 requests per 1,000 residents (last 12 months against the 12 before), open requests, traffic incidents, new homes, child care, school enrolment and amenities, with the period and the way residents are counted.',
    inputSchema: S({ ward: wardP }),
    async run({ ward = 0 }) { return section({ section: 'overview', ward }); },
  },
  {
    name: 'get_dashboard', title: 'Calgary Insight dashboard',
    description: 'Any part of the Calgary Insight dashboard, for all of Calgary (ward 0) or one ward, exactly as the website\'s Data Genie reads it. Sections: '
      + ALL_SECTIONS.map(s => `${s} (${ABOUT[s]})`).join('; ') + '. '
      + 'Some sections have parts: ' + Object.entries(PARTS).map(([s, p]) => `${s}: ${p.join(', ')}`).join('; ') + '. '
      + 'federal_budget part chapter needs chapter (1 to 6); budget_intelligence part case needs find = the case number. find narrows any list to items mentioning those words.',
    inputSchema: S({
      section: { type: 'string', enum: ALL_SECTIONS, description: 'Which part of the dashboard' },
      ward: wardP,
      part: str('A part of the section (see the description); summary by default'),
      chapter: { type: 'integer', minimum: 1, maximum: 6, description: 'federal_budget part chapter: 1 to 6' },
      province: str('federal_budget part province: AB'),
      find: str('Words that narrow a list (e.g. a community, a department, a news topic), or the case number for budget_intelligence part case'),
      kind: str('budget_intelligence part cases: operating or capital'),
    }, ['section']),
    async run(a) { return section(a); },
  },
  {
    name: 'compare_wards', title: 'Compare the 14 wards',
    description: 'All 14 wards and Calgary side by side: residents, growth, 311 requests, crime, traffic, new homes, child care, schools and amenities, with every ward\'s place on each measure (1 = highest).',
    inputSchema: S({}),
    async run() { return section({ section: 'wards' }); },
  },
  {
    name: 'budget_requests', title: 'City budget requests 2027-2030',
    description: 'The 384 business cases behind the City of Calgary\'s proposed 2027-2030 budget (PROPOSED, not approved): search them by words (title, department, business unit, service area, Budget ID), by kind (operating or capital) and by ward; or read one by its case number. Without arguments: totals and the largest requests.',
    inputSchema: S({ find: str('Words to search for, e.g. "transit", "fire", "Green Line"'), kind: { type: 'string', enum: ['operating', 'capital'] }, ward: { type: 'integer', minimum: 1, maximum: 14, description: 'Requests that name this ward' }, case_number: { type: 'integer', minimum: 1, description: 'One case, 1 to 384' } }),
    async run({ find, kind, ward, case_number }) {
      if (case_number) return section({ section: 'budget_intelligence', part: 'case', find: String(case_number) });
      if (!find && !kind && !ward) return section({ section: 'budget_intelligence' });
      let d = JSON.parse(await section({ section: 'budget_intelligence', part: 'cases' }));
      const list = Array.isArray(d.cases) ? d.cases : [];
      const ts = toks(find || '');
      const hit = list.filter(c => {
        const h = norm(JSON.stringify(c));
        return ts.every(t => h.includes(t)) && (!kind || h.includes(kind)) && (!ward || new RegExp(`\\bward ${ward}\\b`).test(h) || (Array.isArray(c.wards) && c.wards.map(Number).includes(ward)));
      });
      return { ...d, cases: hit.slice(0, 80), matched: hit.length, shown: Math.min(80, hit.length), note: 'All amounts are PROPOSED, not approved. Never divide a citywide amount among wards.' + (hit.length > 80 ? ' Add words to narrow the list.' : '') };
    },
  },
  {
    name: 'search_open_data', title: 'Search City of Calgary open data',
    description: 'Search the City of Calgary\'s whole open data catalogue (400+ datasets) by words; best match first, with each dataset\'s id, name, what it holds and its columns. Without a query, the categories. Then read a dataset with describe_open_dataset and query_open_data.',
    inputSchema: S({ query: str('Words, e.g. "dog licences", "traffic incidents", "building permits"'), category: str('A catalogue category (optional)'), limit: { type: 'integer', minimum: 1, maximum: 50 } }),
    async run({ query, category, limit = 12 }) {
      const cat = await catalog();
      const q = words(query).filter(w => !['the', 'of', 'and', 'in', 'calgary', 'data', 'city', 'for', 'by'].includes(w));
      if (!q.length && !category) return { categories: cat.by_category, datasets: cat.datasets.length, note: 'Search with words, or give a category.' };
      const rows = [];
      for (const d of cat.datasets) {
        if (category && !String(d.category || '').toLowerCase().includes(category.toLowerCase())) continue;
        const name = new Set(words(d.name)), tags = new Set(words((d.tags || []).join(' '))), cols = new Set(words((d.columns || []).join(' ').replace(/_/g, ' '))), desc = new Set(words(d.description));
        const s = q.reduce((n, w) => n + 5 * name.has(w) + 3 * tags.has(w) + 2 * cols.has(w) + desc.has(w), 0);
        if (s || !q.length) rows.push([s + (d.on_site ? 0.5 : 0), d]);
      }
      rows.sort((a, b) => b[0] - a[0] || String(a[1].name).localeCompare(String(b[1].name)));
      const layers = (cat.map_layers || []).map(l => [q.reduce((n, w) => n + new Set(words(`${String(l.service).replace(/_/g, ' ')} ${l.name} ${(l.fields || []).join(' ')}`)).has(w), 0), l]).filter(x => x[0]).sort((a, b) => b[0] - a[0]).slice(0, 6).map(x => x[1]);
      return { matches: rows.length, datasets: rows.slice(0, limit).map(([, d]) => ({ id: d.id, name: d.name, category: d.category, about: d.about, description: d.description, columns: d.columns, used_on_calgaryinsight: d.on_site || undefined, url: `${SODA}/d/${d.id}` })),
        map_layers: layers.length ? layers : undefined, note: `${rows.length} of the City's ${cat.datasets.length} datasets match.` };
    },
  },
  {
    name: 'describe_open_dataset', title: 'Describe a City dataset',
    description: 'A City of Calgary open dataset\'s name, description, last update, every column (field name, type and meaning) and 3 sample rows, read live from data.calgary.ca.',
    inputSchema: S({ dataset_id: str('Dataset id like "c2es-76ed"') }, ['dataset_id']),
    async run({ dataset_id }) {
      if (!ID.test(dataset_id || '')) throw new ToolError('dataset_id looks like "c2es-76ed" (from search_open_data).');
      const r = await fetch(`${SODA}/api/views/${dataset_id}.json`, { cf: { cacheTtl: 3600 } });
      if (!r.ok) throw new ToolError(`data.calgary.ca has no dataset ${dataset_id} (${r.status}).`);
      const v = await r.json();
      const s = await fetch(`${SODA}/resource/${dataset_id}.json?$limit=3`, { cf: { cacheTtl: 3600 } });
      return { id: dataset_id, name: v.name, description: v.description, category: v.category, last_updated: v.rowsUpdatedAt ? new Date(v.rowsUpdatedAt * 1000).toISOString().slice(0, 10) : null,
        publisher: (v.metadata && v.metadata.custom_fields && JSON.stringify(v.metadata.custom_fields).slice(0, 400)) || undefined,
        columns: (v.columns || []).filter(c => !String(c.fieldName).startsWith(':')).map(c => ({ field: c.fieldName, type: c.dataTypeName, meaning: c.description ? String(c.description).slice(0, 200) : undefined })),
        sample_rows: s.ok ? await s.json() : [], url: `${SODA}/d/${dataset_id}`, how: 'Query it with query_open_data (SoQL: select, where, group, order).' };
    },
  },
  {
    name: 'query_open_data', title: 'Query a City dataset',
    description: 'Run a SoQL query on a City of Calgary open dataset, live from data.calgary.ca, and get the rows. Use select with count(*) or sum() and group for totals, e.g. select "comm_name, count(*) as n", group "comm_name", order "n DESC".',
    inputSchema: S({ dataset_id: str('Dataset id'), select: str('e.g. "ward, count(*) as n"'), where: str("e.g. \"requested_date >= '2026-01-01'\""), group: str('e.g. "ward"'), order: str('e.g. "n DESC"'), limit: { type: 'integer', minimum: 1, maximum: 1000, description: 'Rows (default 200)' } }, ['dataset_id']),
    async run({ dataset_id, select, where, group, order, limit = 200 }) {
      if (!ID.test(dataset_id || '')) throw new ToolError('dataset_id looks like "c2es-76ed" (from search_open_data).');
      const p = new URLSearchParams();
      if (select) p.set('$select', select); if (where) p.set('$where', where); if (group) p.set('$group', group); if (order) p.set('$order', order);
      p.set('$limit', String(Math.max(1, Math.min(1000, limit))));
      const url = `${SODA}/resource/${dataset_id}.json?${p}`;
      const r = await fetch(url, { cf: { cacheTtl: 600 } });
      const t = await r.text();
      if (!r.ok) { let m = t; try { m = JSON.parse(t).message || t; } catch (e) { /* plain text */ } throw new ToolError(`data.calgary.ca could not run that query: ${String(m).slice(0, 300)}`); }
      const rows = JSON.parse(t).map(x => { for (const [k, v] of Object.entries(x)) if (v && typeof v === 'object') x[k] = '(map shape)'; return x; });
      return { dataset_id, row_count: rows.length, rows, source: `${SODA}/d/${dataset_id}`, query: Object.fromEntries(p) };
    },
  },
  {
    name: 'get_method', title: 'How a figure is worked out',
    description: 'How Calgary Insight works out its figures: the dataset, publisher, method, cautions and the page it is used on, for a topic (e.g. 311, population, access, crime, budget_intelligence). Without topic, the list of topics.',
    inputSchema: S({ topic: str('A topic key or words, e.g. "population", "311", "growth vs amenities"') }),
    async run({ topic }) {
      const m = await getJSON('data/methods.json');
      if (!m) throw new ToolError('The methods are not available right now.');
      if (!topic) return { topics: m.map(x => ({ topic: x.key, name: x.name })) };
      const ts = toks(topic);
      const hit = m.filter(x => x.key === topic || ts.every(t => norm(x.key + ' ' + x.name).includes(t)));
      return hit.length ? { methods: hit.map(({ code, ...x }) => x) } : { topics: m.map(x => ({ topic: x.key, name: x.name })), note: `No method matches "${topic}".` };
    },
  },
  // The two tools ChatGPT's connectors and deep research look for.
  {
    name: 'search', title: 'Search Calgary Insight',
    description: 'Search Calgary Insight (dashboard sections for Calgary and every ward, City open datasets, methods) and get ids to read with fetch.',
    inputSchema: S({ query: str('Search words') }, ['query']),
    async run({ query }) {
      const ts = toks(query), res = [];
      const wm = norm(query).match(/\bward (\d{1,2})\b/), w = wm ? Math.min(14, +wm[1]) : 0;
      ALL_SECTIONS.map(s => [ts.reduce((n, t) => n + (norm(s.replace(/_/g, ' ') + ' ' + ABOUT[s]).includes(t) ? 1 : 0), 0), s]).filter(x => x[0]).sort((a, b) => b[0] - a[0]).slice(0, 5)
        .forEach(([, s]) => { const sc = CITY_SECTIONS.includes(s) ? 0 : w; res.push({ id: `dash:${sc}:${s}`, title: `${ABOUT[s][0].toUpperCase() + ABOUT[s].slice(1)} (${areaName(sc)})`, url: SITE }); });
      try {
        const d = await tools.find(t => t.name === 'search_open_data').run({ query, limit: 5 });
        (d.datasets || []).forEach(x => res.push({ id: `dataset:${x.id}`, title: `City open data: ${x.name}`, url: x.url }));
      } catch (e) { /* the catalogue is optional here */ }
      if (!res.length) res.push({ id: `dash:${w}:overview`, title: `Calgary Insight overview (${areaName(w)})`, url: SITE });
      return { results: res };
    },
  },
  {
    name: 'fetch', title: 'Read a Calgary Insight item',
    description: 'Read one item found with search, by its id (dash:<ward>:<section>, dataset:<id>).',
    inputSchema: S({ id: str('An id from search') }, ['id']),
    async run({ id }) {
      const [kind, a, b] = String(id).split(':');
      if (kind === 'dash') {
        let t = await section({ section: b, ward: +a });
        if (typeof t !== 'string') t = JSON.stringify(t);
        return { id, title: `${b.replace(/_/g, ' ')} (${areaName(+a)})`, text: t.length > 60000 ? t.slice(0, 60000) + ' [...]' : t, url: SITE, metadata: { source: 'calgaryinsight.ca' } };
      }
      if (kind === 'dataset') { const d = await tools.find(t => t.name === 'describe_open_dataset').run({ dataset_id: a }); return { id, title: d.name, text: JSON.stringify(d), url: d.url, metadata: { source: 'City of Calgary open data' } }; }
      throw new ToolError('Unknown id. Use an id returned by search.');
    },
  },
];

const server = createServer({
  name: 'calgary-insight', title: 'Calgary Insight', version: '1.0',
  home: 'https://calgaryinsight.ca',
  instructions: 'Calgary Insight (calgaryinsight.ca): City of Calgary open data and other official sources explained, for all of Calgary and each of its 14 wards: population and growth, 311, crime, traffic, development, amenities and growth, schools and child care, elections, property tax, the proposed 2027-2030 budget and its 384 business cases, studies, tourism and news. '
    + 'Start with calgary_overview (ward 0 = all of Calgary). get_dashboard gives every section exactly as Calgary Insight\'s own assistant reads it; the City\'s whole open data catalogue can be searched and queried live. '
    + 'Name the source, period and way of counting residents for every figure; rates are per 1,000 residents a year. Stay neutral: treat every ward alike, never favour or rate a candidate, party or councillor, and give no voting advice. '
    + 'Budget figures for 2027-2030 are PROPOSED, not approved; never divide a citywide amount among wards. Credit calgaryinsight.ca. Information only, not advice.',
  tools,
});

export default {
  fetch(request, env, ctx) {
    if (env && env.SITE_URL) SITE = String(env.SITE_URL).replace(/\/?$/, '/');
    return server.fetch(request, env, ctx);
  },
};
export { tools };
