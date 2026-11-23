# Tiến độ dự án Lumen 24

Cập nhật lần cuối: 23/11/2026 (sau Bước 2b-i)

## Trạng thái nhanh

| Bước | Nội dung | Trạng thái |
| :-- | :-- | :-- |
| 0 | Khung dự án: `css/tokens.css`, `css/style.css`, `js/ui.js`, `index.html` | Xong |
| 1a | `js/store.js`, `js/clock.js` | Xong, đã kiểm tra |
| 1b | `js/config.js`, `js/seed.js` | Xong, đã kiểm tra |
| 1c | `js/api.js` | Đã viết, chờ kiểm tra đăng nhập và trùng email, số điện thoại |
| 1d | `js/rules.js`, `test.html` | Đã viết, chờ kết quả `test.html` (mong đợi 105/105 đạt, 31 quy tắc) |
| 2a | `bang-gia.html`, `phong-hop.html` | Đã viết, chờ kiểm tra trên GitHub Pages |
| 2b-i | `index.html` (đầy đủ), `so-do-cho.html` | Đã viết, chờ kiểm tra trên GitHub Pages |
| 2b-ii | Các trang công khai còn lại | Chưa làm |

## Bước đã hoàn thành

### Bước 0: khung dự án
- `css/tokens.css`: biến màu, font, bo góc, đổ bóng trên `:root`.
- `css/style.css`: bố cục chung, responsive. Các lớp dùng chung: `container`, `btn`, `btn--primary`.
- `js/ui.js`: dải thông báo mô phỏng, header, footer, menu ba gạch trên điện thoại. Gọi bằng `renderLayout()`.

### Bước 1a: lưu trạng thái và đồng hồ
- `js/store.js`: lưu bằng localStorage, tiền tố khóa `lumen24:`, đồng bộ giữa các tab bằng BroadcastChannel.
  - Hàm: `get(key)`, `set(key, value)`, `remove(key)`, `subscribe(key, callback)` (trả về hàm hủy).
- `js/clock.js`: đồng hồ mô phỏng, trạng thái lưu qua store.
  - Hàm: `now()`, `setTime(date)`, `setSpeed(1 | 10 | 60)`, `pause()`, `resume()`, `useRealTime()`, `getState()`, `subscribe(callback)` (trả về hàm hủy).

### Bước 1b: cấu hình và dữ liệu mẫu
- `js/config.js`: nguồn duy nhất cho các con số (mục 4 của đặc tả). Các đối tượng được đóng băng.
  - Export chính: `TANG`, `TONG_CHO_TU_DO`, `CHO_TANG_1_2`, `GOI_CHO_NGOI`, `PHONG_HOP`, `MENU_DO_UONG`, `MENU_AN_NHE`, `MENU`, `NUOC_LOC`, `IN_AN`, `VAN_PHONG_PHAM`, `KHUNG_GIO`, `QUY_TAC`, `MUC_DONG_TEN`.
- `js/seed.js`: 7 tài khoản demo và 3 CLB.
  - Hàm: `taoNguoiDungSeed()`, `resetDemoData()`.

### Bước 1c: lớp truy cập dữ liệu
- `js/api.js`: giao diện chỉ gọi qua file này.
  - Hàm đồng bộ: `getConfig()`, `getCurrentUser()`.
  - Hàm async (trễ 200-500 ms): `getUsers()`, `getUserById(id)`, `saveUser(user)`, `login(contact, password)`, `logout()`.
  - Chờ kiểm tra: đăng nhập đúng và sai, đăng ký trùng email, đăng ký trùng số điện thoại.

### Bước 1d: quy tắc nghiệp vụ và kiểm thử
- `js/rules.js`: hàm thuần cho các quy tắc R01-R31, không đụng giao diện.
  - Đặt tên theo mã R, ví dụ `r09VuotGio(...)`, `r13GiaPhong(...)`. Có `chuoiGioVN(thoiDiem)` đổi mili giây sang chuỗi múi giờ `+07:00`.
  - Mảng `VI_DU_KIEM_THU` chứa các ví dụ của mục 6.
