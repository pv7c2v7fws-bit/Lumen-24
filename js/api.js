// js/api.js
// -----------------------------------------------------------------------------
// Lớp truy cập dữ liệu của Lumen 24 (Bước 1c, cập nhật ở Bước 3a và Bước 4a). Mọi trang đi qua
// file này để đọc và ghi dữ liệu; sau này có thể thay bằng cơ sở dữ liệu thật mà không sửa giao diện.
//
// Hiện cung cấp: cấu hình (getConfig), tài khoản (getUsers, getUserById, saveUser, deleteUser),
// trạng thái đăng nhập (login, logout, getCurrentUser) và thanh toán QR giả (taoThanhToan,
// layThanhToan, xacNhanThanhToan, thatBaiThanhToan, hoanCoc, lichSuGiaoDich, tongHopThu,
// batTatGianDoan).
//
// Thay đổi ở Bước 3a:
//   - Mã khách (LM-000123) lấy từ BỘ ĐẾM lưu trong store (khóa lumen-code-counter), không còn
//     là "số lớn nhất + 1" nữa. Bộ đếm chỉ tăng, nên mã của tài khoản đã xóa không bị cấp lại.
//   - Thêm deleteUser(id).
//
// Thay đổi ở Bước 4a (thanh toán, M6):
//   - Thêm khóa lumen-payments (mảng thanh toán) và lumen-outage (cờ gián đoạn).
//   - Thêm 8 hàm thanh toán ở cuối file. Các hàm cũ giữ nguyên chữ ký và cách chạy.
//
// Độ trễ giả lập:
//   - getConfig() và getCurrentUser() là hàm ĐỒNG BỘ, không trễ, vì chỉ đọc dữ liệu
//     có sẵn và được header gọi liên tục.
//   - Các hàm còn lại là async và trễ ngẫu nhiên 200-500 ms qua hàm tre() dùng chung.
//     Mỗi hàm chờ xong độ trễ rồi mới đọc và ghi dữ liệu trong một khối đồng bộ,
//     nên không có hai thao tác chen vào giữa chừng (đây cũng là lý do bấm "xác nhận"
//     hai lần chỉ ghi được một giao dịch).
//
// LƯU Ý VỀ MẬT KHẨU: passwordDemo chỉ là chuỗi giả cho demo, KHÔNG mã hóa, lưu nguyên
// văn trong store. getUsers() và getCurrentUser() trả cả passwordDemo (dữ liệu demo).
// Tuyệt đối không dùng mật khẩu thật.
//
// LƯU Ý VỀ TÍNH NGẪU NHIÊN VÀ GIỜ GIẤC:
//   - File này không gọi new Date() rỗng; giờ hiện tại chỉ lấy qua now() của js/clock.js (mục 1.3).
//     Chỗ duy nhất dùng new Date(số) là đổi mili giây sang chuỗi ngày giờ Việt Nam (không đọc giờ máy).
//   - Math.random được dùng ở hai chỗ: (1) 4 ký tự ngẫu nhiên cuối id tài khoản và id thanh toán
//     (ngoại lệ duy nhất cho dữ liệu LƯU TRỮ), (2) độ trễ giả lập trong tre(),
//     chỉ ảnh hưởng thời gian chờ chứ không ảnh hưởng dữ liệu.
//
// Khóa lumen-current-user chỉ lưu id của người đang đăng nhập (không lưu cả tài khoản),
// nên getCurrentUser() luôn trả dữ liệu mới nhất của tài khoản đó.
// -----------------------------------------------------------------------------

import * as store from './store.js';
import * as config from './config.js';
import {
  taoNguoiDungSeed,
  taoThanhToanSeed,
  boDemMaSeed,
  KHOA_NGUOI_DUNG,
  KHOA_DANG_NHAP,
  KHOA_BO_DEM_MA,
  KHOA_THANH_TOAN,
  KHOA_GIAN_DOAN,
} from './seed.js';
import { now } from './clock.js';

// ---------- Hằng số ----------

/**
 * Khóa trong store lưu id của người đang đăng nhập. Header có thể store.subscribe khóa này
 * để cập nhật khi tab khác đăng nhập hoặc đăng xuất. Định nghĩa ở seed.js, xuất lại ở đây
 * để các trang đang import từ api.js vẫn chạy như cũ.
 */
export { KHOA_DANG_NHAP };

/**
 * Khóa trong store lưu bộ đếm mã khách (số nguyên: số thứ tự của mã đã cấp gần nhất).
 * Định nghĩa ở seed.js (để resetDemoData xóa được), xuất lại ở đây.
 */
export { KHOA_BO_DEM_MA };

/** Khóa mảng thanh toán và khóa cờ gián đoạn (Bước 4a). Định nghĩa ở seed.js, xuất lại ở đây. */
export { KHOA_THANH_TOAN, KHOA_GIAN_DOAN };

const TRE_TOI_THIEU_MS = 200;
const TRE_TOI_DA_MS = 500;

const VAI_TRO_HOP_LE = ['guest', 'staff', 'manager'];
const LOAI_KHACH_HOP_LE = ['student', 'worker'];

/** Các trường không bao giờ đổi được khi cập nhật tài khoản. */
const TRUONG_BAT_BIEN = ['id', 'code', 'createdAt'];

const KY_TU_NGAU_NHIEN = '0123456789abcdefghijklmnopqrstuvwxyz';

/** Email: có đúng một dấu @, hai bên có ký tự và không có khoảng trắng. */
const MAU_EMAIL = /^[^\s@]+@[^\s@]+$/;
/** Số điện thoại Việt Nam: 10 chữ số, bắt đầu bằng 0. */
const MAU_SDT = /^0\d{9}$/;
/** Mã khách: LM- và các chữ số. */
const MAU_MA_KHACH = /^LM-(\d+)$/;

