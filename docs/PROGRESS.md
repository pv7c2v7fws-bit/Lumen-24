# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026

## Bước đã hoàn thành

- **Bước 0:** khung dự án, `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html` (bản tạm, đã thay ở Bước 2b-i).
- **Bước 1a:** `js/store.js`, `js/clock.js`. Đã kiểm tra: lưu và đọc khóa, đồng bộ giờ giữa hai tab, `subscribe` và hàm hủy hoạt động.
- **Bước 1b:** `js/config.js`, `js/seed.js`. Đã kiểm tra: `GOI_CHO_NGOI` có 6 phần tử, `resetDemoData()` nạp 7 tài khoản.
- **Bước 1c:** `js/api.js`. Đã xác nhận qua Bước 1d.
- **Bước 1d:** `js/rules.js`, `test.html`. Đã xác nhận đạt.
- **Bước 2a:** `bang-gia.html`, `phong-hop.html`. Đã xác nhận đạt.
- **Bước 2b-i:** `index.html` (trang chủ đầy đủ, thay bản tạm), `so-do-cho.html`. Đã xác nhận đạt.

## Đang chờ xác nhận

- **Bước 2b-ii:** `gioi-thieu.html`, `quy-tac.html`, `cong-dong.html`, `tuyen-dung.html`, `gop-y.html`, `lien-he.html`. Đã viết; cần kết quả checklist (sáu trang mở được, form góp ý hiện thông báo demo, bố cục ở 360px).
- **Bước 2b-iii:** `dieu-khoan.html`, `chinh-sach-hoan-coc.html`, `chinh-sach-bao-mat.html`. Đã viết; cần kết quả checklist:
  - Ba trang mở được, có header và dải thông báo mô phỏng.
  - `chinh-sach-hoan-coc.html` hiện đúng "2 giờ" và "15 phút" lấy từ config; bảng cọc có 4 phòng (phòng 15-20 người cọc 160.000đ); ví dụ hiện mốc 12h00 hoàn cọc, 12h01 mất cọc.
  - `dieu-khoan.html` có bảng 6 gói đúng giá (Combo Trọn Ngày 89.000đ) và phụ phí vượt giờ 12.000đ.
  - Liên kết giữa ba trang hoạt động.
  - Bố cục không vỡ ở 360px, 768px, 1280px; Console không có lỗi đỏ.

## Danh sách file