- `test.html`: chạy toàn bộ ví dụ, hiện đạt hoặc không đạt ngay trên trình duyệt. Đang chờ kết quả trên GitHub Pages.

### Bước 2a: bảng giá và phòng họp
- `bang-gia.html`
  - Gói chỗ ngồi từ `GOI_CHO_NGOI`, chỉ lọc theo `active`. Gói có `tag` được viền nổi bật và có nhãn.
  - Menu từ `MENU_DO_UONG`, `MENU_AN_NHE`. Món `soldOut` hiện gạch ngang và nhãn "Hết hàng". Có dòng nước lọc "Miễn phí" trong thẻ đồ uống.
  - In ấn và văn phòng phẩm từ `IN_AN`, `VAN_PHONG_PHAM`. Ghi chú Combo Trọn Ngày in miễn phí 10 tờ lấy từ `freeSheets`.
  - Đã bỏ khối so sánh Combo Trọn Ngày và ô ghi chú nước lọc (xem G-combo-so-sanh, G-nuoc-loc).
- `phong-hop.html`
  - 4 phòng từ `PHONG_HOP`: sức chứa, thiết bị, giá chuẩn mỗi giờ, tiền cọc (giá 1 giờ, lấy từ `QUY_TAC.cocPhongSoGio`).
  - Nút "Đặt phòng" trỏ tới `./dat-phong.html?phong=<mã>`. Trang đích chưa làm (M5).
- Cả hai trang gọi `renderLayout()` và đọc dữ liệu qua `getConfig()`. Không gọi `store.js` hay localStorage trực tiếp.
- Ảnh: thử nạp ảnh thật từ `images/`. Không có file hoặc lỗi thì hiện khối "Ảnh minh họa".

### Bước 2b-i: trang chủ và sơ đồ chỗ ngồi
- `index.html` (thay bản tạm)
  - Hero với hai nút "Đặt lịch" (`./dat-phong.html`) và "Xem combo" (`./bang-gia.html`).
  - Số liệu nổi bật: 24/7, 300 m² (hằng số trong file), chỗ ngồi tự do từ `TONG_CHO_TU_DO`, số phòng và sức chứa tối đa từ `PHONG_HOP`.
  - Sáu điểm mạnh, mỗi thẻ có biểu tượng SVG nội tuyến.
  - Widget mức đông theo tầng: số khách giả lập, nhãn Vắng, Vừa, Đông, Gần kín theo ngưỡng trong `QUY_TAC.mucDong`. Tầng 3 hiện "Mở chỗ tự do", "Chỉ phòng họp" hoặc "Đóng". Cập nhật qua `clock.subscribe` và `setInterval` 5 giây.
  - Gallery 4 khối: dùng `images/space-1.jpg` đến `space-4.jpg` nếu có, không thì hiện khối "Ảnh minh họa".
  - Bản xem trước bảng giá: gói 1 giờ, gói 3 giờ, Combo Trọn Ngày (có nhãn PHỔ BIẾN).
  - Lời kêu gọi hành động cuối trang.
- `so-do-cho.html` (mới)
  - Sơ đồ 3 tầng, mỗi tầng có lưới ô bàn (30, 28, 22 ô), số chỗ trống trên tổng, thanh màu và nhãn mức đông.
  - Chú giải ba kiểu ô: trống, có người, tạm rời.
  - Tầng 3 hiện trạng thái theo khung giờ. Khi đóng hoặc chỉ phòng họp thì không vẽ lưới.
  - Tổng toàn quán ở cuối trang.
- Dữ liệu khách giả lập: hai trang dùng chung một khối hàm, được chép giống hệt ở cả hai file. Chưa đưa vào `api.js` hay `rules.js`.

## Danh sách file hiện có