const LOI_SAI_TAI_KHOAN = 'Email hoặc số điện thoại không đúng. Vui lòng kiểm tra lại.';
const LOI_SAI_MAT_KHAU = 'Mật khẩu không đúng. Vui lòng thử lại.';
const LOI_KHONG_TIM_THAY_DE_XOA = 'Không tìm thấy tài khoản cần xóa. Có thể tài khoản đã bị xóa trước đó.';
const LOI_XOA_QUAN_LY_CUOI = 'Không thể xóa tài khoản quản lý cuối cùng. Hãy chuyển một tài khoản khác thành quản lý trước.';

// ----- Hằng số thanh toán (Bước 4a, M6) -----

/**
 * Loại giao dịch (M6). Giá trị là mã không dấu; tên hiển thị tiếng Việt ở TEN_LOAI_GIAO_DICH.
 */
export const LOAI_GIAO_DICH = Object.freeze({
  MUA_GOI: 'mua-goi',
  GIA_HAN: 'gia-han',
  PHU_PHI_VUOT_GIO: 'phu-phi-vuot-gio',
  COC_PHONG: 'coc-phong',
  TIEN_PHONG_CON_LAI: 'tien-phong-con-lai',
  DO_UONG_AN_NHE: 'do-uong-an-nhe',
  IN_AN: 'in-an',
  VAN_PHONG_PHAM: 'van-phong-pham',
  THE_THANG: 'the-thang',
  HOAN_COC: 'hoan-coc',
});

/** Tên hiển thị tiếng Việt của từng loại giao dịch. */
export const TEN_LOAI_GIAO_DICH = Object.freeze({
  'mua-goi': 'Mua gói',
  'gia-han': 'Gia hạn',
  'phu-phi-vuot-gio': 'Phụ phí vượt giờ',
  'coc-phong': 'Cọc phòng',
  'tien-phong-con-lai': 'Tiền phòng còn lại',
  'do-uong-an-nhe': 'Đồ uống và đồ ăn',
  'in-an': 'In ấn',
  'van-phong-pham': 'Văn phòng phẩm',
  'the-thang': 'Thẻ tháng',
  'hoan-coc': 'Hoàn cọc',
});

/**
 * Trạng thái thanh toán (M6). Chuyển trạng thái hợp lệ:
 *   cho-thanh-toan -> da-thanh-toan | that-bai | het-han
 *   da-thanh-toan (chỉ loại coc-phong) -> da-hoan | mat-coc
 *   Các trạng thái còn lại là cuối, không đổi nữa.
 */
export const TRANG_THAI_THANH_TOAN = Object.freeze({
  CHO: 'cho-thanh-toan',
  DA_THANH_TOAN: 'da-thanh-toan',
  THAT_BAI: 'that-bai',
  HET_HAN: 'het-han',
  DA_HOAN: 'da-hoan',
  MAT_COC: 'mat-coc',
});

/** Tên hiển thị tiếng Việt của từng trạng thái thanh toán. */
export const TEN_TRANG_THAI_THANH_TOAN = Object.freeze({
  'cho-thanh-toan': 'Chờ thanh toán',
  'da-thanh-toan': 'Đã thanh toán',
  'that-bai': 'Thất bại',
  'het-han': 'Hết hạn',
  'da-hoan': 'Đã hoàn',
  'mat-coc': 'Mất cọc',
});

const DANH_SACH_LOAI = Object.values(LOAI_GIAO_DICH);
const MOT_PHUT_MS = 60 * 1000;
const MOT_GIO_MS = 60 * MOT_PHUT_MS;
/** Giờ Việt Nam = UTC+7, không có giờ mùa hè. Dùng để chia ngày và tháng cho báo cáo. */
const LECH_GIO_VN_MS = 7 * MOT_GIO_MS;
const MAU_NGAY = /^\d{4}-\d{2}-\d{2}$/;
const MAU_THANG = /^\d{4}-(0[1-9]|1[0-2])$/;

// ---------- Hàm hỗ trợ nội bộ ----------

/** Chờ ngẫu nhiên 200-500 ms để giả lập độ trễ của máy chủ. */
function tre() {
  const ms = TRE_TOI_THIEU_MS + Math.floor(Math.random() * (TRE_TOI_DA_MS - TRE_TOI_THIEU_MS + 1));
  return new Promise((giaiQuyet) => setTimeout(giaiQuyet, ms));
}

/** Sao chép sâu một giá trị JSON (đối tượng, mảng, số, chuỗi, null). Bản sao không bị đóng băng. */
function saoSau(giaTri) {
  if (Array.isArray(giaTri)) return giaTri.map(saoSau);
  if (giaTri && typeof giaTri === 'object') {
    const banSao = {};
    for (const [khoa, con] of Object.entries(giaTri)) banSao[khoa] = saoSau(con);
    return banSao;
  }
  return giaTri;
}

/** Chuỗi ngẫu nhiên gồm soKyTu ký tự a-z0-9 (dùng Math.random, xem ghi chú đầu file). */
function chuoiNgauNhien(soKyTu) {
  let ketQua = '';
  for (let i = 0; i < soKyTu; i++) {
    ketQua += KY_TU_NGAU_NHIEN.charAt(Math.floor(Math.random() * KY_TU_NGAU_NHIEN.length));
  }
  return ketQua;
}

/**
 * Đọc danh sách tài khoản. Nếu khóa users chưa có hoặc không phải mảng thì nạp 7 tài khoản
 * từ taoNguoiDungSeed() vào store. Mảng rỗng được giữ nguyên, không nạp lại. Không nạp clubs.
 * store.get luôn trả bản mới được giải mã từ JSON nên có thể sửa thoải mái rồi ghi lại.
 */
function docNguoiDung() {
  let danhSach = store.get(KHOA_NGUOI_DUNG);
  if (!Array.isArray(danhSach)) {
    danhSach = taoNguoiDungSeed();
    store.set(KHOA_NGUOI_DUNG, danhSach);
  }
  return danhSach;
}

