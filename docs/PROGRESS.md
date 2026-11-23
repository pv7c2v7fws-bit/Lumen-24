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

---

## 3. Quyết định khác với tài liệu gốc

(chưa có)

---

## 4. Giả định đã đặt (chưa có trong đặc tả, cần xác nhận)

| # | Điểm giả định | Giá trị đã dùng | File liên quan |
| :-- | :-- | :-- | :-- |
| G1 | Giờ mặc định của đồng hồ mô phỏng khi chưa có dữ liệu lưu | 10/11/2027 20:00 (GMT+7), theo mục 8.5 và giả định #17 của đặc tả. Đổi thành `null` ở hằng `GIO_MAC_DINH` trong `clock.js` nếu muốn mặc định là giờ thật | `js/clock.js` |
| G2 | Tiền tố khóa localStorage | `lumen24:` — để không đụng dữ liệu repo khác trên cùng GitHub Pages | `js/store.js` |
| G3 | `store.subscribe` gọi callback cả khi chính tab này ghi, không chỉ tab khác | Đã áp dụng | `js/store.js` |
| G4 | `get(key, macDinh)` có tham số mặc định tùy chọn | `macDinh = null` nếu bỏ qua | `js/store.js` |

---

## 5. Đang làm

**Bước 1b:** `js/config.js`, `js/seed.js`

Theo mục 11.1 của đặc tả, Bước 1 còn gồm `js/rules.js` và `test.html`. Hai file này sẽ làm
sau khi `config.js` và `seed.js` xong vì `rules.js` cần các hằng số từ `config.js` và
`test.html` cần dữ liệu từ `seed.js`.
