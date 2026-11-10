#!/bin/bash
set -e
OUT=$1; mkdir -p $OUT raw
npm i -s --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 >/dev/null 2>&1
while read -r name url; do
  [ -z "$name" ] && continue
  curl -sSL -m 300 -o raw/$name.glb "$url"
  node probe/rot.mjs raw/$name.glb $OUT/$name.glb
  ls -la $OUT/$name.glb
done < probe/rot.txt
