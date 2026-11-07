import urllib.request, sys
for path in ('py/agent.py', 'py/registry.py', 'about/'):
    try:
        t = urllib.request.urlopen(urllib.request.Request('https://calgaryinsight.ca/' + path, headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'}), timeout=60).read().decode('utf-8', 'replace')
        print(path, len(t), {k: (k in t) for k in ('_save_checkpoint', '_check_whole', 'story_so_far', 'def _report_add', 'auto_files', 'passion and love', 'hello@calgaryinsight.ca')})
    except Exception as e:
        print(path, 'ERR', e)
