#!/usr/bin/env python3
"""Narration pre-flight check: run on probe/tts_lines.json BEFORE pushing it to studio-probe.

Why (Hassan, Nov 16, 2026): Kokoro reads "a.m." / "p.m." letter by letter with a pause
("a ... m", "p ... m"), as in the Nov 13 Grey Cup video. Any dotted abbreviation does the same.
Narration must say times and abbreviations in plain spoken words instead:
  five p.m.        -> five in the afternoon / five in the evening
  eleven a.m.      -> eleven in the morning
  eleven p.m.      -> eleven at night
  twelve p.m./a.m. -> noon / midnight
  B.C., U.S.       -> British Columbia, the United States
  St., Ave., Dr.   -> Street, Avenue, Drive (or Doctor)
On-screen chips may still show "5 p.m."; only the spoken lines (and the captions built from them) change.

Usage: python3 narration_check.py probe/tts_lines.json   (exit 1 and list the problems if any)
"""
import json, re, sys

RULES = [
    (re.compile(r"\b[ap]\s*\.\s*m\b\.?", re.I), 'time abbreviation "a.m."/"p.m." (say "in the morning", "in the afternoon", "in the evening", "at night", "noon" or "midnight")'),
    (re.compile(r"(\b\d+|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirty|fifteen|forty-five|o'clock))\s*[ap]\s*m\b", re.I), 'time abbreviation "am"/"pm" (say it in words)'),
    (re.compile(r"\b(?![ap]\.\s?m\b)(?:[A-Za-z]\.){2,}", re.I), 'dotted initialism such as "B.C." or "U.S." (spell it out in full words)'),
    (re.compile(r"\b(?:St|Ave|Dr|Blvd|Rd|Mt|approx|vs|etc|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.", re.I), 'abbreviation with a full stop (write the whole word)'),
    (re.compile(r"\d"), 'digit (write every number in words as spoken)'),
]


def check(lines):
    problems = []
    for i, line in enumerate(lines):
        for rx, why in RULES:
            for m in rx.finditer(line):
                problems.append(f'line {i}: "{m.group(0)}" -> {why}\n    {line}')
    return problems


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'probe/tts_lines.json'
    data = json.load(open(path))
    lines = data['v'] if isinstance(data, dict) else data
    probs = check(lines)
    if probs:
        print('NARRATION CHECK FAILED: fix these lines (and the package/captions to match, then re-audit if wording changed):')
        print('\n'.join(probs))
        sys.exit(1)
    print(f'narration check: OK ({len(lines)} lines)')
    # Information only (narration lane v2): names not yet in the pronunciation list. After voicing, check them in
    # sp_out/phonemes.json -> script_names and add any Kokoro gets wrong to probe/lexicon.json on studio-probe.
    import os
    lex_path = os.path.join(os.path.dirname(os.path.abspath(path)), 'lexicon.json')
    if os.path.exists(lex_path):
        lex = set(json.load(open(lex_path)))
        common = set('''January February March April May June July August September October November December Monday Tuesday
            Wednesday Thursday Friday Saturday Sunday Calgary Calgarians Calgarian Alberta Albertans Canada Canadian Canadians Ottawa Edmonton
            City Council River Drive Trail Road Street Avenue Park Fort Police Mounted North South East West North-West Inspector Commissioner
            Mayor Premier Prime Minister Province Government The A An And But Or It In On At Of To Our We You Stampede Downtown'''.split())
        names = sorted({w for ln in lines for w in re.findall(r"(?<=[a-z,;:] )[A-Z][\w'’-]+", ln) if w not in lex and w not in common})
        if names: print('names not in the pronunciation list (check phonemes.json after voicing):', ', '.join(names))
