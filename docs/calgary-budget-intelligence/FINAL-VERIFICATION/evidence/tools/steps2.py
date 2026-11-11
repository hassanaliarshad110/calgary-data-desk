"""The two other build outputs that follow source files changed on the branch: data/methods.json and data/analyst_topics.json,
made offline exactly as web/build_site.py makes them (lines 633 and 635), from a given checkout."""
import sys, os, json
root, out = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.join(root, 'web')); sys.path.insert(0, root)
os.chdir(root)
import methods, census, analyst
os.makedirs(out, exist_ok=True)
m = census.relabel(methods.METHODS, 2021)
t = [{'key': k, 'title': t, 'about': ab, 'area': ar, 'only': list(analyst.ONLY.get(k, ())) or None} for k, t, ab, ar, _ in analyst.TOPICS]
json.dump(m, open(os.path.join(out, 'methods.json'), 'w'), separators=(',', ':'))
json.dump(t, open(os.path.join(out, 'analyst_topics.json'), 'w'), separators=(',', ':'))
print(root.split('/')[-1], 'methods', len(m), 'topics', len(t))
