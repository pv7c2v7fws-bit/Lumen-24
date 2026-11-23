# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026

## Bước đã hoàn thành

- **Bước 0:** khung dự án, `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html`.
- **Bước 1a:** `js/store.js`, `js/clock.js`. Đã kiểm tra: lưu và đọc khóa, đồng bộ giờ giữa hai tab, `subscribe` nhận thông báo từ tab khác, hàm hủy `subscribe` hoạt động.
- **Bước 1b:** `js/config.js`, `js/seed.js`. Đã kiểm tra: `GOI_CHO_NGOI` có 6 phần tử, `resetDemoData()` nạp 7 tài khoản.
- **Bước 1c:** `js/api.js`. Đã viết; chờ xác nhận checklist đăng nhập và trùng email.

## Đang chờ xác nhận

- **Bước 1d:** `js/rules.js`, `test.html`. Đã viết; cần kết quả trang `test.html` (mong đợi 105/105 đạt, 31 quy tắc). Chưa đánh dấu xong.

## Danh sách file

| File | Làm gì | Hàm và biến xuất ra |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, đổ bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | Không có |
| `js/ui.js` | Chèn header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ tạm | Không có |
| `js/store.js` | Lưu trạng thái bằng localStorage (tiền tố `lumen24:`), đồng bộ tab bằng BroadcastChannel | `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy) |
| `js/clock.js` | Đồng hồ mô phỏng, trạng thái lưu qua store | `now()`, `setTime(date)`, `setSpeed(1 \| 10 \| 60)`, `pause()`, `resume()`, `useRealTime()`, `subscribe(callback)` (trả về hàm hủy) |
| `js/config.js` | Nguồn duy nhất cho các con số | Các export in hoa, ví dụ `GOI_CHO_NGOI`, `PHONG_HOP`, `SO_CHO_TANG`, `NGUONG_MO_TANG_3` |
| `js/seed.js` | Dữ liệu demo: 7 tài khoản, 3 CLB | `taoNguoiDungSeed()`, `resetDemoData()` |
| `js/api.js` | Lớp truy cập dữ liệu, giao diện chỉ gọi qua đây | `getConfig()`, `getUsers()`, `getUserById(id)`, `saveUser(user)`, `login(contact, password)`, `logout()`, `getCurrentUser()` |
| `js/rules.js` | Hàm thuần cho quy tắc R01-R31 | Theo mã R, ví dụ `r09VuotGio(...)`, `r13GiaPhong(...)`, `chuoiGioVN(thoiDiem)`; mảng `VI_DU_KIEM_THU` |
| `test.html` | Trang kiểm thử các ví dụ R01-R31 | Không có |

## Ánh xạ hàm R theo module (dự kiến dùng)

| Module | Hàm R cần dùng |
| :--- | :--- |
| M4 check-in, sơ đồ chỗ | `r01`-`r05`, `r06`-`r10`, `r12` |
| M5 đặt phòng | `r13`-`r21`: `r13GiaPhong` (giá), `r16Coc` (cọc), `r19KiemTraTrung` và `r20DieuKienDatPhong` (kiểm tra trước khi giữ) |
| M7 tích điểm | `r11`, `r22`, `r23`, `r24`, `r30` |
| M9 in ấn | chuỗi `r25` → `r26` → `r27` → `r28` |
| M13 thẻ hè | `r29`, `r31` |
| Giờ | `chuoiGioVN(thoiDiem)`: đổi mili giây sang chuỗi `+07:00`; truyền `now()` trực tiếp |

## Quyết định đã chốt khác với tài liệu gốc

- **G-login (mục 5):** đăng nhập sai dùng hai thông báo riêng: "Email hoặc số điện thoại không đúng" và "Mật khẩu không đúng".
- **G-seed (mục 8):** `api.js` tự nạp 7 tài khoản khi khóa `users` chưa có hoặc không phải mảng. Mảng rỗng giữ nguyên. Chỉ nạp `users`, không nạp `clubs`.
- **G-id:** tài khoản mới có `id` dạng `u-` + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên. Phần ngẫu nhiên dùng `Math.random`, ngoại lệ duy nhất của quy tắc không gọi `new Date()`.
- **G-code:** mã khách `LM-` + số lớn nhất hiện có + 1. Đổi sang bộ đếm trong store ở Bước 3.
- **G-session:** khóa `lumen-current-user` lưu `id`, không lưu cả tài khoản.
- **G-reset:** `resetDemoData()` chưa xóa khóa đăng nhập. Thêm `lumen-current-user` vào `KHOA_PHAT_SINH` ở Bước 3 nếu muốn đăng xuất khi reset.
- **G-latency:** `getConfig()` và `getCurrentUser()` không trễ. Các hàm còn lại trễ 200-500 ms.
- **G-password:** mật khẩu demo là chuỗi giả, không mã hóa.

## Việc sẽ làm ở bước sau

- **Bước 2:** trang công khai và bảng giá (đọc từ `config.js`).
- **Bước 3:** tài khoản (`deleteUser`), đổi mã khách sang bộ đếm trong store, thêm `lumen-current-user` vào `KHOA_PHAT_SINH`.
