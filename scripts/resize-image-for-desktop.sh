#!/bin/bash

# Requires imagemagick
# Usage: ./optimize_image.sh input.jpg [output.jpg]

INPUT="$1"
if [ -z "$INPUT" ]; then
  echo "Usage: $0 input.jpg [output.jpg]"
  exit 1
fi
if [ ! -f "$INPUT" ]; then
  echo "Input file $INPUT does not exist."
  exit 1
fi
# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
  echo "imagemagick is not installed. Please install it to use this script."
  exit 1
fi
# Check if the input file is a valid image
if ! file "$INPUT" | grep -qE 'image|bitmap'; then
  echo "Input file $INPUT is not a valid image."
  exit 1
fi
OUTPUT="${2:-optimized.jpg}"
MAX_DIM=1920
QUALITY=85

echo "Resizing to max dimension $MAX_DIM and compressing to quality $QUALITY"

magick "$INPUT" -resize "${MAX_DIM}x${MAX_DIM}>" -quality "$QUALITY" "$OUTPUT"

echo "Saved to $OUTPUT"