/** Email: bỏ khoảng trắng hai đầu và đưa về chữ thường. Số điện thoại: bỏ mọi khoảng trắng. */
function chuanHoaLienHe(giaTri) {
  const chuoi = String(giaTri === undefined || giaTri === null ? '' : giaTri).trim();
  if (chuoi.includes('@')) return chuoi.toLowerCase();
  return chuoi.replace(/\s+/g, '');
}

/** Số điện thoại: bỏ mọi khoảng trắng. */
function chuanHoaSdt(giaTri) {
  return String(giaTri === undefined || giaTri === null ? '' : giaTri).replace(/\s+/g, '');
}

/** Id tài khoản mới: u- + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên; lặp lại nếu trùng id đã có. */
function taoIdMoi(danhSach) {
  const phanThoiGian = now().getTime().toString(36);
  let id;
  do {
    id = 'u-' + phanThoiGian + chuoiNgauNhien(4);
  } while (danhSach.some((nguoi) => nguoi.id === id));
  return id;
}

/** Số thứ tự lớn nhất trong các mã LM-xxxxxx của danh sách (0 nếu không có mã nào). */
function soMaLonNhat(danhSach) {
  let lonNhat = 0;
  for (const nguoi of danhSach) {
    const khop = MAU_MA_KHACH.exec(String(nguoi.code || ''));
    if (khop) lonNhat = Math.max(lonNhat, Number(khop[1]));
  }
  return lonNhat;
}

/**
 * Đọc bộ đếm mã khách trong store (G-code). Nếu khóa chưa có hoặc không phải số nguyên không âm
 * thì tạo lại: lấy số lớn hơn giữa giá trị seed (7) và mã lớn nhất đang có trong danh sách.
 * Với dữ liệu seed sạch thì kết quả đúng bằng 7. Việc so thêm với mã lớn nhất chỉ để không cấp
 * trùng mã nếu trình duyệt đang có tài khoản tạo từ trước khi có bộ đếm.
 */
function docBoDemMa(danhSach) {
  const giaTri = store.get(KHOA_BO_DEM_MA);
  if (Number.isInteger(giaTri) && giaTri >= 0) return giaTri;
  const khoiTao = Math.max(boDemMaSeed(), soMaLonNhat(danhSach));
  store.set(KHOA_BO_DEM_MA, khoiTao);
  return khoiTao;
}

/**
 * Cấp mã khách mới: tăng bộ đếm lên 1, lưu lại bộ đếm rồi trả mã dạng LM- + 6 chữ số.
 * Nếu mã vừa tạo lỡ trùng với một mã đang có (dữ liệu bị sửa tay) thì tăng tiếp đến khi không trùng.
 * Bộ đếm không bao giờ giảm, kể cả khi xóa tài khoản, nên mã đã dùng không bị cấp lại.
 * Hàm đồng bộ; được gọi trong khối đồng bộ của saveUser sau khi đã chờ độ trễ.
 */
function capMaKhachMoi(danhSach) {
  const daCo = new Set(danhSach.map((nguoi) => String(nguoi.code || '')));
  let so = docBoDemMa(danhSach);
  let ma;
  do {
    so += 1;
    ma = 'LM-' + String(so).padStart(6, '0');
  } while (daCo.has(ma));
  store.set(KHOA_BO_DEM_MA, so);
  return ma;
}

/**
 * Kiểm tra, chuẩn hóa và hoàn thiện các trường của một tài khoản (sửa trực tiếp đối tượng ban).
 * Thứ tự kiểm tra: liên hệ -> số điện thoại -> trùng -> họ tên -> mật khẩu -> vai trò -> loại khách.
 * Báo lỗi bằng Error tiếng Việt.
 */
function kiemTraTaiKhoan(ban, danhSach) {
  // --- contact: email (có @) hoặc số điện thoại 10 số bắt đầu bằng 0 ---
  ban.contact = chuanHoaLienHe(ban.contact);
  if (ban.contact === '') {
    throw new Error('Vui lòng nhập email hoặc số điện thoại.');
  }
  const contactLaEmail = ban.contact.includes('@');
  if (contactLaEmail) {
    if (!MAU_EMAIL.test(ban.contact)) {
      throw new Error('Email không hợp lệ. Vui lòng kiểm tra lại, ví dụ ten@example.com.');
    }
  } else if (!MAU_SDT.test(ban.contact)) {
    throw new Error('Liên hệ phải là email hoặc số điện thoại gồm 10 chữ số, bắt đầu bằng 0.');
  }

  // --- phone: nếu contact là số điện thoại mà phone để trống thì phone lấy bằng contact ---
  ban.phone = chuanHoaSdt(ban.phone);
  if (ban.phone === '' && !contactLaEmail) ban.phone = ban.contact;
  if (ban.phone !== '' && !MAU_SDT.test(ban.phone)) {
    throw new Error('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.');
  }
  if (ban.phone === '') ban.phone = null;

  // --- Trùng (G7): so sánh contact và phone mới với contact và phone của các tài khoản KHÁC ---
  const daDung = new Set();
  for (const nguoi of danhSach) {
    if (nguoi.id === ban.id) continue;
    const lienHe = chuanHoaLienHe(nguoi.contact);
    const sdt = chuanHoaSdt(nguoi.phone);
    if (lienHe !== '') daDung.add(lienHe);
    if (sdt !== '') daDung.add(sdt);
  }
  if (daDung.has(ban.contact)) {
    throw new Error(contactLaEmail
      ? 'Email đã được dùng bởi tài khoản khác.'
      : 'Số điện thoại đã được dùng bởi tài khoản khác.');
  }
  if (ban.phone !== null && ban.phone !== ban.contact && daDung.has(ban.phone)) {
    throw new Error('Số điện thoại đã được dùng bởi tài khoản khác.');
  }

  // --- Họ tên ---
  ban.name = String(ban.name === undefined || ban.name === null ? '' : ban.name).trim();
  if (ban.name === '') throw new Error('Vui lòng nhập họ tên.');

  // --- Mật khẩu giả (không mã hóa, không cắt khoảng trắng) ---
  if (typeof ban.passwordDemo !== 'string' || ban.passwordDemo === '') {
    throw new Error('Vui lòng nhập mật khẩu.');
  }

  // --- Vai trò và loại khách ---
  if (!VAI_TRO_HOP_LE.includes(ban.role)) {
    throw new Error('Vai trò không hợp lệ. Chỉ nhận: ' + VAI_TRO_HOP_LE.join(', ') + '.');
  }
  if (ban.type === undefined) ban.type = null;
  if (ban.type !== null && !LOAI_KHACH_HOP_LE.includes(ban.type)) {
    throw new Error('Loại khách không hợp lệ. Chỉ nhận: ' + LOAI_KHACH_HOP_LE.join(', ') + ' hoặc để trống.');
  }

  // --- Các trường còn lại: đưa về dạng chuẩn ---
  ban.org = (ban.org === undefined || ban.org === null) ? null : (String(ban.org).trim() || null);
  ban.clubId = (ban.clubId === undefined || ban.clubId === '') ? null : ban.clubId;
  ban.hideOnBoard = Boolean(ban.hideOnBoard);
  ban.totalHours = Number.isFinite(ban.totalHours) ? ban.totalHours : 0;
}

