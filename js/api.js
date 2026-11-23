// js/api.js
// -----------------------------------------------------------------------------
// Lớp truy cập dữ liệu của Lumen 24 (Bước 1c).
// Mọi giao diện chỉ gọi dữ liệu qua file này, không gọi js/store.js trực tiếp.
//
// LƯU Ý QUAN TRỌNG: đây là hệ thống MÔ PHỎNG cho bài tập. Mật khẩu chỉ là chuỗi giả
// cho demo, được lưu và so sánh nguyên văn, KHÔNG mã hóa. Không dùng mật khẩu thật.
// Phân quyền và đăng nhập ở đây không phải bảo mật thật.
//
// Mọi hàm xuất ra đều là async và chờ một khoảng ngẫu nhiên 200-500 ms (hàm trễ())
// để giả lập độ trễ của máy chủ. Sau này có thể thay phần bên trong bằng cơ sở dữ
// liệu thật mà không phải sửa giao diện.
//
// Lỗi nghiệp vụ được ném ra là Error có thông báo tiếng Việt, kèm hai thuộc tính:
//   loi.ma     mã lỗi ngắn, ví dụ 'TRUNG_LIEN_HE', 'SAI_MAT_KHAU'
//   loi.truong tên trường gây lỗi ('contact', 'phone', 'name', ...) hoặc null
// -----------------------------------------------------------------------------

import * as store from './store.js';
import * as config from './config.js';
import { taoNguoiDungSeed, KHOA_NGUOI_DUNG } from './seed.js';
import { now } from './clock.js';

// ---------- Hằng số ----------

/**
 * Khóa lưu người đang đăng nhập. store.js tự thêm tiền tố nên khóa thật trong
 * localStorage là "lumen24:lumen-current-user". Giá trị lưu là id của tài khoản.
 */
const KHOA_NGUOI_DANG_NHAP = 'lumen-current-user';

/** Khoảng trễ giả lập (mili giây). */
const DO_TRE_TOI_THIEU_MS = 200;
const DO_TRE_TOI_DA_MS = 500;

/** Giá trị hợp lệ của vai trò và loại khách (mục 7 của đặc tả). */
const VAI_TRO_HOP_LE = ['guest', 'staff', 'manager'];
const LOAI_KHACH_HOP_LE = ['student', 'worker'];

/** Email cơ bản: có phần trước @, phần sau @ và dấu chấm. */
const MAU_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Số điện thoại Việt Nam theo đặc tả (M3): 10 chữ số, bắt đầu bằng 0. */
const MAU_SO_DIEN_THOAI = /^0\d{9}$/;

// ---------- Hàm nội bộ ----------

/** Chờ ngẫu nhiên từ 200 đến 500 ms (đã gồm cả hai đầu). Dùng chung cho mọi hàm xuất ra. */
function trễ() {
  const khoang = DO_TRE_TOI_DA_MS - DO_TRE_TOI_THIEU_MS + 1;
  const ms = DO_TRE_TOI_THIEU_MS + Math.floor(Math.random() * khoang);
  return new Promise((giaiQuyet) => setTimeout(giaiQuyet, ms));
}

/** Tạo lỗi nghiệp vụ có thông báo tiếng Việt, mã lỗi và tên trường. */
function taoLoi(thongBao, ma, truong = null) {
  const loi = new Error(thongBao);
  loi.name = 'LoiApi';
  loi.ma = ma;
  loi.truong = truong;
  return loi;
}

/** Chuyển giá trị bất kỳ thành chuỗi đã cắt khoảng trắng hai đầu; null hoặc undefined thành chuỗi rỗng. */
function chuanHoaChuoi(giaTri) {
  if (giaTri === null || giaTri === undefined) return '';
  return String(giaTri).trim();
}

/** Bỏ mọi khoảng trắng trong chuỗi (dùng cho số điện thoại gõ kiểu "0912 345 678"). */
function boKhoangTrang(chuoi) {
  return chuoi.replace(/\s+/g, '');
}

/**
 * Chuẩn hóa email hoặc số điện thoại để so sánh:
 * có dấu @ thì coi là email (viết thường), ngược lại coi là số điện thoại (bỏ khoảng trắng).
 */
function chuanHoaDinhDanh(giaTri) {
  const chuoi = chuanHoaChuoi(giaTri);
  if (chuoi.includes('@')) return chuoi.toLowerCase();
  return boKhoangTrang(chuoi);
}

