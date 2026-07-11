#!/bin/bash
# Xuất pitch deck → 2 file PDF (mỗi slide 1 trang 1280×720):
#   public/kfc-ordering-agent-slides.pdf              — bản NỘP (7 trang deck chính, kết thúc ở Thanks)
#   public/kfc-ordering-agent-slides-internal-qa.pdf  — bản NỘI BỘ (full 18 trang: + A1–A8 + Q&A prep)
# Cần: đã `npm run build` + Google Chrome. Chạy: bash scripts/export-slides-pdf.sh
set -e
PORT=4321
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_SUBMIT="public/kfc-ordering-agent-slides.pdf"
OUT_INTERNAL="public/kfc-ordering-agent-slides-internal-qa.pdf"

npx next start -p $PORT >/dev/null 2>&1 &
SERVER_PID=$!
trap "kill $SERVER_PID 2>/dev/null" EXIT

for i in $(seq 1 30); do
  curl -sf "http://localhost:$PORT/presentation/print" >/dev/null && break
  sleep 1
done

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=15000 \
  --print-to-pdf="$OUT_SUBMIT" "http://localhost:$PORT/presentation/print?version=submission" 2>/dev/null

"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=15000 \
  --print-to-pdf="$OUT_INTERNAL" "http://localhost:$PORT/presentation/print" 2>/dev/null

ls -la "$OUT_SUBMIT" "$OUT_INTERNAL"
