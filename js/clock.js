// js/clock.js
// -----------------------------------------------------------------------------
// Đồng hồ mô phỏng của Lumen 24. Mọi quy tắc phụ thuộc thời gian chỉ được lấy giờ
// qua hàm now() ở file này (mục 1.3 của đặc tả).
//
// Trạng thái đồng hồ lưu qua js/store.js (khóa "clock") nên các tab cùng trình
// duyệt thấy cùng một giờ.
//
// Cách tính: giờ mô phỏng = mocMoPhong + (giờ thật hiện tại - mocThat) x tocDo.
//   - Chế độ "that": now() trả về đúng giờ thật.
//   - Chế độ "gia": giờ chạy theo công thức trên; khi tạm dừng thì đứng yên ở mocMoPhong.
//
// Lưu ý: file này không dùng new Date() không đối số. Giờ thật chỉ được đọc bằng
// Date.now() trong đúng một hàm (gioThatMs). Không dùng DOM hay window.location.
// -----------------------------------------------------------------------------

import * as store from './store.js';

const KHOA_LUU = 'clock';

/** Các tốc độ tua được hỗ trợ. */
export const TOC_DO_HOP_LE = Object.freeze([1, 10, 60]);

// Giờ mô phỏng khi chưa có trạng thái lưu (lần đầu mở, hoặc sau "Đặt lại dữ liệu demo").
// Theo mục 8.5 của đặc tả (mục 17 ở danh sách giả định): 10/11/2027 lúc 20h giờ Việt Nam,
// để dashboard có đủ 12 tháng dữ liệu. Đặt thành null nếu muốn mặc định là giờ thật.
const GIO_MAC_DINH = '2027-11-10T20:00:00+07:00';

const nguoiNghe = new Set();

// ---------- Hàm hỗ trợ nội bộ ----------

/** Nơi DUY NHẤT đọc giờ thật của máy (mili giây). */
function gioThatMs() {
  return Date.now();
}

/** Trạng thái ban đầu. */
function taoMacDinh() {
  const that = gioThatMs();
  const mocMacDinh = GIO_MAC_DINH === null ? NaN : Date.parse(GIO_MAC_DINH);
  if (!Number.isFinite(mocMacDinh)) {
    return { cheDo: 'that', mocMoPhong: that, mocThat: that, tocDo: 1, tamDung: false };
  }
  return { cheDo: 'gia', mocMoPhong: mocMacDinh, mocThat: that, tocDo: 1, tamDung: false };
}

/** Kiểm tra dữ liệu đọc từ store có đúng dạng trạng thái đồng hồ không. */
function hopLe(s) {
  return !!s
    && typeof s === 'object'
    && (s.cheDo === 'that' || s.cheDo === 'gia')
    && Number.isFinite(s.mocMoPhong)
    && Number.isFinite(s.mocThat)
    && TOC_DO_HOP_LE.includes(s.tocDo)
    && typeof s.tamDung === 'boolean';
}

/** Giờ mô phỏng (mili giây) của trạng thái s tại thời điểm thật thatMs. */
function tinhMs(s, thatMs) {
  if (s.cheDo === 'that') return thatMs;
  if (s.tamDung) return s.mocMoPhong;
  return s.mocMoPhong + (thatMs - s.mocThat) * s.tocDo;
}

/** Chuyển Date, số (mili giây) hoặc chuỗi ngày giờ thành mili giây; không hợp lệ thì báo lỗi tiếng Việt. */
function chuyenMs(giaTri) {
  let ms = NaN;
  if (giaTri instanceof Date) ms = giaTri.getTime();
  else if (typeof giaTri === 'number') ms = giaTri;
  else if (typeof giaTri === 'string') ms = Date.parse(giaTri);
  if (!Number.isFinite(ms)) {
    throw new Error('Giờ không hợp lệ. Hãy truyền một đối tượng Date, ví dụ new Date("2027-01-15T09:00:00+07:00").');
  }
  return ms;
}

function thongBao() {
  const trangThaiHienTai = getState();
  for (const callback of [...nguoiNghe]) {
    try {
      callback(trangThaiHienTai);
    } catch (loi) {
      console.error('[clock] Lỗi trong hàm theo dõi đồng hồ:', loi);
    }
  }
}

// ---------- Nạp trạng thái và theo dõi thay đổi ----------

