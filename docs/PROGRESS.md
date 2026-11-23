# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026

## Trạng thái nhanh

| Bước | Nội dung | Trạng thái |
| :-- | :-- | :-- |
| 0 | Khung dự án, `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html` | Xong |
| 1a | `js/store.js`, `js/clock.js` | Xong, đã kiểm tra |
| 1b | `js/config.js`, `js/seed.js` | Xong, đã kiểm tra |
| 1c | `js/api.js` | Đã viết, chờ xác nhận checklist đăng nhập và trùng email |
| 1d | `js/rules.js`, `test.html` | Đã viết, chờ kết quả `test.html` (mong đợi 105/105 đạt, 31 quy tắc) |
| 2a | `bang-gia.html`, `phong-hop.html` | Đã viết, chờ kiểm tra trên GitHub Pages |
| 2b | Các trang công khai còn lại | Chưa làm |

## Bước đã hoàn thành

### Bước 0: khung dự án
- `css/tokens.css`: biến màu, font, bo góc, đổ bóng trên `:root`.
- `css/style.css`: bố cục chung, responsive. Các class dùng chung: `container`, `btn`, `btn--primary`.
- `js/ui.js`: chèn dải thông báo mô phỏng, header, footer và menu ba gạch trên điện thoại. Gọi bằng `renderLayout()`.
- `index.html`: trang chủ tạm, chưa hoàn thiện.

