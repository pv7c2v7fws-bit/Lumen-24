# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026

## Bước đã hoàn thành

- **Bước 0:** khung dự án, `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html`.
- **Bước 1a:** `js/store.js`, `js/clock.js`. Đã kiểm tra: lưu và đọc khóa, đồng bộ giờ giữa hai tab, `subscribe` nhận thông báo từ tab khác, hàm hủy `subscribe` hoạt động.
- **Bước 1b:** `js/config.js`, `js/seed.js`. Đã kiểm tra: `GOI_CHO_NGOI` có 6 phần tử, `resetDemoData()` nạp 7 tài khoản.

## Danh sách file

| File | Làm gì | Hàm và biến xuất ra |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, đổ bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | Không có |
| `js/ui.js` | Chèn header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ tạm | Không có |
| `js/store.js` | Lưu trạng thái bằng localStorage (tiền tố `lumen24:`), đồng bộ tab bằng BroadcastChannel | `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy) |
| `js/clock.js` | Đồng hồ mô phỏng, trạng thái lưu qua store | `now()`, `setTime(date)`, `setSpeed(1 \| 10 \| 60)`, `pause()`, `resume()`, `useRealTime()`, `subscribe(callback)` (trả về hàm hủy) |
| `js/config.js` | Nguồn duy nhất cho các con số (gói, phòng, menu, giờ, ngưỡng, tỷ lệ) | Các export có tên in hoa, ví dụ `GOI_CHO_NGOI`, `PHONG_HOP`, `SO_CHO_TANG`, `NGUONG_MO_TANG_3` |
| `js/seed.js` | Dữ liệu demo ban đầu: 7 tài khoản, 3 CLB | `taoNguoiDungSeed()`, `resetDemoData()`, các khóa seed |

## Quyết định đã chốt khác với tài liệu gốc

- **G-login (mục 5 đặc tả):** đăng nhập sai dùng hai thông báo riêng: "Email hoặc số điện thoại không đúng" và "Mật khẩu không đúng". Hệ thống thật nên dùng một thông báo chung.
- **G-seed (mục 8):** `api.js` tự nạp 7 tài khoản khi khóa `users` chưa có hoặc không phải mảng. Mảng rỗng giữ nguyên. Chỉ nạp `users`,
