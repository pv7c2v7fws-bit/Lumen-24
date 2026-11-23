// js/seed.js
// -----------------------------------------------------------------------------
// Dữ liệu giả ban đầu của Lumen 24 (Bước 1b).
// Hiện chỉ gồm: 7 tài khoản demo (mục 3.2) và 3 CLB (mục 8.1).
// Dữ liệu lịch sử (khách mỗi ngày, doanh thu, góp ý, đặt phòng mẫu, bảng vinh danh)
// làm ở các bước sau (Bước 10 và 14), KHÔNG đặt ở đây.
//
// File này chỉ import js/store.js. Không import config.js vì Bước này chưa cần số liệu nào của nó.
// -----------------------------------------------------------------------------

import * as store from './store.js';

// ---------- Tên khóa trong store ----------

/** Khóa chứa mảng người dùng (thực thể User, mục 7). */
export const KHOA_NGUOI_DUNG = 'users';
/** Khóa chứa mảng CLB (thực thể Club, mục 7). */
export const KHOA_CLB = 'clubs';
/** Khóa đồng hồ mô phỏng. PHẢI trùng với KHOA_LUU trong js/clock.js. */
export const KHOA_DONG_HO = 'clock';

/**
 * Danh sách khóa trạng thái phát sinh khi dùng (phiên ngồi, đặt phòng, giao dịch, đơn đồ...).
 * resetDemoData() xóa các khóa này để về trạng thái trống. Hiện để trống vì các module chưa làm;
 * mỗi bước sau thêm tên khóa của mình vào đây (ví dụ 'bookings', 'payments').
 */
export const KHOA_PHAT_SINH = [];

// ---------- Hằng số của dữ liệu seed ----------

/** Mật khẩu giả dùng chung cho 7 tài khoản demo. Chỉ để mô phỏng, KHÔNG dùng mật khẩu thật. */
export const MAT_KHAU_DEMO = 'demo123';

/** Thời điểm tạo tài khoản seed: ngày khai trương 18/11/2026 lúc 8h (mục 8.2). Cố định để kết quả lặp lại được. */
const NGAY_TAO_SEED = '2026-11-18T08:00:00+07:00';

/** Cam kết truyền thông chuẩn của CLB (M13, mục 5.6). Không đặt đánh giá Google Maps làm điều kiện. */
const CAM_KET_TRUYEN_THONG = '1 bài đăng trên fanpage của CLB cho mỗi đợt, gắn tag quán.';

// ---------- Dữ liệu seed ----------

/**
 * 3 CLB (mục 8.1): một đã duyệt, một đang chờ, một bị từ chối.
 * Trường thêm so với mục 7: note (ghi chú của quản lý).
 * mediaCommitment chỉ có khi đã duyệt (ghi lúc duyệt); lastPostedAt = null nghĩa là chưa đăng đợt nào.
 */
export function taoClbSeed() {
  return [
    {
      id: 'clb-lap-trinh',
      name: 'CLB Lập trình Mô phỏng',
      status: 'approved',
      mediaCommitment: CAM_KET_TRUYEN_THONG,
      lastPostedAt: null,
      note: 'Đã duyệt ưu đãi CLB (giảm 10% phòng họp). Đại diện: Linh.',
    },
    {
      id: 'clb-nhiep-anh',
      name: 'CLB Nhiếp ảnh Mô phỏng',
      status: 'pending',
      mediaCommitment: null,
      lastPostedAt: null,
      note: 'Đang chờ quản lý duyệt.',
    },
    {
      id: 'clb-am-nhac',
      name: 'CLB Âm nhạc Mô phỏng',
      status: 'rejected',
      mediaCommitment: null,
      lastPostedAt: null,
      note: 'Bị từ chối: chưa đồng ý cam kết truyền thông (mô phỏng).',
    },
  ];
}

/**
 * 7 tài khoản demo đúng mục 3.2.
 * Trường theo mục 7: id, code, name, contact, passwordDemo, role, type, org, clubId,
 * hideOnBoard, totalHours, createdAt.
 * Trường thêm: phone (số điện thoại giả, 10 chữ số bắt đầu bằng 0), demoNote (mô tả cho nút đăng nhập nhanh).
 *   - role: 'guest' (khách), 'staff' (nhân viên), 'manager' (quản lý).
 *   - type: 'student' hoặc 'worker' với khách; null với nhân viên và quản lý.
 *   - contact là email giả ở tên miền example.com (tên miền dành riêng cho ví dụ).
 */