// ---------- Nạp dữ liệu tài khoản ngay khi file được tải ----------
// Để getCurrentUser() (đồng bộ) luôn có danh sách tài khoản để tra, và để khóa bộ đếm mã
// khách có sẵn trong store (tạo từ seed nếu chưa có).
docBoDemMa(docNguoiDung());

// ---------- Cấu hình ----------

/**
 * Trả về bản sao sâu của MỌI export trong js/config.js, dạng { TANG, GOI_CHO_NGOI, PHONG_HOP, ... }.
 * Bản sao không bị đóng băng nên sửa thoải mái không ảnh hưởng config.js.
 * Chưa hợp nhất giá trị do Admin chỉnh (việc đó thuộc M13). Hàm đồng bộ, không trễ.
 */
export function getConfig() {
  const banSao = {};
  for (const [ten, giaTri] of Object.entries(config)) banSao[ten] = saoSau(giaTri);
  return banSao;
}

// ---------- Tài khoản ----------

/** Danh sách mọi tài khoản (có cả passwordDemo). Trễ 200-500 ms. */
export async function getUsers() {
  await tre();
  return docNguoiDung();
}

/** Tài khoản theo id, hoặc null nếu không có. Trễ 200-500 ms. */
export async function getUserById(id) {
  await tre();
  const nguoi = docNguoiDung().find((u) => u.id === id);
  return nguoi || null;
}

/**
 * Tạo mới hoặc cập nhật tài khoản. Trả về tài khoản đã lưu. Trễ 200-500 ms.
 *
 * Có id: tìm tài khoản cũ; không thấy thì báo lỗi, KHÔNG tự tạo mới. Gộp các trường gửi lên
 *   vào tài khoản cũ (trường undefined bị bỏ qua). id, code, createdAt không đổi được
 *   (nếu gửi lên thì bị bỏ qua, không báo lỗi).
 * Không có id: tạo mới, role mặc định 'guest', sinh id (xem ghi chú đầu file) và code lấy từ
 *   bộ đếm trong store (G-code), totalHours = 0, createdAt = giờ mô phỏng. Chỉ nhận các trường:
 *   name, contact, phone, passwordDemo, role, type, org, clubId, hideOnBoard.
 *   Bộ đếm chỉ tăng khi tài khoản qua được bước kiểm tra (tạo thất bại thì không mất số).
 * Quy tắc contact, phone, trùng lặp: xem kiemTraTaiKhoan ở trên.
 * Hàm này KHÔNG tự đăng nhập tài khoản mới.
 */
export async function saveUser(duLieu) {
  await tre();
  if (!duLieu || typeof duLieu !== 'object' || Array.isArray(duLieu)) {
    throw new Error('Dữ liệu tài khoản không hợp lệ.');
  }

  const danhSach = docNguoiDung();
  const coId = duLieu.id !== undefined && duLieu.id !== null && duLieu.id !== '';

  if (coId) {
    // ----- Cập nhật -----
    const viTri = danhSach.findIndex((u) => u.id === duLieu.id);
    if (viTri === -1) {
      throw new Error('Không tìm thấy tài khoản cần cập nhật.');
    }
    const ban = { ...danhSach[viTri] };
    for (const [khoa, giaTri] of Object.entries(duLieu)) {
      if (TRUONG_BAT_BIEN.includes(khoa) || giaTri === undefined) continue;
      ban[khoa] = giaTri;
    }
    kiemTraTaiKhoan(ban, danhSach);
    danhSach[viTri] = ban;
    store.set(KHOA_NGUOI_DUNG, danhSach);
    return saoSau(ban);
  }

  // ----- Tạo mới -----
  const ban = {
    name: duLieu.name,
    contact: duLieu.contact,
    phone: duLieu.phone,
    passwordDemo: duLieu.passwordDemo,
    role: duLieu.role === undefined || duLieu.role === null ? 'guest' : duLieu.role,
    type: duLieu.type,
    org: duLieu.org,
    clubId: duLieu.clubId,
    hideOnBoard: duLieu.hideOnBoard,
    totalHours: 0,
  };
  kiemTraTaiKhoan(ban, danhSach);
  ban.id = taoIdMoi(danhSach);
  ban.code = capMaKhachMoi(danhSach);
  ban.createdAt = now().toISOString();

  danhSach.push(ban);
  store.set(KHOA_NGUOI_DUNG, danhSach);
  return saoSau(ban);
}

