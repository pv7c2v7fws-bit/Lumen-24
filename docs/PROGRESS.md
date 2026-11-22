# Lumen 24 – Tiến độ dự án

Cập nhật lần cuối: 23/11/2026

Tài liệu gốc: `docs/lumen24-spec.md` (đặc tả website vận hành, bản mô phỏng, ngày 19/11/2026).
Cách làm: website tĩnh bằng HTML, CSS, JavaScript thuần (ES modules), không build, không npm, không framework. Xem thử bằng GitHub Pages.

## 1. Đã hoàn thành

### Bước 0: Khung dự án (mục 11.1 của đặc tả)

Gồm design tokens, bố cục chung, header và footer dùng chung, dải thông báo mô phỏng, trang chủ tạm.

Trạng thái kiểm tra trên GitHub Pages: chưa có xác nhận (checklist kiểm tra đã gửi, chưa nhận kết quả). Cần kiểm tra ở 360px, 768px, 1280px.

## 2. Danh sách file đã tạo

| Đường dẫn | Việc file làm | Xuất ra |
| :-- | :-- | :-- |
| `css/tokens.css` | Design tokens: màu, font, cỡ chữ, khoảng cách, bo góc, đổ bóng, kích thước bố cục | Các biến CSS trên `:root`: màu `--mau-nen`, `--mau-nen-phu`, `--mau-be-mat`, `--mau-chu`, `--mau-chu-phu`, `--mau-vien`, `--mau-vien-dam`, `--mau-focus`, `--mau-nhan`, `--mau-nhan-dam`, `--mau-nhan-nhat`, `--mau-chu-tren-nhan`, `--mau-anh-sang`; màu dải thông báo `--mau-dai-nen`, `--mau-dai-chu`; màu footer `--mau-chan-nen`, `--mau-chan-chu`, `--mau-chan-chu-phu`, `--mau-chan-vien`; màu trạng thái `--mau-thanh-cong`, `--mau-canh-bao`, `--mau-loi`, `--mau-thong-tin`; màu mức độ đông `--mau-dong-thap`, `--mau-dong-vua`, `--mau-dong-cao`, `--mau-dong-kin`; font `--font-chinh`, cỡ chữ `--co-chu-xs`, `--co-chu-sm`, `--co-chu-vua`, `--co-chu-lon`, `--co-chu-h3`, `--co-chu-h2`, `--co-chu-h1`, `--dong-cao`; khoảng cách `--kc-1` đến `--kc-9`; bo góc `--bo-goc-nho`, `--bo-goc`, `--bo-goc-lon`, `--bo-goc-tron`; đổ bóng `--bong-nhe`, `--bong-vua`, `--bong-cao`; bố cục `--rong-toi-da`, `--le-trang`, `--cao-header`, `--cao-dai`, `--z-dau-trang`; hiệu ứng `--chuyen` |
| `css/style.css` | Bố cục chung, responsive ưu tiên điện thoại; nút; dải thông báo; header và menu thu gọn; hero tạm; footer. Mọi màu lấy từ `tokens.css` | Các lớp dùng lại: `.container`, `.skip-link`, `.btn`, `.btn--primary`, `.btn--outline`, `.btn--lg`,
