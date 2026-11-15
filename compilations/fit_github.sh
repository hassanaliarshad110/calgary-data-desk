#!/bin/sh
# GitHub rejects files >100 MB and Git LFS uploads are blocked from the sandbox proxy, so a long compilation
# that comes out of build_compilation.py (crf 18) above ~95 MB is re-encoded with two-pass x264 (tune animation)
# to a size that fits, keeping the AAC 192k audio. Usage: sh fit_github.sh in.mp4 out.mp4 [target_MB=95]
IN=$1; OUT=$2; MB=${3:-95}
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
VB=$(python3 -c "print(int($MB*8*1000/$D - 192 - 20))")
ffmpeg -y -i "$IN" -c:v libx264 -preset slow -tune animation -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*4))k -pix_fmt yuv420p -fps_mode passthrough -g 60 -pass 1 -passlogfile /tmp/fitgh -an -f null /dev/null &&
ffmpeg -y -i "$IN" -c:v libx264 -preset slow -tune animation -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*4))k -pix_fmt yuv420p -fps_mode passthrough -g 60 -pass 2 -passlogfile /tmp/fitgh -c:a copy -movflags +faststart "$OUT"
