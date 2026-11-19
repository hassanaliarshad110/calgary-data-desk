"""Build TTS lines from display lines: python3 apply_lex.py episodes/epNN/lines.json out.json"""
import json, re, sys, pathlib
HERE = pathlib.Path(__file__).parent
LEX = json.load(open(HERE / 'lexicon.json'))
d = json.load(open(sys.argv[1]))
for lang, J in d.items():
    lx = LEX.get(lang, {})
    keys = sorted(lx, key=len, reverse=True)
    if keys:
        rx = re.compile('|'.join(re.escape(k) for k in keys))
        J['lines'] = [re.sub(r'\s+([،,])', r'\1', rx.sub(lambda m: lx[m.group(0)], l)).replace('  ', ' ').replace('،،', '،').replace('، ،', '،') for l in J['lines']]
json.dump(d, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