| File | Làm gì | Hàm và biến xuất ra |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, đổ bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | Không có |
| `js/ui.js` | Chèn header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ đầy đủ: hero, số liệu, widget mức đông, bản xem trước giá | Không có |
| `js/store.js` | Lưu trạng thái bằng localStorage (tiền tố `lumen24:`), đồng bộ tab bằng BroadcastChannel | `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy) |
| `js/clock.js` | Đồng hồ mô phỏng, trạng thái lưu qua store | `now()`, `setTime(date)`, `setSpeed(1 \| 10 \| 60)`, `pause()`, `resume()`, `useRealTime()`, `subscribe(callback)` (trả về hàm hủy) |
| `js/config.js` | Nguồn duy nhất cho các con số | Các export in hoa (`GOI_CHO_NGOI`, `PHONG_HOP`, `SO_CHO_TANG`, `NGUONG_MO_TANG_3`, `QUY_TAC`, `KHUNG_GIO`, `TANG`...) |
| `js/seed.js` | Dữ liệu demo: 7 tài khoản, 3 CLB | `taoNguoiDungSeed()`, `resetDemoData()` |
| `js/api.js` | Lớp truy cập dữ liệu, giao diện chỉ gọi qua đây | `getConfig()`, `getUsers()`, `getUserById(id)`, `saveUser(user)`, `login(contact, password)`, `logout()`, `getCurrentUser()` |
| `js/rules.js` | Hàm thuần cho quy tắc R01-R31 | Theo mã R (`r09VuotGio`, `r13GiaPhong`...), `chuoiGioVN(thoiDiem)`, `VI_DU_KIEM_THU` |
| `test.html` | Trang kiểm thử R01-R31 (105 ví dụ) | Không có |
| `bang-gia.html` | Gói chỗ ngồi, Combo Trọn Ngày, phòng họp, menu, in ấn | Không có |
| `phong-hop.html` | Danh sách 4 phòng, nút đặt phòng | Không có |
| `so-do-cho.html` | Sơ đồ chỗ theo tầng, trạng thái tầng 3 theo khung giờ (bản tạm, thay bằng `rules.js` ở Bước 4) | Không có |
| `gioi-thieu.html`, `quy-tac.html`, `cong-dong.html`, `tuyen-dung.html`, `gop-y.html`, `lien-he.html` | Trang công khai còn lại (chờ xác nhận) | Không có |
| `dieu-khoan.html` | Bản nháp 5 mục (phạm vi, tài khoản, giờ và phí, hủy và hoàn cọc, giới hạn trách nhiệm); bảng gói và các con số đọc từ `getConfig()` (chờ xác nhận) | Không có |
| `chinh-sach-hoan-coc.html` | Quy tắc R17, R18: hạn hoàn cọc, chờ không đến, bảng cọc theo phòng, ví dụ mốc giờ và tiền; đọc từ `getConfig()` (chờ xác nhận) | Không có |
| `chinh-sach-bao-mat.html` | Dữ liệu được lưu và không lưu, mật khẩu giả, dữ liệu trong localStorage, cách xóa; không import `api.js` (chờ xác nhận) | Không có |

## Quyết định đã chốt khác với tài liệu gốc

- **G-login (M3, mục 5):** đăng nhập sai dùng hai thông báo riêng: "Email hoặc số điện thoại không đúng" và "Mật khẩu không đúng".
- **G-seed (mục 8):** `api.js` tự nạp 7 tài khoản khi khóa `users` chưa có hoặc không phải mảng. Chỉ nạp `users`, không nạp `clubs`.
- **G-id:** tài khoản mới có `id` dạng `u-` + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên. Phần ngẫu nhiên dùng `Math.random`, ngoại lệ duy nhất của quy tắc không gọi `new Date()`.
- **G-code:** mã khách `LM-` + số lớn nhất hiện có + 1. Đổi sang bộ đếm trong store ở Bước 3.
- **G-session:** khóa `lumen-current-user` lưu `id`, không lưu cả tài khoản.
- **G-reset:** `resetDemoData()` chưa xóa khóa đăng nhập. Thêm `lumen-current-user` vào `KHOA_PHAT_SINH` ở Bước 3.
- **G-latency:** `getConfig()` và `getCurrentUser()` không trễ. Các hàm còn lại trễ 200-500 ms.
- **G-password:** mật khẩu demo là chuỗi giả, không mã hóa.
- **G-voucher (M7, R22):** hạn voucher 30 ngày. Trang cộng đồng ghi 30 ngày.
- **G-luong (mục 5.5):** lương tuyển dụng ghi "Thỏa thuận khi phỏng vấn".
- **G-sumenh:** sứ mệnh và tầm nhìn là bản nháp, sẽ chỉnh sau.
- **G-vinhdanh:** khung vinh danh ở Bước 2b-ii chỉ là giữ chỗ. Dữ liệu thật làm ở Bước 11 (M7).
- **G-chinhsach (Bước 2b-iii):** ba trang chính sách chỉ đọc số liệu qua `getConfig()` (không import `config.js`, `store.js`, `rules.js`). Điều khoản là bản nháp, đầu trang ghi "Bản nháp cho bài tập, không có giá trị pháp lý". Ví dụ tiền ở trang hoàn cọc là phép nhân giá chuẩn để minh họa (chưa tính giảm giá), không phải quy tắc nghiệp vụ.
- **G-combodem:** `config.js` đang theo R07 và mục 12 (check-in 23h đến trước 6h, hết hiệu lực 7h), trong khi mục 4.6 và M4 ghi check-in 23h-7h. `dieu-khoan.html` hiển thị theo config nên sẽ tự đổi nếu sửa `checkInDen` thành 7. **Chưa chốt, cần bạn quyết định.**

## Việc đang làm

- **Bước 2b-ii:** chờ xác nhận checklist.
- **Bước 2b-iii:** chờ xác nhận checklist.

## Việc sẽ làm ở bước sau

- **Bước 3:** tài khoản (đăng ký, đăng nhập, `deleteUser`), đổi mã khách sang bộ đếm trong store, thêm `lumen-current-user` vào `KHOA_PHAT_SINH`.
- **Cập nhật `chinh-sach-bao-mat.html` (mục 5, cách xóa dữ liệu):** thêm dòng về "Xóa tài khoản" khi `deleteUser` có ở Bước 3, và về nút "Đặt lại dữ liệu demo" khi có ở Bước 7. Mục 4 hiện mô tả dữ liệu theo nhóm; khi có đủ khóa thật của `seed.js` và `clock.js` thì có thể ghi tên khóa cụ thể.
- **Chốt G-combodem** trước khi làm check-in (Bước 5), vì khung giờ combo đêm ảnh hưởng R07 và `test.html`.
