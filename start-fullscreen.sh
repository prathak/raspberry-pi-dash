#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
URL="http://localhost:${PORT}"
BROWSER=""

# Find Raspberry Pi browser (chromium on Raspberry Pi OS)
if command -v chromium-browser &>/dev/null; then
  BROWSER="$(which chromium-browser)"
elif command -v chromium &>/dev/null; then
  BROWSER="$(which chromium)"
elif command -v google-chrome &>/dev/null; then
  BROWSER="$(which google-chrome)"
else
  echo "Error: Chromium not found" >&2
  exit 1
fi

echo "Building magic-mirror..."
npm run build

echo "Starting server on port ${PORT}..."
npm run start -- -p "${PORT}" &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server..."
for i in $(seq 1 30); do
  if curl -s "${URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Opening in kiosk mode..."
"$BROWSER" \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-translate \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  "${URL}" &

echo "Magic mirror is running! Press Ctrl+C to stop."

# Clean up on exit
trap 'echo "Shutting down..."; kill $SERVER_PID 2>/dev/null; exit 0' INT TERM

wait $SERVER_PID