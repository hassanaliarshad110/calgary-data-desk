#!/bin/bash
# Download generated 3D models (probe/urls.txt: "name url" per line), shrink them for the web and report what's inside.
set -e
OUT=$1; mkdir -p $OUT raw
while read -r name url; do
  [ -z "$name" ] && continue
  curl -sSL -m 300 -o raw/$name.glb "$url"
  npx -y @gltf-transform/cli@4 optimize raw/$name.glb $OUT/$name.glb --compress draco --texture-compress webp --texture-size ${TEX:-1024} --simplify false 2>&1 | tail -3
  npx -y @gltf-transform/cli@4 inspect $OUT/$name.glb --format md > $OUT/$name.md 2>&1 || true
  ls -la raw/$name.glb $OUT/$name.glb
done < probe/urls.txt
