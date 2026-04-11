#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
URL="http://localhost:${PORT}"
CHROME_PATH=""

# Find Chrome or Chromium
if [ -d "/Applications/Google Chrome.app" ]; then
  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -d "/Applications/Chromium.app" ]; then
  CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
elif command -v google-chrome &>/dev/null; then
  CHROME_PATH="$(which google-chrome)"
elif command -v chromium &>/dev/null; then
  CHROME_PATH="$(which chromium)"
elif command -v chromium-browser &>/dev/null; then
  CHROME_PATH="$(which chromium-browser)"
else
  echo "Error: Chrome or Chromium not found" >&2
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

echo "Opening in full screen (kiosk mode)..."
"$CHROME_PATH" --kiosk "${URL}" &

echo "Magic mirror is running! Press Ctrl+C to stop."

# Clean up on exit
trap 'echo "Shutting down..."; kill $SERVER_PID 2>/dev/null; exit 0' INT TERM

wait $SERVER_PID