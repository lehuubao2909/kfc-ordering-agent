# Code Standards (1 trang — đọc 3 phút)

## Naming & cấu trúc
- File TS/TSX: **kebab-case, tên dài mô tả rõ** (`upsell-recommendation-service.ts`, không `utils.ts`).
- File < 200 dòng — dài hơn thì tách module.
- Comment tiếng Việt OK, ghi rõ TODO(owner): `TODO(Dev A): ...`

## Ranh giới ownership (KHÔNG sửa file ngoài đất mình — vướng thì nhắn Lead)
| Vùng | Owner |
|---|---|
| `src/lib/types.ts`, `docs/api-contract.md`, env/deploy/Meta | **Lead** |
| `src/lib/services/**`, `src/lib/db/**`, `src/app/api/**` (trừ webhooks), `scripts/seed*|*pos*|*co-occurrence*` | **Dev A** |
| `src/lib/agent/**`, `src/lib/channels/**`, `src/app/api/webhooks/**`, `scripts/agent-eval*` | **Dev B** |
| `src/app/**` pages + `src/components/**` | **Dev C** |

## Sync tài liệu & UI mỗi lần cập nhật (quy tắc từ 11/7 tối)
- Đổi feature/flow → cập nhật NGAY: README.md (nếu ảnh hưởng thông tin dự án), docs/ liên quan, và slide (`src/components/presentation/` + chạy lại `bash scripts/export-slides-pdf.sh` nếu nội dung slide đổi).
- Đổi UI → PHẢI verify bằng mắt trước khi push: screenshot headless Chrome (nhiều viewport) hoặc đọc lại PDF từng trang — không tin build xanh là đủ.

## Quy tắc code
- Business logic CHỈ ở `src/lib/services/`. Route/tool/page = wrapper mỏng.
- API route trả envelope `apiOk/apiError` (types.ts). Try/catch mọi route — không để throw 500 trần.
- Input từ ngoài (webhook, API body) validate bằng zod trước khi dùng.
- Secrets chỉ ở env. Không log SĐT đầy đủ (mask `090***4567`).
- LLM không bao giờ là nguồn của giá/tên món — chỉ từ tool results.

## Git — branch-per-dev, Lead merge vào main
- **Mỗi dev làm trên nhánh riêng**: `dev-a` / `dev-b` / `dev-c`. KHÔNG push thẳng `main`.
- `main` auto-deploy Vercel production (= URL webhook Messenger thật) → phải luôn xanh, chỉ Lead merge.
- Flow: commit nhỏ → push nhánh mình → mở PR vào `main`. Lead check build pass → merge nhanh.
- Sau khi Lead merge: các dev `git pull origin main` vào nhánh mình (đặc biệt Dev B pull khi Dev A merge services).
- Mỗi branch/PR có **Preview URL Vercel riêng** để test phần mình, không đụng production.
- Test webhook Messenger thật: chỉ 1 người 1 thời điểm (trỏ Meta sang Preview URL của mình, xong trỏ lại). Thống nhất trước trong team.
- Conventional commits: `feat:`, `fix:`, `chore:`. Không nhắc AI trong commit message.
- **Trước khi push: `npm run build` phải pass.** Conflict → nhắn Lead. Không force-push.

## Chạy dự án
```bash
cp .env.example .env.local   # xin giá trị thật từ Lead
npm install && npm run dev   # localhost:3000
npm run build                # bắt buộc pass trước khi push
npm run db:push              # sync schema lên Neon (chỉ Dev A)
npm run eval                 # chạy NLU eval harness (Dev B)
```
