#!/usr/bin/env python3
"""Cricket Kahani — Underarm 1981: the last ball rolled along the ground (MCG, 1 Feb 1981).
Vertical 1080x1920.   python3 build.py [timeline|render|mix|cover|all]
Scenes: scenes.js (this episode's own) on top of ../ck_kit/kit.js; steps and mix levels: ../ck_kit/ckbuild.py."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../ck_kit')); import ckbuild
# (shot, 'at' seconds | 'rel' fraction of the voice line, position, sound in render/audio.py, gain[, args])
CUES = [
    ('s0', 'at', 0.1, 'thud', 0.5),
    ('s0', 'at', 1.5, 'impact_boom', 0.45, 1.4),
    ('s0', 'at', 1.5, 'boing', 0.3, 0.6),
    ('s1', 'at', 0.0, 'swoosh_news', 0.5, 0.8),
    ('s1', 'at', 0.3, 'pop', 0.3),
    ('s1', 'at', 1.1, 'pop', 0.3),
    ('s1', 'at', 1.9, 'pop', 0.3),
    ('s2', 'rel', 0.45, 'slide_whistle', 0.25, 0.9),
    ('s2', 'rel', 0.75, 'pop', 0.4),
    ('s3', 'at', 0.3, 'pop', 0.3),
    ('s3', 'at', 0.7, 'pop', 0.3),
    ('s3', 'rel', 0.62, 'pop', 0.5),
    ('s3', 'rel', 0.66, 'thud', 0.4),
    ('s4', 'rel', 0.05, 'whoosh', 0.4, 0.5),
    ('s4', 'rel', 0.42, 'thud', 0.5),
    ('s4', 'rel', 0.72, 'whoosh', 0.6, 0.5),
    ('s4', 'rel', 0.74, 'impact_boom', 0.4, 1.2),
    ('s4', 'rel', 0.8, 'bonk', 0.4),
    ('s5', 'at', 0.15, 'thud', 0.5),
    ('s5', 'rel', 0.38, 'ding', 0.3, 1320),
    ('s5', 'rel', 0.68, 'glitch', 0.25, 0.3),
    ('s5', 'rel', 0.68, 'thud', 0.5),
    ('s6', 'at', 0.1, 'swoosh_news', 0.5, 0.8),
    ('s6', 'rel', 0.55, 'swoosh_news', 0.4, 0.8),
    ('s6', 'rel', 0.72, 'punch', 0.6),
    ('s6', 'rel', 0.72, 'impact_boom', 0.35, 1.2),
    ('s7', 'at', 0.3, 'pop', 0.3),
    ('s7', 'rel', 0.36, 'pop', 0.4),
    ('s7', 'rel', 0.68, 'chime_up', 0.35),
    ('s7', 'rel', 0.72, 'pop', 0.3),
    ('s7', 'rel', 0.8, 'pop', 0.3),
    ('s7', 'rel', 0.88, 'pop', 0.3),
]
ckbuild.run(__file__, out='CricketKahani_Underarm1981_MCG.mp4', cues=CUES, music=('suspense', 0), prefix='hi_under')
