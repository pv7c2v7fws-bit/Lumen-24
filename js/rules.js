// js/rules.js
// -----------------------------------------------------------------------------
// Quy tắc nghiệp vụ của Lumen 24: R01-R31 (mục 6 của đặc tả). MỌI HÀM ĐỀU THUẦN.
//
// Nguyên tắc:
//   - File này KHÔNG import gì, không đọc store/localStorage, không gọi now() hay
//     new Date(). Thời điểm và dữ liệu truyền vào qua tham số.
//   - Con số nghiệp vụ lấy từ js/config.js, nhưng vì file này không được import nên
//     mọi hàm nhận thêm tham số `cauHinh` (kết quả getConfig() của js/api.js, hoặc
//     chính các export của js/config.js: TANG, CHO_TANG_1_2, GOI_CHO_NGOI, PHONG_HOP,
//     IN_AN, KHUNG_GIO, QUY_TAC, MUC_DONG_TEN, VAN_PHONG_PHAM...).
//   - Một số con số mục 6 mà config.js CHƯA có (mốc voucher, thẻ tháng hè, happy hour,
//     tích điểm nhân đôi...) nằm trong THAM_SO_BO_SUNG bên dưới. Khi cần, đưa chúng
//     sang config.js (xuất khẩu cùng tên THAM_SO_BO_SUNG) thì cauHinh sẽ ghi đè.
//
// Quy ước dữ liệu:
//   - Thời điểm: chuỗi ISO (ví dụ '2026-11-23T14:00:00+07:00'), số mili giây, hoặc đối
//     tượng có getTime(). Chuỗi không có múi giờ được hiểu là GIỜ VIỆT NAM (UTC+7).
//     Giờ trong ngày luôn tính theo giờ Việt Nam, không phụ thuộc múi giờ trình duyệt.
//   - Thời gian tính bằng phút; tiền là số nguyên đồng, làm tròn đến đồng.
//   - Mọi hàm trả về đối tượng có `hopLe`. Khi không hợp lệ: { hopLe: false, maLoi }.
//     Tra câu thông báo tiếng Việt bằng THONG_BAO_LOI[maLoi].
//   - Dữ liệu đầu vào sai kiểu (ví dụ thời điểm không đọc được) làm hàm ném lỗi:
//     đó là lỗi lập trình, không phải lỗi người dùng.
//
// Chú thích [MĐ] = giả định mặc định của đặc tả (mục 12), cần bạn xác nhận.
// -----------------------------------------------------------------------------

// ============================================================================
// Hằng số kỹ thuật (không phải số nghiệp vụ)
// ============================================================================

const MS_PHUT = 60 * 1000;
const MS_GIO = 60 * MS_PHUT;
const MS_NGAY = 24 * MS_GIO;
const PHUT_MOI_GIO = 60;
const TRAM = 100; // dùng cho phép tính phần trăm bằng số nguyên
const LECH_GIO_VN_MS = 7 * MS_GIO; // Việt Nam UTC+7, không có giờ mùa hè

/** Đóng băng sâu một đối tượng hoặc mảng. */
function dongBang(doiTuong) {
  if (doiTuong && typeof doiTuong === 'object' && !Object.isFrozen(doiTuong)) {
    Object.freeze(doiTuong);
    for (const giaTri of Object.values(doiTuong)) dongBang(giaTri);
  }
  return doiTuong;
}

// ============================================================================
// Tham số bổ sung: số của mục 6 mà config.js chưa có
// ============================================================================

/**
 * Các tham số CHƯA có trong js/config.js (Bước 1b). Đặt ở đây để không viết cứng trong hàm.
 * Có thể ghi đè bằng cauHinh.THAM_SO_BO_SUNG (trộn theo từng nhóm).
 */
export const THAM_SO_BO_SUNG = dongBang({
  // R22, M7: mỗi 100 giờ tích lũy tặng 1 voucher Combo Trọn Ngày.
  // [MĐ] hanNgay: đặc tả MÂU THUẪN. R22 ghi 30 ngày, còn M7 và mục 12 #10 ghi 90 ngày.
  // Đang theo 90 (hai trên ba chỗ nhắc tới, và mục 12 là danh sách để bạn xác nhận).
  voucher: { mocGio: 100, hanNgay: 90 },

  // R24: top 3 và tên hiển thị của khách ẩn tên.
  bangVinhDanh: { soLuongTop: 3, tenAnDanh: 'Thành viên ẩn danh' },

  // R29: Thẻ tháng hè. goiLeId: gói dùng để so sánh "mua lẻ" (gói 6 giờ).
  theHe: { gia: 1090000, soNgay: 26, gioMoiNgay: 6, gioiHanSuat: 20, goiLeId: 'h6' },

  // R30 [MĐ]: tích điểm nhân đôi cho giờ ngồi "ban ngày" khi chế độ mùa hè bật.
  // Đặc tả KHÔNG định nghĩa "ban ngày" ở R30. Tạm dùng khung 9h-15h, là khung "ban ngày"
  // duy nhất đặc tả nêu (happy hour, R31). Muốn rộng hơn (ví dụ 6h-19h) thì sửa tu/den ở đây.
  tichDiemDoiBanNgay: { tu: 9, den: 15, heSo: 2 },

  // R31 [MĐ]: happy hour ban ngày 9h-15h giảm 10% đồ uống khi chế độ mùa hè bật.
  happyHour: { tu: 9, den: 15, phanTramGiam: 10 },
});

/** Trộn THAM_SO_BO_SUNG với phần ghi đè trong cauHinh (nếu có), theo từng nhóm. */
function thamSoBoSung(cauHinh) {
  const ghiDe = cauHinh && typeof cauHinh === 'object' && cauHinh.THAM_SO_BO_SUNG
    && typeof cauHinh.THAM_SO_BO_SUNG === 'object' ? cauHinh.THAM_SO_BO_SUNG : {};
  const ketQua = {};
  for (const khoa of Object.keys(THAM_SO_BO_SUNG)) {
    ketQua[khoa] = { ...THAM_SO_BO_SUNG[khoa], ...(ghiDe[khoa] || {}) };
  }
  return ketQua;
}

// ============================================================================
// Thông báo lỗi tiếng Việt cho từng mã lỗi (maLoi)
// ============================================================================

export const THONG_BAO_LOI = dongBang({
  DU_LIEU_KHONG_HOP_LE: 'Dữ liệu nhập vào chưa hợp lệ. Vui lòng kiểm tra lại.',
  TANG_KHONG_TON_TAI: 'Không tìm thấy tầng này.',
  DANG_CO_PHIEN: 'Bạn đang có một phiên ngồi. Hãy check-out phiên hiện tại trước khi check-in lại.',
  GOI_KHONG_TON_TAI: 'Không tìm thấy gói này.',
  GOI_KHONG_PHAI_THEO_GIO: 'Đây không phải gói theo giờ (1, 3, 6 hoặc 9 giờ).',
  NGOAI_KHUNG_COMBO_DEM: 'Combo đêm chỉ mua và check-in trong khung giờ đêm. Vui lòng quay lại đúng khung giờ.',
  GIA_HAN_GOI_NAY_CHUA_QUY_DINH: 'Gia hạn bằng gói này chưa có quy tắc tính hạn. Vui lòng chọn gói theo giờ.',
  NGUON_KHONG_HOP_LE: 'Nguồn check-in không hợp lệ (chỉ nhận qr hoặc manual).',
  KHONG_CO_GOI_HOP_LE: 'Phiên này không có gói hợp lệ nên không được tính giờ tích lũy.',
  CHUA_XAC_NHAN_NHAP_TAY: 'Bản ghi nhập tay chưa được nhân viên xác nhận nên chưa được tính giờ tích lũy.',
  PHONG_KHONG_TON_TAI: 'Không tìm thấy phòng này.',
  PHONG_NGUNG_HOAT_DONG: 'Phòng này đang tạm ngưng hoạt động.',
  KHUNG_GIO_KHONG_HOP_LE: 'Khung giờ đặt phòng không hợp lệ. Vui lòng chọn lại giờ bắt đầu và kết thúc.',
  KET_THUC_TRUOC_BAT_DAU: 'Giờ kết thúc phải sau giờ bắt đầu.',
  KHONG_DUNG_BUOC_DAT_PHONG: 'Giờ bắt đầu và kết thúc phải tròn giờ hoặc 30 phút (ví dụ 14:00, 14:30).',
  THOI_LUONG_QUA_NGAN: 'Thời gian đặt phòng tối thiểu là 1 giờ.',
  BAT_DAU_TRONG_QUA_KHU: 'Giờ bắt đầu đã qua. Vui lòng chọn giờ khác.',
  CHUA_DAT_COC: 'Cần thanh toán tiền cọc để hoàn tất đặt phòng.',
  PHONG_DANG_DUOC_GIU: 'Phòng đang được giữ cho một khách khác trong lúc thanh toán cọc. Vui lòng chọn khung giờ khác hoặc thử lại sau ít phút.',
  PHONG_DA_CO_NGUOI_DAT: 'Phòng đã có người đặt trong khung giờ này. Vui lòng chọn khung giờ khác.',
  VUOT_SUC_CHUA: 'Số người vượt quá sức chứa tối đa của phòng. Vui lòng chọn phòng lớn hơn.',
  SO_NGUOI_KHONG_HOP_LE: 'Số người phải là số nguyên từ 1 trở lên.',
  SO_TRANG_KHONG_HOP_LE: 'Số trang phải là số nguyên từ 1 trở lên.',
  SO_BAN_KHONG_HOP_LE: 'Số bản phải là số nguyên từ 1 trở lên.',
  VAN_PHONG_PHAM_KHONG_TON_TAI: 'Không tìm thấy món văn phòng phẩm này.',
  CHUA_BAT_CHE_DO_HE: 'Thẻ tháng hè chỉ bán khi chương trình mùa hè đang bật.',
  HET_SUAT_THE_HE: 'Thẻ tháng hè đã hết suất.',
  THIEU_PHUT_HIEU_LUC_GOI: 'Thiếu thời lượng hiệu lực của gói để tính giờ tích lũy.',
});

// ============================================================================
// Hàm hỗ trợ về thời gian (thuần, không đọc đồng hồ)
// ============================================================================

/**
 * Đổi một thời điểm sang mili giây. Nhận số, chuỗi ISO hoặc đối tượng có getTime().
 * Chuỗi không có múi giờ (ví dụ '2026-11-23T14:00') được hiểu là giờ Việt Nam.
 */
export function layMs(thoiDiem) {
  if (typeof thoiDiem === 'number' && Number.isFinite(thoiDiem)) return thoiDiem;
  if (typeof thoiDiem === 'string') {
    let chuoi = thoiDiem.trim();
    const coGio = /T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(chuoi); // có giờ nhưng chưa có múi giờ
    if (coGio) chuoi += '+07:00';
    const ms = Date.parse(chuoi);
    if (Number.isFinite(ms)) return ms;
  }
  if (thoiDiem && typeof thoiDiem.getTime === 'function') {
    const ms = thoiDiem.getTime();
    if (Number.isFinite(ms)) return ms;
  }
  throw new Error('Thời điểm không hợp lệ: ' + String(thoiDiem));
}

/** Số phút đã qua kể từ 0h00 (giờ Việt Nam) của thời điểm đó, từ 0 đến 1439. */
export function phutTrongNgayVN(thoiDiem) {
  const t = layMs(thoiDiem) + LECH_GIO_VN_MS;
  const phanDu = ((t % MS_NGAY) + MS_NGAY) % MS_NGAY;
  return Math.floor(phanDu / MS_PHUT);
}

/** Mili giây của 0h00 (giờ Việt Nam) trong ngày chứa thời điểm đó. */
export function dauNgayVN(thoiDiem) {
  const t = layMs(thoiDiem) + LECH_GIO_VN_MS;
  return Math.floor(t / MS_NGAY) * MS_NGAY - LECH_GIO_VN_MS;
}

/**
 * Phút trong ngày có nằm trong khung { tu, den } (giờ nguyên 0-23) không.
 * tu tính, den KHÔNG tính. Khung qua nửa đêm có tu > den (ví dụ 23 -> 6).
 */
export function trongKhung(phutTrongNgay, khung) {
  const tu = khung.tu * PHUT_MOI_GIO;
  const den = khung.den * PHUT_MOI_GIO;
  if (tu < den) return phutTrongNgay >= tu && phutTrongNgay < den;
  return phutTrongNgay >= tu || phutTrongNgay < den;
}

