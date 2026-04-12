#!/usr/bin/env bash
# Start Chromium in kiosk mode after waiting for the server
# Used as an autostart entry on Raspberry Pi

URL="http://localhost:3000"

# Wait for the server to be ready
for i in $(seq 1 60); do
  if curl -s "$URL" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

# Launch Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-translate \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --disable-session-crashed-bubble \
  "$URL"