export function taoNguoiDungSeed() {
  return [
    {
      id: 'u-minh-anh', code: 'LM-000001', name: 'Minh Anh',
      contact: 'minhanh@example.com', phone: '0900000001', passwordDemo: MAT_KHAU_DEMO,
      role: 'guest', type: 'student', org: 'Trường ĐH Mô phỏng', clubId: null,
      hideOnBoard: false, totalHours: 88, createdAt: NGAY_TAO_SEED,
      demoNote: 'Sinh viên, có 88 giờ tích lũy, gần mốc 100 giờ.',
    },
    {
      id: 'u-quoc-bao', code: 'LM-000002', name: 'Quốc Bảo',
      contact: 'quocbao@example.com', phone: '0900000002', passwordDemo: MAT_KHAU_DEMO,
      role: 'guest', type: 'worker', org: 'Công ty Mô phỏng', clubId: null,
      hideOnBoard: false, totalHours: 0, createdAt: NGAY_TAO_SEED,
      demoNote: 'Người đi làm, dùng để demo thẻ tháng hè.',
    },
    {
      id: 'u-linh', code: 'LM-000003', name: 'Linh',
      contact: 'linh@example.com', phone: '0900000003', passwordDemo: MAT_KHAU_DEMO,
      role: 'guest', type: 'student', org: 'Trường ĐH Mô phỏng', clubId: 'clb-lap-trinh',
      hideOnBoard: false, totalHours: 0, createdAt: NGAY_TAO_SEED,
      demoNote: 'Đại diện CLB Lập trình Mô phỏng, CLB đã được duyệt ưu đãi.',
    },
    {
      id: 'u-ha', code: 'LM-000004', name: 'Hà',
      contact: 'ha@example.com', phone: '0900000004', passwordDemo: MAT_KHAU_DEMO,
      role: 'guest', type: 'student', org: null, clubId: null,
      hideOnBoard: false, totalHours: 0, createdAt: NGAY_TAO_SEED,
      demoNote: 'Khách mới, chưa có dữ liệu, dùng để demo đăng ký.',
    },
    {
      id: 'u-tuan', code: 'LM-000005', name: 'Tuấn',
      contact: 'tuan@example.com', phone: '0900000005', passwordDemo: MAT_KHAU_DEMO,
      role: 'staff', type: null, org: null, clubId: null,
      hideOnBoard: false, totalHours: 0, createdAt: NGAY_TAO_SEED,
      demoNote: 'Nhân viên ca tối.',
    },
    {
      id: 'u-mai', code: 'LM-000006', name: 'Mai',
      contact: 'mai@example.com', phone: '0900000006', passwordDemo: MAT_KHAU_DEMO,
      role: 'staff', type: null, org: null, clubId: null,
      hideOnBoard: false, totalHours: 0, createdAt: NGAY_TAO_SEED,
      demoNote: 'Nhân viên ca đêm.',
    },
    {
      id: 'u-hoang', code: 'LM-000007', name: 'Hoàng',
      contact: 'hoang@example.com', phone: '0900000007', passwordDemo: MAT_KHAU_DEMO,
      role: 'manager', type: null, org: null, clubId: null,
      hideOnBoard: false, totalHours: 0, createdAt: NGAY_TAO_SEED,
      demoNote: 'Quản lý (nhóm sáng lập).',
    },
  ];
}

// ---------- Đặt lại dữ liệu demo ----------

/**
 * Đưa store về trạng thái seed:
 *   1. Ghi lại danh sách người dùng và CLB (mất các tài khoản đăng ký thêm).
 *   2. Xóa các khóa trong KHOA_PHAT_SINH.
 *   3. Nếu datLaiDongHo là true (mặc định): xóa khóa đồng hồ để đồng hồ về mặc định
 *      10/11/2027 lúc 20h (mục 8.5). js/clock.js tự nhận ra khóa bị xóa và quay về mặc định.
 *
 * Trả về { nguoiDung, clb, luuBenVaoLocalStorage }. luuBenVaoLocalStorage là false khi
 * localStorage không dùng được (dữ liệu chỉ tồn tại trong tab hiện tại).
 */
export function resetDemoData({ datLaiDongHo = true } = {}) {
  const nguoiDung = taoNguoiDungSeed();
  const clb = taoClbSeed();

  const ketQua = [
    store.set(KHOA_NGUOI_DUNG, nguoiDung),
    store.set(KHOA_CLB, clb),
  ];
  for (const khoa of KHOA_PHAT_SINH) ketQua.push(store.remove(khoa));
  if (datLaiDongHo) ketQua.push(store.remove(KHOA_DONG_HO));

  return {
    nguoiDung: nguoiDung.length,
    clb: clb.length,
    luuBenVaoLocalStorage: ketQua.every(Boolean),
  };
}
