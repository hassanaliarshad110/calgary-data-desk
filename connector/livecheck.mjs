// After a deploy: asks the live connector for its tools and one real answer, waiting while a new address comes up.
// node connector/livecheck.mjs https://<name>.workers.dev/mcp [tool]
const [url, tool] = process.argv.slice(2);
const post = body => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.text());
for (let i = 1; i <= 10; i++) {
  await new Promise(r => setTimeout(r, 12000));
  let t = '';
  try { t = await post({ jsonrpc: '2.0', id: 1, method: 'tools/list' }); } catch (e) { t = String(e); }
  let j = null; try { j = JSON.parse(t); } catch (e) { /* not answering yet */ }
  if (!j || !j.result) { console.log(`try ${i}: not answering yet (${t.slice(0, 80).replace(/\s+/g, ' ')})`); continue; }
  console.log(`Live check: ${j.result.tools.length} tools`);
  if (tool) {
    const a = JSON.parse(await post({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: tool, arguments: {} } })).result;
    console.log(`Live check: ${tool} ${a.isError ? 'answered with a note: ' + a.content[0].text.slice(0, 200) : 'answered, ' + a.content[0].text.length + ' characters'}`);
  }
  process.exit(0);
}
console.log('::warning::The connector was deployed but is not answering yet.');
