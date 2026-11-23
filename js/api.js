// js/api.js
// -----------------------------------------------------------------------------
// Lớp truy cập dữ liệu của Lumen 24 (Bước 1c, cập nhật ở Bước 3a). Mọi trang đi qua file này
// để đọc và ghi dữ liệu; sau này có thể thay bằng cơ sở dữ liệu thật mà không sửa giao diện.
//
// Hiện cung cấp: cấu hình (getConfig), tài khoản (getUsers, getUserById, saveUser, deleteUser)
// và trạng thái đăng nhập (login, logout, getCurrentUser).
//
// Thay đổi ở Bước 3a:
//   - Mã khách (LM-000123) lấy từ BỘ ĐẾM lưu trong store (khóa lumen-code-counter), không còn
//     là "số lớn nhất + 1" nữa. Bộ đếm chỉ tăng, nên mã của tài khoản đã xóa không bị cấp lại.
//   - Thêm deleteUser(id).
//
// Độ trễ giả lập:
//   - getConfig() và getCurrentUser() là hàm ĐỒNG BỘ, không trễ, vì chỉ đọc dữ liệu
//     có sẵn và được header gọi liên tục.
//   - Các hàm còn lại là async và trễ ngẫu nhiên 200-500 ms qua hàm tre() dùng chung.
//     Mỗi hàm chờ xong độ trễ rồi mới đọc và ghi dữ liệu trong một khối đồng bộ,
//     nên không có hai thao tác chen vào giữa chừng.
//
// LƯU Ý VỀ MẬT KHẨU: passwordDemo chỉ là chuỗi giả cho demo, KHÔNG mã hóa, lưu nguyên
// văn trong store. getUsers() và getCurrentUser() trả cả passwordDemo (dữ liệu demo).
// Tuyệt đối không dùng mật khẩu thật.
//
// LƯU Ý VỀ TÍNH NGẪU NHIÊN VÀ GIỜ GIẤC:
//   - File này không gọi new Date(); giờ chỉ lấy qua now() của js/clock.js (mục 1.3).
//   - Math.random được dùng ở hai chỗ: (1) 4 ký tự ngẫu nhiên cuối id tài khoản mới
//     (đây là ngoại lệ duy nhất cho dữ liệu LƯU TRỮ), (2) độ trễ giả lập trong tre(),
//     chỉ ảnh hưởng thời gian chờ chứ không ảnh hưởng dữ liệu.
//
// Khóa lumen-current-user chỉ lưu id của người đang đăng nhập (không lưu cả tài khoản),
// nên getCurrentUser() luôn trả dữ liệu mới nhất của tài khoản đó.
// -----------------------------------------------------------------------------

import * as store from './store.js';
import * as config from './config.js';
import {
  taoNguoiDungSeed,
  boDemMaSeed,
  KHOA_NGUOI_DUNG,
  KHOA_DANG_NHAP,
  KHOA_BO_DEM_MA,
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
 * [MỚI - Bước 3a] Xóa tài khoản theo id. Trả về true nếu xóa được. Trễ 200-500 ms.
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