/** Đổi thời điểm sang chuỗi ISO giờ Việt Nam, ví dụ '2026-11-23T17:00:00+07:00'. Không dùng Date. */
export function chuoiGioVN(thoiDiem) {
  const t = layMs(thoiDiem) + LECH_GIO_VN_MS;
  const ngaySo = Math.floor(t / MS_NGAY);
  const phanDu = t - ngaySo * MS_NGAY;
  const gio = Math.floor(phanDu / MS_GIO);
  const phut = Math.floor((phanDu % MS_GIO) / MS_PHUT);
  const giay = Math.floor((phanDu % MS_PHUT) / 1000);

  // Đổi số ngày kể từ 1/1/1970 sang năm-tháng-ngày (thuật toán ngày dân dụng, số học thuần).
  const z = ngaySo + 719468;
  const ky = Math.floor(z / 146097);
  const ngayTrongKy = z - ky * 146097;
  const namTrongKy = Math.floor(
    (ngayTrongKy - Math.floor(ngayTrongKy / 1460) + Math.floor(ngayTrongKy / 36524)
      - Math.floor(ngayTrongKy / 146096)) / 365
  );
  const namGoc = namTrongKy + ky * 400;
  const ngayTrongNam = ngayTrongKy - (365 * namTrongKy + Math.floor(namTrongKy / 4) - Math.floor(namTrongKy / 100));
  const mp = Math.floor((5 * ngayTrongNam + 2) / 153);
  const ngay = ngayTrongNam - Math.floor((153 * mp + 2) / 5) + 1;
  const thang = mp < 10 ? mp + 3 : mp - 9;
  const nam = thang <= 2 ? namGoc + 1 : namGoc;

  const chen0 = (so) => String(so).padStart(2, '0');
  return `${nam}-${chen0(thang)}-${chen0(ngay)}T${chen0(gio)}:${chen0(phut)}:${chen0(giay)}+07:00`;
}

// ---------- Hàm hỗ trợ khác ----------

function layCauHinh(cauHinh) {
  if (!cauHinh || typeof cauHinh !== 'object') {
    throw new Error('Thiếu tham số cauHinh. Hãy truyền kết quả getConfig() hoặc các export của js/config.js.');
  }
  return cauHinh;
}

function loi(maLoi) {
  return { hopLe: false, maLoi };
}

function lamTron2(so) {
  return Math.round(so * 100) / 100;
}

function laSoHuuHan(so) {
  return typeof so === 'number' && Number.isFinite(so);
}

function laSoNguyenDuong(so) {
  return Number.isInteger(so) && so >= 1;
}

// ============================================================================
// 6.1 Tầng và chỗ ngồi
// ============================================================================

/**
 * R01, mục 6.1: tầng 1 và tầng 2 mở 24/7 (đọc từ cờ mo24h của TANG).
 * Giờ không ảnh hưởng: tầng mo24h luôn check-in được. Tầng 3 trả mo24h = false;
 * chỗ tự do tầng 3 do R02 quyết định.
 */
