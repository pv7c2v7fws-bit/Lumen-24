docs/PROGRESS.md

# Lumen 24 – Tiến độ dự án

Cập nhật lần cuối: 23/11/2026

Tài liệu gốc: `docs/lumen24-spec.md` (đặc tả website vận hành, bản mô phỏng, ngày 19/11/2026).
Cách làm: website tĩnh bằng HTML, CSS, JavaScript thuần (ES modules), không build, không npm,
không framework. Xem thử bằng GitHub Pages.

---

## 1. Đã hoàn thành

### Bước 0 – Khung dự án (mục 11.1 của đặc tả)

Gồm design tokens, bố cục chung, header và footer dùng chung, dải thông báo mô phỏng,
trang chủ tạm.

Trạng thái kiểm tra trên GitHub Pages: trang hiển thị đúng (header, footer, hero).
Có 2 dòng lỗi từ `content.js` trong Console — xác định là lỗi của extension trình duyệt
hoặc file cũ từ Bước 0, không ảnh hưởng đến các module JS.

### Bước 1a – Kho lưu trạng thái và đồng hồ mô phỏng (mục 11.1 của đặc tả)

Hai file `js/store.js` và `js/clock.js`. Đã kiểm tra:
- `store.set` / `store.get` / `store.remove` chạy đúng trong một tab.
- `clock.setTime` ở Tab 1 → `clock.now()` ở Tab 2 đổi theo (đồng bộ qua BroadcastChannel).
- `store.subscribe` trả về hàm hủy, sau khi hủy không nhận thêm thông báo.

### Bước 1b – Cấu hình gốc và dữ liệu giả (mục 11.1 của đặc tả)

Hai file `js/config.js` và `js/seed.js`. `config.js` không import gì; `seed.js` chỉ import `js/store.js`.
Không file có sẵn nào bị sửa.

Trạng thái kiểm tra: **chưa kiểm tra** (cập nhật sau khi chạy checklist trên Console của `index.html`):
- `const c = await import('./js/config.js')` chạy được; `c.GOI_CHO_NGOI.length` là 6; `c.TONG_CHO_TU_DO` là 80; `c.CHO_TANG_1_2` là 58.
- `const s = await import('./js/seed.js'); s.resetDemoData()` trả `{ nguoiDung: 7, clb: 3, luuBenVaoLocalStorage: true }`.
- `store.get('users').length` là 7; Minh Anh có `totalHours` là 88; `store.get('clubs').map(x => x.status)` là `['approved', 'pending', 'rejected']`.

---

## 2. Danh sách file đã tạo

