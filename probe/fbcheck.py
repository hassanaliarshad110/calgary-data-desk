import json, os, sys, re, urllib.request, urllib.parse
out = sys.argv[1]; os.makedirs(out, exist_ok=True); R = {}
def get(u, ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': ua, 'Accept-Language': 'en-US,en'}), timeout=60)
        return r.status, r.geturl(), r.read().decode('utf-8', 'replace')
    except Exception as e: return str(e), '', ''
post = 'https://www.facebook.com/1370614532809643/posts/1833265154551158'
for name, u in [('post', post), ('embed', 'https://www.facebook.com/plugins/post.php?href=' + urllib.parse.quote(post, safe='') + '&show_text=true&width=500'),
                ('page', 'https://www.facebook.com/1370614532809643'), ('old_post', 'https://www.facebook.com/1370614532809643/posts/2354812772013540'),
                ('old_embed', 'https://www.facebook.com/plugins/post.php?href=' + urllib.parse.quote('https://www.facebook.com/1370614532809643/posts/2354812772013540', safe='') + '&show_text=true&width=500')]:
    s, final, b = get(u)
    R[name] = {'status': s, 'final_url': final, 'len': len(b), 'title': (re.search(r'<title>([^<]*)</title>', b) or [None, None])[1] if b else None,
               'og_type': re.findall(r'property="og:(?:type|video[^"]*|url|title)" content="([^"]{0,160})"', b)[:8],
               'video_markers': {k: b.count(k) for k in ('video', '"is_video"', 'playable_url', 'VideoPlayer', 'video_id', '.mp4', 'processing')},
               'page_names': list(set(re.findall(r'"(?:pageName|page_name|name)":"(Calgary[^"]{0,40})"', b)))[:5],
               'vanity': list(set(re.findall(r'facebook\.com\\?/([A-Za-z0-9.]{4,40})\\?/(?:posts|videos)', b)))[:5],
               'text_found': 'pipes beneath' in b.lower()}
json.dump(R, open(os.path.join(out, 'fb.json'), 'w'), indent=1); print('ok')