export function r01TangMo24h({ tang, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const thongTin = ch.TANG.find((t) => t.id === tang);
  if (!thongTin) return loi('TANG_KHONG_TON_TAI');
  return { hopLe: true, mo24h: thongTin.mo24h === true };
}

/**
 * R02, mục 6.1: chỗ tự do tầng 3 mở hay đóng.
 *
 * CÁCH HIỂU (đặc tả viết R02 và R03 hơi lệch nhau nên chia ngày thành 3 vùng giờ):
 *   - Cao điểm 19h-23h: luôn MỞ.
 *   - Đêm 23h-6h: luôn ĐÓNG, dù tầng 1-2 đầy (theo R03).
 *   - Còn lại (6h-19h): tầng 1-2 vượt 85% (từ 50 khách trở lên trong 58 chỗ) thì MỞ;
 *     dưới 70% thì ĐÓNG; từ 70% đến 85% thì GIỮ NGUYÊN trạng thái trước đó (dangMo).
 *     Vùng giữ nguyên chính là "độ trễ" để tầng 3 không đóng mở liên tục quanh ngưỡng.
 *   - "Vượt" nghĩa là lớn hơn 85%, "dưới" nghĩa là nhỏ hơn 70%. Tính bằng số nguyên
 *     (khách x 100 so với ngưỡng x số chỗ) để không dính sai số số thực.
 * Tham số: thoiDiem; khachTang12 (số khách đang ngồi ở tầng 1 và 2); dangMo (tầng 3 đang
 * mở ngay trước thời điểm này, mặc định false).
 * Trả về { hopLe, mo, lyDo } với lyDo: 'caoDiem' | 'dem' | 'tang12Dong' | 'tang12Vang' | 'giuNguyen'.
 */
export function r02MoTang3({ thoiDiem, khachTang12, dangMo = false, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const qt = ch.QUY_TAC;
  if (!laSoHuuHan(khachTang12) || khachTang12 < 0) return loi('DU_LIEU_KHONG_HOP_LE');

  const phut = phutTrongNgayVN(thoiDiem);
  if (trongKhung(phut, ch.KHUNG_GIO.caoDiem)) return { hopLe: true, mo: true, lyDo: 'caoDiem' };
  if (trongKhung(phut, ch.KHUNG_GIO.dem)) return { hopLe: true, mo: false, lyDo: 'dem' };

  const choTang12 = ch.CHO_TANG_1_2;
  const khachNhanTram = khachTang12 * TRAM;
  if (khachNhanTram > qt.nguongMoTang3PhanTram * choTang12) return { hopLe: true, mo: true, lyDo: 'tang12Dong' };
  if (khachNhanTram < qt.nguongDongTang3PhanTram * choTang12) return { hopLe: true, mo: false, lyDo: 'tang12Vang' };
  return { hopLe: true, mo: dangMo === true, lyDo: 'giuNguyen' };
}

/**
 * R03, mục 6.1: 23h-6h chỉ tầng 1-2 hoạt động; chỗ tự do tầng 3 đóng dù tầng 1-2 đầy;
 * phòng họp tầng 3 vẫn đặt được.
 * Trả về { hopLe, laGioDem, tangChoTuDoCoTheMo, phongHopTang3DatDuoc }.
 * Ngoài giờ đêm, tangChoTuDoCoTheMo gồm cả tầng 3 nhưng tầng 3 có mở thật hay không còn do R02.
 */
export function r03CheDoDem({ thoiDiem, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const laGioDem = trongKhung(phutTrongNgayVN(thoiDiem), ch.KHUNG_GIO.dem);
  const tangChoTuDoCoTheMo = ch.TANG.filter((t) => !laGioDem || t.mo24h).map((t) => t.id);
  return { hopLe: true, laGioDem, tangChoTuDoCoTheMo, phongHopTang3DatDuoc: true };
}

/**
 * R04, mục 6.1: công suất = số khách đang ngồi chia số chỗ đang mở; mức đông [MĐ]:
 * Vắng dưới 30%; Vừa từ 30% đến dưới 60%; Đông từ 60% đến 85%; Gần kín trên 85%.
 * Đúng 60% xếp vào Đông, đúng 85% vẫn là Đông (đặc tả chưa nói rõ biên).
 * Số chỗ đang mở bằng 0 (tầng đóng) thì muc = null, không gán mức nào.
 * Trả về { hopLe, phanTram (làm tròn 1 chữ số thập phân), muc, ten }.
 */
export function r04MucDong({ soKhach, soChoDangMo, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const m = ch.QUY_TAC.mucDong;
  if (!laSoHuuHan(soKhach) || soKhach < 0 || !laSoHuuHan(soChoDangMo) || soChoDangMo < 0) {
    return loi('DU_LIEU_KHONG_HOP_LE');
  }
  if (soChoDangMo === 0) return { hopLe: true, phanTram: 0, muc: null, ten: null };

  const khachNhanTram = soKhach * TRAM;
  let muc;
  if (khachNhanTram < m.vangDuoi * soChoDangMo) muc = 'vang';
  else if (khachNhanTram < m.vuaDuoi * soChoDangMo) muc = 'vua';
  else if (khachNhanTram <= m.dongToiDa * soChoDangMo) muc = 'dong';
  else muc = 'ganKin';

  return {
    hopLe: true,
    phanTram: Math.round((khachNhanTram * 10) / soChoDangMo) / 10,
    muc,
    ten: ch.MUC_DONG_TEN[muc],
  };
}

/**
 * R05, mục 6.1: mỗi khách chỉ có một phiên đang hoạt động.
 * cacPhienCuaKhach: mảng phiên của khách, mỗi phần tử có status.
 * Phiên 'active' và 'away' (tạm rời, giờ vẫn chạy) đều là đang hoạt động.
 */
export function r05MotPhienHoatDong({ cacPhienCuaKhach }) {
  if (!Array.isArray(cacPhienCuaKhach)) return loi('DU_LIEU_KHONG_HOP_LE');
  const dangNgoi = cacPhienCuaKhach.some((p) => p && (p.status === 'active' || p.status === 'away'));
  return dangNgoi ? loi('DANG_CO_PHIEN') : { hopLe: true };
}

// ============================================================================
// 6.2 Gói chỗ ngồi và giờ
// ============================================================================

/**
 * R06, mục 6.2: gói 1, 3, 6, 9 giờ dùng liên tục kể từ lúc check-in và hết hạn khi hết số giờ.
 * Không chia nhiều lần trong ngày; ra khỏi quán giờ vẫn chạy [MĐ]. (Hàm chỉ tính hạn;
 * việc chặn "chia nhiều lần" là do mỗi gói chỉ gắn với một phiên, theo R05.)
 * Trả về { hopLe, soPhutGoi, hetHan, chayLienTuc }.
 */
export function r06HanGoiTheoGio({ goiId, thoiDiemCheckIn, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const goi = ch.GOI_CHO_NGOI.find((g) => g.id === goiId);
  if (!goi) return loi('GOI_KHONG_TON_TAI');
  if (goi.kind !== 'hourly') return loi('GOI_KHONG_PHAI_THEO_GIO');
  const soPhutGoi = goi.hours * PHUT_MOI_GIO;
  return {
    hopLe: true,
    soPhutGoi,
    hetHan: chuoiGioVN(layMs(thoiDiemCheckIn) + soPhutGoi * MS_PHUT),
    chayLienTuc: true,
  };
}

/**
 * R07, mục 6.2: combo đêm chỉ mua và check-in trong khung KHUNG_GIO.comboDem
 * (23h đến trước 6h), hết hiệu lực lúc 7h [MĐ].
 * LƯU Ý MÂU THUẪN trong đặc tả: mục 4.6 và M4 ghi check-in 23h-7h, còn R07 và mục 12 #4
 * ghi 23h-6h. Đang theo R07 (đúng config.js): check-in 6h30 bị từ chối dù gói còn hạn tới 7h.
 * Hạn = lần đầu tiên sau thời điểm check-in mà đồng hồ chỉ hetHieuLuc giờ.
 * Trả về { hopLe, hetHan } hoặc { hopLe: false, maLoi: 'NGOAI_KHUNG_COMBO_DEM' }.
 */
export function r07ComboDem({ thoiDiem, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const kh = ch.KHUNG_GIO.comboDem;
  const ms = layMs(thoiDiem);
  if (!trongKhung(phutTrongNgayVN(ms), { tu: kh.checkInTu, den: kh.checkInDen })) {
    return loi('NGOAI_KHUNG_COMBO_DEM');
  }
  let hetHanMs = dauNgayVN(ms) + kh.hetHieuLuc * MS_GIO;
  if (hetHanMs <= ms) hetHanMs += MS_NGAY;
  return { hopLe: true, hetHan: chuoiGioVN(hetHanMs) };
}

/**
 * R08, mục 6.2: Combo Trọn Ngày hiệu lực từ check-in đến check-out nhưng tối đa 24 giờ [MĐ];
 * kèm 1 đồ uống (một lần), 10 tờ in miễn phí, cộng cố định 10 giờ tích điểm.
 * Mọi con số lấy từ gói kind 'day' trong GOI_CHO_NGOI (maxHours, gifts, freeSheets, creditHours).
 * Trả về { hopLe, hetHanToiDa, soQuaTang, soToInMienPhi, gioTichDiem }.
 */
export function r08ComboTronNgay({ thoiDiemCheckIn, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const goi = ch.GOI_CHO_NGOI.find((g) => g.kind === 'day');
  if (!goi) return loi('GOI_KHONG_TON_TAI');
  return {
    hopLe: true,
    hetHanToiDa: chuoiGioVN(layMs(thoiDiemCheckIn) + goi.maxHours * MS_GIO),
    soQuaTang: goi.gifts.reduce((tong, qua) => tong + qua.qty, 0),
    soToInMienPhi: goi.freeSheets,
    gioTichDiem: goi.creditHours,
  };
}

/**
 * R09, mục 6.2: vượt giờ. Có 10 phút ân hạn [MĐ]; vượt quá ân hạn thì tính phụ phí
 * 12.000đ cho mỗi giờ hoặc phần của giờ, làm tròn lên [MĐ].
 *
 * CÁCH HIỂU: ân hạn là NGƯỠNG BỎ QUA, không phải phần miễn phí. Vượt không quá 10 phút thì
 * 0đ; vượt quá 10 phút thì tính TOÀN BỘ phần vượt kể từ lúc hết gói: số giờ tính phí =
 * làm tròn lên (phút vượt / 60). Cả ba ví dụ (1h08 -> 0đ; 1h25 -> 12.000đ; 2h15 -> 24.000đ)
 * khớp cách hiểu này. Cách hiểu khác (trừ 10 phút ân hạn rồi mới làm tròn) cũng khớp ba ví dụ
 * nhưng cho kết quả khác khi phút vượt nằm trong 61-70, 121-130... (ví dụ vượt 65 phút:
 * cách này tính 2 giờ = 24.000đ, cách kia tính 1 giờ = 12.000đ).
 * Tham số: soPhutGoi (tổng phút gói đã mua, gồm cả gia hạn); soPhutThucTe (phút ngồi thực tế).
 * Trả về { hopLe, phutVuot, trongAnHan, soGioTinhPhi, phuPhi }.
 */
export function r09VuotGio({ soPhutGoi, soPhutThucTe, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  if (!laSoHuuHan(soPhutGoi) || soPhutGoi < 0 || !laSoHuuHan(soPhutThucTe) || soPhutThucTe < 0) {
    return loi('DU_LIEU_KHONG_HOP_LE');
  }
  const phutVuot = Math.max(0, soPhutThucTe - soPhutGoi);
  const trongAnHan = phutVuot <= qt.anHanVuotGioPhut;
  const soGioTinhPhi = trongAnHan ? 0 : Math.ceil(phutVuot / PHUT_MOI_GIO);
  return {
    hopLe: true,
    phutVuot,
    trongAnHan,
    soGioTinhPhi,
    phuPhi: Math.round(soGioTinhPhi * qt.phiVuotGioMoiGio),
  };
}

/**
 * R10, mục 6.2: gia hạn là mua thêm gói khi đang ngồi, nối tiếp gói hiện tại.
 * Hạn mới = max(hạn hiện tại, thời điểm mua) + số phút của gói mới. Nếu gói cũ đã hết hạn
 * lúc mua (đang vượt giờ) thì gói mới tính từ lúc mua; phần vượt trước đó vẫn tính phụ phí
 * theo R09 (đặc tả chưa nói rõ tình huống này).
 * CHƯA QUY ĐỊNH: gia hạn bằng combo đêm hoặc Combo Trọn Ngày (đặc tả không nói cách nối hạn)
 * nên hàm trả lỗi GIA_HAN_GOI_NAY_CHUA_QUY_DINH; hiện chỉ hỗ trợ gói theo giờ.
 * Trả về { hopLe, soPhutCong, hetHanMoi }.
 */
export function r10GiaHan({ hetHanHienTai, thoiDiemMua, goiId, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const goi = ch.GOI_CHO_NGOI.find((g) => g.id === goiId);
  if (!goi) return loi('GOI_KHONG_TON_TAI');
  if (goi.kind !== 'hourly') return loi('GIA_HAN_GOI_NAY_CHUA_QUY_DINH');
  const diemNoi = Math.max(layMs(hetHanHienTai), layMs(thoiDiemMua));
  const soPhutCong = goi.hours * PHUT_MOI_GIO;
  return { hopLe: true, soPhutCong, hetHanMoi: chuoiGioVN(diemNoi + soPhutCong * MS_PHUT) };
}

/**
 * R11, mục 6.2: giờ chỉ được tính vào tích điểm khi check-in bằng QR và có gói hợp lệ.
 * Check-in nhập tay (chế độ dự phòng) chỉ được tính SAU KHI nhân viên xác nhận.
 * Tham số: nguon ('qr' | 'manual'); coGoiHopLe (boolean); trangThaiNhapTay ('pending' | 'confirmed',
 * chỉ cần khi nguon là 'manual').
 * Trả về { hopLe: true } nếu được tính, ngược lại { hopLe: false, maLoi }.
 */
export function r11DuocTinhTichDiem({ nguon, coGoiHopLe, trangThaiNhapTay = null }) {
  if (nguon !== 'qr' && nguon !== 'manual') return loi('NGUON_KHONG_HOP_LE');
  if (coGoiHopLe !== true) return loi('KHONG_CO_GOI_HOP_LE');
  if (nguon === 'manual' && trangThaiNhapTay !== 'confirmed') return loi('CHUA_XAC_NHAN_NHAP_TAY');
  return { hopLe: true };
}

/**
 * R12, mục 6.2: vắng mặt quá 30 phút thì cảnh báo nhân viên; nhân viên có thể giải phóng chỗ;
 * giờ gói vẫn chạy [MĐ]. "Quá 30 phút" nghĩa là lớn hơn 30 phút (đúng 30 phút chưa cảnh báo).
 * Trả về { hopLe, phutVang, canhBao, coTheGiaiPhongCho, gioVanChay }.
 */
export function r12CanhBaoVang({ thoiDiemTamRoi, thoiDiemHienTai, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  const vangMs = Math.max(0, layMs(thoiDiemHienTai) - layMs(thoiDiemTamRoi));
  const canhBao = vangMs > qt.thoiGianVangPhut * MS_PHUT;
  return {
    hopLe: true,
    phutVang: Math.floor(vangMs / MS_PHUT),
    canhBao,
    coTheGiaiPhongCho: canhBao,
    gioVanChay: true,
  };
}

// ============================================================================
// 6.3 Phòng họp
// ============================================================================

/**
 * R13, mục 6.3: giá phòng = tổng giá từng khung 30 phút nhân (1 trừ mức giảm của khung đó).
 * Mức giảm của mỗi khung do R14 (thấp điểm) và R15 (CLB, không cộng dồn) quyết định.
 * Tính bằng số nguyên rồi làm tròn đến đồng ở bước cuối.
 * Tham số: phongId, batDau, ketThuc, laClbDaDuyet (mặc định false).
 * Trả về { hopLe, soPhut, giaChuan (chưa giảm), tong (sau giảm), giamGia, soKhungGiam }.
 */
export function r13GiaPhong({ phongId, batDau, ketThuc, laClbDaDuyet = false, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const phong = ch.PHONG_HOP.find((p) => p.id === phongId);
  if (!phong) return loi('PHONG_KHONG_TON_TAI');
  if (phong.active === false) return loi('PHONG_NGUNG_HOAT_DONG');

  const buoc = ch.QUY_TAC.buocDatPhongPhut;
  const bd = layMs(batDau);
  const kt = layMs(ketThuc);
  const soPhut = (kt - bd) / MS_PHUT;
  if (!(soPhut > 0) || soPhut % buoc !== 0) return loi('KHUNG_GIO_KHONG_HOP_LE');

  let tuSo = 0;
  let soKhungGiam = 0;
  for (let t = bd; t < kt; t += buoc * MS_PHUT) {
    const { thapDiem } = r14ThapDiem({ thoiDiem: t, cauHinh });
    const { phanTramGiam } = r15MucGiam({ thapDiem, laClbDaDuyet, cauHinh });
    tuSo += phong.pricePerHour * (TRAM - phanTramGiam) * buoc;
    if (phanTramGiam > 0) soKhungGiam += 1;
  }
  const tong = Math.round(tuSo / (PHUT_MOI_GIO * TRAM));
  const giaChuan = Math.round((phong.pricePerHour * soPhut) / PHUT_MOI_GIO);
  return { hopLe: true, soPhut, giaChuan, tong, giamGia: giaChuan - tong, soKhungGiam };
}

/**
 * R14, mục 6.3: giờ thấp điểm của phòng họp là 23h-6h và 6h-11h, giảm 10%; 11h-23h là giá
 * chuẩn, kể cả giờ cao điểm 19h-23h [MĐ].
 * KIỂM TRA MÂU THUẪN: không có. Hai khung { 23 -> 6 } và { 6 -> 11 } nối liền nhau thành một
 * khoảng 23h đến trước 11h hôm sau, không chồng lấn và không hở; 6h00 thuộc khung thứ hai,
 * 11h00 là giá chuẩn, 23h00 là thấp điểm. (Việc tầng 3 đóng chỗ tự do lúc 23h-6h ở R03 không
 * liên quan: phòng họp tầng 3 vẫn đặt được và vẫn được giảm giá thấp điểm.)
 * Tham số: thoiDiem (thời điểm bắt đầu của một khung 30 phút).
 * Trả về { hopLe, thapDiem, phanTramGiam }.
 */
export function r14ThapDiem({ thoiDiem, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const phut = phutTrongNgayVN(thoiDiem);
  const thapDiem = ch.KHUNG_GIO.phongThapDiem.some((khung) => trongKhung(phut, khung));
  return { hopLe: true, thapDiem, phanTramGiam: thapDiem ? ch.QUY_TAC.giamThapDiemPhanTram : 0 };
}

/**
 * R15, mục 6.3: giảm giá CLB 10% cho tài khoản thuộc CLB đã duyệt; giảm giá không cộng dồn,
 * lấy mức cao hơn [MĐ]. Khi hai mức bằng nhau, ghi nhận loại là 'clb'.
 * Trả về { hopLe, phanTramGiam, loai } với loai: 'clb' | 'thapDiem' | null.
 */
export function r15MucGiam({ thapDiem, laClbDaDuyet, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  const giamThapDiem = thapDiem === true ? qt.giamThapDiemPhanTram : 0;
  const giamClb = laClbDaDuyet === true ? qt.giamClbPhanTram : 0;
  const phanTramGiam = Math.max(giamThapDiem, giamClb);
  let loai = null;
  if (phanTramGiam > 0) loai = giamClb >= giamThapDiem ? 'clb' : 'thapDiem';
  return { hopLe: true, phanTramGiam, loai };
}

/**
 * R16, mục 6.3: tiền cọc bằng giá chuẩn của phòng cho 1 giờ (không giảm); được trừ vào tổng
 * tiền khi sử dụng. Nếu tổng tiền nhỏ hơn cọc (ví dụ thuê 1 giờ thấp điểm) thì conPhaiTra = 0
 * và phần dư báo ở cocDu; đặc tả CHƯA nói phần cọc dư xử lý ra sao (hoàn hay giữ).
 * Trả về { hopLe, coc, conPhaiTra, cocDu }.
 */
export function r16Coc({ phongId, tongTien, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const phong = ch.PHONG_HOP.find((p) => p.id === phongId);
  if (!phong) return loi('PHONG_KHONG_TON_TAI');
  if (!laSoHuuHan(tongTien) || tongTien < 0) return loi('DU_LIEU_KHONG_HOP_LE');
  const coc = Math.round(phong.pricePerHour * ch.QUY_TAC.cocPhongSoGio);
  return {
    hopLe: true,
    coc,
    conPhaiTra: Math.max(0, tongTien - coc),
    cocDu: Math.max(0, coc - tongTien),
  };
}

/**
 * R17, mục 6.3: hủy trước giờ bắt đầu từ 2 giờ trở lên thì hoàn cọc; ít hơn 2 giờ thì mất cọc.
 * Đúng 2 giờ 00 phút còn được hoàn. Hủy sau giờ bắt đầu cũng là mất cọc.
 * Trả về { hopLe, phutConLai, hoanCoc, ketQuaCoc } với ketQuaCoc: 'refunded' | 'forfeited'.
 */
export function r17HuyPhong({ thoiDiemHuy, batDauDat, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  const conLaiMs = layMs(batDauDat) - layMs(thoiDiemHuy);
  const hoanCoc = conLaiMs >= qt.hanHoanCocGio * MS_GIO;
  return {
    hopLe: true,
    phutConLai: Math.floor(conLaiMs / MS_PHUT),
    hoanCoc,
    ketQuaCoc: hoanCoc ? 'refunded' : 'forfeited',
  };
}

/**
 * R18, mục 6.3: không đến là quá 15 phút sau giờ bắt đầu mà chưa check-in phòng [MĐ].
 * "Quá 15 phút" nghĩa là lớn hơn 15 phút (đúng 14h15 chưa tính). Không đến thì mất cọc;
 * nhân viên có thể bỏ qua trong trường hợp đặc biệt (xử lý ở giao diện nhân viên).
 * Trả về { hopLe, phutTre, khongDen, ketQuaCoc } với ketQuaCoc: 'forfeited' | 'held'.
 */
export function r18KhongDen({ batDauDat, thoiDiemHienTai, daCheckIn, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  const treMs = Math.max(0, layMs(thoiDiemHienTai) - layMs(batDauDat));
  const khongDen = daCheckIn !== true && treMs > qt.choKhongDenPhut * MS_PHUT;
  return {
    hopLe: true,
    phutTre: Math.floor(treMs / MS_PHUT),
    khongDen,
    ketQuaCoc: khongDen ? 'forfeited' : 'held',
  };
}

/**
 * R19, mục 6.3: không đặt trùng; giữ tạm 10 phút khi đang thanh toán cọc [MĐ].
 * cacDatPhongHienCo: mảng { id, roomId, startAt, endAt, status, holdExpiresAt }.
 *   - confirmed, checkedIn, completed: chiếm phòng.
 *   - holding: chỉ chiếm khi holdExpiresAt còn sau thoiDiemHienTai (hết hạn thì tự nhả).
 *   - cancelled, noShow: không chiếm.
 * Hai khung chạm đầu mút (kết thúc 15h, bắt đầu 15h) KHÔNG trùng.
 * boQuaMa: mã đặt phòng cần bỏ qua (ví dụ chính lượt giữ của người đang thanh toán).
 * Trả về { hopLe: true, giuDen } (hạn giữ cho lượt mới) hoặc { hopLe: false, maLoi } với maLoi
 * 'PHONG_DANG_DUOC_GIU' (người trước đang thanh toán cọc) hoặc 'PHONG_DA_CO_NGUOI_DAT'.
 */
export function r19KiemTraTrung({ phongId, batDau, ketThuc, cacDatPhongHienCo = [], thoiDiemHienTai, boQuaMa = null, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  const bd = layMs(batDau);
  const kt = layMs(ketThuc);
  const nay = layMs(thoiDiemHienTai);
  if (!(kt > bd)) return loi('KET_THUC_TRUOC_BAT_DAU');

  for (const dat of cacDatPhongHienCo) {
    if (!dat || dat.roomId !== phongId) continue;
    if (boQuaMa !== null && dat.id === boQuaMa) continue;

    let chiemPhong = dat.status === 'confirmed' || dat.status === 'checkedIn' || dat.status === 'completed';
    let dangGiu = false;
    if (dat.status === 'holding') {
      dangGiu = Boolean(dat.holdExpiresAt) && layMs(dat.holdExpiresAt) > nay;
      chiemPhong = dangGiu;
    }
    if (!chiemPhong) continue;

    if (layMs(dat.startAt) < kt && bd < layMs(dat.endAt)) {
      return loi(dangGiu ? 'PHONG_DANG_DUOC_GIU' : 'PHONG_DA_CO_NGUOI_DAT');
    }
  }
  return { hopLe: true, giuDen: chuoiGioVN(nay + qt.thoiGianGiuPhongPhut * MS_PHUT) };
}

/**
 * R20, mục 6.3: đặt tối thiểu 1 giờ, bước 30 phút; đặt không cần báo trước và không cần duyệt
 * nhưng bắt buộc cọc [MĐ].
 * CÁCH HIỂU: "bước 30 phút" áp dụng cho cả giờ bắt đầu và giờ kết thúc (nằm trên mốc :00 hoặc
 * :30, đúng mục M5.2). Vì vậy "đặt ngay lúc này cho 5 phút sau" chỉ xảy ra khi 5 phút sau
 * đúng là một mốc (ví dụ bây giờ 13:55, đặt 14:00). Giờ bắt đầu không được ở quá khứ.
 * Trả về { hopLe: true, canDuyet: false } hoặc { hopLe: false, maLoi }.
 */
export function r20DieuKienDatPhong({ batDau, ketThuc, thoiDiemHienTai, daDatCoc, cauHinh }) {
  const qt = layCauHinh(cauHinh).QUY_TAC;
  const bd = layMs(batDau);
  const kt = layMs(ketThuc);
  const nay = layMs(thoiDiemHienTai);
  const buocMs = qt.buocDatPhongPhut * MS_PHUT; // 7 giờ lệch múi là bội của 30 phút nên chia thẳng mili giây được

  if (kt <= bd) return loi('KET_THUC_TRUOC_BAT_DAU');
  if (bd % buocMs !== 0 || kt % buocMs !== 0) return loi('KHONG_DUNG_BUOC_DAT_PHONG');
  if (kt - bd < qt.datPhongToiThieuPhut * MS_PHUT) return loi('THOI_LUONG_QUA_NGAN');
  if (bd < nay) return loi('BAT_DAU_TRONG_QUA_KHU');
  if (daDatCoc !== true) return loi('CHUA_DAT_COC');
  return { hopLe: true, canDuyet: false };
}

/**
 * R21, mục 6.3: số người không vượt sức chứa tối đa của phòng.
 * (Chỉ kiểm tra mức tối đa; đặc tả không đặt mức tối thiểu cho số người.)
 */
export function r21SucChua({ phongId, soNguoi, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const phong = ch.PHONG_HOP.find((p) => p.id === phongId);
  if (!phong) return loi('PHONG_KHONG_TON_TAI');
  if (!laSoNguyenDuong(soNguoi)) return loi('SO_NGUOI_KHONG_HOP_LE');
  if (soNguoi > phong.capacityMax) return loi('VUOT_SUC_CHUA');
  return { hopLe: true };
}

// ============================================================================
// 6.4 Tích điểm
// ============================================================================

/**
 * R22, mục 6.4: mỗi lần đạt thêm 100 giờ tích lũy (100, 200, 300...) tặng 1 voucher Combo
 * Trọn Ngày; giờ KHÔNG bị trừ sau khi nhận [MĐ]. Một lần cộng vượt nhiều mốc thì tặng nhiều
 * voucher. Ví dụ 99 giờ cộng 2 giờ thành 101 giờ thì nhận 1 voucher (khớp); ví dụ M7:
 * 88 + 10 = 98 (chưa có), cộng thêm 3 giờ = 101 thì có 1 voucher (khớp).
 * Hạn voucher: xem THAM_SO_BO_SUNG.voucher.hanNgay (đặc tả mâu thuẫn 30 và 90 ngày).
 * Trả về { hopLe, gioSau, soVoucherMoi, cacMoc, hanDungNgay }.
 */
export function r22VoucherTichDiem({ gioTruoc, gioCong, cauHinh }) {
  const tp = thamSoBoSung(cauHinh).voucher;
  if (!laSoHuuHan(gioTruoc) || gioTruoc < 0 || !laSoHuuHan(gioCong) || gioCong < 0) return loi('DU_LIEU_KHONG_HOP_LE');
  const truoc = lamTron2(gioTruoc);
  const sau = lamTron2(truoc + gioCong);
  const mocTruoc = Math.floor(truoc / tp.mocGio);
  const mocSau = Math.floor(sau / tp.mocGio);
  const cacMoc = [];
  for (let k = mocTruoc + 1; k <= mocSau; k += 1) cacMoc.push(k * tp.mocGio);
  return { hopLe: true, gioSau: sau, soVoucherMoi: cacMoc.length, cacMoc, hanDungNgay: tp.hanNgay };
}

/**
 * R23, mục 6.4: Combo Trọn Ngày cộng cố định 10 giờ; gói khác cộng theo giờ ngồi thực tế,
 * tối đa bằng thời lượng gói cộng giờ vượt đã trả. Ví dụ gói 3 giờ ngồi 2 giờ cộng 2 giờ (khớp).
 * Tham số: goiId; phutNgoiThucTe; soGioVuotDaTra (số giờ tính phí ở R09, mặc định 0);
 * phutHieuLucGoi (chỉ cần với combo đêm vì gói này không có số giờ cố định).
 * Trả về { hopLe, phutCong, gioCong, coDinh }.
 */
export function r23GioTichDiem({ goiId, phutNgoiThucTe, soGioVuotDaTra = 0, phutHieuLucGoi = null, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const goi = ch.GOI_CHO_NGOI.find((g) => g.id === goiId);
  if (!goi) return loi('GOI_KHONG_TON_TAI');

  if (goi.kind === 'day') {
    return { hopLe: true, phutCong: goi.creditHours * PHUT_MOI_GIO, gioCong: goi.creditHours, coDinh: true };
  }
  if (!laSoHuuHan(phutNgoiThucTe) || phutNgoiThucTe < 0 || !laSoHuuHan(soGioVuotDaTra) || soGioVuotDaTra < 0) {
    return loi('DU_LIEU_KHONG_HOP_LE');
  }

  let phutGoi;
  if (goi.kind === 'hourly') phutGoi = goi.hours * PHUT_MOI_GIO;
  else if (laSoHuuHan(phutHieuLucGoi)) phutGoi = phutHieuLucGoi;
  else return loi('THIEU_PHUT_HIEU_LUC_GOI');

  const tran = phutGoi + soGioVuotDaTra * PHUT_MOI_GIO;
  const phutCong = Math.max(0, Math.min(phutNgoiThucTe, tran));
  return { hopLe: true, phutCong, gioCong: lamTron2(phutCong / PHUT_MOI_GIO), coDinh: false };
}

/**
 * R24, mục 6.4: bảng vinh danh top 3; số giờ bằng nhau thì ai đạt trước xếp trước; khách ẩn tên
 * hiện là "Thành viên ẩn danh" (giờ vẫn được tính).
 * danhSach: mảng { userId, ten, gio, datMocLuc, anTen }. Trong đó datMocLuc là thời điểm khách
 * đạt đúng số giờ hiện tại (hàm không tự suy ra được, bên gọi phải cung cấp); thiếu thì xếp sau.
 * Người có 0 giờ không lên bảng. Hàm dùng cho cả bảng tháng và bảng năm: bên gọi chỉ cần
 * truyền số giờ của kỳ tương ứng.
 * Trả về { hopLe, top: [{ hang, userId, ten, gio }] }.
 */
export function r24BangVinhDanh({ danhSach, soLuong = null, cauHinh }) {
  const tp = thamSoBoSung(cauHinh).bangVinhDanh;
  if (!Array.isArray(danhSach)) return loi('DU_LIEU_KHONG_HOP_LE');
  const gioiHan = soLuong === null ? tp.soLuongTop : soLuong;

  const top = danhSach
    .filter((x) => x && laSoHuuHan(x.gio) && x.gio > 0)
    .map((x) => ({ x, moc: x.datMocLuc ? layMs(x.datMocLuc) : Infinity }))
    .sort((a, b) => (b.x.gio - a.x.gio) || (a.moc - b.moc) || String(a.x.userId).localeCompare(String(b.x.userId)))
    .slice(0, gioiHan)
    .map(({ x }, chiSo) => ({
      hang: chiSo + 1,
      userId: x.userId,
      ten: x.anTen === true ? tp.tenAnDanh : x.ten,
      gio: x.gio,
    }));
  return { hopLe: true, top };
}

// ============================================================================
// 6.5 In ấn và văn phòng phẩm
// ============================================================================

/**
 * R25, mục 6.5: một mặt thì 1 trang là 1 tờ; hai mặt thì 2 trang là 1 tờ (làm tròn lên) [MĐ];
 * số tờ bằng số tờ mỗi bản nhân số bản. Ví dụ 25 trang hai mặt, 2 bản: 13 x 2 = 26 tờ (khớp).
 * Trả về { hopLe, toMoiBan, tongTo }.
 */
export function r25SoTo({ soTrang, soBan, haiMat, cauHinh }) {
  const inAn = layCauHinh(cauHinh).IN_AN;
  if (!laSoNguyenDuong(soTrang)) return loi('SO_TRANG_KHONG_HOP_LE');
  if (!laSoNguyenDuong(soBan)) return loi('SO_BAN_KHONG_HOP_LE');
  const toMoiBan = haiMat === true ? Math.ceil(soTrang / inAn.trangMoiToHaiMat) : soTrang;
  return { hopLe: true, toMoiBan, tongTo: toMoiBan * soBan };
}

/**
 * R26, mục 6.5: giảm 10 tờ miễn phí cho Combo Trọn Ngày đang hoạt động, mỗi combo một lần;
 * đơn giá xác định theo số tờ còn phải trả. Ví dụ 60 tờ có combo: còn 50 tờ tính tiền (khớp).
 * CÁCH HIỂU "một lần": nếu combo chưa dùng quyền này (daDungToMienPhi = false) thì đơn in đầu
 * tiên được trừ tối đa 10 tờ; đơn nhỏ hơn 10 tờ cũng coi như đã dùng quyền (phần dư không giữ lại).
 * Trả về { hopLe, toMienPhi, toPhaiTra }.
 */
export function r26ToMienPhi({ tongTo, coComboDangHoatDong, daDungToMienPhi = false, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const goi = ch.GOI_CHO_NGOI.find((g) => g.kind === 'day');
  if (!goi) return loi('GOI_KHONG_TON_TAI');
  if (!laSoNguyenDuong(tongTo)) return loi('SO_TRANG_KHONG_HOP_LE');
  const duocMienPhi = coComboDangHoatDong === true && daDungToMienPhi !== true;
  const toMienPhi = duocMienPhi ? Math.min(goi.freeSheets, tongTo) : 0;
  return { hopLe: true, toMienPhi, toPhaiTra: tongTo - toMienPhi };
}

/**
 * R27, mục 6.5: đơn giá 1.000đ mỗi tờ; từ 50 tờ PHẢI TRẢ trở lên thì TOÀN BỘ số tờ tính 700đ
 * mỗi tờ. Ví dụ 49 tờ: 49.000đ; 50 tờ: 35.000đ (khớp). Hệ quả đặc tả cố ý: 49 tờ đắt hơn 50 tờ.
 * Các ví dụ M9 đều khớp: 30 tờ 30.000đ; 60 tờ 42.000đ; 50 tờ phải trả (60 tờ có combo) 35.000đ;
 * 45 tờ phải trả (55 tờ có combo) 45.000đ.
 * Trả về { hopLe, donGia, thanhTien }.
 */
export function r27GiaIn({ toPhaiTra, cauHinh }) {
  const inAn = layCauHinh(cauHinh).IN_AN;
  if (!Number.isInteger(toPhaiTra) || toPhaiTra < 0) return loi('SO_TRANG_KHONG_HOP_LE');
  const donGia = toPhaiTra >= inAn.nguongGiaSi ? inAn.donGiaSi : inAn.donGia;
  return { hopLe: true, donGia, thanhTien: toPhaiTra * donGia };
}

/**
 * R28, mục 6.5: văn phòng phẩm cộng vào đơn theo giá niêm yết, không giảm giá.
 * Tham số: muc (mảng { id, soLuong }); tienDonHienTai (tiền in đã có trong đơn, mặc định 0).
 * Trả về { hopLe, chiTiet: [{ id, ten, soLuong, donGia, thanhTien }], tongVanPhongPham, tongDon }.
 */
export function r28VanPhongPham({ muc, tienDonHienTai = 0, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  if (!Array.isArray(muc) || !laSoHuuHan(tienDonHienTai) || tienDonHienTai < 0) return loi('DU_LIEU_KHONG_HOP_LE');
  const chiTiet = [];
  for (const dong of muc) {
    const vp = ch.VAN_PHONG_PHAM.find((m) => m.id === (dong && dong.id));
    if (!vp) return loi('VAN_PHONG_PHAM_KHONG_TON_TAI');
    if (!laSoNguyenDuong(dong.soLuong)) return loi('DU_LIEU_KHONG_HOP_LE');
    chiTiet.push({ id: vp.id, ten: vp.name, soLuong: dong.soLuong, donGia: vp.price, thanhTien: vp.price * dong.soLuong });
  }
  const tongVanPhongPham = chiTiet.reduce((tong, d) => tong + d.thanhTien, 0);
  return { hopLe: true, chiTiet, tongVanPhongPham, tongDon: tienDonHienTai + tongVanPhongPham };
}

// ============================================================================
// 6.6 Thẻ tháng hè và ưu đãi mùa vụ
// ============================================================================

/**
 * R29, mục 6.6: Thẻ tháng hè 1.090.000đ: hiệu lực 26 ngày liên tiếp kể từ ngày kích hoạt (tính
 * cả ngày kích hoạt, hết hiệu lực lúc 0h00 của ngày thứ 27 [MĐ]), mỗi ngày dùng 6 giờ, không
 * cộng dồn; phụ phí vượt giờ theo R09 [MĐ]; giới hạn 20 suất; chỉ bán khi chế độ mùa hè bật.
 * Ví dụ: mua lẻ gói 6 giờ 26 ngày = 55.000 x 26 = 1.430.000đ, thẻ rẻ hơn 340.000đ (khớp).
 * Tham số: cheDoHeBat; soSuatDaBan (mặc định 0); thoiDiemKichHoat (tùy chọn, để tính hetHieuLuc).
 * Trả về { hopLe, giaThe, giaMuaLe, tietKiem, soNgay, phutMoiNgay, khongCongDon, hetHieuLuc }.
 */
export function r29TheThangHe({ cheDoHeBat, soSuatDaBan = 0, thoiDiemKichHoat = null, cauHinh }) {
  const ch = layCauHinh(cauHinh);
  const tp = thamSoBoSung(cauHinh).theHe;
  const goiLe = ch.GOI_CHO_NGOI.find((g) => g.id === tp.goiLeId);
  if (!goiLe) return loi('GOI_KHONG_TON_TAI');
  if (cheDoHeBat !== true) return loi('CHUA_BAT_CHE_DO_HE');
  if (!laSoHuuHan(soSuatDaBan) || soSuatDaBan < 0) return loi('DU_LIEU_KHONG_HOP_LE');
  if (soSuatDaBan >= tp.gioiHanSuat) return loi('HET_SUAT_THE_HE');

  const giaMuaLe = goiLe.price * tp.soNgay;
  return {
    hopLe: true,
    giaThe: tp.gia,
    giaMuaLe,
    tietKiem: giaMuaLe - tp.gia,
    soNgay: tp.soNgay,
    phutMoiNgay: tp.gioMoiNgay * PHUT_MOI_GIO,
    khongCongDon: true,
    hetHieuLuc: thoiDiemKichHoat === null ? null : chuoiGioVN(dauNgayVN(thoiDiemKichHoat) + tp.soNgay * MS_NGAY),
  };
}

/**
 * R30, mục 6.6: tích điểm nhân đôi cho giờ ngồi ban ngày khi chế độ mùa hè bật.
 * "Ban ngày" CHƯA được định nghĩa ở R30; tạm dùng khung 9h-15h [MĐ] (xem THAM_SO_BO_SUNG).
 * Ví dụ 3 giờ ngồi ban ngày cộng 6 giờ (khớp). Chỉ nhân đôi phần giờ rơi vào khung ban ngày;
 * phần ngoài khung cộng bình thường. Combo Trọn Ngày cộng cố định 10 giờ (R23) nên không qua hàm này.
 * Tham số: cheDoHeBat; batDau, ketThuc (khoảng ngồi được tính điểm, đã bị chặn trần theo R23).
 * Trả về { hopLe, phutBanNgay, heSoApDung, phutCong, gioCong }.
 */
export function r30TichDiemNhanDoi({ cheDoHeBat, batDau, ketThuc, cauHinh }) {
  const tp = thamSoBoSung(cauHinh).tichDiemDoiBanNgay;
  const bd = layMs(batDau);
  const kt = layMs(ketThuc);
  if (kt < bd) return loi('KET_THUC_TRUOC_BAT_DAU');

  const tongPhut = Math.floor((kt - bd) / MS_PHUT);
  let phutBanNgay = 0;
  for (let i = 0; i < tongPhut; i += 1) {
    if (trongKhung(phutTrongNgayVN(bd + i * MS_PHUT), tp)) phutBanNgay += 1;
  }
  const heSoApDung = cheDoHeBat === true ? tp.heSo : 1;
  const phutCong = phutBanNgay * heSoApDung + (tongPhut - phutBanNgay);
  return { hopLe: true, phutBanNgay, heSoApDung, phutCong, gioCong: lamTron2(phutCong / PHUT_MOI_GIO) };
}

/**
 * R31, mục 6.6: happy hour ban ngày 9h-15h giảm 10% đồ uống khi chế độ mùa hè bật [MĐ].
 * Ví dụ đồ uống 45.000đ lúc 10h còn 40.500đ (khớp). Chỉ áp cho nhóm 'drink', không áp cho ăn nhẹ.
 * Trả về { hopLe, apDung, phanTramGiam, giaSauGiam }.
 */
export function r31HappyHour({ cheDoHeBat, thoiDiem, nhom, giaGoc, cauHinh }) {
  const tp = thamSoBoSung(cauHinh).happyHour;
  if (!laSoHuuHan(giaGoc) || giaGoc < 0) return loi('DU_LIEU_KHONG_HOP_LE');
  const apDung = cheDoHeBat === true && nhom === 'drink' && trongKhung(phutTrongNgayVN(thoiDiem), tp);
  return {
    hopLe: true,
    apDung,
    phanTramGiam: apDung ? tp.phanTramGiam : 0,
    giaSauGiam: apDung ? Math.round((giaGoc * (TRAM - tp.phanTramGiam)) / TRAM) : giaGoc,
  };
}

// ============================================================================
// Ví dụ kiểm thử (cột "Ví dụ kiểm thử" của mục 6, R01-R31)
// ============================================================================
// Mỗi ví dụ: ma (mã R), moTa, ham (tên hàm xuất ra ở trên), dauVao (không gồm cauHinh;
// test.html tự thêm cauHinh), mongDoi (kết quả mong đợi, so sánh bằng JSON).
// Ví dụ có chữ "(bổ sung)" là ví dụ biên do mình thêm, không nằm trong đặc tả.
// Ngày mẫu: thứ Hai 23/11/2026.

export const VI_DU_KIEM_THU = [
  // ---------- R01 ----------
  { ma: 'R01', moTa: 'Lúc 3h sáng vẫn check-in được ở tầng 1', ham: 'r01TangMo24h',
    dauVao: { tang: 1, thoiDiem: '2026-11-23T03:00:00+07:00' }, mongDoi: { hopLe: true, mo24h: true } },
  { ma: 'R01', moTa: 'Lúc 3h sáng vẫn check-in được ở tầng 2', ham: 'r01TangMo24h',
    dauVao: { tang: 2, thoiDiem: '2026-11-23T03:00:00+07:00' }, mongDoi: { hopLe: true, mo24h: true } },
  { ma: 'R01', moTa: '(bổ sung) Tầng 3 không mở 24/7', ham: 'r01TangMo24h',
    dauVao: { tang: 3 }, mongDoi: { hopLe: true, mo24h: false } },

  // ---------- R02 ----------
  { ma: 'R02', moTa: '14h, tầng 1-2 có 50 khách thì tầng 3 mở', ham: 'r02MoTang3',
    dauVao: { thoiDiem: '2026-11-23T14:00:00+07:00', khachTang12: 50, dangMo: false },
    mongDoi: { hopLe: true, mo: true, lyDo: 'tang12Dong' } },
  { ma: 'R02', moTa: '14h, tầng 3 đang mở, tầng 1-2 xuống 40 khách thì đóng', ham: 'r02MoTang3',
    dauVao: { thoiDiem: '2026-11-23T14:00:00+07:00', khachTang12: 40, dangMo: true },
    mongDoi: { hopLe: true, mo: false, lyDo: 'tang12Vang' } },
  { ma: 'R02', moTa: '(bổ sung) 19h30 cao điểm: mở dù tầng 1-2 vắng', ham: 'r02MoTang3',
    dauVao: { thoiDiem: '2026-11-23T19:30:00+07:00', khachTang12: 10, dangMo: false },
    mongDoi: { hopLe: true, mo: true, lyDo: 'caoDiem' } },
  { ma: 'R02', moTa: '(bổ sung) 14h, 45 khách (khoảng 70-85%), đang mở thì giữ nguyên mở', ham: 'r02MoTang3',
    dauVao: { thoiDiem: '2026-11-23T14:00:00+07:00', khachTang12: 45, dangMo: true },
    mongDoi: { hopLe: true, mo: true, lyDo: 'giuNguyen' } },
  { ma: 'R02', moTa: '(bổ sung) 14h, 45 khách, đang đóng thì giữ nguyên đóng', ham: 'r02MoTang3',
    dauVao: { thoiDiem: '2026-11-23T14:00:00+07:00', khachTang12: 45, dangMo: false },
    mongDoi: { hopLe: true, mo: false, lyDo: 'giuNguyen' } },

  // ---------- R03 ----------
  { ma: 'R03', moTa: '2h sáng chỉ tầng 1-2 hoạt động; phòng họp tầng 3 vẫn đặt được', ham: 'r03CheDoDem',
    dauVao: { thoiDiem: '2026-11-24T02:00:00+07:00' },
    mongDoi: { hopLe: true, laGioDem: true, tangChoTuDoCoTheMo: [1, 2], phongHopTang3DatDuoc: true } },
  { ma: 'R03', moTa: '2h sáng, tầng 1-2 đầy (58 khách) thì tầng 3 vẫn đóng', ham: 'r02MoTang3',
    dauVao: { thoiDiem: '2026-11-24T02:00:00+07:00', khachTang12: 58, dangMo: false },
    mongDoi: { hopLe: true, mo: false, lyDo: 'dem' } },
  { ma: 'R03', moTa: '(bổ sung) 14h không phải giờ đêm', ham: 'r03CheDoDem',
    dauVao: { thoiDiem: '2026-11-23T14:00:00+07:00' },
    mongDoi: { hopLe: true, laGioDem: false, tangChoTuDoCoTheMo: [1, 2, 3], phongHopTang3DatDuoc: true } },

  // ---------- R04 ----------
  { ma: 'R04', moTa: '20 trên 80 chỗ là 25%, Vắng', ham: 'r04MucDong',
    dauVao: { soKhach: 20, soChoDangMo: 80 }, mongDoi: { hopLe: true, phanTram: 25, muc: 'vang', ten: 'Vắng' } },
  { ma: 'R04', moTa: '(bổ sung) 24 trên 80 chỗ đúng 30%: Vừa', ham: 'r04MucDong',
    dauVao: { soKhach: 24, soChoDangMo: 80 }, mongDoi: { hopLe: true, phanTram: 30, muc: 'vua', ten: 'Vừa' } },
  { ma: 'R04', moTa: '(bổ sung) 48 trên 80 chỗ đúng 60%: Đông', ham: 'r04MucDong',
    dauVao: { soKhach: 48, soChoDangMo: 80 }, mongDoi: { hopLe: true, phanTram: 60, muc: 'dong', ten: 'Đông' } },
  { ma: 'R04', moTa: '(bổ sung) 68 trên 80 chỗ đúng 85%: vẫn Đông', ham: 'r04MucDong',
    dauVao: { soKhach: 68, soChoDangMo: 80 }, mongDoi: { hopLe: true, phanTram: 85, muc: 'dong', ten: 'Đông' } },
  { ma: 'R04', moTa: '(bổ sung) 70 trên 80 chỗ (87,5%): Gần kín', ham: 'r04MucDong',
    dauVao: { soKhach: 70, soChoDangMo: 80 }, mongDoi: { hopLe: true, phanTram: 87.5, muc: 'ganKin', ten: 'Gần kín' } },

  // ---------- R05 ----------
  { ma: 'R05', moTa: 'Check-in lần hai khi đang ngồi bị từ chối', ham: 'r05MotPhienHoatDong',
    dauVao: { cacPhienCuaKhach: [{ id: 'p1', status: 'active' }] }, mongDoi: { hopLe: false, maLoi: 'DANG_CO_PHIEN' } },
  { ma: 'R05', moTa: '(bổ sung) Đang tạm rời vẫn là phiên hoạt động', ham: 'r05MotPhienHoatDong',
    dauVao: { cacPhienCuaKhach: [{ id: 'p1', status: 'away' }] }, mongDoi: { hopLe: false, maLoi: 'DANG_CO_PHIEN' } },
  { ma: 'R05', moTa: '(bổ sung) Chỉ có phiên đã kết thúc hoặc hủy thì được check-in', ham: 'r05MotPhienHoatDong',
    dauVao: { cacPhienCuaKhach: [{ id: 'p1', status: 'ended' }, { id: 'p2', status: 'cancelled' }] }, mongDoi: { hopLe: true } },

  // ---------- R06 ----------
  { ma: 'R06', moTa: 'Gói 3 giờ check-in 14h00, hết hạn 17h00', ham: 'r06HanGoiTheoGio',
    dauVao: { goiId: 'h3', thoiDiemCheckIn: '2026-11-23T14:00:00+07:00' },
    mongDoi: { hopLe: true, soPhutGoi: 180, hetHan: '2026-11-23T17:00:00+07:00', chayLienTuc: true } },
  { ma: 'R06', moTa: '(bổ sung) Combo đêm không phải gói theo giờ', ham: 'r06HanGoiTheoGio',
    dauVao: { goiId: 'night', thoiDiemCheckIn: '2026-11-23T23:30:00+07:00' },
    mongDoi: { hopLe: false, maLoi: 'GOI_KHONG_PHAI_THEO_GIO' } },

  // ---------- R07 ----------
  { ma: 'R07', moTa: 'Check-in combo đêm lúc 22h30 bị từ chối', ham: 'r07ComboDem',
    dauVao: { thoiDiem: '2026-11-23T22:30:00+07:00' }, mongDoi: { hopLe: false, maLoi: 'NGOAI_KHUNG_COMBO_DEM' } },
  { ma: 'R07', moTa: 'Check-in combo đêm lúc 23h30 được, hết hạn 7h sáng hôm sau', ham: 'r07ComboDem',
    dauVao: { thoiDiem: '2026-11-23T23:30:00+07:00' }, mongDoi: { hopLe: true, hetHan: '2026-11-24T07:00:00+07:00' } },
  { ma: 'R07', moTa: '(bổ sung) Check-in 2h sáng, hết hạn 7h cùng ngày', ham: 'r07ComboDem',
    dauVao: { thoiDiem: '2026-11-24T02:00:00+07:00' }, mongDoi: { hopLe: true, hetHan: '2026-11-24T07:00:00+07:00' } },
  { ma: 'R07', moTa: '(bổ sung) Check-in 6h30 bị từ chối theo R07 (mâu thuẫn với mục 4.6, xem chú thích hàm)', ham: 'r07ComboDem',
    dauVao: { thoiDiem: '2026-11-24T06:30:00+07:00' }, mongDoi: { hopLe: false, maLoi: 'NGOAI_KHUNG_COMBO_DEM' } },

  // ---------- R08 ----------
  { ma: 'R08', moTa: 'Combo Trọn Ngày check-in 8h thứ Hai thì hết hạn 8h thứ Ba', ham: 'r08ComboTronNgay',
    dauVao: { thoiDiemCheckIn: '2026-11-23T08:00:00+07:00' },
    mongDoi: { hopLe: true, hetHanToiDa: '2026-11-24T08:00:00+07:00', soQuaTang: 1, soToInMienPhi: 10, gioTichDiem: 10 } },

  // ---------- R09 ----------
  { ma: 'R09', moTa: 'Gói 1 giờ, check-out sau 1 giờ 08 phút: 0đ', ham: 'r09VuotGio',
    dauVao: { soPhutGoi: 60, soPhutThucTe: 68 },
    mongDoi: { hopLe: true, phutVuot: 8, trongAnHan: true, soGioTinhPhi: 0, phuPhi: 0 } },
  { ma: 'R09', moTa: 'Gói 1 giờ, check-out sau 1 giờ 25 phút: 12.000đ', ham: 'r09VuotGio',
    dauVao: { soPhutGoi: 60, soPhutThucTe: 85 },
    mongDoi: { hopLe: true, phutVuot: 25, trongAnHan: false, soGioTinhPhi: 1, phuPhi: 12000 } },
  { ma: 'R09', moTa: 'Gói 1 giờ, check-out sau 2 giờ 15 phút: 24.000đ', ham: 'r09VuotGio',
    dauVao: { soPhutGoi: 60, soPhutThucTe: 135 },
    mongDoi: { hopLe: true, phutVuot: 75, trongAnHan: false, soGioTinhPhi: 2, phuPhi: 24000 } },
  { ma: 'R09', moTa: '(bổ sung) Vượt đúng 10 phút vẫn trong ân hạn: 0đ', ham: 'r09VuotGio',
    dauVao: { soPhutGoi: 60, soPhutThucTe: 70 },
    mongDoi: { hopLe: true, phutVuot: 10, trongAnHan: true, soGioTinhPhi: 0, phuPhi: 0 } },
  { ma: 'R09', moTa: '(bổ sung) Vượt 11 phút: quá ân hạn, tính 1 giờ', ham: 'r09VuotGio',
    dauVao: { soPhutGoi: 60, soPhutThucTe: 71 },
    mongDoi: { hopLe: true, phutVuot: 11, trongAnHan: false, soGioTinhPhi: 1, phuPhi: 12000 } },

  // ---------- R10 ----------
  { ma: 'R10', moTa: 'Còn 10 phút mua thêm gói 3 giờ thì hạn mới cộng 3 giờ', ham: 'r10GiaHan',
    dauVao: { hetHanHienTai: '2026-11-23T15:00:00+07:00', thoiDiemMua: '2026-11-23T14:50:00+07:00', goiId: 'h3' },
    mongDoi: { hopLe: true, soPhutCong: 180, hetHanMoi: '2026-11-23T18:00:00+07:00' } },
  { ma: 'R10', moTa: '(bổ sung) Gói cũ đã hết hạn lúc mua thì gói mới tính từ lúc mua', ham: 'r10GiaHan',
    dauVao: { hetHanHienTai: '2026-11-23T15:00:00+07:00', thoiDiemMua: '2026-11-23T15:20:00+07:00', goiId: 'h1' },
    mongDoi: { hopLe: true, soPhutCong: 60, hetHanMoi: '2026-11-23T16:20:00+07:00' } },

  // ---------- R11 ----------
  { ma: 'R11', moTa: 'Nhân viên nhập tay trong chế độ dự phòng, chưa xác nhận thì chưa cộng giờ', ham: 'r11DuocTinhTichDiem',
    dauVao: { nguon: 'manual', coGoiHopLe: true, trangThaiNhapTay: 'pending' },
    mongDoi: { hopLe: false, maLoi: 'CHUA_XAC_NHAN_NHAP_TAY' } },
  { ma: 'R11', moTa: 'Nhập tay đã được xác nhận thì được cộng giờ', ham: 'r11DuocTinhTichDiem',
    dauVao: { nguon: 'manual', coGoiHopLe: true, trangThaiNhapTay: 'confirmed' }, mongDoi: { hopLe: true } },
  { ma: 'R11', moTa: '(bổ sung) Check-in bằng QR có gói hợp lệ thì được cộng giờ', ham: 'r11DuocTinhTichDiem',
    dauVao: { nguon: 'qr', coGoiHopLe: true }, mongDoi: { hopLe: true } },
  { ma: 'R11', moTa: '(bổ sung) Check-in bằng QR nhưng không có gói hợp lệ thì không cộng giờ', ham: 'r11DuocTinhTichDiem',
    dauVao: { nguon: 'qr', coGoiHopLe: false }, mongDoi: { hopLe: false, maLoi: 'KHONG_CO_GOI_HOP_LE' } },

  // ---------- R12 ----------
  { ma: 'R12', moTa: 'Tạm rời lúc 15h00, 15h31 có cảnh báo', ham: 'r12CanhBaoVang',
    dauVao: { thoiDiemTamRoi: '2026-11-23T15:00:00+07:00', thoiDiemHienTai: '2026-11-23T15:31:00+07:00' },
    mongDoi: { hopLe: true, phutVang: 31, canhBao: true, coTheGiaiPhongCho: true, gioVanChay: true } },
  { ma: 'R12', moTa: '(bổ sung) Đúng 15h30 (vắng 30 phút) chưa cảnh báo', ham: 'r12CanhBaoVang',
    dauVao: { thoiDiemTamRoi: '2026-11-23T15:00:00+07:00', thoiDiemHienTai: '2026-11-23T15:30:00+07:00' },
    mongDoi: { hopLe: true, phutVang: 30, canhBao: false, coTheGiaiPhongCho: false, gioVanChay: true } },

  // ---------- R13 ----------
  { ma: 'R13', moTa: 'Đặt 22h30-23h30 phòng 3-5 người: nửa giờ giá chuẩn, nửa giờ giá thấp điểm', ham: 'r13GiaPhong',
    dauVao: { phongId: 'r35', batDau: '2026-11-23T22:30:00+07:00', ketThuc: '2026-11-23T23:30:00+07:00' },
    mongDoi: { hopLe: true, soPhut: 60, giaChuan: 60000, tong: 57000, giamGia: 3000, soKhungGiam: 1 } },

  // ---------- R14 ----------
  { ma: 'R14', moTa: 'Phòng 3-5 người 7h-9h: 120.000đ trừ 10% là 108.000đ', ham: 'r13GiaPhong',
    dauVao: { phongId: 'r35', batDau: '2026-11-23T07:00:00+07:00', ketThuc: '2026-11-23T09:00:00+07:00' },
    mongDoi: { hopLe: true, soPhut: 120, giaChuan: 120000, tong: 108000, giamGia: 12000, soKhungGiam: 4 } },
  { ma: 'R14', moTa: 'Phòng 15-20 người 14h-16h (giá chuẩn): 320.000đ', ham: 'r13GiaPhong',
    dauVao: { phongId: 'r1520', batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T16:00:00+07:00' },
    mongDoi: { hopLe: true, soPhut: 120, giaChuan: 320000, tong: 320000, giamGia: 0, soKhungGiam: 0 } },
  { ma: 'R14', moTa: '(bổ sung) 10h30 còn thấp điểm', ham: 'r14ThapDiem',
    dauVao: { thoiDiem: '2026-11-23T10:30:00+07:00' }, mongDoi: { hopLe: true, thapDiem: true, phanTramGiam: 10 } },
  { ma: 'R14', moTa: '(bổ sung) 11h00 là giá chuẩn', ham: 'r14ThapDiem',
    dauVao: { thoiDiem: '2026-11-23T11:00:00+07:00' }, mongDoi: { hopLe: true, thapDiem: false, phanTramGiam: 0 } },
  { ma: 'R14', moTa: '(bổ sung) 22h30 (cao điểm quán) vẫn là giá chuẩn', ham: 'r14ThapDiem',
    dauVao: { thoiDiem: '2026-11-23T22:30:00+07:00' }, mongDoi: { hopLe: true, thapDiem: false, phanTramGiam: 0 } },
  { ma: 'R14', moTa: '(bổ sung) 23h00 bắt đầu thấp điểm', ham: 'r14ThapDiem',
    dauVao: { thoiDiem: '2026-11-23T23:00:00+07:00' }, mongDoi: { hopLe: true, thapDiem: true, phanTramGiam: 10 } },
  { ma: 'R14', moTa: '(bổ sung) 5h30 vẫn thấp điểm (khung 23h-6h)', ham: 'r14ThapDiem',
    dauVao: { thoiDiem: '2026-11-24T05:30:00+07:00' }, mongDoi: { hopLe: true, thapDiem: true, phanTramGiam: 10 } },
  { ma: 'R14', moTa: '(bổ sung) 6h00 chuyển sang khung 6h-11h, vẫn thấp điểm, không hở giữa hai khung', ham: 'r14ThapDiem',
    dauVao: { thoiDiem: '2026-11-24T06:00:00+07:00' }, mongDoi: { hopLe: true, thapDiem: true, phanTramGiam: 10 } },

  // ---------- R15 ----------
  { ma: 'R15', moTa: 'CLB đặt phòng 7-10 người lúc 8h: giảm 10%, không phải 20%', ham: 'r13GiaPhong',
    dauVao: { phongId: 'r710a', batDau: '2026-11-23T08:00:00+07:00', ketThuc: '2026-11-23T09:00:00+07:00', laClbDaDuyet: true },
    mongDoi: { hopLe: true, soPhut: 60, giaChuan: 90000, tong: 81000, giamGia: 9000, soKhungGiam: 2 } },
  { ma: 'R15', moTa: 'Khách CLB, thêm giờ thấp điểm: lấy mức cao hơn, không cộng dồn', ham: 'r15MucGiam',
    dauVao: { thapDiem: true, laClbDaDuyet: true }, mongDoi: { hopLe: true, phanTramGiam: 10, loai: 'clb' } },
  { ma: 'R15', moTa: 'Khách CLB đặt phòng 7-10 người 1 giờ lúc 14h: 90.000đ trừ 10% là 81.000đ (ví dụ M5)', ham: 'r13GiaPhong',
    dauVao: { phongId: 'r710a', batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00', laClbDaDuyet: true },
    mongDoi: { hopLe: true, soPhut: 60, giaChuan: 90000, tong: 81000, giamGia: 9000, soKhungGiam: 2 } },
  { ma: 'R15', moTa: '(bổ sung) Khách thường ở giờ thấp điểm: chỉ giảm thấp điểm', ham: 'r15MucGiam',
    dauVao: { thapDiem: true, laClbDaDuyet: false }, mongDoi: { hopLe: true, phanTramGiam: 10, loai: 'thapDiem' } },

  // ---------- R16 ----------
  { ma: 'R16', moTa: 'Phòng 15-20 người: cọc 160.000đ; thuê 2 giờ 320.000đ thì còn thanh toán 160.000đ', ham: 'r16Coc',
    dauVao: { phongId: 'r1520', tongTien: 320000 }, mongDoi: { hopLe: true, coc: 160000, conPhaiTra: 160000, cocDu: 0 } },
  { ma: 'R16', moTa: 'Phòng 3-5 người 7h-9h: tổng 108.000đ, cọc 60.000đ (ví dụ M5)', ham: 'r16Coc',
    dauVao: { phongId: 'r35', tongTien: 108000 }, mongDoi: { hopLe: true, coc: 60000, conPhaiTra: 48000, cocDu: 0 } },
  { ma: 'R16', moTa: '(bổ sung) Thuê 1 giờ thấp điểm (54.000đ) nhỏ hơn cọc 60.000đ: báo cọc dư 6.000đ', ham: 'r16Coc',
    dauVao: { phongId: 'r35', tongTien: 54000 }, mongDoi: { hopLe: true, coc: 60000, conPhaiTra: 0, cocDu: 6000 } },

  // ---------- R17 ----------
  { ma: 'R17', moTa: 'Hủy lúc còn 2 giờ 00 phút: hoàn cọc', ham: 'r17HuyPhong',
    dauVao: { thoiDiemHuy: '2026-11-23T12:00:00+07:00', batDauDat: '2026-11-23T14:00:00+07:00' },
    mongDoi: { hopLe: true, phutConLai: 120, hoanCoc: true, ketQuaCoc: 'refunded' } },
  { ma: 'R17', moTa: 'Hủy lúc còn 1 giờ 59 phút: mất cọc', ham: 'r17HuyPhong',
    dauVao: { thoiDiemHuy: '2026-11-23T12:01:00+07:00', batDauDat: '2026-11-23T14:00:00+07:00' },
    mongDoi: { hopLe: true, phutConLai: 119, hoanCoc: false, ketQuaCoc: 'forfeited' } },
  { ma: 'R17', moTa: 'Hủy lúc còn 3 giờ thì hoàn cọc (ví dụ M5)', ham: 'r17HuyPhong',
    dauVao: { thoiDiemHuy: '2026-11-23T11:00:00+07:00', batDauDat: '2026-11-23T14:00:00+07:00' },
    mongDoi: { hopLe: true, phutConLai: 180, hoanCoc: true, ketQuaCoc: 'refunded' } },
  { ma: 'R17', moTa: 'Hủy lúc còn 1 giờ thì mất cọc (ví dụ M5)', ham: 'r17HuyPhong',
    dauVao: { thoiDiemHuy: '2026-11-23T13:00:00+07:00', batDauDat: '2026-11-23T14:00:00+07:00' },
    mongDoi: { hopLe: true, phutConLai: 60, hoanCoc: false, ketQuaCoc: 'forfeited' } },

  // ---------- R18 ----------
  { ma: 'R18', moTa: 'Đặt 14h00, đến 14h16 vẫn chưa vào: trạng thái Không đến', ham: 'r18KhongDen',
    dauVao: { batDauDat: '2026-11-23T14:00:00+07:00', thoiDiemHienTai: '2026-11-23T14:16:00+07:00', daCheckIn: false },
    mongDoi: { hopLe: true, phutTre: 16, khongDen: true, ketQuaCoc: 'forfeited' } },
  { ma: 'R18', moTa: '(bổ sung) Đúng 14h15 chưa tính là Không đến', ham: 'r18KhongDen',
    dauVao: { batDauDat: '2026-11-23T14:00:00+07:00', thoiDiemHienTai: '2026-11-23T14:15:00+07:00', daCheckIn: false },
    mongDoi: { hopLe: true, phutTre: 15, khongDen: false, ketQuaCoc: 'held' } },
  { ma: 'R18', moTa: '(bổ sung) Đã check-in phòng thì không bao giờ là Không đến', ham: 'r18KhongDen',
    dauVao: { batDauDat: '2026-11-23T14:00:00+07:00', thoiDiemHienTai: '2026-11-23T14:40:00+07:00', daCheckIn: true },
    mongDoi: { hopLe: true, phutTre: 40, khongDen: false, ketQuaCoc: 'held' } },

  // ---------- R19 ----------
  { ma: 'R19', moTa: 'Hai người cùng chọn một ô: người trước đang giữ để thanh toán cọc, người sau bị báo phòng đã giữ', ham: 'r19KiemTraTrung',
    dauVao: {
      phongId: 'r35', batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00',
      thoiDiemHienTai: '2026-11-23T10:05:00+07:00',
      cacDatPhongHienCo: [{ id: 'b1', roomId: 'r35', startAt: '2026-11-23T14:00:00+07:00', endAt: '2026-11-23T15:00:00+07:00', status: 'holding', holdExpiresAt: '2026-11-23T10:10:00+07:00' }],
    },
    mongDoi: { hopLe: false, maLoi: 'PHONG_DANG_DUOC_GIU' } },
  { ma: 'R19', moTa: 'Hai người đặt cùng phòng, cùng giờ: người trước đã đặt xong, người sau bị báo phòng đã có người đặt (ví dụ M5)', ham: 'r19KiemTraTrung',
    dauVao: {
      phongId: 'r35', batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00',
      thoiDiemHienTai: '2026-11-23T10:05:00+07:00',
      cacDatPhongHienCo: [{ id: 'b1', roomId: 'r35', startAt: '2026-11-23T14:00:00+07:00', endAt: '2026-11-23T15:00:00+07:00', status: 'confirmed' }],
    },
    mongDoi: { hopLe: false, maLoi: 'PHONG_DA_CO_NGUOI_DAT' } },
  { ma: 'R19', moTa: 'Lượt giữ tạm đã quá 10 phút thì tự nhả: được đặt, hạn giữ mới 10 phút', ham: 'r19KiemTraTrung',
    dauVao: {
      phongId: 'r35', batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00',
      thoiDiemHienTai: '2026-11-23T10:15:00+07:00',
      cacDatPhongHienCo: [{ id: 'b1', roomId: 'r35', startAt: '2026-11-23T14:00:00+07:00', endAt: '2026-11-23T15:00:00+07:00', status: 'holding', holdExpiresAt: '2026-11-23T10:10:00+07:00' }],
    },
    mongDoi: { hopLe: true, giuDen: '2026-11-23T10:25:00+07:00' } },
  { ma: 'R19', moTa: '(bổ sung) Hai khung chạm đầu mút (15h-16h sau 14h-15h) không trùng', ham: 'r19KiemTraTrung',
    dauVao: {
      phongId: 'r35', batDau: '2026-11-23T15:00:00+07:00', ketThuc: '2026-11-23T16:00:00+07:00',
      thoiDiemHienTai: '2026-11-23T10:05:00+07:00',
      cacDatPhongHienCo: [{ id: 'b1', roomId: 'r35', startAt: '2026-11-23T14:00:00+07:00', endAt: '2026-11-23T15:00:00+07:00', status: 'confirmed' }],
    },
    mongDoi: { hopLe: true, giuDen: '2026-11-23T10:15:00+07:00' } },
  { ma: 'R19', moTa: '(bổ sung) Phòng khác cùng giờ, hoặc lượt đặt đã hủy, không gây trùng', ham: 'r19KiemTraTrung',
    dauVao: {
      phongId: 'r35', batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00',
      thoiDiemHienTai: '2026-11-23T10:05:00+07:00',
      cacDatPhongHienCo: [
        { id: 'b1', roomId: 'r710a', startAt: '2026-11-23T14:00:00+07:00', endAt: '2026-11-23T15:00:00+07:00', status: 'confirmed' },
        { id: 'b2', roomId: 'r35', startAt: '2026-11-23T14:00:00+07:00', endAt: '2026-11-23T15:00:00+07:00', status: 'cancelled' },
      ],
    },
    mongDoi: { hopLe: true, giuDen: '2026-11-23T10:15:00+07:00' } },

  // ---------- R20 ----------
  { ma: 'R20', moTa: 'Đặt ngay lúc này (13h55) cho 5 phút sau (14h00) vẫn được nếu đã cọc', ham: 'r20DieuKienDatPhong',
    dauVao: { batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00', thoiDiemHienTai: '2026-11-23T13:55:00+07:00', daDatCoc: true },
    mongDoi: { hopLe: true, canDuyet: false } },
  { ma: 'R20', moTa: 'Không cọc thì không đặt được', ham: 'r20DieuKienDatPhong',
    dauVao: { batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:00:00+07:00', thoiDiemHienTai: '2026-11-23T13:55:00+07:00', daDatCoc: false },
    mongDoi: { hopLe: false, maLoi: 'CHUA_DAT_COC' } },
  { ma: 'R20', moTa: '(bổ sung) Đặt 30 phút bị từ chối (tối thiểu 1 giờ)', ham: 'r20DieuKienDatPhong',
    dauVao: { batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T14:30:00+07:00', thoiDiemHienTai: '2026-11-23T13:55:00+07:00', daDatCoc: true },
    mongDoi: { hopLe: false, maLoi: 'THOI_LUONG_QUA_NGAN' } },
  { ma: 'R20', moTa: '(bổ sung) Đặt 1 giờ 30 phút (bước 30 phút) được', ham: 'r20DieuKienDatPhong',
    dauVao: { batDau: '2026-11-23T14:00:00+07:00', ketThuc: '2026-11-23T15:30:00+07:00', thoiDiemHienTai: '2026-11-23T13:55:00+07:00', daDatCoc: true },
    mongDoi: { hopLe: true, canDuyet: false } },
  { ma: 'R20', moTa: '(bổ sung) Giờ bắt đầu 14h10 không nằm trên mốc 30 phút', ham: 'r20DieuKienDatPhong',
    dauVao: { batDau: '2026-11-23T14:10:00+07:00', ketThuc: '2026-11-23T15:10:00+07:00', thoiDiemHienTai: '2026-11-23T13:55:00+07:00', daDatCoc: true },
    mongDoi: { hopLe: false, maLoi: 'KHONG_DUNG_BUOC_DAT_PHONG' } },
  { ma: 'R20', moTa: '(bổ sung) Giờ bắt đầu đã ở quá khứ', ham: 'r20DieuKienDatPhong',
    dauVao: { batDau: '2026-11-23T13:00:00+07:00', ketThuc: '2026-11-23T14:00:00+07:00', thoiDiemHienTai: '2026-11-23T13:55:00+07:00', daDatCoc: true },
    mongDoi: { hopLe: false, maLoi: 'BAT_DAU_TRONG_QUA_KHU' } },

  // ---------- R21 ----------
  { ma: 'R21', moTa: '12 người không đặt được phòng 7-10 người', ham: 'r21SucChua',
    dauVao: { phongId: 'r710a', soNguoi: 12 }, mongDoi: { hopLe: false, maLoi: 'VUOT_SUC_CHUA' } },
  { ma: 'R21', moTa: '(bổ sung) 10 người đặt được phòng 7-10 người', ham: 'r21SucChua',
    dauVao: { phongId: 'r710a', soNguoi: 10 }, mongDoi: { hopLe: true } },

  // ---------- R22 ----------
  { ma: 'R22', moTa: '99 giờ cộng 2 giờ thành 101 giờ thì nhận 1 voucher', ham: 'r22VoucherTichDiem',
    dauVao: { gioTruoc: 99, gioCong: 2 }, mongDoi: { hopLe: true, gioSau: 101, soVoucherMoi: 1, cacMoc: [100], hanDungNgay: 90 } },
  { ma: 'R22', moTa: 'Minh Anh: 88 giờ cộng 10 giờ (Combo Trọn Ngày) = 98 giờ, chưa có voucher (ví dụ M7)', ham: 'r22VoucherTichDiem',
    dauVao: { gioTruoc: 88, gioCong: 10 }, mongDoi: { hopLe: true, gioSau: 98, soVoucherMoi: 0, cacMoc: [], hanDungNgay: 90 } },
  { ma: 'R22', moTa: 'Minh Anh: 98 giờ cộng thêm phiên 3 giờ = 101 giờ, nhận 1 voucher (ví dụ M7)', ham: 'r22VoucherTichDiem',
    dauVao: { gioTruoc: 98, gioCong: 3 }, mongDoi: { hopLe: true, gioSau: 101, soVoucherMoi: 1, cacMoc: [100], hanDungNgay: 90 } },
  { ma: 'R22', moTa: '(bổ sung) Vượt hai mốc một lần (199 giờ cộng 102 giờ): 2 voucher, giờ không bị trừ', ham: 'r22VoucherTichDiem',
    dauVao: { gioTruoc: 199, gioCong: 102 }, mongDoi: { hopLe: true, gioSau: 301, soVoucherMoi: 2, cacMoc: [200, 300], hanDungNgay: 90 } },

  // ---------- R23 ----------
  { ma: 'R23', moTa: 'Gói 3 giờ ngồi 2 giờ cộng 2 giờ', ham: 'r23GioTichDiem',
    dauVao: { goiId: 'h3', phutNgoiThucTe: 120 }, mongDoi: { hopLe: true, phutCong: 120, gioCong: 2, coDinh: false } },
  { ma: 'R23', moTa: 'Combo Trọn Ngày cộng cố định 10 giờ, dù ngồi bao lâu', ham: 'r23GioTichDiem',
    dauVao: { goiId: 'day', phutNgoiThucTe: 90 }, mongDoi: { hopLe: true, phutCong: 600, gioCong: 10, coDinh: true } },
  { ma: 'R23', moTa: '(bổ sung) Gói 3 giờ ngồi 200 phút, đã trả vượt 1 giờ: cộng 200 phút', ham: 'r23GioTichDiem',
    dauVao: { goiId: 'h3', phutNgoiThucTe: 200, soGioVuotDaTra: 1 }, mongDoi: { hopLe: true, phutCong: 200, gioCong: 3.33, coDinh: false } },
  { ma: 'R23', moTa: '(bổ sung) Gói 3 giờ ngồi 185 phút (vượt trong ân hạn, chưa trả): chặn ở 180 phút', ham: 'r23GioTichDiem',
    dauVao: { goiId: 'h3', phutNgoiThucTe: 185 }, mongDoi: { hopLe: true, phutCong: 180, gioCong: 3, coDinh: false } },

  // ---------- R24 ----------
  { ma: 'R24', moTa: 'Hai người cùng 50 giờ: người đạt sớm hơn xếp trên; khách ẩn tên hiện "Thành viên ẩn danh"', ham: 'r24BangVinhDanh',
    dauVao: {
      danhSach: [
        { userId: 'u-a', ten: 'An', gio: 50, datMocLuc: '2026-11-10T10:00:00+07:00' },
        { userId: 'u-b', ten: 'Bình', gio: 50, datMocLuc: '2026-11-09T09:00:00+07:00' },
        { userId: 'u-c', ten: 'Chi', gio: 30, datMocLuc: '2026-11-08T09:00:00+07:00' },
        { userId: 'u-d', ten: 'Dũng', gio: 60, datMocLuc: '2026-11-11T09:00:00+07:00', anTen: true },
        { userId: 'u-e', ten: 'Em', gio: 10, datMocLuc: '2026-11-05T09:00:00+07:00' },
      ],
    },
    mongDoi: {
      hopLe: true,
      top: [
        { hang: 1, userId: 'u-d', ten: 'Thành viên ẩn danh', gio: 60 },
        { hang: 2, userId: 'u-b', ten: 'Bình', gio: 50 },
        { hang: 3, userId: 'u-a', ten: 'An', gio: 50 },
      ],
    } },

  // ---------- R25 ----------
  { ma: 'R25', moTa: '25 trang hai mặt, 2 bản: 13 nhân 2 bằng 26 tờ', ham: 'r25SoTo',
    dauVao: { soTrang: 25, soBan: 2, haiMat: true }, mongDoi: { hopLe: true, toMoiBan: 13, tongTo: 26 } },
  { ma: 'R25', moTa: '(bổ sung) 25 trang một mặt, 2 bản: 50 tờ', ham: 'r25SoTo',
    dauVao: { soTrang: 25, soBan: 2, haiMat: false }, mongDoi: { hopLe: true, toMoiBan: 25, tongTo: 50 } },

  // ---------- R26 ----------
  { ma: 'R26', moTa: '60 tờ có combo: miễn phí 10 tờ, còn 50 tờ tính tiền', ham: 'r26ToMienPhi',
    dauVao: { tongTo: 60, coComboDangHoatDong: true, daDungToMienPhi: false }, mongDoi: { hopLe: true, toMienPhi: 10, toPhaiTra: 50 } },
  { ma: 'R26', moTa: '(bổ sung) Combo đã dùng 10 tờ miễn phí rồi thì không giảm nữa', ham: 'r26ToMienPhi',
    dauVao: { tongTo: 60, coComboDangHoatDong: true, daDungToMienPhi: true }, mongDoi: { hopLe: true, toMienPhi: 0, toPhaiTra: 60 } },
  { ma: 'R26', moTa: '(bổ sung) Không có combo thì không giảm', ham: 'r26ToMienPhi',
    dauVao: { tongTo: 60, coComboDangHoatDong: false }, mongDoi: { hopLe: true, toMienPhi: 0, toPhaiTra: 60 } },

  // ---------- R27 ----------
  { ma: 'R27', moTa: '49 tờ phải trả: 49.000đ', ham: 'r27GiaIn',
    dauVao: { toPhaiTra: 49 }, mongDoi: { hopLe: true, donGia: 1000, thanhTien: 49000 } },
  { ma: 'R27', moTa: '50 tờ phải trả: toàn bộ tính 700đ, tổng 35.000đ', ham: 'r27GiaIn',
    dauVao: { toPhaiTra: 50 }, mongDoi: { hopLe: true, donGia: 700, thanhTien: 35000 } },
  { ma: 'R27', moTa: '30 tờ không có combo là 30.000đ (ví dụ M9)', ham: 'r27GiaIn',
    dauVao: { toPhaiTra: 30 }, mongDoi: { hopLe: true, donGia: 1000, thanhTien: 30000 } },
  { ma: 'R27', moTa: '60 tờ không có combo là 42.000đ (ví dụ M9)', ham: 'r27GiaIn',
    dauVao: { toPhaiTra: 60 }, mongDoi: { hopLe: true, donGia: 700, thanhTien: 42000 } },
  { ma: 'R27', moTa: '55 tờ có combo, còn 45 tờ tính tiền: 45.000đ (ví dụ M9)', ham: 'r27GiaIn',
    dauVao: { toPhaiTra: 45 }, mongDoi: { hopLe: true, donGia: 1000, thanhTien: 45000 } },

  // ---------- R28 ----------
  { ma: 'R28', moTa: 'Bút bi 5.000đ cộng vào đơn 30 tờ (30.000đ) là 35.000đ', ham: 'r28VanPhongPham',
    dauVao: { muc: [{ id: 'vp1', soLuong: 1 }], tienDonHienTai: 30000 },
    mongDoi: {
      hopLe: true,
      chiTiet: [{ id: 'vp1', ten: 'Bút bi', soLuong: 1, donGia: 5000, thanhTien: 5000 }],
      tongVanPhongPham: 5000,
      tongDon: 35000,
    } },

  // ---------- R29 ----------
  { ma: 'R29', moTa: 'Mua lẻ gói 6 giờ 26 ngày là 1.430.000đ, thẻ rẻ hơn 340.000đ; kích hoạt 20/06/2027, hết hiệu lực 0h00 ngày 16/07/2027', ham: 'r29TheThangHe',
    dauVao: { cheDoHeBat: true, soSuatDaBan: 0, thoiDiemKichHoat: '2027-06-20T10:00:00+07:00' },
    mongDoi: {
      hopLe: true, giaThe: 1090000, giaMuaLe: 1430000, tietKiem: 340000, soNgay: 26,
      phutMoiNgay: 360, khongCongDon: true, hetHieuLuc: '2027-07-16T00:00:00+07:00',
    } },
  { ma: 'R29', moTa: 'Chỉ bán khi chế độ mùa hè bật', ham: 'r29TheThangHe',
    dauVao: { cheDoHeBat: false, soSuatDaBan: 0 }, mongDoi: { hopLe: false, maLoi: 'CHUA_BAT_CHE_DO_HE' } },
  { ma: 'R29', moTa: 'Giới hạn 20 suất: đã bán 20 thì hết', ham: 'r29TheThangHe',
    dauVao: { cheDoHeBat: true, soSuatDaBan: 20 }, mongDoi: { hopLe: false, maLoi: 'HET_SUAT_THE_HE' } },

  // ---------- R30 ----------
  { ma: 'R30', moTa: '3 giờ ngồi ban ngày (10h-13h) cộng 6 giờ khi bật chế độ hè', ham: 'r30TichDiemNhanDoi',
    dauVao: { cheDoHeBat: true, batDau: '2027-06-20T10:00:00+07:00', ketThuc: '2027-06-20T13:00:00+07:00' },
    mongDoi: { hopLe: true, phutBanNgay: 180, heSoApDung: 2, phutCong: 360, gioCong: 6 } },
  { ma: 'R30', moTa: '(bổ sung) Tắt chế độ hè thì cộng bình thường (3 giờ)', ham: 'r30TichDiemNhanDoi',
    dauVao: { cheDoHeBat: false, batDau: '2027-06-20T10:00:00+07:00', ketThuc: '2027-06-20T13:00:00+07:00' },
    mongDoi: { hopLe: true, phutBanNgay: 180, heSoApDung: 1, phutCong: 180, gioCong: 3 } },
  { ma: 'R30', moTa: '(bổ sung) 14h-16h: chỉ giờ 14h-15h nằm trong khung ban ngày nên nhân đôi, giờ còn lại cộng thường', ham: 'r30TichDiemNhanDoi',
    dauVao: { cheDoHeBat: true, batDau: '2027-06-20T14:00:00+07:00', ketThuc: '2027-06-20T16:00:00+07:00' },
    mongDoi: { hopLe: true, phutBanNgay: 60, heSoApDung: 2, phutCong: 180, gioCong: 3 } },

  // ---------- R31 ----------
  { ma: 'R31', moTa: 'Đồ uống 45.000đ lúc 10h còn 40.500đ khi bật chế độ hè', ham: 'r31HappyHour',
    dauVao: { cheDoHeBat: true, thoiDiem: '2027-06-20T10:00:00+07:00', nhom: 'drink', giaGoc: 45000 },
    mongDoi: { hopLe: true, apDung: true, phanTramGiam: 10, giaSauGiam: 40500 } },
  { ma: 'R31', moTa: '(bổ sung) 16h ngoài happy hour: giá gốc', ham: 'r31HappyHour',
    dauVao: { cheDoHeBat: true, thoiDiem: '2027-06-20T16:00:00+07:00', nhom: 'drink', giaGoc: 45000 },
    mongDoi: { hopLe: true, apDung: false, phanTramGiam: 0, giaSauGiam: 45000 } },
  { ma: 'R31', moTa: '(bổ sung) Tắt chế độ hè thì không giảm', ham: 'r31HappyHour',
    dauVao: { cheDoHeBat: false, thoiDiem: '2027-06-20T10:00:00+07:00', nhom: 'drink', giaGoc: 45000 },
    mongDoi: { hopLe: true, apDung: false, phanTramGiam: 0, giaSauGiam: 45000 } },
  { ma: 'R31', moTa: '(bổ sung) Đồ ăn nhẹ không được giảm', ham: 'r31HappyHour',
    dauVao: { cheDoHeBat: true, thoiDiem: '2027-06-20T10:00:00+07:00', nhom: 'snack', giaGoc: 20000 },
    mongDoi: { hopLe: true, apDung: false, phanTramGiam: 0, giaSauGiam: 20000 } },
];