| Đường dẫn | Việc file làm | Xuất ra |
| :-- | :-- | :-- |
| `css/tokens.css` | Design tokens: màu, font, cỡ chữ, khoảng cách, bo góc, đổ bóng, kích thước bố cục | Các biến CSS trên `:root`: `--mau-nen`, `--mau-nen-phu`, `--mau-be-mat`, `--mau-chu`, `--mau-chu-phu`, `--mau-vien`, `--mau-vien-dam`, `--mau-focus`, `--mau-nhan`, `--mau-nhan-dam`, `--mau-nhan-nhat`, `--mau-chu-tren-nhan`, `--mau-anh-sang`; màu dải thông báo `--mau-dai-nen`, `--mau-dai-chu`; màu footer `--mau-chan-nen`, `--mau-chan-chu`, `--mau-chan-chu-phu`, `--mau-chan-vien`; màu trạng thái `--mau-thanh-cong`, `--mau-canh-bao`, `--mau-loi`, `--mau-thong-tin`; màu mức độ đông `--mau-dong-thap`, `--mau-dong-vua`, `--mau-dong-cao`, `--mau-dong-kin`; font `--font-chinh`; cỡ chữ `--co-chu-xs`, `--co-chu-sm`, `--co-chu-vua`, `--co-chu-lon`, `--co-chu-h3`, `--co-chu-h2`, `--co-chu-h1`, `--dong-cao`; khoảng cách `--kc-1` đến `--kc-9`; bo góc `--bo-goc-nho`, `--bo-goc`, `--bo-goc-lon`, `--bo-goc-tron`; đổ bóng `--bong-nhe`, `--bong-vua`, `--bong-cao`; bố cục `--rong-toi-da`, `--le-trang`, `--cao-header`, `--cao-dai`, `--z-dau-trang`; hiệu ứng `--chuyen` |
| `css/style.css` | Bố cục chung, responsive ưu tiên điện thoại; nút; dải thông báo; header và menu thu gọn; hero tạm; footer. Mọi màu lấy từ `tokens.css` | Các lớp dùng lại: `.container`, `.skip-link`, `.btn`, `.btn--primary`, `.btn--outline`, `.btn--lg` |
| `js/ui.js` | Chèn dải thông báo mô phỏng, header (logo, menu 6 mục, nút CTA, nút ba gạch) và footer (giới thiệu, liên kết nhanh, địa điểm, giờ mở cửa, chính sách) vào mọi trang | `renderLayout()` — gọi một lần ở cuối `<body>`; hằng `TEN_QUAN`, `DUONG_DAN_LOGO`, `THONG_BAO_MO_PHONG`, `MENU_CHINH`, `NUT_DAT_LICH` |
| `index.html` | Trang chủ tạm: hero với slogan, hai nút (Đặt lịch, Xem combo), chú thích "Trang chủ tạm cho Bước 0". Nội dung đầy đủ làm ở Bước 2 (M2) | Không xuất JS |
| `js/store.js` | Kho lưu trạng thái dùng localStorage; đồng bộ giữa các tab qua BroadcastChannel "lumen24"; dự phòng bộ nhớ tạm khi localStorage không dùng được; mọi thao tác bọc try/catch; khóa có tiền tố `lumen24:` | `get(khoa, macDinh = null)` — đọc giá trị, trả `macDinh` nếu chưa có hoặc lỗi; `set(khoa, giaTri)` — ghi JSON, trả `boolean`; `remove(khoa)` — xóa, trả `boolean`; `subscribe(khoa, callback(giaTriMoi, khoa))` — theo dõi một khóa, trả hàm hủy đăng ký |
| `js/clock.js` | Đồng hồ mô phỏng; trạng thái lưu qua `store.js` (khóa `"clock"`); hỗ trợ đặt giờ, tua nhanh x1/x10/x60, tạm dừng, chạy tiếp, về giờ thật; `new Date()` không đối số không được dùng trong file này | `now()` — trả `Date` theo đồng hồ mô phỏng; `setTime(date)` — đặt giờ (nhận `Date`, số ms, hoặc chuỗi ISO); `setSpeed(1 \| 10 \| 60)` — đổi tốc độ; `pause()` — tạm dừng; `resume()` — chạy tiếp; `useRealTime()` — về giờ thật; `getState()` — trả `{ cheDo, tocDo, tamDung, now }`; `subscribe(callback(state))` — theo dõi thay đổi trạng thái, trả hàm hủy; hằng `TOC_DO_HOP_LE = [1, 10, 60]` |
| `js/config.js` | Nguồn duy nhất cho các con số (mục 4 của đặc tả). Không import gì. Mọi đối tượng xuất ra bị đóng băng sâu. Tiền là số nguyên đồng; giờ trong ngày là số nguyên 0-23, khung `{ tu, den }` tính từ `tu` đến trước `den` (khung qua nửa đêm có `tu > den`); phần trăm là số nguyên. Mỗi giá trị có chú thích mục nguồn; giá trị đánh dấu [MĐ] ghi kèm [MĐ] | `TANG` — 3 tầng `{ id, ten, soChoTuDo, mo24h, ghiChu }`; `TONG_CHO_TU_DO` (80); `CHO_TANG_1_2` (58); `GOI_CHO_NGOI` — 6 gói mã `h1`, `h3`, `h6`, `h9`, `night`, `day`, mỗi gói có `id, name, kind ('hourly' \| 'night' \| 'day'), price, hours, description, perks, gifts, tag, active, availableFrom, availableTo`, riêng `day` thêm `maxHours` (24), `freeSheets` (10), `creditHours` (10); `PHONG_HOP` — 4 phòng mã `r35`, `r710a`, `r710b`, `r1520` với `id, name, floor, capacityMin, capacityMax, pricePerHour, equipment, active`; `MENU_DO_UONG` (8 món, mã `d01`-`d08`), `MENU_AN_NHE` (4 món, mã `s01`-`s04`), `MENU` (gộp hai nhóm), `NUOC_LOC` (nước lọc miễn phí, không nằm trong `MENU`); `IN_AN` — `donGia`, `nguongGiaSi`, `donGiaSi`, `trangMoiToHaiMat`, `toiDaMB`, `dinhDangFile`, `soTrangGoiY`; `VAN_PHONG_PHAM` (5 món, mã `vp1`-`vp5`); `KHUNG_GIO` — `caoDiem`, `dem`, `gioLamDemTheoLuat`, `phongThapDiem` (mảng 2 khung), `comboDem { checkInTu, checkInDen, hetHieuLuc }`; `QUY_TAC` — `cocPhongSoGio`, `hanHoanCocGio`, `thoiGianGiuPhongPhut`, `choKhongDenPhut`, `datPhongToiThieuPhut`, `buocDatPhongPhut`, `phiVuotGioMoiGio`, `anHanVuotGioPhut`, `giamThapDiemPhanTram`, `giamClbPhanTram`, `phiCongThanhToanPhanTram`, `nguongMoTang3PhanTram`, `nguongDongTang3PhanTram`, `mucDong { vangDuoi, vuaDuoi, dongToiDa }`, `thoiGianVangPhut`, `canhBaoConLaiPhut`; `MUC_DONG_TEN` (`vang`, `vua`, `dong`, `ganKin`) |
| `js/seed.js` | Dữ liệu giả ban đầu: 7 tài khoản demo (mục 3.2) và 3 CLB (mục 8.1); hàm đặt lại dữ liệu demo. Chỉ import `js/store.js`. Chưa có dữ liệu lịch sử (khách mỗi ngày, doanh thu, góp ý), phần đó làm ở Bước 10 và 14 | `resetDemoData({ datLaiDongHo = true })` — ghi lại `users` và `clubs`, xóa các khóa trong `KHOA_PHAT_SINH`, xóa khóa `clock` nếu `datLaiDongHo`, trả `{ nguoiDung, clb, luuBenVaoLocalStorage }`; `taoNguoiDungSeed()` và `taoClbSeed()` — mỗi lần gọi trả bản mới; hằng `KHOA_NGUOI_DUNG` (`'users'`), `KHOA_CLB` (`'clubs'`), `KHOA_DONG_HO` (`'clock'`, phải trùng `KHOA_LUU` trong `clock.js`), `KHOA_PHAT_SINH` (mảng, hiện rỗng; mỗi bước sau thêm khóa của mình), `MAT_KHAU_DEMO` (`'demo123'`) |

