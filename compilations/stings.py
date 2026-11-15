"""Short score stings for compilation title/episode cards, from the series score kit (musiclib.py).
Usage: python3 stings.py <outdir>  -> title_sting.wav (5 s), card_sting.wav (2 s); mono 44.1 kHz"""
import sys, os, wave, numpy as np
outdir = sys.argv[1]; os.makedirs(outdir, exist_ok=True)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.argv = [sys.argv[0], '6']
import musiclib as M
def render(dur, build, name):
    M.out = np.zeros(int(M.SR * (dur + 3)), np.float32); build()
    x = M.out[:int(M.SR * dur)].copy(); f = int(M.SR * .35); x[-f:] *= np.linspace(1, 0, f) ** 2
    x = x / (np.abs(x).max() + 1e-9) * .8
    with wave.open(os.path.join(outdir, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(M.SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def title():
    M.put(M.cymbal(.5), 0); M.put(M.boom(.8), 0); M.kaharwa(0, 2, .8)
    M.chord('D', 0, 2.2, .45); M.chord('G', 2.3, 1.1, .45); M.chord('A', 3.4, 1.4, .45); M.theme(0, .7, bars=2, start=2)
def card():
    for k in range(4): M.put(M.na(.7, 560 + 40 * k), k * M.E / 2)
    M.put(M.ghe(1.0), 2 * M.E); M.put(M.cymbal(.35, 1.6), 2 * M.E); M.chord('D', 2 * M.E, 1.3, .5)
    M.put(M.bansuri(M.hz(19), .5, .6), 2 * M.E); M.put(M.bansuri(M.hz(24), .7, .6, M.hz(19)), 2 * M.E + .45)
render(5.0, title, 'title_sting.wav'); render(2.0, card, 'card_sting.wav'); print('ok')