/** Các định danh dùng để đăng nhập và kiểm tra trùng của một tài khoản: contact và phone. */
function dinhDanhCua(nguoiDung) {
  return [nguoiDung.contact, nguoiDung.phone]
    .map(chuanHoaDinhDanh)
    .filter((dinhDanh) => dinhDanh !== '');
}

/** Bản sao sâu của dữ liệu thuần (dùng cho cấu hình vốn bị đóng băng). */
function banSaoSau(giaTri) {
  if (typeof structuredClone === 'function') return structuredClone(giaTri);
  return JSON.parse(JSON.stringify(giaTri));
}

/**
 * Đọc danh sách tài khoản từ store.
 * Nếu store chưa có danh sách (khóa chưa tồn tại hoặc dữ liệu hỏng, không phải mảng)
 * thì tự nạp 7 tài khoản demo từ seed rồi ghi vào store.
 * Một mảng rỗng được coi là "đã có danh sách" và được giữ nguyên.
 */
function docNguoiDung() {
  const danhSach = store.get(KHOA_NGUOI_DUNG, null);
  if (Array.isArray(danhSach)) return danhSach;

  const danhSachSeed = taoNguoiDungSeed();
  store.set(KHOA_NGUOI_DUNG, danhSachSeed);
  return danhSachSeed;
}

/** Mã khách mới dạng LM-000123: lấy số lớn nhất hiện có cộng 1 (G8 trong PROGRESS.md). */
function taoMaKhachMoi(danhSach) {
  let lonNhat = 0;
  for (const nguoiDung of danhSach) {
    const khop = /^LM-(\d+)$/.exec(String(nguoiDung.code || ''));
    if (khop) lonNhat = Math.max(lonNhat, Number(khop[1]));
  }
  return 'LM-' + String(lonNhat + 1).padStart(6, '0');
}

/** id mới dạng "u-" + thời gian mô phỏng (hệ 36) + 4 ký tự ngẫu nhiên; lặp lại nếu lỡ trùng. */
function taoIdMoi(danhSach) {
  let id;
  do {
    id = 'u-' + now().getTime().toString(36) + Math.random().toString(36).slice(2, 6);
  } while (danhSach.some((nguoiDung) => nguoiDung.id === id));
  return id;
}

/**
 * Kiểm tra dữ liệu và dựng đối tượng tài khoản chuẩn.
 *   - Cập nhật (nguoiDungCu khác null): trường nào không gửi thì giữ giá trị cũ.
 *   - Thêm mới: trường nào không gửi thì dùng mặc định.
 * Không đặt id, code, createdAt ở đây; hàm saveUser đặt sau.
 * Các trường thừa (ví dụ demoNote) được giữ nguyên.
 */
