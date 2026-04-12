#!/usr/bin/env bash
# Restart the magic mirror server and refresh the browser
sudo systemctl restart magic-mirror
pkill -f 'chromium.*localhost:3000' 2>/dev/null; true
sleep 3
nohup ~/raspberry-pi-dash/start-kiosk.sh &