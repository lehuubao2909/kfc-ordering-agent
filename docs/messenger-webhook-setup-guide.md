# Hướng dẫn setup Messenger Webhook Echo (Gate 2)

> Mục tiêu: nhắn tin vào fanpage → bot reply "Echo: ..." trên production URL Vercel. Tổng ~45–60 phút. Điều kiện: đã có fanpage (✅) + tài khoản Facebook là admin của page.

## Bước 1 — Tạo Meta App theo use case (~10')

> ⚠️ Meta đã đổi sang luồng **chọn use case** (5 bước: Chi tiết ứng dụng → Trường hợp sử dụng → Doanh nghiệp → Yêu cầu → Tổng quan). Không còn kiểu tạo app trống rồi "Add Product → Messenger" nữa.

1. Vào **developers.facebook.com** → đăng nhập bằng tài khoản admin page → **My Apps → Create App**.
2. **Chi tiết ứng dụng:** đặt tên (vd `kfc-ordering-agent-dev`) + email liên hệ → Tiếp.
3. **Trường hợp sử dụng (Use cases):** ở cột lọc bên trái, bấm **"Nhắn tin doanh nghiệp"** (Business messaging, có 3 use case) → chọn use case về **nhắn tin/quản lý hội thoại với khách trên Messenger** (KHÔNG chọn Marketing API, Threads, Instant Games, Facebook Login). Chọn use case này = Meta tự gắn sẵn product **Messenger** cho app.
4. **Doanh nghiệp (Business portfolio):** chọn portfolio nếu có, hoặc để mặc định/tạo mới → Tiếp.
5. **Yêu cầu → Tổng quan:** xem qua permissions cần → **Tạo ứng dụng** (có thể phải nhập lại mật khẩu FB).
6. Vào **App Dashboard → App Roles → Roles → Add People**: thêm cả 4 thành viên làm **Tester** (hoặc Administrator). ⚠️ Ở Development Mode, webhook CHỈ nhận tin nhắn từ tài khoản có role trong app — người ngoài nhắn sẽ không thấy gì.
7. **GIỮ NGUYÊN Development Mode** — đừng Switch to Live (Live đòi App Review; dev mode đủ cho demo; xử lý giám khảo Round 2 xem lưu ý cuối file).

> Nếu không tìm thấy use case messaging phù hợp trong "Nhắn tin doanh nghiệp": quay lại bước Create App, ở màn đầu chọn app type **"Other" → Business** (luồng cũ) để được Dashboard trống, rồi **Add Product → Messenger → Set up**. Cả 2 đường đều dẫn tới cùng trang Messenger API Settings ở Bước 3–4.

## Bước 2 — Code echo endpoint + deploy Vercel (~20')

Tạo Next.js app (hoặc dùng repo scaffold của Người 1 nếu đã có):

```bash
npx create-next-app@latest kfc-ordering-agent --typescript --app --tailwind --eslint --src-dir --import-alias "@/*"
cd kfc-ordering-agent
```

Tạo file `src/app/api/webhooks/messenger/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN!;
const PAGE_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN!;
const GRAPH_URL = "https://graph.facebook.com/v23.0/me/messages";

// Meta xác minh webhook bằng GET: trả lại hub.challenge nếu verify_token khớp
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.object !== "page") return NextResponse.json({ ok: true });

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      // Bỏ qua echo do chính page gửi — thiếu dòng này sẽ lặp vô hạn
      if (event.message?.is_echo) continue;
      const senderId = event.sender?.id;
      const text = event.message?.text;
      if (senderId && text) await sendText(senderId, `Echo: ${text}`);
    }
  }
  // LUÔN trả 200 — Meta retry liên tục và có thể vô hiệu webhook nếu lỗi kéo dài
  return NextResponse.json({ ok: true });
}

async function sendText(recipientId: string, text: string) {
  const res = await fetch(`${GRAPH_URL}?access_token=${PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: "RESPONSE",
    }),
  });
  if (!res.ok) console.error("Send API error:", res.status, await res.text());
}
```

Deploy:

```bash
git init && git add -A && git commit -m "feat: messenger webhook echo"
# đẩy lên GitHub rồi import vào vercel.com, HOẶC dùng CLI:
npx vercel --prod
```

Trong **Vercel → Project → Settings → Environment Variables** thêm:

| Biến | Giá trị |
|---|---|
| `MESSENGER_VERIFY_TOKEN` | chuỗi tự đặt bất kỳ, vd `kfc_verify_2026` |
| `MESSENGER_PAGE_ACCESS_TOKEN` | để trống/tạm — lấy ở Bước 3 |

Redeploy sau khi thêm env. URL webhook sẽ là: `https://<project>.vercel.app/api/webhooks/messenger`

