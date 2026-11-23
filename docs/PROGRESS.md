# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026

## Bước đã hoàn thành

- **Bước 0:** khung dự án, `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html` (bản tạm, đã thay ở Bước 2b-i).
- **Bước 1a:** `js/store.js`, `js/clock.js`. Đã kiểm tra: lưu và đọc khóa, đồng bộ giờ giữa hai tab, `subscribe` và hàm hủy hoạt động.
- **Bước 1b:** `js/config.js`, `js/seed.js`. Đã kiểm tra: `GOI_CHO_NGOI` có 6 phần tử, `resetDemoData()` nạp 7 tài khoản.
- **Bước 1c:** `js/api.js`. Đã xác nhận qua Bước 1d.
- **Bước 1d:** `js/rules.js`, `test.html`. Đã xác nhận đạt (105/105).
- **Bước 2a:** `bang-gia.html`, `phong-hop.html`. Đã xác nhận đạt.
- **Bước 2b-i:** `index.html` (trang chủ đầy đủ, thay bản tạm), `so-do-cho.html`. Đã xác nhận đạt.
- **Bước 2b-ii:** `gioi-thieu.html`, `quy-tac.html`, `cong-dong.html`, `tuyen-dung.html`, `gop-y.html`, `lien-he.html`. Đã xác nhận đạt.
- **Bước 2b-iii:** `dieu-khoan.html`, `chinh-sach-hoan-coc.html`, `chinh-sach-bao-mat.html`. Đã xác nhận đạt.
- **Bước 3a:** `js/api.js` (thêm `deleteUser`, bộ đếm mã khách `lumen-code-counter`), `js/seed.js` (thêm `lumen-current-user` và `lumen-code-counter` vào `KHOA_PHAT_SINH`). Đã xác nhận đạt.

## Đang chờ xác nhận

- **Bước 3b:** `dang-ky.html`, `dang-nhap.html`, `quen-mat-khau.html`, `tai-khoan.html`. Đã viết; cần kết quả checklist (đăng ký trùng, đăng nhập sai, đăng nhập nhanh Minh Anh thấy 88 giờ, chuyển hướng khi chưa đăng nhập, xóa tài khoản).

## Danh sách file

| File | Làm gì | Hàm và biến xuất ra |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, đổ bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | Không có |
| `js/ui.js` | Chèn header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ đầy đủ: hero, số liệu, widget mức đông, bản xem trước giá | Không có |
| `js/store.js` | Lưu trạng thái bằng localStorage (tiền tố `lumen24:`), đồng bộ tab bằng BroadcastChannel | `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy) |
| `js/clock.js` | Đồng hồ mô phỏng, trạng