function xayDungNguoiDung(dauVao, nguoiDungCu) {
  const hopNhat = { ...(nguoiDungCu || {}), ...dauVao };

  // Họ tên
  const ten = chuanHoaChuoi(hopNhat.name);
  if (!ten) throw taoLoi('Vui lòng nhập họ tên.', 'THIEU_TEN', 'name');

  // Liên hệ chính: email hoặc số điện thoại
  const lienHe = chuanHoaDinhDanh(hopNhat.contact);
  if (!lienHe) {
    throw taoLoi('Vui lòng nhập email hoặc số điện thoại.', 'THIEU_LIEN_HE', 'contact');
  }
  if (lienHe.includes('@')) {
    if (!MAU_EMAIL.test(lienHe)) {
      throw taoLoi('Email chưa đúng định dạng. Ví dụ: ten@example.com.', 'EMAIL_SAI_DINH_DANG', 'contact');
    }
  } else if (!MAU_SO_DIEN_THOAI.test(lienHe)) {
    throw taoLoi(
      'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0. Ví dụ: 0912345678.',
      'SDT_SAI_DINH_DANG',
      'contact'
    );
  }

  // Số điện thoại: nếu để trống mà liên hệ chính là số điện thoại thì dùng luôn số đó.
  let soDienThoai = boKhoangTrang(chuanHoaChuoi(hopNhat.phone));
  if (soDienThoai === '') {
    soDienThoai = MAU_SO_DIEN_THOAI.test(lienHe) ? lienHe : null;
  } else if (!MAU_SO_DIEN_THOAI.test(soDienThoai)) {
    throw taoLoi(
      'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0. Ví dụ: 0912345678.',
      'SDT_SAI_DINH_DANG',
      'phone'
    );
  }

  // Mật khẩu giả (không mã hóa, không cắt khoảng trắng)
  const matKhau = typeof hopNhat.passwordDemo === 'string' ? hopNhat.passwordDemo : '';
  if (matKhau.trim() === '') {
    throw taoLoi('Vui lòng nhập mật khẩu.', 'THIEU_MAT_KHAU', 'passwordDemo');
  }

  // Vai trò: mặc định là khách
  const vaiTro = hopNhat.role ?? 'guest';
  if (!VAI_TRO_HOP_LE.includes(vaiTro)) {
    throw taoLoi('Vai trò không hợp lệ. Chỉ nhận: khách, nhân viên hoặc quản lý.', 'VAI_TRO_SAI', 'role');
  }

  // Loại khách: sinh viên, đi làm hoặc để trống (nhân viên, quản lý)
  const loaiKhach = hopNhat.type ?? null;
  if (loaiKhach !== null && !LOAI_KHACH_HOP_LE.includes(loaiKhach)) {
    throw taoLoi('Loại khách không hợp lệ. Chỉ nhận: sinh viên hoặc đi làm.', 'LOAI_KHACH_SAI', 'type');
  }

  // Tổng giờ tích lũy
  const tongGio = Number(hopNhat.totalHours ?? 0);
  if (!Number.isFinite(tongGio) || tongGio < 0) {
    throw taoLoi('Tổng giờ tích lũy phải là số không âm.', 'TONG_GIO_SAI', 'totalHours');
  }

  return {
    ...hopNhat,
    name: ten,
    contact: lienHe,
    phone: soDienThoai,
    passwordDemo: matKhau,
    role: vaiTro,
    type: loaiKhach,
    org: chuanHoaChuoi(hopNhat.org) || null,
    clubId: hopNhat.clubId ?? null,
    hideOnBoard: Boolean(hopNhat.hideOnBoard),
    totalHours: tongGio,
  };
}

/** Ném lỗi nếu email hoặc số điện thoại của ứng viên trùng với tài khoản trong danh sách "nguoiKhac". */
function kiemTraKhongTrung(ungVien, nguoiKhac) {
  const cuaUngVien = dinhDanhCua(ungVien);
  for (const khac of nguoiKhac) {
    for (const dinhDanh of dinhDanhCua(khac)) {
      if (!cuaUngVien.includes(dinhDanh)) continue;

      if (dinhDanh.includes('@')) {
        throw taoLoi(
          'Email này đã được dùng cho một tài khoản khác. Hãy dùng email khác hoặc đăng nhập.',
          'TRUNG_LIEN_HE',
          'contact'
        );
      }
      const truong = chuanHoaDinhDanh(ungVien.contact) === dinhDanh ? 'contact' : 'phone';
      throw taoLoi(
        'Số điện thoại này đã được dùng cho một tài khoản khác. Hãy dùng số khác hoặc đăng nhập.',
        'TRUNG_LIEN_HE',
        truong
      );
    }
  }
}

// ---------- Các hàm xuất ra ----------

/**
 * Trả về toàn bộ nội dung js/config.js dưới dạng một đối tượng thường
 * (TANG, GOI_CHO_NGOI, PHONG_HOP, MENU, QUY_TAC, ...). Là bản sao sâu nên giao diện
 * sửa thoải mái mà không ảnh hưởng cấu hình gốc.
 * Chưa hợp nhất giá trị Admin chỉnh (làm ở M13).
 */
export async function getConfig() {
  await trễ();
  return banSaoSau(Object.fromEntries(Object.entries(config)));
}

/** Trả về mảng toàn bộ tài khoản (gồm cả trường passwordDemo vì đây là dữ liệu demo). */
export async function getUsers() {
  await trễ();
  return docNguoiDung();
}

/** Trả về tài khoản theo id, hoặc null nếu không có. */
export async function getUserById(id) {
  await trễ();
  if (id === null || id === undefined || id === '') return null;
  return docNguoiDung().find((nguoiDung) => nguoiDung.id === id) ?? null;
}

/**
 * Thêm mới (không có id) hoặc cập nhật (có id) một tài khoản; trả về tài khoản đã lưu.
 *   - Thêm mới: tự tạo id, mã khách LM-xxxxxx và ngày tạo (theo đồng hồ mô phỏng).
 *     Bắt buộc có họ tên, contact (email hoặc số điện thoại) và passwordDemo.
 *     Vai trò mặc định là 'guest'.
 *   - Cập nhật: gộp các trường được gửi lên vào tài khoản cũ; id, code, createdAt không đổi.
 *     Có id nhưng không tìm thấy thì ném lỗi, không tự tạo mới.
 * Ném lỗi tiếng Việt nếu email hoặc số điện thoại trùng tài khoản khác, hoặc dữ liệu sai.
 */
