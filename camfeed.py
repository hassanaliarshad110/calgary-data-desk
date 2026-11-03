"""Traffic camera replay: keeps the City's camera images from the last 30 minutes so the app can play them on a loop.

The City of Calgary publishes one still image per camera, replaced about once a minute, and keeps no history. This
module fetches each watched camera every POLL seconds, keeps every new image (an unchanged image is skipped), and
drops images older than KEEP_MINUTES. Images are also saved in the app's data folder, so a replay is ready straight
away when the app is reopened within the half hour.
"""
import base64
import hashlib
import os
import threading
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

POLL = 20                 # seconds between checks of each watched camera
KEEP_MINUTES = 30
MAX_FRAMES = 45           # per camera
MAX_WATCH = 60            # cameras checked at once
HOST = 'https://trafficcam.calgary.ca/'


def _fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Ward5DataDesk/1.0', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()


class CameraFeed:
    def __init__(self, folder, fetch=_fetch, clock=time.time):
        self.folder = folder
        self.fetch = fetch
        self.clock = clock
        self.frames = {}              # url -> [(t, sha1, bytes)]
        self.watch = []
        self.lock = threading.Lock()
        self._thread = None
        self._stop = threading.Event()
        self._load()

    # ---------------------------------------------------------------- storage
    def _dir(self, url):
        return os.path.join(self.folder, hashlib.sha1(url.encode()).hexdigest()[:12])

    def _load(self):
        """Read images saved by an earlier session that are still inside the replay window."""
        cutoff = self.clock() - KEEP_MINUTES * 60
        try:
            names = os.listdir(self.folder)
        except OSError:
            return
        for d in names:
            path = os.path.join(self.folder, d)
            try:
                url = open(os.path.join(path, 'url.txt'), encoding='utf-8').read().strip()
                files = sorted(f for f in os.listdir(path) if f.endswith('.jpg'))
            except OSError:
                continue
            keep = []
            for f in files:
                try:
                    t = int(f[:-4]) / 1000
                except ValueError:
                    continue
                full = os.path.join(path, f)
                if t < cutoff:
                    self._remove(full)
                    continue
                try:
                    data = open(full, 'rb').read()
                except OSError:
                    continue
                keep.append((t, hashlib.sha1(data).hexdigest(), data))
            if keep and url.startswith(HOST):
                self.frames[url] = keep[-MAX_FRAMES:]

    @staticmethod
    def _remove(path):
        try:
            os.remove(path)
        except OSError:
            pass

    def _save(self, url, t, data):
        d = self._dir(url)
        try:
            os.makedirs(d, exist_ok=True)
            marker = os.path.join(d, 'url.txt')
            if not os.path.exists(marker):
                with open(marker, 'w', encoding='utf-8') as f:
                    f.write(url)
            with open(os.path.join(d, f'{int(t * 1000)}.jpg'), 'wb') as f:
                f.write(data)
        except OSError:
            pass

    # ---------------------------------------------------------------- polling
    def set_watch(self, urls):
        urls = [u for u in dict.fromkeys(urls or []) if isinstance(u, str) and u.startswith(HOST)][:MAX_WATCH]
        with self.lock:
            self.watch = urls

    def poll_once(self):
        with self.lock:
            urls = list(self.watch)
        if not urls:
            return 0

        def one(url):
            try:
                return url, self.fetch(url)
            except Exception:          # a camera that is offline or slow just misses this round
                return url, None

        added = 0
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(one, urls))
        now = self.clock()
        cutoff = now - KEEP_MINUTES * 60
        for url, data in results:
            if not data or len(data) < 1000 or data[:2] != b'\xff\xd8':      # not a JPEG
                continue
            h = hashlib.sha1(data).hexdigest()
            with self.lock:
                lst = self.frames.setdefault(url, [])
                if lst and lst[-1][1] == h:
                    continue
                lst.append((now, h, data))
                old = [f for f in lst if f[0] < cutoff] + lst[:max(0, len(lst) - MAX_FRAMES)]
                for f in old:
                    if f in lst:
                        lst.remove(f)
                        self._remove(os.path.join(self._dir(url), f'{int(f[0] * 1000)}.jpg'))
            self._save(url, now, data)
            added += 1
        return added

    def _run(self):
        while not self._stop.is_set():
            try:
                self.poll_once()
            except Exception:
                pass
            self._stop.wait(POLL)

    def start(self):
        if not self._thread:
            self._thread = threading.Thread(target=self._run, daemon=True)
            self._thread.start()

    def stop(self):
        self._stop.set()

    # ---------------------------------------------------------------- for the window
    def since(self, seen, max_bytes=3_000_000):
        """Images newer than what the window already has, oldest first, up to about max_bytes per call.
        seen: {url: time of the newest image the window has}. 'more' is true when the window should call again."""
        seen = seen or {}
        cutoff = self.clock() - KEEP_MINUTES * 60
        out, size, more = {}, 0, False
        with self.lock:
            items = [(url, list(lst)) for url, lst in self.frames.items()]
        for url, lst in items:
            last = float(seen.get(url) or 0)
            for t, _, d in lst:
                if t <= last or t < cutoff:
                    continue
                if size and size + len(d) > max_bytes:
                    more = True
                    break
                out.setdefault(url, []).append({'t': round(t, 3), 'jpg': base64.b64encode(d).decode('ascii')})
                size += len(d)
            if more:
                break
        return {'frames': out, 'more': more, 'now': self.clock(), 'keep_minutes': KEEP_MINUTES, 'poll': POLL}
