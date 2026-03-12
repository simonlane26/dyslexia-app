#!/usr/bin/env bash
# Packages the extension for Chrome Web Store upload.
# Run from the chrome-extension/ directory: bash build.sh

set -e

OUT="dyslexia-write-extension.zip"

echo "Building $OUT..."

# Remove old zip if it exists
rm -f "$OUT"

# Zip only the files Chrome needs
zip -r "$OUT" \
  manifest.json \
  popup.html \
  popup.js \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png

echo "Done! Upload $OUT to the Chrome Web Store developer dashboard."
echo "https://chrome.google.com/webstore/devconsole"
