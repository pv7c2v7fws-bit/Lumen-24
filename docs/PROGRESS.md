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
- **Bước 4a:** `js/seed.js` (thêm `lumen-payments`, `lumen-outage` vào `KHOA_PHAT_SINH`, thêm `taoThanhToanSeed()`), `js/api.js` (thêm 8 hàm thanh toán). Đã viết; cần kết quả checklist Console: đơn 89.000đ có phí 890đ; xác nhận hai lần chỉ ghi một giao dịch; `thatBaiThanhToan`; tiến đồng hồ 11 phút thì đơn thành `het-han`; `hoanCoc` còn 2h00 thành `da-hoan`, còn 1h59 thành `mat-coc`.

## Bước tiếp theo

- **Bước 4b:** giao diện thanh toán dùng chung (màn hình QR giả, đếm ngược 10 phút, hai nút mô phỏng) và trang lịch sử giao dịch. Làm sau khi Bước 4a được xác nhận.

## Quyết định đã chốt ở Bước 4a (M6)

- Khóa store: `lumen-payments` (mảng thanh toán, seed là mảng rỗng) và `lumen-outage` (boolean, mặc định `false`). Cả hai nằm trong `KHOA_PHAT_SINH`.
- Mã thanh toán: `p-` + mốc thời gian hệ 36 + 4 ký tự ngẫu nhiên.
- Hạn đơn: 10 phút, lấy từ `QUY_TAC.thoiGianGiuPhongPhut`, dùng cho mọi loại giao dịch. Hết hạn kiểm tra lười (khi đọc hoặc xử lý, không có bộ hẹn giờ ngầm), điều kiện `now() >= hetHanLuc`.
- Chuyển trạng thái: `cho-thanh-toan` → `da-thanh-toan` | `that-bai` | `het-han`; `da-thanh-toan` (chỉ cọc phòng) → `da-hoan` | `mat-coc`. Các trạng thái khác là cuối.
- Đơn tạo lúc bật `lumen-outage` có `thuCong: true`; hệ thống không tự xử lý, UI ẩn hai nút mô phỏng. Điểm vào cho chế độ dự phòng ở Bước 11.
- `hoanCoc` chỉ đổi trạng thái đơn cọc (ghi thêm `xuLyCocLuc`), không tạo giao dịch loại `hoan-coc`.
- `tongHopThu` chỉ cộng đơn `da-thanh-toan` theo ngày `thanhToanLuc` (giờ Việt Nam); đơn `mat-coc` chưa tính vào doanh thu. **Cần xem lại ở Bước 10 (đối soát).**

## Danh sách file

Lưu ý: bản PROGRESS.md được dán vào cuộc trò chuyện bị cắt ở giữa bảng này (sau dòng `js/clock.js`). Các dòng bên dưới là phần nhìn thấy được và các file đã biết; hãy giữ lại các dòng khác (`js/rules.js`, `test.html`, các trang HTML...) từ bản gốc của bạn.

| File | Làm gì | Hàm và biến xuất ra |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, đổ bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | Không có |
| `js/ui.js` | Chèn header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ đầy đủ: hero, số liệu, widget mức đông, bản xem trước giá | Không có |
| `js/store.js` | Lưu trạng thái bằng localStorage (tiền tố `lumen24:`), đồng bộ tab bằng BroadcastChannel | `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy) |
| `js/clock.js` | Đồng hồ mô phỏng, mặc định 10/11/2027 20h | `now()`, `setTime(date)`, `setSpeed(n)`, `pause()`, `resume()`, `useRealTime()`, `getState()`, `subscribe(cb)`, `TOC_DO_HOP_LE` |
| `js/config.js` | Nguồn duy nhất cho giá, giờ, ngưỡng (đóng băng) | `TANG`, `TONG_CHO_TU_DO`, `CHO_TANG_1_2`, `GOI_CHO_NGOI`, `PHONG_HOP`, `MENU_DO_UONG`, `MENU_AN_NHE`, `MENU`, `NUOC_LOC`, `IN_AN`, `VAN_PHONG_PHAM`, `KHUNG_GIO`, `QUY_TAC`, `MUC_DONG_TEN` |
| `js/seed.js` | Dữ liệu giả ban đầu, tên khóa store, đặt lại dữ liệu demo | `taoNguoiDungSeed()`, `taoClbSeed()`, `taoThanhToanSeed()`, `boDemMaSeed()`, `resetDemoData(opts)`, `MAT_KHAU_DEMO`, `KHOA_NGUOI_DUNG`, `KHOA_CLB`, `KHOA_DONG_HO`, `KHOA_DANG_NHAP`, `KHOA_BO_DEM_MA`, `KHOA_THANH_TOAN`, `KHOA_GIAN_DOAN`, `KHOA_PHAT_SINH` |
| `js/api.js` | Lớp truy cập dữ liệu (trễ 200-500 ms, trừ hàm ghi là đồng bộ) | Cấu hình: `getConfig()` (đồng bộ). Tài khoản: `getUsers()`, `getUserById(id)`, `saveUser(data)`, `deleteUser(id)`, `login(a, b)`, `logout()`, `getCurrentUser()` (đồng bộ). Thanh toán (4a): `taoThanhToan({loai, refId, userId, tien})`, `layThanhToan(id)`, `xacNhanThanhToan(id)`, `thatBaiThanhToan(id)`, `hoanCoc(id, {gioBatDau, huyLuc})`, `lichSuGiaoDich(userId, {loai, thang})`, `tongHopThu(ngay)`, `batTatGianDoan(bat)`. Hằng số: `LOAI_GIAO_DICH`, `TEN_LOAI_GIAO_DICH`, `TRANG_THAI_THANH_TOAN`, `TEN_TRANG_THAI_THANH_TOAN`, `KHOA_DANG_NHAP`, `KHOA_BO_DEM_MA`, `KHOA_THANH_TOAN`, `KHOA_GIAN_DOAN` |
