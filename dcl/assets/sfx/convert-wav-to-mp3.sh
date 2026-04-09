#!/usr/bin/env bash

for file in *.wav; do
  [ -e "$file" ] || continue

  output="${file%.wav}.mp3"

  ffmpeg -y -i "$file" \
    -af "loudnorm=I=-16:TP=-0.75:LRA=11" \
    -b:a 160k \
    "../../dcl/assets/sfx/$output"
done