let trangThai = (function nap() {
  const daLuu = store.get(KHOA_LUU);
  if (hopLe(daLuu)) return daLuu;
  const macDinh = taoMacDinh();
  store.set(KHOA_LUU, macDinh);
  return macDinh;
})();

// Chạy khi trạng thái đổi, do tab này hoặc tab khác ghi.
store.subscribe(KHOA_LUU, (giaTri) => {
  trangThai = hopLe(giaTri) ? giaTri : taoMacDinh(); // bị xóa hoặc hỏng: về mặc định (chưa ghi lại)
  thongBao();
});

/** Ghi trạng thái mới. Hàm theo dõi ở trên sẽ cập nhật biến và báo người nghe. */
function luu(trangThaiMoi) {
  trangThai = trangThaiMoi;
  store.set(KHOA_LUU, trangThaiMoi);
}

// ---------- Các hàm xuất ra ----------

/** Giờ hiện tại theo đồng hồ mô phỏng (đối tượng Date mới mỗi lần gọi). */
export function now() {
  return new Date(tinhMs(trangThai, gioThatMs()));
}

/**
 * Đặt giờ mô phỏng cụ thể. Nhận Date (hoặc số mili giây, chuỗi ISO).
 * Giữ nguyên tốc độ và trạng thái tạm dừng hiện tại; nếu đang ở giờ thật thì chuyển sang mô phỏng.
 */
export function setTime(date) {
  const ms = chuyenMs(date);
  luu({ ...trangThai, cheDo: 'gia', mocMoPhong: ms, mocThat: gioThatMs() });
}

/** Đổi tốc độ tua: 1, 10 hoặc 60. Giờ hiện tại được giữ nguyên, chỉ đổi tốc độ chạy tiếp. */
export function setSpeed(tocDo) {
  const n = Number(tocDo);
  if (!TOC_DO_HOP_LE.includes(n)) {
    throw new Error('Tốc độ không hợp lệ. Chỉ nhận ' + TOC_DO_HOP_LE.join(', ') + '.');
  }
  const that = gioThatMs();
  luu({
    ...trangThai,
    cheDo: 'gia',
    mocMoPhong: tinhMs(trangThai, that),
    mocThat: that,
    tocDo: n,
  });
}

/** Tạm dừng đồng hồ tại giờ hiện tại. Không làm gì nếu đã dừng. */
export function pause() {
  if (trangThai.cheDo === 'gia' && trangThai.tamDung) return;
  const that = gioThatMs();
  luu({
    ...trangThai,
    cheDo: 'gia',
    mocMoPhong: tinhMs(trangThai, that),
    mocThat: that,
    tamDung: true,
  });
}

/** Chạy tiếp từ giờ đang dừng. Không làm gì nếu đang chạy hoặc đang ở giờ thật. */
export function resume() {
  if (trangThai.cheDo !== 'gia' || !trangThai.tamDung) return;
  luu({ ...trangThai, mocThat: gioThatMs(), tamDung: false });
}

/** Quay về giờ thật của máy. */
export function useRealTime() {
  if (trangThai.cheDo === 'that') return;
  const that = gioThatMs();
  luu({ cheDo: 'that', mocMoPhong: that, mocThat: that, tocDo: 1, tamDung: false });
}

/** Ảnh chụp trạng thái hiện tại, để giao diện hiển thị: { cheDo, tocDo, tamDung, now }. */
export function getState() {
  return {
    cheDo: trangThai.cheDo, // 'that' hoặc 'gia'
    tocDo: trangThai.cheDo === 'that' ? 1 : trangThai.tocDo,
    tamDung: trangThai.cheDo === 'gia' && trangThai.tamDung,
    now: now(),
  };
}

/**
 * Đăng ký nhận thông báo khi trạng thái đồng hồ đổi (đặt giờ, đổi tốc độ, dừng/chạy,
 * về giờ thật), kể cả khi do tab khác đổi. callback nhận kết quả của getState().
 * Không gọi mỗi giây: giao diện cần cập nhật theo giây thì tự dùng setInterval và gọi now().
 * Trả về hàm hủy đăng ký.
 */
export function subscribe(callback) {
  if (typeof callback !== 'function') {
    throw new Error('subscribe cần một hàm callback.');
  }
  nguoiNghe.add(callback);
  return function huyDangKy() {
    nguoiNghe.delete(callback);
  };
}
