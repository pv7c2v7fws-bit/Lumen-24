// js/config.js
// -----------------------------------------------------------------------------
// Cấu hình gốc của Lumen 24: NGUỒN DUY NHẤT cho các con số (mục 4 của đặc tả).
// Không nơi nào khác được viết cứng giá, giờ, ngưỡng.
//
// Quy ước:
//   - Tiền: số nguyên đồng (89000 nghĩa là 89.000đ).
//   - Giờ trong ngày: số nguyên 0-23 theo giờ Việt Nam. Khung { tu, den } nghĩa là
//     từ giờ "tu" đến TRƯỚC giờ "den". Khung qua nửa đêm có tu > den (ví dụ 23 -> 6).
//   - Phần trăm: số nguyên (10 nghĩa là 10%), tránh sai số số thực.
//   - Chú thích [MĐ] = giả định mặc định mà đặc tả đánh dấu, cần bạn xác nhận (mục 12).
//   - Tên trường của Package, Room, MenuItem bám theo mô hình dữ liệu ở mục 7.
//
// File này không import gì. Mọi đối tượng xuất ra đều bị đóng băng để tránh sửa nhầm.
// Khi trang Admin (M13) chỉnh giá, giá trị chỉnh được lưu vào store và lớp js/api.js
// sẽ hợp nhất với cấu hình gốc này; không sửa trực tiếp các đối tượng ở đây.
// -----------------------------------------------------------------------------

/** Đóng băng sâu một đối tượng hoặc mảng. */
function dongBang(doiTuong) {
  if (doiTuong && typeof doiTuong === 'object' && !Object.isFrozen(doiTuong)) {
    Object.freeze(doiTuong);
    for (const giaTri of Object.values(doiTuong)) dongBang(giaTri);
  }
  return doiTuong;
}

// =============================================================================
// Mục 4.1: Tầng và chỗ ngồi
// =============================================================================

/**
 * Ba tầng của quán. soChoTuDo = số chỗ ngồi tự do (mục 4.1).
 * mo24h = tầng mở 24/7. Tầng 3 KHÔNG mở 24/7: chỗ tự do chỉ mở trong khung cao điểm
 * (KHUNG_GIO.caoDiem) hoặc khi tầng 1-2 quá đông (R02); phòng họp tầng 3 mở khi có đặt phòng.
 */
export const TANG = dongBang([
  { id: 1, ten: 'Tầng 1', soChoTuDo: 30, mo24h: true,  ghiChu: 'Quầy pha chế, thu ngân, in ấn. Không có phòng họp.' },
  { id: 2, ten: 'Tầng 2', soChoTuDo: 28, mo24h: true,  ghiChu: 'Phòng 3-5 người và phòng 7-10 người (phòng 1).' },
  { id: 3, ten: 'Tầng 3', soChoTuDo: 22, mo24h: false, ghiChu: 'Phòng 7-10 người (phòng 2) và phòng 15-20 người. Chỗ tự do mở 19h-23h.' },
]);

/** Tổng chỗ ngồi tự do = 30 + 28 + 22 = 80 (mục 4.1). Tính từ TANG, không viết cứng. */
export const TONG_CHO_TU_DO = TANG.reduce((tong, tang) => tong + tang.soChoTuDo, 0);

/** Tổng chỗ tự do của các tầng mở 24/7 (tầng 1 và 2) = 58. Dùng cho R02 (ngưỡng 85% là 50 khách). */
export const CHO_TANG_1_2 = TANG
  .filter((tang) => tang.mo24h)
  .reduce((tong, tang) => tong + tang.soChoTuDo, 0);

// =============================================================================
// Mục 4.2: Gói chỗ ngồi (chỉ tính chỗ ngồi, đồ uống mua riêng)
// =============================================================================

