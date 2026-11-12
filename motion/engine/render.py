#!/usr/bin/env python3
"""Render a motion-engine scene file to MP4 (or stills) with headless Chromium + ffmpeg. Free; no credits.

  python3 render.py SCENE.js OUT.mp4 [--geo geo/calgary_base.json] [--assets DIR] [--workers 2] [--crf 18]
  python3 render.py SCENE.js --stills 0,0.5,1,1.5,12.3 --outdir stills/      # PNG stills to look at before the full render
  python3 render.py SCENE.js --sheet sheet.jpg [--n 6]                          # contact sheet of n evenly spaced frames
  --param format=wide                                                            # passed to the scene as PARAMS.format

SCENE.js must set window.FILM = M.film({...}). It may define async window.PRELOAD() (e.g. to load images with
M.loadImage from paths relative to --assets). Frames are piped straight into ffmpeg (no frame files on disk);
--workers N renders N frame ranges in parallel and joins them with -c copy.
"""
import argparse, base64, json, os, pathlib, shutil, subprocess, sys, tempfile, time

HERE = pathlib.Path(__file__).resolve().parent


def page_html(scene, assets):
    fonts = HERE / 'fonts'
    faces = ''.join(
        f"@font-face{{font-family:'Fira Sans';src:url('{(fonts / f).as_uri()}') format('woff');font-weight:{w};}}"
        for f, w in [('fira-sans-regular.woff', 400), ('fira-sans-medium.woff', 500), ('fira-sans-semibold.woff', 600),
                     ('fira-sans-bold.woff', 700), ('fira-sans-bold.woff', 800), ('fira-sans-bold.woff', 900)])
    return f"""<!doctype html><html><head><meta charset="utf-8"><base href="{pathlib.Path(assets).resolve().as_uri()}/">
<style>{faces} html,body{{margin:0;background:#000;overflow:hidden}} canvas{{display:block}}</style></head>
<body><span style="font-family:'Fira Sans';font-weight:400">.</span><span style="font-family:'Fira Sans';font-weight:600">.</span><span style="font-family:'Fira Sans';font-weight:700">.</span>
<script src="{(HERE / 'motion.js').as_uri()}"></script>
<script>window.LOGO_SRC = "{(HERE / 'logo.svg').as_uri()}";</script>
<script src="{pathlib.Path(scene).resolve().as_uri()}"></script></body></html>"""


PARAMS = {}


def open_page(pw, scene, geo, assets):
    browser = pw.chromium.launch(args=['--allow-file-access-from-files', '--disable-web-security'])
    page = browser.new_page()
    page.add_init_script(f"window.PARAMS = {json.dumps(PARAMS)};")
    if geo:
        page.add_init_script(f"window.GEO = {pathlib.Path(geo).read_text()};")
    tmp = pathlib.Path(tempfile.mkdtemp()) / 'page.html'
    tmp.write_text(page_html(scene, assets or pathlib.Path(scene).resolve().parent))
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    page.goto(tmp.as_uri())
    page.evaluate("""async () => { await document.fonts.ready;
        window.LOGO = await M.loadImage(window.LOGO_SRC);
        if (window.PRELOAD) await window.PRELOAD();
        if (window.BUILD) window.FILM = await window.BUILD(); }""")
    if errors:
        raise SystemExit('scene error: ' + ' | '.join(errors))
    info = page.evaluate('({W: FILM.W, H: FILM.H, fps: FILM.fps, frames: FILM.frames, total: FILM.total})')
    return browser, page, info