| File | Làm gì | Ghi chú |
| :--- | :--- | :--- |
| `css/tokens.css` | Biến màu, font, bo góc, bóng | Biến CSS trên `:root` |
| `css/style.css` | Bố cục chung, responsive | |
| `js/ui.js` | Header, footer, dải thông báo mô phỏng | `renderLayout()`, logo đang trỏ `./logo.png` |
| `js/store.js` | Lưu trạng thái, đồng bộ tab | |
| `js/clock.js` | Đồng hồ mô phỏng | |
| `js/config.js` | Cấu hình gốc | Sửa giá tại đây |
| `js/seed.js` | Dữ liệu demo | |
| `js/api.js` | Lớp truy cập dữ liệu | |
| `js/rules.js` | Quy tắc R01-R31 | |
| `index.html` | Trang chủ | Bước 2b-i |
| `so-do-cho.html` | Sơ đồ chỗ ngồi | Bước 2b-i, công khai |
| `bang-gia.html` | Bảng giá | Bước 2a |
| `phong-hop.html` | Danh sách phòng họp | Bước 2a |
| `test.html` | Kiểm thử quy tắc | Bước 1d |
| `images/` | Ảnh thật | Chưa có, dùng khối giữ chỗ |

## Ánh xạ hàm R theo module (dự kiến)

| Module | Hàm R cần dùng |
| :--- | :--- |
| M4 check-in, sơ đồ chỗ | `r01`-`r05`, `r06`-`r10`, `r12` |
| M5 đặt phòng | `r13`-`r21`: `r13GiaPhong`, `r16Coc`, `r19KiemTraTrung`, `r20DieuKienDatPhong` |
| M7 tích điểm | `r11`, `r22`, `r23`, `r24`, `r30` |
| M9 in ấn | `r25` → `r26` → `r27` → `r28` |
| M13 thẻ hè | `r29`, `r31` |

## Ảnh

- Ảnh phòng trong `images/`: `room-3-5.jpg`, `room-7-10-1.jpg`, `room-7-10-2.jpg`, `room-15-20.jpg`.
- Ảnh menu: `menu-do-uong.jpg`, `menu-an-nhe.jpg`.
- Ảnh không gian (gallery trang chủ): `space-1.jpg` đến `space-4.jpg`.
- Ánh xạ tên file ảnh phòng và menu nằm trong `phong-hop.html` (`ANH_PHONG`) và `bang-gia.html` (`ANH_MENU`). Đây là ngoại lệ so với quy tắc "mọi con số ở config.js", vì đường dẫn ảnh không phải dữ liệu nghiệp vụ.
- Đuôi `.jpg` chữ thường, tỷ lệ 16:10, dưới khoảng 300 KB mỗi ảnh.

## Quyết định đã chốt khác với đặc tả

| Mã | Nội dung | Lý do |
| :-- | :-- | :-- |
| G-login | Đăng nhập sai dùng hai thông báo riêng: "Email hoặc số điện thoại không đúng" và "Mật khẩu không đúng" | Dễ hiểu khi demo |
| G-seed | `api.js` tự nạp 7 tài khoản khi `users` chưa có hoặc không phải mảng. Mảng rỗng giữ nguyên. Không nạp `clubs` | Tránh nạp lại khi người dùng xóa hết |
| G-id | Tài khoản mới có `id` dạng `u-` + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên. Ngẫu nhiên dùng `Math.random`, là ngoại lệ duy nhất của quy tắc không gọi `new Date()` | Id không trùng |
| G-code | Mã khách `LM-` + số lớn nhất + 1. Đổi sang bộ đếm trong store ở Bước 3 | Mã không bị dùng lại khi xóa tài khoản |
| G-session | Khóa `lumen-current-user` chỉ lưu `id` | Luôn lấy dữ liệu mới nhất |
| G-reset | `resetDemoData()` chưa xóa khóa đăng nhập | Thêm vào `KHOA_PHAT_SINH` ở Bước 3 nếu muốn đăng xuất khi reset |
| G-latency | `getConfig()` và `getCurrentUser()` không trễ | Header gọi liên tục |
| G-password | Mật khẩu demo là chuỗi giả, không mã hóa | Chỉ dùng cho bài tập |
| G-combo-so-sanh | Bỏ khối so sánh Combo Trọn Ngày ở bảng giá (đặc tả mục 4.2 và M2 có yêu cầu) | Theo yêu cầu của chủ dự án, 23/11/2026 |
| G-nuoc-loc | Bỏ ghi chú nước lọc miễn phí ở bảng giá (đặc tả mục 4.2 có yêu cầu). Giữ dòng nước lọc trong thẻ menu đồ uống | Theo yêu cầu, chờ xác nhận có bỏ luôn dòng trong menu không |
| G-anh | Khối ảnh giữ chỗ tự động thay khi ảnh thật không có | Chủ dự án chưa có ảnh |
| G-tang3 | Trạng thái tầng 3 ba mức (mở, chỉ phòng họp, đóng) theo khung giờ, dùng chung cho trang chủ và sơ đồ | Khớp R03 và nghiệm thu M1 |