// Các quà tặng kèm gói (mục 4.2, M8). Dùng chung cho nhiều gói.
const QUA_TRA_HOAC_NUOC = { id: 'tra-hoac-nuoc-pha-san', name: '1 trà túi lọc hoặc nước pha sẵn', qty: 1 };
// "from": chỉ được chọn bánh mì (s03) hoặc mì ly (s01) trong MENU_AN_NHE.
const QUA_DO_AN_NHE = { id: 'do-an-nhe', name: '1 đồ ăn nhẹ (bánh mì hoặc mì ly)', qty: 1, from: ['s01', 's03'] };
const QUA_DO_UONG = { id: 'do-uong-trong-menu', name: '1 đồ uống trong menu', qty: 1 };

/**
 * 6 gói chỗ ngồi (mục 4.2). Nước lọc miễn phí cho mọi khách (xem NUOC_LOC).
 *   kind: 'hourly' (gói 1/3/6/9 giờ), 'night' (combo đêm), 'day' (Combo Trọn Ngày).
 *   hours: số giờ của gói; null với combo đêm và Combo Trọn Ngày.
 *   gifts: quà tặng kèm theo cấu trúc, dùng cho "Quà tặng chưa nhận" ở M8.
 *   perks: các dòng "kèm theo" để hiển thị.
 *   tag: nhãn trên thẻ giá. availableFrom/availableTo: null = bán quanh năm.
 * Riêng gói 'day' có thêm: maxHours (R08), freeSheets (R26), creditHours (R08, R23).
 */
export const GOI_CHO_NGOI = dongBang([
  {
    id: 'h1', name: 'Gói 1 giờ', kind: 'hourly', price: 12000, hours: 1,
    description: 'Ngồi tự do 1 giờ. Đồ uống mua riêng.',
    perks: [], gifts: [],
    tag: null, active: true, availableFrom: null, availableTo: null,
  },
  {
    id: 'h3', name: 'Gói 3 giờ', kind: 'hourly', price: 30000, hours: 3,
    description: 'Ngồi tự do 3 giờ, kèm 1 trà túi lọc hoặc nước pha sẵn.',
    perks: ['1 trà túi lọc hoặc nước pha sẵn'], gifts: [QUA_TRA_HOAC_NUOC],
    tag: null, active: true, availableFrom: null, availableTo: null,
  },
  {
    id: 'h6', name: 'Gói 6 giờ', kind: 'hourly', price: 55000, hours: 6,
    description: 'Ngồi tự do 6 giờ, kèm 1 trà túi lọc hoặc nước pha sẵn (như gói 3 giờ).',
    perks: ['1 trà túi lọc hoặc nước pha sẵn'], gifts: [QUA_TRA_HOAC_NUOC],
    tag: null, active: true, availableFrom: null, availableTo: null,
  },
  {
    id: 'h9', name: 'Gói 9 giờ', kind: 'hourly', price: 75000, hours: 9,
    description: 'Ngồi tự do 9 giờ, kèm 1 trà túi lọc hoặc nước pha sẵn và 1 đồ ăn nhẹ (bánh mì hoặc mì ly).',
    perks: ['1 trà túi lọc hoặc nước pha sẵn', '1 đồ ăn nhẹ (bánh mì hoặc mì ly)'],
    gifts: [QUA_TRA_HOAC_NUOC, QUA_DO_AN_NHE],
    tag: null, active: true, availableFrom: null, availableTo: null,
  },
  {
    // Khung mua và check-in của combo đêm nằm ở KHUNG_GIO.comboDem (R07, [MĐ]).
    id: 'night', name: 'Combo đêm', kind: 'night', price: 45000, hours: null,
    description: 'Ngồi từ 23h đến 7h sáng. Đồ uống mua riêng.',
    perks: [], gifts: [],
    tag: null, active: true, availableFrom: null, availableTo: null,
  },
  {
    id: 'day', name: 'Combo Trọn Ngày', kind: 'day', price: 89000, hours: null,
    description: 'Ngồi không giới hạn thời gian, kèm 1 đồ uống trong menu và in 10 trang A4 đen trắng. Tính 10 giờ vào tích điểm.',
    perks: [
      '1 đồ uống trong menu',
      'Ngồi không giới hạn thời gian',
      'In 10 trang A4 đen trắng',
      'Tính 10 giờ vào tích điểm',
    ],
    gifts: [QUA_DO_UONG],
    maxHours: 24,     // [MĐ] R08, mục 12 #1: hiệu lực từ check-in đến check-out, tối đa 24 giờ.
    freeSheets: 10,   // R26: 10 tờ in miễn phí, mỗi combo một lần.
    creditHours: 10,  // R08, R23: cộng cố định 10 giờ vào tích điểm.
    tag: 'PHỔ BIẾN',  // [MĐ] mục 4.2, mục 12 #16: gói có nhãn PHỔ BIẾN là Combo Trọn Ngày.
    active: true, availableFrom: null, availableTo: null,
  },
]);