def render_range(scene, geo, assets, out, start, end, crf):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser, page, info = open_page(pw, scene, geo, assets)
        end = min(end, info['frames'])
        tmp = out + '.part.mp4'
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', str(info['fps']),
                               '-i', '-', '-c:v', 'libx264', '-crf', str(crf), '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
                               '-r', str(info['fps']), tmp], stdin=subprocess.PIPE)
        t0 = time.time()
        for n in range(start, end):
            data = page.evaluate(f'FILM.frame({n})')
            ff.stdin.write(base64.b64decode(data.split(',', 1)[1]))
        ff.stdin.close()
        if ff.wait() != 0:
            raise SystemExit('ffmpeg failed')
        os.replace(tmp, out)
        browser.close()
        print(f'{out}: frames {start}-{end} in {time.time() - t0:.1f}s', flush=True)
    return info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('scene'); ap.add_argument('out', nargs='?')
    ap.add_argument('--geo'); ap.add_argument('--assets')
    ap.add_argument('--workers', type=int, default=1); ap.add_argument('--crf', type=int, default=18)
    ap.add_argument('--stills'); ap.add_argument('--outdir', default='stills')
    ap.add_argument('--sheet'); ap.add_argument('--n', type=int, default=6)
    ap.add_argument('--start', type=int, default=0); ap.add_argument('--end', type=int, default=10 ** 9)
    ap.add_argument('--param', action='append', default=[], help='KEY=VALUE, readable in the scene as PARAMS.KEY (e.g. format=wide)')
    ap.add_argument('--cues-out', help='write the scene\'s window.CUES (effects cue sheet) and the film length to this JSON file and exit')
    a = ap.parse_args()
    PARAMS.update(dict(p.split('=', 1) for p in a.param))
    from playwright.sync_api import sync_playwright

    if a.cues_out:
        with sync_playwright() as pw:
            browser, page, info = open_page(pw, a.scene, a.geo, a.assets)
            cues = page.evaluate('window.CUES || []'); browser.close()
        json.dump(cues, open(a.cues_out, 'w'), indent=1); print(json.dumps({'cues': len(cues), 'total_s': round(info['total'], 3), 'frames': info['frames']}))
        return

    if a.stills or a.sheet:
        with sync_playwright() as pw:
            browser, page, info = open_page(pw, a.scene, a.geo, a.assets)
            if a.stills:
                ts = [float(x) for x in a.stills.split(',')]
            else:
                ts = [info['total'] * (i + .5) / a.n for i in range(a.n)]
            os.makedirs(a.outdir, exist_ok=True); paths = []
            for t in ts:
                data = page.evaluate(f'FILM.png({t})')
                p = os.path.join(a.outdir, f'still_{t:07.2f}.png'); open(p, 'wb').write(base64.b64decode(data.split(',', 1)[1])); paths.append(p)
            browser.close()
        if a.sheet:
            cols = 3 if info['H'] > info['W'] else 2
            scale = '360:-1' if info['H'] > info['W'] else '640:-1'
            rows = (len(paths) + cols - 1) // cols
            lst = pathlib.Path(tempfile.mkdtemp()) / 'l.txt'
            lst.write_text(''.join(f"file '{os.path.abspath(p)}'\nduration 1\n" for p in paths) + f"file '{os.path.abspath(paths[-1])}'\n")
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(lst), '-vf',
                            f'scale={scale},tile={cols}x{rows}', '-frames:v', '1', '-q:v', '3', a.sheet], check=True)
            print(a.sheet)
        else:
            print('\n'.join(paths))
        return

    if not a.out:
        raise SystemExit('give an output path')
    if a.workers <= 1:
        render_range(a.scene, a.geo, a.assets, a.out, a.start, a.end, a.crf); return
    with sync_playwright() as pw:
        browser, page, info = open_page(pw, a.scene, a.geo, a.assets); browser.close()
    n = info['frames']; k = a.workers; cuts = [n * i // k for i in range(k + 1)]
    work = pathlib.Path(tempfile.mkdtemp())
    procs = [subprocess.Popen([sys.executable, __file__, a.scene, str(work / f'seg{i}.mp4'), '--start', str(cuts[i]), '--end', str(cuts[i + 1]), '--crf', str(a.crf)]
                              + (['--geo', a.geo] if a.geo else []) + (['--assets', a.assets] if a.assets else [])
                              + sum([['--param', p] for p in a.param], [])) for i in range(k)]
    if any(p.wait() for p in procs):
        raise SystemExit('a worker failed; rerun')
    (work / 'list.txt').write_text(''.join(f"file '{work / f'seg{i}.mp4'}'\n" for i in range(k)))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(work / 'list.txt'), '-c', 'copy', a.out], check=True)
    shutil.rmtree(work, ignore_errors=True); print(a.out)


if __name__ == '__main__':
    main()