## Mâu thuẫn trong đặc tả cần chốt

1. **Combo đêm check-in đến 6h hay 7h.** Mục 4.6 và M4 ghi 23h-7h. R07 và mục 12 #4 ghi 23h-6h, hết hiệu lực 7h. Hiện theo R07. Muốn đổi thì sửa `KHUNG_GIO.comboDem.checkInDen` trong `config.js`.
2. **Mức đông đúng 60%.** Đặc tả ghi "Vừa 30-60%" và "Đông 60-85%". Hiện xếp 60% vào "Đông".
3. **Thứ tự phòng họp trên bảng giá.** Mục 5.M2 liệt kê phòng họp trong trang giá, nhưng Bước 2a chỉ có liên kết sang `phong-hop.html`.
4. **Tầng 3 khi tầng 1-2 vượt 85%.** R02 cho phép tầng 3 mở ngoài giờ cao điểm. Bản tạm ở 2b-i chưa có điều kiện này, sẽ bổ sung khi dùng `rules.js`.

## Nợ kỹ thuật cần xử lý

- **Khối tính khách giả lập bị lặp** trong `index.html` và `so-do-cho.html`. Chuyển vào `js/rules.js` (hàm `trangThaiTang3`, `mucDongTu`, `tinhTrangThaiQuan`) và `js/api.js` (`soNguoiGiaLap`) ở Bước 5.
- **Chú thích trong `index.html` và `so-do-cho.html`** ghi "thay bằng rules.js ở Bước 4". Đúng là Bước 5 (check-in và sơ đồ chỗ), vì Bước 4 là thanh toán QR. Sửa khi làm Bước 5.
- **Hằng số 300 m²** nằm trong `index.html`. Chuyển sang `config.js` khi có đợt sửa file đó.
- **Logo:** `index.html` và `so-do-cho.html` khai báo `apple-touch-icon` là `android-chrome-512x512.png`, nhưng header (trong `ui.js`) vẫn trỏ `./logo.png`. Cần quyết định: đổi tên file, hoặc đổi `DUONG_DAN_LOGO` trong `ui.js`.
- **Màu:** các lớp `lm-*` dùng `var(--mau-chu)` và `var(--mau-nhan)` kèm giá trị dự phòng. Chưa đối chiếu với `tokens.css`. Cần dán `tokens.css` để kiểm tra tên biến.

## Checklist kiểm tra trên GitHub Pages

### Bước 2b-i
- [ ] `index.html`: hero, hai nút đúng đường dẫn; số liệu 80 chỗ và 4 phòng.
- [ ] `index.html`: widget hiện 3 tầng; ở 10/11/2027 20h, nhãn đúng ngưỡng; có dòng ghi chú dữ liệu giả.
- [ ] `index.html`: gallery 4 khối, không vỡ bố cục ở 360 px.
- [ ] `index.html`: bản xem trước có 3 gói, có liên kết xem đầy đủ.
- [ ] `so-do-cho.html`: 3 tầng, lưới đúng số ô (30, 28, 22), chú giải đủ ba kiểu.
- [ ] `so-do-cho.html`: đổi giờ bằng `clock.setTime`: 14h tầng 3 "Chỉ phòng họp"; 2h tầng 3 "Đóng"; 20h tầng 3 "Mở chỗ tự do" với 22 ô.
- [ ] Hai tab cùng trình duyệt: đổi giờ ở tab này, tab kia cập nhật trong vài giây.
- [ ] Số chỗ trống ở `so-do-cho.html` khớp widget trang chủ cùng giờ.