/**
 * Xóa tài khoản theo id. Trả về true nếu xóa được. Trễ 200-500 ms.
 *   - Không tìm thấy id: ném lỗi tiếng Việt "Không tìm thấy tài khoản cần xóa...".
 *   - Tài khoản quản lý duy nhất còn lại: ném lỗi "Không thể xóa tài khoản quản lý cuối cùng...".
 *   - Nếu tài khoản bị xóa đang đăng nhập thì tự đăng xuất (xóa khóa lumen-current-user;
 *     các tab khác thấy ngay).
 * Bộ đếm mã khách không bị giảm, nên mã của tài khoản đã xóa không bị cấp lại.
 * Chỉ xóa bản ghi trong danh sách tài khoản; dữ liệu của các module khác (phiên ngồi, đặt phòng...)
 * chưa tồn tại ở bước này, sẽ xử lý khi các module đó được làm.
 */
export async function deleteUser(id) {
  await tre();
  const danhSach = docNguoiDung();
  const viTri = typeof id === 'string' && id !== '' ? danhSach.findIndex((u) => u.id === id) : -1;
  if (viTri === -1) {
    throw new Error(LOI_KHONG_TIM_THAY_DE_XOA);
  }

  const nguoi = danhSach[viTri];
  if (nguoi.role === 'manager') {
    const soQuanLy = danhSach.filter((u) => u.role === 'manager').length;
    if (soQuanLy <= 1) {
      throw new Error(LOI_XOA_QUAN_LY_CUOI);
    }
  }

  danhSach.splice(viTri, 1);
  store.set(KHOA_NGUOI_DUNG, danhSach);

  // Đang đăng nhập bằng chính tài khoản này thì đăng xuất.
  if (store.get(KHOA_DANG_NHAP) === nguoi.id) {
    store.remove(KHOA_DANG_NHAP);
  }
  return true;
}

// ---------- Đăng nhập ----------

/**
 * Đăng nhập bằng email hoặc số điện thoại và mật khẩu (giả). Trả về tài khoản. Trễ 200-500 ms.
 * Tra theo cả contact và phone. Email không phân biệt hoa thường; số điện thoại bỏ khoảng trắng.
 * Sai tài khoản và sai mật khẩu dùng hai thông báo riêng (quyết định G-login).
 * Thành công thì lưu id vào khóa lumen-current-user (các tab khác thấy ngay).
 */
export async function login(emailHoacSdt, matKhau) {
  await tre();
  const dinhDanh = chuanHoaLienHe(emailHoacSdt);
  const nguoi = dinhDanh === '' ? undefined : docNguoiDung().find((u) =>
    chuanHoaLienHe(u.contact) === dinhDanh || chuanHoaSdt(u.phone) === dinhDanh
  );
  if (!nguoi) throw new Error(LOI_SAI_TAI_KHOAN);
  if (typeof nguoi.passwordDemo !== 'string' || nguoi.passwordDemo !== matKhau) {
    throw new Error(LOI_SAI_MAT_KHAU);
  }
  store.set(KHOA_DANG_NHAP, nguoi.id);
  return saoSau(nguoi);
}

/** Đăng xuất: xóa khóa lumen-current-user (các tab khác thấy ngay). Trễ 200-500 ms. */
export async function logout() {
  await tre();
  store.remove(KHOA_DANG_NHAP);
}

/**
 * Tài khoản đang đăng nhập, hoặc null nếu chưa đăng nhập (hoặc tài khoản đã bị xóa).
 * Đọc id rồi tra lại danh sách nên luôn là dữ liệu mới nhất (có cả passwordDemo).
 * Hàm đồng bộ, không trễ, dùng được trực tiếp cho header.
 */
export function getCurrentUser() {
  const id = store.get(KHOA_DANG_NHAP);
  if (typeof id !== 'string' || id === '') return null;
  const nguoi = docNguoiDung().find((u) => u.id === id);
  return nguoi || null;
}

// =============================================================================
// Thanh toán QR giả (Bước 4a, M6)
// =============================================================================
//
// Đối tượng thanh toán (lưu trong khóa lumen-payments, dạng mảng):
//   id            'p-' + mốc thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên
//   loai          một giá trị của LOAI_GIAO_DICH
//   refId         mã đối tượng liên quan (phiên, đặt phòng, đơn đồ, đơn in...), có thể null
//   userId        id khách
//   tien          số tiền, số nguyên đồng
//   phi           phí cổng thanh toán, số nguyên đồng (config.QUY_TAC.phiCongThanhToanPhanTram)
//   trangThai     một giá trị của TRANG_THAI_THANH_TOAN
//   taoLuc        ISO, giờ mô phỏng lúc tạo
//   hetHanLuc     ISO, hạn thanh toán
//   thanhToanLuc  ISO khi đã thanh toán, ngược lại null
//   thuCong       true nếu tạo lúc đang bật chế độ gián đoạn (quy trình thủ công, Bước 11)
//   xuLyCocLuc    (thêm) ISO lúc hoanCoc xử lý cọc (da-hoan hoặc mat-coc), ngược lại null

/**
 * Hạn thanh toán của một đơn: dùng lại thời gian giữ phòng 10 phút (R19, QUY_TAC.thoiGianGiuPhongPhut)
 * cho MỌI loại giao dịch, vì M6 quy định đồng hồ đếm ngược 10 phút. Nếu config thiếu khóa thì rơi về 10 phút.
 */
function hanThanhToanMs() {
  const phut = config.QUY_TAC && Number.isFinite(config.QUY_TAC.thoiGianGiuPhongPhut)
    ? config.QUY_TAC.thoiGianGiuPhongPhut
    : 10; // dự phòng: 10 phút theo M6
  return phut * MOT_PHUT_MS;
}

/** Phí cổng thanh toán (số nguyên đồng) của một số tiền, theo phần trăm trong config (mặc định 1%). */
function tinhPhiCong(tien) {
  const phanTram = config.QUY_TAC && Number.isFinite(config.QUY_TAC.phiCongThanhToanPhanTram)
    ? config.QUY_TAC.phiCongThanhToanPhanTram
    : 1;
  return Math.round(tien * phanTram / 100);
}

