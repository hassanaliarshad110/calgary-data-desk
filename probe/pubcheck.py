import json, os, sys, re, urllib.request
out = sys.argv[1]; os.makedirs(out, exist_ok=True); R = {}
def get(u):
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en'}), timeout=60)
        return r.status, r.read().decode('utf-8', 'replace')
    except Exception as e: return str(e), ''
for vid in ('bTZ01F-KS3Q', 'IVeFeVx7zJM'):
    s, b = get(f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json'); R[vid + '_oembed'] = [s, b[:400]]
    s, b = get(f'https://www.youtube.com/watch?v={vid}')
    m = re.search(r'"playabilityStatus":\{"status":"([A-Z_]+)"(?:,"reason":"([^"]*)")?', b)
    t = re.search(r'"title":"([^"]{0,120})"', b); ch = re.search(r'"ownerChannelName":"([^"]*)"', b); pv = re.search(r'"isUnlisted":(true|false)', b)
    up = re.search(r'"uploadDate":"([^"]*)"', b); dur = re.search(r'"lengthSeconds":"(\d+)"', b)
    R[vid + '_watch'] = [s, m.groups() if m else None, t.group(1) if t else None, ch.group(1) if ch else None, pv.group(1) if pv else None, up.group(1) if up else None, dur.group(1) if dur else None]
s, b = get('https://www.youtube.com/channel/UC5LiLMNGPjdreg5pjcNm_jg/videos')
R['channel_title'] = re.findall(r'"title":\{"runs":\[\{"text":"([^"]{0,100})"', b)[:12]
R['channel_name'] = (re.search(r'<title>([^<]*)</title>', b) or [None, None])[1] if b else None
s, b = get('https://www.youtube.com/feeds/videos.xml?channel_id=UC5LiLMNGPjdreg5pjcNm_jg')
R['rss'] = [s, re.findall(r'<title>([^<]*)</title>', b)[:12], re.findall(r'<yt:videoId>([^<]*)</yt:videoId>', b)[:12]]
s, b = get('https://www.facebook.com/1370614532809643/posts/1833265154551158')
R['fb'] = [s, (re.search(r'<title>([^<]*)</title>', b) or [None, None])[1] if b else None, 'pipes beneath' in b.lower(), len(b)]
s, b = get('https://www.facebook.com/1370614532809643')
R['fb_page'] = [s, (re.search(r'<title>([^<]*)</title>', b) or [None, None])[1] if b else None]
json.dump(R, open(os.path.join(out, 'pub.json'), 'w'), indent=1); print(json.dumps(R)[:3000])