### Bước 2a
- [ ] `bang-gia.html`: 6 gói, Combo Trọn Ngày có nhãn PHỔ BIẾN; không còn khối so sánh và ô nước lọc.
- [ ] `bang-gia.html`: menu 8 đồ uống (có Nước lọc "Miễn phí") và 4 món ăn nhẹ; in ấn 1.000đ và 700đ từ 50 tờ; 5 món văn phòng phẩm.
- [ ] `phong-hop.html`: 4 phòng, giá 60.000đ, 90.000đ, 90.000đ, 160.000đ mỗi giờ; nút Đặt phòng trỏ đúng `?phong=`.
- [ ] Cả hai trang: không có "undefined" hay "NaN", không vỡ bố cục ở 360 px.

### Bước 1d và 1c
- [ ] `test.html`: 105/105 đạt, 31 quy tắc.
- [ ] Đăng nhập đúng và sai; đăng ký trùng email và số điện thoại báo lỗi tiếng Việt.

## Việc tiếp theo

### Bước 2b-ii: các trang công khai còn lại
- `gioi-thieu.html`, `cong-dong.html`, `tuyen-dung.html`, `lien-he.html`, `quy-tac.html`.
- `gop-y.html`: giao diện form cơ bản. Hoàn thiện ở M10 (Bước 14).
- `dieu-khoan.html`, `chinh-sach-hoan-coc.html`, `chinh-sach-bao-mat.html`. Chính sách hoàn cọc lấy đúng quy tắc R17.

### Bước 3: tài khoản
- `dang-ky.html`, `dang-nhap.html`, `quen-mat-khau.html`, `tai-khoan.html`.
- Thêm `deleteUser` vào `api.js`. Đổi mã khách sang bộ đếm trong store. Thêm `lumen-current-user` vào `KHOA_PHAT_SINH`.

### Các bước sau
- Bước 4: M6 thanh toán QR giả.
- Bước 5: M4 check-in, sơ đồ chỗ (gom nợ kỹ thuật ở trên).
- Bước 6: M5 đặt phòng.
- Bước 7: M1 bảng điều khiển demo.
- Bước 8: M11 màn hình nhân viên.
- Bước 9: M13 quản trị cấu hình. Đề xuất đưa lên sớm để đổi giá lúc demo không phải commit lại.
- Bước 10: M12 dashboard. Bước 11: M7 tích điểm. Bước 12: M8 đặt đồ. Bước 13: M9 in ấn. Bước 14: M10 góp ý. Bước 15: rà soát và README.

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
| Ngưỡng mức đông | `QUY_TAC` → `mucDong` |

Quy ước: tiền là số nguyên đồng, không có dấu chấm (ví dụ `79000`). Chỉ đổi con số, giữ nguyên dấu phẩy và ngoặc.

Lưu ý: `test.html` có thể báo không đạt sau khi đổi giá, vì ví dụ kiểm thử đang ghi theo giá cũ. Đây là bình thường.

## Lịch sử cập nhật

| Ngày | Nội dung |
| :-- | :-- |
| 18/11/2026 | Bước 0 |
| 19-21/11/2026 | Bước 1a, 1b |
| 22/11/2026 | Bước 1c, 1d |
| 23/11/2026 | Bước 2a; bỏ khối so sánh Combo và ghi chú nước lọc; thêm cơ chế ảnh giữ chỗ |
| 23/11/2026 | Bước 2b-i: `index.html` đầy đủ, `so-do-cho.html`; thêm trạng thái tầng 3 ba mức; ghi nợ kỹ thuật |
