// js/ui.js
// -----------------------------------------------------------------------------
// Giao diện dùng chung cho mọi trang của Lumen 24:
//   - dải thông báo "Hệ thống mô phỏng..." (cố định trên đầu trang)
//   - header: logo, menu 6 mục, nút "Đặt lịch ngay", nút ba gạch trên điện thoại
//   - footer: giới thiệu, liên kết nhanh, liên hệ, giờ mở cửa, ba trang chính sách
//
// Cách dùng trong mỗi trang HTML (đặt cuối <body>):
//   <script type="module">
//     import { renderLayout } from './js/ui.js';
//     renderLayout();
//   </script>
//
// Quy ước: mọi chuỗi chèn vào trang đều đi qua textContent (hàm el bên dưới),
// không dùng innerHTML. Mọi đường dẫn là đường dẫn tương đối (bắt đầu bằng ./).
// File này chưa import store/clock/config vì các file đó làm ở Bước 1.
// -----------------------------------------------------------------------------

// ---------- Dữ liệu hiển thị (tạm thời đặt ở đây) ----------

export const TEN_QUAN = 'Lumen 24';
export const DUONG_DAN_LOGO = './android-chrome-512x512.png';
export const THONG_BAO_MO_PHONG = 'Hệ thống mô phỏng cho bài tập, dữ liệu là giả';

// Menu chính theo thứ tự trong đặc tả (mục 2.1).
// "khop" là danh sách tên file được coi là thuộc mục này (để tô sáng mục đang xem).
export const MENU_CHINH = [
  { nhan: 'Trang chủ', href: './index.html', khop: ['index.html'] },
  { nhan: 'Giới thiệu', href: './gioi-thieu.html', khop: ['gioi-thieu.html'] },
  { nhan: 'Cộng đồng', href: './cong-dong.html', khop: ['cong-dong.html'] },
  { nhan: 'Đặt lịch', href: './dat-phong.html', khop: ['dat-phong.html', 'phong-hop.html'] },
  { nhan: 'Tuyển dụng', href: './tuyen-dung.html', khop: ['tuyen-dung.html'] },
  { nhan: 'Góp ý', href: './gop-y.html', khop: ['gop-y.html'] },
];

export const NUT_DAT_LICH = { nhan: 'Đặt lịch ngay', href: './dat-phong.html' };

const LIEN_KET_NHANH = [
  { nhan: 'Bảng giá', href: './bang-gia.html' },
  { nhan: 'Phòng họp', href: './phong-hop.html' },
  { nhan: 'Sơ đồ chỗ ngồi', href: './so-do-cho.html' },
  { nhan: 'Quy tắc của quán', href: './quy-tac.html' },
  { nhan: 'Liên hệ', href: './lien-he.html' },
];

const CHINH_SACH = [
  { nhan: 'Điều khoản', href: './dieu-khoan.html' },
  { nhan: 'Chính sách hoàn cọc', href: './chinh-sach-hoan-coc.html' },
  { nhan: 'Chính sách bảo mật', href: './chinh-sach-bao-mat.html' },
];

const MANG_XA_HOI = ['Facebook', 'Instagram', 'TikTok'];

// TODO Bước 1: giờ mở cửa sẽ đọc từ js/config.js (mục 4.1 của đặc tả).
const GIO_MO_CUA = [
  { ten: 'Tầng 1 và tầng 2', gio: 'Mở cửa 24/7' },
  { ten: 'Tầng 3 – chỗ ngồi tự do', gio: '19h – 23h hằng ngày' },
  { ten: 'Tầng 3 – phòng họp', gio: 'Mở khi có đặt phòng' },
];

// ---------- Hàm hỗ trợ ----------

/**
 * Tạo phần tử DOM an toàn: chuỗi truyền vào luôn thành văn bản, không bị hiểu là HTML.
 * attrs: { class, text, href, ... }; giá trị null, undefined hoặc false thì bỏ qua.
 * children: một phần tử, một chuỗi hoặc một mảng các phần tử/chuỗi.
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [khoa, giaTri] of Object.entries(attrs)) {
    if (giaTri === null || giaTri === undefined || giaTri === false) continue;
    if (khoa === 'class') node.className = giaTri;
    else if (khoa === 'text') node.textContent = giaTri;
    else node.setAttribute(khoa, giaTri === true ? '' : giaTri);
  }
  for (const con of [].concat(children)) {
    if (con === null || con === undefined || con === false) continue;
    node.append(con); // chuỗi sẽ thành text node
  }
  return node;
}

/** Tên file của trang đang xem, ví dụ "index.html", "bang-gia.html". */
function tenTrangHienTai() {
  let ten = window.location.pathname.split('/').pop();
  if (ten === '') ten = 'index.html';
  else if (!ten.includes('.')) ten += '.html'; // phòng khi host bỏ đuôi .html
  return ten;
}