---

## 3. Quyết định khác với tài liệu gốc

| # | Chỗ đặc tả mâu thuẫn hoặc chưa rõ | Đã chọn | Lý do |
| :-- | :-- | :-- | :-- |
| Q1 | Khung check-in Combo đêm: mục 4.6 và M4 ghi 23h-7h; R07 và mục 12 #4 ghi 23h-6h, hết hiệu lực 7h | Theo R07: check-in từ 23h đến trước 6h, hết hiệu lực 7h (`KHUNG_GIO.comboDem.checkInDen = 6`) | R07 và mục 12 là bảng giả định chờ xác nhận. Muốn check-in đến 7h thì đổi `6` thành `7` |
| Q2 | Mức độ đông đúng 60%: đặc tả viết "Vừa 30-60%" và "Đông 60-85%" nên trùng | Đúng 60% xếp vào "Đông"; đúng 85% vẫn là "Đông", chỉ trên 85% mới là "Gần kín" | Khớp cách đọc "trên 85%" ở R04. Ngưỡng nằm ở `QUY_TAC.mucDong` |
| Q3 | Nước lọc miễn phí có nằm trong menu đồ uống không | Không; để riêng ở `NUOC_LOC` | Tránh làm sai phép tính "đồ uống thấp nhất" của khối so sánh Combo Trọn Ngày (mục 4.2) |

---

## 4. Giả định đã đặt (chưa có trong đặc tả, cần xác nhận)

