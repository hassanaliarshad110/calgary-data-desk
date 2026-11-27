#!/usr/bin/env python3
"""Cricket Kahani — Four hundreds in a row: Kumar Sangakkara, 2015 World Cup.
Vertical 1080x1920.   python3 build.py [timeline|render|mix|cover|all]
Scenes: scenes.js (this episode's own) on top of ../ck_kit/kit.js; steps and mix levels: ../ck_kit/ckbuild.py."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../ck_kit')); import ckbuild
# (shot, 'at' seconds | 'rel' fraction of the voice line, position, sound in render/audio.py, gain[, args])
CUES = [
    ('s0', 'at', 0.03, 'whoosh', 0.5, 0.4),
    ('s0', 'at', 0.05, 'impact_boom', 0.35, 1.0),
] + [('s0', 'at', 0.4 + i * 0.42, 'ding', 0.25, 1047 + i * 180) for i in range(4)] + [
    ('s0', 'at', 2.2, 'impact_boom', 0.45, 1.4),
    ('s0', 'at', 2.2, 'cheer', 0.3),
    ('s0', 'rel', 0.62, 'thud', 0.5),
    ('s1', 'at', 0.1, 'swoosh_news', 0.4, 0.8),
    ('s1', 'at', 0.2, 'pop', 0.3),
    ('s1', 'rel', 0.36, 'whoosh', 0.4, 0.4),
    ('s1', 'rel', 0.38, 'pop', 0.35),
    ('s1', 'rel', 0.74, 'pop', 0.35),
    ('s1', 'rel', 0.76, 'chime_up', 0.25),
    ('s2', 'at', 0.1, 'swoosh_news', 0.35, 0.8),
    ('s2', 'rel', 0.3, 'thud', 0.45),
    ('s2', 'rel', 0.3, 'ding', 0.3, 1047),
    ('s2', 'rel', 0.3, 'cheer', 0.25),
    ('s2', 'rel', 0.5, 'whoosh', 0.4, 0.4),
    ('s2', 'rel', 0.84, 'thud', 0.45),
    ('s2', 'rel', 0.84, 'ding', 0.3, 1227),
    ('s2', 'rel', 0.84, 'cheer', 0.3),
    ('s2', 'rel', 0.92, 'pop', 0.3),
    ('s3', 'at', 0.0, 'amb_wind', 0.2, 6),
    ('s3', 'at', 0.15, 'pop', 0.3),
    ('s3', 'at', 0.55, 'pop', 0.3),
    ('s3', 'rel', 0.34, 'thud', 0.45),
    ('s3', 'rel', 0.34, 'ding', 0.3, 1407),
    ('s3', 'rel', 0.34, 'cheer', 0.3),
    ('s3', 'rel', 0.56, 'slide_whistle', 0.18, 0.7, False),
    ('s3', 'rel', 0.8, 'pop', 0.35),
    ('s3', 'rel', 0.8, 'chime_up', 0.25),
    ('s4', 'at', 0.1, 'pop', 0.3),
] + [('s4', 'at', 0.93 + k * 1.5, 'bonk', 0.4) for k in range(5)] + [
    ('s4', 'rel', 0.46, 'riser', 0.18, 1.5),
] + [('s4', 'rel', 0.5 + i * 0.012, 'ticker_blip', 0.2) for i in range(12)] + [
    ('s4', 'rel', 0.724, 'impact_boom', 0.4, 1.2),
    ('s4', 'rel', 0.724, 'cheer', 0.45),
    ('s4', 'rel', 0.74, 'chime_up', 0.3),
    ('s5', 'at', 0.05, 'whoosh', 0.5, 0.4),
    ('s5', 'at', 0.45, 'impact_boom', 0.45, 1.4),
    ('s5', 'at', 0.45, 'ding', 0.3, 1587),
    ('s5', 'at', 0.45, 'cheer', 0.5),
    ('s5', 'rel', 0.52, 'thud', 0.5),
    ('s5', 'rel', 0.6, 'chime_up', 0.3),
    ('s5', 'rel', 0.75, 'cheer', 0.35),
    ('s6', 'at', 0.1, 'swoosh_news', 0.35, 0.8),
] + [('s6', 'at', 1.09 + k * 1.7, 'slap', 0.3) for k in range(4)] + [
    ('s6', 'rel', 0.42, 'thud', 0.4),
    ('s6', 'rel', 0.44, 'riser', 0.15, 0.9),
    ('s6', 'rel', 0.56, 'ding', 0.3, 1320),
    ('s6', 'rel', 0.62, 'pop', 0.3),
    ('s7', 'at', 0.1, 'swoosh_news', 0.45, 0.8),
    ('s7', 'at', 0.4, 'camera_shutter', 0.3),
    ('s7', 'at', 1.05, 'thud', 0.5),
    ('s7', 'rel', 0.42, 'pop', 0.35),
    ('s7', 'rel', 0.6, 'chime_up', 0.35),
    ('s7', 'rel', 0.63, 'pop', 0.3),
    ('s7', 'rel', 0.675, 'pop', 0.3),
    ('s7', 'rel', 0.71, 'pop', 0.3),
]
ckbuild.run(__file__, out='CricketKahani_Sangakkara_4Hundreds_2015.mp4', cues=CUES, music=('documentary', 86), prefix='hi_sanga', gap=0.15, tail_end=2.0, cut=0.59)
