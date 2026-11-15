import json
L = json.load(open('/home/claude/gta6/lines.json')); D = json.load(open('/home/claude/gta6/tts_out/durs.json'))
out = [open('/home/claude/gta6/package_head.md').read()]
full = json.load(open('/home/claude/gta6/spec_full_land.json'))
out.append('### Full video (1920×1080, %.1f s)\n| # | in–out (s) | line |\n|---|---|---|' % full['dur'])
for i, t0, t1 in full['lines_t']: out.append(f'| f{i} | {t0:.1f}–{t1:.1f} | {L["f"][i]} |')
for k in ['teaser', 'part1', 'part2', 'part3']:
    s = json.load(open(f'/home/claude/gta6/spec_{k}.json'))
    out.append(f'\n### {k} (1080×1920, {s["dur"]:.1f} s)\n| line | starts at (s) | text |\n|---|---|---|')
    for kk, i, t0 in s['voice']: out.append(f'| {kk}{i} | {t0:.1f} | {L[kk][i]} |')
out.append('\n## 6. Storyboard / edit decision list (EDL)')
for k in ['full_land', 'teaser', 'part1', 'part2', 'part3']:
    s = json.load(open(f'/home/claude/gta6/spec_{k}.json')); t = 0
    out.append(f'\n### {k}\n| in–out (s) | gameplay clip (fraction played) | zoom | on-screen label |\n|---|---|---|---|')
    for sh in s['shots']:
        lab = [l for l in s.get('labels', []) if t <= l['t0'] < t + sh['dur']]
        z = f"{sh.get('z0', 1):.2f}→{sh.get('z1', sh.get('z0', 1)):.2f}" if sh.get('z0', 1) != 1 or sh.get('z1', 1) != 1 else '1'
        out.append(f"| {t:.1f}–{t + sh['dur']:.1f} | {sh['clip']} ({sh.get('a', 0):.2f}–{sh.get('b', 1):.2f}) | {z} | {'; '.join(l['k'] + ': ' + l['title'] for l in lab)} |")
        t += sh['dur']
    for c in s.get('ctas', []): out.append(f"- CTA card {c['t0']:.1f}–{c['t1']:.1f} s: {c.get('top', '')} / {c['big']}")
    for n in s.get('notes', []): out.append(f"- Note chip {n['t0']:.1f}–{n['t1']:.1f} s: {n['text']}")
    for p in s.get('pills', []): out.append(f"- Follow pop-up at {p['t0']:.1f} s for {p['dur']} s")
    if s.get('end'): out.append(f"- End card from {s['end'][0]['t0']:.1f} s: logo, title, Play free: calgaryinsight.ca/game, comment prompt, SUBSCRIBE + Follow @calgaryinsight, More at calgaryinsight.ca, not-affiliated line")
out.append('\n## 7. Sources and fact audit\n')
out.append(open('/home/claude/gta6/claims.md').read())
out.append('\nAudit: round 1 (independent agent) returned CHANGES NEEDED: "real homes" in the teaser, "the real Calgary" in Part 1, "Calgary anthem" (the code calls it the title song), "Downtown" for the Saddledome. All four fixed, plus "mostly" for City data and "the public library". Round 2 (new independent agent, 31 claims + the skyline line): **APPROVED**. Report: audits/2026-11-18-GTA6-EVE.md.\n')
out.append('\n## 8. QC\n')
try: out.append(open('/home/claude/gta6/qc.md').read())
except Exception: out.append('(see qc.md)')
open('/home/claude/gta6/package.md', 'w').write('\n'.join(out))
print('ok')
