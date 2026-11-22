// js/store.js
// -----------------------------------------------------------------------------
// Kho lưu trạng thái cho Lumen 24, dựa trên localStorage.
//   - Dữ liệu lưu dạng JSON, khóa có tiền tố "lumen24:" để không đụng dữ liệu của
//     repo khác trên cùng địa chỉ github.io (GitHub Pages dùng chung localStorage
//     giữa các repo của một tài khoản).
//   - Mọi thao tác với localStorage đều bọc try/catch. Nếu localStorage không dùng
//     được (chế độ riêng tư, bị chặn, hết dung lượng) thì dữ liệu được giữ tạm
//     trong bộ nhớ của tab đang mở, giao diện vẫn chạy.
//   - Khi set hoặc remove, gửi thông báo qua BroadcastChannel "lumen24" để các tab
//     khác cùng trình duyệt cập nhật. Không có BroadcastChannel thì vẫn chạy trong
//     một tab.
// File này không dùng DOM hay window.location nên dùng lại ở đâu cũng được.
// -----------------------------------------------------------------------------

const TIEN_TO = 'lumen24:';
const TEN_KENH = 'lumen24';

// Bộ nhớ tạm khi localStorage không ghi được.
// Giá trị là chuỗi JSON; null nghĩa là "đã xóa" (che giá trị cũ còn trong localStorage).
const boNho = new Map();

// Người đăng ký theo dõi: khóa (chưa có tiền tố) -> tập các hàm callback.
const nguoiNghe = new Map();

// ---------- Hàm hỗ trợ nội bộ ----------

/** Trả về localStorage hoặc null nếu không truy cập được (chính việc truy cập cũng có thể ném lỗi). */
function khoLuuTru() {
  try {
    return globalThis.localStorage || null;
  } catch (loi) {
    return null;
  }
}

function khoaHopLe(khoa) {
  return typeof khoa === 'string' && khoa.length > 0;
}

/** Đọc chuỗi JSON thô của một khóa. Trả về chuỗi, hoặc null nếu chưa có hoặc đã xóa. */
function docChuoi(khoa) {
  const khoaDayDu = TIEN_TO + khoa;
  if (boNho.has(khoaDayDu)) return boNho.get(khoaDayDu);
  try {
    const kho = khoLuuTru();
    return kho ? kho.getItem(khoaDayDu) : null;
  } catch (loi) {
    return null;
  }
}

/** Ghi chuỗi JSON. Trả về true nếu đã ghi vào localStorage, false nếu chỉ giữ được trong bộ nhớ tạm. */
function ghiChuoi(khoa, chuoi) {
  const khoaDayDu = TIEN_TO + khoa;
  try {
    const kho = khoLuuTru();
    if (!kho) throw new Error('Không có localStorage');
    kho.setItem(khoaDayDu, chuoi);
    boNho.delete(khoaDayDu);
    return true;
  } catch (loi) {
    boNho.set(khoaDayDu, chuoi);
    console.warn('[store] Không ghi được vào localStorage, tạm giữ trong bộ nhớ của tab này:', khoa, loi);
    return false;
  }
}

/** Xóa một khóa. Trả về true nếu đã xóa khỏi localStorage. */
function xoaChuoi(khoa) {
  const khoaDayDu = TIEN_TO + khoa;
  try {
    const kho = khoLuuTru();
    if (!kho) throw new Error('Không có localStorage');
    kho.removeItem(khoaDayDu);
    boNho.delete(khoaDayDu);
    return true;
  } catch (loi) {
    boNho.set(khoaDayDu, null); // đánh dấu đã xóa
    console.warn('[store] Không xóa được khỏi localStorage, tạm đánh dấu xóa trong bộ nhớ của tab này:', khoa, loi);
    return false;
  }
}

/** Gọi các callback đăng ký cho một khóa. Lỗi trong callback không làm hỏng callback khác. */
function goiNguoiNghe(khoa, giaTri) {
  const tap = nguoiNghe.get(khoa);
  if (!tap) return;
  for (const callback of [...tap]) {
    try {
      callback(giaTri, khoa);
    } catch (loi) {
      console.error('[store] Lỗi trong hàm theo dõi khóa "' + khoa + '":', loi);
    }
  }
}

/** Chuyển chuỗi JSON thành giá trị; chuỗi hỏng thì trả null. */
function giaiMa(chuoi) {
  if (chuoi === null || chuoi === undefined) return null;
  try {
    return JSON.parse(chuoi);
  } catch (loi) {
    console.warn('[store] Dữ liệu JSON bị hỏng, bỏ qua.', loi);
    return null;
  }
}

// ---------- Đồng bộ giữa các tab ----------