| # | Điểm giả định | Giá trị đã dùng | File liên quan |
| :-- | :-- | :-- | :-- |
| G1 | Giờ mặc định của đồng hồ mô phỏng khi chưa có dữ liệu lưu | 10/11/2027 20:00 (GMT+7), theo mục 8.5 và giả định #17 của đặc tả. Đổi thành `null` ở hằng `GIO_MAC_DINH` trong `clock.js` nếu muốn mặc định là giờ thật | `js/clock.js` |
| G2 | Tiền tố khóa localStorage | `lumen24:` — để không đụng dữ liệu repo khác trên cùng GitHub Pages | `js/store.js` |
| G3 | `store.subscribe` gọi callback cả khi chính tab này ghi, không chỉ tab khác | Đã áp dụng | `js/store.js` |
| G4 | `get(key, macDinh)` có tham số mặc định tùy chọn | `macDinh = null` nếu bỏ qua | `js/store.js` |
| G5 | Tên khóa store cho người dùng và CLB (PROGRESS.md chưa có quy ước) | `users` và `clubs`. Các bước sau đặt tên khóa theo cùng kiểu (ví dụ `bookings`, `payments`) và thêm vào `KHOA_PHAT_SINH` | `js/seed.js` |
| G6 | Mật khẩu giả của 7 tài khoản demo | `demo123`, chữ thường, chỉ để mô phỏng | `js/seed.js` |
| G7 | Liên hệ của tài khoản demo | `contact` là email giả `@example.com`; số điện thoại giả `0900000001` đến `0900000007` nằm ở trường thêm `phone` (mục 7 chỉ có một trường `contact`). Bước 3 cần kiểm tra trùng cả hai trường | `js/seed.js` |
| G8 | Mã khách và ngày tạo của tài khoản seed | `LM-000001` đến `LM-000007`; `createdAt` cố định 18/11/2026 08:00 (ngày khai trương) để kết quả lặp lại được. Bước đăng ký lấy mã lớn nhất hiện có rồi cộng thêm | `js/seed.js` |
| G9 | Loại khách, đơn vị và số giờ của tài khoản demo | `type` của Tuấn, Mai, Hoàng là `null` (mục 7 chỉ có `student`, `worker`); Hà là `student`, `org` là `null`; tên trường và công ty là tên giả; ngoài Minh Anh (88 giờ) mọi người còn lại có 0 giờ | `js/seed.js` |
| G10 | Thẻ tháng hè của Quốc Bảo | Chưa tạo trong seed: mục 7 không có thực thể thẻ tháng, thẻ chỉ bán khi bật chế độ mùa hè, và với đồng hồ mặc định 10/11/2027 thẻ cũng đã hết hạn. Cần chốt cách demo trước khi làm M13 hoặc thẻ tháng | `js/seed.js` |
| G11 | CLB seed | Tên giả: CLB Lập trình Mô phỏng (đã duyệt, Linh thuộc CLB này), CLB Nhiếp ảnh Mô phỏng (đang chờ), CLB Âm nhạc Mô phỏng (bị từ chối). Có thêm trường `note`. `mediaCommitment` chỉ có ở CLB đã duyệt | `js/seed.js` |
| G12 | `resetDemoData()` và đồng hồ | Mặc định xóa khóa `clock` để về 10/11/2027 20h; gọi `resetDemoData({ datLaiDongHo: false })` để giữ giờ đang chỉnh. Không import `clock.js` để đúng ràng buộc chỉ import `store.js` | `js/seed.js` |
| G13 | Reset và người đang đăng nhập | Reset chưa đụng khóa "người đang đăng nhập" vì chưa có. Bước 3 phải tự đăng xuất khi tài khoản đang dùng biến mất, hoặc thêm khóa đó vào `KHOA_PHAT_SINH` | `js/seed.js` |
| G14 | Tham số ngoài danh sách yêu cầu của Bước 1b nhưng có trong mục 6 và M5, M9 | Đã đặt trong `config.js`: hạn hoàn cọc 2 giờ, đặt tối thiểu 60 phút, bước 30 phút, vắng 30 phút, cảnh báo còn 15 phút, tham số in ấn (hai mặt, 20 MB, định dạng file), quà tặng kèm gói, `maxHours`, `freeSheets`, `creditHours` của Combo Trọn Ngày | `js/config.js` |
| G15 | Chỗ ngồi tầng 1-2 dùng cho R02 | `CHO_TANG_1_2` tính từ các tầng có `mo24h` (58 chỗ); ngưỡng 85% tương ứng 50 khách, ngưỡng đóng 70% tương ứng dưới 41 khách | `js/config.js` |
| G16 | Chưa đưa vào `config.js` | Ca làm việc, thẻ tháng hè và happy hour, voucher, ngưỡng chỉ số dashboard. Thêm khi tới module tương ứng | `js/config.js` |

### Câu hỏi còn mở (cần bạn chốt trước khi tới bước liên quan)

| # | Câu hỏi | Chốt trước bước |
| :-- | :-- | :-- |
| C1 | Hạn voucher tích điểm: R22 ghi 30 ngày, còn M7 và mục 12 #10 ghi 90 ngày | Bước 11 (M7) |
| C2 | Cách demo thẻ tháng hè cho Quốc Bảo (xem G10) | Bước 9 (M13) |

---

## 5. Đang làm

**Bước 1c:** `js/api.js`, `js/rules.js`, `test.html`

Theo mục 11.1 của đặc tả, Bước 1 gồm `clock.js`, `store.js`, `api.js`, `config.js`, `seed.js`,
`rules.js` và `test.html` (kèm ví dụ R01-R31). `api.js` chưa làm ở Bước 1a và 1b.
- `js/api.js`: hàm async giả lập độ trễ 200-500 ms; hợp nhất cấu hình gốc trong `config.js` với giá trị Admin chỉnh lưu trong store.
- `js/rules.js`: hàm thuần cho R01-R31, lấy hằng số từ `config.js`, lấy giờ từ `clock.js`.
- `test.html`: chạy các ví dụ ở mục 6 và hiện đạt hoặc không đạt.

Ba file này nên làm tuần tự: `rules.js` trước, rồi `test.html`, cuối cùng `api.js`.