// =============================================================================
// Mục 4.3: Phòng họp
// =============================================================================

const THIET_BI_PHONG = ['Máy chiếu', 'Bảng', 'Micro'];

/**
 * 4 phòng họp (mục 4.3). pricePerHour là giá chuẩn mỗi giờ (chưa giảm giá).
 * Tiền cọc tính theo giá chuẩn 1 giờ (xem QUY_TAC.cocPhongSoGio).
 */
export const PHONG_HOP = dongBang([
  { id: 'r35',    name: 'Phòng 3-5 người',            floor: 2, capacityMin: 3,  capacityMax: 5,  pricePerHour: 60000,  equipment: THIET_BI_PHONG, active: true },
  { id: 'r710a',  name: 'Phòng 7-10 người (phòng 1)', floor: 2, capacityMin: 7,  capacityMax: 10, pricePerHour: 90000,  equipment: THIET_BI_PHONG, active: true },
  { id: 'r710b',  name: 'Phòng 7-10 người (phòng 2)', floor: 3, capacityMin: 7,  capacityMax: 10, pricePerHour: 90000,  equipment: THIET_BI_PHONG, active: true },
  { id: 'r1520',  name: 'Phòng 15-20 người',          floor: 3, capacityMin: 15, capacityMax: 20, pricePerHour: 160000, equipment: THIET_BI_PHONG, active: true },
]);

// =============================================================================
// Mục 4.4: Menu
// =============================================================================

/**
 * [MĐ] Menu mẫu (mục 4.4): kế hoạch nói sẽ chốt sau khi chạy thử, nên đây là dữ liệu giả.
 * 8 món đồ uống, giá từ 39.000đ đến 55.000đ. soldOut = hết hàng (Admin đánh dấu, M8).
 */
export const MENU_DO_UONG = dongBang([
  { id: 'd01', group: 'drink', name: 'Cà phê đen đá',   price: 39000, soldOut: false },
  { id: 'd02', group: 'drink', name: 'Cà phê sữa đá',   price: 39000, soldOut: false },
  { id: 'd03', group: 'drink', name: 'Bạc xỉu',         price: 42000, soldOut: false },
  { id: 'd04', group: 'drink', name: 'Trà đào cam sả',  price: 45000, soldOut: false },
  { id: 'd05', group: 'drink', name: 'Trà vải hoa hồng', price: 45000, soldOut: false },
  { id: 'd06', group: 'drink', name: 'Cacao đá',        price: 49000, soldOut: false },
  { id: 'd07', group: 'drink', name: 'Matcha latte',    price: 52000, soldOut: false },
  { id: 'd08', group: 'drink', name: 'Cold brew',       price: 55000, soldOut: false },
]);

/** [MĐ] Menu mẫu (mục 4.4): 4 món ăn nhẹ, giá từ 15.000đ đến 30.000đ. */
export const MENU_AN_NHE = dongBang([
  { id: 's01', group: 'snack', name: 'Mì ly',               price: 15000, soldOut: false },
  { id: 's02', group: 'snack', name: 'Bánh quy đóng gói',   price: 18000, soldOut: false },
  { id: 's03', group: 'snack', name: 'Bánh mì',             price: 20000, soldOut: false },
  { id: 's04', group: 'snack', name: 'Sandwich đóng gói',   price: 30000, soldOut: false },
]);