let kenh = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    kenh = new BroadcastChannel(TEN_KENH);
    kenh.onmessage = (suKien) => {
      const tin = suKien.data;
      if (!tin || typeof tin !== 'object' || !khoaHopLe(tin.khoa)) return;

      const daXoa = tin.loai === 'remove';
      const chuoi = daXoa ? null : (typeof tin.chuoi === 'string' ? tin.chuoi : null);
      if (!daXoa && chuoi === null) return; // tin nhắn "set" không có dữ liệu: bỏ qua

      // Nếu bên gửi không ghi được vào localStorage (hoặc tab này không có localStorage)
      // thì lấy dữ liệu từ tin nhắn; ngược lại tab này tự đọc từ localStorage.
      const khoaDayDu = TIEN_TO + tin.khoa;
      if (tin.luuBen === false || !khoLuuTru()) boNho.set(khoaDayDu, chuoi);
      else boNho.delete(khoaDayDu);

      goiNguoiNghe(tin.khoa, giaiMa(chuoi));
    };
  }
} catch (loi) {
  kenh = null; // không hỗ trợ: vẫn chạy trong một tab
}

function phatTin(tin) {
  if (!kenh) return;
  try {
    kenh.postMessage(tin);
  } catch (loi) {
    console.warn('[store] Không gửi được thông báo sang tab khác.', loi);
  }
}

// ---------- Các hàm xuất ra ----------

/**
 * Đọc giá trị của một khóa.
 * Trả về macDinh (mặc định null) khi khóa chưa có, đã xóa, dữ liệu hỏng hoặc có lỗi.
 */
export function get(khoa, macDinh = null) {
  if (!khoaHopLe(khoa)) return macDinh;
  const chuoi = docChuoi(khoa);
  if (chuoi === null || chuoi === undefined) return macDinh;
  try {
    return JSON.parse(chuoi);
  } catch (loi) {
    console.warn('[store] Dữ liệu của khóa "' + khoa + '" bị hỏng, trả về giá trị mặc định.', loi);
    return macDinh;
  }
}

/**
 * Ghi giá trị (lưu dạng JSON). Trả về true nếu đã ghi vào localStorage;
 * false nếu khóa/giá trị không hợp lệ hoặc chỉ giữ được trong bộ nhớ tạm.
 * Người theo dõi (ở tab này và tab khác) được báo ngay cả khi chỉ giữ trong bộ nhớ tạm.
 */
export function set(khoa, giaTri) {
  if (!khoaHopLe(khoa)) {
    console.warn('[store] Khóa phải là chuỗi không rỗng.');
    return false;
  }
  let chuoi;
  try {
    chuoi = JSON.stringify(giaTri);
  } catch (loi) {
    console.warn('[store] Giá trị không chuyển được sang JSON (có thể bị vòng lặp tham chiếu).', loi);
    return false;
  }
  if (chuoi === undefined) {
    console.warn('[store] Không lưu được undefined, hàm hoặc symbol. Hãy dùng remove nếu muốn xóa.');
    return false;
  }

  const luuBen = ghiChuoi(khoa, chuoi);
  goiNguoiNghe(khoa, JSON.parse(chuoi)); // đưa bản sao, tránh người nghe sửa nhầm dữ liệu gốc
  phatTin({ khoa, loai: 'set', chuoi, luuBen });
  return luuBen;
}

/** Xóa một khóa. Trả về true nếu đã xóa khỏi localStorage. */
export function remove(khoa) {
  if (!khoaHopLe(khoa)) {
    console.warn('[store] Khóa phải là chuỗi không rỗng.');
    return false;
  }
  const luuBen = xoaChuoi(khoa);
  goiNguoiNghe(khoa, null);
  phatTin({ khoa, loai: 'remove', luuBen });
  return luuBen;
}

/**
 * Theo dõi một khóa: callback(giaTriMoi, khoa) được gọi mỗi khi khóa đó đổi
 * (do tab này hoặc tab khác). Khóa bị xóa thì giaTriMoi là null.
 * Trả về hàm hủy đăng ký.
 */
export function subscribe(khoa, callback) {
  if (!khoaHopLe(khoa) || typeof callback !== 'function') {
    throw new Error('subscribe cần một khóa (chuỗi không rỗng) và một hàm callback.');
  }
  let tap = nguoiNghe.get(khoa);
  if (!tap) {
    tap = new Set();
    nguoiNghe.set(khoa, tap);
  }
  tap.add(callback);

  return function huyDangKy() {
    const tapHienTai = nguoiNghe.get(khoa);
    if (!tapHienTai) return;
    tapHienTai.delete(callback);
    if (tapHienTai.size === 0) nguoiNghe.delete(khoa);
  };
}