> Dev nhanh local (tuỳ chọn): `cloudflared tunnel --url http://localhost:3000` rồi dùng URL tunnel làm callback tạm. Nhưng bản chính thức phải nằm trên Vercel — không phụ thuộc tunnel lúc demo.

## Bước 3 — Kết nối Page + lấy Page Access Token (~5')

1. Ở sidebar trái Dashboard, mở **Messenger → Messenger API Settings** (luồng use case đã gắn sẵn Messenger; nếu vào qua luồng "Other/Business" thì Add Product → Messenger → Set up trước).
2. Mục **Access Tokens / Generate access tokens**: bấm **Connect** (hoặc **Add/Connect a Page**) → chọn fanpage → cấp quyền. Sau khi connect, bấm **Generate Token** cạnh tên page → copy (chỉ hiện 1 lần).
3. Dán token vào env `MESSENGER_PAGE_ACCESS_TOKEN` trên Vercel → **Redeploy**.

## Bước 4 — Cấu hình Webhook (~5')

1. Cùng trang Messenger API Settings, mục **Webhooks** (hoặc menu Webhooks bên trái) → **Configure/Edit Callback URL**:
   - **Callback URL:** `https://<project>.vercel.app/api/webhooks/messenger`
   - **Verify Token:** đúng chuỗi `MESSENGER_VERIFY_TOKEN` đã đặt
   - Bấm **Verify and Save** — Meta gửi GET đến endpoint; đậu là URL hiện xanh.
2. **Webhook Fields / Subscriptions**: tick tối thiểu `messages` và `messaging_postbacks`.
3. Ở dòng page vừa connect → **Add Subscriptions** cho chính page đó (bước hay bị quên nhất): tick `messages`, `messaging_postbacks`.

## Bước 5 — Test

Từ điện thoại (đăng nhập tài khoản có role trong app), vào `m.me/<page-username-hoặc-id>` → nhắn "hello" → nhận lại **"Echo: hello"** trong 1–2 giây. ✅ Gate 2 passed — chụp màn hình báo team.

## Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| Verify and Save báo lỗi | Verify token không khớp env / deploy chưa xong / URL sai path. Xem Vercel → Functions logs xem GET có tới không |
| Verify OK nhưng nhắn không thấy POST tới | Quên **Add Subscriptions cho page** (bước 4.3); hoặc người nhắn không có role trong app (dev mode); hoặc nhắn bằng chính tài khoản admin vào page ở vai trò Page (phải nhắn ở vai trò cá nhân) |
| POST tới nhưng không reply | `MESSENGER_PAGE_ACCESS_TOKEN` sai/cũ (generate lại SAU khi connect page), xem log "Send API error" |
| Reply lặp vô hạn | Thiếu check `is_echo` |
| Nhận message trùng 2 lần | Meta retry khi response chậm — bình thường ở echo; phase 03 sẽ dedupe theo `mid` |

## Lưu ý cho Demo Day (quan trọng)

- Dev mode: **chỉ tài khoản có role nhắn được**. Round 2 muốn giám khảo tự đặt trên máy họ → 2 phương án: (a) đưa giám khảo 1 điện thoại của team đã đăng nhập account tester; (b) xin username FB giám khảo và add role Tester tại chỗ (họ phải accept trong developers.facebook.com — hơi phiền). Khuyến nghị: chuẩn bị sẵn 2 máy tester + để giám khảo cầm máy mình thao tác.
- Sau khi echo chạy: bước tiếp theo (trong phase 03) là verify chữ ký `X-Hub-Signature-256` bằng App Secret — echo test chưa cần.

## Unresolved

- UI Meta console đổi thường xuyên — tên menu có thể lệch chút, logic không đổi: *connect page → generate token → callback URL + verify token → subscribe fields → subscribe page*.
