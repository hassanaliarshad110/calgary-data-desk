# v4 (Nov 18, 2026): overlapping narration fixed
v2 spliced the new segments in at frame F = ceil(T*30) and moved original voice lines only when t0 >= F/30, so a line
starting a few ms before the splice stayed put and played on top of the new segment's line (teaser t4, part1 p1,
part3 p5, full f9 and f20). Part 2 had no splice and is unchanged.
Fix: fix_timeline.py moves those lines after the segment (tolerance 0.05 s); voices re-made with the same Kokoro
af_heart lane (durations identical to the originals); audio.py re-mixed; rebuild.py keeps the v3 hook audio and the v3
video stream untouched. Check: audio before the splice matches v3 (corr >= 0.999), each moved line now plays alone.