/** Toàn bộ menu (đồ uống rồi ăn nhẹ). Không gồm nước lọc. */
export const MENU = dongBang([...MENU_DO_UONG, ...MENU_AN_NHE]);

/**
 * Nước lọc miễn phí cho mọi khách (mục 4.2, 4.4). Cố ý KHÔNG nằm trong MENU_DO_UONG
 * để không làm sai phép tính "đồ uống thấp nhất" ở khối so sánh Combo Trọn Ngày.
 */
export const NUOC_LOC = dongBang({ id: 'water', name: 'Nước lọc', price: 0 });

// =============================================================================
// Mục 4.5: In ấn và văn phòng phẩm
// =============================================================================

/**
 * In hoặc photo đen trắng A4, một hoặc hai mặt (mục 4.5, R25, R27).
 *   donGia: 1.000đ mỗi tờ.
 *   nguongGiaSi / donGiaSi: từ 50 tờ phải trả trở lên, TOÀN BỘ số tờ tính 700đ mỗi tờ (R27).
 *   trangMoiToHaiMat: [MĐ] R25: in hai mặt thì 2 trang là 1 tờ (làm tròn lên).
 *   toiDaMB, dinhDangFile, soTrangGoiY: [MĐ] M9, mục 12 #19: tối đa 20 MB, không đọc nội dung file,
 *     khách tự nhập số trang (gợi ý mặc định 10).
 * Số tờ miễn phí của Combo Trọn Ngày nằm ở GOI_CHO_NGOI (gói 'day', trường freeSheets).
 */
export const IN_AN = dongBang({
  khoGiay: 'A4',
  mauIn: 'den-trang',
  donGia: 1000,
  nguongGiaSi: 50,
  donGiaSi: 700,
  trangMoiToHaiMat: 2,
  toiDaMB: 20,
  dinhDangFile: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  soTrangGoiY: 10,
});

/** [MĐ] Văn phòng phẩm mẫu (mục 4.5). Cộng vào đơn theo giá niêm yết, không giảm giá (R28). */
export const VAN_PHONG_PHAM = dongBang([
  { id: 'vp1', name: 'Bút bi',            price: 5000 },
  { id: 'vp2', name: 'Kẹp giấy',          price: 7000 },
  { id: 'vp3', name: 'Giấy note',         price: 10000 },
  { id: 'vp4', name: 'File đựng tài liệu', price: 12000 },
  { id: 'vp5', name: 'Pin',               price: 5000 },
]);

// =============================================================================
// Mục 4.6: Khung giờ
// =============================================================================

/**
 * Các khung giờ (mục 4.6). Mọi khung dùng giờ nguyên 0-23, tu tính, den KHÔNG tính.
 */
export const KHUNG_GIO = dongBang({
  // Cao điểm quán 19h-23h: mở chỗ tự do tầng 3, ca tối 4 người.
  caoDiem: { tu: 19, den: 23 },
  // Đêm 23h-6h: chỉ tầng 1-2 hoạt động (R03), 2 nhân viên.
  dem: { tu: 23, den: 6 },
  // Giờ làm đêm theo luật 22h-6h: chỉ để tính lương đêm, hiển thị ở ca làm việc.
  gioLamDemTheoLuat: { tu: 22, den: 6 },
  // [MĐ] Thấp điểm của phòng họp (mục 4.6, R14): sau 23h và buổi sáng 6h-11h, giảm giá phòng.
  // 11h-23h là giá chuẩn, kể cả giờ cao điểm 19h-23h.
  phongThapDiem: [
    { tu: 23, den: 6 },
    { tu: 6, den: 11 },
  ],
  // [MĐ] Combo đêm (R07, mục 12 #4): mua và check-in từ 23h đến TRƯỚC 6h; hết hiệu lực lúc 7h.
  // LƯU Ý MÂU THUẪN trong đặc tả: mục 4.6 và M4 ghi check-in 23h-7h, còn R07 và mục 12 ghi 23h-6h.
  // Đang theo R07 và mục 12. Muốn cho check-in đến 7h thì đổi checkInDen thành 7.
  comboDem: { checkInTu: 23, checkInDen: 6, hetHieuLuc: 7 },
});