export async function saveUser(user) {
  await trễ();

  if (!user || typeof user !== 'object') {
    throw taoLoi('Dữ liệu tài khoản không hợp lệ.', 'DU_LIEU_SAI');
  }

  const danhSach = docNguoiDung();
  const coId = user.id !== undefined && user.id !== null && user.id !== '';

  let nguoiDungCu = null;
  let viTri = -1;
  if (coId) {
    viTri = danhSach.findIndex((nguoiDung) => nguoiDung.id === user.id);
    if (viTri === -1) {
      throw taoLoi('Không tìm thấy tài khoản cần cập nhật.', 'KHONG_TIM_THAY', 'id');
    }
    nguoiDungCu = danhSach[viTri];
  }

  const nguoiDungMoi = xayDungNguoiDung(user, nguoiDungCu);
  const nguoiKhac = nguoiDungCu
    ? danhSach.filter((nguoiDung) => nguoiDung.id !== nguoiDungCu.id)
    : danhSach;
  kiemTraKhongTrung(nguoiDungMoi, nguoiKhac);

  const danhSachMoi = [...danhSach];
  if (nguoiDungCu) {
    nguoiDungMoi.id = nguoiDungCu.id;
    nguoiDungMoi.code = nguoiDungCu.code;
    nguoiDungMoi.createdAt = nguoiDungCu.createdAt;
    danhSachMoi[viTri] = nguoiDungMoi;
  } else {
    nguoiDungMoi.id = taoIdMoi(danhSach);
    nguoiDungMoi.code = taoMaKhachMoi(danhSach);
    nguoiDungMoi.createdAt = now().toISOString();
    danhSachMoi.push(nguoiDungMoi);
  }

  store.set(KHOA_NGUOI_DUNG, danhSachMoi);
  return nguoiDungMoi;
}

/**
 * Đăng nhập bằng email hoặc số điện thoại và mật khẩu giả.
 * Thành công: lưu id người đang đăng nhập vào store (các tab khác cùng thấy) và trả về tài khoản.
 * Thất bại: ném lỗi "Email hoặc số điện thoại không đúng..." hoặc "Mật khẩu không đúng...".
 */
export async function login(contact, password) {
  await trễ();

  const dinhDanh = chuanHoaDinhDanh(contact);
  if (!dinhDanh) {
    throw taoLoi('Vui lòng nhập email hoặc số điện thoại.', 'THIEU_LIEN_HE', 'contact');
  }
  if (typeof password !== 'string' || password === '') {
    throw taoLoi('Vui lòng nhập mật khẩu.', 'THIEU_MAT_KHAU', 'passwordDemo');
  }

  const nguoiDung = docNguoiDung().find((u) => dinhDanhCua(u).includes(dinhDanh));
  if (!nguoiDung) {
    throw taoLoi(
      'Email hoặc số điện thoại không đúng. Hãy kiểm tra lại hoặc đăng ký tài khoản mới.',
      'SAI_LIEN_HE',
      'contact'
    );
  }
  if (nguoiDung.passwordDemo !== password) {
    throw taoLoi('Mật khẩu không đúng. Vui lòng thử lại.', 'SAI_MAT_KHAU', 'passwordDemo');
  }

  store.set(KHOA_NGUOI_DANG_NHAP, nguoiDung.id);
  return nguoiDung;
}

/** Đăng xuất: xóa người đang đăng nhập khỏi store (các tab khác cũng thấy đã đăng xuất). */
export async function logout() {
  await trễ();
  store.remove(KHOA_NGUOI_DANG_NHAP);
}

/**
 * Trả về tài khoản đang đăng nhập (dữ liệu mới nhất trong danh sách) hoặc null.
 * Nếu id đã lưu không còn tài khoản tương ứng (ví dụ tài khoản bị xóa) thì tự đăng xuất và trả null.
 */
export async function getCurrentUser() {
  await trễ();

  const id = store.get(KHOA_NGUOI_DANG_NHAP, null);
  if (typeof id !== 'string' || id === '') return null;

  const nguoiDung = docNguoiDung().find((u) => u.id === id);
  if (!nguoiDung) {
    store.remove(KHOA_NGUOI_DANG_NHAP);
    return null;
  }
  return nguoiDung;
}
