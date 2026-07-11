# Presentation

Bộ slide độc lập cho dự án `KFC Ordering Agent`.

## Cách mở

Mở trực tiếp `index.html` trong trình duyệt, hoặc chạy một static server tại thư mục `presentation/`.

Ví dụ:

```bash
cd presentation
python -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

## Điều hướng

- `Previous` / `Next`
- Phím `Arrow Left` / `Arrow Right`
- `Space` sang slide tiếp theo
- `Home` về slide đầu
- `End` đến slide cuối

## Xuất PDF

Nhấn `Export PDF`, trình duyệt sẽ mở print preview. Chọn `Save as PDF`.

Mỗi slide đã có CSS print riêng để:

- mỗi slide nằm trên một trang
- ẩn các nút điều khiển
- giữ tỉ lệ 16:9

## Chỉnh nội dung

- Sửa chữ trong `SLIDE_CONTENT.md` nếu cần phác nhanh nội dung.
- Sửa trực tiếp slide data trong `script.js` để đổi bố cục hoặc wording.
- `PROJECT_ANALYSIS.md` là tài liệu tóm tắt source làm nền cho deck.

## Đổi theme

- Màu sắc nằm trong `styles.css` ở phần `:root`.
- Logo đội GOKU nằm trong `assets/icons/goku-mark.svg`.
- Nếu muốn thay logo text bằng hình khác, giữ cùng kích thước để không phá layout cover.

## Lưu ý

- Bộ slide này dùng dữ liệu và kết luận dựa trên source code hiện tại của repository.
- Những phần còn echo, mock hoặc planned được ghi rõ để tránh overclaim.
