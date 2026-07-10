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

## Quy tắc code
- Business logic CHỈ ở `src/lib/services/`. Route/tool/page = wrapper mỏng.
- API route trả envelope `apiOk/apiError` (types.ts). Try/catch mọi route — không để throw 500 trần.
- Input từ ngoài (webhook, API body) validate bằng zod trước khi dùng.
- Secrets chỉ ở env. Không log SĐT đầy đủ (mask `090***4567`).
- LLM không bao giờ là nguồn của giá/tên món — chỉ từ tool results.

## Git
- Làm thẳng trên `main`, commit nhỏ + pull thường xuyên (folder ownership đã chống conflict).
- Conventional commits: `feat:`, `fix:`, `chore:`. Không nhắc AI trong commit message.
- **Trước khi push: `npm run build` phải pass.** Push code đỏ = cả team đứng hình.
- Conflict → dừng, nhắn Lead xử lý. Không tự force-push.

## Chạy dự án
```bash
cp .env.example .env.local   # xin giá trị thật từ Lead
npm install && npm run dev   # localhost:3000
npm run build                # bắt buộc pass trước khi push
npm run db:push              # sync schema lên Neon (chỉ Dev A)
npm run eval                 # chạy NLU eval harness (Dev B)
```