// ---------- Các khối giao diện ----------

function taoThuongHieu() {
  const logo = el('img', {
    class: 'brand__logo',
    src: DUONG_DAN_LOGO,
    alt: '', // ảnh trang trí, tên quán đã có bằng chữ ngay cạnh
    width: '36',
    height: '36',
  });
  // Nếu file logo chưa có hoặc lỗi thì ẩn ảnh, vẫn còn tên chữ.
  logo.addEventListener('error', () => { logo.hidden = true; }, { once: true });
  return el('a', { class: 'brand', href: './index.html' }, [
    logo,
    el('span', { class: 'brand__text', text: TEN_QUAN }),
  ]);
}

function taoDaiThongBao() {
  return el('div', { class: 'sim-banner', role: 'note' }, [
    el('span', { class: 'sim-banner__text', text: THONG_BAO_MO_PHONG }),
  ]);
}

function taoMenuChinh(trang) {
  const danhSach = el('ul', { class: 'nav__list' });
  for (const muc of MENU_CHINH) {
    const dangXem = muc.khop.includes(trang);
    danhSach.append(
      el('li', {}, el('a', {
        class: 'nav__link',
        href: muc.href,
        text: muc.nhan,
        'aria-current': dangXem ? 'page' : null,
      }))
    );
  }
  return el('nav', { class: 'nav', id: 'menu-chinh', 'aria-label': 'Menu chính' }, danhSach);
}

function taoHeader(trang) {
  const nutDatLich = el('a', {
    class: 'btn btn--primary header__cta',
    href: NUT_DAT_LICH.href,
    text: NUT_DAT_LICH.nhan,
  });
  const nutMenu = el('button', {
    class: 'nav-toggle',
    id: 'nut-menu',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': 'menu-chinh',
    'aria-label': 'Mở menu',
  }, el('span', { class: 'nav-toggle__icon', 'aria-hidden': 'true' }));

  return el('header', { class: 'site-header' },
    el('div', { class: 'container site-header__inner' }, [
      taoThuongHieu(),
      taoMenuChinh(trang),
      // id ui-header-actions: chỗ để các bước sau thêm khu tài khoản, chuông thông báo
      el('div', { class: 'header__actions', id: 'ui-header-actions' }, [nutDatLich, nutMenu]),
    ])
  );
}

function taoCotLienKet(tieuDe, danhSach, nhanAria) {
  const ds = el('ul', { class: 'footer__list' });
  for (const muc of danhSach) {
    ds.append(el('li', {}, el('a', { class: 'footer__link', href: muc.href, text: muc.nhan })));
  }
  return el('div', {}, [
    el('h2', { class: 'footer__title', text: tieuDe }),
    el('nav', { 'aria-label': nhanAria }, ds),
  ]);
}

function taoMangXaHoi() {
  const ds = el('ul', { class: 'social' });
  for (const ten of MANG_XA_HOI) {
    const lienKet = el('a', {
      class: 'social__link',
      href: '#',
      title: 'Liên kết giả cho bài tập',
      text: ten,
    });
    lienKet.addEventListener('click', (e) => e.preventDefault());
    ds.append(el('li', {}, lienKet));
  }
  return ds;
}

function taoGioMoCua() {
  const ds = el('ul', { class: 'footer__list hours' });
  for (const muc of GIO_MO_CUA) {
    ds.append(el('li', {}, [
      el('span', { class: 'hours__name', text: muc.ten }),
      el('span', { class: 'hours__time', text: muc.gio }),
    ]));
  }
  return ds;
}

