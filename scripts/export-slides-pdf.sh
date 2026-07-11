#!/bin/bash
# Xuất pitch deck → public/kfc-ordering-agent-slides.pdf (mỗi slide 1 trang 1280×720).
# Cần: đã `npm run build` + Google Chrome. Chạy: bash scripts/export-slides-pdf.sh
set -e
PORT=4321
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="public/kfc-ordering-agent-slides.pdf"

npx next start -p $PORT >/dev/null 2>&1 &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null" EXIT

for i in $(seq 1 30); do
  curl -sf "http://localhost:$PORT/presentation/print" >/dev/null && break
  sleep 1
done

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=15000 \
  --print-to-pdf="$OUT" "http://localhost:$PORT/presentation/print" 2>/dev/null

ls -la "$OUT"
