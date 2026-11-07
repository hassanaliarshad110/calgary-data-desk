"""Fast point-in-area tests for City outlines (GeoJSON MultiPolygons), in plain Python.

The ward and community outlines have thousands of corners, and the dashboard places tens of thousands of points
(assets, incidents, requests) in them. Each outline's edges are filed by latitude band, so a test only looks at
the few edges near the point instead of all of them.
"""
import math

BANDS = 64


class Shape:
    """One outline. contains(lon, lat) uses the even-odd rule over every ring (holes work)."""

    def __init__(self, multipolygon, key=None):
        self.key = key
        edges = []
        for polygon in (multipolygon or {}).get('coordinates', []):
            for ring in polygon:
                n = len(ring)
                for i in range(n):
                    x1, y1 = ring[i - 1][0], ring[i - 1][1]
                    x2, y2 = ring[i][0], ring[i][1]
                    if y1 != y2:
                        edges.append((x1, y1, x2, y2))
        if not edges:
            self.box = (0.0, 0.0, 0.0, 0.0)
            self.bands = []
            return
        xs = [e[0] for e in edges] + [e[2] for e in edges]
        ys = [e[1] for e in edges] + [e[3] for e in edges]
        self.box = (min(xs), min(ys), max(xs), max(ys))
        y0, y1 = self.box[1], self.box[3]
        self.h = (y1 - y0) / BANDS or 1e-9
        self.bands = [[] for _ in range(BANDS)]
        for e in edges:
            lo, hi = min(e[1], e[3]), max(e[1], e[3])
            for b in range(self._band(lo), self._band(hi) + 1):
                self.bands[b].append(e)

    def _band(self, lat):
        return min(BANDS - 1, max(0, int((lat - self.box[1]) / self.h)))

    def in_box(self, lon, lat):
        x0, y0, x1, y1 = self.box
        return x0 <= lon <= x1 and y0 <= lat <= y1

    def contains(self, lon, lat):
        if not self.bands or not self.in_box(lon, lat):
            return False
        hit = False
        for x1, y1, x2, y2 in self.bands[self._band(lat)]:
            if (y1 > lat) != (y2 > lat) and lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1:
                hit = not hit
        return hit


class Locator:
    """Which of many outlines holds a point. Outlines are filed in a coarse grid by their boxes."""

    def __init__(self, shapes, cells=40):
        """shapes: {key: multipolygon} or {key: Shape}"""
        self.shapes = [s if isinstance(s, Shape) else Shape(s, k) for k, s in shapes.items()]
        for k, s in zip(shapes, self.shapes):
            s.key = k
        live = [s for s in self.shapes if s.bands]
        if not live:
            self.grid, self.box, self.n, self.cw, self.ch = {}, (0, 0, 0, 0), 1, 1.0, 1.0
            return
        self.box = (min(s.box[0] for s in live), min(s.box[1] for s in live),
                    max(s.box[2] for s in live), max(s.box[3] for s in live))
        self.n = cells
        self.cw = (self.box[2] - self.box[0]) / cells or 1e-9
        self.ch = (self.box[3] - self.box[1]) / cells or 1e-9
        self.grid = {}
        for s in live:
            i0, j0 = self._cell(s.box[0], s.box[1])
            i1, j1 = self._cell(s.box[2], s.box[3])
            for i in range(i0, i1 + 1):
                for j in range(j0, j1 + 1):
                    self.grid.setdefault((i, j), []).append(s)

    def _cell(self, lon, lat):
        return (min(self.n - 1, max(0, int((lon - self.box[0]) / self.cw))),
                min(self.n - 1, max(0, int((lat - self.box[1]) / self.ch))))

    def find(self, lon, lat):
        """The key of the outline holding the point, or None."""
        if lon is None or lat is None:
            return None
        for s in self.grid.get(self._cell(lon, lat), ()):
            if s.contains(lon, lat):
                return s.key
        return None


def area_shares(shape, others, samples=24):
    """Approximate share of `shape`'s area lying in each of `others` ({key: Shape}), by testing a grid of points.
    Returns {key: share} for the keys that hold part of it (shares of the points inside `shape`)."""
    x0, y0, x1, y1 = shape.box
    if x1 <= x0 or y1 <= y0:
        return {}
    cands = [o for o in others.values() if not (o.box[2] < x0 or o.box[0] > x1 or o.box[3] < y0 or o.box[1] > y1)]
    hits, inside = {}, 0
    for i in range(samples):
        lon = x0 + (i + 0.5) * (x1 - x0) / samples
        for j in range(samples):
            lat = y0 + (j + 0.5) * (y1 - y0) / samples
            if not shape.contains(lon, lat):
                continue
            inside += 1
            for o in cands:
                if o.contains(lon, lat):
                    hits[o.key] = hits.get(o.key, 0) + 1
                    break
    return {k: v / inside for k, v in hits.items()} if inside else {}


def centre(multipolygon):
    """A point inside the outline near its middle (the box centre if inside, otherwise the nearest inside sample)."""
    s = multipolygon if isinstance(multipolygon, Shape) else Shape(multipolygon)
    x0, y0, x1, y1 = s.box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if s.contains(cx, cy):
        return cx, cy
    best = None
    for i in range(16):
        for j in range(16):
            lon, lat = x0 + (i + 0.5) * (x1 - x0) / 16, y0 + (j + 0.5) * (y1 - y0) / 16
            if s.contains(lon, lat):
                d = math.hypot(lon - cx, lat - cy)
                if best is None or d < best[0]:
                    best = (d, lon, lat)
    return (best[1], best[2]) if best else (cx, cy)