function taoChanTrang() {
  const cotGioiThieu = el('div', {}, [
    taoThuongHieu(),
    el('p', {
      class: 'footer__text',
      text: 'Study cafe mở cửa 24/7 cho sinh viên và người đi làm: chỗ ngồi yên tĩnh, giá minh bạch, an toàn và có cộng đồng cùng tiến bộ.',
    }),
    taoMangXaHoi(),
  ]);

  const cotLienHe = el('div', {}, [
    el('h2', { class: 'footer__title', text: 'Địa điểm và liên hệ' }),
    el('ul', { class: 'footer__list' }, [
      el('li', { text: 'Khu Trịnh Văn Bô, Hà Nội' }),
      el('li', { text: 'Hotline: 0900 000 000' }),
      el('li', { text: 'Email: hello@lumen24.example' }),
    ]),
    el('p', { class: 'footer__text footer__text--small', text: 'Địa chỉ và thông tin liên hệ là giả định cho bài tập.' }),
  ]);

  const cotGio = el('div', {}, [
    el('h2', { class: 'footer__title', text: 'Giờ mở cửa' }),
    taoGioMoCua(),
  ]);

  const dsChinhSach = el('ul', { class: 'footer__list footer__list--row' });
  for (const muc of CHINH_SACH) {
    dsChinhSach.append(el('li', {}, el('a', { class: 'footer__link', href: muc.href, text: muc.nhan })));
  }

  return el('footer', { class: 'site-footer' },
    el('div', { class: 'container' }, [
      el('div', { class: 'footer__grid' }, [
        cotGioiThieu,
        taoCotLienKet('Liên kết nhanh', LIEN_KET_NHANH, 'Liên kết nhanh'),
        cotLienHe,
        cotGio,
      ]),
      el('div', { class: 'footer__bottom' }, [
        el('nav', { 'aria-label': 'Chính sách' }, dsChinhSach),
        el('p', { class: 'footer__copy', text: `© 2026 ${TEN_QUAN} · Bản mô phỏng, dữ liệu là giả` }),
        // id ui-khe-demo: chỗ để Bước 7 (bảng điều khiển demo) gắn nút bật/tắt
        el('div', { class: 'footer__demo-slot', id: 'ui-khe-demo' }),
      ]),
    ])
  );
}

// ---------- Menu thu gọn trên điện thoại ----------

function khoiTaoMenuDiDong() {
  const nutMenu = document.getElementById('nut-menu');
  const menu = document.getElementById('menu-chinh');
  const dauTrang = document.querySelector('.site-top');
  if (!nutMenu || !menu || !dauTrang) return;

  const datTrangThai = (mo) => {
    menu.classList.toggle('is-open', mo);
    nutMenu.setAttribute('aria-expanded', String(mo));
    nutMenu.setAttribute('aria-label', mo ? 'Đóng menu' : 'Mở menu');
  };

  nutMenu.addEventListener('click', () => {
    datTrangThai(nutMenu.getAttribute('aria-expanded') !== 'true');
  });

  // Nhấn Esc: đóng menu và trả focus về nút
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      datTrangThai(false);
      nutMenu.focus();
    }
  });

  // Bấm ra ngoài header: đóng menu
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') && !dauTrang.contains(e.target)) {
      datTrangThai(false);
    }
  });

  // Khi màn hình rộng ra (menu hiện ngang), đưa trạng thái về đóng
  const manHinhRong = window.matchMedia('(min-width: 960px)');
  manHinhRong.addEventListener('change', (e) => {
    if (e.matches) datTrangThai(false);
  });
}

// ---------- Hàm chính ----------

/**
 * Chèn dải thông báo, header và footer vào trang hiện tại.
 * Gọi một lần ở cuối <body>. Gọi lại nhiều lần cũng không chèn trùng.
 */
export function renderLayout() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderLayout(), { once: true });
    return;
  }
  if (document.querySelector('.site-top')) return; // đã chèn rồi

  const trang = tenTrangHienTai();

  // Vùng nội dung chính cần id để liên kết "Bỏ qua đến nội dung chính" hoạt động
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'noi-dung';

  const lienKetBoQua = el('a', { class: 'skip-link', href: '#noi-dung', text: 'Bỏ qua đến nội dung chính' });
  const dauTrang = el('div', { class: 'site-top' }, [taoDaiThongBao(), taoHeader(trang)]);

  document.body.prepend(lienKetBoQua, dauTrang);
  document.body.append(taoChanTrang());

  khoiTaoMenuDiDong();
}
