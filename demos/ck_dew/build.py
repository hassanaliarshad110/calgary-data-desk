#!/usr/bin/env python3
"""Cricket Kahani — Cricket Science: why dew (os) changes night matches.
Vertical 1080x1920.   python3 build.py [timeline|render|mix|cover|all]
Scenes: scenes.js (this episode's own) on top of ../ck_kit/kit.js; steps and mix levels: ../ck_kit/ckbuild.py."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../ck_kit')); import ckbuild
# (shot, 'at' seconds | 'rel' fraction of the voice line, position, sound in render/audio.py, gain[, args])
CUES = [
    ('s0', 'at', 0.03, 'whoosh', 0.5, 0.4),
    ('s0', 'at', 0.05, 'impact_boom', 0.35, 1.0),
    ('s0', 'at', 0.4, 'pop', 0.3),
    ('s0', 'at', 1.3, 'ding', 0.25, 1568),
    ('s0', 'rel', 0.42, 'pop', 0.3),
    ('s0', 'rel', 0.88, 'splash_sfx', 0.45, 0.8),
    ('s0', 'rel', 0.9, 'chime_up', 0.3),
    ('s1', 'at', 0.0, 'amb_wind', 0.2, 5),
    ('s1', 'at', 0.1, 'swoosh_news', 0.35, 0.8),
    ('s1', 'at', 0.2, 'pop', 0.3),
    ('s1', 'rel', 0.4, 'riser', 0.15, 1.2),
    ('s1', 'rel', 0.66, 'pop', 0.25),
    ('s1', 'rel', 0.69, 'pop', 0.25),
    ('s1', 'rel', 0.72, 'pop', 0.25),
    ('s1', 'rel', 0.75, 'pop', 0.25),
    ('s1', 'rel', 0.78, 'pop', 0.25),
    ('s1', 'rel', 0.7, 'chime_up', 0.25),
    ('s2', 'at', 0.1, 'whoosh', 0.4, 0.8),
    ('s2', 'rel', 0.22, 'splash_sfx', 0.4, 0.6),
    ('s2', 'rel', 0.37, 'swoosh_news', 0.35, 0.8),
    ('s2', 'rel', 0.62, 'slide_whistle', 0.25, 0.8, True),
    ('s2', 'rel', 0.66, 'pop', 0.3),
    ('s3', 'at', 0.1, 'pop', 0.3),
    ('s3', 'at', 0.78, 'thud', 0.3),
    ('s3', 'rel', 0.3, 'splash_sfx', 0.35, 0.5),
    ('s3', 'rel', 0.3, 'slide_whistle', 0.2, 0.8, False),
    ('s3', 'at', 2.35, 'bonk', 0.35),
    ('s3', 'at', 3.4, 'bonk', 0.35),
    ('s3', 'at', 4.45, 'bonk', 0.35),
    ('s4', 'at', 0.1, 'swoosh_news', 0.35, 0.8),
    ('s4', 'at', 0.15, 'riser', 0.18, 2.5),
    ('s4', 'rel', 0.42, 'thud', 0.45),
    ('s4', 'rel', 0.42, 'impact_boom', 0.3, 1.0),
    ('s4', 'rel', 0.68, 'pop', 0.35),
    ('s4', 'rel', 0.7, 'chime_up', 0.3),
    ('s5', 'at', 0.1, 'swoosh_news', 0.35, 0.8),
] + [('s5', 'at', 3.8 + i * 0.085, 'ticker_blip', 0.25) for i in range(13)] + [
    ('s5', 'rel', 0.56, 'impact_boom', 0.4, 1.2),
    ('s5', 'rel', 0.7, 'whoosh', 0.4, 0.4),
    ('s5', 'rel', 0.71, 'pop', 0.3),
    ('s5', 'rel', 0.92, 'thud', 0.5),
    ('s5', 'rel', 0.92, 'cheer', 0.35),
    ('s6', 'at', 0.15, 'swoosh_news', 0.4, 0.8),
    ('s6', 'at', 0.5, 'camera_shutter', 0.3),
    ('s6', 'at', 0.9, 'pop', 0.25),
] + [('s6', 'at', 4.645 + i * 0.05, 'ticker_blip', 0.25) for i in range(10)] + [
    ('s6', 'at', 5.15, 'ding', 0.3, 1320),
    ('s6', 'rel', 0.72, 'whoosh', 0.4, 0.5),
    ('s6', 'at', 6.55, 'pop', 0.35),
    ('s6', 'at', 6.6, 'chime_up', 0.3),
    ('s7', 'at', 0.05, 'swoosh_news', 0.4, 0.8),
    ('s7', 'at', 0.45, 'pop', 0.3),
    ('s7', 'at', 0.65, 'pop', 0.3),
    ('s7', 'rel', 0.34, 'chime_up', 0.35),
    ('s7', 'at', 2.55, 'pop', 0.3),
    ('s7', 'at', 3.15, 'pop', 0.3),
    ('s7', 'at', 3.55, 'pop', 0.3),
]


def tighten(src, dst, n, prefix, keep=0.5, thr_db=-40.0):
    """edge-tts leaves pauses of 0.9-1.5 s at full stops; cut every pause longer than `keep` down to `keep`
    seconds (10 ms fades at the joins) so the Short stays within 60 s. Words are untouched."""
    import numpy as np, wave
    os.makedirs(dst, exist_ok=True)
    for i in range(n):
        w = wave.open(f'{src}/{prefix}_{i}.wav'); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close()
        win = int(sr * 0.02); m = len(x) // win; rms = np.sqrt((x[:m * win].reshape(m, win) ** 2).mean(1) + 1e-12); quiet = 20 * np.log10(rms) < thr_db
        out, j, f = [], 0, int(sr * 0.01)
        while j < m:
            k = j
            while k < m and quiet[k] == quiet[j]: k += 1
            seg = x[j * win:k * win].copy()
            if quiet[j] and j > 0 and k < m and (k - j) * win > keep * sr:
                h = int(keep * sr / 2); a, b = seg[:h].copy(), seg[-h:].copy(); a[-f:] *= np.linspace(1, 0, f); b[:f] *= np.linspace(0, 1, f); seg = np.concatenate([a, b])
            out.append(seg); j = k
        out.append(x[m * win:]); y = (np.clip(np.concatenate(out), -1, 1) * 32767).astype(np.int16)
        o = wave.open(f'{dst}/{prefix}_{i}.wav', 'w'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(y.tobytes()); o.close()


HERE = os.path.dirname(os.path.abspath(__file__))
if (sys.argv[1] if len(sys.argv) > 1 else 'all') in ('timeline', 'all'):
    tighten(os.environ.get('CK_TTS', '/home/claude/ck/tts_out'), os.path.join(HERE, 'aud', 'src'), 8, 'hi_dew'); os.environ['CK_TTS'] = os.path.join(HERE, 'aud', 'src')
ckbuild.run(__file__, out='CricketKahani_Dew_NightMatches.mp4', cues=CUES, music=('documentary', 88), prefix='hi_dew', gap=0.1, tail_end=1.8, cut=0.34)
