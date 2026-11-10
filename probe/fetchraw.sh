#!/bin/bash
# Download files as they are (probe/urls.txt: "name url" per line)
set -e
OUT=$1; mkdir -p $OUT
while read -r name url rest; do [ -z "$name" ] && continue; curl -sSL -m 300 -o $OUT/$name "$url"; ls -la $OUT/$name; done < probe/urls.txt