### Bước 1a: lưu trạng thái và đồng hồ
- `js/store.js`: lưu bằng localStorage, tiền tố khóa `lumen24:`, đồng bộ giữa các tab bằng BroadcastChannel.
  - Hàm: `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy).
- `js/clock.js`: đồng hồ mô phỏng, trạng thái lưu qua store.
  - Hàm: `now()`, `setTime(date)`, `setSpeed(1 | 10 | 60)`, `pause()`, `resume()`, `useRealTime()`, `subscribe(callback)` (trả về hàm hủy).
- Đã kiểm tra: lưu và đọc khóa, đồng bộ giờ giữa hai tab, `subscribe` nhận thông báo từ tab khác, hàm hủy hoạt động.

### Bước 1b: cấu hình và dữ liệu mẫu
- `js/config.js`: nguồn duy nhất cho mọi con số (mục 4 của đặc tả). Các đối tượng được đóng băng.
  - Các export chính: `TANG`, `TONG_CHO_TU_DO`, `CHO_TANG_1_2`, `GOI_CHO_NGOI`, `PHONG_HOP`, `MENU_DO_UONG`, `MENU_AN_NHE`, `MENU`, `NUOC_LOC`, `IN_AN`, `VAN_PHONG_PHAM`, `KHUNG_GIO`, `QUY_TAC`, `MUC_DONG_TEN`.
- `js/seed.js`: 7 tài khoản demo và 3 CLB.
  - Hàm: `taoNguoiDungSeed()`, `resetDemoData()`. `resetDemoData()` đã kiểm tra nạp đủ 7 tài khoản; `GOI_CHO_NGOI` có 6 phần tử.

### Bước 1c: lớp truy cập dữ liệu
- `js/api.js`: giao diện chỉ gọi qua file này.
  - Hàm: `getConfig()` (đồng bộ), `getUsers()`, `getUserById(id)`, `saveUser(user)`, `login(contact, password)`, `logout()`, `getCurrentUser()` (đồng bộ).
  - Hàm async (trừ `getConfig` và `getCurrentUser`) trễ ngẫu nhiên 200-500 ms.
  - Chờ xác nhận: đăng nhập đúng và sai, đăng ký trùng email, đăng ký trùng số điện thoại.

### Bước 1d: quy tắc nghiệp vụ và kiểm thử
- `js/rules.js`: hàm thuần cho các quy tắc R01-R31, không đụng giao diện.
  - Đặt tên theo mã R, ví dụ `r09VuotGio(...)`, `r13GiaPhong(...)`. Thêm `chuoiGioVN(thoiDiem)` để đổi mili giây sang chuỗi múi giờ `+07:00`.
  - Mảng `VI_DU_KIEM_THU` chứa các ví dụ của mục 6.
- `test.html`: chạy toàn bộ ví dụ và hiện đạt hoặc không đạt ngay trên trình duyệt.
- Đang chờ: kết quả `test.html` trên GitHub Pages.

### Bước 2a: bảng giá và phòng họp (mới)
- `bang-gia.html`
  - Hiện gói chỗ ngồi từ `GOI_CHO_NGOI`, chỉ lọc theo `active`. Thẻ có `tag` được viền nổi bật và có nhãn.
  - Hiện menu đồ uống và ăn nhẹ từ `MENU_DO_UONG`, `MENU_AN_NHE`. Món `soldOut` hiện gạch ngang và nhãn "Hết hàng". Có dòng nước lọc "Miễn phí" trong thẻ đồ uống.
  - Hiện in ấn và văn phòng phẩm từ `IN_AN`, `VAN_PHONG_PHAM`. Ghi chú Combo Trọn Ngày được in miễn phí 10 tờ lấy từ `freeSheets`.
  - Đã bỏ: khối so sánh Combo Trọn Ngày và ô ghi chú nước lọc. Đây là thay đổi theo yêu cầu, không phải theo đặc tả (xem mục Quyết định).
- `phong-hop.html`
  - Hiện 4 phòng từ `PHONG_HOP`: sức chứa, thiết bị, giá chuẩn mỗi giờ, tiền cọc (giá chuẩn 1 giờ, lấy từ `QUY_TAC.cocPhongSoGio`).
  - Nút "Đặt phòng" trỏ tới `./dat-phong.html?phong=<mã>`. Trang đích chưa làm (M5).
- Cả hai trang
  - Gọi `renderLayout()`, đọc dữ liệu qua `getConfig()` từ `js/api.js`. Không gọi `store.js` hay localStorage trực tiếp.
  - Ảnh: thử nạp ảnh thật từ `images/`. Nếu file không có hoặc lỗi thì tự hiện khối "Ảnh minh họa" (nền gradient, không có lỗi ảnh vỡ).
  - Chưa kiểm tra trên GitHub Pages.

## Danh sách file hiện có

| File | Làm gì | Ghi chú |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | |
| `js/ui.js` | Header, footer, dải thông báo mô phỏng | `renderLayout()` |
| `index.html` | Trang chủ tạm | Chưa làm |
| `js/store.js` | Lưu trạng thái, đồng bộ tab | |
| `js/clock.js` | Đồng hồ mô phỏng | |
| `js/config.js` | Cấu hình gốc | Sửa giá tại đây (xem mục Vận hành) |
| `js/seed.js` | Dữ liệu demo | |
| `js/api.js` | Lớp truy cập dữ liệu | |
| `js/rules.js` | Quy tắc R01-R31 | |
| `test.html` | Kiểm thử quy tắc | |
| `bang-gia.html` | Bảng giá (Bước 2a) | |
| `phong-hop.html` | Danh sách phòng họp (Bước 2a) | |
| `images/` | Ảnh thật (chưa có) | Xem mục Ảnh |

## Ánh xạ hàm R theo module (dự kiến)

| Module | Hàm R cần dùng |
| :--- | :--- |
| M4 check-in, sơ đồ chỗ | `r01`-`r05`, `r06`-`r10`, `r12` |
| M5 đặt phòng | `r13`-`r21`: `r13GiaPhong` (giá), `r16Coc` (cọc), `r19KiemTraTrung` và `r20DieuKienDatPhong` (kiểm tra trước khi giữ) |
| M7 tích điểm | `r11`, `r22`, `r23`, `r24`, `r30` |
| M9 in ấn | `r25` → `r26` → `r27` → `r28` |
| M13 thẻ hè | `r29`, `r31` |

## Ảnh

- Ảnh phòng đặt trong `images/` với tên cố định: `room-3-5.jpg`, `room-7-10-1.jpg`, `room-7-10-2.jpg`, `room-15-20.jpg`.
- Ảnh menu: `menu-do-uong.jpg`, `menu-an-nhe.jpg`.
- Ánh xạ tên file nằm trong hai trang: `ANH_PHONG` ở `phong-hop.html` và `ANH_MENU` ở `bang-gia.html`. Đây là ngoại lệ so với quy tắc "mọi con số ở config.js" vì đường dẫn ảnh không phải dữ liệu nghiệp vụ.
- Đuôi phải là `.jpg` chữ thường. Tỷ lệ 16:10, dưới khoảng 300 KB mỗi ảnh.

## Quyết định đã chốt khác với đặc tả

| Mã | Nội dung | Lý do |
| :-- | :-- | :-- |
| G-login | Đăng nhập sai dùng hai thông báo riêng: "Email hoặc số điện thoại không đúng" và "Mật khẩu không đúng" | Dễ hiểu khi demo |
| G-seed | `api.js` tự nạp 7 tài khoản khi `users` chưa có hoặc không phải mảng. Mảng rỗng giữ nguyên. Không nạp `clubs` | Tránh nạp lại khi người dùng xóa hết |
| G-id | Tài khoản mới có `id` dạng `u-` + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên. Phần ngẫu nhiên dùng `Math.random`, là ngoại lệ duy nhất của quy tắc không gọi `new Date()` | Id không trùng |
| G-code | Mã khách `LM-` + số lớn nhất + 1. Đổi sang bộ đếm trong store ở Bước 3 | Mã không bị dùng lại khi xóa tài khoản |
| G-session | Khóa `lumen-current-user` chỉ lưu `id` | Luôn lấy dữ liệu mới nhất |
| G-reset | `resetDemoData()` chưa xóa khóa đăng nhập | Thêm vào `KHOA_PHAT_SINH` ở Bước 3 nếu muốn đăng xuất khi reset |
| G-latency | `getConfig()` và `getCurrentUser()` không trễ | Header gọi liên tục |
| G-password | Mật khẩu demo là chuỗi giả, không mã hóa | Chỉ dùng cho bài tập |
| G-combo-so-sanh | Bỏ khối so sánh Combo Trọn Ngày ở bảng giá (đặc tả mục 4.2 và M2 có yêu cầu) | Theo yêu cầu của chủ dự án, ngày 23/11/2026 |
| G-nuoc-loc | Bỏ ghi chú nước lọc miễn phí ở bảng giá (đặc tả mục 4.2 có yêu cầu). Giữ dòng nước lọc trong thẻ menu đồ uống | Theo yêu cầu, chờ xác nhận có bỏ luôn dòng trong menu không |
| G-anh | Khối ảnh giữ chỗ tự động thay khi ảnh thật không có | Chủ dự án chưa có ảnh |

## Mâu thuẫn trong đặc tả cần chốt

1. **Combo đêm check-in đến 6h hay 7h.** Mục 4.6 và M4 ghi 23h-7h. R07 và mục 12 #4 ghi 23h-6h, hết hiệu lực 7h. Hiện đang theo R07. Muốn đổi thì sửa `KHUNG_GIO.comboDem.checkInDen` trong `config.js`.
2. **Mức đông đúng 60%.** Đặc tả ghi "Vừa 30-60%" và "Đông 60-85%". Hiện xếp 60% vào "Đông".
3. **Thứ tự phòng họp trên bảng giá.** Mục 5.M2 có liệt kê phòng họp trong trang giá, nhưng yêu cầu Bước 2a chỉ có liên kết sang `phong-hop.html`.

## Việc sẽ làm tiếp

### Bước 2b: các trang công khai còn lại
- `index.html` (đầy đủ: hero, số liệu, 6 điểm mạnh, widget mức đông theo tầng, gallery, bản xem trước bảng giá).
- `gioi-thieu.html`, `cong-dong.html`, `tuyen-dung.html`, `lien-he.html`, `quy-tac.html`, `so-do-cho.html` (khung, dùng nội dung giả), `gop-y.html` (form, hoàn thiện ở M10).
- Ba trang chính sách: `dieu-khoan.html`, `chinh-sach-hoan-coc.html`, `chinh-sach-bao-mat.html`.

### Bước 3: tài khoản
- `dang-ky.html`, `dang-nhap.html`, `quen-mat-khau.html`, `tai-khoan.html`.
- Thêm `deleteUser` vào `api.js`. Đổi mã khách sang bộ đếm trong store. Thêm `lumen-current-user` vào `KHOA_PHAT_SINH`.

### Các bước còn lại
- Bước 4 (M6 thanh toán QR giả), Bước 5 (M4 check-in), Bước 6 (M5 đặt phòng), Bước 7 (M1 bảng điều khiển demo), Bước 8 (M11 màn hình nhân viên), Bước 9 (M13 quản trị cấu hình).
- Bước 10 (M12), Bước 11 (M7), Bước 12 (M8), Bước 13 (M9), Bước 14 (M10), Bước 15 (rà soát và README).
- Đề xuất: đưa M13 lên sớm để đổi giá trong lúc demo mà không phải commit lại.

## Vận hành: sửa giá ở đâu

Sửa trong `js/config.js`. Các trang khác tự đổi theo.

| Muốn đổi | Trường trong `js/config.js` |
| :-- | :-- |
| Giá gói chỗ ngồi | `GOI_CHO_NGOI` → `price` |
| Tắt bán một gói | `GOI_CHO_NGOI` → `active: false` |
| Chuyển nhãn PHỔ BIẾN | `GOI_CHO_NGOI` → `tag` |
| Giá phòng mỗi giờ | `PHONG_HOP` → `pricePerHour` |
| Giá đồ uống, ăn nhẹ | `MENU_DO_UONG`, `MENU_AN_NHE` → `price` |
| Hết hàng | `soldOut: true` |
| Giá in | `IN_AN` → `donGia`, `donGiaSi`, `nguongGiaSi` |
| Văn phòng phẩm | `VAN_PHONG_PHAM` → `price` |
| Phụ phí, giảm giá, cọc | `QUY_TAC` → `phiVuotGioMoiGio`, `giamThapDiemPhanTram`, `giamClbPhanTram`, `cocPhongSoGio` |

Quy ước: tiền là số nguyên đồng, không có dấu chấm (ví dụ `79000`). Chỉ đổi con số, giữ nguyên dấu phẩy và ngoặc.

Lưu ý: `test.html` có thể báo không đạt sau khi đổi giá, vì ví dụ kiểm thử đang ghi theo giá cũ. Đây là bình thường.

## Checklist kiểm tra trên GitHub Pages

### Bước 2a
- [ ] `bang-gia.html`: hiện 6 gói chỗ ngồi, Combo Trọn Ngày có nhãn PHỔ BIẾN.
- [ ] `bang-gia.html`: không còn khối so sánh Combo và ô ghi chú nước lọc.
- [ ] `bang-gia.html`: menu hiện 8 đồ uống (có dòng Nước lọc "Miễn phí") và 4 món ăn nhẹ.
- [ ] `bang-gia.html`: in ấn ghi 1.000đ/tờ và 700đ/tờ từ 50 tờ, có 5 món văn phòng phẩm.
- [ ] `phong-hop.html`: hiện 4 phòng, giá 60.000đ, 90.000đ, 90.000đ, 160.000đ mỗi giờ.
- [ ] `phong-hop.html`: nút Đặt phòng trỏ đúng `?phong=r35`, `r710a`, `r710b`, `r1520`.
- [ ] Cả hai trang: có header và dải thông báo; không lỗi "undefined" hay "NaN"; không vỡ bố cục ở 360 px.
- [ ] Ảnh chưa có hiện khối "Ảnh minh họa"; thêm ảnh đúng tên thì ảnh tự hiện.

### Bước 1d
- [ ] `test.html`: 105/105 đạt, 31 quy tắc.

### Bước 1c
- [ ] Đăng nhập đúng và sai, đăng ký trùng email và số điện thoại báo lỗi tiếng Việt.

## Lịch sử cập nhật

| Ngày | Nội dung |
| :-- | :-- |
| 18/11/2026 | Bước 0 |
| 19-21/11/2026 | Bước 1a, 1b |
| 22/11/2026 | Bước 1c, 1d |
| 23/11/2026 | Bước 2a; bỏ khối so sánh Combo và ghi chú nước lọc; thêm cơ chế ảnh giữ chỗ |