/** Đọc mảng thanh toán từ store. Chưa có hoặc hỏng thì dùng dữ liệu seed (mảng rỗng), chưa ghi lại. */
function docThanhToan() {
  const danhSach = store.get(KHOA_THANH_TOAN);
  return Array.isArray(danhSach) ? danhSach : taoThanhToanSeed();
}

/**
 * Đổi mọi đơn cho-thanh-toan đã quá hạn (now() >= hetHanLuc) thành het-han. Sửa trực tiếp mảng.
 * Trả về true nếu có đơn bị đổi. Không có bộ hẹn giờ ngầm: kiểm tra mỗi khi đọc hoặc xử lý.
 */
function capNhatHetHan(danhSach) {
  const bayGio = now().getTime();
  let coDoi = false;
  for (const tt of danhSach) {
    if (tt.trangThai === TRANG_THAI_THANH_TOAN.CHO && bayGio >= Date.parse(tt.hetHanLuc)) {
      tt.trangThai = TRANG_THAI_THANH_TOAN.HET_HAN;
      coDoi = true;
    }
  }
  return coDoi;
}

/** Đọc mảng thanh toán, đã cập nhật trạng thái hết hạn (và ghi lại store nếu có đơn đổi). */
function docThanhToanDaCapNhat() {
  const danhSach = docThanhToan();
  if (capNhatHetHan(danhSach)) store.set(KHOA_THANH_TOAN, danhSach);
  return danhSach;
}

/** Id thanh toán mới: p- + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên; lặp lại nếu trùng (như id tài khoản, G-id). */
function taoIdThanhToan(danhSach) {
  const phanThoiGian = now().getTime().toString(36);
  let id;
  do {
    id = 'p-' + phanThoiGian + chuoiNgauNhien(4);
  } while (danhSach.some((tt) => tt.id === id));
  return id;
}

/** Tìm đơn theo id; không thấy thì ném lỗi tiếng Việt. Trả về { danhSach, viTri }. */
function timThanhToan(danhSach, id) {
  const viTri = typeof id === 'string' && id !== '' ? danhSach.findIndex((tt) => tt.id === id) : -1;
  if (viTri === -1) {
    throw new Error('Không tìm thấy đơn thanh toán. Có thể mã đơn bị sai hoặc dữ liệu đã được đặt lại.');
  }
  return { danhSach, viTri };
}

/** Thông báo lỗi khi đơn không còn ở trạng thái cho-thanh-toan (trừ het-han do xử lý riêng). */
function loiTrangThaiKhongChoXuLy(trangThai) {
  switch (trangThai) {
    case TRANG_THAI_THANH_TOAN.DA_THANH_TOAN:
    case TRANG_THAI_THANH_TOAN.DA_HOAN:
    case TRANG_THAI_THANH_TOAN.MAT_COC:
      return 'Đơn này đã được thanh toán trước đó, không thể xử lý lần nữa.';
    case TRANG_THAI_THANH_TOAN.THAT_BAI:
      return 'Đơn này đã thất bại. Vui lòng tạo đơn mới để thử lại.';
    case TRANG_THAI_THANH_TOAN.HET_HAN:
      return 'Đơn này đã hết hạn thanh toán. Vui lòng tạo đơn mới.';
    default:
      return 'Đơn này không ở trạng thái chờ thanh toán.';
  }
}

/**
 * Dùng chung cho xacNhanThanhToan và thatBaiThanhToan: kiểm tra đơn đang chờ thanh toán.
 * Quá hạn thì ghi het-han vào store rồi ném lỗi. Không ở cho-thanh-toan thì ném lỗi.
 * Trả về đối tượng đơn (tham chiếu trong mảng) khi hợp lệ.
 */
function layDonDangCho(danhSach, id) {
  const { viTri } = timThanhToan(danhSach, id);
  const tt = danhSach[viTri];
  if (tt.trangThai === TRANG_THAI_THANH_TOAN.CHO && now().getTime() >= Date.parse(tt.hetHanLuc)) {
    tt.trangThai = TRANG_THAI_THANH_TOAN.HET_HAN;
    store.set(KHOA_THANH_TOAN, danhSach);
    throw new Error('Đơn đã hết hạn thanh toán sau ' + (hanThanhToanMs() / MOT_PHUT_MS) + ' phút. Vui lòng tạo đơn mới.');
  }
  if (tt.trangThai !== TRANG_THAI_THANH_TOAN.CHO) {
    throw new Error(loiTrangThaiKhongChoXuLy(tt.trangThai));
  }
  return tt;
}

/** Chuyển Date, số (mili giây) hoặc chuỗi ngày giờ thành mili giây; không hợp lệ thì ném lỗi tiếng Việt. */
function chuyenMs(giaTri, tenTruong) {
  let ms = NaN;
  if (giaTri instanceof Date) ms = giaTri.getTime();
  else if (typeof giaTri === 'number') ms = giaTri;
  else if (typeof giaTri === 'string') ms = Date.parse(giaTri);
  if (!Number.isFinite(ms)) {
    throw new Error('Thời điểm "' + tenTruong + '" không hợp lệ. Hãy truyền Date, số mili giây hoặc chuỗi ngày giờ ISO.');
  }
  return ms;
}

/** Ngày theo giờ Việt Nam dạng YYYY-MM-DD của một mốc mili giây. (new Date(số) chỉ đổi định dạng, không đọc giờ máy.) */
function ngayGioVN(ms) {
  return new Date(ms + LECH_GIO_VN_MS).toISOString().slice(0, 10);
}

/** Chuẩn hóa tham số ngày thành YYYY-MM-DD (giờ Việt Nam). Bỏ trống thì lấy ngày của now(). */
function chuanHoaNgay(ngay) {
  if (ngay === undefined || ngay === null || ngay === '') return ngayGioVN(now().getTime());
  if (typeof ngay === 'string' && MAU_NGAY.test(ngay)) return ngay;
  return ngayGioVN(chuyenMs(ngay, 'ngày'));
}

