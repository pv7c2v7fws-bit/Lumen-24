# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026

## Bước đã hoàn thành

- **Bước 0:** khung dự án, `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html`.
- **Bước 1a:** `js/store.js`, `js/clock.js`. Đã kiểm tra: lưu và đọc khóa, đồng bộ giờ giữa hai tab, `subscribe` nhận thông báo từ tab khác, hàm hủy `subscribe` hoạt động.
- **Bước 1b:** `js/config.js`, `js/seed.js`. Đã kiểm tra: `GOI_CHO_NGOI` có 6 phần tử, `resetDemoData()` nạp 7 tài khoản.
- **Bước 1c:** `js/api.js`. Đã kiểm tra: đăng nhập sai tài khoản và sai mật khẩu cho hai thông báo riêng; đăng nhập đúng bằng email và số điện thoại; `getCurrentUser()` đồng bộ, không trễ, trả đúng dữ liệu mới nhất; đăng xuất xóa phiên ở mọi tab; tạo tài khoản mới sinh id và mã khách đúng; cập nhật không đổi được `id`, `code`, `createdAt`; kiểm tra trùng email và số điện thoại; `getConfig()` trả bản sao sâu, sửa bản sao không ảnh hưởng config gốc.

## Danh sách file

| File | Làm gì | Hàm và biến xuất ra |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, đổ bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | Không có |
| `js/ui.js` | Chèn header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ tạm | Không có |
| `js/store.js` | Lưu trạng thái bằng localStorage (tiền tố `lumen24:`), đồng bộ tab bằng BroadcastChannel | `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy) |
| `js/clock.js` | Đồng hồ mô phỏng, trạng thái lưu qua store | `now()`, `setTime(date)`, `setSpeed(1 \| 10 \| 60)`, `pause()`, `resume()`, `useRealTime()`, `getState()`, `subscribe(callback)` (trả về hàm hủy) |
| `js/config.js` | Nguồn duy nhất cho các con số (gói, phòng, menu, giờ, ngưỡng, tỷ lệ) | `TANG`, `TONG_CHO_TU_DO`, `CHO_TANG_1_2`, `GOI_CHO_NGOI`, `PHONG_HOP`, `MENU_DO_UONG`, `MENU_AN_NHE`, `MENU`, `NUOC_LOC`, `IN_AN`, `VAN_PHONG_PHAM`, `KHUNG_GIO`, `QUY_TAC`, `MUC_DONG_TEN` |
| `js/seed.js` | Dữ liệu demo ban đầu: 7 tài khoản, 3 CLB | `taoNguoiDungSeed()`, `taoClbSeed()`, `resetDemoData({ datLaiDongHo? })`, `KHOA_NGUOI_DUNG`, `KHOA_CLB`, `KHOA_DONG_HO`, `KHOA_PHAT_SINH`, `MAT_KHAU_DEMO` |
| `js/api.js` | Lớp truy cập dữ liệu: cấu hình, tài khoản, đăng nhập | `KHOA_DANG_NHAP`, `getConfig()`, `getCurrentUser()`, `getUsers()`, `getUserById(id)`, `saveUser(duLieu)`, `login(emailHoacSdt, matKhau)`, `logout()` |

## Quyết định đã chốt khác với tài liệu gốc

- **G-login:** đăng nhập sai dùng hai thông báo riêng: "Email hoặc số điện thoại không đúng. Vui lòng kiểm tra lại." (không có tài khoản) và "Mật khẩu không đúng. Vui lòng thử lại." (có tài khoản nhưng sai mật khẩu). Hệ thống thật nên dùng một thông báo chung để tránh rò thông tin.
- **G-seed:** `api.js` tự nạp 7 tài khoản từ `taoNguoiDungSeed()` khi khóa `users` chưa có hoặc không phải mảng. Mảng rỗng giữ nguyên, không nạp lại. Chỉ nạp `users`, không nạp `clubs`.
- **G-id:** id tài khoản mới là `u-` + `now().getTime().toString(36)` + 4 ký tự ngẫu nhiên (`Math.random`). Đây là ngoại lệ duy nhất cho quy tắc "không gọi `new Date()`": `now()` đọc giờ mô phỏng, còn `Math.random` chỉ ảnh hưởng dữ liệu lưu trữ, không ảnh hưởng thời gian. Ở Bước 3 sẽ cân nhắc dùng bộ đếm bền vững hơn.
- **G-code:** mã khách `LM-xxxxxx` lấy số lớn nhất trong danh sách hiện có cộng 1. Ở Bước 3 sẽ đổi sang bộ đếm lưu trong store để mã không bị dùng lại khi xóa tài khoản.
- **G-phone:** khi tạo mới, nếu `contact` là số điện thoại và `phone` để trống thì `phone` lấy bằng `contact`. Khi cập nhật, nếu không gửi `phone` thì giữ nguyên `phone` cũ.
- **G-contact:** `contact` và `phone` được lưu sau khi chuẩn hóa (email chữ thường, số điện thoại bỏ khoảng trắng).
- **G-role:** `saveUser` không có `id` nhận `role` nếu gửi lên và hợp lệ; mặc định `guest`. Trang đăng ký (Bước 3) không được truyền `role`.
- **G-config:** `getConfig()` trả bản sao sâu của mọi export trong `config.js`. Chưa hợp nhất giá trị do Admin chỉnh; việc đó thuộc M13 (Bước 9).

## Việc cần làm tiếp theo

**Bước 2 – M2 Trang công khai:** `index.html` đầy đủ, `gioi-thieu.html`, `bang-gia.html`, `phong-hop.html`, `quy-tac.html`, `cong-dong.html`, `tuyen-dung.html`, `gop-y.html`, `lien-he.html`, `dieu-khoan.html`, `chinh-sach-hoan-coc.html`, `chinh-sach-bao-mat.html`. Cần có: widget mức độ đông tầng (đọc từ store), khối so sánh Combo Trọn Ngày (tính tự động từ config), nhãn PHỔ BIẾN lấy từ trường `tag` của gói. File cần dán kèm khi giao AI: `js/api.js`, `js/config.js`, `js/clock.js`, `js/store.js`, `js/ui.js`.