// =============================================================================
// Quy tắc, ngưỡng và phí (mục 4, mục 6)
// =============================================================================

/**
 * Các tham số quy tắc. Trang Admin (M13, mục "Quy tắc") chỉnh được các giá trị này.
 * Những tham số đánh dấu "(thêm)" không có trong danh sách yêu cầu của Bước 1b nhưng
 * là con số của mục 6 và M13, nên đặt ở đây để không phải viết cứng ở nơi khác.
 */
export const QUY_TAC = dongBang({
  // --- Phòng họp ---
  cocPhongSoGio: 1,            // R16, mục 5.M5: cọc bằng giá chuẩn của phòng cho 1 giờ (không giảm).
  hanHoanCocGio: 2,            // (thêm) R17: hủy từ 2 giờ trở lên trước giờ bắt đầu thì hoàn cọc; ít hơn thì mất cọc.
  thoiGianGiuPhongPhut: 10,    // [MĐ] R19, mục 12 #7: giữ phòng tạm 10 phút khi đang thanh toán cọc.
  choKhongDenPhut: 15,         // [MĐ] R18, mục 12 #6: quá 15 phút sau giờ bắt đầu chưa check-in thì "Không đến".
  datPhongToiThieuPhut: 60,    // (thêm) [MĐ] M5, R20: đặt tối thiểu 1 giờ.
  buocDatPhongPhut: 30,        // (thêm) [MĐ] M5, R20: bước đặt 30 phút.

  // --- Vượt giờ ---
  phiVuotGioMoiGio: 12000,     // [MĐ] R09, mục 12 #2: 12.000đ mỗi giờ hoặc phần của giờ, làm tròn lên.
  anHanVuotGioPhut: 10,        // [MĐ] R09, mục 12 #2: ân hạn 10 phút trước khi tính phụ phí.

  // --- Giảm giá phòng họp ---
  giamThapDiemPhanTram: 10,    // [MĐ] R14, mục 12 #5: giảm 10% ở khung thấp điểm (KHUNG_GIO.phongThapDiem).
  giamClbPhanTram: 10,         // [MĐ] R15, mục 12 #5: giảm 10% cho CLB đã duyệt; hai loại giảm không cộng dồn.

  // --- Thanh toán ---
  phiCongThanhToanPhanTram: 1, // M6, M8: phí cổng thanh toán 1%, tính ở báo cáo đối soát.

  // --- Tầng 3 ngoài giờ cao điểm (R02) ---
  // [MĐ] mục 12 #8. "Vượt" nghĩa là lớn hơn 85%; "dưới" nghĩa là nhỏ hơn 70%.
  // Với 58 chỗ tầng 1-2: 50 khách (86,2%) thì mở; 40 khách (69,0%) thì đóng.
  nguongMoTang3PhanTram: 85,
  nguongDongTang3PhanTram: 70,

  // --- Mức độ đông (R04, M4) ---
  // [MĐ] mục 12 #9. Công suất = số khách chia số chỗ đang mở.
  //   Vắng: dưới 30%.   Vừa: từ 30% đến dưới 60%.   Đông: từ 60% đến 85%.   Gần kín: trên 85%.
  // Đặc tả viết "Vừa 30-60%" và "Đông 60-85%", nên đúng 60% chưa rõ; đang xếp vào "Đông".
  mucDong: { vangDuoi: 30, vuaDuoi: 60, dongToiDa: 85 },

  // --- Khách trong quán ---
  thoiGianVangPhut: 30,        // (thêm) [MĐ] R12: vắng quá 30 phút thì cảnh báo nhân viên.
  canhBaoConLaiPhut: 15,       // (thêm) M4: cảnh báo khi phiên còn 15 phút.
});

/** Tên hiển thị của bốn mức độ đông (R04). Khóa trùng với mô tả ở QUY_TAC.mucDong. */
export const MUC_DONG_TEN = dongBang({
  vang: 'Vắng',
  vua: 'Vừa',
  dong: 'Đông',
  ganKin: 'Gần kín',
});