/**
 * Tạo một đơn thanh toán mới, trạng thái cho-thanh-toan. Trả về đơn vừa lưu. Trễ 200-500 ms.
 * Tham số: loai (một giá trị của LOAI_GIAO_DICH), refId (có thể bỏ trống), userId, tien (>= 0, làm tròn đến đồng).
 * phi = tien x phiCongThanhToanPhanTram / 100, làm tròn đến đồng (89.000đ -> 890đ).
 * hetHanLuc = taoLuc + 10 phút (xem hanThanhToanMs).
 * Nếu đang bật chế độ gián đoạn (lumen-outage = true): đơn vẫn được lưu nhưng có thuCong: true;
 * đây là điểm vào cho chế độ dự phòng ở Bước 11, hệ thống không tự xử lý thanh toán.
 */
export async function taoThanhToan({ loai, refId = null, userId, tien } = {}) {
  await tre();
  if (!DANH_SACH_LOAI.includes(loai)) {
    throw new Error('Loại giao dịch không hợp lệ. Chỉ nhận: ' + DANH_SACH_LOAI.join(', ') + '.');
  }
  if (typeof userId !== 'string' || userId === '') {
    throw new Error('Thiếu thông tin khách hàng. Vui lòng đăng nhập rồi thử lại.');
  }
  if (typeof tien !== 'number' || !Number.isFinite(tien) || tien < 0) {
    throw new Error('Số tiền không hợp lệ. Số tiền phải là số không âm.');
  }
  const soTien = Math.round(tien);

  const danhSach = docThanhToanDaCapNhat();
  const bayGio = now();
  const thuCong = store.get(KHOA_GIAN_DOAN) === true;

  const tt = {
    id: taoIdThanhToan(danhSach),
    loai,
    refId: (refId === undefined || refId === '') ? null : refId,
    userId,
    tien: soTien,
    phi: tinhPhiCong(soTien),
    trangThai: TRANG_THAI_THANH_TOAN.CHO,
    taoLuc: bayGio.toISOString(),
    hetHanLuc: new Date(bayGio.getTime() + hanThanhToanMs()).toISOString(),
    thanhToanLuc: null,
    thuCong,
    xuLyCocLuc: null,
  };
  danhSach.push(tt);
  store.set(KHOA_THANH_TOAN, danhSach);
  return saoSau(tt);
}

/**
 * Lấy một đơn thanh toán theo id. Trễ 200-500 ms. Không thấy thì ném lỗi tiếng Việt.
 * Nếu đơn đang chờ mà đã quá hạn thì được đổi thành het-han (và lưu lại) trước khi trả về.
 */
export async function layThanhToan(id) {
  await tre();
  const danhSach = docThanhToanDaCapNhat();
  const { viTri } = timThanhToan(danhSach, id);
  return saoSau(danhSach[viTri]);
}

/**
 * Xác nhận thanh toán thành công (nút mô phỏng "Đã chuyển khoản"). Trả về đơn đã cập nhật. Trễ 200-500 ms.
 * Chỉ đơn cho-thanh-toan mới xác nhận được, và chỉ MỘT lần: lần hai ném lỗi, không tạo giao dịch thứ hai.
 * Đơn quá hạn: ghi het-han rồi ném lỗi.
 */
export async function xacNhanThanhToan(id) {
  await tre();
  const danhSach = docThanhToan();
  const tt = layDonDangCho(danhSach, id);
  tt.trangThai = TRANG_THAI_THANH_TOAN.DA_THANH_TOAN;
  tt.thanhToanLuc = now().toISOString();
  store.set(KHOA_THANH_TOAN, danhSach);
  return saoSau(tt);
}

/**
 * Ghi nhận thanh toán thất bại (nút mô phỏng "Thất bại"). Trả về đơn đã cập nhật. Trễ 200-500 ms.
 * Cùng điều kiện với xacNhanThanhToan: đơn phải đang cho-thanh-toan và chưa quá hạn.
 * Khách thử lại bằng cách tạo đơn mới.
 */
export async function thatBaiThanhToan(id) {
  await tre();
  const danhSach = docThanhToan();
  const tt = layDonDangCho(danhSach, id);
  tt.trangThai = TRANG_THAI_THANH_TOAN.THAT_BAI;
  store.set(KHOA_THANH_TOAN, danhSach);
  return saoSau(tt);
}

/**
 * Xử lý tiền cọc phòng khi hủy hoặc không đến (R17). Trả về đơn đã cập nhật. Trễ 200-500 ms.
 * Chỉ nhận đơn loại coc-phong đang da-thanh-toan.
 * Tham số nhận từ ngoài, hàm không tự lấy giờ: gioBatDau (giờ bắt đầu đặt phòng) và huyLuc
 * (lúc hủy; với "không đến" thì truyền một thời điểm sau gioBatDau). Mỗi giá trị là Date, mili giây hoặc chuỗi ISO.
 *   còn >= hanHoanCocGio giờ (2 giờ, tính cả đúng 2 giờ 00 phút) -> da-hoan.
 *   còn ít hơn (kể cả hủy sau giờ bắt đầu)                          -> mat-coc.
 * Chỉ đổi trạng thái của đơn cọc, không tạo thêm giao dịch loại hoan-coc.
 */
export async function hoanCoc(id, { gioBatDau, huyLuc } = {}) {
  await tre();
  const msBatDau = chuyenMs(gioBatDau, 'gioBatDau');
  const msHuy = chuyenMs(huyLuc, 'huyLuc');

  const danhSach = docThanhToanDaCapNhat();
  const { viTri } = timThanhToan(danhSach, id);
  const tt = danhSach[viTri];
  if (tt.loai !== LOAI_GIAO_DICH.COC_PHONG) {
    throw new Error('Chỉ đơn cọc phòng mới được hoàn hoặc giữ cọc.');
  }
  if (tt.trangThai !== TRANG_THAI_THANH_TOAN.DA_THANH_TOAN) {
    throw new Error(tt.trangThai === TRANG_THAI_THANH_TOAN.DA_HOAN || tt.trangThai === TRANG_THAI_THANH_TOAN.MAT_COC
      ? 'Tiền cọc này đã được xử lý trước đó, không thể xử lý lại.'
      : 'Chỉ đơn cọc đã thanh toán mới được hoàn hoặc giữ cọc.');
  }

  const hanHoanMs = config.QUY_TAC.hanHoanCocGio * MOT_GIO_MS;
  tt.trangThai = (msBatDau - msHuy) >= hanHoanMs
    ? TRANG_THAI_THANH_TOAN.DA_HOAN
    : TRANG_THAI_THANH_TOAN.MAT_COC;
  tt.xuLyCocLuc = now().toISOString();
  store.set(KHOA_THANH_TOAN, danhSach);
  return saoSau(tt);
}

/**
 * Lịch sử giao dịch của một khách, MỚI NHẤT TRƯỚC (theo taoLuc). Trễ 200-500 ms.
 * Bộ lọc tùy chọn: loai (một giá trị của LOAI_GIAO_DICH) và thang (chuỗi 'YYYY-MM', tính theo giờ Việt Nam).
 */
export async function lichSuGiaoDich(userId, { loai, thang } = {}) {
  await tre();
  if (typeof userId !== 'string' || userId === '') {
    throw new Error('Thiếu thông tin khách hàng. Vui lòng đăng nhập rồi thử lại.');
  }
  if (loai !== undefined && loai !== null && loai !== '' && !DANH_SACH_LOAI.includes(loai)) {
    throw new Error('Loại giao dịch không hợp lệ. Chỉ nhận: ' + DANH_SACH_LOAI.join(', ') + '.');
  }
  const locThang = (thang !== undefined && thang !== null && thang !== '') ? thang : null;
  if (locThang !== null && !MAU_THANG.test(locThang)) {
    throw new Error('Tháng không hợp lệ. Hãy dùng dạng YYYY-MM, ví dụ 2027-11.');
  }
  const locLoai = (loai !== undefined && loai !== null && loai !== '') ? loai : null;

  const danhSach = docThanhToanDaCapNhat();
  // reverse() trước để các đơn cùng taoLuc cũng đứng theo thứ tự mới nhất trước (sort ổn định).
  const ketQua = danhSach
    .filter((tt) => tt.userId === userId)
    .filter((tt) => locLoai === null || tt.loai === locLoai)
    .filter((tt) => locThang === null || ngayGioVN(Date.parse(tt.taoLuc)).slice(0, 7) === locThang)
    .reverse()
    .sort((a, b) => Date.parse(b.taoLuc) - Date.parse(a.taoLuc));
  return saoSau(ketQua);
}

/**
 * Đối soát một ngày cho quản lý (M6). Trễ 200-500 ms.
 * Tham số ngay: 'YYYY-MM-DD', Date, mili giây hoặc ISO; bỏ trống thì lấy ngày của now() (giờ Việt Nam).
 * Chỉ tính giao dịch da-thanh-toan có thanhToanLuc trong ngày đó. Trả về:
 *   {
 *     ngay: 'YYYY-MM-DD',
 *     theoLoai: { 'mua-goi': { soGiaoDich, tong, phi }, ... },   // đủ mọi loại, loại không có thì 0
 *     tongThu,        // tổng tien của các giao dịch tính
 *     tongPhi,        // tổng phí cổng 1%
 *     soGiaoDich,     // số giao dịch tính
 *     soThatBai       // số đơn that-bai có taoLuc trong ngày đó
 *   }
 * Đơn cọc đã chuyển sang da-hoan hoặc mat-coc không còn là da-thanh-toan nên không nằm trong tổng này.
 */
export async function tongHopThu(ngay) {
  await tre();
  const ngayLoc = chuanHoaNgay(ngay);
  const danhSach = docThanhToanDaCapNhat();

  const theoLoai = {};
  for (const loai of DANH_SACH_LOAI) theoLoai[loai] = { soGiaoDich: 0, tong: 0, phi: 0 };

  let tongThu = 0;
  let tongPhi = 0;
  let soGiaoDich = 0;
  let soThatBai = 0;

  for (const tt of danhSach) {
    if (tt.trangThai === TRANG_THAI_THANH_TOAN.DA_THANH_TOAN && tt.thanhToanLuc
        && ngayGioVN(Date.parse(tt.thanhToanLuc)) === ngayLoc) {
      const nhom = theoLoai[tt.loai] || (theoLoai[tt.loai] = { soGiaoDich: 0, tong: 0, phi: 0 });
      nhom.soGiaoDich += 1;
      nhom.tong += tt.tien;
      nhom.phi += tt.phi;
      tongThu += tt.tien;
      tongPhi += tt.phi;
      soGiaoDich += 1;
    } else if (tt.trangThai === TRANG_THAI_THANH_TOAN.THAT_BAI && ngayGioVN(Date.parse(tt.taoLuc)) === ngayLoc) {
      soThatBai += 1;
    }
  }

  return { ngay: ngayLoc, theoLoai, tongThu, tongPhi, soGiaoDich, soThatBai };
}

/**
 * Bật hoặc tắt chế độ "Web và cổng thanh toán gián đoạn" (khóa lumen-outage). Trễ 200-500 ms.
 * bat: truthy là bật, falsy là tắt. Trả về giá trị boolean đã lưu. Các tab khác thấy ngay qua store.
 * Đơn đã tạo trước đó không bị đổi; chỉ đơn tạo SAU khi bật mới có cờ thuCong: true.
 */
export async function batTatGianDoan(bat) {
  await tre();
  const giaTri = Boolean(bat);
  store.set(KHOA_GIAN_DOAN, giaTri);
  return giaTri;
}
